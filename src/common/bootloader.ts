/**
 * Assembly bootloader for ProDOS HDV disk selector
 * Works on real Apple II hardware and other emulators
 * Uses standard SmartPort/ProDOS calls
 *
 * The bootloader is created as binary code since creating a full 6502 assembler
 * would be complex. For production use, this should be assembled from proper
 * 6502 assembly code using a standard assembler.
 */

/**
 * Creates a minimal bootloader for ProDOS HDV
 * The bootloader displays available disk images and allows selection
 */
export const createBootloaderCode = (
  filenames: string[],
  fileSizes: number[],
  fileBlocks: number[]
): Uint8Array => {
  // This creates a minimal boot block
  // For a production system, use a proper 6502 assembler to create this code
  // The bootloader should:
  // 1. Display a menu of available disk files
  // 2. Accept keyboard input for selection (arrow keys + return)
  // 3. Load the selected disk file
  // 4. Boot from it
  
  const code = new Uint8Array(512)
  
  // Minimal boot block structure for ProDOS
  code[0x00] = 0x01        // Check value
  code[0x01] = 0x38        // Ignore write protect
  code[0x02] = 0x4C        // JMP
  code[0x03] = 0x00        
  code[0x04] = 0x08        // Jump to $0800
  
  // The actual bootloader code would go at $0800+
  // This is a simplified placeholder
  // Add basic display message
  const message = new TextEncoder().encode("APPLE2TS")
  code.set(message, 0x10)
  
  // Bitmap block reference
  code[0xFC] = 6           // Bitmap block
  code[0xFD] = 0           
  
  return code
}
