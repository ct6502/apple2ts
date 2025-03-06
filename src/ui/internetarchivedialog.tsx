import { useState } from "react";
import { svgInternetArchiveLogo, svgInternetArchiveTitle } from "./img/icon_internetarchive";
import "./internetarchivedialog.css"

const queryFormat = "https://archive.org/advancedsearch.php?q=title:({0})+AND+collection:(softwarelibrary_apple)+AND+mediatype:(software)&fl[]=identifier&fl[]=downloads&fl[]=title&rows=100&page=1&output=json"

function formatString(template: string, ...args: any[]): string {
    return template.replace(/{(\d+)}/g, (match, index) => {
        return typeof args[index] !== 'undefined' ? args[index] : match;
    });
}

export interface InternetArchiveDialogProps {
  open: boolean;
  onClose: () => void;
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const { open, onClose } = props
  const [results, setResults] = useState("");

  const handleClose = () => {
    onClose()
    setResults("")
  }

  const getResults = async (query: string) => {
    if (query.length >= 3) {
    const queryUrl = formatString(queryFormat, [query])

    fetch(queryUrl)
      .then(async response => {
        if (response.ok) {
          const json = await response.json()

          if (json != "") {
            const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
            dialog.style.height = "75%"
            setResults(JSON.stringify(json))
          }
        } else {
          //
        }
      })
    } else {
      setResults("")
    }
  }

  {/* <Dialog onClose={handleClose} open={open}> */ }
  if (!open) return (<></>)

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="internet-archive-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="iad-header">
          <svg fill="#ffffff" viewBox="0 0 55 55" className="iad-logo">{svgInternetArchiveLogo}</svg>
          <svg className="iad-title">{svgInternetArchiveTitle}</svg>
        </div>
        <div className="iad-search">
          <input className="iad-search-box" type="text" placeholder="Search" onChange={(event) => {
            // if (event.key === "Enter") {
              // const button = document.getElementsByClassName("iad-search-button")[0] as HTMLElement
              // button.click();
            // }
            const searchBox = document.getElementsByClassName("iad-search-box")[0] as HTMLInputElement
            getResults(searchBox.value)
          }}></input>
          {/* <input className="iad-search-button" type="button" value="GO" onClick={() => {
            const searchBox = document.getElementsByClassName("iad-search-box")[0] as HTMLInputElement
            getResults(searchBox.value)
          }}></input> */}
        </div>
        {results != "" && <div className="iad-search-results">${results}</div>}
      </div>
    </div>
  )
}

export default InternetArchiveDialog