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
  imageKind?: "dos" | "prodos" | "unknown" | "4cade"
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

type FourCadeDiskMetadata = {
  menuIndex: number
  binaryData: Uint8Array  // raw game binary (no 4-byte DOS header)
  loadAddress: number
  binaryLength: number
  entryAddress: number    // actual code entry point (may differ from loadAddress)
  capturedZeroPage?: Uint8Array  // 512-byte block: ZP (0-255) + $BF00 page (256-511)
  floppyPatchAddress?: number    // address of RWTS to patch to RTS (disable floppy reads)
  rawDiskImage?: Uint8Array      // original floppy DSK image for HD read shim
  prelaunch?: { sequence: PrelaunchOp[]; entry: number | { indirect: number } }  // when set, use 4cade-style init calls (no RWTS shim)
  supplementaryFiles?: Array<{
    data: Uint8Array
    loadAddress: number
    name: string
    type: number
    relativePath?: string
    creationSortKey?: number
  }>  // companion files used by multi-file games and runtime loaders
}

import { FOUR_CADE_PRELAUNCH_DB, PrelaunchOp, FourCadeEntry, fetchFourCadeDisk, fetchFourCadePrelaunch, parsePrelaunchScript, extractAllBinFiles } from "./four_cade_prelaunch_db"
import { depack6502, run6502OnMem } from "./depack6502"
import { romBase64 } from "../worker/roms/rom_2e"

/** FNV-1a 32-bit hash of a Uint8Array — fast, synchronous, collision-resistant for disk identification. */

/** Lazily built index: normalized name → display name (DB key) */
let fourCadeNameIndex: Map<string, string> | undefined

const normalizeFourCadeName = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "")

const getFourCadeNameIndex = (): Map<string, string> => {
  if (!fourCadeNameIndex) {
    fourCadeNameIndex = new Map()
    for (const key of Object.keys(FOUR_CADE_PRELAUNCH_DB)) {
      fourCadeNameIndex.set(normalizeFourCadeName(key), key)
    }
    fourCadeNameIndex.set(normalizeFourCadeName("Pitfall II: Lost Caverns"), "Pitfall II")
  }
  return fourCadeNameIndex
}

/**
 * Look up 4cade prelaunch metadata by bookmark title.
 * Strips common suffixes like " (4am crack)" and normalizes for comparison.
 */
export const lookupFourCadeByTitle = (title: string): FourCadeEntry | undefined => {
  const cleaned = title
    .replace(/\s*\(4am.*?\)\s*$/i, "")
    .replace(/\s*\(.*?(?:crack|pack).*?\)\s*$/i, "")
    .replace(/\s*\[.*?\]\s*$/g, "")
    .trim()
  const key = getFourCadeNameIndex().get(normalizeFourCadeName(cleaned))
  return key ? FOUR_CADE_PRELAUNCH_DB[key] : undefined
}

/**
 * Creates binary menu metadata file with disk names and screenshot block references
 */
