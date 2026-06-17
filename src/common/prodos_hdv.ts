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
  volumeName?: string
  type: number
  auxType?: number
  data: Uint8Array
}

type BuildInputFile = { name: string; type: number; data: Uint8Array; auxType?: number; relativePath?: string }

type ExtractedProDosFile = {
  name: string
  relativePath?: string
  type: number
  auxType: number
  storageType: 1 | 2 | 3
  eof: number
  data: Uint8Array
}

type DirectoryImportPlan = {
  name: string
  files: BuildInputFile[]
  sourceMenuIndex: number
  launchCommand?: string
}

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

// Applesoft BASIC keyword token table, sorted longest-first so greedy matching
// always picks the longest possible token at each position.
const APPLESOFT_TOKENS: ReadonlyArray<readonly [string, number]> = [
  ["HCOLOR=", 0x92], ["NOTRACE", 0x9C], ["RESTORE", 0xAE], ["INVERSE", 0x9E],
  ["HIMEM:", 0xA3],  ["LOMEM:", 0xA4],  ["NORMAL", 0x9D],  ["RETURN", 0xB1],
  ["RESUME", 0xA6],  ["RECALL", 0xA7],  ["SHLOAD", 0x9A],  ["SCALE=", 0x99],
  ["SPEED=", 0xA9],  ["COLOR=", 0xA0],  ["RIGHT$", 0xE9],
  ["ONERR", 0xA5],   ["TRACE", 0x9B],   ["PRINT", 0xBA],   ["HPLOT", 0x93],
  ["XDRAW", 0x95],   ["STORE", 0xA8],   ["FLASH", 0x9F],   ["CLEAR", 0xBD],
  ["GOSUB", 0xB0],   ["SCRN(", 0xD7],   ["LEFT$", 0xE8],
  ["TEXT", 0x89],    ["VTAB", 0xA2],    ["HTAB", 0x96],    ["POKE", 0xB9],
  ["GOTO", 0xAB],    ["HOME", 0x97],    ["NEXT", 0x82],    ["DATA", 0x83],
  ["READ", 0x87],    ["CALL", 0x8C],    ["PLOT", 0x8D],    ["DRAW", 0x94],
  ["WAIT", 0xB5],    ["LOAD", 0xB6],    ["SAVE", 0xB7],    ["CONT", 0xBB],
  ["LIST", 0xBC],    ["THEN", 0xC4],    ["STEP", 0xC7],    ["HGR2", 0x90],
  ["HLIN", 0x8E],    ["VLIN", 0x8F],    ["ROT=", 0x98],    ["MID$", 0xEA],
  ["STR$", 0xE4],    ["CHR$", 0xE7],    ["PEEK", 0xE2],    ["TAB(", 0xC0],
  ["SPC(", 0xC3],    ["STOP", 0xB3],
  ["ATN", 0xE1],     ["REM", 0xB2],     ["DEL", 0x85],     ["DIM", 0x86],
  ["DEF", 0xB8],     ["NEW", 0xBF],     ["POP", 0xA1],     ["NOT", 0xC6],
  ["GET", 0xBE],     ["AND", 0xCD],     ["SGN", 0xD2],     ["INT", 0xD3],
  ["ABS", 0xD4],     ["USR", 0xD5],     ["FRE", 0xD6],     ["PDL", 0xD8],
  ["POS", 0xD9],     ["SQR", 0xDA],     ["RND", 0xDB],     ["LOG", 0xDC],
  ["EXP", 0xDD],     ["COS", 0xDE],     ["SIN", 0xDF],     ["TAN", 0xE0],
  ["LEN", 0xE3],     ["VAL", 0xE5],     ["ASC", 0xE6],     ["RUN", 0xAC],
  ["END", 0x80],     ["FOR", 0x81],     ["HGR", 0x91],     ["PR#", 0x8A],
  ["IN#", 0x8B],     ["LET", 0xAA],
  ["GR", 0x88],      ["IF", 0xAD],      ["ON", 0xB4],      ["OR", 0xCE],
  ["FN", 0xC2],      ["AT", 0xC5],      ["TO", 0xC1],
  ["+", 0xC8], ["-", 0xC9], ["*", 0xCA], ["/", 0xCB], ["^", 0xCC],
  [">", 0xCF], ["=", 0xD0], ["<", 0xD1],
]

/**
 * Tokenizes a single Applesoft BASIC line (without its line number).
 * Spaces outside string literals are stripped, keywords become token bytes.
 */
const tokenizeApplesoftLine = (text: string): number[] => {
  const tokens: number[] = []
  let i = 0
  let afterREM = false
  while (i < text.length) {
    if (afterREM) {
      tokens.push(text.charCodeAt(i++))
      continue
    }
    if (text[i] === '"') {
      tokens.push(text.charCodeAt(i++))
      while (i < text.length && text[i] !== '"') tokens.push(text.charCodeAt(i++))
      if (i < text.length) tokens.push(text.charCodeAt(i++))
      continue
    }
    if (text[i] === ' ') { i++; continue }
    let matched = false
    for (const [keyword, tokenByte] of APPLESOFT_TOKENS) {
      const end = i + keyword.length
      if (end <= text.length && text.substring(i, end).toUpperCase() === keyword) {
        tokens.push(tokenByte)
        i = end
        matched = true
        if (tokenByte === 0xB2) afterREM = true // REM: rest of line is literal
        break
      }
    }
    if (!matched) tokens.push(text.charCodeAt(i++))
  }
  return tokens
}

/**
 * Converts Applesoft BASIC source text (lines separated by \r) into the
 * tokenized binary format used by ProDOS file type 0xFC (load address $0801).
 */
const tokenizeApplesoftBasic = (source: string): Uint8Array => {
  const BASE = 0x0801
  const lines = source.split('\r').filter(l => l.length > 0)
  const parsed: Array<{ lineNum: number; tokens: number[] }> = []
  for (const line of lines) {
    let i = 0
    while (i < line.length && line[i] >= '0' && line[i] <= '9') i++
    if (i === 0) continue
    const lineNum = parseInt(line.substring(0, i), 10)
    parsed.push({ lineNum, tokens: tokenizeApplesoftLine(line.substring(i)) })
  }
  parsed.sort((a, b) => a.lineNum - b.lineNum)
  // Each line: 2 (next-ptr) + 2 (linenum) + tokens + 1 (null). End: 2 (0x0000).
  let totalSize = 2
  for (const { tokens } of parsed) totalSize += 4 + tokens.length + 1
  const data = new Uint8Array(totalSize)
  let offset = 0
  let addr = BASE
  for (const { lineNum, tokens } of parsed) {
    const lineSize = 4 + tokens.length + 1
    const nextAddr = addr + lineSize
    data[offset]     = nextAddr & 0xFF
    data[offset + 1] = (nextAddr >> 8) & 0xFF
    data[offset + 2] = lineNum & 0xFF
    data[offset + 3] = (lineNum >> 8) & 0xFF
    for (let j = 0; j < tokens.length; j++) data[offset + 4 + j] = tokens[j]
    data[offset + 4 + tokens.length] = 0x00
    offset += lineSize
    addr = nextAddr
  }
  data[offset] = 0x00
  data[offset + 1] = 0x00
  return data
}

