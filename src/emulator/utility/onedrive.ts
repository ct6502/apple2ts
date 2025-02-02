const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"

const MAX_ONEODRIVE_UPLOAD_BYTES = 4 * 1024 * 1024 // 4 MB
export const DEFAULT_ONEDRIVE_SYNC_INTERVAL = 5 * 60 * 1000

export enum ONEDRIVE_SYNC_STATUS {
  INACTIVE,
  ACTIVE,
  PENDING,
  INPROGRESS,
  FAILED
}

type OneDriveData = {
  syncStatus: ONEDRIVE_SYNC_STATUS
  folderId: string
  fileName: string
  downloadUrl: string
  uploadUrl: string
  lastSyncTime: number
  syncInterval: number
}

var accessToken: string;
var apiEndpoint: string;
var oneDriveDataList: OneDriveData[] = [];

export const setOneDriveSyncStatus = (index: number, syncStatus: ONEDRIVE_SYNC_STATUS) => {
  console.log(`OneDrive sync status: ${ONEDRIVE_SYNC_STATUS[oneDriveDataList[index].syncStatus]} -> ${ONEDRIVE_SYNC_STATUS[syncStatus]}`)
  oneDriveDataList[index].syncStatus = syncStatus
}

export const resetOneDriveData = (index: number) => {
  oneDriveDataList[index] = {
    syncStatus: ONEDRIVE_SYNC_STATUS.INACTIVE,
    folderId: "",
    fileName: "",
    downloadUrl: "",
    uploadUrl: "",
    lastSyncTime: -1,
    syncInterval: DEFAULT_ONEDRIVE_SYNC_INTERVAL
  }
}

export const getOneDriveSyncInterval = (index: number) => {
  return oneDriveDataList[index].syncInterval
}

export const setOneDriveSyncInterval = (index: number, interval: number) => {
  oneDriveDataList[index].syncInterval = interval
}

export const getOneDriveData = (index: number): OneDriveData => {
  if (index > oneDriveDataList.length - 1) {
    resetOneDriveData(index)
  }
  return oneDriveDataList[index]
}

export const uploadOneDriveFile = async (index: number, blob: Blob) => {
  setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.INPROGRESS)

  if (oneDriveDataList[index].uploadUrl == "") {
    oneDriveDataList[index].uploadUrl = `${apiEndpoint}drive/items/${oneDriveDataList[index].folderId}:/${oneDriveDataList[index].fileName}:/content`
  } else if (blob.size > MAX_ONEODRIVE_UPLOAD_BYTES) {
    const uploadUrl = oneDriveDataList[index].uploadUrl.replace('/content', '')

    console.log(`fetch: DELETE ${uploadUrl}`)
    fetch(uploadUrl, {
      method: 'DELETE',
      mode: 'cors',
      headers: {
          'Authorization': `bearer ${accessToken}`
      }
    } as RequestInit)
      .then(async response => {
        console.log(`fetch response: ${response.status} (${response.statusText})`)
        if (response.ok) {
          setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.PENDING)
          oneDriveDataList[index].uploadUrl = ""
        } else {
          setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.FAILED)
          console.log(response.status)
        }
      })
      .catch(error => {
        console.error(error)
        setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.FAILED)
      })
      .finally(() => {
        oneDriveDataList[index].lastSyncTime = Date.now()
      })
    return
  }

  const uploadUrl = oneDriveDataList[index].uploadUrl
  console.log(`fetch: PUT ${uploadUrl}`)

  fetch(uploadUrl, {
    method: 'PUT',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `bearer ${accessToken}`
    },
    duplex: 'half',
    body: blob.stream()
  } as RequestInit)
    .then(async response => {
      console.log(`fetch response: ${response.status} (${response.statusText})`)
      if (response.ok) {
        const json = await response.json();
        oneDriveDataList[index].downloadUrl = json["@content.downloadUrl"]
        oneDriveDataList[index].uploadUrl = `${apiEndpoint}drive/items/${json["id"]}/content`
        setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.ACTIVE)
      } else {
        setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.FAILED)
        console.log(response.status)
      }
    })
    .catch(error => {
      console.error(error)
      setOneDriveSyncStatus(index, ONEDRIVE_SYNC_STATUS.FAILED)
    })
    .finally(() => {
      oneDriveDataList[index].lastSyncTime = Date.now()
    })
}

export const openOneDriveFile = async (index: number, filter: string): Promise<boolean> => {
  const result = await launchOneDrivePicker("files", filter)

  if (result) {
    accessToken = result.accessToken
    apiEndpoint = result.apiEndpoint

    for (const file of result.value) {
      oneDriveDataList[index] = {
        syncStatus: ONEDRIVE_SYNC_STATUS.ACTIVE,
        folderId: file.parentReference.id,
        fileName: file.name,
        downloadUrl: file["@content.downloadUrl"],
        uploadUrl: `${apiEndpoint}drive/items/${file.id}/content`,
        lastSyncTime: Date.now(),
        syncInterval: DEFAULT_ONEDRIVE_SYNC_INTERVAL
      }
      return true
    }
  }

  return false
}

export const saveOneDriveFile = async(index: number, fileName: string): Promise<boolean> => {
  const result = await launchOneDrivePicker("folders")

  if (result) {
    accessToken = result.accessToken
    apiEndpoint = result.apiEndpoint

    for (const file of result.value) {
      oneDriveDataList[index] = {
        syncStatus: ONEDRIVE_SYNC_STATUS.ACTIVE,
        folderId: file.id,
        fileName: fileName,
        downloadUrl: "",
        uploadUrl: "",
        lastSyncTime: Date.now(),
        syncInterval: DEFAULT_ONEDRIVE_SYNC_INTERVAL
      }
      return true
    }
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