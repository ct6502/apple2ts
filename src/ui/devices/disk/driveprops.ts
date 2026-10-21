import { diskImages } from "./diskimages"
import { unzipSingleFile, decompressSingleFile, decompressAllDiskFiles } from "../../../common/zip_utils"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import {
  CLOUD_SYNC,
  getDefaultDiskDriveIndex,
  getPrimaryDiskUrl,
  MAX_DRIVES,
  RUN_MODE,
  getCleanDiskFilename,
  parseDiskSwapperParam,
  resolveDiskSwapperUrls,
  separateUrlAndComment,
  updateWozCrc,
  getDiskBlobForSync,
} from "../../../common/utility"
import { clearDialogMessageContext, hasDialogMessageContext, showGlobalProgressModal } from "../../ui_utilities"
import { passSetDriveNewData, requestSetDriveNewData, passSetDriveProps, passSetBinaryBlock, passPasteText, handleGetRunMode, passSetRunMode } from "../../main2worker"
import { internetArchiveUrlProtocol, getDiskImageUrlFromIdentifier } from "./internetarchive_utils"
import {
  isDemoZooDiskUrl,
  parseDemoZooProductionPageHtml,
  resolveExternalDownloadUrls,
  sortDemoZooDisks
} from "./demozoo_utils"
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


export const normalizeDownloadUrl = (url: string): string => {
  if (!url) return url
  let trimmed = url.trim()
  const sceneOrgMatch = trimmed.match(/^https?:\/\/files\.scene\.org\/(?:view|get)\/(.+)$/i)
  if (sceneOrgMatch) {
    trimmed = `https://archive.scene.org/pub/${sceneOrgMatch[1]}`
  }
  if (trimmed.includes("marqueeedesign_")) {
    trimmed = trimmed.replace("marqueeedesign_", "marqueedesign_")
  }
  const brutalLocsMatch = trimmed.match(/^https?:\/\/(?:www\.)?brutaldeluxe\.fr\/products\/french\/locs\/(.+)$/i)
  if (brutalLocsMatch) {
    trimmed = `https://web.archive.org/web/0id_/http://www.brutaldeluxe.fr/products/french/locs/${brutalLocsMatch[1]}`
  }
  return trimmed
}

export const getArchiveOrgCorsUrl = (url: string): string => {
  if (!url) return ""
  const trimmed = url.trim()
  const match = trimmed.match(/^https?:\/\/archive\.org\/download\/(.+)$/i)
  if (match) {
    return `https://archive.org/cors/${match[1]}`
  }
  return ""
}

export const getWaybackRawUrl = (url: string): string => {
  if (!url) return ""
  const trimmed = url.trim()
  if (!/^https?:/i.test(trimmed)) return ""
  if (/web\.archive\.org|archive\.org/i.test(trimmed)) return ""
  return `https://web.archive.org/web/0id_/${trimmed}`
}

