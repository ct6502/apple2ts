import { doSetRom, memGet24, memSet24, iigsSignalVbl } from "./memory"
import { CPU65816 } from "./cpu65816"
import * as fs from "fs"
import * as path from "path"

const OUT = path.join(__dirname, "..", "..", "gs_calltrace.txt")

// Trace the boot call chain PROPERLY: at each JSR/JSL/JML, read the operand
// (the real target) and log it. This shows where the interrupt manager install
// (ff:78 region) SHOULD be reached and where the boot actually goes.
test("boot call chain", () => {
  doSetRom("APPLE2GS")
  const cpu = new CPU65816(memGet24, memSet24)
  cpu.reset()

  const lines: string[] = []
  const N = 150000
  for (let i = 0; i < N; i++) {
    if (i % 50000 === 0) iigsSignalVbl()
    const pb = cpu.PB, pc = cpu.PC
    const opcode = memGet24((pb << 16) | pc)
    if (pb === 0xff) {
      const hx = (v: number) => v.toString(16).padStart(4, "0")
      let ev = ""
      if (opcode === 0x20) ev = `JSR -> ff:${hx(memGet24((pb << 16) | ((pc + 1) & 0xffff)) | (memGet24((pb << 16) | ((pc + 2) & 0xffff)) << 8))}`
      else if (opcode === 0x22) {
        const lo = memGet24((pb << 16) | ((pc + 1) & 0xffff)) | (memGet24((pb << 16) | ((pc + 2) & 0xffff)) << 8)
        const bank = memGet24((pb << 16) | ((pc + 3) & 0xffff))
        ev = `JSL -> ${bank.toString(16).padStart(2, "0")}:${hx(lo)}`
      } else if (opcode === 0x5c) {
        const lo = memGet24((pb << 16) | ((pc + 1) & 0xffff)) | (memGet24((pb << 16) | ((pc + 2) & 0xffff)) << 8)
        const bank = memGet24((pb << 16) | ((pc + 3) & 0xffff))
        ev = `JML -> ${bank.toString(16).padStart(2, "0")}:${hx(lo)}`
      } else if (opcode === 0x60) ev = `RTS  ff:${hx(pc)}`
      else if (opcode === 0x6b) ev = `RTL  ff:${hx(pc)}`
      if (ev && lines.length < 6000) {
        lines.push(`@${i} ${ev}`)
      }
    }
    cpu.processInstruction()
    if (i > 60000) break
  }
  fs.writeFileSync(OUT, lines.join("\n"))
  expect(true).toBe(true)
})
