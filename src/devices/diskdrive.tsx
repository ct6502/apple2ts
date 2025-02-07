import { useEffect, useMemo, useState } from "react"
import { crc32, FLOPPY_DISK_SUFFIXES, HARD_DRIVE_SUFFIXES, uint32toBytes } from "../emulator/utility/utility"
import { imageList } from "./assets"
import { handleSetDiskData, handleGetDriveProps, handleSetDiskWriteProtected, doSetUIDriveProps, handleSetDiskOrFileFromBuffer } from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { CloudDrive, CloudDriveSyncStatus } from "../emulator/utility/clouddrive"
import { faRotate } from "@fortawesome/free-solid-svg-icons"
import { OneDriveCloudDrive } from "../emulator/utility/onedriveclouddrive"
import { doSetEmuDriveProps } from "../emulator/devices/drivestate"

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

  const [cloudDrive, setCloudDrive] = useState<CloudDrive>()

  const menuNames = [
    ['Write Protect Disk',
      '-',
      'Download Disk',
      'Download and Eject Disk',
      'Eject Disk',
      '-',
      'Save Disk to OneDrive'],
    ['Write Protect Disk',
      '-',
      'Eject Disk',
      '-',
      'Sync Every Minute',
      'Sync Every 5 Minutes',
      'Sync Every 15 Minutes',
      'Pause Syncing',
      '-',
      'Sync Now'],
    ['Load Disk from Local Drive', 'Load Disk from OneDrive']]
  const menuChoices = [
    [3, -1, 0, 1, 2, -1, 4],
    [3, -1, 2, -1, 60000, 300000, 900000, Number.MAX_VALUE, -1, Number.MIN_VALUE],
    [0, 1]]
  
  const resetDrive = (index: number) => {
    handleSetDiskData(index, new Uint8Array(), "")
    setCloudDrive(undefined)
  }

  useEffect(() => {
    if (!cloudDrive) return

    const timer = setInterval(() => {
      if (cloudDrive.syncStatus == CloudDriveSyncStatus.Active && dprops.diskHasChanges) {
        cloudDrive.syncStatus = CloudDriveSyncStatus.Pending
      }

      if (cloudDrive.syncStatus == CloudDriveSyncStatus.Pending) {
          if ((Date.now() - cloudDrive.lastSyncTime > cloudDrive.syncInterval)) {
            updateCloudDrive()
          }
      }
    }, 1000);
    return () => clearInterval(timer);
}, [cloudDrive?.syncStatus, dprops.diskHasChanges, cloudDrive?.lastSyncTime, cloudDrive?.syncInterval]);

  const cloudDriveStatusClassName = useMemo(() => {
    if (!cloudDrive) return "disk-clouddrive-inactive"

    const syncStatus = cloudDrive?.syncStatus

    if (cloudDrive?.syncInterval == Number.MAX_VALUE
      && syncStatus != CloudDriveSyncStatus.Inactive
      && syncStatus != CloudDriveSyncStatus.InProgress) {
      return "disk-clouddrive-paused"
    } else {
      return `disk-clouddrive-${CloudDriveSyncStatus[syncStatus].toLowerCase()}`
    }
  }, [cloudDrive?.syncStatus, cloudDrive?.syncInterval])

  const diskDriveLabel = useMemo(() => {
    var label = (dprops.filename + (dprops.diskHasChanges ? ' (modified)' : ''))

    if (cloudDrive && cloudDrive.lastSyncTime > 0) {
      label += `\nSynced ${new Date(cloudDrive.lastSyncTime).toLocaleString()}`
    }

    return label
  }, [cloudDrive?.lastSyncTime, dprops.diskHasChanges])

  const driveFileName = useMemo(() => {
    if (cloudDrive && dprops.filename != cloudDrive.getFileName()) {
      cloudDrive?.setFileName(`apple2ts.${dprops.filename}`)
    }
    return dprops.filename
  }, [dprops.filename]) 

  const loadDiskFromCloud = async (newCloudDrive: CloudDrive) => {
    const filter = dprops.index >= 2 ? FLOPPY_DISK_SUFFIXES : HARD_DRIVE_SUFFIXES
    const blob = await newCloudDrive.download(filter)

    if (blob) {
      const buffer = await new Response(blob).arrayBuffer()

      handleSetDiskOrFileFromBuffer(dprops.index, buffer, newCloudDrive.getFileName())
      setCloudDrive(newCloudDrive)
    }
  }

  const saveDiskToCloud = async (newCloudDrive: CloudDrive) => {
    const blob = getBlobFromDiskData(dprops.diskData, driveFileName)
    if (await newCloudDrive?.upload(dprops.filename, blob)) {
        setCloudDrive(newCloudDrive)
        updateCloudDrive(newCloudDrive)
    }
  }

  const updateCloudDrive = async (newCloudDrive: CloudDrive|undefined = cloudDrive) => {
    const blob = getBlobFromDiskData(dprops.diskData, driveFileName)
    if (await newCloudDrive?.sync(blob)) {
      dprops.diskHasChanges = false
      doSetEmuDriveProps(dprops)
      doSetUIDriveProps(dprops)
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
        checked = menuChoice == cloudDrive?.syncInterval
      }
    }

    return checked ? '\u2714\u2009' : '\u2003'
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })

    if (!cloudDrive || cloudDrive.syncStatus == CloudDriveSyncStatus.Inactive) {
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
        saveDiskToCloud(new OneDriveCloudDrive())
      }
    } else if (menuNumber == 1) {
      if (menuChoice == 2) {
        resetDrive(props.index)
      } else if (menuChoice >= 0) {
        if (menuChoice == 3) {
          handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected)
        }
        else if (menuChoice == Number.MIN_VALUE) {
          updateCloudDrive()
        } else {
          if (cloudDrive) {
            cloudDrive.syncInterval = menuChoice
          }
        }
      }
    } else if (menuNumber == 2) {
      if (menuChoice == 0) {
        props.setShowFileOpenDialog(true, props.index)
      } else if (menuChoice == 1) {
        loadDiskFromCloud(new OneDriveCloudDrive())
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
            title={diskDriveLabel}
            onClick={handleMenuClick} />
            <FontAwesomeIcon
              icon={faRotate}
              className={`fa-fw disk-clouddrive ${cloudDriveStatusClassName}`}>
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
