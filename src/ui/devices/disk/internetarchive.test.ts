const mockHandleSetDiskFromURL = jest.fn()

jest.mock("./driveprops", () => ({
  handleSetDiskFromURL: (...args: unknown[]) => mockHandleSetDiskFromURL(...args),
}))
jest.mock("./apple2tsproxy", () => ({
  apple2tsProxyPath: (path: string) => path,
  hasApple2tsProxy: false,
}))

import {
  buildInternetArchiveQueryUrl,
  createInternetArchiveCloudData,
  internetArchiveCollections,
  loadInternetArchiveResult,
  searchInternetArchive,
} from "./internetarchive"

describe("Internet Archive service", () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    mockHandleSetDiskFromURL.mockReset()
  })

  test("builds and parses a paged collection search", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: { docs: [{ identifier: "alpha", title: "Alpha" }], numFound: 26 } }),
    } as Response)
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchMock })

    const page = await searchInternetArchive("wizard", internetArchiveCollections[1].id, 2)

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("title:(wizard)"))
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("page=2"))
    expect(page).toEqual({ results: [{ identifier: "alpha", title: "Alpha" }], total: 26 })
    expect(buildInternetArchiveQueryUrl("", "softwarelibrary_apple", 1)).toContain("title:(*)")
  })

  test("loads a result through the shared IA launch path", async () => {
    mockHandleSetDiskFromURL.mockResolvedValue(true)
    const result = { identifier: "wizardry" }
    const cloudData = createInternetArchiveCloudData(result)

    await expect(loadInternetArchiveResult(result, 3)).resolves.toBe(true)
    expect(mockHandleSetDiskFromURL).toHaveBeenCalledWith(
      "a2ia://wizardry",
      undefined,
      3,
      cloudData,
    )
  })
})
