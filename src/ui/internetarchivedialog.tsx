import { useState } from "react"
import { svgInternetArchiveFavorites, svgInternetArchiveLogo, svgInternetArchiveReviews, svgInternetArchiveSoftware, svgInternetArchiveTitle, svgInternetArchiveViews } from "./img/icon_internetarchive"
import "./internetarchivedialog.css"
import { handleSetDiskFromURL } from "./devices/driveprops"
import { iconData, iconKey, iconName } from "./img/iconfunctions"

const queryMaxRows = 100
const queryFormat = "https://archive.org/advancedsearch.php?" + [
  "q=title:({0})+AND+collection:({1})+AND+mediatype:(software)",
  "fl[]=identifier",
  "fl[]=title",
  "fl[]=creator",
  "fl[]=downloads",
  "fl[]=month",
  "fl[]=num_reviews",
  "sort[]=downloads+desc",
  "sort[]=stars+desc",
  `rows=${queryMaxRows}`,
  "page=1",
  "output=json"
].join("&")

interface SoftwareCollection {
  id: string,
  title: string,
  imageUrl: string
}
const softwareCollections: SoftwareCollection[] = [
  {
    id: "softwarelibrary_apple",
    title: "The Software Library: Apple Computer",
    imageUrl: "http://ia601609.us.archive.org/12/items/softwarelibrary_apple/softwarelibrary_apple_itemimage.jpg"
  },
  {
    id: "softwarelibrary_apple_games",
    title: "The Apple II Library: Games",
    imageUrl: "http://ia802200.us.archive.org/6/items/softwarelibrary_apple_games/softwarelibrary_apple_games_itemimage.jpg"
  },
  {
    id: "softwarelibrary_apple_woz_educational",
    title: "Software Library: Apple Educational",
    imageUrl: "http://ia801005.us.archive.org/31/items/softwarelibrary_apple_woz_educational/softwarelibrary_apple_woz_educational_itemimage.jpg"
  },
  {
    id: "apple_ii_library_4am",
    title: "Apple II Library: The 4am Collection",
    imageUrl: "http://ia804508.us.archive.org/34/items/apple_ii_library_4am/apple_ii_library_4am_itemimage.jpg"
  }
]

function formatString(template: string, ...args: string[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== "undefined" ? args[index] : match
  })
}

function formatNumber(num: number, precision = 1) {
  if (num < 1000) {
    return num
  }

  const map = [
    { suffix: "T", threshold: 1e12 },
    { suffix: "B", threshold: 1e9 },
    { suffix: "M", threshold: 1e6 },
    { suffix: "K", threshold: 1e3 },
    { suffix: "", threshold: 1 },
  ]

  const found = map.find((x) => Math.abs(num) >= x.threshold)
  if (found) {
    const formatted = (num / found.threshold).toFixed(precision) + found.suffix
    return formatted
  }

  return num
}

interface InternetDialogResultProps {
  closeParent: () => void,
  driveIndex: number,
  identifier: string,
  title: string,
  creator: string,
  downloads: number,
  month: number,
  num_reviews: number
}

