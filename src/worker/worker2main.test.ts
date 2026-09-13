import { MSG_MAIN, MSG_WORKER, RUN_MODE } from "../common/utility"
import { sendKeySequence, setKeyboardState } from "./devices/keyboard"
import { hasConditionalInputSequence, runConditionalInputSequence } from "./conditional_input"
import * as motherboard from "./motherboard"

jest.mock("./devices/keyboard", () => ({
  apple2KeyRelease: jest.fn(),
  setKeyboardState: jest.fn(),
  sendKeySequence: jest.fn(),
  sendTextToEmulator: jest.fn(),
}))

jest.mock("./conditional_input", () => ({
  hasConditionalInputSequence: jest.fn(() => false),
  requestConditionalInputTermination: jest.fn(() => false),
  runConditionalInputSequence: jest.fn(),
}))

import "./worker2main"

test("confirms keyboard state after applying it", () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const keyboardState = {key: 0, isDown: false, repeat: false}

  self.onmessage?.({
    data: {msg: MSG_MAIN.KEYBOARD_STATE, payload: keyboardState, operationId: 17},
  } as MessageEvent)

  expect(setKeyboardState).toHaveBeenCalledWith(keyboardState)
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {operationId: 17, error: undefined},
  })
  expect(jest.mocked(setKeyboardState).mock.invocationCallOrder[0])
    .toBeLessThan(postMessage.mock.invocationCallOrder[0])
  postMessage.mockRestore()
})

test("confirms a key sequence only after the worker completes it", async () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.RUNNING)
  const request = {keys: "AZ\r", timeoutMs: 5000}
  let finish: (result: KeySequenceResult) => void = () => {}
  jest.mocked(sendKeySequence).mockReturnValueOnce(new Promise((resolve) => { finish = resolve }))

  self.onmessage?.({
    data: {msg: MSG_MAIN.KEY_SEQUENCE, payload: request, operationId: 18},
  } as MessageEvent)

  expect(postMessage).not.toHaveBeenCalled()
  finish({outcome: "completed", keysDelivered: 3, keyMayHaveBeenObserved: false})
  await Promise.resolve()
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {
      operationId: 18,
      error: undefined,
      value: {outcome: "completed", keysDelivered: 3, keyMayHaveBeenObserved: false},
    },
  })
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("rejects a key sequence without changing a stopped emulator", () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.PAUSED)
  jest.mocked(sendKeySequence).mockClear()

  self.onmessage?.({
    data: {
      msg: MSG_MAIN.KEY_SEQUENCE,
      payload: {keys: "A", timeoutMs: 5000},
      operationId: 19,
    },
  } as MessageEvent)

  expect(sendKeySequence).not.toHaveBeenCalled()
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {
      operationId: 19,
      error: undefined,
      value: {outcome: "not_running", keysDelivered: 0, keyMayHaveBeenObserved: false},
    },
  })
  runMode.mockRestore()
  postMessage.mockRestore()
})

