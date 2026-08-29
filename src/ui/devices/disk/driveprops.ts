import { getBlobFromDiskData } from "./diskdrive"
import { diskImages } from "./diskimages"
import * as fflate from "fflate"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import {
  FILE_SUFFIXES_DISK,
  getDefaultDiskDriveIndex,
  MAX_DRIVES,
  RUN_MODE,
} from "../../../common/utility"

import { passSetDriveNewData, requestSetDriveNewData, passSetDriveProps, passSetBinaryBlock, passPasteText, handleGetRunMode, passSetRunMode, handleGetProdosFloppy } from "../../main2worker"
import { showGlobalProgressModal } from "../../ui_utilities"
import { internetArchiveUrlProtocol, getDiskImageUrlFromIdentifier } from "./internetarchive_utils"
import { apple2tsProxyPath, hasApple2tsProxy } from "./apple2tsproxy"
import { newReleases } from "./newreleases"
import { DiskBookmarks } from "./diskbookmarks"
import { parseGameList } from "./totalreplayutilities"
import { getHotReload, setHelpText } from "../../ui_settings"
import { getDiskImageFromLocalStorage, setDiskImageToLocalStorage } from "../../localstorage"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import {
  createHelpTextSelector,
  findCatalogHelpFile,
  getHelpFileUrl,
  readHelpResponseText
} from "./helpfile"

// Technically, all of these properties should be in the main2worker.ts file,
// since they just maintain the state that needs to be passed to/from the
// emulator. But the helper functions were getting too large, so now it's here.

const initDriveProps = (index: number, drive: number, hardDrive: boolean): DriveProps => {
  return {
    index: index,
    hardDrive: hardDrive,
    drive: drive,
    filename: "",
    status: "",
    diskHasChanges: false,
    isWriteProtected: false,
    motorRunning: false,
    diskData: new Uint8Array(),
    lastAppleWriteTime: -1,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: -1
  }
}

const driveProps: DriveProps[] = [initDriveProps(0, 1, true), initDriveProps(1, 2, true),
  initDriveProps(2, 1, false), initDriveProps(3, 2, false)]

const demoZooDiskDownloadExtensions = [
  ".hdv", ".2mg", ".dsk", ".woz", ".po", ".do", ".bin", ".bas", ".nib", ".2img", ".d13", ".dc", ".img",
  ".zip", ".7z", ".gz", ".tar"
]

const isDemoZooDiskDownload = (url: string) => {
  try {
    const pathname = decodeURIComponent(new URL(url).pathname).toLowerCase()
    return demoZooDiskDownloadExtensions.some(extension => pathname.endsWith(extension))
  } catch {
    return false
  }
}

const chooseDemoZooDownloads = (links: Array<{ url: string; link_class?: string }>) => {
  return [...links]
    .filter(link => Boolean(link.url))
    .sort((left, right) => {
      const leftScore = isDemoZooDiskDownload(left.url) ? 100 : /download/i.test(left.link_class || "") ? 10 : 0
      const rightScore = isDemoZooDiskDownload(right.url) ? 100 : /download/i.test(right.link_class || "") ? 10 : 0
      return rightScore - leftScore
    })
    .map(link => link.url)
}

export const handleGetFilename = (index: number) => {
  let f = driveProps[index].filename
  if (f !== "") {
    const i = f.lastIndexOf(".")
    if (i > 0) {
      f = f.substring(0, i)
    }
    return f
  }
  return null
}

export const doSetUIDriveProps = (props: DriveProps) => {
  // For efficiency we only receive disk data if it has changed.
  // If our disk is the same but it hasn't changed, keep the existing data.
  // Also preserve writableFileHandle (custom Electron handlers aren't sent to worker)
  const existingWritableFileHandle = driveProps[props.index].writableFileHandle
  
  if (props.diskData.length === 0) {
    const tmp = driveProps[props.index].diskData
    const diskHasChanges = driveProps[props.index].diskHasChanges
    driveProps[props.index] = props
    driveProps[props.index].diskData = tmp
    driveProps[props.index].diskHasChanges = diskHasChanges
  } else {
    driveProps[props.index] = props
  }
  
  // Always preserve writableFileHandle from UI (worker never has custom handlers)
  if (existingWritableFileHandle && !props.writableFileHandle) {
    driveProps[props.index].writableFileHandle = existingWritableFileHandle
  }
}

export const handleGetDriveProps = (index: number) => {
  return driveProps[index]
}

