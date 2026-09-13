import {
  advanceConditionalInputSequence,
  finishConditionalInputSequence,
  requestConditionalInputTermination,
  runConditionalInputSequence,
} from "./conditional_input"
import { isKeyboardInputBusy, sendKeySequence } from "./devices/keyboard"
import { s6502 } from "./instructions"

const predicateState = new Map<number, boolean>()

jest.mock("./memory_view", () => ({
  createMemoryPredicateMatcher: (predicate: MemoryPredicate) =>
    Object.assign(() => predicateState.get(predicate.address) ?? false,
      {read: () => [predicateState.get(predicate.address) ? 1 : 0]}),
}))

jest.mock("./devices/keyboard", () => ({
  isKeyboardInputBusy: jest.fn(() => false),
  sendKeySequence: jest.fn(async (
    {keys}: KeySequenceRequest,
    onFinish?: (result: KeySequenceResult) => void,
    onConsumed?: () => void,
  ) => {
    const result = {
      outcome: "completed",
      keysDelivered: Array.from(keys).length,
      keyMayHaveBeenObserved: false,
    } satisfies KeySequenceResult
    Array.from(keys).forEach(() => onConsumed?.())
    onFinish?.(result)
    return result
  }),
}))

const predicate = (address: number): MemoryPredicate => ({
  address,
  space: "main",
  bytes: [1],
})

afterEach(() => {
  requestConditionalInputTermination("cancelled")
  finishConditionalInputSequence(0)
  predicateState.clear()
  jest.clearAllMocks()
  jest.useRealTimers()
})

test("delivers ordered phases without stopping between predicates", async () => {
  const result = runConditionalInputSequence({
    phases: [
      {keys: "A"},
      {when: predicate(1), keys: "Z\r"},
    ],
    final: predicate(2),
    timeoutMs: 5000,
  }, 100)

  expect(advanceConditionalInputSequence()).toBeNull()
  expect(sendKeySequence).toHaveBeenCalledWith(
    {keys: "A", timeoutMs: expect.any(Number)},
    expect.any(Function),
    expect.any(Function),
  )
  expect(advanceConditionalInputSequence()).toBeNull()

  predicateState.set(1, true)
  expect(advanceConditionalInputSequence()).toBeNull()
  expect(sendKeySequence).toHaveBeenLastCalledWith(
    {keys: "Z\r", timeoutMs: expect.any(Number)},
    expect.any(Function),
    expect.any(Function),
  )
  expect(advanceConditionalInputSequence()).toBeNull()

  predicateState.set(2, true)
  expect(advanceConditionalInputSequence()).toBe("completed")
  expect(finishConditionalInputSequence(110)).toBe(true)
  await expect(result).resolves.toEqual({
    outcome: "completed",
    completedPhases: 2,
    failurePhase: null,
    keyDeliveries: [
      {phase: 0, outcome: "completed", keysDelivered: 1, keyMayHaveBeenObserved: false,
        predicateMatchCycle: null, matchedBytes: [], keyConsumptionCycles: [s6502.cycleCount]},
      {phase: 1, outcome: "completed", keysDelivered: 2, keyMayHaveBeenObserved: false,
        predicateMatchCycle: s6502.cycleCount, matchedBytes: [[1]],
        keyConsumptionCycles: [s6502.cycleCount, s6502.cycleCount]},
    ],
    cyclesElapsed: 10,
  })
})

test("times out at the current phase", async () => {
  jest.useFakeTimers()
  const result = runConditionalInputSequence({
    phases: [{when: predicate(1), keys: "A"}],
    final: predicate(2),
    timeoutMs: 10,
  }, 20)

  jest.advanceTimersByTime(10)
  expect(advanceConditionalInputSequence()).toBe("timeout")
  finishConditionalInputSequence(30)
  await expect(result).resolves.toMatchObject({
    outcome: "timeout",
    completedPhases: 0,
    failurePhase: 0,
    cyclesElapsed: 10,
    timeout: {waitingFor: "condition", actualBytes: [[0]]},
  })
})

test("all predicates must match together and evidence captures that boundary", async () => {
  const result = runConditionalInputSequence({
    phases: [{when: {all: [predicate(1), predicate(2)]}, keys: "A"}],
    final: {all: [predicate(3), predicate(4)]}, timeoutMs: 5000,
  }, s6502.cycleCount)
  predicateState.set(1, true)
  advanceConditionalInputSequence()
  expect(sendKeySequence).not.toHaveBeenCalled()
  predicateState.set(1, false)
  predicateState.set(2, true)
  advanceConditionalInputSequence()
  expect(sendKeySequence).not.toHaveBeenCalled()
  predicateState.set(1, true)
  advanceConditionalInputSequence()
  predicateState.set(1, false)
  predicateState.set(3, true)
  expect(advanceConditionalInputSequence()).toBeNull()
  predicateState.set(4, true)
  expect(advanceConditionalInputSequence()).toBe("completed")
  finishConditionalInputSequence(s6502.cycleCount)
  await expect(result).resolves.toMatchObject({keyDeliveries: [{
    predicateMatchCycle: s6502.cycleCount,
    matchedBytes: [[1], [1]], keyConsumptionCycles: [s6502.cycleCount],
  }]})
})

