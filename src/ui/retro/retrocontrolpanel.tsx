import { useEffect, useState } from "react"
import { COLOR_MODE, DEFAULT_SLOT_CONFIG, RUN_MODE, UI_THEME, UI_THEMES } from "../../common/utility"
import {
  DiskCollectionSortMode,
  setPreferenceDiskCollectionSort,
  setPreferenceBoolean,
  setPreferenceColorMode,
  setPreferenceRamWorks,
  setPreferenceSlotConfig,
  setPreferenceSpeedMode,
  setPreferenceTheme,
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
  getTheme,
  getUseOpenAppleKey,
  setColorMode,
  setUIStateBoolean,
} from "../ui_settings"
import { audioEnable, getAudioStatus } from "../devices/audio/speaker"
import { changeSerialMode, getSerialMode } from "../devices/serial/serialhub"
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
  getExportFilename,
  isDiskExportable,
  loadDisk,
  sortDisks,
  createHdv,
} from "../diskdialog/diskpanel_utils"
import { isFileSystemApiSupported, showGlobalProgressModal } from "../ui_utilities"
import { handleSetCPUState } from "../controller"
import { isCanvasFullscreen, setCanvasFullscreen } from "../controls/fullscreenbutton"
import { AllLanguages, Language, LanguageNames } from "../../i18n"
import { useTranslation } from "../../i18n/useTranslation"
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
  disk?: DiskCollectionItem
  checkmarkIndex?: number
  submit?: (items: RetroMenuItem[], values: number[]) => void
  isSubmitVisible?: (items: RetroMenuItem[], values: number[]) => boolean
}

type RetroMenuOption = {
  label: string
  action?: () => void
  preview?: () => void
  useBrowserFont?: boolean
}

type RetroMenuFrame = {
  title: string
  items: RetroMenuItem[]
  originalValues: number[]
  values: number[]
  actionLabel: string
  refresh?: () => RetroMenuItem[]
  submit?: (items: RetroMenuItem[], values: number[]) => void
  isSubmitVisible?: (items: RetroMenuItem[], values: number[]) => boolean
}

type DiskLoadDialog = {
  driveIndex: number
  type: "demoZoo" | "internetArchive"
}

type Translate = (key: string, params?: Record<string, string>) => string

const mouseTextDown = String.fromCodePoint(0x2193)
const mouseTextLeft = String.fromCodePoint(0x2190)
const mouseTextRight = String.fromCodePoint(0x2192)
const mouseTextUp = String.fromCodePoint(0x2191)
const mouseTextReturn = String.fromCodePoint(0x21B5)
const checkmark = String.fromCodePoint(0x2713)

const decodeDiskTitle = (title: string) => {
  try {
    return decodeURIComponent(title)
  } catch {
    return title
  }
}

const mouseTextSupports = (text: string) => /^[\x20-\x7E]*$/.test(text)

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

