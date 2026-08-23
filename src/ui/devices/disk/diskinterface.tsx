import { DiskCollectionSortMode, setPreferenceDiskCollectionSort } from "../../localstorage"
import { handleGetSlotConfig } from "../../main2worker"
import {
  DISK_COLLECTION_ITEM_TYPE,
  TAB_INDEX,
  createHdv,
  diskCollectionSortOptions,
  getDefaultDiskCollectionSortMode,
  getDiskCollection,
  getDiskCollectionSortMode,
  getExportFilename,
  isDiskExportable,
  loadDisk,
  sortDisks,
} from "../../diskdialog/diskpanel_utils"
import { isFileSystemApiSupported, showGlobalProgressModal } from "../../ui_utilities"
import { choiceMetadata, toggleMetadata } from "../../retro/retromenuhelpers"
import type { RetroControlMetadata, RetroMenuContext } from "../../retro/retromenucontext"
import { DiskBookmarks } from "./diskbookmarks"
import { newReleases } from "./newreleases"
import {
  DISK_DRIVE_LABELS,
  demoZooEnabled,
  downloadDiskToDevice,
  loadDiskFromCloudDrive,
  saveDiskToDevice,
} from "./diskdrive"
import {
  handleEjectDisk,
  handleGetDriveProps,
  handleGetFilename,
  handleSaveWritableFile,
  handleSetDiskWriteProtected,
} from "./driveprops"
import { GoogleDrive } from "./googledrive"
import { OneDriveCloudDrive } from "./onedriveclouddrive"
import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DiskImageChooser } from "./diskimagechooser"
import { faHdd } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import Flyout from "../../flyout"
import ImageWriter from "../printer/imagewriter"
import { isMinimalTheme } from "../../ui_settings"
import { useTranslation } from "../../../i18n/useTranslation"

const decodeDiskTitle = (title: string) => {
  let decodedTitle = title
  try {
    decodedTitle = decodeURIComponent(title)
  } catch {
    // Keep malformed URL text as-is.
  }
  return decodedTitle.replace(/\u00A0/g, " ")
}

const getCollection = () => getDiskCollection(new DiskBookmarks(), newReleases)

const exportDisks = async (context: RetroMenuContext, disks: DiskCollectionItem[]) => {
  context.close()
  const downloadedDisks: DownloadedExportDisk[] = []
  try {
    for (let index = 0; index < disks.length; index += 1) {
      const disk = disks[index]
      showGlobalProgressModal(true, context.t("retroControl.fetchingDisk", {
        current: String(index + 1),
        total: String(disks.length),
      }))
      const buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        loadDisk(-1, disk, context.displayProps.updateDisplay, result => {
          if (result) resolve(result)
          else reject(new Error(context.t("retroControl.downloadFailed", {
            title: decodeDiskTitle(disk.title),
          })))
        })
      })
      const data = new Uint8Array(buffer)
      downloadedDisks.push({ item: disk, buffer: data, filename: getExportFilename(disk, data) })
    }
    await createHdv(downloadedDisks)
  } catch (error) {
    showGlobalProgressModal(false)
    const message = error instanceof Error ? error.message : String(error)
    alert(context.t("retroControl.exportFailed", { message }))
  }
}

const exportItems = (disks: DiskCollectionItem[]): RetroControlMetadata[] =>
  sortDisks(disks, getDiskCollectionSortMode(TAB_INDEX.EXPORT)).map((disk, index) => ({
    id: `diskCollection.export.disk.${index}`,
    label: decodeDiskTitle(disk.title),
    options: [{ label: "" }, { label: "" }],
    optionIndex: 0,
    payload: disk,
    checkmarkIndex: 1,
  }))

const collectionItems = (
  context: RetroMenuContext,
  tabIndex: TAB_INDEX,
  disks: DiskCollectionItem[],
  sortMode: DiskCollectionSortMode = getDiskCollectionSortMode(tabIndex),
): RetroControlMetadata[] => {
  if (disks.length === 0) return []
  const sortIndex = diskCollectionSortOptions.findIndex(option => option.value === sortMode)
  const defaultSortIndex = diskCollectionSortOptions.findIndex(
    option => option.value === getDefaultDiskCollectionSortMode(tabIndex),
  )
  const sortControl = choiceMetadata({
    id: `diskCollection.${tabIndex}.sort`,
    label: "",
    labels: () => diskCollectionSortOptions.map(option => option.label),
    currentIndex: () => sortIndex,
    select: (_runtime, index) => {
      setPreferenceDiskCollectionSort(tabIndex, diskCollectionSortOptions[index].value)
    },
    defaultIndex: defaultSortIndex,
    valueOnly: true,
  })
  sortControl.refreshOptions = (runtime, index) => collectionItems(
    runtime,
    tabIndex,
    disks,
    diskCollectionSortOptions[index].value,
  )
  return [
    ...sortDisks(disks, sortMode).map((disk, index): RetroControlMetadata => ({
      id: `diskCollection.${tabIndex}.disk.${index}`,
      label: decodeDiskTitle(disk.title),
      action: runtime => {
        runtime.close()
        loadDisk(-1, disk, runtime.displayProps.updateDisplay)
      },
    })),
    {
      id: `diskCollection.${tabIndex}.sortSeparator`,
      label: context.t("retroControl.sortOrder"),
      separator: true,
      selectable: false,
    },
    sortControl,
  ]
}