test("key-consumption timeout retains partial delivery and current bytes", async () => {
  let finish: ((result: KeySequenceResult) => void) | undefined
  jest.mocked(sendKeySequence).mockImplementationOnce(async (_request, onFinish, onConsumed) =>
    new Promise(resolve => {
      onConsumed?.()
      finish = result => { onFinish?.(result); resolve(result) }
    }))
  predicateState.set(1, true)
  const result = runConditionalInputSequence({
    phases: [{when: predicate(1), keys: "AZ"}], final: predicate(2), timeoutMs: 10,
  }, s6502.cycleCount)
  advanceConditionalInputSequence()
  predicateState.set(1, false)
  finish?.({outcome: "timeout", keysDelivered: 1, keyMayHaveBeenObserved: true})
  finishConditionalInputSequence(s6502.cycleCount)
  await expect(result).resolves.toMatchObject({
    timeout: {waitingFor: "key_consumption", actualBytes: [[0]]},
    keyDeliveries: [{matchedBytes: [[1]], keyConsumptionCycles: [s6502.cycleCount]}],
  })
})

test.each([[], Array.from({length: 9}, () => predicate(1)), [{all: [predicate(1)]}]].map(all => [all]))(
  "rejects empty, oversized and nested all conditions", all => {
    expect(() => runConditionalInputSequence({
      phases: [{keys: "A"}], final: {all} as MemoryCondition, timeoutMs: 10,
    }, 0)).toThrow("1 to 8 non-nested")
  },
)

test("reports cancellation without inventing a delivered phase", async () => {
  const result = runConditionalInputSequence({
    phases: [{when: predicate(1), keys: "A"}],
    final: predicate(2),
    timeoutMs: 5000,
  }, 50)

  expect(requestConditionalInputTermination("cancelled")).toBe(true)
  finishConditionalInputSequence(55)
  await expect(result).resolves.toMatchObject({
    outcome: "cancelled",
    completedPhases: 0,
    failurePhase: 0,
    cyclesElapsed: 5,
  })
})

test("retains an interrupted in-flight key receipt on an unexpected stop", async () => {
  let finishDelivery: ((result: KeySequenceResult) => void) | undefined
  jest.mocked(sendKeySequence).mockImplementationOnce(async (_request, onFinish) =>
    new Promise((resolve) => {
      finishDelivery = (result) => {
        onFinish?.(result)
        resolve(result)
      }
    }))
  predicateState.set(1, true)
  const result = runConditionalInputSequence({
    phases: [{when: predicate(1), keys: "A"}],
    final: predicate(2),
    timeoutMs: 5000,
  }, 50)

  expect(advanceConditionalInputSequence()).toBeNull()
  expect(requestConditionalInputTermination("unexpected_stop")).toBe(true)
  finishDelivery?.({
    outcome: "interrupted",
    keysDelivered: 0,
    keyMayHaveBeenObserved: true,
  })
  finishConditionalInputSequence(52)

  await expect(result).resolves.toMatchObject({
    outcome: "unexpected_stop",
    completedPhases: 0,
    failurePhase: 0,
    keyDeliveries: [
      {phase: 0, outcome: "interrupted", keysDelivered: 0, keyMayHaveBeenObserved: true},
    ],
  })
})

test("reports an unexpected execution stop and initial input contention", async () => {
  const request = {
    phases: [{when: predicate(1), keys: "A"}],
    final: predicate(2),
    timeoutMs: 5000,
  }
  const result = runConditionalInputSequence(request, 50)
  expect(requestConditionalInputTermination("unexpected_stop")).toBe(true)
  finishConditionalInputSequence(52)
  await expect(result).resolves.toMatchObject({
    outcome: "unexpected_stop",
    failurePhase: 0,
  })

  jest.mocked(isKeyboardInputBusy).mockReturnValueOnce(true)
  await expect(runConditionalInputSequence(request, 60)).resolves.toMatchObject({
    outcome: "input_busy",
    completedPhases: 0,
  })
})

test("rejects unbounded phases and invalid keys before starting", () => {
  expect(() => runConditionalInputSequence({
    phases: [],
    final: predicate(2),
    timeoutMs: 5000,
  }, 0)).toThrow("1 to 16 phases")
  expect(() => runConditionalInputSequence({
    phases: [{keys: "🙂"}],
    final: predicate(2),
    timeoutMs: 5000,
  }, 0)).toThrow("valid Apple II keys")
  expect(() => runConditionalInputSequence({
    phases: [{keys: "A"}],
    final: predicate(2),
    timeoutMs: 5000,
    startExecution: "yes" as unknown as boolean,
  }, 0)).toThrow("startExecution must be boolean")
})
