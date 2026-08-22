import { useEffect, useState } from "react"
import { COLOR_MODE, DEFAULT_SLOT_CONFIG } from "../../common/utility"
import {
  DiskCollectionSortMode,
  setPreferenceDiskCollectionSort,
  setPreferenceBoolean,
  setPreferenceColorMode,
  setPreferenceRamWorks,
  setPreferenceSlotConfig,
  setPreferenceSpeedMode,
} from "../localstorage"
import {
  handleGetMachineName,
  handleGetMemSize,
  handleGetSlotConfig,
  handleGetSpeedMode,
} from "../main2worker"
import {
  getColorMode,
  getCrtDistortion,
  getGhosting,
  getLowercaseMode,
  getShowScanlines,
  getUseOpenAppleKey,
  setColorMode,
  setUIStateBoolean,
} from "../ui_settings"
import { audioEnable, getAudioStatus } from "../devices/audio/speaker"
import { changeSerialMode, getSerialMode, getSerialNames } from "../devices/serial/serialhub"
import DemoZooDialog from "../devices/disk/demozoodialog"
import {
  demoZooEnabled,
  downloadDiskToDevice,
  loadDiskFromCloudDrive,
  saveDiskToDevice,
} from "../devices/disk/diskdrive"
import {
  handleEjectDisk,
  handleGetDriveProps,
  handleGetFilename,
  handleSaveWritableFile,
  handleSetDiskWriteProtected,
} from "../devices/disk/driveprops"
import { GoogleDrive } from "../devices/disk/googledrive"
import InternetArchivePopup from "../devices/disk/internetarchivedialog"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { newReleases } from "../devices/disk/newreleases"
import { OneDriveCloudDrive } from "../devices/disk/onedriveclouddrive"
import {
  DISK_COLLECTION_ITEM_TYPE,
  TAB_INDEX,
  diskCollectionSortOptions,
  getDefaultDiskCollectionSortMode,
  getDiskCollection,
  getDiskCollectionSortMode,
  isDiskExportable,
  loadDisk,
  sortDisks,
} from "../diskdialog/diskpanel_utils"
import { isFileSystemApiSupported } from "../ui_utilities"
import Apple2Canvas from "../canvas"
import "./retrocontrolpanel.css"

type RetroMenuItem = {
  label: string
  value?: string
  action?: () => void
  children?: RetroMenuItem[] | (() => RetroMenuItem[])
  options?: RetroMenuOption[]
  optionIndex?: number
  defaultIndex?: number
  selectable?: boolean
  valueOnly?: boolean
  actionLabel?: string
  refreshOptions?: (index: number) => RetroMenuItem[]
}

type RetroMenuOption = {
  label: string
  action?: () => void
  preview?: () => void
}

type RetroMenuFrame = {
  title: string
  items: RetroMenuItem[]
  originalValues: number[]
  values: number[]
  actionLabel: string
  refresh?: () => RetroMenuItem[]
}

type DiskLoadDialog = {
  driveIndex: number
  type: "demoZoo" | "internetArchive"
}

const mouseTextDown = String.fromCodePoint(0x2193)
const mouseTextLeft = String.fromCodePoint(0x2190)
const mouseTextRight = String.fromCodePoint(0x2192)
const mouseTextUp = String.fromCodePoint(0x2191)
const mouseTextReturn = String.fromCodePoint(0x21B5)
const checkmark = String.fromCodePoint(0x2713)

const RetroBorder = ({ className, separatorRow }: {
  className: string
  separatorRow?: number
}) => (
  <div className={`retro-border ${className}`} aria-hidden="true">
    {separatorRow && (
      <span
        className="retro-border-separator"
        style={{
          top: `calc(${separatorRow - 1} * var(--retro-row-height) + var(--retro-border-width))`,
        }}
      />
    )}
  </div>
)

const colorOptions = ["Color", "Color (no fringe)", "Green", "Amber", "White", "Inverse"]
const colorModeClasses = ["color", "color", "green", "amber", "white", "inverse"]
const speedOptions = ["Snail", "Slow", "Normal", "2 MHz", "3 MHz", "Fast", "Warp"]
const speedModes = [-2, -1, 0, 1, 2, 3, 4]
const ramOptions = [64, 512, 1024, 4096, 8192]
const slotNumbers = [1, 2, 3, 4, 5, 6, 7] as const
const cardLabels: Record<SLOT_CARD_ID, string> = {
  none: "Empty",
  ssc: "Super Serial Card",
  softcard: "Z-80 SoftCard",
  aux: "Auxiliary memory",
  videoterm: "Videx VideoTerm",
  mockingboard: "Mockingboard",
  mouse: "Mouse card",
  vera: "VERA graphics",
  passport: "Passport MIDI",
  disk2: "Disk II controller",
  smartport: "SmartPort drive",
}

