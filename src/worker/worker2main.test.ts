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

test("reports malformed key sequences without waiting for a timeout", async () => {
  const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
  const runMode = jest.spyOn(motherboard, "getCpuRunMode").mockReturnValue(RUN_MODE.RUNNING)
  jest.mocked(sendKeySequence).mockRejectedValueOnce(new Error("Invalid key sequence"))

  self.onmessage?.({
    data: {
      msg: MSG_MAIN.KEY_SEQUENCE,
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
