import { MSG_MAIN, MSG_WORKER } from "../common/utility"
import { setKeyboardState } from "./devices/keyboard"

jest.mock("./devices/keyboard", () => ({
  apple2KeyRelease: jest.fn(),
  setKeyboardState: jest.fn(),
  sendTextToEmulator: jest.fn(),
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
