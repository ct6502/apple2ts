import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { getTextPageAsString, memGet24, iigsRegisters, iigsGetVblPending } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"
import * as path from "path"

// Drive the REAL motherboard (boot + run loop + VBL + disk + video) headlessly
// with fake timers, and watch the text screen for "Fatal System Error".
const OUT = path.join(__dirname, "..", "..", "gs_motherboard_out.txt")

test("real motherboard IIgs boot, watch for fatal", () => {
  jest.useFakeTimers()
  setIsTesting()
  const lines: string[] = []
  try {
    doSetMachineName("APPLE2GS")
    doBoot()
    // Hook the CPU: capture a rolling trace tail + every COP/BRK, so we can see
    // the exact path that leads into the System Bad handler at ff:7250.
    const cpu = getCPU() as any
    const gateLog: string[] = []
    const tail: string[] = []
    const cops: string[] = []
    let frozen = false
    let hookCalls = 0
    const probes: string[] = []
    const hx = (v: number, n: number) => v.toString(16).padStart(n, "0")
    const origPI = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      const pb = cpu.PB, pc = cpu.PC
      const opcode = memGet24((pb << 16) | pc)
      if (opcode === 0x02 && cops.length < 30) {
        cops.push(`COP #${hx(memGet24(((pb << 16) | pc) + 1), 2)} at ${hx(pb, 2)}:${hx(pc, 4)} A=${hx(cpu.A, 4)} X=${hx(cpu.X, 4)} Y=${hx(cpu.Y, 4)} D=${hx(cpu.D, 4)} DB=${hx(cpu.DB, 2)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
      }
      if (pb === 0xff && ((pc >= 0x725d && pc <= 0x7278) || (pc >= 0x8552 && pc <= 0x8556))) {
        if (gateLog.length < 60) gateLog.push(`${pc.toString(16)} op=${memGet24((pb << 16) | pc).toString(16)} C046=${memGet24(0xE1C046).toString(16)} vbl=${iigsGetVblPending()} INTEN=${iigsRegisters[0x41].toString(16)} P=${cpu.P.toString(16)}`)
      }
      if (pb === 0xff && pc === 0x726d && gateLog.length < 60) gateLog.push(`>>> SYSTEM-BAD DISPLAY LOOP at 726d, C046=${memGet24(0xE1C046).toString(16)} c047writes=${(globalThis as any).__c047Writes || 0}`)
      tail.push(`${hx(pb, 2)}:${hx(pc, 4)} op=${hx(opcode, 2)} A=${hx(cpu.A, 4)} X=${hx(cpu.X, 4)} Y=${hx(cpu.Y, 4)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)} DB=${hx(cpu.DB, 2)}`)
      hookCalls++
      if (pb === 0xff && pc === 0x7906 && probes.length < 40) {
        probes.push(`init-result @cyc=${(globalThis as any).s6502?.cycleCount} A(errcode)=${hx(cpu.A, 2)} $7000=${hx(memGet24(0x007000), 2)} $7002=${hx(memGet24(0x007002), 2)} INTEN=${hx(iigsRegisters[0x41], 2)}`)
      }
      if (pb === 0xff && pc === 0x71bd && probes.length < 40) {
        probes.push(`sig-check $0310=${hx(memGet24(0x000310) | (memGet24(0x000311) << 8), 4)} expected=${hx(memGet24(0xff7350) | (memGet24(0xff7351) << 8), 4)} $0316=${hx(memGet24(0x000316), 2)} $031b=${hx(memGet24(0x00031b), 2)}`)
      }
      if (pb === 0xff && pc === 0x79e3 && probes.length < 40) {
        probes.push(`mgr-inc $7000=${hx(memGet24(0x007000), 2)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
      }
      if (pb === 0xff && pc >= 0x7250 && pc <= 0x7278 && !frozen) {
        frozen = true
        try { fs.writeFileSync(OUT.replace(".txt", "_entry.txt"), tail.join("\n")) } catch (e) { fs.writeFileSync(OUT.replace(".txt", "_entryerr.txt"), String(e)) }
      }
      if (tail.length > 400) tail.shift()
      return origPI(cb)
    }
    doSetRunMode(RUN_MODE.RUNNING, false)
    // Run ~1200 frames (20s at 60fps). Each timer tick runs one frame.
    let fatalSeen = ""
    const frames: string[] = []
    for (let f = 0; f < 1200; f++) {
      jest.advanceTimersByTime(17)
      if (f < 40) {
        const c046 = memGet24(0xE1C046)
        frames.push(`f${f} C046=${c046.toString(16)} INTEN=${iigsRegisters[0x41].toString(16)} cyc=${(globalThis as any).s6502?.cycleCount ?? "?"}`)
      }
      const txt = getTextPageAsString()
      if (txt.includes("Fatal System Error") && !fatalSeen) {
        fatalSeen = `frame ${f}: ${txt.replace(/\s+/g, " ").slice(0, 200)}`
      }
    }
    lines.push(`hookCalls=${hookCalls} frozen=${frozen}`)
    lines.push(`probes (${probes.length}):\n${probes.join("\n")}`)
    lines.push(`gateLog (${gateLog.length}):\n${gateLog.join("\n")}`)
    lines.push(`COPs (${cops.length}):\n${cops.join("\n")}`)
    lines.push(`frames:\n${frames.join("\n")}`)
    lines.push(`fatalSeen=${fatalSeen || "none"}`)
    lines.push("Trace tail (last 400 instrs):\n" + tail.join("\n"))
    lines.push("Final text screen:\n" + getTextPageAsString())
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
  fs.writeFileSync(OUT, lines.join("\n"))
  expect(true).toBe(true)
})