const choiceItem = (
  label: string,
  labels: string[],
  currentIndex: number,
  select: (index: number) => void,
  defaultIndex?: number,
  preview?: (index: number) => void,
): RetroMenuItem => ({
  label,
  options: labels.map((option, index) => ({
    label: option,
    action: () => select(index),
    preview: preview ? () => preview(index) : undefined,
  })),
  optionIndex: currentIndex,
  defaultIndex: defaultIndex !== undefined && defaultIndex >= 0 ? defaultIndex : undefined,
})

const toggleItem = (
  label: string,
  enabled: boolean,
  action: (enabled: boolean) => void,
  preview?: (enabled: boolean) => void,
) => (
  choiceItem(
    label,
    ["Off", "On"],
    enabled ? 1 : 0,
    index => action(index === 1),
    0,
    preview ? index => preview(index === 1) : undefined,
  )
)

const createMenuFrame = (
  title: string,
  items: RetroMenuItem[],
  refresh?: () => RetroMenuItem[],
  actionLabel = "Save",
): RetroMenuFrame => {
  const values = items.map(item => item.optionIndex ?? -1)
  return { title, items, originalValues: values, values, actionLabel, refresh }
}

const refreshPreviousMenu = (stack: RetroMenuFrame[]) => {
  const previousStack = stack.slice(0, -1)
  const previousFrame = previousStack[previousStack.length - 1]
  if (!previousFrame?.refresh) return previousStack

  previousStack[previousStack.length - 1] = createMenuFrame(
    previousFrame.title,
    previousFrame.refresh(),
    previousFrame.refresh,
    previousFrame.actionLabel,
  )
  return previousStack
}

const restoreMenuFramePreview = (frame: RetroMenuFrame) => {
  frame.items.forEach((item, index) => {
    if (frame.values[index] !== frame.originalValues[index]) {
      item.options?.[frame.originalValues[index]]?.preview?.()
    }
  })
}

