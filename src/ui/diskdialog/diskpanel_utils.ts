import { ImportedDiskFile, loadWozAndExtractProDosFiles, loadWozAndExtractDosImage, classifyImageKind, stripTwoImgHeader, ensureDosVolumeHasHelloGreeting, PRODOS_FILE_TYPE_TEXT, PRODOS_FILE_TYPE_DOS_MASTER, MenuDiskEntry, buildProDosHdv, VTOC_REFRESH } from "../../common/prodos_hdv"
import { RUN_MODE } from "../../common/utility"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { diskImages } from "../devices/disk/diskimages"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"
import { handleInputParams } from "../inputparams"
import { DiskCollectionSortMode, getPreferenceVtocType } from "../localstorage"
import { passSetRunMode, captureBootZeroPage } from "../main2worker"
import { showGlobalProgressModal } from "../ui_utilities"
import { loadAndConvertImageToHires } from "./screenshot_utils"

export enum DISK_COLLECTION_ITEM_TYPE {
  A2TS_ARCHIVE,
  INTERNET_ARCHIVE,
  NEW_RELEASE,
  CLOUD_DRIVE
}

export enum TAB_INDEX {
  BUILT_IN = 0,
  NEW_RELEASES = 1,
  FAVORITES = 2,
  EXPORT = 3,
}

const getLastUpdatedMs = (item: DiskCollectionItem): number => {
  if (!item.lastUpdated) return 0
  const date = item.lastUpdated instanceof Date ? item.lastUpdated : new Date(item.lastUpdated)
  const value = date.getTime()
  return Number.isFinite(value) ? value : 0
}

const compareByNameAsc = (a: DiskCollectionItem, b: DiskCollectionItem): number => {
  const byName = a.title.localeCompare(b.title)
  if (byName !== 0) return byName
  return getLastUpdatedMs(b) - getLastUpdatedMs(a)
}

export const sortDisks = (disks: DiskCollectionItem[], mode: DiskCollectionSortMode): DiskCollectionItem[] => {
  const sorted = [...disks]
  sorted.sort((a, b) => {
    switch (mode) {
      case "name-desc": {
        const byName = b.title.localeCompare(a.title)
        if (byName !== 0) return byName
        return getLastUpdatedMs(b) - getLastUpdatedMs(a)
      }
      case "date-newest": {
        const byDate = getLastUpdatedMs(b) - getLastUpdatedMs(a)
        if (byDate !== 0) return byDate
        return compareByNameAsc(a, b)
      }
      case "date-oldest": {
        const byDate = getLastUpdatedMs(a) - getLastUpdatedMs(b)
        if (byDate !== 0) return byDate
        return compareByNameAsc(a, b)
      }
      case "name-asc":
      default:
        return compareByNameAsc(a, b)
    }
  })
  return sorted
}

// Recover the known byte size of a disk by matching its URL against the built-in
// catalogs. Favorited disks are rebuilt from bookmarks that don't store a size,
// so without this a favorited large disk (e.g. Total Replay) would report an
// unknown size (-1) and slip past the export size limit.
export const getKnownFileSizeForUrl = (newReleases: DiskCollectionItem[],
  diskUrl?: string): number | undefined => {
  if (!diskUrl) return undefined
  const match = [...diskImages, ...newReleases].find(d => d.diskUrl?.toString() === diskUrl)
  return match?.fileSize && match.fileSize > 0 ? match.fileSize : undefined
}

