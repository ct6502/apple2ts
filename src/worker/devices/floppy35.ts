// Apple IIgs 3.5" (800K Sony) media support.
//
// The IWM reads a raw GCR bit stream, exactly like the 5.25" path, so an 800K
// block image has to be nibblized before any drive code can use it. The
// encoding is 6-and-2 with the sector layout from CiderPress2 / gssquared
// woz_nibblizer_35.cpp: five zones with 12/11/10/9/8 sectors per track, 80
// cylinders, two sides, and a 12-byte block header in front of each 512-byte
// sector's payload.
//
// Block image layout (ProDOS order, byte offset = sector * 512):
//   zone = track / 16, sectorsPerZone = {12, 11, 10, 9, 8}
//   offset = zoneOffset[zone] + (trackInZone * 2 + side) * sectorsPerZone + sector
//   zoneOffset (in sectors) = {0, 384, 736, 1056, 1344}
//
// The raw image stays in driveData so writeback and UI downloads keep producing
// a valid container; the generated stream lives in a parallel buffer.

export const FLOPPY35_TRACKS = 80
export const FLOPPY35_SECTORS = 1600
export const FLOPPY35_SECTOR_SIZE = 512
export const FLOPPY35_BLOCK_BYTES = FLOPPY35_SECTORS * FLOPPY35_SECTOR_SIZE
export const FLOPPY35_OPTIMAL_TIMING = 16 // 2 us bit cell

const SECTORS_PER_ZONE = [12, 11, 10, 9, 8]
const ZONE_OFFSET = [0, 384, 736, 1056, 1344]

// Physical order of the sector numbers written around each track. Ported from
// gssquared (which in turn took it from CiderPress2's Nibble-notes).
const INTERLEAVE = [
  [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8, 11],
  [0, 3, 6, 9, 1, 4, 7, 10, 2, 5, 8],
  [0, 5, 3, 8, 1, 6, 4, 9, 2, 7],
  [0, 7, 5, 3, 1, 8, 6, 4, 2],
  [0, 2, 4, 6, 1, 3, 5, 7],
]

const GAP_A_SIZE = 148
const GAP_B_SIZE = 5
const GAP_C_SIZE = 54

const DISK_BYTES_62 = [
  0x96, 0x97, 0x9A, 0x9B, 0x9D, 0x9E, 0x9F, 0xA6,
  0xA7, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB2, 0xB3,
  0xB4, 0xB5, 0xB6, 0xB7, 0xB9, 0xBA, 0xBB, 0xBC,
  0xBD, 0xBE, 0xBF, 0xCB, 0xCD, 0xCE, 0xCF, 0xD3,
  0xD6, 0xD7, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE,
  0xDF, 0xE5, 0xE6, 0xE7, 0xE9, 0xEA, 0xEB, 0xEC,
  0xED, 0xEE, 0xEF, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6,
  0xF7, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF,
]

const INV_DISK_BYTES_62 = new Int16Array(256).fill(-1)
DISK_BYTES_62.forEach((value, index) => { INV_DISK_BYTES_62[value] = index })

const CHUNK_SIZE_62_524 = 175

// A 2IMG container puts its payload at a declared offset and may append a
// comment/creator chunk after it, so the file size is not the payload size.
// Raw .po/.img/.dsk/.3mg images start at 0.
export const getFloppy35PayloadInfo = (diskData: Uint8Array) => {
  const is2IMG = diskData.length >= 64 &&
    diskData[0] === 0x32 && diskData[1] === 0x49 && diskData[2] === 0x4D && diskData[3] === 0x47
  if (!is2IMG) return { offset: 0, size: diskData.length }
  const read32 = (at: number) =>
    diskData[at] | (diskData[at + 1] << 8) | (diskData[at + 2] << 16) | (diskData[at + 3] * 0x1000000)
  const offset = read32(0x18)
  const size = read32(0x1C)
  if (offset >= 64 && offset < diskData.length && size > 0 && offset + size <= diskData.length) {
    return { offset, size }
  }
  // Corrupt header: the 2IMG header itself is always 64 bytes on Apple II.
  return { offset: 64, size: diskData.length - 64 }
}

