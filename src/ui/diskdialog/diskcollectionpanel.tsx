import { ChangeEvent, useEffect, useRef, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faCommentDots, faCheckCircle, faClock, faCloud, faDownload, faFloppyDisk, faHardDrive, faStar } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { svgInternetArchiveLogo } from "../img/icon_internetarchive"
import PopupMenu from "../controls/popupmenu"
import { DISK_DRIVE_LABELS } from "../devices/disk/diskdrive"
import { newReleases } from "../devices/disk/newreleases"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import {
  DiskCollectionSortMode,
  getPreferenceDiskCollectionSort,
  setPreferenceDiskCollectionSort,
  setPreferenceNewReleasesChecked,
} from "../localstorage"
import { isMinimalTheme } from "../ui_settings"
import { faCircle, faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons"
import { getDiskImageUrlFromIdentifier } from "../devices/disk/internetarchive_utils"
import { showGlobalProgressModal } from "../ui_utilities"
import { OneDriveCloudDrive } from "../devices/disk/onedriveclouddrive"
import { GoogleDrive } from "../devices/disk/googledrive"
import { sortDisks, DISK_COLLECTION_ITEM_TYPE, TAB_INDEX, getDiskCollection, getExportFilename, isDiskExportable, getExportBadgeInfo, loadDisk, createHdv } from "./diskpanel_utils"
import { DiskItemTitle } from "./diskitemtitle"
import { DiskPanelVtoc } from "./diskpanel_vtoc"

const maxHdvBytes = 33554432

// Fixed rendered height (px) of one auth notification bar. The disk collection
// panel's height is reduced by this amount per visible bar so the overall dialog
// height stays constant. Must match .dcp-auth-bar height in the CSS.
const AUTH_BAR_HEIGHT = 32

const minDate = new Date(0)
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "numeric",
  day: "numeric"
})

const diskCollectionSortOptions: Array<{ value: DiskCollectionSortMode; label: string }> = [
  { value: "name-asc", label: "A-Z" },
  { value: "name-desc", label: "Z-A" },
  { value: "date-newest", label: "New" },
  { value: "date-oldest", label: "Old" },
]

const defaultSortModeByTab: Record<number, DiskCollectionSortMode> = {
  [TAB_INDEX.BUILT_IN]: "name-asc",
  [TAB_INDEX.NEW_RELEASES]: "date-newest",
  [TAB_INDEX.FAVORITES]: "date-newest",
  [TAB_INDEX.EXPORT]: "name-asc",
}

const getSortModeForTab = (tabIndex: number): DiskCollectionSortMode => {
  return getPreferenceDiskCollectionSort(tabIndex) || defaultSortModeByTab[tabIndex] || "name-asc"
}

const createCloudProviderByName = (providerName: string): CloudProvider | null => {
  switch (providerName) {
    case "GoogleDrive":
      return new GoogleDrive()
    case "OneDrive":
      return new OneDriveCloudDrive()
    default:
      return null
  }
}

// Human-readable name for a cloud provider, used in the auth notification bar.
const CLOUD_PROVIDER_DISPLAY_NAME: Record<string, string> = {
  GoogleDrive: "Google Drive",
  OneDrive: "OneDrive",
}

const cloudProviderDisplayName = (providerName: string): string =>
  CLOUD_PROVIDER_DISPLAY_NAME[providerName] || providerName

// Whether a cloud provider already has an access token cached in memory. Reading
// this never triggers an auth popup.
const cloudProviderHasAuthToken = (providerName: string): boolean => {
  return createCloudProviderByName(providerName)?.hasAuthToken() ?? false
}

const requestCloudAuthTokenWithTimeout = (provider: CloudProvider, timeoutMs = 15000): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false
    const timeoutId = window.setTimeout(() => {
      if (settled) return
      settled = true
      resolve(false)
    }, timeoutMs)

    try {
      provider.requestAuthToken(() => {
        if (settled) return
        settled = true
        clearTimeout(timeoutId)
        resolve(true)
      })
    } catch {
      if (settled) return
      settled = true
      clearTimeout(timeoutId)
      resolve(false)
    }
  })
}

