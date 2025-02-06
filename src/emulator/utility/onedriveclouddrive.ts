import { CloudDrive, CloudDriveSyncStatus } from "./clouddrive";

export const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

export class OneDriveCloudDrive implements CloudDrive {
  providerName = "OneDrive"
  syncStatus = CloudDriveSyncStatus.Inactive
  syncInterval = DEFAULT_SYNC_INTERVAL
  lastSyncTime = -1

  accessToken: string = ""
  fileId: string = ""
  folderId: string = ""
  apiEndpoint: string = ""
  fileName: string = ""
  isFileRenamed: boolean = false

  getFileName(): string {
    return this.fileName
  }

  setFileName(fileName: string): void {
    if (this.fileName != fileName) {
      this.isFileRenamed = true
    }
    this.fileName = fileName
  }

  async download(filter: string): Promise<Uint8Array|undefined> {
    const result = await launchPicker("files", filter)
    if (result) {
      this.accessToken = result.accessToken
      this.apiEndpoint = result.apiEndpoint

      for (const file of result.value) {
        this.syncStatus = CloudDriveSyncStatus.Active
        this.syncInterval = DEFAULT_SYNC_INTERVAL
        this.lastSyncTime = Date.now()
        this.fileId = file.id
        this.folderId = file.parentReference.id
        this.fileName = file.name
        this.syncStatus = CloudDriveSyncStatus.InProgress

        const downloadUrl = file["@content.downloadUrl"]
        console.log(`HTTP GET: ${downloadUrl}`)
        const response = await fetch(downloadUrl);
        if (response.ok) {
          this.syncStatus = CloudDriveSyncStatus.Active
          return await response.bytes()
        } else {
          console.log(`HTTP ${response.status}: ${response.statusText}`)
        }
      }
    }

    return undefined
  }

  async upload(filename: string, buffer: Uint8Array): Promise<boolean> {
    const result = await launchPicker("folders")

    if (result) {
      this.accessToken = result.accessToken
      this.apiEndpoint = result.apiEndpoint

      for (const file of result.value) {
          this.syncStatus = CloudDriveSyncStatus.Active
          this.folderId = file.id
          this.fileName = filename
          this.lastSyncTime = Date.now()
          this.syncInterval = DEFAULT_SYNC_INTERVAL

          this.uploadBuffer(`${this.apiEndpoint}drive/items/${this.folderId}:/${this.fileName}:/content`, buffer)
      }
      return true
    }

    return false
  }

  async sync(buffer: Uint8Array) {
    this.syncStatus = CloudDriveSyncStatus.InProgress

    if (this.isFileRenamed || !this.fileId) {
      this.uploadBuffer(`${this.apiEndpoint}drive/items/${this.folderId}:/${this.fileName}:/content`, buffer)
    } else {
      const sessionUrl = `${this.apiEndpoint}drive/items/${this.fileId}/createUploadSession`

      console.log(`fetch: POST ${sessionUrl}`)
      fetch(sessionUrl, {
        method: 'POST',
        mode: 'cors',
        headers: {
            'Authorization': `bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
          {
            "item":
              {
                "@microsoft.graph.conflictBehavior": "replace"
              }
          })
      } as RequestInit)
        .then(async response => {
          const json = await response.json();
          if (response.ok) {
            this.uploadBuffer(json["uploadUrl"], buffer)
          } else {
            this.syncStatus = CloudDriveSyncStatus.Failed
            console.log(`response.status: ${JSON.stringify(json)}`)
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

  async uploadBuffer(uploadUrl: string, buffer: Uint8Array): Promise<void> {
    var offset = 0
    var chunkSize = Math.min(buffer.length - offset, MAX_UPLOAD_BYTES)

    this.syncStatus = CloudDriveSyncStatus.InProgress

    while (this.syncStatus == CloudDriveSyncStatus.InProgress) {
      console.log(`fetch: PUT ${uploadUrl}`)
      await fetch(uploadUrl, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Authorization': `bearer ${this.accessToken}`,
          'Content-Length': `${buffer.length}`,
          'Content-Range': `bytes ${offset}-${offset+chunkSize-1}/${buffer.length}`
        },
        duplex: 'half',
        body: buffer.slice(offset, offset + chunkSize)
      } as RequestInit)
        .then(async response => {
          console.log(`fetch response: ${response.status} (${response.statusText})`)

          if (response.ok) {
            offset += chunkSize
            chunkSize = Math.min(buffer.length - offset, MAX_UPLOAD_BYTES)

            if (chunkSize <= 0) {
              const json = await response.json();
              this.syncStatus = CloudDriveSyncStatus.Active
              this.fileId = json["id"]
              this.isFileRenamed = false
            }
          } else {
            this.syncStatus = CloudDriveSyncStatus.Failed
            console.log(`response.status: ${await response.text()}`)
          }
        })
        .catch(error => {
          console.error(error)
          this.syncStatus = CloudDriveSyncStatus.Failed
        })
        .finally(() => {
        })
    }
    this.lastSyncTime = Date.now()
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
  viewType: string
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