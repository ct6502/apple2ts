import { useEffect, useMemo, useState } from "react"
import {
  handleSetDiskData, handleGetDriveProps,
  handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer,
  handleSaveWritableFile,
  prepWritableFile,
  doSetUIDriveProps
} from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCloud, faDownload, faEject, faFloppyDisk, faFolderOpen,
  faGlobe,
  faLock, faPause, faRotate, faStar, faSync } from "@fortawesome/free-solid-svg-icons"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import React from "react"
import { CLOUD_SYNC, crc32, FILE_SUFFIXES_DISK, uint32toBytes } from "../../../common/utility"
import PopupMenu from "../../controls/popupmenu"
import { svgDemoZooLogo } from "../../img/icon_demozoo"
import { passSetDriveProps, handleGetSlotConfig } from "../../main2worker"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"
import InternetArchivePopup from "./internetarchivedialog"
import DemoZooDialog from "./demozoodialog"

export const demoZooEnabled = true
import { DiskBookmarks } from "./diskbookmarks"
import { determineVtocType, VTOC_REFRESH } from "../../../common/prodos_hdv"
import { isFileSystemApiSupported } from "../../ui_utilities"
import { useTranslation } from "../../../i18n/useTranslation"
import { convertwoz2dsk } from "../../../common/convertwoz2dsk"
import { faInternetArchive } from "@fortawesome/free-brands-svg-icons"

export const DISK_DRIVE_LABELS = ["S7,D1", "S7,D2", "S6,D1", "S6,D2"]

export const loadDiskFromCloudDrive = async (cloudDrive: CloudProvider, driveIndex: number) => {
  const result = await cloudDrive.download(FILE_SUFFIXES_DISK)
  if (!result) return false

  const [blob, cloudData] = result
  const buffer = await new Response(blob).arrayBuffer()
  handleSetDiskOrFileFromBuffer(driveIndex, buffer, cloudData.fileName, cloudData, null)
  return true
}

export const getBlobFromDiskData = (diskData: Uint8Array, filename: string): Blob => {
  // Only WOZ requires a checksum. Other formats should be ready to download.
  if (filename.toLowerCase().endsWith(".woz")) {
    const crc = crc32(diskData, 12)
    diskData.set(uint32toBytes(crc), 8)
  }
  return new Blob([diskData] as BlobPart[])
}