/**
 * Generates a tokenized Applesoft BASIC program that draws screenshots and
 * supports left/right navigation among disk images.
 */
const generateMenuSourceProgram = (
  menuEntries: MenuDiskEntry[],
  dosRuntimeLauncher: string | undefined,
  menuProDosCommands: Array<string | undefined>,
  menuProDosPrefixes: Array<string | undefined>
): string => {
  const hasDosMasterRuntime = !!dosRuntimeLauncher
  const dosRuntimeRunCommand = dosRuntimeLauncher === "DOS.MASTER"
    ? `BRUN /${dosRuntimeLauncher}/${dosRuntimeLauncher}`
    : `BRUN ${dosRuntimeLauncher || ""}`
  const lines: string[] = []
  const count = Math.max(1, Math.min(menuEntries.length, 99))
  const imageKinds = menuEntries.slice(0, count).map((entry) => entry.imageKind || "unknown")
  const runtimeVolumes: number[] = []
  for (let i = 0; i < count; i++) {
    runtimeVolumes[i] = i + 1
  }

  lines.push("10 D$=CHR$(4)")
  lines.push(`20 MAX=${count}:I=1`)
  lines.push("25 IF PEEK(49152)<128 THEN 30")
  lines.push("26 X=PEEK(49168)")
  lines.push("27 GOTO 25")
  lines.push("30 GOSUB 3000")
  lines.push("40 IF PEEK(49152)<128 THEN 40")
  lines.push("45 K=PEEK(49152)-128:X=PEEK(49168)")
  lines.push("50 IF K=8 THEN I=I-1:IF I<1 THEN I=MAX")
  lines.push("60 IF K=21 THEN I=I+1:IF I>MAX THEN I=1")
  lines.push("70 IF K=8 OR K=21 THEN GOSUB 1000:GOTO 40")
  lines.push("80 IF K=13 THEN GOSUB 2000:GOTO 40")
  lines.push("90 GOTO 40")

  lines.push("1000 HOME")
  lines.push("1005 IF I<1 OR I>MAX THEN I=1")
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

  // Startup render is explicit so initial display matches the first disk.
  lines.push("3000 HOME")
  lines.push("3010 POKE 49232,0:POKE 49235,0:POKE 49236,0:POKE 49239,0")
  lines.push(`3020 PRINT D$;\"BLOAD SCREEN${String(1).padStart(2, "0")},A$2000\"`)
  lines.push("3030 VTAB 22:HTAB 1:PRINT \"USE <- AND -> TO SELECT A DISK\"")
  lines.push("3040 VTAB 23:HTAB 1:PRINT \"PRESS ENTER TO RUN\"")
  lines.push("3050 RETURN")

  // ENTER handling by image kind.
  // DOS images: use DOS.MASTER commands (non-emulator-compatible path).
  // ProDOS/unknown images: keep explicit message, as raw image containers are not directly executable.
  lines.push("2000 REM ENTER HANDLER")
  for (let idx = 1; idx <= count; idx++) {
    const lineNo = 2000 + idx
    if (imageKinds[idx - 1] === "dos") {
      if (hasDosMasterRuntime) {
        // Route launch through DOS.MASTER runtime volume selection.
        lines.push(lineNo + ' IF I=' + idx + ' THEN PRINT D$;"' + dosRuntimeRunCommand + '":PRINT D$;"CATALOG,V' + runtimeVolumes[idx - 1] + '":RETURN')
      } else {
        lines.push(lineNo + ' IF I=' + idx + ' THEN VTAB 24:HTAB 1:INVERSE:PRINT "DOS.MASTER RUNTIME NOT INSTALLED":NORMAL:RETURN')
      }
    } else if (imageKinds[idx - 1] === "prodos") {
      const runCmd = menuProDosCommands[idx - 1]
      const prefix = menuProDosPrefixes[idx - 1]
      if (prefix && runCmd) {
        lines.push(lineNo + ' IF I=' + idx + ' THEN TEXT:PRINT D$;"PREFIX ' + prefix + '":PRINT D$;"' + runCmd + '":RETURN')
      } else if (prefix) {
        lines.push(lineNo + ' IF I=' + idx + ' THEN TEXT:PRINT D$;"PREFIX ' + prefix + '":PRINT D$;"CATALOG":RETURN')
      } else if (runCmd) {
        lines.push(lineNo + ' IF I=' + idx + ' THEN TEXT:PRINT D$;"' + runCmd + '":RETURN')
      } else {
        lines.push(lineNo + ' IF I=' + idx + ' THEN VTAB 24:HTAB 1:INVERSE:PRINT "PRODOS FILES IMPORTED":NORMAL:PRINT D$;"CATALOG":RETURN')
      }
    } else {
      if (hasDosMasterRuntime) {
        lines.push(lineNo + ' IF I=' + idx + ' THEN PRINT D$;"' + dosRuntimeRunCommand + '":PRINT D$;"CATALOG,V' + runtimeVolumes[idx - 1] + '":RETURN')
      } else {
        lines.push(lineNo + ' IF I=' + idx + ' THEN VTAB 24:HTAB 1:INVERSE:PRINT "DOS.MASTER RUNTIME NOT INSTALLED":NORMAL:RETURN')
      }
    }
  }
  lines.push("2050 VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER LAUNCH REQUESTED\":NORMAL")
  lines.push("2060 RETURN")

  return `${lines.join("\r")}\r`
}

/**
 * Generates STARTUP command file. For interactive exports, STARTUP runs MENUSRC.
 */
