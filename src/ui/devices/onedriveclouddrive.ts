import { CLOUD_SYNC } from "../../common/utility"

export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"
// const applicationId = "5e3e8e67-67b3-4fd1-8f31-4b4ca52966cd"

export class OneDriveCloudDrive implements CloudProvider {

  async download(filter: string): Promise<[Blob, CloudData]|null> {
    const result = await launchPicker('share', 'files', filter)
    const file = result?.value[0]
    if (file) {
      const cloudData: CloudData = {
        providerName: "OneDrive",
        syncStatus: CLOUD_SYNC.INPROGRESS,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: Date.now(),
        fileName: file.name,
        accessToken: result.accessToken,
        itemId: file.parentReference.id,
        apiEndpoint: result.apiEndpoint,
        parentID: "",
      }

      const downloadUrl = file["@content.downloadUrl"]
      console.log(`HTTP GET: ${downloadUrl}`)
      const response = await fetch(downloadUrl);
      if (response.ok) {
        cloudData.syncStatus = CLOUD_SYNC.ACTIVE
        const blob = await response.blob()
        return [blob, cloudData]
      } else {
        console.log(`HTTP ${response.status}: ${response.statusText}`)
      }
    }

    return null
  }

  async upload(filename: string, blob: Blob): Promise<CloudData | null> {
    const result = await launchPicker('save', 'folders')
    const file = result?.value && result.value[0]
    if (file) {
      const cloudData: CloudData = {
        providerName: "OneDrive",
        syncStatus: CLOUD_SYNC.PENDING,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: -1,
        fileName: filename,
        accessToken: result.accessToken,
        itemId: file.id,
        apiEndpoint: result.apiEndpoint,
        parentID: "",
      }
      return cloudData
    } else {
      console.error(`result message: ${result?.message} errorCode: ${result?.errorCode}`)
    }
    return null
  }

  async sync(blob: Blob, cloudData: CloudData): Promise<boolean> {
    cloudData.syncStatus = CLOUD_SYNC.INPROGRESS

    const sessionUrl = `${cloudData.apiEndpoint}drive/items/${cloudData.itemId}:/${cloudData.fileName}:/createUploadSession`
    let success = false

    console.log(`fetch: POST ${sessionUrl}`)
    await fetch(sessionUrl, {
      method: 'POST',
      mode: 'cors',
      headers: {
          'Authorization': `bearer ${cloudData.accessToken}`,
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
          success = await this.uploadBlob(json["uploadUrl"], blob, cloudData)
        } else {
          cloudData.syncStatus = CLOUD_SYNC.FAILED
          console.log(`response.status: ${JSON.stringify(json)}`)
        }
    })
    .catch(error => {
      console.error(error)
      cloudData.syncStatus = CLOUD_SYNC.FAILED
    })
    .finally(() => {
      cloudData.lastSyncTime = Date.now()
    })

    return success
  }

  async uploadBlob(uploadUrl: string, blob: Blob, cloudData: CloudData): Promise<boolean> {
    const buffer = await new Response(blob).arrayBuffer();
    let offset = 0
    let chunkSize = Math.min(buffer.byteLength - offset, MAX_UPLOAD_BYTES)
    let success = false

    cloudData.syncStatus = CLOUD_SYNC.INPROGRESS

    while (cloudData.syncStatus == CLOUD_SYNC.INPROGRESS) {
      console.log(`fetch: PUT ${uploadUrl}`)
      await fetch(uploadUrl, {
        method: 'PUT',
        mode: 'cors',
        headers: {
          'Authorization': `bearer ${cloudData.accessToken}`,
          'Content-Length': `${chunkSize}`,
          'Content-Range': `bytes ${offset}-${offset+chunkSize-1}/${buffer.byteLength}`
        },
        duplex: 'half',
        body: buffer.slice(offset, offset + chunkSize)
      } as RequestInit)
        .then(async response => {
          console.log(`fetch response: ${response.status} (${response.statusText})`)

          if (response.ok) {
            offset += chunkSize
            chunkSize = Math.min(buffer.byteLength - offset, MAX_UPLOAD_BYTES)

            if (chunkSize <= 0) {
              cloudData.syncStatus = CLOUD_SYNC.ACTIVE
              success = true
            }
          } else {
            cloudData.syncStatus = CLOUD_SYNC.FAILED
            console.error(`response.status: ${await response.text()}`)
          }
        })
        .catch(error => {
          console.error(error)
          cloudData.syncStatus = CLOUD_SYNC.FAILED
        })
        .finally(() => {
          cloudData.lastSyncTime = Date.now()
        })
    }

    return success
  }
}

const launchPicker = async (action: string, view: string, filter?: string) => {
  return new Promise<OneDriveResult | null>((resolve, reject) => {
    const odOptions: OneDriveOpenOptions = {
        clientId: applicationId,
        action: action,
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
        error: function (e) {
          console.log(JSON.stringify(e))
          reject(e)
        }
    }

    OneDrive.open(odOptions)
  })
}

interface OneDriveResult {
  value: DriveItem[]
  webUrl: string | null
  accessToken: string
  apiEndpoint: string
  errorCode?: string
  message?: number
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
  action: string // 'download' | 'share' | 'query' | 'save'
  multiSelect: boolean
  fileName?: string
  openInNewWindow: boolean
  viewType: string // 'files' | 'folders'
  advanced: {
      filter?: string
      endpointHint?: string
      isConsumerAccount?: boolean
      redirectUri?: string
  }
  success(result: OneDriveResult): void
  cancel(): void
  error(e: string): void
}

interface OneDrive {
  open(options: OneDriveOpenOptions): void
  save(options: OneDriveOpenOptions): void
}

declare let OneDrive: OneDrive