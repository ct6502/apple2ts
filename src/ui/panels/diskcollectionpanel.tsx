import { useEffect, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faClock, faCloud, faFloppyDisk, faHardDrive, faStar } from "@fortawesome/free-solid-svg-icons"
import { UI_THEME } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { svgInternetArchiveLogo } from "../img/icon_internetarchive"
import PopupMenu from "../controls/popupmenu"
import { handleGetTheme } from "../main2worker"
import { DISK_DRIVE_LABELS } from "../devices/disk/diskdrive"
import { handleSetDiskFromCloudData, handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/disk/driveprops"
import { diskImages } from "../devices/disk/diskimages"
import { newReleases } from "../devices/disk/newreleases"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { getPreferenceNewReleasesChecked, setPreferenceNewReleasesChecked } from "../localstorage"

export enum DISK_COLLECTION_ITEM_TYPE {
  A2TS_ARCHIVE,
  INTERNET_ARCHIVE,
  NEW_RELEASE,
  CLOUD_DRIVE
}

const minDate = new Date(0)
const dateFormatter = new Intl.DateTimeFormat("en-US", {
  year: "2-digit",
  month: "numeric",
  day: "numeric"
})

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

const DiskCollectionPanel = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const [diskCollection, setDiskCollection] = useState<DiskCollectionItem[]>([])
  const [diskBookmarks, setDiskBookmarks] = useState<DiskBookmarks>(new DiskBookmarks)
  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const [popupItemIndex, setPopupItemIndex] = useState<number>(-1)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [hasNewRelease, setHasNewRelease] = useState<boolean>(false)

  let longPressTimer: number

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
    }
  ]

  const handleHelpClick = (itemIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    const diskCollectionItem = diskCollection[itemIndex]
    event.stopPropagation()
    window.open(diskCollectionItem.detailsUrl, "_blank")
    return false
  }

  const loadDisk = (driveIndex: number, itemIndex: number = popupItemIndex) => {
    const diskCollectionItem = diskCollection[itemIndex]

    if (diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE && diskCollectionItem.cloudData) {
      handleSetDiskFromCloudData(diskCollectionItem.cloudData, driveIndex)
    } else if (typeof diskCollectionItem.diskUrl === "string" && !URL.canParse(diskCollectionItem.diskUrl)) {
      handleSetDiskFromFile(diskCollectionItem.diskUrl.toString(), props.updateDisplay, driveIndex)
    } else {
      handleSetDiskFromURL(diskCollectionItem.diskUrl.toString(), undefined, driveIndex, diskCollectionItem.cloudData)
    }

    setIsFlyoutOpen(false)
  }

  const handleItemClick = (itemIndex: number, driveIndex: number = 0) => () => {
    loadDisk(driveIndex, itemIndex)
  }

  const handleItemRightClick = (itemIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    setPopupItemIndex(itemIndex)
    setPopupLocation([event.clientX, event.clientY])
    event.stopPropagation()
    event.preventDefault()
    return false
  }

  const handleItemTouchStart = (itemIndex: number) => (event: React.TouchEvent<HTMLElement>) => {
    longPressTimer = window.setTimeout(() => {
      setPopupItemIndex(itemIndex)
      setPopupLocation([event.touches[0].clientX, event.touches[0].clientY])
      event.stopPropagation()
      event.preventDefault()
      return false
    }, 1000)
  }

  const handleItemTouchCancel = () => {
    clearTimeout(longPressTimer)
  }

  const handleBookmarkClick = (itemIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    const diskCollectionItem = diskCollection[itemIndex]

    if (diskCollectionItem.bookmarkId) {
      diskBookmarks.remove(diskCollectionItem.bookmarkId)
      setDiskBookmarks(new DiskBookmarks())
    }

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
        imageUrl: diskBookmark.screenshotUrl,
        detailsUrl: diskBookmark.cloudData?.detailsUrl ? new URL(diskBookmark.cloudData?.detailsUrl) : diskBookmark.detailsUrl,
        bookmarkId: diskBookmark.id,
        cloudData: diskBookmark.cloudData
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

  return (
    <Flyout
      icon={faFloppyDisk}
      buttonId="tour-disk-images"
      title="disk collection"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      width={`max( ${handleGetTheme() == UI_THEME.MINIMAL ? "55vw" : "75vw"}, 348px )`}
      highlight={hasNewRelease}
      position="top-center">
      <div className="dcp-tab-row">
        {tabs.map((tab, i) => (
          <div
            key={`tab-${i}`}
            className={`dcp-tab ${i == activeTab ? " dcp-tab-active" : ""} ${tab.isHighlighted ? " dcp-tab-highlighted" : ""}`}
            title={tab.label}
            onClick={handleTabClick(i)}>
            <FontAwesomeIcon icon={tab.icon} size="lg"/>
          </div>
        ))}
      </div>
      <div className="disk-collection-panel">
        {tabs[activeTab].disks.map((diskCollectionItem, index) => (
          <div key={`dcp-item-${index}`} className="dcp-item">
            <div className="dcp-item-title-box">
              <div
                className={`dcp-item-title ${diskCollectionItem.detailsUrl ? "dcp-item-title-link" : ""}`}
                title={diskCollectionItem.detailsUrl ? `Click to show details for "${diskCollectionItem.title}"` : diskCollectionItem.title}
                onClick={diskCollectionItem.detailsUrl ? handleHelpClick(index) : () => { }}>{diskCollectionItem.title}</div>
            </div>
            {diskCollectionItem.lastUpdated > minDate && <div className="dcp-item-updated">{dateFormatter.format(diskCollectionItem.lastUpdated)}</div>}
            <div
              className="dcp-item-image-box"
              title={`Click to load disk "${diskCollectionItem.title}"`}
              onClick={handleItemClick(index, 0)}
              onTouchStart={handleItemTouchStart(index)}
              onTouchEnd={handleItemTouchCancel}
              onTouchCancel={handleItemTouchCancel}
              onContextMenu={handleItemRightClick(index)}
            >
              <img className="dcp-item-image" src={diskCollectionItem.imageUrl?.toString()} />
            </div>
            <img className="dcp-item-disk" src="/floppy.png" />
            {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE &&
              <div className="dcp-item-new" title="Disk is a new release">
                <FontAwesomeIcon icon={faClock} size="lg" className="dcp-item-new-icon" onClick={(event) => event.stopPropagation()} />
                <div className="dcp-item-new-icon-bg">&nbsp;</div>
              </div>}
            {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE &&
              <div className="dcp-item-a2ts" title="Disk is part of the Apple2TS collection">
                <FontAwesomeIcon icon={faFloppyDisk} size="lg" className="dcp-item-a2ts-icon" onClick={(event) => event.stopPropagation()} />
                <div className="dcp-item-a2ts-icon-bg">&nbsp;</div>
              </div>}
            {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE &&
              <div className="dcp-item-ia" title="Disk is part of the Internet Archive">
                <svg
                  className="dcp-item-ia-icon"
                  onClick={(event) => event.stopPropagation()}
                  fill="#ffffff"
                  viewBox="0 0 55 55">{svgInternetArchiveLogo}</svg>
                <div className="dcp-item-ia-icon-bg">&nbsp;</div>
              </div>}
            {diskCollectionItem.bookmarkId &&
              <div
                className="dcp-item-bookmark" title="Click to remove from disk collection" onClick={handleBookmarkClick(index)}>
                <FontAwesomeIcon icon={faStar} className="dcp-item-bookmark-icon" />
              </div>}
            {diskCollectionItem.type == DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE &&
              <div className="dcp-item-cloud" title={`Disk is synced via ${diskCollectionItem.cloudData?.providerName}`}>
                <FontAwesomeIcon icon={faCloud} size="lg" className="dcp-item-cloud-icon" onClick={(event) => event.stopPropagation()} />
              </div>}
          </div>
        ))}
      </div>
      <PopupMenu
        key={`drive-popup-${popupItemIndex}`}
        location={popupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...[0, 1].map((i) => (
            {
              label: `Load Disk into Drive ${DISK_DRIVE_LABELS[i]}`,
              icon: faHardDrive,
              isSelected: () => { return false },
              onClick: () => {
                setPopupLocation(undefined)
                loadDisk(i)
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
                setPopupLocation(undefined)
                loadDisk(i)
              }
            }
          ))
        ]]}
      />
    </Flyout >
  )
}

export default DiskCollectionPanel
