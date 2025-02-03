import { getBlobFromDiskData } from "../../devices/diskdrive";
import { doSetUIDriveProps } from "../../devices/driveprops";
import { doSetEmuDriveProps } from "../devices/drivestate";
import { CloudDrive, CloudDriveSyncStatus } from "./clouddrive";
import { faCloud, faCloudArrowDown, faCloudArrowUp, IconDefinition } from "@fortawesome/free-solid-svg-icons";

const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_SYNC_INTERVAL = 5 * 60 * 1000

export class OneDriveCloudDrive implements CloudDrive {
  syncStatus = CloudDriveSyncStatus.Inactive
  syncInterval = DEFAULT_SYNC_INTERVAL
  lastSyncTime = -1
  fileName: string = ""
  downloadUrl: string = ""
  uploadUrl: string = ""

  accessToken: string = ""
  apiEndpoint: string = ""
  folderId: string = ""

  getSyncStatus(dprops: DriveProps): CloudDriveSyncStatus {
    switch (this.syncStatus) {
      case CloudDriveSyncStatus.Active:
        if (dprops.lastWriteTime > this.lastSyncTime) {
          this.setSyncStatus(CloudDriveSyncStatus.Pending)
        }
        break

      case CloudDriveSyncStatus.Pending:
        if ((Date.now() - this.lastSyncTime > this.syncInterval)) {
          this.syncDrive(dprops)
        }
        break
    }

    return this.syncStatus
  }

  setSyncStatus(status: CloudDriveSyncStatus): void {
    this.syncStatus = status
  }

  isSyncPaused(): boolean {
    return this.syncInterval == Number.MAX_VALUE
  }

  getSyncInterval(): number {
    return this.syncInterval
  }

  setSyncInterval(interval: number): void {
    this.syncInterval = interval
  }

  getStatusMessage(dprops: DriveProps): string {
    switch (this.getSyncStatus(dprops)) {
      case CloudDriveSyncStatus.Inactive:
        return dprops.diskData.length > 0 ? "Save Disk to OneDrive" : "Load Disk from OneDrive"
  
      case CloudDriveSyncStatus.Active:
        return "OneDrive Sync Up-to-date"
        
      case CloudDriveSyncStatus.Pending:
        return this.isSyncPaused() ? "OneDrive Sync Paused" : "OneDrive Sync Pending"
        
      case CloudDriveSyncStatus.InProgress:
        return "OneDrive Sync In Progress"
        
      case CloudDriveSyncStatus.Failed:
        return "OneDrive Sync Failed"
    }
  }

  getStatusClassName(dprops: DriveProps): string {
    const syncStatus = this.getSyncStatus(dprops)

    if (this.isSyncPaused() && syncStatus != CloudDriveSyncStatus.Inactive && syncStatus != CloudDriveSyncStatus.InProgress) {
      return "disk-onedrive-paused"
    } else {
      return `disk-onedrive-${CloudDriveSyncStatus[syncStatus].toLowerCase()}`
    }
  }

  getSyncIcon(dprops: DriveProps): IconDefinition {
    switch (this.getSyncStatus(dprops)) {
      case CloudDriveSyncStatus.Inactive:
        return dprops.diskData.length > 0 ? faCloudArrowUp : faCloudArrowDown
  
      case CloudDriveSyncStatus.Pending:
      case CloudDriveSyncStatus.InProgress:
        return faCloudArrowUp
  
      default:
        return faCloud
    }
  }

  async downloadFile(filter: string): Promise<boolean> {
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

        return true
      }
    }

    return false
  }

  syncDrive(dprops: DriveProps): void {
    this.setSyncStatus(CloudDriveSyncStatus.InProgress)
    this.uploadFile(getBlobFromDiskData(dprops.diskData, this.fileName))
      .then(() => {
        dprops.diskHasChanges = false
        doSetEmuDriveProps(dprops)
        doSetUIDriveProps(dprops)
      })
  }

  async uploadFile(blob: Blob): Promise<void> {
    this.setSyncStatus(CloudDriveSyncStatus.InProgress)
  
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
            this.setSyncStatus(CloudDriveSyncStatus.Pending)
            this.uploadUrl = ""
          } else {
            this.setSyncStatus(CloudDriveSyncStatus.Failed)
            console.log(response.status)
          }
        })
        .catch(error => {
          console.error(error)
          this.setSyncStatus(CloudDriveSyncStatus.Failed)
        })
        .finally(() => {
          this.lastSyncTime = Date.now()
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
          this.setSyncStatus(CloudDriveSyncStatus.Active)
        } else {
          this.setSyncStatus(CloudDriveSyncStatus.Failed)
          console.log(response.status)
        }
      })
      .catch(error => {
        console.error(error)
        this.setSyncStatus(CloudDriveSyncStatus.Failed)
      })
      .finally(() => {
        this.lastSyncTime = Date.now()
      })
  }

  async saveFile(filename: string): Promise<boolean> {
    const result = await launchPicker("folders")

    if (result) {
      this.accessToken = result.accessToken
      this.apiEndpoint = result.apiEndpoint

      for (const file of result.value) {
          this.setSyncStatus(CloudDriveSyncStatus.Active)
          this.folderId = file.id
          this.fileName = filename
          this.downloadUrl = ""
          this.uploadUrl = ""
          this.lastSyncTime = Date.now()
          this.syncInterval = DEFAULT_SYNC_INTERVAL
      }
      return true
    }
    
    // handle failure

    return false
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