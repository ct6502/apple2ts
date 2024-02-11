import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"

const DiskInterface = (props: DisplayProps) => {
  return (
    <span className="driveRow">
      <DiskImageChooser {...props} />
      <DiskDrive drive={0} renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive drive={1} renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive drive={2} renderCount={props.renderCount}
        setShowFileOpenDialog={props.setShowFileOpenDialog} />
    </span>
  )
}

export default DiskInterface