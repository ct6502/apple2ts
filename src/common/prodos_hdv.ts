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
  imageKind?: "dos" | "prodos" | "unknown" | "dosdirect"
  wozExtractedProDosFiles?: ImportedDiskFile[]
}

export type ImportedDiskFile = {
  name: string
  relativePath?: string
  volumeName?: string
  creationSortKey?: number
  type: number
  auxType?: number
  data: Uint8Array
}

type BuildInputFile = { name: string; type: number; data: Uint8Array; auxType?: number; relativePath?: string; creationSortKey?: number }

type ExtractedProDosFile = {
  name: string
  relativePath?: string
  creationSortKey?: number
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

type DirectLoadEntry = {
  binaryData: Uint8Array     // raw game binary payload (without DOS 4-byte header)
  loadAddress: number         // target load address ($0400-$9600)
  entryAddress: number        // JMP target after loading (typically == loadAddress)
  blockCount: number          // ceil(binaryData.length / 512)
  startBlock?: number         // filled in by HDV builder after block allocation
  coldStartFlagAddr?: number  // zero-page address of cold-start "done" flag (e.g. $37)
  coldStartFlagValue?: number // magic value to store (e.g. $A3) to skip cold-start
  zpSnapshot?: Uint8Array     // 256-byte zero page snapshot captured from floppy boot
}

/**
 * Creates binary menu metadata file with disk names and screenshot block references
 */
const createMenuMetadataFile = (entries: Array<{ filename: string; screenshotBlock: number; imageKind?: "dos" | "prodos" | "unknown" | "dosdirect" }>): Uint8Array => {
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

const formatMenuScreenTitle = (name: string) => {
  // Reserve 2 of the 34 columns for the leading/trailing spaces so safeName never exceeds 34.
  const safeName = " " + name.replace(/"/g, "'").slice(0, 32).toUpperCase() + " "
  const leftPad = Math.max(0, Math.floor((34 - safeName.length) / 2))
  const rightPad = Math.max(0, 34 - safeName.length - leftPad)
  return { safeName, leftPad, rightPad }
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
    if (text[i] === "\"") {
      tokens.push(text.charCodeAt(i++))
      while (i < text.length && text[i] !== "\"") tokens.push(text.charCodeAt(i++))
      if (i < text.length) tokens.push(text.charCodeAt(i++))
      continue
    }
    if (text[i] === " ") { i++; continue }
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
  const lines = source.split("\r").filter(l => l.length > 0)
  const parsed: Array<{ lineNum: number; tokens: number[] }> = []
  for (const line of lines) {
    let i = 0
    while (i < line.length && line[i] >= "0" && line[i] <= "9") i++
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

// Screen-hole byte ($0478 = 1144, the slot-0 hole) used to pass the menu-selected DOS
// volume number across the ProDOS -> DOS.MASTER -> DOS 3.3 boot to the volume-1 dispatcher
// HELLO. Screen holes survive HOME (they are not display character positions) and the DOS
// transition (they are reserved for peripheral-card scratch and untouched by DOS/ProDOS).
const DOS_DISPATCH_VOLUME_ADDRESS = 0x0478
// Adjacent screen-hole byte ($047A = 1146) used to pass how the selected DOS volume's
// HELLO should be launched: 0 = RUN HELLO, 1 = BRUN HELLO.
const DOS_DISPATCH_HELLO_MODE_ADDRESS = 0x047a

// DOS 3.3 RWTS IOB slot byte ($B7E9 = 47081), holding the boot slot * 16. DOS.MASTER's boot
// code sets this to the actual boot slot (it reads DEVNUM at the correct moment and matches
// the config), and the dispatcher HELLO runs immediately after DOS.MASTER loaded it from that
// same slot -- so PEEK(47081)/16 is a reliable boot-slot source on every machine, independent
// of the flaky ProDOS-side DEVNUM timing.
const DOS_IBSLOT_ADDRESS = 0xb7e9
const MENU_SELECTED_INDEX_ADDRESS = 0x0479
const HELPER_SUBDIR = "A2TSHLP"

// ===== Direct block-load support =====
// Address where the block-reader stub is POKEd by the Applesoft launcher.
const DIRECT_LOAD_STUB_ADDRESS = 0x0300
// ProDOS global page: current device number (DSSS0000).
const PRODOS_DEVNUM_ADDRESS = 0xBF30

/**
 * Builds the 6502 machine-language block-reader stub that the Applesoft launcher
 * BLOADs to $0300. The stub reads sequential blocks from the boot device by
 * calling the slot 7 device driver directly ($C7C0), bypassing the ProDOS MLI.
 *
 * The driver uses the standard ProDOS block-device page-zero protocol:
 *   $42 = command (1=READ)
 *   $43 = unit number (from DEVNUM at $BF30)
 *   $44-$45 = data buffer address
 *   $46-$47 = block number
 *
 * Parameters are embedded as inline data following the code, POKEd by the
 * Applesoft program before CALL 768:
 *
 *   Offset  Size  Field
 *   +0      code  (the stub itself)
 *   +N      2     startBlock  (LE) - first block to read
 *   +N+2    2     blockCount  (LE) - number of blocks to read
 *   +N+4    2     targetAddr  (LE) - base load address
 *   +N+6    2     entryAddr   (LE) - JMP target after loading
 */
const buildDirectLoadStub = (): { code: Uint8Array; paramOffset: number; zpFlagOffset: number } => {
  const BASE = DIRECT_LOAD_STUB_ADDRESS
  const code: number[] = []
  const emit = (...bytes: number[]) => { for (const b of bytes) code.push(b) }

  const patches: Array<{ pos: number; target: string; offset: number }> = []
  const labels: { [key: string]: number } = {}
  const markLabel = (name: string) => { labels[name] = code.length }
  const emitAddrRef = (name: string, off = 0) => {
    patches.push({ pos: code.length, target: name, offset: off })
    emit(0x00, 0x00)
  }
  const emitBranchRef = (opcode: number, name: string) => {
    emit(opcode)
    patches.push({ pos: code.length, target: name, offset: -(code.length + 1) })
    emit(0x00)
  }

  // === INIT: Set up page-zero block-device parameters ===

  // Command = READ (1)
  emit(0xA9, 0x01)                        // LDA #$01
  emit(0x85, 0x42)                        // STA $42

  // Unit number from DEVNUM
  emit(0xAD, PRODOS_DEVNUM_ADDRESS & 0xFF, (PRODOS_DEVNUM_ADDRESS >> 8) & 0xFF) // LDA $BF30
  emit(0x85, 0x43)                        // STA $43

  // Copy targetAddr -> buffer address ($44-$45)
  emit(0xAD); emitAddrRef("targetAddr", 0) // LDA targetAddr lo
  emit(0x85, 0x44)                        // STA $44
  emit(0xAD); emitAddrRef("targetAddr", 1) // LDA targetAddr hi
  emit(0x85, 0x45)                        // STA $45

  // Copy startBlock -> block number ($46-$47)
  emit(0xAD); emitAddrRef("startBlock", 0) // LDA startBlock lo
  emit(0x85, 0x46)                        // STA $46
  emit(0xAD); emitAddrRef("startBlock", 1) // LDA startBlock hi
  emit(0x85, 0x47)                        // STA $47

  // === LOOP ===
  markLabel("loop")
  emit(0xAD); emitAddrRef("blockCount", 0) // LDA blockCount lo
  emit(0x0D); emitAddrRef("blockCount", 1) // ORA blockCount hi
  emitBranchRef(0xF0, "done")              // BEQ done

  // Call device driver directly at $C7C0 (slot 7 block driver)
  emit(0x20, 0xC0, 0xC7)                  // JSR $C7C0
  emitBranchRef(0xB0, "error")            // BCS error

  // Advance buffer +$200
  emit(0xE6, 0x45)                        // INC $45
  emit(0xE6, 0x45)                        // INC $45

  // Increment block number (16-bit)
  emit(0xE6, 0x46)                        // INC $46
  emit(0xD0, 0x02)                        // BNE +2
  emit(0xE6, 0x47)                        // INC $47

  // Decrement blockCount (16-bit)
  emit(0xAD); emitAddrRef("blockCount", 0) // LDA blockCount lo
  emit(0x38)                                // SEC
  emit(0xE9, 0x01)                          // SBC #1
  emit(0x8D); emitAddrRef("blockCount", 0) // STA blockCount lo
  emit(0xB0, 0x03)                          // BCS +3 (no borrow -> loop)
  emit(0xCE); emitAddrRef("blockCount", 1) // DEC blockCount hi
  emit(0x4C); emitAddrRef("loop")           // JMP loop

  // === DONE: set up slot ROM table, cold-start flag, then jump to game entry ===
  markLabel("done")

  // Set up $BF73 slot ROM signature table.
  // Many games compare slot ROM first-bytes with a lookup table at $BF73,X
  // during hardware detection.  The original launcher (e.g. MDSADJ) populated
  // this table from the actual slot ROMs.  On ProDOS HDV boot, $BF00-$BFFF
  // has ProDOS system globals instead, causing the detection to fail.
  // Fix: read $Cn00 for each slot 1-7 and store at $BF73+n.
  emit(0xA2, 0x07)                            // LDX #$07
  emit(0xA0, 0x00)                            // LDY #$00
  markLabel("slotLoop")
  emit(0x8A)                                  // TXA
  emit(0x09, 0xC0)                            // ORA #$C0
  emit(0x85, 0xA5)                            // STA $A5
  emit(0x84, 0xA4)                            // STY $A4
  emit(0xB1, 0xA4)                            // LDA ($A4),Y
  emit(0x9D, 0x73, 0xBF)                      // STA $BF73,X
  emit(0xCA)                                  // DEX
  emitBranchRef(0xD0, "slotLoop")             // BNE slotLoop

  // Zero-page restore: if a 256-byte snapshot was captured from floppy boot,
  // copy it from $0200 (where the Applesoft launcher BLOADed it) to $00-$FF.
  // This runs BEFORE the cold-start flag so the flag can override one ZP value.
  // The zpFlag parameter is set to 1 by the Applesoft launcher when a snapshot
  // is present.
  emit(0xAD); emitAddrRef("zpFlag", 0)      // LDA zpFlag
  emitBranchRef(0xF0, "skipZP")             // BEQ skipZP
  emit(0xA2, 0x00)                           // LDX #$00
  markLabel("zpLoop")
  emit(0xBD, 0x00, 0x02)                     // LDA $0200,X
  emit(0x95, 0x00)                           // STA $00,X
  emit(0xE8)                                 // INX
  emitBranchRef(0xD0, "zpLoop")             // BNE zpLoop
  markLabel("skipZP")

  // Cold-start flag: pre-set zero-page flag to bypass destructive cold-start.
  // flagValue=0 means no flag to set.
  emit(0xAD); emitAddrRef("flagValue", 0)   // LDA flagValue
  emitBranchRef(0xF0, "skipFlag")            // BEQ skipFlag (no flag)
  emit(0xAE); emitAddrRef("flagAddr", 0)     // LDX flagAddr
  emit(0x95, 0x00)                            // STA $00,X (store to zero page)
  // Also set up JMP ($0200) fallback in case the slot detection still fails
  // despite the $BF73 table fix (safety net).
  emit(0xA9, 0x60)                            // LDA #$60 (RTS opcode)
  emit(0x8D, 0x00, 0x0B)                      // STA $0B00
  emit(0xA9, 0x0B)                            // LDA #$0B
  emit(0x8D, 0x01, 0x02)                      // STA $0201
  markLabel("skipFlag")
  emit(0x6C); emitAddrRef("entryAddr")       // JMP (entryAddr)

  // === ERROR ===
  markLabel("error")
  emit(0x20, 0xDA, 0xFD)                   // JSR $FDDA (PRBYTE - prints A as hex)
  emit(0x4C, 0x59, 0xFF)                   // JMP $FF59 (MONITOR)

  // === INLINE PARAMETERS (POKEd by Applesoft before CALL) ===
  markLabel("startBlock")
  emit(0x00, 0x00)                  // start block (2 bytes LE)
  markLabel("blockCount")
  emit(0x00, 0x00)                  // block count (2 bytes LE)
  markLabel("targetAddr")
  emit(0x00, 0x00)                  // target load address (2 bytes LE)
  markLabel("entryAddr")
  emit(0x00, 0x00)                  // entry point address (2 bytes LE)
  markLabel("flagAddr")
  emit(0x00)                        // cold-start flag zero-page address (1 byte)
  markLabel("flagValue")
  emit(0x00)                        // cold-start flag value (1 byte)
  markLabel("zpFlag")
  emit(0x00)                        // 1 if zpData is valid, 0 otherwise

  // === RESOLVE PATCHES ===
  for (const patch of patches) {
    const targetAddr = labels[patch.target]
    if (targetAddr === undefined) {
      throw new Error(`Unresolved label: ${patch.target}`)
    }
    if (patch.offset < 0) {
      const rel = (BASE + targetAddr) - (BASE + patch.pos + 1)
      if (rel < -128 || rel > 127) {
        throw new Error(`Branch out of range to ${patch.target}: ${rel}`)
      }
      code[patch.pos] = rel & 0xFF
    } else {
      const fullAddr = BASE + targetAddr + patch.offset
      code[patch.pos] = fullAddr & 0xFF
      code[patch.pos + 1] = (fullAddr >> 8) & 0xFF
    }
  }

  const paramOffset = labels["startBlock"]
  const zpFlagOffset = labels["zpFlag"]
  return { code: Uint8Array.from(code), paramOffset, zpFlagOffset }
}

/**
 * Generates a tokenized Applesoft BASIC program that draws screenshots and
 * supports left/right navigation among disk images.
 */
const generateMenuSourceProgram = (
  menuEntries: MenuDiskEntry[],
  dosRuntimeLauncher: string | undefined,
  menuProDosCommands: Array<string | undefined>,
  menuProDosPrefixes: Array<string | undefined>,
  helperSubdir: string,
  aliasShimInstallCommand?: string,
  runtimeVolumeByMenuIndex?: Array<number | undefined>,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  menuNeedsAliasShim?: boolean[]
): string => {
  const lines: string[] = []
  const count = Math.max(1, Math.min(menuEntries.length, 99))
  const showNavigationArrows = count > 1
  const runtimeVolumes: number[] = []
  for (let i = 0; i < count; i++) {
    runtimeVolumes[i] = runtimeVolumeByMenuIndex?.[i] ?? (i + 1)
  }
  const diskTitles = menuEntries.slice(0, count).map((entry) => entry.displayName || entry.filename)

  lines.push("10 D$=CHR$(4)")
  lines.push(`20 MAX=${count}:I=1`)
  lines.push("25 IF PEEK(49152)<128 THEN 30")
  lines.push("26 X=PEEK(49168)")
  lines.push("27 GOTO 25")
  lines.push("30 GOSUB 1000")
  lines.push("40 IF PEEK(49152)<128 THEN 40")
  lines.push("45 K0=PEEK(49152)-128:X=PEEK(49168)")
  lines.push("50 IF K0=8 THEN I=I-1:IF I<1 THEN I=MAX")
  lines.push("60 IF K0=21 THEN I=I+1:IF I>MAX THEN I=1")
  lines.push("70 IF K0=8 OR K0=21 THEN GOSUB 1000:GOTO 40")
  lines.push("80 IF K0=13 OR K0=32 THEN GOSUB 2000:GOTO 40")
  lines.push("90 GOTO 40")

  lines.push("1000 HOME")
  lines.push("1005 IF I<1 OR I>MAX THEN I=1")
  // GRAPHICS + MIXED + PAGE1 + HIRES for screenshot + bottom text lines.
  lines.push("1010 POKE 49232,0:POKE 49235,0:POKE 49236,0:POKE 49239,0")
  // The screenshot filename is SCREEN + the zero-padded index, which is a pure
  // function of I, so compute it at runtime instead of emitting one IF-line per
  // disk. This keeps MENUSRC's size constant regardless of the disk count.
  // STR$ may or may not include a leading space depending on the Applesoft
  // implementation, so strip it conditionally with MID$/fallback.
  lines.push("1011 N$=MID$(STR$(I),2):IF N$=\"\" THEN N$=STR$(I)")
  lines.push("1013 IF I<10 THEN N$=\"0\"+N$")
  lines.push(`1014 PRINT D$;"BLOAD ${SCREENSHOT_SUBDIR}/SCREEN"+N$+",A$2000"`)
  for (let idx = 1; idx <= count; idx++) {
    const { safeName, leftPad, rightPad } = formatMenuScreenTitle(diskTitles[idx - 1])
    const leftArrow = showNavigationArrows ? "<- " : "   "
    const rightArrow = showNavigationArrows ? " ->" : "   "
    const lineNo = 1120 + idx
    lines.push(lineNo + " IF I=" + idx + " THEN VTAB 22:HTAB 1:PRINT \"" + leftArrow + " ".repeat(leftPad) + "\";:INVERSE:PRINT \"" + safeName + "\";:NORMAL:PRINT \"" + " ".repeat(rightPad) + rightArrow + "\";")
  }
  lines.push("1220 RETURN")

  lines.push(`2000 POKE ${MENU_SELECTED_INDEX_ADDRESS},I:PRINT D$;"RUN ${helperSubdir}/MENULAUNCH":RETURN`)

  // Startup render is explicit so initial display matches the first disk.
  lines.push("3000 HOME")
  lines.push("3010 POKE 49232,0:POKE 49235,0:POKE 49236,0:POKE 49239,0")
  lines.push(`3020 PRINT D$;"BLOAD ${SCREENSHOT_SUBDIR}/SCREEN${String(1).padStart(2, "0")},A$2000"`)
  {
    const { safeName, leftPad, rightPad } = formatMenuScreenTitle(diskTitles[0])
    const leftArrow = showNavigationArrows ? "<- " : "   "
    const rightArrow = showNavigationArrows ? " ->" : "   "
    lines.push("3030 VTAB 22:HTAB 1:PRINT \"" + leftArrow + " ".repeat(leftPad) + "\";:INVERSE:PRINT \"" + safeName + "\";:NORMAL:PRINT \"" + " ".repeat(rightPad) + rightArrow + "\";")
  }
  lines.push("3040 RETURN")

  return `${lines.join("\r")}\r`
}

const generateMenuLaunchProgram = (
  menuEntries: MenuDiskEntry[],
  dosRuntimeLauncher: string | undefined,
  menuProDosCommands: Array<string | undefined>,
  menuProDosPrefixes: Array<string | undefined>,
  helperSubdir: string,
  aliasShimInstallCommand?: string,
  runtimeVolumeByMenuIndex?: Array<number | undefined>,
  runtimeHelloModeByMenuIndex?: Array<number | undefined>,
  menuNeedsAliasShim?: boolean[],
  directLoadByMenuIndex?: Array<DirectLoadEntry | undefined>,
): string => {
  const hasDosMasterRuntime = !!dosRuntimeLauncher
  const PATCH_LINE = 2500
  const injectDriverPatch = dosRuntimeLauncher === "DOS.MASTER/DOS.3.3"
  const dosRuntimeRunStatements = (() => {
    if (!dosRuntimeLauncher) return ""
    if (dosRuntimeLauncher.includes("/")) {
      const [dir, file] = dosRuntimeLauncher.split("/")
      if (injectDriverPatch) return "GOTO " + PATCH_LINE
      return "PRINT D$;\"PREFIX " + dir + "\":PRINT D$;\"-" + file + "\""
    }
    if (dosRuntimeLauncher === "DOS.MASTER") {
      return "PRINT D$;\"BRUN " + dosRuntimeLauncher + "/" + dosRuntimeLauncher + "\""
    }
    return "PRINT D$;\"-" + dosRuntimeLauncher + "\""
  })()

  const lines: string[] = []
  const count = Math.max(1, Math.min(menuEntries.length, 99))
  const imageKinds = menuEntries.slice(0, count).map((entry) => entry.imageKind || "unknown")
  const runtimeVolumes: number[] = []
  for (let i = 0; i < count; i++) {
    runtimeVolumes[i] = runtimeVolumeByMenuIndex?.[i] ?? (i + 1)
  }
  const toDataString = (value: string | undefined) => (value || "").replace(/"/g, "'")

  lines.push("10 D$=CHR$(4)")
  lines.push(`20 MAX=${count}:DIM K(${count}),V(${count}),P$(${count}),R$(${count}),S(${count}),H(${count}),Z(${count})`)
  lines.push(`22 I=PEEK(${MENU_SELECTED_INDEX_ADDRESS}):IF I<1 OR I>MAX THEN I=1`)
  lines.push("24 RESTORE")
  lines.push("26 FOR J=1 TO MAX:READ K(J),V(J),P$(J),R$(J),S(J),H(J),Z(J):NEXT")
  if (hasDosMasterRuntime) {
    lines.push("30 IF K(I)=0 THEN TEXT:HOME:POKE " + DOS_DISPATCH_VOLUME_ADDRESS + ",V(I):POKE " + DOS_DISPATCH_HELLO_MODE_ADDRESS + ",H(I):" + dosRuntimeRunStatements + ":END")
  } else {
    lines.push("30 IF K(I)=0 THEN VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER RUNTIME NOT INSTALLED\":NORMAL:GOTO 220")
  }
  lines.push("40 IF K(I)=5 THEN VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER RUNTIME NOT INSTALLED\":NORMAL:GOTO 220")
  lines.push("50 IF K(I)=1 THEN TEXT:GOSUB 150:PRINT D$;\"PREFIX \";P$(I):PRINT D$;R$(I):END")
  lines.push("60 IF K(I)=2 THEN TEXT:GOSUB 150:PRINT D$;\"PREFIX \";P$(I):PRINT D$;\"CATALOG\":END")
  lines.push("70 IF K(I)=3 THEN TEXT:GOSUB 150:PRINT D$;R$(I):END")
  lines.push("80 IF K(I)=4 THEN VTAB 24:HTAB 1:INVERSE:PRINT \"PRODOS FILES IMPORTED\":NORMAL:PRINT D$;\"CATALOG\":GOTO 220")
  // Launch code 6: direct block load. V(I)=startBlock, H(I)=blockCount,
  // P$(I)=targetAddr, R$(I)=entryAddr. BLOAD the block-reader stub, POKE params, CALL.
  // Split across multiple lines because Applesoft's IF...THEN has trouble with very long
  // THEN clauses (>250 tokenized bytes) — the interpreter silently skips the line.
  {
    const stub = buildDirectLoadStub()
    const PA = DIRECT_LOAD_STUB_ADDRESS + stub.paramOffset
    const ZF = DIRECT_LOAD_STUB_ADDRESS + stub.zpFlagOffset
    lines.push("85 IF K(I)=6 THEN 250")
    lines.push(`250 TEXT:HOME:PRINT D$;"BLOAD ${helperSubdir}/A2TSDL,A$${DIRECT_LOAD_STUB_ADDRESS.toString(16).toUpperCase()}"`)
    lines.push(`252 POKE ${PA},V(I)-INT(V(I)/256)*256:POKE ${PA + 1},INT(V(I)/256)`)
    lines.push(`254 POKE ${PA + 2},H(I)-INT(H(I)/256)*256:POKE ${PA + 3},INT(H(I)/256)`)
    lines.push(`256 TA=VAL(P$(I)):EA=VAL(R$(I))`)
    lines.push(`258 POKE ${PA + 4},TA-INT(TA/256)*256:POKE ${PA + 5},INT(TA/256)`)
    lines.push(`260 POKE ${PA + 6},EA-INT(EA/256)*256:POKE ${PA + 7},INT(EA/256)`)
    // Cold-start flag: POKE the flag address and value into the stub's
    // inline params. The stub writes flagValue to zero-page flagAddr
    // just before JMP to the game entry — this avoids corrupting CSWL
    // ($36/$37) while BASIC.SYSTEM is still active.
    // S(I) encodes flagAddr + flagValue*256; 0 means no flag.
    lines.push(`261 IF S(I)>0 THEN POKE ${PA + 8},S(I)-INT(S(I)/256)*256:POKE ${PA + 9},INT(S(I)/256)`)
    // Zero-page snapshot: if Z(I)=1, BLOAD the captured ZP data into the
    // Applesoft input buffer ($0200) and set zpFlag=1.  The stub copies
    // $0200-$02FF to $00-$FF before jumping to the game entry point.
    // STR$ may or may not include a leading space; strip it conditionally.
    lines.push(`262 N$=MID$(STR$(I),2):IF N$="" THEN N$=STR$(I)`)
    lines.push(`263 IF Z(I)=1 THEN PRINT D$;"BLOAD ${helperSubdir}/A2TSZP";N$;",A$200":POKE ${ZF},1`)
    lines.push(`264 CALL ${DIRECT_LOAD_STUB_ADDRESS}`)
  }
  lines.push("90 VTAB 24:HTAB 1:INVERSE:PRINT \"DOS.MASTER LAUNCH REQUESTED\":NORMAL")
  lines.push("100 GOTO 220")
  lines.push("150 IF S(I)=0 THEN RETURN")
  if (aliasShimInstallCommand) {
    lines.push("160 PRINT D$;\"" + toDataString(aliasShimInstallCommand) + "\":RETURN")
  } else {
    lines.push("160 RETURN")
  }
  lines.push(`220 PRINT D$;"RUN ${helperSubdir}/MENUSRC":END`)

  let dataLine = 9000
  for (let idx = 0; idx < count; idx++) {
    const entryKind = imageKinds[idx]
    let launchCode = 4
    let volume = 0
    let prefix = ""
    let runCmd = ""
    let shimFlag = 0
    let helloMode = 0
    let zpHasSnapshot = 0

    if (entryKind === "dos" || entryKind === "unknown") {
      if (hasDosMasterRuntime) {
        launchCode = 0
        volume = runtimeVolumes[idx]
        helloMode = runtimeHelloModeByMenuIndex?.[idx] === 1 ? 1 : 0
      } else {
        launchCode = 5
      }
    } else if (entryKind === "dosdirect") {
      const dl = directLoadByMenuIndex?.[idx]
      if (dl && dl.startBlock !== undefined) {
        launchCode = 6
        volume = dl.startBlock
        helloMode = dl.blockCount
        prefix = String(dl.loadAddress)
        runCmd = String(dl.entryAddress)
        if (dl.coldStartFlagAddr && dl.coldStartFlagValue) {
          shimFlag = dl.coldStartFlagAddr + dl.coldStartFlagValue * 256
        }
        if (dl.zpSnapshot) {
          zpHasSnapshot = 1
        }
      } else {
        launchCode = 4 // fallback: show "PRODOS FILES IMPORTED"
      }
    } else {
      const prefixValue = menuProDosPrefixes[idx] || ""
      const runValue = menuProDosCommands[idx] || ""
      const needsShim = (menuNeedsAliasShim?.[idx] ?? false) && !!aliasShimInstallCommand
      shimFlag = needsShim ? 1 : 0
      if (prefixValue && runValue) {
        launchCode = 1
        prefix = prefixValue
        runCmd = runValue
      } else if (prefixValue) {
        launchCode = 2
        prefix = prefixValue
      } else if (runValue) {
        launchCode = 3
        runCmd = runValue
      } else {
        launchCode = 4
      }
    }

    lines.push(dataLine + " DATA " + launchCode + "," + volume + ",\"" + toDataString(prefix) + "\",\"" + toDataString(runCmd) + "\"," + shimFlag + "," + helloMode + "," + zpHasSnapshot)
    dataLine += 10
  }

  if (injectDriverPatch) {
    lines.push(PATCH_LINE + " S=INT(PEEK(48944)/16):IF S>7 THEN S=S-8")
    lines.push((PATCH_LINE + 10) + " A=48912+2*S:LO=PEEK(A):HI=PEEK(A+1)")
    lines.push((PATCH_LINE + 20) + " PRINT D$;\"PREFIX DOS.MASTER\"")
    lines.push((PATCH_LINE + 30) + " PRINT D$;\"BLOAD DOS.3.3,TSYS,A$2000\"")
    lines.push((PATCH_LINE + 40) + " IF PEEK(8289)<192 OR PEEK(8289)>199 THEN " + (PATCH_LINE + 80))
    lines.push((PATCH_LINE + 50) + " IF PEEK(8288)=LO AND PEEK(8289)=HI THEN " + (PATCH_LINE + 80))
    lines.push((PATCH_LINE + 60) + " POKE 8288,LO:POKE 8289,HI:POKE 8248,S*16:POKE 8249,S*16+128")
    lines.push((PATCH_LINE + 70) + " PRINT D$;\"UNLOCK DOS.3.3\":PRINT D$;\"BSAVE DOS.3.3,TSYS,A$2000,L$2800\"")
    lines.push((PATCH_LINE + 80) + " PRINT D$;\"-DOS.3.3\"")
  }

  return `${lines.join("\r")}\r`
}

/**
 * Generates STARTUP command file. For interactive exports, STARTUP runs MENUSRC.
 */
const generateInteractiveMenuStartup = (
  menuEntries: MenuDiskEntry[],
  helperSubdir: string
): string => {
  if (menuEntries.length === 0) {
    return `BRUN ${helperSubdir}/A2TSLAUNCH\rCATALOG\r`
  }
  return `RUN ${helperSubdir}/MENUSRC\r`
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
    const dir = readBlock(disk, block)
    if (!dir) break
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
        const creationDateWord = readLittleEndian16(dirBlock, entryOffset + 24)
        const creationTimeWord = readLittleEndian16(dirBlock, entryOffset + 26)
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
          creationSortKey: ((creationDateWord << 16) | creationTimeWord) >>> 0,
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

const DOS_ORDER_MAP = [0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15]
const PRODOS_ORDER_MAP = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]

const getDosSectorOffset = (track: number, sector: number, map: number[]) => {
  if (track < 0 || sector < 0 || sector > 15) return -1
  const mappedSector = map[sector]
  return (track * 16 + mappedSector) * 256
}

const isLikelyDos33Volume = (data: Uint8Array): boolean => {
  // DOS 3.3 5.25" image size (35 tracks x 16 sectors x 256 bytes).
  if (data.length < (35 * 16 * 256)) return false

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

  // VTOC is logical T17,S0; test both on-disk sector orders.
  const dosOrderVtoc = getDosSectorOffset(17, 0, DOS_ORDER_MAP)
  const prodosOrderVtoc = getDosSectorOffset(17, 0, PRODOS_ORDER_MAP)

  return matchesVtoc(dosOrderVtoc) || matchesVtoc(prodosOrderVtoc)
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
        creationSortKey: file.creationSortKey,
        type: file.type,
        auxType: file.auxType,
        data: file.data,
      }))
    }
  }

  return []
}

/**
 * Validates the DOS 3.3 catalog of a flat image stored in DOS *logical* sector order
 * (sector S of track T at byte offset (T*16 + S)*256, i.e. a ".dsk"/".do" layout).
 * Walks the catalog chain from the VTOC's catalog pointer and requires a structurally
 * valid, non-looping chain that contains at least one real file entry.
 *
 * A VTOC-field match alone (see isLikelyDos33Volume) is not sufficient: copy-protected
 * and other non-standard disks frequently present a VTOC-shaped sector at track 17 that
 * passes the field checks yet have no readable DOS 3.3 catalog (Copy II Plus reports such
 * disks as "NOT A PRODOS OR DOS 3.3 DISK"). Requiring a walkable catalog with a genuine
 * file entry rejects those false positives so they are not exported as DOS volumes.
 */
const dosLogicalImageHasValidCatalog = (data: Uint8Array): boolean => {
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256
  const vtoc = sectorOffset(17, 0)
  if (vtoc + 0x38 > data.length) return false

  let catTrack = data[vtoc + 1]
  let catSector = data[vtoc + 2]
  const visited = new Set<number>()
  let validFiles = 0
  let catalogSectors = 0

  for (let guard = 0; guard < 20; guard++) {
    if (catTrack === 0) break // 0,0 marks the end of the catalog chain
    if (catTrack >= 35 || catSector >= 16) break // a bogus link ends (invalidates) the chain
    const key = catTrack * 16 + catSector
    if (visited.has(key)) break // a loop means a corrupt/fake catalog
    visited.add(key)

    const off = sectorOffset(catTrack, catSector)
    if (off + 256 > data.length) break
    catalogSectors++

    for (let e = 0; e < 7; e++) {
      const eoff = off + 0x0b + e * 0x23 // 7 entries of 0x23 bytes, first at 0x0B
      const tsListTrack = data[eoff]
      if (tsListTrack === 0x00 || tsListTrack === 0xff) continue // never-used or deleted
      const tsListSector = data[eoff + 1]
      if (tsListTrack >= 35 || tsListSector >= 16) continue // not a plausible file entry
      const firstChar = data[eoff + 3] & 0x7f // DOS 3.3 names are high-bit ASCII
      if (firstChar < 0x20 || firstChar > 0x7e) continue
      validFiles++
    }

    catTrack = data[off + 1]
    catSector = data[off + 2]
  }

  // A genuine DOS 3.3 catalog either lists real files or presents the standard linked
  // catalog chain (an INIT'd disk has 15 back-linked catalog sectors on track 17). A
  // copy-protected/fake VTOC yields neither (its catalog sector is absent or unlinked).
  return validFiles > 0 || catalogSectors >= 8
}

/**
 * Scores how self-consistent a flat DOS *logical*-order image (a ".dsk"/".do" layout) is
 * as a real DOS 3.3 filesystem, returning the fraction of catalogued file data sectors that
 * the VTOC free-sector bitmap actually marks as in-use. A correctly reconstructed image has
 * every file's T/S-list data sectors marked used (fraction ~1.0); an image decoded with the
 * wrong sector interleave points its T/S lists at effectively random sectors, most of which
 * the bitmap marks free (a low fraction). The catalog on track 17 can walk identically in
 * more than one sector order, so this file-vs-bitmap cross-check is what distinguishes the
 * genuine interleave from the scrambled ones.
 */
const scoreDosLogicalImageCoherence = (data: Uint8Array): number => {
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256
  const vtoc = sectorOffset(17, 0)
  // DOS 3.3 VTOC free-sector bitmap: 4 bytes per track at VTOC+0x38; byte 0 covers sectors
  // 15..8 and byte 1 covers sectors 7..0, where a *set* bit means the sector is FREE.
  const isSectorUsed = (track: number, sector: number): boolean => {
    const base = vtoc + 0x38 + track * 4
    if (base + 1 >= data.length) return false
    const bit = sector >= 8 ? (data[base] >> (sector - 8)) : (data[base + 1] >> sector)
    return (bit & 1) === 0
  }

  const { entries } = readDos33Catalog(data)
  let totalDataSectors = 0
  let usedDataSectors = 0
  for (const entry of entries) {
    let listTrack = entry.tsListTrack
    let listSector = entry.tsListSector
    const visited = new Set<number>()
    for (let guard = 0; guard < 64; guard++) {
      if (listTrack === 0 || listTrack >= 35 || listSector >= 16) break
      const key = listTrack * 16 + listSector
      if (visited.has(key)) break
      visited.add(key)
      const off = sectorOffset(listTrack, listSector)
      if (off + 256 > data.length) break
      for (let i = 0; i < 122; i++) {
        const dataTrack = data[off + 0x0c + i * 2]
        const dataSector = data[off + 0x0c + i * 2 + 1]
        if (dataTrack === 0 && dataSector === 0) continue // empty T/S-list slot
        totalDataSectors++
        if (dataTrack < 35 && dataSector < 16 && isSectorUsed(dataTrack, dataSector)) {
          usedDataSectors++
        }
      }
      listTrack = data[off + 1]
      listSector = data[off + 2]
    }
  }

  return totalDataSectors > 0 ? usedDataSectors / totalDataSectors : 0
}

/**
 * Decodes a WOZ 5.25" image into a standard DOS 3.3 logical-order sector image
 * (143360 bytes, i.e. a ".dsk"/".do" layout) suitable for use as a DOS.MASTER runtime
 * volume. DOS.MASTER expects its volumes in DOS logical sector order. Returns undefined
 * unless the decode yields a recognizable DOS 3.3 volume with a walkable catalog (see
 * dosLogicalImageHasValidCatalog), so copy-protected/non-standard disks are rejected.
 */
export const loadWozAndExtractDosImage = (wozData: Uint8Array): Uint8Array | undefined => {
  const decoded = decodeWozToSectorCandidates(wozData)
  if (!decoded) return undefined

  // Both DOS-numbered reconstructions ("dos-physical-to-logical" and "dos-logical-to-physical")
  // yield a DOS-order image; which one is correct depends on how the source disk's sectors were
  // interleaved (some tools, including Apple2TS's own WOZ writer, use the opposite skew). The
  // VTOC and even the track-17 catalog can validate in either order, so pick the interleave whose
  // file data is actually consistent with the VTOC bitmap (see scoreDosLogicalImageCoherence).
  let best: Uint8Array | undefined
  let bestScore = -1
  for (const candidate of decoded.candidates) {
    if (!candidate.label.startsWith("dos-")) continue
    if (!isLikelyDos33Volume(candidate.data)) continue
    if (!dosLogicalImageHasValidCatalog(candidate.data)) continue
    const score = scoreDosLogicalImageCoherence(candidate.data)
    if (score > bestScore) {
      bestScore = score
      best = candidate.data
    }
  }
  return best
}

// DOS 3.3 catalog file-type codes (low 7 bits; bit 7 = locked).
const DOS33_TYPE_TEXT = 0x00
const DOS33_TYPE_INTEGER = 0x01
const DOS33_TYPE_APPLESOFT = 0x02
const DOS33_TYPE_BINARY = 0x04

type DosCatalogEntry = {
  catalogOffset: number // byte offset of the 0x23-byte entry within the image
  tsListTrack: number
  tsListSector: number
  typeByte: number
  name: string
  sectorCount: number
}

/**
 * Walks the DOS 3.3 catalog of a flat DOS *logical*-order image (a ".dsk"/".do" layout,
 * sector S of track T at byte offset (T*16 + S)*256) and returns the live file entries
 * plus the offset of the first reusable (never-used or deleted) catalog entry slot.
 */
const readDos33Catalog = (image: Uint8Array): { entries: DosCatalogEntry[]; freeEntryOffset: number | undefined } => {
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256
  const vtoc = sectorOffset(17, 0)
  const entries: DosCatalogEntry[] = []
  let freeEntryOffset: number | undefined
  let catTrack = image[vtoc + 1]
  let catSector = image[vtoc + 2]
  const visited = new Set<number>()
  for (let guard = 0; guard < 40; guard++) {
    if (catTrack === 0 || catTrack >= 35 || catSector >= 16) break
    const key = catTrack * 16 + catSector
    if (visited.has(key)) break
    visited.add(key)
    const off = sectorOffset(catTrack, catSector)
    if (off + 256 > image.length) break
    for (let e = 0; e < 7; e++) {
      const eoff = off + 0x0b + e * 0x23
      const tsListTrack = image[eoff]
      if (tsListTrack === 0x00 || tsListTrack === 0xff) {
        // 0x00 = never used, 0xff = deleted: both are reusable entry slots.
        if (freeEntryOffset === undefined) freeEntryOffset = eoff
        continue
      }
      const tsListSector = image[eoff + 1]
      if (tsListTrack >= 35 || tsListSector >= 16) continue
      let name = ""
      for (let i = 0; i < 30; i++) name += String.fromCharCode(image[eoff + 3 + i] & 0x7f)
      name = name.replace(/\s+$/, "")
      entries.push({
        catalogOffset: eoff,
        tsListTrack,
        tsListSector,
        typeByte: image[eoff + 2],
        name,
        sectorCount: image[eoff + 0x21] | (image[eoff + 0x22] << 8),
      })
    }
    catTrack = image[off + 1]
    catSector = image[off + 2]
  }
  return { entries, freeEntryOffset }
}

/**
 * Chooses the DOS command that best reproduces a source DOS 3.3 disk's boot behaviour
 * ("examine the source disk to determine what HELLO should launch"). DOS 3.3 runs a
 * greeting program set at INIT time (default name "HELLO"); that name is not reliably
 * recoverable from a custom/fast-DOS image, so the catalog is used as the source of truth.
 * The greeting is almost always the first launchable program in catalog order (INIT writes
 * it first), so pick that and RUN/BRUN/EXEC it by type. Returns undefined if nothing is
 * launchable (the caller then falls back to CATALOG).
 */
const chooseDosGreetingCommand = (entries: DosCatalogEntry[]): { command: string; target: string } | undefined => {
  for (const entry of entries) {
    // Skip zero-sector entries: these are decorative catalog "title" entries (a common
    // trick to show a banner in the CATALOG listing) with no real file data, not programs.
    if (entry.sectorCount < 1) continue
    const type = entry.typeByte & 0x7f
    if (type === DOS33_TYPE_APPLESOFT || type === DOS33_TYPE_INTEGER) {
      return { command: `RUN ${entry.name}`, target: entry.name }
    }
    if (type === DOS33_TYPE_BINARY) {
      return { command: `BRUN ${entry.name}`, target: entry.name }
    }
    if (type === DOS33_TYPE_TEXT) {
      return { command: `EXEC ${entry.name}`, target: entry.name }
    }
  }
  return undefined
}

const tryRewriteGreetingCommandForDosMaster = (
  image: Uint8Array,
  entries: DosCatalogEntry[],
  chosen: { command: string; target: string }
): { command: string; target: string } => {
  // If the selected greeting is an Applesoft wrapper (usually RUN <name>), inspect its
  // quoted DOS command strings and translate compact non-stock binary-launch commands
  // like "BNPACMAN" to stock DOS.MASTER-compatible "BRUN PACMAN" when the target binary
  // exists in the catalog.
  if (!chosen.command.startsWith("RUN ")) return chosen
  const greetingEntry = entries.find((entry) => entry.name.trim().toUpperCase() === chosen.target.trim().toUpperCase())
  if (!greetingEntry || ((greetingEntry.typeByte & 0x7f) !== DOS33_TYPE_APPLESOFT)) return chosen

  const bytes = readDosFileBytes(image, greetingEntry.tsListTrack, greetingEntry.tsListSector)
  let text = ""
  for (const b of bytes) text += String.fromCharCode(b & 0x7f)
  const quoted = [...text.matchAll(/"([^\"]{2,80})"/g)]
  const binaryNames = new Map<string, string>()
  for (const entry of entries) {
    if ((entry.typeByte & 0x7f) !== DOS33_TYPE_BINARY) continue
    binaryNames.set(entry.name.trim().toUpperCase(), entry.name)
  }

  for (const match of quoted) {
    const cmd = (match[1] ?? "").replace(/[\x00-\x1f]/g, "").trim().toUpperCase()
    // A compact custom DOS command of the form "B?<name>" (e.g. BNPACMAN) where
    // DOS.MASTER does not know the alias but does support BRUN.
    if (!/^B[A-Z][A-Z0-9.$#_ -]{1,30}$/.test(cmd)) continue
    if (cmd.startsWith("BRUN") || cmd.startsWith("BLOAD") || cmd.startsWith("BSAVE")) continue
    const rawTail = cmd.substring(2).trim()
    if (!rawTail) continue
    const candidate = rawTail.split(/[,:;]/, 1)[0].trim()
    if (!candidate) continue
    const existingBinaryName = binaryNames.get(candidate)
    if (!existingBinaryName) continue
    return { command: `BRUN ${existingBinaryName}`, target: existingBinaryName }
  }

  return chosen
}

/**
 * Builds the on-disk DOS 3.3 Applesoft ("A") file image for a one-line greeting program
 *   10 PRINT CHR$(4)"<command>"
 * which issues a DOS command (e.g. RUN/BRUN/EXEC of the real greeting) when run. The file
 * is the 2-byte program length followed by the tokenized program as it appears in memory
 * loaded at $0801 (the standard Applesoft load address).
 */
const buildDosHelloApplesoftFile = (command: string): Uint8Array => {
  const cmdBytes = Array.from(command, (c) => c.charCodeAt(0) & 0x7f)
  // PRINT CHR$ ( 4 ) "  <command>  "  <end-of-line>
  const tokens = [0xba, 0xe7, 0x28, 0x34, 0x29, 0x22, ...cmdBytes, 0x22, 0x00]
  const lineLength = 4 + tokens.length // link(2) + lineNo(2) + tokens
  const link = 0x0801 + lineLength
  const image: number[] = [
    link & 0xff, (link >> 8) & 0xff, // link to next line (the terminator)
    0x0a, 0x00, // line number 10
    ...tokens,
    0x00, 0x00, // program terminator (link = 0)
  ]
  const programLength = image.length
  return Uint8Array.from([programLength & 0xff, (programLength >> 8) & 0xff, ...image])
}

export type DosGreetingResult = {
  image: Uint8Array
  action: "already-present" | "injected" | "skipped"
  command?: string
  target?: string
  reason?: string
}

/**
 * Ensures a DOS.MASTER runtime volume (a flat 140K DOS 3.3 logical-order image) has a file
 * named HELLO so booting it under DOS.MASTER -- which always runs a greeting named "HELLO"
 * on the selected volume -- does not fail with FILE NOT FOUND. If the source disk already
 * has a HELLO file it is left untouched (that IS its greeting). Otherwise a small Applesoft
 * HELLO is injected that launches the source disk's real greeting program (the first
 * launchable file in catalog order; see chooseDosGreetingCommand), or CATALOG if none.
 * Returns the (possibly new) image; on any structural problem the original is returned
 * unchanged with action "skipped".
 */
export const ensureDosVolumeHasHelloGreeting = (source: Uint8Array): DosGreetingResult => {
  const size140k = 35 * 16 * 256
  if (source.length !== size140k) {
    return { image: source, action: "skipped", reason: "not a 140K DOS image" }
  }
  if (!isLikelyDos33Volume(source) || !dosLogicalImageHasValidCatalog(source)) {
    return { image: source, action: "skipped", reason: "no valid DOS 3.3 catalog" }
  }

  const { entries, freeEntryOffset } = readDos33Catalog(source)
  const existingHello = entries.find((e) => e.name.trim().toUpperCase() === "HELLO")
  if (existingHello) {
    const rewritten = tryRewriteGreetingCommandForDosMaster(source, entries, { command: `RUN ${existingHello.name}`, target: existingHello.name })
    if (rewritten.command !== `RUN ${existingHello.name}`) {
      const image = source.slice()
      const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256

      // Patch HELLO in place by rewriting its first data sector with a one-line
      // Applesoft launcher that uses stock DOS.MASTER-compatible command syntax.
      let listTrack = existingHello.tsListTrack
      let listSector = existingHello.tsListSector
      let patched = false
      const visited = new Set<number>()
      for (let guard = 0; guard < 64; guard++) {
        if (listTrack === 0 || listTrack >= 35 || listSector >= 16) break
        const key = listTrack * 16 + listSector
        if (visited.has(key)) break
        visited.add(key)
        const tsOff = sectorOffset(listTrack, listSector)
        if (tsOff + 256 > image.length) break

        for (let i = 0; i < 122; i++) {
          const dataTrack = image[tsOff + 0x0c + i * 2]
          const dataSector = image[tsOff + 0x0d + i * 2]
          if (dataTrack === 0 && dataSector === 0) continue
          const dataOff = sectorOffset(dataTrack, dataSector)
          if (dataTrack >= 35 || dataSector >= 16 || dataOff + 256 > image.length) continue

          const fileBytes = buildDosHelloApplesoftFile(rewritten.command)
          image.fill(0, dataOff, dataOff + 256)
          image.set(fileBytes.subarray(0, 256), dataOff)
          patched = true
          break
        }

        if (patched) break
        listTrack = image[tsOff + 1]
        listSector = image[tsOff + 2]
      }

      if (patched) {
        return { image, action: "injected", command: rewritten.command, target: rewritten.target }
      }
    }
    return { image: source, action: "already-present" }
  }
  if (freeEntryOffset === undefined) {
    return { image: source, action: "skipped", reason: "catalog is full" }
  }

  const chosen = chooseDosGreetingCommand(entries)
  const rewritten = chosen ? tryRewriteGreetingCommandForDosMaster(source, entries, chosen) : undefined
  const command = rewritten ? rewritten.command : "CATALOG"

  const image = source.slice()
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256
  const vtoc = sectorOffset(17, 0)

  // Allocate free sectors from the VTOC bitmap (byte 0x38 + T*4 holds sectors 8-15 with
  // bit (S-8); byte +1 holds sectors 0-7 with bit S; a set bit means free). Scan tracks
  // outward from the catalog track, skipping the DOS/catalog area that is already marked
  // used, and clear each allocated bit.
  const isSectorFree = (track: number, sector: number): boolean => {
    const base = vtoc + 0x38 + track * 4
    const byte = sector >= 8 ? image[base] : image[base + 1]
    const bit = sector >= 8 ? sector - 8 : sector
    return ((byte >> bit) & 1) === 1
  }
  const markSectorUsed = (track: number, sector: number) => {
    const base = vtoc + 0x38 + track * 4
    const idx = sector >= 8 ? base : base + 1
    const bit = sector >= 8 ? sector - 8 : sector
    image[idx] &= ~(1 << bit) & 0xff
  }
  const allocateSector = (): { track: number; sector: number } | undefined => {
    for (let track = 18; track < 35; track++) {
      for (let sector = 0; sector < 16; sector++) {
        if (isSectorFree(track, sector)) { markSectorUsed(track, sector); return { track, sector } }
      }
    }
    for (let track = 16; track >= 0; track--) {
      for (let sector = 0; sector < 16; sector++) {
        if (isSectorFree(track, sector)) { markSectorUsed(track, sector); return { track, sector } }
      }
    }
    return undefined
  }

  const dataSector = allocateSector()
  const tsListSector = dataSector ? allocateSector() : undefined
  if (!dataSector || !tsListSector) {
    return { image: source, action: "skipped", reason: "no free sectors" }
  }

  // Data sector: the Applesoft HELLO file image (<= 256 bytes for a one-line program).
  const fileBytes = buildDosHelloApplesoftFile(command)
  const dataOff = sectorOffset(dataSector.track, dataSector.sector)
  image.fill(0, dataOff, dataOff + 256)
  image.set(fileBytes.subarray(0, 256), dataOff)

  // Track/Sector List sector: describes the single data sector.
  const tsOff = sectorOffset(tsListSector.track, tsListSector.sector)
  image.fill(0, tsOff, tsOff + 256)
  image[tsOff + 0x0c] = dataSector.track
  image[tsOff + 0x0d] = dataSector.sector

  // Catalog entry: HELLO, Applesoft, 2 sectors (T/S list + data).
  image[freeEntryOffset] = tsListSector.track
  image[freeEntryOffset + 1] = tsListSector.sector
  image[freeEntryOffset + 2] = DOS33_TYPE_APPLESOFT
  for (let i = 0; i < 30; i++) {
    const c = i < 5 ? "HELLO".charCodeAt(i) : 0x20
    image[freeEntryOffset + 3 + i] = c | 0x80
  }
  image[freeEntryOffset + 0x21] = 2
  image[freeEntryOffset + 0x22] = 0

  return { image, action: "injected", command, target: rewritten?.target }
}

/**
 * Builds the on-disk DOS 3.3 Applesoft ("A") file image for the DOS.MASTER volume-1
 * "dispatcher" HELLO:
 *   10 V=PEEK(1144):S=INT(PEEK(47081)/16):H=PEEK(1146)
 *   20 IF V<2 THEN PRINT CHR$(4)"CATALOG,S"S",V1":END
 *   30 IF H=1 THEN PRINT CHR$(4)"BRUN HELLO,S"S",V"V:END
 *   40 PRINT CHR$(4)"RUN HELLO,S"S",V"V
 * On boot DOS.MASTER always runs volume 1's HELLO; this one reads the volume number the
 * ProDOS menu POKEd into $0478/1144 plus a launch mode byte in $047A/1146, then chains to
 * that volume's own HELLO. If the volume byte is not
 * a real disk volume (< 2, e.g. it failed to survive the boot) it falls back to a harmless
 * CATALOG instead of looping on itself. The ",V<n>" also makes <n> the current DOS volume,
 * so the target HELLO's own subsequent RUN/BRUN stay on that volume. The slot ",S<n>" comes
 * from DOS.MASTER's own IOB slot byte (IBSLOT $B7E9/47081 = boot slot * 16): DOS.MASTER passes
 * the DOS 3.3 command's slot to the physical driver as the unit number, so the dispatcher must
 * name the actual boot slot -- and IBSLOT is the boot slot DOS.MASTER itself just used to load
 * this HELLO, which is reliable where the ProDOS-side DEVNUM read was not.
 */
const buildDosDispatcherApplesoftFile = (): Uint8Array => {
  const vol = DOS_DISPATCH_VOLUME_ADDRESS.toString()
  const helloMode = DOS_DISPATCH_HELLO_MODE_ADDRESS.toString()
  const ibslot = DOS_IBSLOT_ADDRESS.toString()
  const source =
    `10 V=PEEK(${vol}):S=INT(PEEK(${ibslot})/16):H=PEEK(${helloMode})\r` +
    "20 IF V<2 THEN PRINT CHR$(4)\"CATALOG,S\"S\",V1\":END\r" +
    "30 IF H=1 THEN PRINT CHR$(4)\"BRUN HELLO,S\"S\",V\"V:END\r" +
    "40 PRINT CHR$(4)\"RUN HELLO,S\"S\",V\"V\r"
  const program = tokenizeApplesoftBasic(source)
  // DOS 3.3 "A" (Applesoft) files are stored as a 2-byte little-endian program length
  // followed by the tokenized program (which loads at $0801).
  return Uint8Array.from([program.length & 0xff, (program.length >> 8) & 0xff, ...program])
}

/**
 * Builds a blank, valid DOS 3.3 logical-order volume (143360 bytes) whose only file is the
 * dispatcher HELLO (buildDosDispatcherApplesoftFile). This is installed as DOS.MASTER
 * volume 1 -- always the boot volume -- so selecting any menu disk boots that disk's own
 * volume via the dispatcher. The volume is a DATA-style DOS disk (no DOS image on tracks
 * 0-2, which DOS.MASTER supplies): a VTOC at T17S0, a back-linked catalog on track 17, and
 * the HELLO file on track 18.
 */
const buildDosMasterDispatcherVolume = (): Uint8Array => {
  const image = new Uint8Array(35 * 16 * 256)
  const sectorOffset = (t: number, s: number) => (t * 16 + s) * 256
  const vtoc = sectorOffset(17, 0)

  // VTOC (T17S0).
  image[vtoc + 0x01] = 17 // first catalog track
  image[vtoc + 0x02] = 15 // first catalog sector
  image[vtoc + 0x03] = 3 // DOS 3.3 release
  image[vtoc + 0x06] = 254 // volume number
  image[vtoc + 0x27] = 122 // max track/sector pairs per T/S list sector
  image[vtoc + 0x30] = 18 // last track sectors were allocated on
  image[vtoc + 0x31] = 1 // allocation direction (+1)
  image[vtoc + 0x34] = 35 // tracks per disk
  image[vtoc + 0x35] = 16 // sectors per track
  image[vtoc + 0x36] = 0x00 // bytes per sector (256, little-endian)
  image[vtoc + 0x37] = 0x01

  // Free-sector bitmap: 4 bytes/track at 0x38 + T*4. byte0 = sectors 8-15 (bit S-8),
  // byte1 = sectors 0-7 (bit S); a SET bit means FREE. Mark everything free, then mark the
  // DOS area (tracks 0-2) and the catalog/VTOC track (17) fully used.
  for (let t = 0; t < 35; t++) {
    const base = vtoc + 0x38 + t * 4
    const used = t <= 2 || t === 17
    image[base] = used ? 0x00 : 0xff
    image[base + 1] = used ? 0x00 : 0xff
    image[base + 2] = 0x00
    image[base + 3] = 0x00
  }

  // Catalog chain on track 17: sectors 15 down to 1, each back-linked to the next lower
  // sector; sector 1 terminates the chain (link 0,0). Entries are left empty.
  for (let s = 15; s >= 1; s--) {
    const off = sectorOffset(17, s)
    image[off + 0x00] = 0x00
    image[off + 0x01] = s > 1 ? 17 : 0
    image[off + 0x02] = s > 1 ? s - 1 : 0
  }

  // Allocate track 18 sectors 0/1 (both free above) for the HELLO data + T/S list sectors.
  const markUsed = (t: number, s: number) => {
    const base = vtoc + 0x38 + t * 4
    const idx = s >= 8 ? base : base + 1
    const bit = s >= 8 ? s - 8 : s
    image[idx] &= ~(1 << bit) & 0xff
  }
  const dataTrack = 18
  const dataSectorNum = 0
  const tsTrack = 18
  const tsSectorNum = 1
  markUsed(dataTrack, dataSectorNum)
  markUsed(tsTrack, tsSectorNum)

  const fileBytes = buildDosDispatcherApplesoftFile()
  const dataOff = sectorOffset(dataTrack, dataSectorNum)
  image.set(fileBytes.subarray(0, 256), dataOff)

  const tsOff = sectorOffset(tsTrack, tsSectorNum)
  image[tsOff + 0x0c] = dataTrack
  image[tsOff + 0x0d] = dataSectorNum

  // Catalog entry for HELLO in the first catalog sector (T17S15), first entry slot (0x0B).
  const entryOff = sectorOffset(17, 15) + 0x0b
  image[entryOff + 0] = tsTrack
  image[entryOff + 1] = tsSectorNum
  image[entryOff + 2] = DOS33_TYPE_APPLESOFT
  for (let i = 0; i < 30; i++) {
    image[entryOff + 3 + i] = (i < 5 ? "HELLO".charCodeAt(i) : 0x20) | 0x80
  }
  image[entryOff + 0x21] = 2 // sector count (T/S list + data)
  image[entryOff + 0x22] = 0

  return image
}

/**
 * Strips a 2IMG (.2mg) container's 64-byte header so the underlying ProDOS/DOS block image
 * can be parsed directly. 2IMG files begin with the ASCII magic "2IMG" followed by a header
 * whose length is stored at offset 8 (always 64 in practice). Returns the buffer unchanged
 * when it is not a 2IMG container (e.g. raw .po/.hdv). Without this, the volume directory at
 * block 2 sits 64 bytes off and extraction finds zero files (the disk then falls back to a
 * raw passthrough that only shows "PRODOS FILES IMPORTED"/CATALOG instead of launching).
 */
export const stripTwoImgHeader = (data: Uint8Array): Uint8Array => {
  if (data.length < 64) return data
  if (data[0] !== 0x32 || data[1] !== 0x49 || data[2] !== 0x4d || data[3] !== 0x47) return data // "2IMG"
  const headerLength = data[8] | (data[9] << 8)
  const offset = headerLength >= 64 ? headerLength : 64
  // Return a fresh, zero-byteOffset copy (slice, not subarray) so downstream parsers that
  // read via the underlying ArrayBuffer are not thrown off by a non-zero byteOffset.
  return data.length > offset ? data.slice(offset) : data
}

/**
 * Classifies a disk image's filesystem family ("dos" | "prodos" | "unknown") from its
 * raw bytes and filename. Uses structural VTOC/volume-directory probes first, then falls
 * back to extension/size heuristics. WOZ is a bitstream container, so it always returns
 * "unknown" here -- use determineVtocType() to classify WOZ via full bit decoding.
 */
export const classifyImageKind = (filename: string, data: Uint8Array): "dos" | "prodos" | "unknown" => {
  const ext = filename.toLowerCase().split(".").pop() || ""
  const size140k = (35 * 16 * 256)

  // WOZ is a container format; determine DOS/ProDOS only after explicit extraction/probing.
  if (ext === "woz") return "unknown"

  const is140k = data.length === size140k

  // Positively identify DOS structure first (to avoid false ProDOS positives on DOS .po
  // files). For 140K .dsk/.do images (DOS logical sector order) also require a walkable
  // catalog, so copy-protected/non-standard disks that merely present a VTOC-shaped sector
  // at track 17 are not mistaken for exportable DOS 3.3 volumes.
  if (isLikelyDos33Volume(data)) {
    if (!is140k || dosLogicalImageHasValidCatalog(data)) return "dos"
  }

  // Then, positively identify ProDOS structure.
  if (isLikelyProDosVolume(data)) return "prodos"

  // A 140K 5.25" image with neither a valid DOS 3.3 catalog nor ProDOS structure is not a
  // usable/exportable volume (previously such images defaulted to DOS, which let fake-VTOC
  // protected disks through).
  if (is140k) {
    return "unknown"
  }

  // .po can mean DOS-order or ProDOS-order. For non-140K block images,
  // prefer ProDOS handling when DOS structure probes are negative.
  if (ext === "po" && data.length > size140k && data.length % 512 === 0) {
    return "prodos"
  }

  // Extension fallback when structure probes are inconclusive.
  if (ext === "dsk" || ext === "do" || ext === "nib") {
    return "dos"
  }

  if (ext === "po") {
    return "prodos"
  }
  if (ext === "hdv" || ext === "2mg") {
    return "prodos"
  }

  return "unknown"
}

/**
 * Detects whether a DOS 3.3 *logical*-order image's boot greeting relies on the language
 * card, making the disk incompatible with DOS.MASTER (which keeps its relocated DOS 3.3 and
 * patched RWTS in the language card). Two cases are caught:
 *  - the greeting installs a "DOS in the language card" relocator / mover (e.g. DOS-UP,
 *    Diversi-DOS 64K) that write-enables the language card and bulk-copies DOS into
 *    $D000-$FFFF, overwriting DOS.MASTER's driver (subsequent access -> I/O ERROR); or
 *  - the greeting program itself switches/uses language-card RAM (e.g. MECC loaders whose
 *    Applesoft HELLO CALLs embedded machine code that bank-switches LC RAM), which clobbers
 *    DOS.MASTER just the same (observed failure: hang or "PROGRAM TOO LARGE").
 * Such disks cannot run as DOS.MASTER volumes and are excluded from export (vtocType
 * "dosup"). The greeting is inspected specifically so disks that merely carry such code
 * without booting it are not falsely excluded.
 */
const dosImageUsesLanguageCard = (image: Uint8Array): boolean => {
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256

  // Concatenates a DOS 3.3 file's data sectors by walking its track/sector list.
  const readDosFileData = (tsListTrack: number, tsListSector: number): Uint8Array => {
    const chunks: Uint8Array[] = []
    let listTrack = tsListTrack
    let listSector = tsListSector
    const visited = new Set<number>()
    for (let guard = 0; guard < 64; guard++) {
      if (listTrack === 0 || listTrack >= 35 || listSector >= 16) break
      const key = listTrack * 16 + listSector
      if (visited.has(key)) break
      visited.add(key)
      const off = sectorOffset(listTrack, listSector)
      if (off + 256 > image.length) break
      for (let i = 0; i < 122; i++) {
        const dataTrack = image[off + 0x0c + i * 2]
        const dataSector = image[off + 0x0c + i * 2 + 1]
        if (dataTrack === 0 && dataSector === 0) continue
        const dataOff = sectorOffset(dataTrack, dataSector)
        if (dataTrack < 35 && dataSector < 16 && dataOff + 256 <= image.length) {
          chunks.push(image.subarray(dataOff, dataOff + 256))
        }
      }
      listTrack = image[off + 1]
      listSector = image[off + 2]
    }
    const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    const out = new Uint8Array(total)
    let pos = 0
    for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length }
    return out
  }

  // A binary file is a language-card DOS mover if it both write-enables the language card
  // (any $C081/$C083/$C089/$C08B access) and stores to many distinct locations in
  // $D000-$FFFF (the copied-in DOS image). DOS-UP hits ~34 such targets; the threshold is
  // set well below that but high enough to ignore incidental language-card use.
  const LANGUAGE_CARD_DOS_TARGET_THRESHOLD = 16
  const isLanguageCardDosMover = (entry: DosCatalogEntry): boolean => {
    if ((entry.typeByte & 0x7f) !== DOS33_TYPE_BINARY) return false
    const raw = readDosFileData(entry.tsListTrack, entry.tsListSector)
    if (raw.length < 6) return false
    const body = raw.subarray(4) // skip the 2-byte load address + 2-byte length header
    let writeEnablesLanguageCard = false
    const languageCardTargets = new Set<number>()
    for (let i = 0; i + 2 < body.length; i++) {
      // A two-byte operand referencing $C08x (the language-card control soft switches).
      if (body[i + 2] === 0xc0 && (body[i + 1] & 0xf0) === 0x80) {
        const lowNibble = body[i + 1] & 0x0f
        if (lowNibble === 0x01 || lowNibble === 0x03 || lowNibble === 0x09 || lowNibble === 0x0b) {
          writeEnablesLanguageCard = true
        }
      }
      // STA absolute (0x8D) into the $D000-$FFFF language-card window.
      if (body[i] === 0x8d) {
        const target = body[i + 1] | (body[i + 2] << 8)
        if (target >= 0xd000) languageCardTargets.add(target)
      }
    }
    return writeEnablesLanguageCard && languageCardTargets.size >= LANGUAGE_CARD_DOS_TARGET_THRESHOLD
  }

  // Absolute-addressing opcodes (abs, abs,X, abs,Y) whose two-byte operand could name a
  // soft switch. Requiring one of these before a $C08x operand avoids matching incidental
  // data bytes that merely look like a soft-switch address.
  const ABSOLUTE_MEMORY_OPCODES = new Set([
    0x0d, 0x0e, 0x1d, 0x1e, 0x2c, 0x2d, 0x2e, 0x3d, 0x3e, 0x4d, 0x4e, 0x5d, 0x5e,
    0x6d, 0x6e, 0x7d, 0x7e, 0x8c, 0x8d, 0x8e, 0x99, 0x9d, 0xac, 0xad, 0xae,
    0xb9, 0xbc, 0xbd, 0xbe, 0xcd, 0xce, 0xdd, 0xde, 0xed, 0xee, 0xfd, 0xfe
  ])
  // A program "uses the language card" if it accesses any $C08x soft switch that reads or
  // write-enables language-card RAM. The pure read-ROM switches ($C082/$C086/$C08A/$C08E,
  // i.e. low nibble & 3 == 2) don't touch LC RAM and are ignored. DOS.MASTER lives in the
  // language card, so any other $C08x use clobbers it.
  const usesLanguageCardRam = (raw: Uint8Array): boolean => {
    for (let i = 0; i + 2 < raw.length; i++) {
      if (!ABSOLUTE_MEMORY_OPCODES.has(raw[i])) continue
      if (raw[i + 2] !== 0xc0) continue
      const low = raw[i + 1]
      if ((low & 0xf0) !== 0x80) continue
      if ((low & 0x03) === 0x02) continue
      return true
    }
    return false
  }

  const { entries } = readDos33Catalog(image)
  const greeting = chooseDosGreetingCommand(entries)
  if (!greeting) return false

  const greetingEntry = entries.find((entry) => entry.name.trim() === greeting.target.trim())
  if (!greetingEntry) return false

  // The greeting program itself may be a binary mover (BRUN greeting)...
  if (isLanguageCardDosMover(greetingEntry)) return true

  // ...or, more commonly, an Applesoft greeting BRUNs one. Read the greeting file and, for
  // each binary whose name the greeting mentions, check whether that binary is a mover.
  const greetingBytes = readDosFileData(greetingEntry.tsListTrack, greetingEntry.tsListSector)

  // The greeting program itself may also drive the language card directly (e.g. MECC
  // loaders whose Applesoft HELLO CALLs embedded ML that bank-switches LC RAM).
  if (usesLanguageCardRam(greetingBytes)) return true

  let greetingText = ""
  for (const byte of greetingBytes) greetingText += String.fromCharCode(byte & 0x7f)
  for (const entry of entries) {
    if ((entry.typeByte & 0x7f) !== DOS33_TYPE_BINARY) continue
    const name = entry.name.trim()
    if (name.length >= 3 && greetingText.includes(name) && isLanguageCardDosMover(entry)) {
      return true
    }
  }
  return false
}

// Concatenates a DOS 3.3 file's data sectors by walking its track/sector list. (A
// module-level twin of the reader used inside dosImageUsesLanguageCard, usable without a
// captured image.)
const readDosFileBytes = (image: Uint8Array, tsListTrack: number, tsListSector: number): Uint8Array => {
  const sectorOffset = (track: number, sector: number) => (track * 16 + sector) * 256
  const chunks: Uint8Array[] = []
  let listTrack = tsListTrack
  let listSector = tsListSector
  const visited = new Set<number>()
  for (let guard = 0; guard < 64; guard++) {
    if (listTrack === 0 || listTrack >= 35 || listSector >= 16) break
    const key = listTrack * 16 + listSector
    if (visited.has(key)) break
    visited.add(key)
    const off = sectorOffset(listTrack, listSector)
    if (off + 256 > image.length) break
    for (let i = 0; i < 122; i++) {
      const dataTrack = image[off + 0x0c + i * 2]
      const dataSector = image[off + 0x0c + i * 2 + 1]
      if (dataTrack === 0 && dataSector === 0) continue
      const dataOff = sectorOffset(dataTrack, dataSector)
      if (dataTrack < 35 && dataSector < 16 && dataOff + 256 <= image.length) {
        chunks.push(image.subarray(dataOff, dataOff + 256))
      }
    }
    listTrack = image[off + 1]
    listSector = image[off + 2]
  }
  const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
  const out = new Uint8Array(total)
  let pos = 0
  for (const chunk of chunks) { out.set(chunk, pos); pos += chunk.length }
  return out
}

/**
 * Detects a DOS 3.3 disk whose greeting program has no executable content, meaning it boots
 * only to the ] prompt under DOS.MASTER. Such disks -- commonly single-file "4am"-style
 * cracks -- carry a decoy/empty HELLO and load their game from raw, un-catalogued sectors via
 * a custom bootloader that DOS.MASTER (which reproduces only the standard DOS greeting boot)
 * cannot run. The greeting is the first launchable catalog file (see chooseDosGreetingCommand).
 * An Applesoft greeting is empty when it has no program lines: either its 2-byte length header
 * is 0, or (for decoy greetings that report a small nonzero length such as 2) its first line's
 * address link is null. An Integer greeting is empty when its 2-byte length is 0, and a binary
 * greeting when its 2-byte length field is 0. A disk with no launchable greeting at all is empty.
 */
const dosImageGreetingIsEmpty = (image: Uint8Array): boolean => {
  const { entries } = readDos33Catalog(image)
  const greeting = chooseDosGreetingCommand(entries)
  if (!greeting) return true
  const greetingEntry = entries.find((entry) => entry.name.trim() === greeting.target.trim())
  if (!greetingEntry) return true
  const bytes = readDosFileBytes(image, greetingEntry.tsListTrack, greetingEntry.tsListSector)
  const type = greetingEntry.typeByte & 0x7f
  if (type === DOS33_TYPE_APPLESOFT) {
    // Applesoft file layout: a 2-byte length header followed by the tokenized program, whose
    // first two bytes are the address link to the next line. A zero link means the program has
    // no lines. Some decoy greetings report a nonzero length yet contain only a null link, so
    // check the link rather than trusting the length alone.
    const programLength = bytes.length >= 2 ? (bytes[0] | (bytes[1] << 8)) : 0
    if (programLength === 0) return true
    const firstLineLink = bytes.length >= 4 ? (bytes[2] | (bytes[3] << 8)) : 0
    return firstLineLink === 0
  }
  if (type === DOS33_TYPE_INTEGER) {
    const programLength = bytes.length >= 2 ? (bytes[0] | (bytes[1] << 8)) : 0
    return programLength === 0
  }
  if (type === DOS33_TYPE_BINARY) {
    const binaryLength = bytes.length >= 4 ? (bytes[2] | (bytes[3] << 8)) : 0
    return binaryLength === 0
  }
  return bytes.length === 0
}

/**
 * Checks whether a DOS 3.3 logical-order image whose greeting is empty contains a large
 * binary file suitable for direct block loading (bypassing DOS.MASTER entirely). A disk
 * qualifies when its catalog contains at least one binary file with:
 *  - a valid load address in the range $0400-$9600
 *  - a payload length >= 4096 bytes (a real game, not a small stub)
 * The largest such binary is assumed to be the game. Returns the catalog entry and parsed
 * header of the best candidate, or undefined if none qualifies.
 */
const findDirectLoadCandidate = (image: Uint8Array): {
  entry: DosCatalogEntry
  loadAddress: number
  binaryLength: number
} | undefined => {
  if (!isLikelyDos33Volume(image) || !dosLogicalImageHasValidCatalog(image)) return undefined
  const { entries } = readDos33Catalog(image)
  let best: { entry: DosCatalogEntry; loadAddress: number; binaryLength: number } | undefined
  for (const entry of entries) {
    if (entry.sectorCount < 1) continue
    if ((entry.typeByte & 0x7f) !== DOS33_TYPE_BINARY) continue
    const bytes = readDosFileBytes(image, entry.tsListTrack, entry.tsListSector)
    // Binary file header: 2-byte load address LE, 2-byte length LE, then data.
    if (bytes.length < 4) continue
    const loadAddress = bytes[0] | (bytes[1] << 8)
    const binaryLength = bytes[2] | (bytes[3] << 8)
    if (binaryLength < 4096) continue
    if (loadAddress < 0x0400 || loadAddress > 0x9600) continue
    if (!best || binaryLength > best.binaryLength) {
      best = { entry, loadAddress, binaryLength }
    }
  }
  return best
}

/**
 * Parses a DOS 3.3 Applesoft file's tokenized bytes to extract CALL addresses
 * and quoted DOS command strings. Properly handles the file format:
 *   bytes[0-1] = program length (2-byte LE header)
 *   bytes[2+]  = tokenized program (linked list of lines)
 * Each line: [next-ptr-lo] [next-ptr-hi] [linenum-lo] [linenum-hi] [tokens...] [$00]
 * Program end: next-ptr = $0000.
 */
const parseApplesoftFileTokens = (bytes: Uint8Array): { callAddrs: number[]; dosCommands: string[] } => {
  const callAddrs: number[] = []
  const dosCommands: string[] = []
  const CALL_TOKEN = 0x8C
  const MINUS_TOKEN = 0xC9

  // Skip 2-byte length header; tokenized program starts at offset 2
  let offset = 2

  while (offset + 4 < bytes.length) {
    const nextPtr = bytes[offset] | (bytes[offset + 1] << 8)
    if (nextPtr === 0) break // end of program

    // Tokens start after 4-byte line header (2 ptr + 2 linenum)
    const tokStart = offset + 4
    let tokEnd = tokStart
    while (tokEnd < bytes.length && bytes[tokEnd] !== 0x00) tokEnd++

    // Scan tokens within this line
    let inString = false
    let currentString = ""
    for (let i = tokStart; i < tokEnd; i++) {
      const b = bytes[i]
      if (b === 0x22) { // real quote character in token stream
        if (inString) {
          const cmd = currentString.trim().toUpperCase()
          if (cmd.length >= 2) dosCommands.push(cmd)
          currentString = ""
        }
        inString = !inString
        continue
      }
      if (inString) {
        currentString += String.fromCharCode(b & 0x7f)
        continue
      }
      // Outside string: look for CALL token
      if (b === CALL_TOKEN) {
        let j = i + 1
        while (j < tokEnd && bytes[j] === 0x20) j++ // skip spaces
        if (j < tokEnd && (bytes[j] === MINUS_TOKEN || bytes[j] === 0x2D)) continue // negative
        let numStr = ""
        while (j < tokEnd && bytes[j] >= 0x30 && bytes[j] <= 0x39) {
          numStr += String.fromCharCode(bytes[j])
          j++
        }
        if (numStr.length > 0) {
          callAddrs.push(parseInt(numStr, 10))
        }
      }
    }

    offset = tokEnd + 1 // skip past the $00 terminator
  }

  return { callAddrs, dosCommands }
}

/**
 * Analyzes the Applesoft greeting (HELLO) program on a DOS 3.3 disk to determine
 * the correct entry point for a direct-loaded game. Handles two patterns:
 *
 * 1. BLOAD + CALL: HELLO BLOADs the binary, then CALLs an address within it.
 *    Returns `{ entryAddress, auxBinary: undefined }`.
 *
 * 2. BLOAD + BRUN: HELLO BLOADs the main binary, then BRUNs a separate launcher
 *    binary (e.g. MDSADJ for BurgerTime). Returns `{ entryAddress, auxBinary }` with
 *    the launcher's load address and data so the caller can merge it into the payload.
 *
 * Returns undefined when no entry point can be determined (caller falls back to loadAddress).
 */
const findEntryFromGreeting = (
  image: Uint8Array,
  candidateLoadAddress: number,
  candidateBinaryLength: number,
  candidateName: string
): { entryAddress: number; auxBinary?: { loadAddress: number; data: Uint8Array } } | undefined => {
  if (!isLikelyDos33Volume(image) || !dosLogicalImageHasValidCatalog(image)) return undefined
  const { entries } = readDos33Catalog(image)
  const endAddr = candidateLoadAddress + candidateBinaryLength

  // Log catalog for diagnostics
  const catSummary = entries.filter(e => e.sectorCount > 0).map(e => {
    const t = e.typeByte & 0x7f
    const typeStr = t === 0x02 ? "A" : t === 0x04 ? "B" : t === 0x01 ? "I" : t === 0x00 ? "T" : `?${t}`
    return `${e.name.trim()}(${typeStr},${e.sectorCount}s)`
  }).join(", ")
  console.log(`[HDV Export] DOS catalog: ${catSummary}`)

  const applesoftEntries = entries.filter(e =>
    e.sectorCount > 0 && (e.typeByte & 0x7f) === DOS33_TYPE_APPLESOFT
  )

  if (applesoftEntries.length === 0) {
    console.log(`[HDV Export] No Applesoft entries found in catalog`)
    return undefined
  }

  const candidateNameUpper = candidateName.trim().toUpperCase()

  // Build a map of binary filenames for BRUN target lookup
  const binaryEntries = new Map<string, DosCatalogEntry>()
  for (const entry of entries) {
    if (entry.sectorCount > 0 && (entry.typeByte & 0x7f) === DOS33_TYPE_BINARY) {
      binaryEntries.set(entry.name.trim().toUpperCase(), entry)
    }
  }

  for (const entry of applesoftEntries) {
    const bytes = readDosFileBytes(image, entry.tsListTrack, entry.tsListSector)
    if (bytes.length < 6) continue

    // Diagnostic: dump first 64 bytes of Applesoft file
    const dumpLen = Math.min(64, bytes.length)
    const hexDump = Array.from(bytes.subarray(0, dumpLen)).map(b => b.toString(16).padStart(2, "0")).join(" ")
    console.log(`[HDV Export] Applesoft "${entry.name.trim()}" (${bytes.length} bytes): ${hexDump}`)

    const { callAddrs, dosCommands } = parseApplesoftFileTokens(bytes)

    if (callAddrs.length > 0) {
      console.log(`[HDV Export] CALL addresses in "${entry.name.trim()}": ${callAddrs.map(a => "$" + a.toString(16).toUpperCase()).join(", ")}`)
      const inRange = callAddrs.filter(a => a >= candidateLoadAddress && a < endAddr)
      if (inRange.length > 0) {
        const chosen = inRange[inRange.length - 1]
        console.log(`[HDV Export] Using CALL entry address $${chosen.toString(16).toUpperCase()} from "${entry.name.trim()}"`)
        return { entryAddress: chosen }
      }
    }

    console.log(`[HDV Export] DOS commands in "${entry.name.trim()}": ${dosCommands.length > 0 ? dosCommands.join("; ") : "(none)"}`)

    // Look for BRUN <target> where target is a binary file OTHER than the candidate
    for (const cmd of dosCommands) {
      if (!cmd.startsWith("BRUN ") && !cmd.startsWith("BRUN\t")) continue
      const target = cmd.substring(5).split(",")[0].trim()
      if (!target || target === candidateNameUpper) continue
      const targetEntry = binaryEntries.get(target)
      if (!targetEntry) continue

      // Found a BRUN of a different binary — read its load address and data
      const targetBytes = readDosFileBytes(image, targetEntry.tsListTrack, targetEntry.tsListSector)
      if (targetBytes.length < 4) continue
      const auxLoadAddr = targetBytes[0] | (targetBytes[1] << 8)
      const auxLength = targetBytes[2] | (targetBytes[3] << 8)
      const auxData = targetBytes.subarray(4, 4 + auxLength)
      console.log(`[HDV Export] BRUN target "${target}": loadAddr=$${auxLoadAddr.toString(16)}, len=${auxLength}`)
      return {
        entryAddress: auxLoadAddr,
        auxBinary: { loadAddress: auxLoadAddr, data: auxData }
      }
    }
  }

  // Fallback: if Applesoft parsing found nothing (e.g. decoy HELLO on 4am cracks),
  // look for a binary file in the catalog that isn't the candidate. If there's exactly
  // one such file, assume it's a launcher (equivalent to BRUN).
  const otherBinaries = [...binaryEntries.entries()].filter(([name]) => name !== candidateNameUpper)
  if (otherBinaries.length === 1) {
    const [targetName, targetEntry] = otherBinaries[0]
    const targetBytes = readDosFileBytes(image, targetEntry.tsListTrack, targetEntry.tsListSector)
    if (targetBytes.length >= 4) {
      const auxLoadAddr = targetBytes[0] | (targetBytes[1] << 8)
      const auxLength = targetBytes[2] | (targetBytes[3] << 8)
      const auxData = targetBytes.subarray(4, 4 + auxLength)

      // Recursive-descent disassembly of the launcher binary to find outgoing
      // JMP/JSR targets (addresses OUTSIDE the launcher's range but INSIDE the
      // main binary's range). This follows actual code flow to avoid false
      // positives from data bytes that look like JMP/JSR opcodes.
      // 65C02 instruction lengths by opcode
      const instrLengths = new Uint8Array(256)
      // Default: 1 byte (undefined opcodes are 1-byte NOPs on 65C02)
      instrLengths.fill(1)
      // 2-byte instructions: immediate, zero-page, zp-indexed, relative, indirect
      for (const op of [
        0x09,0x29,0x49,0x69,0x89,0xA0,0xA2,0xA9,0xC0,0xC9,0xE0,0xE9, // IMM
        0x05,0x06,0x24,0x25,0x26,0x45,0x46,0x64,0x65,0x66,0x84,0x85,0x86, // ZP
        0xA4,0xA5,0xA6,0xC4,0xC5,0xC6,0xE4,0xE5,0xE6,0x04,0x14,0x44, // ZP cont
        0x15,0x16,0x34,0x35,0x36,0x55,0x56,0x74,0x75,0x76,0x94,0x95, // ZP,X
        0xB4,0xB5,0xD5,0xD6,0xF5,0xF6,0x96,0xB6,0x54, // ZP,X/Y cont
        0x10,0x30,0x50,0x70,0x80,0x90,0xB0,0xD0,0xF0, // REL branches
        0x01,0x11,0x21,0x31,0x41,0x51,0x61,0x71,0x81,0x91,0xA1,0xB1, // (IND,X)/(IND),Y
        0xC1,0xD1,0xE1,0xF1,0x12,0x32,0x52,0x72,0x92,0xB2,0xD2,0xF2, // (IND)
      ]) instrLengths[op] = 2
      // 3-byte instructions: absolute, absolute-indexed, indirect JMP
      for (const op of [
        0x0D,0x0E,0x19,0x1E,0x2C,0x2D,0x2E,0x39,0x3C,0x3E,0x4C,0x4D,0x4E, // ABS
        0x59,0x5E,0x6C,0x6D,0x6E,0x79,0x7C,0x7E,0x8C,0x8D,0x8E,0x9C,0x9E, // ABS cont
        0xAC,0xAD,0xAE,0xB9,0xBC,0xBE,0xCC,0xCD,0xCE,0xD9,0xDE, // ABS cont
        0xEC,0xED,0xEE,0xF9,0xFE, // ABS cont
        0x20, // JSR abs
        0x1D,0x3D,0x5D,0x7D,0x99,0xBD,0xDD,0xFD, // ABS,X / ABS,Y
      ]) instrLengths[op] = 3

      // Branch opcodes (all 2-byte relative)
      const branchOps = new Set([0x10,0x30,0x50,0x70,0x80,0x90,0xB0,0xD0,0xF0])

      const visited = new Set<number>() // offsets in auxData
      const outgoingJmps: number[] = []
      const queue: number[] = []

      // Start tracing from the entry point
      if (auxData[0] === 0x4C && auxData.length >= 3) {
        // Entry is JMP abs — follow it
        const entryTarget = auxData[1] | (auxData[2] << 8)
        const entryOffset = entryTarget - auxLoadAddr
        if (entryOffset >= 0 && entryOffset < auxData.length) {
          queue.push(entryOffset)
        }
      } else {
        queue.push(0) // Start from beginning
      }

      while (queue.length > 0) {
        let offset = queue.pop()!
        while (offset >= 0 && offset < auxData.length - 2 && !visited.has(offset)) {
          visited.add(offset)
          const opcode = auxData[offset]
          const len = instrLengths[opcode]

          if (offset + len > auxData.length) break // Runs off end

          // JMP abs ($4C) or JSR abs ($20)
          if ((opcode === 0x4C || opcode === 0x20) && len === 3) {
            const target = auxData[offset + 1] | (auxData[offset + 2] << 8)
            const targetOffset = target - auxLoadAddr
            if (targetOffset >= 0 && targetOffset < auxData.length) {
              queue.push(targetOffset) // Internal — follow it
            } else if (target >= candidateLoadAddress && target < endAddr) {
              outgoingJmps.push(target) // External to main binary!
            }
            if (opcode === 0x4C) break // JMP doesn't fall through
          }

          // JMP indirect ($6C) or JMP (abs,X) ($7C) — can't follow, stop
          if (opcode === 0x6C || opcode === 0x7C) break

          // Branches — follow both paths
          if (branchOps.has(opcode)) {
            const rel = auxData[offset + 1]
            const branchTarget = offset + 2 + (rel < 128 ? rel : rel - 256)
            if (branchTarget >= 0 && branchTarget < auxData.length) {
              queue.push(branchTarget)
            }
            // Fall through to the next instruction too (conditional branch)
            if (opcode === 0x80) break // BRA is unconditional
          }

          // RTS ($60), RTI ($40), BRK ($00) — end of path
          if (opcode === 0x60 || opcode === 0x40 || opcode === 0x00) break

          offset += len
        }
      }

      console.log(`[HDV Export] Fallback launcher "${targetName}": loadAddr=$${auxLoadAddr.toString(16)}, len=${auxLength}, traced ${visited.size} instruction offsets`)
      console.log(`[HDV Export] Outgoing JMP/JSR targets (traced): ${outgoingJmps.map(a => "$" + a.toString(16).toUpperCase()).join(", ") || "(none)"}`)

      // Scan for all references to $07DC (and nearby) in the MDSADJ data.
      // MDSADJ uses JMP ($07DC) to enter the game — find where it stores the target.
      for (let i = 0; i < auxData.length - 2; i++) {
        const lo = auxData[i + 1], hi = auxData[i + 2]
        const addr16 = hi << 8 | lo
        if (addr16 >= 0x07D0 && addr16 <= 0x07E0) {
          const op = auxData[i]
          const srcAddr = auxLoadAddr + i
          console.log(`[HDV Export] MDSADJ ref to $${addr16.toString(16).toUpperCase()} at $${srcAddr.toString(16).toUpperCase()}: op=$${op.toString(16).toUpperCase()}`)
        }
      }

      // Dump hex at key areas: around the JMP indirect, and the last 128 valid bytes
      const dumpHex = (label: string, data: Uint8Array, off: number, len: number) => {
        const end = Math.min(off + len, data.length)
        if (off >= data.length) return
        const hex = Array.from(data.subarray(off, end)).map(b => b.toString(16).padStart(2, "0")).join(" ")
        console.log(`[HDV Export] ${label} (offset $${off.toString(16)}, addr $${(auxLoadAddr + off).toString(16)}): ${hex}`)
      }
      // Area around JMP ($07DC) at offset $4E7
      const jmpOffset = auxData.indexOf(0x6C) // Find actual JMP indirect
      if (jmpOffset >= 0) {
        dumpHex("Around JMP indirect", auxData, Math.max(0, jmpOffset - 16), 48)
      }
      // Last 128 valid bytes (before corruption at ~offset 8960)
      dumpHex("Pre-corruption area", auxData, Math.max(0, auxData.length - 320), 128)
      dumpHex("Corruption boundary", auxData, Math.max(0, auxData.length - 192), 128)
      dumpHex("Corrupted tail", auxData, Math.max(0, auxData.length - 64), 64)
      // If we found outgoing JMPs to the main binary, use the last one as
      // the game entry point and skip the launcher overlay entirely.
      // The launcher's T/S list may be corrupted (common on 4am cracks).
      if (outgoingJmps.length > 0) {
        const gameEntry = outgoingJmps[outgoingJmps.length - 1]
        console.log(`[HDV Export] Using game entry $${gameEntry.toString(16).toUpperCase()} (bypassing launcher)`)
        return { entryAddress: gameEntry }
      }

      // No outgoing JMPs found — fall back to using the launcher with overlay
      return {
        entryAddress: auxLoadAddr,
        auxBinary: { loadAddress: auxLoadAddr, data: auxData }
      }
    }
  }

  console.log(`[HDV Export] No entry point found in any Applesoft program (range $${candidateLoadAddress.toString(16)}-$${endAddr.toString(16)})`)
  return undefined
}

/**
 * Classifies a DOS 3.3 image that may be incompatible with DOS.MASTER as either
 * "dos" (normal), "dosup" (genuinely non-exportable), or "dosdirect" (exportable
 * via direct block loading, bypassing DOS.MASTER).
 *
 * A disk is "dosdirect" when its catalog contains a binary that would overwrite
 * DOS memory ($9D00+) when loaded, AND that binary qualifies for direct block
 * loading. This covers both:
 *  - disks with empty/stub greetings (e.g. a blank HELLO + large game binary)
 *  - disks with real Applesoft greetings that BRUN a binary too large for
 *    DOS.MASTER (e.g. BurgerTime's HELLO BRUNs a binary extending to $BD00)
 *
 * Language-card disks stay "dosup" regardless (the LC conflict is fundamental).
 * Disks with empty greetings and no viable binary are "dosup".
 */
const classifyDosUpOrDirect = (image: Uint8Array): VtocType => {
  if (dosImageUsesLanguageCard(image)) return "dosup"
  const candidate = findDirectLoadCandidate(image)
  if (candidate) {
    // If the binary extends past DOS memory ($9D00), it will overwrite DOS.MASTER's
    // RWTS and DOS buffers when loaded — DOS.MASTER cannot survive this, so bypass it.
    const endAddress = candidate.loadAddress + candidate.binaryLength
    if (endAddress > 0x9D00 || dosImageGreetingIsEmpty(image)) return "dosdirect"
  }
  if (dosImageGreetingIsEmpty(image)) return "dosup"
  return "dos"
}

/**
 * Determines the exportable VTOC type of a disk image: "dos", "prodos", "dosdirect",
 * "dosup", or "other". "other" means the image is neither a recognizable DOS 3.3 nor
 * ProDOS volume. "dosup" means a DOS 3.3 volume that is incompatible with DOS.MASTER and
 * has no viable binary for direct loading. "dosdirect" means a DOS 3.3 volume whose
 * catalog contains a large binary whose end address overlaps DOS memory ($9D00+), or whose
 * greeting is empty — either way bypassed by direct SmartPort block loading.
 * WOZ images are fully bit-decoded and probed under every sector order before being classified.
 */
export const determineVtocType = (filename: string, data: Uint8Array): VtocType => {
  const ext = filename.toLowerCase().split(".").pop() || ""

  if (ext === "woz") {
    const decoded = decodeWozToSectorCandidates(data)
    if (decoded) {
      for (const candidate of decoded.candidates) {
        if (isLikelyProDosVolume(candidate.data)) return "prodos"
      }
      // Require a genuinely walkable DOS 3.3 catalog (not just a VTOC-shaped sector) so
      // copy-protected/non-standard disks are classified "other" and not exported.
      const dosImage = loadWozAndExtractDosImage(data)
      if (dosImage) {
        return classifyDosUpOrDirect(dosImage)
      }
    }
    return "other"
  }

  const kind = classifyImageKind(filename, data)
  // A raw 140K DOS logical-order image (.dsk/.do) that is incompatible with DOS.MASTER:
  // uses a language-card DOS mover, has an empty/decoy greeting, or contains a binary
  // whose end address overlaps DOS memory ($9D00+) and would corrupt DOS.MASTER on BRUN.
  if (kind === "dos" &&
    data.length === (35 * 16 * 256) &&
    dosLogicalImageHasValidCatalog(data)) {
    if (dosImageUsesLanguageCard(data) || dosImageGreetingIsEmpty(data)) {
      return classifyDosUpOrDirect(data)
    }
    // Even with a real greeting, check for binaries that extend past DOS memory.
    const candidate = findDirectLoadCandidate(data)
    if (candidate && candidate.loadAddress + candidate.binaryLength > 0x9D00) {
      return classifyDosUpOrDirect(data)
    }
  }
  return kind === "unknown" ? "other" : kind
}

// In ProDOS a "system program" is any file of type $FF (SYS) loaded at $2000; the
// ".SYSTEM" name is only a convention. Two kinds of system program cannot be launched as
// a standalone program once a disk has been extracted into a subdirectory:
//  - Driver installers such as CLOCK.SYSTEM / NS.CLOCK.SYSTEM (ProDOS 2.4.x clock drivers)
//    install a driver and then chain to the next .SYSTEM file by scanning the *boot
//    volume root* -- verified live that they ignore both the current prefix and the
//    $0280 pathname buffer -- so they always fail with "Unable to find next '.SYSTEM'
//    file" when run from an imported subdirectory (and drop into the ProDOS 2.4.x "Bitsy
//    Bye" selector instead of the game).
//  - QUIT.SYSTEM is the ProDOS quit dispatcher; under the menu's ProDOS kernel it just
//    quits to the emulator splash (a dead end), so it is never a useful launch target.
// Skip those and launch the first remaining system program in catalog order. For
// ProDOS 2.4.x this resolves to BITSY.BOOT, which honors the prefix and brings up the
// authentic "Bitsy Bye" program selector for the imported subdirectory (verified live),
// so the disk launches into a working, interactive ProDOS 2.4.x environment.
const isNonLaunchableSystemFile = (name: string): boolean => {
  const upper = name.toUpperCase()
  // endsWith("CLOCK.SYSTEM") matches both a bare CLOCK.SYSTEM and prefixed variants like
  // NS.CLOCK.SYSTEM / THERMO.CLOCK.SYSTEM.
  return upper === "QUIT.SYSTEM" || upper.endsWith("CLOCK.SYSTEM")
}

// Scans an imported executable/data file for a literal absolute path that begins with the
// disk's own original volume name, e.g. "/UNDEAD" or "/GAMEVOL/DIR" (matched in both normal
// and high-bit ASCII). Rejects a trailing alphanumeric so "/UNDEAD" does not match
// "/UNDEADED". Only executable/data types that can carry a usable pathname are scanned
// ($06 BIN, $FF SYS, $FC BAS, $04 TXT); Finder-metadata types such as $CA icons are ignored
// (an icon's embedded "/UNDEAD/BASIC.SYSTEM" is never fed to an MLI path call).
const PROBABLE_PATH_BEARING_TYPES = new Set([0x06, 0xFF, 0xFC, 0x04])
const isProDosNameChar = (byte: number): boolean => {
  const c = byte & 0x7f
  return (c >= 0x41 && c <= 0x5a) || (c >= 0x61 && c <= 0x7a) || (c >= 0x30 && c <= 0x39) || c === 0x2e
}
const dataReferencesAbsoluteVolumePath = (data: Uint8Array, volumeName: string): boolean => {
  const vol = volumeName.toUpperCase()
  if (vol.length === 0) return false
  for (let base = 0; base + 1 + vol.length <= data.length; base++) {
    if ((data[base] & 0x7f) !== 0x2f) continue // leading '/'
    let matched = true
    for (let k = 0; k < vol.length; k++) {
      let c = data[base + 1 + k] & 0x7f
      if (c >= 0x61 && c <= 0x7a) c -= 0x20 // uppercase for comparison
      if (c !== vol.charCodeAt(k)) { matched = false; break }
    }
    if (!matched) continue
    // Require the volume name to be delimited (end of data, '/', or any non-name byte) so a
    // longer volume like "/UNDEADED" is not matched against a shorter target "/UNDEAD".
    const after = base + 1 + vol.length
    if (after < data.length && isProDosNameChar(data[after]) && (data[after] & 0x7f) !== 0x2f) continue
    return true
  }
  return false
}

// Decides whether a ProDOS disk needs the resident alias shim. The shim exists solely to
// rewrite an absolute SET_PREFIX (MLI $C6) whose pathname begins with the disk's original
// volume name so it points at the disk's HDV subdirectory instead. It therefore helps only a
// disk that hardcodes such an absolute path literal in one of its programs. Disks that use
// only relative paths, or that reconstruct their prefix at runtime from GET_PREFIX/ONLINE
// (which already yields the HDV volume /APPLE2TS), gain nothing from the shim.
//
// Installing the shim anyway is not free: it patches the $BF00 MLI vector to a resident
// language-card hook that runs on every MLI call, which destabilizes games that keep
// code/data in the language card or drive interrupts. Glider (no SET_PREFIX at all) dies with
// a ProDOS "RESTART SYSTEM" death; Undead (SET_PREFIX only on runtime-built /APPLE2TS paths)
// fails its file OPENs with ProDOS error $56 "bad buffer address". Gating on an actual
// hardcoded volume-path literal skips the shim for both while still installing it for disks
// that genuinely embed "/VOLUME/..." absolute paths.
const proDosFilesNeedAliasShim = (files: BuildInputFile[], volumeName: string | undefined): boolean => {
  if (!volumeName) return false
  for (const file of files) {
    if (!PROBABLE_PATH_BEARING_TYPES.has(file.type ?? 0)) continue
    if (dataReferencesAbsoluteVolumePath(file.data, volumeName)) return true
  }
  return false
}

const detectProDosLaunchCommand = (files: BuildInputFile[]): string | undefined => {
  // Preserve on-disk root catalog order by scanning input sequence directly.
  const rootFiles = files.filter((f) => !f.relativePath)

  // Prefer a launchable ProDOS system program (type $FF, load address $2000).
  const systemProgram = rootFiles.find(
    (f) => f.type === 0xFF && (f.auxType ?? 0) === 0x2000 && !isNonLaunchableSystemFile(f.name)
  )
  if (systemProgram) return `-${systemProgram.name}`

  // Fall back to any other .SYSTEM-named file that is not a known dead end.
  const firstRootSystem = rootFiles.find(
    (f) => f.name.toUpperCase().endsWith(".SYSTEM") && !isNonLaunchableSystemFile(f.name)
  )
  if (firstRootSystem) return `-${firstRootSystem.name}`

  const byName = new Map(rootFiles.map((f) => [f.name.toUpperCase(), f]))
  if (byName.has("STARTUP")) return "-STARTUP"

  if (byName.has("HELLO")) {
    const hello = byName.get("HELLO")
    if (hello?.type === 0xFC) return "RUN HELLO"
    if (hello?.type === 0x06) return "BRUN HELLO"
    return "-HELLO"
  }

  const bin = rootFiles.find((f) => f.type === 0x06)
  if (bin) return `BRUN ${bin.name}`

  const bas = rootFiles.find((f) => f.type === 0xFC)
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

const preprocessInputFilesForMenu = async (
  files: BuildInputFile[],
  menuEntries?: MenuDiskEntry[],
  reservedNames?: Set<string>,
  zpCaptureCallback?: (menuIndex: number, entryAddress: number) => Promise<Uint8Array | null>,
) => {
  const outputFiles: BuildInputFile[] = []
  const directoryPlans: DirectoryImportPlan[] = []
  const menuProDosCommands: Array<string | undefined> = []
  const menuProDosPrefixes: Array<string | undefined> = []
  // Per-menu-index flag: does this ProDOS disk issue a SET_PREFIX MLI call and thus need
  // the resident alias-prefix shim? Disks that never call SET_PREFIX skip the shim so its
  // MLI hook can't destabilize language-card/interrupt games (see proDosFilesIssueSetPrefix).
  const menuNeedsAliasShim: boolean[] = []
  // DOS 3.3 images become DOS.MASTER virtual volumes (V1, V2, ...). They are
  // collected here in menu order for DOS.INSTALL-style contiguous partition
  // placement; runtimeVolumeByMenuIndex maps each source menu entry to its
  // DOS.MASTER volume number for the launch CATALOG,Sn,Vn command.
  const runtimeVolumes: BuildInputFile[] = []
  const runtimeVolumeByMenuIndex: Array<number | undefined> = []
  const runtimeHelloModeByMenuIndex: Array<number | undefined> = []
  // Direct-load entries for "dosdirect" disks: per-menu-index metadata describing
  // a self-contained binary that will be loaded via the block-reader stub. The
  // startBlock is filled in later by the HDV builder after block allocation.
  const directLoadByMenuIndex: Array<DirectLoadEntry | undefined> = []
  const usedNames = new Set<string>(reservedNames || [])

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const kind = menuEntries?.[i]?.imageKind || "unknown"
    const sourceFilename = menuEntries?.[i]?.sourceFilename || file.name
    const isWozContainer = sourceFilename.toLowerCase().endsWith(".woz")
    const wozExtractedFiles = menuEntries?.[i]?.wozExtractedProDosFiles

    // Direct-load disks: extract the binary from the catalog and store metadata
    // for the block-reader stub. These bypass DOS.MASTER entirely.
    if (kind === "dosdirect") {
      const candidate = findDirectLoadCandidate(file.data)
      if (candidate) {
        const bytes = readDosFileBytes(file.data, candidate.entry.tsListTrack, candidate.entry.tsListSector)
        // Binary file header: 2-byte load address, 2-byte length, then payload.
        const rawHeader = Array.from(bytes.subarray(0, 8)).map(b => b.toString(16).padStart(2, "0")).join(" ")
        console.log(`[HDV Export] Binary file "${candidate.entry.name.trim()}": rawHeader=[${rawHeader}], loadAddr=$${candidate.loadAddress.toString(16)}, len=${candidate.binaryLength}, totalFileBytes=${bytes.length}`)
        let payload = bytes.subarray(4, 4 + candidate.binaryLength)
        let loadAddress = candidate.loadAddress
        let entryAddress = candidate.loadAddress

        // Analyze the greeting to find the real entry point (CALL addr or BRUN target).
        const greetingResult = findEntryFromGreeting(file.data, candidate.loadAddress, candidate.binaryLength, candidate.entry.name)

        // Scan payload for common 6502 game init sequences to find entry point candidates.
        // Useful when the launcher (MDSADJ etc.) has corrupted data.
        const initCandidates: {addr: number, pattern: string, context: string}[] = []
        for (let i = 0; i < payload.length - 4; i++) {
          const addr = loadAddress + i
          // SEI + CLD pattern (very common game init)
          if (payload[i] === 0x78 && payload[i + 1] === 0xD8) {
            const ctx = Array.from(payload.subarray(i, Math.min(i + 64, payload.length)))
              .map(b => b.toString(16).padStart(2, "0")).join(" ")
            initCandidates.push({addr, pattern: "SEI+CLD", context: ctx})
          }
          // LDX #$FF + TXS pattern (stack init)
          if (payload[i] === 0xA2 && payload[i + 1] === 0xFF && payload[i + 2] === 0x9A) {
            const ctx = Array.from(payload.subarray(i, Math.min(i + 64, payload.length)))
              .map(b => b.toString(16).padStart(2, "0")).join(" ")
            initCandidates.push({addr, pattern: "LDX#FF+TXS", context: ctx})
          }
        }
        if (initCandidates.length > 0) {
          console.log(`[HDV Export] Game init candidates in payload:`)
          for (const c of initCandidates.slice(0, 20)) {
            console.log(`  $${c.addr.toString(16).toUpperCase()} ${c.pattern}: ${c.context}`)
          }
        }

        if (greetingResult) {
          entryAddress = greetingResult.entryAddress
          if (greetingResult.auxBinary) {
            // HELLO BLOADs main binary, then BRUNs a separate launcher.
            const aux = greetingResult.auxBinary
            const auxOffset = aux.loadAddress - loadAddress
            // Check if the main binary already contains the launcher at the right offset
            // (common in 4am cracks where the cracker merges everything into one binary).
            const mainAtAux = payload.subarray(auxOffset, auxOffset + Math.min(32, aux.data.length))
            const auxHead = aux.data.subarray(0, Math.min(32, aux.data.length))
            const alreadyMerged = mainAtAux.length === auxHead.length &&
              mainAtAux.every((b, i) => b === auxHead[i])
            if (alreadyMerged) {
              console.log(`[HDV Export] Main binary already contains launcher at $${aux.loadAddress.toString(16)}, skipping overlay`)
            } else {
              // Detect corrupted sectors in aux data (sequential-byte pattern from bad T/S list).
              // For each corrupted 256-byte sector, fall back to the main binary's data at that offset.
              const isSequentialSector = (data: Uint8Array, sectorStart: number): boolean => {
                if (sectorStart + 256 > data.length) return false
                let sequential = 0
                for (let j = 1; j < 256; j++) {
                  if (data[sectorStart + j] === ((data[sectorStart + j - 1] + 1) & 0xFF)) sequential++
                }
                return sequential >= 250 // nearly all bytes are sequential
              }
              // Build clean aux data, replacing corrupted sectors with main binary data
              const cleanAux = new Uint8Array(aux.data)
              let repaired = 0
              for (let s = 0; s < cleanAux.length; s += 256) {
                if (isSequentialSector(cleanAux, s)) {
                  // Replace corrupted sector with main binary data at same address
                  const mainOff = auxOffset + s
                  if (mainOff + 256 <= payload.length) {
                    cleanAux.set(payload.subarray(mainOff, mainOff + 256), s)
                  } else {
                    // Zero out if main binary doesn't cover this region
                    cleanAux.fill(0, s, Math.min(s + 256, cleanAux.length))
                  }
                  repaired++
                }
              }
              if (repaired > 0) {
                console.log(`[HDV Export] Repaired ${repaired} corrupted sector(s) in launcher "${aux.loadAddress.toString(16)}" using main binary data`)
                // If the launcher has corrupted sectors AND the init scan found game
                // entry candidates, the launcher's post-selection code is likely broken
                // (e.g. it can't write the trampoline to $07DC). Skip the launcher
                // overlay and jump directly to the game init.
                if (initCandidates.length > 0) {
                  entryAddress = initCandidates[0].addr
                  console.log(`[HDV Export] Launcher corrupted — bypassing overlay, using game init at $${entryAddress.toString(16).toUpperCase()}`)
                }
              }
              if (!(repaired > 0 && initCandidates.length > 0)) {
                // Merge both into a single contiguous payload.
                const mergedStart = Math.min(loadAddress, aux.loadAddress)
                const mergedEnd = Math.max(loadAddress + payload.length, aux.loadAddress + cleanAux.length)
                const merged = new Uint8Array(mergedEnd - mergedStart)
                // Layer main binary first, then clean auxiliary on top
                merged.set(payload, loadAddress - mergedStart)
                merged.set(cleanAux, aux.loadAddress - mergedStart)
                payload = merged
                loadAddress = mergedStart
                console.log(`[HDV Export] Merged binary: $${mergedStart.toString(16)}-$${mergedEnd.toString(16)} (${merged.length} bytes), entry=$${entryAddress.toString(16)}`)
              }
            }
          }
        }

        // Scan for cold-start copy protection pattern:
        // LDA $xx; CMP #$yy; BEQ +6; LDA #hh; PHA; LDA #ll; PHA; RTS
        // Pattern: A5 xx C9 yy F0 06 A9 hh 48 A9 ll 48 60 (13 bytes)
        // When found, pre-setting zero-page $xx = $yy skips the destructive
        // cold-start that clears game memory and returns to the (missing) boot code.
        let coldStartFlagAddr: number | undefined
        let coldStartFlagValue: number | undefined
        for (let i = 0; i < payload.length - 13; i++) {
          if (payload[i] === 0xA5 &&             // LDA $xx
              payload[i + 2] === 0xC9 &&          // CMP #$yy
              payload[i + 4] === 0xF0 &&          // BEQ
              payload[i + 5] === 0x06 &&          // +6 (skip PHA/LDA/PHA/RTS)
              payload[i + 6] === 0xA9 &&          // LDA #hh
              payload[i + 8] === 0x48 &&          // PHA
              payload[i + 9] === 0xA9 &&          // LDA #ll
              payload[i + 11] === 0x48 &&         // PHA
              payload[i + 12] === 0x60) {         // RTS
            const flagAddr = payload[i + 1]
            const flagVal = payload[i + 3]
            const trampolineHi = payload[i + 7]
            const trampolineLo = payload[i + 10]
            const trampolineTarget = (trampolineHi << 8 | trampolineLo) + 1
            // Verify trampoline target is within the binary range
            if (trampolineTarget >= loadAddress && trampolineTarget < loadAddress + payload.length) {
              coldStartFlagAddr = flagAddr
              coldStartFlagValue = flagVal
              console.log(`[HDV Export] Cold-start check at $${(loadAddress + i).toString(16).toUpperCase()}: flag=$${flagAddr.toString(16).toUpperCase()}==$${flagVal.toString(16).toUpperCase()}, trampoline=$${trampolineTarget.toString(16).toUpperCase()}`)
              // Patch the binary: change LDA $xx to LDA #$yy so the cold-start
              // check always passes.  The zero-page flag may be overwritten by
              // the game during gameplay; the stub-only POKE would then fail on
              // subsequent demo/restart cycles.  A permanent binary patch avoids
              // this.  The checksum at $ACE7 covers $BDC1-$BDF2, well outside
              // this patch site, so it is unaffected.
              payload[i] = 0xA9       // LDA #imm  (was LDA zp)
              payload[i + 1] = flagVal // immediate value = expected flag value
              console.log(`[HDV Export] Patched cold-start: $${(loadAddress + i).toString(16).toUpperCase()}: LDA $${flagAddr.toString(16).toUpperCase()} → LDA #$${flagVal.toString(16).toUpperCase()}`)

              // Patch the trampoline target itself to RTS, as a safety net in
              // case any OTHER code path reaches it (e.g. a secondary protection
              // check).  The trampoline target typically contains a tight
              // infinite loop (JMP self) that hangs the game.
              const trapOffset = trampolineTarget - loadAddress
              if (trapOffset >= 0 && trapOffset < payload.length) {
                const oldByte = payload[trapOffset]
                payload[trapOffset] = 0x60   // RTS
                console.log(`[HDV Export] Patched death-trap at $${trampolineTarget.toString(16).toUpperCase()}: $${oldByte.toString(16).toUpperCase()} → $60 (RTS)`)
              }

              // Neutralise the anti-tamper checksum that protects the area
              // around the trampoline target.  Pattern:
              //   EOR $xxxx,X; DEX; BNE loop; EOR $xxxx; BNE fail; RTS
              // The checksum XORs a range of bytes and branches on failure.
              // During gameplay the game may use the checksummed area as
              // scratch data, causing the checksum to fail on subsequent calls.
              // We NOP the BNE-fail so the checksum always passes.
              for (let j = 0; j < payload.length - 10; j++) {
                // Look for: EOR abs,X (5D); DEX (CA); BNE loop (D0 FA);
                //           EOR abs (4D); BNE +1 (D0 01); RTS (60)
                if (payload[j] === 0x5D &&              // EOR $xxxx,X
                    payload[j + 3] === 0xCA &&          // DEX
                    payload[j + 4] === 0xD0 &&          // BNE (loop back)
                    payload[j + 5] === 0xFA &&          // relative offset -6
                    payload[j + 6] === 0x4D &&          // EOR $xxxx
                    // verify the EOR base addresses match
                    payload[j + 1] === payload[j + 7] &&
                    payload[j + 2] === payload[j + 8] &&
                    payload[j + 9] === 0xD0 &&          // BNE (fail)
                    payload[j + 11] === 0x60) {         // RTS
                  const checksumBase = payload[j + 1] | (payload[j + 2] << 8)
                  const failOffset = payload[j + 10]    // BNE relative offset
                  const checksumAddr = loadAddress + j
                  const bneAddr = loadAddress + j + 9
                  console.log(`[HDV Export] Anti-tamper checksum at $${checksumAddr.toString(16).toUpperCase()}: EOR base=$${checksumBase.toString(16).toUpperCase()}, BNE fail at $${bneAddr.toString(16).toUpperCase()} (+${failOffset})`)
                  // NOP the BNE so the checksum always passes
                  payload[j + 9] = 0xEA   // NOP
                  payload[j + 10] = 0xEA  // NOP
                  console.log(`[HDV Export] Patched checksum BNE → NOP NOP at $${bneAddr.toString(16).toUpperCase()}`)
                  break
                }
              }

              break
            }
          }
        }

        // Scan for secondary cold-start guards that use ORA with the flag byte:
        //   LDA $xx; ORA $flagAddr; CMP #$flagVal; BNE +1; RTS
        //   followed by ASL $addr; INC $addr+1; DEC $addr+2
        // Pattern: A5 xx 05 yy C9 zz D0 01 60 [0E aa bb EE aa+1 bb CE aa+2 bb]
        // These guards protect destructive self-modifying code loops that corrupt
        // the game binary.  The guard may be bypassed by alternate code paths
        // (e.g. via secondary JMP table entries), so we must also NOP the
        // self-modifying instructions (ASL/INC/DEC) to prevent corruption
        // regardless of which path reaches them.
        if (coldStartFlagAddr !== undefined && coldStartFlagValue !== undefined) {
          for (let i = 0; i < payload.length - 9; i++) {
            if (payload[i] === 0xA5 &&                          // LDA $xx
                payload[i + 2] === 0x05 &&                      // ORA $yy
                payload[i + 3] === coldStartFlagAddr &&         // yy = flagAddr
                payload[i + 4] === 0xC9 &&                      // CMP #$zz
                payload[i + 5] === coldStartFlagValue &&        // zz = flagVal
                payload[i + 6] === 0xD0 &&                      // BNE
                payload[i + 7] === 0x01 &&                      // +1
                payload[i + 8] === 0x60) {                      // RTS
              const addr = loadAddress + i
              const bneAddr = loadAddress + i + 6
              payload[i + 6] = 0xEA   // NOP (was BNE)
              payload[i + 7] = 0xEA   // NOP (was +1)
              console.log(`[HDV Export] Patched secondary cold-start guard at $${addr.toString(16).toUpperCase()}: BNE → NOP NOP at $${bneAddr.toString(16).toUpperCase()}`)

              // Also NOP the self-modifying code that follows the RTS:
              //   ASL $addr (0E); INC $addr+1 (EE); DEC $addr+2 (CE)
              // These corrupt the game binary and are reachable via alternate
              // code paths that bypass the guard entirely.
              if (i + 17 < payload.length &&
                  payload[i + 9] === 0x0E &&                    // ASL abs
                  payload[i + 12] === 0xEE &&                   // INC abs
                  payload[i + 15] === 0xCE) {                   // DEC abs
                const aslAddr = loadAddress + i + 9
                for (let k = 9; k < 18; k++) {
                  payload[i + k] = 0xEA  // NOP
                }
                console.log(`[HDV Export] Neutralised self-modifying code at $${aslAddr.toString(16).toUpperCase()}: ASL/INC/DEC → 9x NOP`)
              }
            }
          }
        }

        const blockCount = Math.ceil(payload.length / BLOCK_SIZE)
        directLoadByMenuIndex[i] = {
          binaryData: payload,
          loadAddress,
          entryAddress,
          blockCount,
          coldStartFlagAddr,
          coldStartFlagValue,
        }

        // Capture zero-page snapshot from floppy boot if a callback is provided.
        // This runs the original disk in the emulator at ludicrous speed,
        // captures ZP at the entry point, then restores the emulator state.
        if (zpCaptureCallback) {
          const zpSnapshot = await zpCaptureCallback(i, entryAddress)
          if (zpSnapshot) {
            directLoadByMenuIndex[i]!.zpSnapshot = zpSnapshot
            console.log(`[HDV Export] Captured ${zpSnapshot.length}-byte ZP snapshot for menu index ${i} at entry $${entryAddress.toString(16).toUpperCase()}`)
          }
        }

        menuProDosPrefixes[i] = undefined
        menuProDosCommands[i] = undefined
        continue
      }
      // If extraction failed despite classification, fall through to generic handling.
    }

    // DOS 3.3 disks are served as DOS.MASTER virtual volumes. Collect them for
    // contiguous partition installation (installDosMasterLikePartitions); leaving
    // them only as generic ProDOS files would leave DOS.MASTER's geometry table
    // pointing at an uninitialized partition area and crash on launch.
    const isDosVolume = kind === "dos" || file.type === PRODOS_FILE_TYPE_DOS_MASTER
    if (isDosVolume) {
      const normalized = makeUniqueProDosFilename(file.name, usedNames)
      const runtimeFile: BuildInputFile = { ...file, type: PRODOS_FILE_TYPE_DOS_MASTER, name: normalized }
      runtimeVolumeByMenuIndex[i] = runtimeVolumes.length + 1
      runtimeHelloModeByMenuIndex[i] = detectDosHelloLaunchMode(file.data)
      runtimeVolumes.push(runtimeFile)
      // DOS 3.3 disks are booted from the DOS.MASTER partition (by block, via its geometry
      // table), never as a ProDOS file. Writing a second ProDOS copy wasted a root directory
      // entry and ~280 blocks per disk, capping many-disk exports; it is not written anymore.
      menuProDosPrefixes[i] = undefined
      menuProDosCommands[i] = undefined
      continue
    }

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
          creationSortKey: extractedFile.creationSortKey,
        })
      }
      const launchCommand = detectProDosLaunchCommand(directoryFiles)
      directoryPlans.push({ name: directoryName, files: directoryFiles, sourceMenuIndex: i, launchCommand })
      menuProDosPrefixes[i] = directoryName
      menuProDosCommands[i] = launchCommand
      menuNeedsAliasShim[i] = proDosFilesNeedAliasShim(directoryFiles, extractedVolumeName)
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
            creationSortKey: extractedFile.creationSortKey,
          })
        }
        const launchCommand = detectProDosLaunchCommand(directoryFiles)
        directoryPlans.push({ name: directoryName, files: directoryFiles, sourceMenuIndex: i, launchCommand })
        menuProDosPrefixes[i] = directoryName
        menuProDosCommands[i] = launchCommand
        menuNeedsAliasShim[i] = proDosFilesNeedAliasShim(directoryFiles, extractedVolumeName)
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

  // If any DOS 3.3 volumes were collected, reserve DOS.MASTER volume 1 as a "dispatcher"
  // volume and shift the real disks to volumes 2..N+1. DOS.MASTER always cold-boots volume
  // 1 and runs its HELLO; the dispatcher's HELLO PEEKs the menu-selected volume number and
  // chains to that volume (see buildDosMasterDispatcherVolume / dosBootStatements), so each
  // menu disk boots its own volume instead of always booting the first one. The dispatcher
  // is a runtime partition volume only (not a ProDOS-visible output file).
  if (runtimeVolumes.length > 0) {
    runtimeVolumes.unshift({
      name: "DOSDISPATCH",
      type: PRODOS_FILE_TYPE_DOS_MASTER,
      data: buildDosMasterDispatcherVolume(),
    })
    for (let i = 0; i < runtimeVolumeByMenuIndex.length; i++) {
      const v = runtimeVolumeByMenuIndex[i]
      if (v !== undefined) runtimeVolumeByMenuIndex[i] = v + 1
    }
  }

  return { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes, menuNeedsAliasShim, runtimeVolumes, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, directLoadByMenuIndex }
}

