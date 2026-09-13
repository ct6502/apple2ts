import { isKeyboardInputBusy, sendKeySequence } from "./devices/keyboard"
import { createMemoryPredicateMatcher } from "./memory_view"
import { s6502 } from "./instructions"

const compileCondition = (condition: MemoryCondition) => {
  const predicates = condition && "all" in condition ? condition.all : [condition]
  if (!Array.isArray(predicates) || predicates.length < 1 || predicates.length > 8
    || predicates.some(predicate => !predicate || "all" in predicate)
    || (condition && "all" in condition && Object.keys(condition).length !== 1)) {
    throw new Error("Memory condition all must contain 1 to 8 non-nested predicates")
  }
  const matchers = predicates.map(createMemoryPredicateMatcher)
  return {
    matches: () => matchers.every(matches => matches()),
    read: () => matchers.map(matcher => matcher.read()),
  }
}

type PendingSequence = {
  phases: Array<{condition: ReturnType<typeof compileCondition> | null, keys: string}>,
  finalCondition: ReturnType<typeof compileCondition>,
  stopConditions: Array<{name: string, condition: ReturnType<typeof compileCondition>}>,
  stopCondition?: ConditionalKeySequenceResult["stopCondition"],
  phase: number,
  keyInFlight: boolean,
  keyDeliveries: ConditionalKeyDelivery[],
  deadline: number,
  startCycles: number,
  timeout?: ConditionalKeySequenceResult["timeout"],
  resolve: (result: ConditionalKeySequenceResult) => void,
}

type TerminalOutcome = Extract<
  ConditionalKeySequenceResult["outcome"],
  "completed" | "timeout" | "cancelled" | "unexpected_stop" | "condition_triggered"
>

let pendingSequence: PendingSequence | null = null
let pendingTerminal: TerminalOutcome | null = null

const resultFor = (
  sequence: PendingSequence,
  outcome: ConditionalKeySequenceResult["outcome"],
  cycleCount: number,
): ConditionalKeySequenceResult => ({
  outcome,
  completedPhases: sequence.phase,
  failurePhase: outcome === "completed" ? null : sequence.phase,
  keyDeliveries: sequence.keyDeliveries,
  cyclesElapsed: Math.max(0, cycleCount - sequence.startCycles),
  ...(outcome === "timeout" ? {timeout: sequence.timeout} : {}),
  ...(outcome === "condition_triggered" ? {stopCondition: sequence.stopCondition} : {}),
})

const validateRequest = (request: ConditionalKeySequenceRequest) => {
  if (request.startExecution !== undefined && typeof request.startExecution !== "boolean") {
    throw new Error("Conditional input startExecution must be boolean")
  }
  if (!Array.isArray(request.phases) || request.phases.length < 1 || request.phases.length > 16) {
    throw new Error("Conditional input sequence must contain 1 to 16 phases")
  }
  if (!Number.isInteger(request.timeoutMs) || request.timeoutMs < 1 || request.timeoutMs > 120000) {
    throw new Error("Conditional input timeout must be between 1 and 120000 milliseconds")
  }
  let totalKeys = 0
  const phases = request.phases.map((phase) => {
    if (typeof phase?.keys !== "string" || Array.from(phase.keys).some((key) => {
      const code = key.charCodeAt(0)
      return key.length !== 1 || code < 1 || code > 0xFF
    })) {
      throw new Error("Each phase must contain valid Apple II keys")
    }
    const keyCount = Array.from(phase.keys).length
    if (keyCount < 1 || keyCount > 32) throw new Error("Each phase must contain 1 to 32 keys")
    totalKeys += keyCount
    return {
      condition: phase.when === undefined ? null : compileCondition(phase.when),
      keys: phase.keys,
    }
  })
  if (totalKeys > 64) throw new Error("Conditional input sequence cannot contain more than 64 keys")
  const stops = request.stopConditions === undefined ? [] : request.stopConditions
  if (!Array.isArray(stops) || stops.length > 8
    || stops.some(stop => typeof stop?.name !== "string" || !/^[A-Za-z0-9_-]{1,64}$/.test(stop.name))
    || new Set(stops.map(stop => stop.name)).size !== stops.length) {
    throw new Error("stopConditions must contain at most 8 uniquely named conditions (1 to 64 letters, digits, _ or -)")
  }
  const stopConditions = stops.map(stop => ({name: stop.name, condition: compileCondition(stop.when)}))
  return {phases, finalCondition: compileCondition(request.final), stopConditions}
}

