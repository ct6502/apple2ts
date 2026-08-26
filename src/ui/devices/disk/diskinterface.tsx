import { DiskCollectionSortMode, setPreferenceDiskCollectionSort } from "../../localstorage"
import { handleGetSlotConfig } from "../../main2worker"
import {
  DISK_COLLECTION_ITEM_TYPE,
  TAB_INDEX,
  createHdv,
  diskItemKey,
  diskCollectionSortOptions,
  formatBytes,
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
import type { RetroControlMetadata, RetroMenuContext, RetroResolvedControl } from "../../retro/retromenucontext"
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
import {
  CLOUD_PROVIDER_NAMES,
  cloudProviderDisplayName,
  getCloudProvidersNeedingAuth,
  signInToCloudProvider,
} from "./cloudauth"
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

const cloudAuthNotificationControls = (
  tabIndex: TAB_INDEX,
  disks: DiskCollectionItem[],
): RetroControlMetadata[] => {
  const providersNeedingAuth = getCloudProvidersNeedingAuth(disks)
  if (providersNeedingAuth.length === 0) return []
  return [
    ...CLOUD_PROVIDER_NAMES.filter(providerName => providersNeedingAuth.includes(providerName)).map(
      (providerName): RetroControlMetadata => ({
        id: `diskCollection.${tabIndex}.notification.${providerName}`,
        label: context => `*${cloudProviderDisplayName(providerName)} ${context.t("collection.cloudAuthRequired")}`,
        contextualActionLabel: context => context.t("messages.confirm"),
        keepMenuOpen: true,
        refreshAfterAction: true,
        action: async context => {
          const authReady = await signInToCloudProvider(providerName)
          if (authReady) {
            context.notifyCloudAuthChanged?.()
            context.displayProps.updateDisplay()
          }
        },
      }),
    ),
    {
      id: `diskCollection.${tabIndex}.notificationsSeparator`,
      label: context => context.t("retroControl.diskCollection"),
      separator: true,
      selectable: false,
    },
  ]
}

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

export const createRetroExportItems = (
  context: RetroMenuContext,
  disks: DiskCollectionItem[],
  sortMode: DiskCollectionSortMode = getDiskCollectionSortMode(TAB_INDEX.EXPORT),
  selectedDiskKeys = new Set<string>(),
): RetroControlMetadata[] => {
  const exportableDisks = disks.filter(isDiskExportable)
  if (exportableDisks.length === 0) return []
  const sortIndex = diskCollectionSortOptions.findIndex(option => option.value === sortMode)
  const defaultSortIndex = diskCollectionSortOptions.findIndex(
    option => option.value === getDefaultDiskCollectionSortMode(TAB_INDEX.EXPORT),
  )
  const sortControl = choiceMetadata({
    id: "diskCollection.export.sort",
    label: "",
    labels: () => diskCollectionSortOptions.map(option => option.label),
    currentIndex: () => sortIndex,
    select: (_runtime, index) => {
      setPreferenceDiskCollectionSort(TAB_INDEX.EXPORT, diskCollectionSortOptions[index].value)
    },
    defaultIndex: defaultSortIndex,
    valueOnly: true,
  })
  sortControl.refreshOptions = (runtime, index, items, values) => createRetroExportScreenItems(
    runtime,
    disks,
    items,
    values,
    diskCollectionSortOptions[index].value,
  )
  return [
    ...sortDisks(exportableDisks, sortMode).map((disk): RetroControlMetadata => ({
      id: `diskCollection.export.disk.${encodeURIComponent(diskItemKey(disk))}`,
      label: decodeDiskTitle(disk.title),
      options: [{ label: "" }, { label: "" }],
      optionIndex: selectedDiskKeys.has(diskItemKey(disk)) ? 1 : 0,
      payload: disk,
      checkmarkIndex: 1,
      indicator: disk.vtocType === undefined ? "?" : undefined,
      selectable: disk.vtocType !== undefined,
      bulkSelectable: disk.vtocType !== undefined,
      refreshOptions: (runtime, _index, items, values) => createRetroExportScreenItems(
        runtime,
        disks,
        items,
        values,
        sortMode,
      ),
    })),
    {
      id: "diskCollection.export.sortSeparator",
      label: context.t("retroControl.sortOrder"),
      separator: true,
      selectable: false,
    },
    sortControl,
  ]
}

export const getRetroVtocIndicator = (
  disk: DiskCollectionItem,
  activeVtocCheckKey: string | null,
  spinner: string,
) => disk.vtocType === undefined
    ? (diskItemKey(disk) === activeVtocCheckKey ? spinner : "?")
    : undefined

const selectedExportDiskKeys = (
  items: readonly RetroResolvedControl[] = [],
  values: number[] = [],
) => new Set(items.flatMap((item, index) =>
  values[index] === item.checkmarkIndex && item.payload
    ? [diskItemKey(item.payload as DiskCollectionItem)]
    : []))

const maxHdvBytes = 33554432

const selectedExportSize = (
  items: readonly RetroResolvedControl[] = [],
  values: number[] = [],
) => items.reduce((total, item, index) => {
  if (values[index] !== item.checkmarkIndex || !item.payload) return total
  const disk = item.payload as DiskCollectionItem
  if (disk.cloudData) return total + (disk.cloudData.fileSize > 0 ? disk.cloudData.fileSize : 143360)
  return total + Math.max(0, disk.fileSize)
}, 0)

export const getRetroExportHdvSize = (
  items: readonly RetroResolvedControl[] = [],
  values: number[] = [],
) => {
  const selectedBytes = selectedExportSize(items, values)
  return selectedBytes > 0
    ? `${formatBytes(selectedBytes)} / ${formatBytes(maxHdvBytes)}`
    : undefined
}

const exportNotificationDisks = (
  disks: DiskCollectionItem[],
  selectedDiskKeys: ReadonlySet<string>,
) => disks.filter(disk => disk.vtocType === undefined || selectedDiskKeys.has(diskItemKey(disk)))

export const createRetroExportScreenItems = (
  context: RetroMenuContext,
  disks: DiskCollectionItem[],
  items?: readonly RetroResolvedControl[],
  values?: number[],
  sortMode = getDiskCollectionSortMode(TAB_INDEX.EXPORT),
) => {
  const selectedDiskKeys = selectedExportDiskKeys(items, values)
  return [
    ...cloudAuthNotificationControls(
      TAB_INDEX.EXPORT,
      exportNotificationDisks(disks, selectedDiskKeys),
    ),
    ...createRetroExportItems(context, disks, sortMode, selectedDiskKeys),
  ]
}

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
      keepMenuOpen: true,
      action: runtime => {
        loadDisk(-1, disk, runtime.displayProps.updateDisplay, undefined, runtime.close)
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
    filter: isDiskExportable,
  },
] as const

