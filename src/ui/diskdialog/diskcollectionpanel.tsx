import { useEffect, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faCheckCircle, faClock, faCloud, faDownload, faFloppyDisk, faHardDrive, faStar } from "@fortawesome/free-solid-svg-icons"
import { RUN_MODE } from "../../common/utility"
import { buildProDosHdv, ImportedDiskFile, loadWozAndExtractProDosFiles, PRODOS_FILE_TYPE_DOS_MASTER, PRODOS_FILE_TYPE_TEXT, MenuDiskEntry } from "../../common/prodos_hdv"
import { loadAndConvertImageToHires } from "./screenshot_utils"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { svgInternetArchiveLogo } from "../img/icon_internetarchive"
import PopupMenu from "../controls/popupmenu"
import { DISK_DRIVE_LABELS } from "../devices/disk/diskdrive"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"
import { diskImages } from "../devices/disk/diskimages"
import { newReleases } from "../devices/disk/newreleases"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { getPreferenceNewReleasesChecked, setPreferenceNewReleasesChecked } from "../localstorage"
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

const DOS_ORDER_MAP = [0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15]
const PRODOS_ORDER_MAP = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]

const getSectorOffset = (track: number, sector: number, map: number[]) => {
  if (track < 0 || sector < 0 || sector > 15) return -1
  const mappedSector = map[sector]
  return (track * 16 + mappedSector) * 256
}

const isLikelyDos33Volume = (data: Uint8Array): boolean => {
  // DOS 3.3 5.25" image size (35 tracks x 16 sectors x 256 bytes).
  if (data.length < (35 * 16 * 256)) return false

  const matchesVtoc = (offset: number) => {
    if (offset < 0 || offset + 0x3A >= data.length) return false

    const catTrack = data[offset + 0x01]
    const catSector = data[offset + 0x02]
    const dosRelease = data[offset + 0x03]
    const maxTSPairs = data[offset + 0x27]
    const tracks = data[offset + 0x34]
    const sectorsPerTrack = data[offset + 0x35]
    const bytesPerSectorLo = data[offset + 0x36]
    const bytesPerSectorHi = data[offset + 0x37]
    const allocDirection = data[offset + 0x31]

    return (
      catTrack > 0 && catTrack < 35 &&
      catSector < 16 &&
      (dosRelease === 2 || dosRelease === 3 || dosRelease === 0) &&
      (maxTSPairs === 122 || maxTSPairs === 0) &&
      tracks === 35 &&
      sectorsPerTrack === 16 &&
      bytesPerSectorLo === 0 &&
      bytesPerSectorHi === 1 &&
      (allocDirection === 1 || allocDirection === 255 || allocDirection === 0)
    )
  }

  // VTOC is logical T17,S0; test both on-disk sector orders.
  const dosOrderVtoc = getSectorOffset(17, 0, DOS_ORDER_MAP)
  const prodosOrderVtoc = getSectorOffset(17, 0, PRODOS_ORDER_MAP)

  return matchesVtoc(dosOrderVtoc) || matchesVtoc(prodosOrderVtoc)
}

const isLikelyProDosVolume = (data: Uint8Array): boolean => {
  if (data.length < (3 * 512)) return false

  const totalBlocksFromSize = Math.floor(data.length / 512)
  const root = 2 * 512
  const nextBlock = data[root + 2] | (data[root + 3] << 8)
  const entry0 = root + 4
  const byte0 = data[entry0]
  const storageType = (byte0 >> 4) & 0x0F
  const nameLen = byte0 & 0x0F

  if (storageType !== 0x0F || nameLen < 1 || nameLen > 15) return false
  if (nextBlock !== 0 && (nextBlock < 2 || nextBlock > totalBlocksFromSize)) return false

  for (let i = 0; i < nameLen; i++) {
    const c = data[entry0 + 1 + i]
    // ProDOS volume names are uppercase-ish 7-bit ASCII; reject control/non-ASCII bytes.
    if (c < 0x20 || c > 0x7E) return false
  }

  const bitmapBlock = data[entry0 + 35] | (data[entry0 + 36] << 8)
  const totalBlocks = data[entry0 + 37] | (data[entry0 + 38] << 8)

  if (totalBlocks < totalBlocksFromSize || totalBlocks > 65535) return false
  if (bitmapBlock < 2 || bitmapBlock > totalBlocks) return false

  return true
}

