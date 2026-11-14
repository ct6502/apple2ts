import { ImportedDiskFile, loadWozAndExtractProDosFiles, loadWozAndExtractDosImage, classifyImageKind, stripTwoImgHeader, ensureDosVolumeHasHelloGreeting, PRODOS_FILE_TYPE_TEXT, PRODOS_FILE_TYPE_DOS_MASTER, MenuDiskEntry, buildProDosHdv, VTOC_REFRESH, determineVtocType, FourCadeExportFailure } from "../../common/prodos_hdv"
import { getDefaultDiskDriveIndex, getPrimaryDiskUrl, parseDiskSwapperParam, resolveDiskSwapperUrls, separateUrlAndComment, RUN_MODE } from "../../common/utility"
import { i18n } from "../../i18n"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { diskImages } from "../devices/disk/diskimages"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL, handleSetDiskSwapperFromURLs, resetAllDiskDrives } from "../devices/disk/driveprops"
import { handleSetVeraSdFromURL } from "../devices/vera/verasdicon"
import { handleInputParams } from "../inputparams"
import { DiskCollectionSortMode, getPreferenceDiskCollectionSort, getPreferenceVtocType } from "../localstorage"
import { passSetRunMode } from "../main2worker"
import { showGlobalProgressModal } from "../ui_utilities"
import { loadAndConvertImageToHires } from "./screenshot_utils"

export enum DISK_COLLECTION_ITEM_TYPE {
  A2TS_ARCHIVE = "builtin",
  INTERNET_ARCHIVE = "internet",
  NEW_RELEASE = "new",
  CLOUD_DRIVE = "cloud",
  DEMOZOO = "demozoo"
}

export enum TAB_INDEX {
  BUILT_IN = 0,
  NEW_RELEASES = 1,
  FAVORITES = 2,
  EXPORT = 3,
}

export const diskCollectionSortOptions: Array<{ value: DiskCollectionSortMode; label: string }> = [
  { value: "name-asc", label: i18n.t("collection.sort.nameAscending") },
  { value: "name-desc", label: i18n.t("collection.sort.nameDescending") },
  { value: "date-newest", label: i18n.t("collection.sort.newest") },
  { value: "date-oldest", label: i18n.t("collection.sort.oldest") },
]

const defaultDiskCollectionSortModeByTab: Record<number, DiskCollectionSortMode> = {
  [TAB_INDEX.BUILT_IN]: "name-asc",
  [TAB_INDEX.NEW_RELEASES]: "date-newest",
  [TAB_INDEX.FAVORITES]: "date-newest",
  [TAB_INDEX.EXPORT]: "name-asc",
}

export const getDefaultDiskCollectionSortMode = (tabIndex: number): DiskCollectionSortMode =>
  defaultDiskCollectionSortModeByTab[tabIndex] || "name-asc"

export const getDiskCollectionSortMode = (tabIndex: number): DiskCollectionSortMode =>
  getPreferenceDiskCollectionSort(tabIndex) || getDefaultDiskCollectionSortMode(tabIndex)

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

export { getPrimaryDiskUrl }

// Recover the known byte size of a disk by matching its URL against the built-in
// catalogs. Favorited disks are rebuilt from bookmarks that don't store a size,
// so without this a favorited large disk (e.g. Total Replay) would report an
// unknown size (-1) and slip past the export size limit.
export const getKnownFileSizeForUrl = (newReleases: DiskCollectionItem[],
  diskUrl?: string): number | undefined => {
  if (!diskUrl) return undefined
  const match = [...diskImages, ...newReleases].find(d => (getPrimaryDiskUrl(d) || d.diskUrl?.toString()) === diskUrl)
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
  const url = getPrimaryDiskUrl(item)
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
    restoreCachedVtocType(diskImage)
    newDiskCollection.push(diskImage)
  })

  // Load favorites
  for (const diskBookmark of diskBookmarks) {
    // DemoZoo bookmarks were originally stored as INTERNET_ARCHIVE before
    // DemoZoo got its own collection type. Detect those old entries so they
    // render with the DemoZoo badge without requiring users to re-favorite them.
    const isDemoZooBookmark = diskBookmark.cloudData?.providerName === "DemoZoo" ||
      diskBookmark.detailsUrl?.toString().includes("demozoo.org/productions/")
    const bookmarkType = isDemoZooBookmark ? DISK_COLLECTION_ITEM_TYPE.DEMOZOO : diskBookmark.type
    const item: DiskCollectionItem = {
      type: bookmarkType,
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
    // Reuse the previously determined VTOC type (or HDV assumption) so we don't
    // re-download the disk's bytes just to redetermine an unchanging value.
    restoreCachedVtocType(newRelease)
    newDiskCollection.push(newRelease)
  })
  return newDiskCollection
}

