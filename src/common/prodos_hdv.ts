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
}

/**
 * Creates binary menu metadata file with disk names and screenshot block references
 */
const createMenuMetadataFile = (entries: Array<{ filename: string; screenshotBlock: number }>): Uint8Array => {
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
  }
  
  return data
}

/**
 * Generates an Applesoft source file to be EXEC'd by BASIC.SYSTEM.
 * This draws screenshots and supports left/right navigation.
 */
const generateMenuSourceProgram = (menuEntries: MenuDiskEntry[]): string => {
  const lines: string[] = []
  const count = Math.max(1, Math.min(menuEntries.length, 99))
  const escapedNames = menuEntries.slice(0, count).map((entry) =>
    (entry.displayName || entry.filename).toUpperCase().replace(/"/g, "'").slice(0, 28)
  )

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

  // A raw ProDOS/WOZ/PO image inside a file cannot be directly launched by BRUN.
  // Keep ENTER behavior explicit instead of crashing into image bytes.
  lines.push("2000 VTAB 24:HTAB 1:INVERSE:PRINT \"SELECTED IMAGE IS NOT DIRECTLY EXECUTABLE IN PRODOS\":NORMAL")
  lines.push("2010 RETURN")

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

const BLOCK_SIZE = 512
const ROOT_DIR_BLOCK = 2
const BITMAP_BLOCK = 6
const DIR_HEADER_SIZE = 4
const DIR_ENTRY_SIZE = 39
const DIR_ENTRIES_PER_BLOCK = 13

const getDirEntryOffset = (entryIndex: number) => DIR_HEADER_SIZE + (entryIndex * DIR_ENTRY_SIZE)

const isDirectorySlotFree = (entryByte0: number) => ((entryByte0 >> 4) & 0x0F) === 0

const setBitmapBlockUsed = (bitmap: Uint8Array, blockNum: number) => {
  const byteIndex = Math.floor(blockNum / 8)
  const bitInByte = 7 - (blockNum % 8)
  bitmap[byteIndex] &= ~(1 << bitInByte)
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

const clearRootDirectoryEntries = (disk: Uint8Array, dirBlocks: number[]) => {
  for (let b = 0; b < dirBlocks.length; b++) {
    const dirBlockNumber = dirBlocks[b]
    const dirBlock = new Uint8Array(disk.buffer, dirBlockNumber * BLOCK_SIZE, BLOCK_SIZE)
    const startIndex = b === 0 ? 1 : 0
    for (let i = startIndex; i < DIR_ENTRIES_PER_BLOCK; i++) {
      const entryOffset = getDirEntryOffset(i)
      dirBlock.fill(0, entryOffset, entryOffset + DIR_ENTRY_SIZE)
    }
  }
}

type PreservedDirEntry = {
  block: number
  slot: number
  entry: Uint8Array
}

const readDirectoryEntryName = (entry: Uint8Array) => {
  const nameLength = entry[0] & 0x0F
  let name = ""
  for (let i = 0; i < nameLength; i++) {
    name += String.fromCharCode(entry[1 + i])
  }
  return name
}

const collectBootSystemEntries = (disk: Uint8Array, dirBlocks: number[]) => {
  const keep = new Set(["PRODOS", "BASIC.SYSTEM"])
  const preserved: PreservedDirEntry[] = []

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
      if (keep.has(name)) {
        preserved.push({ block, slot, entry })
      }
    }
  }

  return preserved
}

const restorePreservedEntries = (disk: Uint8Array, entries: PreservedDirEntry[]) => {
  for (const preserved of entries) {
    const dirBlock = new Uint8Array(disk.buffer, preserved.block * BLOCK_SIZE, BLOCK_SIZE)
    const entryOffset = getDirEntryOffset(preserved.slot)
    dirBlock.set(preserved.entry, entryOffset)
  }
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
      const response = await fetch("disks/ProDOS%202.4.3.po")
      hdv = new Uint8Array(await response.arrayBuffer())
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

  // Start from an empty root directory so old base-disk files do not leak into exports.
  const preservedSystemEntries = collectBootSystemEntries(hdv, dirBlocks)
  clearRootDirectoryEntries(hdv, dirBlocks)
  restorePreservedEntries(hdv, preservedSystemEntries)
  let fileCount = preservedSystemEntries.length
  const currentTotalBlocks = readLittleEndian16(rootHeader, volumeEntryOffset + 37)
  let nextBlock = Math.max(currentTotalBlocks, Math.ceil(hdv.length / BLOCK_SIZE))

  const normalizedVolumeName = volumeName.toUpperCase().slice(0, 15)
  const volumeNameLength = normalizedVolumeName.length
  rootHeader[volumeEntryOffset] = 0xF0 | volumeNameLength
  for (let i = 0; i < 15; i++) {
    rootHeader[volumeEntryOffset + 1 + i] = i < volumeNameLength ? normalizedVolumeName.charCodeAt(i) : 0
  }

  const withStartup = [...files]
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
      data: new TextEncoder().encode(generateMenuSourceProgram(menuEntries)),
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
    dataStartBlock: number
    dataBlocks: number
  }> = []

  for (const file of withStartup) {
    const dataBlocks = Math.max(1, Math.ceil(file.data.length / BLOCK_SIZE))

    let storageType: 1 | 2 | 3 = 1
    let keyBlock = nextBlock
    let dataStartBlock = nextBlock
    let blocksUsed = dataBlocks
    let indexBlocks: number[] = []

    if (dataBlocks === 1) {
      // Seedling: key block points directly to data block
      storageType = 1
      keyBlock = nextBlock
      dataStartBlock = nextBlock
      blocksUsed = 1
      nextBlock += 1
    } else if (dataBlocks <= 256) {
      // Sapling: key block points to one index block
      storageType = 2
      keyBlock = nextBlock
      indexBlocks = [nextBlock]
      dataStartBlock = nextBlock + 1
      blocksUsed = dataBlocks + 1
      nextBlock += blocksUsed
    } else {
      // Tree: key block points to master index, which points to index blocks
      storageType = 3
      const indexBlockCount = Math.ceil(dataBlocks / 256)
      if (indexBlockCount > 256) {
        throw new Error(`File too large for tree format: ${file.name}`)
      }

      keyBlock = nextBlock
      const firstIndexBlock = nextBlock + 1
      dataStartBlock = firstIndexBlock + indexBlockCount
      blocksUsed = 1 + indexBlockCount + dataBlocks

      indexBlocks = []
      for (let i = 0; i < indexBlockCount; i++) {
        indexBlocks.push(firstIndexBlock + i)
      }

      nextBlock += blocksUsed
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
      dataStartBlock,
      dataBlocks,
    })
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
        }
      })
    )

    // Add MENUDATA to filePlans
    const menuDataBlocks = Math.max(1, Math.ceil(menuMeta.length / BLOCK_SIZE))
    const menuDataKeyBlock = nextBlock
    const menuDataStartBlock = nextBlock
    nextBlock += menuDataBlocks

    filePlans.push({
      name: "MENUDATA",
      type: PRODOS_FILE_TYPE_LIBRARY,
      data: menuMeta,
      auxType: 0x0000,
      keyBlock: menuDataKeyBlock,
      blocksUsed: menuDataBlocks,
      storageType: menuDataBlocks === 1 ? 1 : 2,
      indexBlocks: menuDataBlocks > 1 ? [nextBlock - menuDataBlocks] : [],
      dataStartBlock: menuDataStartBlock,
      dataBlocks: menuDataBlocks,
    })
  }

  const newTotalBlocks = nextBlock
  if (newTotalBlocks > 4096) {
    throw new Error("Export exceeds 2MB. This exporter currently supports up to 4096 ProDOS blocks.")
  }

  const newHdv = new Uint8Array(newTotalBlocks * BLOCK_SIZE)
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

  if (filePlans.length > freeSlots.length) {
    throw new Error(`Not enough free directory entries. Need ${filePlans.length}, have ${freeSlots.length}.`)
  }

  for (let i = 0; i < filePlans.length; i++) {
    const plan = filePlans[i]
    const entry = freeSlots[i]
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

  const newRootHeader = new Uint8Array(newHdv.buffer, ROOT_DIR_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 33, fileCount)
  writeLittleEndian16(newRootHeader, volumeEntryOffset + 37, newTotalBlocks)

  const bitmap = new Uint8Array(newHdv.buffer, BITMAP_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  for (const plan of filePlans) {
    if (plan.storageType === 2) {
      // Sapling index block
      const indexBlockNum = plan.indexBlocks[0]
      setBitmapBlockUsed(bitmap, indexBlockNum)

      const indexBlockOffset = indexBlockNum * BLOCK_SIZE
      const indexBlock = new Uint8Array(newHdv.buffer, indexBlockOffset, BLOCK_SIZE)
      for (let i = 0; i < plan.dataBlocks; i++) {
        const blockNumber = plan.dataStartBlock + i
        indexBlock[i] = blockNumber & 0xFF
        indexBlock[256 + i] = (blockNumber >> 8) & 0xFF
      }
    }

    if (plan.storageType === 3) {
      // Tree master index block points to per-256-block index blocks
      setBitmapBlockUsed(bitmap, plan.keyBlock)
      const masterBlock = new Uint8Array(newHdv.buffer, plan.keyBlock * BLOCK_SIZE, BLOCK_SIZE)

      for (let i = 0; i < plan.indexBlocks.length; i++) {
        const indexBlockNum = plan.indexBlocks[i]
        masterBlock[i] = indexBlockNum & 0xFF
        masterBlock[256 + i] = (indexBlockNum >> 8) & 0xFF
        setBitmapBlockUsed(bitmap, indexBlockNum)

        const indexBlock = new Uint8Array(newHdv.buffer, indexBlockNum * BLOCK_SIZE, BLOCK_SIZE)
        const dataStart = i * 256
        const dataEnd = Math.min(dataStart + 256, plan.dataBlocks)
        for (let j = dataStart; j < dataEnd; j++) {
          const blockNumber = plan.dataStartBlock + j
          const slot = j - dataStart
          indexBlock[slot] = blockNumber & 0xFF
          indexBlock[256 + slot] = (blockNumber >> 8) & 0xFF
        }
      }
    }

    for (let i = 0; i < plan.dataBlocks; i++) {
      const blockNumber = plan.dataStartBlock + i
      setBitmapBlockUsed(bitmap, blockNumber)
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
