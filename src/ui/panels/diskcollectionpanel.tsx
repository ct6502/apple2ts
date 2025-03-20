import { useEffect, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faArchive, faClock, faFloppyDisk, faQuestionCircle, faStar } from "@fortawesome/free-solid-svg-icons"
import { handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/driveprops"
import { diskImages } from "../devices/diskimages"
import { replaceSuffix } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DiskBookmarks } from "../../common/diskbookmarks"

// $TODO: Read this disk collection data from a hosted JSON file
const newReleases: DiskCollectionItem[] = [
  {
    title: "Glider for Apple II",
    lastUpdated: new Date("3/16/2025"),
    imageUrl: "https://www.colino.net/wordpress/wp-content/uploads/glider-splash.png",
    diskUrl: "https://colino.net/tmp/glider-en-beta-202503162.po",
    detailsUrl: "https://www.colino.net/wordpress/glider-for-apple-ii/"
  },
  {
    title: "Million Perfect Tiles",
    lastUpdated: new Date("12/30/2024"),
    imageUrl: "https://ia800300.us.archive.org/16/items/MillionPerfectTiles/00playable_screenshot.png",
    diskUrl: "https://archive.org/download/MillionPerfectTiles/Million.Perfect.Tiles.v1.1.po",
    detailsUrl: "https://archive.org/details/MillionPerfectTiles"
  },
  // $TODO: Figure out why the DSK fails to load
  // {
  //   title: "Encounter Adventure",
  //   lastUpdated: new Date("11/11/2024"),
  //   imageUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/title.jpg",
  //   diskUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/encounteradventure.dsk",
  //   detailsUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/"
  // }
  {
    title: "Undead Demo",
    lastUpdated: new Date("9/10/2024"),
    imageUrl: "https://www.callapple.org/wp-content/uploads/2024/09/Undead_Demo.png",
    diskUrl: "https://www.callapple.org/wp-content/uploads/2024/09/UNDEAD_DEMO.po_.zip",
    detailsUrl: "https://www.kickstarter.com/projects/8-bit-shack/undead-a-new-apple-role-player-game?utm_source=a2central"
  }
]

const minDate = new Date(0)
const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: '2-digit',
  month: 'numeric',
  day: 'numeric'
});

const sortByLastUpdatedAsc = (a: DiskCollectionItem, b: DiskCollectionItem): number => {
  if (a.lastUpdated && b.lastUpdated) {
    const aTime = a.lastUpdated
    const bTime = b.lastUpdated
    if (aTime > bTime) return -1;
    if (aTime < bTime) return 1;
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

  const handleHelpClick = (itemIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    const diskCollectionItem = diskCollection[itemIndex]
    event.stopPropagation();
    window.open(diskCollectionItem.detailsUrl, "_blank"); return false;
  }

  const handleItemClick = (itemIndex: number) => () => {
    const diskCollectionItem = diskCollection[itemIndex]

    if (diskCollectionItem.diskImage) {
      handleSetDiskFromFile(diskCollectionItem.diskImage, props.updateDisplay)
    } else if (diskCollectionItem.diskUrl) {
      handleSetDiskFromURL(diskCollectionItem.diskUrl)
    } else {
      // $TODO: Add error handling
    }

    setIsFlyoutOpen(false)
  }

  const handleBookmarkClick = (itemIndex: number) => (event: React.MouseEvent<HTMLElement>) => {
    const diskCollectionItem = diskCollection[itemIndex]

    if (diskCollectionItem.bookmarkId) {
      diskBookmarks.remove(diskCollectionItem.bookmarkId)
      setDiskBookmarks(new DiskBookmarks())
      // diskCollection.splice(itemIndex, 1)
      // setDiskCollection(diskCollection)
    }

    event.stopPropagation();
  }

  useEffect(() => {
    setDiskBookmarks(new DiskBookmarks())
  }, [isFlyoutOpen])

  useEffect(() => {
    const newDiskCollection: DiskCollectionItem[] = []

    // Load built-in disk images
    diskImages.forEach((diskImage) => {
      newDiskCollection.push({
        title: diskImage.title,
        lastUpdated: minDate,
        imageUrl: `${"/disks/" + replaceSuffix(diskImage.file, "png")}`,
        detailsUrl: diskImage.url,
        diskImage: diskImage
      })
    })

    // Load favorites
    for (const diskBookmark of diskBookmarks) {
      newDiskCollection.push({
        title: diskBookmark.title,
        lastUpdated: new Date(diskBookmark.lastUpdated),
        diskUrl: diskBookmark.diskUrl.toString(),
        imageUrl: diskBookmark.screenshotUrl.toString(),
        detailsUrl: diskBookmark.detailsUrl.toString(),
        bookmarkId: diskBookmark.id
      })
    }

    // Load new releases
    newReleases.forEach((diskImage) => {
      newDiskCollection.push(diskImage)
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
      width="max( 75vw, 200px )"
      position="top-center">
      <div className="disk-collection-panel">
        {diskCollection.sort(sortByLastUpdatedAsc).map((diskCollectionItem, index) => (
          <div key={`dcp-item-${index}`} className="dcp-item">
            <div className="dcp-item-title-box">
              <div className="dcp-item-title">{diskCollectionItem.title}</div>
            </div>
            {diskCollectionItem.lastUpdated > minDate && <div className="dcp-item-updated">{dateFormatter.format(diskCollectionItem.lastUpdated)}</div>}
            <div className="dcp-item-image-box" title={`Click to insert disk "${diskCollectionItem.title}"`} onClick={handleItemClick(index)}>
              <img className="dcp-item-image" src={diskCollectionItem.imageUrl} />
            </div>
            <img className="dcp-item-disk" src="/floppy.png" />
            {/* {diskCollectionItem.detailsUrl &&
              <div className="dcp-item-help"
                title={`Click to show details for "${diskCollectionItem.title}"`}
                onClick={handleHelpClick(index)}>
                <FontAwesomeIcon icon={faQuestionCircle} size="xl" className="dcp-item-help-icon" />
                <div className="dcp-item-help-icon-bg">&nbsp;</div>
              </div>} */}
            {!diskCollectionItem.bookmarkId && !diskCollectionItem.diskImage &&
              <div className="dcp-item-new" title="Disk is a new release">
                <FontAwesomeIcon icon={faClock} size="lg" className="dcp-item-new-icon" onClick={(event) => event.stopPropagation()} />
                <div className="dcp-item-new-icon-bg">&nbsp;</div>
              </div>}
            {diskCollectionItem.bookmarkId &&
              <div
                className="dcp-item-bookmark" title="Click to remove bookmark" onClick={handleBookmarkClick(index)}>
                <FontAwesomeIcon icon={faStar} className="dcp-item-bookmark-icon" />
              </div>}
            {diskCollectionItem.diskImage &&
              <div className="dcp-item-archive" title="Disk is part of the Apple2TS archive">
                <FontAwesomeIcon icon={faFloppyDisk} size="lg" className="dcp-item-archive-icon" onClick={(event) => event.stopPropagation()} />
                <div className="dcp-item-archive-icon-bg">&nbsp;</div>
              </div>}
          </div>
        ))}
      </div>
    </Flyout >
  )
}

export default DiskCollectionPanel