const generateInteractiveMenuStartup = (
  menuEntries: MenuDiskEntry[]
): string => {
  if (menuEntries.length === 0) {
    return "BRUN A2TSLAUNCH\rCATALOG\r"
  }
  return "RUN MENUSRC\r"
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

  while (block !== 0 && !visited.has(block)) {
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

const readProDosVolumeName = (data: Uint8Array): string | undefined => {
  // Root directory header entry lives at block 2, entry slot 0.
  if (data.length < (3 * BLOCK_SIZE)) return undefined
  const entry0 = (2 * BLOCK_SIZE) + getDirEntryOffset(0)
  const byte0 = data[entry0]
  const storageType = (byte0 >> 4) & 0x0F
  const nameLen = byte0 & 0x0F

  if (storageType !== 0x0F || nameLen < 1 || nameLen > 15) return undefined

  let rawName = ""
  for (let i = 0; i < nameLen; i++) {
    const c = data[entry0 + 1 + i]
    if (c < 0x20 || c > 0x7E) return undefined
    rawName += String.fromCharCode(c)
  }

  const normalized = normalizeProDosFilename(rawName)
  return normalized.length > 0 ? normalized : undefined
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

  for (const candidate of decoded.candidates) {
    if (!isLikelyProDosVolume(candidate.data)) continue

    const extracted = extractProDosFilesRecursive(candidate.data)
    if (extracted.length > 0) {
      const volumeName = readProDosVolumeName(candidate.data)
      return extracted.map((file) => ({
        name: file.name,
        relativePath: file.relativePath,
        volumeName,
        type: file.type,
        auxType: file.auxType,
        data: file.data,
      }))
    }
  }

  return []
}

const detectProDosLaunchCommand = (files: BuildInputFile[]): string | undefined => {
  const byName = new Map(files.map((f) => [f.name.toUpperCase(), f]))

  if (byName.has("BASIC.SYSTEM")) return "-BASIC.SYSTEM"
  if (byName.has("STARTUP")) return "-STARTUP"

  if (byName.has("HELLO")) {
    const hello = byName.get("HELLO")
    if (hello?.type === 0xFC) return "RUN HELLO"
    if (hello?.type === 0x06) return "BRUN HELLO"
    return "-HELLO"
  }

  const sys = files.find((f) => f.type === 0xFF)
  if (sys) return `-${sys.name}`

  const bin = files.find((f) => f.type === 0x06)
  if (bin) return `BRUN ${bin.name}`

  const bas = files.find((f) => f.type === 0xFC)
  if (bas) return `RUN ${bas.name}`

  return undefined
}

const replaceAsciiAll = (data: Uint8Array, fromText: string, toText: string) => {
  const from = new TextEncoder().encode(fromText)
  const to = new TextEncoder().encode(toText)
  if (from.length === 0 || data.length < from.length) return data

  const chunks: Uint8Array[] = []
  let i = 0
  let changed = false
  let segmentStart = 0

  while (i <= data.length - from.length) {
    let match = true
    for (let j = 0; j < from.length; j++) {
      if (data[i + j] !== from[j]) {
        match = false
        break
      }
    }
    if (match) {
      changed = true
      if (segmentStart < i) chunks.push(data.slice(segmentStart, i))
      chunks.push(to)
      i += from.length
      segmentStart = i
      continue
    }
    i++
  }

  if (!changed) return data
  if (segmentStart < data.length) chunks.push(data.slice(segmentStart))

  const total = chunks.reduce((sum, c) => sum + c.length, 0)
  const out = new Uint8Array(total)
  let outPos = 0
  for (const chunk of chunks) {
    out.set(chunk, outPos)
    outPos += chunk.length
  }
  return out
}

const rewriteTokenizedApplesoftProgramPath = (data: Uint8Array, fromText: string, toText: string): Uint8Array | undefined => {
  // For Applesoft BASIC, try simple ASCII replacement first (preserves structure).
  // Only attempt if pattern is found.
  const result = replaceAsciiAll(data, fromText, toText)
  if (result.length !== data.length) {
    // Replacement happened and size changed - this is risky for BASIC.
    // Only return if the original size was an exact match.
    return undefined
  }
  // If sizes match or no replacement, safe to return.
  return result.every((v, i) => v === data[i]) ? undefined : result
}

const rewriteImportedProgramPath = (type: number, data: Uint8Array, fromText: string, toText: string): Uint8Array => {
  if (fromText === toText) return data

  // Text files can be rewritten directly.
  if (type === PRODOS_FILE_TYPE_TEXT) {
    return replaceAsciiAll(data, fromText, toText)
  }

  // Applesoft BASIC programs are tokenized with linked-line pointers.
  // Rebuild pointers after replacement to avoid corrupting program structure.
  if (type === 0xFC) {
    const rewritten = rewriteTokenizedApplesoftProgramPath(data, fromText, toText)
    return rewritten || data
  }

  // 0xFF files might also be BASIC programs (e.g., MousePaint's BASIC file).
  // Try to rewrite as tokenized BASIC.
  if (type === 0xFF) {
    const rewritten = rewriteTokenizedApplesoftProgramPath(data, fromText, toText)
    if (rewritten) {
      return rewritten
    }
  }

  return data
}

const applyGenericPrefixRewrite = (type: number, data: Uint8Array): Uint8Array => {
  // Shim-only rewrite strategy: do not mutate imported BAS/TXT payloads.
  // Keep helper reference compile-used.
  return rewriteImportedProgramPath(type, data, "", "")
}

const preprocessInputFilesForMenu = (
  files: BuildInputFile[],
  menuEntries?: MenuDiskEntry[],
  reservedNames?: Set<string>
) => {
  const outputFiles: BuildInputFile[] = []
  const directoryPlans: DirectoryImportPlan[] = []
  const menuProDosCommands: Array<string | undefined> = []
  const menuProDosPrefixes: Array<string | undefined> = []
  const usedNames = new Set<string>(reservedNames || [])

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const kind = menuEntries?.[i]?.imageKind || "unknown"
    const sourceFilename = menuEntries?.[i]?.sourceFilename || file.name
    const isWozContainer = sourceFilename.toLowerCase().endsWith(".woz")
    const wozExtractedFiles = menuEntries?.[i]?.wozExtractedProDosFiles

    if (wozExtractedFiles && wozExtractedFiles.length > 0) {
      const extractedVolumeName = wozExtractedFiles.find((f) => !!f.volumeName)?.volumeName
      const imagePrefix = extractedVolumeName || normalizeProDosFilename(file.name).split(".")[0] || "IMG"
      const directoryName = makeUniqueProDosFilename(imagePrefix, usedNames)
      const directoryFiles: BuildInputFile[] = []
      const SYSTEM_FILES_TO_SKIP = new Set(["PRODOS", "LOADER.SYSTEM"])
      for (const extractedFile of wozExtractedFiles) {
        if (SYSTEM_FILES_TO_SKIP.has(extractedFile.name)) {
          continue
        }
        const normalized = normalizeProDosFilename(extractedFile.name)
        const rewrittenData = applyGenericPrefixRewrite(extractedFile.type, extractedFile.data)
        directoryFiles.push({
          name: normalized,
          type: extractedFile.type,
          data: rewrittenData,
          auxType: extractedFile.auxType,
          relativePath: extractedFile.relativePath,
        })
      }
      const launchCommand = detectProDosLaunchCommand(directoryFiles)
      directoryPlans.push({ name: directoryName, files: directoryFiles, sourceMenuIndex: i, launchCommand })
      menuProDosPrefixes[i] = directoryName
      menuProDosCommands[i] = launchCommand
      continue
    }

    // Keep WOZ container images as-is (track-based, not block-addressable ProDOS).
    if (isWozContainer) {
      const normalized = makeUniqueProDosFilename(file.name, usedNames)
      outputFiles.push({ ...file, name: normalized })
      menuProDosCommands[i] = undefined
      menuProDosPrefixes[i] = undefined
      continue
    }

    // For block images that are ProDOS by structure or classification, import files under an image-name prefix.
    const shouldTryProDosImport = kind === "prodos" || isLikelyProDosVolume(file.data)
    if (shouldTryProDosImport) {
      const extracted = extractProDosFilesRecursive(file.data)
      if (extracted.length > 0) {
        const extractedVolumeName = readProDosVolumeName(file.data)
        const imagePrefix = extractedVolumeName || normalizeProDosFilename(file.name).split(".")[0] || "IMG"
        const directoryName = makeUniqueProDosFilename(imagePrefix, usedNames)
        const directoryFiles: BuildInputFile[] = []
        // Filter out system files that duplicate across all disk extracts.
        const SYSTEM_FILES_TO_SKIP = new Set(["PRODOS", "LOADER.SYSTEM"])
        for (const extractedFile of extracted) {
          // Skip system files that appear in every disk image.
          if (SYSTEM_FILES_TO_SKIP.has(extractedFile.name)) {
            continue
          }
          const normalized = normalizeProDosFilename(extractedFile.name)
          const rewrittenData = applyGenericPrefixRewrite(extractedFile.type, extractedFile.data)
          directoryFiles.push({
            name: normalized,
            type: extractedFile.type,
            data: rewrittenData,
            auxType: extractedFile.auxType,
            relativePath: extractedFile.relativePath,
          })
        }
        const launchCommand = detectProDosLaunchCommand(directoryFiles)
        directoryPlans.push({ name: directoryName, files: directoryFiles, sourceMenuIndex: i, launchCommand })
        menuProDosPrefixes[i] = directoryName
        menuProDosCommands[i] = launchCommand
      } else {
        const normalized = makeUniqueProDosFilename(file.name, usedNames)
        outputFiles.push({ ...file, name: normalized })
        menuProDosCommands[i] = undefined
        menuProDosPrefixes[i] = undefined
      }
      continue
    }

    const normalized = makeUniqueProDosFilename(file.name, usedNames)
    outputFiles.push({
      ...file,
      name: normalized,
    })
    menuProDosPrefixes[i] = undefined
  }

  return { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes }
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

const ALIAS_SHIM_LOAD_ADDRESS = 0x6000

const createAliasShimBinary = (loadAddress = ALIAS_SHIM_LOAD_ADDRESS) => {
  const origVectorOffset = 0x170
  const runtimeOffset = 0x180
  const debugExecMarkerOffset = 0x38D
  const debugInstallMarkerOffset = 0x38E
  const debugCounterOffset = 0x38F
  const debugPrefixCounterOffset = 0x390
  const debugAbsPathOffset = 0x391
  const debugParamPtrOffset = 0x392
  const debugPathnamePtrOffset = 0x393
  const debugPathnameCharOffset = 0x394
  const debugAbsMatchOffset = 0x395
  const debugWriteProbeOffset = 0x396

  const origVectorAddr = loadAddress + origVectorOffset
  const runtimeLo = (loadAddress + runtimeOffset) & 0xFF
  const runtimeHi = ((loadAddress + runtimeOffset) >> 8) & 0xFF
  const debugExecMarkerAddr = loadAddress + debugExecMarkerOffset
  const debugInstallMarkerAddr = loadAddress + debugInstallMarkerOffset
  const debugCounterAddr = loadAddress + debugCounterOffset
  const debugPrefixCounterAddr = loadAddress + debugPrefixCounterOffset
  const debugAbsPathAddr = loadAddress + debugAbsPathOffset
  const debugParamPtrAddr = loadAddress + debugParamPtrOffset
  const debugPathnamePtrAddr = loadAddress + debugPathnamePtrOffset
  const debugPathnameCharAddr = loadAddress + debugPathnameCharOffset
  const debugAbsMatchAddr = loadAddress + debugAbsMatchOffset
  const debugWriteProbeAddr = loadAddress + debugWriteProbeOffset

  const code: number[] = []
  const emit = (...bytes: number[]) => code.push(...bytes)

  // Mark installer entry.
  emit(0xA9, 0xA1)
  emit(0x8D, debugExecMarkerAddr & 0xFF, (debugExecMarkerAddr >> 8) & 0xFF)
  emit(0xA9, 0x01)
  emit(0x8D, debugInstallMarkerAddr & 0xFF, (debugInstallMarkerAddr >> 8) & 0xFF)

  // Idempotency check against BF01/BF02 target.
  emit(0xAD, 0x01, 0xBF) // LDA $BF01
  emit(0xC9, runtimeLo)  // CMP #runtimeLo
  emit(0xD0, 0x07)       // BNE install
  emit(0xAD, 0x02, 0xBF) // LDA $BF02
  emit(0xC9, runtimeHi)  // CMP #runtimeHi
  emit(0xF0, 0x14)       // BEQ done

  // Save original BF01/BF02 target and patch to runtime.
  emit(0xAD, 0x01, 0xBF)
  emit(0x8D, origVectorAddr & 0xFF, (origVectorAddr >> 8) & 0xFF)
  emit(0xAD, 0x02, 0xBF)
  emit(0x8D, (origVectorAddr + 1) & 0xFF, ((origVectorAddr + 1) >> 8) & 0xFF)
  emit(0xA9, runtimeLo)
  emit(0x8D, 0x01, 0xBF)
  emit(0xA9, runtimeHi)
  emit(0x8D, 0x02, 0xBF)
  emit(0xA9, 0x02)
  emit(0x8D, debugInstallMarkerAddr & 0xFF, (debugInstallMarkerAddr >> 8) & 0xFF)

  // done
  emit(0x60)

  if (code.length > runtimeOffset) {
    throw new Error(`A2TSALIAS installer too large for runtime slot: ${code.length}`)
  }
  while (code.length < runtimeOffset) emit(0xEA)

  // Runtime: rewrite absolute SET_PREFIX paths in-place.
  // 25487 = every entry, 25488 = SET_PREFIX, 25489 = in SET_PREFIX branch,
  // 25490 = param pointer read, 25491 = pathname pointer read,
  // 25492 = pathname[1] read, 25493 = pathname[1] == '/', 25494 = rewrite applied
  emit(0xEE, debugCounterAddr & 0xFF, (debugCounterAddr >> 8) & 0xFF) // INC 25487

  // Save state: 9 pushes (A, X, Y, $06-$0B)
  emit(0x48)                              // PHA (A)
  emit(0x8A); emit(0x48)                  // TXA, PHA (X)
  emit(0x98); emit(0x48)                  // TYA, PHA (Y)
  emit(0xA5, 0x06); emit(0x48)            // LDA $06, PHA
  emit(0xA5, 0x07); emit(0x48)            // LDA $07, PHA
  emit(0xA5, 0x08); emit(0x48)            // LDA $08, PHA
  emit(0xA5, 0x09); emit(0x48)            // LDA $09, PHA
  emit(0xA5, 0x0A); emit(0x48)            // LDA $0A, PHA
  emit(0xA5, 0x0B); emit(0x48)            // LDA $0B, PHA

  // 9 pushes → stack offset = $0101 + 9 = $010A/$010B
  emit(0xBA)                              // TSX
  emit(0xBD, 0x0A, 0x01)                 // LDA $010A,X (return addr lo)
  emit(0x18); emit(0x69, 0x01)            // CLC, ADC #1
  emit(0x85, 0x06)                        // STA $06 (cmd ptr lo)
  emit(0xBD, 0x0B, 0x01)                 // LDA $010B,X (return addr hi)
  emit(0x69, 0x00)                        // ADC #0
  emit(0x85, 0x07)                        // STA $07 (cmd ptr hi)

  // Read command byte
  emit(0xA0, 0x00); emit(0xB1, 0x06)      // LDY #0, LDA ($06),Y
  emit(0xC9, 0xC6)                        // CMP #$C6
  emit(0xF0, 0x03)                        // BEQ +3 (skip JMP)
  const jmp1pos = code.length
  emit(0x4C, 0x00, 0x00)                  // JMP restore (patched later)

  // --- SET_PREFIX detected ---
  emit(0xEE, debugPrefixCounterAddr & 0xFF, (debugPrefixCounterAddr >> 8) & 0xFF) // INC 25488
  emit(0xEE, debugAbsPathAddr & 0xFF, (debugAbsPathAddr >> 8) & 0xFF) // INC 25489 (branch reached)

  // Read param block ptr: cmd+1=lo, cmd+2=hi → $08/$09
  emit(0xA0, 0x01); emit(0xB1, 0x06); emit(0x85, 0x08)
  emit(0xA0, 0x02); emit(0xB1, 0x06); emit(0x85, 0x09)

  // Mark successful param pointer read.
  emit(0xEE, debugParamPtrAddr & 0xFF, (debugParamPtrAddr >> 8) & 0xFF) // INC 25490

  // Read pathname ptr from param block offset 1(lo), 2(hi) → $0A/$0B
  emit(0xA0, 0x01); emit(0xB1, 0x08); emit(0x85, 0x0A)
  emit(0xA0, 0x02); emit(0xB1, 0x08); emit(0x85, 0x0B)

  // Mark successful pathname pointer read.
  emit(0xEE, debugPathnamePtrAddr & 0xFF, (debugPathnamePtrAddr >> 8) & 0xFF) // INC 25491

  // Guard: empty path has no leading character, so pass through unchanged.
  emit(0xA0, 0x00); emit(0xB1, 0x0A) // LDY #0, LDA ($0A),Y (path length)
  emit(0xD0, 0x03) // BNE +3 (skip JMP)
  const jmpNoLeadingCharPos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore (patched later)

  // Read first pathname character (offset 1; offset 0 is length).
  emit(0xA0, 0x01); emit(0xB1, 0x0A) // LDY #1, LDA ($0A),Y

  // Mark successful pathname byte read.
  emit(0xEE, debugPathnameCharAddr & 0xFF, (debugPathnameCharAddr >> 8) & 0xFF) // INC 25492

  // Check absolute path indicator: '/'
  emit(0xC9, 0x2F) // CMP #'/'
  emit(0xF0, 0x03) // BEQ +3 (skip JMP)
  const jmp2pos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore (patched later)
  emit(0xEE, debugAbsMatchAddr & 0xFF, (debugAbsMatchAddr >> 8) & 0xFF) // INC 25493

  // If already rooted at /APPLE2TS or /APPLE2TS/, pass through unchanged.
  // This avoids double-prefixing when callers canonicalize relative paths.
  emit(0xA0, 0x00); emit(0xB1, 0x0A) // LDY #0, LDA ($0A),Y (orig len)
  emit(0xC9, 0x09) // CMP #9 ('/APPLE2TS')
  emit(0xB0, 0x03) // BCS +3 (skip JMP)
  const jmpAlreadyPrefixedContLenPos = code.length
  emit(0x4C, 0x00, 0x00) // JMP alreadyPrefixedContinue (patched later)

  emit(0xA0, 0x02); emit(0xB1, 0x0A) // 'A'
  emit(0xC9, 0x41)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont1Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x03); emit(0xB1, 0x0A) // 'P'
  emit(0xC9, 0x50)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont2Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x04); emit(0xB1, 0x0A) // 'P'
  emit(0xC9, 0x50)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont3Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x05); emit(0xB1, 0x0A) // 'L'
  emit(0xC9, 0x4C)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont4Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x06); emit(0xB1, 0x0A) // 'E'
  emit(0xC9, 0x45)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont5Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x07); emit(0xB1, 0x0A) // '2'
  emit(0xC9, 0x32)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont6Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x08); emit(0xB1, 0x0A) // 'T'
  emit(0xC9, 0x54)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont7Pos = code.length
  emit(0x4C, 0x00, 0x00)

  emit(0xA0, 0x09); emit(0xB1, 0x0A) // 'S'
  emit(0xC9, 0x53)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont8Pos = code.length
  emit(0x4C, 0x00, 0x00)

  // Exact '/APPLE2TS' should pass through.
  emit(0xA0, 0x00); emit(0xB1, 0x0A) // len
  emit(0xC9, 0x09)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCheckSlashPos = code.length
  emit(0x4C, 0x00, 0x00) // JMP check slash char at offset 10
  const jmpAlreadyPrefixedRestoreLen9Pos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore

  // '/APPLE2TS/' should also pass through.
  emit(0xA0, 0x0A); emit(0xB1, 0x0A)
  emit(0xC9, 0x2F)
  emit(0xF0, 0x03)
  const jmpAlreadyPrefixedCont9Pos = code.length
  emit(0x4C, 0x00, 0x00)
  const jmpAlreadyPrefixedRestoreSlashPos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore

  const alreadyPrefixedContinueAddr = loadAddress + code.length

  // Length guard: if original length >= 55, adding 9 chars would exceed ProDOS max 63.
  emit(0xA0, 0x00); emit(0xB1, 0x0A) // LDY #0, LDA ($0A),Y (orig len)
  emit(0xC9, 0x37) // CMP #55
  emit(0x90, 0x03) // BCC +3 (skip JMP)
  const jmp3pos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore (patched later)

  // X = original length. Update length += 9.
  emit(0xAA) // TAX
  emit(0x18); emit(0x69, 0x09) // CLC, ADC #9
  emit(0xA0, 0x00); emit(0x91, 0x0A) // LDY #0, STA ($0A),Y

  // Shift bytes [2..orig_len] right by 9 positions, from end to start.
  // Preserve the loaded source byte across index math so A is not clobbered.
  const shiftLoopAddr = loadAddress + code.length
  emit(0xE0, 0x01) // CPX #1
  emit(0xF0, 0x11) // BEQ done_shift
  emit(0x8A) // TXA
  emit(0xA8) // TAY
  emit(0xB1, 0x0A) // LDA ($0A),Y
  emit(0x48) // PHA
  emit(0x8A) // TXA
  emit(0x18); emit(0x69, 0x09) // CLC, ADC #9
  emit(0xA8) // TAY
  emit(0x68) // PLA
  emit(0x91, 0x0A) // STA ($0A),Y
  emit(0xCA) // DEX
  emit(0x4C, shiftLoopAddr & 0xFF, (shiftLoopAddr >> 8) & 0xFF) // JMP shiftLoop

  // Insert "APPLE2TS/" at offsets 2..10 (after leading '/').
  emit(0xA0, 0x02) // LDY #2
  emit(0xA9, 0x41); emit(0x91, 0x0A); emit(0xC8) // 'A'
  emit(0xA9, 0x50); emit(0x91, 0x0A); emit(0xC8) // 'P'
  emit(0xA9, 0x50); emit(0x91, 0x0A); emit(0xC8) // 'P'
  emit(0xA9, 0x4C); emit(0x91, 0x0A); emit(0xC8) // 'L'
  emit(0xA9, 0x45); emit(0x91, 0x0A); emit(0xC8) // 'E'
  emit(0xA9, 0x32); emit(0x91, 0x0A); emit(0xC8) // '2'
  emit(0xA9, 0x54); emit(0x91, 0x0A); emit(0xC8) // 'T'
  emit(0xA9, 0x53); emit(0x91, 0x0A); emit(0xC8) // 'S'
  emit(0xA9, 0x2F); emit(0x91, 0x0A)             // '/'

  // Mark rewrite applied.
  emit(0xEE, debugWriteProbeAddr & 0xFF, (debugWriteProbeAddr >> 8) & 0xFF) // INC 25494

  // --- restore ---  (patch JMP placeholders)
  const restoreAddr = loadAddress + code.length
  code[jmp1pos + 1] = restoreAddr & 0xFF; code[jmp1pos + 2] = (restoreAddr >> 8) & 0xFF
  code[jmpNoLeadingCharPos + 1] = restoreAddr & 0xFF; code[jmpNoLeadingCharPos + 2] = (restoreAddr >> 8) & 0xFF
  code[jmp2pos + 1] = restoreAddr & 0xFF; code[jmp2pos + 2] = (restoreAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedRestoreLen9Pos + 1] = restoreAddr & 0xFF; code[jmpAlreadyPrefixedRestoreLen9Pos + 2] = (restoreAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedRestoreSlashPos + 1] = restoreAddr & 0xFF; code[jmpAlreadyPrefixedRestoreSlashPos + 2] = (restoreAddr >> 8) & 0xFF
  code[jmp3pos + 1] = restoreAddr & 0xFF; code[jmp3pos + 2] = (restoreAddr >> 8) & 0xFF

  code[jmpAlreadyPrefixedContLenPos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedContLenPos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont1Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont1Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont2Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont2Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont3Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont3Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont4Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont4Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont5Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont5Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont6Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont6Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont7Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont7Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont8Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont8Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCont9Pos + 1] = alreadyPrefixedContinueAddr & 0xFF; code[jmpAlreadyPrefixedCont9Pos + 2] = (alreadyPrefixedContinueAddr >> 8) & 0xFF
  code[jmpAlreadyPrefixedCheckSlashPos + 1] = (jmpAlreadyPrefixedRestoreLen9Pos + 3 + loadAddress) & 0xFF; code[jmpAlreadyPrefixedCheckSlashPos + 2] = ((jmpAlreadyPrefixedRestoreLen9Pos + 3 + loadAddress) >> 8) & 0xFF

  // Unwind in reverse push order ($0B first, A last)
  emit(0x68); emit(0x85, 0x0B)           // PLA → $0B
  emit(0x68); emit(0x85, 0x0A)           // PLA → $0A
  emit(0x68); emit(0x85, 0x09)           // PLA → $09
  emit(0x68); emit(0x85, 0x08)           // PLA → $08
  emit(0x68); emit(0x85, 0x07)           // PLA → $07
  emit(0x68); emit(0x85, 0x06)           // PLA → $06
  emit(0x68); emit(0xA8)                 // PLA → TAY
  emit(0x68); emit(0xAA)                 // PLA → TAX
  emit(0x68)                             // PLA (restore A)
  emit(0x6C, origVectorAddr & 0xFF, (origVectorAddr >> 8) & 0xFF) // JMP (origVector)

  // Pad
  while (code.length <= 0x3FF) emit(0x00)

  return new Uint8Array(code)
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

