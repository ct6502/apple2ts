import { setSlotDriver, setSlotIOCallback } from "../memory"
import { videx24Rom } from "../roms/slot_videx_cx00"

export class VideoTerm {
  enabled = false
  slot = 3
  active = false

  // 2048 bytes of on-board static Video RAM (80 x 24 = 1920 text display + scratchpad)
  vram = new Uint8Array(2048)

  // Current VRAM bank (0..3, each bank is 512 bytes mapped to $CC00-$CDFF)
  vramBank = 0

  // MC6845 CRT Controller registers (0..17)
  crtcAddress = 0
  crtcRegs = new Uint8Array(18)

  // Cursor and terminal state
  cursorCol = 0
  cursorRow = 0
  inverse = false

  // 2048 bytes on-board firmware ROM ($C300 slot ROM + $C800-$CBFF driver)
  rom = new Uint8Array(2048)

  constructor(slot = 3) {
    this.slot = slot
    this.initRom()
    this.reset()
  }

  reset(): void {
    this.active = false
    this.vram.fill(0xA0) // fill with spaces ($A0 in Apple II)
    this.vramBank = 0
    this.crtcAddress = 0
    this.crtcRegs.fill(0)
    // MC6845 default values for 80x24 text
    this.crtcRegs[0] = 0x7B // Horizontal Total (123)
    this.crtcRegs[1] = 0x50 // Horizontal Displayed (80 columns)
    this.crtcRegs[2] = 0x62 // Horizontal Sync Position
    this.crtcRegs[3] = 0x29 // Sync Width
    this.crtcRegs[4] = 0x1B // Vertical Total
    this.crtcRegs[5] = 0x08 // Vertical Total Adjust
    this.crtcRegs[6] = 0x18 // Vertical Displayed (24 rows)
    this.crtcRegs[7] = 0x19 // Vertical Sync Position
    this.crtcRegs[9] = 0x08 // Max Scan Line Address (9 scan lines per char)
    this.crtcRegs[10] = 0xC0 // Cursor Start Line (Blink)
    this.crtcRegs[11] = 0x08 // Cursor End Line
    this.crtcRegs[14] = 0  // Cursor Address High
    this.crtcRegs[15] = 0  // Cursor Address Low
    this.cursorCol = 0
    this.cursorRow = 0
    this.inverse = false
  }

  /**
   * Initializes the on-board 6502 firmware ROM using the genuine Videx VideoTerm 2.4 ROM.
   * - Offset $300-$3FF: Slot 3 ROM ($C300-$C3FF) with card identification signatures ($C30B=0x01, $C30C=0x82)
   * - Offset $000-$3FF: Expansion ROM ($C800-$CBFF)
   */
  private initRom(): void {
    this.rom.fill(0xEA) // Fill with NOPs
    this.rom.set(videx24Rom) // 1024 bytes (0x000-0x3FF)
  }

  getDriver(): Uint8Array {
    const driver = new Uint8Array(256)
    driver.set(this.rom.subarray(0x300, 0x400))
    return driver
  }

  // --- I/O Access Handlers ($C0B0 - $C0BF in Slot 3) ---

  readIO(addr: number): number {
    // Only respond to Slot 3 I/O space ($C0B0-$C0BF)
    // $C300-$C3FF ROM reads also go through checkSlotIO; we must ignore those.
    if (addr < 0xC0B0 || addr > 0xC0BF) return 0x00

    const reg = addr & 0x0f
    // In Videx hardware: bits 2..3 select the 512-byte VRAM bank (0..3)
    this.vramBank = (reg >> 2) & 3

    if (reg === 0x00) {
      // Read CRTC Address Register
      return this.crtcAddress
    } else if (reg === 0x01) {
      // Read CRTC Data Register
      return this.crtcRegs[this.crtcAddress] || 0
    }
    return 0x00
  }

  writeIO(addr: number, val: number): void {
    const reg = addr & 0x0f
    this.active = true

    // In Videx hardware: bits 2..3 select the 512-byte VRAM bank (0..3)
    this.vramBank = (reg >> 2) & 3

    if (reg === 0x00) {
      // Set CRTC Address Register (0..17)
      this.crtcAddress = val & 0x1f
    } else if (reg === 0x01) {
      // Write CRTC Data Register
      if (this.crtcAddress < 18) {
        this.crtcRegs[this.crtcAddress] = val
      }
      if (this.crtcAddress === 14) {
        // Cursor High
        const low = this.crtcRegs[15]
        const pos = ((val & 0x07) << 8) | low
        this.cursorRow = Math.min(23, Math.floor(pos / 80))
        this.cursorCol = Math.min(79, pos % 80)
      } else if (this.crtcAddress === 15) {
        // Cursor Low
        const high = this.crtcRegs[14]
        const pos = ((high & 0x07) << 8) | val
        this.cursorRow = Math.min(23, Math.floor(pos / 80))
        this.cursorCol = Math.min(79, pos % 80)
      }
    } else if (reg === 0x02) {
      // Character output port ($C0B2)
      this.handleCharOutput(val)
    }
  }

  // --- Memory Space Access ($C300-$C3FF and $C800-$CFFF) ---

  readMemory(addr: number): number {
    if (addr >= 0xc300 && addr <= 0xc3ff) {
      // Return slot ROM bytes. Do NOT set active here: the Apple II ROM boot
      // scan reads $C301 etc to detect cards; we must not prematurely switch
      // the display to Videx VRAM before PR#3 / our init routine has run.
      return this.rom[addr - 0xc000] // $C300 -> offset $300 in ROM
    }

    if (addr >= 0xc800 && addr <= 0xcbff) {
      return this.rom[addr - 0xc800] // $C800-$CBFF -> offset $000-$3FF in ROM
    }

    if (addr >= 0xcc00 && addr <= 0xcdff) {
      // 512-byte banked VRAM window
      const vramOffset = (this.vramBank * 512) + (addr - 0xcc00)
      return this.vram[vramOffset & 0x7ff]
    }

    if (addr >= 0xce00 && addr <= 0xcfff) {
      // Access to $CE00-$CFFF turns off expansion ROM
      return 0x00
    }

    return 0x00
  }

