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
  lastSyncTime: number
}

// var accessToken: string;
var activeDrives: OneDriveProps[] = [];

export const resetOneDriveProps = (index: number) => {
  activeDrives[index] = {
    syncStatus: ONEDRIVE_SYNC_STATUS.INACTIVE,
    fileName: "",
    downloadUrl: "",
    lastSyncTime: -1
  }
}

export const getOneDriveProps = (index: number): OneDriveProps => {
  if (index > activeDrives.length - 1) {
    resetOneDriveProps(index)
  }

  return activeDrives[index]
}

export const pickOneDriveFile = async (index: number, filter: string): Promise<boolean> => {
  const result = await launchOneDrivePicker(filter)
  if (result) {
    // accessToken = result.accessToken

    for (const file of result.value) {
      activeDrives[index] = {
        syncStatus: ONEDRIVE_SYNC_STATUS.ACTIVE,
        fileName: file.name,
        downloadUrl: file["@content.downloadUrl"],
        lastSyncTime: Date.now()
      }
      return true
    }
  }

  return false
}

function launchOneDrivePicker(filter: string) {
  return new Promise<OneDriveResult | null>((resolve, reject) => {
      var odOptions: OneDriveOpenOptions = {
          clientId: applicationId,
          action: "share",
          multiSelect: false,
          openInNewWindow: true,
          advanced: {
              filter: filter,
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
  "thumbnails@odata.context": string
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
  openInNewWindow: boolean
  advanced: {
      filter: string
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
}

declare var OneDrive: OneDrive