import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"

interface DiskInterfaceProps {
  setShowFileOpenDialog: (show: boolean, drive: number) => void
}

const DiskInterface = (props: DiskInterfaceProps) => {
  return (
    <span className="driveRow">
      <DiskImageChooser />
      <DiskDrive drive={0} setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive drive={1} setShowFileOpenDialog={props.setShowFileOpenDialog} />
      <DiskDrive drive={2} setShowFileOpenDialog={props.setShowFileOpenDialog} />
    </span>
  )
}

export default DiskInterface