export interface ResolvedMultiDiskConfig {
  isMultiDisk: boolean
  isSwapper?: boolean
  drives: Array<{ index: number; url: string; swapperUrls?: string[] }>
  veraSdUrl?: string
}

export const getMultiDiskConfigFromItem = (
  item: DiskCollectionItem,
  requestedDriveIndex = -1,
): ResolvedMultiDiskConfig => {
  const driveMap = new Map<number, { url: string; swapperUrls?: string[] }>()
  let veraSdUrl: string | undefined = undefined

  const assignDrive = (index: number, urlOrUrls: string | string[] | undefined) => {
    if (!urlOrUrls || driveMap.has(index)) return
    if (Array.isArray(urlOrUrls)) {
      if (urlOrUrls.length === 0) return
      const resolved = resolveDiskSwapperUrls(urlOrUrls)
      const primary = resolved[0]
      if (primary) {
        const cleanPrimary = separateUrlAndComment(primary).url
        driveMap.set(index, { url: cleanPrimary, swapperUrls: resolved })
      }
    } else if (typeof urlOrUrls === "string" && urlOrUrls.trim().length > 0) {
      const parsed = parseDiskSwapperParam(urlOrUrls)
      if (parsed.length > 1) {
        const cleanPrimary = separateUrlAndComment(parsed[0]).url
        driveMap.set(index, { url: cleanPrimary, swapperUrls: parsed })
      } else {
        const clean = separateUrlAndComment(urlOrUrls).url
        driveMap.set(index, { url: clean })
      }
    }
  }

  const assignVera = (url: string | undefined) => {
    if (url && url.trim().length > 0 && !veraSdUrl) {
      veraSdUrl = url.trim()
    }
  }

  // 1. Process item.disks or item.diskUrl if provided as object or array
  const diskSource = item.disks || item.diskUrl
  if (typeof diskSource === "object" && diskSource) {
    if (Array.isArray(diskSource)) {
      diskSource.forEach((url, idx) => {
        if (typeof url === "string" && url.trim().length > 0) {
          if (idx === 0) {
            const primaryIdx = requestedDriveIndex >= 0
              ? requestedDriveIndex
              : getDefaultDiskDriveIndex(url, item.fileSize || 0)
            assignDrive(primaryIdx, url)
          } else if (idx === 1) {
            const primaryIdx = driveMap.keys().next().value ?? 2
            const secondIdx = primaryIdx === 0 || primaryIdx === 1 ? 1 : 3
            assignDrive(secondIdx, url)
          }
        }
      })
    } else {
      for (const [rawKey, rawVal] of Object.entries(diskSource)) {
        if (!rawVal) continue
        const key = rawKey.toLowerCase()
        if (key === "s7d1" || key === "hd1") assignDrive(0, rawVal)
        else if (key === "s7d2" || key === "hd2") assignDrive(1, rawVal)
        else if (key === "s6d1" || key === "d1") assignDrive(2, rawVal)
        else if (key === "s6d2" || key === "d2") assignDrive(3, rawVal)
        else if (key === "s2d1" || key === "s4d1" || key === "verasd" || key === "sd") {
          if (typeof rawVal === "string") assignVera(rawVal)
          else if (Array.isArray(rawVal) && rawVal[0]) assignVera(rawVal[0])
        }
      }
    }
  }

  // 2. Process item.params (e.g. s6d2=..., s2d1=...)
  if (item.params) {
    try {
      const searchParams = new URLSearchParams(item.params)
      for (const [rawKey, rawVal] of searchParams.entries()) {
        const key = rawKey.toLowerCase()
        const val = rawVal.trim()
        if (!val) continue
        if (key === "s7d1" || key === "hd1") assignDrive(0, val)
        else if (key === "s7d2" || key === "hd2") assignDrive(1, val)
        else if (key === "s6d1" || key === "d1") assignDrive(2, val)
        else if (key === "s6d2" || key === "d2") assignDrive(3, val)
        else if (key === "s2d1" || key === "s4d1" || key === "verasd" || key === "sd") assignVera(val)
      }
    } catch {
      // Ignore URLSearchParams parsing error
    }
  }

  // 3. Fallback to primary disk if not already assigned
  const primaryUrl = getPrimaryDiskUrl(item)
  if (primaryUrl && primaryUrl.trim().length > 0) {
    const primaryIdx = requestedDriveIndex >= 0
      ? requestedDriveIndex
      : getDefaultDiskDriveIndex(primaryUrl, item.fileSize || 0)
    if (!driveMap.has(primaryIdx)) {
      let alreadyPresent = false
      for (const entry of driveMap.values()) {
        if (entry.url === primaryUrl) {
          alreadyPresent = true
          break
        }
      }
      if (!alreadyPresent) {
        assignDrive(primaryIdx, primaryUrl)
      }
    }
  }

  const drives = Array.from(driveMap.entries()).map(([index, info]) => ({
    index,
    url: info.url,
    swapperUrls: info.swapperUrls,
  }))
  drives.sort((a, b) => a.index - b.index)

  const isSwapper = drives.some(d => !!d.swapperUrls && d.swapperUrls.length > 1)
  const isMultiDisk = drives.length > 1 || (drives.length >= 1 && !!veraSdUrl) || isSwapper

  return {
    isMultiDisk,
    isSwapper,
    drives,
    veraSdUrl,
  }
}

