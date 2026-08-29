import { CLOUD_SYNC } from "../../../common/utility"
import { showGlobalProgressModal } from "../../ui_utilities"
import { loadOneDriveScript } from "./cloudscriptloader"
import { BrowserCacheLocation, PublicClientApplication } from "@azure/msal-browser"
import { Client, ResponseType } from "@microsoft/microsoft-graph-client"
import type { CloudBrowserItem } from "./clouddrive_retro"

export const DEFAULT_SYNC_INTERVAL = 1 * 60 * 1000

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024
const isAnomixerDomain = () => {
  if (typeof window === "undefined") return true
  const host = window.location.hostname.toLowerCase()
  return host.includes("pages.dev") || host.includes("github.io") || host.includes("anomixer") || host === "localhost" || host === "127.0.0.1"
}
// anomixer: use own Azure App ID; upstream: 74fef3d4-4cf3-4de9-b2d7-ef63f9add409
const applicationId = isAnomixerDomain()
  ? "cbd9893a-d674-4a22-b85e-bc258b75aedf"
  : "74fef3d4-4cf3-4de9-b2d7-ef63f9add409"
const graphScopes = ["Files.ReadWrite"]

let g_accessToken: string
let msalClient: PublicClientApplication | undefined

const getRedirectUri = () => {
  const baseUrl = new URL(window.location.href)
  const port = baseUrl.port ? `:${baseUrl.port}` : ""
  return `${baseUrl.protocol}//${baseUrl.hostname}${port}?cloudProvider=OneDrive`
}

const getMsalClient = async () => {
  if (!msalClient) {
    msalClient = new PublicClientApplication({
      auth: {
        clientId: applicationId,
        authority: "https://login.microsoftonline.com/consumers",
        redirectUri: getRedirectUri(),
      },
      cache: { cacheLocation: BrowserCacheLocation.MemoryStorage },
    })
    await msalClient.initialize()
  }
  return msalClient
}

const requestGraphAccessToken = async () => {
  const client = await getMsalClient()
  const account = client.getAllAccounts()[0]
  const result = account
    ? await client.acquireTokenSilent({ account, scopes: graphScopes }).catch(() =>
      client.acquireTokenPopup({ account, scopes: graphScopes }))
    : await client.loginPopup({ scopes: graphScopes })
  g_accessToken = result.accessToken
  return g_accessToken
}

const getGraphClient = () => Client.init({
  authProvider: done => done(null, g_accessToken),
})

type OneDriveGraphItem = {
  id?: string
  name?: string
  size?: number
  folder?: object
  webUrl?: string
  parentReference?: { id?: string }
  "@microsoft.graph.downloadUrl"?: string
}

type OneDriveGraphPage = {
  value?: OneDriveGraphItem[]
  "@odata.nextLink"?: string
}

export class OneDriveCloudDrive implements CloudProvider {

  constructor(private readonly selectedItem?: CloudBrowserItem) {}

  async ensureScriptsLoaded() {
    await loadOneDriveScript()
  }

  requestAuthToken(callback: (authToken: string) => void) {
    if (g_accessToken) callback(`bearer ${g_accessToken}`)
    else void requestGraphAccessToken()
      .then(accessToken => callback(`bearer ${accessToken}`))
      .catch(error => console.error("OneDrive sign-in failed", error))
  }

  async signIn(): Promise<boolean> {
    try {
      await requestGraphAccessToken()
      return true
    } catch (error) {
      console.error("OneDrive sign-in failed", error)
      return false
    }
  }

  async listFolder(folderId: string): Promise<CloudBrowserItem[]> {
    await requestGraphAccessToken()
    const items: OneDriveGraphItem[] = []
    let endpoint: string | undefined = folderId === "root"
      ? "/me/drive/root/children"
      : `/me/drive/items/${encodeURIComponent(folderId)}/children`
    while (endpoint) {
      const page = await getGraphClient().api(endpoint).get() as OneDriveGraphPage
      items.push(...(page.value ?? []))
      endpoint = page["@odata.nextLink"]
    }
    return items.flatMap(item => item.id && item.name ? [{
      id: item.id,
      name: item.name,
      kind: item.folder ? "folder" as const : "file" as const,
      size: item.size,
      parentId: item.parentReference?.id,
      downloadUrl: item["@microsoft.graph.downloadUrl"],
      webUrl: item.webUrl,
    }] : [])
  }

  // Whether a OneDrive access token is already cached in memory. Used to decide,
  // without triggering an auth popup, whether a sign-in is still needed.
  hasAuthToken(): boolean {
    return !!g_accessToken
  }

  async download(filter: string): Promise<[Blob, CloudData]|null> {
    if (this.selectedItem) return this.downloadSelectedItem(this.selectedItem)
    await this.ensureScriptsLoaded()
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
        detailsUrl: file.webUrl,
        fileSize: file.size
      }
      g_accessToken = result.accessToken

      showGlobalProgressModal(true, "Downloading disk")

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

  private async downloadSelectedItem(item: CloudBrowserItem): Promise<[Blob, CloudData] | null> {
    await requestGraphAccessToken()
    const blob = item.downloadUrl
      ? await fetch(item.downloadUrl).then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        return response.blob()
      })
      : await getGraphClient().api(`/me/drive/items/${encodeURIComponent(item.id)}/content`)
        .responseType(ResponseType.BLOB)
        .get() as Blob
    return [blob, {
      providerName: "OneDrive",
      syncStatus: CLOUD_SYNC.ACTIVE,
      syncInterval: DEFAULT_SYNC_INTERVAL,
      lastSyncTime: Date.now(),
      fileName: item.name,
      parentId: item.parentId,
      itemId: item.id,
      apiEndpoint: "https://graph.microsoft.com/v1.0/",
      downloadUrl: `https://graph.microsoft.com/v1.0/me/drive/items/${item.id}/content`,
      detailsUrl: item.webUrl ?? "",
      fileSize: item.size ?? blob.size,
    }]
  }

  async upload(filename: string): Promise<CloudData | null> {
    await this.ensureScriptsLoaded()
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
        detailsUrl: "",
        fileSize: -1
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

    if (!await this.signIn()) {
      cloudData.syncStatus = CLOUD_SYNC.FAILED
      cloudData.lastSyncTime = Date.now()
      return false
    }

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
