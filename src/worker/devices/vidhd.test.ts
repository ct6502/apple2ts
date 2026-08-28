import { VidHD } from "./vidhd"
import { memGet, memSet } from "../memory"
import { doBoot, enableVidHD, disableVidHD } from "../motherboard"
import { setIsTesting } from "../worker2main"

describe("VidHD Expansion Card Emulation", () => {
  let card: VidHD

  beforeEach(() => {
    card = new VidHD(3)
  })

  test("ROM detection signatures at $C080+slot*16 ($C0B0-$C0B4) match official VidHD firmware", () => {
    expect(card.readIO(0xC0B0)).toBe(0x24) // BIT $EA
    expect(card.readIO(0xC0B1)).toBe(0xEA)
    expect(card.readIO(0xC0B2)).toBe(0x4C) // JMP $FF58
    expect(card.readIO(0xC0B3)).toBe(0x58)
    expect(card.readIO(0xC0B4)).toBe(0xFF)
  })

  test("$C029 NEWVIDEO softswitch activates and deactivates SHR mode", () => {
    card.enabled = true
    expect(card.active).toBe(false)

    // Write $80 to $C029 (Enable SHR)
    card.writeSoftSwitch(0x80)
    expect(card.readSoftSwitch()).toBe(0x80)
    expect(card.active).toBe(true)
    expect(card.isMonochrome).toBe(false)
    expect(card.isLinear).toBe(false)

    // Write $A0 ($80 | $20 = SHR + Monochrome)
    card.writeSoftSwitch(0xA0)
    expect(card.active).toBe(true)
    expect(card.isMonochrome).toBe(true)

    // Reset disables SHR
    card.reset()
    expect(card.active).toBe(false)
    expect(card.readSoftSwitch()).toBe(0x00)
  })

  test("decodes 320x200 SHR mode with 12-bit RGB palettes and SCBs", () => {
    const shrData = new Uint8Array(0x8000)

    // Setup Palette 0 ($9E00 in Aux RAM -> offset $7E00 in shrData)
    // Color 1: Red (0x0F00 -> Low byte = 0x00, High byte = 0x0F)
    shrData[0x7E00 + 2] = 0x00
    shrData[0x7E00 + 3] = 0x0F

    // Setup SCB for line 0 ($9D00 -> offset $7D00): Mode 320 (bit 7 = 0), Palette 0 (bits 0-3 = 0)
    shrData[0x7D00] = 0x00

    // Setup Line 0 pixel data: Byte 0 has pixel 0 = Color 1, pixel 1 = Color 0 (0x10)
    shrData[0] = 0x10

    const rgba = new Uint8ClampedArray(560 * 384 * 4)
    card.decodeShrTo560x384(shrData, rgba)

    // Check that decoded RGBA has red pixel (R=255, G=0, B=0, A=255) in top-left
    expect(rgba[0]).toBe(255) // R
    expect(rgba[1]).toBe(0)   // G
    expect(rgba[2]).toBe(0)   // B
    expect(rgba[3]).toBe(255) // Alpha
  })

  test("decodes 640x200 SHR mode with 2bpp dithered colors", () => {
    const shrData = new Uint8Array(0x8000)

    // Setup Palette 2 ($9E00 + 2*32 -> offset $7E00 + 64)
    // Color 1: Green (0x00F0 -> Low byte = 0xF0, High byte = 0x00)
    shrData[0x7E00 + 64 + 2] = 0xF0
    shrData[0x7E00 + 64 + 3] = 0x00

    // Setup SCB for line 0: Mode 640 (bit 7 = 1), Palette 2 (bits 0-3 = 2) -> 0x82
    shrData[0x7D00] = 0x82

    // Setup Line 0 pixel data: 4 pixels of 2-bit each.
    // Pixel 0 (bits 7-6 = 01 -> Color 1): for pixelX=0, colorIndex = (0%4)*4 + 1 = 1 (Color 1 of Palette 2)
    shrData[0] = 0x40 // 01 00 00 00

    const rgba = new Uint8ClampedArray(560 * 384 * 4)
    card.decodeShrTo560x384(shrData, rgba)

    // Check that decoded RGBA has green pixel (R=0, G=255, B=0, A=255) in top-left
    expect(rgba[0]).toBe(0)   // R
    expect(rgba[1]).toBe(255) // G
    expect(rgba[2]).toBe(0)   // B
    expect(rgba[3]).toBe(255) // Alpha
  })

  test("Memory read and write integration with slot 3", () => {
    setIsTesting()
    doBoot()
    enableVidHD(3)

    // With SLOTC3ROM OFF ($C00A, default): reads genuine internal 80-col ROM ($C300 = $2C BIT $CE43)
    memSet(0xC00A, 0) // CLRC3ROM
    expect(memGet(0xC300, false)).toBe(0x2C)

    // With SETC3ROM ON ($C00B, Total Replay HasVidHDCard routine): reads VidHD card ROM signatures
    memSet(0xC00B, 0) // SETC3ROM
    expect(memGet(0xC300, false)).toBe(0x24) // BIT $EA
    expect(memGet(0xC301, false)).toBe(0xEA)
    expect(memGet(0xC302, false)).toBe(0x4C) // JMP $FF58

    // Read Slot 3 Device I/O signature ($C0B0-$C0B2)
    expect(memGet(0xC0B0, false)).toBe(0x24)
    expect(memGet(0xC0B1, false)).toBe(0xEA)
    expect(memGet(0xC0B2, false)).toBe(0x4C)

    // Write to $C029 softswitch
    memSet(0xC029, 0x80)
    expect(memGet(0xC029, false)).toBe(0x80)

    disableVidHD()
  })
})
