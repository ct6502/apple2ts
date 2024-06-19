import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"

const DiskInterface = (props: DisplayProps) => {
  return (
    <div className="flex-row wrap">
      <span className="flex-row">
        <DiskImageChooser {...props} />
        <DiskDrive drive={0} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      </span>
      <span className="flex-row">
        <DiskDrive drive={1} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
        <DiskDrive drive={2} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      </span>
    </div>
  )
}

export default DiskInterface