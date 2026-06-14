/**
 * ProDOS HDV builder for creating bootable hard drive images
 * Compatible with other Apple II emulators and real hardware
 *
 * Uses ProDOS 2.4.3 as a base and appends disk images to it
 */

export type ProDosFileKind = "seedling" | "sapling" | "tree"

export type ProDosFileEntry = {
  name: string,
  type: number,
  address?: number,
  blocksUsed?: number,
  modDate?: Date,
}

export type MenuDiskEntry = {
  filename: string
  sourceFilename?: string
  displayName?: string
  screenshotData?: Uint8Array
  imageKind?: "dos" | "prodos" | "unknown"
  wozExtractedProDosFiles?: ImportedDiskFile[]
}

export type ImportedDiskFile = {
  name: string
  relativePath?: string
  type: number
  auxType?: number
  data: Uint8Array
}

type BuildInputFile = { name: string; type: number; data: Uint8Array; auxType?: number; relativePath?: string; sourceMenuIndex?: number }

type ExtractedProDosFile = {
  name: string
  relativePath?: string
  type: number
  auxType: number
  storageType: 1 | 2 | 3
  eof: number
  data: Uint8Array
}

// DirectoryImportPlan removed - using multi-volume approach

/**
 * Creates binary menu metadata file with disk names and screenshot block references
 */
const createMenuMetadataFile = (entries: Array<{ filename: string; screenshotBlock: number; imageKind?: "dos" | "prodos" | "unknown" }>): Uint8Array => {
  const totalSize = 1 + (entries.length * 40)
  const data = new Uint8Array(totalSize)
  
  data[0] = Math.min(entries.length, 255)
  
  for (let i = 0; i < entries.length && i < 255; i++) {
    const offset = 1 + (i * 40)
    const entry = entries[i]
    
    // Filename: 20 bytes, null-padded
    const name = entry.filename.toUpperCase().slice(0, 15)
    for (let j = 0; j < 20; j++) {
      data[offset + j] = j < name.length ? name.charCodeAt(j) : 0
    }
    
    // Screenshot block offset: 3 bytes LE
    const block = entry.screenshotBlock || 0
    data[offset + 20] = block & 0xFF
    data[offset + 21] = (block >> 8) & 0xFF
    data[offset + 22] = (block >> 16) & 0xFF

    // Byte 23: image kind (0 unknown, 1 DOS, 2 ProDOS)
    data[offset + 23] = entry.imageKind === "dos" ? 1 : entry.imageKind === "prodos" ? 2 : 0
  }
  
  return data
}

/**
 * Generates an Applesoft source file to be EXEC'd by BASIC.SYSTEM.
 * This draws screenshots and supports left/right navigation.
 */
type MenuLaunchMode = "dosmaster" | "prodos-native" | "unavailable"

type MenuLaunchDirective = {
  mode: MenuLaunchMode
  commands: string[]
  message?: string
}

// Baseline-first guard: verify DOS.MASTER runtime boots before issuing V-volume
// selectors or app-specific launch commands.
const DOSMASTER_BASELINE_ONLY = true
const DOSMASTER_SLOT = 7

export const generateMenuSourceProgram = (
  menuEntries: MenuDiskEntry[],
  launchDirectives: MenuLaunchDirective[]
): string => {
  const lines: string[] = []
  const count = Math.max(1, Math.min(menuEntries.length, 99))
  lines.push("10 D$=CHR$(4)")
  lines.push(`20 I=1:MAX=${count}`)
  lines.push("30 GOSUB 1000")
  lines.push("40 GET K$:IF K$=\"\" THEN 40")
  lines.push("50 IF K$=CHR$(8) THEN I=I-1:IF I<1 THEN I=MAX")
  lines.push("60 IF K$=CHR$(21) THEN I=I+1:IF I>MAX THEN I=1")
  lines.push("70 IF K$=CHR$(8) OR K$=CHR$(21) THEN GOSUB 1000:GOTO 40")
  lines.push("80 IF K$=CHR$(13) THEN GOSUB 2000:GOTO 40")
  lines.push("90 GOTO 40")

  lines.push("1000 HOME")
  // GRAPHICS + MIXED + PAGE1 + HIRES for screenshot + bottom text lines.
  lines.push("1010 POKE 49232,0:POKE 49235,0:POKE 49236,0:POKE 49239,0")
  for (let idx = 1; idx <= count; idx++) {
    const lineNo = 1010 + idx
    lines.push(`${lineNo} IF I=${idx} THEN PRINT D$;\"BLOAD SCREEN${String(idx).padStart(2, "0")},A$2000\"`)
  }
  // Apple II text mode is uppercase-oriented; lowercase prints as symbols on many setups.
  lines.push("1120 VTAB 22:HTAB 1:PRINT \"USE <- AND -> TO SELECT A DISK\"")
  lines.push("1130 VTAB 23:HTAB 1:PRINT \"PRESS ENTER TO RUN\"")
  lines.push("1160 RETURN")

  // ENTER handling uses explicit launch directives only; no runtime fallbacks.
  lines.push("2000 REM ENTER HANDLER")
  console.log(`[HDV Export] Menu launch directives: ${launchDirectives.slice(0, count).map((d, i) => `${i}:${d.mode}:${d.commands.join("|") || d.message || ""}`).join("; ")}`)
  for (let idx = 1; idx <= count; idx++) {
    const lineNo = 2000 + idx
    const directive = launchDirectives[idx - 1] || { mode: "unavailable", commands: [], message: "ENTRY NOT CONFIGURED" }
    if (directive.mode === "unavailable" || directive.commands.length === 0) {
      const message = (directive.message || "ENTRY NOT AVAILABLE").replace(/"/g, "")
      lines.push(`${lineNo} IF I=${idx} THEN VTAB 24:HTAB 1:INVERSE:PRINT \"${message}\":NORMAL:RETURN`)
    } else {
      const commandChain = directive.commands
        .map((command) => `PRINT D$;\"${command}\"`)
        .join(":")
      lines.push(`${lineNo} IF I=${idx} THEN TEXT:${commandChain}:RETURN`)
    }
  }
  lines.push("2050 VTAB 24:HTAB 1:INVERSE:PRINT \"LAUNCH REQUESTED\":NORMAL")
  lines.push("2060 RETURN")

  // EXEC this file to define and run the program immediately.
  lines.push("RUN")
  const menusrc = `${lines.join("\r")}\r`
  console.log(`[HDV Export] Generated MENUSRC (first 1000 chars):\n${menusrc.slice(0, 1000)}...`)
  return menusrc
}

/**
 * Generates STARTUP command file. For interactive exports, STARTUP EXECs MENUSRC.
 */
const generateInteractiveMenuStartup = (
  menuEntries: MenuDiskEntry[]
): string => {
  if (menuEntries.length === 0) {
    return "BRUN A2TSLAUNCH\rCATALOG\r"
  }
  return "EXEC MENUSRC\r"
}

const buildDosMasterLaunchCommands = (dosRuntimeLauncher: string | undefined) => {
  if (!dosRuntimeLauncher) return undefined
  if (dosRuntimeLauncher.includes("/")) {
    const parts = dosRuntimeLauncher.split("/")
    if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined
    return [`PREFIX ${parts[0]}`, `-${parts[1]}`]
  }
  return [`-${dosRuntimeLauncher}`]
}

const writeLittleEndian16 = (data: Uint8Array, offset: number, value: number) => {
  data[offset] = value & 0xFF
  data[offset + 1] = (value >> 8) & 0xFF
}

const writeLittleEndian24 = (data: Uint8Array, offset: number, value: number) => {
  data[offset] = value & 0xFF
  data[offset + 1] = (value >> 8) & 0xFF
  data[offset + 2] = (value >> 16) & 0xFF
}

const readLittleEndian16 = (data: Uint8Array, offset: number) => {
  return data[offset] | (data[offset + 1] << 8)
}

const normalizeProDosFilename = (name: string) => {
  // Keep names strictly ProDOS-safe to avoid directory/parser issues.
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9.]/g, "")
  const trimmed = cleaned.slice(0, 15)
  return trimmed.length > 0 ? trimmed : "FILE"
}

const makeUniqueProDosFilename = (name: string, usedNames: Set<string>) => {
  const base = normalizeProDosFilename(name)
  if (!usedNames.has(base)) {
    usedNames.add(base)
    return base
  }
  for (let i = 1; i < 1000; i++) {
    const suffix = `${i}`
    const candidate = `${base.slice(0, Math.max(1, 15 - suffix.length))}${suffix}`
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate)
      return candidate
    }
  }
  const fallback = `FILE${Date.now() % 10000}`.slice(0, 15)
  usedNames.add(fallback)
  return fallback
}

const readBlock = (disk: Uint8Array, blockNum: number): Uint8Array | null => {
  const offset = blockNum * BLOCK_SIZE
  if (offset < 0 || offset + BLOCK_SIZE > disk.length) return null
  return disk.slice(offset, offset + BLOCK_SIZE)
}

const readLittleEndian24 = (data: Uint8Array, offset: number) => {
  return data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16)
}

const readLittleEndian32 = (data: Uint8Array, offset: number) => {
  return (data[offset]) |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
}

const readFileDataFromProDosImage = (
  disk: Uint8Array,
  storageType: 1 | 2 | 3,
  keyBlock: number,
  eof: number,
): Uint8Array => {
  const out = new Uint8Array(Math.max(0, eof))
  let outPos = 0

  const copyDataBlock = (blockNum: number) => {
    if (outPos >= eof || blockNum === 0) return
    const block = readBlock(disk, blockNum)
    if (!block) return
    const n = Math.min(BLOCK_SIZE, eof - outPos)
    out.set(block.slice(0, n), outPos)
    outPos += n
  }

  if (storageType === 1) {
    copyDataBlock(keyBlock)
    return out
  }

  if (storageType === 2) {
    const indexBlock = readBlock(disk, keyBlock)
    if (!indexBlock) return out
    for (let i = 0; i < 256 && outPos < eof; i++) {
      const blockNum = indexBlock[i] | (indexBlock[256 + i] << 8)
      if (blockNum === 0) {
        // Sparse file holes still consume logical space.
        outPos += Math.min(BLOCK_SIZE, eof - outPos)
        continue
      }
      copyDataBlock(blockNum)
    }
    return out
  }

  const masterBlock = readBlock(disk, keyBlock)
  if (!masterBlock) return out
  for (let i = 0; i < 256 && outPos < eof; i++) {
    const indexBlockNum = masterBlock[i] | (masterBlock[256 + i] << 8)
    if (indexBlockNum === 0) {
      // Sparse tree index holes represent 256 logical data blocks.
      outPos += Math.min(BLOCK_SIZE * 256, eof - outPos)
      continue
    }
    const indexBlock = readBlock(disk, indexBlockNum)
    if (!indexBlock) continue
    for (let j = 0; j < 256 && outPos < eof; j++) {
      const blockNum = indexBlock[j] | (indexBlock[256 + j] << 8)
      if (blockNum === 0) {
        outPos += Math.min(BLOCK_SIZE, eof - outPos)
        continue
      }
      copyDataBlock(blockNum)
    }
  }
  return out
}

const collectDirectoryBlocksFromStart = (disk: Uint8Array, startBlock: number): number[] => {
  const blocks: number[] = []
  let block = startBlock
  const visited = new Set<number>()
  const totalBlocks = Math.floor(disk.length / BLOCK_SIZE)

  while (block !== 0 && !visited.has(block)) {
    if (block < 0 || block >= totalBlocks) break
    visited.add(block)
    blocks.push(block)
    const dir = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
    block = readDirNextBlock(dir)
  }

  return blocks
}

