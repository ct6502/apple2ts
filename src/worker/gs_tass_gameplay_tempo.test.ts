// Per-oscillator key-on cadence probe for the Tass Times gameplay (in-game)
// audio, to compare the pre-fix vs post-fix interleaved DOC catch-up.
//
// The user reports the gameplay pendulum sound is now too fast (it was correct
// before the fix), while the title music speed is fixed. irqTicks counts ALL
// halt IRQs, so it cannot identify which voice drives the tempo. This probe
// polls the oscillators once per emulated frame and records, per osc:
//   - key-on events (keyOnSample stamps -> median inter-key-on interval)
//   - march segments (lastHaltSegment at halt)
// so the exact voice whose re-key rate changed can be identified, and its
// rate compared pre/post fix at the same stage.
const { doSetMachineName, doSetRunMode, doSetSpeedMode } = require("./motherboard")
const { doSetEmuDriveNewData } = require("./devices/drivestate")
const { setKeyboardState } = require("./devices/keyboard")
const { iigsEnsoniq } = require("./devices/iigs_ensoniq")
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"
import { jest, test } from "@jest/globals"

const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"
const OUT = process.env.GS_GAMEPLAY_OUT || "C:\\Users\\USER\\AppData\\Local\\Temp\\opencode\\tass_gameplay_postfix.json"
const PCM_OUT = process.env.GS_GAMEPLAY_PCM_OUT || "C:\\Users\\USER\\AppData\\Local\\Temp\\opencode\\tass_gameplay_pcm_postfix.json"

const memory = require("./memory").memory as Uint8Array

const screenText = () => {
  const lines: string[] = []
  for (let row = 0; row < 24; row++) {
    let line = ""
    const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
    for (let col = 0; col < 40; col++) {
      const ch = memory[base + col] & 0x7f
      line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : "."
    }
    if (line.replace(/\./g, "").trim().length > 0) lines.push(line.trimRight())
  }
  return lines.join(" | ")
}

// Poll once per frame: record key-on stamps per osc.
const lastKeyOn = new Array<number>(32).fill(-1)
const lastSeg = new Array<number>(32).fill(-1)
// per osc: { keyons: [stamps], segs: [lastHaltSegment at change] }
const censuses: Record<string, Map<number, { keyons: number[], segs: number[] }>> = {}
let currentPhase = ""

const poll = () => {
  const c = censuses[currentPhase]
  for (let o = 0; o < 32; o++) {
    const osc = iigsEnsoniq.oscillators[o]
    if (osc.keyOnSample !== lastKeyOn[o]) {
      lastKeyOn[o] = osc.keyOnSample
      let e = c.get(o)
      if (!e) { e = { keyons: [], segs: [] }; c.set(o, e) }
      e.keyons.push(osc.keyOnSample)
    }
    if (osc.lastHaltSegment !== lastSeg[o]) {
      lastSeg[o] = osc.lastHaltSegment
      let e = c.get(o)
      if (!e) { e = { keyons: [], segs: [] }; c.set(o, e) }
      e.segs.push(osc.lastHaltSegment)
    }
  }
}

const report = (label: string) => {
  console.log(`\n================ PHASE ${label} ================`)
  const c = censuses[label]
  const s2ms = (s: number) => (s * 1000 / iigsEnsoniq.outputRate()).toFixed(1)
  const entries = Array.from(c.entries()).sort((a, b) => b[1].keyons.length - a[1].keyons.length)
  for (const [osc, e] of entries) {
    if (e.keyons.length < 2) continue
    const d = []
    for (let i = 1; i < e.keyons.length; i++) d.push(e.keyons[i] - e.keyons[i - 1])
    d.sort((a, b) => a - b)
    const med = d[Math.floor(d.length / 2)]
    const osc0 = iigsEnsoniq.oscillators[osc]
    const seg = e.segs.filter(s => s > 0)
    console.log(`[OSC${String(osc).padStart(2)}] keyons=${e.keyons.length} medInterval=${med} (${s2ms(med)}ms) ` +
      `ctrl=$${osc0.control.toString(16)} vol=$${osc0.vol.toString(16)} freq=$${osc0.freq.toString(16)} ` +
      `wtptr=$${osc0.wavetblpointer.toString(16)} wtsize=${osc0.wtsize} res=${osc0.resolution} ` +
      `segs=[${seg.slice(-8).join(",")}]`)
  }
  console.log(`[SCREEN] ${label}: ${screenText().slice(0, 400)}`)
}

test("Tass gameplay: per-osc key-on cadence census", () => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  doSetSpeedMode(1)
  iigsEnsoniq.reset()

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
  } as unknown as any as DriveProps)
  expect(mounted).toBe(true)

  const run = (frames: number, label: string) => {
    currentPhase = label
    if (!censuses[label]) censuses[label] = new Map()
    for (let f = 0; f < frames; f++) {
      jest.advanceTimersByTime(17)
      poll()
    }
    report(label)
  }

  const key = (code: number) => {
    setKeyboardState({ isDown: true, key: code, repeat: false })
    for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
    setKeyboardState({ isDown: false, key: 0, repeat: false })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
  }

  // PCM intercept for the final in-game idle phase.
  const w2m = require("./worker2main")
  const captured: number[] = []
  const origPass = w2m.passEnsoniqSound
  w2m.passEnsoniqSound = (samples: Int16Array, rate: number) => {
    for (let i = 0; i + 1 < samples.length; i += 2) {
      captured.push((samples[i] + samples[i + 1]) / 65536)
    }
    void rate
  }
  void origPass

  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)

  run(1000, "boot")
  run(300, "title-idle-1")
  run(300, "title-idle-2")
  key(0x0d)
  run(120, "after-return")
  run(200, "after-return-idle")
  key(0x20)
  run(120, "after-space")
  run(200, "after-space-idle")
  key(0x0d)
  run(120, "after-return2")
  run(300, "after-return2-idle")
  key(0x20)
  run(120, "after-space2")
  run(300, "after-space2-idle")
  key(0x0d)
  run(400, "after-return3")
  key(0x20)
  run(120, "after-space3")
  // In-game idle: capture PCM for rhythm analysis at the stable ': prompt'.
  captured.length = 0
  run(600, "game-idle-pcm")

  const summary: any = { rate: iigsEnsoniq.outputRate(), osce: iigsEnsoniq.osce }
  for (const [label, c] of Object.entries(censuses)) {
    const oscs: any = {}
    for (const [osc, e] of c.entries()) {
      oscs[osc] = { n: e.keyons.length, stamps: e.keyons, segs: e.segs }
    }
    summary[label] = oscs
  }
  fs.writeFileSync(OUT, JSON.stringify(summary, null, 1))
  fs.writeFileSync(PCM_OUT, JSON.stringify({ sr: iigsEnsoniq.outputRate(), data: captured, capture: "tass in-game idle" }))
  console.log(`[GAMEPLAY] census dumped to ${OUT}, ${captured.length} mono frames to ${PCM_OUT}`)
})

export {}
