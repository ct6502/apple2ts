import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { memGet24, megaIIAux, iigsRegisters, getShr, isIigsAuxLinear } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const FRAMES = Number(process.env.GSBOOT_FRAMES || 4000)
const PO_PATH = "C:\\dev\\emu\\ap2\\GSOS601.po"

const hex = (v: number, n = 2) => "$" + v.toString(16).toUpperCase().padStart(n, "0")
const dump = (bank: number, lo: number, hi: number) => {
  const out: string[] = []
  for (let a = lo; a <= hi; a += 16) {
    const bytes: string[] = []
    for (let i = 0; i < 16; i++) bytes.push(hex(memGet24((bank << 16) | (a + i))))
    out.push(`${hex(bank)}:${hex(a, 4)}  ${bytes.join(" ")}`)
  }
  return out.join("\n")
}

test("GSOS601: where does the boot actually stop?", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = fs.readFileSync(PO_PATH)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    const cpu = getCPU() as any
    const ring: string[] = []
    const orig = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      const pb = cpu.PB, pc = cpu.PC
      if (ring.length >= 400) ring.shift()
      ring.push(`${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} op=${memGet24((pb << 16) | pc).toString(16).padStart(2, "0")} A=${hex(cpu.A)} X=${hex(cpu.X)} Y=${hex(cpu.Y)} S=${hex(cpu.S)} DB=${hex(cpu.DB)} P=${hex(cpu.P)} E=${cpu.emulationMode ? 1 : 0}`)
      return orig(cb)
    }

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    console.log(`[STOP] PB=${hex(cpu.PB)} PC=${hex(cpu.PC, 4)} E=${cpu.emulationMode ? 1 : 0} P=${hex(cpu.P)} DB=${hex(cpu.DB)} S=${hex(cpu.S)}`)
    console.log("[STOP] last 24 instructions:\n" + ring.slice(-24).join("\n"))
    console.log("[STOP] bank 00 $FE00-$FE20:\n" + dump(0, 0xfe00, 0xfe20))

    // GS/OS / ROM state that says how far the boot got.
    console.log(`[STOP] $C029 NewVideo=${hex(iigsRegisters[0x29])} $C035 Shadow=${hex(iigsRegisters[0x35])} $C041 INTEN=${hex(iigsRegisters[0x41])} $C046 INTFLAG=${hex(iigsRegisters[0x46])}`)
    console.log("[STOP] Tool Locator $E1:03C0..$E1:03D0 = " +
      Array.from(megaIIAux.subarray(0x03c0, 0x03d0)).map((b) => hex(b)).join(" "))
    console.log("[STOP] $E1:00D8 task queue = " +
      Array.from(megaIIAux.subarray(0x00d8, 0x00e0)).map((b) => hex(b)).join(" "))
    console.log("[STOP] $03F2-$03F4 warm reset sig = " +
      [0, 1, 2].map((i) => hex(memGet24(0x03f2 + i))).join(" "))

    // The SHR page, read the way the renderer reads it. Indexing megaIIAux at
    // $2000+$i is wrong as soon as SHR linearizes the aux window, and that is
    // what made this whole file report a flat grey screen for a live desktop.
    const shr = getShr()
    console.log(`[RENDER] isIigsAuxLinear=${isIigsAuxLinear()} getShr().length=${shr.length}`)
    const rc = new Map<number, number>()
    for (const b of shr) rc.set(b, (rc.get(b) || 0) + 1)
    console.log("[RENDER] getShr byte histogram: " +
      Array.from(rc.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([b, c]) => `${hex(b)}:${c}`).join(" "))
    console.log("[RENDER] first 8 SCB = " +
      Array.from(shr.slice(0x7d00, 0x7d08)).map((b) => hex(b)).join(" ") +
      "   palette $7E00 = " + Array.from(shr.slice(0x7e00, 0x7e10)).map((b) => hex(b)).join(" "))

    // A short buffer here is what makes processSuperHiRes() bail out and leave
    // the Super Hi-Res screen black, so assert on it directly.
    expect(shr.length).toBe(32768)
    expect(new Set(shr.slice(0x7d00, 0x7dc8)).size).toBeGreaterThan(1)
    expect(true).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 600000)
