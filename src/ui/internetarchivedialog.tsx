import { useState } from "react";
import { svgInternetArchiveFavorites, svgInternetArchiveLogo, svgInternetArchiveReviews, svgInternetArchiveSoftware, svgInternetArchiveTitle, svgInternetArchiveViews } from "./img/icon_internetarchive";
import "./internetarchivedialog.css";
import { handleSetDiskFromURL } from "./devices/driveprops";
import { iconData, iconKey, iconName } from "./img/iconfunctions";

const queryMaxRows = 100;
const queryFormat = "https://archive.org/advancedsearch.php?" + [
  "q=title:({0})+AND+collection:(softwarelibrary_apple)+AND+mediatype:(software)",
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
].join("&");

function formatString(template: string, ...args: any[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}

function formatNumber(num: number, precision = 1) {
  if (num < 1000) {
    return num
  }

  const map = [
    { suffix: 'T', threshold: 1e12 },
    { suffix: 'B', threshold: 1e9 },
    { suffix: 'M', threshold: 1e6 },
    { suffix: 'K', threshold: 1e3 },
    { suffix: '', threshold: 1 },
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
  }

  return (
    <div className="iad-result-tile" title="Press to load disk image" onClick={handleTileClick}>
      <img className="iad-result-image" src={`https://archive.org/services/img/${props.identifier}`}></img>
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
          <svg className="iad-stats-icon" style={{ gridRow: "span 1/2" }}>{svgInternetArchiveSoftware}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-1px", marginLeft: "4px" }}>{svgInternetArchiveViews}</svg>
          <svg className="iad-stats-icon" style={{ marginTop: "-2px", marginLeft: "4px" }}>{svgInternetArchiveFavorites}</svg>
          <svg className="iad-stats-icon" style={{ marginLeft: "10px" }}>{svgInternetArchiveReviews}</svg>
        </div>
        <div className="iad-stats-row">
          <div></div>
          <div>
            {formatNumber(props.downloads)}
          </div>
          <div>
            {formatNumber(props.month || 0)}
          </div>
          <div>
            {formatNumber(props.num_reviews || 0)}
          </div>
        </div>
      </div>
    </div>
  )
}

export interface InternetArchiveDialogProps {
  driveIndex: number;
  open: boolean;
  onClose: () => void;
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const [results, setResults] = useState<InternetDialogResultProps[]>([]);

  const handleClose = () => {
    props.onClose()
    setResults([])
  }

  const handleSearchBoxKeyDown = (event: { key: string; }) => {
    if (event.key === "Enter") {
      const button = document.getElementsByClassName("iad-search-button")[0] as HTMLElement
      button.click();
    } else if (event.key == "Escape") {
      handleClose()
    }
  }

  const handleSearchButtonClick = () => {
    const searchBox = document.getElementsByClassName("iad-search-box")[0] as HTMLInputElement
    getResults(searchBox.value)
  }

  const getResults = async (query: string) => {
    if (query.length >= 3) {
      const queryUrl = formatString(queryFormat, [query])

      document.body.style.cursor = "wait"
      fetch(queryUrl)
        .then(async response => {
          if (response.ok) {
            const json = await response.json()
            if (json) {
              const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
              setResults(json.response.docs)
              dialog.style.height = "75%"
            }
          } else {
            // $TODO: add error handling
          }
        })
        .finally(() => {
          document.body.style.cursor = "default"
        })
    } else {
      setResults([])
    }
  }

  if (!props.open) return (<></>)

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="internet-archive-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="iad-header">
          <svg fill="#ffffff" viewBox="0 0 55 55" className="iad-logo">{svgInternetArchiveLogo}</svg>
          <svg className="iad-title">{svgInternetArchiveTitle}</svg>
        </div>
        <div className="iad-search">
          <input
            className="iad-search-box"
            type="text"
            placeholder="Search"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
            autoFocus
            onKeyDown={handleSearchBoxKeyDown} />
          <input className="iad-search-button" type="button" value="GO" onClick={handleSearchButtonClick} />
        </div>
        {results.length > 0 &&
          <div className="iad-search-results">
            {results.map((result, index) => (
              <InternetArchiveResult key={index} {...result} closeParent={handleClose} driveIndex={props.driveIndex} />
            ))}
          </div>}
      </div>
    </div>
  )
}

export default InternetArchiveDialog