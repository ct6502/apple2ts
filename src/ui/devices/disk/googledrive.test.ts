const mockRequestAccessToken = jest.fn()
const mockInitTokenClient = jest.fn(() => ({
  callback: () => {},
  requestAccessToken: mockRequestAccessToken,
}))

jest.mock("../../img/iconfunctions", () => ({
  appID: () => "app-id",
  clientID: () => "client-id",
  pickerKey: () => "picker-key",
}))
jest.mock("../../ui_utilities", () => ({ showGlobalProgressModal: jest.fn() }))
jest.mock("./cloudscriptloader", () => ({ loadGoogleDriveScripts: jest.fn() }))

import { GoogleDrive } from "./googledrive"

describe("Google Drive REST provider", () => {
  const originalFetch = globalThis.fetch

  beforeAll(() => {
    Object.defineProperty(globalThis, "google", {
      configurable: true,
      value: {
        accounts: { oauth2: { initTokenClient: mockInitTokenClient } },
      },
    })
  })

  afterAll(() => {
    globalThis.fetch = originalFetch
    Reflect.deleteProperty(globalThis, "google")
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequestAccessToken.mockImplementation(() => {
      const client = mockInitTokenClient.mock.results[0].value
      client.callback({ access_token: "drive-token" } as google.accounts.oauth2.TokenResponse)
    })
  })

  test("signs in, follows folder pagination, and maps Drive files", async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: [{ id: "folder", name: "Games", mimeType: "application/vnd.google-apps.folder" }],
          nextPageToken: "next-page",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          files: [{
            id: "disk",
            name: "Disk.po",
            mimeType: "application/octet-stream",
            size: "143360",
            parents: ["root"],
            webViewLink: "https://drive.example/Disk.po",
          }],
        }),
      } as Response)
    globalThis.fetch = fetchMock

    const drive = new GoogleDrive()
    await expect(drive.listFolder("root")).resolves.toEqual([
      expect.objectContaining({ id: "folder", name: "Games", kind: "folder" }),
      expect.objectContaining({
        id: "disk",
        name: "Disk.po",
        kind: "file",
        size: 143360,
        parentId: "root",
      }),
    ])

    expect(mockInitTokenClient).toHaveBeenCalledWith(expect.objectContaining({
      client_id: "app-id-client-id.apps.googleusercontent.com",
      scope: "https://www.googleapis.com/auth/drive",
    }))
    expect(mockRequestAccessToken).toHaveBeenCalledWith({ prompt: "consent" })
    const firstUrl = new URL(fetchMock.mock.calls[0][0] as string)
    expect(firstUrl.searchParams.get("q")).toBe("'root' in parents and trashed = false")
    const secondUrl = new URL(fetchMock.mock.calls[1][0] as string)
    expect(secondUrl.searchParams.get("pageToken")).toBe("next-page")
    expect(fetchMock.mock.calls[0][1]).toEqual({
      headers: { Authorization: "Bearer drive-token" },
    })
  })

  test("downloads a preselected file without opening the picker", async () => {
    const blob = new Blob([new Uint8Array([1, 2, 3])])
    const fetchMock = jest.fn(async () => ({
      ok: true,
      status: 200,
      statusText: "OK",
      blob: async () => blob,
    } as Response))
    globalThis.fetch = fetchMock
    const drive = new GoogleDrive({
      id: "disk id",
      name: "Disk.po",
      kind: "file",
      parentId: "root",
      size: blob.size,
      webUrl: "https://drive.example/Disk.po",
    })

    const result = await drive.download("")

    expect(fetchMock).toHaveBeenCalledWith(
      "https://www.googleapis.com/drive/v3/files/disk%20id?alt=media",
      { headers: { Authorization: "Bearer drive-token" } },
    )
    expect(result?.[0]).toBe(blob)
    expect(result?.[1]).toMatchObject({
      providerName: "GoogleDrive",
      fileName: "Disk.po",
      itemId: "disk id",
      parentId: "root",
      fileSize: 3,
    })
  })

  test("authenticates before syncing a disk", async () => {
    const fetchMock = jest.fn()
    globalThis.fetch = fetchMock
    const drive = new GoogleDrive()
    jest.spyOn(drive, "signIn").mockResolvedValue(false)
    const cloudData = {
      providerName: "GoogleDrive",
      syncStatus: 0,
      syncInterval: 60000,
      lastSyncTime: -1,
      fileName: "Disk.po",
      itemId: "disk",
      apiEndpoint: "",
      downloadUrl: "",
      detailsUrl: "",
      fileSize: 0,
    }

    await expect(drive.sync(new Blob(["disk"]), cloudData)).resolves.toBe(false)

    expect(drive.signIn).toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