const getRetroMenu = (
  displayProps: DisplayProps,
  close: () => void,
  openDiskDialog: (dialog: DiskLoadDialog) => void,
): RetroMenuItem[] => {
  const { updateDisplay } = displayProps
  const audioEnabled = getAudioStatus() === "enabled"
  const serialNames = getSerialNames()
  const serialMode = getSerialMode()
  const currentMachine = handleGetMachineName()
  const currentRam = handleGetMemSize()
  const slotConfig = handleGetSlotConfig()
  const diskCollection = getDiskCollection(new DiskBookmarks(), newReleases)
  const createDiskCollectionTabItems = (
    tabIndex: TAB_INDEX,
    disks: DiskCollectionItem[],
    sortMode: DiskCollectionSortMode = getDiskCollectionSortMode(tabIndex),
  ): RetroMenuItem[] => {
    const sortIndex = diskCollectionSortOptions.findIndex(option => option.value === sortMode)
    const defaultSortIndex = diskCollectionSortOptions.findIndex(
      option => option.value === getDefaultDiskCollectionSortMode(tabIndex),
    )
    const sortItem = choiceItem(
      "",
      diskCollectionSortOptions.map(option => option.label),
      sortIndex,
      index => setPreferenceDiskCollectionSort(tabIndex, diskCollectionSortOptions[index].value),
      defaultSortIndex,
    )
    sortItem.valueOnly = true
    sortItem.refreshOptions = index => createDiskCollectionTabItems(
      tabIndex,
      disks,
      diskCollectionSortOptions[index].value,
    )

    return [
      ...sortDisks(disks, sortMode).map(disk => ({
        label: disk.title,
        action: () => {
          close()
          loadDisk(-1, disk, updateDisplay)
        },
      })),
      { label: "—Sort Order—", selectable: false },
      sortItem,
    ]
  }
  const diskCollectionTabs: Array<{ label: string; index: TAB_INDEX; disks: DiskCollectionItem[] }> = [
    {
      label: "Apple2TS Collection",
      index: TAB_INDEX.BUILT_IN,
      disks: diskCollection.filter(disk => disk.type === DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE),
    },
    {
      label: "New Releases",
      index: TAB_INDEX.NEW_RELEASES,
      disks: diskCollection.filter(disk => disk.type === DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE),
    },
    {
      label: "Favorites",
      index: TAB_INDEX.FAVORITES,
      disks: diskCollection.filter(disk =>
        disk.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.DEMOZOO),
    },
    {
      label: "Export Disks to HDV",
      index: TAB_INDEX.EXPORT,
      disks: diskCollection.filter(isDiskExportable),
    },
  ]
  const slotOptions: Record<typeof slotNumbers[number], SLOT_CARD_ID[]> = {
    1: ["none", "ssc"],
    2: ["none", "softcard", "passport"],
    3: currentMachine === "APPLE2P" ? ["none", "videoterm"] : ["none", "aux"],
    4: ["none", "mouse", "mockingboard"],
    5: ["none", "mouse", "mockingboard"],
    6: ["none", "disk2"],
    7: ["none", "smartport"],
  }
  const selectSlotCard = (slot: typeof slotNumbers[number], card: SLOT_CARD_ID) => {
    const nextConfig = { ...handleGetSlotConfig() }
    if (card !== "none" && card !== "mockingboard") {
      slotNumbers.forEach(otherSlot => {
        if (otherSlot !== slot && nextConfig[otherSlot] === card) nextConfig[otherSlot] = "none"
      })
    }
    nextConfig[slot] = card
    setPreferenceSlotConfig(nextConfig)
    updateDisplay()
  }
  const mouseSlot = slotConfig[4] === "mouse" ? 4 : slotConfig[5] === "mouse" ? 5 : 0
  const isElectron = navigator.userAgent.includes("Electron")
  const diskDrives = ([
    { drive: 1, index: 0, slot: 7 },
    { drive: 2, index: 1, slot: 7 },
    { drive: 1, index: 2, slot: 6 },
    { drive: 2, index: 3, slot: 6 },
  ] as const).filter(({ slot }) => slotConfig[slot] !== "none")
  const diskLoadItems = (driveIndex: number): RetroMenuItem[] => [
    {
      label: "Load Disk",
      action: () => {
        close()
        displayProps.setShowFileOpenDialog(true, driveIndex)
      },
    },
    {
      label: "Load Disk from Internet Archive",
      action: () => openDiskDialog({ driveIndex, type: "internetArchive" }),
    },
    ...(demoZooEnabled ? [{
      label: "Load Disk from DemoZoo",
      action: () => openDiskDialog({ driveIndex, type: "demoZoo" as const }),
    }] : []),
    ...(!isElectron ? [
      {
        label: "Load Disk from OneDrive",
        action: () => {
          close()
          void loadDiskFromCloudDrive(new OneDriveCloudDrive(), driveIndex)
        },
      },
      {
        label: "Load Disk from Google Drive",
        action: () => {
          close()
          void loadDiskFromCloudDrive(new GoogleDrive(), driveIndex)
        },
      },
    ] : []),
  ]
  const insertedDiskItems = (driveIndex: number): RetroMenuItem[] => {
    const drive = handleGetDriveProps(driveIndex)
    return [
      toggleItem("Write Protect Disk", drive.isWriteProtected, enabled => {
        handleSetDiskWriteProtected(driveIndex, enabled)
        updateDisplay()
      }),
      ...(drive.writableFileHandle ? [{
        label: "Save Disk",
        action: () => { void handleSaveWritableFile(driveIndex) },
      }] : []),
      ...(isFileSystemApiSupported() ? [{
        label: "Save Disk to Device",
        action: () => { void saveDiskToDevice(driveIndex) },
      }] : []),
      {
        label: "Download Disk",
        action: () => downloadDiskToDevice(driveIndex),
      },
      {
        label: "Eject Disk",
        action: () => {
          handleEjectDisk(driveIndex)
          updateDisplay()
        },
      },
    ]
  }
  const diskDriveItems = (): RetroMenuItem[] => diskDrives.map(({ drive, index, slot }) => {
    const driveProps = handleGetDriveProps(index)
    const diskTitle = handleGetFilename(index)
    return {
      label: `Slot ${slot}, Drive ${drive}: ${diskTitle ? `${driveProps.diskHasChanges ? "*" : ""}${diskTitle}` : "Empty"}`,
      children: () => handleGetDriveProps(index).filename ? insertedDiskItems(index) : diskLoadItems(index),
      actionLabel: "Load",
    }
  })

  return [
    {
      label: "Disk Collection",
      children: diskCollectionTabs.map(tab => ({
        label: tab.label,
        children: () => createDiskCollectionTabItems(tab.index, tab.disks),
        actionLabel: tab.index === TAB_INDEX.EXPORT ? "Export" : "Load",
      })),
      actionLabel: "Open",
    },
    {
      label: "Disk Drives",
      children: diskDrives.length > 0
        ? diskDriveItems
        : [{ label: "No disk drives available" }],
      actionLabel: "Load",
    },
    {
      label: "Display",
      value: colorOptions[getColorMode()],
      children: [
        choiceItem("Color", colorOptions, getColorMode(), index => {
          setPreferenceColorMode(index as COLOR_MODE)
          updateDisplay()
        }, COLOR_MODE.COLOR, index => {
          setColorMode(index as COLOR_MODE)
          updateDisplay()
        }),
        toggleItem("Scanlines", getShowScanlines(), enabled => {
          setPreferenceBoolean("showScanlines", enabled)
          document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
          updateDisplay()
        }, enabled => {
          setUIStateBoolean("showScanlines", enabled)
          document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
          updateDisplay()
        }),
        toggleItem("Ghosting", getGhosting(), enabled => {
          setPreferenceBoolean("ghosting", enabled)
          updateDisplay()
        }, enabled => {
          setUIStateBoolean("ghosting", enabled)
          updateDisplay()
        }),
        toggleItem("CRT distortion", getCrtDistortion(), enabled => {
          setPreferenceBoolean("crtDistortion", enabled)
          updateDisplay()
        }, enabled => {
          setUIStateBoolean("crtDistortion", enabled)
          updateDisplay()
        }),
      ],
    },
    {
      label: "Sound",
      value: audioEnabled ? "On" : "Off",
      children: [choiceItem("Sound", ["Off", "On"], audioEnabled ? 1 : 0, index => {
        audioEnable(index === 1)
        updateDisplay()
      })],
    },
    {
      label: "Options",
      children: [
        choiceItem("System Speed", speedOptions, speedModes.indexOf(handleGetSpeedMode()), index => {
          setPreferenceSpeedMode(speedModes[index])
          updateDisplay()
        }, speedModes.indexOf(0)),
        choiceItem("Clock", ["Host system clock"], 0, () => { }, 0),
        choiceItem("Mouse", ["Off", "Slot 4", "Slot 5"], [0, 4, 5].indexOf(mouseSlot), index => {
          const slot = [0, 4, 5][index]
          if (slot === 0) {
            const nextConfig = { ...handleGetSlotConfig() }
            if (nextConfig[4] === "mouse") nextConfig[4] = "none"
            if (nextConfig[5] === "mouse") nextConfig[5] = "none"
            setPreferenceSlotConfig(nextConfig)
            updateDisplay()
          } else {
            selectSlotCard(slot as 4 | 5, "mouse")
          }
        }, [0, 4, 5].indexOf(
          DEFAULT_SLOT_CONFIG[4] === "mouse" ? 4 : DEFAULT_SLOT_CONFIG[5] === "mouse" ? 5 : 0,
        )),
        choiceItem(
          "RAM Disk",
          ramOptions.map(size => size >= 1024 ? `${size / 1024} MB` : `${size} KB`),
          ramOptions.indexOf(currentRam),
          index => {
            setPreferenceRamWorks(ramOptions[index])
            updateDisplay()
          },
          ramOptions.indexOf(64),
        ),
      ],
    },
    {
      label: "Keyboard",
      value: getLowercaseMode() ? "Lowercase" : "Caps Lock",
      children: [
        toggleItem("Lowercase input", getLowercaseMode(), enabled => {
          setPreferenceBoolean("lowercaseMode", enabled)
          updateDisplay()
        }),
        toggleItem("Open Apple key", getUseOpenAppleKey(), enabled => {
          setPreferenceBoolean("useOpenAppleKey", enabled)
          updateDisplay()
        }),
      ],
    },
    {
      label: "Slots",
      value: `${slotNumbers.filter(slot => slotConfig[slot] !== "none").length} configured`,
      children: slotNumbers.map(slot => choiceItem(
        `Slot ${slot}`,
        slotOptions[slot].map(card => cardLabels[card]),
        slotOptions[slot].indexOf(slotConfig[slot]),
        index => selectSlotCard(slot, slotOptions[slot][index]),
        slotOptions[slot].indexOf(
          slot === 3 && currentMachine === "APPLE2P" ? "videoterm" : DEFAULT_SLOT_CONFIG[slot],
        ),
      )),
    },
    {
      label: "Printer Port",
      value: serialNames[serialMode],
      children: [choiceItem("Port", serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }, 0)],
    },
    {
      label: "Modem Port",
      value: serialNames[serialMode],
      children: [choiceItem("Port", serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }, 0)],
    },
    { label: "Quit", action: close },
  ]
}

