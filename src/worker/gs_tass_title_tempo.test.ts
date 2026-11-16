import { doSetMachineName, doSetRunMode, doSetSpeedMode } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { iigsEnsoniq } from "./devices/iigs_ensoniq"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Tempo probe for the Tass Times title theme, at the 2.8 MHz mode the game
// runs at (and the mode the reference MP3 implies).
//
// Reference numbers (user's MP3 = real-hardware title music):
//   - bassline motif cycles every ~2.0 s, bass pitch ~158 Hz.
//   - apple2ts BEFORE the interleaved DOC catch-up: motif every ~4.0 s,
//     halt events capped at 60/s (one per video refresh).
// This probe boots the game, holds the title stage, measures halt events per
// emulated second, and dumps the PCM the run loop posts so the repeat cycle
// can be compared with the reference directly.
const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"
const PCM_OUT = process.env.GS_TEMPO_PCM_OUT || "C:\\Users\\USER\\AppData\\Local\\Temp\\opencode\\tass_fixed_pcm.json"

test("Tass Times title tick rate at 2.8 MHz + PCM dump", () => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  doSetSpeedMode(1)
  iigsEnsoniq.reset()

  // PCM capture: intercept the run loop's block posts. The test replaces the
  // worker2main export, which motherboard calls dynamically each refresh.
  const w2m = require("./worker2main")
  const captured: number[] = []
  const origPass = w2m.passEnsoniqSound
  w2m.passEnsoniqSound = (samples: Int16Array, rate: number) => {
    for (let i = 0; i + 1 < samples.length; i += 2) {
      captured.push((samples[i] + samples[i + 1]) / 65536)
    }
    void rate
    // swallow: the real transport is not needed in this harness
  }
  expect(typeof origPass).toBe("function")

  const data = fs.readFileSync(TASS_PATH)
  const mounted = doSetEmuDriveNewData({
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: "tass.2mg",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: true,
    diskData: new Uint8Array(data),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  } as unknown as DriveProps)
  expect(mounted).toBe(true)

  const run = (frames: number, label: string) => {
    const t0 = iigsEnsoniq.irqTicks
    const h0 = iigsEnsoniq.haltCount
    for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
    const dt = iigsEnsoniq.irqTicks - t0
    const dh = iigsEnsoniq.haltCount - h0
    console.log(`[TEMPO] ${label}: frames=${frames} ticks+${dt} (${(dt * 60 / frames).toFixed(1)}/s) ` +
      `halts+${dh} (${(dh * 60 / frames).toFixed(1)}/s) osce=${iigsEnsoniq.osce} ` +
      `outRate=${iigsEnsoniq.outputRate()} segs=[${iigsEnsoniq.haltSegments.slice(-8).join(",")}]`)
  }

  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)

  run(1000, "boot")
  run(300, "title-idle-1")
  run(300, "title-idle-2")

  // Music capture window for the motif-cycle comparison.
  iigsEnsoniq.resetDocDiag()
  const startLen = captured.length
  run(2400, "title-capture") // 40 emulated seconds
  void startLen

  fs.writeFileSync(PCM_OUT, JSON.stringify({ sr: iigsEnsoniq.outputRate(), step: 2, data: captured, capture: "apple2ts-fixed 2.8MHz title" }))
  console.log(`[TEMPO] dumped ${captured.length} mono frames (~${(captured.length / iigsEnsoniq.outputRate() / 2).toFixed(1)}s) to ${PCM_OUT}`)

  // Walk the title with a keypress as in gs_tass.test.ts and measure the
  // next-stage tick rate too.
  setKeyboardState({ isDown: true, key: 0x0d, repeat: false })
  for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
  setKeyboardState({ isDown: false, key: 0, repeat: false })
  for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
  run(120, "after-return")
  run(300, "after-return-idle")
})

export {}
