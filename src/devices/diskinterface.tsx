import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import Flyout from "../flyout"
import { faFloppyDisk } from "@fortawesome/free-solid-svg-icons"

const DiskInterface = (props: DisplayProps) => {
  return (
    <Flyout icon={faFloppyDisk} width="10%" position="top-right">
      <DiskImageChooser {...props} />
      <DiskDrive
        index={2}
        renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive
        index={3}
        renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive
        index={0}
        renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive
        index={1}
        renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
    </Flyout>
  )
}

export default DiskInterface