const setDiskData = (
  index: number,
  data: Uint8Array,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  lastLocalFileWriteTime: number,
  helpFile?: string,
  applyHelpText: (helpText: string) => void = setHelpText,
  forceIndex = false,
  confirmed = false) => {
  if (cloudData) {
    cloudData.fileSize = data.length
  }
  driveProps[index].filename = filename
  driveProps[index].diskData = data
  driveProps[index].lastLocalFileWriteTime = lastLocalFileWriteTime
  driveProps[index].cloudData = cloudData
  driveProps[index].writableFileHandle = writableFileHandle
  
  // Only send FileSystemFileHandle to worker (not custom handlers with functions)
  // Custom handlers can't be cloned via postMessage
  const isFileSystemHandle = writableFileHandle && "getFile" in writableFileHandle
  const propsForWorker = {
    ...driveProps[index],
    writableFileHandle: isFileSystemHandle ? writableFileHandle : null
  }
  const workerOperation = confirmed
    ? requestSetDriveNewData(propsForWorker, forceIndex)
    : Promise.resolve(passSetDriveNewData(propsForWorker, forceIndex))
  if (filename) {
    setTimeout(() => {
      selectHelpText(helpFile, applyHelpText)
    }, 150)
  }

  return workerOperation
}

export const handleSetDiskData = (
  index: number,
  data: Uint8Array,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  lastLocalFileWriteTime: number,
  helpFile?: string,
  applyHelpText: (helpText: string) => void = setHelpText,
  forceIndex = false) => {
  void setDiskData(
    index,
    data,
    filename,
    cloudData,
    writableFileHandle,
    lastLocalFileWriteTime,
    helpFile,
    applyHelpText,
    forceIndex,
  )
}

export const handleSetDiskWriteProtected = (index: number, isWriteProtected: boolean) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

export const handleEjectDisk = (index: number) => {
  driveProps[index] = initDriveProps(index, driveProps[index].drive, driveProps[index].hardDrive)
  passSetDriveNewData(driveProps[index])
}

export const requestEjectDisk = (index: number) => {
  driveProps[index] = initDriveProps(index, driveProps[index].drive, driveProps[index].hardDrive)
  return requestSetDriveNewData(driveProps[index])
}

const findMatchingDiskImage = (url: string) => {
  const name = decodeURIComponent(url).replace(/[^A-Z]/gi, "").toUpperCase()
  for (let i = 0; i < diskImages.length; i++) {
    const diskname = diskImages[i].title.replace(/[^A-Z]/gi, "").toUpperCase()
    if (diskname.includes(name)) {
      return diskImages[i]
    }
  }
  for (let i = 0; i < newReleases.length; i++) {
    const diskname = newReleases[i].title.replace(/[^A-Z]/gi, "").toUpperCase()
    if (diskname.includes(name)) {
      return newReleases[i]
    }
  }
  // If we don't find a disk image in our pre-defined list, just assume
  // that they've given an exact filename in our public folder.
  return {
    type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
    title: "",
    lastUpdated: new Date(0),
    diskUrl: url,
    } as DiskCollectionItem
}

let binaryRunAddress = 0x300
export const setDefaultBinaryAddress = (address: number) => {
  binaryRunAddress = address
}

const setDiskOrFileFromBuffer = (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  helpFile?: string,
  preserveDriveIndex = false,
  confirmed = false) => {

  // Sanity check for strange downloads with no filename.
  if (buffer.byteLength === 143360 && !filename.includes(".")) {
    filename += ".dsk"
  }

  const fname = filename.toLowerCase()
  let newIndex = index
  let workerOperation = Promise.resolve()

  if (fname.endsWith(".bin")) {
    passSetBinaryBlock(binaryRunAddress, new Uint8Array(buffer), true)
  } else if (fname.endsWith(".bas") || fname.endsWith(".a")) {
    const decoder = new TextDecoder("utf-8")
    const basic = decoder.decode(buffer)
    if (basic !== "") {
      const trimmed = basic.trim()
      const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
      const cmd = hasLineNumbers ? "\nRUN\n" : "\n"
      passPasteText(basic + cmd)
    }
  } else {
    const defaultDriveIndex = getDefaultDiskDriveIndex(
      fname,
      buffer.byteLength,
      handleGetProdosFloppy(),
    )
    const bootsExplicitDrive = preserveDriveIndex && index === defaultDriveIndex
    if (bootsExplicitDrive) {
      passSetRunMode(RUN_MODE.IDLE)
      resetAllDiskDrives()
    }
    if (!preserveDriveIndex || index < 0) {
      if (defaultDriveIndex < 2) {
        if (index < 0 || index > 1) newIndex = defaultDriveIndex
      } else if (index < 2) {
        newIndex = defaultDriveIndex
      }
    }
    workerOperation = setDiskData(
      newIndex,
      new Uint8Array(buffer),
      filename,
      cloudData,
      writableFileHandle,
      Date.now(),
      helpFile,
      setHelpText,
      preserveDriveIndex,
      confirmed,
    )
    if (bootsExplicitDrive || handleGetRunMode() === RUN_MODE.IDLE) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    } else {
//      props.updateDisplay()
    }
  }

  return { mountedDrive: newIndex, workerOperation }
}

