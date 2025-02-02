import { useState } from "react"
import { crc32, FLOPPY_DISK_SUFFIXES, HARD_DRIVE_SUFFIXES, uint32toBytes } from "../emulator/utility/utility"
import { imageList } from "./assets"
import { handleSetDiskData, handleGetDriveProps, handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer, doSetUIDriveProps } from "./driveprops"
import { ONEDRIVE_SYNC_STATUS, resetOneDriveData, getOneDriveData, openOneDriveFile, saveOneDriveFile, setOneDriveSyncStatus, uploadOneDriveFile, getOneDriveSyncInterval, setOneDriveSyncInterval } from "../emulator/utility/onedrive"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faLock,
  faLockOpen,
  faCloud,
  faCloudArrowDown,
  faCloudArrowUp
} from "@fortawesome/free-solid-svg-icons";
import { doSetEmuDriveNewData, doSetEmuDriveProps, getDriveFileNameByIndex } from "../emulator/devices/drivestate"

export const getBlobFromDiskData = (diskData: Uint8Array, filename: string) => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith('.woz')) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  return new Blob([diskData]);
}

const getOneDriveSyncStatusMessage = (dprops: DriveProps) => {
  switch (getOneDriveSyncStatus(dprops)) {
    case ONEDRIVE_SYNC_STATUS.INACTIVE:
      return dprops.diskData.length > 0 ? "Save Disk to OneDrive" : "Load Disk from OneDrive"

    case ONEDRIVE_SYNC_STATUS.ACTIVE:
      return "OneDrive Sync Up-to-date"
      
    case ONEDRIVE_SYNC_STATUS.PENDING:
      return "OneDrive Sync Pending"
      
    case ONEDRIVE_SYNC_STATUS.INPROGRESS:
      return "OneDrive Sync In Progress"
      
    case ONEDRIVE_SYNC_STATUS.FAILED:
      return "OneDrive Sync Failed"
  }
}

const getOneDriveSyncIcon = (dprops: DriveProps) => {
  switch (getOneDriveSyncStatus(dprops)) {
    case ONEDRIVE_SYNC_STATUS.INACTIVE:
      return dprops.diskData.length > 0 ? faCloudArrowUp : faCloudArrowDown

    default:
      return faCloud
  }
}

const getOneDriveSyncStatus = (dprops: DriveProps) => {
  const oneDriveData = getOneDriveData(dprops.index)

  switch (oneDriveData.syncStatus) {
    case ONEDRIVE_SYNC_STATUS.ACTIVE:
      if (dprops.lastWriteTime > oneDriveData.lastSyncTime) {
        setOneDriveSyncStatus(dprops.index, ONEDRIVE_SYNC_STATUS.PENDING)
      }
      break

    case ONEDRIVE_SYNC_STATUS.PENDING:
      if ((Date.now() - oneDriveData.lastSyncTime > oneDriveData.syncInterval)) {
        syncOneDriveNow(dprops)
      }
      break

    case ONEDRIVE_SYNC_STATUS.FAILED:
      // $TODO
      break
  }

  return oneDriveData.syncStatus
}

