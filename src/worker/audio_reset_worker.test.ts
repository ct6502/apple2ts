// Boot/Ctrl-Reset audio notification. motherboard.ts calls passAudioReset()
// after resetMachine() in doReset(), which doBoot() also calls. The UI clears
// its scheduled audio on the resulting MSG_WORKER.AUDIO_RESET.
import { MSG_WORKER } from "../common/utility"
import * as motherboard from "./motherboard"
import * as worker2main from "./worker2main"

jest.mock("./devices/keyboard", () => ({
  apple2KeyRelease: jest.fn(),
  openIigsRomDeskPanel: jest.fn(),
  sendKeySequence: jest.fn(),
  setKeyboardState: jest.fn(),
  sendTextToEmulator: jest.fn(),
}))
jest.mock("./conditional_input", () => ({
  hasConditionalInputSequence: jest.fn(() => false),
  requestConditionalInputTermination: jest.fn(() => false),
  runConditionalInputSequence: jest.fn(),
}))

const postMessage = jest.spyOn(self, "postMessage").mockImplementation()

beforeEach(() => {
  postMessage.mockClear()
})

afterAll(() => {
  postMessage.mockRestore()
})

test("passAudioReset delivers exactly one MSG_WORKER.AUDIO_RESET", () => {
  worker2main.passAudioReset()

  expect(postMessage).toHaveBeenCalledTimes(1)
  expect(postMessage).toHaveBeenCalledWith({
    msg: MSG_WORKER.AUDIO_RESET,
    payload: true,
  })
})

test("doReset notifies the UI once, so Ctrl-Reset clears scheduled audio", () => {
  const audio = jest.spyOn(worker2main, "passAudioReset").mockImplementation()

  motherboard.doReset()

  expect(audio).toHaveBeenCalledTimes(1)

  audio.mockRestore()
})

test("doBoot reaches the same doReset notification, so Boot also clears scheduled audio", () => {
  const audio = jest.spyOn(worker2main, "passAudioReset").mockImplementation()

  motherboard.doBoot()

  expect(audio).toHaveBeenCalledTimes(1)

  audio.mockRestore()
})