const createDirectoryEntry = (
  dirname: string,
  keyBlock: number,
  blocksUsed: number,
  headerPointer: number,
): Uint8Array => {
  const entry = new Uint8Array(39)
  const nameBytes = dirname.toUpperCase().slice(0, 15).split("").map(c => c.charCodeAt(0))

  // Directory entry in parent: storage type $D, file type $0F.
  entry[0] = (0x0D << 4) | nameBytes.length
  for (let i = 0; i < nameBytes.length; i++) {
    entry[1 + i] = nameBytes[i]
  }
  entry[16] = 0x0F
  writeLittleEndian16(entry, 17, keyBlock)
  writeLittleEndian16(entry, 19, blocksUsed)
  writeLittleEndian24(entry, 21, blocksUsed * BLOCK_SIZE)

  const now = encodeProDosTime()
  writeLittleEndian16(entry, 24, now.dateWord)
  writeLittleEndian16(entry, 26, now.timeWord)
  entry[28] = 0x00
  entry[29] = 0x00
  entry[30] = 0xE3
  writeLittleEndian16(entry, 31, 0x0000)
  writeLittleEndian16(entry, 33, now.dateWord)
  writeLittleEndian16(entry, 35, now.timeWord)
  writeLittleEndian16(entry, 37, headerPointer)

  return entry
}

