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
  displayName?: string
  screenshotData?: Uint8Array
  imageKind?: "dos" | "prodos" | "unknown"
}

type BuildInputFile = { name: string; type: number; data: Uint8Array; auxType?: number }

type ExtractedProDosFile = {
  name: string
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

/**
 * Generates an Applesoft source file to be EXEC'd by BASIC.SYSTEM.
 * This draws screenshots and supports left/right navigation.
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
  const escapedNames = menuEntries.slice(0, count).map((entry) =>
    (entry.displayName || entry.filename).toUpperCase().replace(/"/g, "'").slice(0, 28)
  )
  const imageKinds = menuEntries.slice(0, count).map((entry) => entry.imageKind || "unknown")
  const runtimeVolumes: number[] = []
  let runtimeVolumeCounter = 1
  for (let i = 0; i < count; i++) {
    runtimeVolumes[i] = runtimeVolumeCounter
    runtimeVolumeCounter++
  }

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
  for (let idx = 1; idx <= count; idx++) {
    const lineNo = 1130 + idx
    lines.push(`${lineNo} IF I=${idx} THEN VTAB 24:HTAB 1:INVERSE:PRINT \"${idx}. ${escapedNames[idx - 1]}\":NORMAL`)
  }
  lines.push("1160 RETURN")

  // ENTER handling by image kind.
  // DOS images: use DOS.MASTER commands (non-emulator-compatible path).
  // ProDOS/unknown images: keep explicit message, as raw image containers are not directly executable.
  lines.push("2000 REM ENTER HANDLER")
  for (let idx = 1; idx <= count; idx++) {
    const lineNo = 2000 + idx
    if (imageKinds[idx - 1] === "dos") {
      if (hasDosMasterRuntime) {
        // Route launch through DOS.MASTER runtime volume selection.
        lines.push(`${lineNo} IF I=${idx} THEN PRINT D$;\"${dosRuntimeRunCommand}\":PRINT D$;\"CATALOG,V${runtimeVolumes[idx - 1]}\":RETURN`)
      } else {
        lines.push(`${lineNo} IF I=${idx} THEN VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER RUNTIME NOT INSTALLED\":NORMAL:RETURN`)
      }
    } else if (imageKinds[idx - 1] === "prodos") {
      const runCmd = menuProDosCommands[idx - 1]
      const prefix = menuProDosPrefixes[idx - 1]
      if (prefix && runCmd) {
        lines.push(`${lineNo} IF I=${idx} THEN TEXT:PRINT D$;\"PREFIX ${prefix}\":PRINT D$;\"${runCmd}\":RETURN`)
      } else if (prefix) {
        lines.push(`${lineNo} IF I=${idx} THEN TEXT:PRINT D$;\"PREFIX ${prefix}\":PRINT D$;\"CATALOG\":RETURN`)
      } else if (runCmd) {
        lines.push(`${lineNo} IF I=${idx} THEN TEXT:PRINT D$;\"${runCmd}\":RETURN`)
      } else {
        lines.push(`${lineNo} IF I=${idx} THEN VTAB 24:HTAB 1:INVERSE:PRINT \"PRODOS FILES IMPORTED\":NORMAL:PRINT D$;\"CATALOG\":RETURN`)
      }
    } else {
      if (hasDosMasterRuntime) {
        lines.push(`${lineNo} IF I=${idx} THEN PRINT D$;\"${dosRuntimeRunCommand}\":PRINT D$;\"CATALOG,V${runtimeVolumes[idx - 1]}\":RETURN`)
      } else {
        lines.push(`${lineNo} IF I=${idx} THEN VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER RUNTIME NOT INSTALLED\":NORMAL:RETURN`)
      }
    }
  }
  lines.push("2050 VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER LAUNCH REQUESTED\":NORMAL")
  lines.push("2060 RETURN")

  // EXEC this file to define and run the program immediately.
  lines.push("RUN")
  return `${lines.join("\r")}\r`
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
      if (blockNum === 0) break
      copyDataBlock(blockNum)
    }
    return out
  }

  const masterBlock = readBlock(disk, keyBlock)
  if (!masterBlock) return out
  for (let i = 0; i < 256 && outPos < eof; i++) {
    const indexBlockNum = masterBlock[i] | (masterBlock[256 + i] << 8)
    if (indexBlockNum === 0) break
    const indexBlock = readBlock(disk, indexBlockNum)
    if (!indexBlock) continue
    for (let j = 0; j < 256 && outPos < eof; j++) {
      const blockNum = indexBlock[j] | (indexBlock[256 + j] << 8)
      if (blockNum === 0) break
      copyDataBlock(blockNum)
    }
  }
  return out
}

const extractProDosRootFiles = (diskImage: Uint8Array): ExtractedProDosFile[] => {
  const extracted: ExtractedProDosFile[] = []
  const dirBlocks = collectRootDirectoryBlocks(diskImage)
  if (dirBlocks.length === 0) return extracted

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
      if (storageType < 1 || storageType > 3) continue
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
      const data = readFileDataFromProDosImage(diskImage, storageType as 1 | 2 | 3, keyBlock, eof)

      extracted.push({
        name,
        type: fileType,
        auxType,
        storageType: storageType as 1 | 2 | 3,
        eof,
        data,
      })
    }
  }

  return extracted
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
    const filename = menuEntries?.[i]?.filename || file.name
    const isWozContainer = filename.toLowerCase().endsWith(".woz")

    // Keep WOZ container images as-is (track-based, not block-addressable ProDOS).
    if (isWozContainer) {
      const normalized = makeUniqueProDosFilename(file.name, usedNames)
      outputFiles.push({ ...file, name: normalized })
      menuProDosCommands[i] = undefined
      menuProDosPrefixes[i] = undefined
      continue
    }

    // For ProDOS block images, import root files into this export under an image-name prefix.
    if (kind === "prodos") {
      const extracted = extractProDosRootFiles(file.data)
      if (extracted.length > 0) {
        const imagePrefix = normalizeProDosFilename(file.name).split(".")[0] || "IMG"
        const directoryName = makeUniqueProDosFilename(imagePrefix, usedNames)
        const directoryUsedNames = new Set<string>()
        const directoryFiles: BuildInputFile[] = []
        for (const extractedFile of extracted) {
          const normalized = makeUniqueProDosFilename(extractedFile.name, directoryUsedNames)
          directoryFiles.push({
            name: normalized,
            type: extractedFile.type,
            data: extractedFile.data,
            auxType: extractedFile.auxType,
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
  writeLittleEndian16(block, headerOffset + 31, 0x0D27) // entry length ($27) + entries/block ($0D)
  writeLittleEndian16(block, headerOffset + 33, parentBlock)
  block[headerOffset + 35] = parentSlot
  block[headerOffset + 36] = 0
  writeLittleEndian16(block, headerOffset + 37, 0x2703)

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
      // Always use DOS.MASTER base when available (32MB in this workspace).
      const dosMasterCandidates = [
        "disks/dosmaster18.po",
        "disks/DOSMASTER%20BASE.po",
        "disks/DOSMASTER_BASE.po",
        "disks/DOSMASTER.po",
      ]
      for (const candidate of dosMasterCandidates) {
        const response = await fetch(candidate)
        if (response.ok) {
          hdv = new Uint8Array(await response.arrayBuffer())
          break
        }
      }

      if (!hdv) {
        const response = await fetch("disks/ProDOS%202.4.3.po")
        hdv = new Uint8Array(await response.arrayBuffer())
      }
    } catch (e) {
      console.error("Failed to load ProDOS 2.4.3 base:", e)
      throw new Error("Could not load ProDOS 2.4.3 base disk")
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
      data: new TextEncoder().encode(generateMenuSourceProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes)),
      auxType: 0x0000,
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
    parentDirectoryBlock?: number
  }> = []

  const directoryEntryPlans: Array<{
    name: string
    keyBlock: number
    blocksUsed: number
    blocks: number[]
  }> = []

  const subdirectoryTemplate = findSubdirectoryHeaderTemplate(hdv)

  for (const file of withStartup) {
    const dataBlocksNeeded = Math.max(1, Math.ceil(file.data.length / BLOCK_SIZE))

    let storageType: 1 | 2 | 3 = 1
    let keyBlock = 0
    let blocksUsed = dataBlocksNeeded
    let indexBlocks: number[] = []
    let dataBlocks: number[] = []

    if (dataBlocksNeeded === 1) {
      // Seedling: key block points directly to data block
      storageType = 1
      dataBlocks = allocateFreeBlocks(1)
      keyBlock = dataBlocks[0]
      blocksUsed = 1
    } else if (dataBlocksNeeded <= 256) {
      // Sapling: key block points to one index block
      storageType = 2
      keyBlock = allocateFreeBlocks(1)[0]
      indexBlocks = [keyBlock]
      dataBlocks = allocateFreeBlocks(dataBlocksNeeded)
      blocksUsed = dataBlocksNeeded + 1
    } else {
      // Tree: key block points to master index, which points to index blocks
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

    filePlans.push({
      name: file.name,
      type: file.type,
      data: file.data,
      auxType: file.auxType ?? 0x0000,
      keyBlock,
      blocksUsed,
      storageType,
      indexBlocks,
      dataBlocks,
    })
  }

  // Allocate subdirectories and their extracted files.
  for (const directory of directoryPlans) {
    const firstBlockCapacity = DIR_ENTRIES_PER_BLOCK - 1
    const remaining = Math.max(0, directory.files.length - firstBlockCapacity)
    const extraBlocks = Math.ceil(remaining / DIR_ENTRIES_PER_BLOCK)
    const directoryBlocksNeeded = Math.max(1, 1 + extraBlocks)
    const directoryBlocks = allocateFreeBlocks(directoryBlocksNeeded)
    const directoryBlock = directoryBlocks[0]
    directoryEntryPlans.push({
      name: directory.name,
      keyBlock: directoryBlock,
      blocksUsed: directoryBlocksNeeded,
      blocks: directoryBlocks,
    })

    for (const file of directory.files) {
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

      filePlans.push({
        name: file.name,
        type: file.type,
        data: file.data,
        auxType: file.auxType ?? 0x0000,
        keyBlock,
        blocksUsed,
        storageType,
        indexBlocks,
        dataBlocks,
        parentDirectoryBlock: directoryBlock,
      })
    }
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

  const rootEntriesNeeded = filePlans.filter((p) => !p.parentDirectoryBlock).length + directoryEntryPlans.length
  if (rootEntriesNeeded > freeSlots.length) {
    throw new Error(`Not enough free directory entries. Need ${rootEntriesNeeded}, have ${freeSlots.length}.`)
  }

  let rootSlotIndex = 0

  for (let i = 0; i < directoryEntryPlans.length; i++) {
    const plan = directoryEntryPlans[i]
    const entry = freeSlots[rootSlotIndex++]
    const dirBlock = new Uint8Array(newHdv.buffer, entry.block * BLOCK_SIZE, BLOCK_SIZE)
    const entryOffset = getDirEntryOffset(entry.slot)
    const directoryEntry = createDirectoryEntry(
      plan.name,
      plan.keyBlock,
      plan.blocksUsed,
      entry.block,
    )
    dirBlock.set(directoryEntry, entryOffset)

    // Initialize and chain all directory blocks for this subdirectory.
    for (let i = 0; i < plan.blocks.length; i++) {
      const currentBlockNum = plan.blocks[i]
      const currentBlock = new Uint8Array(newHdv.buffer, currentBlockNum * BLOCK_SIZE, BLOCK_SIZE)
      currentBlock.fill(0)
      const prevBlock = i > 0 ? plan.blocks[i - 1] : 0
      const nextBlock = i + 1 < plan.blocks.length ? plan.blocks[i + 1] : 0
      writeLittleEndian16(currentBlock, 0, prevBlock)
      writeLittleEndian16(currentBlock, 2, nextBlock)
      if (i === 0) {
        const dirHeader = createSubdirectoryHeaderBlock(plan.name, entry.block, entry.slot, subdirectoryTemplate)
        currentBlock.set(dirHeader)
      }
    }

    fileCount++
  }

  for (let i = 0; i < filePlans.length; i++) {
    const plan = filePlans[i]
    if (plan.parentDirectoryBlock) continue
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

  // Place subdirectory file entries within each subdirectory block.
  const subdirEntriesByBlock = new Map<number, typeof filePlans>()
  for (const plan of filePlans) {
    if (!plan.parentDirectoryBlock) continue
    const bucket = subdirEntriesByBlock.get(plan.parentDirectoryBlock) || []
    bucket.push(plan)
    subdirEntriesByBlock.set(plan.parentDirectoryBlock, bucket)
  }

  for (const [dirBlockNum, plans] of subdirEntriesByBlock.entries()) {
    const dirPlan = directoryEntryPlans.find((p) => p.keyBlock === dirBlockNum)
    if (!dirPlan) {
      throw new Error(`Missing subdirectory block chain for directory block ${dirBlockNum}`)
    }
    const capacity = (DIR_ENTRIES_PER_BLOCK - 1) + ((dirPlan.blocks.length - 1) * DIR_ENTRIES_PER_BLOCK)
    if (plans.length > capacity) {
      throw new Error(`Subdirectory exceeds capacity (${plans.length}/${capacity} files): block ${dirBlockNum}`)
    }

    for (let i = 0; i < plans.length; i++) {
      const plan = plans[i]
      const blockIndex = i < (DIR_ENTRIES_PER_BLOCK - 1)
        ? 0
        : 1 + Math.floor((i - (DIR_ENTRIES_PER_BLOCK - 1)) / DIR_ENTRIES_PER_BLOCK)
      const slot = blockIndex === 0
        ? i + 1
        : (i - (DIR_ENTRIES_PER_BLOCK - 1)) % DIR_ENTRIES_PER_BLOCK
      const targetDirBlockNum = dirPlan.blocks[blockIndex]
      const dirBlock = new Uint8Array(newHdv.buffer, targetDirBlockNum * BLOCK_SIZE, BLOCK_SIZE)
      const entryOffset = getDirEntryOffset(slot)
      const fileEntry = createFileEntry(
        plan.name,
        plan.type,
        plan.keyBlock,
        plan.data.length,
        plan.blocksUsed,
        targetDirBlockNum,
        plan.storageType,
        plan.auxType,
      )
      dirBlock.set(fileEntry, entryOffset)
    }
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
