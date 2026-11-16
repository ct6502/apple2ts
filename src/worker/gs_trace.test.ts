import { doSetRom, memGet24, memSet24 } from "./memory"
import { CPU65816 } from "./cpu65816"

// Trace the first N instructions from reset so we can see where the boot
// path diverges into the zero-E1-RAM BRK storm.
test("trace first instructions from reset", () => {
  doSetRom("APPLE2GS")
  const cpu = new CPU65816(memGet24, memSet24)
  cpu.reset()

  const N = 260
  const lines: string[] = []
  for (let i = 0; i < N; i++) {
    const pb = cpu.PB, pc = cpu.PC
    const opcode = memGet24((pb << 16) | pc)
    lines.push(
      `${i.toString().padStart(3)} ${pb.toString(16).padStart(2, "0")}:${pc.toString(16).padStart(4, "0")} op=${opcode.toString(16).padStart(2, "0")} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)} D=${cpu.D.toString(16)} DB=${cpu.DB.toString(16)} PB=${cpu.PB.toString(16)} S=${cpu.S.toString(16)} P=${cpu.P.toString(16)}`
    )
    if (pb === 0x00 && pc < 0x200) break
    cpu.processInstruction()
  }
  console.log(lines.join("\n"))
  expect(true).toBe(true)
})
