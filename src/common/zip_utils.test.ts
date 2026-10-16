import * as fflate from "fflate"
import { unzipSingleFile } from "./zip_utils"

describe("unzipSingleFile", () => {
  test("returns null for non-zip data", () => {
    const rawData = new Uint8Array([1, 2, 3, 4, 5])
    expect(unzipSingleFile(rawData, "test.bin")).toBeNull()
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

  test("ignores macOS metadata files and empty directories", () => {
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
})
