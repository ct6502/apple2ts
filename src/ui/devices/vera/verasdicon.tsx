import React, { useEffect, useMemo, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faCloud,
  faDownload,
  faEject,
  faFloppyDisk,
  faFolderOpen,
  faGlobe,
  faLock,
  faPause,
  faRotate,
  faStar,
  faSync
} from "@fortawesome/free-solid-svg-icons"
import "../disk/diskinterface.css"
import PopupMenu from "../../controls/popupmenu"
import {
  handleGetVeraSdStatus,
  subscribeVeraSdStatus,
  handleSetVeraSdImage,
  handleGetSlotConfig,
  requestVeraSdImage,
  handleSetVeraSdWriteProtected,
  handleClearVeraSdChanges
} from "../../main2worker"
import { getPreferenceSlotConfig } from "../../localstorage"
import { SETTINGS_CHANGED_EVENT } from "../../settingschange"
import { isFileSystemApiSupported } from "../../ui_utilities"
import { toHex, VeraSdStatus } from "../../../common/utility"
import { useTranslation } from "../../../i18n/useTranslation"
import { OneDriveCloudDrive } from "../disk/onedriveclouddrive"
import { GoogleDrive } from "../disk/googledrive"

export interface VeraSdIconProps {
  renderCount?: number
}

const isVeraInstalledInSlot = (): boolean => {
  const prefConfig = getPreferenceSlotConfig()
  const workerConfig = handleGetSlotConfig()
  return prefConfig[2] === "vera" || prefConfig[4] === "vera" || workerConfig[2] === "vera" || workerConfig[4] === "vera"
}

let currentVeraSdFileHandle: FileSystemFileHandle | null = null

export const setVeraSdFileHandle = (handle: FileSystemFileHandle | null) => {
  currentVeraSdFileHandle = handle
}

export const getVeraSdFileHandle = () => currentVeraSdFileHandle

export const downloadSdImage = (diskData: Uint8Array, filename: string) => {
  const blob = new Blob([diskData] as BlobPart[], { type: "application/octet-stream" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", filename || "sd.img")
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

export const openSdFilePicker = async () => {
  if (isFileSystemApiSupported()) {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: "SD Card Images (*.img, *.bin, *.sd, *.iso, *.raw, *.dsk)",
            accept: {
              "application/octet-stream": [".img", ".bin", ".sd", ".iso", ".raw", ".dsk"]
            }
          }
        ],
        excludeAcceptAllOption: false,
        multiple: false
      })
      if (fileHandle) {
        setVeraSdFileHandle(fileHandle)
        const file = await fileHandle.getFile()
        const buffer = await file.arrayBuffer()
        handleSetVeraSdImage(new Uint8Array(buffer), file.name)
        return
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        return // User cancelled
      }
      console.warn("showOpenFilePicker error, falling back to input element:", err)
    }
  }

  // Fallback for browsers without File System Access API
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".img,.bin,.sd,.iso,.raw,.dsk"
  input.style.position = "fixed"
  input.style.left = "-9999px"
  input.style.top = "-9999px"
  input.style.opacity = "0"
  document.body.appendChild(input)

  input.onchange = async () => {
    try {
      const file = input.files?.[0]
      if (file) {
        const buffer = await file.arrayBuffer()
        handleSetVeraSdImage(new Uint8Array(buffer), file.name)
      }
    } finally {
      if (document.body.contains(input)) {
        document.body.removeChild(input)
      }
    }
  }

  input.click()
}

let currentVeraSdCloudData: CloudData | null = null
const cloudDataListeners = new Set<(data: CloudData | null) => void>()
export const getVeraSdCloudData = () => currentVeraSdCloudData
export const setVeraSdCloudData = (data: CloudData | null) => {
  currentVeraSdCloudData = data
  cloudDataListeners.forEach(l => l(data))
}

let veraSdSyncPaused = false
const syncPausedListeners = new Set<(paused: boolean) => void>()
export const isVeraSdSyncPaused = () => veraSdSyncPaused
export const setVeraSdSyncPaused = (paused: boolean) => {
  veraSdSyncPaused = paused
  syncPausedListeners.forEach(l => l(paused))
}
export const toggleVeraSdSyncPaused = () => setVeraSdSyncPaused(!veraSdSyncPaused)

let veraSdSyncing = false
const syncingListeners = new Set<(syncing: boolean) => void>()
export const isVeraSdSyncing = () => veraSdSyncing
export const setVeraSdSyncing = (syncing: boolean) => {
  veraSdSyncing = syncing
  syncingListeners.forEach(l => l(syncing))
}

