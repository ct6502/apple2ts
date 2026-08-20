import { VideoTerm } from "./videoterm"

describe("Videx VideoTerm 80-Column Display Card", () => {
  let card: VideoTerm

  beforeEach(() => {
    card = new VideoTerm(3)
    card.reset()
    card.enabled = true
  })

  test("initializes with default MC6845 CRTC 80x24 registers", () => {
    expect(card.crtcRegs[0]).toBe(0x7B) // Horizontal Total (123)
    expect(card.crtcRegs[1]).toBe(0x50) // Displayed Columns (80)
    expect(card.crtcRegs[6]).toBe(24)   // Displayed Rows (24)
    expect(card.cursorCol).toBe(0)
    expect(card.cursorRow).toBe(0)
  })

  test("handles printable character output and updates VRAM", () => {
    // Output 'A' (0x41)
    card.handleCharOutput(0x41)
    expect(card.cursorCol).toBe(1)
    expect(card.cursorRow).toBe(0)
    expect(card.vram[0]).toBe(0x41 | 0x80) // Normal Apple II ASCII character ($C1)

    // Output 'B'
    card.handleCharOutput(0x42)
    expect(card.cursorCol).toBe(2)
    expect(card.vram[1]).toBe(0x42 | 0x80)
  })

  test("handles Carriage Return (CR) and Line Feed (LF)", () => {
    card.handleCharOutput(0x41) // 'A'
    card.handleCharOutput(0x0D) // CR
    expect(card.cursorCol).toBe(0)
    expect(card.cursorRow).toBe(1)

    card.handleCharOutput(0x0A) // LF
    expect(card.cursorCol).toBe(0)
    expect(card.cursorRow).toBe(2)
  })

  test("handles Backspace (BS)", () => {
    card.handleCharOutput(0x41) // 'A' at col 0, cursor now at col 1
    expect(card.cursorCol).toBe(1)
    card.handleCharOutput(0x08) // BS
    expect(card.cursorCol).toBe(0)
    card.handleCharOutput(0x08) // BS when col is 0 does not underflow
    expect(card.cursorCol).toBe(0)
  })

  test("handles Clear Screen (FF / Ctrl-L)", () => {
    card.handleCharOutput(0x41)
    card.handleCharOutput(0x0A)
    expect(card.cursorRow).toBe(1)

    card.handleCharOutput(0x0C) // Form Feed (Clear Screen)
    expect(card.cursorCol).toBe(0)
    expect(card.cursorRow).toBe(0)
    expect(card.vram[0]).toBe(0xA0) // space
  })

  test("handles screen scrolling when reaching 24 rows", () => {
    card.cursorRow = 23
    card.cursorCol = 0
    card.vram[0] = 0xC1 // 'A' on line 0
    card.vram[80] = 0xC2 // 'B' on line 1

    card.handleCharOutput(0x0A) // LF triggers scroll
    expect(card.cursorRow).toBe(23)
    expect(card.vram[0]).toBe(0xC2) // 'B' moved up to line 0
  })

  test("MC6845 I/O port address and data access ($C0B0, $C0B1)", () => {
    // Select Register 15 (Cursor Low)
    card.writeIO(0xC0B0, 15)
    expect(card.readIO(0xC0B0)).toBe(15)

    // Write 42 to Register 15
    card.writeIO(0xC0B1, 42)
    expect(card.readIO(0xC0B1)).toBe(42)
    expect(card.cursorCol).toBe(42)
  })

  test("VRAM Bank switching through $C0B4-$C0B7 and $CC00-$CDFF window", () => {
    // Select Bank 1 via $C0B5
    card.writeIO(0xC0B5, 0)
    expect(card.vramBank).toBe(1)

    // Write to $CC00 in Bank 1 (maps to VRAM offset 512)
    card.writeMemory(0xCC00, 0x55)
    expect(card.readMemory(0xCC00)).toBe(0x55)
    expect(card.vram[512]).toBe(0x55)

    // Switch to Bank 0 via $C0B0
    card.writeIO(0xC0B0, 0)
    expect(card.vramBank).toBe(0)
    expect(card.readMemory(0xCC00)).not.toBe(0x55) // Bank 0 offset 0 is different
  })

  test("Slot 3 ROM read at $C300 and $C800 expansion ROM matches Videx 2.4 firmware", () => {
    // $C300 Slot 3 ROM entry
    expect(card.readMemory(0xC300)).toBe(0x2C) // BIT $FFCB
    // Card Cat / CP/M signature bytes
    expect(card.readMemory(0xC30B)).toBe(0x01)
    expect(card.readMemory(0xC30C)).toBe(0x82)

    // $C800 Expansion ROM entry
    expect(card.readMemory(0xC800)).toBe(0xAD) // LDA $077B instruction in official firmware
  })

  test("getTextPage returns 1920 bytes for 80x24 display", () => {
    card.handleCharOutput(0x48) // 'H'
    card.handleCharOutput(0x49) // 'I'
    const page = card.getTextPage()
    expect(page.length).toBe(1920)
    expect(page[0]).toBe(0x48 | 0x80)
    expect(page[1]).toBe(0x49 | 0x80)
  })
})