const extractProDosFilesRecursive = (diskImage: Uint8Array): ExtractedProDosFile[] => {
  const extracted: ExtractedProDosFile[] = []
  const visitedDirectoryHeaders = new Set<number>()

  const walkDirectory = (dirBlocks: number[], pathParts: string[]) => {
    for (let b = 0; b < dirBlocks.length; b++) {
      const dirBlockNumber = dirBlocks[b]
      const dirBlock = readBlock(diskImage, dirBlockNumber)
      if (!dirBlock) continue
      const startIndex = b === 0 ? 1 : 0

      for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
        const entryOffset = getDirEntryOffset(slot)
        const byte0 = dirBlock[entryOffset]
        if (isDirectorySlotFree(byte0)) continue

        const storageType = ((byte0 >> 4) & 0x0F)
        const nameLength = byte0 & 0x0F
        if (nameLength < 1 || nameLength > 15) continue

        let name = ""
        for (let i = 0; i < nameLength; i++) {
          const c = dirBlock[entryOffset + 1 + i]
          if (c >= 0x20 && c <= 0x7E) name += String.fromCharCode(c)
        }
        if (!name) continue

        const fileType = dirBlock[entryOffset + 16]
        const keyBlock = readLittleEndian16(dirBlock, entryOffset + 17)
        const eof = readLittleEndian24(dirBlock, entryOffset + 21)
        const auxType = readLittleEndian16(dirBlock, entryOffset + 31)

        if (storageType === 0x0D && keyBlock > 0) {
          if (visitedDirectoryHeaders.has(keyBlock)) continue
          visitedDirectoryHeaders.add(keyBlock)
          const childDirBlocks = collectDirectoryBlocksFromStart(diskImage, keyBlock)
          if (childDirBlocks.length > 0) {
            walkDirectory(childDirBlocks, [...pathParts, name])
          }
          continue
        }

        if (storageType < 1 || storageType > 3) continue

        const data = readFileDataFromProDosImage(diskImage, storageType as 1 | 2 | 3, keyBlock, eof)
        extracted.push({
          name,
          relativePath: pathParts.length > 0 ? pathParts.join("/") : undefined,
          type: fileType,
          auxType,
          storageType: storageType as 1 | 2 | 3,
          eof,
          data,
        })
      }
    }
  }

  const rootBlocks = collectRootDirectoryBlocks(diskImage)
  if (rootBlocks.length === 0) return extracted
  walkDirectory(rootBlocks, [])

  return extracted
}

const SIX_AND_TWO_ENCODE = [
  0x96, 0x97, 0x9A, 0x9B, 0x9D, 0x9E, 0x9F, 0xA6,
  0xA7, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB2, 0xB3,
  0xB4, 0xB5, 0xB6, 0xB7, 0xB9, 0xBA, 0xBB, 0xBC,
  0xBD, 0xBE, 0xBF, 0xCB, 0xCD, 0xCE, 0xCF, 0xD3,
  0xD6, 0xD7, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE,
  0xDF, 0xE5, 0xE6, 0xE7, 0xE9, 0xEA, 0xEB, 0xEC,
  0xED, 0xEE, 0xEF, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6,
  0xF7, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF,
]

const SIX_AND_TWO_DECODE = (() => {
  const table = new Int16Array(256)
  table.fill(-1)
  for (let i = 0; i < SIX_AND_TWO_ENCODE.length; i++) {
    table[SIX_AND_TWO_ENCODE[i]] = i
  }
  return table
})()

const DOS_PHYSICAL_TO_LOGICAL = [0, 13, 11, 9, 7, 5, 3, 1, 14, 12, 10, 8, 6, 4, 2, 15]
const PRODOS_PHYSICAL_TO_LOGICAL = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]
const DOS_LOGICAL_TO_PHYSICAL = [0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15]
const PRODOS_LOGICAL_TO_PHYSICAL = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]
const ALLOW_RELAXED_WOZ_DOS_FALLBACK = false

const isLikelyDos33Volume = (data: Uint8Array): boolean => {
  if (data.length < (35 * 16 * 256)) return false

  const getSectorOffset = (track: number, sector: number, map: number[]) => {
    if (track < 0 || sector < 0 || sector > 15) return -1
    return (track * 16 + map[sector]) * 256
  }

  const matchesVtoc = (offset: number) => {
    if (offset < 0 || offset + 0x3A >= data.length) return false
    const catTrack = data[offset + 0x01]
    const catSector = data[offset + 0x02]
    const dosRelease = data[offset + 0x03]
    const maxTSPairs = data[offset + 0x27]
    const tracks = data[offset + 0x34]
    const sectorsPerTrack = data[offset + 0x35]
    const bytesPerSectorLo = data[offset + 0x36]
    const bytesPerSectorHi = data[offset + 0x37]
    const allocDirection = data[offset + 0x31]

    return (
      catTrack > 0 && catTrack < 35 &&
      catSector < 16 &&
      (dosRelease === 2 || dosRelease === 3 || dosRelease === 0) &&
      (maxTSPairs === 122 || maxTSPairs === 0) &&
      tracks === 35 &&
      sectorsPerTrack === 16 &&
      bytesPerSectorLo === 0 &&
      bytesPerSectorHi === 1 &&
      (allocDirection === 1 || allocDirection === 255 || allocDirection === 0)
    )
  }

  const dosOrderVtoc = getSectorOffset(17, 0, DOS_LOGICAL_TO_PHYSICAL)
  const prodosOrderVtoc = getSectorOffset(17, 0, PRODOS_LOGICAL_TO_PHYSICAL)
  return matchesVtoc(dosOrderVtoc) || matchesVtoc(prodosOrderVtoc)
}

const decode4and4 = (a: number, b: number) => (((a << 1) | 1) & b) & 0xFF

const decodeSixAndTwoSector = (encoded: Uint8Array): Uint8Array | undefined => {
  if (encoded.length < 343) return undefined

  const delta = new Uint8Array(343)
  for (let i = 0; i < 343; i++) {
    const v = SIX_AND_TWO_DECODE[encoded[i]]
    if (v < 0) return undefined
    delta[i] = v
  }

  const unxor = new Uint8Array(342)
  unxor[0] = delta[0]
  for (let i = 1; i <= 341; i++) {
    unxor[i] = delta[i] ^ unxor[i - 1]
  }
  if (delta[342] !== unxor[341]) return undefined

  const out = new Uint8Array(256)
  for (let i = 0; i < 256; i++) {
    out[i] = (unxor[86 + i] & 0x3F) << 2
  }

  const bitReverse = [0, 2, 1, 3]
  for (let c = 0; c < 84; c++) {
    const packed = unxor[c]
    out[c] |= bitReverse[(packed >> 0) & 0x03]
    out[c + 86] |= bitReverse[(packed >> 2) & 0x03]
    out[c + 172] |= bitReverse[(packed >> 4) & 0x03]
  }
  out[84] |= bitReverse[(unxor[84] >> 0) & 0x03]
  out[170] |= bitReverse[(unxor[84] >> 2) & 0x03]
  out[85] |= bitReverse[(unxor[85] >> 0) & 0x03]
  out[171] |= bitReverse[(unxor[85] >> 2) & 0x03]

  return out
}

type WozTrackBits = {
  bits: Uint8Array
  bitCount: number
}

const getWozTracks = (wozData: Uint8Array): Array<WozTrackBits | undefined> | undefined => {
  if (wozData.length < 256) return undefined
  const sig = String.fromCharCode(wozData[0], wozData[1], wozData[2], wozData[3])
  if (sig !== "WOZ1" && sig !== "WOZ2") return undefined

  let tmapOffset = -1
  let trksOffset = -1
  let ptr = 12
  while (ptr + 8 <= wozData.length) {
    const id = String.fromCharCode(wozData[ptr], wozData[ptr + 1], wozData[ptr + 2], wozData[ptr + 3])
    const size = readLittleEndian32(wozData, ptr + 4)
    const dataOffset = ptr + 8
    if (dataOffset + size > wozData.length) break
    if (id === "TMAP") tmapOffset = dataOffset
    if (id === "TRKS") trksOffset = dataOffset
    ptr = dataOffset + size
  }

  if (tmapOffset < 0 || trksOffset < 0) return undefined
  const tracks: Array<WozTrackBits | undefined> = new Array(160)

  for (let q = 0; q < 160; q++) {
    const tmapIndex = wozData[tmapOffset + q]
    if (tmapIndex === undefined || tmapIndex >= 0xFF) continue

    if (sig === "WOZ2") {
      const meta = trksOffset + (tmapIndex * 8)
      if (meta + 8 > wozData.length) continue
      const startBlock = readLittleEndian16(wozData, meta)
      const blockCount = readLittleEndian16(wozData, meta + 2)
      const bitCount = readLittleEndian32(wozData, meta + 4)
      const start = startBlock * 512
      const byteCount = Math.max(1, Math.ceil(bitCount / 8))
      if (blockCount <= 0 || bitCount <= 0 || start + byteCount > wozData.length) continue
      tracks[q] = { bits: wozData.slice(start, start + byteCount), bitCount }
    } else {
      const start = trksOffset + (tmapIndex * 6656)
      if (start + 6656 > wozData.length) continue
      const bitCount = readLittleEndian16(wozData, start + 6648)
      const byteCount = Math.max(1, Math.ceil(bitCount / 8))
      if (bitCount <= 0 || start + byteCount > wozData.length) continue
      tracks[q] = { bits: wozData.slice(start, start + byteCount), bitCount }
    }
  }

  return tracks
}

const getBit = (bits: Uint8Array, bitPos: number, bitCount: number) => {
  if (bitCount <= 0) return 0
  const wrapped = ((bitPos % bitCount) + bitCount) % bitCount
  const bytePos = wrapped >> 3
  const shift = 7 - (wrapped & 7)
  if (bytePos < 0 || bytePos >= bits.length) return 0
  return (bits[bytePos] >> shift) & 1
}

const getByteAtBit = (bits: Uint8Array, bitPos: number, bitCount: number) => {
  let value = 0
  for (let i = 0; i < 8; i++) {
    value = (value << 1) | getBit(bits, bitPos + i, bitCount)
  }
  return value
}

const isLikelyProDosVolume = (data: Uint8Array): boolean => {
  if (data.length < (3 * 512)) return false

  const totalBlocksFromSize = Math.floor(data.length / 512)
  const root = 2 * 512
  const nextBlock = data[root + 2] | (data[root + 3] << 8)
  const entry0 = root + 4
  const byte0 = data[entry0]
  const storageType = (byte0 >> 4) & 0x0F
  const nameLen = byte0 & 0x0F

  if (storageType !== 0x0F || nameLen < 1 || nameLen > 15) return false
  if (nextBlock !== 0 && (nextBlock < 2 || nextBlock > totalBlocksFromSize)) return false

  for (let i = 0; i < nameLen; i++) {
    const c = data[entry0 + 1 + i]
    if (c < 0x20 || c > 0x7E) return false
  }

  const bitmapBlock = data[entry0 + 35] | (data[entry0 + 36] << 8)
  const totalBlocks = data[entry0 + 37] | (data[entry0 + 38] << 8)
  if (totalBlocks < totalBlocksFromSize || totalBlocks > 65535) return false
  if (bitmapBlock < 2 || bitmapBlock > totalBlocks) return false
  return true
}

