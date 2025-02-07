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
  private resolvePicker: ((result: GoogleDriveResult | null) => void) | null = null;

  syncStatus = CloudDriveSyncStatus.Inactive
  syncInterval = DEFAULT_SYNC_INTERVAL
  lastSyncTime = -1

  apiEndpoint: string = ""
  fileId: string = ""
  parentID: string = ""
  downloadUrl: string = ""
  uploadUrl: string = ""
  fileName: string = ""

  getFileName(): string {
    return this.fileName
  }

  setFileName(fileName: string): void {
    this.fileName = fileName
    this.uploadUrl = ""
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
          .setMimeTypes('application/vnd.google-apps.folder');
      }
      const picker = new google.picker.PickerBuilder()
        .addView(googleView)
        // .enableFeature(google.picker.Feature.NAV_HIDDEN)  // hide the nav bar at the top
        // .enableFeature(google.picker.Feature.MINE_ONLY)   // only show user's drive files
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
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
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
      this.tokenClient.requestAccessToken({prompt: ''})
    } else {
      // Skip display of account chooser and consent dialog for an existing session.
      showPicker(view, filter)
    }
  }

  // A simple callback implementation.
  pickerCallback = (data: any) => {
    console.log(`data = ${JSON.stringify(data, null, 2)}`)
    if (data["action"] === "picked") {
      const doc = data["docs"][0]
      if (this.resolvePicker) {
        this.resolvePicker({
          fileId: doc[google.picker.Document.ID],
          parentID: doc[google.picker.Document.PARENT_ID],
          fileName: doc[google.picker.Document.NAME],
        })
        this.resolvePicker = null;
      }
    } else if (data["action"] === "cancel") {
      if (this.resolvePicker) {
        this.resolvePicker(null);
        this.resolvePicker = null;
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
    const result = await this.launchPicker("file", filter)
    if (result) {
      this.syncStatus = CloudDriveSyncStatus.Active
      this.syncInterval = DEFAULT_SYNC_INTERVAL
      this.lastSyncTime = Date.now()
      this.fileId = result.fileId
      this.parentID = result.parentID
      this.fileName = result.fileName
      //   this.downloadUrl = file["@content.downloadUrl"]
      //   this.uploadUrl = `${this.apiEndpoint}drive/items/${file.id}/content`

      this.syncStatus = CloudDriveSyncStatus.InProgress

      const url = `https://www.googleapis.com/drive/v3/files/${this.fileId}?alt=media`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${g_accessToken}`
        }
      })
      if (response.ok) {
        this.syncStatus = CloudDriveSyncStatus.Active
        return await response.blob()
      } else {
        this.syncStatus = CloudDriveSyncStatus.Failed
        console.log(`HTTP ${response.status}: ${response.statusText}`)
      }
    }
    return undefined
  }

  async upload(filename: string, blob: Blob): Promise<boolean> {
    const result = await this.launchPicker("folder")

    if (result) {
      console.log(`result = ${JSON.stringify(result, null, 2)}`)
      this.syncStatus = CloudDriveSyncStatus.Active
      this.syncInterval = DEFAULT_SYNC_INTERVAL
      this.lastSyncTime = Date.now()
      this.parentID = result.fileId
      this.fileName = result.fileName

      try {
        const metadata = {
          name: filename,
          parents: [this.parentID],
        }
        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: new Headers({ 'Authorization': 'Bearer ' + g_accessToken }),
          body: form,
        });

        if (response.ok) {
          console.log('File uploaded successfully');
          return true;
        } else {
          console.error('Error uploading file:', response.statusText);
          return false;
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        return false;
      }
    }
    return false
  }

  async sync(blob: Blob): Promise<boolean> {
    // TBD
    return true
  }

}


interface GoogleDriveResult {
  fileId: string,
  parentID: string,
  fileName: string
}

// interface OneDriveParent {
//   id: string
// }

// interface DriveItem {
//   "@content.downloadUrl": string
//   id: string
//   name: string
//   size: number
//   thumbnails: Thumbnails[]
//   webUrl: string
//   parentReference: OneDriveParent
// }

// interface Thumbnails {
//   id: string
//   large: Thumbnail
//   medium: Thumbnail
//   small: Thumbnail
// }

// interface Thumbnail {
//   height: number
//   width: number
//   url: string
// }

// interface OneDrive {
//   open(options: OneDriveOpenOptions): any
//   save(options: OneDriveOpenOptions): any
// }

// declare var OneDrive: OneDrive