import { CloudDrive, CloudDriveSyncStatus } from "./clouddrive"

// const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000

// Make this global so we don't have to keep re-selecting our Google Drive account
let g_accessToken: string = ""


export class GoogleDrive implements CloudDrive {
  providerName = "GoogleDrive"
  gisInited = false
  pickerInited = false
  tokenClient: any
  private resolvePicker: ((result: GoogleDriveResult | null) => void) | null = null

  syncStatus = CloudDriveSyncStatus.Inactive
  syncInterval = DEFAULT_SYNC_INTERVAL
  lastSyncTime = -1

  apiEndpoint: string = ""
  fileId: string = ""
  parentID: string = ""
  fileName: string = ""

  getFileName(): string {
    return this.fileName
  }

  setFileName(fileName: string): void {
    this.fileName = fileName
  }

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

    if (!this.pickerInited) {
      gapi.load('picker', () => {
        this.pickerInited = true
      } )
      gapi.load('client:auth2', () => {
      } )
    }

    if (!this.gisInited) {
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: '831415990117-n2n9ms5nidatg7rmcb12tvpm8kirtbpt.apps.googleusercontent.com',
        scope: 'https://www.googleapis.com/auth/drive',
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

  async download(filter: string): Promise<Blob|undefined> {
    this.syncStatus = CloudDriveSyncStatus.InProgress
    const result = await this.launchPicker("file", filter)
    if (result) {
      this.syncStatus = CloudDriveSyncStatus.InProgress
      this.lastSyncTime = Date.now()
      this.fileId = result.fileId
      this.parentID = result.parentID
      this.fileName = result.fileName

      const url = `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${g_accessToken}`
        }
      })
      if (response.ok) {
        console.log(`File download success: ${this.fileName}`)
        this.syncStatus = CloudDriveSyncStatus.Active
        return await response.blob()
      } else {
        console.error(`Error downloading ${this.fileName}: ${response.statusText}`)
        this.syncStatus = CloudDriveSyncStatus.Failed
        return undefined
      }
    }
    return undefined
  }

  async upload(filename: string, blob: Blob): Promise<boolean> {
    this.syncStatus = CloudDriveSyncStatus.InProgress
    const result = await this.launchPicker("folder")

    if (result) {
      this.syncStatus = CloudDriveSyncStatus.InProgress
      this.lastSyncTime = Date.now()
      this.parentID = result.fileId
      this.fileName = result.fileName

      try {
        const metadata = {
          name: filename,
          parents: [this.parentID],
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
          console.log(`File upload success: ${this.fileName}`)
          // Make sure to get our new Google Drive fileId so we can sync later.
          const responseData = await response.json();
          this.fileId = responseData.id;
          this.syncStatus = CloudDriveSyncStatus.Active
          return true
        } else {
          console.error(`Error uploading ${this.fileName}: ${response.statusText}`)
          this.syncStatus = CloudDriveSyncStatus.Failed
          return false
        }
      } catch (error) {
        console.error(`Error uploading ${this.fileName}: ${error}`)
        this.syncStatus = CloudDriveSyncStatus.Failed
        return false
      }
    }
    return false
  }

  async sync(blob: Blob): Promise<boolean> {
    this.syncStatus = CloudDriveSyncStatus.InProgress
    this.lastSyncTime = Date.now()

    try {
      // // To update the file, we just need to send the blob using PATCH with no metadata.
      const form = new FormData()
      form.append('file', blob)
      const response = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${this.fileId}?uploadType=media`, {
        method: 'PATCH',
        headers: new Headers({ 'Authorization': 'Bearer ' + g_accessToken }),
        body: blob,
      })

      if (response.ok) {
        console.log(`File sync success: ${this.fileName}`)
        this.syncStatus = CloudDriveSyncStatus.Active
        return true
      } else {
        console.error('Error syncing file:', response.statusText)
        this.syncStatus = CloudDriveSyncStatus.Failed
        return false
      }
    } catch (error) {
      console.error('Error syncing file:', error)
      this.syncStatus = CloudDriveSyncStatus.Failed
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
