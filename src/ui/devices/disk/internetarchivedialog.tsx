import { useEffect, useRef, useState } from "react"
import "./internetarchivedialog.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons"
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons"
import { DiskBookmarks } from "./diskbookmarks"
import { CLOUD_SYNC } from "../../../common/utility"
import { svgInternetArchiveSoftware, svgInternetArchiveViews, svgInternetArchiveFavorites, svgInternetArchiveReviews, svgInternetArchiveLogo, svgInternetArchiveTitle } from "../../img/icon_internetarchive"
import { DISK_COLLECTION_ITEM_TYPE } from "../../panels/diskcollectionpanel"
import { showGlobalProgressModal } from "../../ui_utilities"
import { handleSetDiskFromURL } from "./driveprops"
import { generateUrlFromInternetArchiveId } from "./internetarchive_utils"

const queryMaxRows = 25
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
  "page={2}",
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
    imageUrl: "/collections/softwarelibrary_apple_itemimage.jpg"
  },
  {
    id: "softwarelibrary_apple_games",
    title: "The Apple II Library: Games",
    imageUrl: "/collections/softwarelibrary_apple_games_itemimage.jpg"
  },
  {
    id: "softwarelibrary_apple_woz_educational",
    title: "Software Library: Apple Educational",
    imageUrl: "/collections/softwarelibrary_apple_woz_educational_itemimage.jpg"
  },
  {
    id: "apple_ii_library_4am",
    title: "Apple II Library: The 4am Collection",
    imageUrl: "/collections/apple_ii_library_4am_itemimage.jpg"
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
  diskBookmarks: DiskBookmarks,
  driveIndex: number,
  lastResult: boolean,
  identifier: string,
  title: string,
  creator: string,
  downloads: number,
  month: number,
  num_reviews: number
}