class BitWriter {
  private buf = new Uint8Array(16384)
  private bitPos = 0

  private ensure(extraBits: number) {
    const need = (this.bitPos + extraBits + 7) >> 3
    if (need <= this.buf.length) return
    let capacity = this.buf.length
    while (capacity < need) capacity *= 2
    const next = new Uint8Array(capacity)
    next.set(this.buf)
    this.buf = next
  }

  bit(on: number) {
    this.ensure(1)
    if (on) this.buf[this.bitPos >> 3] |= 0x80 >> (this.bitPos & 7)
    this.bitPos++
  }

  byte(value: number) {
    for (let i = 7; i >= 0; i--) this.bit((value >> i) & 1)
  }

  // A self-sync byte is 8 ones followed by two timing zeros (10 bits), which
  // is what lets the Logic State Sequencer line up on the next $FF.
  syncBytes(count: number) {
    this.ensure(count * 10)
    for (let i = 0; i < count; i++) {
      for (let b = 0; b < 8; b++) this.bit(1)
      this.bit(0)
      this.bit(0)
    }
  }

  finish(): Uint8Array {
    return this.buf.slice(0, (this.bitPos + 7) >> 3)
  }
}

// 6-and-2 encode the 524 bytes (12 zero header bytes + 512 data bytes) that
// make up one sector. Returns the 703 nibbles stored on disk.
export const encodeSector62 = (buffer: Uint8Array): Uint8Array => {
  const part0 = new Uint8Array(CHUNK_SIZE_62_524)
  const part1 = new Uint8Array(CHUNK_SIZE_62_524)
  const part2 = new Uint8Array(CHUNK_SIZE_62_524)
  let chk0 = 0
  let chk1 = 0
  let chk2 = 0
  let inIdx = 0
  let idx = 0

  while (true) {
    chk0 = (chk0 & 0xFF) << 1
    if (chk0 & 0x0100) chk0++

    let val = buffer[inIdx++]
    chk2 += val
    if (chk0 & 0x0100) {
      chk2++
      chk0 &= 0xFF
    }
    part0[idx] = (val ^ chk0) & 0xFF

    val = buffer[inIdx++]
    chk1 += val
    if (chk2 > 0xFF) {
      chk1++
      chk2 &= 0xFF
    }
    part1[idx] = (val ^ chk2) & 0xFF

    if (inIdx === 524) break

    val = buffer[inIdx++]
    chk0 += val
    if (chk1 > 0xFF) {
      chk0++
      chk1 &= 0xFF
    }
    part2[idx] = (val ^ chk1) & 0xFF
    idx++
  }
  part2[CHUNK_SIZE_62_524 - 1] = 0

  const out = new Uint8Array(703)
  let outIdx = 0
  for (let i = 0; i < CHUNK_SIZE_62_524; i++) {
    const twos = ((part0[i] & 0xC0) >> 2) | ((part1[i] & 0xC0) >> 4) | ((part2[i] & 0xC0) >> 6)
    out[outIdx++] = DISK_BYTES_62[twos]
    out[outIdx++] = DISK_BYTES_62[part0[i] & 0x3F]
    out[outIdx++] = DISK_BYTES_62[part1[i] & 0x3F]
    if (i !== CHUNK_SIZE_62_524 - 1) {
      out[outIdx++] = DISK_BYTES_62[part2[i] & 0x3F]
    }
  }

  const chkTwos = ((chk0 & 0xC0) >> 6) | ((chk1 & 0xC0) >> 4) | ((chk2 & 0xC0) >> 2)
  out[outIdx++] = DISK_BYTES_62[chkTwos]
  out[outIdx++] = DISK_BYTES_62[chk2 & 0x3F]
  out[outIdx++] = DISK_BYTES_62[chk1 & 0x3F]
  out[outIdx++] = DISK_BYTES_62[chk0 & 0x3F]
  return out
}