export const hasConditionalInputSequence = () => pendingSequence !== null

export const runConditionalInputSequence = (
  request: ConditionalKeySequenceRequest,
  cycleCount: number,
) => {
  const compiled = validateRequest(request)
  if (pendingSequence || isKeyboardInputBusy()) {
    return Promise.resolve({
      outcome: "input_busy",
      completedPhases: 0,
      failurePhase: 0,
      keyDeliveries: [],
      cyclesElapsed: 0,
    } satisfies ConditionalKeySequenceResult)
  }
  return new Promise<ConditionalKeySequenceResult>((resolve) => {
    pendingSequence = {
      ...compiled,
      phase: 0,
      keyInFlight: false,
      keyDeliveries: [],
      deadline: performance.now() + request.timeoutMs,
      startCycles: cycleCount,
      resolve,
    }
  })
}

// Called before keyboard advancement so a matching stop cannot queue another key.
export const checkConditionalInputStop = () => {
  const sequence = pendingSequence
  if (!sequence || pendingTerminal) return pendingTerminal
  const stop = sequence.stopConditions.find(stop => stop.condition.matches())
  if (stop) {
    sequence.stopCondition = {name: stop.name, matchedBytes: stop.condition.read()}
    pendingTerminal = "condition_triggered"
  }
  return pendingTerminal
}

export const advanceConditionalInputSequence = () => {
  const sequence = pendingSequence
  if (!sequence || pendingTerminal || sequence.keyInFlight) return pendingTerminal
  if (performance.now() >= sequence.deadline) {
    const condition = sequence.phase < sequence.phases.length
      ? sequence.phases[sequence.phase].condition : sequence.finalCondition
    sequence.timeout = {waitingFor: "condition", actualBytes: condition?.read() ?? []}
    pendingTerminal = "timeout"
    return pendingTerminal
  }

  if (sequence.phase === sequence.phases.length) {
    if (sequence.finalCondition.matches()) pendingTerminal = "completed"
    return pendingTerminal
  }

  const phase = sequence.phases[sequence.phase]
  if (phase.condition && !phase.condition.matches()) return null
  const predicateMatchCycle = phase.condition ? s6502.cycleCount : null
  const matchedBytes = phase.condition?.read() ?? []
  const keyConsumptionCycles: number[] = []
  sequence.keyInFlight = true
  const timeoutMs = Math.max(1, Math.ceil(sequence.deadline - performance.now()))
  void sendKeySequence({keys: phase.keys, timeoutMs}, (delivery) => {
    if (pendingSequence !== sequence) return
    sequence.keyInFlight = false
    sequence.keyDeliveries.push({
      ...delivery, phase: sequence.phase, predicateMatchCycle, matchedBytes, keyConsumptionCycles,
    })
    if (delivery.outcome === "timeout") {
      sequence.timeout = {waitingFor: "key_consumption", actualBytes: phase.condition?.read() ?? []}
    }
    if (delivery.outcome === "completed") {
      sequence.phase++
    } else if (!pendingTerminal) {
      pendingTerminal = delivery.outcome === "timeout" ? "timeout" : "cancelled"
    }
  }, () => keyConsumptionCycles.push(s6502.cycleCount)).catch(() => {
    if (pendingSequence === sequence) {
      sequence.keyInFlight = false
      pendingTerminal ??= "cancelled"
    }
  })
  return null
}

export const requestConditionalInputTermination = (outcome: Exclude<TerminalOutcome, "completed">) => {
  if (!pendingSequence || pendingTerminal) return false
  pendingTerminal = outcome
  return true
}

export const finishConditionalInputSequence = (cycleCount: number) => {
  const sequence = pendingSequence
  const outcome = pendingTerminal
  if (!sequence || !outcome) return false
  pendingSequence = null
  pendingTerminal = null
  sequence.resolve(resultFor(sequence, outcome, cycleCount))
  return true
}
