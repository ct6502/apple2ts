import * as fflate from "fflate"
import { handleSetVeraSdFromURL } from "./verasdicon"
import { handleSetVeraSdImage } from "../../main2worker"

jest.mock("../disk/apple2tsproxy", () => ({
  hasApple2tsProxy: jest.fn(() => false),
}))

jest.mock("../disk/demozoodialog", () => ({
  default: () => null,
}))

jest.mock("../../main2worker", () => ({
  handleSetVeraSdImage: jest.fn(),
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
})
