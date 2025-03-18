import { useEffect, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faArchive } from "@fortawesome/free-solid-svg-icons"
import { handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/driveprops"
import { diskImages } from "../devices/diskimages"
import { replaceSuffix } from "../../common/utility"

// $TODO: Read this from a hosted JSON file
const newReleases: DiskCollectionItem[] = [
  {
    title: "Glider for Apple II",
    lastUpdated: new Date("3/16/2025"),
    imageUrl: "https://www.colino.net/wordpress/wp-content/uploads/glider-splash.png",
    diskUrl: "https://colino.net/tmp/glider-en-beta-202503162.po"
  },
  {
    title: "Million Perfect Tiles",
    lastUpdated: new Date("12/30/2024"),
    imageUrl: "https://ia800300.us.archive.org/16/items/MillionPerfectTiles/00playable_screenshot.png",
    diskUrl: "https://archive.org/download/MillionPerfectTiles/Million.Perfect.Tiles.v1.1.po"
  },
  {
    title: "Encounter Adventure",
    lastUpdated: new Date("11/11/2024"),
    imageUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/title.jpg",
    diskUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/encounteradventure.dsk"
  },
  {
    title: "Undead Demo",
    lastUpdated: new Date("9/10/2024"),
    imageUrl: "https://www.callapple.org/wp-content/uploads/2024/09/Undead_Demo.png",
    diskUrl: "https://www.callapple.org/wp-content/uploads/2024/09/UNDEAD_DEMO.po_.zip"
  }
]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric'
});

const sortByLastUpdatedAsc = (a: DiskCollectionItem, b: DiskCollectionItem): number => {
  if (a.lastUpdated && b.lastUpdated) {
    const aTime = a.lastUpdated.getTime()
    const bTime = b.lastUpdated.getTime()
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
  const diskCollectionItems: DiskCollectionItem[] = []

  // Load built-in disk images
  diskImages.forEach((diskImage) => {
    diskCollectionItems.push({
      title: diskImage.title,
      lastUpdated: new Date(0),
      imageUrl: `${"/disks/" + replaceSuffix(diskImage.file, "png")}`,
      detailsUrl: diskImage.url,
      diskImage: diskImage
    })
  })

  // Load new releases
  newReleases.forEach((diskImage) => {
    diskCollectionItems.push(diskImage)
  })

  const handleItemClick = (itemIndex: number) => () => {
    const diskCollectionItem = diskCollectionItems[itemIndex]

    if (diskCollectionItem.diskImage) {
      handleSetDiskFromFile(diskCollectionItem.diskImage, props.updateDisplay)
    } else {
      if (diskCollectionItem.diskUrl) {
        handleSetDiskFromURL(diskCollectionItem.diskUrl)
      } else {
        // $TODO: Add error handling
      }
    }
    setIsFlyoutOpen(false)
  }

  return (
    <Flyout
      icon={faArchive}
      title="disk collection"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      width="max( 75vw, 200px )"
      position="top-center">
      <div className="disk-collection-panel">
        {diskCollectionItems.sort(sortByLastUpdatedAsc).map((diskCollectionItem, index) => (
          <div key={`dcp-item-${index}`} className="dcp-item" title={`Click to insert disk "${diskCollectionItem.title}"`} onClick={handleItemClick(index)}>
            <div className="dcp-item-title-box">
              <div className="dcp-item-title">{diskCollectionItem.title}</div>
            </div>
            {diskCollectionItem.lastUpdated.getTime() > 0 && <div className="dcp-item-updated">{dateFormatter.format(diskCollectionItem.lastUpdated)}</div>}
            <div className="dcp-item-image-box">
              <img className="dcp-item-image" src={diskCollectionItem.imageUrl} />
            </div>
            <img className="dcp-item-disk" src="/floppy.png" />
          </div>
        ))}
      </div>
    </Flyout>
  )
}

export default DiskCollectionPanel