const colorModeClasses = ["color", "color", "green", "amber", "white", "inverse"]
const speedModes = [-2, -1, 0, 1, 2, 3, 4]
const ramOptions = [64, 512, 1024, 4096, 8192]
const slotNumbers = [1, 2, 3, 4, 5, 6, 7] as const

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
  labels: [string, string],
  preview?: (enabled: boolean) => void,
) => (
  choiceItem(
    label,
    labels,
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
  actionLabel: string = "",
  submit?: (items: RetroMenuItem[], values: number[]) => void,
  isSubmitVisible?: (items: RetroMenuItem[], values: number[]) => boolean,
): RetroMenuFrame => {
  const values = items.map(item => item.optionIndex ?? -1)
  return { title, items, originalValues: values, values, actionLabel, refresh, submit, isSubmitVisible }
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
  t: Translate,
  language: Language,
  changeLanguage: (language: Language) => void,
): RetroMenuItem[] => {
  const { updateDisplay } = displayProps
  const audioEnabled = getAudioStatus() === "enabled"
  const serialMode = getSerialMode()
  const serialNames = [
    t("retroControl.builtinImageWriter"),
    serialMode === 0 ? t("retroControl.selectExternalPort") : t("retroControl.externalPort"),
  ]
  const currentMachine = handleGetMachineName()
  const currentRam = handleGetMemSize()
  const slotConfig = handleGetSlotConfig()
  const colorOptions = [
    t("retroControl.color"),
    t("retroControl.colorNoFringe"),
    t("retroControl.green"),
    t("retroControl.amber"),
    t("retroControl.white"),
    t("retroControl.inverse"),
  ]
  const speedOptions = [
    t("retroControl.snail"),
    t("retroControl.slow"),
    t("retroControl.normal"),
    t("retroControl.twoMhz"),
    t("retroControl.threeMhz"),
    t("retroControl.fast"),
    t("retroControl.warp"),
  ]
  const cardLabels: Record<SLOT_CARD_ID, string> = {
    none: t("retroControl.card.empty"),
    ssc: t("retroControl.card.ssc"),
    softcard: t("retroControl.card.softcard"),
    aux: t("retroControl.card.aux"),
    videoterm: t("retroControl.card.videoterm"),
    mockingboard: t("retroControl.card.mockingboard"),
    mouse: t("retroControl.card.mouse"),
    vera: t("retroControl.card.vera"),
    passport: t("retroControl.card.passport"),
    disk2: t("retroControl.card.disk2"),
    smartport: t("retroControl.card.smartport"),
  }
  const diskCollection = getDiskCollection(new DiskBookmarks(), newReleases)
  const exportDisks = async (disks: DiskCollectionItem[]) => {
    close()
    const downloadedDisks: DownloadedExportDisk[] = []
    try {
      for (let index = 0; index < disks.length; index += 1) {
        const disk = disks[index]
        showGlobalProgressModal(true, t("retroControl.fetchingDisk", {
          current: String(index + 1),
          total: String(disks.length),
        }))
        const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          loadDisk(-1, disk, updateDisplay, result => {
            if (result) resolve(result)
            else reject(new Error(t("retroControl.downloadFailed", { title: decodeDiskTitle(disk.title) })))
          })
        })
        const data = new Uint8Array(buffer)
        downloadedDisks.push({ item: disk, buffer: data, filename: getExportFilename(disk, data) })
      }
      await createHdv(downloadedDisks)
    } catch (error) {
      showGlobalProgressModal(false)
      const message = error instanceof Error ? error.message : String(error)
      alert(t("retroControl.exportFailed", { message }))
    }
  }
  const createExportItems = (disks: DiskCollectionItem[]): RetroMenuItem[] =>
    sortDisks(disks, getDiskCollectionSortMode(TAB_INDEX.EXPORT)).map(disk => ({
      label: decodeDiskTitle(disk.title),
      options: [
        { label: "" },
        { label: "" },
      ],
      optionIndex: 0,
      disk,
      checkmarkIndex: 1,
    }))
  const createDiskCollectionTabItems = (
    tabIndex: TAB_INDEX,
    disks: DiskCollectionItem[],
    sortMode: DiskCollectionSortMode = getDiskCollectionSortMode(tabIndex),
  ): RetroMenuItem[] => {
    if (disks.length === 0) return []

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
        label: decodeDiskTitle(disk.title),
        action: () => {
          close()
          loadDisk(-1, disk, updateDisplay)
        },
      })),
      { label: `—${t("retroControl.sortOrder")}—`, selectable: false },
      sortItem,
    ]
  }
  const diskCollectionTabs: Array<{ label: string; index: TAB_INDEX; disks: DiskCollectionItem[] }> = [
    {
      label: t("retroControl.apple2tsCollection"),
      index: TAB_INDEX.BUILT_IN,
      disks: diskCollection.filter(disk => disk.type === DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE),
    },
    {
      label: t("retroControl.newReleases"),
      index: TAB_INDEX.NEW_RELEASES,
      disks: diskCollection.filter(disk => disk.type === DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE),
    },
    {
      label: t("retroControl.favorites"),
      index: TAB_INDEX.FAVORITES,
      disks: diskCollection.filter(disk =>
        disk.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.DEMOZOO),
    },
    {
      label: t("retroControl.exportDisksToHdv"),
      index: TAB_INDEX.EXPORT,
      disks: diskCollection.filter(disk => isDiskExportable(disk) && disk.vtocType !== undefined),
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
      label: t("disk.loadDisk"),
      action: () => {
        close()
        displayProps.setShowFileOpenDialog(true, driveIndex)
      },
    },
    {
      label: t("disk.loadDiskFromInternetArchive"),
      action: () => openDiskDialog({ driveIndex, type: "internetArchive" }),
    },
    ...(demoZooEnabled ? [{
      label: t("disk.loadDiskFromDemoZoo"),
      action: () => openDiskDialog({ driveIndex, type: "demoZoo" as const }),
    }] : []),
    ...(!isElectron ? [
      {
        label: t("disk.loadDiskFromOneDrive"),
        action: () => {
          close()
          void loadDiskFromCloudDrive(new OneDriveCloudDrive(), driveIndex)
        },
      },
      {
        label: t("disk.loadDiskFromGoogleDrive"),
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
      toggleItem(t("disk.writeProtectDisk"), drive.isWriteProtected, enabled => {
        handleSetDiskWriteProtected(driveIndex, enabled)
        updateDisplay()
      }, [t("messages.off"), t("messages.on")]),
      ...(drive.writableFileHandle ? [{
        label: t("retroControl.saveDisk"),
        action: () => { void handleSaveWritableFile(driveIndex) },
      }] : []),
      ...(isFileSystemApiSupported() ? [{
        label: t("disk.saveDiskToDevice"),
        action: () => { void saveDiskToDevice(driveIndex) },
      }] : []),
      {
        label: t("disk.downloadDisk"),
        action: () => downloadDiskToDevice(driveIndex),
      },
      {
        label: t("disk.ejectDisk"),
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
      label: t("retroControl.drive", {
        slot: String(slot),
        drive: String(drive),
        disk: diskTitle
          ? `${driveProps.diskHasChanges ? "*" : ""}${decodeDiskTitle(diskTitle)}`
          : t("retroControl.card.empty"),
      }),
      children: () => handleGetDriveProps(index).filename ? insertedDiskItems(index) : diskLoadItems(index),
      actionLabel: t("retroControl.load"),
    }
  })
  const languageItem = choiceItem(
    t("retroControl.language"),
    AllLanguages.map(language => LanguageNames[language]),
    AllLanguages.indexOf(language),
    index => changeLanguage(AllLanguages[index]),
  )
  languageItem.options?.forEach(option => {
    option.useBrowserFont = !mouseTextSupports(option.label)
  })

  return [
    {
      label: t("retroControl.machine"),
      children: [
        {
          label: t("controls.boot"),
          action: () => {
            handleSetCPUState(RUN_MODE.NEED_BOOT)
            close()
          },
        },
        {
          label: t("controls.reset"),
          action: () => {
            handleSetCPUState(RUN_MODE.NEED_RESET)
            close()
          },
        },
        choiceItem(
          t("retroControl.fullscreen"),
          [t("messages.off"), t("messages.on")],
          isCanvasFullscreen() ? 1 : 0,
          () => { },
          0,
          index => setCanvasFullscreen(index === 1),
        ),
      ],
      actionLabel: t("retroControl.select"),
    },
    {
      label: t("retroControl.diskCollection"),
      children: diskCollectionTabs.map(tab => ({
        label: tab.label,
        children: () => tab.index === TAB_INDEX.EXPORT
          ? createExportItems(tab.disks)
          : createDiskCollectionTabItems(tab.index, tab.disks),
        actionLabel: tab.index === TAB_INDEX.EXPORT ? t("collection.export") : t("retroControl.load"),
        submit: tab.index === TAB_INDEX.EXPORT
          ? (items: RetroMenuItem[], values: number[]) => {
            const selectedDisks = items
              .filter((item, index) => values[index] === 1 && item.disk)
              .map(item => item.disk as DiskCollectionItem)
            void exportDisks(selectedDisks)
          }
          : undefined,
        isSubmitVisible: tab.index === TAB_INDEX.EXPORT
          ? (_items: RetroMenuItem[], values: number[]) => values.some(value => value === 1)
          : undefined,
      })),
      actionLabel: t("retroControl.open"),
    },
    {
      label: t("retroControl.diskDrives"),
      children: diskDrives.length > 0
        ? diskDriveItems
        : [{ label: t("retroControl.noDiskDrivesAvailable") }],
      actionLabel: t("retroControl.load"),
    },
    {
      label: t("retroControl.display"),
      value: colorOptions[getColorMode()],
      children: [
        choiceItem(t("retroControl.color"), colorOptions, getColorMode(), index => {
          setPreferenceColorMode(index as COLOR_MODE)
          updateDisplay()
        }, COLOR_MODE.COLOR, index => {
          setColorMode(index as COLOR_MODE)
          updateDisplay()
        }),
        toggleItem(t("config.scanlines"), getShowScanlines(), enabled => {
          setPreferenceBoolean("showScanlines", enabled)
          document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
          updateDisplay()
        }, [t("messages.off"), t("messages.on")], enabled => {
          setUIStateBoolean("showScanlines", enabled)
          document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
          updateDisplay()
        }),
        toggleItem(t("config.ghosting"), getGhosting(), enabled => {
          setPreferenceBoolean("ghosting", enabled)
          updateDisplay()
        }, [t("messages.off"), t("messages.on")], enabled => {
          setUIStateBoolean("ghosting", enabled)
          updateDisplay()
        }),
        toggleItem(t("config.crtDistortion"), getCrtDistortion(), enabled => {
          setPreferenceBoolean("crtDistortion", enabled)
          updateDisplay()
        }, [t("messages.off"), t("messages.on")], enabled => {
          setUIStateBoolean("crtDistortion", enabled)
          updateDisplay()
        }),
      ],
    },
    {
      label: t("retroControl.sound"),
      value: audioEnabled ? t("messages.on") : t("messages.off"),
      children: [choiceItem(t("retroControl.sound"), [t("messages.off"), t("messages.on")], audioEnabled ? 1 : 0, index => {
        audioEnable(index === 1)
        updateDisplay()
      })],
    },
    {
      label: t("retroControl.options"),
      children: [
        choiceItem(t("retroControl.systemSpeed"), speedOptions, speedModes.indexOf(handleGetSpeedMode()), index => {
          setPreferenceSpeedMode(speedModes[index])
          updateDisplay()
        }, speedModes.indexOf(0)),
        choiceItem(t("retroControl.clock"), [t("retroControl.hostSystemClock")], 0, () => { }, 0),
        choiceItem(t("retroControl.mouse"), [
          t("messages.off"),
          t("retroControl.slot", { slot: "4" }),
          t("retroControl.slot", { slot: "5" }),
        ], [0, 4, 5].indexOf(mouseSlot), index => {
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
          t("retroControl.ramDisk"),
          ramOptions.map(size => size >= 1024 ? `${size / 1024} MB` : `${size} KB`),
          ramOptions.indexOf(currentRam),
          index => {
            setPreferenceRamWorks(ramOptions[index])
            updateDisplay()
          },
          ramOptions.indexOf(64),
        ),
        choiceItem(
          t("config.theme"),
          [
            t("themes.classic"),
            t("themes.dark"),
            t("themes.minimal"),
            t("retroControl.retroTheme"),
          ],
          UI_THEMES.findIndex(theme => theme.value === getTheme()),
          index => {
            setPreferenceTheme(UI_THEMES[index].value as UI_THEME)
            const url = new URL(window.location.href)
            url.searchParams.delete("theme")
            url.searchParams.set("cache", Date.now().toString())
            window.location.href = url.toString()
          },
          UI_THEMES.findIndex(theme => theme.value === UI_THEME.CLASSIC),
        ),
        languageItem,
      ],
    },
    {
      label: t("retroControl.keyboard"),
      value: getLowercaseMode() ? t("retroControl.lowercase") : t("keyboard.capsLock"),
      children: [
        toggleItem(t("retroControl.lowercaseInput"), getLowercaseMode(), enabled => {
          setPreferenceBoolean("lowercaseMode", enabled)
          updateDisplay()
        }, [t("messages.off"), t("messages.on")]),
        toggleItem(t("retroControl.openAppleKey"), getUseOpenAppleKey(), enabled => {
          setPreferenceBoolean("useOpenAppleKey", enabled)
          updateDisplay()
        }, [t("messages.off"), t("messages.on")]),
      ],
    },
    {
      label: t("retroControl.slots"),
      value: t("retroControl.configured", {
        count: String(slotNumbers.filter(slot => slotConfig[slot] !== "none").length),
      }),
      children: slotNumbers.map(slot => choiceItem(
        t("retroControl.slot", { slot: String(slot) }),
        slotOptions[slot].map(card => cardLabels[card]),
        slotOptions[slot].indexOf(slotConfig[slot]),
        index => selectSlotCard(slot, slotOptions[slot][index]),
        slotOptions[slot].indexOf(
          slot === 3 && currentMachine === "APPLE2P" ? "videoterm" : DEFAULT_SLOT_CONFIG[slot],
        ),
      )),
    },
    {
      label: t("retroControl.printerPort"),
      value: serialNames[serialMode],
      children: [choiceItem(t("retroControl.port"), serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }, 0)],
    },
    {
      label: t("retroControl.modemPort"),
      value: serialNames[serialMode],
      children: [choiceItem(t("retroControl.port"), serialNames, serialMode, index => {
        changeSerialMode(index)
        updateDisplay()
      }, 0)],
    },
    { label: t("retroControl.quit"), action: close },
  ]
}

const RetroControlPanel = ({ displayProps }: { displayProps: DisplayProps }) => {
  const { t, language, changeLanguage } = useTranslation()
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
  const rootMenu = getRetroMenu(displayProps, close, openDiskDialog, t, language, changeLanguage)
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
  const selectedItem = currentMenu[selectedIndex]
  const saveActionLabel = t("retroControl.save")
  const showHorizontalSelectionHint = (Boolean(currentFrame?.submit) &&
    currentMenu.some(item => (item.options?.length ?? 0) > 1)) ||
    (Boolean(selectedItem?.refreshOptions) && (selectedItem?.options?.length ?? 0) > 1)
  const showFooterAction = !currentFrame ||
    (currentFrame.isSubmitVisible
      ? currentFrame.isSubmitVisible(currentFrame.items, currentFrame.values)
      : currentFrame.actionLabel !== t("retroControl.load") || Boolean(selectedItem?.action))
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

      const isExportFrame = Boolean(currentFrame?.submit) && currentMenu.length > 0 &&
        currentMenu.every(item => item.checkmarkIndex !== undefined)
      if (event.ctrlKey && !event.altKey && !event.metaKey && event.key.toLocaleLowerCase() === "a" &&
        currentFrame && isExportFrame) {
        event.preventDefault()
        event.stopPropagation()
        const allSelected = currentFrame.items.every(
          (item, index) => currentFrame.values[index] === item.checkmarkIndex,
        )
        setMenuStack(stack => stack.map((frame, index) => index === stack.length - 1
          ? {
            ...frame,
            values: frame.items.map(item => allSelected ? 0 : item.checkmarkIndex ?? 0),
          }
          : frame))
      } else if (event.key === "ArrowUp" || event.key === "ArrowDown") {
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
        if (!item) return
        const options = item.options
        if (currentFrame && options && options.length > 1) {
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
        if (!item) return
        if (item.children) {
          const refresh = typeof item.children === "function" ? item.children : undefined
          const children = typeof item.children === "function" ? item.children() : item.children
          setMenuStack(stack => [
            ...stack,
            createMenuFrame(
              item.label,
              children,
              refresh,
              item.actionLabel ?? saveActionLabel,
              item.submit,
              item.isSubmitVisible,
            ),
          ])
          setSelectedIndex(Math.max(0, children.findIndex(child => child.selectable !== false)))
        } else if (currentFrame && item.options) {
          if (currentFrame.submit) {
            if (currentFrame.isSubmitVisible?.(currentFrame.items, currentFrame.values)) {
              currentFrame.submit(currentFrame.items, currentFrame.values)
              setMenuStack([])
              setSelectedIndex(0)
            }
            return
          }
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
  }, [currentFrame, currentMenu, isOpen, menuStack, saveActionLabel, selectedIndex])

  return (
    <main
      className={`retro-shell${isOpen ? " menu-open" : ""}`}
      onContextMenu={isOpen ? event => event.preventDefault() : undefined}
    >
      <Apple2Canvas {...displayProps} />
      {isOpen && (
        <section
          className={`retro-panel scanline-gradient ${panelEffects}`}
          role="dialog"
          aria-label={t("retroControl.ariaLabel")}
        >
          <div className="retro-window">
            <RetroBorder className="retro-outer-border" separatorRow={2} />
            <header className={`retro-title${currentFrame ? " submenu-open" : ""}`}>
              <span>{"Apple2TS "}&#8198;</span>
            </header>
            {currentFrame && <div className="retro-submenu-title">
              <span className={mouseTextSupports(currentFrame.title) ? undefined : "retro-browser-font"}>
                {currentFrame.title}
              </span>
            </div>}
            {menuStack.length === 0 && <div className="retro-clock" aria-label={`${now.toLocaleTimeString(language)} ${now.toLocaleDateString(language)}`}>
              <RetroBorder className="retro-clock-border" />
              <time>{now.toLocaleTimeString(language, {
                hour: "numeric",
                minute: "2-digit",
                second: "2-digit",
              })}</time>
              <time>{now.toLocaleDateString(language, {
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
                  const itemLabel = item.valueOnly && option ? option.label : item.label
                  const isChecked = item.checkmarkIndex !== undefined
                    ? valueIndex === item.checkmarkIndex
                    : item.defaultIndex !== undefined && valueIndex === item.defaultIndex
                  return (
                    <div
                      className={`retro-menu-item${selectedIndex === index ? " selected" : ""}`}
                      key={`${index}-${item.label}`}
                      role="menuitem"
                      aria-current={selectedIndex === index ? "true" : undefined}
                      aria-disabled={item.selectable === false ? "true" : undefined}
                    >
                      {currentFrame && <span className="retro-menu-check">
                        {isChecked ? checkmark : " "}
                      </span>}
                      <span className={`retro-menu-name${mouseTextSupports(itemLabel) ? "" : " retro-browser-font"}`}>
                        {itemLabel}
                        {option && !item.valueOnly && item.checkmarkIndex === undefined ? ":" : ""}
                      </span>
                      {option && !item.valueOnly && item.checkmarkIndex === undefined &&
                        <>{" "}<span className={`retro-menu-value${option.useBrowserFont || !mouseTextSupports(option.label) ? " retro-browser-font" : ""}`}>
                          {option.label}
                        </span></>}
                    </div>
                  )
                })()
              ))}
            </div>
            <footer className={currentFrame ? "retro-submenu-footer" : "retro-root-footer"}>
              <span className={`retro-footer-select${mouseTextSupports(t("retroControl.select")) ? "" : " retro-browser-font"}`}>{` ${t("retroControl.select")}: `}<i className="retro-mousetext">
                {showHorizontalSelectionHint && <>{mouseTextLeft} {mouseTextRight} </>}
                {currentFrame
                  ? <>{mouseTextUp} {mouseTextDown}</>
                  : <>{mouseTextDown} {mouseTextUp}</>}
              </i></span>
              {currentFrame && <span className={`retro-footer-cancel${mouseTextSupports(t("retroControl.cancelEsc")) ? "" : " retro-browser-font"}`}>{t("retroControl.cancelEsc")}</span>}
              {showFooterAction &&
                <span className={`retro-footer-action${mouseTextSupports(currentFrame ? currentFrame.actionLabel : t("retroControl.open")) ? "" : " retro-browser-font"}`}>
                  {`${currentFrame ? currentFrame.actionLabel : t("retroControl.open")}: `}
                  <i className="retro-mousetext">{mouseTextReturn}</i>{" "}
                </span>}
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