import { doSetRom, memGet24, memSet24, memoryReset, getTextPageAsString } from "./memory"
import { CPU65816 } from "./cpu65816"

test("check text screen after 3,000,000 and 5,000,000 instructions", () => {
  doSetRom("APPLE2GS")
  memoryReset()
  
  const cpu = new CPU65816(memGet24, (addr, val) => memSet24(addr, val))
  cpu.reset()

  let lastScreen = ""
  for (let i = 0; i <= 2000000; i++) {
    cpu.processInstruction()
    if (i % 200000 === 0) {
      const scr = getTextPageAsString().trim()
      if (scr !== lastScreen) {
        lastScreen = scr
        console.log(`=== SCREEN AT ${i} (PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)}) ===`)
        console.log(scr)
      }
    }
  }
})
