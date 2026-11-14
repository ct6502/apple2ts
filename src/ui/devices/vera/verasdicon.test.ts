import * as fflate from "fflate"
import {
  handleSetVeraSdFromURL,
  getStandbyVeraDisks,
  getStandbyVeraActiveIndex,
  swapVeraStandbyDisk,
  ejectVeraSd,
} from "./verasdicon"
import { handleSetVeraSdImage } from "../../main2worker"

if (typeof globalThis.TextDecoder === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const util = require("util")
  globalThis.TextDecoder = util.TextDecoder
  globalThis.TextEncoder = util.TextEncoder
}

jest.mock("../disk/driveprops", () => ({
  findMatchingDiskImage: jest.fn(() => ({ diskUrl: null })),
  handleSetDiskOrFileFromBuffer: jest.fn(),
  fetchWithCorsProxy: jest.fn(),
  setStandbyDisks: jest.fn(),
}))

jest.mock("../../main2worker", () => ({
  handleSetVeraSdImage: jest.fn(),
  handleGetVeraSdStatus: jest.fn(() => ({ attached: true, hasChanges: false, name: "disk1.img" })),
  getPreferenceSlotConfig: jest.fn(() => ({ 2: "vera" })),
  handleGetSlotConfig: jest.fn(() => ({ 2: "vera" })),
}))

describe("handleSetVeraSdFromURL", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("loads uncompressed .img URL directly", async () => {
    const fakeImgData = new Uint8Array([0x12, 0x34, 0x56, 0x78])
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakeImgData.buffer,
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL("https://example.com/slideshow.img")
    expect(success).toBe(true)
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      "slideshow.img"
    )
    const calledData = (handleSetVeraSdImage as jest.Mock).mock.calls[0][0]
    expect(calledData[0]).toBe(0x12)
    expect(calledData[1]).toBe(0x34)
  })

  test("unzips *.img.zip on the fly and passes extracted *.img", async () => {
    const imgData = new Uint8Array(4096)
    imgData[0] = 0xAA
    imgData[1] = 0xBB

    const zipBytes = fflate.zipSync({
      "slideshow.img": imgData,
      "info.txt": fflate.strToU8("Some readme"),
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => zipBytes.buffer,
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL("https://example.com/slideshow.img.zip")
    expect(success).toBe(true)
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      "slideshow.img"
    )
    const calledData = (handleSetVeraSdImage as jest.Mock).mock.calls[0][0]
    expect(calledData.length).toBe(4096)
    expect(calledData[0]).toBe(0xAA)
    expect(calledData[1]).toBe(0xBB)
  })

  test("decompresses *.img.gz on the fly and passes extracted *.img", async () => {
    const imgData = new Uint8Array(4096)
    imgData[0] = 0x55
    imgData[1] = 0x66

    const gzBytes = fflate.gzipSync(imgData)

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => gzBytes.buffer,
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL("https://example.com/slideshow.img.gz")
    expect(success).toBe(true)
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      "slideshow.img"
    )
    const calledData = (handleSetVeraSdImage as jest.Mock).mock.calls[0][0]
    expect(calledData.length).toBe(4096)
    expect(calledData[0]).toBe(0x55)
    expect(calledData[1]).toBe(0x66)
  })

  test("decompresses *.img.7z on the fly and passes extracted *.img", async () => {
    const SevenZipModule = await import("sevenzip-wasm")
    const SevenZip = (SevenZipModule as { default?: unknown }).default || SevenZipModule
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sz = await (SevenZip as () => Promise<any>)()

    const rawDisk = new Uint8Array(2048)
    rawDisk.fill(0x88)
    sz.FS.writeFile("sdcard.img", rawDisk)
    sz.callMain(["a", "veracard.7z", "sdcard.img"])
    const archive7z = sz.FS.readFile("veracard.7z")

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => archive7z.buffer,
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL("https://example.com/veracard.7z")
    expect(success).toBe(true)
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(
      expect.any(Uint8Array),
      "sdcard.img"
    )
    const calledData = (handleSetVeraSdImage as jest.Mock).mock.calls[0][0]
    expect(calledData.length).toBe(2048)
    expect(calledData[0]).toBe(0x88)
  })

  test("loads multiple disk URLs via '|' separator, populates standby list, and allows swapping", async () => {
    const disk1 = new Uint8Array([0x11, 0x22])
    const disk2 = new Uint8Array([0x33, 0x44])

    global.fetch = jest.fn().mockImplementation((url: string) => {
      if (url.includes("disk1.img")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: async () => disk1.buffer,
        })
      }
      if (url.includes("disk2.img")) {
        return Promise.resolve({
          ok: true,
          arrayBuffer: async () => disk2.buffer,
        })
      }
      return Promise.reject(new Error("not found"))
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL(
      "{https://example.com/disk1.img|Disk 1, disk2.img|Disk 2}"
    )
    expect(success).toBe(true)

    const standby = getStandbyVeraDisks()
    expect(standby.length).toBe(2)
    expect(standby[0].filename).toBe("disk1.img")
    expect(standby[0].comment).toBe("Disk 1")
    expect(standby[1].filename).toBe("disk2.img")
    expect(standby[1].comment).toBe("Disk 2")
    expect(getStandbyVeraActiveIndex()).toBe(0)

    // Initial loaded image is disk 1
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(disk1, "disk1.img")

    // Swap to disk 2
    await swapVeraStandbyDisk(1)
    expect(getStandbyVeraActiveIndex()).toBe(1)
    expect(handleSetVeraSdImage).toHaveBeenLastCalledWith(disk2, "disk2.img")

    // Eject clears standby list
    ejectVeraSd()
    expect(getStandbyVeraDisks()).toEqual([])
    expect(getStandbyVeraActiveIndex()).toBe(0)
  })

  test("loads archive containing multiple disk images and populates standby list", async () => {
    const d1 = new Uint8Array([0xAA, 0x11])
    const d2 = new Uint8Array([0xBB, 0x22])

    const zipBytes = fflate.zipSync({
      "game_disk2.img": d2,
      "game_disk1.img": d1,
    })

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => zipBytes.buffer,
    }) as unknown as typeof fetch

    const success = await handleSetVeraSdFromURL("https://example.com/twodiskgame.zip")
    expect(success).toBe(true)

    const standby = getStandbyVeraDisks()
    expect(standby.length).toBe(2)
    // Sorted naturally
    expect(standby[0].filename).toBe("game_disk1.img")
    expect(standby[1].filename).toBe("game_disk2.img")
    expect(getStandbyVeraActiveIndex()).toBe(0)
    expect(handleSetVeraSdImage).toHaveBeenCalledWith(d1, "game_disk1.img")

    ejectVeraSd()
  })
})
