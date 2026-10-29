import { doBoot } from "../../motherboard"
import { enableVera, setVeraFmEnabled } from "./vera"
import { memGet, memSet } from "../../memory"
import { setPC, s6502 } from "../../instructions"
import { processInstruction } from "../../cpu6502"
test("executes veratest FM presence probe", () => {
  jest.spyOn(self, "postMessage").mockImplementation(() => {})
  setVeraFmEnabled(true)
  doBoot()
  enableVera(true, 2)
  const bytes = [169,0,141,255,2,162,0,160,0,173,161,192,41,124,208,54,173,161,192,16,7,202,208,241,136,208,238,96,169,20,141,160,192,169,48,141,161,192,173,161,192,201,128,208,25,162,0,160,0,173,161,192,240,11,201,128,208,12,202,208,244,136,208,241,96,169,1,141,255,2,96]
  bytes.forEach((b, i) => memSet(0x2000 + i, b))
  setPC(0x2000)
  for (let i = 0; i < 10000; i++) {
    if (memGet(s6502.PC, false) === 0x60) break
    processInstruction()
  }
  expect(memGet(0x2ff, false)).toBe(1)
})



test("disabled FM does not answer the presence probe", () => {
  enableVera(true, 2)
  setVeraFmEnabled(false)
  memSet(0xC0A0, 0x14)
  memSet(0xC0A1, 0x30)
  expect(memGet(0xC0A1, false)).toBe(0xff)
  setVeraFmEnabled(true)
  expect(memGet(0xC0A1, false)).toBe(0)
  jest.restoreAllMocks()
})