export const handleSetDiskOrFileFromBuffer = (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  helpFile?: string,
  preserveDriveIndex = false) => {
  return setDiskOrFileFromBuffer(
    index,
    buffer,
    filename,
    cloudData,
    writableFileHandle,
    helpFile,
    preserveDriveIndex,
  ).mountedDrive
}

export const requestSetDiskOrFileFromBuffer = async (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  helpFile?: string,
  preserveDriveIndex = false) => {
  const result = setDiskOrFileFromBuffer(
    index,
    buffer,
    filename,
    cloudData,
    writableFileHandle,
    helpFile,
    preserveDriveIndex,
    true,
  )
  await result.workerOperation
  return result.mountedDrive
}

export const handleSetDiskFromCloudData = async (
  cloudData: CloudData,
  driveIndex: number = 0,
  callback?: (buffer: ArrayBuffer | null) => void,
  onLoadSuccess?: () => void,
  preserveDriveIndex = false) => {
  let cloudProvider
  switch (cloudData.providerName) {
    case "GoogleDrive":
      cloudProvider = new GoogleDrive
      break

    case "OneDrive":
      cloudProvider = new OneDriveCloudDrive
      break
  }

  if (cloudProvider) {
    const authTimeoutMs = 15000
    let authResolved = false
    const authTimeoutId = window.setTimeout(() => {
      if (authResolved) return
      authResolved = true
      if (!callback) {
        showGlobalProgressModal(false)
        alert("Cloud authorization timed out. Please allow the popup/login window and try again.")
      } else {
        callback(null)
      }
    }, authTimeoutMs)

    cloudProvider.requestAuthToken(async (authToken: string) => {
      if (authResolved) return
      authResolved = true
      clearTimeout(authTimeoutId)
      if (!callback) {
        showGlobalProgressModal(true, "Downloading disk")
      }

      try {
        const response = await fetch(cloudData.downloadUrl, {
          headers: {
            "Authorization": authToken,
            "Content-Type": "application/octet"
          },
          redirect: "follow"
        })

        if (response.ok) {
          const blob = await response.blob()
          const buffer = await new Response(blob).arrayBuffer()

          if (callback) {
            callback(buffer)
          } else {
            cloudData.lastSyncTime = Date.now()
            handleSetDiskOrFileFromBuffer(
              driveIndex,
              buffer,
              cloudData.fileName,
              cloudData,
              null,
              undefined,
              preserveDriveIndex,
            )
            onLoadSuccess?.()
          }
        } else {
          if (callback) {
            callback(null)
          } else {
            alert("Unable to download cloud disk. Please re-authenticate and try again.")
          }
        }
      } catch {
        if (callback) {
          callback(null)
        } else {
          alert("Unable to download cloud disk. Please re-authenticate and try again.")
        }
      } finally {
        if (!callback) {
          showGlobalProgressModal(false)
        }
      }
    })
  }
}

type ProxyCandidate = {
  id: string,
  url: string,
}

const PROXY_SCORE_STORAGE_PREFIX = "proxy-score:"
const proxyScoreMemoryCache = new Map<string, Record<string, number>>()

const getProxyTargetDomain = (url: string): string => {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return ""
  }
}

const getProxyScoreRecord = (domain: string): Record<string, number> => {
  if (!domain) return {}

  const cached = proxyScoreMemoryCache.get(domain)
  if (cached) return cached

  try {
    const raw = sessionStorage.getItem(PROXY_SCORE_STORAGE_PREFIX + domain)
    if (!raw) {
      const empty = {}
      proxyScoreMemoryCache.set(domain, empty)
      return empty
    }

    const parsed = JSON.parse(raw) as Record<string, number>
    proxyScoreMemoryCache.set(domain, parsed)
    return parsed
  } catch {
    const empty = {}
    proxyScoreMemoryCache.set(domain, empty)
    return empty
  }
}

