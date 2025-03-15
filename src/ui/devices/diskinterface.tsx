import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import Flyout from "../flyout"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"
import ImageWriter from "./imagewriter"
import { handleGetTheme } from "../main2worker"
import { UI_THEME } from "../../common/utility"
import { useState } from "react"

const DiskInterface = (props: DisplayProps) => {
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(true)
  const isMinimalTheme = handleGetTheme() == UI_THEME.MINIMAL

  return (
    <Flyout
      icon={faFloppyDisk}
      title="disk drive panel"
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      position="bottom-left">
      <div className={`${isMinimalTheme ? "flex-column" : "flex-row"} wrap`}>
        <span className="flex-row wrap">
          <DiskImageChooser {...props} />
          <DiskDrive key={0} index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={1} index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
        </span>
        <span className="flex-row wrap">
          {isMinimalTheme && <ImageWriter />}
          <DiskDrive key={2} index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={3} index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {!isMinimalTheme && <ImageWriter />}
        </span>
      </div>
    </Flyout>
  )
}

export default DiskInterface