const syncOneDriveNow = (dprops: DriveProps) => {
  setOneDriveSyncStatus(dprops.index, ONEDRIVE_SYNC_STATUS.INPROGRESS)
  uploadOneDriveFile(dprops.index, getBlobFromDiskData(dprops.diskData, getOneDriveData(dprops.index).fileName))
    .then(() => {
      dprops.diskHasChanges = false
      doSetEmuDriveProps(dprops)
      doSetUIDriveProps(dprops)
    })
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

const resetDrive = (index: number) => {
  handleSetDiskData(index, new Uint8Array(), "")
  resetOneDriveData(index)
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

  const menuNames = [
    ['Download Disk', 'Download and Eject Disk', 'Eject Disk'],
    ['Sync Every Minute', 'Sync Every 5 Minutes', 'Sync Every 15 Minutes', 'Pause Syncing', '-', 'Sync Now']]
  const menuChoices = [
    [0, 1, 2],
    [60000, 300000, 900000, Number.MAX_VALUE, 0, Number.MIN_VALUE]]

  const getMenuCheck = (interval: number) => {
    if (menuOpen == 0) {
      return ''
    } else if (menuOpen == 1) {
      return interval == getOneDriveSyncInterval(dprops.index) ? '\u2714\u2009' : '\u2003'
    }
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    if (dprops.filename.length > 0) {
      const y = Math.min(event.clientY, window.innerHeight - 200)
      setPosition({ x: event.clientX, y: y })
      setMenuOpen(0)
    } else {
      props.setShowFileOpenDialog(true, props.index)
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
    } else if (menuNumber == 1) {
      if (menuChoice >= 0) {
        if (menuChoice == Number.MIN_VALUE) {
          syncOneDriveNow(dprops)
        } else {
          setOneDriveSyncInterval(dprops.index, menuChoice)
        }
      }
    }
  }

  const handleCloudButtonClick = async (event: React.MouseEvent) => {
    if (getOneDriveData(dprops.index).syncStatus == ONEDRIVE_SYNC_STATUS.INACTIVE) {
      if (dprops.diskData.length > 0) {
        if (await saveOneDriveFile(dprops.index, dprops.filename)) {
          uploadOneDriveFile(dprops.index, getBlobFromDiskData(dprops.diskData, getOneDriveData(dprops.index).fileName))
        } else {
          console.error(`OneDrive upload failed: ${dprops.filename}`)
        }
      } else {
        const filter = dprops.index >= 2 ? FLOPPY_DISK_SUFFIXES : HARD_DRIVE_SUFFIXES

        if (await openOneDriveFile(dprops.index, filter)) {
          setOneDriveSyncStatus(dprops.index, ONEDRIVE_SYNC_STATUS.INPROGRESS)

          var oneDriveData = getOneDriveData(dprops.index)

          console.log(`fetch: DELETE ${oneDriveData.downloadUrl}`)
          const response = await fetch(oneDriveData.downloadUrl);

          if (response.ok) {
            const blob = await response.blob()
            const buffer = await new Response(blob).arrayBuffer()
  
            handleSetDiskOrFileFromBuffer(dprops.index, buffer, oneDriveData.fileName)
            doSetEmuDriveNewData(dprops, true)
  
            const newFileName = getDriveFileNameByIndex(dprops.index)
            if (newFileName != oneDriveData.fileName) {
              oneDriveData = getOneDriveData(dprops.index)
              oneDriveData.fileName = `apple2ts.${newFileName}`
              oneDriveData.uploadUrl = ""
            }
            
            setOneDriveSyncStatus(dprops.index, ONEDRIVE_SYNC_STATUS.ACTIVE)
          } else {
            console.error(`HTTP error: status ${response.status}`)
            setOneDriveSyncStatus(dprops.index, ONEDRIVE_SYNC_STATUS.FAILED)
          }
        }
      }
    } else {
      const y = Math.min(event.clientY, window.innerHeight - 200)
      setPosition({ x: event.clientX, y: y })
      setMenuOpen(1)
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
            title={filename + (dprops.diskHasChanges ? ' (modified)' : '')}
            onClick={handleMenuClick} />
        </span>
        <span className="flex-column" id="tour-onedrive-cloudicon">
          <FontAwesomeIcon
            icon={getOneDriveSyncIcon(dprops)}
            className={"fa-fw disk-onedrive disk-onedrive-" + (ONEDRIVE_SYNC_STATUS[getOneDriveSyncStatus(dprops)].toLocaleLowerCase())}
            title={getOneDriveSyncStatusMessage(dprops)}
            onClick={handleCloudButtonClick}>
          </FontAwesomeIcon>
          <FontAwesomeIcon icon={dprops.isWriteProtected ? faLock : faLockOpen} className="disk-write-protected fa-fw" title={dprops.isWriteProtected ? "Write Protected" : "Write Enabled"}
            onClick={() => { handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected) }}>
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
            {menuChoices[menuOpen].map((i, j) => (
              <div>
              {menuNames[menuOpen][j] == '-'
              ? <div style={{ borderTop: '1px solid #aaa', margin: '5px 0' }}></div>
              : <div className="droplist-option"
                style={{ padding: '5px', paddingLeft: '10px', paddingRight: '10px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleMenuClose(i)}>
                {getMenuCheck(i)}{menuNames[menuOpen][j]}</div>}
              </div>
              ))}
          </div>
        </div>
      }
    </span>
  )
}

export default DiskDrive;