const findSubdirectoryHeaderTemplate = (disk: Uint8Array): Uint8Array | undefined => {
  const dirBlocks = collectRootDirectoryBlocks(disk)
  for (let b = 0; b < dirBlocks.length; b++) {
    const blockNum = dirBlocks[b]
    const dirBlock = new Uint8Array(disk.buffer, blockNum * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
      const entryOffset = getDirEntryOffset(slot)
      const byte0 = dirBlock[entryOffset]
      if (isDirectorySlotFree(byte0)) continue
      const storageType = (byte0 >> 4) & 0x0F
      const fileType = dirBlock[entryOffset + 16]
      if (storageType === 0x0D && fileType === 0x0F) {
        const keyBlock = readLittleEndian16(dirBlock, entryOffset + 17)
        const template = readBlock(disk, keyBlock)
        if (template) return template
      }
    }
  }
  return undefined
}

const createSubdirectoryHeaderBlock = (
  dirname: string,
  parentBlock: number,
  parentSlot: number,
  fileCount: number,
  template?: Uint8Array
): Uint8Array => {
  const block = new Uint8Array(BLOCK_SIZE)
  if (template && template.length === BLOCK_SIZE) {
    block.set(template)
  }

  // Linked-list pointers for this directory block.
  writeLittleEndian16(block, 0, 0)
  writeLittleEndian16(block, 2, 0)

  const headerOffset = getDirEntryOffset(0)
  const nameBytes = dirname.toUpperCase().slice(0, 15).split("").map(c => c.charCodeAt(0))
  block[headerOffset] = (0x0E << 4) | nameBytes.length
  for (let i = 0; i < 15; i++) {
    block[headerOffset + 1 + i] = i < nameBytes.length ? nameBytes[i] : 0
  }

  // Keep canonical ProDOS directory header markers.
  block[headerOffset + 16] = 0x75
  writeLittleEndian16(block, headerOffset + 17, 0)
  writeLittleEndian16(block, headerOffset + 19, 0)
  writeLittleEndian24(block, headerOffset + 21, 0)
  block[headerOffset + 31] = 0x27 // Entry length
  block[headerOffset + 32] = 0x0D // Entries per block
  writeLittleEndian16(block, headerOffset + 33, Math.min(fileCount, 0xFFFF))
  writeLittleEndian16(block, headerOffset + 35, parentBlock)
  block[headerOffset + 37] = parentSlot & 0xFF
  block[headerOffset + 38] = 0x27 // Parent entry length

  return block
}

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

  while (block !== 0 && !visited.has(block)) {
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

const scanRootDirectory = (disk: Uint8Array, dirBlocks: number[]) => {
  let fileCount = 0
  const existingNames = new Set<string>()
  let dosRuntimeLauncher: string | undefined
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
      if (!dosRuntimeLauncher) {
        if (name === "DOS.3.3") dosRuntimeLauncher = "DOS.3.3"
        else if (name === "DOS.MASTER") dosRuntimeLauncher = "DOS.MASTER"
        else if (name === "DOSMASTER") dosRuntimeLauncher = "DOSMASTER"
      }
    }
  }
  return { fileCount, existingNames, dosRuntimeLauncher }
}