const persistProxyScoreRecord = (domain: string, record: Record<string, number>) => {
  if (!domain) return
  proxyScoreMemoryCache.set(domain, record)
  try {
    sessionStorage.setItem(PROXY_SCORE_STORAGE_PREFIX + domain, JSON.stringify(record))
  } catch {
    // sessionStorage may be unavailable; keep in-memory score only.
  }
}

const noteProxyScore = (domain: string, proxyId: string, success: boolean) => {
  if (!domain || !proxyId) return
  const record = { ...getProxyScoreRecord(domain) }
  const current = record[proxyId] || 0
  const updated = success ? Math.min(20, current + 3) : Math.max(-20, current - 1)
  record[proxyId] = updated
  persistProxyScoreRecord(domain, record)
}

const sortProxyCandidatesForDomain = (domain: string, candidates: ProxyCandidate[]): ProxyCandidate[] => {
  const record = getProxyScoreRecord(domain)
  return candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: record[candidate.id] || 0,
    }))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.index - b.index
    })
    .map(entry => entry.candidate)
}

const getCorsProxyCandidates = (url: string): ProxyCandidate[] => {
  const encodedUrl = encodeURIComponent(url)
  return [
    // The encoded form is the reliable Corsfix form for binary URLs. The
    // raw form can return a successful HTML response instead of the file.
    { id: "corsfix-param", url: "https://proxy.corsfix.com/?url=" + encodedUrl },
    { id: "corsfix-raw", url: "https://proxy.corsfix.com/?" + url }
  ]
}

const FETCH_DEBUG_LOGS = false

const logFetchDebug = (...args: unknown[]) => {
  if (FETCH_DEBUG_LOGS) {
    console.log(...args)
  }
}

const shouldAttemptDirectFetch = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    // If URL parsing fails, keep prior behavior and try direct fetch.
    return true
  }
}

const shouldUseCloudflareDiskProxy = (url: string): boolean => {
  try {
    const target = new URL(url)
    return /^https?:$/i.test(target.protocol) &&
      target.origin !== window.location.origin &&
      (hasApple2tsProxy || /\.pages\.dev$/i.test(window.location.hostname))
  } catch {
    return false
  }
}

const fetchWithCloudflareDiskProxy = async (url: string): Promise<Response | null> => {
  try {
    const response = await fetch(apple2tsProxyPath(`/api/disk-direct?url=${encodeURIComponent(url)}`))
    return response.ok ? response : null
  } catch {
    return null
  }
}

const fetchWithCorsProxy = async (url: string, debug?: (message: string) => void) => {
  let lastResponse: Response | null = null
  const domain = getProxyTargetDomain(url)
  const candidates = sortProxyCandidatesForDomain(domain, getCorsProxyCandidates(url))

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    const proxyUrl = candidate.url
    const proxyName = "corsfix"
    try {
      const response = await fetch(proxyUrl)

      if (response.ok) {
        debug?.(`Corsfix ${candidate.id}: HTTP ${response.status}`)
        noteProxyScore(domain, candidate.id, true)
        logFetchDebug(`Proxy fetch succeeded via ${proxyName} (attempt ${i + 1}/${candidates.length})`)
        return response
      }

      noteProxyScore(domain, candidate.id, false)
      debug?.(`Corsfix ${candidate.id}: HTTP ${response.status}`)
      logFetchDebug(`Proxy attempt failed (${response.status}) via ${proxyName} (attempt ${i + 1}/${candidates.length})`)
      lastResponse = response
    } catch (error) {
      noteProxyScore(domain, candidate.id, false)
      logFetchDebug(`Proxy attempt errored via ${proxyName} (attempt ${i + 1}/${candidates.length})`, error)
    }
  }

  return lastResponse
}

const fetchDemoZooResource = async (url: string): Promise<Response | null> => {
  try {
    const parsed = new URL(url)
    if ((import.meta.env.DEV || hasApple2tsProxy || /\.pages\.dev$/i.test(window.location.hostname)) && parsed.hostname === "demozoo.org") {
      return await fetch(apple2tsProxyPath(`/api/demozoo-direct${parsed.pathname}${parsed.search}`))
    }
  } catch {
    return null
  }

  return fetchWithCorsProxy(url)
}

const fetchExternalDownloadPage = async (url: string): Promise<Response | null> => {
  if (hasApple2tsProxy || /\.pages\.dev$/i.test(window.location.hostname)) {
    try {
      return await fetch(apple2tsProxyPath(`/api/disk-direct?url=${encodeURIComponent(url)}`))
    } catch {
      return null
    }
  }

  return fetchWithCorsProxy(url)
}

