import { doSetRom, memGet24, memSet24 } from "./memory"
import { CPU65816 } from "./cpu65816"

// Minimal repro: execute the gate's `sta $c026` at ff:8512 directly and see
// whether the setter callback fires at all.
test("STA abs $c026 at ff:8512 reaches the setter", () => {
  doSetRom("APPLE2GS")
  const writes: string[] = []
  const set = (addr: number, val: number) => {
    writes.push(`${addr.toString(16)}=${val.toString(16)}`)
    memSet24(addr, val)
  }
  const cpu = new CPU65816(memGet24, set)
  cpu.reset()
  const self = cpu as any
  self.PB = 0xff
  self.PC = 0x8512
  self.P = 0x24
  self.DB = 0
  self.A = 7
  console.log("opcode at 8512:", memGet24(0xff8512).toString(16), "operand:", memGet24(0xff8513).toString(16), memGet24(0xff8514).toString(16))
  cpu.processInstruction()
  console.log("writes:", JSON.stringify(writes), "PC now", cpu.PC.toString(16), "P", cpu.P.toString(16))
  expect(writes.length).toBe(1)
})