const collectionTabs = [
    {
      id: "diskCollection.builtIn",
      labelKey: "retroControl.apple2tsCollection",
      index: TAB_INDEX.BUILT_IN,
      filter: (disk: DiskCollectionItem) => disk.type === DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
    },
    {
      id: "diskCollection.newReleases",
      labelKey: "retroControl.newReleases",
      index: TAB_INDEX.NEW_RELEASES,
      filter: (disk: DiskCollectionItem) => disk.type === DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
    },
    {
      id: "diskCollection.favorites",
      labelKey: "retroControl.favorites",
      index: TAB_INDEX.FAVORITES,
      filter: (disk: DiskCollectionItem) =>
        disk.type === DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE ||
        disk.type === DISK_COLLECTION_ITEM_TYPE.DEMOZOO,
    },
    {
      id: "diskCollection.export",
      labelKey: "retroControl.exportDisksToHdv",
      index: TAB_INDEX.EXPORT,
      filter: (disk: DiskCollectionItem) => isDiskExportable(disk) && disk.vtocType !== undefined,
    },
] as const

const diskCollectionControls: RetroControlMetadata[] = collectionTabs.map((tab, order) => ({
    id: tab.id,
    parentId: "diskCollection",
    order,
    label: context => context.t(tab.labelKey),
    dynamicChildren: runtime => {
      const disks = getCollection().filter(tab.filter)
      return tab.index === TAB_INDEX.EXPORT
        ? exportItems(disks)
        : collectionItems(runtime, tab.index, disks)
    },
    actionLabel: runtime => runtime.t(tab.index === TAB_INDEX.EXPORT ? "collection.export" : "retroControl.load"),
    submit: tab.index === TAB_INDEX.EXPORT
      ? (runtime, items, values) => {
        const selectedDisks = items
          .filter((item, index) => values[index] === 1 && item.payload)
          .map(item => item.payload as DiskCollectionItem)
        void exportDisks(runtime, selectedDisks)
      }
      : undefined,
    isSubmitVisible: tab.index === TAB_INDEX.EXPORT
      ? (_runtime, _items, values) => values.some(value => value === 1)
      : undefined,
  }))

const diskLoadItems = (driveIndex: number): RetroControlMetadata[] => [
  {
    id: `diskDrives.${driveIndex}.load.device`,
    label: context => context.t("disk.loadDisk"),
    action: context => {
      context.close()
      context.displayProps.setShowFileOpenDialog(true, driveIndex)
    },
  },
  {
    id: `diskDrives.${driveIndex}.load.internetArchive`,
    label: context => context.t("disk.loadDiskFromInternetArchive"),
    action: context => context.openDiskDialog({ driveIndex, type: "internetArchive" }),
  },
  ...(demoZooEnabled ? [{
    id: `diskDrives.${driveIndex}.load.demoZoo`,
    label: (context: RetroMenuContext) => context.t("disk.loadDiskFromDemoZoo"),
    action: (context: RetroMenuContext) => context.openDiskDialog({ driveIndex, type: "demoZoo" }),
  }] : []),
  ...(!navigator.userAgent.includes("Electron") ? [
    {
      id: `diskDrives.${driveIndex}.load.oneDrive`,
      label: (context: RetroMenuContext) => context.t("disk.loadDiskFromOneDrive"),
      action: (context: RetroMenuContext) => {
        context.close()
        void loadDiskFromCloudDrive(new OneDriveCloudDrive(), driveIndex)
      },
    },
    {
      id: `diskDrives.${driveIndex}.load.googleDrive`,
      label: (context: RetroMenuContext) => context.t("disk.loadDiskFromGoogleDrive"),
      action: (context: RetroMenuContext) => {
        context.close()
        void loadDiskFromCloudDrive(new GoogleDrive(), driveIndex)
      },
    },
  ] : []),
]