export const decodeSector62 = (nibbles: Uint8Array): Uint8Array | null => {
  const part0 = new Uint8Array(CHUNK_SIZE_62_524)
  const part1 = new Uint8Array(CHUNK_SIZE_62_524)
  const part2 = new Uint8Array(CHUNK_SIZE_62_524)
  let inIdx = 0

  for (let i = 0; i < CHUNK_SIZE_62_524; i++) {
    const twos = INV_DISK_BYTES_62[nibbles[inIdx++]]
    const nib0 = INV_DISK_BYTES_62[nibbles[inIdx++]]
    const nib1 = INV_DISK_BYTES_62[nibbles[inIdx++]]
    const nib2 = (i !== CHUNK_SIZE_62_524 - 1) ? INV_DISK_BYTES_62[nibbles[inIdx++]] : 0
    if (twos < 0 || nib0 < 0 || nib1 < 0 || nib2 < 0) return null
    part0[i] = nib0 | ((twos << 2) & 0xC0)
    part1[i] = nib1 | ((twos << 4) & 0xC0)
    part2[i] = nib2 | ((twos << 6) & 0xC0)
  }

  const chkTwos = INV_DISK_BYTES_62[nibbles[inIdx++]]
  const chkNib2 = INV_DISK_BYTES_62[nibbles[inIdx++]]
  const chkNib1 = INV_DISK_BYTES_62[nibbles[inIdx++]]
  const chkNib0 = INV_DISK_BYTES_62[nibbles[inIdx++]]
  if (chkTwos < 0 || chkNib0 < 0 || chkNib1 < 0 || chkNib2 < 0) return null
  const readChk2 = chkNib2 | ((chkTwos << 2) & 0xC0)
  const readChk1 = chkNib1 | ((chkTwos << 4) & 0xC0)
  const readChk0 = chkNib0 | ((chkTwos << 6) & 0xC0)

  const buffer = new Uint8Array(524)
  let chk0 = 0
  let chk1 = 0
  let chk2 = 0
  let outCount = 0
  let index = 0
  while (true) {
    chk0 = (chk0 & 0xFF) << 1
    if (chk0 & 0x0100) chk0++

    let val = (part0[index] ^ chk0) & 0xFF
    chk2 += val
    if (chk0 & 0x0100) {
      chk2++
      chk0 &= 0xFF
    }
    buffer[outCount++] = val

    val = (part1[index] ^ chk2) & 0xFF
    chk1 += val
    if (chk2 > 0xFF) {
      chk1++
      chk2 &= 0xFF
    }
    buffer[outCount++] = val

    if (outCount === 524) break

    val = (part2[index] ^ chk1) & 0xFF
    chk0 += val
    if (chk1 > 0xFF) {
      chk0++
      chk1 &= 0xFF
    }
    buffer[outCount++] = val
    index++
  }

  if (readChk0 !== ((chk0 & 0xFF)) || readChk1 !== ((chk1 & 0xFF)) || readChk2 !== ((chk2 & 0xFF))) {
    return null
  }
  return buffer
}

export const floppy35SectorOffset = (track: number, sector: number, side: number) => {
  const zone = Math.max(0, Math.min(4, Math.floor(track / 16)))
  const trackInZone = track % 16
  return ZONE_OFFSET[zone] + (trackInZone * 2 + side) * SECTORS_PER_ZONE[zone] + sector
}

// --- Reading a track back after the guest has written it -------------------
//
// A write clocks bits straight onto the media (the IWM has no sector view), so
// persisting it to the block image means finding the data fields again and
// 6-and-2 decoding them. Fields are laid out address-then-data, so a linear
// scan pairs each address header with the data field that follows it.