export const showSdSaveFilePicker = async () => {
  const result = await requestVeraSdImage()
  if (!result || !result.data) return
  const fileName = result.name || "sd.img"
  const fileExtension = fileName.includes(".") ? fileName.substring(fileName.lastIndexOf(".")) : ".img"
  try {
    const writableFileHandle = await window.showSaveFilePicker({
      excludeAcceptAllOption: false,
      suggestedName: fileName,
      types: [
        {
          description: "Disk Image",
          accept: { "application/octet-stream": [fileExtension] as `.${string}`[] },
        },
      ]
    })
    if (writableFileHandle) {
      setVeraSdFileHandle(writableFileHandle)
      const writable = await writableFileHandle.createWritable()
      const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
      await writable.write(blob)
      await writable.close()
      handleClearVeraSdChanges()
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name !== "AbortError") {
      console.warn("Save file picker error, falling back to download:", err)
      downloadSdImage(result.data, fileName)
      handleClearVeraSdChanges()
    }
  }
}

export const saveVeraSdToDevice = async () => {
  const result = await requestVeraSdImage()
  if (!result || !result.data) return
  if (currentVeraSdFileHandle) {
    try {
      const writable = await currentVeraSdFileHandle.createWritable()
      const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
      await writable.write(blob)
      await writable.close()
      handleClearVeraSdChanges()
      return
    } catch (err) {
      console.warn("Direct write to file handle failed, falling back to picker:", err)
    }
  }
  await showSdSaveFilePicker()
}

export const loadVeraSdFromCloud = async (cloudProvider: CloudProvider) => {
  try {
    const result = await cloudProvider.download(".img,.bin,.sd,.iso,.raw,.dsk")
    if (result) {
      const [blob, data] = result
      const buffer = await new Response(blob).arrayBuffer()
      handleSetVeraSdImage(new Uint8Array(buffer), data.fileName)
      setVeraSdCloudData(data)
    }
  } catch (err) {
    console.warn("Cloud download failed:", err)
  }
}

export const saveVeraSdToCloud = async (cloudProvider: CloudProvider) => {
  setVeraSdSyncing(true)
  const startTime = Date.now()
  try {
    const result = await requestVeraSdImage()
    if (!result || !result.data) return
    const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
    const uploaded = await cloudProvider.upload(result.name || "sd.img", blob)
    if (uploaded) {
      setVeraSdCloudData(uploaded)
      handleClearVeraSdChanges()
    }
  } catch (err) {
    console.warn("Cloud upload failed:", err)
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 1500 - elapsed)
    setTimeout(() => {
      setVeraSdSyncing(false)
    }, remaining)
  }
}

export const syncVeraSdNow = async () => {
  setVeraSdSyncing(true)
  const startTime = Date.now()
  try {
    const result = await requestVeraSdImage()
    if (!result || !result.data) return

    if (currentVeraSdFileHandle) {
      try {
        const writable = await currentVeraSdFileHandle.createWritable()
        const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
        await writable.write(blob)
        await writable.close()
        handleClearVeraSdChanges()
        return
      } catch (err) {
        console.warn("Sync to local file failed, trying cloud/picker fallback:", err)
      }
    }

    if (currentVeraSdCloudData) {
      const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
      const provider = currentVeraSdCloudData.providerName === "OneDrive" ? new OneDriveCloudDrive() : new GoogleDrive()
      const success = await provider.sync(blob, currentVeraSdCloudData)
      if (success) {
        handleClearVeraSdChanges()
        return
      }
    }

    await showSdSaveFilePicker()
  } finally {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, 1500 - elapsed)
    setTimeout(() => {
      setVeraSdSyncing(false)
    }, remaining)
  }
}

export const downloadVeraSd = async () => {
  const result = await requestVeraSdImage()
  if (result && result.data) {
    downloadSdImage(result.data, result.name)
  }
}

export const ejectVeraSd = () => {
  setVeraSdFileHandle(null)
  setVeraSdSyncPaused(false)
  setVeraSdSyncing(false)
  handleSetVeraSdImage(null)
}

export const downloadAndEjectVeraSd = async () => {
  const result = await requestVeraSdImage()
  if (result && result.data) {
    downloadSdImage(result.data, result.name)
    handleClearVeraSdChanges()
  }
  ejectVeraSd()
}

