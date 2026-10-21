const mockInitialize = jest.fn(async () => undefined)
const mockLoginPopup = jest.fn(async () => ({ accessToken: "graph-token" }))
const mockGetAllAccounts = jest.fn(() => [])
const mockGraphGet = jest.fn()
const mockGraphResponseType = jest.fn()
const mockGraphApi = jest.fn(() => ({
  get: mockGraphGet,
  responseType: mockGraphResponseType,
}))

jest.mock("@azure/msal-browser", () => ({
  BrowserCacheLocation: { MemoryStorage: "memoryStorage" },
  PublicClientApplication: jest.fn().mockImplementation(() => ({
    initialize: mockInitialize,
    getAllAccounts: mockGetAllAccounts,
    loginPopup: mockLoginPopup,
    acquireTokenSilent: jest.fn(),
    acquireTokenPopup: jest.fn(),
  })),
}))
jest.mock("@microsoft/microsoft-graph-client", () => ({
  Client: { init: jest.fn(() => ({ api: mockGraphApi })) },
  ResponseType: { BLOB: "blob" },
}))
jest.mock("../../ui_utilities", () => ({ showGlobalProgressModal: jest.fn() }))
jest.mock("./cloudscriptloader", () => ({ loadOneDriveScript: jest.fn() }))

import { OneDriveCloudDrive } from "./onedriveclouddrive"

