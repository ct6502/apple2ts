import { CLOUD_SYNC } from "../../../common/utility"
import { showGlobalProgressModal } from "../../ui_utilities"

export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const applicationId = "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"
const readWriteScope = "onedrive.readwrite"
const authUrl = new URL(`https://login.live.com/oauth20_authorize.srf?client_id=${applicationId}&scope=${readWriteScope}&response_type=token&redirect_uri=`)

let g_accessToken: string

export class OneDriveCloudDrive implements CloudProvider {

  requestAuthToken(callback: (authToken: string) => void) {
    const baseUrl = new URL(window.location.href)
    const port = baseUrl.port != "" ? `:${baseUrl.port}` : ""
    const redirectUri = `${baseUrl.protocol}//${baseUrl.hostname}${port}?cloudProvider=OneDrive`

    window.open(`${authUrl}${redirectUri}`, "_blank")
    const interval = window.setInterval(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const accessToken = (window as any).accessToken
      if (accessToken) {
        clearInterval(interval)
        g_accessToken = accessToken
        callback(`bearer ${accessToken}`)
      }
    }, 500)
  }

  async download(filter: string): Promise<[Blob, CloudData]|null> {
    const result = await launchPicker("share", "files", filter)
    const file = result?.value[0]
    if (file) {
      const cloudData: CloudData = {
        providerName: "OneDrive",
        syncStatus: CLOUD_SYNC.INPROGRESS,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: Date.now(),
        fileName: file.name,
        parentId: file.parentReference.id,
        itemId: file.id,
        apiEndpoint: result.apiEndpoint,
        downloadUrl: `${result.apiEndpoint}drive/items/${file.id}/content`,
        detailsUrl: file.webUrl
      }
      g_accessToken = result.accessToken

      showGlobalProgressModal(true)

      const response = await fetch(file["@content.downloadUrl"])
      .finally(() => {
        showGlobalProgressModal(false)
      })
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

  async upload(filename: string): Promise<CloudData | null> {
    const result = await launchPicker("save", "folders")
    const file = result?.value && result.value[0]
    if (file) {
      const cloudData: CloudData = {
        providerName: "OneDrive",
        syncStatus: CLOUD_SYNC.PENDING,
        syncInterval: DEFAULT_SYNC_INTERVAL,
        lastSyncTime: -1,  // force an immediate sync (which will actually upload the data)
        fileName: filename,
        parentId: file.id,
        itemId: "", // Item ID is unknown until file is sucessfully uploaded
        apiEndpoint: result.apiEndpoint,
        downloadUrl: "",
        detailsUrl: ""
      }
      g_accessToken = result.accessToken
      return cloudData
    } else {
      console.error(`result message: ${result?.message} errorCode: ${result?.errorCode}`)
    }
    return null
  }

  async sync(blob: Blob, cloudData: CloudData): Promise<boolean> {
    cloudData.syncStatus = CLOUD_SYNC.INPROGRESS

    const sessionUrl = `${cloudData.apiEndpoint}drive/items/${cloudData.parentId}:/${cloudData.fileName}:/createUploadSession`
    let success = false

    await fetch(sessionUrl, {
      method: "POST",
      mode: "cors",
      headers: {
          "Authorization": `bearer ${g_accessToken}`,
          "Content-Type": "application/json"
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
        const json = await response.json()
        if (response.ok) {
          success = await this.uploadBlob(json["uploadUrl"], blob, cloudData)
        } else {
          cloudData.syncStatus = CLOUD_SYNC.FAILED
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
    const buffer = await new Response(blob).arrayBuffer()
    let offset = 0
    let chunkSize = Math.min(buffer.byteLength - offset, MAX_UPLOAD_BYTES)
    let success = false

    cloudData.syncStatus = CLOUD_SYNC.INPROGRESS

    while (cloudData.syncStatus == CLOUD_SYNC.INPROGRESS) {
      console.log(`fetch: PUT ${uploadUrl}`)
      await fetch(uploadUrl, {
        method: "PUT",
        mode: "cors",
        headers: {
          "Authorization": `bearer ${g_accessToken}`,
          "Content-Length": `${chunkSize}`,
          "Content-Range": `bytes ${offset}-${offset+chunkSize-1}/${buffer.byteLength}`
        },
        duplex: "half",
        body: buffer.slice(offset, offset + chunkSize)
      } as RequestInit)
        .then(async response => {
          console.log(`fetch response: ${response.status} (${response.statusText})`)

          if (response.ok) {
            offset += chunkSize
            chunkSize = Math.min(buffer.byteLength - offset, MAX_UPLOAD_BYTES)

            if (chunkSize <= 0) {
              if (cloudData.itemId == "") {                    
                const json = await response.json()
                if (json) {
                  cloudData.itemId = json.id
                  cloudData.parentId = json.parentReference.id
                  cloudData.downloadUrl = `${cloudData.apiEndpoint}drive/items/${json.id}/content`
                  cloudData.detailsUrl = json.webUrl
                }
              }

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