const decodeWozToSectorCandidates = (wozData: Uint8Array): { candidates: Array<{ label: string, data: Uint8Array }>, decodedSectorCount: number } | undefined => {
  const tracks = getWozTracks(wozData)
  if (!tracks) return undefined

  const dosPhysicalToLogical = new Uint8Array(35 * 16 * 256)
  const prodosPhysicalToLogical = new Uint8Array(35 * 16 * 256)
  const dosLogicalToPhysical = new Uint8Array(35 * 16 * 256)
  const prodosLogicalToPhysical = new Uint8Array(35 * 16 * 256)
  const seen = new Set<string>()

  for (let q = 0; q < tracks.length; q++) {
    const track = tracks[q]
    if (!track || track.bitCount < 5000) continue

    let pendingTrack = -1
    let pendingSector = -1
    let pendingBitPos = -1

    // Prologues are not guaranteed to be byte-aligned in the captured bitstream.
    // Scan every bit so we do not miss valid address/data fields on shifted tracks.
    for (let bitPos = 0; bitPos < track.bitCount; bitPos++) {
      const b0 = getByteAtBit(track.bits, bitPos, track.bitCount)
      const b1 = getByteAtBit(track.bits, bitPos + 8, track.bitCount)
      const b2 = getByteAtBit(track.bits, bitPos + 16, track.bitCount)

      // Address prologue: D5 AA 96
      if (b0 === 0xD5 && b1 === 0xAA && b2 === 0x96) {
        const vol = decode4and4(
          getByteAtBit(track.bits, bitPos + 24, track.bitCount),
          getByteAtBit(track.bits, bitPos + 32, track.bitCount)
        )
        const addrTrack = decode4and4(
          getByteAtBit(track.bits, bitPos + 40, track.bitCount),
          getByteAtBit(track.bits, bitPos + 48, track.bitCount)
        )
        const addrSector = decode4and4(
          getByteAtBit(track.bits, bitPos + 56, track.bitCount),
          getByteAtBit(track.bits, bitPos + 64, track.bitCount)
        )
        const checksum = decode4and4(
          getByteAtBit(track.bits, bitPos + 72, track.bitCount),
          getByteAtBit(track.bits, bitPos + 80, track.bitCount)
        )

        if (((vol ^ addrTrack ^ addrSector) & 0xFF) === checksum &&
          addrTrack >= 0 && addrTrack < 35 &&
          addrSector >= 0 && addrSector < 16) {
          pendingTrack = addrTrack
          pendingSector = addrSector
          pendingBitPos = bitPos
        }
        continue
      }

      // Data prologue: D5 AA AD
      if (b0 === 0xD5 && b1 === 0xAA && b2 === 0xAD) {
        if (pendingTrack < 0 || pendingSector < 0) continue
        // Require proximity to reduce false pairings.
        if (pendingBitPos >= 0 && bitPos - pendingBitPos > (700 * 8)) continue

        const encoded = new Uint8Array(343)
        for (let i = 0; i < 343; i++) {
          encoded[i] = getByteAtBit(track.bits, bitPos + 24 + (i * 8), track.bitCount)
        }
        const decoded = decodeSixAndTwoSector(encoded)
        if (!decoded) continue

        const key = `${pendingTrack}:${pendingSector}`
        if (seen.has(key)) continue
        seen.add(key)

        const dosLogical = DOS_PHYSICAL_TO_LOGICAL[pendingSector]
        const prodosLogical = PRODOS_PHYSICAL_TO_LOGICAL[pendingSector]
        const dosPhysical = DOS_LOGICAL_TO_PHYSICAL[pendingSector]
        const prodosPhysical = PRODOS_LOGICAL_TO_PHYSICAL[pendingSector]

        dosPhysicalToLogical.set(decoded, ((pendingTrack * 16) + dosLogical) * 256)
        prodosPhysicalToLogical.set(decoded, ((pendingTrack * 16) + prodosLogical) * 256)
        dosLogicalToPhysical.set(decoded, ((pendingTrack * 16) + dosPhysical) * 256)
        prodosLogicalToPhysical.set(decoded, ((pendingTrack * 16) + prodosPhysical) * 256)
      }
    }
  }

  if (seen.size === 0) return undefined

  return {
    candidates: [
      { label: "prodos-physical-to-logical", data: prodosPhysicalToLogical },
      { label: "dos-physical-to-logical", data: dosPhysicalToLogical },
      { label: "prodos-logical-to-physical", data: prodosLogicalToPhysical },
      { label: "dos-logical-to-physical", data: dosLogicalToPhysical },
    ],
    decodedSectorCount: seen.size,
  }
}

export const loadWozAndExtractProDosFiles = (wozData: Uint8Array): ImportedDiskFile[] => {
  const decoded = decodeWozToSectorCandidates(wozData)
  if (!decoded) return []

  let headerMatches = 0
  for (const candidate of decoded.candidates) {
    if (!isLikelyProDosVolume(candidate.data)) continue
    headerMatches++

    const extracted = extractProDosFilesRecursive(candidate.data)
    if (extracted.length > 0) {
      console.log(`[HDV Export] WOZ ProDOS candidate matched: ${candidate.label} (${extracted.length} files, ${decoded.decodedSectorCount} sectors decoded)`)
      return extracted.map((file) => ({
        name: file.name,
        relativePath: file.relativePath,
        type: file.type,
        auxType: file.auxType,
        data: file.data,
      }))
    }
  }

  console.log(`[HDV Export] WOZ decode failed ProDOS extraction: ${decoded.decodedSectorCount} sectors decoded, ${headerMatches} ProDOS-header candidates, 0 files extracted`)
  return []
}

const decodeWozToDosImage = (wozData: Uint8Array): Uint8Array | undefined => {
  const decoded = decodeWozToSectorCandidates(wozData)
  if (!decoded) return undefined

  for (const candidate of decoded.candidates) {
    if (!candidate.label.startsWith("dos")) continue
    if (!isLikelyDos33Volume(candidate.data)) continue
    console.log(`[HDV Export] WOZ DOS candidate matched: ${candidate.label} (${decoded.decodedSectorCount} sectors decoded)`)
    return candidate.data
  }

  for (const candidate of decoded.candidates) {
    if (!isLikelyDos33Volume(candidate.data)) continue
    console.log(`[HDV Export] WOZ DOS candidate fallback matched: ${candidate.label} (${decoded.decodedSectorCount} sectors decoded)`)
    return candidate.data
  }

  // Optional last resort: allow DOS-sector-order payload even without recognizable VTOC.
  if (ALLOW_RELAXED_WOZ_DOS_FALLBACK) {
    // Use startsWith("dos") to avoid matching "prodos" which has wrong sector interleave for DOS.
    const relaxedDosCandidate = decoded.candidates.find((candidate) => candidate.label.startsWith("dos"))
    if (relaxedDosCandidate) {
      console.warn(
        `[HDV Export] WOZ DOS relaxed fallback used: ${relaxedDosCandidate.label} (${decoded.decodedSectorCount} sectors decoded, no DOS VTOC signature)`
      )
      return relaxedDosCandidate.data
    }
  }

  return undefined
}

const decodeWozToProDosImage = (wozData: Uint8Array): Uint8Array | undefined => {
  const decoded = decodeWozToSectorCandidates(wozData)
  if (!decoded) return undefined

  for (const candidate of decoded.candidates) {
    if (!candidate.label.includes("prodos")) continue
    if (!isLikelyProDosVolume(candidate.data)) continue
    console.log(`[HDV Export] WOZ ProDOS image candidate matched: ${candidate.label} (${decoded.decodedSectorCount} sectors decoded)`)
    return candidate.data
  }

  for (const candidate of decoded.candidates) {
    if (!isLikelyProDosVolume(candidate.data)) continue
    console.log(`[HDV Export] WOZ ProDOS image candidate fallback matched: ${candidate.label} (${decoded.decodedSectorCount} sectors decoded)`)
    return candidate.data
  }

  return undefined
}

// Tokenizer and PATH rewriting removed - using multi-volume approach instead



// Multi-volume approach: each disk is its own volume, no subdirectories or path rewriting needed
type VolumeData = {
  volumeName: string
  files: BuildInputFile[]
  sourceKind: "dos" | "prodos" | "unknown"
  sourceMenuIndex: number
  sourceImageData?: Uint8Array
  sourceFilename?: string
}

const chooseProDosLaunchCommands = (volumeName: string, files: BuildInputFile[]) => {
  if (files.length === 0) return undefined

  const normalizedVolumeBase = normalizeProDosFilename(volumeName).split(".")[0]
  const scoreCandidate = (file: BuildInputFile) => {
    const name = normalizeProDosFilename(file.name)
    let score = 0
    if (name === normalizedVolumeBase) score += 100
    if (name === `${normalizedVolumeBase}.SYSTEM`) score += 90
    if (name.endsWith(".SYSTEM")) score += 20
    if (!name.includes(".")) score += 10
    return score
  }

  const pickBestByType = (type: number) => {
    const candidates = files.filter((file) => file.type === type)
    if (candidates.length === 0) return undefined
    return candidates.reduce((best, current) => {
      return scoreCandidate(current) > scoreCandidate(best) ? current : best
    })
  }

  const sysFile = pickBestByType(0xFF)
  if (sysFile) return [`-${normalizeProDosFilename(sysFile.name)}`]

  const binaryFile = pickBestByType(PRODOS_FILE_TYPE_BINARY)
  if (binaryFile) return [`BRUN ${normalizeProDosFilename(binaryFile.name)}`]

  const textFile = pickBestByType(PRODOS_FILE_TYPE_TEXT)
  if (textFile) return [`EXEC ${normalizeProDosFilename(textFile.name)}`]

  return undefined
}

const preprocessInputFilesForMenu = (
  files: BuildInputFile[],
  menuEntries?: MenuDiskEntry[],
  reservedNames?: Set<string>
) => {
  const volumes: VolumeData[] = []
  const rootFiles: BuildInputFile[] = []
  const usedNames = new Set<string>(reservedNames || [])

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const kind = menuEntries?.[i]?.imageKind || "unknown"
    const filename = menuEntries?.[i]?.filename || file.name
    const sourceFilename = menuEntries?.[i]?.sourceFilename || filename
    const isWozContainer = sourceFilename.toLowerCase().endsWith(".woz")
    const wozExtractedFiles = menuEntries?.[i]?.wozExtractedProDosFiles

    // Check if this is a ProDOS volume we should extract
    if (wozExtractedFiles && wozExtractedFiles.length > 0) {
      const volumeName = makeUniqueProDosFilename(normalizeProDosFilename(filename).split(".")[0] || "IMG", usedNames)
      const volumeFiles: BuildInputFile[] = []
      const SYSTEM_FILES_TO_SKIP = new Set(["PRODOS", "LOADER.SYSTEM"])
      
      for (const extractedFile of wozExtractedFiles) {
        if (SYSTEM_FILES_TO_SKIP.has(extractedFile.name)) continue
        volumeFiles.push({
          name: normalizeProDosFilename(extractedFile.name),
          type: extractedFile.type,
          data: extractedFile.data,
          auxType: extractedFile.auxType,
        })
      }

      volumes.push({
        volumeName,
        files: volumeFiles,
        sourceKind: "prodos",
        sourceMenuIndex: i,
        sourceImageData: file.data,
        sourceFilename,
      })
      console.log(`[HDV Export] WOZ volume: ${filename} -> ${volumeName} (${volumeFiles.length} files)`)
      continue
    }

    if (isWozContainer) {
      const name = makeUniqueProDosFilename(filename, usedNames)
      rootFiles.push({ ...file, name, sourceMenuIndex: i })
      continue
    }

    // Try ProDOS extraction
    const shouldTryProDosImport = kind === "prodos" || isLikelyProDosVolume(file.data)
    if (shouldTryProDosImport) {
      const extracted = extractProDosFilesRecursive(file.data)
      if (extracted.length > 0) {
        const volumeName = makeUniqueProDosFilename(normalizeProDosFilename(filename).split(".")[0] || "IMG", usedNames)
        const volumeFiles: BuildInputFile[] = []
        const SYSTEM_FILES_TO_SKIP = new Set(["PRODOS", "LOADER.SYSTEM"])
        
        for (const extractedFile of extracted) {
          if (SYSTEM_FILES_TO_SKIP.has(extractedFile.name)) continue
          volumeFiles.push({
            name: normalizeProDosFilename(extractedFile.name),
            type: extractedFile.type,
            data: extractedFile.data,
            auxType: extractedFile.auxType,
          })
        }

        volumes.push({
          volumeName,
          files: volumeFiles,
          sourceKind: "prodos",
          sourceMenuIndex: i,
          sourceImageData: file.data,
          sourceFilename,
        })
        console.log(`[HDV Export] ProDOS volume: ${filename} -> ${volumeName} (${volumeFiles.length} files)`)
        continue
      }
    }

    // Skip DOS images (use base image DOS.MASTER instead); keep other non-extractable files in root
    const isDosImage = kind === "dos"
    if (!isDosImage) {
      const name = makeUniqueProDosFilename(filename, usedNames)
      rootFiles.push({ ...file, name, sourceMenuIndex: i })
      console.log(`[HDV Export] Root file: ${filename} -> ${name} (${kind})`)
    } else {
      console.log(`[HDV Export] Skipped DOS image: ${filename} (use base image DOS.MASTER)`)
    }
  }

  console.log(`[HDV Export] Multi-volume summary: ${volumes.length} volumes, ${rootFiles.length} root files`)
  return { volumes, rootFiles }
}
const encodeProDosTime = (date: Date = new Date()) => {
  const year = Math.max(0, Math.min(127, date.getFullYear() - 1900))
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = Math.floor(date.getSeconds() / 2)

  const dateWord = (year << 9) | (month << 5) | day
  // ProDOS time: bits 0-4: second/2, bits 5-10: minute, bits 11-15: hour
  const timeWord = (hour << 11) | (minute << 5) | second

  return { dateWord, timeWord }
}

const createLauncherBinary = () => {
  // Loaded at $2000 and executed via BRUN.
  // Prints a banner with available disks and returns to BASIC.SYSTEM.
  const code = new Uint8Array([
    0xA2, 0x00,       // LDX #$00
    0xBD, 0x10, 0x20, // LDA $2010,X
    0xF0, 0x08,       // BEQ done
    0x09, 0x80,       // ORA #$80 (Apple text output expects high bit)
    0x20, 0xED, 0xFD, // JSR $FDED (COUT)
    0xE8,             // INX
    0xD0, 0xF3,       // BNE loop
    0x60,             // RTS
  ])

  const text = "APPLE2TS DISK MENU\rUSE CATALOG TO SEE AVAILABLE DISKS\r\0"
  const message = new Uint8Array(text.length)
  for (let i = 0; i < text.length; i++) {
    message[i] = text.charCodeAt(i)
  }

  const result = new Uint8Array(code.length + message.length)
  result.set(code)
  result.set(message, code.length)
  return result
}

