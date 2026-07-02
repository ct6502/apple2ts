import { useEffect, useLayoutEffect, useRef, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faCommentDots, faCheckCircle, faClock, faCloud, faDownload, faFloppyDisk, faHardDrive, faStar } from "@fortawesome/free-solid-svg-icons"
import { RUN_MODE } from "../../common/utility"
import { buildProDosHdv, ImportedDiskFile, loadWozAndExtractProDosFiles, loadWozAndExtractDosImage, ensureDosVolumeHasHelloGreeting, PRODOS_FILE_TYPE_DOS_MASTER, PRODOS_FILE_TYPE_TEXT, MenuDiskEntry, classifyImageKind, determineVtocType } from "../../common/prodos_hdv"
import { loadAndConvertImageToHires } from "./screenshot_utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { svgInternetArchiveLogo } from "../img/icon_internetarchive"
import PopupMenu from "../controls/popupmenu"
import { DISK_DRIVE_LABELS } from "../devices/disk/diskdrive"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"
import { diskImages } from "../devices/disk/diskimages"
import { newReleases } from "../devices/disk/newreleases"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { addSessionVtocFailure, getPreferenceNewReleasesChecked, getPreferenceVtocType, hasSessionVtocFailure, setPreferenceNewReleasesChecked, setPreferenceVtocType } from "../localstorage"
import { isMinimalTheme } from "../ui_settings"
import { handleInputParams } from "../inputparams"
import { faCircle } from "@fortawesome/free-regular-svg-icons"
import { getDiskImageUrlFromIdentifier } from "../devices/disk/internetarchive_utils"
import { showGlobalProgressModal } from "../ui_utilities"
import { passSetRunMode } from "../main2worker"

export enum DISK_COLLECTION_ITEM_TYPE {
  A2TS_ARCHIVE,
  INTERNET_ARCHIVE,
  NEW_RELEASE,
  CLOUD_DRIVE
}

const maxHdvBytes = 33554432

const minDate = new Date(0)
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "numeric",
  day: "numeric"
})

type DownloadedExportDisk = {
  item: DiskCollectionItem,
  buffer: Uint8Array,
  filename: string,
}

