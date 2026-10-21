import { useEffect, useMemo, useState } from "react"
import {
  handleSetDiskData, handleGetDriveProps,
  handleSetDiskWriteProtected, handleSetDiskOrFileFromBuffer,
  handleSaveWritableFile,
  prepWritableFile,
  doSetUIDriveProps,
  handleSetDiskFromFile,
  getStandbyDisks,
  getStandbyActiveIndex,
  swapStandbyDisk,
  removeStandbyDisk,
  syncActiveDiskToStandby,
  setStandbyDisks,
  type StandbyDisk,
} from "./driveprops"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCloud, faDownload, faEject, faFloppyDisk, faFolderOpen,
  faGlobe, faLayerGroup,
  faLock, faPause, faRotate, faStar, faSync
} from "@fortawesome/free-solid-svg-icons"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import { GoogleDrive } from "./googledrive"
import { CLOUD_SYNC, FILE_SUFFIXES_ALL, getCleanDiskFilename, isWozData, getBlobFromDiskData, getDiskBlobForSync, RUN_MODE } from "../../../common/utility"
import { decompressAllDiskFiles, compareDiskFilenames } from "../../../common/zip_utils"
import PopupMenu from "../../controls/popupmenu"
import { svgDemoZooLogo } from "../../img/icon_demozoo"
import { passSetDriveProps, handleGetSlotConfig, handleGetRunMode } from "../../main2worker"
import InternetArchivePopup from "./internetarchivedialog"
import DemoZooDialog from "./demozoodialog"

export const demoZooEnabled = true
import { DiskBookmarks } from "./diskbookmarks"
import { canFavoriteDisk, isDiskFavorite, setDiskFavorite } from "./diskfavorites"
import { isFileSystemApiSupported } from "../../ui_utilities"
import { useTranslation } from "../../../i18n/useTranslation"
import { faInternetArchive } from "@fortawesome/free-brands-svg-icons"
import { RestoreSaveState } from "../../savestate"
import { DISK_LOAD_SUCCESS_EVENT } from "../../ui_settings"

export const DISK_DRIVE_LABELS = ["S7,D1", "S7,D2", "S6,D1", "S6,D2"]

export const loadDiskFromCloudDrive = async (cloudDrive: CloudProvider, driveIndex: number) => {
  const result = await cloudDrive.download(FILE_SUFFIXES_ALL)
  if (!result) return false

  const rawItems: Array<[Blob, CloudData]> = Array.isArray(result)
    ? (Array.isArray(result[0]) ? (result as Array<[Blob, CloudData]>) : [result as [Blob, CloudData]])
    : [result]

  if (rawItems.length === 1) {
    const [blob, cloudData] = rawItems[0]
    const ext = cloudData.fileName.substring(cloudData.fileName.lastIndexOf(".")).toLowerCase()
    if (ext === ".a2ts") {
      const text = typeof blob.text === "function"
        ? await blob.text()
        : await new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = () => reject(reader.error)
            reader.readAsText(blob)
          })
      RestoreSaveState(text)
      window.dispatchEvent(new CustomEvent(DISK_LOAD_SUCCESS_EVENT))
      return true
    }
  }

  const processedList: StandbyDisk[] = []
  for (const [blob, cloudData] of rawItems) {
    const buffer = typeof blob.arrayBuffer === "function"
      ? await blob.arrayBuffer()
      : await new Promise<ArrayBuffer>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as ArrayBuffer)
          reader.onerror = () => reject(reader.error)
          reader.readAsArrayBuffer(blob)
        })
    const decompressedList = await decompressAllDiskFiles(
      buffer,
      cloudData.fileName,
      [".woz", ".po", ".dsk", ".do", ".2mg", ".hdv", ".2meg", ".img", ".nib", ".bin", ".bas", ".a"]
    )
    if (decompressedList && decompressedList.length > 0) {
      const archiveCloudData: CloudData = {
        ...cloudData,
        syncStatus: CLOUD_SYNC.INACTIVE,
        isArchive: true,
      }
      for (const item of decompressedList) {
        processedList.push({
          filename: getCleanDiskFilename(item.filename),
          diskData: new Uint8Array(item.buffer),
          diskHasChanges: false,
          isWriteProtected: false,
          writableFileHandle: null,
          cloudData: archiveCloudData,
          lastAppleWriteTime: -1,
          lastLocalFileWriteTime: -1,
        })
      }
    } else {
      processedList.push({
        filename: getCleanDiskFilename(cloudData.fileName),
        diskData: new Uint8Array(buffer),
        diskHasChanges: false,
        isWriteProtected: false,
        writableFileHandle: null,
        cloudData,
        lastAppleWriteTime: -1,
        lastLocalFileWriteTime: -1,
      })
    }
  }

  if (processedList.length === 0) return false

  processedList.sort((a, b) => compareDiskFilenames(a.filename, b.filename))

  const first = processedList[0]
  const isIdle = handleGetRunMode() === RUN_MODE.IDLE
  const newIndex = handleSetDiskOrFileFromBuffer(
    driveIndex,
    first.diskData.buffer as ArrayBuffer,
    first.filename,
    first.cloudData,
    null,
    undefined,
    true, // preserveDriveIndex: keep user's chosen drive!
    false, // confirmed
    true, // noReset
    !isIdle, // noBoot: if already running, DO NOT reboot! If idle, boot!
  )
  setStandbyDisks(newIndex, processedList, 0)
  window.dispatchEvent(new CustomEvent(DISK_LOAD_SUCCESS_EVENT))
  return true
}

