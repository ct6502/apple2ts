import { captureShrBeamLine, getShrDisplayed, iigsAuxLinearToPhys, iigsRegisters, megaIIAux, memSet24, resetShrBeamFrame } from "./memory"
import { SWITCHES } from "./softswitches"

test("a late nonzero SHR store over a non-zero captured byte still paints", () => {
  megaIIAux.fill(0)
  iigsRegisters[0x29] = 0x80
  iigsRegisters[0x35] = 0
  SWITCHES.NEWVIDEO.isSet = true
  resetShrBeamFrame()

  // The beam captured this row with a non-zero background byte already there.
  megaIIAux[0x2000] = 0xaa
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0xaa)

  // A sprite pixel lands after the capture. It must replace the background
  // (the old code only painted when the destination byte was zero).
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x55)
})

test("a late non-cloud layer store does not erase a captured TimePilot cloud", () => {
  megaIIAux.fill(0)
  iigsRegisters[0x29] = 0x80
  iigsRegisters[0x35] = 0
  SWITCHES.NEWVIDEO.isSet = true
  resetShrBeamFrame()

  // Palette entry 1 is TimePilot GS's cloud layer; the beam captured it.
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  // A late non-cloud pixel over that byte must not bring back the flicker.
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x01)
})

test("the cloud exception does not apply to 640-mode pixels", () => {
  megaIIAux.fill(0)
  iigsRegisters[0x29] = 0x80
  iigsRegisters[0x35] = 0
  SWITCHES.NEWVIDEO.isSet = true
  resetShrBeamFrame()

  // Row 0's SCB bit 7 selects 640 mode, where the palette bytes are not the
  // 320-mode nibbles TimePilot's clouds use. SHR linearizes the aux window, so
  // the SCB is stored at its physical fold.
  megaIIAux[iigsAuxLinearToPhys(0x9d00)] = 0x80
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x55)
})