const createMenuMetadataFile = (entries: Array<{ filename: string; screenshotBlock: number; imageKind?: "dos" | "prodos" | "unknown" | "4cade" }>): Uint8Array => {
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
  lines.push("1011 N$=STR$(I):IF I<10 THEN N$=\"0\"+N$")
  lines.push(`1012 PRINT D$;"BLOAD ${SCREENSHOT_SUBDIR}/SCREEN"+N$+",A$2000"`)
  for (let idx = 1; idx <= count; idx++) {
    const { safeName, leftPad, rightPad } = formatMenuScreenTitle(diskTitles[idx - 1])
    const leftArrow = showNavigationArrows ? "<- " : "   "
    const rightArrow = showNavigationArrows ? " ->" : "   "
    const lineNo = 1120 + idx
    lines.push(lineNo + " IF I=" + idx + " THEN VTAB 22:HTAB 1:PRINT \"" + leftArrow + " ".repeat(leftPad) + "\";:INVERSE:PRINT \"" + safeName + "\";:NORMAL:PRINT \"" + " ".repeat(rightPad) + rightArrow + "\";")
  }
  lines.push("1220 RETURN")

  lines.push(`2000 POKE ${MENU_SELECTED_INDEX_ADDRESS},I:HOME:PRINT D$;"CLOSE":PRINT D$;"RUN ${helperSubdir}/MENULAUNCH":RETURN`)

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

const MENU_RELAY_BOOTSTRAP_ADDRESS = 0x2000
const PRODOS_RELAY_WRAPPER_ADDRESS = 0x2000
const PRODOS_RELAY_PAYLOAD_ADDRESS = 0x2100

export const createProDosRelayWrapper = (relay: Uint8Array, runInPlace = false) => {
  if (relay.length > 512) throw new Error("ProDOS relay exceeds two pages")

  const bytes = new Uint8Array(0x300)
  bytes.set(runInPlace
    ? [0x4C, 0x00, 0x21]
    : [
      0xA0, 0x00,
      0xB9, 0x00, 0x21, 0x99, 0x00, 0x03,
      0xB9, 0x00, 0x22, 0x99, 0x00, 0x04,
      0xC8, 0xD0, 0xF1,
      0x4C, 0x00, 0x03,
    ])
  bytes.set(relay, PRODOS_RELAY_PAYLOAD_ADDRESS - PRODOS_RELAY_WRAPPER_ADDRESS)
  return bytes
}

export const createMenuRelayBootstrap = () => {
  const code: number[] = []

  code.push(0xAD, 0x30, 0xBF)
  const staMliUnitOffset = code.length
  code.push(0x8D, 0x00, 0x00)
  code.push(0x20, 0x00, 0xBF, 0x80)
  const mliParameterPointerOffset = code.length
  code.push(0x00, 0x00)
  const mliBcsOffset = code.length
  code.push(0xB0, 0x00)
  code.push(0x4C, 0x00, 0x03)

  const errorOffset = code.length
  code.push(0x00)
  code[mliBcsOffset + 1] = (errorOffset - (mliBcsOffset + 2)) & 0xFF

  const mliParamsOffset = code.length
  code.push(0x03, 0x00, 0x00, 0x03, 0x00, 0x00)
  const mliParamsAddress = MENU_RELAY_BOOTSTRAP_ADDRESS + mliParamsOffset
  code[staMliUnitOffset + 1] = (mliParamsAddress + 1) & 0xFF
  code[staMliUnitOffset + 2] = (mliParamsAddress + 1) >> 8
  code[mliParameterPointerOffset] = mliParamsAddress & 0xFF
  code[mliParameterPointerOffset + 1] = mliParamsAddress >> 8

  return {
    bytes: new Uint8Array(code),
    blockLoOffsets: [mliParamsOffset + 4],
    blockHiOffsets: [mliParamsOffset + 5],
  }
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
  fourCadeRelayBlockInfo?: Array<{ startBlock: number; blockCount: number; helperName: string } | undefined>,
  hdSlot?: number,
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

  lines.push("10 D$=CHR$(4):PRINT D$;\"CLOSE\"")

  lines.push(`20 MAX=${count}:DIM K(${count}),V(${count}),P$(${count}),R$(${count}),S(${count}),H(${count}),Z(${count}),ZB(${count})`)
  lines.push(`22 I=PEEK(${MENU_SELECTED_INDEX_ADDRESS}):IF I<1 OR I>MAX THEN I=1`)
  lines.push("24 RESTORE")
  lines.push("26 FOR J=1 TO MAX:READ K(J),V(J),P$(J),R$(J),S(J),H(J),Z(J),ZB(J):NEXT")
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
  lines.push("85 IF K(I)=6 THEN TEXT:PRINT D$;R$(I):END")
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
    let zpBlock = 0

    if (entryKind === "dos" || entryKind === "unknown") {
      if (hasDosMasterRuntime) {
        launchCode = 0
        volume = runtimeVolumes[idx]
        helloMode = runtimeHelloModeByMenuIndex?.[idx] === 1 ? 1 : 0
      } else {
        launchCode = 5
      }
    } else if (entryKind === "4cade") {
      const relayInfo = fourCadeRelayBlockInfo?.[idx]
      if (relayInfo) {
        launchCode = 6
        runCmd = `BRUN ${helperSubdir}/${relayInfo.helperName}`
        zpHasSnapshot = relayInfo.startBlock
        zpBlock = relayInfo.blockCount
      } else {
        launchCode = 4 // relay not generated (extraction failed)
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

    lines.push(dataLine + " DATA " + launchCode + "," + volume + ",\"" + toDataString(prefix) + "\",\"" + toDataString(runCmd) + "\"," + shimFlag + "," + helloMode + "," + zpHasSnapshot + "," + zpBlock)
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
 * Returns Applesoft source (with line numbers) that will be tokenized to type BAS.
 * Using BAS type (RUN directly) instead of TXT (EXEC'd) avoids holding a file
 * buffer open — which can cause "NO BUFFERS AVAILABLE" when the game launcher
 * later needs to BLOAD the block-reader stub.
 */
const generateInteractiveMenuStartup = (
  menuEntries: MenuDiskEntry[],
  helperSubdir: string
): string => {
  if (menuEntries.length === 0) {
    return `10 D$=CHR$(4):PRINT D$;"BRUN ${helperSubdir}/A2TSLAUNCH"\r20 PRINT D$;"CATALOG"\r`
  }
  return `10 D$=CHR$(4):PRINT D$;"RUN ${helperSubdir}/MENUSRC"\r`
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
 * Composites all binary files from a DOS 3.3 disk into a single memory buffer.
 * Files are loaded in catalog order (later entries overwrite earlier ones where
 * they overlap), mimicking what DOS does when BLOADing/BRUNning files.
 * Returns the composited buffer covering [lowestAddr, highestEnd), plus the
 * base load address of the combined region.
 *
 * For BurgerTime: BURGERTIME ($0C00-$BDFF) loaded first, then MDSADJ ($6400-$87FF)
 * overlaid on top — producing the correct runtime memory state without needing
 * the floppy-boot capture.
 */
/**
 * Classifies a DOS 3.3 image that may be incompatible with DOS.MASTER as either
 * "dos" (normal), "dosup" (genuinely non-exportable), or "4cade" (exportable
 * via direct block loading, bypassing DOS.MASTER).
 *
 * A disk is "4cade" when its catalog contains a binary that would overwrite
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
    if (endAddress > 0x9D00 || dosImageGreetingIsEmpty(image)) return "4cade"
  }
  if (dosImageGreetingIsEmpty(image)) return "dosup"
  return "dos"
}

/**
 * Determines the exportable VTOC type of a disk image: "dos", "prodos", "4cade",
 * "dosup", or "other". "other" means the image is neither a recognizable DOS 3.3 nor
 * ProDOS volume. "dosup" means a DOS 3.3 volume that is incompatible with DOS.MASTER and
 * has no viable binary for direct loading. "4cade" means a DOS 3.3 volume whose
 * catalog contains a large binary whose end address overlaps DOS memory ($9D00+), or whose
 * greeting is empty — either way bypassed by direct SmartPort block loading.
 * WOZ images are fully bit-decoded and probed under every sector order before being classified.
 */
export const determineVtocType = (filename: string, data: Uint8Array, title?: string): VtocType => {
  // Title-based override: if the bookmark title matches a known 4cade game
  // (e.g. "Conan (4am crack)"), classify immediately without needing disk data.
  if (title && lookupFourCadeByTitle(title)) return "4cade"

  const ext = filename.toLowerCase().split(".").pop() || ""

  // Detect WOZ by magic header bytes rather than file extension — the emulator
  // may internally convert DSK→WOZ or cloud providers may alter filenames, so
  // the extension alone is unreliable.
  const isWozData = data.length > 8 &&
    data[0] === 0x57 && data[1] === 0x4F && data[2] === 0x5A &&  // "WOZ"
    (data[3] === 0x31 || data[3] === 0x32)                        // "1" or "2"

  if (ext === "woz" || isWozData) {
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
  const baseType = kind === "unknown" ? "other" : kind
  return baseType
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
  // Direct-load entries for "4cade" disks: per-menu-index metadata describing
  // binaries too large for DOS.MASTER that will be loaded via block I/O relay.
  const fourCadeEntries: FourCadeDiskMetadata[] = []
  const usedNames = new Set<string>(reservedNames || [])

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const kind = menuEntries?.[i]?.imageKind || "unknown"
    const sourceFilename = menuEntries?.[i]?.sourceFilename || file.name
    const isWozContainer = sourceFilename.toLowerCase().endsWith(".woz")
    const wozExtractedFiles = menuEntries?.[i]?.wozExtractedProDosFiles

    // "4cade" disks: fetch the compressed game binary and prelaunch script from
    // the 4cade GitHub repo, parse the prelaunch to determine the decompression
    // sequence, then write the packed binary + relay to the HDV.
    if (kind === "4cade") {
      // Title-based matching against the 4cade game database
      const displayName = menuEntries?.[i]?.displayName
      const fourCadeEntry = displayName ? lookupFourCadeByTitle(displayName) : undefined

      if (fourCadeEntry) {
        try {
          // Fetch compressed disk and prelaunch from GitHub
          const [poData, prelaunchSource] = await Promise.all([
            fetchFourCadeDisk(fourCadeEntry),
            fetchFourCadePrelaunch(fourCadeEntry),
          ])

          // Extract ALL BIN files from the .po disk
          const allFiles = extractAllBinFiles(poData)
          const packed = allFiles.length > 0 ? allFiles[0] : undefined
          if (packed) {
            // Parse the prelaunch script to get the operation sequence
            const parsed = parsePrelaunchScript(prelaunchSource)
            if (parsed) {
              const resolvedEntry = parsed.entry === "loadAddress" ? packed.loadAddress : parsed.entry
              const entryAddress = typeof resolvedEntry === "number" ? resolvedEntry : packed.loadAddress
              const resolvedPrelaunch = { sequence: parsed.sequence, entry: resolvedEntry }
              // Preserve every non-system companion file. Some games use extra
              // BIN files, while standard.a loaders such as Chivalry open large
              // typeless data files through ProDOS MLI at runtime.
              const SYSTEM_FILES_TO_SKIP = new Set(["PRODOS", "LOADER.SYSTEM"])
              const supplementary = extractProDosFilesRecursive(poData)
                .filter((f) => !SYSTEM_FILES_TO_SKIP.has(f.name))
                .filter((f) => !(f.type === PRODOS_FILE_TYPE_BINARY && f.name === packed.name))
                .map((f) => ({
                  data: f.data,
                  loadAddress: f.auxType,
                  name: f.name,
                  type: f.type,
                  relativePath: f.relativePath,
                  creationSortKey: f.creationSortKey,
                }))
              fourCadeEntries.push({
                menuIndex: i,
                binaryData: packed.data,
                loadAddress: packed.loadAddress,
                binaryLength: packed.data.length,
                entryAddress,
                capturedZeroPage: undefined,
                prelaunch: resolvedPrelaunch,
                supplementaryFiles: supplementary.length > 0 ? supplementary : undefined,
              })

              menuProDosPrefixes[i] = undefined
              menuProDosCommands[i] = undefined
              continue
            } else {
              console.warn(`[4cade] "${displayName}": prelaunch script parsed but returned no sequence`)
            }
          } else {
            console.warn(`[4cade] "${displayName}": no BIN files found in .po disk`)
          }
        } catch (e) {
          console.warn(`[4cade] "${displayName}": fetch/parse failed:`, e instanceof Error ? e.message : e)
        }
      } else {
        console.warn(`[4cade] "${displayName}": no match in 4cade database`)
      }

      // No 4cade DB match or fetch failed — skip this disk for direct-load export.
      // (Only disks with a known 4cade prelaunch can be block-loaded.)
      menuProDosPrefixes[i] = undefined
      menuProDosCommands[i] = undefined
      continue
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

  return { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes, menuNeedsAliasShim, runtimeVolumes, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, fourCadeEntries }
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

/**
 * Generates a 6502 machine-language relay binary that loads game data from
 * contiguous blocks on the HDV directly into memory via ProDOS MLI READ_BLOCK,
 * then JMPs to the game's entry point. All parameters are baked into the binary.
 *
 * Loaded at $0300 via BRUN. The relay lives below the text screen ($0400) so
 * it cannot conflict with any game binary (which loads at $0400+).
 *
 * Memory layout at $0300 (84 bytes total):
 *   $0300-$0320: Init code (copies start values into inline param list)
 *   $0321-$034A: Loop: MLI READ_BLOCK, advance buffer/block, decrement count
 *   $034B-$034D: JMP to entry point
 *   $034E-$0353: READ_BLOCK parameter list (6 bytes)
 */
const createDirectLoadRelay = (
  startBlock: number,
  loadAddress: number,
  blockCount: number,
  entryAddress: number,
  unitNumber: number,
): Uint8Array => {
  const RELAY_BASE = 0x0300
  const PARAMS_OFFSET = 78
  const PARAMS_ADDR = RELAY_BASE + PARAMS_OFFSET

  return new Uint8Array([
    // --- Init: copy parameters into inline READ_BLOCK param list ---
    0xA9, unitNumber & 0xFF,                                            // LDA #unit
    0x8D, (PARAMS_ADDR + 1) & 0xFF, ((PARAMS_ADDR + 1) >> 8) & 0xFF,   // STA PARAMS+1
    0xA9, loadAddress & 0xFF,                                           // LDA #bufLo
    0x8D, (PARAMS_ADDR + 2) & 0xFF, ((PARAMS_ADDR + 2) >> 8) & 0xFF,   // STA PARAMS+2
    0xA9, (loadAddress >> 8) & 0xFF,                                    // LDA #bufHi
    0x8D, (PARAMS_ADDR + 3) & 0xFF, ((PARAMS_ADDR + 3) >> 8) & 0xFF,   // STA PARAMS+3
    0xA9, startBlock & 0xFF,                                            // LDA #blkLo
    0x8D, (PARAMS_ADDR + 4) & 0xFF, ((PARAMS_ADDR + 4) >> 8) & 0xFF,   // STA PARAMS+4
    0xA9, (startBlock >> 8) & 0xFF,                                     // LDA #blkHi
    0x8D, (PARAMS_ADDR + 5) & 0xFF, ((PARAMS_ADDR + 5) >> 8) & 0xFF,   // STA PARAMS+5
    0xA9, blockCount & 0xFF,                                            // LDA #countLo
    0x85, 0xF4,                                                          // STA $F4
    0xA9, (blockCount >> 8) & 0xFF,                                     // LDA #countHi
    0x85, 0xF5,                                                          // STA $F5
    // --- LOOP (offset 33): ProDOS MLI READ_BLOCK call ---
    0x20, 0x00, 0xBF,                                                   // JSR $BF00 (MLI)
    0x80,                                                                // .byte $80 (READ_BLOCK)
    PARAMS_ADDR & 0xFF, (PARAMS_ADDR >> 8) & 0xFF,                      // .word PARAMS
    0xB0, 0x22,                                                          // BCS DONE (+34)
    // Advance destination buffer by 512 bytes (high byte += 2)
    0xAD, (PARAMS_ADDR + 3) & 0xFF, ((PARAMS_ADDR + 3) >> 8) & 0xFF,   // LDA PARAMS+3
    0x18,                                                                // CLC
    0x69, 0x02,                                                          // ADC #2
    0x8D, (PARAMS_ADDR + 3) & 0xFF, ((PARAMS_ADDR + 3) >> 8) & 0xFF,   // STA PARAMS+3
    // Advance block number
    0xEE, (PARAMS_ADDR + 4) & 0xFF, ((PARAMS_ADDR + 4) >> 8) & 0xFF,   // INC PARAMS+4
    0xD0, 0x03,                                                          // BNE +3
    0xEE, (PARAMS_ADDR + 5) & 0xFF, ((PARAMS_ADDR + 5) >> 8) & 0xFF,   // INC PARAMS+5
    // Decrement block count ($F4/$F5)
    0x38,                                                                // SEC
    0xA5, 0xF4,                                                          // LDA $F4
    0xE9, 0x01,                                                          // SBC #1
    0x85, 0xF4,                                                          // STA $F4
    0xA5, 0xF5,                                                          // LDA $F5
    0xE9, 0x00,                                                          // SBC #0
    0x85, 0xF5,                                                          // STA $F5
    0x05, 0xF4,                                                          // ORA $F4
    0xD0, 0xD6,                                                          // BNE LOOP (-42)
    // --- DONE (offset 75): jump to game entry point ---
    0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF,              // JMP entryAddress
    // --- PARAMS (offset 78): READ_BLOCK parameter list ---
    0x03,                                                                // param count = 3
    unitNumber & 0xFF,                                                   // unit number
    loadAddress & 0xFF, (loadAddress >> 8) & 0xFF,                       // buffer address
    startBlock & 0xFF, (startBlock >> 8) & 0xFF,                         // block number
  ])
}

/**
 * Generates a 6502 shim (116 bytes) to replace the floppy RWTS at $0600.
 * When called, the shim reads one 256-byte sector from the hard drive (where
 * the full DSK image is stored as contiguous blocks) and copies it to the
 * game's buffer address.
 *
 * Calling convention (matches original BurgerTime RWTS):
 *   ZP $00/$01 = destination buffer address
 *   ZP $80 = track number (0-34)
 *   ZP $81 = sector number (0-15, as stored in .dsk file = logical sector)
 *   Returns: carry clear = success
 *   Preserves: A, X, Y
 *
 * DSK layout in HD: each 512-byte block holds 2 consecutive sectors.
 *   Block = dskBaseBlock + track*8 + sector/2
 *   Even sector → first 256 bytes, odd sector → last 256 bytes.
 * The .dsk file stores sectors in DOS 3.3 logical order; the game passes
 * logical sector numbers directly. No interleave translation is needed.
 */
const createFloppyReadShim = (dskBaseBlock: number, unitNumber: number): Uint8Array => {
  const DRIVER_ADDR_HI = 0xC0 + ((unitNumber >> 4) & 0x07)  // $C7 for slot 7
  const baseLo = dskBaseBlock & 0xFF
  const baseHi = (dskBaseBlock >> 8) & 0xFF
  return new Uint8Array([
    // Offset 0: Save registers
    0x08,                   // PHP
    0x48,                   // PHA
    0x8A,                   // TXA
    0x48,                   // PHA
    0x98,                   // TYA
    0x48,                   // PHA
    // Offset 6: Save ZP $42-$47 on stack (loop X=5 downto 0)
    0xA2, 0x05,             // LDX #5
    0xB5, 0x42,             // .save: LDA $42,X
    0x48,                   // PHA
    0xCA,                   // DEX
    0x10, 0xFA,             // BPL .save
    // Offset 14: Calculate block = dskBase + track*8 + sector/2
    0xA5, 0x80,             // LDA $80 (track)
    0x0A,                   // ASL (*2)
    0x0A,                   // ASL (*4)
    0x0A,                   // ASL (*8, carry if track>=32)
    0x85, 0x46,             // STA $46 (block_lo partial)
    0xA9, 0x00,             // LDA #0
    0x2A,                   // ROL (capture carry)
    0x85, 0x47,             // STA $47 (block_hi partial)
    // Offset 26: Add sector/2
    0xA5, 0x81,             // LDA $81 (sector)
    0x48,                   // PHA (save sector for odd/even)
    0x4A,                   // LSR (sector/2)
    0x18,                   // CLC
    0x65, 0x46,             // ADC $46
    0x85, 0x46,             // STA $46
    0x90, 0x02,             // BCC .nc1
    0xE6, 0x47,             // INC $47
    // Offset 39: Add DSK base block
    0x18,                   // .nc1: CLC
    0xA5, 0x46,             // LDA $46
    0x69, baseLo,           // ADC #dskBaseLo
    0x85, 0x46,             // STA $46
    0xA5, 0x47,             // LDA $47
    0x69, baseHi,           // ADC #dskBaseHi
    0x85, 0x47,             // STA $47
    // Offset 52: Device driver params
    0xA9, 0x01,             // LDA #1 (READ)
    0x85, 0x42,             // STA $42
    0xA9, unitNumber & 0xFF, // LDA #unit
    0x85, 0x43,             // STA $43
    0xA9, 0x00,             // LDA #$00
    0x85, 0x44,             // STA $44 (buf lo)
    0xA9, 0xBE,             // LDA #$BE
    0x85, 0x45,             // STA $45 (buf hi = $BE00)
    // Offset 68: Read block from HD
    0x20, 0xC0, DRIVER_ADDR_HI, // JSR $CnC0
    // Offset 71: Determine even/odd sector
    0x68,                   // PLA (restore sector)
    0x29, 0x01,             // AND #$01
    0xD0, 0x0C,             // BNE .odd (target = 88)
    // Offset 76: Even sector - copy $BE00 to ($00),Y
    0xA0, 0x00,             // LDY #0
    0xB9, 0x00, 0xBE,       // .evn: LDA $BE00,Y
    0x91, 0x00,             // STA ($00),Y
    0xC8,                   // INY
    0xD0, 0xF8,             // BNE .evn
    0xF0, 0x0A,             // BEQ .rest (target = 98)
    // Offset 88: Odd sector - copy $BF00 to ($00),Y
    0xA0, 0x00,             // .odd: LDY #0
    0xB9, 0x00, 0xBF,       // .odd_lp: LDA $BF00,Y
    0x91, 0x00,             // STA ($00),Y
    0xC8,                   // INY
    0xD0, 0xF8,             // BNE .odd_lp
    // Offset 98: Restore ZP $42-$47
    0xA2, 0x00,             // .rest: LDX #0
    0x68,                   // .rlp: PLA
    0x95, 0x42,             // STA $42,X
    0xE8,                   // INX
    0xE0, 0x06,             // CPX #6
    0xD0, 0xF8,             // BNE .rlp
    // Offset 108: Restore Y, X, A, flags
    0x68,                   // PLA (Y)
    0xA8,                   // TAY
    0x68,                   // PLA (X)
    0xAA,                   // TAX
    0x68,                   // PLA (A)
    0x28,                   // PLP (flags)
    0x18,                   // CLC (success)
    0x60,                   // RTS
  ])
}

/**
 * Creates a relay binary that loads a game from contiguous blocks by calling
 * the hard drive device driver DIRECTLY (bypassing ProDOS MLI to avoid unit
 * lookup issues), restores zero page from a captured snapshot (stored as one
 * extra block at the end of the game data), then JMPs to the entry point.
 *
 * Layout:  [game blocks (N)] [ZP block (1)]
 * The ZP block is 512 bytes: first 256 are the zero page snapshot, rest is padding.
 */
const createDirectLoadRelayWithZP = (
  startBlock: number,
  loadAddress: number,
  gameBlockCount: number,
  entryAddress: number,
  unitNumber: number,
  floppyPatchAddress?: number,
): Uint8Array => {
  // Derive driver entry address: slot ROM at $Cn00 + driver offset $C0
  const slot = (unitNumber >> 4) & 0x07
  const DRIVER_ADDR_LO = 0xC0  // driver offset within slot ROM
  const DRIVER_ADDR_HI = 0xC0 + slot  // $C7 for slot 7

  // ZP scratch buffer for reading the ZP block after game load.
  // Place it just above the loaded game data so it doesn't overwrite any game code.
  // After the game block loop, $45 already equals (loadAddress>>8) + gameBlockCount*2,
  // which is exactly the first free page above the game data.
  const zpScratchHi = ((loadAddress >> 8) + gameBlockCount * 2) & 0xFF

  // Build the optional patch bytes: write CLC ($18) + RTS ($60) to the floppy RWTS entry.
  // CLC ensures the carry flag signals "success" to the game's error-checking code.
  const patchBytes: number[] = floppyPatchAddress !== undefined
    ? [0xA9, 0x18, 0x8D, floppyPatchAddress & 0xFF, (floppyPatchAddress >> 8) & 0xFF,
       0xA9, 0x60, 0x8D, (floppyPatchAddress + 1) & 0xFF, ((floppyPatchAddress + 1) >> 8) & 0xFF]
    : []

  // The device driver calling convention uses ZP $42-$47:
  //   $42 = command (1=READ)
  //   $43 = unit number (DSSS0000)
  //   $44-$45 = buffer address (lo/hi)
  //   $46-$47 = block number (lo/hi)
  // Returns: carry clear = success, carry set = error

  return new Uint8Array([
    // --- Init: set up ZP for direct device driver calls ---
    0xA9, 0x01,                                                          // LDA #$01 (READ command)
    0x85, 0x42,                                                          // STA $42
    0xA9, unitNumber & 0xFF,                                             // LDA #unit
    0x85, 0x43,                                                          // STA $43
    0xA9, loadAddress & 0xFF,                                            // LDA #bufLo
    0x85, 0x44,                                                          // STA $44
    0xA9, (loadAddress >> 8) & 0xFF,                                     // LDA #bufHi
    0x85, 0x45,                                                          // STA $45
    0xA9, startBlock & 0xFF,                                             // LDA #blkLo
    0x85, 0x46,                                                          // STA $46
    0xA9, (startBlock >> 8) & 0xFF,                                      // LDA #blkHi
    0x85, 0x47,                                                          // STA $47
    // Block counter
    0xA9, gameBlockCount & 0xFF,                                         // LDA #countLo
    0x85, 0xF4,                                                          // STA $F4
    0xA9, (gameBlockCount >> 8) & 0xFF,                                  // LDA #countHi
    0x85, 0xF5,                                                          // STA $F5
    // --- LOOP (offset 32): Call device driver directly ---
    0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI,                               // JSR $CnC0 (device driver)
    0xB0, 0x35,                                                          // BCS DONE (+53 → offset 90)
    // Advance destination buffer by 512 bytes (high byte += 2)
    0xA5, 0x45,                                                          // LDA $45
    0x18,                                                                // CLC
    0x69, 0x02,                                                          // ADC #2
    0x85, 0x45,                                                          // STA $45
    // Advance block number
    0xE6, 0x46,                                                          // INC $46
    0xD0, 0x02,                                                          // BNE +2
    0xE6, 0x47,                                                          // INC $47
    // Decrement block count ($F4/$F5)
    0x38,                                                                // SEC
    0xA5, 0xF4,                                                          // LDA $F4
    0xE9, 0x01,                                                          // SBC #1
    0x85, 0xF4,                                                          // STA $F4
    0xA5, 0xF5,                                                          // LDA $F5
    0xE9, 0x00,                                                          // SBC #0
    0x85, 0xF5,                                                          // STA $F5
    0x05, 0xF4,                                                          // ORA $F4
    0xD0, 0xDD,                                                          // BNE LOOP (-35 → offset 32)
    // --- Game blocks loaded. Now read ZP block to scratch buffer ---
    0xA9, 0x00,                                                          // LDA #$00
    0x85, 0x44,                                                          // STA $44 (buf lo)
    0xA9, zpScratchHi,                                                   // LDA #zpScratchHi
    0x85, 0x45,                                                          // STA $45 (buf hi)
    // Block number in $46/$47 already advanced past game blocks = ZP block
    0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI,                               // JSR $CnC0 (device driver)
    0xB0, 0x0A,                                                          // BCS DONE (+10 → offset 90)
    // --- Copy zpScratch → $00-$FF (zero page restore) ---
    0xA2, 0x00,                                                          // LDX #$00
    // .zploop (offset 82):
    0xBD, 0x00, zpScratchHi,                                             // LDA zpScratch,X
    0x95, 0x00,                                                          // STA $00,X
    0xE8,                                                                // INX
    0xD0, 0xF8,                                                          // BNE .zploop (-8 → offset 82)
    // --- DONE (offset 90): optional floppy patch + jump to game entry point ---
    ...patchBytes,                                                       // [optional] CLC+RTS patch at RWTS entry
    0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF,              // JMP entryAddress
  ])
}

/**
 * Creates a relay binary for 4cade-style prelaunch games. Loads the memory
 * snapshot from contiguous blocks via the device driver, optionally restores
 * zero page, then executes the prelaunch init calls (JSR) in order before
 * jumping to the game entry point.
 *
 * Unlike the RWTS-shim relay, no floppy DSK image or sector-read shim is
 * needed — the prelaunch patches (already baked into the binary at export
 * time) disable all floppy access so the game runs entirely from the loaded
 * memory snapshot.
 *
 * Layout:  [game blocks (N)] [ZP block (1, optional)]
 */
const createPrelaunchRelay = (
  startBlock: number,
  loadAddress: number,
  gameBlockCount: number,
  unitNumber: number,
  patches: Array<{ addr: number; val: number }>,
  initCalls: number[],
  entryAddress: number,
  hasZP: boolean,
): Uint8Array => {
  const slot = (unitNumber >> 4) & 0x07
  const DRIVER_ADDR_LO = 0xC0
  const DRIVER_ADDR_HI = 0xC0 + slot
  const zpScratchHi = hasZP ? (((loadAddress >> 8) + gameBlockCount * 2) & 0xFF) : 0

  const code: number[] = []

  // --- Init: set up ZP for direct device driver calls ---
  code.push(0xA9, 0x01, 0x85, 0x42)                          // LDA #1, STA $42 (READ)
  code.push(0xA9, unitNumber & 0xFF, 0x85, 0x43)             // LDA #unit, STA $43
  code.push(0xA9, loadAddress & 0xFF, 0x85, 0x44)            // LDA #bufLo, STA $44
  code.push(0xA9, (loadAddress >> 8) & 0xFF, 0x85, 0x45)     // LDA #bufHi, STA $45
  code.push(0xA9, startBlock & 0xFF, 0x85, 0x46)             // LDA #blkLo, STA $46
  code.push(0xA9, (startBlock >> 8) & 0xFF, 0x85, 0x47)      // LDA #blkHi, STA $47
  code.push(0xA9, gameBlockCount & 0xFF, 0x85, 0xF4)         // LDA #countLo, STA $F4
  code.push(0xA9, (gameBlockCount >> 8) & 0xFF, 0x85, 0xF5)  // LDA #countHi, STA $F5

  // --- LOOP: Call device driver directly ---
  const loopOffset = code.length                               // 32
  code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)            // JSR $CnC0
  const bcsMainIdx = code.length
  code.push(0xB0, 0x00)                                       // BCS DONE (patched below)
  code.push(0xA5, 0x45, 0x18, 0x69, 0x02, 0x85, 0x45)       // advance buf (+512)
  code.push(0xE6, 0x46, 0xD0, 0x02, 0xE6, 0x47)             // advance block
  code.push(0x38, 0xA5, 0xF4, 0xE9, 0x01, 0x85, 0xF4)       // dec count lo
  code.push(0xA5, 0xF5, 0xE9, 0x00, 0x85, 0xF5)             // dec count hi
  code.push(0x05, 0xF4)                                       // ORA $F4
  const bneIdx = code.length
  code.push(0xD0, (loopOffset - (bneIdx + 2)) & 0xFF)        // BNE LOOP

  // --- ZP restore (optional) ---
  let bcsZpIdx = -1
  if (hasZP) {
    code.push(0xA9, 0x00, 0x85, 0x44)                        // LDA #0, STA $44
    code.push(0xA9, zpScratchHi, 0x85, 0x45)                 // LDA #scratch, STA $45
    code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)          // JSR $CnC0 (read ZP block)
    bcsZpIdx = code.length
    code.push(0xB0, 0x00)                                     // BCS DONE (patched below)
    code.push(0xA2, 0x00)                                     // LDX #0
    const zpLoopOffset = code.length
    code.push(0xBD, 0x00, zpScratchHi)                        // LDA scratch,X
    code.push(0x95, 0x00)                                     // STA $00,X
    code.push(0xE8)                                            // INX
    code.push(0xD0, (zpLoopOffset - (code.length + 2)) & 0xFF) // BNE zploop
  }

  // --- DONE: init calls + JMP entry ---
  const doneOffset = code.length
  code[bcsMainIdx + 1] = (doneOffset - (bcsMainIdx + 2)) & 0xFF
  if (bcsZpIdx >= 0) {
    code[bcsZpIdx + 1] = (doneOffset - (bcsZpIdx + 2)) & 0xFF
  }

  // --- Apply patches (e.g. disable floppy reads) before init calls ---
  for (const patch of patches) {
    code.push(0xA9, patch.val & 0xFF)                         // LDA #val
    code.push(0x8D, patch.addr & 0xFF, (patch.addr >> 8) & 0xFF)  // STA addr
  }

  for (const addr of initCalls) {
    code.push(0x20, addr & 0xFF, (addr >> 8) & 0xFF)         // JSR addr
  }

  // --- Machine state setup ---
  // ProDOS boots in text mode with 80-column card active. The game expects
  // HGR page 1 fullscreen with 40-column mode, interrupts off, and a clean
  // stack. Without this, the display stays in text mode showing garbled
  // screen memory and the game may crash from unexpected machine state.
  code.push(0x78)                                              // SEI (disable interrupts)
  code.push(0xA2, 0xFF, 0x9A)                                 // LDX #$FF, TXS (reset stack)
  code.push(0x8D, 0x00, 0xC0)                                 // STA $C000 (80STORE off)
  code.push(0x8D, 0x02, 0xC0)                                 // STA $C002 (RAMRD main)
  code.push(0x8D, 0x04, 0xC0)                                 // STA $C004 (RAMWRT main)
  code.push(0x8D, 0x08, 0xC0)                                 // STA $C008 (ALTZP off)
  code.push(0x8D, 0x0C, 0xC0)                                 // STA $C00C (80COL off)
  code.push(0x8D, 0x0E, 0xC0)                                 // STA $C00E (ALTCHAR off)
  code.push(0x8D, 0x50, 0xC0)                                 // STA $C050 (graphics mode)
  code.push(0x8D, 0x52, 0xC0)                                 // STA $C052 (full screen)
  code.push(0x8D, 0x54, 0xC0)                                 // STA $C054 (page 1)
  code.push(0x8D, 0x57, 0xC0)                                 // STA $C057 (hi-res)
  code.push(0x8D, 0x82, 0xC0)                                 // STA $C082 (read ROM, no write)
  code.push(0x8D, 0xCF, 0xC0)                                 // STA $CFFF (unmap $C800 slot ROM)

  // --- Erase relay: fill $0300-$03FF with RTS before entering game ---
  // The game may call DOS 3.3 page-3 vectors ($03D0+) or other $03xx
  // addresses.  Our relay code is still at $0300, so any such call would
  // hit the block-reading JSR $CnC0 and corrupt memory.  Solution: copy a
  // small trampoline to $0200, jump there; the trampoline fills $0300-$03FF
  // with RTS ($60), then JMPs to the game entry point.
  const TRAMPOLINE_ADDR = 0x0200
  const trampoline = [
    0xA2, 0x00,                                                // LDX #$00
    0xA9, 0x60,                                                // LDA #$60
    0x9D, 0x00, 0x03,                                          // STA $0300,X
    0xE8,                                                      // INX
    0xD0, 0xFA,                                                // BNE -6 (→ STA)
    0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF,     // JMP entry
  ]
  // Emit copy loop: LDX #(len-1); .lp: LDA data,X; STA $0200,X; DEX; BPL .lp; JMP $0200
  const trampDataOffset = RELAY_LOAD_ADDRESS + code.length + 14 // 14 = copy loop size
  code.push(0xA2, trampoline.length - 1)                       // LDX #(TRAMP_SIZE-1)
  code.push(0xBD, trampDataOffset & 0xFF, (trampDataOffset >> 8) & 0xFF) // LDA data,X
  code.push(0x9D, TRAMPOLINE_ADDR & 0xFF, (TRAMPOLINE_ADDR >> 8) & 0xFF) // STA $0200,X
  code.push(0xCA)                                              // DEX
  code.push(0x10, 0xF7)                                        // BPL .lp (-9 → LDA)
  code.push(0x4C, TRAMPOLINE_ADDR & 0xFF, (TRAMPOLINE_ADDR >> 8) & 0xFF) // JMP $0200
  code.push(...trampoline)                                     // inline trampoline data

  return new Uint8Array(code)
}

/**
 * Performs OFFLINE decompression at build time using depack6502, then creates
 * a flat-load relay for runtime.  This eliminates LZ dictionary mismatch issues
 * that plague runtime decompression when the pre-existing memory state doesn't
 * match what the SAN INC compressor expected.
 *
 * Build-time steps:
 *   1. Pre-fill memory with HOME screen ($0400-$07FF = $A0)
 *   2. Apply pre-decompress patches from the prelaunch sequence
 *   3. Run the decompressor via depack6502 (JSR loadAddress; BRK)
 *   4. Capture the 64 KB result: $0800-$BFFF (main) + $D000-$FFFF (LC bank 2)
 *
 * Runtime relay:
 *   1. Load main memory ($0800-$BFFF) from HD blocks
 *   2. Enable LC bank 2 (BIT $C083 x2) and load $D000-$FFFF
 *   3. Stub accelerator functions + set safe BRK vector
 *   4. Apply post-decompress patches and execute setup calls
 *   5. Machine state setup (SLOTCXROM, display, stack, etc.)
 *   6. JMP entry
 *
 * Returns: { relay: Uint8Array, flatBinary: Uint8Array }
 *   relay = 6502 code for the runtime relay block
 *   flatBinary = decompressed game data: [$0800-$BFFF] + [$D000-$FFFF]
 */
const createOfflineDecompRelay = (
  startBlock: number,
  packedData: Uint8Array,
  loadAddress: number,
  unitNumber: number,
  sequence: PrelaunchOp[],
  entryAddress: number,
  supplementaryFiles?: Array<{ data: Uint8Array; loadAddress: number; name: string }>,
): { relay: Uint8Array; flatBinary: Uint8Array } => {
  const slot = (unitNumber >> 4) & 0x07
  const DRIVER_ADDR_LO = 0xC0
  const DRIVER_ADDR_HI = 0xC0 + slot

  // === BUILD-TIME DECOMPRESSION ===
  // Split sequence at the "decompress" op: everything before is build-time setup,
  // everything after is runtime post-processing.
  let decompIdx = -1
  for (let i = 0; i < sequence.length; i++) {
    if (sequence[i].op === "decompress") { decompIdx = i; break }
  }
  if (decompIdx < 0) throw new Error("createOfflineDecompRelay: no decompress op in sequence")

  // Apply pre-decompress patches to packed data buffer (e.g. patch $081E=$60)
  const preDecompPatches: Array<{ addr: number; val: number }> = []
  for (let i = 0; i < decompIdx; i++) {
    if (sequence[i].op === "patch") {
      const p = sequence[i] as { op: "patch"; addr: number; val: number }
      preDecompPatches.push({ addr: p.addr, val: p.val })
    }
  }

  // Build memInit: pre-decompress patches only.
  // Do NOT pre-fill the text page ($0400) — the decompressor uses backreferences
  // to memory that includes $0400-$07FF, so changing initial values from zero
  // corrupts the decompressed output.
  const memInit: Array<{ addr: number; data: Uint8Array | readonly number[] }> | undefined =
    preDecompPatches.length > 0
      ? preDecompPatches.map(p => ({ addr: p.addr, data: [p.val] }))
      : undefined

  // Run depack6502: decompressor at loadAddress, halts on RTS (returns to trampoline BRK)
  const decompressed = depack6502(packedData, loadAddress, undefined, undefined, memInit)

  // Post-decompress operations
  const postOps = sequence.slice(decompIdx + 1)

  // ============================================================
  // MULTI-FILE GAMES: Runtime postOps path
  // ============================================================
  // Games with supplementary files (e.g. Conan) need real ProDOS file access
  // at runtime because their initialization code ($BC94) loads and decompresses
  // additional game files via ProDOS MLI.  Build-time execution cannot replicate
  // this because the mini-interpreter lacks a real filesystem.
  //
  // Strategy:
  //   1. Do NOT modify the decompressed state (no patches, no ROM overwrite)
  //   2. Generate a postOps 6502 code block that runs at $0200 at runtime
  //   3. The relay loads main memory + LC + postOps block, then JMPs to $0200
  //   4. postOps code applies patches, JSRs game init, then JMPs to entry
  //   5. Supplementary files are added as ProDOS BIN files on the HDV volume
  //      (handled by buildProDosHdv) so the game's file loader finds them
  //
  // The decompressed buffer already has the correct LC bank 2 content because
  // 4cade enables LC bank 2 write BEFORE the decompressor runs.  Overwriting
  // $D000-$FFFF with ROM (as done for single-file games) would destroy the
  // game's LC code/data — visible as crashes when the game calls routines
  // in the LC area (e.g. Conan calls $D64B).
  if (supplementaryFiles && supplementaryFiles.length > 0) {
    // Do NOT apply patches at build time for multi-file games.
    // The runtime postOps code applies all patches in the correct sequence relative
    // to the calls.  Pre-applying them here would give $BC94 (and other game init)
    // a different initial memory state than the real 4cade flow provides, because
    // some patches (e.g. $7C09, $6BA2) are meant to be applied AFTER certain calls.

    // Extract flat binary: $0800-$BFFF (main memory) + $D000-$FFFF (LC bank 2)
    const MAIN_START = 0x0800
    const MAIN_END = 0xC000  // exclusive
    // On Apple IIe, $D000-$DFFF has two banks (bank 1 and bank 2) but $E000-$FFFF
    // is SHARED — only one physical copy regardless of which bank is selected.
    // ProDOS kernel lives in the shared $E000-$FFFF area.  If we load our flat
    // binary's $E000-$FFFF content (which is mostly zeros from depack6502), we'd
    // overwrite ProDOS and all subsequent MLI calls would crash.
    // The SAN INC decompressor only targets $D000-$DFFF in LC bank 2 (it can't
    // write to $E000-$FFFF without destroying ProDOS on real hardware either).
    // So we only load the bank-specific $D000-$DFFF region (4KB = 8 blocks).
    const LC_START = 0xD000
    const LC_END = 0xE000    // exclusive — only bank-specific region
    const mainSize = MAIN_END - MAIN_START  // $B800 = 47104
    const lcSize = LC_END - LC_START        // $1000 = 4096

    // --- Generate runtime postOps code (runs at $0200) ---
    const STUB_ADDRS = new Set([0xDFAE, 0xDFB4, 0xDFB7])
    const postOpsCode: number[] = []

    // Restore game's $0300 page from $0400 FIRST, before any JSR calls.
    // The relay block's second half ($0400-$04FF) holds the game's original
    // $0300 page.  Game init calls (especially title screen at $5FF8) write
    // to the text page ($0400-$07FF), which would corrupt this saved data
    // if we waited until after the calls to copy it.
    postOpsCode.push(0xA2, 0x00)              // LDX #$00
    postOpsCode.push(0xBD, 0x00, 0x04)        // LDA $0400,X
    postOpsCode.push(0x9D, 0x00, 0x03)        // STA $0300,X
    postOpsCode.push(0xE8)                    // INX
    postOpsCode.push(0xD0, 0xF7)              // BNE -9

    for (const step of postOps) {
      switch (step.op) {
        case "patch":
          postOpsCode.push(0xA9, step.val & 0xFF)                             // LDA #val
          postOpsCode.push(0x8D, step.addr & 0xFF, (step.addr >> 8) & 0xFF)   // STA addr
          break
        case "inc_reset_checksum":
          postOpsCode.push(0xEE, 0xF4, 0x03)                                 // INC $03F4
          break
        case "call":
          if (!STUB_ADDRS.has(step.addr)) {
            postOpsCode.push(0x20, step.addr & 0xFF, (step.addr >> 8) & 0xFF) // JSR addr
          }
          break
        case "rwRam2":
          postOpsCode.push(0x2C, 0x83, 0xC0)  // BIT $C083
          postOpsCode.push(0x2C, 0x83, 0xC0)  // BIT $C083
          break
        case "readRom":
          postOpsCode.push(0x2C, 0x82, 0xC0)  // BIT $C082
          break
        case "rdRam2":
          postOpsCode.push(0x2C, 0x81, 0xC0)  // BIT $C081
          postOpsCode.push(0x2C, 0x81, 0xC0)  // BIT $C081
          break
      }
    }
    // Machine state reset
    postOpsCode.push(0xD8)                    // CLD
    postOpsCode.push(0x78)                    // SEI
    postOpsCode.push(0xA2, 0xFF)              // LDX #$FF
    postOpsCode.push(0x9A)                    // TXS
    postOpsCode.push(0x8D, 0x00, 0xC0)        // STA $C000 (80STORE off)
    postOpsCode.push(0x8D, 0x02, 0xC0)        // STA $C002 (RAMRD main)
    postOpsCode.push(0x8D, 0x04, 0xC0)        // STA $C004 (RAMWRT main)
    postOpsCode.push(0x8D, 0x06, 0xC0)        // STA $C006 (SLOTCXROM)
    postOpsCode.push(0x8D, 0x08, 0xC0)        // STA $C008 (ALTZP off)
    postOpsCode.push(0x8D, 0x0C, 0xC0)        // STA $C00C (80COL off)
    postOpsCode.push(0x8D, 0x0E, 0xC0)        // STA $C00E (ALTCHAR off)
    postOpsCode.push(0x8D, 0x10, 0xC0)        // STA $C010 (keyboard strobe)
    postOpsCode.push(0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF)  // JMP entry

    if (postOpsCode.length > 256) throw new Error(`createOfflineDecompRelay: postOps code too large (${postOpsCode.length} bytes, max 256)`)

    // Build flat binary with postOps block appended
    const postOpsBlock = new Uint8Array(BLOCK_SIZE)
    postOpsBlock.set(postOpsCode)
    const flatBinary = new Uint8Array(mainSize + lcSize + BLOCK_SIZE)
    flatBinary.set(decompressed.slice(MAIN_START, MAIN_END), 0)
    flatBinary.set(decompressed.slice(LC_START, LC_END), mainSize)
    flatBinary.set(postOpsBlock, mainSize + lcSize)

    // === RUNTIME RELAY (multi-file) ===
    // Relay preserves the ProDOS global page ($BF00-$BFFF) by saving it to
    // $0200 before loading, restoring after, then loading the postOps block
    // to $0200 and jumping there.
    const mainBlockCount = Math.ceil(mainSize / BLOCK_SIZE)     // 92
    const lcBlockCount = Math.ceil(lcSize / BLOCK_SIZE)         // 8
    const postOpsBlockNum = startBlock + mainBlockCount + lcBlockCount  // block after LC
    const lcStartBlock = startBlock + mainBlockCount

    const code: number[] = []

    // --- Save ProDOS global page ($BF00-$BFFF → $0200) ---
    code.push(0xA2, 0x00)                                       // LDX #$00
    const saveLoopOff = code.length
    code.push(0xBD, 0x00, 0xBF)                                 // LDA $BF00,X
    code.push(0x9D, 0x00, 0x02)                                 // STA $0200,X
    code.push(0xE8)                                             // INX
    code.push(0xD0, (saveLoopOff - (code.length + 2)) & 0xFF)  // BNE save_loop

    // --- Phase 1: Load main memory ($0800-$BFFF) ---
    code.push(0xA9, 0x01, 0x85, 0x42)                          // LDA #1, STA $42 (READ)
    code.push(0xA9, unitNumber & 0xFF, 0x85, 0x43)             // LDA #unit, STA $43
    code.push(0xA9, MAIN_START & 0xFF, 0x85, 0x44)             // LDA #$00, STA $44 (buf lo)
    code.push(0xA9, (MAIN_START >> 8) & 0xFF, 0x85, 0x45)      // LDA #$08, STA $45 (buf hi)
    code.push(0xA9, startBlock & 0xFF, 0x85, 0x46)             // LDA #blkLo, STA $46
    code.push(0xA9, (startBlock >> 8) & 0xFF, 0x85, 0x47)      // LDA #blkHi, STA $47
    code.push(0xA9, mainBlockCount & 0xFF, 0x85, 0xF4)         // LDA #countLo, STA $F4
    code.push(0xA9, (mainBlockCount >> 8) & 0xFF, 0x85, 0xF5)  // LDA #countHi, STA $F5

    const loopOffset = code.length
    code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)            // JSR $CnC0
    const bcsIdx = code.length
    code.push(0xB0, 0x00)                                       // BCS DONE (patched below)
    code.push(0xA5, 0x45, 0x18, 0x69, 0x02, 0x85, 0x45)       // advance buf (+512)
    code.push(0xE6, 0x46, 0xD0, 0x02, 0xE6, 0x47)             // advance block
    code.push(0x38, 0xA5, 0xF4, 0xE9, 0x01, 0x85, 0xF4)       // dec count lo
    code.push(0xA5, 0xF5, 0xE9, 0x00, 0x85, 0xF5)             // dec count hi
    code.push(0x05, 0xF4)                                       // ORA $F4
    const bneIdx = code.length
    code.push(0xD0, (loopOffset - (bneIdx + 2)) & 0xFF)        // BNE LOOP

    // --- Restore ProDOS global page ($0200 → $BF00) ---
    code.push(0xA2, 0x00)                                       // LDX #$00
    const restoreLoopOff = code.length
    code.push(0xBD, 0x00, 0x02)                                 // LDA $0200,X
    code.push(0x9D, 0x00, 0xBF)                                 // STA $BF00,X
    code.push(0xE8)                                             // INX
    code.push(0xD0, (restoreLoopOff - (code.length + 2)) & 0xFF)  // BNE restore_loop

    // --- Phase 2: Enable LC bank 2 and load $D000-$FFFF ---
    code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083
    code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083 (enable LC bank 2 r/w)
    code.push(0xA9, LC_START & 0xFF, 0x85, 0x44)               // LDA #$00, STA $44 (buf lo)
    code.push(0xA9, (LC_START >> 8) & 0xFF, 0x85, 0x45)        // LDA #$D0, STA $45 (buf hi)
    code.push(0xA9, lcStartBlock & 0xFF, 0x85, 0x46)           // LDA #lcBlkLo, STA $46
    code.push(0xA9, (lcStartBlock >> 8) & 0xFF, 0x85, 0x47)    // LDA #lcBlkHi, STA $47
    code.push(0xA9, lcBlockCount & 0xFF, 0x85, 0xF4)           // LDA #lcCountLo, STA $F4
    code.push(0xA9, (lcBlockCount >> 8) & 0xFF, 0x85, 0xF5)    // LDA #lcCountHi, STA $F5

    const loop2Offset = code.length
    code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)            // JSR $CnC0
    const bcs2Idx = code.length
    code.push(0xB0, 0x00)                                       // BCS DONE (patched below)
    code.push(0xA5, 0x45, 0x18, 0x69, 0x02, 0x85, 0x45)       // advance buf (+512)
    code.push(0xE6, 0x46, 0xD0, 0x02, 0xE6, 0x47)             // advance block
    code.push(0x38, 0xA5, 0xF4, 0xE9, 0x01, 0x85, 0xF4)       // dec count lo
    code.push(0xA5, 0xF5, 0xE9, 0x00, 0x85, 0xF5)             // dec count hi
    code.push(0x05, 0xF4)                                       // ORA $F4
    const bne2Idx = code.length
    code.push(0xD0, (loop2Offset - (bne2Idx + 2)) & 0xFF)      // BNE LOOP2

    // NOTE: No Phase 3 stubs for multi-file games.  The decompressor writes game
    // code/data throughout $D000-$DFFF in LC bank 2.  Overwriting addresses like
    // $DFAE/$DFB4/$DFB7/$DFFC/$FFFE/$FFFF destroys game data.  The postOps code
    // SKIPS calling those stub addresses (STUB_ADDRS set), so stubs are not needed.

    // --- Phase 3: Load postOps block to $0200 and jump ---
    code.push(0xA9, 0x00, 0x85, 0x44)                           // LDA #$00, STA $44 (buf lo)
    code.push(0xA9, 0x02, 0x85, 0x45)                           // LDA #$02, STA $45 (buf hi)
    code.push(0xA9, postOpsBlockNum & 0xFF, 0x85, 0x46)         // LDA #blkLo, STA $46
    code.push(0xA9, (postOpsBlockNum >> 8) & 0xFF, 0x85, 0x47)  // LDA #blkHi, STA $47
    code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)             // JSR $CnC0
    const bcs3Idx = code.length
    code.push(0xB0, 0x00)                                        // BCS DONE (patched below)
    code.push(0x4C, 0x00, 0x02)                                  // JMP $0200

    // --- Patch BCS targets ---
    const doneOffset = code.length
    code[bcsIdx + 1] = (doneOffset - (bcsIdx + 2)) & 0xFF
    code[bcs2Idx + 1] = (doneOffset - (bcs2Idx + 2)) & 0xFF
    code[bcs3Idx + 1] = (doneOffset - (bcs3Idx + 2)) & 0xFF
    code.push(0x00)                                              // BRK (error halt)

    if (code.length > 256) throw new Error(`createOfflineDecompRelay: relay code too large (${code.length} bytes, max 256)`)
    const relayBlock = new Uint8Array(BLOCK_SIZE)
    relayBlock.set(code)
    relayBlock.set(decompressed.slice(0x0300, 0x0400), 256)

    return { relay: relayBlock, flatBinary }
  }

  // ============================================================
  // SINGLE-FILE GAMES: Build-time postOps path (original behavior)
  // ============================================================
  // For games without supplementary files, run all postOps at build time in the
  // mini-interpreter. This avoids executing game init code at runtime that
  // accesses IIgs-only soft switches ($C021-$C035) or ProDOS MLI ($BF00).

  // Pre-populate $D000-$FFFF with Apple IIe ROM content (Applesoft + Monitor).
  // Game initialization code may call ROM routines at build time.
  // Without ROM data, those calls execute zeros and loop forever.
  const romBytes = Uint8Array.from(atob(romBase64.replace(/\n/g, "")), c => c.charCodeAt(0))
  decompressed.set(romBytes.subarray(0x1000, 0x4000), 0xD000)

  // Stub accelerator functions and set safe BRK vector
  decompressed[0xDFAE] = 0x60  // HideLaunchArtworkLC2 → RTS
  decompressed[0xDFB4] = 0x60  // DisableAccelerator → RTS
  decompressed[0xDFB7] = 0x60  // EnableAccelerator → RTS
  decompressed[0xDFFC] = 0x40  // RTI opcode for safe BRK handler
  decompressed[0xFFFE] = 0xFC  // BRK vector lo → $DFFC
  decompressed[0xFFFF] = 0xDF  // BRK vector hi → $DFFC

  // Minimal ProDOS MLI stub at $BF00 — skips the 3-byte inline parameter block
  // (call_number + param_ptr) and returns success (C=0, A=0).
  const mliStub = [
    0x68,             // PLA (ret lo)
    0x18,             // CLC
    0x69, 0x03,       // ADC #3
    0xAA,             // TAX
    0x68,             // PLA (ret hi)
    0x69, 0x00,       // ADC #0
    0x48,             // PHA (adjusted hi)
    0x8A,             // TXA
    0x48,             // PHA (adjusted lo)
    0xA9, 0x00,       // LDA #0
    0x18,             // CLC
    0x60,             // RTS
  ]
  for (let i = 0; i < mliStub.length; i++) decompressed[0xBF00 + i] = mliStub[i]

  // Execute post-decompress ops on the decompressed memory
  for (const step of postOps) {
    switch (step.op) {
      case "patch":
        decompressed[step.addr] = step.val & 0xFF
        break
      case "inc_reset_checksum":
        decompressed[0x03F4] = (decompressed[0x03F4] + 1) & 0xFF
        break
      case "call": {
        const saved = new Uint8Array(decompressed)
        try {
          run6502OnMem(decompressed, step.addr)
        } catch {
          // Call exceeded cycle limit or hit unknown opcode — rollback.
          decompressed.set(saved)
        }
        break
      }
      case "rwRam2":
      case "readRom":
      case "rdRam2":
        // LC banking is a no-op in the flat 64KB model
        break
    }
  }

  // Extract flat binary: $0800-$BFFF (main memory) + $D000-$FFFF (LC bank 2)
  const MAIN_START = 0x0800
  const MAIN_END = 0xC000  // exclusive
  const LC_START = 0xD000
  const LC_END = 0x10000   // exclusive
  const mainSize = MAIN_END - MAIN_START  // $B800 = 47104
  const lcSize = LC_END - LC_START        // $3000 = 12288
  const flatBinary = new Uint8Array(mainSize + lcSize)
  flatBinary.set(decompressed.slice(MAIN_START, MAIN_END), 0)
  flatBinary.set(decompressed.slice(LC_START, LC_END), mainSize)

  // === RUNTIME RELAY (single-file) ===
  const mainBlockCount = Math.ceil(mainSize / BLOCK_SIZE)     // 92
  const lcBlockCount = Math.ceil(lcSize / BLOCK_SIZE)         // 24
  const lcStartBlock = startBlock + mainBlockCount

  const code: number[] = []

  // --- Phase 1: Init ZP for device driver + load main memory ($0800-$BFFF) ---
  code.push(0xA9, 0x01, 0x85, 0x42)                          // LDA #1, STA $42 (READ)
  code.push(0xA9, unitNumber & 0xFF, 0x85, 0x43)             // LDA #unit, STA $43
  code.push(0xA9, MAIN_START & 0xFF, 0x85, 0x44)             // LDA #$00, STA $44 (buf lo)
  code.push(0xA9, (MAIN_START >> 8) & 0xFF, 0x85, 0x45)      // LDA #$08, STA $45 (buf hi)
  code.push(0xA9, startBlock & 0xFF, 0x85, 0x46)             // LDA #blkLo, STA $46
  code.push(0xA9, (startBlock >> 8) & 0xFF, 0x85, 0x47)      // LDA #blkHi, STA $47
  code.push(0xA9, mainBlockCount & 0xFF, 0x85, 0xF4)         // LDA #countLo, STA $F4
  code.push(0xA9, (mainBlockCount >> 8) & 0xFF, 0x85, 0xF5)  // LDA #countHi, STA $F5

  const loopOffset = code.length
  code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)            // JSR $CnC0
  const bcsIdx = code.length
  code.push(0xB0, 0x00)                                       // BCS DONE (patched below)
  code.push(0xA5, 0x45, 0x18, 0x69, 0x02, 0x85, 0x45)       // advance buf (+512)
  code.push(0xE6, 0x46, 0xD0, 0x02, 0xE6, 0x47)             // advance block
  code.push(0x38, 0xA5, 0xF4, 0xE9, 0x01, 0x85, 0xF4)       // dec count lo
  code.push(0xA5, 0xF5, 0xE9, 0x00, 0x85, 0xF5)             // dec count hi
  code.push(0x05, 0xF4)                                       // ORA $F4
  const bneIdx = code.length
  code.push(0xD0, (loopOffset - (bneIdx + 2)) & 0xFF)        // BNE LOOP

  // --- Phase 2: Enable LC bank 2 and load $D000-$FFFF ---
  code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083
  code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083 (enable LC bank 2 r/w)
  code.push(0xA9, LC_START & 0xFF, 0x85, 0x44)               // LDA #$00, STA $44 (buf lo)
  code.push(0xA9, (LC_START >> 8) & 0xFF, 0x85, 0x45)        // LDA #$D0, STA $45 (buf hi)
  code.push(0xA9, lcStartBlock & 0xFF, 0x85, 0x46)           // LDA #lcBlkLo, STA $46
  code.push(0xA9, (lcStartBlock >> 8) & 0xFF, 0x85, 0x47)    // LDA #lcBlkHi, STA $47
  code.push(0xA9, lcBlockCount & 0xFF, 0x85, 0xF4)           // LDA #lcCountLo, STA $F4
  code.push(0xA9, (lcBlockCount >> 8) & 0xFF, 0x85, 0xF5)    // LDA #lcCountHi, STA $F5

  const loop2Offset = code.length
  code.push(0x20, DRIVER_ADDR_LO, DRIVER_ADDR_HI)            // JSR $CnC0
  const bcs2Idx = code.length
  code.push(0xB0, 0x00)                                       // BCS DONE (patched below)
  code.push(0xA5, 0x45, 0x18, 0x69, 0x02, 0x85, 0x45)       // advance buf (+512)
  code.push(0xE6, 0x46, 0xD0, 0x02, 0xE6, 0x47)             // advance block
  code.push(0x38, 0xA5, 0xF4, 0xE9, 0x01, 0x85, 0xF4)       // dec count lo
  code.push(0xA5, 0xF5, 0xE9, 0x00, 0x85, 0xF5)             // dec count hi
  code.push(0x05, 0xF4)                                       // ORA $F4
  const bne2Idx = code.length
  code.push(0xD0, (loop2Offset - (bne2Idx + 2)) & 0xFF)      // BNE LOOP2

  // --- Phase 3: Stub accelerator functions + safe BRK vector (in LC bank 2) ---
  code.push(0xA9, 0x60)                                       // LDA #$60 (RTS)
  code.push(0x8D, 0xAE, 0xDF)                                 // STA $DFAE (HideLaunchArtworkLC2)
  code.push(0x8D, 0xB4, 0xDF)                                 // STA $DFB4 (DisableAccelerator)
  code.push(0x8D, 0xB7, 0xDF)                                 // STA $DFB7 (EnableAccelerator)
  code.push(0xA9, 0x40)                                       // LDA #$40 (RTI)
  code.push(0x8D, 0xFC, 0xDF)                                 // STA $DFFC
  code.push(0xA9, 0xFC)                                       // LDA #$FC
  code.push(0x8D, 0xFE, 0xFF)                                 // STA $FFFE (BRK vector lo)
  code.push(0xA9, 0xDF)                                       // LDA #$DF
  code.push(0x8D, 0xFF, 0xFF)                                 // STA $FFFF (BRK vector hi)

  // --- Phase 4: Install trampoline on stack page ($01C0) ---
  const TRAMPOLINE_ADDR = 0x01C0
  const tramp: number[] = [
    0xA2, 0x00,                           // LDX #0
    0xBD, 0x00, 0x04,                     // LDA $0400,X   (source: embedded game data)
    0x9D, 0x00, 0x03,                     // STA $0300,X   (dest: game's $0300 page)
    0xE8,                                 // INX
    0xD0, 0xF7,                           // BNE -9        (loop 256 times)
    0x78,                                 // SEI
    0xA2, 0xFF,                           // LDX #$FF
    0x9A,                                 // TXS
    0x8D, 0x00, 0xC0,                     // STA $C000     (80STORE off)
    0x8D, 0x02, 0xC0,                     // STA $C002     (RAMRD main)
    0x8D, 0x04, 0xC0,                     // STA $C004     (RAMWRT main)
    0x8D, 0x06, 0xC0,                     // STA $C006     (SLOTCXROM)
    0x8D, 0x08, 0xC0,                     // STA $C008     (ALTZP off)
    0x8D, 0x0C, 0xC0,                     // STA $C00C     (80COL off)
    0x8D, 0x0E, 0xC0,                     // STA $C00E     (ALTCHAR off)
    0x8D, 0x10, 0xC0,                     // STA $C010     (keyboard strobe)
    0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF, // JMP entry
  ]
  const trampDataAddr = RELAY_LOAD_ADDRESS + code.length + 14 // 14 = copy loop + JMP size
  code.push(0xA2, tramp.length - 1)                           // LDX #(trampLen-1)
  const copyLoopStart = code.length
  code.push(0xBD, trampDataAddr & 0xFF, (trampDataAddr >> 8) & 0xFF)  // LDA trampData,X
  code.push(0x9D, TRAMPOLINE_ADDR & 0xFF, (TRAMPOLINE_ADDR >> 8) & 0xFF)  // STA $01C0,X
  code.push(0xCA)                                              // DEX
  const bplIdx = code.length
  code.push(0x10, (copyLoopStart - (bplIdx + 2)) & 0xFF)     // BPL copy_loop
  code.push(0x4C, TRAMPOLINE_ADDR & 0xFF, (TRAMPOLINE_ADDR >> 8) & 0xFF)  // JMP $01C0
  code.push(...tramp)

  // --- Patch BCS targets ---
  const doneOffset = code.length
  code[bcsIdx + 1] = (doneOffset - (bcsIdx + 2)) & 0xFF
  code[bcs2Idx + 1] = (doneOffset - (bcs2Idx + 2)) & 0xFF
  code.push(0x00)                                              // BRK (error halt)

  if (code.length > 256) throw new Error(`createOfflineDecompRelay: relay code too large (${code.length} bytes, max 256)`)
  const relayBlock = new Uint8Array(BLOCK_SIZE)
  relayBlock.set(code)
  relayBlock.set(decompressed.slice(0x0300, 0x0400), 256)

  return { relay: relayBlock, flatBinary }
}

/**
 * Creates a relay program that loads a packed (compressed) binary from the
 * HDV, sets up the 4cade launch environment, and starts runtime decompression.
 *
 * This replicates 4cade/Total Replay's launch flow:
 *   1. Load packed binary from HD blocks to its load address
 *   2. Stub LC bank 2 functions (EnableAccelerator, DisableAccelerator,
 *      HideLaunchArtworkLC2) with RTS so the prelaunch JSR calls return safely
 *   3. Copy the prelaunch script bytes to $0106 (stack page) — this is critical
 *      because SAN INC uses the entire 64 KB as an LZ dictionary; the stack page
 *      contents must match what 4cade has at decompression time
 *      Numeric $0100 reset vectors also install a standalone ROM-reboot wrapper
 *      at $0100-$0105, replacing 4cade's unavailable UI re-entry target.
 *   4. Copy PrelaunchInit stub to $EA-$FF (zero page)
 *   5. LaunchInternal: wipe ZP $00-$4D, seed RNDSEED, reset aux switches,
 *      clear keyboard, reset stack, SEI
 *   6. JMP $EA → PrelaunchInit → ROM calls → JMP $0106 → prelaunch → decompress
 *
 * Layout in relay block: [relay code] [PrelaunchInit data (22 bytes)] [prelaunch data]
 */
export const createPackedBinaryRelay = (
  startBlock: number,
  loadAddress: number,
  blockCount: number,
  _unitNumber: number,
  sequence: PrelaunchOp[],
  entryAddress: number | { indirect: number },
  relayLoadAddress = RELAY_LOAD_ADDRESS,
): Uint8Array => {
  // --- Assemble the prelaunch script into raw 6502 bytes ---
  // These bytes will be copied to $0106 at runtime.
  // The $0300 relay occupies part of text page 1. Clear it only after execution
  // has moved to the stack-page prelaunch, so no active relay bytes are erased.
  const prelaunchBytes: number[] = [
    0xA9, 0xA0,                                                 // LDA #$A0 (blank text character)
    0xA2, 0x00,                                                 // LDX #$00
    0x9D, 0x00, 0x04,                                           // STA $0400,X
    0x9D, 0x00, 0x05,                                           // STA $0500,X
    0x9D, 0x00, 0x06,                                           // STA $0600,X
    0x9D, 0x00, 0x07,                                           // STA $0700,X
    0xE8,                                                       // INX
    0xD0, 0xF1,                                                 // BNE clear loop
  ]

  // Track callback vector placeholder positions for patching
  let cbVectorLoIdx = -1  // index in prelaunchBytes of callback addr lo byte
  let cbVectorHiIdx = -1  // index in prelaunchBytes of callback addr hi byte
  let cbBodyOffset = -1   // byte offset where callback body starts
  let skipCallbackOps = false  // skip ops after jmp_decompress (callback body is just RTS)
  let resetVectorLoIdx = -1
  let resetVectorHiIdx = -1
  let resetHandlerLoIdx = -1
  let resetHandlerHiIdx = -1
  let resetHandlerMode: "rdRam2" | undefined
  let usesResetVector100 = false
  const installedRoutines: Array<{ loIdx: number; hiIdx: number; bytes: number[] }> = []

  for (const step of sequence) {
    if (skipCallbackOps) continue  // callback body ops are no-ops for us
    switch (step.op) {
      case "patch":
        prelaunchBytes.push(0xA9, step.val & 0xFF)                              // LDA #val
        prelaunchBytes.push(0x8D, step.addr & 0xFF, (step.addr >> 8) & 0xFF)    // STA addr
        break
      case "inc_reset_checksum":
        prelaunchBytes.push(0xEE, 0xF4, 0x03)                                  // INC $03F4
        break
      case "call":
      case "decompress":
        prelaunchBytes.push(0x20, step.addr & 0xFF, (step.addr >> 8) & 0xFF)    // JSR addr
        break
      case "readRom":
        prelaunchBytes.push(0x8D, 0x82, 0xC0)                                   // STA $C082
        break
      case "rwRam2":
        prelaunchBytes.push(0x2C, 0x83, 0xC0, 0x2C, 0x83, 0xC0)                // BIT $C083 x2
        break
      case "rdRam2":
        prelaunchBytes.push(0x8D, 0x80, 0xC0)                                   // STA $C080
        break
      case "callback_vector":
        // LDA #<callback; STA loAddr; LDA #>callback; STA hiAddr
        // The callback address bytes are placeholders — patched below.
        prelaunchBytes.push(0xA9)
        cbVectorLoIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00)                                                // placeholder lo
        prelaunchBytes.push(0x8D, step.loAddr & 0xFF, (step.loAddr >> 8) & 0xFF) // STA loAddr
        prelaunchBytes.push(0xA9)
        cbVectorHiIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00)                                                // placeholder hi
        prelaunchBytes.push(0x8D, step.hiAddr & 0xFF, (step.hiAddr >> 8) & 0xFF) // STA hiAddr
        break
      case "jmp_decompress":
        prelaunchBytes.push(0x4C, step.addr & 0xFF, (step.addr >> 8) & 0xFF)    // JMP addr
        cbBodyOffset = prelaunchBytes.length  // callback body starts here
        // The decompressor leaves LC in r/w mode (game data may extend to
        // $D000-$FFFF in LC bank 2).  Do NOT switch to ROM-read here — the game
        // or decompressor needs LC readable after callback return.  Our JSR stubs
        // ($DFB4/$DFAE) are no-ops, so the callback is just RTS.
        skipCallbackOps = true  // skip remaining ops (they're no-op JSR stubs + readRom)
        break
      case "reset_vector":
        prelaunchBytes.push(0x2C, 0x83, 0xC0, 0x2C, 0x83, 0xC0)                // BIT $C083 x2 (LC bank 2 r/w)
        prelaunchBytes.push(0xA9)
        resetVectorLoIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00)                                                // reset address lo placeholder
        prelaunchBytes.push(0x8D, 0xF2, 0x03)                                   // STA $03F2
        prelaunchBytes.push(0x8D, 0xFC, 0xFF)                                   // STA $FFFC
        prelaunchBytes.push(0xA9)
        resetVectorHiIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00)                                                // reset address hi placeholder
        prelaunchBytes.push(0x8D, 0xF3, 0x03)                                   // STA $03F3
        prelaunchBytes.push(0x8D, 0xFD, 0xFF)                                   // STA $FFFD
        prelaunchBytes.push(0x49, 0xA5)                                         // EOR #$A5
        prelaunchBytes.push(0x8D, 0xF4, 0x03)                                   // STA $03F4
        break
      case "reset_vector_100":
        usesResetVector100 = true
        prelaunchBytes.push(0xA9, 0x00, 0x8D, 0xF2, 0x03)                       // LDA #$00; STA $03F2
        prelaunchBytes.push(0xA9, 0x01, 0x8D, 0xF3, 0x03)                       // LDA #$01; STA $03F3
        prelaunchBytes.push(0x49, 0xA5, 0x8D, 0xF4, 0x03)                       // EOR #$A5; STA $03F4
        break
      case "reset_handler":
        prelaunchBytes.push(0xA9)
        resetHandlerLoIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00, 0x8D, 0xF2, 0x03)                             // LDA #lo; STA $03F2
        prelaunchBytes.push(0xA9)
        resetHandlerHiIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00, 0x8D, 0xF3, 0x03)                             // LDA #hi; STA $03F3
        prelaunchBytes.push(0x49, 0xA5, 0x8D, 0xF4, 0x03)                       // EOR #$A5; STA $03F4
        resetHandlerMode = step.mode
        break
      case "install_routine": {
        prelaunchBytes.push(0xA9)
        const loIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00, 0x8D, step.loAddr & 0xFF, step.loAddr >> 8)
        prelaunchBytes.push(0xA9)
        const hiIdx = prelaunchBytes.length
        prelaunchBytes.push(0x00, 0x8D, step.hiAddr & 0xFF, step.hiAddr >> 8)
        installedRoutines.push({ loIdx, hiIdx, bytes: step.bytes })
        break
      }
    }
  }

  // Patch callback vector with computed address if this is a callback-based prelaunch.
  // The callback body is assembled right after the JMP, at $0106 + cbBodyOffset.
  if (cbVectorLoIdx >= 0 && cbVectorHiIdx >= 0 && cbBodyOffset >= 0) {
    const cbAddr = 0x0106 + cbBodyOffset
    prelaunchBytes[cbVectorLoIdx] = cbAddr & 0xFF
    prelaunchBytes[cbVectorHiIdx] = (cbAddr >> 8) & 0xFF
    // Callback body: The SAN INC decompressor's first stage copies its
    // second-stage decompression code to $BF00, then JMPs here (via the
    // modified JMP at the callback_vector address).  We MUST call the
    // second-stage decompressor with JSR $BF00 to actually decompress the game.
    // After decompression returns, switch LC to readRom (matching 4cade's
    // +DISABLE_ACCEL_AND_HIDE_ARTWORK_LC which ends with STA $C082).
    // The game will set its own LC banking as needed.
    prelaunchBytes.push(0x20, 0x00, 0xBF)                                       // JSR $BF00 (run stage-2 decompressor)
    prelaunchBytes.push(0x8D, 0x82, 0xC0)                                       // STA $C082 (read ROM, no write — matches 4cade)
    prelaunchBytes.push(0x60)                                                    // RTS
  }

  // Final JMP to game entry point (skipped for callback-based prelaunches
  // where the decompressor handles the entry jump internally).
  if (typeof entryAddress === "number") {
    if (entryAddress >= 0) {
      prelaunchBytes.push(0x4C, entryAddress & 0xFF, (entryAddress >> 8) & 0xFF)
    }
  } else {
    prelaunchBytes.push(0x6C, entryAddress.indirect & 0xFF, (entryAddress.indirect >> 8) & 0xFF)
  }

  if (resetVectorLoIdx >= 0 && resetVectorHiIdx >= 0) {
    const resetAddress = 0x0106 + prelaunchBytes.length
    prelaunchBytes[resetVectorLoIdx] = resetAddress & 0xFF
    prelaunchBytes[resetVectorHiIdx] = (resetAddress >> 8) & 0xFF
    prelaunchBytes.push(0x8D, 0x82, 0xC0)                                       // STA $C082 (read ROM, no write)
    prelaunchBytes.push(0xEE, 0xF4, 0x03)                                       // INC $03F4
    prelaunchBytes.push(0x6C, 0xFC, 0xFF)                                       // JMP ($FFFC)
  }

  if (resetHandlerLoIdx >= 0 && resetHandlerHiIdx >= 0 && resetHandlerMode) {
    const resetAddress = 0x0106 + prelaunchBytes.length
    prelaunchBytes[resetHandlerLoIdx] = resetAddress & 0xFF
    prelaunchBytes[resetHandlerHiIdx] = resetAddress >> 8
    if (resetHandlerMode === "rdRam2") prelaunchBytes.push(0x8D, 0x80, 0xC0)   // STA $C080
    prelaunchBytes.push(0x6C, 0xFC, 0xFF)                                       // JMP ($FFFC)
  }

  for (const routine of installedRoutines) {
    const routineAddress = 0x0106 + prelaunchBytes.length
    prelaunchBytes[routine.loIdx] = routineAddress & 0xFF
    prelaunchBytes[routine.hiIdx] = routineAddress >> 8
    prelaunchBytes.push(...routine.bytes)
  }

  // PrelaunchInit stub: 22 bytes at $EA-$FF (matches 4cade exactly)
  // PrelaunchInit — NO firmware dispatch (avoids $FBB4 → STA $C007 → empty slot BRK).
  // Direct ZP writes replace JSR $FE89/$FE93/$FE84. Soft switches/HOME done in Phase 5.
  const PREINIT_BYTES = [
    0xA9, 0xF0, 0x85, 0x36, // $EA: LDA #$F0, STA $36  (CSWL)
    0xA9, 0x1B, 0x85, 0x38, // $EE: LDA #$1B, STA $38  (KSWL)
    0xA9, 0xFD,              // $F2: LDA #$FD
    0x85, 0x37,              // $F4: STA $37             (CSWH → CSW=$FDF0)
    0x85, 0x39,              // $F6: STA $39             (KSWH → KSW=$FD1B)
    0xA9, 0xFF, 0x85, 0x32, // $F8: LDA #$FF, STA $32  (INVFLG — NORMAL mode)
    0x78,                    // $FC: SEI
    0x4C, 0x06, 0x01,       // $FD: JMP $0106
  ]

  const code: number[] = []

  // ======= PHASE 1: Block-read loop — load packed binary from HD =======
  code.push(0xAD, 0x30, 0xBF)                                 // LDA $BF30
  const staMliUnitOffset = code.length
  code.push(0x8D, 0x00, 0x00)                                 // STA mliParams+1

  const mliLoopOffset = code.length
  code.push(0x20, 0x00, 0xBF, 0x80)                           // JSR $BF00; READ_BLOCK
  const mliParameterPointerOffset = code.length
  code.push(0x00, 0x00)                                       // .word mliParams
  const mliBcsOffset = code.length
  code.push(0xB0, 0x00)                                       // BCS error
  const incMliBufferHi1Offset = code.length
  code.push(0xEE, 0x00, 0x00)                                 // INC mliParams+3
  const incMliBufferHi2Offset = code.length
  code.push(0xEE, 0x00, 0x00)                                 // INC mliParams+3
  const incMliBlockLoOffset = code.length
  code.push(0xEE, 0x00, 0x00)                                 // INC mliParams+4
  code.push(0xD0, 0x03)                                       // BNE count
  const incMliBlockHiOffset = code.length
  code.push(0xEE, 0x00, 0x00)                                 // INC mliParams+5
  code.push(0x38)                                              // SEC
  const ldaMliCountLoOffset = code.length
  code.push(0xAD, 0x00, 0x00)                                 // LDA mliCount
  code.push(0xE9, 0x01)                                       // SBC #1
  const staMliCountLoOffset = code.length
  code.push(0x8D, 0x00, 0x00)                                 // STA mliCount
  const ldaMliCountHiOffset = code.length
  code.push(0xAD, 0x00, 0x00)                                 // LDA mliCount+1
  code.push(0xE9, 0x00)                                       // SBC #0
  const staMliCountHiOffset = code.length
  code.push(0x8D, 0x00, 0x00)                                 // STA mliCount+1
  const oraMliCountLoOffset = code.length
  code.push(0x0D, 0x00, 0x00)                                 // ORA mliCount
  code.push(0xD0, (mliLoopOffset - (code.length + 2)) & 0xFF) // BNE mliLoop
  const jmpMliDoneOffset = code.length
  code.push(0x4C, 0x00, 0x00)                                 // JMP done

  const errorOffset = code.length
  code.push(0x00)                                              // BRK
  const doneOffset = code.length
  code[mliBcsOffset + 1] = (errorOffset - (mliBcsOffset + 2)) & 0xFF
  const doneAddress = relayLoadAddress + doneOffset
  code[jmpMliDoneOffset + 1] = doneAddress & 0xFF
  code[jmpMliDoneOffset + 2] = doneAddress >> 8

  // ======= PHASE 2: Stub LC bank 2 functions and set safe BRK vector =======
  // The prelaunch script JSRs to EnableAccelerator ($DFB7), DisableAccelerator
  // ($DFB4), and HideLaunchArtworkLC2 ($DFAE) in LC bank 2.  In 4cade these are
  // real routines; here we stub them with RTS so the calls return immediately.
  // Also write an RTI at $DFFC and set BRK vector ($FFFE/$FFFF) to point there
  // as a safety net for any BRK during rwRam2 mode.
  code.push(0x78)                                              // SEI (disable IRQs)
  code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083
  code.push(0x2C, 0x83, 0xC0)                                 // BIT $C083 (enable LC bank 2 r/w)
  code.push(0xA9, 0x60)                                       // LDA #$60 (RTS opcode)
  code.push(0x8D, 0xAE, 0xDF)                                 // STA $DFAE (HideLaunchArtworkLC2)
  code.push(0x8D, 0xB4, 0xDF)                                 // STA $DFB4 (DisableAccelerator)
  code.push(0x8D, 0xB7, 0xDF)                                 // STA $DFB7 (EnableAccelerator)
  // Safe BRK/IRQ vector: RTI at $DFFC, vector $FFFE/$FFFF → $DFFC
  code.push(0xA9, 0x40)                                       // LDA #$40 (RTI opcode)
  code.push(0x8D, 0xFC, 0xDF)                                 // STA $DFFC
  code.push(0xA9, 0xFC)                                       // LDA #$FC
  code.push(0x8D, 0xFE, 0xFF)                                 // STA $FFFE (vector low)
  code.push(0xA9, 0xDF)                                       // LDA #$DF
  code.push(0x8D, 0xFF, 0xFF)                                 // STA $FFFF (vector high)

  // ======= PHASE 3: Copy prelaunch bytes to $0106 =======
  // The prelaunch data is stored at the end of this relay block.  A simple
  // copy loop writes it to $0106+ on the stack page.
  // We compute the absolute address of prelaunchData after all code + PREINIT.
  // (Address is patched after code assembly is complete.)
  code.push(0xA2, prelaunchBytes.length)                       // LDX #prelaunchLen
  const prelaunchCopySrcIdx = code.length
  code.push(0xBD, 0x00, 0x00)                                 // LDA prelaunchData-1,X (patched below)
  code.push(0x9D, 0x05, 0x01)                                 // STA $0105,X
  code.push(0xCA)                                              // DEX
  code.push(0xD0, 0xF7)                                       // BNE loop (back to LDA)

  let reentryCopySrcIdx = -1
  if (usesResetVector100) {
    code.push(0xA2, 0x06)                                     // LDX #6
    reentryCopySrcIdx = code.length
    code.push(0xBD, 0x00, 0x00)                               // LDA reentryData-1,X (patched below)
    code.push(0x9D, 0xFF, 0x00)                               // STA $00FF,X
    code.push(0xCA)                                            // DEX
    code.push(0xD0, 0xF7)                                     // BNE loop (back to LDA)
  }

  // ======= PHASE 4: Copy PrelaunchInit stub to $EA-$FF =======
  code.push(0xA2, PREINIT_BYTES.length)                        // LDX #22
  const preinitCopySrcIdx = code.length
  code.push(0xBD, 0x00, 0x00)                                 // LDA preinitData-1,X (patched below)
  code.push(0x9D, 0xE9, 0x00)                                 // STA $00E9,X
  code.push(0xCA)                                              // DEX
  code.push(0xD0, 0xF7)                                       // BNE loop (back to LDA)

  // ======= PHASE 5: LaunchInternal setup =======
  // Matches 4cade's LaunchInternal: wipe ZP, reset aux switches, seed RNDSEED.
  code.push(0x8D, 0x82, 0xC0)                                 // STA $C082 (read ROM, no write)
  code.push(0x8D, 0x06, 0xC0)                                 // STA $C006 (INTCXROM — internal ROM for all slots)
  code.push(0x8D, 0x00, 0xC0)                                 // STA $C000 (80STORE off)
  code.push(0x8D, 0x02, 0xC0)                                 // STA $C002 (READMAINMEM)
  code.push(0x8D, 0x04, 0xC0)                                 // STA $C004 (WRITEMAINMEM)
  code.push(0x8D, 0x08, 0xC0)                                 // STA $C008 (ALTZP off)
  code.push(0x8D, 0x0C, 0xC0)                                 // STA $C00C (CLR80VID)
  code.push(0x8D, 0x0E, 0xC0)                                 // STA $C00E (ALTCHAR off)
  code.push(0x8D, 0x10, 0xC0)                                 // STA $C010 (clear keyboard strobe)
  // Wipe ZP $00-$4D (LaunchInternal zeroes this range)
  code.push(0xA2, 0x00)                                       // LDX #$00
  code.push(0xA9, 0x00)                                       // LDA #$00
  const zpWipeLoop = code.length
  code.push(0x95, 0x00)                                       // STA $00,X
  code.push(0xE8)                                              // INX
  code.push(0xE0, 0x4E)                                       // CPX #$4E
  code.push(0xD0, (zpWipeLoop - (code.length + 2)) & 0xFF)    // BNE zpWipeLoop
  // Seed RNDSEED ($4E=$65, $4F=$02) — matches 4cade's LaunchInternal
  code.push(0xA9, 0x65, 0x85, 0x4E)                           // LDA #$65, STA $4E
  code.push(0xA9, 0x02, 0x85, 0x4F)                           // LDA #$02, STA $4F
  // Set text window (ZP wipe left $21/$23 at 0; HOME needs valid window)
  code.push(0xA9, 0x28, 0x85, 0x21)                           // LDA #$28, STA $21 (WNDWDTH=40)
  code.push(0xA9, 0x18, 0x85, 0x23)                           // LDA #$18, STA $23 (WNDBTM=24)
  // SETTXT via soft switches (no firmware dispatch)
  code.push(0x2C, 0x51, 0xC0)                                 // BIT $C051 (TEXT)
  code.push(0x2C, 0x54, 0xC0)                                 // BIT $C054 (PAGE1)
  code.push(0x2C, 0x56, 0xC0)                                 // BIT $C056 (LORES)
  // Reset stack and disable interrupts
  code.push(0xA2, 0xFF, 0x9A)                                 // LDX #$FF, TXS
  code.push(0x78)                                              // SEI

  // ======= PHASE 6: JMP $EA — start PrelaunchInit =======
  code.push(0x4C, 0xEA, 0x00)                                 // JMP $00EA

  // ======= DATA SECTION =======
  // PrelaunchInit data (22 bytes)
  const preinitDataOffset = code.length
  code.push(...PREINIT_BYTES)
  // Prelaunch data (variable length)
  const prelaunchDataOffset = code.length
  code.push(...prelaunchBytes)
  const reentryDataOffset = code.length
  if (usesResetVector100) {
    code.push(0x8D, 0x82, 0xC0)                               // STA $C082 (read ROM, no write)
    code.push(0x6C, 0xFC, 0xFF)                               // JMP ($FFFC) (ROM reset vector)
  }
  const mliParamsOffset = code.length
  code.push(
    0x03, 0x00,
    loadAddress & 0xFF, (loadAddress >> 8) & 0xFF,
    startBlock & 0xFF, (startBlock >> 8) & 0xFF,
  )
  const mliCountOffset = code.length
  code.push(blockCount & 0xFF, (blockCount >> 8) & 0xFF)

  const mliParamsAddress = relayLoadAddress + mliParamsOffset
  const mliCountAddress = relayLoadAddress + mliCountOffset
  const patchAbsolute = (offset: number, address: number) => {
    code[offset + 1] = address & 0xFF
    code[offset + 2] = address >> 8
  }
  patchAbsolute(staMliUnitOffset, mliParamsAddress + 1)
  code[mliParameterPointerOffset] = mliParamsAddress & 0xFF
  code[mliParameterPointerOffset + 1] = mliParamsAddress >> 8
  patchAbsolute(incMliBufferHi1Offset, mliParamsAddress + 3)
  patchAbsolute(incMliBufferHi2Offset, mliParamsAddress + 3)
  patchAbsolute(incMliBlockLoOffset, mliParamsAddress + 4)
  patchAbsolute(incMliBlockHiOffset, mliParamsAddress + 5)
  patchAbsolute(ldaMliCountLoOffset, mliCountAddress)
  patchAbsolute(staMliCountLoOffset, mliCountAddress)
  patchAbsolute(ldaMliCountHiOffset, mliCountAddress + 1)
  patchAbsolute(staMliCountHiOffset, mliCountAddress + 1)
  patchAbsolute(oraMliCountLoOffset, mliCountAddress)

  // --- Patch copy-loop source addresses ---
  // Phase 3: LDA prelaunchData-1+RELAY_LOAD_ADDRESS,X
  const prelaunchAbsAddr = relayLoadAddress + prelaunchDataOffset - 1
  code[prelaunchCopySrcIdx + 1] = prelaunchAbsAddr & 0xFF
  code[prelaunchCopySrcIdx + 2] = (prelaunchAbsAddr >> 8) & 0xFF
  if (reentryCopySrcIdx >= 0) {
    const reentryAbsAddr = relayLoadAddress + reentryDataOffset - 1
    code[reentryCopySrcIdx + 1] = reentryAbsAddr & 0xFF
    code[reentryCopySrcIdx + 2] = reentryAbsAddr >> 8
  }
  // Phase 4: LDA preinitData-1+RELAY_LOAD_ADDRESS,X
  const preinitAbsAddr = relayLoadAddress + preinitDataOffset - 1
  code[preinitCopySrcIdx + 1] = preinitAbsAddr & 0xFF
  code[preinitCopySrcIdx + 2] = (preinitAbsAddr >> 8) & 0xFF

  return new Uint8Array(code)
}

