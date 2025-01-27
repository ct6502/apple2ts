import { useState } from "react"
import { crc32, uint32toBytes } from "../emulator/utility/utility"
import { imageList } from "./assets"
import { handleSetDiskData, handleGetDriveProps, handleSetDiskWriteProtected, handleOpenOneDrivePicker } from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLock,
  faLockOpen,
  faCloud
} from "@fortawesome/free-solid-svg-icons";

const downloadDisk = (diskData: Uint8Array, filename: string) => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith('.woz')) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  const blob = new Blob([diskData]);
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const resetDrive = (index: number) => {
  //  const dprops = handleGetDriveProps(index)
  handleSetDiskData(index, new Uint8Array(), "")
}

type DiskDriveProps = {
  index: number,
  renderCount: number,
  setShowFileOpenDialog: (show: boolean, index: number) => void
}

const DiskDrive = (props: DiskDriveProps) => {
  const dprops = handleGetDriveProps(props.index)

  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const menuNames = ['Download Disk', 'Download and Eject Disk', 'Eject Disk']
  const menuChoices = [0, 1, 2]

  const handleMenuClick = (event: React.MouseEvent) => {
    if (dprops.filename.length > 0) {
      const y = Math.min(event.clientY, window.innerHeight - 200)
      setPosition({ x: event.clientX, y: y })
      setMenuOpen(true)
    } else {
      props.setShowFileOpenDialog(true, props.index)
    }
  }

  const handleMenuClose = (menuChoice = -1) => {
    setMenuOpen(false)
    if (menuChoice === 0 || menuChoice === 1) {
      if (dprops.diskData.length > 0) {
        downloadDisk(dprops.diskData, filename)
        dprops.diskHasChanges = false
      }
    }
    if (menuChoice === 1 || menuChoice === 2) {
      resetDrive(props.index)
    }
  }

  let img1: string
  if (dprops.hardDrive) {
    img1 = dprops.motorRunning ? imageList.hardDriveOn : imageList.hardDriveOff
  } else {
    img1 = (dprops.filename.length > 0) ?
      (dprops.motorRunning ? imageList.disk2on : imageList.disk2off) :
      (dprops.motorRunning ? imageList.disk2onEmpty : imageList.disk2offEmpty)
  }
  const filename = (dprops.filename.length > 0) ? dprops.filename : ""
  let status = ['S7D1', 'S7D2', 'S6D1', 'S6D2'][props.index]
  status += dprops.status
  return (
    <span className="flex-column">
      <img className="disk-image"
        src={img1} alt={filename}
        id={dprops.index === 0 ? "tour-floppy-disks" : ""}
        title={filename + (dprops.diskHasChanges ? ' (modified)' : '')}
        onClick={handleMenuClick} />
      <span className={"disk-label" + (dprops.diskHasChanges ? " disk-label-unsaved" : "")}>
        {dprops.diskHasChanges ? '*' : ''}{dprops.filename}</span>
      <span className="flex-row">
        <FontAwesomeIcon icon={faCloud} className="disk-one-drive fa-fw" title="OneDrive" onClick={() => {handleOpenOneDrivePicker(props.index)}}>
        </FontAwesomeIcon>
        <FontAwesomeIcon icon={dprops.isWriteProtected ? faLock : faLockOpen} className="disk-write-protected fa-fw" title={dprops.isWriteProtected ? "Write Protected" : "Write Enabled"}
          onClick={() => { handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected) }}>
        </FontAwesomeIcon>
        <span className={"default-font disk-status"}>{status}</span>
      </span>

      {menuOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleMenuClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {menuChoices.map((i) => (
              <div className="droplist-option"
                style={{ padding: '5px', paddingLeft: '10px', paddingRight: '10px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleMenuClose(i)}>
                {menuNames[i]}
              </div>))}
          </div>
        </div>
      }
    </span>
  )
}

export default DiskDrive;