/**
 * Creates a single file entry for the ProDOS directory
 */
const createFileEntry = (
  filename: string,
  fileType: number,
  keyBlock: number,
  fileSize: number,
  blocksUsed: number,
  headerPointer: number,
  storageType: 1 | 2 | 3,
  auxType: number = 0x0000
): Uint8Array => {
  const entry = new Uint8Array(39)
  
  const nameBytes = filename.toUpperCase().slice(0, 15).split("").map(c => c.charCodeAt(0))
  
  // 1 = seedling, 2 = sapling, 3 = tree
  
  // Byte 0: Storage type (high nibble) + name length (low nibble)
  entry[0] = (storageType << 4) | nameBytes.length
  
  // Bytes 1-15: Filename
  for (let i = 0; i < nameBytes.length; i++) {
    entry[1 + i] = nameBytes[i]
  }
  
  // Byte 16: File type (e.g. BIN=0x06, TXT=0x04)
  entry[16] = fileType
  
  // Bytes 17-18: Key block pointer
  writeLittleEndian16(entry, 17, keyBlock)

  // Bytes 19-20: Blocks used
  writeLittleEndian16(entry, 19, blocksUsed)
  
  // Bytes 21-23: EOF (file length in bytes)
  writeLittleEndian24(entry, 21, fileSize)
  
  // Bytes 24-27: Creation date/time
  const now = encodeProDosTime()
  writeLittleEndian16(entry, 24, now.dateWord)
  writeLittleEndian16(entry, 26, now.timeWord)
  
  // Byte 28: Version
  entry[28] = 0x00
  
  // Byte 29: Min version
  entry[29] = 0x00
  
  // Byte 30: Access
  entry[30] = 0xE3
  
  // Bytes 31-32: Aux type
  writeLittleEndian16(entry, 31, auxType)
  
  // Bytes 33-36: Modification date/time
  writeLittleEndian16(entry, 33, now.dateWord)
  writeLittleEndian16(entry, 35, now.timeWord)
  
  // Bytes 37-38: Header pointer (directory block containing this entry)
  writeLittleEndian16(entry, 37, headerPointer)
  
  return entry
}

// Directory entry and template functions removed - using multi-volume approach

// Directory functions removed - using multi-volume approach

const BLOCK_SIZE = 512
const ROOT_DIR_BLOCK = 2
const DIR_HEADER_SIZE = 4
const DIR_ENTRY_SIZE = 39
const DIR_ENTRIES_PER_BLOCK = 13

const getDirEntryOffset = (entryIndex: number) => DIR_HEADER_SIZE + (entryIndex * DIR_ENTRY_SIZE)

const isDirectorySlotFree = (entryByte0: number) => ((entryByte0 >> 4) & 0x0F) === 0

const isBlockFreeInBitmap = (disk: Uint8Array, bitmapStartBlock: number, blockNum: number) => {
  const bitsPerBitmapBlock = BLOCK_SIZE * 8
  const bitmapBlockIndex = Math.floor(blockNum / bitsPerBitmapBlock)
  const bitIndex = blockNum % bitsPerBitmapBlock
  const byteIndex = Math.floor(bitIndex / 8)
  const bitInByte = 7 - (bitIndex % 8)
  const bitmapByteOffset = ((bitmapStartBlock + bitmapBlockIndex) * BLOCK_SIZE) + byteIndex
  if (bitmapByteOffset < 0 || bitmapByteOffset >= disk.length) return false
  return (disk[bitmapByteOffset] & (1 << bitInByte)) !== 0
}

const setBlockUsedInBitmap = (disk: Uint8Array, bitmapStartBlock: number, blockNum: number) => {
  const bitsPerBitmapBlock = BLOCK_SIZE * 8
  const bitmapBlockIndex = Math.floor(blockNum / bitsPerBitmapBlock)
  const bitIndex = blockNum % bitsPerBitmapBlock
  const byteIndex = Math.floor(bitIndex / 8)
  const bitInByte = 7 - (bitIndex % 8)
  const bitmapByteOffset = ((bitmapStartBlock + bitmapBlockIndex) * BLOCK_SIZE) + byteIndex
  if (bitmapByteOffset < 0 || bitmapByteOffset >= disk.length) return
  disk[bitmapByteOffset] &= ~(1 << bitInByte)
}

const readDirNextBlock = (dirBlock: Uint8Array) => readLittleEndian16(dirBlock, 2)

const collectRootDirectoryBlocks = (disk: Uint8Array) => {
  const blocks: number[] = []
  let block = ROOT_DIR_BLOCK
  const visited = new Set<number>()
  const totalBlocks = Math.floor(disk.length / BLOCK_SIZE)

  while (block !== 0 && !visited.has(block)) {
    if (block < 0 || block >= totalBlocks) break
    visited.add(block)
    blocks.push(block)
    const dir = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
    block = readDirNextBlock(dir)
  }

  return blocks
}

const readDirectoryEntryName = (entry: Uint8Array) => {
  const nameLength = entry[0] & 0x0F
  let name = ""
  for (let i = 0; i < nameLength; i++) {
    name += String.fromCharCode(entry[1 + i])
  }
  return name
}

const findDirectoryKeyBlockByName = (disk: Uint8Array, dirBlocks: number[], directoryName: string) => {
  for (let b = 0; b < dirBlocks.length; b++) {
    const block = dirBlocks[b]
    const dirBlock = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
      const entryOffset = getDirEntryOffset(slot)
      const byte0 = dirBlock[entryOffset]
      if (isDirectorySlotFree(byte0)) continue
      const storageType = ((byte0 >> 4) & 0x0F)
      if (storageType !== 0x0D) continue

      const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
      const name = readDirectoryEntryName(entry)
      if (name !== directoryName) continue
      return readLittleEndian16(entry, 17)
    }
  }
  return undefined
}

type ProDosFileLocation = {
  storageType: 1 | 2 | 3
  keyBlock: number
  eof: number
}

type ProDosFileEntryMetadata = ProDosFileLocation & {
  blocksUsed: number
  headerPointer: number
  fileType: number
}

const findFileEntryMetadataByPath = (disk: Uint8Array, pathParts: string[]): ProDosFileEntryMetadata | undefined => {
  if (pathParts.length === 0) return undefined

  const findEntryInDirectory = (dirBlocks: number[], name: string) => {
    for (let b = 0; b < dirBlocks.length; b++) {
      const block = dirBlocks[b]
      const dirBlock = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
      const startIndex = b === 0 ? 1 : 0
      for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
        const entryOffset = getDirEntryOffset(slot)
        const byte0 = dirBlock[entryOffset]
        if (isDirectorySlotFree(byte0)) continue

        const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
        const entryName = readDirectoryEntryName(entry)
        if (entryName !== name) continue

        const storageType = ((byte0 >> 4) & 0x0F)
        return {
          storageType,
          keyBlock: readLittleEndian16(entry, 17),
          blocksUsed: readLittleEndian16(entry, 19),
          eof: readLittleEndian24(entry, 21),
          fileType: entry[16],
          headerPointer: readLittleEndian16(entry, 37),
        }
      }
    }
    return undefined
  }

  let currentDirBlocks = collectRootDirectoryBlocks(disk)
  if (currentDirBlocks.length === 0) return undefined

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    const found = findEntryInDirectory(currentDirBlocks, part)
    if (!found) return undefined
    const isLast = i === pathParts.length - 1
    if (isLast) {
      if (found.storageType < 1 || found.storageType > 3) return undefined
      return {
        storageType: found.storageType as 1 | 2 | 3,
        keyBlock: found.keyBlock,
        blocksUsed: found.blocksUsed,
        eof: found.eof,
        fileType: found.fileType,
        headerPointer: found.headerPointer,
      }
    }
    if (found.storageType !== 0x0D || found.keyBlock <= 0) return undefined
    currentDirBlocks = collectDirectoryBlocksFromStart(disk, found.keyBlock)
    if (currentDirBlocks.length === 0) return undefined
  }

  return undefined
}

const findFileByPath = (disk: Uint8Array, pathParts: string[]): ProDosFileLocation | undefined => {
  if (pathParts.length === 0) return undefined

  const findEntryInDirectory = (dirBlocks: number[], name: string) => {
    for (let b = 0; b < dirBlocks.length; b++) {
      const block = dirBlocks[b]
      const dirBlock = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
      const startIndex = b === 0 ? 1 : 0
      for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
        const entryOffset = getDirEntryOffset(slot)
        const byte0 = dirBlock[entryOffset]
        if (isDirectorySlotFree(byte0)) continue

        const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
        const entryName = readDirectoryEntryName(entry)
        if (entryName !== name) continue

        const storageType = ((byte0 >> 4) & 0x0F)
        return {
          storageType,
          keyBlock: readLittleEndian16(entry, 17),
          eof: readLittleEndian24(entry, 21),
        }
      }
    }
    return undefined
  }

  let currentDirBlocks = collectRootDirectoryBlocks(disk)
  if (currentDirBlocks.length === 0) return undefined

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i]
    const found = findEntryInDirectory(currentDirBlocks, part)
    if (!found) return undefined
    const isLast = i === pathParts.length - 1
    if (isLast) {
      if (found.storageType < 1 || found.storageType > 3) return undefined
      return {
        storageType: found.storageType as 1 | 2 | 3,
        keyBlock: found.keyBlock,
        eof: found.eof,
      }
    }
    if (found.storageType !== 0x0D || found.keyBlock <= 0) return undefined
    currentDirBlocks = collectDirectoryBlocksFromStart(disk, found.keyBlock)
    if (currentDirBlocks.length === 0) return undefined
  }
  return undefined
}

const writeFileDataToProDosImage = (
  disk: Uint8Array,
  location: ProDosFileLocation,
  data: Uint8Array,
) => {
  const writeDataBlock = (blockNum: number, sourceOffset: number) => {
    if (blockNum === 0 || sourceOffset >= data.length) return
    const blockOffset = blockNum * BLOCK_SIZE
    const n = Math.min(BLOCK_SIZE, data.length - sourceOffset)
    disk.fill(0, blockOffset, blockOffset + BLOCK_SIZE)
    disk.set(data.slice(sourceOffset, sourceOffset + n), blockOffset)
  }

  if (location.storageType === 1) {
    writeDataBlock(location.keyBlock, 0)
    return
  }

  if (location.storageType === 2) {
    const indexBlock = readBlock(disk, location.keyBlock)
    if (!indexBlock) return
    for (let i = 0; i < 256; i++) {
      const blockNum = indexBlock[i] | (indexBlock[256 + i] << 8)
      writeDataBlock(blockNum, i * BLOCK_SIZE)
    }
    return
  }

  const masterBlock = readBlock(disk, location.keyBlock)
  if (!masterBlock) return
  for (let i = 0; i < 256; i++) {
    const indexBlockNum = masterBlock[i] | (masterBlock[256 + i] << 8)
    if (indexBlockNum === 0) continue
    const indexBlock = readBlock(disk, indexBlockNum)
    if (!indexBlock) continue
    for (let j = 0; j < 256; j++) {
      const blockNum = indexBlock[j] | (indexBlock[256 + j] << 8)
      writeDataBlock(blockNum, ((i * 256) + j) * BLOCK_SIZE)
    }
  }
}

type DosMasterPatchResult = {
  requestedVolumes: number
  mappedVolumes: number
  activePairs: number
  patchedTargets: number
}

type DosMasterPatchFailure = {
  error: string
}

type DosMasterPatchSkip = {
  skipped: true
  reason: string
}

type DosMasterPairAllocation = {
  pairIndex: number
  volSizeBlocks: number
  mappedVolumes: number
  mappedBlocks: number
}