const RELAY_LOAD_ADDRESS = 0x0300

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
  }

  if (appliedTargets === 0) {
    return { error: "Could not patch any DOS.MASTER runtime config target with active device pairs." }
  }

  patchFinderDataCompanionMetadata()

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
  }

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
  } catch {
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
  const { outputFiles, directoryPlans, menuProDosCommands, menuProDosPrefixes, menuNeedsAliasShim, runtimeVolumes, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, fourCadeEntries } = await preprocessInputFilesForMenu(files, menuEntries, rootScan.existingNames)
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

  // Generate direct-load relay binaries for "4cade" disks. Each relay is a tiny
  // 6502 program that uses ProDOS MLI READ_BLOCK to load the game binary from
  // contiguous blocks within the volume, then JMPs to the game's entry point.
  // 4cade data is stored as a contiguous block range allocated from the volume
  // bitmap (not appended past the end) to stay within the 16-bit block number
  // limit enforced by the ProDOS MLI READ_BLOCK interface.
  // When a ZP capture is available, an extra 512-byte block containing the captured
  // zero page is appended after the game data; the relay restores it before jumping.
  const allocateContiguousFreeBlocks = (count: number): number => {
    let start = -1
    let consecutive = 0
    for (let block = 0; block < currentTotalBlocks; block++) {
      if (isBlockFreeInBitmap(hdv, bitmapStartBlock, block)) {
        if (consecutive === 0) start = block
        consecutive++
        if (consecutive >= count) {
          for (let i = 0; i < count; i++) {
            setBlockUsedInBitmap(hdv, bitmapStartBlock, start + i)
          }
          return start
        }
      } else {
        consecutive = 0
      }
    }
    throw new Error(`Not enough contiguous free blocks. Need ${count}, best run was ${consecutive}.`)
  }

  const fourCadeRelayBlockInfo: Array<{ startBlock: number; blockCount: number; helperName: string } | undefined> = []
  const fourCadeRelayBinaries: Array<Uint8Array> = []
  const fourCadeBlockRanges: Array<{ startBlock: number; blockCount: number }> = []
  const unitNumber = ((dosMasterSlot & 0x07) << 4)  // slot N drive 1

  for (const entry of fourCadeEntries) {
    const gameBlockCount = Math.ceil(entry.binaryData.length / BLOCK_SIZE)
    const hasZP = !!entry.capturedZeroPage

    if (entry.prelaunch) {
      // --- 4cade prelaunch path: no RWTS shim, no DSK blocks ---
      // Allocate 1 extra block at the start for the relay binary itself.
      // Layout: [relay 1 block] [game data N blocks] [ZP 0-1 block]
      const relayBlockCount = 1
      const hasPrelaunchSequence = entry.prelaunch && entry.prelaunch.sequence.length > 0

      // ALL games with prelaunch sequences use runtime decompression
      // (createPackedBinaryRelay): the packed binary is stored as-is and
      // the Apple II runs the full prelaunch at boot. This is correct and
      // simple — the real hardware handles LC banking, multi-stage
      // decompression, ProDOS file I/O for supplementary files, etc.
      // Supplementary files (e.g. CONAN.MAIN) are added separately as
      // ProDOS BIN files on the HDV volume root.
      const effectiveGameBlockCount = gameBlockCount
      const totalBlockCount = relayBlockCount + effectiveGameBlockCount + (hasZP ? 1 : 0)

      const fourCadeStartBlock = allocateContiguousFreeBlocks(totalBlockCount)
      fourCadeBlockRanges.push({ startBlock: fourCadeStartBlock, blockCount: totalBlockCount })
      const helperName = `RLY${String(entry.menuIndex + 1).padStart(2, "0")}`
      fourCadeRelayBlockInfo[entry.menuIndex] = { startBlock: fourCadeStartBlock, blockCount: relayBlockCount, helperName }

      // Game data starts at fourCadeStartBlock + relayBlockCount (after the relay block)
      const gameDataStartBlock = fourCadeStartBlock + relayBlockCount

      let relayData: Uint8Array
      if (hasPrelaunchSequence) {
        // Runtime decompression on real hardware — handles all cases correctly
        relayData = createPackedBinaryRelay(
          gameDataStartBlock,
          entry.loadAddress,
          gameBlockCount,
          unitNumber,
          entry.prelaunch!.sequence,
          entry.prelaunch!.entry,
        )
      } else {
        relayData = createPrelaunchRelay(
            gameDataStartBlock,
            entry.loadAddress,
            gameBlockCount,
            unitNumber,
            [],   // no patches for fallback path
            [],   // no calls for fallback path
            entry.entryAddress,
            hasZP,
          )
      }

      fourCadeRelayBinaries.push(relayData)
      helperFiles.push({
        name: helperName,
        type: PRODOS_FILE_TYPE_BINARY,
        data: createProDosRelayWrapper(relayData),
        auxType: PRODOS_RELAY_WRAPPER_ADDRESS,
      })
      continue
    }

    // --- Generic RWTS-shim path (no prelaunch match) ---
    // If we have a raw disk image, allocate blocks for it (floppy read shim)
    // Allocate 1 extra block at the start for the relay binary itself.
    const relayBlockCount = 1
    const dskBlockCount = entry.rawDiskImage ? Math.ceil(entry.rawDiskImage.length / BLOCK_SIZE) : 0
    const totalBlockCount = relayBlockCount + gameBlockCount + (hasZP ? 1 : 0) + dskBlockCount

    const fourCadeStartBlock = allocateContiguousFreeBlocks(totalBlockCount)
    fourCadeBlockRanges.push({ startBlock: fourCadeStartBlock, blockCount: totalBlockCount })
    const helperName = `RLY${String(entry.menuIndex + 1).padStart(2, "0")}`
    fourCadeRelayBlockInfo[entry.menuIndex] = { startBlock: fourCadeStartBlock, blockCount: relayBlockCount, helperName }

    // Game data starts after relay block
    const gameDataStartBlock = fourCadeStartBlock + relayBlockCount
    // DSK base block is right after game + ZP blocks
    const dskBaseBlock = gameDataStartBlock + gameBlockCount + (hasZP ? 1 : 0)

    // When rawDiskImage is available, inject the floppy-read shim.
    // BurgerTime (and similar 4am cracks) copies $8000-$84FF → $0400-$08FF
    // at $68B0 BEFORE calling the RWTS. The game then JMPs to $07DC which
    // is in the RWTS area. The RWTS at $0600-$07FF has inline floppy access
    // that we cannot preserve. Instead, we:
    //   1. Place our HD-read shim at $0600 (116 bytes)
    //   2. NOP-fill $0674-$06C2, put JMP $0600 at $06C3 (redirects reads)
    //   3. NOP-fill $06C6-$07DB (kill remaining RWTS floppy code)
    //   4. Put JMP $0401 at $07DC (trampoline: skip floppy loader, go to
    //      the chain-loader at $0401 which uses JSR $06C3 → our shim)
    //   5. JMP $0600 at $07FB (safety net for NOP slides)
    // All patches applied to BOTH $0400+ (direct) and $8000+ (copy-source).
    let effectiveFloppyPatch = entry.floppyPatchAddress
    if (entry.rawDiskImage && entry.floppyPatchAddress !== undefined) {
      const shim = createFloppyReadShim(dskBaseBlock, unitNumber)

      // Helper: apply RWTS patches at a given base.
      const applyRwtsPatch = (base: number, label: string) => {
        const shimAddr = base + 0x0200       // $0600 or $8200
        const readEntryAddr = base + 0x02C3  // $06C3 or $82C3
        const loaderAddr = base + 0x03DC     // $07DC or $83DC

        const shimOff = shimAddr - entry.loadAddress
        const readEntryOff = readEntryAddr - entry.loadAddress
        const loaderOff = loaderAddr - entry.loadAddress

        if (shimOff < 0 || shimOff + shim.length > entry.binaryData.length) return false

        // Inject shim at $0600/$8200 (116 bytes, overwrites nibble-read code)
        entry.binaryData.set(shim, shimOff)
        // NOP-fill from shim end to $06C2 (within RWTS nibble area).
        for (let i = shimOff + shim.length; i < readEntryOff && i < entry.binaryData.length; i++) {
          entry.binaryData[i] = 0xEA
        }
        // JMP $0600 at $06C3 — redirects JSR $06C3 sector reads to shim
        if (readEntryOff + 2 < entry.binaryData.length) {
          entry.binaryData[readEntryOff] = 0x4C
          entry.binaryData[readEntryOff + 1] = 0x00
          entry.binaryData[readEntryOff + 2] = 0x06
        }
        // NOP-fill $06C6-$06FF (rest of RWTS page 6 = seek/verify routines).
        // These access floppy hardware and will hang if called. Game code
        // at $0700+ ($078B, $07BA) is preserved — it's NOT RWTS.
        const seekFillStart = readEntryOff + 3    // $06C6 or $82C6
        const seekFillEnd = shimOff + 0x0100      // $0700 or $8300 (page boundary)
        for (let i = seekFillStart; i < seekFillEnd && i < entry.binaryData.length; i++) {
          entry.binaryData[i] = 0xEA
        }
        // JMP $0401 at $07DC — trampoline: the game's $68B0 copy ends with
        // JMP $07DC; we redirect to the post-copy init at $0401.
        if (loaderOff + 2 < entry.binaryData.length) {
          entry.binaryData[loaderOff] = 0x4C      // JMP
          entry.binaryData[loaderOff + 1] = 0x01  // $0401 lo
          entry.binaryData[loaderOff + 2] = 0x04  // $0401 hi
        }
        return true
      }

      // Apply patches to the direct area ($0400+) for any pre-copy calls
      applyRwtsPatch(0x0400, "direct")

      // Also apply chain-loader bypass to direct $04C0 (same detection)
      const off04C0direct = 0x04C0 - entry.loadAddress
      if (off04C0direct >= 0 && off04C0direct + 10 <= entry.binaryData.length) {
        const b = entry.binaryData
        const isChainDirect = (
          b[off04C0direct] === 0x20 &&
          b[off04C0direct + 3] === 0xA9 && b[off04C0direct + 4] === 0x11 &&
          b[off04C0direct + 5] === 0x85 && b[off04C0direct + 6] === 0x80 &&
          b[off04C0direct + 7] === 0xA9 &&
          b[off04C0direct + 9] === 0x85 && b[off04C0direct + 10] === 0x81
        )
        const off090C = 0x090C - entry.loadAddress
        let tsValid = false
        if (off090C >= 0 && off090C + 4 <= entry.binaryData.length) {
          const t1 = b[off090C], s1 = b[off090C + 1]
          const t2 = b[off090C + 2], s2 = b[off090C + 3]
          tsValid = (t1 > 0 && t1 < 35 && s1 < 16 && t2 < 35 && s2 < 16 && (t2 > 0 || s2 > 0))
        }
        if (isChainDirect && tsValid) {
          entry.binaryData[off04C0direct] = 0x60
        }
      }

      // Apply patches to the copy-source area ($8000+) so they survive the
      // $8000-$84FF → $0400-$08FF copy at $68B0
      const srcBase = 0x8000
      const srcOff = srcBase - entry.loadAddress
      if (srcOff >= 0 && srcOff + 0x0500 <= entry.binaryData.length) {
        applyRwtsPatch(srcBase, "source")
        // Mirror boot sector (T0/S0) from the DSK to $8400-$84FF: the game's
        // copy at $68B0 copies $8000-$84FF → $0400-$08FF. The boot sector
        // was originally loaded to $0800 by the Apple II boot ROM. Our captured
        // $0800 has STALE self-modifying state (counters at $08F9-$08FF were
        // decremented during the initial floppy boot). Using T0/S0 from the
        // raw DSK gives us the pristine chain-loader state.
        const dst8400 = 0x8400 - entry.loadAddress
        if (entry.rawDiskImage && entry.rawDiskImage.length >= 256 &&
            dst8400 >= 0 && dst8400 + 256 <= entry.binaryData.length) {
          entry.binaryData.set(entry.rawDiskImage.slice(0, 256), dst8400)
          // Patch JMP ($D6) at T0/S0 offset $39 (= $0839 at runtime) to RTS.
          // This is the floppy seek call via the Disk II ROM. With the HD shim
          // handling all reads directly (any track/sector), physical seeking is
          // unnecessary and would hang on dead floppy hardware.
          if (dst8400 + 0x3B <= entry.binaryData.length &&
              entry.binaryData[dst8400 + 0x39] === 0x6C &&  // JMP ($xxxx)
              entry.binaryData[dst8400 + 0x3A] === 0xD6 &&  // lo = $D6
              entry.binaryData[dst8400 + 0x3B] === 0x00) {  // hi = $00
            entry.binaryData[dst8400 + 0x39] = 0x60  // RTS
            entry.binaryData[dst8400 + 0x3A] = 0xEA  // NOP
            entry.binaryData[dst8400 + 0x3B] = 0xEA  // NOP
          }
        }
        // Patch ZP $D6/$D7 to point to a known RTS ($0673 = end of our shim).
        // This ensures any JMP ($D6) calls we missed also become no-ops.
        if (entry.capturedZeroPage && entry.capturedZeroPage.length >= 0xD8) {
          entry.capturedZeroPage[0xD6] = 0x73  // lo byte → $0673
          entry.capturedZeroPage[0xD7] = 0x06  // hi byte → $06xx
        }

        // --- Chain-loader bypass ---
        // Some 4am cracks (e.g. BurgerTime) have a chain-loader at $04C0
        // (from $80C0) that reads T17/S7 (the DOS catalog) into $0900 and
        // follows T/S chains, overwriting the buffer. The outer loop at $0422
        // then reads T/S pairs from $0900 to load game data. Problem: the
        // chain-loader DESTROYS the valid T/S list that our captured memory
        // snapshot already has at $0900, leaving it with intermediate catalog
        // data that causes an infinite read loop.
        //
        // Fix: if we detect the chain-loader signature at $80C0 AND the
        // captured $0900 already contains a plausible T/S list, patch $80C0
        // to RTS. The captured state already has all the data the chain-loader
        // would produce, so re-running it is redundant and destructive.
        //
        // Detection: JSR $xxxx; LDA #$11; STA $80; LDA #xx; STA $81 at $80C0
        // (reads track 17 = catalog track for DOS 3.3)
        const off80C0 = 0x80C0 - entry.loadAddress
        if (off80C0 >= 0 && off80C0 + 10 <= entry.binaryData.length) {
          const b = entry.binaryData
          const isChainLoader = (
            b[off80C0] === 0x20 &&             // JSR $xxxx
            b[off80C0 + 3] === 0xA9 &&         // LDA #imm
            b[off80C0 + 4] === 0x11 &&         // = $11 (track 17)
            b[off80C0 + 5] === 0x85 &&         // STA $80
            b[off80C0 + 6] === 0x80 &&         // (track ZP)
            b[off80C0 + 7] === 0xA9 &&         // LDA #imm (sector)
            b[off80C0 + 9] === 0x85 &&         // STA $81
            b[off80C0 + 10] === 0x81            // (sector ZP)
          )
          // Check if captured $0900+$0C has valid T/S pairs (track<35, sector<16, non-zero)
          const off090C = 0x090C - entry.loadAddress
          let capturedTsValid = false
          if (off090C >= 0 && off090C + 4 <= entry.binaryData.length) {
            const t1 = b[off090C]
            const s1 = b[off090C + 1]
            const t2 = b[off090C + 2]
            const s2 = b[off090C + 3]
            capturedTsValid = (t1 > 0 && t1 < 35 && s1 < 16 &&
                               t2 < 35 && s2 < 16 && (t2 > 0 || s2 > 0))
          }
          if (isChainLoader && capturedTsValid) {
            // Patch $80C0 to RTS — skip chain-loader, preserve captured $0900
            entry.binaryData[off80C0] = 0x60  // RTS
          }
        }
      }

      // Patch floppy seek/motor routines to RTS. The new $04C0 (from $80C0)
      // calls JSR $856F before doing sector reads. $856F is a floppy seek
      // routine that searches for address fields (D5 AA 96) — with no disk
      // loaded, NODISK_PATTERN returns D5 AA 97 causing infinite retries.
      // Since our shim handles all reads via HD, floppy seeking is unnecessary.
      const floppyRoutines = [0x856F]
      for (const addr of floppyRoutines) {
        const off = addr - entry.loadAddress
        if (off >= 0 && off < entry.binaryData.length) {
          entry.binaryData[off] = 0x60  // RTS
        }
      }

      effectiveFloppyPatch = undefined  // shim replaces CLC+RTS patch
    }


    if (hasZP) {
      const relayData = createDirectLoadRelayWithZP(
        gameDataStartBlock,
        entry.loadAddress,
        gameBlockCount,
        entry.entryAddress,
        unitNumber,
        effectiveFloppyPatch,
      )
      fourCadeRelayBinaries.push(relayData)
      helperFiles.push({ name: helperName, type: PRODOS_FILE_TYPE_BINARY, data: createProDosRelayWrapper(relayData), auxType: PRODOS_RELAY_WRAPPER_ADDRESS })
    } else {
      const relayData = createDirectLoadRelay(
        gameDataStartBlock,
        entry.loadAddress,
        gameBlockCount,
        entry.entryAddress,
        unitNumber,
      )
      fourCadeRelayBinaries.push(relayData)
      helperFiles.push({ name: helperName, type: PRODOS_FILE_TYPE_BINARY, data: createProDosRelayWrapper(relayData), auxType: PRODOS_RELAY_WRAPPER_ADDRESS })
    }
  }

  // Add companion game files so runtime ProDOS loaders can open them by name.
  for (const entry of fourCadeEntries) {
    if (entry.supplementaryFiles && entry.supplementaryFiles.length > 0) {
      for (const sf of entry.supplementaryFiles) {
        withStartup.push({
          name: sf.name,
          type: sf.type,
          data: sf.data,
          auxType: sf.loadAddress,
          relativePath: sf.relativePath,
          creationSortKey: sf.creationSortKey,
        })
      }
    }
  }

  // Generate STARTUP: interactive menu if menuEntries provided, else simple CATALOG
  let startupSource: string
  const aliasShimInstallCommand = `BRUN /${normalizedVolumeName}/${HELPER_SUBDIR}/A2TSAL3`
  if (menuEntries && menuEntries.length > 0) {
    startupSource = generateInteractiveMenuStartup(menuEntries, HELPER_SUBDIR)
  } else {
    const cmds: string[] = []
    if (includeAliasShimFile) cmds.push(aliasShimInstallCommand)
    cmds.push(`BRUN ${HELPER_SUBDIR}/${launcherName}`)
    cmds.push("CATALOG")
    startupSource = cmds.map((cmd, i) => `${(i + 1) * 10} D$=CHR$(4):PRINT D$;"${cmd}"`).join("\r") + "\r"
  }
  
  withStartup.unshift({
    name: "STARTUP",
    type: 0xFC,
    data: tokenizeApplesoftBasic(startupSource),
    auxType: 0x0801,
  })

  if (menuEntries && menuEntries.length > 0) {
    helperFiles.push({
      name: "MENUSRC",
      type: 0xFC,
      data: tokenizeApplesoftBasic(generateMenuSourceProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes, HELPER_SUBDIR, includeAliasShimFile ? aliasShimInstallCommand : undefined, runtimeVolumeByMenuIndex, menuNeedsAliasShim)),
      auxType: 0x0801,
    })
    helperFiles.push({
      name: "MENULAUNCH",
      type: 0xFC,
      data: tokenizeApplesoftBasic(generateMenuLaunchProgram(menuEntries, dosRuntimeLauncher, menuProDosCommands, menuProDosPrefixes, HELPER_SUBDIR, includeAliasShimFile ? aliasShimInstallCommand : undefined, runtimeVolumeByMenuIndex, runtimeHelloModeByMenuIndex, menuNeedsAliasShim, fourCadeRelayBlockInfo, dosMasterSlot)),
      auxType: 0x0801,
    })
  }

  if (helperFiles.length > 0) {
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

  // Expand root directory if needed by appending new linked blocks
  if (rootEntriesNeeded > freeSlots.length) {
    const additionalEntries = rootEntriesNeeded - freeSlots.length
    const additionalBlocks = Math.ceil(additionalEntries / DIR_ENTRIES_PER_BLOCK)
    const newBlocks = allocateFreeBlocks(additionalBlocks)
    if (newBlocks.length < additionalBlocks) {
      throw new Error(`Not enough free blocks to expand root directory.`)
    }
    // Link the last existing directory block to the first new block
    const lastExistingBlock = newDirBlocks[newDirBlocks.length - 1]
    const lastExistingBlockData = new Uint8Array(newHdv.buffer, lastExistingBlock * BLOCK_SIZE, BLOCK_SIZE)
    writeLittleEndian16(lastExistingBlockData, 2, newBlocks[0])  // next pointer

    for (let i = 0; i < newBlocks.length; i++) {
      const blockNum = newBlocks[i]
      const blockData = new Uint8Array(newHdv.buffer, blockNum * BLOCK_SIZE, BLOCK_SIZE)
      blockData.fill(0)
      const prevBlock = i === 0 ? lastExistingBlock : newBlocks[i - 1]
      const nextBlock = i + 1 < newBlocks.length ? newBlocks[i + 1] : 0
      writeLittleEndian16(blockData, 0, prevBlock)   // prev pointer
      writeLittleEndian16(blockData, 2, nextBlock)   // next pointer
      // All 13 slots in new blocks are free
      for (let slot = 0; slot < DIR_ENTRIES_PER_BLOCK; slot++) {
        freeSlots.push({ block: blockNum, slot })
      }
      newDirBlocks.push(blockNum)
    }
  }

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

  // === POST-BUILD: WRITE 4CADE BINARY DATA ===
  // 4cade binaries are stored as contiguous blocks within the volume (allocated
  // from the bitmap above). Block layout per game:
  //   [relay 1 block] [game data N blocks] [ZP 0-1 block] [DSK 0-M blocks]
  // MENULAUNCH BRUNs a per-game helper file; these raw relay blocks remain part
  // of the existing contiguous game-data layout.
  if (fourCadeEntries.length > 0) {
    for (let i = 0; i < fourCadeEntries.length; i++) {
      const entry = fourCadeEntries[i]
      const range = fourCadeBlockRanges[i]
      const offset = range.startBlock * BLOCK_SIZE
      const relayBlockCount = 1  // relay always occupies 1 block

      // Write relay binary data to the first block (padded to 512 bytes)
      const relayData = fourCadeRelayBinaries[i]
      const paddedRelay = new Uint8Array(BLOCK_SIZE)
      paddedRelay.set(relayData.slice(0, Math.min(relayData.length, BLOCK_SIZE)))
      newHdv.set(paddedRelay, offset)

      // Write game binary data after the relay block
      const gameDataOffset = offset + relayBlockCount * BLOCK_SIZE
      const gameBlockCount = Math.ceil(entry.binaryData.length / BLOCK_SIZE)
      newHdv.set(entry.binaryData.slice(0, Math.min(entry.binaryData.length, gameBlockCount * BLOCK_SIZE)), gameDataOffset)
      // Write captured ZP block after game data.
      // For prelaunch games this is 512 bytes: ZP (0-255) + game's $BF00 page (256-511).
      // The relay reads this as one block to $BE00, placing ZP at $BE00 (copied to $00)
      // and the $BF00 page directly at $BF00 — essential because DOS 3.3 games use
      // $BF00-$BFFF as regular RAM but ProDOS overwrites it with its global page.
      if (entry.capturedZeroPage) {
        const zpBlockOffset = gameDataOffset + gameBlockCount * BLOCK_SIZE
        const zpLen = Math.min(entry.capturedZeroPage.length, BLOCK_SIZE)
        newHdv.set(entry.capturedZeroPage.slice(0, zpLen), zpBlockOffset)
      }
      // Write raw DSK image after game + ZP blocks (for floppy-read shim)
      if (entry.rawDiskImage) {
        const hasZP = !!entry.capturedZeroPage
        const dskOffset = gameDataOffset + (gameBlockCount + (hasZP ? 1 : 0)) * BLOCK_SIZE
        newHdv.set(entry.rawDiskImage.slice(0, Math.min(entry.rawDiskImage.length, Math.ceil(entry.rawDiskImage.length / BLOCK_SIZE) * BLOCK_SIZE)), dskOffset)
      }
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
export const VTOC_REFRESH = 10

