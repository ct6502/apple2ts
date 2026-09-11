import { isKeyboardInputBusy, sendKeySequence } from "./devices/keyboard"
import { createMemoryPredicateMatcher } from "./memory_view"

type PendingSequence = {
  phases: Array<{matches: (() => boolean) | null, keys: string}>,
  finalMatches: () => boolean,
  phase: number,
  keyInFlight: boolean,
  keyDeliveries: ConditionalKeyDelivery[],
  deadline: number,
  startCycles: number,
  resolve: (result: ConditionalKeySequenceResult) => void,
}

type TerminalOutcome = Extract<
  ConditionalKeySequenceResult["outcome"],
  "completed" | "timeout" | "cancelled" | "unexpected_stop"
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
      matches: phase.when ? createMemoryPredicateMatcher(phase.when) : null,
      keys: phase.keys,
    }
  })
  if (totalKeys > 64) throw new Error("Conditional input sequence cannot contain more than 64 keys")
  return {phases, finalMatches: createMemoryPredicateMatcher(request.final)}
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

export const advanceConditionalInputSequence = () => {
  const sequence = pendingSequence
  if (!sequence || pendingTerminal || sequence.keyInFlight) return pendingTerminal
  if (performance.now() >= sequence.deadline) {
    pendingTerminal = "timeout"
    return pendingTerminal
  }

  if (sequence.phase === sequence.phases.length) {
    if (sequence.finalMatches()) pendingTerminal = "completed"
    return pendingTerminal
  }

  const phase = sequence.phases[sequence.phase]
  if (phase.matches && !phase.matches()) return null
  sequence.keyInFlight = true
  const timeoutMs = Math.max(1, Math.ceil(sequence.deadline - performance.now()))
  void sendKeySequence({keys: phase.keys, timeoutMs}, (delivery) => {
    if (pendingSequence !== sequence) return
    sequence.keyInFlight = false
    sequence.keyDeliveries.push({...delivery, phase: sequence.phase})
    if (delivery.outcome === "completed") {
      sequence.phase++
    } else if (!pendingTerminal) {
      pendingTerminal = delivery.outcome === "timeout" ? "timeout" : "cancelled"
    }
  }).catch(() => {
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