const chooseDemoZooDownloads = (links: Array<{ url: string; link_class?: string }>) => {
  const urls = [...links]
    .filter(link => Boolean(link.url))
    .map(link => normalizeDownloadUrl(link.url))
  return sortDemoZooDisks(urls)
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

export const doSetUIDriveProps = (props: DriveProps, replaceDiskData = false) => {
  // If the UI has loaded a disk more recently than a stale empty worker update, ignore the empty update
  if (props.filename === "" && driveProps[props.index].filename !== "") {
    if (driveProps[props.index].lastLocalFileWriteTime > props.lastLocalFileWriteTime) {
      return
    }
  }

  // For efficiency we only receive disk data if it has changed.
  // If our disk is the same but it hasn't changed, keep the existing data.
  // Also preserve writableFileHandle (custom Electron handlers aren't sent to worker)
  const existingWritableFileHandle = driveProps[props.index].writableFileHandle
  
  if (props.diskData.length === 0 && !replaceDiskData) {
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
  driveProps[index].filename = getCleanDiskFilename(filename)
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
  let workerOperation: Promise<void> | undefined
  if (confirmed) {
    workerOperation = requestSetDriveNewData(propsForWorker, forceIndex)
  } else {
    passSetDriveNewData(propsForWorker, forceIndex)
  }
  if (filename) {
    standbyDisks[index] = [{
      filename: getCleanDiskFilename(filename),
      diskData: data,
      diskHasChanges: false,
      isWriteProtected: driveProps[index].isWriteProtected,
      writableFileHandle,
      cloudData,
      lastAppleWriteTime: -1,
      lastLocalFileWriteTime,
      helpFile,
    }]
    standbyActiveIndex[index] = 0
    setTimeout(() => {
      selectHelpText(helpFile, applyHelpText)
    }, 150)
  } else {
    standbyDisks[index] = []
    standbyActiveIndex[index] = 0
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

export type StandbyDisk = {
  filename: string
  diskData: Uint8Array
  diskHasChanges: boolean
  isWriteProtected: boolean
  writableFileHandle: WritableFileHandle | null
  cloudData: CloudData | null
  lastAppleWriteTime: number
  lastLocalFileWriteTime: number
  helpFile?: string
  comment?: string
}

const standbyDisks: StandbyDisk[][] = [[], [], [], []]
const standbyActiveIndex: number[] = [0, 0, 0, 0]

export const getStandbyDisks = (driveIndex: number): StandbyDisk[] => {
  if (driveIndex < 0 || driveIndex >= 4) return []
  const drive = driveProps[driveIndex]
  if (!drive || !drive.filename) {
    return [...standbyDisks[driveIndex]]
  }
  if (standbyDisks[driveIndex].length === 0) {
    standbyDisks[driveIndex] = [{
      filename: getCleanDiskFilename(drive.filename),
      diskData: drive.diskData,
      diskHasChanges: drive.diskHasChanges,
      isWriteProtected: drive.isWriteProtected,
      writableFileHandle: drive.writableFileHandle,
      cloudData: drive.cloudData,
      lastAppleWriteTime: drive.lastAppleWriteTime,
      lastLocalFileWriteTime: drive.lastLocalFileWriteTime,
    }]
    standbyActiveIndex[driveIndex] = 0
  }
  syncActiveDiskToStandby(driveIndex)
  return [...standbyDisks[driveIndex]]
}

export const getStandbyActiveIndex = (driveIndex: number): number => {
  return standbyActiveIndex[driveIndex] ?? 0
}

export const syncActiveDiskToStandby = (driveIndex: number) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  const activeIdx = standbyActiveIndex[driveIndex]
  const drive = driveProps[driveIndex]
  if (drive && standbyDisks[driveIndex][activeIdx]) {
    if (drive.diskHasChanges && drive.diskData?.length > 0) {
      updateWozCrc(drive.diskData)
    }
    standbyDisks[driveIndex][activeIdx] = {
      ...standbyDisks[driveIndex][activeIdx],
      filename: drive.filename,
      diskData: drive.diskData,
      diskHasChanges: drive.diskHasChanges,
      isWriteProtected: drive.isWriteProtected,
      writableFileHandle: drive.writableFileHandle,
      cloudData: drive.cloudData,
      lastAppleWriteTime: drive.lastAppleWriteTime,
      lastLocalFileWriteTime: drive.lastLocalFileWriteTime,
    }
  }
}

export const setStandbyDisks = (driveIndex: number, disks: StandbyDisk[], activeIndex = 0) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  standbyDisks[driveIndex] = [...disks]
  standbyActiveIndex[driveIndex] = Math.max(0, Math.min(activeIndex, disks.length - 1))
}

export const appendStandbyDisks = (driveIndex: number, newDisks: StandbyDisk[]) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  getStandbyDisks(driveIndex)
  standbyDisks[driveIndex].push(...newDisks)
}

export const swapStandbyDisk = async (
  driveIndex: number,
  newDiskIndex: number,
  saveActiveDiskCallback?: () => Promise<void>,
  updateDisplay?: UpdateDisplay,
) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  const currentDisks = standbyDisks[driveIndex]
  if (!currentDisks || newDiskIndex < 0 || newDiskIndex >= currentDisks.length) return

  syncActiveDiskToStandby(driveIndex)

  if (driveProps[driveIndex].diskHasChanges && saveActiveDiskCallback) {
    await saveActiveDiskCallback()
  }

  const target = currentDisks[newDiskIndex]
  if (target.diskHasChanges && target.diskData?.length > 0) {
    updateWozCrc(target.diskData)
  }
  standbyActiveIndex[driveIndex] = newDiskIndex

  driveProps[driveIndex].filename = target.filename
  driveProps[driveIndex].diskData = target.diskData
  driveProps[driveIndex].diskHasChanges = target.diskHasChanges
  driveProps[driveIndex].isWriteProtected = target.isWriteProtected
  driveProps[driveIndex].writableFileHandle = target.writableFileHandle
  driveProps[driveIndex].cloudData = target.cloudData
  driveProps[driveIndex].lastLocalFileWriteTime = target.lastLocalFileWriteTime
  driveProps[driveIndex].lastAppleWriteTime = target.lastAppleWriteTime

  passSetDriveNewData(driveProps[driveIndex], true)
  updateDisplay?.()
}

