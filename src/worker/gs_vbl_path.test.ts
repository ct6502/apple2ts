import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { megaIIAux, memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Does the Apple IIgs ROM's VBL path keep running once GS/OS has loaded?
//
// pom2gs states the design plainly (src/IIgsMemory.cpp:378-382):
//   "GS/OS's Event Manager reads the mouse off the already-firing VBL/heartbeat,
//    so this is poll-based"
//
// and section 27 established that what actually reads $C024 is the ROM's own ADB
// task at FF:C4D2. Section 33 then measured that the ROM's VBL/system-task
// dispatcher at $FE:9874 executes zero times, and that the ROM's BRK/IRQ firmware
// at $FF:C070-$FF:C0B0 stops after boot. If the ROM's VBL path really does stop,
// nothing is left to poll the mouse, which is exactly the symptom.
//
// So: count execution in the ROM's interrupt and ADB machinery, per phase, and
// then move the mouse and see whether any of it runs.
const GSOS = process.env.GS_MCS_PATH || "C:\\dev\\emu\\ap2\\GSOS601.po"

interface Range { name: string, bank: number, lo: number, hi: number }

const RANGES: Range[] = [
  { name: "FE:9874 ROM VBL/system-task dispatcher", bank: 0xfe, lo: 0x9874, hi: 0x9960 },
  { name: "FE:96CB ROM VBL installer", bank: 0xfe, lo: 0x96cb, hi: 0x9720 },
  { name: "FF:C070 ROM BRK/IRQ firmware", bank: 0xff, lo: 0xc070, hi: 0xc0b0 },
  { name: "FF:C4D0 ROM ADB task (the $C024 reader)", bank: 0xff, lo: 0xc4d0, hi: 0xc4f0 },
  { name: "FF:C700 software-interrupt dispatch", bank: 0xff, lo: 0xc700, hi: 0xc7c6 },
  { name: "FF:B7CC ROM full interrupt manager", bank: 0xff, lo: 0xb7cc, hi: 0xb860 },
  { name: "FF:79C8 ROM minimal interrupt manager", bank: 0xff, lo: 0x79c8, hi: 0x7a10 },
  { name: "FF:9CE0 ROM mouse accumulator", bank: 0xff, lo: 0x9ce0, hi: 0x9ea8 },
]

const counts = new Map<string, number>()
const bump = (name: string) => counts.set(name, (counts.get(name) ?? 0) + 1)
const snapshot = () => new Map(counts)
const diff = (before: Map<string, number>) => {
  const out: string[] = []
  for (const r of RANGES) out.push(`  ${r.name}: ${(counts.get(r.name) ?? 0) - (before.get(r.name) ?? 0)}`)
  return out.join("\n")
}

const vec = (off: number) => Array.from(megaIIAux.subarray(off, off + 4))
  .map((b) => "$" + b.toString(16).padStart(2, "0")).join(" ")

test("the ROM VBL path: does it survive GS/OS, and does a mouse move reach it", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()
    const data = fs.readFileSync(GSOS)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    const cpu = getCPU() as any
    const origPI = cpu.processInstruction.bind(cpu)
    let instr = 0
    const hot = new Map<number, number>()
    cpu.processInstruction = (cb?: any) => {
      instr++
      const pb = cpu.PB, pc = cpu.PC
      for (const r of RANGES) {
        if (pb === r.bank && pc >= r.lo && pc <= r.hi) { bump(r.name); break }
      }
      hot.set((pb << 16) | pc, (hot.get((pb << 16) | pc) ?? 0) + 1)
      return origPI(cb)
    }

    const pump = (frames: number) => {
      for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
    }

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Phase 1: boot all the way to the Finder.
    let mark = snapshot()
    pump(700)
    console.log(`[VBL] phase 1 (boot to Finder, instr=${instr}):\n${diff(mark)}`)
    console.log(`[VBL] $E1:0010 interrupt manager vector: ${vec(0x0010)}`)
    console.log(`[VBL] $E1:0030 VBL dispatcher vector:    ${vec(0x0030)}`)
    console.log(`[VBL] $E1:0070 system task vector:       ${vec(0x0070)}`)
    console.log(`[VBL] $C041 INTEN = $${(require("./memory").iigsRegisters[0x41]).toString(16).padStart(2, "0")}` +
      `   $C027 ADB status/int-enables = $${(require("./memory").iigsRegisters[0x27]).toString(16).padStart(2, "0")}`)

    // Phase 2: Finder up and idle. This is where a mouse event has to be picked up.
    mark = snapshot()
    hot.clear()
    pump(400)
    console.log(`[VBL] phase 2 (Finder idle, instr=${instr}):\n${diff(mark)}`)
    const topIdle = Array.from(hot.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([pc, c]) => {
        const b = (pc >>> 16) & 0xff, o = pc & 0xffff
        return `${b.toString(16).padStart(2, "0")}:${o.toString(16).padStart(4, "0").toUpperCase()} x${c}`
      })
    console.log(`[VBL] hottest PCs while idle:\n  ${topIdle.join("\n  ")}`)
    console.log(`[VBL] $E1:0030 after idle: ${vec(0x0030)}`)

    // Phase 3: move and click the mouse. Anything that notices has to run here.
    mark = snapshot()
    hot.clear()
    MouseCardEvent({ x: 0.3, y: 0.4, buttons: -1 })
    pump(120)
    MouseCardEvent({ x: 0.5, y: 0.6, buttons: -1 })
    pump(120)
    MouseCardEvent({ x: 0.5, y: 0.6, buttons: 0x10 })
    pump(120)
    MouseCardEvent({ x: 0.5, y: 0.6, buttons: 0x00 })
    pump(300)
    console.log(`[VBL] phase 3 (after mouse move + click, instr=${instr}):\n${diff(mark)}`)
    const topMove = Array.from(hot.entries()).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([pc, c]) => {
        const b = (pc >>> 16) & 0xff, o = pc & 0xffff
        return `${b.toString(16).padStart(2, "0")}:${o.toString(16).padStart(4, "0").toUpperCase()} x${c}`
      })
    console.log(`[VBL] hottest PCs after the move:\n  ${topMove.join("\n  ")}`)
    console.log(`[VBL] ADB hasMouseData after the move: ${(iigsADB as unknown as { hasMouseData: () => boolean }).hasMouseData()}`)

    // Did the cursor holes move? Section 29a measured them advancing.
    console.log("[VBL] cursor holes $047C/$057C/$04FC/$05FC = " +
      `${memGet24(0x047c).toString(16)}/${memGet24(0x057c).toString(16)}/` +
      `${memGet24(0x04fc).toString(16)}/${memGet24(0x05fc).toString(16)}`)
    console.log("[VBL] $E1:0190-$E1:0193 = " +
      Array.from(megaIIAux.subarray(0x0190, 0x0194)).map((b) => "$" + b.toString(16)).join(""))
    expect(true).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 1800000)