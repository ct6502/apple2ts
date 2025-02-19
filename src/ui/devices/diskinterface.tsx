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
      isOpen={() => { return isFlyoutOpen }}
      onClick={() => { setIsFlyoutOpen(!isFlyoutOpen) }}
      position="bottom-left">
      <div className={`${isMinimalTheme ? 'flex-column' : 'flex-row'} wrap`}>
        <span className="flex-row wrap">
          <DiskImageChooser {...props} />
          <DiskDrive index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
        </span>
        <span className="flex-row wrap">
          {isMinimalTheme && <ImageWriter />}
          <DiskDrive index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {!isMinimalTheme && <ImageWriter />}
        </span>
      </div>
    </Flyout>
  )
}

export default DiskInterface