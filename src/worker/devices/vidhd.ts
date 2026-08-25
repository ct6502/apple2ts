/**
 * VidHD Video Card Emulation for Apple2TS
 *
 * Implements the VidHD (Blue Shift Inc / John Brooks) HDMI expansion card,
 * providing Apple IIGS-compatible Super Hi-Res (SHR) video modes:
 * - 320x200 16-color per line (from 16 palettes of 4096 colors)
 * - 640x200 4/16-color dithered mode
 * - Softswitch $C029 (NEWVIDEO) control
 * - Slot detection signatures ($Cn00=$24, $Cn01=$EA, $Cn02=$4C)
 */

export class VidHD {
  enabled = false
  slot = 3
  newVideo = 0 // Softswitch $C029

  // ROM identification buffer (256 bytes for $Cn00-$CnFF)
  rom = new Uint8Array(256)

  constructor(slot = 3) {
    this.slot = slot
    this.initRom()
    this.reset()
  }

  reset(): void {
    this.newVideo = 0
  }

  get active(): boolean {
    return this.enabled && (this.newVideo & 0x80) !== 0
  }

  get isMonochrome(): boolean {
    return (this.newVideo & 0x20) !== 0
  }

  get isLinear(): boolean {
    return (this.newVideo & 0x40) !== 0
  }

  /**
   * Initializes the Slot ROM identification bytes for VidHD.
   * Signature: $Cn00 = $24 (BIT $EA), $Cn01 = $EA, $Cn02 = $4C (JMP $FF58)
   */
  private initRom(): void {
    this.rom.fill(0x60) // RTS default
    this.rom[0x00] = 0x24 // BIT $EA
    this.rom[0x01] = 0xEA
    this.rom[0x02] = 0x4C // JMP $FF58 (RTS in Apple II ROM)
    this.rom[0x03] = 0x58
    this.rom[0x04] = 0xFF
  }

  readMemory(addr: number): number {
    const offset = addr & 0xFF
    return this.rom[offset]
  }

  /**
   * Handles $C080 + slot*16 Device I/O reads ($C0B0-$C0BF for Slot 3).
   * Returns official VidHD detection signatures.
   */
  readIO(addr: number): number {
    const reg = addr & 0x0F
    return this.rom[reg]
  }

  readSoftSwitch(): number {
    return this.newVideo
  }

  writeSoftSwitch(value: number): void {
    this.newVideo = value & 0xFF
  }

  /**
   * Extracts the 32KB Super Hi-Res region ($2000-$9FFF) from Auxiliary RAM.
   */
  extractShrBuffer(memory: Uint8Array, auxMemoryStart: number): Uint8Array {
    const start = auxMemoryStart + 0x2000
    return memory.slice(start, start + 0x8000)
  }

  /**
   * Decodes a 32KB SHR memory block ($2000-$9FFF) into a 560x384 RGBA image buffer
   * matching Apple2TS's standard canvas dimensions.
   */
  decodeShrTo560x384(shrData: Uint8Array, outRgba: Uint8ClampedArray): void {
    const outWidth = 560
    const outHeight = 384
    outRgba.fill(0)

    if (shrData.length < 0x8000) return

    // Pre-allocated palettes lookup table: 16 palettes x 16 colors x [R, G, B]
    const palR = new Uint8Array(256)
    const palG = new Uint8Array(256)
    const palB = new Uint8Array(256)

    // Decode 16 palettes located at offset $7E00 ($9E00 - $2000)
    for (let p = 0; p < 16; p++) {
      const pOffset = 0x7E00 + p * 32
      for (let c = 0; c < 16; c++) {
        const idx = (p << 4) | c
        const colorLo = shrData[pOffset + c * 2]
        const colorHi = shrData[pOffset + c * 2 + 1]
        const colorWord = colorLo | (colorHi << 8)

        // 12-bit RGB: 0x0RGB -> 0..15 scaled to 0..255 (multiply by 17)
        palR[idx] = ((colorWord >> 8) & 0x0F) * 17
        palG[idx] = ((colorWord >> 4) & 0x0F) * 17
        palB[idx] = (colorWord & 0x0F) * 17
      }
    }

    // Destination-driven sampling for 560x384 canvas
    for (let ty = 0; ty < outHeight; ty++) {
      const srcY = Math.min(199, Math.floor((ty * 200) / outHeight))
      const lineOffset = srcY * 160
      const scb = shrData[0x7D00 + srcY]
      const palIdx = (scb & 0x0F) << 4
      const is640 = (scb & 0x80) !== 0
      const rowOffset = ty * outWidth * 4

      if (!is640) {
        // 320 mode
        for (let x = 0; x < outWidth; x++) {
          const srcX = Math.min(319, Math.floor((x * 320) / outWidth))
          const byteVal = shrData[lineOffset + (srcX >> 1)]
          const color4Bit = (srcX & 1) ? (byteVal & 0x0F) : ((byteVal >> 4) & 0x0F)
          const c = palIdx | color4Bit

          const px = rowOffset + x * 4
          outRgba[px] = palR[c]
          outRgba[px + 1] = palG[c]
          outRgba[px + 2] = palB[c]
          outRgba[px + 3] = 255
        }
      } else {
        // 640 mode
        for (let x = 0; x < outWidth; x++) {
          const srcX = Math.min(639, Math.floor((x * 640) / outWidth))
          const byteVal = shrData[lineOffset + (srcX >> 2)]
          const shift = (3 - (srcX & 3)) * 2
          const color2Bit = (byteVal >> shift) & 0x03
          const colorIndex = (srcX % 4) * 4 + color2Bit
          const c = palIdx | colorIndex

          const px = rowOffset + x * 4
          outRgba[px] = palR[c]
          outRgba[px + 1] = palG[c]
          outRgba[px + 2] = palB[c]
          outRgba[px + 3] = 255
        }
      }
    }
  }
}

export const vidhd = new VidHD(3)