export interface Decoded35Sector {
  track: number
  sector: number
  side: number
  data: Uint8Array
}

const trackBit = (
  stream: Uint8Array, start: number, nbits: number, bitPos: number,
) => {
  const p = ((bitPos % nbits) + nbits) % nbits
  return (stream[start + (p >> 3)] >> (7 - (p & 7))) & 1
}

const trackByte = (
  stream: Uint8Array, start: number, nbits: number, bitPos: number,
) => {
  let value = 0
  for (let i = 0; i < 8; i++) value = (value << 1) | trackBit(stream, start, nbits, bitPos + i)
  return value
}

export const decodeFloppy35Track = (
  stream: Uint8Array, start: number, nbits: number,
): Decoded35Sector[] => {
  const out: Decoded35Sector[] = []
  if (nbits < 64 || start <= 0 || start + ((nbits + 7) >> 3) > stream.length) return out
  let window = 0
  let pos = 0
  let pending: { track: number, sector: number, side: number } | null = null
  while (pos < nbits) {
    window = ((window << 1) | trackBit(stream, start, nbits, pos)) & 0xFFFFFF
    pos++
    if (window === 0xD5AA96) {
      const bytes = [0, 1, 2, 3, 4].map(i =>
        INV_DISK_BYTES_62[trackByte(stream, start, nbits, pos + i * 8)])
      if (bytes.every(v => v >= 0)) {
        const [lowTrack, sector, sideAndTrack, format, checksum] = bytes
        if (format === 0x24 && sector < 12 &&
          ((lowTrack ^ sector ^ sideAndTrack ^ format) & 0x3F) === checksum) {
          // The track number is 7 bits: 6 in the low-track byte and bit 6 of the
          // cylinder in bit 0 of the side byte (IIgs Hardware Reference, $029).
          pending = {
            track: lowTrack | ((sideAndTrack & 0x01) << 6),
            sector,
            side: (sideAndTrack & 0x20) ? 1 : 0,
          }
        }
      }
    } else if (window === 0xD5AAAD && pending) {
      const sector = INV_DISK_BYTES_62[trackByte(stream, start, nbits, pos)]
      if (sector === pending.sector) {
        const nibbles = new Uint8Array(703)
        const dataStart = pos + 8
        for (let i = 0; i < 703; i++) {
          nibbles[i] = trackByte(stream, start, nbits, dataStart + i * 8)
        }
        const buffer = decodeSector62(nibbles)
        if (buffer) out.push({ ...pending, data: buffer.slice(12) })
      }
      // Skip the data field (sector nibble, 703 nibbles, DE AA FF epilogue) so
      // the scan does not resync inside the payload.
      pending = null
      pos = pos + 8 + 703 * 8 + 24
      window = 0
    }
  }
  return out
}

// Decode every data field on one physical track and splice the sector payloads
// back into the block image. Returns true when at least one sector decoded.
export const spliceFloppy35Track = (
  stream: Uint8Array, start: number, nbits: number,
  blockImage: Uint8Array, track: number, side: number,
) => {
  const { offset, size } = getFloppy35PayloadInfo(blockImage)
  if (size !== FLOPPY35_BLOCK_BYTES || offset + size > blockImage.length) return false
  let changed = false
  for (const sector of decodeFloppy35Track(stream, start, nbits)) {
    if (sector.track !== track || sector.side !== side) continue
    if (sector.sector >= SECTORS_PER_ZONE[Math.floor(track / 16)]) continue
    const at = offset + floppy35SectorOffset(track, sector.sector, side) * FLOPPY35_SECTOR_SIZE
    if (at + FLOPPY35_SECTOR_SIZE > blockImage.length) continue
    for (let i = 0; i < FLOPPY35_SECTOR_SIZE; i++) {
      if (blockImage[at + i] !== sector.data[i]) {
        blockImage.set(sector.data, at)
        changed = true
        break
      }
    }
  }
  return changed
}