export const computeDosMasterPairAllocation = (
  runtimeVolumeCount: number,
  pairVolSizes: number[],
  fallbackVolSizeBlocks = 280,
) => {
  const requestedVolumes = Math.max(0, runtimeVolumeCount)
  const safeFallbackVolSizeBlocks =
    fallbackVolSizeBlocks > 0 && fallbackVolSizeBlocks <= 1600
      ? fallbackVolSizeBlocks
      : 280
  let remainingVolumes = requestedVolumes
  const allocations: DosMasterPairAllocation[] = []

  for (let i = 0; i < pairVolSizes.length; i++) {
    let volSizeBlocks = pairVolSizes[i]
    if (volSizeBlocks <= 0 || volSizeBlocks > 1600) volSizeBlocks = safeFallbackVolSizeBlocks

    const maxVolumesForPair = Math.max(1, Math.floor(0xFFFF / volSizeBlocks))
    const mappedVolumes = Math.min(remainingVolumes, maxVolumesForPair)
    const mappedBlocks = mappedVolumes > 0 ? mappedVolumes * volSizeBlocks : 0

    allocations.push({
      pairIndex: i,
      volSizeBlocks,
      mappedVolumes,
      mappedBlocks,
    })
    remainingVolumes -= mappedVolumes
  }

  return {
    allocations,
    requestedVolumes,
    mappedVolumes: requestedVolumes - remainingVolumes,
    unmappedVolumes: remainingVolumes,
  }
}

const patchDosMasterDos33Configuration = (disk: Uint8Array, runtimeVolumeCount: number): DosMasterPatchResult | DosMasterPatchFailure => {
  // runtimeVolumeCount=0 is valid: zeros out NUM_BLOCKS so DOS.MASTER doesn't try to access non-existent volumes.
  const safeVolumeCount = Math.max(0, runtimeVolumeCount)

  const TABLE_DEV_OFFSET = 0x38
  const TABLE_NUM_BLOCKS_OFFSET = 0x50
  const TABLE_VOL_SIZE_OFFSET = 0x58

  const patchFinderDataCompanionMetadata = () => {
    const finderLocation =
      findFileByPath(disk, ["DOS.MASTER", "FINDER.DATA"]) ||
      findFileByPath(disk, ["FINDER.DATA"])
    if (!finderLocation) return 0

    const finderData = readFileDataFromProDosImage(
      disk,
      finderLocation.storageType,
      finderLocation.keyBlock,
      finderLocation.eof,
    )
    if (finderData.length === 0) return 0

    const patchFinderRecord = (name: string, blocksUsed: number, keyBlock: number) => {
      const encodedName = new TextEncoder().encode(name)
      let patched = 0
      for (let offset = 0; offset + 1 + encodedName.length + 7 < finderData.length; offset++) {
        if (finderData[offset] !== encodedName.length) continue
        let match = true
        for (let i = 0; i < encodedName.length; i++) {
          if (finderData[offset + 1 + i] !== encodedName[i]) {
            match = false
            break
          }
        }
        if (!match) continue

        // Record layout contains 4 words after a marker byte; update blocks used and key block.
        writeLittleEndian16(finderData, offset + 1 + encodedName.length + 1, blocksUsed)
        writeLittleEndian16(finderData, offset + 1 + encodedName.length + 5, keyBlock)
        patched++
      }
      return patched
    }

    let patchedRecords = 0
    const metadataTargets = ["DOS.3.3", "DDOS.3.3"]
    for (const name of metadataTargets) {
      const entry =
        findFileEntryMetadataByPath(disk, ["DOS.MASTER", name]) ||
        findFileEntryMetadataByPath(disk, [name])
      if (!entry) continue
      patchedRecords += patchFinderRecord(name, entry.blocksUsed, entry.keyBlock)
    }

    if (patchedRecords > 0) {
      writeFileDataToProDosImage(disk, finderLocation, finderData)
    }
    return patchedRecords
  }

  const patchSingleDosMasterConfigPayload = (payload: Uint8Array, targetName: string):
    | {
      patched: Uint8Array
      mappedVolumes: number
      activePairs: number
      unmappedVolumes: number
      pairSummaries: string[]
      expectedNumBlocks: number[]
    }
    | DosMasterPatchSkip
    | DosMasterPatchFailure => {
    if (payload.length < 0x60) return { error: `${targetName} payload too small to patch configuration table (${payload.length} bytes < 0x60).` }

    const patched = payload.slice()
    const readWord = (offset: number) => patched[offset] | (patched[offset + 1] << 8)
    const writeWord = (offset: number, value: number) => {
      patched[offset] = value & 0xFF
      patched[offset + 1] = (value >> 8) & 0xFF
    }

    // Log device pair configuration before patching for debugging
    const devPairsBefore = []
    for (let pair = 0; pair < 4; pair++) {
      devPairsBefore.push(`P${pair}:$${patched[TABLE_DEV_OFFSET + pair * 2].toString(16).padStart(2, '0')}$${patched[TABLE_DEV_OFFSET + pair * 2 + 1].toString(16).padStart(2, '0')}`)
    }

    const activePairIndices: number[] = []
    for (let pair = 0; pair < 4; pair++) {
      const d1 = patched[TABLE_DEV_OFFSET + (pair * 2)]
      const d2 = patched[TABLE_DEV_OFFSET + (pair * 2) + 1]
      if (d1 !== 0 || d2 !== 0) activePairIndices.push(pair)
    }
    if (activePairIndices.length === 0) {
      return {
        skipped: true,
        reason: `${targetName} has no active DOS.MASTER device pairs. Device pairs before patch: ${devPairsBefore.join(", ")}`,
      }
    }

    const primaryPair = activePairIndices[0]
    const primaryVolSizeOffset = TABLE_VOL_SIZE_OFFSET + (primaryPair * 2)
    let fallbackVolSizeBlocks = readWord(primaryVolSizeOffset)
    if (fallbackVolSizeBlocks <= 0 || fallbackVolSizeBlocks > 1600) fallbackVolSizeBlocks = 280

    const pairVolSizes = activePairIndices.map((pair) => readWord(TABLE_VOL_SIZE_OFFSET + (pair * 2)))
    const allocation = computeDosMasterPairAllocation(safeVolumeCount, pairVolSizes, fallbackVolSizeBlocks)

    const pairSummaries: string[] = []
    const expectedNumBlocks = [0, 0, 0, 0]
    for (let i = 0; i < activePairIndices.length; i++) {
      const pair = activePairIndices[i]
      const numBlocksOffset = TABLE_NUM_BLOCKS_OFFSET + (pair * 2)
      const pairAllocation = allocation.allocations[i]
      writeWord(numBlocksOffset, pairAllocation.mappedBlocks)
      expectedNumBlocks[pair] = pairAllocation.mappedBlocks
      pairSummaries.push(`P${pair + 1}:V=${pairAllocation.mappedVolumes},B=${pairAllocation.mappedBlocks},S=${pairAllocation.volSizeBlocks}`)
    }

    // Disable non-active pairs so stale defaults do not expose phantom volumes.
    const activePairSet = new Set(activePairIndices)
    for (let pair = 0; pair < 4; pair++) {
      if (activePairSet.has(pair)) continue
      const numBlocksOffset = TABLE_NUM_BLOCKS_OFFSET + (pair * 2)
      writeWord(numBlocksOffset, 0)
      expectedNumBlocks[pair] = 0
    }

    return {
      patched,
      mappedVolumes: allocation.mappedVolumes,
      activePairs: activePairIndices.length,
      unmappedVolumes: allocation.unmappedVolumes,
      pairSummaries,
      expectedNumBlocks,
    }
  }

  const verifyPatchedConfigPayload = (payload: Uint8Array, expectedNumBlocks: number[], targetName: string) => {
    if (payload.length < 0x60) {
      return { error: `${targetName} payload too small during post-write verification (${payload.length} bytes < 0x60).` }
    }
    for (let pair = 0; pair < 4; pair++) {
      const offset = TABLE_NUM_BLOCKS_OFFSET + (pair * 2)
      const actual = payload[offset] | (payload[offset + 1] << 8)
      const expected = expectedNumBlocks[pair] || 0
      if (actual !== expected) {
        return {
          error: `${targetName} post-write verification failed for pair ${pair + 1}: expected NUM_BLOCKS=${expected}, got ${actual}.`,
        }
      }
    }
    return undefined
  }

  const configTargets = [
    { path: ["DOS.MASTER", "DOS.MASTER"], label: "DOS.MASTER/DOS.MASTER" },
    { path: ["DOS.MASTER", "DOS.3.3"], label: "DOS.MASTER/DOS.3.3" },
    { path: ["DOS.3.3"], label: "DOS.3.3" },
    { path: ["DOS.MASTER", "DDOS.3.3"], label: "DOS.MASTER/DDOS.3.3" },
    { path: ["DDOS.3.3"], label: "DDOS.3.3" },
  ] as const

  const foundTargets: Array<{ label: string; location: ProDosFileLocation }> = []
  for (const target of configTargets) {
    const location = findFileByPath(disk, [...target.path])
    if (location) foundTargets.push({ label: target.label, location })
  }
  if (foundTargets.length === 0) {
    return { error: "Could not locate DOS.3.3 or DDOS.3.3 in DOS.MASTER base image." }
  }

  let mappedVolumes: number | undefined
  let activePairs: number | undefined
  const patchedLabels: string[] = []
  let appliedTargets = 0

  for (const target of foundTargets) {
    const current = readFileDataFromProDosImage(
      disk,
      target.location.storageType,
      target.location.keyBlock,
      target.location.eof,
    )
    const patchResult = patchSingleDosMasterConfigPayload(current, target.label)
    if ("skipped" in patchResult) {
      console.warn(`[HDV Export] Skipping DOS.MASTER config target: ${patchResult.reason}`)
      continue
    }
    if ("error" in patchResult) return { error: patchResult.error }

    if (mappedVolumes === undefined) mappedVolumes = patchResult.mappedVolumes
    if (activePairs === undefined) activePairs = patchResult.activePairs

    if (patchResult.mappedVolumes !== mappedVolumes) {
      return { error: `Inconsistent mapped volume counts across DOS.MASTER config targets (saw ${mappedVolumes} and ${patchResult.mappedVolumes}).` }
    }

    writeFileDataToProDosImage(disk, target.location, patchResult.patched)

    const verifyPayload = readFileDataFromProDosImage(
      disk,
      target.location.storageType,
      target.location.keyBlock,
      target.location.eof,
    )
    const verifyError = verifyPatchedConfigPayload(verifyPayload, patchResult.expectedNumBlocks, target.label)
    if (verifyError) return verifyError

    patchedLabels.push(`${target.label}:${patchResult.pairSummaries.join("|")}`)
    appliedTargets++
    if (patchResult.unmappedVolumes > 0) {
      console.warn(`[HDV Export] ${target.label} capacity exhausted: ${patchResult.unmappedVolumes} runtime volumes could not be mapped.`)
    }
  }

  if (appliedTargets === 0) {
    return { error: "Could not patch any DOS.MASTER runtime config target with active device pairs." }
  }

  const patchedFinderRecords = patchFinderDataCompanionMetadata()

  console.log(`[HDV Export] Patched DOS.MASTER config targets: requested=${runtimeVolumeCount}, mapped=${mappedVolumes || 0}, targets=${patchedLabels.join("; ")}, finderRecords=${patchedFinderRecords}`)
  return {
    requestedVolumes: runtimeVolumeCount,
    mappedVolumes: mappedVolumes || 0,
    activePairs: activePairs || 0,
    patchedTargets: appliedTargets,
  }
}

type DosInstallLikeResult = {
  installedVolumes: number
  maxVolumes: number
  firstBlock: number
  volumeSizeBlocks: number
  partitionBlocks: number
  deviceUnit: number
}