export const removeStandbyDisk = (
  driveIndex: number,
  removeIndex: number,
  updateDisplay?: UpdateDisplay,
) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  const disks = standbyDisks[driveIndex]
  if (!disks || removeIndex < 0 || removeIndex >= disks.length) return

  syncActiveDiskToStandby(driveIndex)
  const wasActive = standbyActiveIndex[driveIndex] === removeIndex
  disks.splice(removeIndex, 1)

  if (disks.length === 0) {
    handleEjectDisk(driveIndex)
    standbyActiveIndex[driveIndex] = 0
    updateDisplay?.()
  } else if (wasActive) {
    const nextIdx = Math.min(removeIndex, disks.length - 1)
    void swapStandbyDisk(driveIndex, nextIdx, undefined, updateDisplay)
  } else {
    if (standbyActiveIndex[driveIndex] > removeIndex) {
      standbyActiveIndex[driveIndex]--
    }
    updateDisplay?.()
  }
}

export const ejectAllDisks = (driveIndex: number, updateDisplay?: UpdateDisplay) => {
  if (driveIndex < 0 || driveIndex >= 4) return
  standbyDisks[driveIndex] = []
  standbyActiveIndex[driveIndex] = 0
  handleEjectDisk(driveIndex)
  updateDisplay?.()
}

export const handleSetDiskWriteProtected = (
  index: number,
  isWriteProtected: boolean,
) => {
  driveProps[index].isWriteProtected = isWriteProtected
  passSetDriveProps(driveProps[index])
}

export const handleEjectDisk = (index: number) => {
  driveProps[index] = initDriveProps(index, driveProps[index].drive, driveProps[index].hardDrive)
  standbyDisks[index] = []
  standbyActiveIndex[index] = 0
  passSetDriveNewData(driveProps[index])
}

export const requestEjectDisk = (index: number) => {
  driveProps[index] = initDriveProps(index, driveProps[index].drive, driveProps[index].hardDrive)
  standbyDisks[index] = []
  standbyActiveIndex[index] = 0
  return requestSetDriveNewData(driveProps[index])
}

export const findMatchingDiskImage = (url: string) => {
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
  confirmed = false,
  noReset = false,
  noBoot = false) => {

  // Auto-unzip if archive or zipped disk image
  const unzipped = unzipSingleFile(buffer, filename, [".dsk", ".woz", ".do", ".po", ".2mg", ".hdv", ".2meg", ".img", ".nib", ".bin", ".bas", ".a"])
  if (unzipped) {
    const origFilename = filename
    filename = unzipped.filename
    buffer = unzipped.buffer
    writableFileHandle = null
    cloudData = {
      providerName: cloudData?.providerName || "Local",
      syncStatus: CLOUD_SYNC.INACTIVE,
      syncInterval: cloudData?.syncInterval ?? -1,
      lastSyncTime: cloudData?.lastSyncTime ?? -1,
      fileName: cloudData?.fileName || origFilename,
      itemId: cloudData?.itemId || "",
      apiEndpoint: cloudData?.apiEndpoint || "",
      downloadUrl: cloudData?.downloadUrl || "",
      detailsUrl: cloudData?.detailsUrl || "",
      fileSize: cloudData?.fileSize ?? buffer.byteLength,
      isArchive: true,
    }
  }

  // Sanity check for strange downloads with no filename.
  if (buffer.byteLength === 143360 && !filename.includes(".")) {
    filename += ".dsk"
  }

  const fname = filename.toLowerCase()
  let newIndex = index
  const isGenericProgram = fname.endsWith(".bin") || fname.endsWith(".bas") || fname.endsWith(".a")

  if (confirmed) {
    if (isGenericProgram) {
      // A confirmed remote disk mount is intentionally narrower than the GUI's
      // generic file loader and must not execute a program as a side effect.
      return { mountedDrive: index, workerOperation: undefined }
    }
    const workerOperation = setDiskData(
      index,
      new Uint8Array(buffer),
      filename,
      cloudData,
      writableFileHandle,
      Date.now(),
      helpFile,
      setHelpText,
      true,
      true,
    )
    return { mountedDrive: index, workerOperation }
  }

  clearDialogMessageContext()

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
    const defaultDriveIndex = getDefaultDiskDriveIndex(fname, buffer.byteLength)
    const isIdle = handleGetRunMode() === RUN_MODE.IDLE
    const bootsExplicitDrive = !noReset && !noBoot && isIdle && preserveDriveIndex && index === defaultDriveIndex
    if (bootsExplicitDrive) {
      passSetRunMode(RUN_MODE.IDLE)
      resetAllDiskDrives()
    }
    if (newIndex < 0) {
      newIndex = defaultDriveIndex
    } else if (defaultDriveIndex < 2) {
      if (newIndex < 0 || newIndex > 1) newIndex = defaultDriveIndex
    } else if (newIndex < 2 || newIndex > 3) {
      newIndex = defaultDriveIndex
    }
    setDiskData(
      newIndex,
      new Uint8Array(buffer),
      filename,
      cloudData,
      writableFileHandle,
      Date.now(),
      helpFile,
      setHelpText,
      preserveDriveIndex,
      false,
    )
    const needsBoot = !noBoot && (bootsExplicitDrive || isIdle)

    if (needsBoot) {
      setTimeout(() => {
        if (!hasDialogMessageContext()) {
          passSetRunMode(RUN_MODE.NEED_BOOT)
        }}, 10)
    }
  }

  return { mountedDrive: newIndex, workerOperation: undefined }
}