const InternetArchiveResult = (props: InternetDialogResultProps) => {
  const handleTileClick = () => {
    const detailsUrl = `https://archive.org/details/${props.identifier}?output=json`
    const favicon: { [key: string]: string } = {}
    favicon[iconKey()] = iconData()

    document.body.style.cursor = "wait"
    fetch(iconName() + detailsUrl, { headers: favicon })
      .then(async response => {
        if (response.ok) {
          const json = await response.json()
          if (json.metadata && json.metadata.emulator_ext && json.files) {
            const emulatorExt = json.metadata.emulator_ext.toString().toLowerCase()
            let imageUrl = ""

            Object.keys(json.files).forEach((file) => {
              if (file.toLowerCase().endsWith(emulatorExt)) {
                imageUrl = `https://archive.org/download/${props.identifier}${file}`
              }
            })

            if (imageUrl != "") {
              props.closeParent()
              handleSetDiskFromURL(imageUrl, undefined, props.driveIndex)
            } else {
              // $TODO: add error handling
            }
          } else {
            // $TODO: add error handling
          }
        } else {
          // $TODO: add error handling
        }
      })
      .finally(() => {
        document.body.style.cursor = "default"
      })
  }

  const handleStatsClick = () => {
    window.open(`https://archive.org/details/${props.identifier}`, "_blank")
    return false
  }

  return (
    <div className="iad-result-tile" title="Press to load disk image">
      <img className="iad-result-image" src={`https://archive.org/services/img/${props.identifier}`} onClick={handleTileClick}></img>
      <div className="iad-result-title" title={props.title}>
        {props.title}
      </div>
      <div className="iad-result-creator" title={props.creator}>
        {props.creator
          ? `by ${props.creator}`
          : ""}
      </div>
      <div className="iad-stats" title="Press to view details" onClick={handleStatsClick}>
        <div className="iad-stats-row">
          <svg className="iad-stats-icon" style={{
            gridRow: "1/3",
            width: "24px",
            height: "24px",
            paddingLeft: "0px",
            marginTop: "-2px"
          }}>{svgInternetArchiveSoftware}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-1px", marginLeft: "11px" }}>{svgInternetArchiveViews}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-2px", marginLeft: "11px" }}>{svgInternetArchiveFavorites}</svg>
          <svg className="iad-stats-icon" style={{ marginLeft: "14px" }}>{svgInternetArchiveReviews}</svg>
          <div>
            {formatNumber(props.downloads)}
          </div>
          <div style={{ paddingLeft: "4px" }}>
            {formatNumber(props.month || 0)}
          </div>
          <div style={{ marginRight: "-8px" }}>
            {formatNumber(props.num_reviews || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface InternetArchiveDialogProps {
  driveIndex: number
  open: boolean
  onClose: () => void
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const [results, setResults] = useState<InternetDialogResultProps[]>([])
  const [query, setQuery] = useState<string>("")
  const [collection, setCollection] = useState<SoftwareCollection>(softwareCollections[0])

  const handleClose = () => {
    props.onClose()
    setResults([])
  }

  const handleSearchBoxKeyDown = (event: { key: string }) => {
    if (event.key === "Enter") {
      const searchBox = document.getElementsByClassName("iad-search-box")[0] as HTMLInputElement
      getResults(searchBox.value, collection)
    } else if (event.key == "Escape") {
      handleClose()
    }
  }

  const handleCollectionClick = (collectionIndex: number) => () => {
    getResults(query, softwareCollections[collectionIndex])
  }

  const handleSearchButtonClick = () => {
    getResults(query, collection)
  }

  const getResults = async (newQuery: string, newCollection: SoftwareCollection) => {
    setQuery(newQuery)
    setCollection(newCollection)

    const queryUrl = formatString(queryFormat, newQuery || "*", newCollection.id)
    document.body.style.cursor = "wait"
    fetch(queryUrl)
      .then(async response => {
        if (response.ok) {
          const json = await response.json()
          if (json) {
            const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
            setResults(json.response.docs)
            dialog.style.height = "85%"
          }
        } else {
          // $TODO: add error handling
          console.log(`response=${response.status}`)
        }
      })
      .finally(() => {
        document.body.style.cursor = "default"
      })
  }

  if (!props.open) return (<></>)

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="internet-archive-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="iad-header">
          <svg fill="#ffffff" viewBox="0 0 55 55" className="iad-logo">{svgInternetArchiveLogo}</svg>
          <svg className="iad-title">{svgInternetArchiveTitle}</svg>
        </div>
        <div style={{overflowY: "auto"}}>
          <div className="iad-search">
            <div className="iad-collections">
              {softwareCollections.map((softwareCollection, index) => (
                <div key={`divcollect-${index}`} 
                  className={`iad-collection-tile ${softwareCollection == collection ? "iad-collection-tile-selected" : ""}`}>
                  <img key={`collection-${index}`} className="iad-collection-image" src={softwareCollection.imageUrl} onClick={handleCollectionClick(index)}></img>
                  <div className="iad-collection-title">{softwareCollection.title}</div>
                </div>
              ))}
            </div>
            <div className="iad-search-panel">
              <input
                className="iad-search-box"
                type="text"
                placeholder="Search"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                autoFocus
                onChange={(event) => {setQuery(event.target.value)}}
                onKeyDown={handleSearchBoxKeyDown} />
              <input className="iad-search-button" type="button" value="GO" onClick={handleSearchButtonClick} />
            </div>
          </div>
          {results.length > 0 &&
            <div className="iad-search-results">
              {results.map((result, index) => (
                <InternetArchiveResult key={`result-${index}`} {...result} closeParent={handleClose} driveIndex={props.driveIndex} />
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

export default InternetArchiveDialog