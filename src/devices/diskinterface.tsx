import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"

const DiskInterface = (props: DisplayProps) => {
  return (
    // <div className="flex-row wrap">
    <div className="diskInterface">
      {/* <span className="flex-row">
        <DiskImageChooser {...props} />
      </span> */}
      {/* <span className="flex-row"> */}
        <DiskDrive index={2} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      {/* </span> */}
      {/* <span className="flex-row"> */}
        <DiskDrive index={3} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      {/* </span> */}
      {/* <span className="flex-row"> */}
        <DiskDrive index={0} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      {/* </span> */}
      <span className="flex-row">
        <DiskDrive index={1} renderCount={props.renderCount}
          setShowFileOpenDialog={props.setShowFileOpenDialog} />
      </span>
    </div>
  )
}

export default DiskInterface