export const handleSetDiskOrFileFromBuffer = (
  index: number,
  buffer: ArrayBuffer,
  filename: string,
  cloudData: CloudData | null,
  writableFileHandle: WritableFileHandle | null,
  helpFile?: string,
  preserveDriveIndex = false,
  confirmed = false,
  noReset = false,
  noBoot = false) => {
  return setDiskOrFileFromBuffer(
    index,
    buffer,
    filename,
    cloudData,
    writableFileHandle,
    helpFile,
    preserveDriveIndex,
    confirmed,
    noReset,
    noBoot,
  ).mountedDrive
}

export const requestMountDiskFromBuffer = async (
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
  if (!result.workerOperation) {
    throw new Error("Remote disk mount requires disk media")
  }
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
    if (parsed.hostname === "github.com") return false
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
      typeof window !== "undefined" &&
      /\.pages\.dev$/i.test(window.location.hostname)
  } catch {
    return false
  }
}

const fetchWithCloudflareDiskProxy = async (url: string): Promise<Response | null> => {
  try {
    const response = await fetch(`/api/disk-direct?url=${encodeURIComponent(url)}`)
    return response.ok ? response : null
  } catch {
    return null
  }
}

export const fetchWithCorsProxy = async (url: string, debug?: (message: string) => void) => {
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
  return fetchWithCorsProxy(url)
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
      if (dprops.diskData?.length > 0) {
        updateWozCrc(dprops.diskData)
      }
      setDiskImageToLocalStorage(index, dprops.diskData)      
      dprops.diskHasChanges = false
      dprops.lastLocalFileWriteTime = Date.now()
      passSetDriveProps(dprops)
    }
  }, 3 * 1000)
}