// For DOS.MASTER-dispatched launches, choose how to invoke HELLO on the selected volume:
// 0 => RUN HELLO (Applesoft/Integer), 1 => BRUN HELLO (binary).
const detectDosHelloLaunchMode = (image: Uint8Array): number => {
  if (!isLikelyDos33Volume(image) || !dosLogicalImageHasValidCatalog(image)) return 0
  const { entries } = readDos33Catalog(image)
  const hello = entries.find((entry) => entry.name.toUpperCase() === "HELLO" && entry.sectorCount > 0)
  if (!hello) return 0
  return (hello.typeByte & 0x7f) === DOS33_TYPE_BINARY ? 1 : 0
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

// Resident MLI hook layout.
//
// The previous implementation kept the runtime hook at $6180 in main RAM. Any
// program loaded with BRUN at a fixed address (e.g. Robotron, $2DFD-$8FFC) would
// overwrite it, so the next MLI call after the load jumped into garbage and crashed.
//
// To survive arbitrary program loads, the resident runtime ("body") now lives in
// language-card bank 1 ($D000-$DFFF). ProDOS runs from bank 2 + $E000-$FFFF and does
// not use bank 1's $DA00-$DBFF, and the language card is never a program-load target.
// A tiny dispatcher ("trampoline") sits in an unused hole of the ProDOS global page
// ($BF72-$BF8C), which is always readable and is also never a program-load target.
// $BF00's MLI JMP vector is patched to point at the trampoline.
const ALIAS_BODY_ADDRESS = 0xDA00     // resident runtime, LC bank 1 ($DA00-$DBFF free)
// $BF74-$BF8C is an unused run in the ProDOS global page that survives program loads.
// (The adjacent odd bytes $BF71/$BF73 and $BF8D are used as scratch by ProDOS/DOS.MASTER,
// so the dispatcher is kept clear of them.)
const ALIAS_TRAMP_ADDRESS = 0xBF74    // dispatcher, ProDOS global-page hole
const ALIAS_ORIGVEC_ADDRESS = 0xBF80  // 2-byte saved original $BF01/$BF02 (same hole)

// Builds the resident runtime that rewrites absolute SET_PREFIX paths in-place to be
// rooted at /APPLE2TS. Assembled to execute at `base` (LC bank 1) and entered via
// "JSR body" from the trampoline, returning with RTS. It only reads/writes main RAM
// (zero page $06-$0B and the caller's path buffer) and never calls ROM, so it runs
// correctly while the language card is switched to read bank-1 RAM.
const buildAliasBody = (base: number): Uint8Array => {
  const code: number[] = []
  const emit = (...bytes: number[]) => code.push(...bytes)

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

  // The body is reached via "JSR body" from the trampoline, so the MLI caller's
  // return address (pointing at the inline SET_PREFIX parameters) is 2 bytes deeper
  // than for a direct entry: 9 register pushes + 2-byte JSR return = $010C/$010D.
  emit(0xBA)                              // TSX
  emit(0xBD, 0x0C, 0x01)                 // LDA $010C,X (return addr lo)
  emit(0x18); emit(0x69, 0x01)            // CLC, ADC #1
  emit(0x85, 0x06)                        // STA $06 (cmd ptr lo)
  emit(0xBD, 0x0D, 0x01)                 // LDA $010D,X (return addr hi)
  emit(0x69, 0x00)                        // ADC #0
  emit(0x85, 0x07)                        // STA $07 (cmd ptr hi)

  // Read command byte
  emit(0xA0, 0x00); emit(0xB1, 0x06)      // LDY #0, LDA ($06),Y
  emit(0xC9, 0xC6)                        // CMP #$C6
  emit(0xF0, 0x03)                        // BEQ +3 (skip JMP)
  const jmp1pos = code.length
  emit(0x4C, 0x00, 0x00)                  // JMP restore (patched later)

  // --- SET_PREFIX detected ---
  // Read param block ptr: cmd+1=lo, cmd+2=hi → $08/$09
  emit(0xA0, 0x01); emit(0xB1, 0x06); emit(0x85, 0x08)
  emit(0xA0, 0x02); emit(0xB1, 0x06); emit(0x85, 0x09)

  // Read pathname ptr from param block offset 1(lo), 2(hi) → $0A/$0B
  emit(0xA0, 0x01); emit(0xB1, 0x08); emit(0x85, 0x0A)
  emit(0xA0, 0x02); emit(0xB1, 0x08); emit(0x85, 0x0B)

  // Guard: empty path has no leading character, so pass through unchanged.
  emit(0xA0, 0x00); emit(0xB1, 0x0A) // LDY #0, LDA ($0A),Y (path length)
  emit(0xD0, 0x03) // BNE +3 (skip JMP)
  const jmpNoLeadingCharPos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore (patched later)

  // Read first pathname character (offset 1; offset 0 is length).
  emit(0xA0, 0x01); emit(0xB1, 0x0A) // LDY #1, LDA ($0A),Y

  // Check absolute path indicator: '/'
  emit(0xC9, 0x2F) // CMP #'/'
  emit(0xF0, 0x03) // BEQ +3 (skip JMP)
  const jmp2pos = code.length
  emit(0x4C, 0x00, 0x00) // JMP restore (patched later)

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

  const alreadyPrefixedContinueAddr = base + code.length

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
  const shiftLoopAddr = base + code.length
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

  // --- restore ---  (patch JMP placeholders)
  const restoreAddr = base + code.length
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
  code[jmpAlreadyPrefixedCheckSlashPos + 1] = (jmpAlreadyPrefixedRestoreLen9Pos + 3 + base) & 0xFF; code[jmpAlreadyPrefixedCheckSlashPos + 2] = ((jmpAlreadyPrefixedRestoreLen9Pos + 3 + base) >> 8) & 0xFF

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
  emit(0x60)                             // RTS (return to trampoline)

  return new Uint8Array(code)
}

// Builds the trampoline that $BF00 jumps to. It runs in the global page (main RAM,
// always readable). It switches the language card to read bank 1 so the body is
// visible, calls it, restores ROM read state, then chains to the real MLI.
//
// Restoring to "read ROM" is correct for every MLI caller in the exported volume
// (BASIC.SYSTEM, the Applesoft menu, and imported .SYSTEM programs all invoke the
// MLI with ROM enabled), matching the state the real MLI would otherwise restore.
const buildAliasTramp = (bodyBase: number, origVecAddr: number): Uint8Array => {
  return new Uint8Array([
    0x2C, 0x88, 0xC0,                                   // BIT $C088  (read RAM bank 1)
    0x20, bodyBase & 0xFF, (bodyBase >> 8) & 0xFF,      // JSR body
    0x2C, 0x82, 0xC0,                                   // BIT $C082  (read ROM)
    0x6C, origVecAddr & 0xFF, (origVecAddr >> 8) & 0xFF // JMP (origVector)
  ])
}

// Builds the one-shot installer (BRUN at $6000 from STARTUP). It copies the body
// into LC bank 1 and the trampoline into the global page, saves the original MLI
// vector, and patches $BF00's vector to the trampoline. `bodySrc`/`trampSrc` are the
// absolute main-RAM addresses where the embedded body/tramp data follow the installer.
const buildAliasInstaller = (
  bodySrc: number,
  trampSrc: number,
  bodyBase: number,
  trampBase: number,
  origVecAddr: number,
  bodyLen: number,
  trampLen: number,
): Uint8Array => {
  const code: number[] = []
  const emit = (...bytes: number[]) => code.push(...bytes)
  const lo = (a: number) => a & 0xFF
  const hi = (a: number) => (a >> 8) & 0xFF

  // Idempotency: if $BF01/$BF02 already point at the trampoline, do nothing.
  emit(0xAD, 0x01, 0xBF)        // LDA $BF01
  emit(0xC9, lo(trampBase))     // CMP #trampLo
  emit(0xD0, 0x08)              // BNE install
  emit(0xAD, 0x02, 0xBF)        // LDA $BF02
  emit(0xC9, hi(trampBase))     // CMP #trampHi
  emit(0xD0, 0x01)              // BNE install
  emit(0x60)                    // RTS (already installed)

  // install:
  // Save original MLI vector ($BF01/$BF02) → origVec slot.
  emit(0xAD, 0x01, 0xBF); emit(0x8D, lo(origVecAddr), hi(origVecAddr))
  emit(0xAD, 0x02, 0xBF); emit(0x8D, lo(origVecAddr + 1), hi(origVecAddr + 1))

  // Copy trampoline (< 256 bytes) → global page, descending Y index.
  emit(0xA0, trampLen - 1)                         // LDY #trampLen-1
  const tloop = code.length
  emit(0xB9, lo(trampSrc), hi(trampSrc))           // LDA trampSrc,Y
  emit(0x99, lo(trampBase), hi(trampBase))         // STA trampBase,Y
  emit(0x88)                                       // DEY
  emit(0x10, (tloop - (code.length + 2)) & 0xFF)   // BPL tloop

  // Copy body → LC bank 1. $C089 read twice = read ROM + write-enable bank 1, so we
  // can write bank-1 RAM without disturbing the ROM read state.
  emit(0xAD, 0x89, 0xC0)        // LDA $C089
  emit(0xAD, 0x89, 0xC0)        // LDA $C089
  emit(0xA9, lo(bodySrc)); emit(0x85, 0x06)        // src ptr → $06/$07
  emit(0xA9, hi(bodySrc)); emit(0x85, 0x07)
  emit(0xA9, lo(bodyBase)); emit(0x85, 0x08)       // dst ptr → $08/$09
  emit(0xA9, hi(bodyBase)); emit(0x85, 0x09)
  emit(0xA9, lo(bodyLen)); emit(0x85, 0x0A)        // remaining count → $0A/$0B
  emit(0xA9, hi(bodyLen)); emit(0x85, 0x0B)
  emit(0xA0, 0x00)                                 // LDY #0
  const bloop = code.length
  emit(0xA5, 0x0A); emit(0x05, 0x0B)               // LDA $0A; ORA $0B
  const bdoneBranchPos = code.length
  emit(0xF0, 0x00)                                 // BEQ bdone (patched)
  emit(0xB1, 0x06)                                 // LDA ($06),Y
  emit(0x91, 0x08)                                 // STA ($08),Y
  emit(0xE6, 0x06); emit(0xD0, 0x02); emit(0xE6, 0x07) // INC $06; BNE +2; INC $07
  emit(0xE6, 0x08); emit(0xD0, 0x02); emit(0xE6, 0x09) // INC $08; BNE +2; INC $09
  emit(0xA5, 0x0A); emit(0xD0, 0x02); emit(0xC6, 0x0B) // LDA $0A; BNE +2; DEC $0B
  emit(0xC6, 0x0A)                                 // DEC $0A
  emit(0x4C, lo(ALIAS_SHIM_LOAD_ADDRESS + bloop), hi(ALIAS_SHIM_LOAD_ADDRESS + bloop)) // JMP bloop
  // bdone:
  code[bdoneBranchPos + 1] = (code.length - (bdoneBranchPos + 2)) & 0xFF
  emit(0x2C, 0x82, 0xC0)        // BIT $C082 (read ROM, write protect)

  // Patch $BF00's MLI vector to the trampoline.
  emit(0xA9, lo(trampBase)); emit(0x8D, 0x01, 0xBF)
  emit(0xA9, hi(trampBase)); emit(0x8D, 0x02, 0xBF)
  emit(0x60)                    // RTS

  return new Uint8Array(code)
}

const createAliasShimBinary = (loadAddress = ALIAS_SHIM_LOAD_ADDRESS) => {
  const bodyBase = ALIAS_BODY_ADDRESS
  const trampBase = ALIAS_TRAMP_ADDRESS
  const origVecAddr = ALIAS_ORIGVEC_ADDRESS

  const body = buildAliasBody(bodyBase)
  const tramp = buildAliasTramp(bodyBase, origVecAddr)

  if (body.length > 0x200) {
    throw new Error(`A2TSALIAS body too large for LC bank-1 slot: ${body.length}`)
  }
  if (trampBase + tramp.length - 1 > ALIAS_ORIGVEC_ADDRESS) {
    throw new Error(`A2TSALIAS trampoline overlaps origVector slot: ${tramp.length}`)
  }

  // The installer's length is independent of the (2-/3-byte) operand values, so
  // assemble once to measure, then again with the real embedded-data addresses.
  const installerLen = buildAliasInstaller(0, 0, bodyBase, trampBase, origVecAddr, body.length, tramp.length).length
  const bodySrc = loadAddress + installerLen
  const trampSrc = bodySrc + body.length
  const installer = buildAliasInstaller(bodySrc, trampSrc, bodyBase, trampBase, origVecAddr, body.length, tramp.length)

  const out = new Uint8Array(installer.length + body.length + tramp.length)
  out.set(installer, 0)
  out.set(body, installer.length)
  out.set(tramp, installer.length + body.length)
  return out
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
    const dirBlock = readBlock(disk, blockNum)
    if (!dirBlock) continue
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

  block[headerOffset + 16] = 0x75
  writeLittleEndian16(block, headerOffset + 17, 0)
  writeLittleEndian16(block, headerOffset + 19, 0)
  writeLittleEndian24(block, headerOffset + 21, 0)
  block[headerOffset + 31] = 0x27
  block[headerOffset + 32] = 0x0D
  writeLittleEndian16(block, headerOffset + 33, fileCount)
  writeLittleEndian16(block, headerOffset + 35, parentBlock)
  block[headerOffset + 37] = (parentSlot + 1) & 0xFF
  block[headerOffset + 38] = 0x27

  // Diagnostic: dump critical header bytes to verify ProDOS layout
  const hdrBytes = Array.from(block.slice(headerOffset, headerOffset + 39))
    .map(b => b.toString(16).padStart(2, '0')).join(' ')
  console.log(`[HDV SubdirHeader] "${dirname}" parentBlock=${parentBlock} parentSlot=${parentSlot} fileCount=${fileCount}`)
  console.log(`[HDV SubdirHeader] Raw header bytes: ${hdrBytes}`)
  console.log(`[HDV SubdirHeader] +24-30 (date/ver/access): ${Array.from(block.slice(headerOffset + 24, headerOffset + 31)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(' ')}`)
  console.log(`[HDV SubdirHeader] +31=entryLen:0x${block[headerOffset + 31].toString(16)} +32=entriesPerBlk:0x${block[headerOffset + 32].toString(16)} +33-34=fileCount:${block[headerOffset + 33] | (block[headerOffset + 34] << 8)} +35-36=parentPtr:${block[headerOffset + 35] | (block[headerOffset + 36] << 8)} +37=parentEntry:${block[headerOffset + 37]} +38=parentEntryLen:0x${block[headerOffset + 38].toString(16)}`)

  return block
}

const BLOCK_SIZE = 512
const ROOT_DIR_BLOCK = 2
const DIR_HEADER_SIZE = 4
const DIR_ENTRY_SIZE = 39
const DIR_ENTRIES_PER_BLOCK = 13

// Per-disk screenshots live in this subdirectory instead of the volume root. The ProDOS
// volume directory is a fixed 4-block area (~51 entries), so keeping one root entry per
// screenshot capped exports at ~21 disks. Grouping them under one subdirectory keeps root
// usage constant regardless of disk count. The menu BLOADs them via this relative path.
const SCREENSHOT_SUBDIR = "SHOTS"

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
    const dir = readBlock(disk, block)
    if (!dir) break
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
    const dirBlock = readBlock(disk, block)
    if (!dirBlock) continue
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

const scanRootDirectory = (disk: Uint8Array, dirBlocks: number[]) => {
  let fileCount = 0
  const existingNames = new Set<string>()
  let hasDos33 = false
  let hasDos33System = false
  let hasDosMaster = false
  let hasDosmaster = false
  for (let b = 0; b < dirBlocks.length; b++) {
    const block = dirBlocks[b]
    const dirBlock = readBlock(disk, block)
    if (!dirBlock) continue
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
      const dirBlock = readBlock(disk, block)
      if (!dirBlock) continue
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

  // Prefer DOS.3.3 runtime launcher. The DOS.MASTER front-end binary is not directly
  // runnable in this flow and has been observed to drop to the monitor ($9D88) on some
  // exports; the DOS.3.3 image installed by DOS.MASTER boots cleanly instead.
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

// ===== DOS.MASTER virtual-volume support (ported from commit 05cc1999) =====
const DOSMASTER_SLOT = 7

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
      const dirBlock = readBlock(disk, block)
      if (!dirBlock) continue
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
      const dirBlock = readBlock(disk, block)
      if (!dirBlock) continue
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
      devPairsBefore.push(`P${pair}:$${patched[TABLE_DEV_OFFSET + pair * 2].toString(16).padStart(2, "0")}$${patched[TABLE_DEV_OFFSET + pair * 2 + 1].toString(16).padStart(2, "0")}`)
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
  // ADRS table (REVISE.DM): the per-pair firmware-page byte DOS.MASTER's RWTS calls
  // to reach the device lives at TABLE_FIRMWARE_PAGE_OFFSET + pairIndex + 1 and holds
  // $C0 + slot (e.g. $C7 for slot 7). See REVISE.DM line 580: POKE ADRS+INT(D/2)+1,$C0+T.
  const TABLE_FIRMWARE_PAGE_OFFSET = 0x60

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
  // DOS.INSTALL bakes the target ProDOS unit(s) into the config DEV table. The
  // base image ships configured for slot 7 ($70 drive 1 / $F0 drive 2). To let
  // the export target an arbitrary slot (so the HDV boots on whatever slot the
  // user mounts it in), overwrite DEV pair 0 with the chosen slot's unit pair
  // below and drive DOS.MASTER's geometry off that pair. For slot 7 this
  // reproduces the base image's default configuration exactly.
  const deviceIndex = 0
  const pairOffset = 0
  const drive1Unit = (slot & 0x07) << 4
  const drive2Unit = drive1Unit | 0x80
  const readWord = (payload: Uint8Array, offset: number) => payload[offset] | (payload[offset + 1] << 8)
  const writeWord = (payload: Uint8Array, offset: number, value: number) => {
    payload[offset] = value & 0xFF
    payload[offset + 1] = (value >> 8) & 0xFF
  }

  const volumeSizeBlocks = readWord(primaryPayload, TABLE_VOL_SIZE_OFFSET + pairOffset)
  if (volumeSizeBlocks <= 0 || volumeSizeBlocks > 1600) {
    return { error: `Invalid DOS volume size in config table: ${volumeSizeBlocks}.` }
  }

  // DOS.MASTER derives the number of exposed volumes from the config as
  //   NUMVOLS = floor((NUMBLKS - config_FIRST - VOLSIZ) / VOLSIZ)
  // where config_FIRST is the value written to the FIRST table below and DOS.MASTER's
  // volume N lives at config_FIRST + N*VOLSIZ (the config_FIRST..config_FIRST+VOLSIZ slot is
  // reserved). To expose EXACTLY runtimeVolumes.length volumes (no phantom volumes whose
  // zero-filled VTOC would give "I/O ERROR"), set config_FIRST so NUMVOLS === N:
  //   config_FIRST = totalBlocks - (N + 1) * VOLSIZ
  // This places the volumes flush against the top of the disk; the reserved area is marked
  // used in the bitmap below. (For N=2 this equals the proven default base of 64695.)
  const firstBaseBlock = totalBlocks - (runtimeVolumes.length + 1) * volumeSizeBlocks
  if (firstBaseBlock <= 0) {
    return { error: `Not enough space to install ${runtimeVolumes.length} DOS volumes of ${volumeSizeBlocks} blocks each (total=${totalBlocks}).` }
  }
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
    patched[TABLE_DEV_OFFSET + 0] = drive1Unit
    patched[TABLE_DEV_OFFSET + 1] = drive2Unit
    // REVISE.DM (manual section 9) also rewrites the per-pair firmware-page byte that
    // DOS.MASTER's RWTS jumps to when reaching the device (config offset ADRS+pair+1).
    // The base image ships this as $C7 (slot 7); leaving it stale makes DOS.MASTER call
    // $C7xx regardless of the DEV table, which faults (crash at ~$C7xx) on any machine
    // where the HDV is not on slot 7. Rewrite it to $C0+slot for the active pair, mirroring
    // REVISE.DM line 580. Only touch a byte that already looks like a firmware page ($C0-$C7).
    const firmwarePageOffset = TABLE_FIRMWARE_PAGE_OFFSET + deviceIndex + 1
    if (firmwarePageOffset < patched.length && (patched[firmwarePageOffset] & 0xF8) === 0xC0) {
      patched[firmwarePageOffset] = 0xC0 | (slot & 0x07)
    }
    writeWord(patched, TABLE_FIRST_OFFSET + (deviceIndex * 2), firstBaseBlock)
    writeWord(patched, TABLE_NUM_BLOCKS_OFFSET + pairOffset, partitionBlocks)
    writeFileDataToProDosImage(disk, target.location, patched)
  }

  for (let block = firstBaseBlock; block < partitionBlocks; block++) {
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

// Locates a root-directory file entry by name and returns its on-disk storage descriptor
// (storage type, key block, and EOF length). Used to overwrite a base-image system file in
// place. Directories (storage type $0D) and empty slots are skipped.
const findRootFileEntry = (
  disk: Uint8Array,
  dirBlocks: number[],
  fileName: string,
): { storageType: 1 | 2 | 3; keyBlock: number; eof: number } | undefined => {
  for (let b = 0; b < dirBlocks.length; b++) {
    const block = dirBlocks[b]
    const dirBlock = readBlock(disk, block)
    if (!dirBlock) continue
    const startIndex = b === 0 ? 1 : 0
    for (let slot = startIndex; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
      const entryOffset = getDirEntryOffset(slot)
      const byte0 = dirBlock[entryOffset]
      if (isDirectorySlotFree(byte0)) continue
      const storageType = (byte0 >> 4) & 0x0F
      if (storageType < 1 || storageType > 3) continue
      const entry = dirBlock.slice(entryOffset, entryOffset + DIR_ENTRY_SIZE)
      if (readDirectoryEntryName(entry) !== fileName) continue
      return {
        storageType: storageType as 1 | 2 | 3,
        keyBlock: readLittleEndian16(entry, 17),
        eof: readLittleEndian24(entry, 21),
      }
    }
  }
  return undefined
}

// Overwrites an existing ProDOS file's data blocks in place with newData, walking the same
// seedling/sapling/tree block structure as readFileDataFromProDosImage. The caller must
// ensure newData.length equals the file's EOF so the existing block layout is reused exactly
// (no allocation or directory changes). Each written block is zero-padded past the copied
// bytes. Returns true when all bytes were written.
const overwriteProDosFileData = (
  disk: Uint8Array,
  storageType: 1 | 2 | 3,
  keyBlock: number,
  newData: Uint8Array,
): boolean => {
  const eof = newData.length
  let pos = 0
  const writeBlock = (blockNum: number) => {
    if (pos >= eof || blockNum === 0) return
    const n = Math.min(BLOCK_SIZE, eof - pos)
    const offset = blockNum * BLOCK_SIZE
    if (offset < 0 || offset + BLOCK_SIZE > disk.length) return
    disk.set(newData.subarray(pos, pos + n), offset)
    if (n < BLOCK_SIZE) disk.fill(0, offset + n, offset + BLOCK_SIZE)
    pos += n
  }

  if (storageType === 1) {
    writeBlock(keyBlock)
    return pos >= eof
  }

  if (storageType === 2) {
    const indexBlock = readBlock(disk, keyBlock)
    if (!indexBlock) return false
    for (let i = 0; i < 256 && pos < eof; i++) {
      const blockNum = indexBlock[i] | (indexBlock[256 + i] << 8)
      if (blockNum === 0) {
        pos += Math.min(BLOCK_SIZE, eof - pos)
        continue
      }
      writeBlock(blockNum)
    }
    return pos >= eof
  }

  const masterBlock = readBlock(disk, keyBlock)
  if (!masterBlock) return false
  for (let i = 0; i < 256 && pos < eof; i++) {
    const indexBlockNum = masterBlock[i] | (masterBlock[256 + i] << 8)
    if (indexBlockNum === 0) {
      pos += Math.min(BLOCK_SIZE * 256, eof - pos)
      continue
    }
    const indexBlock = readBlock(disk, indexBlockNum)
    if (!indexBlock) continue
    for (let j = 0; j < 256 && pos < eof; j++) {
      const blockNum = indexBlock[j] | (indexBlock[256 + j] << 8)
      if (blockNum === 0) {
        pos += Math.min(BLOCK_SIZE, eof - pos)
        continue
      }
      writeBlock(blockNum)
    }
  }
  return pos >= eof
}

// The base HDV template (dosmaster18.po) ships with ProDOS 8 v2.0.3. Some ProDOS games are
// unstable under 2.0.3 (e.g. interrupt-driven / language-card titles), so we upgrade the
// kernel by copying PRODOS and BASIC.SYSTEM from ProDOS 2.4.3.po over the base's identically
// sized copies. Equal byte length => identical block layout, so the base's existing blocks are
// reused and the directory/volume bitmap are never touched. Best-effort: if the upgrade disk
// can't be loaded, or a file is missing or a different size, the base 2.0.3 version is kept.
const upgradeBaseProDosToLatest = async (hdv: Uint8Array, dirBlocks: number[]): Promise<void> => {
  const UPGRADE_FILE_NAMES = ["PRODOS", "BASIC.SYSTEM"]
  let upgradeSource: Uint8Array
  try {
    const response = await fetch("disks/ProDOS%202.4.3.po")
    if (!response.ok) return
    upgradeSource = new Uint8Array(await response.arrayBuffer())
  } catch (e) {
    console.warn("[HDV Export] Could not load ProDOS 2.4.3.po; keeping base ProDOS version.", e)
    return
  }

  const upgradeFiles = extractProDosFilesRecursive(upgradeSource)
  for (const targetName of UPGRADE_FILE_NAMES) {
    const replacement = upgradeFiles.find((f) => !f.relativePath && f.name === targetName)
    if (!replacement) continue
    const existing = findRootFileEntry(hdv, dirBlocks, targetName)
    if (!existing) continue
    // In-place overwrite requires an exact size match so the existing block layout fits.
    if (existing.eof !== replacement.data.length) {
      console.warn(`[HDV Export] Skipping ${targetName} upgrade: size ${replacement.data.length} != base ${existing.eof}.`)
      continue
    }
    overwriteProDosFileData(hdv, existing.storageType, existing.keyBlock, replacement.data)
  }
}

export const buildProDosHdv = async (
  files: Array<{ name: string; type: number; data: Uint8Array; auxType?: number }>,
  volumeName = "APPLE2TS",
  prodos243Base?: Uint8Array,
  menuEntries?: MenuDiskEntry[],
  dosMasterSlot: number = DOSMASTER_SLOT,
  zpCaptureCallback?: (menuIndex: number, entryAddress: number) => Promise<Uint8Array | null>,
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

  // Upgrade the base image's ProDOS 8 kernel (and BASIC.SYSTEM) to 2.4.3 in place before
  // importing disks, for better compatibility with some ProDOS games. Best-effort; keeps
  // the base version if the upgrade disk is unavailable.
  await upgradeBaseProDosToLatest(hdv, dirBlocks)

  const rootHeader = new Uint8Array(hdv.buffer, ROOT_DIR_BLOCK * BLOCK_SIZE, BLOCK_SIZE)
  const volumeEntryOffset = getDirEntryOffset(0)

  // Keep existing files from the base image intact.
  const rootScan = scanRootDirectory(hdv, dirBlocks)
  const dosRuntimeLauncher = rootScan.dosRuntimeLauncher
  // Reserve the screenshot subdirectory name so imported ProDOS volumes can't collide with it.
  rootScan.existingNames.add(SCREENSHOT_SUBDIR)
  // Reserve helper-program subdirectory name to avoid root-path exhaustion.
  rootScan.existingNames.add(HELPER_SUBDIR)
  const { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes, menuNeedsAliasShim, runtimeVolumes, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, directLoadByMenuIndex } = await preprocessInputFilesForMenu(files, menuEntries, rootScan.existingNames, zpCaptureCallback)
  let fileCount = rootScan.fileCount
  const currentTotalBlocks = readLittleEndian16(rootHeader, volumeEntryOffset + 37)
  const bitmapStartBlock = readLittleEndian16(rootHeader, volumeEntryOffset + 35)

  // Install DOS 3.3 images as DOS.MASTER virtual volumes BEFORE generic block
  // allocation: patch DOS.MASTER's geometry/config table, reserve the partition
  // blocks in the volume bitmap, and write each DOS volume contiguously at the
  // blocks DOS.MASTER expects. Skipping this (the regression in commit 97598b0e)
  // left DOS.MASTER reading an uninitialized partition area and crashing at boot.
  const dosMasterPatchResult = patchDosMasterDos33Configuration(hdv, runtimeVolumes.length)
  if ("error" in dosMasterPatchResult) {
    throw new Error(`Failed to patch DOS.MASTER runtime configuration: ${dosMasterPatchResult.error}`)
  }
  const dosInstallResult = installDosMasterLikePartitions(hdv, runtimeVolumes, currentTotalBlocks, bitmapStartBlock, dosMasterSlot, 1)
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

  // Allocate a contiguous run of free blocks. Required for direct-load binaries
  // where the stub reads sequentially from startBlock.
  const allocateContiguousFreeBlocks = (count: number): number[] => {
    let runStart = -1
    let runLength = 0
    for (let block = 0; block < currentTotalBlocks; block++) {
      if (isBlockFreeInBitmap(hdv, bitmapStartBlock, block)) {
        if (runLength === 0) runStart = block
        runLength++
        if (runLength >= count) {
          const allocated: number[] = []
          for (let i = 0; i < count; i++) {
            setBlockUsedInBitmap(hdv, bitmapStartBlock, runStart + i)
            allocated.push(runStart + i)
          }
          return allocated
        }
      } else {
        runLength = 0
      }
    }
    throw new Error(`Not enough contiguous free blocks. Need ${count}, largest run: ${runLength}.`)
  }

  const normalizedVolumeName = volumeName.toUpperCase().slice(0, 15)
  const volumeNameLength = normalizedVolumeName.length
  rootHeader[volumeEntryOffset] = 0xF0 | volumeNameLength
  for (let i = 0; i < 15; i++) {
    rootHeader[volumeEntryOffset + 1 + i] = i < volumeNameLength ? normalizedVolumeName.charCodeAt(i) : 0
  }

  const withStartup = [...outputFiles]
  const helperFiles: BuildInputFile[] = []
  // Copy the alias shim file onto the HDV only when at least one imported ProDOS disk
  // hardcodes an absolute "/VOLUME/..." path the shim can rewrite (menuNeedsAliasShim; see
  // proDosFilesNeedAliasShim). It is NOT installed at boot: the menu BRUNs it per-launch,
  // only before a ProDOS disk that needs it. DOS images never install it (so DOS.MASTER can
  // reclaim the language card where the shim's resident hook lives), and ProDOS disks that
  // use only relative or runtime-built paths skip it too (so interrupt/language-card games
  // and disks like Undead aren't destabilized by an unnecessary MLI hook).
  const includeAliasShimFile = menuNeedsAliasShim.some(Boolean)
  const hasDirectLoadEntries = directLoadByMenuIndex.some(Boolean)

  const launcherName = "A2TSLAUNCH"
  helperFiles.push({
    name: launcherName,
    type: PRODOS_FILE_TYPE_BINARY,
    data: createLauncherBinary(),
    auxType: 0x2000,
  })

  if (includeAliasShimFile) {
    helperFiles.push({
      name: "A2TSAL3",
      type: PRODOS_FILE_TYPE_BINARY,
      data: createAliasShimBinary(ALIAS_SHIM_LOAD_ADDRESS),
      auxType: ALIAS_SHIM_LOAD_ADDRESS,
    })
  }

  // Include the direct block-load stub as a helper binary when any menu entry
  // needs it. The Applesoft launcher BLOADs it to $0300, POKEs parameters, and
  // CALLs 768 to load the game binary directly from raw HDV blocks.
  if (hasDirectLoadEntries) {
    const stub = buildDirectLoadStub()
    const stubEnd = DIRECT_LOAD_STUB_ADDRESS + stub.code.length
    console.log(`[HDV Export] Stub size=${stub.code.length} bytes, range=$${DIRECT_LOAD_STUB_ADDRESS.toString(16).toUpperCase()}-$${stubEnd.toString(16).toUpperCase()}, paramOffset=${stub.paramOffset}, zpFlagOffset=${stub.zpFlagOffset}${stubEnd > 0x03D0 ? ' *** WARNING: overlaps $03D0 vectors! ***' : ''}`)
    helperFiles.push({
      name: "A2TSDL",
      type: PRODOS_FILE_TYPE_BINARY,
      data: stub.code,
      auxType: DIRECT_LOAD_STUB_ADDRESS,
    })
    // Per-disk zero-page snapshot files: each dosdirect entry with a captured
    // zpSnapshot gets a binary file named "A2TSZPn" (n = 1-based menu index).
    // The Applesoft launcher BLOADs it into the input buffer at $0200.
    for (let i = 0; i < directLoadByMenuIndex.length; i++) {
      const dl = directLoadByMenuIndex[i]
      if (dl?.zpSnapshot) {
        const zpName = `A2TSZP${i + 1}`
        console.log(`[HDV Export] Adding ZP snapshot helper file: ${zpName}, size=${dl.zpSnapshot.length}, first4=[${Array.from(dl.zpSnapshot.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')}]`)
        helperFiles.push({
          name: zpName,
          type: PRODOS_FILE_TYPE_BINARY,
          data: dl.zpSnapshot,
          auxType: 0x0200,
        })
      }
    }
  }

  // Generate STARTUP: interactive menu if menuEntries provided, else simple CATALOG
  let startupText: string
  const aliasShimInstallCommand = `BRUN /${normalizedVolumeName}/${HELPER_SUBDIR}/A2TSAL3`
  if (menuEntries && menuEntries.length > 0) {
    // The menu installs the shim per-launch (only before ProDOS disks), so STARTUP
    // must NOT install it globally.
    startupText = generateInteractiveMenuStartup(menuEntries, HELPER_SUBDIR)
  } else {
    // Non-interactive fallback has no DOS.MASTER launch, so a boot-time install is safe.
    startupText = `${includeAliasShimFile ? `${aliasShimInstallCommand}\r` : ""}BRUN ${HELPER_SUBDIR}/${launcherName}\rCATALOG\r`
  }
  
  withStartup.unshift({
    name: "STARTUP",
    type: PRODOS_FILE_TYPE_TEXT,
    data: new TextEncoder().encode(startupText),
    auxType: 0x0000,
  })

  // Pre-allocate blocks for direct-load binaries so their start block numbers
  // are known before the MENULAUNCH program is generated. The binary data is
  // written to these blocks later (after all ProDOS files are written).
  // Must be contiguous because the stub reads sequentially from startBlock.
  const directLoadBlockAllocations: Array<{ blocks: number[]; entryIndex: number }> = []

  if (menuEntries && menuEntries.length > 0) {
    for (let i = 0; i < directLoadByMenuIndex.length; i++) {
      const dl = directLoadByMenuIndex[i]
      if (!dl) continue
      const blocks = allocateContiguousFreeBlocks(dl.blockCount)
      dl.startBlock = blocks[0]
      directLoadBlockAllocations.push({ blocks, entryIndex: i })
    }

    helperFiles.push({
      name: "MENUSRC",
      type: 0xFC,
      data: tokenizeApplesoftBasic(generateMenuSourceProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes, HELPER_SUBDIR, includeAliasShimFile ? aliasShimInstallCommand : undefined, runtimeVolumeByMenuIndex, menuNeedsAliasShim)),
      auxType: 0x0801,
    })
    helperFiles.push({
      name: "MENULAUNCH",
      type: 0xFC,
      data: tokenizeApplesoftBasic(generateMenuLaunchProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes, HELPER_SUBDIR, includeAliasShimFile ? aliasShimInstallCommand : undefined, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, menuNeedsAliasShim, directLoadByMenuIndex)),
      auxType: 0x0801,
    })
  }

  if (helperFiles.length > 0) {
    console.log(`[HDV Export] Helper files in ${HELPER_SUBDIR}/: ${helperFiles.map(f => `${f.name}(${f.data.length}B)`).join(', ')}`)
    directoryPlans.push({ name: HELPER_SUBDIR, files: helperFiles, sourceMenuIndex: -1 })
  }

  // Track screenshot files for later metadata creation. Screenshots go into a dedicated
  // subdirectory (SCREENSHOT_SUBDIR) rather than the volume root: one root entry for the
  // whole group instead of one per disk, so exports scale to many disks. The menu BLOADs
  // them via the relative "SHOTS/SCREENnn" path (see generateMenuSourceProgram).
  const screenshotNames: Set<string> = new Set()
  const screenshotFiles: BuildInputFile[] = []
  if (menuEntries && menuEntries.length > 0) {
    for (let i = 0; i < menuEntries.length; i++) {
      const entry = menuEntries[i]
      if (entry.screenshotData && entry.screenshotData.length > 0) {
        const screenshotName = `SCREEN${String(i + 1).padStart(2, "0")}`
        screenshotNames.add(screenshotName)
        screenshotFiles.push({
          name: screenshotName,
          type: PRODOS_FILE_TYPE_BINARY,
          data: entry.screenshotData,
          auxType: 0x2000,
        })
      }
    }
  }
  if (screenshotFiles.length > 0) {
    directoryPlans.push({ name: SCREENSHOT_SUBDIR, files: screenshotFiles, sourceMenuIndex: -1 })
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

    if (file.name.startsWith("A2TSZP")) {
      console.log(`[HDV Export] Allocated ZP file plan: ${file.name}, storageType=${storageType}, keyBlock=${keyBlock}, blocksUsed=${blocksUsed}, dataBlocks=[${dataBlocks.join(',')}], dataLen=${file.data.length}`)
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
        // Re-apply linked-list pointers: header synthesis initializes these to 0,
        // but multi-block directories must preserve prev/next chain links.
        writeLittleEndian16(currentBlock, 0, prevBlock)
        writeLittleEndian16(currentBlock, 2, nextBlock)
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
      ROOT_DIR_BLOCK,
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
      ROOT_DIR_BLOCK,
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
        node.keyBlock,
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
        node.keyBlock,
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

  // Write direct-load binary data to their pre-allocated blocks.
  for (const alloc of directLoadBlockAllocations) {
    const dl = directLoadByMenuIndex[alloc.entryIndex]
    if (!dl) continue
    for (let i = 0; i < alloc.blocks.length; i++) {
      const blockNumber = alloc.blocks[i]
      const writeOffset = blockNumber * BLOCK_SIZE
      const sourceOffset = i * BLOCK_SIZE
      const sourceEnd = Math.min(sourceOffset + BLOCK_SIZE, dl.binaryData.length)
      if (sourceOffset < dl.binaryData.length) {
        newHdv.set(dl.binaryData.slice(sourceOffset, sourceEnd), writeOffset)
      }
    }
    const isContiguous = alloc.blocks.every((b, i) => i === 0 || b === alloc.blocks[i - 1] + 1)
    const first16 = Array.from(dl.binaryData.slice(0, 16)).map(b => b.toString(16).padStart(2, '0')).join(' ')
    console.log(`[HDV Export] Direct-load binary: startBlock=${dl.startBlock}, blocks=${dl.blockCount}, loadAddr=$${dl.loadAddress.toString(16)}, entryAddr=$${dl.entryAddress.toString(16)}, dataLen=${dl.binaryData.length}, contiguous=${isContiguous}, first16=[${first16}]`)
  }

  // === POST-BUILD VERIFICATION ===
  // Verify that every A2TSZP file referenced in the DATA (Z(I)=1) is actually
  // readable on the generated ProDOS volume.  A mismatch here would cause
  // I/O ERROR at runtime (line 263 in MENULAUNCH).

  // Dump A2TSHLP subdirectory block header for debugging
  const helperNode = rootDirectoryNodes.find(n => (n.normalizedName || n.name) === HELPER_SUBDIR)
  if (helperNode && helperNode.keyBlock > 0) {
    const hlpBlock = readBlock(newHdv, helperNode.keyBlock)
    if (hlpBlock) {
      const hdr50 = Array.from(hlpBlock.slice(0, 50)).map(b => b.toString(16).padStart(2, '0')).join(' ')
      console.log(`[HDV Verify] A2TSHLP block ${helperNode.keyBlock} header (bytes 0-49): ${hdr50}`)
      const entryLen = hlpBlock[4 + 31]
      const entriesPerBlock = hlpBlock[4 + 32]
      const fileCount = hlpBlock[4 + 33] | (hlpBlock[4 + 34] << 8)
      console.log(`[HDV Verify] A2TSHLP parsed: entry_length=$${entryLen.toString(16)}, entries_per_block=$${entriesPerBlock.toString(16)}, file_count=${fileCount}`)
      // Also dump entry 3 (slot 3 = A2TSZP1 if it's 3rd file)
      for (let s = 1; s <= 5; s++) {
        const off = 4 + s * 39
        const st = (hlpBlock[off] >> 4) & 0xF
        const nl = hlpBlock[off] & 0xF
        const name = String.fromCharCode(...Array.from(hlpBlock.slice(off + 1, off + 1 + nl)))
        const kp = hlpBlock[off + 17] | (hlpBlock[off + 18] << 8)
        const eof = hlpBlock[off + 21] | (hlpBlock[off + 22] << 8) | (hlpBlock[off + 23] << 16)
        console.log(`[HDV Verify] A2TSHLP slot ${s}: st=${st} name="${name}" keyBlock=${kp} eof=${eof}`)
      }
    }
  }

  for (let i = 0; i < directLoadByMenuIndex.length; i++) {
    const dl = directLoadByMenuIndex[i]
    if (!dl?.zpSnapshot) continue
    const zpName = `A2TSZP${i + 1}`
    const found = findFileByPath(newHdv, [HELPER_SUBDIR, zpName])
    if (!found) {
      console.error(`[HDV Export] *** VERIFICATION FAILED: ${HELPER_SUBDIR}/${zpName} NOT FOUND on generated volume! Z(${i + 1})=1 but file is missing. ***`)
      continue
    }
    const fileData = readFileDataFromProDosImage(newHdv, found.storageType as 1 | 2 | 3, found.keyBlock, found.eof)
    const match = fileData.length === dl.zpSnapshot.length && fileData.every((b, j) => b === dl.zpSnapshot![j])
    console.log(`[HDV Export] Verify ${HELPER_SUBDIR}/${zpName}: storageType=${found.storageType}, keyBlock=${found.keyBlock}, eof=${found.eof}, dataLen=${fileData.length}, match=${match}, first4=[${Array.from(fileData.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join(' ')}]`)
    if (!match) {
      console.error(`[HDV Export] *** VERIFICATION FAILED: ${HELPER_SUBDIR}/${zpName} data mismatch! Expected ${dl.zpSnapshot.length} bytes, got ${fileData.length}. ***`)
    }
  }

  return newHdv
}

export const PRODOS_FILE_TYPE_BINARY = 0x06
export const PRODOS_FILE_TYPE_TEXT = 0x04
export const PRODOS_FILE_TYPE_LIBRARY = 0xE0
// DOS.MASTER volumes are commonly represented as file type $F1 on ProDOS volumes.
export const PRODOS_FILE_TYPE_DOS_MASTER = 0xF1

// Bump this whenever new VTOC detection logic is introduced (e.g. new exportable
// categories). Cached VTOC results older than this version are re-evaluated so
// disks previously classified as non-exportable can be reclassified.
export const VTOC_REFRESH = 4