export const VeraSdIcon: React.FC<VeraSdIconProps> = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<VeraSdStatus>(handleGetVeraSdStatus())
  const [installed, setInstalled] = useState<boolean>(isVeraInstalledInSlot)
  const [popupLocation, setPopupLocation] = useState<[number, number] | undefined>(undefined)
  const [isSyncPaused, setIsSyncPaused] = useState<boolean>(isVeraSdSyncPaused)
  const [isSyncing, setIsSyncing] = useState<boolean>(isVeraSdSyncing)

  useEffect(() => {
    return subscribeVeraSdStatus((newStatus) => {
      setStatus({ ...newStatus })
    })
  }, [])

  useEffect(() => {
    const onPause = (p: boolean) => setIsSyncPaused(p)
    const onSync = (s: boolean) => setIsSyncing(s)
    syncPausedListeners.add(onPause)
    syncingListeners.add(onSync)
    return () => {
      syncPausedListeners.delete(onPause)
      syncingListeners.delete(onSync)
    }
  }, [])

  useEffect(() => {
    const handleSettings = () => {
      setInstalled(isVeraInstalledInSlot())
    }
    window.addEventListener(SETTINGS_CHANGED_EVENT, handleSettings)
    window.addEventListener("apple2ts-slot-config-changed", handleSettings)
    return () => {
      window.removeEventListener(SETTINGS_CHANGED_EVENT, handleSettings)
      window.removeEventListener("apple2ts-slot-config-changed", handleSettings)
    }
  }, [])

  const slotConfig = getPreferenceSlotConfig()
  const workerConfig = handleGetSlotConfig()
  const veraSlot = (slotConfig[4] === "vera" || workerConfig[4] === "vera") ? 4 : 2
  const isTouchDevice = typeof window !== "undefined" && "ontouchstart" in document.documentElement
  const isElectron = typeof navigator !== "undefined" && navigator.userAgent.includes("Electron")

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (popupLocation) {
      setPopupLocation(undefined)
      return
    }
    setPopupLocation([e.clientX, e.clientY])
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const buffer = await file.arrayBuffer()
      handleSetVeraSdImage(new Uint8Array(buffer), file.name)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const sizeFormatted = status.attached
    ? status.size >= 1024 * 1024
      ? `${(status.size / (1024 * 1024)).toFixed(1)} MB`
      : `${(status.size / 1024).toFixed(0)} KB`
    : ""

  const titleText = status.attached
    ? `VERA SD: ${status.name}${status.hasChanges ? ` (${t("disk.modified")})` : ""}${status.writeProtected ? ` [${t("disk.writeProtectDisk")}]` : ""} (${sizeFormatted})${status.lba !== undefined ? ` [LBA ${toHex(status.lba, status.lba > 0xFFFF ? 6 : 4)}]` : ""} - Click for options`
    : "VERA SD: No card inserted - Click to load SD Image"

  const lbaFormatted = status.lba !== undefined
    ? ` ${toHex(status.lba, status.lba > 0xFFFF ? 6 : 4)}`
    : ""
  const statusText = `S${veraSlot},SD${lbaFormatted}`

  // When disk has changes, turn filename red and prefix with *
  const diskLabelClass = `disk-label${status.hasChanges ? " disk-label-unsaved" : ""}${isTouchDevice ? " disk-label-small" : ""}`

  // Background auto-save to local file handle when not paused
  useEffect(() => {
    if (!status.attached || !status.hasChanges || isSyncPaused || !currentVeraSdFileHandle) {
      return
    }
    const timer = setTimeout(async () => {
      if (isSyncPaused || !currentVeraSdFileHandle) return
      setVeraSdSyncing(true)
      const startTime = Date.now()
      try {
        const result = await requestVeraSdImage()
        if (result && result.data && currentVeraSdFileHandle) {
          const writable = await currentVeraSdFileHandle.createWritable()
          const blob = new Blob([result.data] as BlobPart[], { type: "application/octet-stream" })
          await writable.write(blob)
          await writable.close()
          handleClearVeraSdChanges()
        }
      } catch (err) {
        console.warn("Auto-save to local file failed:", err)
      } finally {
        const elapsed = Date.now() - startTime
        const remaining = Math.max(0, 1500 - elapsed)
        setTimeout(() => {
          setVeraSdSyncing(false)
        }, remaining)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [status.attached, status.hasChanges, isSyncPaused])

  const menuItems = useMemo(() => {
    const loadDiskSubMenu = [
      {
        label: t("disk.OneDrive"),
        icon: faCloud,
        isVisible: () => !isElectron,
        onClick: () => {
          setPopupLocation(undefined)
          void loadVeraSdFromCloud(new OneDriveCloudDrive())
        }
      },
      {
        label: t("disk.GoogleDrive"),
        icon: faCloud,
        isVisible: () => !isElectron,
        onClick: () => {
          setPopupLocation(undefined)
          void loadVeraSdFromCloud(new GoogleDrive())
        }
      },
    ]

    const saveDiskSubMenu = [
      {
        label: t("disk.OneDrive"),
        icon: faCloud,
        onClick: () => {
          setPopupLocation(undefined)
          void saveVeraSdToCloud(new OneDriveCloudDrive())
        }
      },
      {
        label: t("disk.GoogleDrive"),
        icon: faCloud,
        onClick: () => {
          setPopupLocation(undefined)
          void saveVeraSdToCloud(new GoogleDrive())
        }
      },
    ]

    return [[
    // 1. 載入磁碟 (Load Disk)
    {
      label: t("disk.loadDisk"),
      icon: faFolderOpen,
      onClick: () => {
        setPopupLocation(undefined)
        setTimeout(() => {
          openSdFilePicker()
        }, 50)
      }
    },
    // 2. 載入磁碟自 (Load Disk From)
    {
      label: t("disk.loadDiskFrom"),
      icon: faGlobe,
      subMenu: loadDiskSubMenu
    },
    {
      label: "-"
    },
    // 3. 磁碟防寫保護 (Write-protect Disk)
    {
      label: t("disk.writeProtectDisk"),
      icon: faLock,
      isDisabled: !status.attached,
      isSelected: () => !!status.writeProtected,
      onClick: () => {
        setPopupLocation(undefined)
        handleSetVeraSdWriteProtected(!status.writeProtected)
      }
    },
    // 4. 加入收藏 (Add to Favorites - grey out)
    {
      label: t("disk.addToFavorites"),
      icon: faStar,
      isDisabled: true
    },
    {
      label: "-"
    },
    // 5. 下載磁碟 (Download Disk)
    {
      label: t("disk.downloadDisk"),
      icon: faDownload,
      isDisabled: !status.attached,
      onClick: async () => {
        setPopupLocation(undefined)
        downloadVeraSd()
      }
    },
    // 6. 下載 WOZ 磁碟映像 (Download WOZ Disk Image - grey out)
    {
      label: t("disk.downloadWoz"),
      icon: faDownload,
      isDisabled: true
    },
    // 7. 下載並退出磁碟 (Download & Eject Disk)
    {
      label: t("disk.downloadAndEjectDisk"),
      icon: faDownload,
      isDisabled: !status.attached,
      onClick: async () => {
        setPopupLocation(undefined)
        downloadAndEjectVeraSd()
      }
    },
    // 8. 退出磁碟 (Eject Disk)
    {
      label: t("disk.ejectDisk"),
      icon: faEject,
      isDisabled: !status.attached,
      onClick: () => {
        setPopupLocation(undefined)
        ejectVeraSd()
      }
    },
    {
      label: "-"
    },
    // 9. 儲存磁碟 (Save Disk to Device)
    {
      label: t("disk.saveDiskToDevice"),
      icon: faFloppyDisk,
      isDisabled: !status.attached,
      isVisible: () => isFileSystemApiSupported(),
      onClick: () => {
        saveVeraSdToDevice()
      }
    },
    // 10. 儲存磁碟到 (Save Disk To)
    {
      label: t("disk.saveDiskTo"),
      icon: faGlobe,
      isDisabled: !status.attached,
      isVisible: () => !isElectron,
      subMenu: saveDiskSubMenu
    },
    // 11. 暫停同步 (Pause Syncing)
    {
      label: t("disk.pauseSyncing"),
      icon: faPause,
      isDisabled: !status.attached,
      isSelected: () => isSyncPaused,
      onClick: () => {
        setPopupLocation(undefined)
        toggleVeraSdSyncPaused()
      }
    },
    // 12. 立即同步 (Sync Now)
    {
      label: t("disk.syncNow"),
      icon: faSync,
      isDisabled: !status.attached || isSyncing,
      onClick: () => {
        setPopupLocation(undefined)
        syncVeraSdNow()
      }
    }
  ]]}, [status, isElectron, t, isSyncPaused, isSyncing])

  // If VERA is not in slot 2 or 4, do not render at all
  if (!installed) {
    return null
  }

  return (
    <>
      <span
        className="flex-column"
        style={{
          cursor: "pointer",
          position: "relative",
          userSelect: "none"
        }}
        title={titleText}
        onClick={handleClick}
        onContextMenu={handleClick}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <span className="flex-row">
          <span className="flex-column" style={{ position: "relative" }}>
            <svg
              className={`disk-image${isTouchDevice ? " disk-image-small" : ""}`}
              viewBox="0 0 85 55"
            >
              {/* Enclosure body (S7-style Apple II peripheral chassis) */}
              <rect x="1" y="1" width="83" height="53" rx="4" fill="#a7a28e" stroke="#6d6859" strokeWidth="1" />
              <rect x="2" y="2" width="81" height="51" rx="3" fill="none" stroke="#c2bda9" strokeWidth="0.8" opacity="0.6" />

              {/* Vertical seam line (identical to S7 hard drive) */}
              <line x1="54" y1="23" x2="54" y2="53" stroke="#8a8575" strokeWidth="1" />
              <line x1="55" y1="23" x2="55" y2="53" stroke="#bcb7a5" strokeWidth="0.6" />

              {/* Top Black Display Box for Filename (identical to S7 cutout, reserved for .disk-label) */}
              <rect x="4" y="4" width="77" height="18" rx="2.5" fill="#000000" stroke="#5a5547" strokeWidth="0.8" />
              <rect x="4.5" y="4.5" width="76" height="1" fill="#222222" />

              {/* VERA SD Badge */}
              <rect x="7" y="26" width="41" height="13" rx="2" fill="#0284c7" stroke="#0369a1" strokeWidth="0.8" />
              <text
                x="27.5"
                y="35.5"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="7.5"
                fontWeight="bold"
                fontFamily="system-ui, -apple-system, sans-serif"
                letterSpacing="0.8"
              >
                VERA SD
              </text>

              {/* Activity LED recessed tray */}
              <rect x="7" y="42" width="41" height="6" rx="1.5" fill="#787363" stroke="#555042" strokeWidth="0.6" />
              <rect
                x="33"
                y="43"
                width="13"
                height="4"
                rx="1"
                fill={status.attached ? "#22c55e" : "#4b5563"}
                style={status.attached ? { filter: "drop-shadow(0 0 2px #22c55e)" } : undefined}
              />
              {status.attached && (
                <rect x="35" y="44" width="9" height="2" rx="0.5" fill="#86efac" />
              )}

              {/* Right SD Card (standalone, enlarged, without dark background tray) */}
              <path
                d="M 60 26 L 74 26 L 78 30 L 78 48 L 60 48 L 60 37 L 61.5 37 L 61.5 33 L 60 33 Z"
                fill="#1e293b"
                stroke="#0f172a"
                strokeWidth="0.8"
              />
              {/* Gold pins */}
              <line x1="62.5" y1="27.5" x2="62.5" y2="31" stroke="#eab308" strokeWidth="1" />
              <line x1="65" y1="27.5" x2="65" y2="31" stroke="#eab308" strokeWidth="1" />
              <line x1="67.5" y1="27.5" x2="67.5" y2="31" stroke="#eab308" strokeWidth="1" />
              <line x1="70" y1="27.5" x2="70" y2="31" stroke="#eab308" strokeWidth="1" />
              <line x1="72.5" y1="27.5" x2="72.5" y2="31" stroke="#eab308" strokeWidth="1" />
              {/* SD label */}
              <text
                x="69"
                y="43"
                textAnchor="middle"
                fill="#38bdf8"
                fontSize="7.5"
                fontWeight="bold"
                fontFamily="system-ui, -apple-system, sans-serif"
              >
                SD
              </text>
            </svg>
            {status.attached && (isSyncing ? (
              <FontAwesomeIcon
                icon={faRotate}
                className="fa-fw disk-clouddrive disk-clouddrive-inprogress"
              />
            ) : isSyncPaused ? (
              <FontAwesomeIcon
                icon={faPause}
                className="fa-fw disk-clouddrive disk-clouddrive-paused"
              />
            ) : null)}
          </span>
        </span>

        {/* Disk Filename Label: identical font size and layout as S7 and floppy, red when modified */}
        <span className={diskLabelClass}>
          {status.hasChanges ? "*" : ""}{status.attached ? status.name : ""}
        </span>

        {/* Status Line: identical to S7,D1 (e.g. S2,SD 0800) */}
        <span className="flex-row">
          <span className={`default-font disk-status${isTouchDevice ? " disk-status-small" : ""}`}>
            {statusText}
          </span>
        </span>
      </span>

      {popupLocation && (
        <PopupMenu
          location={popupLocation}
          style={{
            padding: "5px",
            paddingLeft: "10px",
            paddingRight: "10px"
          }}
          onClose={() => setPopupLocation(undefined)}
          menuItems={menuItems}
        />
      )}
    </>
  )
}

export default VeraSdIcon
