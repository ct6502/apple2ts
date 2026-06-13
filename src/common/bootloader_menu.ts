/**
 * Enhanced bootloader with interactive menu and screenshot support
 * Loaded at $2000, displays list of disks with optional screenshots
 * Handles arrow-key navigation and selection
 */

/**
 * Menu metadata structure stored in a file:
 * Byte 0: Number of menu items
 * Bytes 1-N: Menu item offsets (variable based on count)
 * 
 * Each menu item (39 bytes):
 * Bytes 0-19: Filename (20 bytes, null-padded)
 * Bytes 20-22: Screenshot block offset (3 bytes LE, 0 if none)
 * Bytes 23-38: Reserved
 */

export type MenuEntry = {
  filename: string
  screenshotBlock: number
}

/**
 * Creates binary menu metadata file
 */
export const createMenuMetadataFile = (entries: MenuEntry[]): Uint8Array => {
  // Header: 1 byte for count + variable item data
  // Each item: 39 bytes
  const totalSize = 1 + (entries.length * 39)
  const data = new Uint8Array(totalSize)
  
  data[0] = entries.length
  
  for (let i = 0; i < entries.length; i++) {
    const offset = 1 + (i * 39)
    const entry = entries[i]
    
    // Filename: 20 bytes
    const nameBytes = entry.filename.toUpperCase().slice(0, 15).split("")
    for (let j = 0; j < 20; j++) {
      data[offset + j] = j < nameBytes.length ? nameBytes[j].charCodeAt(0) : 0
    }
    
    // Screenshot block offset: 3 bytes, little-endian
    const screenshotBlock = entry.screenshotBlock || 0
    data[offset + 20] = screenshotBlock & 0xFF
    data[offset + 21] = (screenshotBlock >> 8) & 0xFF
    data[offset + 22] = (screenshotBlock >> 16) & 0xFF
  }
  
  return data
}

/**
 * Creates the menu bootloader binary
 * Loads at $2000, uses memory layout:
 * $2000-$2FFF: Code + data (4KB)
 * $3000-$3FFF: Menu metadata (4KB)
 * $4000-$9FFF: Screenshot buffer (24KB, can hold 3 full screens)
 * 
 * Soft switches:
 * $C050: GRAPHICS
 * $C051: TEXT
 * $C052: FULLSCREEN
 * $C053: MIXED (mixed mode on)
 * $C054: PAGE1
 * $C055: PAGE2
 * $C056: HIRES OFF
 * $C057: HIRES ON
 * $C00C: 80STORE OFF
 * $C00D: 80STORE ON
 */
export const createMenuBootloader = (): Uint8Array => {
  // 6502 assembly for menu bootloader
  // This is a simplified version that displays text menu
  // Full implementation with hi-res graphics would be more complex
  
  const code = new Uint8Array([
    // Init: Set up screen mode (40 col text)
    0xA9, 0x00,       // LDA #$00
    0x8D, 0x0C, 0xC0, // STA $C00C (80STORE OFF)
    0x8D, 0x51, 0xC0, // STA $C051 (TEXT mode)
    0x8D, 0x54, 0xC0, // STA $C054 (PAGE1)
    
    // Clear screen with CTRL-L (Ctrl+L = 0x0C)
    0xA9, 0x0C,       // LDA #$0C
    0x20, 0xED, 0xFD, // JSR $FDED (COUT)
    
    // Load menu metadata from file
    // For now, just print a simple menu banner
    0xA2, 0x00,       // LDX #$00
    0xBD, 0x00, 0x30, // LDA $3000,X (load from menu metadata area)
    0xF0, 0x10,       // BEQ endmenu (if 0, no menu items)
    0x09, 0x80,       // ORA #$80 (high bit for Apple text)
    0x20, 0xED, 0xFD, // JSR $FDED (COUT)
    0xE8,             // INX
    0xD0, 0xF3,       // BNE loop
    
    // Menu loop (simplified - just return for now)
    0xA9, 0x8D,       // LDA #$8D (CR)
    0x20, 0xED, 0xFD, // JSR $FDED (COUT)
    
    // Print default message and return
    0xA2, 0x00,       // LDX #$00
    0xBD, 0x40, 0x20, // LDA $2040,X (load banner text)
    0xF0, 0x08,       // BEQ done
    0x09, 0x80,       // ORA #$80
    0x20, 0xED, 0xFD, // JSR $FDED (COUT)
    0xE8,             // INX
    0xD0, 0xF3,       // BNE loop
    
    // Done: Return to BASIC.SYSTEM
    0x60,             // RTS
  ])
  
  // Banner text to display at $2040
  const banner = "APPLE2TS DISK MENU\rUSE ARROWS TO SELECT, ENTER TO BOOT\r\0"
  const bannerBytes = new Uint8Array(banner.length)
  for (let i = 0; i < banner.length; i++) {
    bannerBytes[i] = banner.charCodeAt(i)
  }
  
  // Pad code to $2040 (64 bytes for code + data)
  const padded = new Uint8Array(64 + bannerBytes.length)
  padded.set(code)
  padded.set(bannerBytes, 64)
  
  return padded
}

/**
 * Converts 280×192 hi-res screen data to binary format
 * Apple II hi-res format: 8KB per screen, interleaved rows
 */
export const convertScreenToHiresFormat = (
  canvasData: ImageData
): Uint8Array => {
  // Assuming canvasData is 280×192 RGBA
  const width = 280
  const height = 192
  const hiresData = new Uint8Array(8192) // 40 bytes × 192 rows
  
  for (let y = 0; y < height; y++) {
    // Calculate Apple II hi-res row offset (interleaved)
    const blockRow = Math.floor(y / 8)
    const rowOffset = y % 8
    const hiresY = blockRow + rowOffset * 24
    
    for (let x = 0; x < width; x += 7) {
      const byteIndex = hiresY * 40 + Math.floor(x / 7)
      let byte = 0
      
      for (let bit = 0; bit < 7; bit++) {
        const pixelX = x + bit
        if (pixelX < width) {
          const pixelIndex = (y * width + pixelX) * 4
          // Check if pixel is bright (sum of RGB > 300)
          const r = canvasData.data[pixelIndex]
          const g = canvasData.data[pixelIndex + 1]
          const b = canvasData.data[pixelIndex + 2]
          if (r + g + b > 300) {
            byte |= (1 << bit)
          }
        }
      }
      
      hiresData[byteIndex] = byte
    }
  }
  
  return hiresData
}