const installDosMasterLikePartitions = (
  disk: Uint8Array,
  runtimeVolumes: BuildInputFile[],
  totalBlocks: number,
  bitmapStartBlock: number,
  slot: number,
  drive: 1 | 2 = 1,
): DosInstallLikeResult | DosMasterPatchFailure => {
  if (runtimeVolumes.length === 0) {
    return {
      installedVolumes: 0,
      maxVolumes: 0,
      firstBlock: 0,
      volumeSizeBlocks: 0,
      partitionBlocks: 0,
      deviceUnit: ((slot & 0x07) << 4) | (drive === 2 ? 0x80 : 0x00),
    }
  }

  const TABLE_DEV_OFFSET = 0x38
  const TABLE_FIRST_OFFSET = 0x40
  const TABLE_NUM_BLOCKS_OFFSET = 0x50
  const TABLE_VOL_SIZE_OFFSET = 0x58

  const targets = [
    { path: ["DOS.MASTER", "DOS.3.3"], label: "DOS.MASTER/DOS.3.3" },
    { path: ["DOS.3.3"], label: "DOS.3.3" },
    { path: ["DOS.MASTER", "DDOS.3.3"], label: "DOS.MASTER/DDOS.3.3" },
    { path: ["DDOS.3.3"], label: "DDOS.3.3" },
  ] as const

  const foundTargets: Array<{ label: string; location: ProDosFileLocation }> = []
  for (const target of targets) {
    const location = findFileByPath(disk, [...target.path])
    if (location) foundTargets.push({ label: target.label, location })
  }
  if (foundTargets.length === 0) {
    return { error: "Could not locate DOS.3.3 or DDOS.3.3 for DOS.INSTALL-style partition install." }
  }

  const primaryPayload = readFileDataFromProDosImage(
    disk,
    foundTargets[0].location.storageType,
    foundTargets[0].location.keyBlock,
    foundTargets[0].location.eof,
  )
  if (primaryPayload.length < 0x60) {
    return { error: `${foundTargets[0].label} payload too small for DOS.INSTALL-style patching.` }
  }

  const deviceUnit = ((slot & 0x07) << 4) | (drive === 2 ? 0x80 : 0x00)
  let deviceIndex = -1
  for (let i = 0; i < 8; i++) {
    if (primaryPayload[TABLE_DEV_OFFSET + i] === deviceUnit) {
      deviceIndex = i
      break
    }
  }
  if (deviceIndex < 0) {
    return { error: `DOS.3.3 config does not support target unit $${deviceUnit.toString(16).padStart(2, "0")}.` }
  }

  const pairOffset = deviceIndex & 0x06
  const readWord = (payload: Uint8Array, offset: number) => payload[offset] | (payload[offset + 1] << 8)
  const writeWord = (payload: Uint8Array, offset: number, value: number) => {
    payload[offset] = value & 0xFF
    payload[offset + 1] = (value >> 8) & 0xFF
  }

  const volumeSizeBlocks = readWord(primaryPayload, TABLE_VOL_SIZE_OFFSET + pairOffset)
  if (volumeSizeBlocks <= 0 || volumeSizeBlocks > 1600) {
    return { error: `Invalid DOS volume size in config table: ${volumeSizeBlocks}.` }
  }

  const firstBaseBlock = readWord(primaryPayload, TABLE_FIRST_OFFSET + (deviceIndex * 2))
  const firstBlock = firstBaseBlock + volumeSizeBlocks
  if (firstBlock <= 0 || firstBlock >= totalBlocks) {
    return { error: `Computed DOS partition first block out of range: ${firstBlock} (total=${totalBlocks}).` }
  }

  let partitionBlocks = readWord(primaryPayload, TABLE_NUM_BLOCKS_OFFSET + pairOffset)
  if (partitionBlocks === 0xFFFF || partitionBlocks <= firstBlock || partitionBlocks > totalBlocks) {
    partitionBlocks = totalBlocks
  }

  const availablePartitionBlocks = Math.max(0, partitionBlocks - firstBlock)
  const maxVolumes = Math.floor(availablePartitionBlocks / volumeSizeBlocks)
  if (maxVolumes <= 0) {
    return { error: `DOS.INSTALL-style geometry yields no installable volumes (first=${firstBlock}, partitionBlocks=${partitionBlocks}, volumeSize=${volumeSizeBlocks}).` }
  }
  if (runtimeVolumes.length > maxVolumes) {
    return { error: `DOS.INSTALL-style geometry supports ${maxVolumes} volumes, but ${runtimeVolumes.length} were requested.` }
  }

  for (const target of foundTargets) {
    const payload = readFileDataFromProDosImage(
      disk,
      target.location.storageType,
      target.location.keyBlock,
      target.location.eof,
    )
    if (payload.length < 0x60) continue
    const patched = payload.slice()
    writeWord(patched, TABLE_NUM_BLOCKS_OFFSET + pairOffset, partitionBlocks)
    writeFileDataToProDosImage(disk, target.location, patched)
  }

  for (let block = firstBlock; block < partitionBlocks; block++) {
    setBlockUsedInBitmap(disk, bitmapStartBlock, block)
  }

  for (let i = 0; i < runtimeVolumes.length; i++) {
    const runtime = runtimeVolumes[i]
    const startBlock = firstBlock + (i * volumeSizeBlocks)
    const startOffset = startBlock * BLOCK_SIZE
    const volumeCapacityBytes = volumeSizeBlocks * BLOCK_SIZE
    if (startOffset < 0 || startOffset + volumeCapacityBytes > disk.length) {
      return { error: `DOS.INSTALL-style write out of range for volume ${i + 1} at block ${startBlock}.` }
    }

    const writeBytes = Math.min(runtime.data.length, volumeCapacityBytes)
    disk.fill(0, startOffset, startOffset + volumeCapacityBytes)
    disk.set(runtime.data.slice(0, writeBytes), startOffset)
    if (runtime.data.length > volumeCapacityBytes) {
      console.warn(`[HDV Export] DOS runtime image truncated to partition capacity: ${runtime.name} (${runtime.data.length} -> ${volumeCapacityBytes} bytes)`)
    }
  }

  console.log(
    `[HDV Export] DOS.INSTALL-style partition write: unit=$${deviceUnit.toString(16).padStart(2, "0")}, first=${firstBlock}, volSize=${volumeSizeBlocks}, partitionBlocks=${partitionBlocks}, installed=${runtimeVolumes.length}/${maxVolumes}`
  )

  return {
    installedVolumes: runtimeVolumes.length,
    maxVolumes,
    firstBlock,
    volumeSizeBlocks,
    partitionBlocks,
    deviceUnit,
  }
}

const scanRootDirectory = (disk: Uint8Array, dirBlocks: number[]) => {
  let fileCount = 0
  const existingNames = new Set<string>()
  let hasDos33 = false
  let hasDos33System = false
  let hasDosMaster = false
  let hasDosmaster = false
  for (let b = 0; b < dirBlocks.length; b++) {
    const block = dirBlocks[b]
    const dirBlock = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
      const entryOffset = getDirEntryOffset(slot)
      const byte0 = dirBlock[entryOffset]
      if (isDirectorySlotFree(byte0)) continue

      const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
      const name = readDirectoryEntryName(entry)
      existingNames.add(name)
      fileCount++
      if (name === "DOS.3.3") hasDos33 = true
      else if (name === "DOS.3.3.SYSTEM") hasDos33System = true
      else if (name === "DOS.MASTER") hasDosMaster = true
      else if (name === "DOSMASTER") hasDosmaster = true
    }
  }

  let hasDosMasterDirDos33 = false
  let hasDosMasterDirDos33System = false
  let hasDosMasterDirDosMaster = false
  const dosMasterDirKeyBlock = findDirectoryKeyBlockByName(disk, dirBlocks, "DOS.MASTER")
  if (dosMasterDirKeyBlock) {
    const dosMasterDirBlocks = collectDirectoryBlocksFromStart(disk, dosMasterDirKeyBlock)
    for (let b = 0; b < dosMasterDirBlocks.length; b++) {
      const block = dosMasterDirBlocks[b]
      const dirBlock = new Uint8Array(disk.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
      const startIndex = b === 0 ? 1 : 0
      for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
        const entryOffset = getDirEntryOffset(slot)
        const byte0 = dirBlock[entryOffset]
        if (isDirectorySlotFree(byte0)) continue
        const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
        const name = readDirectoryEntryName(entry)
        if (name === "DOS.MASTER") hasDosMasterDirDosMaster = true
        else if (name === "DOS.3.3") hasDosMasterDirDos33 = true
        else if (name === "DOS.3.3.SYSTEM") hasDosMasterDirDos33System = true
      }
    }
  }

  // Prefer DOS.3.3 runtime launcher. DOS.MASTER front-end may not be directly runnable
  // in this flow and has been observed to drop to monitor on some exports.
  let dosRuntimeLauncher: string | undefined
  if (hasDos33) {
    dosRuntimeLauncher = "DOS.3.3"
  } else if (hasDosMasterDirDos33) {
    dosRuntimeLauncher = "DOS.MASTER/DOS.3.3"
  } else if (hasDosMasterDirDos33System) {
    dosRuntimeLauncher = "DOS.MASTER/DOS.3.3.SYSTEM"
  } else if (hasDosMasterDirDosMaster) {
    dosRuntimeLauncher = "DOS.MASTER/DOS.MASTER"
  } else if (hasDos33System) {
    dosRuntimeLauncher = "DOS.3.3.SYSTEM"
  } else if (hasDosMaster) {
    dosRuntimeLauncher = "DOS.MASTER"
  } else if (hasDosmaster) {
    dosRuntimeLauncher = "DOSMASTER"
  }
  return { fileCount, existingNames, dosRuntimeLauncher }
}