const RetroControlPanel = ({ displayProps }: { displayProps: DisplayProps }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [diskLoadDialog, setDiskLoadDialog] = useState<DiskLoadDialog | null>(null)
  const [menuStack, setMenuStack] = useState<RetroMenuFrame[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [now, setNow] = useState(() => new Date())
  const close = () => setIsOpen(false)
  const openDiskDialog = (dialog: DiskLoadDialog) => {
    close()
    setDiskLoadDialog(dialog)
  }
  const rootMenu = getRetroMenu(displayProps, close, openDiskDialog)
  const currentFrame = menuStack[menuStack.length - 1]
  const currentMenu = currentFrame?.items ?? rootMenu
  const maxVisibleMenuItems = 16
  const visibleMenuStart = currentFrame
    ? Math.min(
      Math.max(0, selectedIndex - maxVisibleMenuItems + 1),
      Math.max(0, currentMenu.length - maxVisibleMenuItems),
    )
    : 0
  const visibleMenu = currentMenu.slice(visibleMenuStart, visibleMenuStart + maxVisibleMenuItems)
  const panelEffects = [
    `retro-color-${colorModeClasses[getColorMode()]}`,
    getGhosting() ? "retro-effect-ghosting" : "",
    getCrtDistortion() ? "retro-effect-crt" : "",
  ].filter(Boolean).join(" ")

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(timer)
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.shiftKey && !event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        menuStack.toReversed().forEach(restoreMenuFramePreview)
        setNow(new Date())
        setIsOpen(open => !open)
        setMenuStack([])
        setSelectedIndex(0)
        return
      }
      if (!isOpen) return

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        event.stopPropagation()
        const direction = event.key === "ArrowUp" ? -1 : 1
        setSelectedIndex(index => {
          let nextIndex = index
          for (let offset = 0; offset < currentMenu.length; offset += 1) {
            nextIndex = (nextIndex + direction + currentMenu.length) % currentMenu.length
            if (currentMenu[nextIndex].selectable !== false) return nextIndex
          }
          return index
        })
      } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const item = currentMenu[selectedIndex]
        const options = item.options
        if (currentFrame && options && options.length > 0) {
          event.preventDefault()
          event.stopPropagation()
          const direction = event.key === "ArrowLeft" ? -1 : 1
          const nextValue = (currentFrame.values[selectedIndex] + direction + options.length) % options.length
          options[nextValue].preview?.()
          setMenuStack(stack => stack.map((frame, index) => {
            if (index !== stack.length - 1) return frame
            const items = item.refreshOptions?.(nextValue) ?? frame.items
            const values = item.refreshOptions
              ? items.map(refreshedItem => refreshedItem.optionIndex ?? -1)
              : [...frame.values]
            values[selectedIndex] = nextValue
            return { ...frame, items, values }
          }))
        }
      } else if (event.key === "Enter") {
        event.preventDefault()
        event.stopPropagation()
        const item = currentMenu[selectedIndex]
        if (item.children) {
          const refresh = typeof item.children === "function" ? item.children : undefined
          const children = typeof item.children === "function" ? item.children() : item.children
          setMenuStack(stack => [
            ...stack,
            createMenuFrame(item.label, children, refresh, item.actionLabel),
          ])
          setSelectedIndex(Math.max(0, children.findIndex(child => child.selectable !== false)))
        } else if (currentFrame && item.options) {
          currentFrame.items.forEach((frameItem, index) => {
            if (currentFrame.values[index] !== currentFrame.originalValues[index]) {
              frameItem.options?.[currentFrame.values[index]]?.action?.()
            }
          })
          setMenuStack(refreshPreviousMenu)
          setSelectedIndex(0)
        } else {
          item.action?.()
          if (currentFrame) {
            setMenuStack(refreshPreviousMenu)
            setSelectedIndex(0)
          }
        }
      } else if (event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        if (menuStack.length > 0) {
          restoreMenuFramePreview(currentFrame)
          setMenuStack(refreshPreviousMenu)
          setSelectedIndex(0)
        }
      } else if (!event.ctrlKey && !event.altKey && !event.metaKey && /^[a-z]$/i.test(event.key)) {
        const shortcut = event.key.toLocaleLowerCase()
        const nextIndex = Array.from(
          { length: currentMenu.length },
          (_, offset) => (selectedIndex + offset + 1) % currentMenu.length,
        ).find(index => currentMenu[index].selectable !== false &&
          currentMenu[index].label.toLocaleLowerCase().startsWith(shortcut))
        if (nextIndex !== undefined) {
          event.preventDefault()
          event.stopPropagation()
          setSelectedIndex(nextIndex)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown, true)
    return () => window.removeEventListener("keydown", handleKeyDown, true)
  }, [currentFrame, currentMenu, isOpen, menuStack, selectedIndex])

  return (
    <main className={`retro-shell${isOpen ? " menu-open" : ""}`}>
      <Apple2Canvas {...displayProps} />
      {isOpen && (
        <section
          className={`retro-panel scanline-gradient ${panelEffects}`}
          role="dialog"
          aria-label="Apple2TS control panel"
        >
          <div className="retro-window">
            <RetroBorder className="retro-outer-border" separatorRow={2} />
            <header className={`retro-title${currentFrame ? " submenu-open" : ""}`}>
              <span>{"Apple2TS "}&#8198;</span>
            </header>
            {currentFrame && <div className="retro-submenu-title"><span>{currentFrame.title}</span></div>}
            {menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString()} ${now.toLocaleDateString()}`}>
              <RetroBorder className="retro-clock-border" />
              <time>{now.toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}</time>
              <time>{now.toLocaleDateString([], {
                month: "numeric",
                day: "numeric",
                year: "2-digit",
              })}</time>
            </div>}
            <div className={`retro-menu${currentFrame ? " retro-submenu-menu" : " retro-root-menu"}`} role="menu">
              {visibleMenu.map((item, visibleIndex) => (
                (() => {
                  const index = visibleMenuStart + visibleIndex
                  const valueIndex = currentFrame?.values[index] ?? item.optionIndex ?? -1
                  const option = item.options?.[valueIndex]
                  const isDefault = item.defaultIndex !== undefined && valueIndex === item.defaultIndex
                  return (
                    <div
                      className={`retro-menu-item${selectedIndex === index ? " selected" : ""}`}
                      key={`${index}-${item.label}`}
                      role="menuitem"
                      aria-current={selectedIndex === index ? "true" : undefined}
                      aria-disabled={item.selectable === false ? "true" : undefined}
                    >
                      {currentFrame && <span className="retro-menu-check">
                        {isDefault ? checkmark : " "}
                      </span>}
                      <span className="retro-menu-name">
                        {item.valueOnly && option ? option.label : item.label}
                      </span>
                      {option && !item.valueOnly && <span className="retro-menu-value">: {option.label}</span>}
                    </div>
                  )
                })()
              ))}
            </div>
            <footer className={currentFrame ? "retro-submenu-footer" : "retro-root-footer"}>
              <span className="retro-footer-select">{" Select: "}<i className="retro-mousetext">
                {currentFrame
                  ? <>{mouseTextLeft} {mouseTextRight} {mouseTextUp} {mouseTextDown}</>
                  : <>{mouseTextDown} {mouseTextUp}</>}
              </i></span>
              {currentFrame && <span className="retro-footer-cancel">Cancel:Esc</span>}
              <span className="retro-footer-action">
                {currentFrame ? `${currentFrame.actionLabel}: ` : "Open: "}
                <i className="retro-mousetext">{mouseTextReturn}</i>{" "}
              </span>
            </footer>
          </div>
        </section>
      )}
      <InternetArchivePopup
        driveIndex={diskLoadDialog?.driveIndex ?? 0}
        open={diskLoadDialog?.type === "internetArchive"}
        onClose={() => setDiskLoadDialog(null)}
      />
      <DemoZooDialog
        driveIndex={diskLoadDialog?.driveIndex ?? 0}
        open={diskLoadDialog?.type === "demoZoo"}
        onClose={() => setDiskLoadDialog(null)}
      />
    </main>
  )
}

export default RetroControlPanel