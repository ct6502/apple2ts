import { doSetRom, memGet24, memSet24, iigsSignalVbl, iigsRegisters, iigsInitInterrupts, memoryReset } from "./memory"
import { CPU65816 } from "./cpu65816"
import * as fs from "fs"
import * as path from "path"

// Reproduce the REAL motherboard boot path headlessly: memoryReset() (fills
// bank $00 with 0xFF) + iigsInitInterrupts() + VBL/IRQ at frame rate.
// Goal: catch the Fatal System Error 0202 path (COP / fatal handler entry).
const OUT = path.join(__dirname, "..", "..", "gs_fatal_out.txt")

test("IIgs boot via motherboard path, catch fatal 0202", () => {
  doSetRom("APPLE2GS")
  memoryReset()
  // Wrap memSet24 to trace every write into $0300-$0320 (the OS entry
  // signature area $0310-$0313 / probe $0316) with the writing PC.
  const writes: string[] = []
  const e1writes: string[] = []
  const hxw = (v: number, n: number) => v.toString(16).padStart(n, "0")
  const wrappedSet = (addr: number, val: number) => {
    if (addr >= 0x0300 && addr <= 0x0320 && writes.length < 80) {
      writes.push(`set ${hxw(addr, 4)}=${hxw(val & 0xff, 2)} from ${hxw(cpu.PB, 2)}:${hxw(cpu.PC, 4)}`)
    }
    if (addr >= 0xE10360 && addr <= 0xE10380 && e1writes.length < 60) {
      e1writes.push(`set ${hxw(addr, 6)}=${hxw(val & 0xff, 2)} from ${hxw(cpu.PB, 2)}:${hxw(cpu.PC, 4)}`)
    }
    if (addr >= 0xE10080 && addr <= 0xE100FF && e1writes.length < 80) {
      e1writes.push(`set ${hxw(addr, 6)}=${hxw(val & 0xff, 2)} from ${hxw(cpu.PB, 2)}:${hxw(cpu.PC, 4)}`)
    }
    memSet24(addr, val)
  }
  const cpu = new CPU65816(memGet24, wrappedSet)
  cpu.reset()
  iigsInitInterrupts()

  const cops: string[] = []      // every COP instruction executed
  const brks: string[] = []      // every BRK executed
  const fwHits: string[] = []    // entries into $C071-$C07F firmware
  const tail: string[] = []
  const startup: string[] = []
  const probes: string[] = []
  const bankHits = new Map<string, number>()
  let cycles = 0
  let lastVblCycle = -1
  const N = 30000000

  for (let i = 0; i < N; i++) {
    // Frame-rate VBL: motherboard fires when (cycleCount % 17030) < 4550
    const framePos = cycles % 17030
    if (framePos < 4550 && lastVblCycle !== Math.floor(cycles / 17030)) {
      lastVblCycle = Math.floor(cycles / 17030)
      iigsSignalVbl()
      cpu.irq()
    }
    const pb = cpu.PB, pc = cpu.PC
    const opcode = memGet24((pb << 16) | pc)
    const hx = (v: number, n: number) => v.toString(16).padStart(n, "0")
    if (opcode === 0x02 && cops.length < 40) {
      const imm = memGet24(((pb << 16) | pc) + 1)
      cops.push(`@${i} cyc=${cycles} COP #${hx(imm, 2)} at ${hx(pb, 2)}:${hx(pc, 4)} A=${hx(cpu.A, 4)} X=${hx(cpu.X, 4)} Y=${hx(cpu.Y, 4)} D=${hx(cpu.D, 4)} DB=${hx(cpu.DB, 2)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
    }
    if (opcode === 0x00 && brks.length < 40) {
      brks.push(`@${i} cyc=${cycles} BRK at ${hx(pb, 2)}:${hx(pc, 4)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
    }
    if (pb === 0 && pc >= 0xc071 && pc <= 0xc07f && fwHits.length < 40) {
      fwHits.push(`@${i} cyc=${cycles} fw ${hx(pc, 4)} op=${hx(opcode, 2)} S=${hx(cpu.S, 4)}`)
    }
    if (pb === 0xff && pc === 0x7906 && probes.length < 40) {
      probes.push(`init-result A(errcode)=${hx(cpu.A, 2)} $7000=${hx(memGet24(0x007000), 2)} INTEN=${hx(iigsRegisters[0x41], 2)}`)
    }
    if (pb === 0xff && pc === 0x71bd && probes.length < 40) {
      probes.push(`sig-check $0310=${hx(memGet24(0x000310) | (memGet24(0x000311) << 8), 4)} expected=${hx(memGet24(0xff7350) | (memGet24(0xff7351) << 8), 4)} $0316=${hx(memGet24(0x000316), 2)}`)
    }
    if (pb === 0xff && pc === 0x740a && probes.length < 40) {
      let src = "e1-src dump @740a:"
      for (let a = 0xE10361; a <= 0xE10376; a++) src += ` ${hx(memGet24(a), 2)}`
      probes.push(src)
    }
    if (pb === 0xe1 && pc === 0x0084 && probes.length < 40) {
      probes.push(`AT e1:0084 S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
    }
    if (pb === 0xe1 && pc === 0x0080 && probes.length < 40) {
      probes.push(`AT e1:0080 S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)}`)
    }
    if (pb === 0xff && pc === 0x73f6 && probes.length < 40) {
      probes.push(`stub-entry $73f6 A=${hx(cpu.A, 4)} E1:0371=${hx(memGet24(0xE10371), 2)} E1:0372=${hx(memGet24(0xE10372), 2)} E1:0373=${hx(memGet24(0xE10373), 2)}`)
    }
    if (pb === 0xff && pc === 0x79e3 && probes.length < 40) {
      probes.push(`mgr-inc $7000=${hx(memGet24(0x007000), 2)}`)
    }
    if (pb === 0xff && pc === 0xb7ba && probes.length < 40) {
      probes.push(`irq-dispatch @b7ba E1:0014=${hx(memGet24(0xE10014),2)} ${hx(memGet24(0xE10015),2)} ${hx(memGet24(0xE10016),2)} ${hx(memGet24(0xE10017),2)} E1:0010=${hx(memGet24(0xE10010),2)} ${hx(memGet24(0xE10011),2)} ${hx(memGet24(0xE10012),2)} ${hx(memGet24(0xE10013),2)} P=${hx(cpu.P,2)}`)
    }
    if (pb === 0x00 && pc === 0xfffe && probes.length < 40) {
      probes.push(`irq-vector @00:fffe → ${hx(memGet24(0x00fffe),2)} ${hx(memGet24(0x00ffff),2)} P=${hx(cpu.P,2)}`)
    }
    if (i < 1500) startup.push(`${hx(pb, 2)}:${hx(pc, 4)} op=${hx(opcode, 2)} A=${hx(cpu.A, 4)} X=${hx(cpu.X, 4)} Y=${hx(cpu.Y, 4)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)} DB=${hx(cpu.DB, 2)}`)
    cpu.processInstruction()
    cycles += 4 // approximate; VBL cadence is what matters
    const key = `${hx(pb, 2)}:${(pc >> 12).toString(16)}`
    bankHits.set(key, (bankHits.get(key) || 0) + 1)
    tail.push(`${hx(pb, 2)}:${hx(pc, 4)} op=${hx(opcode, 2)} A=${hx(cpu.A, 4)} X=${hx(cpu.X, 4)} Y=${hx(cpu.Y, 4)} S=${hx(cpu.S, 4)} P=${hx(cpu.P, 2)} DB=${hx(cpu.DB, 2)}`)
    if (tail.length > 80) tail.shift()
  }

  const hot = [...bankHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  const lines: string[] = []
  lines.push(`cycles=${cycles}`)
  lines.push(`startup (${startup.length}):\n` + startup.join("\n"))
  lines.push(`probes (${probes.length}):\n` + probes.join("\n"))
  lines.push(`writes 0300-0320 (${writes.length}):\n` + writes.join("\n"))
  lines.push(`writes E10360-E10380 (${e1writes.length}):\n` + e1writes.join("\n"))
  lines.push(`COPs (${cops.length}):\n` + cops.join("\n"))
  lines.push(`BRKs (${brks.length}):\n` + brks.join("\n"))
  lines.push(`Firmware hits C071-C07F (${fwHits.length}):\n` + fwHits.join("\n"))
  lines.push("Hot spots:")
  for (const [k, v] of hot) lines.push(`  ${k} ${v}`)
  lines.push("Tail:\n" + tail.join("\n"))
  fs.writeFileSync(OUT, lines.join("\n"))
  expect(cops.length).toBe(0)
})
