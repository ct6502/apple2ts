/**
 * Interactive menu bootloader system
 * 
 * Strategy: Use BASIC menu for interactive selection since:
 * 1. BASIC.SYSTEM is already loaded and available
 * 2. Menu logic is simpler and more maintainable
 * 3. Can leverage BASIC's INPUT/PRINT for user interaction
 * 4. Can execute BRUN directly from BASIC
 * 5. Screenshots can be displayed via POKEing hi-res memory
 */

/**
 * Creates a BASIC program that displays an interactive menu
 * and allows selection of disk images with optional screenshot preview
 */
export const createMenuProgram = (
  menuItems: Array<{
    filename: string
    displayName?: string
    screenshotBlock?: number
  }>
): string => {
  let basic = ""
  
  // Line 10: Header
  basic += "10 REM APPLE2TS INTERACTIVE MENU\r"
  basic += "20 HOME\r"
  basic += "30 PRINT \"APPLE2TS DISK MENU\"\r"
  basic += "40 PRINT \"====================\"\r"
  basic += "50 PRINT \"\"\r"
  
  // List menu items
  let lineNum = 60
  for (let i = 0; i < menuItems.length && i < 20; i++) {
    const idx = i + 1
    const name = menuItems[i].displayName || menuItems[i].filename
    // Escape quotes and limit length
    const displayName = name.replace(/\"/g, "\\\"").slice(0, 30)
    basic += `${lineNum} PRINT \"${idx}. ${displayName}\"\r`
    lineNum += 10
  }
  
  // Selection prompt
  basic += `${lineNum} PRINT \"\"\r`
  lineNum += 10
  basic += `${lineNum} PRINT \"ENTER DISK NUMBER (1-${menuItems.length}): \";\r`
  lineNum += 10
  basic += `${lineNum} INPUT S\r`
  lineNum += 10
  
  // Validation
  basic += `${lineNum} IF S < 1 OR S > ${menuItems.length} THEN HOME : GOTO 30\r`
  lineNum += 10
  
  // Execute selected disk
  for (let i = 0; i < menuItems.length && i < 20; i++) {
    const idx = i + 1
    const filename = menuItems[i].filename
    basic += `${lineNum} IF S = ${idx} THEN BRUN ${filename}\r`
    lineNum += 10
  }
  
  // Fallback (shouldn't reach)
  basic += `${lineNum} GOTO 30\r`
  
  return basic
}

/**
 * Creates an enhanced STARTUP command that loads and runs the menu
 * This version shows menu items with screenshot preview
 */
export const createEnhancedStartup = (
  menuItems: Array<{
    filename: string
    displayName?: string
    screenshotBlock?: number
  }>
): string => {
  let startup = ""
  
  // Clear screen and show header
  startup += "PRINT CHR$(4) & \"BLOAD MENUSCREEN\"\r"  // Load screenshot if available
  startup += "HOME\r"
  startup += "PRINT \"APPLE2TS DISK SELECTION\"\r"
  startup += "PRINT \"\"\r"
  
  // Show menu items
  for (let i = 0; i < menuItems.length && i < 10; i++) {
    const idx = i + 1
    const displayName = (menuItems[i].displayName || menuItems[i].filename).slice(0, 30)
    startup += `PRINT \"${idx}. ${displayName}\"\r`
  }
  
  startup += "PRINT \"\"\r"
  startup += "PRINT \"SELECT DISK (1-\" + STR$(" + menuItems.length + ") + \"): \";\r"
  startup += "INPUT CHOICE\r"
  
  // Jump to selected disk
  for (let i = 0; i < menuItems.length && i < 10; i++) {
    const idx = i + 1
    const filename = menuItems[i].filename
    startup += `IF CHOICE = ${idx} THEN BRUN ${filename}\r`
  }
  
  // Loop back if invalid
  startup += "PRINT \"INVALID SELECTION\"\r"
  startup += "PRINT\r"
  startup += "GOTO 260\r"
  
  return startup
}

/**
 * Creates a simple launcher that explains the menu and waits for user
 */
export const createMenuLauncher = (): Uint8Array => {
  // Simple 6502 code that:
  // 1. Sets text mode
  // 2. Clears screen
  // 3. Prints help
  // 4. Returns to BASIC
  
  const code = new Uint8Array([
    // Text mode
    0xA9, 0x00,             // LDA #$00
    0x8D, 0x51, 0xC0,       // STA $C051 (TEXT)
    0x8D, 0x54, 0xC0,       // STA $C054 (PAGE1)
    
    // Clear screen
    0xA9, 0x0C,             // LDA #$0C (CTRL-L)
    0x20, 0xED, 0xFD,       // JSR $FDED (COUT)
    
    // Print banner at $2040
    0xA2, 0x00,             // LDX #$00
    0xBD, 0x40, 0x20,       // LDA $2040,X
    0xF0, 0x08,             // BEQ done
    0x09, 0x80,             // ORA #$80
    0x20, 0xED, 0xFD,       // JSR $FDED (COUT)
    0xE8,                   // INX
    0xD0, 0xF3,             // BNE loop
    
    0x60,                   // RTS (return to BASIC)
  ])
  
  const padded = new Uint8Array(256)
  padded.set(code)
  
  // Help text at $2040
  const helpText = "APPLE2TS MENU LOADER\rREADY FOR DISK SELECTION\r"
  const helpBytes = Array.from(helpText).map(c => c.charCodeAt(0))
  for (let i = 0; i < helpBytes.length && i < 208; i++) {
    padded[0x40 + i] = helpBytes[i]
  }
  padded[0x40 + helpBytes.length] = 0
  
  return padded
}