const downloadDisk = (diskData: Uint8Array, filename: string, isHardDrive: boolean, downloadWoz: boolean) => {
  const fileExt = filename.substring(filename.lastIndexOf(".")).toLowerCase()
  const isFloppy = !isHardDrive && [".dsk", ".do", ".po"].includes(fileExt)
  if (isFloppy) {
    if (downloadWoz) {
      filename = filename.substring(0, filename.lastIndexOf(".")) + ".woz"
    } else {
      diskData = convertwoz2dsk(diskData, fileExt === ".po")
    }
  }
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

export const downloadDiskToDevice = (index: number, downloadWoz = false) => {
  const dprops = handleGetDriveProps(index)
  if (dprops.diskData.length === 0) return

  downloadDisk(dprops.diskData, dprops.filename, dprops.hardDrive, downloadWoz)
  const nextProps: DriveProps = { ...dprops, diskHasChanges: false }
  doSetUIDriveProps(nextProps)
}

export const saveDiskToDevice = async (index: number) => {
  const dprops = handleGetDriveProps(index)
  const fileExtension = dprops.filename.substring(dprops.filename.lastIndexOf("."))
  const writableFileHandle = await window.showSaveFilePicker({
    excludeAcceptAllOption: false,
    suggestedName: dprops.filename,
    types: [{
      description: "Disk image",
      accept: { "application/octet": [fileExtension] as `.${string}`[] },
    }],
  })

  if (!writableFileHandle) return

  const nextProps: DriveProps = {
    ...dprops,
    diskHasChanges: true,
    filename: writableFileHandle.name,
    writableFileHandle,
    lastLocalFileWriteTime: -1,
  }
  passSetDriveProps(nextProps)
  await prepWritableFile(index, writableFileHandle)
}

type DiskDriveProps = {
  index: number,
  renderCount: number,
  setShowFileOpenDialog: (show: boolean, index: number) => void
}

const DiskDrive = (props: DiskDriveProps) => {
  const { t } = useTranslation()
  const dprops = handleGetDriveProps(props.index)
  const diskBookmarks = new DiskBookmarks()

  const [internetDialogDialogOpen, setInternetDialogDialogOpen] = useState<boolean>(false)
  const [demoZooDialogOpen, setDemoZooDialogOpen] = useState<boolean>(false)
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const ejectDisk = (index: number) => {
    handleSetDiskData(index, new Uint8Array(), "", null, null, -1)
  }

  const getDriveFileName = () => {
    if (dprops.cloudData) {
      if (dprops.filename != dprops.cloudData.fileName) {
        const dpropsTmp: DriveProps = { ...dprops }
        if (dpropsTmp.cloudData) {
          dpropsTmp.cloudData.fileName = `apple2ts.${dpropsTmp.filename}`
          doSetUIDriveProps(dpropsTmp)
        }
      }
    }
    return dprops.filename
  }

  const updateCloudDrive = async (cloudProvider: CloudProvider) => {
    const blob = getBlobFromDiskData(dprops.diskData, getDriveFileName())
    if (dprops.cloudData) {
      const success = await cloudProvider.sync(blob, dprops.cloudData)
      if (success) {
        const dpropsTmp: DriveProps = { ...dprops }
        dpropsTmp.diskHasChanges = false
        if (dpropsTmp.cloudData) {
          dpropsTmp.cloudData.fileSize = blob.size
        }
        passSetDriveProps(dpropsTmp)
      }
    }
  }

  useEffect(() => {
    if (!dprops.cloudData) return

    const timer = setInterval(() => {
      if (dprops.cloudData?.syncStatus == CLOUD_SYNC.ACTIVE && dprops.diskHasChanges) {
        const dpropsTmp: DriveProps = { ...dprops }
        if (dpropsTmp.cloudData) {
          dpropsTmp.cloudData.syncStatus = CLOUD_SYNC.PENDING
          doSetUIDriveProps(dpropsTmp)
        }
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
    let label = (dprops.filename + (dprops.diskHasChanges ? ` (${t("disk.modified")})` : ""))

    if (dprops.cloudData && dprops.cloudData.lastSyncTime > 0 && dprops.cloudData.lastSyncTime < Number.MAX_VALUE) {
      label += `\n${t("disk.syncedAt", { date: new Date(dprops.cloudData.lastSyncTime).toLocaleString() })}`
    }

    return label
  }, [dprops.cloudData, dprops.diskHasChanges, dprops.filename, t])

  const saveDiskToCloud = async (cloudProvider: CloudProvider) => {
    const blob = getBlobFromDiskData(dprops.diskData, getDriveFileName())
    const dpropsTmp: DriveProps = { ...dprops }
    dpropsTmp.cloudData = await cloudProvider.upload(dprops.filename, blob)
    if (dpropsTmp.cloudData) {
      if (dpropsTmp.writableFileHandle) {
        await handleSaveWritableFile(dprops.index)
        dpropsTmp.writableFileHandle = null
      }
      dpropsTmp.diskHasChanges = false
      passSetDriveProps(dpropsTmp)
    }
  }

  const showDiskSaveFilePicker = async (index: number) => {
    const fileName = dprops.filename
    const fileExtension = fileName.substring(fileName.lastIndexOf("."))

    const writableFileHandle = await window.showSaveFilePicker({
      excludeAcceptAllOption: false,
      suggestedName: fileName,
      types: [
        {
          description: t("disk.diskImage"),
          accept: { "application/octet": [fileExtension] as `.${string}`[] },
        },
      ]
    })

    if (writableFileHandle) {
      const dpropsTmp: DriveProps = { ...dprops }
      dpropsTmp.diskHasChanges = true
      dpropsTmp.filename = writableFileHandle.name
      dpropsTmp.writableFileHandle = writableFileHandle
      dpropsTmp.lastLocalFileWriteTime = -1
      passSetDriveProps(dpropsTmp)
      prepWritableFile(index, writableFileHandle)
    }
  }

  const showInternetArchivePicker = () => {
    setInternetDialogDialogOpen(true)
  }

  const slotConfig = handleGetSlotConfig()
  const slot = dprops.index < 2 ? 7 : 6
  const isSlotDisabled = slotConfig[slot] === "none"

  const handleMenuClick = (event: React.MouseEvent) => {
    if (isSlotDisabled) return
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
  const isElectron = navigator.userAgent.includes("Electron")
  const isTouchDevice = "ontouchstart" in document.documentElement
  const diskLabelClass = `disk-label${dprops.diskHasChanges ? " disk-label-unsaved" : ""}${isTouchDevice ? " disk-label-small" : ""}`

  const loadDiskSubMenu = [
    {
      label: t("disk.InternetArchive"),
      icon: faInternetArchive,
      onClick: () => {
        setPopupLocation(undefined)
        showInternetArchivePicker()
      }
    },
    {
      label: t("disk.DemoZoo"),
      svg: svgDemoZooLogo,
      isDisabled: !demoZooEnabled,
      onClick: () => {
        setPopupLocation(undefined)
        setDemoZooDialogOpen(true)
      }
    },
    {
      label: t("disk.OneDrive"),
      icon: faCloud,
      isVisible: () => { return !isElectron },
      onClick: () => {
        setPopupLocation(undefined)
        loadDiskFromCloudDrive(new OneDriveCloudDrive(), dprops.index)
      }
    },
    {
      label: t("disk.GoogleDrive"),
      icon: faCloud,
      isVisible: () => { return !isElectron },
      onClick: () => {
        setPopupLocation(undefined)
        loadDiskFromCloudDrive(new GoogleDrive(), dprops.index)
      }
    },
  ]

  return (
    <span
      className="flex-column"
      style={{
        opacity: isSlotDisabled ? 0.4 : 1,
        filter: isSlotDisabled ? "grayscale(100%)" : "none",
        pointerEvents: isSlotDisabled ? "none" : "auto",
        cursor: isSlotDisabled ? "not-allowed" : "pointer",
      }}
      onContextMenu={(event) => {
        event.preventDefault()
        event.stopPropagation()
        if (!isSlotDisabled) handleMenuClick(event)
      }}>
      <span className="flex-row">
        <span className="flex-column">
          <img className={`disk-image${isTouchDevice ? " disk-image-small" : ""}`}
            src={img1} alt={filename}
            id={dprops.index === 2 ? "tour-floppy-disks" : ""}
            title={diskDriveLabel}
            onContextMenu={(event) => {
              event.preventDefault()
              event.stopPropagation()
              if (!isSlotDisabled) handleMenuClick(event)
            }}
            onClick={(event) => { if (!isSlotDisabled) handleMenuClick(event) }} />
          <FontAwesomeIcon
            icon={faRotate}
            className={`fa-fw disk-clouddrive ${cloudDriveStatusClassName}`}>
          </FontAwesomeIcon>
        </span>
      </span>
      <span className={diskLabelClass}>
        {dprops.diskHasChanges ? "*" : ""}{dprops.filename}</span>
      <span className="flex-row">
        <span className={`default-font disk-status${isTouchDevice ? " disk-status-small" : ""}`}>{status}</span>
      </span>

      <PopupMenu
        location={popupLocation}
        style={{
          padding: "5px",
          paddingLeft: "10px",
          paddingRight: "10px"
        }}
        onClose={() => {
          setPopupLocation(undefined)
        }}
        menuItems={[[
          // Disk load
          {
            label: t("disk.loadDisk"),
            icon: faFolderOpen,
            onClick: () => { props.setShowFileOpenDialog(true, props.index) }
          },
          {
              label: t("disk.loadDiskFrom"),
              icon: faGlobe,
              subMenu: loadDiskSubMenu
          },
          {
            label: "-"
          },
          {
            label: t("disk.writeProtectDisk"),
            icon: faLock,
            isDisabled: !dprops.filename || dprops.filename.length === 0,
            isSelected: () => { return dprops.isWriteProtected },
            onClick: () => { handleSetDiskWriteProtected(dprops.index, !dprops.isWriteProtected) }
          },
          {
            label: "-",
          },
          {
            label: t("disk.downloadDisk"),
            icon: faDownload,
            isDisabled: dprops.filename.length === 0,
            onClick: () => {
              if (dprops.diskData.length > 0) {
                downloadDisk(dprops.diskData, filename, dprops.hardDrive, false)
                const dpropsTmp: DriveProps = { ...dprops }
                dpropsTmp.diskHasChanges = false
                doSetUIDriveProps(dpropsTmp)
              }
            }
          },
          {
            label: t("disk.downloadWoz"),
            icon: faDownload,
            isDisabled: dprops.filename.length === 0 || dprops.hardDrive || dprops.filename.toLowerCase().endsWith(".woz"),
            onClick: () => {
              if (dprops.diskData.length > 0) {
                downloadDisk(dprops.diskData, filename, dprops.hardDrive, true)
                const dpropsTmp: DriveProps = { ...dprops }
                dpropsTmp.diskHasChanges = false
                doSetUIDriveProps(dpropsTmp)
              }
            }
          },
          {
            label: t("disk.downloadAndEjectDisk"),
            icon: faDownload,
            isDisabled: dprops.filename.length === 0,
            onClick: () => {
              if (dprops.diskData.length > 0) {
                downloadDisk(dprops.diskData, filename, dprops.hardDrive, false)
                const dpropsTmp: DriveProps = { ...dprops }
                dpropsTmp.diskHasChanges = false
                doSetUIDriveProps(dpropsTmp)
                ejectDisk(props.index)
              }
            }
          },
          {
            label: t("disk.ejectDisk"),
            icon: faEject,
            isDisabled: dprops.filename.length === 0,
            onClick: () => {
              ejectDisk(props.index)
            }
          },
          {
            label: "-"
          },
          {
            label: t("disk.saveDiskToDevice"),
            icon: faFloppyDisk,
            isDisabled: dprops.filename.length === 0,
            isVisible: () => { return isFileSystemApiSupported() && !dprops.writableFileHandle },
            onClick: () => { showDiskSaveFilePicker(props.index) }
          },
          {
            label: t("disk.saveDiskToOneDrive"),
            icon: faCloud,
            isDisabled: dprops.filename.length === 0,
            isVisible: () => { return !isElectron },
            onClick: () => { saveDiskToCloud(new OneDriveCloudDrive()) }
          },
          {
            label: t("disk.saveDiskToGoogleDrive"),
            icon: faCloud,
            isDisabled: dprops.filename.length === 0,
            isVisible: () => { return !isElectron },
            onClick: () => { saveDiskToCloud(new GoogleDrive()) }
          },
          {
            label: t("disk.pauseSyncing"),
            icon: faPause,
            isDisabled: dprops.filename.length === 0,
            isSelected: () => { return dprops.cloudData?.syncInterval == Number.MAX_VALUE },
            onClick: () => {
              if (dprops.cloudData) {
                const dpropsTmp: DriveProps = { ...dprops }
                if (dpropsTmp.cloudData) {
                  dpropsTmp.cloudData.syncInterval = Number.MAX_VALUE
                  doSetUIDriveProps(dpropsTmp)
                }
              }
            }
          },
          {
            label: t("disk.syncNow"),
            icon: faSync,
            isDisabled: dprops.filename.length === 0,
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
          },

          // Disk is in drive
          {
            label: "-"
          },
          {
            label: t("disk.addDiskToCollection"),
            icon: faStar,
            isDisabled: () => {
              const itemId = dprops.cloudData?.itemId
              return !itemId || diskBookmarks.contains(itemId)
            },
            onClick: () => {
              if (dprops.cloudData) {
                diskBookmarks.set({
                  type: dprops.cloudData.downloadUrl ? DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE : DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE,
                  id: dprops.cloudData.itemId,
                  title: dprops.cloudData.fileName,
                  screenshotUrl: getImageDataUrlFromCanvas(),
                  lastUpdated: new Date(Date.now()),
                  diskUrl: dprops.cloudData.downloadUrl,
                  cloudData: dprops.cloudData,
                  vtocType: determineVtocType(dprops.cloudData.fileName || filename, dprops.diskData),
                  vtocVersion: VTOC_REFRESH
                })
              }
            }
          },
          {
            label: t("disk.removeDiskFromCollection"),
            icon: faStar,
            isDisabled: () => {
              const itemId = dprops.cloudData?.itemId
              return !itemId || !diskBookmarks.contains(itemId)
            },
            onClick: () => {
              if (dprops.cloudData && diskBookmarks.contains(dprops.cloudData.itemId)) {
                diskBookmarks.remove(dprops.cloudData.itemId)
              }
            }
          },

        ]]}
      />

      <InternetArchivePopup
        driveIndex={dprops.index}
        open={internetDialogDialogOpen}
        onClose={() => { setInternetDialogDialogOpen(false) }}>
      </InternetArchivePopup>

      <DemoZooDialog
        driveIndex={dprops.index}
        open={demoZooDialogOpen}
        onClose={() => { setDemoZooDialogOpen(false) }}>
      </DemoZooDialog>
    </span>
  )
}

export default DiskDrive
