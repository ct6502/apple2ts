import * as fflate from "fflate"

export interface UnzippedFile {
  filename: string
  data: Uint8Array<ArrayBuffer>
  buffer: ArrayBuffer
}

export type DecompressedFile = UnzippedFile

export const DEFAULT_DISK_EXTENSIONS = [
  ".woz",
  ".po",
  ".dsk",
  ".do",
  ".2mg",
  ".hdv",
  ".2meg",
  ".img",
  ".nib",
]

export const scoreDiskFilename = (filename: string): number => {
  const stem = (filename.split("/").pop() || filename).replace(/\.[^.]+$/, "")
  if (/(?:^|[\s_.-])(?:boot|disk\s*1|side\s*a|face\s*1|part\s*1|d1|s1|f1)(?:[\s_.-]|$)/i.test(stem)) return 0
  if (/(?:^|[\s_.-])(?:disk\s*2|side\s*b|face\s*2|part\s*2|d2|s2|f2)(?:[\s_.-]|$)/i.test(stem)) return 10
  if (/(?:^|[\s_.-])(?:disk\s*3|side\s*c|face\s*3|part\s*3|d3|s3|f3)(?:[\s_.-]|$)/i.test(stem)) return 20
  if (/(?:^|[\s_.-])(?:disk\s*4|side\s*d|face\s*4|part\s*4|d4|s4|f4)(?:[\s_.-]|$)/i.test(stem)) return 30
  if (/(?:^|[\s_.-])(?:data|save|savegame|docs|doc|manual|user)(?:[\s_.-]|$)/i.test(stem)) return 80
  return 50
}

export const compareDiskFilenames = (a: string, b: string): number => {
  const baseA = a.split("/").pop() || a
  const baseB = b.split("/").pop() || b
  const scoreA = scoreDiskFilename(baseA)
  const scoreB = scoreDiskFilename(baseB)
  if (scoreA !== scoreB) return scoreA - scoreB

  const stemA = baseA.replace(/\.[^.]+$/, "")
  const stemB = baseB.replace(/\.[^.]+$/, "")
  const stemCmp = stemA.localeCompare(stemB, undefined, { numeric: true, sensitivity: "base" })
  if (stemCmp !== 0) return stemCmp

  return baseA.localeCompare(baseB, undefined, { numeric: true, sensitivity: "base" })
}

/**
 * Extracts a single disk or media image from a zip or gzip archive buffer synchronously.
 * For zip: filters out macOS metadata and empty directories.
 * For gzip: decompresses the stream and derives the inner filename (e.g. "game.img.gz" -> "game.img").
 */
