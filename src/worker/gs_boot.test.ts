import { doSetRom, memGet24, memSet24, iigsSignalVbl, iigsRegisters, iigsInitInterrupts } from "./memory"
import { CPU65816 } from "./cpu65816"
import * as fs from "fs"
import * as path from "path"

// Headless IIgs boot probe: run the 65816 for a long stretch and report
// where the OS ends up (sea-of-FF crash, unimplemented opcodes, hot spots).
// All diagnostics are written to gs_boot_out.txt (jest interleaves console
// lines with stack traces, making them unreadable).
const OUT = path.join(__dirname, "..", "..", "gs_boot_out.txt")

test("IIgs boot runs long without crashing", () => {
  doSetRom("APPLE2GS")
  const e1WritesAll: string[] = []
  const intWrites: string[] = []   // $C041 / $C047 INTEN writes (any bank)
  let steps = 0
  const e1IoWrites: string[] = []   // E0/E1 $C020-$C04F I/O writes
  const ptrWrites: string[] = []
  const wrappedSet = (addr: number, val: number) => {
    const bank = (addr >>> 16) & 0xff, off = addr & 0xffff
    if (bank === 0xe1 && off < 0x100 && e1WritesAll.length < 60) {
      e1WritesAll.push(`E1:${off.toString(16)}=${val.toString(16)}`)
    }
    // INTEN/CLRINT writes arrive as bank $E0/$E1:C041/C047 because the gate
    // runs with DB=$E1. Track them by register, not by bank.
    if (off === 0xc041 || off === 0xc047) {
      intWrites.push(`${bank.toString(16)}:${off.toString(16)}=${val.toString(16)} @${steps}`)
    }
    if ((bank === 0xe0 || bank === 0xe1) && off >= 0xc020 && off <= 0xc04f) {
      // Skip the clock chip traffic that saturates the cap early.
      if (off !== 0xc033 && off !== 0xc034 && e1IoWrites.length < 80) {
        e1IoWrites.push(`${bank.toString(16)}:${off.toString(16)}=${val.toString(16)} @${steps}`)
      }
    }
    if (bank === 0 && off >= 0x61a8 && off <= 0x61b4 && ptrWrites.length < 40) {
      ptrWrites.push(`$${off.toString(16)}=${val.toString(16)} @${steps}`)
    }
    memSet24(addr, val)
  }
  const cpu = new CPU65816(memGet24, wrappedSet)
  cpu.reset()
  iigsInitInterrupts()

  const unimplemented = new Map<number, number>()
  const bankHits = new Map<string, number>()
  const tail: string[] = []
  let ffRun = 0
  let seaOfFF = false
  let sawInstaller = false
  const gateTrace: string[] = []
  const clockRoutineHits: string[] = []   // ff:78a0-7927 clock/interrupt-init
  const dbChanges: string[] = []
  let lastDB = 0
  let inten = 0

  const N = 4000000
  for (let i = 0; i < N; i++) {
    steps = i
    // No motherboard in this harness: fake a VBL every ~50k instructions
    // and raise the CPU IRQ line (the VBL is a hardware interrupt).
    if (i % 50000 === 0) {
      iigsSignalVbl()
      cpu.irq()
    }
    const pb = cpu.PB, pc = cpu.PC
    const opcode = memGet24((pb << 16) | pc)
    if (pb === 0xff && pc === 0x854b) sawInstaller = true
    if (pb === 0xff && pc >= 0x8510 && pc <= 0x8575 && gateTrace.length < 200) {
      gateTrace.push(`${pc.toString(16)} op=${opcode.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} D=${cpu.D.toString(16)} DB=${cpu.DB.toString(16)} P=${cpu.P.toString(16)} S=${cpu.S.toString(16)} INTEN=${iigsRegisters[0x41].toString(16)}`)
    }
    if (pb === 0xff && pc >= 0x78a0 && pc <= 0x7927 && clockRoutineHits.length < 40) {
      clockRoutineHits.push(`${pc.toString(16)} op=${opcode.toString(16)} A=${cpu.A.toString(16)} INTEN=${iigsRegisters[0x41].toString(16)}`)
    }
    cpu.processInstruction()
    if (iigsRegisters[0x41] !== inten && intWrites.length < 40) {
      intWrites.push(`INTEN->${iigsRegisters[0x41].toString(16)} @${i}`)
      inten = iigsRegisters[0x41]
    }
    if (cpu.DB !== lastDB && dbChanges.length < 40) {
      dbChanges.push(`@${i} ${pb.toString(16)}:${pc.toString(16)} op=${opcode.toString(16)} DB ${lastDB.toString(16)}->${cpu.DB.toString(16)}`)
      lastDB = cpu.DB
    }

    if (opcode === 0xff) {
      ffRun++
      if (ffRun > 50) seaOfFF = true
    } else {
      ffRun = 0
    }

    const key = `${pb.toString(16).padStart(2, "0")}:${(pc >> 12).toString(16)}`
    bankHits.set(key, (bankHits.get(key) || 0) + 1)

    tail.push(`${pb.toString(16)}:${pc.toString(16)} op=${opcode.toString(16)} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} S=${cpu.S.toString(16)} P=${cpu.P.toString(16)}`)
    if (tail.length > 60) tail.shift()

    if (pb === 0x00 && pc < 0x200) break
    if (seaOfFF) break
  }

  const self = cpu as any
  if (self.unimplementedReported) {
    for (const op of self.unimplementedReported) unimplemented.set(op, 1)
  }

  const hot = [...bankHits.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12)
  const lines: string[] = []
  lines.push(`steps=${steps}`)
  lines.push(`sawInstaller=${sawInstaller} seaOfFF=${seaOfFF} unimplemented=[${[...unimplemented.keys()].map(o => o.toString(16)).join(",")}]`)
  lines.push("Hot spots (bank:page -> count):")
  for (const [k, v] of hot) lines.push(`  ${k} ${v}`)
  lines.push(`E1-low writes (${e1WritesAll.length}): ${e1WritesAll.join(" ")}`)
  lines.push(`INTEN/CLRINT writes (${intWrites.length}): ${intWrites.join(" ")}`)
  lines.push(`E1-bank IO writes C020-C04F (${e1IoWrites.length}): ${e1IoWrites.join(" ")}`)
  lines.push(`PTR writes 61a8-61b4 (${ptrWrites.length}): ${ptrWrites.join(" ")}`)
  lines.push(`Clock-routine hits (${clockRoutineHits.length}): ${clockRoutineHits.join(" ")}`)
  lines.push(`DB changes (${dbChanges.length}):\n` + dbChanges.join("\n"))
  lines.push(`Gate trace (ff:8510-8575, ${gateTrace.length}):\n` + gateTrace.join("\n"))
  lines.push("Tail:\n" + tail.join("\n"))
  fs.writeFileSync(OUT, lines.join("\n"))

  expect(seaOfFF).toBe(false)
  expect(steps).toBeGreaterThan(100000)
})