test.each([MSG_MAIN.KEY_SEQUENCE, MSG_MAIN.CONDITIONAL_KEY_SEQUENCE])("reports invalid sequence %s promptly", async (msg) => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.RUNNING)
  if (msg === MSG_MAIN.KEY_SEQUENCE) {
    jest.mocked(sendKeySequence).mockRejectedValueOnce(new Error("Invalid key sequence"))
  } else {
    jest.mocked(runConditionalInputSequence).mockImplementationOnce(() => {
      throw new Error("Invalid key sequence")
    })
  }

  self.onmessage?.({
    data: {
      msg,
      payload: {keys: "", timeoutMs: 5000},
      operationId: 20,
    },
  } as MessageEvent)
  await Promise.resolve()
  await Promise.resolve()

  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {
      operationId: 20,
      error: "Invalid key sequence",
      value: undefined,
    },
  })
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("confirms a conditional input sequence only after its worker result", async () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.RUNNING)
  const request: ConditionalKeySequenceRequest = {
    phases: [{keys: "A"}],
    final: {address: 0x0200, space: "main", bytes: [1]},
    timeoutMs: 5000,
  }
  const result: ConditionalKeySequenceResult = {
    outcome: "completed",
    completedPhases: 1,
    failurePhase: null,
    keyDeliveries: [],
    cyclesElapsed: 20,
  }
  let finish: (value: ConditionalKeySequenceResult) => void = () => {}
  jest.mocked(runConditionalInputSequence).mockReturnValueOnce(
    new Promise((resolve) => { finish = resolve }),
  )

  self.onmessage?.({
    data: {msg: MSG_MAIN.CONDITIONAL_KEY_SEQUENCE, payload: request, operationId: 21},
  } as MessageEvent)
  expect(postMessage).not.toHaveBeenCalled()
  finish(result)
  await Promise.resolve()
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {operationId: 21, error: undefined, value: result},
  })
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("arms a conditional input sequence before starting paused execution", () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.PAUSED)
  const setRunMode = jest.spyOn(motherboard, "doSetRunMode").mockImplementation()
  const request: ConditionalKeySequenceRequest = {
    phases: [{keys: "A"}],
    final: {address: 0x0200, space: "main", bytes: [1]},
    timeoutMs: 5000,
    startExecution: true,
  }
  jest.mocked(runConditionalInputSequence).mockReturnValueOnce(new Promise(() => {}))
  jest.mocked(hasConditionalInputSequence).mockReturnValueOnce(true)

  self.onmessage?.({
    data: {msg: MSG_MAIN.CONDITIONAL_KEY_SEQUENCE, payload: request, operationId: 22},
  } as MessageEvent)

  expect(runConditionalInputSequence).toHaveBeenCalledWith(request, expect.any(Number))
  expect(setRunMode).toHaveBeenCalledWith(RUN_MODE.RUNNING, false)
  expect(jest.mocked(runConditionalInputSequence).mock.invocationCallOrder.at(-1))
    .toBeLessThan(setRunMode.mock.invocationCallOrder.at(-1)!)
  expect(postMessage).not.toHaveBeenCalled()
  setRunMode.mockRestore()
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("does not start paused execution when the conditional sequence cannot arm", async () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.PAUSED)
  const setRunMode = jest.spyOn(motherboard, "doSetRunMode").mockImplementation()
  const result: ConditionalKeySequenceResult = {
    outcome: "input_busy",
    completedPhases: 0,
    failurePhase: 0,
    keyDeliveries: [],
    cyclesElapsed: 0,
  }
  jest.mocked(runConditionalInputSequence).mockResolvedValueOnce(result)
  jest.mocked(hasConditionalInputSequence).mockReturnValueOnce(false)

  self.onmessage?.({
    data: {
      msg: MSG_MAIN.CONDITIONAL_KEY_SEQUENCE,
      payload: {
        phases: [{keys: "A"}],
        final: {address: 0x0200, space: "main", bytes: [1]},
        timeoutMs: 5000,
        startExecution: true,
      },
      operationId: 23,
    },
  } as MessageEvent)
  await Promise.resolve()

  expect(setRunMode).not.toHaveBeenCalled()
  expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
    payload: expect.objectContaining({value: result}),
  }))
  setRunMode.mockRestore()
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("does not start a paused conditional input sequence without an explicit request", () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.PAUSED)
  const setRunMode = jest.spyOn(motherboard, "doSetRunMode").mockImplementation()
  jest.mocked(runConditionalInputSequence).mockClear()

  self.onmessage?.({
    data: {
      msg: MSG_MAIN.CONDITIONAL_KEY_SEQUENCE,
      payload: {
        phases: [{keys: "A"}],
        final: {address: 0x0200, space: "main", bytes: [1]},
        timeoutMs: 5000,
      },
      operationId: 24,
    },
  } as MessageEvent)

  expect(runConditionalInputSequence).not.toHaveBeenCalled()
  expect(setRunMode).not.toHaveBeenCalled()
  expect(postMessage).toHaveBeenCalledWith(expect.objectContaining({
    payload: expect.objectContaining({value: expect.objectContaining({outcome: "not_running"})}),
  }))
  setRunMode.mockRestore()
  runMode.mockRestore()
  postMessage.mockRestore()
})

test("keeps direct key sequences out of an active conditional sequence", () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.RUNNING)
  jest.mocked(hasConditionalInputSequence).mockReturnValueOnce(true)

  self.onmessage?.({
    data: {msg: MSG_MAIN.KEY_SEQUENCE, payload: {keys: "A", timeoutMs: 5000}, operationId: 22},
  } as MessageEvent)
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.OPERATION_RESULT,
    payload: {
      operationId: 22,
      error: undefined,
      value: {outcome: "input_busy", keysDelivered: 0, keyMayHaveBeenObserved: false},
    },
  })
  runMode.mockRestore()
  postMessage.mockRestore()
})