export const buildProDosHdv = async (
  files: Array<{ name: string; type: number; data: Uint8Array; auxType?: number }>,
  volumeName = "APPLE2TS",
  prodos243Base?: Uint8Array,
  menuEntries?: MenuDiskEntry[]
): Promise<Uint8Array> => {
  let hdv = prodos243Base
  if (!hdv) {
    try {
      const dosMasterBase = "disks/dosmaster18.po"
      const response = await fetch(dosMasterBase)
      if (!response.ok) {
        throw new Error(`Failed to load required base image: ${dosMasterBase}`)
      }
      hdv = new Uint8Array(await response.arrayBuffer())
    } catch (e) {
      console.error("Failed to load dosmaster18.po base:", e)
      throw new Error("Could not load dosmaster18.po base disk")
    }
  }

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
  const { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes } = preprocessInputFilesForMenu(files, menuEntries, rootScan.existingNames)
  let fileCount = rootScan.fileCount
  const currentTotalBlocks = readLittleEndian16(rootHeader, volumeEntryOffset + 37)
  const bitmapStartBlock = readLittleEndian16(rootHeader, volumeEntryOffset + 35)

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
  const installAliasShim = directoryPlans.length > 0

  const launcherName = "A2TSLAUNCH"
  withStartup.unshift({
    name: launcherName,
    type: PRODOS_FILE_TYPE_BINARY,
    data: createLauncherBinary(),
    auxType: 0x2000,
  })

  if (installAliasShim) {
    withStartup.unshift({
      name: "A2TSAL3",
      type: PRODOS_FILE_TYPE_BINARY,
      data: createAliasShimBinary(ALIAS_SHIM_LOAD_ADDRESS),
      auxType: ALIAS_SHIM_LOAD_ADDRESS,
    })
  }

  // Generate STARTUP: interactive menu if menuEntries provided, else simple CATALOG
  let startupText: string
  const aliasShimRunCommand = `BRUN /${normalizedVolumeName}/A2TSAL3`
  if (menuEntries && menuEntries.length > 0) {
    // Generate interactive menu program
    startupText = `${installAliasShim ? `${aliasShimRunCommand}\r` : ""}${generateInteractiveMenuStartup(menuEntries)}`
  } else {
    // Fall back to simple launcher + catalog
    startupText = `${installAliasShim ? `${aliasShimRunCommand}\r` : ""}BRUN ${launcherName}\rCATALOG\r`
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
      type: 0xFC,
      data: tokenizeApplesoftBasic(generateMenuSourceProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes)),
      auxType: 0x0801,
    })
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
  const subdirectoryTemplate = findSubdirectoryHeaderTemplate(hdv)

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
    if (parentDirectoryNode) {
      const bucket = filePlansByDirectory.get(parentDirectoryNode) || []
      bucket.push(plan)
      filePlansByDirectory.set(parentDirectoryNode, bucket)
    }
  }

  for (const file of withStartup) {
    allocatePlannedFile(file)
  }

  const getOrCreateChildNode = (parent: DirectoryNode, name: string) => {
    const existing = parent.children.find((c) => c.name === name)
    if (existing) return existing
    const child: DirectoryNode = {
      name,
      files: [],
      children: [],
      keyBlock: 0,
      blocksUsed: 0,
      blocks: [],
    }
    parent.children.push(child)
    return child
  }

  const buildDirectoryTree = (directory: DirectoryImportPlan): DirectoryNode => {
    const root: DirectoryNode = {
      name: directory.name,
      files: [],
      children: [],
      keyBlock: 0,
      blocksUsed: 0,
      blocks: [],
    }

    for (const file of directory.files) {
      const normalizedFileName = normalizeProDosFilename(file.name)
      const pathParts = file.relativePath
        ? file.relativePath.split("/").filter((p) => p.length > 0).map((p) => normalizeProDosFilename(p))
        : []

      let node = root
      for (const part of pathParts) {
        node = getOrCreateChildNode(node, part)
      }
      node.files.push({
        ...file,
        name: normalizedFileName,
      })
    }

    return root
  }

  const rootDirectoryNodes = directoryPlans.map(buildDirectoryTree)

  const allocateDirectoryTree = (node: DirectoryNode) => {
    const entriesInDirectory = node.files.length + node.children.length
    const firstBlockCapacity = DIR_ENTRIES_PER_BLOCK - 1
    const remaining = Math.max(0, entriesInDirectory - firstBlockCapacity)
    const extraBlocks = Math.ceil(remaining / DIR_ENTRIES_PER_BLOCK)
    const directoryBlocksNeeded = Math.max(1, 1 + extraBlocks)
    node.blocks = allocateFreeBlocks(directoryBlocksNeeded)
    node.keyBlock = node.blocks[0]
    node.blocksUsed = node.blocks.length

    for (const child of node.children) {
      allocateDirectoryTree(child)
    }

    for (const file of node.files) {
      allocatePlannedFile(file, node)
    }
  }

  for (const rootNode of rootDirectoryNodes) {
    allocateDirectoryTree(rootNode)
  }

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
    const dirBlock = new Uint8Array(newHdv.buffer, dirBlockNumber * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let i = startIndex; i < DIR_ENTRIES_PER_BLOCK; i++) {
      const entryOffset = getDirEntryOffset(i)
      if (isDirectorySlotFree(dirBlock[entryOffset])) {
        freeSlots.push({ block: dirBlockNumber, slot: i })
      }
    }
  }

  const rootEntriesNeeded = filePlans.filter((p) => !p.parentDirectoryNode).length + rootDirectoryNodes.length
  if (rootEntriesNeeded > freeSlots.length) {
    throw new Error(`Not enough free directory entries. Need ${rootEntriesNeeded}, have ${freeSlots.length}.`)
  }

  let rootSlotIndex = 0

  const initializeDirectoryBlocks = (node: DirectoryNode) => {
    if (node.parentEntryBlock === undefined || node.parentEntrySlot === undefined) {
      throw new Error(`Directory parent entry not set for ${node.name}`)
    }

    for (let i = 0; i < node.blocks.length; i++) {
      const currentBlockNum = node.blocks[i]
      const currentBlock = new Uint8Array(newHdv.buffer, currentBlockNum * BLOCK_SIZE, BLOCK_SIZE)
      currentBlock.fill(0)
      const prevBlock = i > 0 ? node.blocks[i - 1] : 0
      const nextBlock = i + 1 < node.blocks.length ? node.blocks[i + 1] : 0
      writeLittleEndian16(currentBlock, 0, prevBlock)
      writeLittleEndian16(currentBlock, 2, nextBlock)
      if (i === 0) {
        const dirHeader = createSubdirectoryHeaderBlock(
          node.normalizedName || node.name,
          node.parentEntryBlock,
          node.parentEntrySlot,
          node.files.length + node.children.length,
          subdirectoryTemplate
        )
        currentBlock.set(dirHeader)
      }
    }
  }

  const getDirectoryEntryPosition = (node: DirectoryNode, entryIndex: number) => {
    const firstBlockCapacity = DIR_ENTRIES_PER_BLOCK - 1
    const blockIndex = entryIndex < firstBlockCapacity
      ? 0
      : 1 + Math.floor((entryIndex - firstBlockCapacity) / DIR_ENTRIES_PER_BLOCK)
    const slot = blockIndex === 0
      ? entryIndex + 1
      : (entryIndex - firstBlockCapacity) % DIR_ENTRIES_PER_BLOCK
    if (blockIndex >= node.blocks.length) {
      throw new Error(`Directory entry overflow in ${node.name}`)
    }
    return { block: node.blocks[blockIndex], slot }
  }

  const rootDirUsedNames = new Set<string>()
  for (const node of rootDirectoryNodes) {
    const entry = freeSlots[rootSlotIndex++]
    const dirBlock = new Uint8Array(newHdv.buffer, entry.block * BLOCK_SIZE, BLOCK_SIZE)
    const entryOffset = getDirEntryOffset(entry.slot)
    const normalizedName = makeUniqueProDosFilename(node.name, rootDirUsedNames)
    node.normalizedName = normalizedName
    node.parentEntryBlock = entry.block
    node.parentEntrySlot = entry.slot
    const directoryEntry = createDirectoryEntry(
      normalizedName,
      node.keyBlock,
      node.blocksUsed,
      entry.block,
    )
    dirBlock.set(directoryEntry, entryOffset)
    initializeDirectoryBlocks(node)
    fileCount++
  }

  for (let i = 0; i < filePlans.length; i++) {
    const plan = filePlans[i]
    if (plan.parentDirectoryNode) continue
    const entry = freeSlots[rootSlotIndex++]
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

  const writeDirectoryContents = (node: DirectoryNode) => {
    const dirUsedNames = new Set<string>()
    let entryIndex = 0

    for (const child of node.children) {
      const { block, slot } = getDirectoryEntryPosition(node, entryIndex++)
      const dirBlock = new Uint8Array(newHdv.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
      const entryOffset = getDirEntryOffset(slot)
      const normalizedChildName = makeUniqueProDosFilename(child.name, dirUsedNames)
      child.normalizedName = normalizedChildName
      child.parentEntryBlock = block
      child.parentEntrySlot = slot
      const directoryEntry = createDirectoryEntry(
        normalizedChildName,
        child.keyBlock,
        child.blocksUsed,
        block,
      )
      dirBlock.set(directoryEntry, entryOffset)
      initializeDirectoryBlocks(child)
    }

    const plans = filePlansByDirectory.get(node) || []
    for (const plan of plans) {
      const { block, slot } = getDirectoryEntryPosition(node, entryIndex++)
      const dirBlock = new Uint8Array(newHdv.buffer, block * BLOCK_SIZE, BLOCK_SIZE)
      const entryOffset = getDirEntryOffset(slot)
      const normalizedFileName = makeUniqueProDosFilename(plan.name, dirUsedNames)
      const fileEntry = createFileEntry(
        normalizedFileName,
        plan.type,
        plan.keyBlock,
        plan.data.length,
        plan.blocksUsed,
        block,
        plan.storageType,
        plan.auxType,
      )
      dirBlock.set(fileEntry, entryOffset)
    }

    for (const child of node.children) {
      writeDirectoryContents(child)
    }
  }

  for (const node of rootDirectoryNodes) {
    writeDirectoryContents(node)
  }

  const newRootHeader = new Uint8Array(newHdv.buffer, ROOT_DIR_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 33, fileCount)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 37, currentTotalBlocks)

  for (const plan of filePlans) {
    if (plan.storageType === 2) {
      // Sapling index block
      const indexBlockNum = plan.indexBlocks[0]
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
      setBlockUsedInBitmap(newHdv, bitmapStartBlock, plan.keyBlock)
      const masterBlock = new Uint8Array(newHdv.buffer, plan.keyBlock * BLOCK_SIZE, BLOCK_SIZE)

      for (let i = 0; i < plan.indexBlocks.length; i++) {
        const indexBlockNum = plan.indexBlocks[i]
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