const insertedDiskItems = (driveIndex: number): RetroControlMetadata[] => {
  const drive = handleGetDriveProps(driveIndex)
  return [
    toggleMetadata({
      id: `diskDrives.${driveIndex}.writeProtected`,
      label: context => context.t("disk.writeProtectDisk"),
      enabled: () => drive.isWriteProtected,
      setEnabled: (context, enabled) => {
        handleSetDiskWriteProtected(driveIndex, enabled)
        context.displayProps.updateDisplay()
      },
    }),
    ...(drive.writableFileHandle ? [{
      id: `diskDrives.${driveIndex}.save`,
      label: (context: RetroMenuContext) => context.t("retroControl.saveDisk"),
      action: () => { void handleSaveWritableFile(driveIndex) },
    }] : []),
    ...(isFileSystemApiSupported() ? [{
      id: `diskDrives.${driveIndex}.saveToDevice`,
      label: (context: RetroMenuContext) => context.t("disk.saveDiskToDevice"),
      action: () => { void saveDiskToDevice(driveIndex) },
    }] : []),
    {
      id: `diskDrives.${driveIndex}.download`,
      label: context => context.t("disk.downloadDisk"),
      action: () => downloadDiskToDevice(driveIndex),
    },
    {
      id: `diskDrives.${driveIndex}.eject`,
      label: context => context.t("disk.ejectDisk"),
      action: context => {
        handleEjectDisk(driveIndex)
        context.displayProps.updateDisplay()
      },
    },
  ]
}

const diskDriveItems = (context: RetroMenuContext): RetroControlMetadata[] => {
  const slotConfig = handleGetSlotConfig()
  const drives = ([
    { index: 0, slot: 7 },
    { index: 1, slot: 7 },
    { index: 2, slot: 6 },
    { index: 3, slot: 6 },
  ] as const).filter(({ slot }) => slotConfig[slot] !== "none")
  if (drives.length === 0) return [{
    id: "diskDrives.none",
    label: context.t("retroControl.noDiskDrivesAvailable"),
  }]
  return drives.map(({ index }, order) => {
    const drive = handleGetDriveProps(index)
    const filename = handleGetFilename(index)
    return {
      id: `diskDrives.${index}`,
      order,
      label: context.t("retroControl.drive", {
        drive: DISK_DRIVE_LABELS[index],
        disk: filename
          ? `${drive.diskHasChanges ? "*" : ""}${decodeDiskTitle(filename)}`
          : context.t("retroControl.card.empty"),
      }),
      dynamicChildren: () => handleGetDriveProps(index).filename
        ? insertedDiskItems(index)
        : diskLoadItems(index),
      actionLabel: context.t("retroControl.load"),
      contextualActionLabel: drive.filename
        ? context.t("retroControl.options")
        : context.t("retroControl.load"),
    }
  })
}

export const retroDiskControls: RetroControlMetadata[] = [
  {
    id: "diskCollection",
    parentId: null,
    order: 1,
    label: context => context.t("retroControl.diskCollection"),
    actionLabel: context => context.t("retroControl.open"),
  },
  ...diskCollectionControls,
  {
    id: "diskDrives",
    parentId: null,
    order: 2,
    label: context => context.t("retroControl.diskDrives"),
    dynamicChildren: diskDriveItems,
    actionLabel: context => context.t("retroControl.load"),
  },
]

const DiskInterface = (props: DisplayProps) => {
  const { t } = useTranslation()
  const [isFlyoutOpen, setIsFlyoutOpen] = useState(false)
  const height = window.innerHeight ? window.innerHeight : (window.outerHeight - 120)
  const width = window.innerWidth ? window.innerWidth : (window.outerWidth - 20)
  const isScreenNarrow = width < height

  const slotConfig = handleGetSlotConfig()
  const allSlotsDisabled = slotConfig[1] === "none" && slotConfig[6] === "none" && slotConfig[7] === "none"

  return (
    <span style={{ opacity: allSlotsDisabled ? 0.4 : 1, filter: allSlotsDisabled ? "grayscale(100%)" : "none", pointerEvents: allSlotsDisabled ? "none" : "auto", cursor: allSlotsDisabled ? "not-allowed" : "pointer" }}>
      <Flyout
        icon={faHdd}
        title={t("disk.diskDrivesAndDevices")}
        isOpen={() => { return isFlyoutOpen && !allSlotsDisabled }}
        onClick={() => { if (!allSlotsDisabled) setIsFlyoutOpen(!isFlyoutOpen) }}
        position="bottom-left">
      <div className={`${isMinimalTheme() && isScreenNarrow ? "flex-column" : "flex-row"} flexwrap`}>
        <span className="flex-row">
          {!isMinimalTheme() && <DiskImageChooser {...props} />}
          <DiskDrive key={0} index={0} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={1} index={1} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(isMinimalTheme() && isScreenNarrow) && <ImageWriter />}
        </span>
        <span className="flex-row">
          <DiskDrive key={2} index={2} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          <DiskDrive key={3} index={3} renderCount={props.renderCount}
            setShowFileOpenDialog={props.setShowFileOpenDialog} />
          {(!isMinimalTheme() || !isScreenNarrow) && <ImageWriter />}
        </span>
      </div>
    </Flyout>
    </span>
  )
}

export default DiskInterface