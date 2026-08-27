const mockFetchDisk = jest.fn()
const mockFetchPrelaunch = jest.fn()
const mockExtractBinFiles = jest.fn()
const mockParsePrelaunch = jest.fn()

jest.mock("./four_cade_prelaunch_db", () => ({
  ...jest.requireActual("./four_cade_prelaunch_db"),
  fetchFourCadeDisk: (...args: unknown[]) => mockFetchDisk(...args),
  fetchFourCadePrelaunch: (...args: unknown[]) => mockFetchPrelaunch(...args),
  extractAllBinFiles: (...args: unknown[]) => mockExtractBinFiles(...args),
  parsePrelaunchScript: (...args: unknown[]) => mockParsePrelaunch(...args),
}))

import { preprocessInputFilesForMenu } from "./prodos_hdv"

const inputFiles = [{ name: "AZTEC", type: 0xE0, data: new Uint8Array() }]
const menuEntry = { filename: "AZTEC", displayName: "Aztec", imageKind: "4cade" as const }

describe("4cade HDV export failures", () => {
  const stopExport = jest.fn(() => false)

  beforeEach(() => {
    mockFetchDisk.mockResolvedValue(new Uint8Array([1, 2, 3]))
    mockFetchPrelaunch.mockResolvedValue("jmp $800")
    mockExtractBinFiles.mockReturnValue([
      { data: new Uint8Array([0x60]), loadAddress: 0x0800, name: "AZTEC" },
    ])
    mockParsePrelaunch.mockReturnValue({ sequence: [], entry: "loadAddress" })
    stopExport.mockClear()
  })

  test("reports a title missing from the catalog", async () => {
    await expect(preprocessInputFilesForMenu(inputFiles, [
      { ...menuEntry, displayName: "Missing 4cade title" },
    ], undefined, stopExport)).rejects.toThrow(
      "Could not export \"Missing 4cade title\": the title is not in the 4cade catalog",
    )
    expect(stopExport).toHaveBeenCalledWith({
      title: "Missing 4cade title",
      reason: "the title is not in the 4cade catalog",
    })
  })

  test("reports failed 4cade preparation", async () => {
    mockFetchDisk.mockRejectedValue(new Error("HTTP 503"))

    await expect(preprocessInputFilesForMenu(inputFiles, [menuEntry], undefined, stopExport))
      .rejects.toThrow("Could not export \"Aztec\": 4cade preparation failed: HTTP 503")
  })

  test("reports a downloaded disk without a usable binary", async () => {
    mockExtractBinFiles.mockReturnValue([])

    await expect(preprocessInputFilesForMenu(inputFiles, [menuEntry], undefined, stopExport))
      .rejects.toThrow("Could not export \"Aztec\": the downloaded 4cade disk contains no usable binary")
  })

  test("reports an invalid prelaunch script", async () => {
    mockParsePrelaunch.mockReturnValue(undefined)

    await expect(preprocessInputFilesForMenu(inputFiles, [menuEntry], undefined, stopExport))
      .rejects.toThrow("Could not export \"Aztec\": the 4cade prelaunch script is unsupported or invalid")
  })

  test("omits a failed title when the caller continues", async () => {
    const continueExport = jest.fn(() => true)

    await expect(preprocessInputFilesForMenu(inputFiles, [
      { ...menuEntry, displayName: "Missing 4cade title" },
    ], undefined, continueExport)).resolves.toBeDefined()
    expect(continueExport).toHaveBeenCalledTimes(1)
  })
})