const InternetArchiveResult = (props: InternetDialogResultProps) => {
  const handleTileClick = async () => {
    const cloudData: CloudData = {
      providerName: "InternetArchive",
      syncStatus: CLOUD_SYNC.INACTIVE,
      syncInterval: -1,
      lastSyncTime: Number.MAX_VALUE,
      fileName: "",
      itemId: props.identifier,
      apiEndpoint: "",
      downloadUrl: generateUrlFromInternetArchiveId(props.identifier).toString(),
      detailsUrl: `https://archive.org/details/${props.identifier}`
    }

    props.closeParent()
    handleSetDiskFromURL(cloudData.downloadUrl, undefined, props.driveIndex, cloudData)
  }

  const handleStatsClick = () => {
    window.open(detailsUrl.toString(), "_blank")
    return false
  }

  const handleBookmarkAddClicked = async () => {
    props.diskBookmarks.set({
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      id: props.identifier,
      title: props.title,
      screenshotUrl: screenshotUrl,
      diskUrl: generateUrlFromInternetArchiveId(props.identifier),
      detailsUrl: detailsUrl,
      lastUpdated: new Date(),
      cloudData: {
        providerName: "InternetArchive",
        syncStatus: CLOUD_SYNC.INACTIVE,
        syncInterval: -1,
        lastSyncTime: Number.MAX_VALUE,
        fileName: "",
        itemId: props.identifier,
        apiEndpoint: "",
        downloadUrl: generateUrlFromInternetArchiveId(props.identifier).toString(),
        detailsUrl: `https://archive.org/details/${props.identifier}`
      }
    })
    setBookmarked(true)
  }

  const handleBookmarkRemoveClicked = () => {
    props.diskBookmarks.remove(props.identifier)
    setBookmarked(false)
  }

  const detailsUrl = new URL(`https://archive.org/details/${props.identifier}`)
  const screenshotUrl = new URL(`https://archive.org/services/img/${props.identifier}`)

  const [bookmarked, setBookmarked] = useState<boolean>(props.diskBookmarks.contains(props.identifier))

  return (
    <div
      className={`iad-result-tile ${props.lastResult ? "iad-result-last" : ""}`}
      title="Click to load disk image">
      <div className="iad-result-bookmark">
        <FontAwesomeIcon
          size="2x"
          className="iad-result-bookmark-icon"
          onClick={bookmarked ? handleBookmarkRemoveClicked : handleBookmarkAddClicked}
          title={`Click to ${bookmarked ? "remove from" : "add to"} disk collection`}
          icon={bookmarked ? faStarSolid : faStarOutline} />
      </div>
      <img className="iad-result-image" src={screenshotUrl.toString()} onClick={handleTileClick}></img>
      <div className="iad-result-title" title={props.title}>
        {props.title}
      </div>
      <div className="iad-result-creator" title={props.creator}>
        {props.creator
          ? `by ${props.creator}`
          : ""}
      </div>
      <div className="iad-stats" title="Click to view details" onClick={handleStatsClick}>
        <div className="iad-stats-row">
          <svg className="iad-stats-icon" style={{
            gridRow: "1/3",
            width: "24px",
            height: "24px",
            paddingLeft: "0px",
            marginTop: "-2px"
          }}>{svgInternetArchiveSoftware}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-2px", marginLeft: "12px" }}>{svgInternetArchiveViews}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-2px", marginLeft: "14px" }}>{svgInternetArchiveFavorites}</svg>
          <svg className="iad-stats-icon" style={{ marginLeft: "16px" }}>{svgInternetArchiveReviews}</svg>
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
  const [diskBookmarks, setDiskbookmarks] = useState<DiskBookmarks>(new DiskBookmarks())
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [query, setQuery] = useState<string>("")
  const [collection, setCollection] = useState<SoftwareCollection>(softwareCollections[0])
  const [isIntersecting, setIsIntersecting] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      { rootMargin: "0px" }
    )
    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [isIntersecting, results])

  useEffect(() => {
    if (isIntersecting && ref.current) {
      const lastElement = (ref.current as HTMLElement).getElementsByClassName("iad-result-last")[0]
      if (lastElement) {
        lastElement.classList.remove("iad-result-last")
        getResults(query, collection, true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isIntersecting])

  const handleClose = () => {
    props.onClose()
    setQuery("")
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

  const getResults = async (newQuery: string, newCollection: SoftwareCollection, pagedResults = false) => {
    if (!pagedResults) {
      setQuery(newQuery)
      setCollection(newCollection)
    }

    const pageNumber = pagedResults ? (results.length / queryMaxRows) + 1 : 1
    const queryUrl = formatString(queryFormat, newQuery || "*", newCollection.id, pageNumber.toString())

    showGlobalProgressModal(true, "Fetching query results")
    fetch(queryUrl)
      .then(async response => {
        if (response.ok) {
          const json = await response.json()
          if (json) {
            if (pagedResults) {
              setResults(results.concat(json.response.docs))
            } else {
              setDiskbookmarks(new DiskBookmarks())
              setResults(json.response.docs)
              setResultsCount(json.response.numFound)
            }

            const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
            dialog.style.height = "85%"
          }
        } else {
          // $TODO: add error handling
        }
      })
      .finally(() => {
        showGlobalProgressModal(false)
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
        <div style={{ overflowY: "auto" }}>
          <div className="iad-search">
            <div className="iad-collections">
              {softwareCollections.map((softwareCollection, index) => (
                <div key={`divcollect-${index}`}
                  className={`iad-collection-tile ${softwareCollection == collection ? "iad-collection-tile-selected" : ""}`}>
                  <img key={`collection-${index}`}
                    className="iad-collection-image"
                    src={softwareCollection.imageUrl}
                    onClick={handleCollectionClick(index)}></img>
                  <div className="iad-collection-title">{softwareCollection.title}</div>
                </div>
              ))}
            </div>
            <div className="iad-search-panel">
              <input
                className="iad-search-box"
                name="search"
                type="text"
                placeholder="Type the name of a software title or click one of the categories above"
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                autoFocus
                onChange={(event) => { setQuery(event.target.value) }}
                onKeyDown={handleSearchBoxKeyDown} />
              <input className="iad-search-button"
                name="searchButton"
                type="button"
                value="GO"
                onClick={handleSearchButtonClick} />
            </div>
          </div>
          {results.length > 0 &&
            <div className="iad-search-results">
              {results.map((result, index) => (
                <div key={`parent-result-${result.identifier}`} ref={resultsCount > results.length && index == results.length - 1 ? ref : null}>
                  <InternetArchiveResult
                    key={`result-${result.identifier}`}
                    {...result}
                    closeParent={handleClose}
                    diskBookmarks={diskBookmarks}
                    driveIndex={props.driveIndex}
                    lastResult={resultsCount > results.length && index == results.length - 1} />
                </div>
              ))}
            </div>}
        </div>
      </div>
    </div>
  )
}

export default InternetArchiveDialog