const resolveDemoZooProductionDisks = async (prodId: string): Promise<string[]> => {
  const resolvedUrls: string[] = []

  // 1. Try JSON API first
  try {
    const apiRes = await fetchDemoZooResource(`https://demozoo.org/api/v1/productions/${prodId}/?format=json`)
    if (apiRes && apiRes.ok) {
      const prodData = await apiRes.json()
      if (prodData && prodData.download_links && prodData.download_links.length > 0) {
        for (const downloadUrl of chooseDemoZooDownloads(prodData.download_links)) {
          const directUrls = await resolveExternalDownloadUrls(downloadUrl)
          for (const resolvedUrl of (directUrls.length > 0 ? directUrls : [downloadUrl])) {
            const normalizedUrl = normalizeDownloadUrl(resolvedUrl)
            if (isDemoZooDiskUrl(normalizedUrl) && !resolvedUrls.includes(normalizedUrl)) {
              resolvedUrls.push(normalizedUrl)
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn("Failed to resolve DemoZoo production from API:", err)
  }

  // 2. Fallback to public web page scraping if API failed or was blocked (e.g. 403 without API key)
  if (resolvedUrls.length === 0) {
    try {
      const pageRes = await fetchDemoZooResource(`https://demozoo.org/productions/${prodId}/`)
      if (pageRes && pageRes.ok) {
        const html = await pageRes.text()
        const pageDisks = parseDemoZooProductionPageHtml(html, `https://demozoo.org/productions/${prodId}/`)
        for (const candidate of pageDisks) {
          const directUrls = await resolveExternalDownloadUrls(candidate)
          for (const resolvedUrl of (directUrls.length > 0 ? directUrls : [candidate])) {
            const normalizedUrl = normalizeDownloadUrl(resolvedUrl)
            if (isDemoZooDiskUrl(normalizedUrl) && !resolvedUrls.includes(normalizedUrl)) {
              resolvedUrls.push(normalizedUrl)
            }
          }
        }
      }
    } catch (pageErr) {
      console.warn("Failed to resolve DemoZoo production from public webpage:", pageErr)
    }
  }

  return sortDemoZooDisks(resolvedUrls)
}

export const fetchDiskBufferAndNameFromURL = async (
  rawUrl: string,
  debug?: (message: string) => void,
): Promise<{ buffer: ArrayBuffer; name: string; allDisks?: StandbyDisk[] } | null> => {
  let url = rawUrl
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const [resolvedUrl] = await getDiskImageUrlFromIdentifier(identifier)
    if (resolvedUrl) {
      url = resolvedUrl.toString()
    } else {
      return null
    }
  }

  url = normalizeDownloadUrl(url)

  let alternateDownloadUrls: string[] = []
  if (url.includes("demozoo.org/productions/") && !/\.(zip|dsk|po|woz|nib|2mg|img)$/i.test(url)) {
    const match = url.match(/productions\/(\d+)/)
    if (match) {
      alternateDownloadUrls = await resolveDemoZooProductionDisks(match[1])
      url = alternateDownloadUrls[0] || url
    }
  }

  let name = ""
  let buffer: ArrayBuffer | undefined
  let response: Response | null = null

  const initialUrls = [url, ...alternateDownloadUrls.filter(candidate => candidate !== url)]
  const downloadUrlsToTry: string[] = []
  for (const candidate of initialUrls) {
    if (!downloadUrlsToTry.includes(candidate)) {
      downloadUrlsToTry.push(candidate)
    }
    const iaCors = getArchiveOrgCorsUrl(candidate)
    if (iaCors && !downloadUrlsToTry.includes(iaCors)) {
      downloadUrlsToTry.push(iaCors)
    }
    const wayback = getWaybackRawUrl(candidate)
    if (wayback && !downloadUrlsToTry.includes(wayback)) {
      downloadUrlsToTry.push(wayback)
    }
  }

  for (const candidateUrl of downloadUrlsToTry) {
    url = candidateUrl
    response = null

    if (shouldAttemptDirectFetch(url)) {
      try {
        response = await fetch(url)
        if (!response.ok) response = null
      } catch {
        response = null
      }
    }

    if (!response || !response.ok) {
      logFetchDebug("Direct fetch failed, trying corsfix proxy")
      response = await fetchWithCorsProxy(url, debug)
    }

    if ((!response || !response.ok) && shouldUseCloudflareDiskProxy(url)) {
      response = await fetchWithCloudflareDiskProxy(url)
    }

    if (response?.ok) break
  }

  if (!response || !response.ok) {
    return null
  }

  try {
    const fileBuffer = await response.arrayBuffer()
    if (fileBuffer.byteLength < 1024) return null
    const responseHead = new TextDecoder().decode(fileBuffer.slice(0, 256)).trimStart().toLowerCase()
    if (responseHead.startsWith("<!doctype html") || responseHead.startsWith("<html") || responseHead.includes("just a moment")) {
      return null
    }

    const contentDisposition = response.headers.get("content-disposition")
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
      if (filenameMatch && filenameMatch[1]) {
        name = filenameMatch[1].replace(/['"]/g, "")
      }
    }

    if (name === "" && url.includes("00playable")) {
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
      // Keep raw url
    }

    const decompressedList = await decompressAllDiskFiles(fileBuffer, name || downloadPath, [".woz", ".po", ".dsk", ".do", ".2mg", ".hdv", ".2meg", ".img", ".nib", ".bin", ".bas", ".a"])
    let allDisks: StandbyDisk[] | undefined
    if (decompressedList && decompressedList.length > 0) {
      name = decompressedList[0].filename
      buffer = decompressedList[0].buffer
      if (decompressedList.length > 1) {
        allDisks = decompressedList.map(item => ({
          filename: getCleanDiskFilename(item.filename),
          diskData: new Uint8Array(item.buffer),
          diskHasChanges: false,
          isWriteProtected: false,
          writableFileHandle: null,
          cloudData: null,
          lastAppleWriteTime: -1,
          lastLocalFileWriteTime: -1,
        }))
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

    return { buffer, name: getCleanDiskFilename(name), allDisks }
  } catch (err) {
    console.error("fetchDiskBufferAndNameFromURL error:", err)
    debug?.(`Error processing disk buffer from ${url}: ${err}`)
    return null
  }
}

const setDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void,
  debug?: (message: string) => void, preserveDriveIndex = false, confirmed = false,
  noReset = false, noBoot = false): Promise<boolean> => {
  const parsed = separateUrlAndComment(url)
  url = parsed.url
  const comment = parsed.comment
  const requestedIndex = index
  const installDisk = (
    installIndex: number,
    buffer: ArrayBuffer,
    filename: string,
    installCloudData: CloudData | null,
    writableFileHandle: WritableFileHandle | null,
    helpFile?: string,
    preserveInstallIndex = false,
  ) => {
    if (confirmed) {
      return requestMountDiskFromBuffer(
        requestedIndex,
        buffer,
        filename,
        installCloudData,
        writableFileHandle,
        helpFile,
        true,
      )
    }
    return Promise.resolve(handleSetDiskOrFileFromBuffer(
      installIndex,
      buffer,
      filename,
      installCloudData,
      writableFileHandle,
      helpFile,
      preserveInstallIndex,
      confirmed,
      noReset,
      noBoot,
    ))
  }
  debug?.(`handleSetDiskFromURL(${url}) drive=${index}`)
  let helpFile = findCatalogHelpFile(url)
  let name = ""
  let buffer: ArrayBuffer | undefined
  // Check if it's a local file (not http/https URL and not Internet Archive)
  const isLocalFile = !url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith(internetArchiveUrlProtocol)
  
  if (isLocalFile) {
    if (url.startsWith("file://") || url.startsWith("/") || /^[A-Za-z]:/.test(url)) {
      try {
        // Fetch for browser (may fail for local files due to CORS)
        const state = getDiskImageFromLocalStorage()
        if (state) {
          if (!preserveDriveIndex && !noReset) resetAllDiskDrives()
          const installed = await installDisk(state.index, state.data.buffer, url, null, null, helpFile)
          if (typeof installed === "number") index = installed
        } else {
          const response = await fetch(url)
          const localBuffer = await response.arrayBuffer()
          const fileName = url.split("/").pop() || url        
          if (!preserveDriveIndex && !noReset) resetAllDiskDrives()
          const installed = await installDisk(
            index,
            localBuffer,
            fileName,
            cloudData || null,
            null,
            helpFile,
            preserveDriveIndex,
          )
          if (typeof installed === "number") index = installed
          setDiskImageToLocalStorage(index, new Uint8Array(localBuffer))
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
    const matchUrl = getPrimaryDiskUrl(match)
    if ( !matchUrl ) {
      return false
    }
    url = matchUrl
    helpFile ??= match.helpFile
    if (!URL.canParse(url) && updateDisplay) {
      return await handleSetDiskFromFile(url, updateDisplay, index, undefined, undefined, preserveDriveIndex, noReset, noBoot)
    }
  }

  // Resolve DemoZoo production URL, if necessary
  if (url.includes("demozoo.org/productions/") && !/\.(zip|dsk|po|woz|2mg|img)$/i.test(url)) {
    const match = url.match(/productions\/(\d+)/)
    if (match) {
      const prodDisks = await resolveDemoZooProductionDisks(match[1])
      if (prodDisks.length > 1 && !callback) {
        return handleSetDiskSwapperFromURLs(
          prodDisks,
          updateDisplay,
          index < 0 ? 0 : index,
          preserveDriveIndex,
          noReset,
          noBoot,
          cloudData,
        )
      }
      if (prodDisks[0]) {
        url = prodDisks[0]
      }
    }
  }
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const [resolvedUrl, fileSize, allUrls] = await getDiskImageUrlFromIdentifier(identifier)

    if (resolvedUrl) {
      if (allUrls && allUrls.length > 1 && !callback) {
        return handleSetDiskSwapperFromURLs(
          allUrls.map(u => u.toString()),
          updateDisplay,
          index < 0 ? 2 : index,
          preserveDriveIndex,
          noReset,
          noBoot,
        )
      }

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

  try {
    if (!callback) {
      showGlobalProgressModal(true, "Downloading disk")
    }

  const fetched = await fetchDiskBufferAndNameFromURL(url, debug)
  if (!fetched) {
    if (!callback) {
      showGlobalProgressModal(false)
    }
    if (callback) {
      callback(null)
    }
    return false
  }

  name = fetched.name
  buffer = fetched.buffer

    if (buffer) {
      if (callback) {
        callback(buffer)
      } else {
        if (!preserveDriveIndex && !noReset) {
          // If we are loading from a URL, reset all drives. Fixes issue#186
          resetAllDiskDrives()
        }
        
        const installed = await installDisk(
          index,
          buffer,
          name,
          cloudData || null,
          null,
          helpFile,
          preserveDriveIndex,
        )
        if (typeof installed === "number") index = installed
        if (fetched.allDisks && fetched.allDisks.length > 1) {
          if (cloudData && fetched.allDisks[0]) {
            fetched.allDisks[0].cloudData = cloudData
          }
          setStandbyDisks(index, fetched.allDisks, 0)
          updateDisplay?.()
          passSetDriveProps(driveProps[index])
        } else if (comment) {
          const currentStandby = getStandbyDisks(index)
          if (currentStandby[0]) {
            currentStandby[0].comment = comment
          }
          updateDisplay?.()
        }
        // Loading a disk from a remote URL must boot it even when the
        // emulator was already paused or had previously run a program.
        if (!preserveDriveIndex && !noBoot) passSetRunMode(RUN_MODE.NEED_BOOT)
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
  debug?: (message: string) => void, preserveDriveIndex = false, confirmed = false,
  noReset = false, noBoot = false): Promise<boolean> => {
  if (url.startsWith(internetArchiveUrlProtocol)) {
    const identifier = url.substring(internetArchiveUrlProtocol.length)
    const [resolvedUrl, fileSize, allUrls] = await getDiskImageUrlFromIdentifier(identifier)

    if (resolvedUrl) {
      if (allUrls && allUrls.length > 1 && !callback) {
        return handleSetDiskSwapperFromURLs(
          allUrls.map(u => u.toString()),
          updateDisplay,
          index < 0 ? 2 : index,
          preserveDriveIndex,
          noReset,
          noBoot,
        )
      }

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
      console.warn(`Unable to resolve Internet Archive disk image for "${identifier}"`)
      if (callback) {
        callback(null)
      }
      return false
    }
  }

  const swapperUrls = parseDiskSwapperParam(url)
  if (swapperUrls.length > 1) {
    return handleSetDiskSwapperFromURLs(
      swapperUrls,
      updateDisplay,
      index < 0 ? 2 : index,
      preserveDriveIndex,
      noReset,
      noBoot,
    )
  }
  return setDiskFromURL(url, updateDisplay, index, cloudData, callback, debug, preserveDriveIndex, confirmed, noReset, noBoot)
}

export const requestSetDiskFromURL = async (url: string,
  updateDisplay?: UpdateDisplay, index = 0, cloudData?: CloudData, callback?: (buffer: ArrayBuffer | null) => void,
  debug?: (message: string) => void): Promise<number | false> => {
  const mounted = await setDiskFromURL(url, updateDisplay, index, cloudData, callback, debug, true, true)
  return mounted ? index : false
}

export const handleSetDiskSwapperFromURLs = async (
  urls: string[],
  updateDisplay?: UpdateDisplay,
  index = 2,
  preserveDriveIndex = true,
  noReset = false,
  noBoot = false,
  cloudData?: CloudData,
): Promise<boolean> => {
  if (urls.length === 0) return false
  const resolvedUrls = resolveDiskSwapperUrls(urls)
  const firstParsed = separateUrlAndComment(resolvedUrls[0])

  const success = await handleSetDiskFromURL(
    firstParsed.url,
    updateDisplay,
    index,
    cloudData,
    undefined,
    undefined,
    preserveDriveIndex,
    false,
    noReset,
    noBoot,
  )
  if (!success) return false

  const activeDisk: StandbyDisk = {
    filename: getCleanDiskFilename(driveProps[index].filename),
    diskData: driveProps[index].diskData,
    diskHasChanges: driveProps[index].diskHasChanges,
    isWriteProtected: driveProps[index].isWriteProtected,
    writableFileHandle: driveProps[index].writableFileHandle,
    cloudData: driveProps[index].cloudData,
    lastAppleWriteTime: driveProps[index].lastAppleWriteTime,
    lastLocalFileWriteTime: driveProps[index].lastLocalFileWriteTime,
    comment: firstParsed.comment,
  }

  const allDisks: StandbyDisk[] = [activeDisk]

  for (let i = 1; i < resolvedUrls.length; i++) {
    const { url: rawUrl, comment } = separateUrlAndComment(resolvedUrls[i])
    let resolvedUrl = rawUrl
    const isLocalFile = !rawUrl.startsWith("http://") && !rawUrl.startsWith("https://") && !rawUrl.startsWith(internetArchiveUrlProtocol)
    if (isLocalFile && !rawUrl.startsWith("/") && !rawUrl.startsWith("file://")) {
      const match = findMatchingDiskImage(rawUrl)
      const matchUrl = getPrimaryDiskUrl(match)
      if (matchUrl) {
        resolvedUrl = matchUrl
      }
      if (!URL.canParse(resolvedUrl) && !resolvedUrl.startsWith("/")) {
        resolvedUrl = "disks/" + resolvedUrl
      }
    }
    const fetched = await fetchDiskBufferAndNameFromURL(resolvedUrl)
    if (fetched) {
      allDisks.push({
        filename: getCleanDiskFilename(fetched.name),
        diskData: new Uint8Array(fetched.buffer),
        diskHasChanges: false,
        isWriteProtected: false,
        writableFileHandle: null,
        cloudData: null,
        lastAppleWriteTime: -1,
        lastLocalFileWriteTime: -1,
        comment,
      })
    }
  }

  setStandbyDisks(index, allDisks, 0)
  updateDisplay?.()
  return true
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

export const resetAllDiskDrives = () => {
  for (let i=0; i < MAX_DRIVES; i++) {
    setDiskData(i, new Uint8Array(), "", null, null, -1)
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
  preserveDriveIndex = false,
  noReset = false,
  noBoot = false): Promise<boolean> => {
  clearDialogMessageContext()
  const configuredHelpFile = findCatalogHelpFile(disk)
  let data: ArrayBuffer
  try {
    const res = await fetch("disks/" + disk)
    if (!res.ok) {
      if (callback) {
        callback(null)
      }
      return false
    }
    data = await res.arrayBuffer()
    const unzipped = await decompressSingleFile(data, disk, [".dsk", ".woz", ".do", ".po", ".2mg", ".hdv", ".2meg", ".img", ".nib", ".bin", ".bas", ".a"])
    if (unzipped) {
      disk = unzipped.filename
      data = unzipped.buffer
    }
  } catch {
    if (callback) {
      callback(null)
    } else {
      // $TODO: Add error handling
    }
    return false
  }

  if (callback) {
    callback(data)
    return true
  } else {
    const defaultDriveIndex = getDefaultDiskDriveIndex(disk, data.byteLength)
    if (driveIndex < 0) {
      driveIndex = defaultDriveIndex
    }
    let needsBoot = !noBoot && (preserveDriveIndex
      ? (driveIndex === 0 || driveIndex === 2)
      : handleGetRunMode() === RUN_MODE.IDLE)
    
    if (!noReset && driveIndex < 0) {
      needsBoot = true
    }
    
    if (!noReset && needsBoot) {
      if (preserveDriveIndex) passSetRunMode(RUN_MODE.IDLE)
      resetAllDiskDrives()
      if (!preserveDriveIndex) {
        driveIndex = defaultDriveIndex
      }
    }

    setDiskData(
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

    if (!noBoot && needsBoot) {
      setTimeout(() => {
        if (!hasDialogMessageContext()) {
          passSetRunMode(RUN_MODE.NEED_BOOT)
        }}, 10)
    }
    onLoadSuccess?.()
    return true
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
      if (dprops.diskData?.length > 0) {
        updateWozCrc(dprops.diskData)
      }
      console.log(`🔨 Creating blob from disk data: ${dprops.filename}, ${dprops.diskData.length} bytes`)
      const blob = getDiskBlobForSync(dprops.diskData, dprops.filename, dprops.hardDrive)
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