// Assigns a disk's VTOC type without downloading its bytes, when possible:
//  - HDV images are hard-drive volumes that are always ProDOS, so their type is
//    set directly by file extension (no download or decode needed).
//  - Bookmarks persist their own VTOC type in their dbm- entry (the item is built
//    with vtocType: diskBookmark.vtocType), so that stored value is authoritative
//    and nothing further is restored here for them -- unless the stored version
//    predates the current VTOC_REFRESH, in which case the type is cleared so the
//    background VTOC pass re-evaluates it.
//  - Other disks (built-in images, new releases) have no per-disk store, so a VTOC
//    type determined in a previous session is restored from the permanent
//    URL-keyed local-storage cache (version-checked the same way).
// Anything still undefined is resolved later by the background effect, but only
// if the disk is small enough to ever be exported.
const restoreCachedVtocType = (item: DiskCollectionItem) => {
  // If the item already has a vtocType but its version is stale, clear it so
  // the background VTOC pass re-determines it with the latest detection logic.
  if (item.vtocType !== undefined && (item.vtocVersion ?? 0) < VTOC_REFRESH) {
    item.vtocType = undefined
    item.vtocVersion = undefined
  }
  if (item.vtocType !== undefined) return
  const url = item.diskUrl?.toString() || ""
  if (url.toLowerCase().split(/[?#]/)[0].endsWith(".hdv")) {
    item.vtocType = "prodos"
    item.vtocVersion = VTOC_REFRESH
    return
  }
  if (item.bookmarkId) return
  const cached = getPreferenceVtocType(url, VTOC_REFRESH)
  if (cached) {
    item.vtocType = cached.type
    item.vtocVersion = cached.version
  }
}

export const getDiskCollection = (diskBookmarks: DiskBookmarks, newReleases: DiskCollectionItem[]) => {
  const newDiskCollection: DiskCollectionItem[] = []

  // Load built-in disk images
  diskImages.forEach((diskImage) => {
    diskImage.type = DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE
    restoreCachedVtocType(diskImage)
    newDiskCollection.push(diskImage)
  })

  // Load favorites
  for (const diskBookmark of diskBookmarks) {
    const item: DiskCollectionItem = {
      type: diskBookmark.type,
      title: diskBookmark.title,
      lastUpdated: new Date(diskBookmark.lastUpdated),
      diskUrl: diskBookmark.diskUrl ? diskBookmark.diskUrl : "",
      imageUrl: diskBookmark.screenshotUrl?.toString(),
      detailsUrl: diskBookmark.cloudData?.detailsUrl ? diskBookmark.cloudData.detailsUrl : diskBookmark.detailsUrl?.toString(),
      bookmarkId: diskBookmark.id,
      cloudData: diskBookmark.cloudData,
      fileSize: diskBookmark.cloudData?.fileSize || getKnownFileSizeForUrl(newReleases, diskBookmark.diskUrl?.toString()) || -1,
      vtocType: diskBookmark.vtocType,
      vtocVersion: diskBookmark.vtocVersion
    }
    restoreCachedVtocType(item)
    newDiskCollection.push(item)
  }

  // Load new releases
  newReleases.forEach((newRelease) => {
    newRelease.type = DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE
    // Reuse the previously determined VTOC type (or HDV assumption) so we don't
    // re-download the disk's bytes just to redetermine an unchanging value.
    restoreCachedVtocType(newRelease)
    newDiskCollection.push(newRelease)
  })
  return newDiskCollection
}

export const loadDisk = (
  driveIndex: number,
  diskCollectionItem: DiskCollectionItem | undefined,
  updateDisplay: UpdateDisplay,
  callback?: (buffer: ArrayBuffer | null) => void) => {
  // Only force idle when actually loading into a drive. Background fetches for
  // export/VTOC pass a callback (and often driveIndex -1) and must not disrupt
  // the currently running program/canvas state.
  if (!callback && driveIndex >= 0) {
    passSetRunMode(RUN_MODE.IDLE)
  }

  if (diskCollectionItem) {
    if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
      handleSetDiskFromCloudData(diskCollectionItem.cloudData, driveIndex, callback)
    } else if (diskCollectionItem.diskUrl && !diskCollectionItem.diskUrl.includes("://")) {
      handleSetDiskFromFile(diskCollectionItem.diskUrl, updateDisplay, driveIndex, callback)
    } else {
      handleSetDiskFromURL(diskCollectionItem.diskUrl || "", undefined, driveIndex, diskCollectionItem.cloudData, callback)
    }
    if (diskCollectionItem.params && !callback) {
      handleInputParams(diskCollectionItem.params)
    }
  }
}

export const getExportFilename = (diskCollectionItem: DiskCollectionItem, buffer: Uint8Array) => {
  const fromCloud = diskCollectionItem.cloudData?.fileName?.trim()
  if (fromCloud) {
    return fromCloud
  }

  const rawName = diskCollectionItem.diskUrl.split("/").pop() || diskCollectionItem.title || "disk"
  const decodedName = decodeURIComponent(rawName)
  if (decodedName.includes(".")) {
    return decodedName
  }

  const normalizedTitle = diskCollectionItem.title.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "disk"
  return `${normalizedTitle}.${buffer.byteLength <= 143360 ? "dsk" : "po"}`
}

const maxHdvBytes = 33554432

export const isDiskExportable = (disk: DiskCollectionItem) => {
  // A disk explicitly flagged exportDisabled is never exportable (e.g. whole-volume
  // desktop OS boot disks that assume they own the boot volume root and can't run from
  // an imported subdirectory). A disk whose VTOC has been determined to be neither DOS
  // nor ProDOS ("other"), or a DOS 3.3 disk whose greeting installs a language-card DOS
  // relocator ("dosup", which is incompatible with DOS.MASTER), cannot be exported. An
  // undetermined (undefined) vtocType is treated as potentially exportable until
  // background determination resolves it.
  return !disk.exportDisabled && disk.fileSize < maxHdvBytes * 0.95 && disk.vtocType !== "other" && disk.vtocType !== "dosup"
}

export const downloadExportHdv = (data: Uint8Array, filename: string) => {
  const arrayBuffer = new ArrayBuffer(data.byteLength)
  new Uint8Array(arrayBuffer).set(data)
  const blob = new Blob([arrayBuffer], { type: "application/octet-stream" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Stable identity for a disk across re-renders (bookmark id, cloud item id,
// disk URL, or finally the title).
export const diskItemKey = (item: DiskCollectionItem): string =>
  item.bookmarkId || item.cloudData?.itemId || item.diskUrl?.toString() || item.title

// Determine the export badge state and tooltip for a disk. Exportable disks show
// a green badge; disks that cannot be exported show an orange badge explaining
// why; disks whose VTOC hasn't been determined yet show a yellow "pending" badge.
export const getExportBadgeInfo = (disk: DiskCollectionItem): { state: "exportable" | "blocked" | "pending"; title: string } => {
  if (disk.exportDisabled) {
    return { state: "blocked", title: "Export is not currently supported for this disk" }
  }
  if (disk.fileSize >= maxHdvBytes * 0.95) {
    return { state: "blocked", title: "Disk is too large to be exported" }
  }
  if (disk.vtocType === "other") {
    return { state: "blocked", title: "Disk is not exportable due to copy protection" }
  }
  if (disk.vtocType === "dosup") {
    return { state: "blocked", title: "Disk is not exportable due to DOS Master incompatibility" }
  }
  if (disk.vtocType === undefined) {
    return { state: "pending", title: "Disk export status pending" }
  }
  return { state: "exportable", title: "Disk can be exported" }
}

export const createHdv = async (orderedDownloadedDisks: DownloadedExportDisk[]) => {

  showGlobalProgressModal(true, "Creating HDV image")
  try {
    const wozExtractedByIndex = new Map<number, ImportedDiskFile[]>()
    // WOZ DOS disks decoded to a flat DOS 3.3 (.dsk) sector image, keyed by disk index.
    // DOS.MASTER runtime volumes must be plain DOS-order sector images, but classifyImageKind
    // (unlike determineVtocType used for export eligibility) does not decode the WOZ
    // bitstream, so decode it here to keep detection and writing consistent.
    const wozDosImageByIndex = new Map<number, Uint8Array>()
    for (let i = 0; i < orderedDownloadedDisks.length; i++) {
      const disk = orderedDownloadedDisks[i]
      if (!disk.filename.toLowerCase().endsWith(".woz")) continue
      const extracted = loadWozAndExtractProDosFiles(disk.buffer)
      if (extracted.length > 0) {
        wozExtractedByIndex.set(i, extracted)
        continue
      }
      const dosImage = loadWozAndExtractDosImage(disk.buffer)
      if (dosImage) {
        wozDosImageByIndex.set(i, dosImage)
      }
    }

    const fileKinds: Array<"dos" | "prodos" | "unknown" | "replay"> = orderedDownloadedDisks.map((downloadedDisk) =>
      classifyImageKind(downloadedDisk.filename, downloadedDisk.buffer)
    )

    for (const [index] of wozExtractedByIndex) {
      fileKinds[index] = "prodos"
    }

    for (const [index] of wozDosImageByIndex) {
      fileKinds[index] = "dos"
    }

    // Override fileKinds for disks whose VTOC type was determined to be "replay"
    // (DOS 3.3 binaries that overlap DOS memory and must be block-loaded directly).
    for (let i = 0; i < orderedDownloadedDisks.length; i++) {
      if (orderedDownloadedDisks[i].item.vtocType === "replay") {
        fileKinds[i] = "replay"
      }
    }

    const fileEntries = orderedDownloadedDisks.map((downloadedDisk, index) => {
      const fileKind = fileKinds[index]
      const isText = downloadedDisk.filename.toUpperCase().endsWith(".TXT")
      // Prefer the decoded DOS-order sector image for WOZ DOS disks so the runtime
      // volume is a plain .dsk that DOS.MASTER can read; otherwise use the raw buffer.
      // Strip any 2IMG (.2mg) 64-byte header so the ProDOS/DOS block image parses from
      // block 0 (otherwise extraction finds no files and the disk only shows
      // "PRODOS FILES IMPORTED"/CATALOG instead of launching).
      const wozDosImage = wozDosImageByIndex.get(index)
      let data = wozDosImage ?? stripTwoImgHeader(downloadedDisk.buffer)
      if (fileKind === "dos" && !isText) {
        // DOS.MASTER always runs a greeting named HELLO on the selected volume; ensure
        // one exists (chaining to the source disk's real greeting) so booting a volume
        // whose greeting was not named HELLO does not fail with FILE NOT FOUND.
        const greeting = ensureDosVolumeHasHelloGreeting(data)
        data = greeting.image
        if (greeting.action === "injected") {
          console.log(`[HDV Export] Injected HELLO greeting into ${downloadedDisk.filename}: ${greeting.command}`)
        }
      }
      return {
        name: downloadedDisk.filename.split(".")[0].slice(0, 15),
        type: isText
          ? PRODOS_FILE_TYPE_TEXT
          : (fileKind === "dos" ? PRODOS_FILE_TYPE_DOS_MASTER : 0xE0),
        data,
        auxType: 0x0000,
      }
    })

    // Convert each disk's preview screenshot to Apple II hi-res, stamping the
    // Apple2TS logo into the corner. Conversion is deterministic; the source image is
    // fetched through a localStorage cache (see resolveScreenshotUrlWithCache) so each
    // screenshot only hits the network/app assets once across exports.
    const screenshots: Array<{ name: string; data: Uint8Array | null }> = []
    for (let index = 0; index < orderedDownloadedDisks.length; index++) {
      const disk = orderedDownloadedDisks[index]
      const screenshotData = await loadAndConvertImageToHires(disk.item.imageUrl, true, index + 1)
      screenshots.push({
        name: disk.filename.split(".")[0].slice(0, 15),
        data: screenshotData,
      })
    }

    // Create menu metadata with screenshot references
    const menuEntries: MenuDiskEntry[] = orderedDownloadedDisks.map((disk, index) => ({
      filename: disk.filename.split(".")[0].slice(0, 15),
      sourceFilename: disk.filename,
      displayName: disk.item.title,
      screenshotData: screenshots[index].data || undefined,
      imageKind: fileKinds[index],
      wozExtractedProDosFiles: wozExtractedByIndex.get(index),
    }))

    // Zero-page capture callback: for replay disks, boot the original
    // floppy in the emulator at ludicrous speed to capture the zero page
    // state at the game's entry point.  This ensures the HDV boot replicates
    // the exact zero page environment the game expects from its floppy loader.
    const zpCaptureCallback = async (menuIndex: number, entryAddress: number, captureMemory?: boolean): Promise<CaptureBootResult | null> => {
      const disk = orderedDownloadedDisks[menuIndex]
      if (!disk) return null
      console.log(`[HDV Export] Capturing ZP${captureMemory ? ' + memory' : ''} for "${disk.filename}" at entry $${entryAddress.toString(16).toUpperCase()}...`)
      const result = await captureBootZeroPage({
        diskImage: disk.buffer,
        filename: disk.filename,
        entryAddress,
        timeoutMs: 15000,
        captureMemory,
      })
      if (result) {
        console.log(`[HDV Export] ZP capture succeeded for "${disk.filename}"${result.memoryDump ? ` (memory dump: ${result.memoryDump.length} bytes)` : ''}`)
      } else {
        console.warn(`[HDV Export] ZP capture timed out for "${disk.filename}"`)
      }
      return result
    }

    const hdvData = await buildProDosHdv(fileEntries, "APPLE2TS", undefined, menuEntries, undefined, zpCaptureCallback)
    downloadExportHdv(hdvData, "APPLE2TS.HDV")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    alert(`Failed to build ProDOS HDV: ${message}`)
  } finally {
    showGlobalProgressModal(false)
  }
}
