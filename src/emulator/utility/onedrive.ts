const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

export enum ONEDRIVE_SYNC_STATUS {
  INACTIVE,
  ACTIVE,
  PENDING,
  INPROGRESS,
  FAILED
}

type OneDriveProps = {
  syncStatus: ONEDRIVE_SYNC_STATUS
  fileName: string
  downloadUrl: string
  uploadUrl: string
  lastSyncTime: number
}

var accessToken: string;
var activeDrives: OneDriveProps[] = [];

export const getOneDriveSyncStatus = (dprops: DriveProps) => {
  var oneDriveProps = getOneDriveProps(dprops.index)

  if (oneDriveProps.syncStatus == ONEDRIVE_SYNC_STATUS.ACTIVE && dprops.lastWriteTime > oneDriveProps.lastSyncTime) {
    oneDriveProps.syncStatus = ONEDRIVE_SYNC_STATUS.PENDING
    // $TEMP
    // saveOneDriveFile(dprops.index, getBlobFromDiskData(dprops.diskData, oneDriveProps.fileName))
  }

  return oneDriveProps.syncStatus
}

export const resetOneDriveProps = (index: number) => {
  activeDrives[index] = {
    syncStatus: ONEDRIVE_SYNC_STATUS.INACTIVE,
    fileName: "",
    downloadUrl: "",
    uploadUrl: "",
    lastSyncTime: -1
  }
}

export const getOneDriveProps = (index: number): OneDriveProps => {
  if (index > activeDrives.length - 1) {
    resetOneDriveProps(index)
  }

  return activeDrives[index]
}

export const updateOneDriveFile = async (index: number, blob: Blob) => {
  fetch(activeDrives[index].uploadUrl, {
    method: 'PUT',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `bearer ${accessToken}`
    },
    duplex: 'half',
    body: blob.stream()
  } as RequestInit)
  .then(response => {
    response.json()
  })
  .then(data => {
    console.log(data)
  })
  .catch(error => {
    console.error('Error:', error)
  });
}

export const openOneDriveFile = async (index: number, filter: string): Promise<boolean> => {
  const result = await launchOneDrivePicker("files", filter)
  if (result) {
    accessToken = result.accessToken

    for (const file of result.value) {
      activeDrives[index] = {
        syncStatus: ONEDRIVE_SYNC_STATUS.ACTIVE,
        fileName: file.name,
        downloadUrl: file["@content.downloadUrl"],
        uploadUrl: `${result.apiEndpoint}drive/items/${file.id}/content`,
        lastSyncTime: Date.now()
      }
      return true
    }
  }
  
  // handle failure

  return false
}

export const saveOneDriveFile = async(index: number, fileName: string): Promise<boolean> => {
  const result = await launchOneDrivePicker("folders")
  if (result) {
    accessToken = result.accessToken

    // result.id
  }
  
  // handle failure

  return false
}

function launchOneDrivePicker(view: string, filter?: string) {
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

interface DriveItem {
  "@content.downloadUrl": string
  id: string
  name: string
  size: number
  thumbnails: Thumbnails[]
  webUrl: string
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