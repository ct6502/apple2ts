import { handleGetDriveProps } from "./driveprops"


const DriveStatus = () => {
  const dprops = handleGetDriveProps(0)

  return (
    <span className={(dprops.diskHasChanges ? " disk-label-unsaved" : "")}>
      {dprops.diskHasChanges ? "*" : ""}{dprops.filename}</span>
  )
}

export default DriveStatus