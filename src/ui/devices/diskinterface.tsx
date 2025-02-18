import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import Flyout from "../flyout"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"

const DiskInterface = (props: DisplayProps) => {
  return (
    <Flyout icon={faFloppyDisk} width="auto" position="bottom-left">
      <div className="flex-row wrap">
        <span className="flex-row">
          <DiskImageChooser {...props} />
          <DiskDrive index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
        </span>
        <span className="flex-row">
          <DiskDrive index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
        </span>
      </div>
    </Flyout>
  )
}

export default DiskInterface