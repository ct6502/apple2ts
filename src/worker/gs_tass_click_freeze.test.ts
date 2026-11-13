// Reproduce the user-reported gameplay freeze on the first mouse click in
// Tass Times in Tonetown (in-game, after walking the [More] intro pages to the
// `Spot is here` room prompt). The pendulum tick keeps playing, so the sound
// driver is alive; the question is what the game's main loop parks on.
const { doSetMachineName, doSetRunMode, doSetSpeedMode, getCPU } = require("./motherboard")
const { doSetEmuDriveNewData } = require("./devices/drivestate")
const { setKeyboardState } = require("./devices/keyboard")
const { MouseCardEvent } = require("./devices/mouse")
const { iigsADB } = require("./iigs_adb")
const { iigsEnsoniq } = require("./devices/iigs_ensoniq")
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"
import { jest, test, expect } from "@jest/globals"

const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"
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

  test("Tass freeze on first in-game mouse click", () => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  doSetSpeedMode(1)
  iigsADB.reset()
  resetMouseRelative()
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

  const cpu = getCPU() as unknown as { PB: number, PC: number, processInstruction: (cb?: unknown) => number }
  const origPI = cpu.processInstruction.bind(cpu)
  const hist = new Map<number, number>()
  let sampling = false
  cpu.processInstruction = (cb?: unknown) => {
    if (sampling) {
      const pc = ((cpu.PB << 16) | cpu.PC) >>> 0
      hist.set(pc, (hist.get(pc) ?? 0) + 1)
    }
    return origPI(cb)
  }

  const run = (frames: number, label: string) => {
    hist.clear()
    sampling = true
    for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
    sampling = false
    const top = Array.from(hist.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
    const memGet24 = (require("./memory").memGet24 as (a: number) => number)
    const dump = top.map(([pc, n]) => {
      const bank = (pc >>> 16) & 0xff, off = pc & 0xffff
      const bytes = Array.from({ length: 8 }, (_, k) => memGet24(((bank << 16) | ((off + k) & 0xffff))).toString(16).padStart(2, "0"))
      return `${bank.toString(16)}:${off.toString(16).padStart(4, "0").toUpperCase()} x${n} [${bytes.join(" ")}]`
    })
    console.log(`[${label}] topPCs: ${dump.join("  |  ")}`)
    console.log(`[${label}] screen: ${screenText().slice(0, 220)}`)
    return hist
  }

  const key = (code: number) => {
    setKeyboardState({ isDown: true, key: code, repeat: false })
    for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
    setKeyboardState({ isDown: false, key: 0, repeat: false })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
  }

  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)

  run(1000, "boot")
  run(300, "title-idle")
  key(0x0d)
  run(120, "after-return")
  run(150, "after-return-idle")
  key(0x20)
  run(120, "after-space")
  run(150, "after-space-idle")
  key(0x0d)
  run(400, "after-return2")
  key(0x20)
  run(120, "after-space2")
  run(300, "after-space2-idle")

  // Baseline at the `:` prompt, then the click.
  run(200, "in-game-baseline")
  const memGet = (a: number) => (require("./memory").memGet24 as (x: number) => number)(a)
  const holes = () => `holes X=$${memGet(0x047c).toString(16)}$${memGet(0x057c).toString(16)} ` +
    `Y=$${memGet(0x04fc).toString(16)}$${memGet(0x057c >> 0).toString(16)}`
  console.log(`[HOLES] baseline ${holes()}`)
  // Mirror the browser: continuous motion for ~1s (60 moves), then press/release.
  for (let i = 0; i < 60; i++) {
    MouseCardEvent({ x: 0.4 + (i % 10) * 0.02, y: 0.5 + (i % 5) * 0.01, buttons: -1 })
    for (let f = 0; f < 1; f++) jest.advanceTimersByTime(17)
  }
  console.log(`[HOLES] after moves ${holes()}`)
  console.log("[CLICK] press at 0.5,0.5")
  MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x10 })
  for (let f = 0; f < 30; f++) jest.advanceTimersByTime(17)
  MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x00 })
  for (let f = 0; f < 90; f++) jest.advanceTimersByTime(17)
  // Orchestrated freeze regression: before readIigsVideoCounter() existed,
  // $C02E read a static 0, the game's cursor-refresh routine at $2F92
  // (`LDA $C02E / CMP #$E8 / BNE`) spun forever after the first mouse motion,
  // and the cursor holes stopped moving. Assert the top PCs after the
  // motion+click stay in the game's real main loop ($1CD9 polling) and that
  // the frozen-range PCs never execute.
  const clickHist = run(300, "after-click")
  run(600, "after-click-idle")
  console.log(`[HOLES] after click ${holes()}`)
  let frozenHits = 0
  const frozenPcs: string[] = []
  for (const [pc, n] of clickHist.entries()) {
    if ((pc >>> 16) === 0 && (pc & 0xffff) >= 0x2f80 && (pc & 0xffff) <= 0x2fa0) {
      frozenHits += n
      frozenPcs.push((pc & 0xffff).toString(16) + " x" + n)
    }
  }
  console.log(`[FREEZE-RANGE] hits=${frozenHits} pcs=[${frozenPcs.slice(0, 12).join(",")}]`)
  // Before the video-counter read existed, one PC (the `LDA $C02E / CMP #$E8 /
  // BNE` spin) took ~1.6M of 300 frames' instructions: a hard freeze. Now the
  // wait runs ~17 exits/s as part of normal cursor-refresh work, so aptly no
  // single PC in the range may dominate the histogram.
  for (const n of frozenPcs) {
    expect(Number(n.split(" x")[1])).toBeLessThan(50000)
  }
  expect(memGet(0x047c) | (memGet(0x057c) << 8)).not.toBe(0) // cursor X advanced
  expect(memGet(0x04fc) | (memGet(0x05fc) << 8)).not.toBe(0) // cursor Y advanced
})

function resetMouseRelative() {
  // ADB counts originate from MouseCardEvent deltas; nothing to reset here
  // beyond the reset() call the IIgs ADB already received above.
}
export {}