export { getBlobFromDiskData }

const downloadDisk = (diskData: Uint8Array, filename: string, isHardDrive: boolean, downloadWoz: boolean) => {
  const fileExt = filename.substring(filename.lastIndexOf(".")).toLowerCase()
  const isFloppy = !isHardDrive && [".dsk", ".do", ".po"].includes(fileExt)
  if (isFloppy && downloadWoz) {
    filename = filename.substring(0, filename.lastIndexOf(".")) + ".woz"
  }
  const blob = getDiskBlobForSync(diskData, filename, isHardDrive)
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link)
    }
    URL.revokeObjectURL(url)
  }, 10000)
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
  await handleSaveWritableFile(index, writableFileHandle)
  nextProps.diskHasChanges = false
  nextProps.lastLocalFileWriteTime = Date.now()
  passSetDriveProps(nextProps)
}

type DiskDriveProps = {
  index: number,
  renderCount: number,
  setShowFileOpenDialog: (show: boolean, index: number, append?: boolean) => void,
  updateDisplay?: UpdateDisplay,
}

const DiskDrive = (props: DiskDriveProps) => {
  const { t, language } = useTranslation()
  const isEnglish = language.startsWith("en")
  const dprops = handleGetDriveProps(props.index)
  const diskBookmarks = new DiskBookmarks()

  const [internetDialogDialogOpen, setInternetDialogDialogOpen] = useState<boolean>(false)
  const [demoZooDialogOpen, setDemoZooDialogOpen] = useState<boolean>(false)
  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const [swapperPopupLocation, setSwapperPopupLocation] = useState<[number, number]>()
  const [, setStandbyRefresh] = useState(0)

  const triggerStandbyUpdate = () => {
    setStandbyRefresh(v => v + 1)
    props.updateDisplay?.()
  }

  const standbyDisks = getStandbyDisks(props.index)
  const validStandbyDisks = standbyDisks.filter(d => Boolean(d && d.filename && d.filename.trim()))
  const hasMultipleDisks = Boolean(dprops.filename) && validStandbyDisks.length >= 2
  const standbyActiveIndex = getStandbyActiveIndex(props.index)

  const ejectDisk = (index: number) => {
    handleSetDiskData(index, new Uint8Array(), "", null, null, -1)
    triggerStandbyUpdate()
  }

  const getDriveFileName = () => {
    if (dprops.cloudData && !dprops.cloudData.itemId) {
      if (dprops.filename != dprops.cloudData.fileName) {
        const dpropsTmp: DriveProps = { ...dprops }
        if (dpropsTmp.cloudData) {
          dpropsTmp.cloudData.fileName = `apple2ts.${dpropsTmp.filename}`
          doSetUIDriveProps(dpropsTmp)
        }
      }
    }
    return dprops.cloudData?.fileName || dprops.filename
  }

  const updateCloudDrive = async (cloudProvider: CloudProvider) => {
    if (!dprops.cloudData || dprops.cloudData.isArchive) return
    const filename = getDriveFileName()
    const blob = getDiskBlobForSync(dprops.diskData, filename, dprops.hardDrive)
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
      if (dprops.cloudData?.isArchive) return
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
    if (!dprops.cloudData || dprops.cloudData.isArchive) return "disk-clouddrive-inactive"

    const syncStatus = dprops.cloudData?.syncStatus

    if (dprops.cloudData?.syncInterval == Number.MAX_VALUE
      && syncStatus != CLOUD_SYNC.INACTIVE
      && syncStatus != CLOUD_SYNC.INPROGRESS) {
      return "disk-clouddrive-paused"
    } else {
      return `disk-clouddrive-${CLOUD_SYNC[syncStatus].toLowerCase()}`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dprops.cloudData, dprops.cloudData?.syncStatus, dprops.cloudData?.syncInterval, dprops.cloudData?.isArchive])

  const diskDriveLabel = useMemo(() => {
    let label = (dprops.filename + (dprops.diskHasChanges ? ` (${t("disk.modified")})` : ""))

    if (dprops.cloudData && dprops.cloudData.lastSyncTime > 0 && dprops.cloudData.lastSyncTime < Number.MAX_VALUE) {
      label += `\n${t("disk.syncedAt", { date: new Date(dprops.cloudData.lastSyncTime).toLocaleString() })}`
    }

    return label
  }, [dprops.cloudData, dprops.diskHasChanges, dprops.filename, t])

  const saveDiskToCloud = async (cloudProvider: CloudProvider) => {
    const filename = getDriveFileName()
    const blob = getDiskBlobForSync(dprops.diskData, filename, dprops.hardDrive)
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
      await handleSaveWritableFile(index, writableFileHandle)
      dpropsTmp.diskHasChanges = false
      // eslint-disable-next-line react-hooks/purity
      dpropsTmp.lastLocalFileWriteTime = Date.now()
      passSetDriveProps(dpropsTmp)
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

  const saveDiskSubMenu = [
    {
      label: t("disk.OneDrive"),
      icon: faCloud,
      onClick: () => { saveDiskToCloud(new OneDriveCloudDrive()) }
    },
    {
      label: t("disk.GoogleDrive"),
      icon: faCloud,
      onClick: () => { saveDiskToCloud(new GoogleDrive()) }
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
        <span className="flex-column" style={{ position: "relative" }}>
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
          {hasMultipleDisks && (
            <span
              className="disk-multidisk-badge"
              title={t("disk.standbyDisks")}
              onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
                setSwapperPopupLocation([event.clientX, event.clientY])
              }}>
              <FontAwesomeIcon icon={faLayerGroup} />
            </span>
          )}
          <FontAwesomeIcon
            icon={cloudDriveStatusClassName === "disk-clouddrive-paused" ? faPause : faRotate}
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
            label: isEnglish ? "Load Disk(s)..." : t("disk.loadDisk"),
            icon: faFolderOpen,
            onClick: () => { props.setShowFileOpenDialog(true, props.index, false) }
          },
          {
            label: t("disk.loadAdditionalDisks"),
            icon: faLayerGroup,
            isDisabled: dprops.filename.length === 0,
            onClick: () => { props.setShowFileOpenDialog(true, props.index, true) }
          },
          {
            label: t("disk.loadDiskFrom"),
            icon: faGlobe,
            subMenu: loadDiskSubMenu
          },
          {
            label: t("disk.insertBlankDisk"),
            icon: faFloppyDisk,
            isDisabled: dprops.hardDrive,
            onClick: () => { handleSetDiskFromFile("blank.woz", null, dprops.index) }
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
            label: t("disk.addToFavorites"),
            icon: faStar,
            isDisabled: () => !canFavoriteDisk(dprops),
            isSelected: () => isDiskFavorite(diskBookmarks, dprops),
            onClick: () => {
              setDiskFavorite(
                diskBookmarks,
                dprops,
                !isDiskFavorite(diskBookmarks, dprops),
                getImageDataUrlFromCanvas(),
              )
            }
          },
          {
            label: "-",
          },
          {
            label: (isEnglish && hasMultipleDisks) ? "Download Disk(s)..." : `${t("disk.downloadDisk")}...`,
            icon: faDownload,
            isDisabled: dprops.filename.length === 0,
            onClick: () => {
              if (dprops.diskData.length > 0) {
                syncActiveDiskToStandby(props.index)
                const currentStandby = getStandbyDisks(props.index).filter(d => Boolean(d && d.filename && d.filename.trim()))
                const disksToDownload = hasMultipleDisks ? currentStandby : [{ filename, diskData: dprops.diskData }]
                disksToDownload.forEach((d, i) => {
                  setTimeout(() => {
                    downloadDisk(d.diskData, d.filename, dprops.hardDrive, false)
                  }, i * 200)
                })
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
                if (hasMultipleDisks) {
                  syncActiveDiskToStandby(props.index)
                  const currentStandby = getStandbyDisks(props.index).filter(d => Boolean(d && d.filename && d.filename.trim()))
                  currentStandby.forEach((d, i) => {
                    setTimeout(() => {
                      downloadDisk(d.diskData, d.filename, dprops.hardDrive, false)
                    }, i * 200)
                  })
                } else {
                  downloadDisk(dprops.diskData, filename, dprops.hardDrive, false)
                }
                const dpropsTmp: DriveProps = { ...dprops }
                dpropsTmp.diskHasChanges = false
                doSetUIDriveProps(dpropsTmp)
                ejectDisk(props.index)
              }
            }
          },
          {
            label: (isEnglish && hasMultipleDisks) ? "Eject Disk(s)" : t("disk.ejectDisk"),
            icon: faEject,
            isDisabled: dprops.filename.length === 0,
            subMenu: hasMultipleDisks
              ? [
                  {
                    label: t("disk.ejectAllDisks"),
                    onClick: () => {
                      ejectDisk(props.index)
                    }
                  },
                  {
                    label: "-"
                  },
                  ...validStandbyDisks.map((disk, idx) => {
                    const cleanFilename = getCleanDiskFilename(disk.filename)
                    const displayName = disk.comment ? `${cleanFilename} (${disk.comment})` : cleanFilename
                    return {
                      label: `Eject: ${displayName}`,
                      onClick: () => {
                        removeStandbyDisk(props.index, idx, triggerStandbyUpdate)
                      }
                    }
                  })
                ]
              : undefined,
            onClick: !hasMultipleDisks ? () => { ejectDisk(props.index) } : undefined,
          },
          {
            label: "-"
          },
          {
            label: (isEnglish && hasMultipleDisks) ? "Save Disk(s)" : t("disk.saveDiskToDevice"),
            icon: faFloppyDisk,
            isDisabled: dprops.filename.length === 0,
            isVisible: () => { return isFileSystemApiSupported() && !dprops.writableFileHandle },
            onClick: async () => {
              if (!hasMultipleDisks) {
                await showDiskSaveFilePicker(props.index)
              } else {
                syncActiveDiskToStandby(props.index)
                const currentStandby = getStandbyDisks(props.index).filter(d => Boolean(d && d.filename && d.filename.trim()))
                for (let i = 0; i < currentStandby.length; i++) {
                  const disk = currentStandby[i]
                  const fileExtension = disk.filename.includes(".")
                    ? disk.filename.substring(disk.filename.lastIndexOf("."))
                    : (isWozData(disk.diskData) ? ".woz" : ".dsk")
                  try {
                    const writableFileHandle = await window.showSaveFilePicker({
                      excludeAcceptAllOption: false,
                      suggestedName: disk.filename,
                      types: [{
                        description: t("disk.diskImage"),
                        accept: { "application/octet": [fileExtension] as `.${string}`[] },
                      }],
                    })
                    if (writableFileHandle) {
                      const targetName = writableFileHandle.name || disk.filename
                      const writable = await writableFileHandle.createWritable()
                      await writable.write(getDiskBlobForSync(disk.diskData, targetName, dprops.hardDrive))
                      await writable.close()
                      disk.diskHasChanges = false
                      disk.filename = targetName
                      disk.writableFileHandle = writableFileHandle
                    }
                  } catch {
                    break
                  }
                }
                const dpropsTmp: DriveProps = { ...dprops, diskHasChanges: false }
                doSetUIDriveProps(dpropsTmp)
              }
            }
          },
          {
            label: t("disk.saveDiskTo"),
            icon: faGlobe,
            isDisabled: dprops.filename.length === 0,
            isVisible: () => { return !isElectron },
            subMenu: saveDiskSubMenu
          },
          {
            label: t("disk.pauseSyncing"),
            icon: faPause,
            isDisabled: () => {
              if (dprops.filename.length === 0) return true
              if (!dprops.cloudData || dprops.cloudData.isArchive) return true
              if (dprops.cloudData.providerName !== "OneDrive" && dprops.cloudData.providerName !== "GoogleDrive") return true
              return false
            },
            isSelected: () => { return dprops.cloudData?.syncInterval == Number.MAX_VALUE },
            onClick: () => {
              if (dprops.cloudData) {
                const dpropsTmp: DriveProps = { ...dprops }
                if (dpropsTmp.cloudData) {
                  const isCurrentlyPaused = dpropsTmp.cloudData.syncInterval === Number.MAX_VALUE
                  dpropsTmp.cloudData.syncInterval = isCurrentlyPaused ? 60000 : Number.MAX_VALUE
                  doSetUIDriveProps(dpropsTmp)
                }
              }
            }
          },
          {
            label: t("disk.syncNow"),
            icon: faSync,
            isDisabled: () => {
              if (dprops.filename.length === 0) return true
              if (!dprops.cloudData || dprops.cloudData.isArchive) return true
              if (dprops.cloudData.providerName !== "OneDrive" && dprops.cloudData.providerName !== "GoogleDrive") return true
              return false
            },
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
        ]]}
      />

      {hasMultipleDisks && (
        <PopupMenu
          location={swapperPopupLocation}
          style={{
            padding: "5px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
          onClose={() => {
            setSwapperPopupLocation(undefined)
          }}
          menuItems={[
            validStandbyDisks.map((disk, idx) => {
              const cleanFilename = getCleanDiskFilename(disk.filename)
              const displayName = disk.comment ? `${cleanFilename} (${disk.comment})` : cleanFilename
              return {
                label: displayName,
                icon: faFloppyDisk,
                isSelected: () => idx === standbyActiveIndex,
                onClick: async () => {
                  setSwapperPopupLocation(undefined)
                  if (idx !== standbyActiveIndex) {
                    if (dprops.diskHasChanges) {
                      if (dprops.writableFileHandle) {
                        await handleSaveWritableFile(dprops.index)
                      } else if (isFileSystemApiSupported()) {
                        await showDiskSaveFilePicker(props.index)
                      }
                    }
                    await swapStandbyDisk(props.index, idx, undefined, triggerStandbyUpdate)
                  }
                },
              }
            }),
          ]}
        />
      )}

      <InternetArchivePopup
        driveIndex={dprops.index}
        open={internetDialogDialogOpen}
        onClose={() => { setInternetDialogDialogOpen(false) }}
        onLoadSuccess={triggerStandbyUpdate}>
      </InternetArchivePopup>

      <DemoZooDialog
        driveIndex={dprops.index}
        open={demoZooDialogOpen}
        onClose={() => { setDemoZooDialogOpen(false) }}
        onLoadSuccess={triggerStandbyUpdate}>
      </DemoZooDialog>
    </span>
  )
}

export default DiskDrive
