import * as fflate from "fflate"
import { unzipSingleFile, decompressSingleFile, unzipAllDiskFiles, decompressAllDiskFiles } from "./zip_utils"

if (typeof globalThis.TextDecoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const util = require("util")
  globalThis.TextDecoder = util.TextDecoder
  globalThis.TextEncoder = util.TextEncoder
}

describe("zip_utils decompression", () => {
  test("returns null for non-compressed raw data", async () => {
    const rawData = new Uint8Array([1, 2, 3, 4, 5])
    expect(unzipSingleFile(rawData, "test.bin")).toBeNull()
    expect(await decompressSingleFile(rawData, "test.bin")).toBeNull()
  })

  test("unzips *.img.zip and extracts *.img", () => {
    const imgContent = new Uint8Array(2048)
    imgContent.fill(0x55)

    const zipBytes = fflate.zipSync({
      "slideshow.img": imgContent,
      "README.txt": fflate.strToU8("Instructions here"),
    })

    const result = unzipSingleFile(zipBytes, "slideshow.img.zip")
    expect(result).not.toBeNull()
    expect(result?.filename).toBe("slideshow.img")
    expect(result?.data.length).toBe(2048)
    expect(result?.data[0]).toBe(0x55)
  })

  test("decompresses *.img.gz to *.img synchronously and asynchronously", async () => {
    const imgContent = new Uint8Array(4096)
    imgContent.fill(0x33)

    const gzBytes = fflate.gzipSync(imgContent)

    // Sync test
    const syncResult = unzipSingleFile(gzBytes, "disk.img.gz")
    expect(syncResult).not.toBeNull()
    expect(syncResult?.filename).toBe("disk.img")
    expect(syncResult?.data.length).toBe(4096)
    expect(syncResult?.data[0]).toBe(0x33)

    // Async test
    const asyncResult = await decompressSingleFile(gzBytes, "disk.img.gz")
    expect(asyncResult).not.toBeNull()
    expect(asyncResult?.filename).toBe("disk.img")
    expect(asyncResult?.data.length).toBe(4096)
    expect(asyncResult?.data[0]).toBe(0x33)
  })

  test("ignores macOS metadata files and empty directories in zip", () => {
    const dskContent = new Uint8Array(143360)
    dskContent.fill(0xAA)

    const zipBytes = fflate.zipSync({
      "__MACOSX/._game.dsk": new Uint8Array([1, 2, 3]),
      ".DS_Store": new Uint8Array([4, 5]),
      "game.dsk": dskContent,
    })

    const result = unzipSingleFile(zipBytes, "archive.zip", [".dsk", ".woz"])
    expect(result).not.toBeNull()
    expect(result?.filename).toBe("game.dsk")
    expect(result?.data.length).toBe(143360)
  })

  test("finds preferred extension when archive has multiple files", () => {
    const hdvContent = new Uint8Array(819200)
    const txtContent = new Uint8Array(2048)

    const zipBytes = fflate.zipSync({
      "manual.txt": txtContent,
      "disk.hdv": hdvContent,
    })

    const result = unzipSingleFile(zipBytes, "bundle.zip", [".hdv", ".img"])
    expect(result).not.toBeNull()
    expect(result?.filename).toBe("disk.hdv")
    expect(result?.data.length).toBe(819200)
  })

  test("unzipAllDiskFiles extracts multiple disks in natural numeric order and ignores non-disks and macOS metadata", () => {
    const disk1 = new Uint8Array(143360)
    const disk2 = new Uint8Array(143360)
    const disk11 = new Uint8Array(143360)
    disk1[0] = 1
    disk2[0] = 2
    disk11[0] = 11

    const zipBytes = fflate.zipSync({
      "AppleWorks 5.0 - Disk 11.po": disk11,
      "AppleWorks 5.0 - Disk 1.po": disk1,
      "AppleWorks 5.0 - Disk 2.po": disk2,
      "__MACOSX/._AppleWorks 5.0 - Disk 1.po": new Uint8Array([1, 2, 3]),
      "README.txt": fflate.strToU8("Some text"),
      ".DS_Store": new Uint8Array([4, 5]),
    })

    const results = unzipAllDiskFiles(zipBytes, "AppleWorks.zip")
    expect(results).not.toBeNull()
    expect(results?.length).toBe(3)
    expect(results?.map(r => r.filename)).toEqual([
      "AppleWorks 5.0 - Disk 1.po",
      "AppleWorks 5.0 - Disk 2.po",
      "AppleWorks 5.0 - Disk 11.po",
    ])
    expect(results?.[0].data[0]).toBe(1)
    expect(results?.[1].data[0]).toBe(2)
    expect(results?.[2].data[0]).toBe(11)
  })

  test("unzipAllDiskFiles handles multiple disks inside subdirectories", () => {
    const sideA = new Uint8Array(2048)
    const sideB = new Uint8Array(2048)

    const zipBytes = fflate.zipSync({
      "Ultima III/Side B.woz": sideB,
      "Ultima III/Side A.woz": sideA,
    })

    const results = unzipAllDiskFiles(zipBytes, "Ultima_III.zip")
    expect(results).not.toBeNull()
    expect(results?.length).toBe(2)
    expect(results?.[0].filename).toBe("Side A.woz")
    expect(results?.[1].filename).toBe("Side B.woz")
  })

  test("decompressAllDiskFiles handles single .gz file", async () => {
    const content = new Uint8Array(1024)
    content.fill(0x88)
    const gzBytes = fflate.gzipSync(content)

    const results = await decompressAllDiskFiles(gzBytes, "single.po.gz")
    expect(results).not.toBeNull()
    expect(results?.length).toBe(1)
    expect(results?.[0].filename).toBe("single.po")
    expect(results?.[0].data[0]).toBe(0x88)
  })

  test("decompresses *.7z archive with sevenzip-wasm", async () => {
    const SevenZipModule = await import("sevenzip-wasm")
    const SevenZip = (SevenZipModule as { default?: unknown }).default || SevenZipModule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sz = await (SevenZip as () => Promise<any>)()

    const rawDisk = new Uint8Array(1024)
    rawDisk.fill(0x77)
    sz.FS.writeFile("sdcard.img", rawDisk)
    sz.callMain(["a", "test_bundle.7z", "sdcard.img"])
    const archive7z = sz.FS.readFile("test_bundle.7z")

    const result = await decompressSingleFile(archive7z, "test_bundle.7z", [".img"])
    expect(result).not.toBeNull()
    expect(result?.filename).toBe("sdcard.img")
    expect(result?.data.length).toBe(1024)
    expect(result?.data[0]).toBe(0x77)
  })

  test("sorts BAD_APPLE.DSK before BAD_APPLE_DATA.DSK in multi-disk zip", () => {
    const disk1 = new Uint8Array(143360)
    const disk2 = new Uint8Array(143360)
    const zipped = fflate.zipSync({
      "BAD_APPLE_DATA.DSK": disk2,
      "BAD_APPLE.DSK": disk1,
    })
    const unzipped = unzipAllDiskFiles(zipped, "BadApple.zip")
    expect(unzipped).not.toBeNull()
    expect(unzipped?.length).toBe(2)
    expect(unzipped?.[0].filename).toBe("BAD_APPLE.DSK")
    expect(unzipped?.[1].filename).toBe("BAD_APPLE_DATA.DSK")
  })
})