describe("OneDrive Graph provider", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test("signs in, follows folder pagination, and maps Graph items", async () => {
    const drive = new OneDriveCloudDrive()
    await expect(drive.signIn()).resolves.toBe(true)
    expect(mockInitialize).toHaveBeenCalled()
    expect(mockLoginPopup).toHaveBeenCalledWith({ scopes: ["Files.ReadWrite"] })

    mockGraphGet
      .mockResolvedValueOnce({
        value: [{ id: "folder", name: "Games", folder: {} }],
        "@odata.nextLink": "https://graph.microsoft.com/next",
      })
      .mockResolvedValueOnce({
        value: [{
          id: "disk",
          name: "Disk.po",
          size: 143360,
          parentReference: { id: "root" },
          webUrl: "https://onedrive.example/Disk.po",
          "@microsoft.graph.downloadUrl": "https://download.example/Disk.po",
        }],
      })

    await expect(drive.listFolder("root")).resolves.toEqual([
      expect.objectContaining({ id: "folder", name: "Games", kind: "folder" }),
      expect.objectContaining({ id: "disk", name: "Disk.po", kind: "file", size: 143360 }),
    ])
    expect(mockGraphApi).toHaveBeenNthCalledWith(1, "/me/drive/root/children")
    expect(mockGraphApi).toHaveBeenNthCalledWith(2, "https://graph.microsoft.com/next")
  })

  test("downloads a preselected file without opening the picker", async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])])
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      blob: async () => blob,
    } as Response))
    globalThis.fetch = fetchMock
    const drive = new OneDriveCloudDrive({
      id: "disk",
      name: "Disk.po",
      kind: "file",
      parentId: "root",
      size: blob.size,
      downloadUrl: "https://download.example/Disk.po",
      webUrl: "https://onedrive.example/Disk.po",
    })

    const result = await drive.download("")

    expect(fetchMock).toHaveBeenCalledWith("https://download.example/Disk.po")
    expect(result?.[0]).toBe(blob)
    expect(result?.[1]).toMatchObject({
      providerName: "OneDrive",
      fileName: "Disk.po",
      itemId: "disk",
      parentId: "root",
      fileSize: 3,
    })
    globalThis.fetch = originalFetch
  })

  test("authenticates before syncing a disk", async () => {
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn()
    globalThis.fetch = fetchMock
    const drive = new OneDriveCloudDrive()
    jest.spyOn(drive, "signIn").mockResolvedValue(false)
    const cloudData = {
      providerName: "OneDrive",
      syncStatus: 0,
      syncInterval: 60000,
      lastSyncTime: -1,
      fileName: "Disk.po",
      parentId: "root",
      itemId: "disk",
      apiEndpoint: "https://graph.microsoft.com/v1.0/",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 0,
    }

    await expect(drive.sync(new Blob(["disk"]), cloudData)).resolves.toBe(false)

    expect(drive.signIn).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
    globalThis.fetch = originalFetch
  })

  test("creates upload session directly using itemId when syncing an existing disk", async () => {
    const originalFetch = globalThis.fetch
    const fetchMock = jest.fn(async (input: RequestInfo | URL) => {
      const url = String(input)
      if (url.includes("createUploadSession")) {
        return {
          ok: true,
          json: async () => ({ uploadUrl: "https://upload.example/session" }),
        } as Response
      }
      return { ok: true, json: async () => ({}) } as Response
    })
    globalThis.fetch = fetchMock
    const drive = new OneDriveCloudDrive()
    jest.spyOn(drive, "signIn").mockResolvedValue(true)
    jest.spyOn(drive, "uploadBlob").mockResolvedValue(true)

    const cloudData = {
      providerName: "OneDrive",
      syncStatus: 0,
      syncInterval: 60000,
      lastSyncTime: -1,
      fileName: "Disk.po",
      parentId: "some-parent",
      itemId: "disk-item-123",
      apiEndpoint: "https://graph.microsoft.com/v1.0/",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 4,
    }

    const success = await drive.sync(new Blob(["disk"]), cloudData)
    expect(success).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.microsoft.com/v1.0/me/drive/items/disk-item-123/createUploadSession",
      expect.objectContaining({ method: "POST" }),
    )
    globalThis.fetch = originalFetch
  })

  test("uploads chunks without authorizing the pre-authenticated session URL", async () => {
    const originalFetch = globalThis.fetch
    const originalResponse = globalThis.Response
    const fetchMock = jest.fn(async () => ({ ok: true } as Response))
    globalThis.fetch = fetchMock
    globalThis.Response = jest.fn(() => ({
      arrayBuffer: async () => new Uint8Array([1, 2, 3, 4]).buffer,
    })) as unknown as typeof Response
    const drive = new OneDriveCloudDrive()
    const cloudData = {
      providerName: "OneDrive",
      syncStatus: 0,
      syncInterval: 60000,
      lastSyncTime: -1,
      fileName: "Disk.po",
      parentId: "root",
      itemId: "disk",
      apiEndpoint: "https://graph.microsoft.com/v1.0/",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 4,
    }

    await expect(drive.uploadBlob("https://upload.example/session", new Blob(["disk"]), cloudData))
      .resolves.toBe(true)

    expect(fetchMock).toHaveBeenCalledWith("https://upload.example/session", expect.objectContaining({
      headers: {
        "Content-Length": "4",
        "Content-Range": "bytes 0-3/4",
      },
    }))
    globalThis.fetch = originalFetch
    globalThis.Response = originalResponse
  })

  test("downloads multiple files selected via OneDrive picker", async () => {
    const originalFetch = globalThis.fetch
    const blob1 = new Blob([new Uint8Array([1, 1])])
    const blob2 = new Blob([new Uint8Array([2, 2])])
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, blob: async () => blob1 } as Response)
      .mockResolvedValueOnce({ ok: true, blob: async () => blob2 } as Response)
    globalThis.fetch = fetchMock

    const mockOpen = jest.fn((options: { success: (res: unknown) => void }) => {
      options.success({
        value: [
          {
            id: "disk1",
            name: "Disk1.dsk",
            size: 2,
            "@content.downloadUrl": "https://download.example/Disk1.dsk",
            parentReference: { id: "root" },
            webUrl: "https://onedrive.example/Disk1.dsk",
          },
          {
            id: "disk2",
            name: "Disk2.dsk",
            size: 2,
            "@content.downloadUrl": "https://download.example/Disk2.dsk",
            parentReference: { id: "root" },
            webUrl: "https://onedrive.example/Disk2.dsk",
          },
        ],
        accessToken: "od-token",
        apiEndpoint: "https://graph.microsoft.com/v1.0/",
      })
    })
    Object.defineProperty(globalThis, "OneDrive", {
      configurable: true,
      value: { open: mockOpen },
    })

    const drive = new OneDriveCloudDrive()
    const result = await drive.download(".dsk,.woz,.zip")

    expect(mockOpen).toHaveBeenCalledWith(expect.objectContaining({
      action: "share",
      multiSelect: true,
    }))
    expect(Array.isArray(result)).toBe(true)
    const items = result as Array<[Blob, unknown]>
    expect(items.length).toBe(2)
    expect(items[0][0]).toBe(blob1)
    expect(items[0][1]).toMatchObject({ fileName: "Disk1.dsk", itemId: "disk1" })
    expect(items[1][0]).toBe(blob2)
    expect(items[1][1]).toMatchObject({ fileName: "Disk2.dsk", itemId: "disk2" })

    globalThis.fetch = originalFetch
    Reflect.deleteProperty(globalThis, "OneDrive")
  })

  test("refuses to sync archive container without modifying sync status", async () => {
    const drive = new OneDriveCloudDrive()
    const cloudData: CloudData = {
      providerName: "OneDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "games.zip",
      itemId: "disk1",
      apiEndpoint: "https://graph.microsoft.com/v1.0/",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 1000,
      isArchive: true,
    }
    const result = await drive.sync(new Blob([new Uint8Array(143360)]), cloudData)
    expect(result).toBe(false)
    expect(cloudData.syncStatus).toBe(1)
  })
})