const getExportFilename = (diskCollectionItem: DiskCollectionItem, buffer: Uint8Array) => {
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

const downloadExportHdv = (data: Uint8Array, filename: string) => {
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

const sortByLastUpdatedAsc = (a: DiskCollectionItem, b: DiskCollectionItem): number => {
  if (a.lastUpdated && b.lastUpdated) {
    const aTime = a.lastUpdated
    const bTime = b.lastUpdated
    if (aTime > bTime) return -1
    if (aTime < bTime) return 1
  }

  if (a.title && b.title) {
    return a.title.localeCompare(b.title)
  }

  return 0
}

type DiskCollectionPanelProps = DisplayProps & {
  onDismissDialog?: () => void
}

// Renders a disk title that automatically shrinks its font size so the text
// fits within the fixed-size title box instead of being clipped.
const DiskItemTitle = (props: {
  text: string,
  className: string,
  title: string,
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      // Start from the CSS-defined size and only shrink if it overflows.
      el.style.fontSize = ""
      const maxSize = parseFloat(window.getComputedStyle(el).fontSize)
      const minSize = 6
      let size = maxSize
      while (size > minSize && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) {
        size -= 0.5
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [props.text])

  return (
    <div ref={ref} className={props.className} title={props.title} onClick={props.onClick}>{props.text}</div>
  )
}

const DiskCollectionPanel = (props: DiskCollectionPanelProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const [diskCollection, setDiskCollection] = useState<DiskCollectionItem[]>([])
  const [diskBookmarks, setDiskBookmarks] = useState<DiskBookmarks>(new DiskBookmarks)
  const [drivePopupLocation, setDrivePopupLocation] = useState<[number, number]>()
  const [selectPopupLocation, setSelectPopupLocation] = useState<[number, number]>()
  const [popupItem, setPopupItem] = useState<DiskCollectionItem>()
  const [activeTab, setActiveTab] = useState<number>(0)
  const [hasNewRelease, setHasNewRelease] = useState<boolean>(false)
  const [selectedDisks, setSelectedDisks] = useState<DiskCollectionItem[]>([])
  const [exportQueue, setExportQueue] = useState<DiskCollectionItem[]>([])
  const [downloadedDisks, setDownloadedDisks] = useState<DownloadedExportDisk[]>([])

  // Tracks disk items whose VTOC download has been attempted during this open
  // of the export tab (success or failure), so we don't re-pick the same disk
  // while iterating the queue. Cleared on a fresh open so failures retry.
  const vtocResolveAttempted = useRef<Set<string>>(new Set())
  // Bumped after a failed download so the verification effect advances to the
  // next pending disk. CORS/network failures are retried when the export tab is
  // reopened (a testing-only scenario).
  const [vtocCheckPass, setVtocCheckPass] = useState(0)
  // True while the export tab is open; used to detect a fresh open so that
  // previously-failed (unresolved) disks can be retried.
  const exportTabOpenRef = useRef(false)

  const TAB_INDEX_SELECT = 3

  // Stable identity for a disk across re-renders (bookmark id, cloud item id,
  // disk URL, or finally the title).
  const itemKey = (item: DiskCollectionItem): string =>
    item.bookmarkId || item.cloudData?.itemId || item.diskUrl?.toString() || item.title

  if (isMinimalTheme()) {
    import("./diskcollectionpanel.minimal.css")
  }

  const isDiskExportable = (disk: DiskCollectionItem) => {
    // A disk whose VTOC has been determined to be neither DOS nor ProDOS ("other"), or a
    // DOS 3.3 disk whose greeting installs a language-card DOS relocator ("dosup", which
    // is incompatible with DOS.MASTER), cannot be exported. An undetermined (undefined)
    // vtocType is treated as potentially exportable until background determination resolves it.
    return disk.fileSize < maxHdvBytes * 0.95 && disk.vtocType !== "other" && disk.vtocType !== "dosup"
  }

  const tabs = [
    {
      icon: faFloppyDisk,
      label: "Show Apple2TS collection",
      disks: diskCollection.sort(sortByLastUpdatedAsc).filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE),
      isHighlighted: false
    },
    {
      icon: faClock,
      label: "Show new releases",
      disks: diskCollection.sort(sortByLastUpdatedAsc).filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE),
      isHighlighted: hasNewRelease
    },
    {
      icon: faStar,
      label: "Show favorites",
      disks: diskCollection.sort(sortByLastUpdatedAsc).filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE || x.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE),
      isHighlighted: false
    },
    {
      icon: faDownload,
      label: "Export disks to HDV",
      // Show disks whose VTOC is known and exportable. Built-in disks ship with
      // a predefined vtocType and appear immediately; disks without one (e.g.
      // new releases) appear only after their bytes download successfully and
      // their VTOC is determined, so unreachable (CORS-blocked) disks stay
      // hidden. Disks whose VTOC is "other" or too large are excluded.
      disks: diskCollection.sort(sortByLastUpdatedAsc).filter(x => x.vtocType !== undefined && isDiskExportable(x)),
      isHighlighted: false
    }
  ]

  const handleHelpClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    window.open(diskCollectionItem.detailsUrl, "_blank")
    return false
  }

  const loadDisk = (
    driveIndex: number,
    diskCollectionItem: DiskCollectionItem | undefined = popupItem,
    callback?: (buffer: ArrayBuffer | null) => void) => {
    // We want to restart the emulator when loading a disk from our Disk Collection
    passSetRunMode(RUN_MODE.IDLE)

    if (diskCollectionItem) {
      if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
        handleSetDiskFromCloudData(diskCollectionItem.cloudData, driveIndex, callback)
      } else if (diskCollectionItem.diskUrl && !diskCollectionItem.diskUrl.includes("://")) {
        handleSetDiskFromFile(diskCollectionItem.diskUrl, props.updateDisplay, driveIndex, callback)
      } else {
        handleSetDiskFromURL(diskCollectionItem.diskUrl || "", undefined, driveIndex, diskCollectionItem.cloudData, callback)
      }
      if (diskCollectionItem.params && !callback) {
        handleInputParams(diskCollectionItem.params)
      }
    }

    if (!callback) {
      setIsFlyoutOpen(false)
    }
  }

  // Downloads a disk's bytes without disturbing the running emulator. Unlike
  // loadDisk(), this never changes the run mode or loads the disk into a drive;
  // it simply resolves with the raw buffer (or null on failure) via callback.
  const fetchDiskBufferForItem = (diskCollectionItem: DiskCollectionItem): Promise<Uint8Array | null> => {
    showGlobalProgressModal(true, "Fetching disk metadata")
    return new Promise((resolve) => {
      const cb = (buffer: ArrayBuffer | null) => resolve(buffer ? new Uint8Array(buffer) : null)
      if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
        handleSetDiskFromCloudData(diskCollectionItem.cloudData, -1, cb)
      } else if (diskCollectionItem.diskUrl && !diskCollectionItem.diskUrl.includes("://")) {
        handleSetDiskFromFile(diskCollectionItem.diskUrl, props.updateDisplay, -1, cb)
      } else {
        handleSetDiskFromURL(diskCollectionItem.diskUrl || "", undefined, -1, diskCollectionItem.cloudData, cb)
      }
    })
  }

  // Stores a determined VTOC type onto the in-memory collection item and, for
  // bookmarked disks, persists it to local storage so it only needs to be
  // determined once.
  const persistVtocType = (diskCollectionItem: DiskCollectionItem, vtocType: VtocType) => {
    diskCollectionItem.vtocType = vtocType

    if (diskCollectionItem.bookmarkId) {
      const bookmark = diskBookmarks.get(diskCollectionItem.bookmarkId)
      if (bookmark) {
        bookmark.vtocType = vtocType
        diskBookmarks.set(bookmark)
      }
    }

    // A disk's VTOC type never changes, so cache it by URL. This lets
    // non-bookmarked disks (e.g. new releases) avoid re-downloading their bytes
    // to redetermine the VTOC on every visit.
    setPreferenceVtocType(diskCollectionItem.diskUrl.toString(), vtocType)

    // Trigger a re-render so the export filter reflects the new VTOC type.
    setDiskCollection((prev) => [...prev])
  }

  const handleItemRightClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    if (activeTab == TAB_INDEX_SELECT) {
      setSelectPopupLocation([event.clientX, event.clientY])
    } else {
      setPopupItem(diskCollectionItem)
      setDrivePopupLocation([event.clientX, event.clientY])
    }

    event.stopPropagation()
    event.preventDefault()
    return false
  }

  const handleBookmarkClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    if (diskCollectionItem.bookmarkId) {
      diskBookmarks.remove(diskCollectionItem.bookmarkId)
      setDiskBookmarks(new DiskBookmarks())
    }

    event.stopPropagation()
  }

  const prepareSelectedItem = async (diskCollectionItem: DiskCollectionItem) => {
    if (diskCollectionItem.cloudData && (!diskCollectionItem.cloudData.fileSize || diskCollectionItem.cloudData.fileSize <= 0)) {
      let fileSize = 0

      if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE) {
        const [downloadUrl, newFileSize] = await getDiskImageUrlFromIdentifier(diskCollectionItem.cloudData.itemId)

        if (downloadUrl) {
          diskCollectionItem.cloudData.downloadUrl = downloadUrl.toString()
          fileSize = newFileSize
        }
      }
      diskCollectionItem.cloudData.fileSize = fileSize

      if (diskCollectionItem.bookmarkId) {
        const bookmark = diskBookmarks.get(diskCollectionItem.bookmarkId)
        if (bookmark && bookmark.cloudData) {
          bookmark.cloudData.downloadUrl = diskCollectionItem.cloudData.downloadUrl
          bookmark.cloudData.fileSize = fileSize
          diskBookmarks.set(bookmark)
        }
      }
    }

    return diskCollectionItem
  }

  const toggleSelectedItem = async (diskCollectionItem: DiskCollectionItem, selectItem: boolean = false) => {
    if (!isDiskExportable(diskCollectionItem)) {
      return
    }

    if (!selectItem && selectedDisks.includes(diskCollectionItem)) {
      setSelectedDisks(selectedDisks.filter(x => x !== diskCollectionItem))
      return
    }

    await prepareSelectedItem(diskCollectionItem)
    setSelectedDisks((prevSelectedDisks) => {
      if (prevSelectedDisks.includes(diskCollectionItem)) {
        return prevSelectedDisks
      }
      return [...prevSelectedDisks, diskCollectionItem]
    })
  }

  const handleSelectedClick = (diskCollectionItem: DiskCollectionItem) => async (event: React.MouseEvent<HTMLElement>) => {
    toggleSelectedItem(diskCollectionItem)
    event.stopPropagation()
  }

  const handleTabClick = (tabIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    setHasNewRelease(false)
    setPreferenceNewReleasesChecked(Date.now())

    const element = event.target as HTMLElement
    element.classList.remove("dcp-tab-highlighted")
    setActiveTab(tabIndex)

    event.stopPropagation()
  }

  const handleExportClick = () => {
    const newExportQueue = tabs[TAB_INDEX_SELECT].disks.filter((diskCollectionItem) => {
      return selectedDisks.includes(diskCollectionItem) && isDiskExportable(diskCollectionItem)
    })

    // Leave the panel open on the export tab so it stays visible behind the
    // export progress modal; it is closed once the export completes (createHdv's
    // finally block) or is aborted on error (processExportQueue).
    setDownloadedDisks([])
    setExportQueue(newExportQueue)
  }

  const processExportQueue = (buffer?: ArrayBuffer | null) => {
    if (buffer === null) {
      showGlobalProgressModal(false)
      setExportQueue([])
      setDownloadedDisks([])
      setSelectedDisks([])
      setActiveTab(0)
      // Dismiss the disk collection dialog/flyout so the error isn't left
      // hanging over a half-finished export.
      props.onDismissDialog?.()
      setIsFlyoutOpen(false)
      alert("An unexpected error occurred while downloading the disk. Export to HDV has been aborted.")
    } else if (buffer !== undefined) {
      const currentItem = exportQueue[0]
      if (!currentItem) {
        return
      }
      const diskBuffer = new Uint8Array(buffer)
      const filename = getExportFilename(currentItem, diskBuffer)
      setDownloadedDisks((prevDownloadedDisks) => ([
        ...prevDownloadedDisks,
        { item: currentItem, buffer: diskBuffer, filename }
      ]))
      setExportQueue((prevExportQueue) => prevExportQueue.slice(1))
    } else if (exportQueue.length > 0) {
      showGlobalProgressModal(true, `Downloading disk ${selectedDisks.length - exportQueue.length + 1}/${selectedDisks.length}`)
      loadDisk(-1, exportQueue[0], processExportQueue)
    }
  }

  const formatBytes = (bytes: number) => {
    return bytes < 1024 * 1024 ? `${parseFloat((bytes / 1024).toFixed(0))} KB` : `${parseFloat((bytes / (1024 * 1024)).toFixed(2))} MB`
  }

  const estimateHdvSize = () => {
    let estimatedSize = 0

    selectedDisks.forEach((selectedDisk) => {
      if (selectedDisk.cloudData) {
        estimatedSize += selectedDisk.cloudData.fileSize || 0
      } else if (selectedDisk.fileSize >= 0) {
        estimatedSize += selectedDisk.fileSize
      }
    })

    return estimatedSize
  }

  const isExportButtonDisabled = () => {
    const hdvSize = estimateHdvSize()

    return hdvSize <= 0 || hdvSize > maxHdvBytes
  }

  const createHdv = async () => {
    if (downloadedDisks.length === 0) {
      return
    }

    const orderedDownloadedDisks = tabs[TAB_INDEX_SELECT].disks
      .filter((diskCollectionItem) => selectedDisks.includes(diskCollectionItem))
      .map((diskCollectionItem) => downloadedDisks.find((downloadedDisk) => downloadedDisk.item === diskCollectionItem))
      .filter((downloadedDisk): downloadedDisk is DownloadedExportDisk => downloadedDisk !== undefined)

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

      const fileKinds = orderedDownloadedDisks.map((downloadedDisk) =>
        classifyImageKind(downloadedDisk.filename, downloadedDisk.buffer)
      )

      for (const [index] of wozExtractedByIndex) {
        fileKinds[index] = "prodos"
      }

      for (const [index] of wozDosImageByIndex) {
        fileKinds[index] = "dos"
      }

      const fileEntries = orderedDownloadedDisks.map((downloadedDisk, index) => {
        const fileKind = fileKinds[index]
        const isText = downloadedDisk.filename.toUpperCase().endsWith(".TXT")
        // Prefer the decoded DOS-order sector image for WOZ DOS disks so the runtime
        // volume is a plain .dsk that DOS.MASTER can read; otherwise use the raw buffer.
        const wozDosImage = wozDosImageByIndex.get(index)
        let data = wozDosImage ?? downloadedDisk.buffer
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
      // Apple2TS logo into the corner. Conversion is deterministic; the result
      // is computed fresh from the source image each export (no caching).
      const screenshots: Array<{ name: string; data: Uint8Array | null }> = []
      for (const disk of orderedDownloadedDisks) {
        const screenshotData = await loadAndConvertImageToHires(disk.item.imageUrl, true)
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

      const hdvData = await buildProDosHdv(fileEntries, "APPLE2TS", undefined, menuEntries)
      downloadExportHdv(hdvData, `APPLE2TS.HDV`)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      alert(`Failed to build ProDOS HDV: ${message}`)
    } finally {
      showGlobalProgressModal(false)
      setDownloadedDisks([])
      setSelectedDisks([])
      setActiveTab(0)
      setIsFlyoutOpen(false)
      props.onDismissDialog?.()
    }
  }

  useEffect(() => {
    setDiskBookmarks(new DiskBookmarks())
  }, [isFlyoutOpen])

  useEffect(() => {
    const newDiskCollection: DiskCollectionItem[] = []
    const newReleasesChecked = new Date(getPreferenceNewReleasesChecked())

    // Load built-in disk images
    diskImages.forEach((diskImage) => {
      diskImage.type = DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE
      newDiskCollection.push(diskImage)
    })

    // Load favorites
    for (const diskBookmark of diskBookmarks) {
      newDiskCollection.push({
        type: diskBookmark.type,
        title: diskBookmark.title,
        lastUpdated: new Date(diskBookmark.lastUpdated),
        diskUrl: diskBookmark.diskUrl ? diskBookmark.diskUrl : "",
        imageUrl: diskBookmark.screenshotUrl?.toString(),
        detailsUrl: diskBookmark.cloudData?.detailsUrl ? diskBookmark.cloudData.detailsUrl : diskBookmark.detailsUrl?.toString(),
        bookmarkId: diskBookmark.id,
        cloudData: diskBookmark.cloudData,
        fileSize: diskBookmark.cloudData?.fileSize || -1,
        vtocType: diskBookmark.vtocType
      })
    }

    // Load new releases
    newReleases.forEach((newRelease) => {
      newRelease.type = DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE
      // Reuse the previously determined VTOC type from local storage so we don't
      // re-download the disk's bytes just to redetermine an unchanging value.
      if (newRelease.vtocType === undefined) {
        newRelease.vtocType = getPreferenceVtocType(newRelease.diskUrl.toString())
      }
      newDiskCollection.push(newRelease)

      if (newRelease.lastUpdated >= newReleasesChecked) {
        setHasNewRelease(true)
      }
    })

    setDiskCollection(newDiskCollection)
  }, [diskBookmarks])

  useEffect(() => {
    showGlobalProgressModal(false)
    if (exportQueue.length > 0) {
      processExportQueue()
    } else if (downloadedDisks.length > 0) {
      createHdv()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportQueue])

  // Whenever the panel is visible, fill in (and cache) the VTOC type of any disk
  // that doesn't already have one by downloading its bytes. The exportable badge
  // is shown on every tab, so verification must run on every tab for it to be
  // accurate everywhere. Built-in disks ship with a predefined vtocType and are
  // trusted as-is (never re-downloaded); disks without one are resolved here, so
  // a disk that can't be downloaded (e.g. CORS-blocked) never gets a VTOC and is
  // never shown as exportable. Disks are resolved one at a time to avoid a
  // download stampede, and each result is cached in local storage so a given
  // disk is only ever downloaded once. Download failures are remembered for the
  // browser session (sessionStorage) so they aren't re-attempted on reload; they
  // are retried in a new browser session.
  useEffect(() => {
    // The panel content is shown when the flyout is open (minimal theme) or
    // always (classic theme renders it inside a dialog), matching Flyout's own
    // render condition. Gate verification on actual visibility so it runs in
    // both themes, not just when isFlyoutOpen is toggled.
    const panelVisible = isFlyoutOpen || !isMinimalTheme()
    if (!panelVisible) {
      exportTabOpenRef.current = false
      return
    }

    // On a fresh open of the panel, retry any disk whose VTOC is still
    // unresolved. Disks that already resolved keep their cached vtocType and are
    // not re-picked below.
    if (!exportTabOpenRef.current) {
      exportTabOpenRef.current = true
      vtocResolveAttempted.current.clear()
    }

    // Only resolve disks that are visible in the current tab, so we don't
    // background-download disks the user can't see. The Export tab is the
    // superset of all exportable disks, but its rendered list is pre-filtered to
    // already-determined disks; use the full exportable candidate set for it so
    // its not-yet-determined disks still get resolved when it's navigated to.
    const visibleCandidates = activeTab === TAB_INDEX_SELECT
      ? diskCollection.filter(isDiskExportable)
      : tabs[activeTab].disks
    const pending = visibleCandidates.find((item) =>
      item.vtocType === undefined &&
      isDiskExportable(item) &&
      !vtocResolveAttempted.current.has(itemKey(item)) &&
      !hasSessionVtocFailure(item.diskUrl.toString())
    )
    if (!pending) {
      return
    }

    vtocResolveAttempted.current.add(itemKey(pending))
    let cancelled = false

    fetchDiskBufferForItem(pending)
      .then((data) => {
        if (cancelled) {
          return
        }
        if (!data) {
          // Download failed (CORS/network). Remember the failure for this browser
          // session so we don't re-attempt the download on every reload, then
          // advance to the next disk. It will be retried in a new session.
          addSessionVtocFailure(pending.diskUrl.toString())
          setVtocCheckPass((pass) => pass + 1)
          return
        }
        const filename = getExportFilename(pending, data)
        // Cache the determined VTOC (and persist it for bookmarks).
        persistVtocType(pending, determineVtocType(filename, data))
      })
      .catch(() => {
        if (!cancelled) {
          addSessionVtocFailure(pending.diskUrl.toString())
          setVtocCheckPass((pass) => pass + 1)
        }
      })

    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isFlyoutOpen, diskCollection, vtocCheckPass])

  return (
    <Flyout
      icon={faFloppyDisk}
      buttonId="tour-disk-images"
      title="disk collection"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      width={`max( ${isMinimalTheme() ? "55vw" : "75vw"}, 348px )`}
      highlight={hasNewRelease}
      position="bottom-right">
      <div className="flex-row dcp-tab-row"
        onClick={(e) => { if (e.target === e.currentTarget) e.stopPropagation() }}>
        {tabs.map((tab, i) => (
          <div
            key={`tab-${i}`}
            className={`dcp-tab ${i == activeTab ? " dcp-tab-active" : ""} ${tab.isHighlighted ? " dcp-tab-highlighted" : ""}`}
            title={tab.label}
            onClick={handleTabClick(i)}>
            <FontAwesomeIcon icon={tab.icon} size="lg" />
          </div>
        ))}
      </div>
      <div className="disk-collection-panel"
        onClick={(e) => { if (e.target === e.currentTarget) e.stopPropagation() }}>
        {tabs[activeTab].disks.map((diskCollectionItem, index) => {
          const isExportTab = activeTab == TAB_INDEX_SELECT
          const isDisabledForExport = isExportTab && !isDiskExportable(diskCollectionItem)

          return (
            <div
              key={`dcp-${tabs[activeTab].label}-${index}`}
              className={`dcp-item${isDisabledForExport ? " dcp-item-disabled" : ""}`}
              onClick={(e) => {
                if (activeTab == TAB_INDEX_SELECT && !isDisabledForExport) {
                  toggleSelectedItem(diskCollectionItem)
                  e.stopPropagation()
                }
              }}>
              <div className="dcp-item-title-box">
                <DiskItemTitle
                  text={diskCollectionItem.title}
                  className={`dcp-item-title ${diskCollectionItem.detailsUrl ? "dcp-item-title-link" : ""}`}
                  title={diskCollectionItem.detailsUrl ? `Click to show details for "${diskCollectionItem.title}"` : diskCollectionItem.title}
                  onClick={(e) => {
                    if (activeTab != TAB_INDEX_SELECT && diskCollectionItem.detailsUrl) {
                      handleHelpClick(diskCollectionItem)(e as any)
                    }
                  }} />
              </div>
              {diskCollectionItem.lastUpdated > minDate && <div className="dcp-item-updated">{dateFormatter.format(diskCollectionItem.lastUpdated)}</div>}
              <div
                className="dcp-item-image-box"
                title={`Click to load disk "${diskCollectionItem.title}"`}
                onClick={() => {
                  if (activeTab != TAB_INDEX_SELECT) {
                    loadDisk(-1, diskCollectionItem)
                  }
                }}
                onContextMenu={handleItemRightClick(diskCollectionItem)}
              >
                <img className="dcp-item-image" src={diskCollectionItem.imageUrl} />
              </div>
              <img className="dcp-item-disk" src="assets/floppy.png" />
              {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE &&
                <div className="dcp-item-new" title="Disk is a new release">
                  <FontAwesomeIcon icon={faClock} size="lg" className="dcp-item-new-icon" onClick={(event) => {
                    if (activeTab != TAB_INDEX_SELECT) {
                      event.stopPropagation()
                    }
                  }} />
                  <div className="dcp-item-new-icon-bg">&nbsp;</div>
                </div>}
              {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE &&
                <div className="dcp-item-a2ts" title="Disk is part of the Apple2TS collection">
                  <FontAwesomeIcon icon={faFloppyDisk} size="lg" className="dcp-item-a2ts-icon" onClick={(event) => {
                    if (activeTab != TAB_INDEX_SELECT) {
                      event.stopPropagation()
                    }
                  }} />
                  <div className="dcp-item-a2ts-icon-bg">&nbsp;</div>
                </div>}
              {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE &&
                <div className="dcp-item-ia" title="Disk is part of the Internet Archive">
                  <svg
                    className="dcp-item-ia-icon"
                    onClick={(event) => {
                      if (activeTab != TAB_INDEX_SELECT) {
                        event.stopPropagation()
                      }
                    }}
                    fill="#ffffff"
                    viewBox="0 0 55 55">{svgInternetArchiveLogo}</svg>
                  <div className="dcp-item-ia-icon-bg">&nbsp;</div>
                </div>}
              {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE &&
                <div className="dcp-item-cloud" title={`Disk is synced via ${diskCollectionItem.cloudData?.providerName}`}>
                  <FontAwesomeIcon icon={faCloud} size="lg" className="dcp-item-cloud-icon" onClick={(event) => {
                    if (activeTab != TAB_INDEX_SELECT) {
                      event.stopPropagation()
                    }
                  }} />
                </div>}
              {diskCollectionItem.vtocType !== undefined && isDiskExportable(diskCollectionItem) &&
                <div className="dcp-item-export-badge" title="Disk can be exported to HDV">
                  <FontAwesomeIcon icon={faDownload} size="lg" className="dcp-item-export-badge-icon" onClick={(event) => {
                    if (activeTab != TAB_INDEX_SELECT) {
                      event.stopPropagation()
                    }
                  }} />
                  <div className="dcp-item-export-badge-icon-bg">&nbsp;</div>
                </div>}
              {activeTab == TAB_INDEX_SELECT &&
                <div
                  className="dcp-item-report"
                  title="Report an export issue"
                  onClick={(event) => {
                    event.stopPropagation()
                    const reportUrl = `https://github.com/ct6502/apple2ts/issues/new?assignees=boredsenseless&labels=bug&title=Export+to+HDV+issue:+${encodeURIComponent(diskCollectionItem.title)}`
                    window.open(reportUrl, "_blank", "noopener,noreferrer")
                  }}>
                  <FontAwesomeIcon icon={faCommentDots} size="lg" className="dcp-item-report-icon" />
                  <div className="dcp-item-report-icon-bg">&nbsp;</div>
                </div>}
              {activeTab == 2 && diskCollectionItem.bookmarkId &&
                <div
                  className="dcp-item-bookmark"
                  title="Click to remove from disk collection"
                  onClick={handleBookmarkClick(diskCollectionItem)}>
                  <FontAwesomeIcon icon={faStar} className="dcp-item-bookmark-icon" />
                </div>}
              {activeTab == TAB_INDEX_SELECT && isDiskExportable(diskCollectionItem) &&
                <div
                  className="dcp-item-select"
                  title={`Click to ${selectedDisks.includes(diskCollectionItem) ? "remove to" : "add from"} selected disks`}
                  onClick={isDisabledForExport ? undefined : handleSelectedClick(diskCollectionItem)}
                  onContextMenu={isDisabledForExport ? undefined : handleItemRightClick(diskCollectionItem)}>
                  <FontAwesomeIcon icon={selectedDisks.includes(diskCollectionItem) ? faCheckCircle : faCircle} className="dcp-item-select-icon" />
                  {selectedDisks.includes(diskCollectionItem) && <div className="dcp-item-select-icon-bg">&nbsp;</div>}
                </div>}
            </div>
          )
        })}
      </div>
      <div
        className={`dcp-export-row${activeTab == TAB_INDEX_SELECT ? "" : " dcp-export-row-inactive"}`}
        onClick={(e) => e.stopPropagation()}>
        <div className="dcp-export-size">HDV size: <b><span className={`${estimateHdvSize() > maxHdvBytes ? "dcp-export-size-exceeded" : ""}`}>{formatBytes(estimateHdvSize())}</span> / {formatBytes(maxHdvBytes)}</b></div>
        <button
          className="dcp-export-button"
          disabled={activeTab != TAB_INDEX_SELECT || isExportButtonDisabled()}
          onClick={(e) => {
            e.stopPropagation()
            if (activeTab == TAB_INDEX_SELECT) {
              handleExportClick()
            }
          }}>Export</button>
      </div>
      <PopupMenu
        key="drive-popup"
        location={drivePopupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => { setDrivePopupLocation(undefined) }}
        menuItems={[[
          ...[0, 1].map((i) => (
            {
              label: `Load Disk into Drive ${DISK_DRIVE_LABELS[i]}`,
              icon: faHardDrive,
              isSelected: () => { return false },
              onClick: () => {
                setDrivePopupLocation(undefined)
                loadDisk(i, popupItem)
              }
            }
          )),
          ...[{ label: "-" }],
          ...[2, 3].map((i) => (
            {
              label: `Load Disk into Drive ${DISK_DRIVE_LABELS[i]}`,
              icon: faFloppyDisk,
              isSelected: () => { return false },
              onClick: () => {
                setDrivePopupLocation(undefined)
                loadDisk(i, popupItem)
              }
            }
          ))
        ]]}
      />
      <PopupMenu
        key="select-popup"
        location={selectPopupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => { setSelectPopupLocation(undefined) }}
        menuItems={[[
          {
            label: "Select all disks",
            icon: faCheckCircle,
            onClick: async () => {
              const newSelectedDisks = [...selectedDisks]
              for (const diskCollectionItem of tabs[TAB_INDEX_SELECT].disks) {
                if (isDiskExportable(diskCollectionItem) && !newSelectedDisks.includes(diskCollectionItem)) {
                  await prepareSelectedItem(diskCollectionItem)
                  newSelectedDisks.push(diskCollectionItem)
                }
              }
              setSelectedDisks(newSelectedDisks)
            }
          },
          {
            label: "Unselect all disks",
            icon: faCircle,
            onClick: () => {
              setSelectedDisks([])
            }
          }
        ]]}
      />
    </Flyout >
  )
}

export default DiskCollectionPanel