const findDirectDownloadOnExternalPage = async (url: string): Promise<string> => {
  if (isDemoZooDiskDownload(url)) return url

  const response = await fetchExternalDownloadPage(url)
  if (!response?.ok) return ""

  const html = await response.text()
  const hrefPattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi
  for (const match of html.matchAll(hrefPattern)) {
    try {
      const candidate = new URL(match[1].trim(), url).toString()
      if (isDemoZooDiskDownload(candidate)) return candidate
    } catch {
      // Ignore malformed links.
    }
  }

  return ""
}



let timerId: NodeJS.Timeout|null = null

const diskImageLocalStorageSync = (url: string, index: number) => {
  if (timerId !== null) {
    clearInterval(timerId)
    timerId = null
  }
  timerId = setInterval(() => {
    const dprops = handleGetDriveProps(index)
    if (dprops.diskHasChanges && !dprops.motorRunning) {
      setDiskImageToLocalStorage(index, dprops.diskData)      
      dprops.diskHasChanges = false
      dprops.lastLocalFileWriteTime = Date.now()
      passSetDriveProps(dprops)
    }
  }, 3 * 1000)
}

const setDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void,
  debug?: (message: string) => void, preserveDriveIndex = false, confirmed = false): Promise<boolean> => {
  const installDisk = (...args: Parameters<typeof handleSetDiskOrFileFromBuffer>) => {
    return confirmed
      ? requestSetDiskOrFileFromBuffer(...args)
      : Promise.resolve(handleSetDiskOrFileFromBuffer(...args))
  }
  debug?.(`handleSetDiskFromURL(${url}) drive=${index}`)
  let helpFile = findCatalogHelpFile(url)
  // Check if it's a local file (not http/https URL and not Internet Archive)
  const isLocalFile = !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith(internetArchiveUrlProtocol)
  
  if (isLocalFile) {
    if (url.startsWith("file://") || url.startsWith("/") || /^[A-Za-z]:/.test(url)) {
      try {
        // Fetch for browser (may fail for local files due to CORS)
        const state = getDiskImageFromLocalStorage()
        if (state) {
          resetAllDiskDrives()
          index = await installDisk(state.index, state.data.buffer, url, null, null, helpFile)
        } else {
          const response = await fetch(url)
          const buffer = await response.arrayBuffer()
          const fileName = url.split("/").pop() || url        
          resetAllDiskDrives()
          index = await installDisk(
            index,
            buffer,
            fileName,
            cloudData || null,
            null,
            helpFile,
            preserveDriveIndex,
          )
          setDiskImageToLocalStorage(index, new Uint8Array(buffer))
        }
        diskImageLocalStorageSync(url, index)
        return true
      } catch (error) {
        console.error(`Error loading local file: ${url}`, error)
        return false
      }
    }
    
    // Otherwise, try to find matching disk image in collections
    const match = findMatchingDiskImage(url)
    if ( !match.diskUrl ) {
      return false
    }
    url = match.diskUrl
    helpFile ??= match.helpFile
    if (!URL.canParse(url) && updateDisplay) {
      handleSetDiskFromFile(url, updateDisplay, index, undefined, undefined, preserveDriveIndex)
      return true
    }
  }

  // Resolve Internet Archive URL, if necessary
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const [resolvedUrl, fileSize] = await getDiskImageUrlFromIdentifier(identifier)

    if (resolvedUrl) {
      url = resolvedUrl.toString()

      const diskBookmarks = new DiskBookmarks()
      const bookmark = diskBookmarks.get(identifier)
      if (bookmark) {
        bookmark.diskUrl = resolvedUrl.toString()
        if (bookmark.cloudData) {
          bookmark.cloudData.fileSize = fileSize
        }
        diskBookmarks.set(bookmark)
      }
    } else {
      // The identifier could not be resolved to a real disk image URL. Don't
      // fall through with the still-unresolved "a2ia://" URL: fetching it (and
      // forwarding it to the CORS proxy) is guaranteed to fail.
      console.warn(`Unable to resolve Internet Archive disk image for "${identifier}"`)
      if (callback) {
        callback(null)
      }
      return false
    }
  }

  // Transform scene.org view URL to direct download URL
  if (url.includes("files.scene.org/view/")) {
    url = url.replace("files.scene.org/view/", "files.scene.org/get/")
  }

  // Resolve DemoZoo production web page URL to direct download link if needed
  let alternateDownloadUrls: string[] = []
  if (url.includes("demozoo.org/productions/") && !/\.(zip|dsk|po|woz|nib|2mg|img)$/i.test(url)) {
    const match = url.match(/productions\/(\d+)/)
    if (match) {
      const prodId = match[1]
      try {
        const apiRes = await fetchDemoZooResource(`https://demozoo.org/api/v1/productions/${prodId}/?format=json`)
        if (apiRes && apiRes.ok) {
          const prodData = await apiRes.json()
          if (prodData && prodData.download_links && prodData.download_links.length > 0) {
            const resolvedUrls: string[] = []
            for (const downloadUrl of chooseDemoZooDownloads(prodData.download_links)) {
              const resolvedUrl = await findDirectDownloadOnExternalPage(downloadUrl) || downloadUrl
              const normalizedUrl = resolvedUrl.includes("files.scene.org/view/")
                ? resolvedUrl.replace("files.scene.org/view/", "files.scene.org/get/")
                : resolvedUrl
              if (!resolvedUrls.includes(normalizedUrl)) {
                resolvedUrls.push(normalizedUrl)
              }
            }
            alternateDownloadUrls = resolvedUrls
            url = alternateDownloadUrls[0] || url
          }
        }
      } catch (err) {
        console.warn("Failed to resolve DemoZoo production download link:", err)
      }
    }
  }

  // Download the file from the fragment URL
  let name = ""
  let buffer
  let response: Response | null = null

  if (!callback) {
    showGlobalProgressModal(true, "Downloading disk")
  } else {
    // showGlobalProgressModal(true)
  }

  // Try a direct fetch first for every host (GitHub, Internet Archive, etc.).
  // Most sources (including archive.org/download) send permissive CORS headers,
  // so the direct fetch succeeds and never burdens the CORS proxy. We only fall
  // back to the proxy when a direct fetch genuinely fails (truly CORS-blocked
  // hosts). The disk VTOC check that drives these downloads is serialized one
  // request at a time, so this does not flood Internet Archive with parallel
  // requests (the cause of the earlier 429 throttling).
  const downloadUrlsToTry = [url, ...alternateDownloadUrls.filter(candidate => candidate !== url)]
  for (const candidateUrl of downloadUrlsToTry) {
    url = candidateUrl
    response = null

    if (shouldUseCloudflareDiskProxy(url)) {
      response = await fetchWithCloudflareDiskProxy(url)
    } else if (shouldAttemptDirectFetch(url)) {
      try {
        response = await fetch(url)
        if (!response.ok) {
          response = null
        }
      } catch {
        // Expected for many cross-origin sources; fall through to proxy chain.
        response = null
      }
    }

    if (!response || !response.ok) {
      logFetchDebug("Direct fetch failed, trying corsfix proxy")
      response = await fetchWithCorsProxy(url, debug)
    }

    if (response?.ok) break
  }
    if (!response || !response.ok) {
      console.error(`❌ All fetch methods failed for: ${url}`)
      if (!callback) {
        showGlobalProgressModal(false)
      }
      
      // Show user-friendly error message
      const isGitHub = url.includes("github.com")
      const isExternal = !url.includes(window.location.hostname)
      
      let errorMessage = `Unable to download disk image:\n"${url}".\n`
      
      if (isGitHub) {
        errorMessage += "Some GitHub files cannot be loaded directly in browsers due to cross-origin restrictions.\n"
        errorMessage += "Options:\n"
        errorMessage += "1. Download the file manually and use 'Load from File'\n"
        errorMessage += "2. Use the desktop/Electron version of this emulator"
      } else if (isExternal) {
        errorMessage += "This external URL cannot be loaded due to browser cross-origin restrictions.\n"
        errorMessage += "Options:\n"
        errorMessage += "1. Download the file manually and use 'Load from File'\n"
        errorMessage += "2. Use the Desktop version for unrestricted downloads"
      } else {
        errorMessage += "The file could not be downloaded. Please check your internet connection and try again."
      }
      
      if (callback) {
        callback(null)
        return false
      } else {
        console.warn(errorMessage)
        return false
      }
    }

  try {
    const fileBuffer = await response.arrayBuffer()
    debug?.(`Downloaded ${fileBuffer.byteLength} bytes from ${url}`)

    // Do not pass a Corsfix error/challenge page to the disk parser merely
    // because the proxy returned HTTP 200.
    if (fileBuffer.byteLength < 1024) {
      throw new Error(`Downloaded response is too small to be a disk image (${fileBuffer.byteLength} bytes)`)
    }
    const responseHead = new TextDecoder().decode(fileBuffer.slice(0, 256)).trimStart().toLowerCase()
    if (responseHead.startsWith("<!doctype html") || responseHead.startsWith("<html") || responseHead.includes("just a moment")) {
      throw new Error("Downloaded response is an HTML error page, not a disk image")
    }

    // Try to get filename from Content-Disposition header first
    const contentDisposition = response.headers.get("content-disposition")
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        name = filenameMatch[1].replace(/['"]/g, "")
      }
    }

    // Hack for Internet Archive downloads which have the format:
    // https://archive.org/download/Muppetville4amCrack/00playable.dsk
    // Extract the actual game name from the URL.
    if (name === "" && url.includes("00playable")) {
      // Take the second-to-last part of the URL, and tack on the file suffix
      const urlParts = url.split("/")
      if (urlParts.length >= 2) {
        const possibleName = urlParts[urlParts.length - 2]
        const suffixIndex = url.lastIndexOf(".")
        if (suffixIndex >= 0) {
          const suffix = url.substring(suffixIndex)
          name = possibleName + suffix
        }
      }
    }

    let downloadPath = url.toLowerCase()
    try {
      downloadPath = new URL(url).pathname.toLowerCase()
    } catch {
      // Keep the raw URL for local/blob-style inputs.
    }
    if (downloadPath.endsWith(".zip")) {
      try {
        const unzipped = fflate.unzipSync(new Uint8Array(fileBuffer))
        for (const fileName of Object.keys(unzipped)) {
          const fileExtension = fileName.substring(fileName.lastIndexOf(".")).toLowerCase()
          if (FILE_SUFFIXES_DISK.includes(fileExtension) && unzipped[fileName].length > 1024) {
            name = fileName
            buffer = unzipped[fileName].buffer
            break
          }
        }
      } catch (err) {
        console.error("Failed to unzip disk image:", err)
      }
    } else {
      if (name === "") {
        const urlObj = new URL(url)
        name = url
        const hasSlash = urlObj.pathname.lastIndexOf("/")
        if (hasSlash >= 0) {
          name = urlObj.pathname.substring(hasSlash + 1)
        }
      }
      buffer = fileBuffer
    }

    if (buffer) {
      if (callback) {
        callback(buffer)
      } else {
        if (!preserveDriveIndex) {
          // If we are loading from a URL, reset all drives. Fixes issue#186
          resetAllDiskDrives()
        }
        
        await installDisk(
          index,
          buffer,
          name,
          cloudData || null,
          null,
          helpFile,
          preserveDriveIndex,
        )
        // Loading a disk from a remote URL must boot it even when the
        // emulator was already paused or had previously run a program.
        if (!preserveDriveIndex) passSetRunMode(RUN_MODE.NEED_BOOT)
        debug?.(`Disk buffer installed as ${name}; NEED_BOOT sent`)
      }
    } else {
      if (callback) {
        callback(null)
      } else {
        console.error("❌ No buffer data available after download")
        // $TODO: Add error handling
      }
      return false
    }
    return true
  } catch (error) {
    console.error(`❌ Error processing download for "${url}":`, error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    if (callback) {
      callback(null)
    }
    return false
  } finally {
    if (!callback) {
      showGlobalProgressModal(false)
    }
  }
}

