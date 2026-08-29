import { CLOUD_SYNC } from "../../../common/utility"
import { appID, clientID, pickerKey } from "../../img/iconfunctions"
import { showGlobalProgressModal } from "../../ui_utilities"
import { loadGoogleDriveScripts } from "./cloudscriptloader"
import type { CloudBrowserItem } from "./clouddrive_retro"

// const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

// Make these global so we don't have to keep re-selecting our Google Drive account
let g_accessToken: string = ""
let g_pickerInited = false

const driveScope = "https://www.googleapis.com/auth/drive"

type GoogleDriveFile = {
  id?: string
  name?: string
  mimeType?: string
  size?: string
  parents?: string[]
  webViewLink?: string
}

type GoogleDriveFilePage = {
  files?: GoogleDriveFile[]
  nextPageToken?: string
}

export class GoogleDrive implements CloudProvider {

  constructor(private readonly selectedItem?: CloudBrowserItem) {}

  // The token client can only be created after the Google Identity Services
  // script has loaded, so it is created lazily in ensureScriptsLoaded() rather
  // than in a class-field initializer (which would run before the script loads).
  tokenClient: GoogleTokenClient | null = null

  async ensureScriptsLoaded() {
    await loadGoogleDriveScripts()
    if (!this.tokenClient) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: appID() + "-" + clientID() + ".apps.googleusercontent.com",
        scope: driveScope,
        callback: () => {}, // defined later
      })
    }
  }

  private resolvePicker: ((result: GoogleDriveResult | null) => void) | null = null

  // Create and render a Google Picker object for selecting from Drive.
  createPicker = (view: string, filter?: string) => {
    const showPicker = (view: string, filter?: string) => {
      let googleView: google.picker.DocsView
      if (view === "file") {
        googleView = new google.picker.DocsView(google.picker.ViewId.DOCS)
          .setIncludeFolders(true)
          .setMimeTypes("application/octet-stream")
        if (filter) {
          const modifiedFilter = filter.replace(/,/g, "|")
          googleView.setQuery(modifiedFilter)
        }
      } else {
        googleView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
          .setSelectFolderEnabled(true)
          .setIncludeFolders(true)
          .setMimeTypes("application/vnd.google-apps.folder")
      }
      const picker = new google.picker.PickerBuilder()
        .addView(googleView)
        // .enableFeature(google.picker.Feature.NAV_HIDDEN)  // hide the nav bar at the top
        .enableFeature(google.picker.Feature.MINE_ONLY)   // only show user's drive files
        .setOAuthToken(g_accessToken)
        .setDeveloperKey(pickerKey())
        .setCallback(this.pickerCallback)
        .setAppId(appID())
        .setTitle(`Select a ${view === "file" ? "disk image" : "folder"}`)
        .build()
      picker.setVisible(true)
    }

    if (!g_pickerInited) {
      gapi.load("picker", () => {
        g_pickerInited = true
      } )
      gapi.load("client:auth2", () => {
      } )
    }

    // Request an access token.
    this.tokenClient!.callback = async (response: google.accounts.oauth2.TokenResponse) => {
      if (response.error !== undefined) {
        throw (response)
      }
      g_accessToken = response.access_token
      showPicker(view, filter)
    }

    if (g_accessToken === "") {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient!.requestAccessToken({prompt: "consent"})
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      showPicker(view, filter)
    }
  }

  // Once a file/folder gets picked, it calls back here.
  pickerCallback = (data: google.picker.ResponseObject) => {
    // console.log(`data = ${JSON.stringify(data, null, 2)}`)
    if (data["action"] === "picked" && data["docs"]) {
      const doc = data["docs"][0]
      if (this.resolvePicker) {
        this.resolvePicker({
          fileId: doc[google.picker.Document.ID],
          parentID: doc[google.picker.Document.PARENT_ID] ?? "",
          fileName: doc[google.picker.Document.NAME] ?? "",
          webViewLink: doc[google.picker.Document.URL] ?? ""
        })
        this.resolvePicker = null
      }
    } else if (data["action"] === "cancel") {
      if (this.resolvePicker) {
        this.resolvePicker(null)
        this.resolvePicker = null
      }
    }
  }

  launchPicker = async (view: string, filter?: string) => {
    return new Promise<GoogleDriveResult | null>((resolve, reject) => {
      try {
        this.resolvePicker = resolve
        this.createPicker(view, filter)
      } catch (error) {
        reject(error)
      }
    })
  }

  requestAuthToken(callback: (authToken: string) => void) {
    this.ensureScriptsLoaded().then(() => {
      if (!g_accessToken) {        this.tokenClient!.callback = async (response: google.accounts.oauth2.TokenResponse) => {
          if (response.error !== undefined) {
            throw (response)
          }
          g_accessToken = response.access_token
          callback(`Bearer ${response.access_token}`)
        }
        this.tokenClient!.requestAccessToken({prompt: "consent"})
      } else {
        callback(`Bearer ${g_accessToken}`)
      }
    })
  }

  // Whether a Google Drive access token is already cached in memory. Used to
  // decide, without triggering an auth popup, whether a sign-in is still needed.
  hasAuthToken(): boolean {
    return g_accessToken !== ""
  }

  async signIn(): Promise<boolean> {
    await this.ensureScriptsLoaded()
    if (g_accessToken) return true
    return new Promise(resolve => {
      this.tokenClient!.callback = async (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error !== undefined) {
          console.error("Google Drive sign-in failed", response.error)
          resolve(false)
          return
        }
        g_accessToken = response.access_token
        resolve(true)
      }
      this.tokenClient!.requestAccessToken({ prompt: "consent" })
    })
  }

  async listFolder(folderId: string): Promise<CloudBrowserItem[]> {
    if (!await this.signIn()) return []
    const items: GoogleDriveFile[] = []
    let pageToken: string | undefined
    do {
      const params = new URLSearchParams({
        q: `'${folderId}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,size,parents,webViewLink)",
        pageSize: "1000",
      })
      if (pageToken) params.set("pageToken", pageToken)
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${params}`, {
        headers: { "Authorization": `Bearer ${g_accessToken}` },
      })
      if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      const page = await response.json() as GoogleDriveFilePage
      items.push(...(page.files ?? []))
      pageToken = page.nextPageToken
    } while (pageToken)

    return items.flatMap(item => item.id && item.name ? [{
      id: item.id,
      name: item.name,
      kind: item.mimeType === "application/vnd.google-apps.folder" ? "folder" as const : "file" as const,
      size: item.size === undefined ? undefined : Number(item.size),
      parentId: item.parents?.[0],
      webUrl: item.webViewLink,
    }] : [])
  }

  async download(filter: string): Promise<[Blob, CloudData]|null> {
    if (this.selectedItem) return this.downloadSelectedItem(this.selectedItem)
    await this.ensureScriptsLoaded()
    const result = await this.launchPicker("file", filter)
    if (result) {
      const cloudData: CloudData = {
        providerName: "GoogleDrive",
        syncStatus: CLOUD_SYNC.INPROGRESS,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: Date.now(),
        fileName: result.fileName,
        itemId: result.fileId,
        apiEndpoint: "",
        parentId: result.parentID,
        downloadUrl: `https://www.googleapis.com/drive/v3/files/${result.fileId}?alt=media`,
        detailsUrl: result.webViewLink,
        fileSize: -1
      }
      
      showGlobalProgressModal(true, "Downloading disk")

      const response = await fetch(cloudData.downloadUrl, {
        headers: {
          "Authorization": `Bearer ${g_accessToken}`
        }
      })
      .finally(() => {
        showGlobalProgressModal(false)
      })
      if (response.ok) {
        console.log(`File download success: ${result.fileName}`)
        cloudData.syncStatus = CLOUD_SYNC.ACTIVE
        const blob = await response.blob()
        return [blob, cloudData]
      } else {
        console.error(`Error downloading ${result.fileName}: ${response.statusText}`)
        return null
      }
    }
    return null
  }

  private async downloadSelectedItem(item: CloudBrowserItem): Promise<[Blob, CloudData] | null> {
    if (!await this.signIn()) return null
    const downloadUrl = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(item.id)}?alt=media`
    const response = await fetch(downloadUrl, {
      headers: { "Authorization": `Bearer ${g_accessToken}` },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    const blob = await response.blob()
    return [blob, {
      providerName: "GoogleDrive",
      syncStatus: CLOUD_SYNC.ACTIVE,
      syncInterval: DEFAULT_SYNC_INTERVAL,
      lastSyncTime: Date.now(),
      fileName: item.name,
      itemId: item.id,
      apiEndpoint: "https://www.googleapis.com/drive/v3/",
      parentId: item.parentId,
      downloadUrl,
      detailsUrl: item.webUrl ?? "",
      fileSize: item.size ?? blob.size,
    }]
  }

  async upload(filename: string, blob: Blob): Promise<CloudData | null> {
    await this.ensureScriptsLoaded()
    const result = await this.launchPicker("folder")

    if (result) {
      const cloudData: CloudData = {
        providerName: "GoogleDrive",
        syncStatus: CLOUD_SYNC.INPROGRESS,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: Date.now(),
        fileName: filename,
        itemId: "",
        apiEndpoint: "",
        parentId: result.fileId,
        downloadUrl: "",  // Download URL is unknown until file is sucessfully uploaded
        detailsUrl: result.webViewLink,
        fileSize: -1
      }

      try {
        const metadata = {
          name: filename,
          parents: [cloudData.parentId],
        }
        const form = new FormData()
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }))
        form.append("file", blob)

        const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart", {
          method: "POST",
          headers: new Headers({ "Authorization": "Bearer " + g_accessToken }),
          body: form,
        })

        if (response.ok) {
          console.log(`File upload success: ${filename}`)
          // Make sure to get our new Google Drive fileId so we can sync later.
          const responseData = await response.json()
          cloudData.downloadUrl = `https://www.googleapis.com/drive/v3/files/${responseData.id}?alt=media`
          cloudData.itemId = responseData.id
          cloudData.syncStatus = CLOUD_SYNC.ACTIVE
          return cloudData
        } else {
          console.error(`Error uploading ${filename}: ${response.statusText}`)
          cloudData.syncStatus = CLOUD_SYNC.FAILED
          return null
        }
      } catch (error) {
        console.error(`Error uploading ${filename}: ${error}`)
        cloudData.syncStatus = CLOUD_SYNC.FAILED
        return null
      }
    }
    return null
  }

  async sync(blob: Blob, cloudData: CloudData): Promise<boolean> {
    cloudData.syncStatus = CLOUD_SYNC.INPROGRESS
    cloudData.lastSyncTime = Date.now()

    try {
      // // To update the file, we just need to send the blob using PATCH with no metadata.
      const form = new FormData()
      form.append("file", blob)
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${cloudData.itemId}?uploadType=media`, {
        method: "PATCH",
        headers: new Headers({ "Authorization": "Bearer " + g_accessToken }),
        body: blob,
      })

      if (response.ok) {
        console.log(`File sync success: ${cloudData.fileName}`)
        cloudData.syncStatus = CLOUD_SYNC.ACTIVE
        return true
      } else {
        console.error("Error syncing file:", response.statusText)
        cloudData.syncStatus = CLOUD_SYNC.FAILED
        return false
      }
    } catch (error) {
      console.error("Error syncing file:", error)
      cloudData.syncStatus = CLOUD_SYNC.FAILED
      return false
    }

    return false
  }
}

interface GoogleTokenClient {
  callback?: (response: google.accounts.oauth2.TokenResponse) => Promise<void>
  requestAccessToken: (overrideConfig?: google.accounts.oauth2.OverridableTokenClientConfig) => void;
}

interface GoogleDriveResult {
  fileId: string,
  parentID: string,
  fileName: string,
  webViewLink: string
}