const classifyImageKind = (filename: string, data: Uint8Array): "dos" | "prodos" | "unknown" => {
  const ext = filename.toLowerCase().split(".").pop() || ""
  const size140k = (35 * 16 * 256)

  // WOZ is a container format; determine DOS/ProDOS only after explicit extraction/probing.
  if (ext === "woz") return "unknown"

  // First, positively identify DOS structure (under both sector orders).
  // This is done before ProDOS to avoid false ProDOS positives on DOS .po files.
  if (isLikelyDos33Volume(data)) return "dos"

  // Then, positively identify ProDOS structure.
  if (isLikelyProDosVolume(data)) return "prodos"

  // For 140K floppy images, default to DOS-family handling when ambiguous.
  if (data.length === size140k) {
    return "dos"
  }

  // .po can mean DOS-order or ProDOS-order. For non-140K block images,
  // prefer ProDOS handling when DOS structure probes are negative.
  if (ext === "po" && data.length > size140k && data.length % 512 === 0) {
    return "prodos"
  }

  // Extension fallback when structure probes are inconclusive.
  if (ext === "dsk" || ext === "do" || ext === "nib") {
    return "dos"
  }

  if (ext === "po") {
    return "prodos"
  }
  if (ext === "hdv" || ext === "2mg") {
    return "prodos"
  }

  return "unknown"
}

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

  const TAB_INDEX_SELECT = 3

  if (isMinimalTheme()) {
    import("./diskcollectionpanel.minimal.css")
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
      disks: diskCollection.sort(sortByLastUpdatedAsc).filter(x => !x.diskUrl.toString().endsWith(".hdv") && x.fileSize < maxHdvBytes * 0.95),
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
    const newExportQueue: DiskCollectionItem[] = []

    selectedDisks.forEach((selectedDisk) => {
      newExportQueue.push(selectedDisk)
    })

    setIsFlyoutOpen(false)
    setActiveTab(0)
    setDownloadedDisks([])
    setExportQueue(newExportQueue)
  }

  const processExportQueue = (buffer?: ArrayBuffer | null) => {
    if (buffer === null) {
      showGlobalProgressModal(false)
      setExportQueue([])
      setDownloadedDisks([])
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

    props.onDismissDialog?.()
    if (!isMinimalTheme()) {
      setIsFlyoutOpen(false)
    }
    showGlobalProgressModal(true, "Creating HDV image")
    try {
      const wozExtractedByIndex = new Map<number, ImportedDiskFile[]>()
      for (let i = 0; i < downloadedDisks.length; i++) {
        const disk = downloadedDisks[i]
        if (!disk.filename.toLowerCase().endsWith(".woz")) continue
        const extracted = loadWozAndExtractProDosFiles(disk.buffer)
        if (extracted.length > 0) {
          wozExtractedByIndex.set(i, extracted)
        }
      }

      const fileKinds = downloadedDisks.map((downloadedDisk) =>
        classifyImageKind(downloadedDisk.filename, downloadedDisk.buffer)
      )

      for (const [index] of wozExtractedByIndex) {
        fileKinds[index] = "prodos"
      }

      const fileEntries = downloadedDisks.map((downloadedDisk, index) => {
        const fileKind = fileKinds[index]
        const isText = downloadedDisk.filename.toUpperCase().endsWith(".TXT")
        return {
          name: downloadedDisk.filename.split(".")[0].slice(0, 15),
          type: isText
            ? PRODOS_FILE_TYPE_TEXT
            : (fileKind === "dos" ? PRODOS_FILE_TYPE_DOS_MASTER : 0xE0),
          data: downloadedDisk.buffer,
          auxType: 0x0000,
        }
      })

      // Load screenshots from disk collection items
      const screenshots: Array<{ name: string; data: Uint8Array | null }> = []
      for (const disk of downloadedDisks) {
        const screenshotData = await loadAndConvertImageToHires(disk.item.imageUrl)
        screenshots.push({
          name: disk.filename.split(".")[0].slice(0, 15),
          data: screenshotData,
        })
      }

      // Create menu metadata with screenshot references
      const menuEntries: MenuDiskEntry[] = downloadedDisks.map((disk, index) => ({
        filename: disk.filename.split(".")[0].slice(0, 15),
        sourceFilename: disk.filename,
        displayName: disk.item.title,
        screenshotData: screenshots[index].data || undefined,
        imageKind: fileKinds[index],
        wozExtractedProDosFiles: wozExtractedByIndex.get(index),
      }))

      const hdvData = await buildProDosHdv(fileEntries, "APPLE2TS", undefined, menuEntries)
      downloadExportHdv(hdvData, "apple2ts-export.hdv")
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      alert(`Failed to build ProDOS HDV: ${message}`)
    } finally {
      showGlobalProgressModal(false)
      setDownloadedDisks([])
      setSelectedDisks([])
      setActiveTab(0)
      setIsFlyoutOpen(false)
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
        fileSize: diskBookmark.cloudData?.fileSize || -1
      })
    }

    // Load new releases
    newReleases.forEach((newRelease) => {
      newRelease.type = DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE
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
        {tabs[activeTab].disks.map((diskCollectionItem, index) => (
          <div
            key={`dcp-${tabs[activeTab].label}-${index}`}
            className="dcp-item"
            onClick={(e) => {
              if (activeTab == TAB_INDEX_SELECT) {
                toggleSelectedItem(diskCollectionItem)
                e.stopPropagation()
              }
            }}>
            <div className="dcp-item-title-box">
              <div
                className={`dcp-item-title ${diskCollectionItem.detailsUrl ? "dcp-item-title-link" : ""}`}
                title={diskCollectionItem.detailsUrl ? `Click to show details for "${diskCollectionItem.title}"` : diskCollectionItem.title}
                onClick={(e) => {
                  if (activeTab != TAB_INDEX_SELECT && diskCollectionItem.detailsUrl) {
                    handleHelpClick(diskCollectionItem)(e as any)
                  }
                }}>{diskCollectionItem.title}</div>
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
            {activeTab == 2 && diskCollectionItem.bookmarkId &&
              <div
                className="dcp-item-bookmark"
                title="Click to remove from disk collection"
                onClick={handleBookmarkClick(diskCollectionItem)}>
                <FontAwesomeIcon icon={faStar} className="dcp-item-bookmark-icon" />
              </div>}
            {activeTab == TAB_INDEX_SELECT &&
              <div
                className="dcp-item-select"
                title={`Click to ${selectedDisks.includes(diskCollectionItem) ? "remove to" : "add from"} selected disks`}
                onClick={handleSelectedClick(diskCollectionItem)}
                onContextMenu={handleItemRightClick(diskCollectionItem)}>
                <FontAwesomeIcon icon={selectedDisks.includes(diskCollectionItem) ? faCheckCircle : faCircle} className="dcp-item-select-icon" />
                {selectedDisks.includes(diskCollectionItem) && <div className="dcp-item-select-icon-bg">&nbsp;</div>}
              </div>}
          </div>
        ))}
      </div>
      {activeTab == TAB_INDEX_SELECT &&
        <div className="dcp-export-row" onClick={(e) => e.stopPropagation()}>
          <div className="dcp-export-size">HDV size: <b><span className={`${estimateHdvSize() > maxHdvBytes ? "dcp-export-size-exceeded" : ""}`}>{formatBytes(estimateHdvSize())}</span> / {formatBytes(maxHdvBytes)}</b></div>
          <button className="dcp-export-button" disabled={isExportButtonDisabled()} onClick={(e) => {
            e.stopPropagation()
            handleExportClick()
          }}>Export</button>
        </div>}
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
                if (!newSelectedDisks.includes(diskCollectionItem)) {
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