export const handleSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void,
  debug?: (message: string) => void, preserveDriveIndex = false): Promise<boolean> => {
  return setDiskFromURL(url, updateDisplay, index, cloudData, callback, debug, preserveDriveIndex)
}

export const requestSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void,
  debug?: (message: string) => void, preserveDriveIndex = false): Promise<boolean> => {
  return setDiskFromURL(url, updateDisplay, index, cloudData, callback, debug, preserveDriveIndex, true)
}

export const prepWritableFile = async (index: number, writableFileHandle: WritableFileHandle) => {
  console.log(`🔄 prepWritableFile: Starting auto-save timer for drive ${index}`)
  const timer = setInterval(async (index: number) => {
    const dprops = handleGetDriveProps(index)
    if (getHotReload()) {
      // Only FileSystemFileHandle supports getFile() for hot reload
      if ("getFile" in writableFileHandle && typeof writableFileHandle.getFile === "function") {
        const file = await writableFileHandle.getFile()
        if (dprops.lastLocalFileWriteTime > 0 && file.lastModified > dprops.lastLocalFileWriteTime) {
          console.log(`🔄 Hot reload detected for drive ${index}`)
          handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), file.name, null, writableFileHandle)
          passSetRunMode(RUN_MODE.NEED_BOOT)
          return
        }
      }
    }

    if (dprops.diskHasChanges && !dprops.motorRunning) {
      console.log(`💾 Drive ${index} has changes and motor stopped, attempting save...`)
      if (await handleSaveWritableFile(index)) {
        console.log(`✅ Save successful for drive ${index}`)
        dprops.diskHasChanges = false
        dprops.lastLocalFileWriteTime = Date.now()
        
        // Only send FileSystemFileHandle to worker (not custom handlers with functions)
        const isFileSystemHandle = dprops.writableFileHandle && "getFile" in dprops.writableFileHandle
        const propsForWorker = {
          ...dprops,
          writableFileHandle: isFileSystemHandle ? dprops.writableFileHandle : null
        }
        passSetDriveProps(propsForWorker)
      } else {
        console.log(`❌ Save failed for drive ${index}`)
      }
    }
  }, 3 * 1000, index)
  return () => clearInterval(timer)
}

