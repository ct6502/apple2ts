import { useState } from "react"
// import "./newspanel.css"
import Flyout from "../flyout"
import { faBell } from "@fortawesome/free-solid-svg-icons"
import { handleGetTheme } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { handleSetDiskFromURL } from "../devices/driveprops"

// $TODO: Read this from a hosted JSON file
interface NewsArticle {
  title: string,
  imageUrl: string,
  diskUrl: string
}
const newsArticles: NewsArticle[] = [
  {
    title: "Glider for Apple II",
    imageUrl: "https://www.colino.net/wordpress/wp-content/uploads/glider-splash.png",
    diskUrl: "https://colino.net/tmp/glider-en-beta-202503162.po"
  },
  {
    title: "Encounter Adventure",
    imageUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/title.jpg",
    diskUrl: "https://www.brutaldeluxe.fr/products/apple2/encounter/encounteradventure.dsk"
  },
  {
    title: "Undead Demo",
    imageUrl: "https://www.callapple.org/wp-content/uploads/2024/09/Undead_Demo.png",
    diskUrl: "https://www.callapple.org/wp-content/uploads/2024/09/UNDEAD_DEMO.po_.zip"
  },
  {
    title: "Million Perfect Tiles",
    imageUrl: "https://ia800300.us.archive.org/16/items/MillionPerfectTiles/00playable_screenshot.png",
    diskUrl: "https://archive.org/download/MillionPerfectTiles/Million.Perfect.Tiles.v1.1.po"
  }
]

const NewsPanel = () => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL

  const handleArticlelick = (articleIndex: number) => () => {
    handleSetDiskFromURL(newsArticles[articleIndex].diskUrl)
    setIsFlyoutOpen(false)
  }

  if (isMinimalTheme) {
    import("./newspanel.minimal.css")
  }

  return (
    <Flyout
      icon={faBell}
      title="new releases"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      width="max( 50vw, 200px )"
      position="top-center">
      <div className="news-panel">
        {newsArticles.map((newsArticle, index) => (
          <div key={`np-article-${index}`} className="np-article" >
            <img className="np-article-image" src={newsArticle.imageUrl} title={newsArticle.title} onClick={handleArticlelick(index)} />
          </div>
        ))}
      </div>
    </Flyout>
  )
}

export default NewsPanel
