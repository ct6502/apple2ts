import React from "react"
import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"

class DiskInterface extends React.Component<object, object> {
  render() {
    return (
      <span className="driveRow">
        <DiskImageChooser/>
        <DiskDrive drive={0}/>
        <DiskDrive drive={1}/>
        <DiskDrive drive={2}/>
      </span>
    );
  }
}

export default DiskInterface;
