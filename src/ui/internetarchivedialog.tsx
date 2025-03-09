import { useState } from "react";
import { svgInternetArchiveLogo, svgInternetArchiveTitle } from "./img/icon_internetarchive";
import "./internetarchivedialog.css";

const queryMaxRows = 100;
const queryFormat = "https://archive.org/advancedsearch.php?" + [
  "q=title:({0})+AND+collection:(softwarelibrary_apple)+AND+mediatype:(software)",
  "fl[]=identifier",
  "fl[]=downloads",
  "fl[]=title",
  "fl[]=creator",
  "sort[]=downloads+asc",
  "sort[]=stars+asc",
  "sort[]=",
  `rows=${queryMaxRows}`,
  "page=1",
  "output=json"
  ].join("&");

function formatString(template: string, ...args: any[]): string {
  return template.replace(/{(\d+)}/g, (match, index) => {
    return typeof args[index] !== 'undefined' ? args[index] : match;
  });
}

interface InternetDialogResultProps {
  identifier: string,
  title: string,
  creator: string
}

const InternetArchiveResult = (props: InternetDialogResultProps) => {
  return (
    <span className="iad-result-tile">
      <img className="iad-result-image" src={`https://archive.org/services/img/${props.identifier}`}></img>
      <div className="iad-result-title">
        {props.title}
      </div>
      <div>
        by {props.creator}
      </div>
    </span>
  )
}

export interface InternetArchiveDialogProps {
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
    }
  }

  const handleSearchButtonClick = () => {
    const searchBox = document.getElementsByClassName("iad-search-box")[0] as HTMLInputElement
    getResults(searchBox.value)
  }

  const getResults = async (query: string) => {
    if (query.length >= 3) {
      const queryUrl = formatString(queryFormat, [query])

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
            //
          }
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
          <input className="iad-search-box" type="text" placeholder="Search" spellCheck="false" autoFocus onKeyDown={handleSearchBoxKeyDown}/>
          <input className="iad-search-button" type="button" value="GO" onClick={handleSearchButtonClick}/>
        </div>
        {results.length > 0 &&
          <div className="iad-search-results">
            {results.map((result, index) => (
              <InternetArchiveResult key={index} {...result} />
            ))}
          </div>}
      </div>
    </div>
  )
}

export default InternetArchiveDialog