export const unzipSingleFile = (
  buffer: ArrayBuffer | Uint8Array,
  originalFilename?: string,
  preferredExtensions?: string[]
): UnzippedFile | null => {
  try {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    if (bytes.length < 2) return null

    // 1. Gzip check: magic bytes 0x1f, 0x8b
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      try {
        const decompressed = fflate.gunzipSync(bytes)
        let name = "image.img"
        if (originalFilename) {
          name = originalFilename.replace(/\.gz$/i, "")
        } else if (preferredExtensions && preferredExtensions.length > 0) {
          name = `image${preferredExtensions[0]}`
        }
        const buf = decompressed.buffer.slice(
          decompressed.byteOffset,
          decompressed.byteOffset + decompressed.byteLength
        ) as ArrayBuffer
        return {
          filename: name.split("/").pop() || name,
          data: new Uint8Array(buf),
          buffer: buf,
        }
      } catch (err) {
        console.error("Failed to gunzip file:", err)
        return null
      }
    }

    // 2. Zip check: starts with PK (0x50, 0x4B)
    if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      return null
    }

    const unzipped = fflate.unzipSync(bytes)
    const fileNames = Object.keys(unzipped).filter(name => {
      // Ignore directories and macOS / hidden metadata
      return !name.endsWith("/") &&
        !name.startsWith("__MACOSX/") &&
        !name.includes("/.") &&
        !name.startsWith(".") &&
        unzipped[name].length > 0
    })
    fileNames.sort(compareDiskFilenames)

    if (fileNames.length === 0) return null

    const toResult = (name: string, u8: Uint8Array): UnzippedFile => {
      const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
      return {
        filename: name.split("/").pop() || name,
        data: new Uint8Array(buf),
        buffer: buf,
      }
    }

    // A. If originalFilename has an inner name (e.g. "foo.img.zip" -> "foo.img")
    if (originalFilename) {
      const stripped = originalFilename.replace(/\.zip$/i, "")
      const baseName = stripped.split("/").pop() || stripped
      const exactMatch = fileNames.find(fn => {
        const fnBase = fn.split("/").pop() || fn
        return fnBase.toLowerCase() === baseName.toLowerCase()
      })
      if (exactMatch && unzipped[exactMatch].length > 0) {
        return toResult(exactMatch, unzipped[exactMatch])
      }
    }

    // B. If preferredExtensions are given, find the first match with length > 1024
    if (preferredExtensions && preferredExtensions.length > 0) {
      const lowerExts = preferredExtensions.map(ext => ext.toLowerCase())
      for (const fn of fileNames) {
        const lower = fn.toLowerCase()
        if (lowerExts.some(ext => lower.endsWith(ext)) && unzipped[fn].length > 1024) {
          return toResult(fn, unzipped[fn])
        }
      }
    }

    // C. Pick the largest file > 1024 bytes (disk images are typically > 1KB)
    const validFiles = fileNames.filter(fn => unzipped[fn].length > 1024)
    if (validFiles.length > 0) {
      validFiles.sort((a, b) => unzipped[b].length - unzipped[a].length)
      const best = validFiles[0]
      return toResult(best, unzipped[best])
    }

    // D. Fallback to first non-empty file
    const first = fileNames[0]
    return toResult(first, unzipped[first])
  } catch (err) {
    console.error("Failed to unzip file:", err)
    return null
  }
}

/**
 * Extracts a single disk or media image asynchronously.
 * Supports .zip, .gz (via fast synchronous fflate), and .7z (via sevenzip-wasm).
 */
export const decompressSingleFile = async (
  buffer: ArrayBuffer | Uint8Array,
  originalFilename?: string,
  preferredExtensions?: string[]
): Promise<DecompressedFile | null> => {
  // 1. First attempt sync decompression (.zip or .gz)
  const syncResult = unzipSingleFile(buffer, originalFilename, preferredExtensions)
  if (syncResult) return syncResult

  // 2. Check for 7z signature: 37 7A BC AF 27 1C, or .7z extension
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const is7z = (bytes.length >= 6 &&
    bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc &&
    bytes[3] === 0xaf && bytes[4] === 0x27 && bytes[5] === 0x1c) ||
    (originalFilename ? /\.7z$/i.test(originalFilename) : false)

  if (!is7z) return null

  try {
    if (typeof globalThis.TextDecoder === "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const util = require("util")
        globalThis.TextDecoder = util.TextDecoder
        globalThis.TextEncoder = util.TextEncoder
      } catch {
        // Browser has native TextDecoder
      }
    }
    const SevenZipModule = await import("sevenzip-wasm")
    const SevenZip = (SevenZipModule as { default?: unknown }).default || SevenZipModule
    const isBrowser = typeof window !== "undefined" && (typeof process === "undefined" || !process.versions?.node)
    const options = isBrowser ? {
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return "js/sevenzip-wasm.wasm"
        }
        return path
      }
    } : undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sz = await (SevenZip as (opts?: any) => Promise<any>)(options)

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const tempArchive = `archive_${uniqueId}.7z`
    const outDir = `/out_${uniqueId}`

    sz.FS.writeFile(tempArchive, bytes)
    sz.FS.mkdir(outDir)

    sz.callMain(["x", tempArchive, `-o${outDir}`, "-y"])

    const extractedFiles: Array<{ fullPath: string; name: string; size: number }> = []

    const scanDirectory = (dir: string) => {
      const entries: string[] = sz.FS.readdir(dir)
      for (const entry of entries) {
        if (entry === "." || entry === "..") continue
        const fullPath = `${dir}/${entry}`
        const stat = sz.FS.stat(fullPath)
        // 16384 is directory mode flag in Emscripten stat
        if (stat.mode & 16384) {
          scanDirectory(fullPath)
        } else {
          extractedFiles.push({ fullPath, name: entry, size: stat.size })
        }
      }
    }

    scanDirectory(outDir)

    const validFiles = extractedFiles.filter(f =>
      !f.name.startsWith(".") &&
      !f.fullPath.includes("/__MACOSX/") &&
      f.size > 0
    )

    if (validFiles.length === 0) return null

    const toResult = (f: { fullPath: string; name: string }): DecompressedFile => {
      const fileBytes: Uint8Array = sz.FS.readFile(f.fullPath)
      const buf = fileBytes.buffer.slice(
        fileBytes.byteOffset,
        fileBytes.byteOffset + fileBytes.byteLength
      ) as ArrayBuffer
      return {
        filename: f.name,
        data: new Uint8Array(buf),
        buffer: buf,
      }
    }

    // A. Match stripped originalFilename
    if (originalFilename) {
      const stripped = originalFilename.replace(/\.7z$/i, "")
      const baseName = stripped.split("/").pop() || stripped
      const match = validFiles.find(f => f.name.toLowerCase() === baseName.toLowerCase())
      if (match) return toResult(match)
    }

    // B. Match preferredExtensions
    if (preferredExtensions && preferredExtensions.length > 0) {
      const lowerExts = preferredExtensions.map(ext => ext.toLowerCase())
      for (const f of validFiles) {
        const lower = f.name.toLowerCase()
        if (lowerExts.some(ext => lower.endsWith(ext))) {
          return toResult(f)
        }
      }
    }

    // C. Pick largest file
    validFiles.sort((a, b) => b.size - a.size)
    return toResult(validFiles[0])
  } catch (err) {
    console.error("Failed to extract 7z archive:", err)
    return null
  }
}

