import { useEffect, useMemo, useState } from "react"
import { CLOUD_SYNC, crc32, DISK_CONVERSION_SUFFIXES, FILE_SUFFIXES, isFileSystemApiSupported, RUN_MODE, uint32toBytes } from "../../common/utility"
import { imageList } from "./assets"
import {
  handleSetDiskData, handleGetDriveProps,
  handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer,
  handleSaveWritableFile
} from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRotate } from "@fortawesome/free-solid-svg-icons"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { driveMenuItems } from "./diskdrive_menu"
import { handleGetHotReload, passSetDriveProps, passSetRunMode } from "../main2worker"

export const getBlobFromDiskData = (diskData: Uint8Array, filename: string): Blob => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith(".woz")) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  return new Blob([diskData])
}

const downloadDisk = (diskData: Uint8Array, filename: string) => {
  const blob = getBlobFromDiskData(diskData, filename)
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

  const resetDrive = (index: number) => {
    handleSetDiskData(index, new Uint8Array(), "", null, null, -1)
  }

  const updateCloudDrive = async (cloudProvider: CloudProvider) => {
    const blob = getBlobFromDiskData(dprops.diskData, driveFileName)
    if (dprops.cloudData) {
      const success = await cloudProvider.sync(blob, dprops.cloudData)
      if (success) {
        dprops.diskHasChanges = false
        passSetDriveProps(dprops)
      }
    }
  }

  useEffect(() => {
    if (!dprops.cloudData) return

    const timer = setInterval(() => {
      if (dprops.cloudData?.syncStatus == CLOUD_SYNC.ACTIVE && dprops.diskHasChanges) {
        dprops.cloudData.syncStatus = CLOUD_SYNC.PENDING
      }

      if (dprops.cloudData?.syncStatus == CLOUD_SYNC.PENDING) {
        if ((Date.now() - dprops.cloudData.lastSyncTime > dprops.cloudData.syncInterval)) {
          switch (dprops.cloudData.providerName) {
            case "OneDrive":
              updateCloudDrive(new OneDriveCloudDrive())
              break
            case "GoogleDrive":
              updateCloudDrive(new GoogleDrive())
              break
            default:
              console.error("Unknown cloud provider")
          }
        }
      }
    }, 1000)
    return () => clearInterval(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dprops.cloudData, dprops.cloudData?.syncStatus, dprops.cloudData?.lastSyncTime,
  dprops.cloudData?.syncInterval, dprops.isWriteProtected, dprops.motorRunning,
  dprops.diskHasChanges])

  const cloudDriveStatusClassName = useMemo(() => {
    if (!dprops.cloudData) return "disk-clouddrive-inactive"

    const syncStatus = dprops.cloudData?.syncStatus

    if (dprops.cloudData?.syncInterval == Number.MAX_VALUE
      && syncStatus != CLOUD_SYNC.INACTIVE
      && syncStatus != CLOUD_SYNC.INPROGRESS) {
      return "disk-clouddrive-paused"
    } else {
      return `disk-clouddrive-${CLOUD_SYNC[syncStatus].toLowerCase()}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dprops.cloudData, dprops.cloudData?.syncStatus, dprops.cloudData?.syncInterval])

  const diskDriveLabel = useMemo(() => {
    let label = (dprops.filename + (dprops.diskHasChanges ? " (modified)" : ""))

    if (dprops.cloudData && dprops.cloudData.lastSyncTime > 0) {
      label += `\nSynced ${new Date(dprops.cloudData.lastSyncTime).toLocaleString()}`
    }

    return label
  }, [dprops.cloudData, dprops.diskHasChanges, dprops.filename])

  const driveFileName = useMemo(() => {
    // if (dprops.filename == '') {
    // }

    if (dprops.cloudData) {
      if (dprops.filename != dprops.cloudData.fileName) {
        dprops.cloudData.fileName = `apple2ts.${dprops.filename}`
      }
    }
    return dprops.filename
  }, [dprops.filename, dprops.cloudData])

  const loadDiskFromCloud = async (newCloudDrive: CloudProvider) => {
    const result = await newCloudDrive.download(FILE_SUFFIXES)

    if (result) {
      const [blob, cloudData] = result
      const buffer = await new Response(blob).arrayBuffer()
      handleSetDiskOrFileFromBuffer(dprops.index, buffer, cloudData.fileName, cloudData, null)
    }
  }

  const saveDiskToCloud = async (cloudProvider: CloudProvider) => {
    const blob = getBlobFromDiskData(dprops.diskData, driveFileName)
    dprops.cloudData = await cloudProvider.upload(dprops.filename, blob)
    if (dprops.cloudData) {
      if (dprops.writableFileHandle) {
        await handleSaveWritableFile(dprops.index)
        dprops.writableFileHandle = null
      }
      dprops.diskHasChanges = false
      passSetDriveProps(dprops)
    }
  }

  const showReadWriteFilePicker = async (index: number) => {
    let [writableFileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: "Disk Images",
          accept: {
            "application/octet-stream": FILE_SUFFIXES.split(",")
          }
        }
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    })

    if (writableFileHandle == null) {
      return
    }

    const file = await writableFileHandle.getFile()
    const fileExtension = file.name.substring(file.name.lastIndexOf("."))

    if (DISK_CONVERSION_SUFFIXES.has(fileExtension)) {
      const newFileExtension = DISK_CONVERSION_SUFFIXES.get(fileExtension)
      writableFileHandle = await window.showSaveFilePicker({
        excludeAcceptAllOption: false,
        suggestedName: file.name.replace(fileExtension, newFileExtension ?? ""),
        types: [
          {
            description: "Disk Image",
            accept: { "application/octet": [newFileExtension] },
          },
        ]
      })
      handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), file.name, null, writableFileHandle)
    } else {
      handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), writableFileHandle.name, null, writableFileHandle)
    }

    const timer = setInterval(async (index: number) => {
      const dprops = handleGetDriveProps(index)

      if (handleGetHotReload()) {
        const file = await writableFileHandle.getFile()
        if (dprops.lastLocalWriteTime > 0 && file.lastModified > dprops.lastLocalWriteTime) {
          handleSetDiskOrFileFromBuffer(index, await file.arrayBuffer(), file.name, null, writableFileHandle)
          passSetRunMode(RUN_MODE.NEED_BOOT)
          return
        }
      }

      if (dprops.diskHasChanges && !dprops.motorRunning) {
        if (await handleSaveWritableFile(index)) {
          dprops.diskHasChanges = false
          dprops.lastLocalWriteTime = Date.now()
          passSetDriveProps(dprops)
        }
      }
    }, 3 * 1000, index)
    return () => clearInterval(timer)
  }

  const getMenuCheck = (menuChoice: number) => {
    let checked = false

    if (menuOpen == 0) {
      checked = menuChoice == 3 && dprops.isWriteProtected
    } else if (menuOpen == 1) {
      if (menuChoice == 3) {
        checked = dprops.isWriteProtected
      } else {
        checked = menuChoice == dprops.cloudData?.syncInterval
      }
    }

    return checked ? "\u2714\u2009" : "\u2003"
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })

    if (!dprops.cloudData || dprops.cloudData.syncStatus == CLOUD_SYNC.INACTIVE) {
      if (dprops.filename.length > 0) {
        setMenuOpen(0)
      } else {
        if (isFileSystemApiSupported()) {
          setMenuOpen(3)
        } else {
          setMenuOpen(2)
        }
      }
    } else {
      setMenuOpen(1)
    }
  }

  const handleMenuClose = (menuChoice = -1) => {
    const menuNumber = menuOpen
    setMenuOpen(-1)
    if (menuNumber == 0 || menuNumber == 4) {
      switch (menuChoice) {
        case 0:  // fall through
        case 1:
          if (dprops.diskData.length > 0) {
            downloadDisk(dprops.diskData, filename)
            dprops.diskHasChanges = false
          }
          if (menuChoice === 1) {
            resetDrive(props.index)
          }
          break
        case 2:
          resetDrive(props.index)
          break
        case 3:
          handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected)
          break
        case 4:
          saveDiskToCloud(new OneDriveCloudDrive())
          break
        case 5:
          saveDiskToCloud(new GoogleDrive())
          break
      }
    } else if (menuNumber == 1) {
      if (menuChoice == 2) {
        resetDrive(props.index)
      } else if (menuChoice >= 0) {
        if (menuChoice == 3) {
          handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected)
        }
        else if (menuChoice == Number.MIN_VALUE) {
          switch (dprops.cloudData?.providerName) {
            case "OneDrive":
              updateCloudDrive(new OneDriveCloudDrive())
              break
            case "GoogleDrive":
              updateCloudDrive(new GoogleDrive())
              break
            default:
              console.error("Unknown cloud provider")
          }
        } else {
          if (dprops.cloudData) {
            dprops.cloudData.syncInterval = menuChoice
          }
        }
      }
    } else if (menuNumber == 2 || menuNumber == 3) {
      switch (menuChoice) {
        case 0:
          props.setShowFileOpenDialog(true, props.index)
          break
        case 1:
          loadDiskFromCloud(new OneDriveCloudDrive())
          break
        case 2:
          loadDiskFromCloud(new GoogleDrive())
          break
        case 3:
          showReadWriteFilePicker(props.index)
          break
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
  let status = ["S7D1", "S7D2", "S6D1", "S6D2"][props.index]
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
        {dprops.diskHasChanges ? "*" : ""}{dprops.filename}</span>
      <span className="flex-row">
        <span className={"default-font disk-status"}>{status}</span>
      </span>

      {menuOpen >= 0 &&
        <div className="modal-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
          onClick={() => handleMenuClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {driveMenuItems[menuOpen].map((menuItem, index) => (
              <div key={index}>
                {menuItem.label == "-"
                  ? <div style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}></div>
                  : <div className="droplist-option"
                    style={{ padding: "5px", paddingLeft: "10px", paddingRight: "10px" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                    key={menuItem.label} onClick={() => handleMenuClose(menuItem.index)}>
                    {getMenuCheck(menuItem.index || -1)}
                    {menuItem.icon && <FontAwesomeIcon icon={menuItem.icon} style={{ width: "24px" }} />}
                    {menuItem.label}</div>}
              </div>
            ))}
          </div>
        </div>
      }
    </span>
  )
}

export default DiskDrive
