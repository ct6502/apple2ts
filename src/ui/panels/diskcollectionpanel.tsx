import { useEffect, useState } from "react"
import "./diskcollectionpanel.css"
import Flyout from "../flyout"
import { faArchive } from "@fortawesome/free-solid-svg-icons"
import { handleSetDiskFromFile, handleSetDiskFromURL } from "../devices/driveprops"
import { diskImages } from "../devices/diskimages"
import { replaceSuffix } from "../../common/utility"

// $TODO: Read this from a hosted JSON file
// const diskCollectionItems: DiskCollectionItem[] = [
// {
//   title: "Glider for Apple II",
//   releaseDate: "3/16/2025",
//   imageUrl: "https://www.colino.net/wordpress/wp-content/uploads/glider-splash.png",
//   diskUrl: "https://colino.net/tmp/glider-en-beta-202503162.po"
// },
// {
//   title: "Million Perfect Tiles",
//   releaseDate: "12/30/2024",
//   imageUrl: "https://ia800300.us.archive.org/16/items/MillionPerfectTiles/00playable_screenshot.png",
//   diskUrl: "https://archive.org/download/MillionPerfectTiles/Million.Perfect.Tiles.v1.1.po"
// },
// {
//   title: "Encounter Adventure",
//   releaseDate: "11/11/2024",
//   imageUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/title.jpg",
//   diskUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/encounteradventure.dsk"
// },
// {
//   title: "Undead Demo",
//   releaseDate: "9/10/2024",
//   imageUrl: "https://www.callapple.org/wp-content/uploads/2024/09/Undead_Demo.png",
//   diskUrl: "https://www.callapple.org/wp-content/uploads/2024/09/UNDEAD_DEMO.po_.zip"
// }
// ]

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const DiskCollectionPanel = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const diskCollectionItems: DiskCollectionItem[] = []

  diskImages.forEach((diskImage) => {
    diskCollectionItems.push({
      title: diskImage.title,
      imageUrl: `${"/disks/" + replaceSuffix(diskImage.file, "png")}`,
      detailsUrl: diskImage.url,
      diskImage: diskImage
    })
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
      width="max( 70vw, 200px )"
      position="top-center">
      <div className="disk-collection-panel">
        {diskCollectionItems.map((diskCollectionItem, index) => (
          <div key={`dcp-item-${index}`} className="dcp-item" onClick={handleItemClick(index)}>
            <div className="dcp-item-title">{diskCollectionItem.title}</div>
            {diskCollectionItem.lastUpdated && <div className="dcp-item-release">dateFormatter(diskCollectionItem.lastUpdated)</div>}
            <div className="dcp-item-image-box">
              <img className="dcp-item-image" src={diskCollectionItem.imageUrl} title={diskCollectionItem.title} />
            </div>
            <img className="dcp-item-disk" src="/floppy.png" />
          </div>
        ))}
      </div>
    </Flyout>
  )
}

export default DiskCollectionPanel
