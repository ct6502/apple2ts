import { getBlobFromDiskData } from "./diskdrive"
import { diskImages } from "./diskimages"
import * as fflate from "fflate"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { isHardDriveImage, RUN_MODE, MAX_DRIVES, replaceSuffix, FILE_SUFFIXES_DISK } from "../../../common/utility"
import { iconKey, iconData, iconName } from "../../img/iconfunctions"
import { passSetDriveNewData, passSetDriveProps, passSetBinaryBlock, passPasteText, handleGetRunMode, passSetRunMode } from "../../main2worker"
import { showGlobalProgressModal } from "../../ui_utilities"
import { internetArchiveUrlProtocol, getDiskImageUrlFromIdentifier } from "./internetarchive_utils"
import { newReleases } from "./newreleases"
import { DiskBookmarks } from "./diskbookmarks"
import { parseGameList } from "./totalreplayutilities"
import { getHotReload, setHelpText } from "../../ui_settings"
import { getDiskImageFromLocalStorage, setDiskImageToLocalStorage } from "../../localstorage"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"

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

export const handleSetDiskData = (
  index: number,
  data: Uint8Array,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  lastLocalFileWriteTime: number) => {
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
  passSetDriveNewData(propsForWorker)
  if (filename) {
    checkForHelpFile(filename)
  }

}

export const handleSetDiskWriteProtected = (index: number, isWriteProtected: boolean) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

export const handleEjectDisk = (index: number) => {
  driveProps[index] = initDriveProps(index, driveProps[index].drive, driveProps[index].hardDrive)
  passSetDriveNewData(driveProps[index])
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

export const handleSetDiskOrFileFromBuffer = (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null) => {

  // Sanity check for strange downloads with no filename.
  if (buffer.byteLength === 143360 && !filename.includes(".")) {
    filename += ".dsk"
  }

  const fname = filename.toLowerCase()
  let newIndex = index

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
    // Force hard drive images to be in "0" or "1" (slot 7 drive 1 or 2)
    if (isHardDriveImage(fname)) {
      if (index < 0 || index > 1) newIndex = 0
    } else {
      if (index < 2) newIndex = 2
    }
    handleSetDiskData(newIndex, new Uint8Array(buffer), filename, cloudData, writableFileHandle, Date.now())
    if (handleGetRunMode() === RUN_MODE.IDLE) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    } else {
//      props.updateDisplay()
    }
  }

  return newIndex
}

export const handleSetDiskFromCloudData = async (
  cloudData: CloudData,
  driveIndex: number = 0,
  callback?: (buffer: ArrayBuffer | null) => void) => {
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
            handleSetDiskOrFileFromBuffer(driveIndex, buffer, cloudData.fileName, cloudData, null)
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
    { id: "corsfix-raw", url: "https://proxy.corsfix.com/?" + url },
    { id: "corsfix-encoded", url: "https://proxy.corsfix.com/?" + encodedUrl },
    { id: "corsfix-param", url: "https://proxy.corsfix.com/?url=" + encodedUrl },
    { id: "corsproxy-encoded", url: "https://corsproxy.io/?" + encodedUrl },
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
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true
    }
    return parsed.origin === window.location.origin
  } catch {
    // If URL parsing fails, keep prior behavior and try direct fetch.
    return true
  }
}

const fetchWithCorsProxy = async (url: string) => {
  let lastResponse: Response | null = null
  const domain = getProxyTargetDomain(url)
  const candidates = sortProxyCandidatesForDomain(domain, getCorsProxyCandidates(url))

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]
    const proxyUrl = candidate.url
    const proxyName = proxyUrl.includes("corsproxy.io") ? "corsproxy.io" : "corsfix"
    try {
      const response = await fetch(proxyUrl)

      if (response.ok) {
        noteProxyScore(domain, candidate.id, true)
        logFetchDebug(`Proxy fetch succeeded via ${proxyName} (attempt ${i + 1}/${candidates.length})`)
        return response
      }

      noteProxyScore(domain, candidate.id, false)
      logFetchDebug(`Proxy attempt failed (${response.status}) via ${proxyName} (attempt ${i + 1}/${candidates.length})`)
      lastResponse = response
    } catch (error) {
      noteProxyScore(domain, candidate.id, false)
      logFetchDebug(`Proxy attempt errored via ${proxyName} (attempt ${i + 1}/${candidates.length})`, error)
    }
  }

  return lastResponse
}

