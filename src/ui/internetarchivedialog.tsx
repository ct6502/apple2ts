import { svgInternetArchiveLogo, svgInternetArchiveTitle } from "./img/icon_internetarchive";
import "./internetarchivedialog.css"

export interface InternetArchiveDialogProps {
  open: boolean;
  onClose: () => void;
}

let results: string = ""

const getResults = () => {
  results = "No results found"
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const { open, onClose } = props

  const handleClose = () => {
    onClose()
    results = ""
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
          <input className="iad-search-box" type="text" placeholder="Search" onKeyUp={(event) => {
            if (event.key === "Enter") {
              const button = document.getElementsByClassName("iad-search-button")[0] as HTMLElement
              button.click();
            }
          }}></input>
          <input className="iad-search-button" type="button" value="GO" onClick={() => {
            const dialog = document.getElementsByClassName("internet-archive-dialog")[0] as HTMLElement
            if (dialog) {
              dialog.style.height = "75%"
              getResults()
            }
          }}></input>
        </div>
        {results && <div className="iad-search-results">${results}</div>}
      </div>
    </div>
  )
}

export default InternetArchiveDialog