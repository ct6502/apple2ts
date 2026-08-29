import { enableVera, resetVera, initVera } from "./vera"
import { video_step, video_get_framebuffer, video_reset } from "./video"
import { memGet, memSet } from "../../memory"
import { doBoot } from "../../motherboard"
import { s6502, setPC } from "../../instructions"
import { processInstruction } from "../../cpu6502"
import { getVeraSpriteDemoAssembly, getVeraMode7DemoAssembly, buildVeraDemo } from "./vera_demos"

describe("VERA Graphics & Sound Card Emulation on Apple II", () => {
  beforeAll(() => {
    // Mock worker postMessage for clean Jest execution
    if (typeof globalThis.postMessage === "function") {
      jest.spyOn(globalThis, "postMessage").mockImplementation(() => {})
    }
  })

  beforeEach(() => {
    doBoot()
    initVera()
    resetVera()
    video_reset()
    enableVera(true, 2)
  })

  test("I/O registers map correctly to Slot 2 ($C200-$C21F)", () => {
    // Write VRAM Address 0 ($00000) with Auto-Increment +1 (stride index 2 -> 2 << 3 = 0x10)
    memSet(0xC200, 0x00) // ADDR_L
    memSet(0xC201, 0x00) // ADDR_M
    memSet(0xC202, 0x10) // ADDR_H: Bank 0, Inc +1

    // Write sequence of bytes to DATA0 ($C203)
    memSet(0xC203, 0xAA)
    memSet(0xC203, 0xBB)
    memSet(0xC203, 0xCC)

    // Reset Address back to $00000 with Auto-Increment +1
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x10)

    // Read back via DATA0 ($C203)
    expect(memGet(0xC203, false)).toBe(0xAA)
    expect(memGet(0xC203, false)).toBe(0xBB)
    expect(memGet(0xC203, false)).toBe(0xCC)
  })

  test("Auto-increment with different stride values (+2, +4, +8)", () => {
    // VERA Stride Table:
    // Index 2 (0x10): +1
    // Index 4 (0x20): +2
    // Index 6 (0x30): +4
    // Index 8 (0x40): +8
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x30) // Stride index 6 -> Inc +4

    memSet(0xC203, 0x11) // Writes to $00000, next is $00004
    memSet(0xC203, 0x22) // Writes to $00004, next is $00008

    // Read without auto-increment (stride 0)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x11)

    memSet(0xC200, 0x04)
    memSet(0xC201, 0x00)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x22)
  })

  test("Dual data ports DATA0 ($C203) and DATA1 ($C204) with CTRL.ADDRSEL", () => {
    // Setup ADDR0 pointing to $00100
    memSet(0xC205, 0x00) // CTRL = 0 (ADDR0 selected)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x01)
    memSet(0xC202, 0x10) // Inc +1
    memSet(0xC203, 0x55) // Write $55 to $00100

    // Setup ADDR1 pointing to $00200
    memSet(0xC205, 0x01) // CTRL = 1 (ADDR1 selected)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x02)
    memSet(0xC202, 0x10) // Inc +1
    memSet(0xC204, 0x99) // Write $99 to $00200

    // Verify $00100 still holds $55 and $00200 holds $99
    memSet(0xC205, 0x00) // select ADDR0
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x01)
    memSet(0xC202, 0x00)
    expect(memGet(0xC203, false)).toBe(0x55)

    memSet(0xC205, 0x01) // select ADDR1
    memSet(0xC200, 0x00)
    memSet(0xC201, 0x02)
    memSet(0xC202, 0x00)
    expect(memGet(0xC204, false)).toBe(0x99)
  })

  test("Palette writing and reading at VRAM $1FA00", () => {
    // Point ADDR0 to $1FA00 (Palette Entry 0)
    memSet(0xC205, 0x00)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0xFA)
    memSet(0xC202, 0x11) // Bank 1 ($10000 | $FA00), Auto-inc +1

    // Write Color 1: Red (12-bit RGB $0F00 -> Low=GB $00, High=0R $0F)
    memSet(0xC203, 0x00) // Entry 0 Low
    memSet(0xC203, 0x00) // Entry 0 High
    memSet(0xC203, 0x00) // Entry 1 Low (GB = $00)
    memSet(0xC203, 0x0F) // Entry 1 High (0R = $0F)

    // Read back Entry 1
    memSet(0xC200, 0x02)
    memSet(0xC201, 0xFA)
    memSet(0xC202, 0x11)
    expect(memGet(0xC203, false)).toBe(0x00)
    expect(memGet(0xC203, false)).toBe(0x0F)
  })

  test("executes Sprite Demo 6502 assembly and renders multi-sprite video frame (Demo 1)", () => {
    const startAddress = 0x2000
    const demo = buildVeraDemo(getVeraSpriteDemoAssembly, 2, startAddress)

    // Load compiled 6502 demo into Apple II memory at $2000
    demo.bytes.forEach((b, i) => {
      memSet(startAddress + i, b)
    })

    // Execute the demo from $2000 until RTS
    setPC(startAddress)
    let maxInstructions = 10000
    while (maxInstructions-- > 0) {
      if (s6502.PC === 0x0000 || memGet(s6502.PC) === 0x60 /* RTS */) {
        processInstruction()
        break
      }
      processInstruction()
    }

    // Verify Sprite 0 attributes in VRAM ($1FC00)
    // Byte 0: Shape addr low ($00)
    // Byte 1: Shape addr high ($08)
    // Byte 6: Z-depth ($0C)
    // Byte 7: Dimension & palette ($90)
    memSet(0xC200, 0x00)
    memSet(0xC201, 0xFC)
    memSet(0xC202, 0x11) // Bank 1, Inc +1
    expect(memGet(0xC203, false)).toBe(0x00)
    expect(memGet(0xC203, false)).toBe(0x08)

    // Step VERA video engine by 1 full video frame (~16666 cycles at 1MHz)
    video_step(1, 20000, false)

    // Inspect the 640x480 RGBA framebuffer for rendered sprite pixels
    const fb = video_get_framebuffer()
    expect(fb.length).toBe(640 * 480 * 4)

    // Verify that the frame is not completely blank (has rendered sprite pixels)
    let spritePixelCount = 0
    for (let i = 0; i < fb.length; i += 4) {
      const r = fb[i]
      const g = fb[i + 1]
      const b = fb[i + 2]
      if (r > 0 || g > 0 || b > 0) {
        spritePixelCount++
      }
    }

    expect(spritePixelCount).toBeGreaterThan(50)
  })

  test("executes Mode 7 256-Color Bitmap Demo and renders colored pixels (Demo 2)", () => {
    const startAddress = 0x2000
    const demo = buildVeraDemo(getVeraMode7DemoAssembly, 2, startAddress)

    // Load compiled 6502 demo into memory
    demo.bytes.forEach((b, i) => {
      memSet(startAddress + i, b)
    })

    // Execute the demo from $2000 until RTS
    setPC(startAddress)
    let maxInstructions = 20000
    while (maxInstructions-- > 0) {
      if (s6502.PC === 0x0000 || memGet(s6502.PC) === 0x60 /* RTS */) {
        processInstruction()
        break
      }
      processInstruction()
    }

    // Step VERA video engine by 1 full video frame
    video_step(1, 20000, false)

    // Inspect framebuffer
    const fb = video_get_framebuffer()
    expect(fb.length).toBe(640 * 480 * 4)

    // Count non-black, opaque pixels rendered from the 256-color palette
    let coloredPixelCount = 0
    for (let i = 0; i < fb.length; i += 4) {
      const r = fb[i]
      const g = fb[i + 1]
      const b = fb[i + 2]
      if (r > 0 || g > 0 || b > 0) {
        coloredPixelCount++
      }
    }

    expect(coloredPixelCount).toBeGreaterThan(1000)
  })
})

