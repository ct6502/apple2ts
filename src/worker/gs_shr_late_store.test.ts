import { captureShrBeamLine, getShrDisplayed, iigsAuxLinearToPhys, iigsRegisters, megaIIAux, memSet24, resetShrBeamFrame, setIigsCloudLayerFilename } from "./memory"
import { SWITCHES } from "./softswitches"

const resetShr = () => {
  megaIIAux.fill(0)
  iigsRegisters[0x29] = 0x80
  iigsRegisters[0x35] = 0
  SWITCHES.NEWVIDEO.isSet = true
  resetShrBeamFrame()
  setIigsCloudLayerFilename("")
}

test("a late nonzero SHR store over a non-zero captured byte still paints", () => {
  resetShr()

  // The beam captured this row with a non-zero background byte already there.
  megaIIAux[0x2000] = 0xaa
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0xaa)

  // A sprite pixel lands after the capture. It must replace the background
  // (the old code only painted when the destination byte was zero).
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x55)
})

test("a late zero SHR store erases the previous sprite pixel", () => {
  resetShr()

  megaIIAux[0x2000] = 0xaa
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0xaa)

  // A sprite erase lands after the capture. It has to clear the old pixel, or
  // the character trails behind its new position on the next frame.
  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0)
})

test("a late non-cloud layer store does not erase a captured TimePilot cloud", () => {
  resetShr()
  setIigsCloudLayerFilename("timepilot_gs_v1.6.po")

  // Palette entry 1 is TimePilot GS's cloud layer; the beam captured it.
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  // A late non-cloud pixel over that byte must not bring back the flicker.
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x01)

  // A late zero erasure is just as destructive to the captured cloud band.
  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0x01)
})

test("the cloud exception does not apply outside the cloud-layer game", () => {
  resetShr()
  setIigsCloudLayerFilename("MsPacMan.2mg")

  // The maze background happens to use the same palette nibble as TimePilot's
  // clouds. A sprite drawn after the beam still has to replace it, or the top
  // row of the character comes out half painted.
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  memSet24(0x012000, 0x33)
  expect(getShrDisplayed()[0]).toBe(0x33)

  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0)
})

test("the cloud exception does not apply to 640-mode pixels", () => {
  resetShr()
  setIigsCloudLayerFilename("timepilot_gs_v1.6.po")

  // Row 0's SCB bit 7 selects 640 mode, where the palette bytes are not the
  // 320-mode nibbles TimePilot's clouds use. SHR linearizes the aux window, so
  // the SCB is stored at its physical fold.
  megaIIAux[iigsAuxLinearToPhys(0x9d00)] = 0x80
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x55)

  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0)
})