export const loadDisk = (
  driveIndex: number,
  diskCollectionItem: DiskCollectionItem | undefined,
  updateDisplay: UpdateDisplay,
  callback?: (buffer: ArrayBuffer | null) => void,
  onLoadSuccess?: () => void,
  preserveDriveIndex = false) => {
  // Only force idle when actually loading into a drive. Background fetches for
  // export/VTOC pass a callback (and often driveIndex -1) and must not disrupt
  // the currently running program/canvas state.
  if (!callback && !preserveDriveIndex) {
    passSetRunMode(RUN_MODE.IDLE)
  }

  if (diskCollectionItem) {
    const primaryUrl = getPrimaryDiskUrl(diskCollectionItem)
    const cloudData = diskCollectionItem.cloudData
      ? { ...diskCollectionItem.cloudData, title: diskCollectionItem.title }
      : undefined

    if (!callback) {
      const multiConfig = getMultiDiskConfigFromItem(diskCollectionItem, driveIndex)
      if (multiConfig.isMultiDisk && (!preserveDriveIndex || driveIndex < 0)) {
        if (!preserveDriveIndex) {
          passSetRunMode(RUN_MODE.IDLE)
        }
        if (diskCollectionItem.params) {
          handleInputParams(diskCollectionItem.params)
        }
        resetAllDiskDrives()

        const promises: Promise<boolean>[] = []
        for (const drive of multiConfig.drives) {
          if (drive.swapperUrls && drive.swapperUrls.length > 1) {
            promises.push(handleSetDiskSwapperFromURLs(
              drive.swapperUrls,
              updateDisplay,
              drive.index,
              true, // preserveDriveIndex
              true, // noReset
              true, // noBoot
            ))
          } else {
            const load = handleSetDiskFromURL(
              drive.url,
              updateDisplay,
              drive.index,
              cloudData,
              undefined,
              undefined,
              true, // preserveDriveIndex
              false,
              true, // noReset
              true, // noBoot
            )
            promises.push(load)
          }
        }

        if (multiConfig.veraSdUrl) {
          promises.push(handleSetVeraSdFromURL(multiConfig.veraSdUrl))
        }

        void Promise.all(promises).then(results => {
          const anyLoaded = results.some(r => r === true)
          if (anyLoaded) {
            passSetRunMode(RUN_MODE.NEED_BOOT)
            onLoadSuccess?.()
          }
        })
        return
      }
    }

    if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
      if (preserveDriveIndex) {
        handleSetDiskFromCloudData(
          cloudData!,
          driveIndex,
          callback,
          onLoadSuccess,
          true,
        )
      } else {
        handleSetDiskFromCloudData(cloudData!, driveIndex, callback, onLoadSuccess)
      }
    } else if (primaryUrl && !primaryUrl.includes("://")) {
      if (preserveDriveIndex) {
        handleSetDiskFromFile(
          primaryUrl,
          updateDisplay,
          driveIndex,
          callback,
          onLoadSuccess,
          true,
        )
      } else {
        handleSetDiskFromFile(
          primaryUrl,
          updateDisplay,
          driveIndex,
          callback,
          onLoadSuccess,
        )
      }
    } else {
      const load = preserveDriveIndex
        ? handleSetDiskFromURL(
          primaryUrl || "",
          undefined,
          driveIndex,
          cloudData,
          callback,
          undefined,
          true,
        )
        : handleSetDiskFromURL(
          primaryUrl || "",
          undefined,
          driveIndex,
          cloudData,
          callback,
        )
      void load.then(loaded => {
        if (loaded && !callback) onLoadSuccess?.()
      })
    }
    if (diskCollectionItem.params && !callback) {
      handleInputParams(diskCollectionItem.params)
    }
  }
}