const fetchWithCT6502Proxy = async (url: string) => {
  const headers: { [key: string]: string } = {}
  headers[iconKey()] = iconData()

  try {
    const response = await fetch(iconName() + url)
    if (response.ok) {
      logFetchDebug("CT6502 proxy fetch succeeded")
    } else {
      logFetchDebug(`CT6502 proxy failed (${response.status})`)

      const keyedResponse = await fetch(iconName() + url, { headers })
      if (keyedResponse.ok) {
        logFetchDebug("CT6502 keyed proxy fetch succeeded")
      } else {
        logFetchDebug(`CT6502 keyed proxy failed (${keyedResponse.status})`)
      }
      return keyedResponse
    }
    return response
  } catch (error) {
    logFetchDebug("CT6502 proxy errored, retrying keyed", error)
    try {
      const keyedResponse = await fetch(iconName() + url, { headers })
      if (keyedResponse.ok) {
        logFetchDebug("CT6502 keyed proxy fetch succeeded")
      } else {
        logFetchDebug(`CT6502 keyed proxy failed (${keyedResponse.status})`)
      }
      return keyedResponse
    } catch (keyedError) {
      logFetchDebug("CT6502 keyed proxy errored", keyedError)
      return null
    }
  }
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

export const handleSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void) => {
  // Check if it's a local file (not http/https URL)
  const isLocalFile = !url.startsWith("http://") && !url.startsWith("https://")
  
  if (isLocalFile) {
    if (url.startsWith("file://") || url.startsWith("/") || /^[A-Za-z]:/.test(url)) {
      try {
        // Fetch for browser (may fail for local files due to CORS)
        const state = getDiskImageFromLocalStorage()
        if (state) {
          resetAllDiskDrives()
          index = handleSetDiskOrFileFromBuffer(state.index, state.data.buffer, url, null, null)
        } else {
          const response = await fetch(url)
          const buffer = await response.arrayBuffer()
          const fileName = url.split("/").pop() || url        
          resetAllDiskDrives()
          index = handleSetDiskOrFileFromBuffer(index, buffer, fileName, cloudData || null, null)
          setDiskImageToLocalStorage(index, new Uint8Array(buffer))
        }
        diskImageLocalStorageSync(url, index)
        return
      } catch (error) {
        console.error(`Error loading local file: ${url}`, error)
        return
      }
    }
    
    // Otherwise, try to find matching disk image in collections
    const match = findMatchingDiskImage(url)
    if ( !match.diskUrl ) {
      return
    }
    url = match.diskUrl
    if (!URL.canParse(url) && updateDisplay) {
      handleSetDiskFromFile(url, updateDisplay, index)
      return
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
      return
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
  if (shouldAttemptDirectFetch(url)) {
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

  // If direct fetch failed, try CORS proxies
  if (!response || !response.ok) {
    logFetchDebug("Direct fetch failed, trying CORS proxies")
    response = await fetchWithCorsProxy(url)
  }

  if (!response || !response.ok) {
    logFetchDebug("CORS proxies failed, trying CT6502 proxy")
    response = await fetchWithCT6502Proxy(url)

    if (!response || !response.ok) {
      console.error(`❌ All fetch methods failed for: ${url}`)
      reportAutomationEvent("disk-load-failed", { url, phase: "fetch" })
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
        return
      } else {
        setTimeout(() => alert(errorMessage), 100)
        return
      }
    }
  }

  try {
    const fileBuffer = await response.arrayBuffer()

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

    if (url.toLowerCase().endsWith(".zip")) {
      const unzipper = new fflate.Unzip()
      unzipper.register(fflate.UnzipInflate)

      unzipper.onfile = file => {
        const fileExtension = file.name.substring(file.name.lastIndexOf(".")).toLocaleLowerCase()
        if (FILE_SUFFIXES_DISK.includes(fileExtension)) {
          file.ondata = (_err, data) => {
            // Ignore index files, etc.
            if (data.length > 1024) {
              name = file.name
              buffer = data
              return
            }
          }
          file.start()
          return
        }
      }
      unzipper.push(new Uint8Array(fileBuffer), true)
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
        // If we are loading from a URL, reset all drives. Fixes issue#186
        resetAllDiskDrives()
        
        handleSetDiskOrFileFromBuffer(index, buffer, name, cloudData || null, null)
        reportAutomationEvent("disk-loaded", { url, filename: name, driveIndex: index })
      }
    } else {
      if (callback) {
        callback(null)
      } else {
        console.error("❌ No buffer data available after download")
        reportAutomationEvent("disk-load-failed", { url, phase: "decode" })
        // $TODO: Add error handling
      }
    }
  } catch (error) {
    console.error(`❌ Error processing download for "${url}":`, error)
    console.error("Error details:", error instanceof Error ? error.message : String(error))
    reportAutomationEvent("disk-load-failed", {
      url,
      phase: "process",
      message: error instanceof Error ? error.message : String(error),
    })
    if (callback) {
      callback(null)
    }
  } finally {
    if (!callback) {
      showGlobalProgressModal(false)
    }
  }
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

const reportAutomationEvent = (eventName: string, payload?: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if ((window as any).electronAPI?.reportAutomationEvent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).electronAPI.reportAutomationEvent(eventName, payload)
  }
}

const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    handleSetDiskData(i, new Uint8Array(), "", null, null, -1)
  }
}

