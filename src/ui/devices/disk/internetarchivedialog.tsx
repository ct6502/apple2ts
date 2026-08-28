import { useEffect, useRef, useState } from "react"
import "./internetarchivedialog.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faStar as faStarOutline } from "@fortawesome/free-regular-svg-icons"
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons"
import { DiskBookmarks } from "./diskbookmarks"
import { svgInternetArchiveSoftware, svgInternetArchiveViews, svgInternetArchiveFavorites, svgInternetArchiveReviews, svgInternetArchiveLogo, svgInternetArchiveTitle } from "../../img/icon_internetarchive"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import { showGlobalProgressModal } from "../../ui_utilities"
import { generateUrlFromInternetArchiveId } from "./internetarchive_utils"
import { useTranslation } from "../../../i18n/useTranslation"
import {
  createInternetArchiveCloudData,
  INTERNET_ARCHIVE_PAGE_SIZE,
  internetArchiveCollections,
  loadInternetArchiveResult,
  searchInternetArchive,
  type InternetArchiveCollection,
  type InternetArchiveResult,
} from "./internetarchive"

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

type InternetDialogResultProps = InternetArchiveResult & {
  onLoadSuccess: () => void,
  diskBookmarks: DiskBookmarks,
  driveIndex: number,
  lastResult: boolean
}

const InternetArchiveResult = (props: InternetDialogResultProps) => {
  const { t } = useTranslation()
  const handleTileClick = async () => {
    const loaded = await loadInternetArchiveResult(props, props.driveIndex)
    if (loaded) props.onLoadSuccess()
  }

  const handleStatsClick = () => {
    window.open(detailsUrl.toString(), "_blank")
    return false
  }

  const handleBookmarkAddClicked = async () => {
    const url = generateUrlFromInternetArchiveId(props.identifier).toString()
    props.diskBookmarks.set({
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      id: props.identifier,
      title: props.title,
      screenshotUrl: screenshotUrl,
      diskUrl: url,
      detailsUrl: detailsUrl,
      lastUpdated: new Date(),
      cloudData: createInternetArchiveCloudData(props)
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
      title={t("disk.clickToLoadDiskImage")}>
      <div className="iad-result-bookmark">
        <FontAwesomeIcon
          size="2x"
          className="iad-result-bookmark-icon"
          onClick={bookmarked ? handleBookmarkRemoveClicked : handleBookmarkAddClicked}
          title={bookmarked ? t("disk.clickToRemoveFromDiskCollection") : t("disk.clickToAddToDiskCollection")}
          icon={bookmarked ? faStarSolid : faStarOutline} />
      </div>
      <img className="iad-result-image" src={screenshotUrl.toString()} onClick={handleTileClick}></img>
      <div className="iad-result-title" title={props.title} onClick={handleTileClick}>
        {props.title}
      </div>
      <div className="iad-result-creator" title={props.creator}>
        {props.creator
          ? t("disk.byCreator", { creator: props.creator })
          : ""}
      </div>
      <div className="iad-stats" title={t("disk.clickToViewDetails")} onClick={handleStatsClick}>
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
  onLoadSuccess?: () => void
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const { onClose, open } = props
  const { t } = useTranslation()
  const [results, setResults] = useState<InternetArchiveResult[]>([])
  const [diskBookmarks, setDiskbookmarks] = useState<DiskBookmarks>(new DiskBookmarks())
  const [resultsCount, setResultsCount] = useState<number>(0)
  const [query, setQuery] = useState<string>("")
  const [collection, setCollection] = useState<InternetArchiveCollection>(internetArchiveCollections[0])
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

  const getResults = async (newQuery: string, newCollection: InternetArchiveCollection, pagedResults = false) => {
    if (!pagedResults) {
      setQuery(newQuery)
      setCollection(newCollection)
    }

    const pageNumber = pagedResults ? (results.length / INTERNET_ARCHIVE_PAGE_SIZE) + 1 : 1

    showGlobalProgressModal(true, "Fetching query results")
    searchInternetArchive(newQuery, newCollection.id, pageNumber)
      .then(page => {
        if (pagedResults) {
          setResults(results.concat(page.results))
        } else {
          setDiskbookmarks(new DiskBookmarks())
          setResults(page.results)
          setResultsCount(page.total)
        }

        const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
        dialog.style.height = "85%"
      })
      .finally(() => {
        showGlobalProgressModal(false)
      })
  }

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
    }
  }

  const handleCollectionClick = (collectionIndex: number) => () => {
    getResults(query, internetArchiveCollections[collectionIndex])
  }

  const handleSearchButtonClick = () => {
    getResults(query, collection)
  }

  useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      event.stopPropagation()
      onClose()
      setQuery("")
      setResults([])
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onClose, open])

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
              {internetArchiveCollections.map((softwareCollection, index) => (
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
                placeholder={t("internetArchive.searchPlaceholder")}
                autoCorrect="off"
                autoComplete="off"
                spellCheck="false"
                autoFocus
                onChange={(event) => { setQuery(event.target.value) }}
                onKeyDown={handleSearchBoxKeyDown} />
              <input
                className="iad-search-button"
                name="searchButton"
                type="button"
                value={t("internetArchive.go")}
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
                    onLoadSuccess={() => {
                      handleClose()
                      props.onLoadSuccess?.()
                    }}
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
