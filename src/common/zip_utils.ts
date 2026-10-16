import * as fflate from "fflate"

export interface UnzippedFile {
  filename: string
  data: Uint8Array<ArrayBuffer>
  buffer: ArrayBuffer
}

/**
 * Extracts a single disk or media image from a zip archive buffer.
 * Filters out macOS metadata and empty directories.
 * If originalFilename is provided (e.g., "game.img.zip"), prioritizes
 * matching the stripped filename ("game.img").
 */
export const unzipSingleFile = (
  buffer: ArrayBuffer | Uint8Array,
  originalFilename?: string,
  preferredExtensions?: string[]
): UnzippedFile | null => {
  try {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    // Fast check: zip files start with PK (0x50, 0x4B, 0x03/0x05/0x07, 0x04/0x06/0x08)
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

    if (fileNames.length === 0) return null

    const toResult = (name: string, u8: Uint8Array): UnzippedFile => {
      const buf = u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength) as ArrayBuffer
      return {
        filename: name.split("/").pop() || name,
        data: new Uint8Array(buf),
        buffer: buf,
      }
    }

    // 1. If originalFilename has an inner name (e.g. "foo.img.zip" -> "foo.img")
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

    // 2. If preferredExtensions are given, find the first match with length > 1024
    if (preferredExtensions && preferredExtensions.length > 0) {
      const lowerExts = preferredExtensions.map(ext => ext.toLowerCase())
      for (const fn of fileNames) {
        const lower = fn.toLowerCase()
        if (lowerExts.some(ext => lower.endsWith(ext)) && unzipped[fn].length > 1024) {
          return toResult(fn, unzipped[fn])
        }
      }
    }

    // 3. Pick the largest file > 1024 bytes (disk images are typically > 1KB)
    const validFiles = fileNames.filter(fn => unzipped[fn].length > 1024)
    if (validFiles.length > 0) {
      validFiles.sort((a, b) => unzipped[b].length - unzipped[a].length)
      const best = validFiles[0]
      return toResult(best, unzipped[best])
    }

    // 4. Fallback to first non-empty file
    const first = fileNames[0]
    return toResult(first, unzipped[first])
  } catch (err) {
    console.error("Failed to unzip file:", err)
    return null
  }
}