const emitAddressField = (
  writer: BitWriter, track: number, side: number, sector: number,
) => {
  writer.byte(0xD5)
  writer.byte(0xAA)
  writer.byte(0x96)

  const lowTrack = track & 0x3F
  const sideNumber = (side === 0 ? 0 : 0x20) | ((track & 0x40) >> 6)
  const format = 0x24
  const checksum = (lowTrack ^ sector ^ sideNumber ^ format) & 0x3F
  writer.byte(DISK_BYTES_62[lowTrack])
  writer.byte(DISK_BYTES_62[sector])
  writer.byte(DISK_BYTES_62[sideNumber])
  writer.byte(DISK_BYTES_62[format])
  writer.byte(DISK_BYTES_62[checksum])
  writer.byte(0xDE)
  writer.byte(0xAA)
  writer.byte(0xFF)
}

const emitDataField = (writer: BitWriter, sectorBuffer: Uint8Array, sector: number) => {
  writer.byte(0xD5)
  writer.byte(0xAA)
  writer.byte(0xAD)
  writer.byte(DISK_BYTES_62[sector])
  const encoded = encodeSector62(sectorBuffer)
  for (let i = 0; i < 703; i++) writer.byte(encoded[i])
  writer.byte(0xDE)
  writer.byte(0xAA)
  writer.byte(0xFF)
}

// Build the complete bit stream for an 800K block image and point the drive's
// trackStart/trackNbits tables at it. Track index is (track << 1) | side.
// Returns an empty array when the payload is not exactly 800K.
export const buildFloppy35Bitstream = (
  diskData: Uint8Array, driveState: DriveState,
): Uint8Array => {
  const { offset, size } = getFloppy35PayloadInfo(diskData)
  if (size !== FLOPPY35_BLOCK_BYTES || offset + size > diskData.length) {
    return new Uint8Array()
  }

  const chunks: Uint8Array[] = []
  // Track 0 starts at file offset 0, which the shared read engine treats as
  // "empty track" (5.25 WOZ2 block 0 is always the header). Leave one padding
  // byte in front so every generated track has a non-zero start offset.
  let byteOffset = 1
  const sectorBuffer = new Uint8Array(524)

  for (let track = 0; track < FLOPPY35_TRACKS; track++) {
    const sectorCount = SECTORS_PER_ZONE[Math.floor(track / 16)]
    const interleave = INTERLEAVE[Math.floor(track / 16)]
    for (let side = 0; side < 2; side++) {
      const writer = new BitWriter()
      writer.syncBytes(GAP_A_SIZE)
      for (let physical = 0; physical < sectorCount; physical++) {
        const sector = interleave[physical]
        const dataOffset = offset + floppy35SectorOffset(track, sector, side) * FLOPPY35_SECTOR_SIZE
        sectorBuffer.fill(0, 0, 12)
        sectorBuffer.set(diskData.subarray(dataOffset, dataOffset + FLOPPY35_SECTOR_SIZE), 12)
        emitAddressField(writer, track, side, sector)
        writer.syncBytes(GAP_B_SIZE)
        emitDataField(writer, sectorBuffer, sector)
        writer.syncBytes(GAP_C_SIZE)
      }
      const trackBytes = writer.finish()
      const index = track * 2 + side
      driveState.trackStart[index] = byteOffset
      driveState.trackNbits[index] = trackBytes.length * 8
      chunks.push(trackBytes)
      byteOffset += trackBytes.length
    }
  }

  driveState.maxQuarterTrack = FLOPPY35_TRACKS * 2 - 1
  driveState.optimalTiming = FLOPPY35_OPTIMAL_TIMING

  const bitstream = new Uint8Array(byteOffset)
  let cursor = 1
  for (const chunk of chunks) {
    bitstream.set(chunk, cursor)
    cursor += chunk.length
  }
  return bitstream
}
