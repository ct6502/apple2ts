import { CLOUD_SYNC } from "../../../common/utility"
import { showGlobalProgressModal } from "../../ui_utilities"

// const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

// Make these global so we don't have to keep re-selecting our Google Drive account
let g_accessToken: string = ""
let g_pickerInited = false

export class GoogleDrive implements CloudProvider {
  
  tokenClient: GoogleTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: "831415990117-n2n9ms5nidatg7rmcb12tvpm8kirtbpt.apps.googleusercontent.com",
    scope: "https://www.googleapis.com/auth/drive.file",
    callback: () => {}, // defined later
  })

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
        .setDeveloperKey("AIzaSyAPlfA031A8MyXrDd-o9xaHjEmEUkW64R4")
        .setCallback(this.pickerCallback)
        .setAppId("831415990117")
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
    this.tokenClient.callback = async (response: google.accounts.oauth2.TokenResponse) => {
      if (response.error !== undefined) {
        throw (response)
      }
      g_accessToken = response.access_token
      showPicker(view, filter)
    }

    if (g_accessToken === "") {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({prompt: "consent"})
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
    if (!g_accessToken) {
      this.tokenClient.callback = async (response: google.accounts.oauth2.TokenResponse) => {
        if (response.error !== undefined) {
          throw (response)
        }
        g_accessToken = response.access_token
        callback(`Bearer ${response.access_token}`)
      }
      this.tokenClient.requestAccessToken({prompt: "consent"})
    } else {
      callback(`Bearer ${g_accessToken}`)
    }
  }

  async download(filter: string): Promise<[Blob, CloudData]|null> {
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

  async upload(filename: string, blob: Blob): Promise<CloudData | null> {
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
