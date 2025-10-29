import { useEffect, useMemo, useState } from "react"
import {
  handleSetDiskData, handleGetDriveProps,
  handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer,
  handleSaveWritableFile,
  prepWritableFile,
  showReadWriteFilePicker,
  isElectron
} from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faClock, faCloud, faDownload, faEject, faFloppyDisk, faFolderOpen, faLock, faPause, faRotate, faStar, faSync } from "@fortawesome/free-solid-svg-icons"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import React from "react"
import { CLOUD_SYNC, crc32, FILE_SUFFIXES_DISK, uint32toBytes } from "../../../common/utility"
import PopupMenu from "../../controls/popupmenu"
import { svgInternetArchiveLogo } from "../../img/icon_internetarchive"
import { passSetDriveProps } from "../../main2worker"
import { DISK_COLLECTION_ITEM_TYPE } from "../../panels/diskcollectionpanel"
import { hasEnhancedFileAccess } from "../../ui_utilities"
import InternetArchivePopup from "./internetarchivedialog"
import { DiskBookmarks } from "./diskbookmarks"

export const DISK_DRIVE_LABELS = ["S7D1", "S7D2", "S6D1", "S6D2"]

export const getBlobFromDiskData = (diskData: Uint8Array, filename: string): Blob => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith(".woz")) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  return new Blob([diskData] as BlobPart[])
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
  const diskBookmarks = new DiskBookmarks()

  const [internetDialogDialogOpen, setInternetDialogDialogOpen] = useState<boolean>(false)
  const [menuOpen, setMenuOpen] = useState<number>(-1)
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const ejectDisk = (index: number) => {
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
            case "Electron":
              // Handle Electron file saving
              handleSaveWritableFile(dprops.index).then(success => {
                if (success && dprops.cloudData) {
                  dprops.diskHasChanges = false
                  dprops.cloudData.lastSyncTime = Date.now()
                  passSetDriveProps(dprops)
                }
              })
              break
            default:
              console.error("Unknown cloud provider:", dprops.cloudData.providerName)
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
    const result = await newCloudDrive.download(FILE_SUFFIXES_DISK)
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

  const showDiskSaveFilePicker = async (index: number) => {
    const fileName = dprops.filename
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))

    // Use Electron dialog if available
    if (isElectron() && window.electronAPI) {
      const result = await window.electronAPI.showSaveDialog({
        defaultPath: fileName,
        filters: [
          { name: "Disk Images", extensions: [fileExtension.replace(".", "")] }
        ]
      })

      if (!result.canceled && result.filePath) {
        // Create a CloudData object for Electron file operations
        const electronCloudData: CloudData = {
          providerName: "Electron",
          syncStatus: CLOUD_SYNC.ACTIVE,
          syncInterval: 3000,
          fileName: result.filePath.split("/").pop() || result.filePath.split("\\").pop() || result.filePath,
          downloadUrl: result.filePath,
          itemId: result.filePath,
          apiEndpoint: "",
          detailsUrl: "",
          lastSyncTime: Date.now()
        }

        dprops.diskHasChanges = true
        dprops.filename = electronCloudData.fileName
        dprops.cloudData = electronCloudData
        dprops.writableFileHandle = null // Not used for Electron
        dprops.lastLocalWriteTime = -1
        passSetDriveProps(dprops)

        // Save the file immediately using Electron API
        await window.electronAPI.writeFile(result.filePath, dprops.diskData)
      }
      return
    }

    // Fall back to browser File System Access API
    const writableFileHandle = await window.showSaveFilePicker({
      excludeAcceptAllOption: false,
      suggestedName: fileName,
      types: [
        {
          description: "Disk Image",
          accept: { "application/octet": [fileExtension] as `.${string}`[] },
        },
      ]
    })

    if (writableFileHandle) {
      dprops.diskHasChanges = true
      dprops.filename = writableFileHandle.name
      dprops.writableFileHandle = writableFileHandle
      dprops.lastLocalWriteTime = -1
      passSetDriveProps(dprops)

      prepWritableFile(index, writableFileHandle)
    }
  }

  const showInternetArchivePicker = () => {
    setInternetDialogDialogOpen(true)
  }

  const handleMenuClick = (event: React.MouseEvent) => {
    let menuIndex = -1

    if (!dprops.cloudData || dprops.cloudData.syncStatus == CLOUD_SYNC.INACTIVE) {
      if (dprops.filename.length > 0) {
        menuIndex = 0
      } else {
        menuIndex = 2
      }
    } else {
      menuIndex = 1
    }

    if (menuIndex >= 0) {
      setMenuOpen(menuIndex)
      setPopupLocation([event.clientX, event.clientY])
    } else {
      setPopupLocation(undefined)
    }
  }

  const getImageDataUrlFromCanvas = () => {
    const hiddenCanvas = document.getElementById("hiddenCanvas") as HTMLCanvasElement
    return new URL(hiddenCanvas.toDataURL("image/jpeg", 0.1))
  }

  let img1: string
  if (dprops.hardDrive) {
    img1 = dprops.motorRunning ? window.assetRegistry.hardDriveOn : window.assetRegistry.hardDriveOff
  } else {
    img1 = (dprops.filename.length > 0) ?
      (dprops.motorRunning ? window.assetRegistry.disk2on : window.assetRegistry.disk2off) :
      (dprops.motorRunning ? window.assetRegistry.disk2onEmpty : window.assetRegistry.disk2offEmpty)
  }
  const filename = (dprops.filename.length > 0) ? dprops.filename : ""
  let status = DISK_DRIVE_LABELS[props.index]
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

      <PopupMenu
        location={popupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => {
          setMenuOpen(-1)
          setPopupLocation(undefined)
        }}
        menuIndex={menuOpen}
        menuItems={[
          [
            {
              label: "Write Protect Disk",
              icon: faLock,
              isSelected: () => { return dprops.isWriteProtected },
              onClick: () => { handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected) }
            },
            {
              label: "-"
            },
            {
              label: "Save Disk to Device",
              icon: faFloppyDisk,
              isVisible: () => { return hasEnhancedFileAccess() && !dprops.writableFileHandle },
              onClick: () => { showDiskSaveFilePicker(props.index) }
            },
            {
              label: "-",
              isVisible: () => { return hasEnhancedFileAccess() && !dprops.writableFileHandle }
            },
            {
              label: "Add Disk to Collection",
              icon: faStar,
              isVisible: () => { return dprops.cloudData?.itemId != undefined && !diskBookmarks.contains(dprops.cloudData?.itemId || "") },
              onClick: () => {
                if (dprops.cloudData) {
                  diskBookmarks.set({
                    type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
                    id: dprops.cloudData.itemId,
                    title: dprops.cloudData.fileName,
                    screenshotUrl: getImageDataUrlFromCanvas(),
                    lastUpdated: new Date(Date.now()),
                    diskUrl: dprops.cloudData.downloadUrl,
                    cloudData: dprops.cloudData
                  })
                }
              }
            },
            {
              label: "-",
              isVisible: () => { return dprops.cloudData?.itemId != undefined && !diskBookmarks.contains(dprops.cloudData?.itemId || "") },
            },
            {
              label: "Remove Disk from Collection",
              icon: faStar,
              isVisible: () => { return diskBookmarks.contains(dprops.cloudData?.itemId || "") },
              onClick: () => {
                if (dprops.cloudData && diskBookmarks.contains(dprops.cloudData.itemId)) {
                  diskBookmarks.remove(dprops.cloudData.itemId)
                }
              }
            },
            {
              label: "-",
              isVisible: () => { return diskBookmarks.contains(dprops.cloudData?.itemId || "") }
            },
            {
              label: "Download Disk",
              icon: faDownload,
              onClick: () => {
                if (dprops.diskData.length > 0) {
                  downloadDisk(dprops.diskData, filename)
                  dprops.diskHasChanges = false
                }
              }
            },
            {
              label: "Download and Eject Disk",
              icon: faDownload,
              onClick: () => {
                if (dprops.diskData.length > 0) {
                  downloadDisk(dprops.diskData, filename)
                  dprops.diskHasChanges = false
                  ejectDisk(props.index)
                }
              }
            },
            {
              label: "Eject Disk",
              icon: faEject,
              onClick: () => {
                ejectDisk(props.index)
              }
            },
            {
              label: "-"
            },
            {
              label: "Save Disk to OneDrive",
              icon: faCloud,
              onClick: () => { saveDiskToCloud(new OneDriveCloudDrive()) }
            },
            {
              label: "Save Disk to Google Drive",
              icon: faCloud,
              onClick: () => { saveDiskToCloud(new GoogleDrive()) }
            }
          ],
          [
            {
              label: "Write Protect Disk",
              icon: faLock,
              isSelected: () => { return dprops.isWriteProtected },
              onClick: () => { handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected) }
            },
            {
              label: "-"
            },
            {
              label: "Eject Disk",
              icon: faEject,
              onClick: () => {
                ejectDisk(props.index)
              }
            },
            {
              label: "-"
            },
            {
              label: "Add Disk to Collection",
              icon: faStar,
              isVisible: () => { return dprops.cloudData?.itemId != "" && !diskBookmarks.contains(dprops.cloudData?.itemId || "") },
              onClick: () => {
                if (dprops.cloudData) {
                  diskBookmarks.set({
                    type: DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE,
                    id: dprops.cloudData.itemId,
                    title: dprops.cloudData.fileName,
                    screenshotUrl: getImageDataUrlFromCanvas(),
                    lastUpdated: new Date(dprops.cloudData.lastSyncTime),
                    cloudData: dprops.cloudData
                  })
                }
              }
            },
            {
              label: "-",
              isVisible: () => { return dprops.cloudData?.itemId != "" && !diskBookmarks.contains(dprops.cloudData?.itemId || "") }
            },
            {
              label: "Remove Disk from Collection",
              icon: faStar,
              isVisible: () => { return diskBookmarks.contains(dprops.cloudData?.itemId || "") },
              onClick: () => {
                if (dprops.cloudData && diskBookmarks.contains(dprops.cloudData.itemId)) {
                  diskBookmarks.remove(dprops.cloudData.itemId)
                }
              }
            },
            {
              label: "-",
              isVisible: () => { return diskBookmarks.contains(dprops.cloudData?.itemId || "") }
            },
            {
              label: "Sync Every Minute",
              icon: faClock,
              isSelected: () => { return dprops.cloudData?.syncInterval == 60000 },
              onClick: () => {
                if (dprops.cloudData) {
                  dprops.cloudData.syncInterval = 60000
                }
              }
            },
            {
              label: "Sync Every 5 Minutes",
              icon: faClock,
              isSelected: () => { return dprops.cloudData?.syncInterval == 300000 },
              onClick: () => {
                if (dprops.cloudData) {
                  dprops.cloudData.syncInterval = 300000
                }
              }
            },
            {
              label: "Pause Syncing",
              icon: faPause,
              isSelected: () => { return dprops.cloudData?.syncInterval == Number.MAX_VALUE },
              onClick: () => {
                if (dprops.cloudData) {
                  dprops.cloudData.syncInterval = Number.MAX_VALUE
                }
              }
            },
            {
              label: "-"
            },
            {
              label: "Sync Now",
              icon: faSync,
              isSelected: () => { return dprops.cloudData?.syncInterval == Number.MIN_VALUE },
              onClick: () => {
                if (dprops.cloudData) {
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
                }
              }
            }
          ],
          [
            {
              label: "Load Disk from Device",
              icon: faFolderOpen,
              isVisible: () => { return !hasEnhancedFileAccess() },
              onClick: () => { props.setShowFileOpenDialog(true, props.index) }
            },
            {
              label: "Load Disk from Device (Read/Write)",
              icon: faFolderOpen,
              isVisible: () => { return hasEnhancedFileAccess() },
              onClick: () => { showReadWriteFilePicker(props.index) }
            },
            {
              label: "-"
            },
            {
              label: "Load Disk from Internet Archive",
              svg: svgInternetArchiveLogo,
              onClick: () => {
                showInternetArchivePicker()
              }
            },
            {
              label: "-"
            },
            {
              label: "Load Disk from OneDrive",
              icon: faCloud,
              onClick: () => { loadDiskFromCloud(new OneDriveCloudDrive()) }
            },
            {
              label: "Load Disk from Google Drive",
              icon: faCloud,
              onClick: () => { loadDiskFromCloud(new GoogleDrive()) }
            }
          ]
        ]}
      />

      <InternetArchivePopup
        driveIndex={dprops.index}
        open={internetDialogDialogOpen}
        onClose={() => { setInternetDialogDialogOpen(false) }}>
      </InternetArchivePopup>
    </span>
  )
}

export default DiskDrive
