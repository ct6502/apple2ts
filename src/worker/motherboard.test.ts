import { processInstruction } from "./cpu6502"
import { memory, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"

// Make sure we don't accidentally leave debug mode on.
test("debugMode", () => {
  expect(TEST_DEBUG).toEqual(false)
  expect(TEST_GRAPHICS).toEqual(false)
})

test("processInstruction", () => {
  const pcode = parseAssembly(0x2000, [" LDA #$C0"])
  memory.set(pcode, 0x2000)
  updateAddressTables()
  setPC(0x2000)
  processInstruction()
  expect(s6502.PC).toEqual(0x2002)
  expect(s6502.Accum).toEqual(0xC0)
})
