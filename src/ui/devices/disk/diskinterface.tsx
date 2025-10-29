import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import { faHdd } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import Flyout from "../../flyout"
import ImageWriter from "../printer/imagewriter"
import { isMinimalTheme } from "../../ui_settings"

const DiskInterface = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(true)

  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const isScreenNarrow = width < height

  return (
    <Flyout
      icon={faHdd}
      title="disk drives and devices"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      position="bottom-left">
      <div className={`${isMinimalTheme() && isScreenNarrow ? "flex-column" : "flex-row"} wrap`}>
        <span className="flex-row wrap">
          {!isMinimalTheme() && <DiskImageChooser {...props} />}
          <DiskDrive key={0} index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={1} index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(isMinimalTheme() && isScreenNarrow) && <ImageWriter />}
        </span>
        <span className="flex-row wrap">
          <DiskDrive key={2} index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={3} index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(!isMinimalTheme() || !isScreenNarrow) && <ImageWriter />}
        </span>
      </div>
    </Flyout>
  )
}

export default DiskInterface