const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    handleSetDiskData(i, new Uint8Array(), "", null, null, -1)
  }
}

const loadHelpText = async (helpFile: string) => {
  try {
    const help = await fetch(getHelpFileUrl(helpFile), { credentials: "include", redirect: "error" })
    let helptext = await readHelpResponseText(help)
    if (helptext === null) return "<Default>"
    if (helpFile === "TotalReplay.txt") {
      helptext = parseGameList(helptext)
    }
    return helptext
  } catch {
    // If we don't have a help text file, just revert to the default text.
    return "<Default>"
  }
}

const selectHelpText = createHelpTextSelector(loadHelpText)

export const handleSetDiskFromFile = async (disk: string,
  updateDisplay: UpdateDisplay | null, driveIndex: number = -1,
  callback?: (buffer: ArrayBuffer | null) => void,
  onLoadSuccess?: () => void,
  preserveDriveIndex = false) => {
  const configuredHelpFile = findCatalogHelpFile(disk)
  let data: ArrayBuffer
  try {
    const res = await fetch("disks/" + disk)
    data = await res.arrayBuffer()
  } catch {
    if (callback) {
      callback(null)
    } else {
      // $TODO: Add error handling
    }
    return
  }

  if (callback) {
    callback(data)
  } else {
    const defaultDriveIndex = getDefaultDiskDriveIndex(
      disk,
      data.byteLength,
      handleGetProdosFloppy(),
    )
    let needsBoot = preserveDriveIndex
      ? (driveIndex === 0 || driveIndex === 2)
      : handleGetRunMode() === RUN_MODE.IDLE
    
    if (driveIndex < 0) {
      needsBoot = true
    }
    
    if (needsBoot) {
      if (preserveDriveIndex) passSetRunMode(RUN_MODE.IDLE)
      resetAllDiskDrives()
      if (!preserveDriveIndex || driveIndex < 0) {
        driveIndex = defaultDriveIndex
      }
    }

    handleSetDiskData(
      driveIndex,
      new Uint8Array(data),
      disk,
      null,
      null,
      -1,
      configuredHelpFile,
      (helpText) => {
        setHelpText(helpText)
        updateDisplay?.(0, helpText)
      },
      preserveDriveIndex,
    )

    if (needsBoot) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    }
    onLoadSuccess?.()

  }
}

export const handleSaveWritableFile = async (index: number, writableFileHandle: WritableFileHandle|null = null) => {
  console.log(`💾 handleSaveWritableFile called for drive ${index}`)
  let success = false

  if (writableFileHandle === null) {
    writableFileHandle = driveProps[index].writableFileHandle
    console.log("📁 Using stored writableFileHandle:", writableFileHandle ? "present" : "null")
  }

  const dprops = driveProps[index]

  if (writableFileHandle) {
    try {
      console.log(`🔨 Creating blob from disk data: ${dprops.filename}, ${dprops.diskData.length} bytes`)
      const blob = getBlobFromDiskData(dprops.diskData, dprops.filename)
      console.log("📝 Calling createWritable()...")
      const writable = await writableFileHandle.createWritable()

      console.log("✍️ Calling write() with blob...")
      // Both browser FileSystemWritableFileStream and custom handler support write()
      await writable.write(blob)
      console.log("🔒 Calling close()...")
      await writable.close()
      
      success = true
      console.log("✅ handleSaveWritableFile completed successfully")
    } catch (ex) {
      console.log(`❌ Error saving writable file: ${ex}`)
    }
  } else {
    console.log(`⚠️ No writableFileHandle available for drive ${index}`)
  }

  return success
}