export const buildProDosHdv = async (
  files: Array<{ name: string; type: number; data: Uint8Array; auxType?: number }>,
  volumeName = "APPLE2TS",
  prodos243Base?: Uint8Array,
  menuEntries?: MenuDiskEntry[],
  options?: { includeStartup?: boolean; enableVolumeExtraction?: boolean }
): Promise<Uint8Array> => {
  const includeStartup = options?.includeStartup ?? true
  const enableVolumeExtraction = options?.enableVolumeExtraction ?? true
  let hdv = prodos243Base
  if (!hdv) {
    try {
      const dosMasterBase = "disks/dosmaster18.po"
      const response = await fetch(dosMasterBase)
      if (!response.ok) {
        throw new Error(`Failed to load required base image: ${dosMasterBase}`)
      }
      hdv = new Uint8Array(await response.arrayBuffer())
      console.log(`[HDV Export] Using base image: ${dosMasterBase} (${hdv.length} bytes)`)
    } catch (e) {
      console.error("Failed to load dosmaster18.po base:", e)
      throw new Error("Could not load dosmaster18.po base disk")
    }
  }

  // Never mutate caller-owned/base buffers (important for recursive multi-volume builds).
  hdv = hdv.slice()

  // Keep this builder simple and standards-compliant for <= 4096 blocks (2MB).
  // Supporting larger sizes requires additional bitmap blocks and linked directory blocks.
  const dirBlocks = collectRootDirectoryBlocks(hdv)
  if (dirBlocks.length === 0) {
    throw new Error("Could not locate ProDOS root directory")
  }

  const rootHeader = new Uint8Array(hdv.buffer, ROOT_DIR_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  const volumeEntryOffset = getDirEntryOffset(0)

  // Keep existing files from the base image intact.
  const rootScan = scanRootDirectory(hdv, dirBlocks)
  const dosRuntimeLauncher = rootScan.dosRuntimeLauncher
  const dosRuntimeCommands = buildDosMasterLaunchCommands(dosRuntimeLauncher)
  const hasDosRuntimeLauncherFile = (() => {
    if (!dosRuntimeLauncher) return false
    const launcherPath = dosRuntimeLauncher.split("/").filter(Boolean)
    if (launcherPath.length === 0) return false
    return !!findFileByPath(hdv, launcherPath)
  })()

  let volumes: VolumeData[] = []
  let rootFiles: BuildInputFile[] = []
  if (enableVolumeExtraction) {
    const preprocessed = preprocessInputFilesForMenu(files, menuEntries, rootScan.existingNames)
    volumes = preprocessed.volumes
    rootFiles = preprocessed.rootFiles
  } else {
    const usedNames = new Set<string>(rootScan.existingNames)
    rootFiles = files.map((file, index) => {
      const name = makeUniqueProDosFilename(file.name, usedNames)
      return { ...file, name, sourceMenuIndex: index }
    })
  }

  console.log(`[HDV Export] Build summary: ${volumes.length} volumes, ${rootFiles.length} root files`)

  let blankProDosBase: Uint8Array | undefined
  const loadBlankProDosBase = async (): Promise<Uint8Array> => {
    if (blankProDosBase) return blankProDosBase
    const response = await fetch("blank.po")
    if (!response.ok) {
      throw new Error("Failed to load blank.po for runtime volume creation")
    }
    blankProDosBase = new Uint8Array(await response.arrayBuffer())
    return blankProDosBase
  }

  const runtimeFilesByMenuIndex = new Map<number, BuildInputFile>()
  const prodosLaunchCommandsByMenuIndex = new Map<number, string[]>()

  for (const volume of volumes) {
    if (volume.sourceKind !== "prodos") continue
    const launchCommands = chooseProDosLaunchCommands(volume.volumeName, volume.files)
    if (launchCommands && launchCommands.length > 0) {
      prodosLaunchCommandsByMenuIndex.set(volume.sourceMenuIndex, launchCommands)
    }
    console.log(`[HDV Export] ProDOS runtime volume plan: ${volume.volumeName} (${volume.files.length} files), launch=${launchCommands?.join("|") || "(none)"}`)
  }

  for (const file of rootFiles) {
    if (file.type === PRODOS_FILE_TYPE_DOS_MASTER && file.sourceMenuIndex !== undefined) {
      runtimeFilesByMenuIndex.set(file.sourceMenuIndex, file)
    }
  }

  for (const volume of volumes) {
    // ProDOS volumes cannot be mapped as DOS.3.3 virtual F1 partitions; DOS.3.3 would
    // try to read them as DOS disks and fail with I/O ERROR. Skip them here — DOS/unknown
    // images are handled by the fallback section below.
    if (volume.sourceKind === "prodos") {
      console.log(`[HDV Export] ProDOS volume skipped from DOS.MASTER F1 mapping: ${volume.volumeName} (sourceKind=prodos)`)
      continue
    }
    const volumeBase = (await loadBlankProDosBase()).slice()
    let runtimeImage: Uint8Array
    try {
      runtimeImage = await buildProDosHdv(
        volume.files,
        volume.volumeName,
        volumeBase,
        undefined,
        { includeStartup: false, enableVolumeExtraction: false }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      const isOutOfBlocks = message.includes("Not enough free blocks in base image")
      if (isOutOfBlocks && volume.sourceImageData) {
        const isWozSource = (volume.sourceFilename || "").toLowerCase().endsWith(".woz")
        if (isWozSource) {
          const decodedProDosImage = decodeWozToProDosImage(volume.sourceImageData)
          if (!decodedProDosImage) {
            throw new Error(`Runtime volume fallback failed: could not decode WOZ ProDOS image for ${volume.volumeName}`)
          }
          runtimeImage = decodedProDosImage
          console.warn(`[HDV Export] Runtime volume fallback to decoded WOZ ProDOS image: ${volume.volumeName}`)
        } else {
          // Fall back to the original source image when extracted content cannot fit in blank.po.
          runtimeImage = volume.sourceImageData
          console.warn(`[HDV Export] Runtime volume fallback to source image: ${volume.volumeName}`)
        }
      } else {
        throw error
      }
    }
    runtimeFilesByMenuIndex.set(volume.sourceMenuIndex, {
      name: volume.volumeName,
      type: PRODOS_FILE_TYPE_DOS_MASTER,
      data: runtimeImage,
      auxType: 0x0000,
      sourceMenuIndex: volume.sourceMenuIndex,
    })
    console.log(`[HDV Export] Runtime volume created: ${volume.volumeName} (${runtimeImage.length} bytes)`)
  }

  // Fallback: ensure DOS/unknown menu entries are routable via DOS.MASTER runtime volumes.
  if (menuEntries) {
    for (let i = 0; i < menuEntries.length && i < files.length; i++) {
      if (runtimeFilesByMenuIndex.has(i)) continue
      const kind = menuEntries[i].imageKind || "unknown"
      if (kind !== "dos" && kind !== "unknown") continue

      const source = files[i]
      const sourceFilename = menuEntries[i].sourceFilename || menuEntries[i].filename || source.name
      const isWozSource = sourceFilename.toLowerCase().endsWith(".woz")
      let dosRuntimeData: Uint8Array | undefined
      if (isWozSource) {
        dosRuntimeData = decodeWozToDosImage(source.data)
        if (!dosRuntimeData) {
          console.warn(`[HDV Export] Skipping DOS runtime volume: WOZ image '${sourceFilename}' decoded ${source.data.length} bytes but no valid DOS 3.3 filesystem (VTOC/catalog) found. This disk likely has no catalog and boots via custom code — it cannot be served as a DOS.MASTER virtual volume.`)
          continue
        }
      } else {
        if (!isLikelyDos33Volume(source.data)) {
          console.warn(`[HDV Export] Skipping DOS runtime volume: '${sourceFilename}' does not contain a recognizable DOS 3.3 VTOC/catalog.`)
          continue
        }
        dosRuntimeData = source.data
      }
      runtimeFilesByMenuIndex.set(i, {
        name: makeUniqueProDosFilename(menuEntries[i].filename || source.name, rootScan.existingNames),
        type: PRODOS_FILE_TYPE_DOS_MASTER,
        data: dosRuntimeData,
        auxType: 0x0000,
        sourceMenuIndex: i,
      })
      console.log(`[HDV Export] Runtime volume fallback from source image: ${menuEntries[i].filename || source.name} (${dosRuntimeData.length} bytes)`)
    }
  }

  const runtimeVolumeByMenuIndex: Array<number | undefined> = new Array(menuEntries?.length || 0).fill(undefined)
  const orderedRuntimeIndices = Array.from(runtimeFilesByMenuIndex.keys()).sort((a, b) => a - b)
  const orderedRuntimeFiles = orderedRuntimeIndices.map((index) => runtimeFilesByMenuIndex.get(index) as BuildInputFile)
  for (let i = 0; i < orderedRuntimeIndices.length; i++) {
    const menuIndex = orderedRuntimeIndices[i]
    runtimeVolumeByMenuIndex[menuIndex] = i + 1
  }

  if (menuEntries) {
    const unmappedDosEntries: string[] = []
    for (let i = 0; i < menuEntries.length; i++) {
      const kind = menuEntries[i].imageKind || "unknown"
      if (kind !== "dos" && kind !== "unknown") continue
      if (runtimeVolumeByMenuIndex[i] !== undefined) continue
      unmappedDosEntries.push(menuEntries[i].filename || files[i]?.name || `ENTRY_${i}`)
    }
    if (unmappedDosEntries.length > 0) {
      throw new Error(
        `Cannot export HDV: the following disk(s) do not contain a valid DOS 3.3 filesystem: ${unmappedDosEntries.join(", ")}. ` +
        "DOS Master requires each DOS entry to have a VTOC and catalog. " +
        "Disks that boot via custom code without a catalog (e.g. many WOZ game images) cannot be used as DOS Master virtual volumes."
      )
    }
  }

  // Filter root files to exclude any that were promoted to runtime volumes by the fallback logic
  const runtimeMenuIndices = new Set(runtimeFilesByMenuIndex.keys())
  const nonRuntimeRootFiles = rootFiles.filter((file) => {
    if (file.type === PRODOS_FILE_TYPE_DOS_MASTER && file.sourceMenuIndex !== undefined) {
      return false // Already a type-F1 file, skip
    }
    if (file.sourceMenuIndex !== undefined && runtimeMenuIndices.has(file.sourceMenuIndex)) {
      return false // This menu entry now has a runtime volume, skip the raw file
    }
    return true
  })
  const outputFiles = [...nonRuntimeRootFiles, ...orderedRuntimeFiles]

  // Keep legacy DOS.MASTER table patching for compatibility with existing menu/runtime assumptions.
  const dosMasterPatchResult = patchDosMasterDos33Configuration(hdv, orderedRuntimeFiles.length)
  if ("error" in dosMasterPatchResult) {
    throw new Error(`Failed to patch DOS.MASTER runtime configuration: ${dosMasterPatchResult.error}`)
  }

  if (orderedRuntimeFiles.length > 0 && !dosRuntimeLauncher) {
    throw new Error("DOS.MASTER runtime volumes were created, but no DOS runtime launcher was found (expected DOS.3.3 or DOS.MASTER launcher).")
  }

  const launchDirectives: MenuLaunchDirective[] = new Array(menuEntries?.length || 0)
    .fill(undefined)
    .map(() => ({ mode: "unavailable", commands: [], message: "ENTRY NOT CONFIGURED" }))

  for (let i = 0; i < (menuEntries?.length || 0); i++) {
    const entry = menuEntries?.[i]
    const kind = entry?.imageKind || "unknown"
    const runtimeVolume = runtimeVolumeByMenuIndex[i]
    const prodosLaunch = prodosLaunchCommandsByMenuIndex.get(i)

    if (DOSMASTER_BASELINE_ONLY) {
      if (!dosRuntimeCommands || !hasDosRuntimeLauncherFile) {
        launchDirectives[i] = { mode: "unavailable", commands: [], message: "DOS.MASTER LAUNCHER NOT INSTALLED" }
      } else if (orderedRuntimeFiles.length === 0) {
        launchDirectives[i] = { mode: "unavailable", commands: [], message: "NO F1 VOLUMES TO TEST" }
      } else {
        launchDirectives[i] = {
          mode: "dosmaster",
          commands: [...dosRuntimeCommands, `CATALOG,S${DOSMASTER_SLOT},V1`],
          message: "BASELINE MODE",
        }
      }
    } else if (kind === "prodos") {
      if (runtimeVolume && prodosLaunch && prodosLaunch.length > 0) {
        if (!dosRuntimeCommands || !hasDosRuntimeLauncherFile) {
          launchDirectives[i] = { mode: "unavailable", commands: [], message: "DOS.MASTER LAUNCHER NOT INSTALLED" }
        } else {
          // Select mapped DOS.MASTER runtime volume explicitly before launching in-volume program.
          launchDirectives[i] = {
            mode: "prodos-native",
            commands: [...dosRuntimeCommands, `CATALOG,S${DOSMASTER_SLOT},V${runtimeVolume}`, ...prodosLaunch],
          }
        }
      } else {
        launchDirectives[i] = { mode: "unavailable", commands: [], message: "PRODOS LAUNCH NOT AVAILABLE" }
      }
    } else {
      // Route DOS and unknown images through DOS.MASTER runtime mapping.
      if (!runtimeVolume) {
        launchDirectives[i] = { mode: "unavailable", commands: [], message: "DOS RUNTIME VOLUME NOT MAPPED" }
      } else if (!dosRuntimeCommands || !hasDosRuntimeLauncherFile) {
        launchDirectives[i] = { mode: "unavailable", commands: [], message: "DOS.MASTER LAUNCHER NOT INSTALLED" }
      } else {
        // DOS.MASTER needs explicit volume selection for each menu entry.
        launchDirectives[i] = { mode: "dosmaster", commands: [...dosRuntimeCommands, `CATALOG,S${DOSMASTER_SLOT},V${runtimeVolume}`] }
      }
    }

    const directive = launchDirectives[i]
    console.log(`[HDV Export] Menu[${i}]: ${entry?.filename || "?"} (${kind}), mode=${directive.mode}, commands=${directive.commands.join("|") || "(none)"}, message=${directive.message || ""}`)
  }

  let fileCount = rootScan.fileCount
  const headerTotalBlocks = readLittleEndian16(rootHeader, volumeEntryOffset + 37)
  const imageTotalBlocks = Math.floor(hdv.length / BLOCK_SIZE)
  const currentTotalBlocks = Math.min(headerTotalBlocks, imageTotalBlocks)
  const bitmapStartBlock = readLittleEndian16(rootHeader, volumeEntryOffset + 35)

  if (currentTotalBlocks <= 0) {
    throw new Error("Invalid ProDOS image size: no addressable blocks")
  }

  const dosInstallResult = installDosMasterLikePartitions(
    hdv,
    orderedRuntimeFiles,
    currentTotalBlocks,
    bitmapStartBlock,
    DOSMASTER_SLOT,
    1,
  )
  if ("error" in dosInstallResult) {
    throw new Error(`Failed DOS.INSTALL-style partition write: ${dosInstallResult.error}`)
  }

  const allocateFreeBlocks = (count: number): number[] => {
    const allocated: number[] = []
    for (let block = 0; block < currentTotalBlocks && allocated.length < count; block++) {
      if (isBlockFreeInBitmap(hdv, bitmapStartBlock, block)) {
        setBlockUsedInBitmap(hdv, bitmapStartBlock, block)
        allocated.push(block)
      }
    }

    if (allocated.length < count) {
      throw new Error(`Not enough free blocks in base image. Need ${count}, got ${allocated.length}.`)
    }

    return allocated
  }

  const normalizedVolumeName = volumeName.toUpperCase().slice(0, 15)
  const volumeNameLength = normalizedVolumeName.length
  rootHeader[volumeEntryOffset] = 0xF0 | volumeNameLength
  for (let i = 0; i < 15; i++) {
    rootHeader[volumeEntryOffset + 1 + i] = i < volumeNameLength ? normalizedVolumeName.charCodeAt(i) : 0
  }

  const withStartup = [...outputFiles]

  if (includeStartup) {
    const launcherName = "A2TSLAUNCH"
    withStartup.unshift({
      name: launcherName,
      type: PRODOS_FILE_TYPE_BINARY,
      data: createLauncherBinary(),
      auxType: 0x2000,
    })

    // Generate STARTUP: interactive menu if menuEntries provided, else simple CATALOG
    let startupText: string
    if (menuEntries && menuEntries.length > 0) {
      // Generate interactive menu program
      startupText = generateInteractiveMenuStartup(menuEntries)
    } else {
      // Fall back to simple launcher + catalog
      startupText = `BRUN ${launcherName}\rCATALOG\r`
    }

    withStartup.unshift({
      name: "STARTUP",
      type: PRODOS_FILE_TYPE_TEXT,
      data: new TextEncoder().encode(startupText),
      auxType: 0x0000,
    })

    if (menuEntries && menuEntries.length > 0) {
      withStartup.push({
        name: "MENUSRC",
        type: PRODOS_FILE_TYPE_TEXT,
        data: new TextEncoder().encode(generateMenuSourceProgram(menuEntries, launchDirectives)),
        auxType: 0x0000,
      })
    }
  }

  // Track screenshot files for later metadata creation
  const screenshotNames: Set<string> = new Set()
  if (menuEntries && menuEntries.length > 0) {
    for (let i = 0; i < menuEntries.length; i++) {
      const entry = menuEntries[i]
      if (entry.screenshotData && entry.screenshotData.length > 0) {
        const screenshotName = `SCREEN${String(i + 1).padStart(2, "0")}`
        screenshotNames.add(screenshotName)
        withStartup.push({
          name: screenshotName,
          type: PRODOS_FILE_TYPE_BINARY,
          data: entry.screenshotData,
          auxType: 0x2000,
        })
      }
    }
  }

  type DirectoryNode = {
    name: string
    normalizedName?: string
    files: BuildInputFile[]
    children: DirectoryNode[]
    keyBlock: number
    blocksUsed: number
    blocks: number[]
    parentEntryBlock?: number
    parentEntrySlot?: number
  }

  const filePlans: Array<{
    name: string
    type: number
    data: Uint8Array
    auxType: number
    keyBlock: number
    blocksUsed: number
    storageType: 1 | 2 | 3
    indexBlocks: number[]
    dataBlocks: number[]
    parentDirectoryNode?: DirectoryNode
  }> = []

  const filePlansByDirectory = new Map<DirectoryNode, typeof filePlans>()
  // Multi-volume: subdirectories no longer created

  const allocatePlannedFile = (file: BuildInputFile, parentDirectoryNode?: DirectoryNode) => {
    const dataBlocksNeeded = Math.max(1, Math.ceil(file.data.length / BLOCK_SIZE))

    let storageType: 1 | 2 | 3 = 1
    let keyBlock = 0
    let blocksUsed = dataBlocksNeeded
    let indexBlocks: number[] = []
    let dataBlocks: number[] = []

    if (dataBlocksNeeded === 1) {
      storageType = 1
      dataBlocks = allocateFreeBlocks(1)
      keyBlock = dataBlocks[0]
      blocksUsed = 1
    } else if (dataBlocksNeeded <= 256) {
      storageType = 2
      keyBlock = allocateFreeBlocks(1)[0]
      indexBlocks = [keyBlock]
      dataBlocks = allocateFreeBlocks(dataBlocksNeeded)
      blocksUsed = dataBlocksNeeded + 1
    } else {
      storageType = 3
      const indexBlockCount = Math.ceil(dataBlocksNeeded / 256)
      if (indexBlockCount > 256) {
        throw new Error(`File too large for tree format: ${file.name}`)
      }
      keyBlock = allocateFreeBlocks(1)[0]
      indexBlocks = allocateFreeBlocks(indexBlockCount)
      dataBlocks = allocateFreeBlocks(dataBlocksNeeded)
      blocksUsed = 1 + indexBlockCount + dataBlocksNeeded
    }

    const plan = {
      name: file.name,
      type: file.type,
      data: file.data,
      auxType: file.auxType ?? 0x0000,
      keyBlock,
      blocksUsed,
      storageType,
      indexBlocks,
      dataBlocks,
      parentDirectoryNode,
    }

    filePlans.push(plan)
    const parentName = parentDirectoryNode?.name || "root"
    console.log(`[HDV Export] Allocated file: ${file.name} (${file.data.length} bytes, ST=${storageType}) -> parent=${parentName}`)
    if (parentDirectoryNode) {
      const bucket = filePlansByDirectory.get(parentDirectoryNode) || []
      bucket.push(plan)
      filePlansByDirectory.set(parentDirectoryNode, bucket)
    }
  }

  for (const file of withStartup) {
    allocatePlannedFile(file)
  }

  // Directory tree functions removed - using multi-volume approach

  // Multi-volume approach: extracted disk files will go into separate volumes (future enhancement)
  // For now, all extracted files are kept in root volume as files or further organization as needed

  // Create MENUDATA file with screenshot block references if screenshots exist
  if (screenshotNames.size > 0 && menuEntries) {
    const screenshotMap = new Map<string, number>()
    for (const plan of filePlans) {
      if (screenshotNames.has(plan.name)) {
        screenshotMap.set(plan.name, plan.keyBlock)
      }
    }

    const menuMeta = createMenuMetadataFile(
      menuEntries.map((e, idx) => {
        const screenshotName = `SCREEN${String(idx + 1).padStart(2, "0")}`
        return {
          filename: e.filename,
          screenshotBlock: screenshotMap.get(screenshotName) || 0,
          imageKind: e.imageKind || "unknown",
        }
      })
    )

    // Add MENUDATA to filePlans
    const menuDataBlocksNeeded = Math.max(1, Math.ceil(menuMeta.length / BLOCK_SIZE))
    let menuDataStorageType: 1 | 2 = 1
    let menuDataKeyBlock = 0
    let menuDataIndexBlocks: number[] = []
    let menuDataBlocks: number[] = []

    if (menuDataBlocksNeeded === 1) {
      menuDataBlocks = allocateFreeBlocks(1)
      menuDataKeyBlock = menuDataBlocks[0]
    } else {
      menuDataStorageType = 2
      menuDataKeyBlock = allocateFreeBlocks(1)[0]
      menuDataIndexBlocks = [menuDataKeyBlock]
      menuDataBlocks = allocateFreeBlocks(menuDataBlocksNeeded)
    }

    filePlans.push({
      name: "MENUDATA",
      type: PRODOS_FILE_TYPE_LIBRARY,
      data: menuMeta,
      auxType: 0x0000,
      keyBlock: menuDataKeyBlock,
      blocksUsed: menuDataBlocksNeeded + (menuDataStorageType === 2 ? 1 : 0),
      storageType: menuDataStorageType,
      indexBlocks: menuDataIndexBlocks,
      dataBlocks: menuDataBlocks,
    })
  }

  const newHdv = new Uint8Array(hdv.length)
  newHdv.set(hdv)

  const newDirBlocks = collectRootDirectoryBlocks(newHdv)
  const freeSlots: Array<{ block: number; slot: number }> = []
  for (let b = 0; b < newDirBlocks.length; b++) {
    const dirBlockNumber = newDirBlocks[b]
    if (dirBlockNumber < 0 || dirBlockNumber >= currentTotalBlocks) {
      continue
    }
    const dirBlock = new Uint8Array(newHdv.buffer, dirBlockNumber * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let i = startIndex; i < DIR_ENTRIES_PER_BLOCK; i++) {
      const entryOffset = getDirEntryOffset(i)
      if (isDirectorySlotFree(dirBlock[entryOffset])) {
        freeSlots.push({ block: dirBlockNumber, slot: i })
      }
    }
  }

  const rootEntriesNeeded = filePlans.filter((p) => !p.parentDirectoryNode).length
  if (rootEntriesNeeded > freeSlots.length) {
    throw new Error(`Not enough free directory entries. Need ${rootEntriesNeeded}, have ${freeSlots.length}.`)
  }

  let rootSlotIndex = 0

  // Multi-volume: directory entries no longer created (extracted disk files will go to separate volumes)

  for (let i = 0; i < filePlans.length; i++) {
    const plan = filePlans[i]
    if (plan.parentDirectoryNode) continue
    const entry = freeSlots[rootSlotIndex++]
    if (entry.block < 0 || entry.block >= currentTotalBlocks) {
      throw new Error(`Directory entry block out of range: ${entry.block}`)
    }
    const dirBlock = new Uint8Array(newHdv.buffer, entry.block * BLOCK_SIZE, BLOCK_SIZE)
    const entryOffset = getDirEntryOffset(entry.slot)
    const fileEntry = createFileEntry(
      plan.name,
      plan.type,
      plan.keyBlock,
      plan.data.length,
      plan.blocksUsed,
      entry.block,
      plan.storageType,
      plan.auxType,
    )
    dirBlock.set(fileEntry, entryOffset)
    fileCount++
  }

  // Multi-volume: directory writing removed

  const newRootHeader = new Uint8Array(newHdv.buffer, ROOT_DIR_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 33, fileCount)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 37, currentTotalBlocks)

  for (const plan of filePlans) {
    if (plan.storageType === 2) {
      // Sapling index block
      const indexBlockNum = plan.indexBlocks[0]
      if (indexBlockNum < 0 || indexBlockNum >= currentTotalBlocks) {
        throw new Error(`Sapling index block out of range: ${indexBlockNum}`)
      }
      setBlockUsedInBitmap(newHdv, bitmapStartBlock, indexBlockNum)

      const indexBlockOffset = indexBlockNum * BLOCK_SIZE
      const indexBlock = new Uint8Array(newHdv.buffer, indexBlockOffset, BLOCK_SIZE)
      for (let i = 0; i < plan.dataBlocks.length; i++) {
        const blockNumber = plan.dataBlocks[i]
        indexBlock[i] = blockNumber & 0xFF
        indexBlock[256 + i] = (blockNumber >> 8) & 0xFF
      }
    }

    if (plan.storageType === 3) {
      // Tree master index block points to per-256-block index blocks
      if (plan.keyBlock < 0 || plan.keyBlock >= currentTotalBlocks) {
        throw new Error(`Tree master block out of range: ${plan.keyBlock}`)
      }
      setBlockUsedInBitmap(newHdv, bitmapStartBlock, plan.keyBlock)
      const masterBlock = new Uint8Array(newHdv.buffer, plan.keyBlock * BLOCK_SIZE, BLOCK_SIZE)

      for (let i = 0; i < plan.indexBlocks.length; i++) {
        const indexBlockNum = plan.indexBlocks[i]
        if (indexBlockNum < 0 || indexBlockNum >= currentTotalBlocks) {
          throw new Error(`Tree index block out of range: ${indexBlockNum}`)
        }
        masterBlock[i] = indexBlockNum & 0xFF
        masterBlock[256 + i] = (indexBlockNum >> 8) & 0xFF
        setBlockUsedInBitmap(newHdv, bitmapStartBlock, indexBlockNum)

        const indexBlock = new Uint8Array(newHdv.buffer, indexBlockNum * BLOCK_SIZE, BLOCK_SIZE)
        const dataStart = i * 256
        const dataEnd = Math.min(dataStart + 256, plan.dataBlocks.length)
        for (let j = dataStart; j < dataEnd; j++) {
          const blockNumber = plan.dataBlocks[j]
          const slot = j - dataStart
          indexBlock[slot] = blockNumber & 0xFF
          indexBlock[256 + slot] = (blockNumber >> 8) & 0xFF
        }
      }
    }

    for (let i = 0; i < plan.dataBlocks.length; i++) {
      const blockNumber = plan.dataBlocks[i]
      if (blockNumber < 0 || blockNumber >= currentTotalBlocks) {
        throw new Error(`Data block out of range: ${blockNumber}`)
      }
      setBlockUsedInBitmap(newHdv, bitmapStartBlock, blockNumber)
      const writeOffset = blockNumber * BLOCK_SIZE
      const sourceOffset = i * BLOCK_SIZE
      const sourceEnd = Math.min(sourceOffset + BLOCK_SIZE, plan.data.length)
      newHdv.set(plan.data.slice(sourceOffset, sourceEnd), writeOffset)
    }
  }

  return newHdv
}

export const PRODOS_FILE_TYPE_BINARY = 0x06
export const PRODOS_FILE_TYPE_TEXT = 0x04
export const PRODOS_FILE_TYPE_LIBRARY = 0xE0
// DOS.MASTER volumes are commonly represented as file type $F1 on ProDOS volumes.
export const PRODOS_FILE_TYPE_DOS_MASTER = 0xF1
