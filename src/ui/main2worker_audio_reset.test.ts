// Boot/Ctrl-Reset audio notification from the worker. The main2worker
// dispatcher must tear down every UI audio transport when it receives the
// worker's AUDIO_RESET message.
import { MSG_WORKER } from "../common/utility"
import { doOnMessage } from "./main2worker"
import { stopSpeakerAudio } from "./devices/audio/speaker"
import { receiveMidiData, stopMidiAudio } from "./devices/audio/midiinterface"
import { playMockingboard, stopMockingboardAudio } from "./devices/audio/mockingboard_audio"
import { playVeraFmReset, playVeraFmWrite, playVeraPcmWrite, playVeraPsgWrite, playVeraPsgBatch, stopVeraPsgAudio } from "./devices/audio/vera_psg_audio"
import { playEnsoniqSamples, resetEnsoniqAudio } from "./devices/audio/iigs_ensoniq_audio"

jest.mock("./panels/disassembly/disassembly_utilities", () => ({
  set6502Instructions: jest.fn(),
  setDisassemblyVisibleMode: jest.fn(),
}))
jest.mock("./devices/disk/driveprops", () => ({ doSetUIDriveProps: jest.fn() }))
jest.mock("./ui_settings", () => ({ getHelpText: () => "" }))
jest.mock("./devices/audio/speaker", () => ({
  emulatorSoundEnable: jest.fn(),
  clickSpeaker: jest.fn(),
  stopSpeakerAudio: jest.fn(),
  isAudioEnabled: () => true,
  registerAudioContext: jest.fn(() => () => {}),
}))
jest.mock("./devices/audio/enhancedmidi", () => ({ setEnhancedMidi: jest.fn(), checkEnhancedMidi: jest.fn(() => false) }))
jest.mock("./devices/audio/midiinterface", () => ({
  receiveMidiData: jest.fn(),
  stopMidiAudio: jest.fn(),
}))
jest.mock("./devices/audio/mockingboard_audio", () => ({
  playMockingboard: jest.fn(),
  stopMockingboardAudio: jest.fn(),
}))
jest.mock("./devices/audio/vera_psg_audio", () => ({
  playVeraFmReset: jest.fn(),
  playVeraFmWrite: jest.fn(),
  playVeraPcmWrite: jest.fn(),
  playVeraPsgWrite: jest.fn(),
  playVeraPsgBatch: jest.fn(),
  stopVeraPsgAudio: jest.fn(),
}))
jest.mock("./devices/audio/iigs_ensoniq_audio", () => ({
  playEnsoniqSamples: jest.fn(),
  resetEnsoniqAudio: jest.fn(),
}))

beforeEach(() => {
  jest.clearAllMocks()
})

test("MSG_WORKER.AUDIO_RESET stops Mockingboard, speaker, MIDI, VERA and Ensoniq audio", () => {
  doOnMessage({ data: { msg: MSG_WORKER.AUDIO_RESET } } as MessageEvent)

  expect(stopMidiAudio).toHaveBeenCalledTimes(1)
  expect(stopMockingboardAudio).toHaveBeenCalledTimes(1)
  expect(stopSpeakerAudio).toHaveBeenCalledTimes(1)
  expect(stopVeraPsgAudio).toHaveBeenCalledTimes(1)
  expect(resetEnsoniqAudio).toHaveBeenCalledTimes(1)
  // The normal handlers stay untouched by the reset message.
  expect(receiveMidiData).not.toHaveBeenCalled()
  expect(playMockingboard).not.toHaveBeenCalled()
  expect(playVeraPsgWrite).not.toHaveBeenCalled()
  expect(playVeraFmReset).not.toHaveBeenCalled()
  expect(playVeraFmWrite).not.toHaveBeenCalled()
  expect(playVeraPcmWrite).not.toHaveBeenCalled()
  expect(playVeraPsgBatch).not.toHaveBeenCalled()
  expect(playEnsoniqSamples).not.toHaveBeenCalled()
})

// The UI handler is independent of machine-state ordering: it is exactly one
// stop pass per notification, so Boot and Reset each clear scheduled audio
// once without waiting for the next MACHINE_STATE.
test("MSG_WORKER.AUDIO_RESET clears audio without a machine state", () => {
  doOnMessage({ data: { msg: MSG_WORKER.AUDIO_RESET } } as MessageEvent)
  expect(stopMidiAudio).toHaveBeenCalledTimes(1)
  expect(stopMockingboardAudio).toHaveBeenCalledTimes(1)
  expect(stopSpeakerAudio).toHaveBeenCalledTimes(1)
  expect(stopVeraPsgAudio).toHaveBeenCalledTimes(1)
  expect(resetEnsoniqAudio).toHaveBeenCalledTimes(1)
})
