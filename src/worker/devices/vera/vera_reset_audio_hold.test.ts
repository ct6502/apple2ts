// VERA audio follows the card's display composer out of reset.
//
// Time Pilot's CLOCK.SYSTEM installs a Programmer's Guide warm-start vector
// ($03F2=$16, $03F3=$12, $03F4=$B7) that points at $1216 inside its own payload
// relocated to $1000. The game image loads at $0800 and overwrites that payload,
// so Ctrl-Reset resumes the title-screen loop in mid-instruction. The VERA card
// has just been reset (composer off, PSG/PCM/FM cleared), and before this fix
// the resumed program's PSG writes were forwarded to the UI, so the music
// restarted behind a black screen while the display stayed off.
//
// video_reset() now holds the audio path until software programs the display
// composer again with a non-zero value; that is the first thing a cold-booted
// VERA program does (Time Pilot writes $11 to display.video before audioInit()).
// These tests drive the same register path the guest uses.

import { MSG_WORKER } from "../../../common/utility"
import * as worker2main from "../../worker2main"
import { memSet } from "../../memory"
import { enableVera, resetVera } from "./vera"
import { video_update, video_write } from "./video"

const postMessage = jest.spyOn(self, "postMessage").mockImplementation()
let psg: jest.SpyInstance
let pcm: jest.SpyInstance
let fm: jest.SpyInstance

// DATA0 write to the first PSG register ($1F9C0) through the address ports.
const psgWrite = (value: number) => {
  video_write(0x00, 0xc0)
  video_write(0x01, 0xf9)
  video_write(0x02, 0x01)
  video_write(0x03, value)
}
const flush = () => video_update()
const displayOn = () => video_write(0x09, 0x11)
const fmWrite = () => {
  memSet(0xc0a0, 0x14) // YM2151 address port
  memSet(0xc0a1, 0x30) // YM2151 data port
}

beforeAll(() => {
  enableVera(true, 2) // installs the card and resets it
})

beforeEach(() => {
  postMessage.mockClear()
  resetVera()
  psg = jest.spyOn(worker2main, "passVeraPsgBatch").mockImplementation(() => {})
  pcm = jest.spyOn(worker2main, "passVeraPcmWrite").mockImplementation(() => {})
  fm = jest.spyOn(worker2main, "passVeraFmWrite").mockImplementation(() => {})
})

afterEach(() => {
  psg.mockRestore()
  pcm.mockRestore()
  fm.mockRestore()
})

afterAll(() => {
  postMessage.mockRestore()
})

test("PSG and PCM writes reach the UI once software programs the display composer", () => {
  displayOn()
  psgWrite(0x42)
  flush()
  expect(psg).toHaveBeenCalledTimes(1)
  expect(psg.mock.calls[0][0]).toEqual([{ cycle: expect.any(Number), reg: 0, value: 0x42 }])

  video_write(0x1d, 0x55)
  expect(pcm).toHaveBeenCalledTimes(1)
})

test("installing the card is not a warm reset: audio is not held at power-on", () => {
  // video_init() resets the card for a fresh install, and doBoot() releases the
  // hold after its doReset(), so software that uses VERA for sound only (never
  // writing the display composer) still sounds.
  enableVera(true, 2)
  psgWrite(0x42)
  flush()
  expect(psg).toHaveBeenCalledTimes(1)
  expect(psg.mock.calls[0][0]).toEqual([{ cycle: expect.any(Number), reg: 0, value: 0x42 }])
})

test("a card reset holds PSG, PCM and FM writes until software re-arms the display", () => {
  displayOn()
  resetVera()
  expect(postMessage).toHaveBeenCalledWith({ msg: MSG_WORKER.VERA_AUDIO_RESET, payload: null })

  // The resumed Time Pilot main loop keeps writing music registers here.
  psgWrite(0x42)
  flush()
  video_write(0x1d, 0x55)
  fmWrite()

  expect(psg).not.toHaveBeenCalled()
  expect(pcm).not.toHaveBeenCalled()
  expect(fm).not.toHaveBeenCalled()
})

test("programming the display composer after a reset lets audio through again", () => {
  resetVera()
  psgWrite(0x42)
  flush()
  expect(psg).not.toHaveBeenCalled()

  displayOn()
  psgWrite(0x43)
  flush()
  expect(psg).toHaveBeenCalledTimes(1)
  expect(psg.mock.calls[0][0]).toEqual([{ cycle: expect.any(Number), reg: 0, value: 0x43 }])

  video_write(0x1d, 0x55)
  expect(pcm).toHaveBeenCalledTimes(1)
  fmWrite()
  expect(fm).toHaveBeenCalled()
})