type DiskCollectionPanelProps = DisplayProps & {
  onDismissDialog?: () => void
}

const DiskCollectionPanel = (props: DiskCollectionPanelProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const [diskBookmarks, setDiskBookmarks] = useState<DiskBookmarks>(() => new DiskBookmarks())
  const [diskCollection, setDiskCollection] = useState<DiskCollectionItem[]>(() => getDiskCollection(new DiskBookmarks(), newReleases))
  const [drivePopupLocation, setDrivePopupLocation] = useState<[number, number]>()
  const [selectPopupLocation, setSelectPopupLocation] = useState<[number, number]>()
  const [popupItem, setPopupItem] = useState<DiskCollectionItem>()
  const [activeTab, setActiveTab] = useState<number>(0)
  const [sortModeByTab, setSortModeByTab] = useState<Record<number, DiskCollectionSortMode>>(() => ({
    [TAB_INDEX.BUILT_IN]: getSortModeForTab(TAB_INDEX.BUILT_IN),
    [TAB_INDEX.NEW_RELEASES]: getSortModeForTab(TAB_INDEX.NEW_RELEASES),
    [TAB_INDEX.FAVORITES]: getSortModeForTab(TAB_INDEX.FAVORITES),
    [TAB_INDEX.EXPORT]: getSortModeForTab(TAB_INDEX.EXPORT),
  }))
  const [hasNewRelease, setHasNewRelease] = useState<boolean>(false)
  const [selectedDisks, setSelectedDisks] = useState<DiskCollectionItem[]>([])
  const [exportQueue, setExportQueue] = useState<DiskCollectionItem[]>([])
  const [downloadedDisks, setDownloadedDisks] = useState<DownloadedExportDisk[]>([])
  // Bumped after a cloud sign-in completes so the render re-reads each provider's
  // in-memory auth-token state (which lives outside React) to hide the auth
  // notification bar, re-enable the Export button, and trigger VTOC checks for
  // cloud disks that were previously skipped due to missing auth.
  const [authRefresh, setAuthRefresh] = useState<number>(0)
  const [pendingBookmarkRemovals, setPendingBookmarkRemovals] = useState<Set<string>>(new Set())
  const pendingBookmarkRemovalsRef = useRef<Set<string>>(new Set())
  const suppressClickUntilRef = useRef(0)
  const popupOpenRef = useRef(false)
  const primaryPressRef = useRef(false)

  useEffect(() => {
    pendingBookmarkRemovalsRef.current = pendingBookmarkRemovals
  }, [pendingBookmarkRemovals])



  if (isMinimalTheme()) {
    import("./diskcollectionpanel.minimal.css")
  }

  const tabs = [
    {
      icon: faFloppyDisk,
      label: "Show Apple2TS collection",
      disks: sortDisks(
        diskCollection.filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE),
        sortModeByTab[TAB_INDEX.BUILT_IN]
      ),
      isHighlighted: false
    },
    {
      icon: faClock,
      label: "Show new releases",
      disks: sortDisks(
        diskCollection.filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE),
        sortModeByTab[TAB_INDEX.NEW_RELEASES]
      ),
      isHighlighted: hasNewRelease
    },
    {
      icon: faStar,
      label: "Show favorites",
      disks: sortDisks(
        diskCollection.filter(x => x.type == DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE || x.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE),
        sortModeByTab[TAB_INDEX.FAVORITES]
      ),
      isHighlighted: false
    },
    {
      icon: faDownload,
      label: "Export disks to HDV",
      // Show all potentially exportable disks, including those whose VTOC is
      // still pending (undefined). Disks whose VTOC is "other"/"dosup", too
      // large, or explicitly disabled are excluded by isDiskExportable.
      disks: sortDisks(
        diskCollection.filter(x => isDiskExportable(x)),
        sortModeByTab[TAB_INDEX.EXPORT]
      ),
      isHighlighted: false
    }
  ]

  const handleSortModeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const mode = event.target.value as DiskCollectionSortMode
    setSortModeByTab((prev) => ({
      ...prev,
      [activeTab]: mode,
    }))
    setPreferenceDiskCollectionSort(activeTab, mode)
  }

  const handleHelpClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    window.open(diskCollectionItem.detailsUrl, "_blank")
    return false
  }

  const showItemContextMenu = (diskCollectionItem: DiskCollectionItem, event: React.MouseEvent<HTMLElement>) => {
    popupOpenRef.current = true
    setPopupItem(diskCollectionItem)
    if (activeTab == TAB_INDEX.EXPORT) {
      setSelectPopupLocation([event.clientX, event.clientY])
    } else {
      setDrivePopupLocation([event.clientX, event.clientY])
    }
    event.stopPropagation()
    event.preventDefault()
  }

  const showBookmarkContextMenu = (diskCollectionItem: DiskCollectionItem, event: React.MouseEvent<HTMLElement>) => {
    popupOpenRef.current = true
    setPopupItem(diskCollectionItem)
    setSelectPopupLocation([event.clientX, event.clientY])
    event.stopPropagation()
    event.preventDefault()
  }

  const shouldSuppressClick = () => Date.now() < suppressClickUntilRef.current

  const handleItemRightClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    // Some browsers fire a trailing click after context-menu gestures.
    primaryPressRef.current = false
    suppressClickUntilRef.current = Date.now() + 800
    showItemContextMenu(diskCollectionItem, event)
    return false
  }

  const handleBookmarkRightClick = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    primaryPressRef.current = false
    suppressClickUntilRef.current = Date.now() + 800
    showBookmarkContextMenu(diskCollectionItem, event)
    return false
  }

  const beginPrimaryPress = (event: React.MouseEvent<HTMLElement>) => {
    primaryPressRef.current = event.button === 0 && !event.ctrlKey
    if (!primaryPressRef.current) {
      suppressClickUntilRef.current = Date.now() + 800
    }
  }

  const handleBookmarkMouseUp = (diskCollectionItem: DiskCollectionItem) => (event: React.MouseEvent<HTMLElement>) => {
    if (!primaryPressRef.current) {
      event.stopPropagation()
      return
    }
    primaryPressRef.current = false
    if (popupOpenRef.current) {
      event.stopPropagation()
      return
    }
    if (shouldSuppressClick()) {
      event.stopPropagation()
      return
    }
    if ((event.nativeEvent as MouseEvent).button !== 0 || event.ctrlKey) {
      event.stopPropagation()
      return
    }

    const bookmarkId = diskCollectionItem.bookmarkId
    if (bookmarkId) {
      setPendingBookmarkRemovals((prev) => {
        const next = new Set(prev)
        if (next.has(bookmarkId)) {
          next.delete(bookmarkId)
        } else {
          next.add(bookmarkId)
        }
        return next
      })
    }

    event.stopPropagation()
  }

  const prepareSelectedItem = async (diskCollectionItem: DiskCollectionItem): Promise<DiskCollectionItem | null> => {
    // Selecting a cloud disk must not trigger any auth or VTOC check. Its VTOC
    // type was already determined (from the in-memory bytes) when it was
    // bookmarked, and any sign-in is deferred to the notification bar's "Sign in"
    // button (or the actual export). This keeps selection side-effect free and
    // avoids background auth popups the browser would block.
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

    const preparedItem = await prepareSelectedItem(diskCollectionItem)
    if (!preparedItem) {
      return
    }
    setSelectedDisks((prevSelectedDisks) => {
      if (prevSelectedDisks.includes(diskCollectionItem)) {
        return prevSelectedDisks
      }
      return [...prevSelectedDisks, diskCollectionItem]
    })
  }

  const handleSelectedMouseUp = (diskCollectionItem: DiskCollectionItem) => async (event: React.MouseEvent<HTMLElement>) => {
    if (!primaryPressRef.current) {
      event.stopPropagation()
      return
    }
    primaryPressRef.current = false
    if (popupOpenRef.current) {
      event.stopPropagation()
      return
    }
    if (shouldSuppressClick()) {
      event.stopPropagation()
      return
    }
    if ((event.nativeEvent as MouseEvent).button !== 0 || event.ctrlKey) return
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
    const newExportQueue = tabs[TAB_INDEX.EXPORT].disks.filter((diskCollectionItem) => {
      return selectedDisks.includes(diskCollectionItem) && isDiskExportable(diskCollectionItem)
    })

    if (newExportQueue.some((d) => d.vtocType === "replay")) {
      if (!window.confirm("Exporting will reset the running emulator state. Proceed?")) {
        return
      }
    }

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
      dismissDiskCollection()
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
      showGlobalProgressModal(true, `Fetching disk ${selectedDisks.length - exportQueue.length + 1}/${selectedDisks.length}`)
      loadDisk(-1, exportQueue[0], props.updateDisplay, processExportQueue)
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

  // Cloud providers that need a sign-in (no access token cached in memory).
  // On the Export tab, only show auth bars when cloud disks from a provider are
  // pending VTOC check (vtocType undefined) or selected for export — not for
  // cloud disks that already resolved and weren't selected. On other tabs, show
  // auth bars for any visible cloud disk. Reading the token state here never
  // triggers an auth popup.
  const currentTabCloudDisks = tabs[activeTab].disks
    .filter((d) => d.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && d.cloudData?.providerName)
  const relevantCloudProviderNames = Array.from(new Set(
    activeTab === TAB_INDEX.EXPORT
      ? [
        ...currentTabCloudDisks
          .filter((d) => d.vtocType === undefined)
          .map((d) => d.cloudData!.providerName as string),
        ...selectedDisks
          .filter((d) => d.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && d.cloudData?.providerName)
          .map((d) => d.cloudData!.providerName as string),
      ]
      : currentTabCloudDisks.map((d) => d.cloudData!.providerName as string)
  ))
  const cloudProvidersNeedingAuth = relevantCloudProviderNames.filter(
    (providerName) => !cloudProviderHasAuthToken(providerName)
  )

  const handleCloudSignIn = async (providerName: string) => {
    const provider = createCloudProviderByName(providerName)
    if (!provider) return
    // Runs from an explicit "Sign in" click, so the provider popup is allowed.
    const authReady = await requestCloudAuthTokenWithTimeout(provider)
    if (authReady) {
      // The token is now cached in memory; re-render so the bar hides and Export enables.
      setAuthRefresh((n) => n + 1)
    } else {
      alert(`${cloudProviderDisplayName(providerName)} sign-in did not complete. Please allow the provider popup and try again.`)
    }
  }

  const isExportButtonDisabled = () => {
    const hdvSize = estimateHdvSize()

    // Block export while any selected cloud disk's provider is not signed in;
    // fetching that disk during export would fail (or trigger a blocked popup).
    const selectedNeedAuth = selectedDisks.some(
      (d) => d.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE &&
        d.cloudData?.providerName &&
        !cloudProviderHasAuthToken(d.cloudData.providerName)
    )
    if (selectedNeedAuth) {
      return true
    }

    // Not sure how this happens given the blocking VTOC check logic,
    // but if any selected disk's VTOC is still pending (undefined), block export until it resolves.
    // This avoids exporting a disk that may be too large or otherwise not exportable.
    const selectedPendingVtocCheck = selectedDisks.some((d) => d.vtocType === undefined)
    if (selectedPendingVtocCheck) {
      return true
    }

    return hdvSize <= 0 || hdvSize > maxHdvBytes
  }

  const commitPendingBookmarkRemovals = (refreshBookmarks: boolean = true) => {
    const pending = pendingBookmarkRemovalsRef.current
    if (pending.size > 0) {
      const bookmarks = new DiskBookmarks()
      pending.forEach((bookmarkId) => {
        bookmarks.remove(bookmarkId)
      })
    }

    if (refreshBookmarks) {
      const newBookmarks = new DiskBookmarks()
      setPendingBookmarkRemovals(new Set())
      setDiskBookmarks(newBookmarks)
      setDiskCollection(getDiskCollection(newBookmarks, newReleases))
    }
  }

  const dismissDiskCollection = (notifyParent: boolean = true) => {
    commitPendingBookmarkRemovals()
    setIsFlyoutOpen(false)
    if (notifyParent) {
      props.onDismissDialog?.()
    }
  }

  useEffect(() => {
    return () => {
      commitPendingBookmarkRemovals(false)
    }
  }, [])

  useEffect(() => {
    showGlobalProgressModal(false)
    if (exportQueue.length > 0) {
      processExportQueue()
    } else if (downloadedDisks.length > 0) {
      const orderedDownloadedDisks = tabs[TAB_INDEX.EXPORT].disks
        .filter((diskCollectionItem) => selectedDisks.includes(diskCollectionItem))
        .map((diskCollectionItem) => downloadedDisks.find((downloadedDisk) => downloadedDisk.item === diskCollectionItem))
        .filter((downloadedDisk): downloadedDisk is DownloadedExportDisk => downloadedDisk !== undefined)
      createHdv(orderedDownloadedDisks).then(() => {
        setDownloadedDisks([])
        setSelectedDisks([])
        setActiveTab(0)
        dismissDiskCollection()
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exportQueue])

  return (
    <Flyout
      icon={faFloppyDisk}
      buttonId="tour-disk-images"
      title="disk collection"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => {
        if (isFlyoutOpen) {
          dismissDiskCollection(false)
        } else {
          const newBookmarks = new DiskBookmarks()
          setPendingBookmarkRemovals(new Set())
          setDiskBookmarks(newBookmarks)
          setDiskCollection(getDiskCollection(newBookmarks, newReleases))
          setIsFlyoutOpen(true)
        }
      }}
      width={`max( ${isMinimalTheme() ? "55vw" : "75vw"}, 348px )`}
      highlight={hasNewRelease}
      position="bottom-right">
      <div onContextMenuCapture={(e) => e.preventDefault()}>
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
      {cloudProvidersNeedingAuth.length > 0 && cloudProvidersNeedingAuth.map((providerName) => (
        <div
          key={`dcp-auth-bar-${providerName}`}
          className="dcp-auth-bar"
          onClick={(e) => e.stopPropagation()}>
          <span className="dcp-auth-bar-text">{`${cloudProviderDisplayName(providerName)} auth required`}</span>
          <button
            className="dcp-auth-bar-button"
            onClick={(e) => {
              e.stopPropagation()
              handleCloudSignIn(providerName)
            }}>Sign in</button>
        </div>
      ))}
      <div className="disk-collection-panel"
        style={cloudProvidersNeedingAuth.length > 0
          ? { height: `calc(65vh - ${cloudProvidersNeedingAuth.length * AUTH_BAR_HEIGHT}px)` }
          : undefined}
        onClick={(e) => { if (e.target === e.currentTarget) e.stopPropagation() }}>
        {tabs[activeTab].disks.map((diskCollectionItem, index) => {
          const isExportTab = activeTab == TAB_INDEX.EXPORT
          const isDisabledForExport = isExportTab && !isDiskExportable(diskCollectionItem)
          const isBookmarkPendingRemoval = !!diskCollectionItem.bookmarkId && pendingBookmarkRemovals.has(diskCollectionItem.bookmarkId)

          return (
            <div
              key={`dcp-${tabs[activeTab].label}-${index}`}
              className={`dcp-item${isDisabledForExport ? " dcp-item-disabled" : ""}`}
              onContextMenu={handleItemRightClick(diskCollectionItem)}
              onClickCapture={(e) => {
                if (shouldSuppressClick()) {
                  e.preventDefault()
                  e.stopPropagation()
                }
              }}
              onAuxClickCapture={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
              onMouseDown={(e) => {
                beginPrimaryPress(e)
              }}
              onMouseUp={(e) => {
                if (!primaryPressRef.current) {
                  e.stopPropagation()
                  return
                }
                primaryPressRef.current = false
                if (popupOpenRef.current) {
                  e.stopPropagation()
                  return
                }
                if (shouldSuppressClick()) {
                  e.preventDefault()
                  e.stopPropagation()
                  return
                }
                if (e.button !== 0 || e.ctrlKey) {
                  return
                }
                if (activeTab == TAB_INDEX.EXPORT && !isDisabledForExport) {
                  toggleSelectedItem(diskCollectionItem)
                  e.stopPropagation()
                }
              }}>
              <div className="dcp-item-title-box">
                <DiskItemTitle
                  text={diskCollectionItem.title}
                  className={`dcp-item-title ${diskCollectionItem.detailsUrl ? "dcp-item-title-link" : ""}`}
                  title={diskCollectionItem.detailsUrl ? `Click to show details for "${diskCollectionItem.title}"` : diskCollectionItem.title}
                  onMouseDown={(e) => {
                    beginPrimaryPress(e as unknown as React.MouseEvent<HTMLElement>)
                  }}
                  onMouseUp={(e) => {
                    if (!primaryPressRef.current) {
                      e.stopPropagation()
                      return
                    }
                    primaryPressRef.current = false
                    if (popupOpenRef.current) {
                      e.stopPropagation()
                      return
                    }
                    if (shouldSuppressClick()) {
                      e.preventDefault()
                      e.stopPropagation()
                      return
                    }
                    if (e.button !== 0 || e.ctrlKey) return
                    if (activeTab != TAB_INDEX.EXPORT && diskCollectionItem.detailsUrl) {
                      handleHelpClick(diskCollectionItem)(e as unknown as React.MouseEvent<HTMLElement>)
                    }
                  }} />
              </div>
              {diskCollectionItem.lastUpdated > minDate && <div className="dcp-item-updated">{dateFormatter.format(diskCollectionItem.lastUpdated)}</div>}
              <div
                className="dcp-item-image-box"
                title={activeTab == TAB_INDEX.EXPORT
                  ? `Click to ${selectedDisks.includes(diskCollectionItem) ? "remove from" : "add to"} selected disks`
                  : `Click to load disk "${diskCollectionItem.title}"`}
                onMouseDown={(event) => {
                  beginPrimaryPress(event as unknown as React.MouseEvent<HTMLElement>)
                }}
                onMouseUp={(event) => {
                  if (!primaryPressRef.current) {
                    event.stopPropagation()
                    return
                  }
                  primaryPressRef.current = false
                  if (popupOpenRef.current) {
                    event.stopPropagation()
                    return
                  }
                  if (shouldSuppressClick()) {
                    event.preventDefault()
                    event.stopPropagation()
                    return
                  }
                  if (event.button !== 0 || event.ctrlKey) return
                  if (activeTab == TAB_INDEX.EXPORT) {
                    if (!isDisabledForExport) {
                      toggleSelectedItem(diskCollectionItem)
                      event.stopPropagation()
                    }
                  } else {
                    loadDisk(-1, diskCollectionItem, props.updateDisplay)
                    dismissDiskCollection()
                  }
                }}
                onContextMenu={(event) => {
                  handleItemRightClick(diskCollectionItem)(event as unknown as React.MouseEvent<HTMLElement>)
                }}
                onAuxClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                <img className="dcp-item-image" src={diskCollectionItem.imageUrl} />
                <div className="dcp-item-icon-top-right">
                  {activeTab == 2 && diskCollectionItem.bookmarkId &&
                    <div
                      className="dcp-item-bookmark"
                      title={isBookmarkPendingRemoval
                        ? "Click to keep in disk collection"
                        : "Click to mark for removal from disk collection"}
                      onMouseDown={(event) => {
                        beginPrimaryPress(event as unknown as React.MouseEvent<HTMLElement>)
                      }}
                      onMouseUp={handleBookmarkMouseUp(diskCollectionItem)}
                      onContextMenu={(event) => {
                        handleBookmarkRightClick(diskCollectionItem)(event as unknown as React.MouseEvent<HTMLElement>)
                      }}
                      onAuxClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}>
                      <FontAwesomeIcon icon={isBookmarkPendingRemoval ? faStarOutline : faStar} size="lg" className="dcp-item-bookmark-icon" />
                    </div>}
                  {activeTab == TAB_INDEX.EXPORT && isDiskExportable(diskCollectionItem) &&
                    <div
                      className="dcp-item-select"
                      title={`Click to ${selectedDisks.includes(diskCollectionItem) ? "remove to" : "add from"} selected disks`}
                      onMouseDown={(event) => {
                        beginPrimaryPress(event as unknown as React.MouseEvent<HTMLElement>)
                      }}
                      onMouseUp={isDisabledForExport ? undefined : handleSelectedMouseUp(diskCollectionItem)}
                      onContextMenu={(event) => {
                        handleItemRightClick(diskCollectionItem)(event as unknown as React.MouseEvent<HTMLElement>)
                      }}
                      onAuxClick={(event) => {
                        event.preventDefault()
                        event.stopPropagation()
                      }}>
                      <FontAwesomeIcon icon={selectedDisks.includes(diskCollectionItem) ? faCheckCircle : faCircle} size="lg" className="dcp-item-select-icon" />
                      {selectedDisks.includes(diskCollectionItem) && <div className="dcp-item-select-icon-bg">&nbsp;</div>}
                    </div>}
                </div>
                <div className="dcp-item-icon-row">
                  <div className="dcp-item-icon-left-group">
                    {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE &&
                      <div className="dcp-item-new" title="Disk is a new release">
                        <FontAwesomeIcon icon={faClock} size="lg" className="dcp-item-new-icon" onClick={(event) => {
                          if (activeTab != TAB_INDEX.EXPORT) {
                            event.stopPropagation()
                          }
                        }} />
                        <div className="dcp-item-new-icon-bg">&nbsp;</div>
                      </div>}
                    {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE &&
                      <div className="dcp-item-a2ts" title="Disk is part of the Apple2TS collection">
                        <FontAwesomeIcon icon={faFloppyDisk} size="lg" className="dcp-item-a2ts-icon" onClick={(event) => {
                          if (activeTab != TAB_INDEX.EXPORT) {
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
                            if (activeTab != TAB_INDEX.EXPORT) {
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
                          if (activeTab != TAB_INDEX.EXPORT) {
                            event.stopPropagation()
                          }
                        }} />
                      </div>}
                    {(() => {
                      const exportBadge = getExportBadgeInfo(diskCollectionItem)
                      const badgeStateClass = exportBadge.state === "blocked"
                        ? " dcp-item-export-badge-disabled"
                        : exportBadge.state === "pending"
                          ? " dcp-item-export-badge-pending"
                          : ""
                      return (
                        <div
                          className={`dcp-item-export-badge${badgeStateClass}`}
                          title={exportBadge.title}>
                          <FontAwesomeIcon icon={faDownload} size="lg" className="dcp-item-export-badge-icon" onClick={(event) => {
                            if (activeTab != TAB_INDEX.EXPORT) {
                              event.stopPropagation()
                            }
                          }} />
                          <div className="dcp-item-export-badge-icon-bg">&nbsp;</div>
                        </div>
                      )
                    })()}
                  </div>
                  <div className="dcp-item-icon-right-group">
                    {activeTab == TAB_INDEX.EXPORT &&
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
                  </div>
                </div>
              </div>
              <img className="dcp-item-disk" src="assets/floppy.png" />
            </div>
          )
        })}
      </div>
      <div
        className="dcp-export-row"
        onClick={(e) => e.stopPropagation()}>
        <div className="dcp-sort-controls">
          <select
            id="dcp-sort-select"
            className="dcp-sort-select"
            value={sortModeByTab[activeTab]}
            onChange={handleSortModeChange}
            onClick={(e) => e.stopPropagation()}>
            {diskCollectionSortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="dcp-export-size-cell">
          {activeTab == TAB_INDEX.EXPORT &&
            <div className="dcp-export-size"><span className={`${estimateHdvSize() > maxHdvBytes ? "dcp-export-size-exceeded" : ""}`}>{formatBytes(estimateHdvSize())}</span> / {formatBytes(maxHdvBytes)}</div>
          }
        </div>
        <div className={`dcp-export-controls${activeTab == TAB_INDEX.EXPORT ? "" : " dcp-export-row-inactive"}`}>
          <button
            className="dcp-export-button"
            disabled={activeTab != TAB_INDEX.EXPORT || isExportButtonDisabled()}
            onClick={(e) => {
              e.stopPropagation()
              if (activeTab == TAB_INDEX.EXPORT) {
                handleExportClick()
              }
            }}>Export</button>
        </div>
      </div>
      <PopupMenu
        key="drive-popup"
        location={drivePopupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => {
          popupOpenRef.current = false
          setDrivePopupLocation(undefined)
        }}
        menuItems={[[
          ...[0, 1].map((i) => (
            {
              label: `Load Disk into Drive ${DISK_DRIVE_LABELS[i]}`,
              icon: faHardDrive,
              isSelected: () => { return false },
              onClick: () => {
                setDrivePopupLocation(undefined)
                loadDisk(i, popupItem, props.updateDisplay)
                dismissDiskCollection()
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
                loadDisk(i, popupItem, props.updateDisplay)
                dismissDiskCollection()
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
        onClose={() => {
          popupOpenRef.current = false
          setSelectPopupLocation(undefined)
        }}
        menuItems={[[
          ...(activeTab == TAB_INDEX.EXPORT
            ? [
              {
                label: "Select all disks",
                icon: faCheckCircle,
                onClick: async () => {
                  const newSelectedDisks = [...selectedDisks]
                  for (const diskCollectionItem of tabs[TAB_INDEX.EXPORT].disks) {
                    if (isDiskExportable(diskCollectionItem) && !newSelectedDisks.includes(diskCollectionItem)) {
                      const preparedItem = await prepareSelectedItem(diskCollectionItem)
                      if (!preparedItem) continue
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
            ]
            : [
              {
                label: "Delete all bookmarks",
                icon: faStarOutline,
                onClick: () => {
                  const allBookmarkIds = new Set<string>()
                  for (const diskCollectionItem of tabs[TAB_INDEX.FAVORITES].disks) {
                    if (diskCollectionItem.bookmarkId) {
                      allBookmarkIds.add(diskCollectionItem.bookmarkId)
                    }
                  }
                  setPendingBookmarkRemovals(allBookmarkIds)
                }
              },
              {
                label: "Restore all bookmarks",
                icon: faStar,
                onClick: () => {
                  setPendingBookmarkRemovals(new Set())
                }
              }
            ])
        ]]}
      />
      <DiskPanelVtoc
        activeTab={activeTab}
        isFlyoutOpen={isFlyoutOpen}
        diskBookmarks={diskBookmarks}
        setDiskCollection={setDiskCollection}
        exportQueue={exportQueue}
        downloadedDisks={downloadedDisks}
        visibleCandidates={activeTab === TAB_INDEX.EXPORT
          ? diskCollection.filter(isDiskExportable)
          : tabs[activeTab].disks.filter(isDiskExportable)}
        authRefresh={authRefresh}
        cloudProviderHasAuthToken={cloudProviderHasAuthToken}
      />
      </div>
    </Flyout >
  )
}

export default DiskCollectionPanel
