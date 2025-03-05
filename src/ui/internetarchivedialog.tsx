import { svgInternetArchiveLogo, svgInternetArchiveTitle } from "./img/icon_internetarchive";
import "./internetarchivedialog.css"

export interface InternetArchiveDialogProps {
  open: boolean;
  onClose: () => void;
}

const InternetArchiveDialog = (props: InternetArchiveDialogProps) => {
  const { open, onClose } = props

  const handleClose = () => {
    onClose()
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
          <input className="iad-search-box" type="text" placeholder="Search"></input>
          <input className="iad-search-button" type="button" value="GO"></input>
        </div>
        <div className="iad-search-results">
        </div>
      </div>
    </div>
  )
}

export default InternetArchiveDialog