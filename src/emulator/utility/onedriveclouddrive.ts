import { CloudDrive, CloudDriveSyncStatus } from "./clouddrive";

const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000

export class OneDriveCloudDrive implements CloudDrive {
  providerName = "OneDrive"
  syncStatus = CloudDriveSyncStatus.Inactive
  syncInterval = DEFAULT_SYNC_INTERVAL
  lastSyncTime = -1

  accessToken: string = ""
  apiEndpoint: string = ""
  folderId: string = ""
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

  async download(filter: string): Promise<Blob|undefined> {
    const result = await launchPicker("files", filter)
    if (result) {
      this.accessToken = result.accessToken
      this.apiEndpoint = result.apiEndpoint

      for (const file of result.value) {
        this.syncStatus = CloudDriveSyncStatus.Active
        this.syncInterval = DEFAULT_SYNC_INTERVAL
        this.lastSyncTime = Date.now()
        this.folderId = file.parentReference.id
        this.fileName = file.name
        this.downloadUrl = file["@content.downloadUrl"]
        this.uploadUrl = `${this.apiEndpoint}drive/items/${file.id}/content`

        this.syncStatus = CloudDriveSyncStatus.InProgress

        const response = await fetch(this.downloadUrl);
        if (response.ok) {
          this.syncStatus = CloudDriveSyncStatus.Active
          return await response.blob()
        } else {
          console.log(`HTTP ${response.status}: ${response.statusText}`)
        }
      }
    }

    return undefined
  }

  async upload(filename: string, blob: Blob): Promise<boolean> {
    const result = await launchPicker("folders")

    if (result) {
      this.accessToken = result.accessToken
      this.apiEndpoint = result.apiEndpoint

      for (const file of result.value) {
          this.syncStatus = CloudDriveSyncStatus.Active
          this.folderId = file.id
          this.fileName = filename
          this.downloadUrl = ""
          this.uploadUrl = ""
          this.lastSyncTime = Date.now()
          this.syncInterval = DEFAULT_SYNC_INTERVAL

          this.uploadFile(blob)
      }
      return true
    }

    return false
  }

  async sync(blob: Blob) {
    this.uploadFile(blob)
  }

  async uploadFile(blob: Blob): Promise<void> {
    this.syncStatus = CloudDriveSyncStatus.InProgress
  
    if (this.uploadUrl == "") {
      this.uploadUrl = `${this.apiEndpoint}drive/items/${this.folderId}:/${this.fileName}:/content`
    } else if (blob.size > MAX_UPLOAD_BYTES) {
      const uploadUrl = this.uploadUrl.replace('/content', '')
  
      console.log(`fetch: DELETE ${uploadUrl}`)
      fetch(uploadUrl, {
        method: 'DELETE',
        mode: 'cors',
        headers: {
            'Authorization': `bearer ${this.accessToken}`
        }
      } as RequestInit)
        .then(async response => {
          console.log(`fetch response: ${response.status} (${response.statusText})`)
          if (response.ok) {
            this.syncStatus = CloudDriveSyncStatus.Pending
            this.uploadUrl = ""
          } else {
            this.syncStatus = CloudDriveSyncStatus.Failed
            console.log(response.status)
          }
        })
        .catch(error => {
          console.error(error)
          this.syncStatus = CloudDriveSyncStatus.Failed
        })
        .finally(() => {
          this.lastSyncTime += 3 * 1000
        })
        return
    }
  
    const uploadUrl = this.uploadUrl
    console.log(`fetch: PUT ${uploadUrl}`)
  
    fetch(uploadUrl, {
      method: 'PUT',
      mode: 'cors',
      headers: {
          'Content-Type': 'application/octet-stream',
          'Authorization': `bearer ${this.accessToken}`
      },
      duplex: 'half',
      body: blob.stream()
    } as RequestInit)
      .then(async response => {
        console.log(`fetch response: ${response.status} (${response.statusText})`)
        if (response.ok) {
          const json = await response.json();
          this.downloadUrl = json["@content.downloadUrl"]
          this.uploadUrl = `${this.apiEndpoint}drive/items/${json["id"]}/content`
          this.syncStatus = CloudDriveSyncStatus.Active
        } else {
          this.syncStatus = CloudDriveSyncStatus.Failed
          console.log(response.status)
        }
      })
      .catch(error => {
        console.error(error)
        this.syncStatus = CloudDriveSyncStatus.Failed
      })
      .finally(() => {
        this.lastSyncTime = Date.now()
      })
  }
}

const launchPicker = async (view: string, filter?: string) => {
  return new Promise<OneDriveResult | null>((resolve, reject) => {
    var odOptions: OneDriveOpenOptions = {
        clientId: applicationId,
        action: "share",
        multiSelect: false,
        openInNewWindow: true,
        viewType: view,
        advanced: {
            filter: filter ?? "",
            endpointHint: "api.onedrive.com",
            isConsumerAccount: true
        },
        success: function (files) { resolve(files) },
        cancel: function () { resolve(null) },
        error: function (e) { reject(e) }
    }

    OneDrive.open(odOptions)
  })
}

interface OneDriveResult {
  value: DriveItem[]
  webUrl: string | null
  accessToken: string
  apiEndpoint: string
}

interface OneDriveParent {
  id: string
}

interface DriveItem {
  "@content.downloadUrl": string
  id: string
  name: string
  size: number
  thumbnails: Thumbnails[]
  webUrl: string
  parentReference: OneDriveParent
}

interface Thumbnails {
  id: string
  large: Thumbnail
  medium: Thumbnail
  small: Thumbnail
}

interface Thumbnail {
  height: number
  width: number
  url: string
}

interface OneDriveOpenOptions {
  clientId: string
  action: "download" | "share" | "query"
  multiSelect: boolean
  fileName?: string
  openInNewWindow: boolean
  viewType: string // "files" | "folders" | "all"
  advanced: {
      filter?: string
      endpointHint?: string
      isConsumerAccount?: boolean
      redirectUri?: string
  }
  success(result: OneDriveResult): void
  cancel(): void
  error(e: any): void
}

interface OneDrive {
  open(options: OneDriveOpenOptions): any
  save(options: OneDriveOpenOptions): any
}

declare var OneDrive: OneDrive