export const loadDiskIntoDrive = (
  driveIndex: number,
  diskCollectionItem: DiskCollectionItem | undefined,
  updateDisplay: UpdateDisplay,
  onLoadSuccess?: () => void,
) => loadDisk(
  driveIndex,
  diskCollectionItem,
  updateDisplay,
  undefined,
  onLoadSuccess,
  true,
)

export const getExportFilename = (diskCollectionItem: DiskCollectionItem, buffer: Uint8Array) => {
  const fromCloud = diskCollectionItem.cloudData?.fileName?.trim()
  if (fromCloud) {
    return fromCloud
  }

  const primaryUrl = getPrimaryDiskUrl(diskCollectionItem)
  const rawName = primaryUrl.split("/").pop() || diskCollectionItem.title || "disk"
  const decodedName = decodeURIComponent(rawName)
  if (decodedName.includes(".")) {
    return decodedName
  }

  const normalizedTitle = diskCollectionItem.title.replace(/[^A-Za-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "disk"
  return `${normalizedTitle}.${buffer.byteLength <= 143360 ? "dsk" : "po"}`
}

const maxHdvBytes = 33554432

export const formatBytes = (bytes: number) => bytes < 1024 * 1024
  ? `${parseFloat((bytes / 1024).toFixed(0))} KB`
  : `${parseFloat((bytes / (1024 * 1024)).toFixed(1))} MB`

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
  item.bookmarkId || item.cloudData?.itemId || getPrimaryDiskUrl(item) || item.title

// Determine the export badge state and tooltip for a disk. Exportable disks show
// a green badge; disks that cannot be exported show an orange badge explaining
// why; disks whose VTOC hasn't been determined yet show a yellow "pending" badge.
export const getExportBadgeInfo = (disk: DiskCollectionItem): { state: "exportable" | "blocked" | "pending"; title: string } => {
  if (disk.exportDisabled) {
    return { state: "blocked", title: i18n.t("collection.exportUnavailable") }
  }
  if (disk.fileSize >= maxHdvBytes * 0.95) {
    return { state: "blocked", title: i18n.t("collection.exportTooLarge") }
  }
  if (disk.vtocType === "other") {
    return { state: "blocked", title: i18n.t("collection.exportCopyProtected") }
  }
  if (disk.vtocType === "dosup") {
    return { state: "blocked", title: i18n.t("collection.exportDosMasterIncompatible") }
  }
  if (disk.vtocType === undefined) {
    return { state: "pending", title: i18n.t("collection.exportStatusPending") }
  }
  return { state: "exportable", title: i18n.t("collection.exportAvailable") }
}

type PreparedHdvTitle = {
  inputFile: { name: string; type: number; data: Uint8Array; auxType: number }
  menuEntry: MenuDiskEntry
}

export const createHdv = async (orderedDownloadedDisks: DownloadedExportDisk[]) => {

  showGlobalProgressModal(true, i18n.t("collection.creatingHdv"))
  try {
    const omittedFourCadeTitles: FourCadeExportFailure[] = []
    let skipUnavailableTitles = false
    const handleFourCadeExportFailure = (failure: FourCadeExportFailure): boolean => {
      omittedFourCadeTitles.push(failure)
      if (skipUnavailableTitles) return true

      showGlobalProgressModal(false)
      skipUnavailableTitles = window.confirm(
        `${i18n.t("collection.hdvExportTitleUnavailable", {title: failure.title})}\n\n` +
        i18n.t("collection.continueHdvExportWithoutUnavailableTitles"),
      )
      if (skipUnavailableTitles) {
        showGlobalProgressModal(true, i18n.t("collection.creatingHdv"))
      }
      return skipUnavailableTitles
    }

    // Convert each disk's preview screenshot to Apple II hi-res, stamping the
    // Apple2TS logo into the corner. Conversion is deterministic; the source image is
    // fetched through a localStorage cache (see resolveScreenshotUrlWithCache) so each
    // screenshot only hits the network/app assets once across exports.
    const showScreenshotNavigation = orderedDownloadedDisks.length > 1
    const titleInitials = orderedDownloadedDisks
      .map(disk => disk.item.title.trimStart().charAt(0).toUpperCase())
      .filter(initial => /^[A-Z0-9]$/.test(initial))
      .join("")
    const preparedTitles: PreparedHdvTitle[] = []
    for (let index = 0; index < orderedDownloadedDisks.length; index++) {
      const disk = orderedDownloadedDisks[index]
      let imageKind: NonNullable<MenuDiskEntry["imageKind"]> = classifyImageKind(disk.filename, disk.buffer)
      let wozExtractedProDosFiles: ImportedDiskFile[] | undefined
      let wozDosImage: Uint8Array | undefined

      // DOS.MASTER runtime volumes must be plain DOS-order sector images, but
      // classifyImageKind does not decode a WOZ bitstream.
      if (disk.filename.toLowerCase().endsWith(".woz")) {
        const extracted = loadWozAndExtractProDosFiles(disk.buffer)
        if (extracted.length > 0) {
          wozExtractedProDosFiles = extracted
          imageKind = "prodos"
        } else {
          wozDosImage = loadWozAndExtractDosImage(disk.buffer)
          if (wozDosImage) imageKind = "dos"
        }
      }

      // Re-check with the downloaded bytes so stale cached classifications cannot
      // override a real ProDOS volume, while title-matched 4cade disks still use
      // their direct-load path.
      const recheck = determineVtocType(disk.filename, disk.buffer, disk.item.title)
      if (recheck === "prodos") {
        imageKind = "prodos"
      } else if (disk.item.vtocType === "4cade" || recheck === "4cade") {
        imageKind = "4cade"
      }

      const isText = disk.filename.toUpperCase().endsWith(".TXT")
      // Prefer the decoded DOS-order sector image for WOZ DOS disks so the runtime
      // volume is a plain .dsk that DOS.MASTER can read; otherwise use the raw buffer.
      // Strip any 2IMG (.2mg) 64-byte header so the ProDOS/DOS block image parses from
      // block 0 (otherwise extraction finds no files and the disk only shows
      // "PRODOS FILES IMPORTED"/CATALOG instead of launching).
      let data = wozDosImage ?? stripTwoImgHeader(disk.buffer)
      if (imageKind === "dos" && !isText) {
        // DOS.MASTER always runs a greeting named HELLO on the selected volume; ensure
        // one exists (chaining to the source disk's real greeting) so booting a volume
        // whose greeting was not named HELLO does not fail with FILE NOT FOUND.
        data = ensureDosVolumeHasHelloGreeting(data).image
      }

      const screenshotData = await loadAndConvertImageToHires(
        disk.item.imageUrl,
        true,
        index + 1,
        showScreenshotNavigation,
        titleInitials,
        orderedDownloadedDisks.length,
        index + 1,
      )
      const filename = disk.filename.split(".")[0].slice(0, 15)
      preparedTitles.push({
        inputFile: {
          name: filename,
          type: isText
            ? PRODOS_FILE_TYPE_TEXT
            : (imageKind === "dos" ? PRODOS_FILE_TYPE_DOS_MASTER : 0xE0),
          data,
          auxType: 0x0000,
        },
        menuEntry: {
          filename,
          sourceFilename: disk.filename,
          displayName: disk.item.title,
          screenshotData: screenshotData?.plain,
          keyboardScreenshotData: showScreenshotNavigation ? screenshotData?.keyboard : undefined,
          imageKind,
          wozExtractedProDosFiles,
        },
      })
    }

    const hdvData = await buildProDosHdv(
      preparedTitles.map(title => title.inputFile),
      "APPLE2TS",
      undefined,
      preparedTitles.map(title => title.menuEntry),
      undefined,
      handleFourCadeExportFailure,
    )
    downloadExportHdv(hdvData, "APPLE2TS.HDV")
    if (omittedFourCadeTitles.length > 0) {
      showGlobalProgressModal(false)
      const details = omittedFourCadeTitles
        .map(({ title, reason }) => `"${title}": ${reason}`)
        .join("\n")
      alert(i18n.t("collection.hdvCreatedWithOmissions", {details}))
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    alert(i18n.t("collection.hdvCreationFailed", {message}))
  } finally {
    showGlobalProgressModal(false)
  }
}
