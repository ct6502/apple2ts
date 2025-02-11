import { CLOUD_SYNC } from "../../common/utility"

// const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

// Make these global so we don't have to keep re-selecting our Google Drive account
let g_accessToken: string = ""
let g_pickerInited = false

export class GoogleDrive implements CloudProvider {
  gisInited = false
  tokenClient: any
  private resolvePicker: ((result: GoogleDriveResult | null) => void) | null = null

  // Create and render a Google Picker object for selecting from Drive.
  createPicker = (view: string, filter?: string) => {
    const showPicker = (view: string, filter?: string) => {
      let googleView: google.picker.DocsView
      if (view === 'file') {
        googleView = new google.picker.DocsView(google.picker.ViewId.DOCS)
          .setIncludeFolders(true)
          .setMimeTypes("application/octet-stream")
        if (filter) {
          const modifiedFilter = filter.replace(/,/g, '|')
          googleView.setQuery(modifiedFilter)
        }
      } else {
        googleView = new google.picker.DocsView(google.picker.ViewId.FOLDERS)
          .setSelectFolderEnabled(true)
          .setIncludeFolders(true)
          .setMimeTypes('application/vnd.google-apps.folder')
      }
      const picker = new google.picker.PickerBuilder()
        .addView(googleView)
        // .enableFeature(google.picker.Feature.NAV_HIDDEN)  // hide the nav bar at the top
        .enableFeature(google.picker.Feature.MINE_ONLY)   // only show user's drive files
        .setOAuthToken(g_accessToken)
        .setDeveloperKey('AIzaSyAPlfA031A8MyXrDd-o9xaHjEmEUkW64R4')
        .setCallback(this.pickerCallback)
        .setAppId('831415990117')
        .setTitle(`Select a ${view === 'file' ? 'disk image' : 'folder'}`)
        .build()
      picker.setVisible(true)
    }

    if (!g_pickerInited) {
      gapi.load('picker', () => {
        g_pickerInited = true
      } )
      gapi.load('client:auth2', () => {
      } )
    }

    if (!this.gisInited) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '831415990117-n2n9ms5nidatg7rmcb12tvpm8kirtbpt.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: () => {}, // defined later
      })
      this.gisInited = true
    }

    // Request an access token.
    this.tokenClient.callback = async (response: any) => {
      if (response.error !== undefined) {
        throw (response)
      }
      g_accessToken = response.access_token
      showPicker(view, filter)
    }

    if (g_accessToken === "") {
      // Prompt the user to select a Google Account and ask for consent to share their data
      // when establishing a new session.
      this.tokenClient.requestAccessToken({prompt: 'consent'})
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      showPicker(view, filter)
    }
  }

  // Once a file/folder gets picked, it calls back here.
  pickerCallback = (data: any) => {
    // console.log(`data = ${JSON.stringify(data, null, 2)}`)
    if (data["action"] === "picked") {
      const doc = data["docs"][0]
      if (this.resolvePicker) {
        this.resolvePicker({
          fileId: doc[google.picker.Document.ID],
          parentID: doc[google.picker.Document.PARENT_ID],
          fileName: doc[google.picker.Document.NAME],
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
    return new Promise<GoogleDriveResult | null>(async (resolve, reject) => {
      try {
        this.resolvePicker = resolve
        this.createPicker(view, filter)
      } catch (error) {
        reject(error)
      }
    })
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
        accessToken: "",
        itemId: result.fileId,
        apiEndpoint: "",
        parentID: result.parentID,
      }

      const url = `https://www.googleapis.com/drive/v3/files/${result.fileId}?alt=media`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${g_accessToken}`
        }
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
        accessToken: "",
        itemId: "",
        apiEndpoint: "",
        parentID: result.fileId,
      }

      try {
        const metadata = {
          name: filename,
          parents: [cloudData.parentID],
        }
        const form = new FormData()
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
        form.append('file', blob)

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + g_accessToken }),
          body: form,
        })

        if (response.ok) {
          console.log(`File upload success: ${filename}`)
          // Make sure to get our new Google Drive fileId so we can sync later.
          const responseData = await response.json();
          cloudData.itemId = responseData.id;
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
      form.append('file', blob)
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${cloudData.itemId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': 'Bearer ' + g_accessToken }),
        body: blob,
      })

      if (response.ok) {
        console.log(`File sync success: ${cloudData.fileName}`)
        cloudData.syncStatus = CLOUD_SYNC.ACTIVE
        return true
      } else {
        console.error('Error syncing file:', response.statusText)
        cloudData.syncStatus = CLOUD_SYNC.FAILED
        return false
      }
    } catch (error) {
      console.error('Error syncing file:', error)
      cloudData.syncStatus = CLOUD_SYNC.FAILED
      return false
    }

    return false
  }
}


interface GoogleDriveResult {
  fileId: string,
  parentID: string,
  fileName: string
}