const checkForHelpFile = async (disk: string) => {
  const helpFile = replaceSuffix(disk, "txt")
  try {
    const help = await fetch("disks/" + helpFile, { credentials: "include", redirect: "error" })
    let helptext = "<Default>"
    if (help.ok) {
      helptext = await help.text()
      // Hack: when running on localhost, if the file is missing it just
      // returns the index.html. So just return an empty string instead.
      if (helptext.startsWith("<!DOCTYPE html>")) {
        helptext = "<Default>"
      }
      if (helpFile === "TotalReplay.txt") {
        helptext = parseGameList(helptext)
      }
      setHelpText(helptext)
    }      
  } catch {
    // If we don't have a help text file, just revert to the default text.
    setHelpText("<Default>")  }
}

export const handleSetDiskFromFile = async (disk: string,
  updateDisplay: UpdateDisplay | null, driveIndex: number = -1,
  callback?: (buffer: ArrayBuffer | null) => void) => {
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
    let needsBoot = false
    
    if (driveIndex < 0) {
      needsBoot = true
      driveIndex = 0
    }
    
    if (needsBoot) {
      resetAllDiskDrives()
      driveIndex = 0
    }

    handleSetDiskData(driveIndex, new Uint8Array(data), disk, null, null, -1)
    reportAutomationEvent("disk-loaded", { filename: disk, driveIndex })

    if (needsBoot) {
      passSetRunMode(RUN_MODE.NEED_BOOT)
    }

    const helpFile = replaceSuffix(disk, "txt")
    try {
      const help = await fetch("disks/" + helpFile, { credentials: "include", redirect: "error" })
      let helptext = "<Default>"
      if (help.ok) {
        helptext = await help.text()
        // Hack: when running on localhost, if the file is missing it just
        // returns the index.html. So just return an empty string instead.
        if (helptext.startsWith("<!DOCTYPE html>")) {
          helptext = "<Default>"
        }
        if (helpFile.includes("Total%20Replay")) {
        helptext = parseGameList(helptext)
      }
        updateDisplay?.(0, helptext)
      }      
    } catch {
      // If we don't have a help text file, just revert to the default text.
      updateDisplay?.(0, "<Default>")
    }
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
