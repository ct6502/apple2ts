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
        picker: {
          Document: { ID: "id", NAME: "name", PARENT_ID: "parentId", URL: "url" },
        },
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
      scope: "https://www.googleapis.com/auth/drive.file",
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

  test("downloads multiple files selected via Google Drive picker", async () => {
    const blob1 = new Blob([new Uint8Array([1, 1])])
    const blob2 = new Blob([new Uint8Array([2, 2])])
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({ ok: true, blob: async () => blob1 } as Response)
      .mockResolvedValueOnce({ ok: true, blob: async () => blob2 } as Response)
    globalThis.fetch = fetchMock

    const drive = new GoogleDrive()
    drive.createPicker = jest.fn(() => {
      drive.pickerCallback({
        action: "picked",
        docs: [
          {
            [google.picker.Document.ID]: "id1",
            [google.picker.Document.NAME]: "Game_Disk1.dsk",
            [google.picker.Document.PARENT_ID]: "root",
            [google.picker.Document.URL]: "https://drive.example/1",
          },
          {
            [google.picker.Document.ID]: "id2",
            [google.picker.Document.NAME]: "Game_Disk2.dsk",
            [google.picker.Document.PARENT_ID]: "root",
            [google.picker.Document.URL]: "https://drive.example/2",
          },
        ],
      } as unknown as google.picker.ResponseObject)
    })

    const result = await drive.download(".dsk,.woz,.zip")

    expect(Array.isArray(result)).toBe(true)
    const items = result as Array<[Blob, unknown]>
    expect(items.length).toBe(2)
    expect(items[0][0]).toBe(blob1)
    expect(items[0][1]).toMatchObject({ fileName: "Game_Disk1.dsk", itemId: "id1" })
    expect(items[1][0]).toBe(blob2)
    expect(items[1][1]).toMatchObject({ fileName: "Game_Disk2.dsk", itemId: "id2" })
  })

  test("refuses to sync archive container without modifying sync status", async () => {
    const drive = new GoogleDrive()
    const cloudData: CloudData = {
      providerName: "GoogleDrive",
      syncStatus: 1,
      syncInterval: 60000,
      lastSyncTime: Date.now(),
      fileName: "games.zip",
      itemId: "id1",
      apiEndpoint: "",
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