/**
  * Extracts all disk images from a zip or gzip archive buffer synchronously.
  * Filters out macOS metadata, hidden files, and empty directories.
  * Natural sorts results (e.g., Disk 1, Disk 2, ..., Disk 11).
  */
export const unzipAllDiskFiles = (
  buffer: ArrayBuffer | Uint8Array,
  originalFilename?: string,
  preferredExtensions?: string[]
): DecompressedFile[] | null => {
  try {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    if (bytes.length < 2) return null

    // 1. Gzip check: magic bytes 0x1f, 0x8b
    if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
      const single = unzipSingleFile(bytes, originalFilename, preferredExtensions)
      return single ? [single] : null
    }

    // 2. Zip check: starts with PK (0x50, 0x4B)
    if (bytes.length < 4 || bytes[0] !== 0x50 || bytes[1] !== 0x4b) {
      return null
    }

    const unzipped = fflate.unzipSync(bytes)
    const fileNames = Object.keys(unzipped).filter(name => {
      const base = name.split("/").pop() || name
      return !name.endsWith("/") &&
        !name.startsWith("__MACOSX/") &&
        !name.includes("/__MACOSX/") &&
        !base.startsWith(".") &&
        unzipped[name].length > 0
    })

    if (fileNames.length === 0) return null

    const toResult = (name: string, u8: Uint8Array): DecompressedFile => {
      const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
      return {
        filename: name.split("/").pop() || name,
        data: new Uint8Array(buf),
        buffer: buf,
      }
    }

    const exts = (preferredExtensions && preferredExtensions.length > 0)
      ? preferredExtensions
      : DEFAULT_DISK_EXTENSIONS
    const lowerExts = exts.map(e => e.toLowerCase())

    const diskFiles = fileNames.filter(name => {
      const lower = name.toLowerCase()
      return lowerExts.some(ext => lower.endsWith(ext))
    })

    const targetFiles = diskFiles.length > 0
      ? diskFiles
      : fileNames.filter(name => unzipped[name].length > 1024)

    if (targetFiles.length === 0) {
      const single = unzipSingleFile(bytes, originalFilename, preferredExtensions)
      return single ? [single] : null
    }

    targetFiles.sort(compareDiskFilenames)

    return targetFiles.map(name => toResult(name, unzipped[name]))
  } catch (err) {
    console.error("Failed to unzip all files:", err)
    return null
  }
}