const diskCollectionControls: RetroControlMetadata[] = collectionTabs.map((tab, order) => ({
  id: tab.id,
  parentId: "diskCollection",
  order,
  tourTargets: tab.index === TAB_INDEX.BUILT_IN ? ["#tour-disk-images"] : undefined,
  label: context => context.t(tab.labelKey),
  submenuTitleValue: tab.index === TAB_INDEX.EXPORT
    ? (_runtime, items, values) => getRetroExportHdvSize(items, values)
    : undefined,
  dynamicChildren: (runtime, items, values) => {
    const disks = (runtime.diskCollection ?? getCollection()).filter(tab.filter)
    return tab.index === TAB_INDEX.EXPORT
      ? createRetroExportScreenItems(runtime, disks, items, values)
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
    ? (_runtime, items, values) => {
      const selectedDiskKeys = selectedExportDiskKeys(items, values)
      const disks = items.flatMap(item => item.payload ? [item.payload as DiskCollectionItem] : [])
      return selectedDiskKeys.size > 0 && getCloudProvidersNeedingAuth(
        exportNotificationDisks(disks, selectedDiskKeys),
      ).length === 0
    }
    : undefined,
}))

const diskLoadItems = (driveIndex: number): RetroControlMetadata[] => [
  {
    id: `diskDrives.${driveIndex}.load.device`,
    label: context => context.t("disk.loadDisk"),
    keepMenuOpen: true,
    action: context => {
      context.displayProps.setShowFileOpenDialog(true, driveIndex)
    },
  },
  {
    id: `diskDrives.${driveIndex}.load.internetArchive`,
    label: context => context.t("disk.loadDiskFromInternetArchive"),
    keepMenuOpen: true,
    action: context => context.openDiskDialog({ driveIndex, type: "internetArchive" }),
  },
  ...(demoZooEnabled ? [{
    id: `diskDrives.${driveIndex}.load.demoZoo`,
    label: (context: RetroMenuContext) => context.t("disk.loadDiskFromDemoZoo"),
    keepMenuOpen: true,
    action: (context: RetroMenuContext) => context.openDiskDialog({ driveIndex, type: "demoZoo" }),
  }] : []),
  ...(!navigator.userAgent.includes("Electron") ? [
    {
      id: `diskDrives.${driveIndex}.load.oneDrive`,
      label: (context: RetroMenuContext) => context.t("disk.loadDiskFromOneDrive"),
      keepMenuOpen: true,
      action: (context: RetroMenuContext) => {
        void loadDiskFromCloudDrive(new OneDriveCloudDrive(), driveIndex).then(loaded => {
          if (loaded) context.close()
        })
      },
    },
    {
      id: `diskDrives.${driveIndex}.load.googleDrive`,
      label: (context: RetroMenuContext) => context.t("disk.loadDiskFromGoogleDrive"),
      keepMenuOpen: true,
      action: (context: RetroMenuContext) => {
        void loadDiskFromCloudDrive(new GoogleDrive(), driveIndex).then(loaded => {
          if (loaded) context.close()
        })
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

const diskDrives = [
  { index: 0, slot: 7 },
  { index: 1, slot: 7 },
  { index: 2, slot: 6 },
  { index: 3, slot: 6 },
] as const

const diskDriveControls = diskDrives.map(({ index, slot }, order): RetroControlMetadata => ({
  id: `diskDrives.${index}`,
  parentId: "diskCollection",
  order: order + 6,
  label: context => {
    const drive = handleGetDriveProps(index)
    const filename = handleGetFilename(index)
    return context.t("retroControl.drive", {
      drive: DISK_DRIVE_LABELS[index],
      disk: filename
        ? `${drive.diskHasChanges ? "*" : ""}${decodeDiskTitle(filename)}`
        : context.t("retroControl.card.empty"),
    })
  },
  isVisible: () => handleGetSlotConfig()[slot] !== "none",
  dynamicChildren: () => handleGetDriveProps(index).filename
    ? insertedDiskItems(index)
    : diskLoadItems(index),
  actionLabel: context => context.t(handleGetDriveProps(index).filename
    ? "retroControl.select"
    : "retroControl.load"),
  contextualActionLabel: context => handleGetDriveProps(index).filename
    ? context.t("retroControl.options")
    : context.t("retroControl.load"),
}))

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
    id: "diskCollection.drivesSeparator",
    parentId: "diskCollection",
    order: 4,
    tourTargets: ["#tour-floppy-disks"],
    label: context => context.t("retroControl.diskDrives"),
    separator: true,
    selectable: false,
  },
  {
    id: "diskDrives.none",
    parentId: "diskCollection",
    order: 5,
    label: context => context.t("retroControl.noDiskDrivesAvailable"),
    isVisible: () => diskDrives.every(({ slot }) => handleGetSlotConfig()[slot] === "none"),
    selectable: false,
  },
  ...diskDriveControls,
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