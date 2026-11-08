import { beginShrFrame, captureShrBeamLine, getShrDisplayed, iigsAuxLinearToPhys, iigsRegisters, megaIIAux, memSet24, resetShrBeamFrame, setIigsCloudLayerFilename } from "./memory"
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

test("a late nonzero sprite paints over a captured TimePilot cloud", () => {
  resetShr()
  setIigsCloudLayerFilename("timepilot_gs_v1.6.po")

  // Palette entry 1 is TimePilot GS's cloud layer; the beam captured it.
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  // A late plane pixel over that byte is opaque and has to replace it.
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0x55)

  // A later erase lands on the plane pixel the display already holds, not on
  // the cloud byte underneath it, so it clears like any sprite erase.
  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0)
})

test("a store before beam line 0 is not late after the refresh boundary reset", () => {
  resetShr()

  megaIIAux[0x2000] = 0xaa
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0xaa)

  // The refresh boundary is before VBL, and the guest writes the next frame's
  // picture during VBL before the beam reaches line 0. Clearing the old frame's
  // captured rows there keeps that store early, so the next capture picks it up
  // instead of folding it as a late draw.
  beginShrFrame()
  memSet24(0x012000, 0x55)
  expect(getShrDisplayed()[0]).toBe(0xaa)

  captureShrBeamLine(1)
  expect(getShrDisplayed()[0]).toBe(0xaa)
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x55)
})

test("a late zero over an untouched TimePilot cloud is the cloud erase", () => {
  resetShr()
  setIigsCloudLayerFilename("timepilot_gs_v1.6.po")

  // Palette entry 1 is TimePilot GS's cloud layer; the beam captured it. The
  // cloud layer itself erases behind the beam with a zero, which must not wipe
  // the band the beam already captured.
  megaIIAux[0x2000] = 0x01
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)

  memSet24(0x012000, 0)
  expect(getShrDisplayed()[0]).toBe(0x01)
})

test("a late opaque mask preserves a captured TimePilot cloud but clears a plane pixel", () => {
  resetShr()
  setIigsCloudLayerFilename("timepilot_gs_v1.6.po")

  // The mask pass runs behind the beam with opaque background bytes (0xFF).
  // On a cloud byte it must not wipe the band the beam already captured.
  megaIIAux[iigsAuxLinearToPhys(0x2000)] = 0x01
  megaIIAux[iigsAuxLinearToPhys(0x2001)] = 0x55
  captureShrBeamLine(0)
  expect(getShrDisplayed()[0]).toBe(0x01)
  expect(getShrDisplayed()[1]).toBe(0x55)
  memSet24(0x012000, 0xff)
  expect(getShrDisplayed()[0]).toBe(0x01)

  // The same mask byte over an old plane pixel is the sprite erase and has to
  // replace it, or the previous frame's aircraft body trails behind the new one.
  memSet24(0x012001, 0xff)
  expect(getShrDisplayed()[0]).toBe(0x01)
  expect(getShrDisplayed()[1]).toBe(0xff)

  // Its coloured redraw still paints over the captured cloud.
  memSet24(0x012000, 0x66)
  expect(getShrDisplayed()[0]).toBe(0x66)
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

test("the cloud exception ignores late zero erasures in 640-mode pixels", () => {
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
