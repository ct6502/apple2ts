export const EXPORT_HDV_MAGIC = "A2TSXHDV"
export const EXPORT_HDV_VERSION = 1
export const EXPORT_HDV_SHOW_SCREENSHOT_ADDR = 0x300
export const EXPORT_HDV_BOOT_SELECTION_ADDR = 0x303
export const EXPORT_HDV_SELECTED_INDEX_ADDR = 0x30C
export const EXPORT_HDV_SCREENSHOT_SIZE = 0x2000

const HEADER_SIZE = 32
const DEFAULT_VOLUME_NAME = "APPLE2TS EXPORT"

export type ExportHdvItemKind = "floppy" | "harddrive"

export type ExportHdvEntry = {
  title: string,
  filename: string,
  kind: ExportHdvItemKind,
  diskOffset: number,
  diskLength: number,
  screenshotOffset: number,
  screenshotLength: number,
}

export type ExportHdvManifest = {
  format: "apple2ts-export-hdv",
  version: number,
  volumeName: string,
  entries: ExportHdvEntry[],
}

type ExportHdvBuildItem = {
  title: string,
  filename: string,
  kind: ExportHdvItemKind,
  diskData: Uint8Array,
  screenshotData: Uint8Array,
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

const align = (value: number, boundary: number) => {
  return Math.ceil(value / boundary) * boundary
}

const writeUint32LE = (data: Uint8Array, offset: number, value: number) => {
  data[offset] = value & 0xFF
  data[offset + 1] = (value >>> 8) & 0xFF
  data[offset + 2] = (value >>> 16) & 0xFF
  data[offset + 3] = (value >>> 24) & 0xFF
}

const readUint32LE = (data: Uint8Array, offset: number) => {
  return data[offset] +
    (data[offset + 1] << 8) +
    (data[offset + 2] << 16) +
    (data[offset + 3] * 0x1000000)
}

const sanitizeTitle = (title: string) => {
  const trimmed = title.replace(/\s+/g, " ").trim()
  return trimmed.length > 0 ? trimmed : "UNTITLED DISK"
}

const sanitizeBasicString = (value: string) => {
  return value.replace(/"/g, "'")
}

export const buildExportHdv = (items: ExportHdvBuildItem[], volumeName = DEFAULT_VOLUME_NAME) => {
  const manifest: ExportHdvManifest = {
    format: "apple2ts-export-hdv",
    version: EXPORT_HDV_VERSION,
    volumeName,
    entries: [],
  }

  manifest.entries = items.map((item) => {
    return {
      title: sanitizeTitle(item.title),
      filename: item.filename,
      kind: item.kind,
      diskOffset: 0,
      diskLength: item.diskData.length,
      screenshotOffset: 0,
      screenshotLength: item.screenshotData.length,
    }
  })

  const manifestOffset = HEADER_SIZE
  let manifestBytes = new Uint8Array()
  let dataOffset = 0
  let previousDataOffset = -1
  while (dataOffset !== previousDataOffset) {
    previousDataOffset = dataOffset
    manifestBytes = encoder.encode(JSON.stringify(manifest))
    dataOffset = align(manifestOffset + manifestBytes.length, 512)
    let assetOffset = dataOffset
    for (const entry of manifest.entries) {
      entry.screenshotOffset = assetOffset
      assetOffset += align(entry.screenshotLength, 512)
      entry.diskOffset = assetOffset
      assetOffset += align(entry.diskLength, 512)
    }
  }

  let totalSize = dataOffset
  for (const entry of manifest.entries) {
    totalSize = Math.max(totalSize, align(entry.diskOffset + entry.diskLength, 512))
  }

  const result = new Uint8Array(totalSize)
  result.set(encoder.encode(EXPORT_HDV_MAGIC), 0)
  writeUint32LE(result, 8, EXPORT_HDV_VERSION)
  writeUint32LE(result, 12, manifestOffset)
  writeUint32LE(result, 16, manifestBytes.length)
  writeUint32LE(result, 20, dataOffset)
  writeUint32LE(result, 24, manifest.entries.length)
  result.set(manifestBytes, manifestOffset)

  items.forEach((item, index) => {
    const entry = manifest.entries[index]
    result.set(item.screenshotData, entry.screenshotOffset)
    result.set(item.diskData, entry.diskOffset)
  })

  return result
}

export const parseExportHdvManifest = (data: Uint8Array): ExportHdvManifest | null => {
  if (data.length < HEADER_SIZE) {
    return null
  }

  const magic = decoder.decode(data.slice(0, EXPORT_HDV_MAGIC.length))
  if (magic !== EXPORT_HDV_MAGIC) {
    return null
  }

  const version = readUint32LE(data, 8)
  if (version !== EXPORT_HDV_VERSION) {
    return null
  }

  const manifestOffset = readUint32LE(data, 12)
  const manifestLength = readUint32LE(data, 16)
  if (manifestOffset < HEADER_SIZE || manifestLength <= 0 || manifestOffset + manifestLength > data.length) {
    return null
  }

  try {
    const manifest = JSON.parse(decoder.decode(data.slice(manifestOffset, manifestOffset + manifestLength))) as ExportHdvManifest
    if (manifest.format !== "apple2ts-export-hdv" || !Array.isArray(manifest.entries)) {
      return null
    }
    return manifest
  } catch {
    return null
  }
}

export const getExportHdvEntryDisk = (data: Uint8Array, entry: ExportHdvEntry) => {
  return data.slice(entry.diskOffset, entry.diskOffset + entry.diskLength)
}

export const getExportHdvEntryScreenshot = (data: Uint8Array, entry: ExportHdvEntry) => {
  return data.slice(entry.screenshotOffset, entry.screenshotOffset + entry.screenshotLength)
}

const chunkTitles = (titles: string[], chunkSize = 3) => {
  const result: string[][] = []
  for (let index = 0; index < titles.length; index += chunkSize) {
    result.push(titles.slice(index, index + chunkSize))
  }
  return result
}

export const buildExportHdvBasicProgram = (manifest: ExportHdvManifest) => {
  const titles = manifest.entries.map((entry) => sanitizeBasicString(sanitizeTitle(entry.title)))
  const lines: string[] = [
    `10 N=${titles.length - 1}:DIM T$(${Math.max(titles.length, 1)})`,
    "20 FOR J=0 TO N:READ T$(J):NEXT J",
    "30 I=0:GOSUB 1000",
    "40 GET A$:IF A$=\"\" THEN 40",
    "50 IF A$=CHR$(8) THEN I=I-1:IF I<0 THEN I=N",
    "60 IF A$=CHR$(21) THEN I=I+1:IF I>N THEN I=0",
    `70 IF A$=CHR$(13) THEN POKE ${EXPORT_HDV_SELECTED_INDEX_ADDR},I:CALL ${EXPORT_HDV_BOOT_SELECTION_ADDR}:END`,
    "80 GOSUB 1000:GOTO 40",
    `1000 POKE ${EXPORT_HDV_SELECTED_INDEX_ADDR},I:CALL ${EXPORT_HDV_SHOW_SCREENSHOT_ADDR}`,
    "1010 HOME:VTAB 21:HTAB 1:PRINT SPC(39)",
    "1020 VTAB 21:PRINT T$(I)",
    "1030 VTAB 22:PRINT \"LEFT/RIGHT TO BROWSE\"",
    "1040 VTAB 23:PRINT \"RETURN TO BOOT DISK\"",
    "1050 VTAB 24:PRINT \"DISK \";I+1;\" OF \";N+1",
    "1060 RETURN",
  ]

  let lineNumber = 2000
  for (const chunk of chunkTitles(titles)) {
    const values = chunk.map((title) => `\"${title}\"`).join(",")
    lines.push(`${lineNumber} DATA ${values}`)
    lineNumber += 10
  }

  return lines.join("\n") + "\nRUN\n"
}