/**
 * Extracts all disk images from a .zip, .gz, or .7z archive asynchronously.
 * Returns an array of decompressed disk files sorted naturally.
 */
export const decompressAllDiskFiles = async (
  buffer: ArrayBuffer | Uint8Array,
  originalFilename?: string,
  preferredExtensions?: string[]
): Promise<DecompressedFile[] | null> => {
  // 1. First attempt sync decompression (.zip or .gz)
  const syncResults = unzipAllDiskFiles(buffer, originalFilename, preferredExtensions)
  if (syncResults && syncResults.length > 0) return syncResults

  // 2. Check for 7z signature: 37 7A BC AF 27 1C, or .7z extension
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  const is7z = (bytes.length >= 6 &&
    bytes[0] === 0x37 && bytes[1] === 0x7a && bytes[2] === 0xbc &&
    bytes[3] === 0xaf && bytes[4] === 0x27 && bytes[5] === 0x1c) ||
    (originalFilename ? /\.7z$/i.test(originalFilename) : false)

  if (!is7z) return null

  try {
    if (typeof globalThis.TextDecoder === "undefined") {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const util = require("util")
        globalThis.TextDecoder = util.TextDecoder
        globalThis.TextEncoder = util.TextEncoder
      } catch {
        // Browser has native TextDecoder
      }
    }
    const SevenZipModule = await import("sevenzip-wasm")
    const SevenZip = (SevenZipModule as { default?: unknown }).default || SevenZipModule
    const isBrowser = typeof window !== "undefined" && (typeof process === "undefined" || !process.versions?.node)
    const options = isBrowser ? {
      locateFile: (path: string) => {
        if (path.endsWith(".wasm")) {
          return "js/sevenzip-wasm.wasm"
        }
        return path
      }
    } : undefined
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sz = await (SevenZip as (opts?: any) => Promise<any>)(options)

    const uniqueId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`
    const tempArchive = `archive_${uniqueId}.7z`
    const outDir = `/out_${uniqueId}`

    sz.FS.writeFile(tempArchive, bytes)
    sz.FS.mkdir(outDir)

    sz.callMain(["x", tempArchive, `-o${outDir}`, "-y"])

    const extractedFiles: Array<{ fullPath: string; name: string; size: number }> = []

    const scanDirectory = (dir: string) => {
      const entries: string[] = sz.FS.readdir(dir)
      for (const entry of entries) {
        if (entry === "." || entry === "..") continue
        const fullPath = `${dir}/${entry}`
        const stat = sz.FS.stat(fullPath)
        // 16384 is directory mode flag in Emscripten stat
        if (stat.mode & 16384) {
          scanDirectory(fullPath)
        } else {
          extractedFiles.push({ fullPath, name: entry, size: stat.size })
        }
      }
    }

    scanDirectory(outDir)

    const validFiles = extractedFiles.filter(f =>
      !f.name.startsWith(".") &&
      !f.fullPath.includes("/__MACOSX/") &&
      f.size > 0
    )

    if (validFiles.length === 0) return null

    const toResult = (f: { fullPath: string; name: string }): DecompressedFile => {
      const fileBytes: Uint8Array = sz.FS.readFile(f.fullPath)
      const buf = fileBytes.buffer.slice(
        fileBytes.byteOffset,
        fileBytes.byteOffset + fileBytes.byteLength
      ) as ArrayBuffer
      return {
        filename: f.name,
        data: new Uint8Array(buf),
        buffer: buf,
      }
    }

    const exts = (preferredExtensions && preferredExtensions.length > 0)
      ? preferredExtensions
      : DEFAULT_DISK_EXTENSIONS
    const lowerExts = exts.map(e => e.toLowerCase())

    const diskFiles = validFiles.filter(f => {
      const lower = f.name.toLowerCase()
      return lowerExts.some(ext => lower.endsWith(ext))
    })

    const targetFiles = diskFiles.length > 0 ? diskFiles : validFiles
    targetFiles.sort((a, b) => compareDiskFilenames(a.name, b.name))

    return targetFiles.map(toResult)
  } catch (err) {
    console.error("Failed to extract all files from 7z archive:", err)
    return null
  }
}