  writeMemory(addr: number, val: number): void {
    if (addr >= 0xcc00 && addr <= 0xcdff) {
      // Write to 512-byte banked VRAM window
      this.active = true
      const vramOffset = (this.vramBank * 512) + (addr - 0xcc00)
      this.vram[vramOffset & 0x7ff] = val & 0xff
    }
  }

  /**
   * Terminal / Character Output handling for 80-column text stream.
   */
  handleCharOutput(ch: number): void {
    this.active = true
    const ascii = ch & 0x7f

    if (ascii === 0x0d || ascii === 0x8d) {
      // Carriage Return (CR) in Apple II advances to column 0 on the next line
      this.cursorCol = 0
      this.cursorRow++
      if (this.cursorRow >= 24) {
        this.scrollUp()
        this.cursorRow = 23
      }
    } else if (ascii === 0x0a || ascii === 0x8a) {
      // Line Feed (LF)
      this.cursorRow++
      if (this.cursorRow >= 24) {
        this.scrollUp()
        this.cursorRow = 23
      }
    } else if (ascii === 0x08 || ascii === 0x88) {
      // Backspace (BS)
      if (this.cursorCol > 0) this.cursorCol--
    } else if (ascii === 0x0c || ascii === 0x8c || ascii === 0x1a || ascii === 0x9a) {
      // Clear Screen (FF / Ctrl-Z)
      this.clearScreen()
    } else if (ascii >= 0x20 && ascii <= 0x7e) {
      // Printable ASCII character
      const offset = (this.cursorRow * 80) + this.cursorCol
      if (offset < 1920) {
        // In Apple II text page, $A0..$FF is normal uppercase/lowercase
        this.vram[offset] = this.inverse ? (ascii & 0x3f) : (ascii | 0x80)
      }
      this.cursorCol++
      if (this.cursorCol >= 80) {
        this.cursorCol = 0
        this.cursorRow++
        if (this.cursorRow >= 24) {
          this.scrollUp()
          this.cursorRow = 23
        }
      }
    }

    // Sync hardware cursor registers
    const pos = (this.cursorRow * 80) + this.cursorCol
    this.crtcRegs[14] = (pos >> 8) & 0x07
    this.crtcRegs[15] = pos & 0xff
  }

  clearScreen(): void {
    this.vram.fill(0xA0) // Fill with normal space ($A0 in Apple II)
    this.cursorCol = 0
    this.cursorRow = 0
    this.crtcRegs[14] = 0
    this.crtcRegs[15] = 0
  }

  scrollUp(): void {
    // Move rows 1..23 up to rows 0..22
    this.vram.copyWithin(0, 80, 1920)
    // Clear bottom row (row 23)
    this.vram.fill(0xA0, 1920 - 80, 1920)
  }

  /**
   * Returns the 1920-byte 80x24 text page buffer formatted for display rendering.
   * Accurately takes into account MC6845 CRTC Start Address (R12/R13) for hardware
   * scrolling (used heavily by CP/M) and Cursor Address (R14/R15).
   */
  getTextPage(): Uint8Array {
    const textPage = new Uint8Array(1920)
    const startAddr = (((this.crtcRegs[12] & 0x07) << 8) | this.crtcRegs[13]) % 2048
    const cursorAddr = (((this.crtcRegs[14] & 0x07) << 8) | this.crtcRegs[15]) % 2048

    for (let y = 0; y < 24; y++) {
      const lineStart = (startAddr + y * 80) % 2048
      for (let x = 0; x < 80; x++) {
        const vramAddr = (lineStart + x) % 2048
        const ch = this.vram[vramAddr]
        const destIdx = y * 80 + x

        // Convert Videx VRAM character to Apple II display encoding (Bit 7 = 1 for normal text)
        const ascii = ch & 0x7F
        const isCursor = (vramAddr === cursorAddr)

        if (isCursor) {
          // Cursor: inverse character (Bit 7 = 0)
          textPage[destIdx] = ascii
        } else {
          // Normal character: Bit 7 = 1
          textPage[destIdx] = (ascii >= 0x20) ? (ascii | 0x80) : 0xA0
        }
      }
    }

    return textPage
  }
}

export const videoTerm = new VideoTerm(3)

export const enableVideoTerm = () => {
  videoTerm.enabled = true
  // Note: we do NOT touch SLOTC3ROM. The memory.ts memGet function already has
  // a special-case branch "page === 0xC3 && videoTerm.enabled" that serves our
  // Videx ROM directly. Setting SLOTC3ROM would cause manageC800(3) to run on
  // every $C3xx read, overwriting the $C800-$CFFF mapping and breaking ProDOS.
  setSlotDriver(3, videoTerm.getDriver())
  setSlotIOCallback(3, (addr: number, value = -1) => {
    // Only handle Slot 3 I/O space ($C0B0-$C0BF).
    // checkSlotIO also fires for $C300-$C3FF ROM reads (via the NSC/else branch);
    // return -1 so checkSlotIO doesn't corrupt slot ROM memory or set active prematurely.
    if (addr < 0xC0B0 || addr > 0xC0BF) return -1
    if (value >= 0) {
      videoTerm.writeIO(addr, value)
      return -1
    }
    return videoTerm.readIO(addr)
  })
}

export const disableVideoTerm = () => {
  videoTerm.enabled = false
}
