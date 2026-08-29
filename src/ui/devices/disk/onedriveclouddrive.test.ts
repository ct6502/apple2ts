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
})