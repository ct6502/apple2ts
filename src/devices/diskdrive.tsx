import { useState } from "react"
import { crc32, FLOPPY_DISK_SUFFIXES, HARD_DRIVE_SUFFIXES, uint32toBytes } from "../emulator/utility/utility"
import { imageList } from "./assets"
import { handleSetDiskData, handleGetDriveProps, handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer } from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRotate } from "@fortawesome/free-solid-svg-icons";
import { doSetEmuDriveNewData, getDriveFileNameByIndex } from "../emulator/devices/drivestate"
import { OneDriveCloudDrive } from "../emulator/utility/onedriveclouddrive"
import { CloudDriveSyncStatus } from "../emulator/utility/clouddrive"

export const getBlobFromDiskData = (diskData: Uint8Array, filename: string) => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith('.woz')) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  return new Blob([diskData]);
}

const downloadDisk = (diskData: Uint8Array, filename: string) => {
  const blob = getBlobFromDiskData(diskData, filename)
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

type DiskDriveProps = {
  index: number,
  renderCount: number,
  setShowFileOpenDialog: (show: boolean, index: number) => void
}

const DiskDrive = (props: DiskDriveProps) => {
  const dprops = handleGetDriveProps(props.index)

  const [menuOpen, setMenuOpen] = useState<number>(-1)
  const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const [cloudDrive, setCloudDrive] = useState<OneDriveCloudDrive>(new OneDriveCloudDrive())

  const menuNames = [
    ['Write Protect Disk', '-', 'Download Disk', 'Download and Eject Disk', 'Eject Disk', '-', 'Save Disk to OneDrive'],
    ['Write Protect Disk', '-', 'Eject Disk', '-', 'Sync Every Minute', 'Sync Every 5 Minutes', 'Sync Every 15 Minutes', 'Pause Syncing', '-', 'Sync Now'],
    ['Load Disk from Local Drive', 'Load Disk from OneDrive']]
  const menuChoices = [
    [3, -1, 0, 1, 2, -1, 4],
    [3, -1, 2, -1, 60000, 300000, 900000, Number.MAX_VALUE, -1, Number.MIN_VALUE],
    [0, 1]]
  
  const resetDrive = (index: number) => {
    handleSetDiskData(index, new Uint8Array(), "")
    setCloudDrive(new OneDriveCloudDrive())
  }

  const pickCloudDriveFile = async () => {
    const filter = dprops.index >= 2 ? FLOPPY_DISK_SUFFIXES : HARD_DRIVE_SUFFIXES

    if (await cloudDrive.downloadFile(filter)) {
      cloudDrive.setSyncStatus(CloudDriveSyncStatus.InProgress)

      const response = await fetch(cloudDrive.downloadUrl);

      if (response.ok) {
        const blob = await response.blob()
        const buffer = await new Response(blob).arrayBuffer()

        handleSetDiskOrFileFromBuffer(dprops.index, buffer, cloudDrive.fileName)
        doSetEmuDriveNewData(dprops, true)

        const newFileName = getDriveFileNameByIndex(dprops.index)
        if (newFileName != cloudDrive.fileName) {
          cloudDrive.fileName = `apple2ts.${newFileName}`
          cloudDrive.uploadUrl = ""
        }
        
        cloudDrive.setSyncStatus(CloudDriveSyncStatus.Active)
      } else {
        console.error(`HTTP error: status ${response.status}`)
        cloudDrive.setSyncStatus(CloudDriveSyncStatus.Failed)
      }
    }
  }

  const pickCloudDriveFolder = async () => {
    if (await cloudDrive.saveFile(dprops.filename)) {
      cloudDrive?.uploadFile(getBlobFromDiskData(dprops.diskData, dprops.filename))
    } else {
      console.error(`OneDrive upload failed: ${dprops.filename}`)
    }
  }

  const getMenuCheck = (menuChoice: number) => {
    var checked = false;

    if (menuOpen == 0) {
      checked = menuChoice == 3 && dprops.isWriteProtected
    } else if (menuOpen == 1) {
      if (menuChoice == 3) {
        checked = dprops.isWriteProtected
      } else {
        checked = menuChoice == cloudDrive?.getSyncInterval()
      }
    }

    return checked ? '\u2714\u2009' : '\u2003'
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })

    if (cloudDrive.syncStatus == CloudDriveSyncStatus.Inactive) {
      if (dprops.filename.length > 0) {
        setMenuOpen(0)
      } else {
        setMenuOpen(2)
      }
    } else {
      setMenuOpen(1)
    }
  }

  const handleMenuClose = (menuChoice = -1) => {
    const menuNumber = menuOpen
    setMenuOpen(-1)
    if (menuNumber == 0) {
      if (menuChoice === 0 || menuChoice === 1) {
        if (dprops.diskData.length > 0) {
          downloadDisk(dprops.diskData, filename)
          dprops.diskHasChanges = false
        }
      }
      if (menuChoice === 1 || menuChoice === 2) {
        resetDrive(props.index)
      }
      if (menuChoice == 3) {
        handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected)
      } else if (menuChoice == 4) {
        pickCloudDriveFolder()
      }
    } else if (menuNumber == 1) {
      if (menuChoice == 2) {
        resetDrive(props.index)
      } else if (menuChoice >= 0) {
        if (menuChoice == 3) {
          handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected)
        }
        else if (menuChoice == Number.MIN_VALUE) {
          cloudDrive?.syncDrive(dprops)
        } else {
          cloudDrive?.setSyncInterval(menuChoice)
        }
      }
    } else if (menuNumber == 2) {
      if (menuChoice == 0) {
        props.setShowFileOpenDialog(true, props.index)
      } else if (menuChoice == 1) {
        pickCloudDriveFile()
      }
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
      <span className="flex-row">
        <span className="flex-column">
          <img className="disk-image"
            src={img1} alt={filename}
            id={dprops.index === 2 ? "tour-floppy-disks" : ""}
            title={cloudDrive.lastSyncTime > 0
              ? `Last synced: ${new Date(cloudDrive.lastSyncTime).toLocaleString()}`
              : (filename + (dprops.diskHasChanges ? ' (modified)' : ''))}
            onClick={handleMenuClick} />
            <FontAwesomeIcon
              icon={faRotate}
              className={"fa-fw disk-onedrive " + cloudDrive?.getStatusClassName(dprops)}
              title={cloudDrive?.getStatusMessage(dprops)}>
            </FontAwesomeIcon>
        </span>
      </span>
      <span className={"disk-label" + (dprops.diskHasChanges ? " disk-label-unsaved" : "")}>
        {dprops.diskHasChanges ? '*' : ''}{dprops.filename}</span>
      <span className="flex-row">
        <span className={"default-font disk-status"}>{status}</span>
      </span>

      {menuOpen >= 0 &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleMenuClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {menuChoices[menuOpen].map((itemValue, index) => (
              <div key={index}>
              {menuNames[menuOpen][index] == '-'
              ? <div style={{ borderTop: '1px solid #aaa', margin: '5px 0' }}></div>
              : <div className="droplist-option"
                style={{ padding: '5px', paddingLeft: '10px', paddingRight: '10px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={itemValue} onClick={() => handleMenuClose(itemValue)}>
                {getMenuCheck(itemValue)}{menuNames[menuOpen][index]}</div>}
              </div>
              ))}
          </div>
        </div>
      }
    </span>
  )
}

export default DiskDrive;
