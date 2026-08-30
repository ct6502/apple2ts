const mockGetCloudProvidersNeedingAuth = jest.fn<string[], [readonly DiskCollectionItem[]]>()
const mockSignInToCloudProvider = jest.fn<Promise<boolean>, []>()
jest.mock("../devices/disk/cloudauth", () => ({
  CLOUD_PROVIDER_NAMES: ["GoogleDrive", "OneDrive"],
  cloudProviderDisplayName: (providerName: string) => providerName === "GoogleDrive"
    ? "Google Drive"
    : providerName,
  getCloudProvidersNeedingAuth: (disks: readonly DiskCollectionItem[]) =>
    mockGetCloudProvidersNeedingAuth(disks),
  signInToCloudProvider: () => mockSignInToCloudProvider(),
}))
jest.mock("../devices/disk/apple2tsproxy", () => ({
  apple2tsProxyPath: (path: string) => path,
  hasApple2tsProxy: false,
}))
jest.mock("../devices/disk/demozoodialog", () => ({
  createDemoZooCloudData: jest.fn(),
  demoZooTypeFilters: [{ id: "all", labelKey: "demoZoo.all" }],
  filterDemoZooItems: jest.fn(() => []),
  loadDemoZooResult: jest.fn(),
  loadDemoZooSnapshot: jest.fn(() => Promise.resolve([])),
}))

jest.mock("../devices/disk/diskdrive", () => ({
  __esModule: true,
  default: () => null,
  DISK_DRIVE_LABELS: ["S7,D1", "S7,D2", "S6,D1", "S6,D2"],
  demoZooEnabled: false,
}))
const mockHandleGetDriveProps = jest.fn()
const mockHandleGetFilename = jest.fn()
const mockHandleGetProdosFloppy = jest.fn(() => true)
const mockLoadDisk = jest.fn()
jest.mock("../main2worker", () => ({
  ...jest.requireActual("../main2worker"),
  handleGetProdosFloppy: () => mockHandleGetProdosFloppy(),
}))
jest.mock("../devices/disk/driveprops", () => ({
  handleGetDriveProps: (...args: unknown[]) => mockHandleGetDriveProps(...args),
  handleGetFilename: (...args: unknown[]) => mockHandleGetFilename(...args),
}))
jest.mock("../diskdialog/diskpanel_utils", () => ({
  ...jest.requireActual("../diskdialog/diskpanel_utils"),
  loadDisk: (...args: unknown[]) => mockLoadDisk(...args),
  loadDiskIntoDrive: (...args: unknown[]) => mockLoadDisk(...args),
}))
jest.mock("../devices/disk/diskimagechooser", () => ({ DiskImageChooser: () => null }))
jest.mock("../devices/printer/imagewriter", () => ({
  __esModule: true,
  default: () => null,
  retroImageWriterControls: [
    {
      id: "printer.imageWriterII",
      parentId: "ports",
      order: 1,
      label: "ImageWriter II (Slot 1)",
      contextualActionLabel: "Open",
      action: () => undefined,
    },
  ],
}))

import { retroMenuRegistry } from "./retromenucomposition"
import {
  createRetroExportItems,
  createRetroExportScreenItems,
  getSelectedCollectionDriveIndex,
  getRetroExportHdvSize,
  getRetroVtocIndicator,
  insertedDiskItems,
  resetCollectionDriveSelectionSession,
  retroDiskControls,
} from "../devices/disk/diskinterface"
import { DISK_COLLECTION_ITEM_TYPE } from "../diskdialog/diskpanel_utils"
import { DiskBookmarks } from "../devices/disk/diskbookmarks"
import { CLOUD_SYNC } from "../../common/utility"
import {
  createControlContext,
  type RetroControlMetadata,
  type RetroMenuContext,
  type RetroResolvedControl,
} from "./retromenucontext"

const collectionDisk = (vtocType?: VtocType): DiskCollectionItem => ({
  type: DISK_COLLECTION_ITEM_TYPE.A2TS_ARCHIVE,
  title: vtocType ?? "Unknown",
  lastUpdated: new Date(0),
  diskUrl: "disk.po",
  fileSize: 143360,
  vtocType,
})

const metadataValues = (
  items: RetroControlMetadata[],
  context: RetroMenuContext,
) => items.map(item => typeof item.optionIndex === "function"
  ? item.optionIndex(context)
  : item.optionIndex ?? -1)

describe("Retro menu metadata structure", () => {
  beforeEach(() => {
    mockGetCloudProvidersNeedingAuth.mockReturnValue([])
    mockSignInToCloudProvider.mockResolvedValue(true)
    mockLoadDisk.mockClear()
    mockHandleGetProdosFloppy.mockReturnValue(true)
    resetCollectionDriveSelectionSession()
  })

  test("uses each disk format's default without showing it before drive selection", () => {
    const floppy = collectionDisk()
    const hardDrive = {
      ...collectionDisk(),
      title: "Wizard Replay",
      diskUrl: "WizardReplay.hdv_.zip",
      fileSize: 33553920,
    }
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.diskCollection = [floppy, hardDrive]
    const tab = retroDiskControls.find(control => control.id === "diskCollection.builtIn")
    const rows = (tab?.dynamicChildren?.(context) ?? []).filter(item => item.id.includes(".disk."))
    const floppyRow = rows.find(item => item.label === floppy.title)
    const hardDriveRow = rows.find(item => item.label === hardDrive.title)

    expect(typeof floppyRow?.optionIndex === "function"
      ? floppyRow.optionIndex(context)
      : undefined).toBe(2)
    expect(typeof hardDriveRow?.optionIndex === "function"
      ? hardDriveRow.optionIndex(context)
      : undefined).toBe(0)
    expect(typeof floppyRow?.contextualSubmenuTitleValue === "function"
      ? floppyRow.contextualSubmenuTitleValue(context)
      : undefined).toBeUndefined()
    expect(typeof hardDriveRow?.contextualSubmenuTitleValue === "function"
      ? hardDriveRow.contextualSubmenuTitleValue(context)
      : undefined).toBeUndefined()
  })

  test("resets drive selection per tab and reveals that disk's default first", () => {
    const builtInDisk = collectionDisk()
    const newReleaseDisk = {
      ...collectionDisk(),
      type: DISK_COLLECTION_ITEM_TYPE.NEW_RELEASE,
      title: "New Release",
    }
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    context.diskCollection = [builtInDisk, newReleaseDisk]
    const builtInTab = retroDiskControls.find(control => control.id === "diskCollection.builtIn")
    const builtInItems = builtInTab?.dynamicChildren?.(context) ?? []
    const builtInRow = builtInItems.find(item => item.payload !== undefined || item.id.includes(".disk."))

    expect(builtInRow).toMatchObject({
      kind: "action",
      hideOptionValue: true,
      revealOptionOnFirstHorizontalInput: true,
      optionIndex: expect.any(Function),
      contextualSubmenuTitleValue: expect.any(Function),
    })
    expect((builtInRow?.options as { label: string }[])?.map(option => option.label))
      .toEqual(["S7,D1", "S7,D2", "S6,D1", "S6,D2"])

    builtInRow?.refreshOptions?.(context, 2)
    expect(getSelectedCollectionDriveIndex()).toBe(2)

    const refreshedBuiltInItems = builtInTab?.dynamicChildren?.(context) ?? []
    const refreshedBuiltInRow = refreshedBuiltInItems.find(item => item.id.includes(".disk."))
    expect(getSelectedCollectionDriveIndex()).toBeUndefined()
    expect(typeof refreshedBuiltInRow?.contextualSubmenuTitleValue === "function"
      ? refreshedBuiltInRow.contextualSubmenuTitleValue(context)
      : refreshedBuiltInRow?.contextualSubmenuTitleValue).toBeUndefined()

    const newReleaseTab = retroDiskControls.find(control => control.id === "diskCollection.newReleases")
    const newReleaseItems = newReleaseTab?.dynamicChildren?.(context) ?? []
    const newReleaseRow = newReleaseItems.find(item => item.id.includes(".disk."))
    expect(getSelectedCollectionDriveIndex()).toBeUndefined()
    expect(typeof newReleaseRow?.optionIndex === "function"
      ? newReleaseRow.optionIndex(context)
      : newReleaseRow?.optionIndex).toBe(2)
    expect(typeof newReleaseRow?.contextualSubmenuTitleValue === "function"
      ? newReleaseRow.contextualSubmenuTitleValue(context)
      : newReleaseRow?.contextualSubmenuTitleValue).toBeUndefined()

    newReleaseRow?.refreshOptions?.(context, 2)
    expect(typeof newReleaseRow?.contextualSubmenuTitleValue === "function"
      ? newReleaseRow.contextualSubmenuTitleValue(context)
      : newReleaseRow?.contextualSubmenuTitleValue).toBe("S6,D1")

    newReleaseRow?.action?.(context)
    expect(mockLoadDisk).toHaveBeenCalledWith(
      2,
      newReleaseDisk,
      context.displayProps.updateDisplay,
      context.close,
    )
  })

  test("does not add drive selection to Export rows", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const exportRow = createRetroExportItems(context, [collectionDisk("prodos")])
      .find(item => item.id.includes(".disk."))

    expect(exportRow?.options).toBeDefined()
    expect(exportRow?.contextualSubmenuTitleValue).toBeUndefined()
    expect(exportRow?.hideOptionValue).toBeUndefined()
  })

  test("uses Select for a loaded Disk Drive menu and Load for an empty drive", () => {
    const drive = retroDiskControls.find(control => control.id === "diskDrives.0")
    const actionLabel = drive?.actionLabel as (context: RetroMenuContext) => string
    const context = createControlContext(undefined, key => key, "en", () => undefined)

    mockHandleGetDriveProps.mockReturnValue({ filename: "Disk.po" })
    expect(actionLabel(context)).toBe("retroControl.select")

    mockHandleGetDriveProps.mockReturnValue({ filename: "" })
    expect(actionLabel(context)).toBe("retroControl.load")
  })

  test("matches popup item order for local and inactive cloud-backed disks", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.diskBookmarks = new DiskBookmarks()
    mockHandleGetDriveProps.mockReturnValue({
      filename: "Disk.po",
      diskData: new Uint8Array(),
      isWriteProtected: false,
      writableFileHandle: null,
      cloudData: null,
    })

    expect(insertedDiskItems(0, context).map(item => item.label instanceof Function
      ? item.label(context)
      : item.label)).toEqual([
      "disk.writeProtectDisk", "disk.downloadDisk", "disk.downloadAndEjectDisk",
      "disk.ejectDisk", "Cloud", "disk.saveDiskToOneDrive", "disk.saveDiskToGoogleDrive",
    ])
    expect(insertedDiskItems(0, context).filter(item => item.separator).map(item => item.label))
      .toEqual(["Cloud"])

    mockHandleGetDriveProps.mockReturnValue({
      filename: "Archive.po",
      diskData: new Uint8Array(),
      isWriteProtected: false,
      writableFileHandle: null,
      cloudData: {
        itemId: "archive-item",
        syncStatus: CLOUD_SYNC.INACTIVE,
      },
    })
    expect(insertedDiskItems(0, context).map(item => item.label instanceof Function
      ? item.label(context)
      : item.label)).toEqual([
      "disk.writeProtectDisk", "", "disk.addDiskToCollection", "", "disk.downloadDisk",
      "disk.downloadAndEjectDisk", "disk.ejectDisk", "", "disk.saveDiskToOneDrive",
      "disk.saveDiskToGoogleDrive",
    ])
  })

  test("matches popup item order for an active cloud disk", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.diskBookmarks = new DiskBookmarks()
    mockHandleGetDriveProps.mockReturnValue({
      filename: "Cloud.po",
      diskData: new Uint8Array(),
      isWriteProtected: false,
      cloudData: {
        itemId: "cloud-item",
        syncStatus: CLOUD_SYNC.ACTIVE,
        syncInterval: 60000,
      },
    })

    const items = insertedDiskItems(0, context)
    expect(items.map(item => item.label instanceof Function ? item.label(context) : item.label)).toEqual([
      "disk.writeProtectDisk", "disk.ejectDisk", "disk.addDiskToCollection", "Cloud",
      "disk.syncEveryMinute", "disk.syncEvery5Minutes", "disk.pauseSyncing", "disk.syncNow",
    ])
    expect(items.filter(item => item.separator).map(item => item.label instanceof Function
      ? item.label(context)
      : item.label)).toEqual(["Cloud"])
    expect(typeof items[4].indicator === "function" ? items[4].indicator(context) : items[4].indicator)
      .toBe("*")
  })

  test("refreshes an ejected disk drive label to Empty", () => {
    const context = createControlContext(undefined, (key, params) =>
      key === "retroControl.drive" ? params?.disk ?? "" : key, "en", () => undefined)
    const diskCollection = retroMenuRegistry.resolve(context)
      .find(control => control.id === "diskCollection")
    const children = diskCollection?.children as (() => RetroResolvedControl[]) | undefined

    mockHandleGetDriveProps.mockReturnValue({ diskHasChanges: false, filename: "Disk.po" })
    mockHandleGetFilename.mockReturnValue("Disk.po")
    expect(children?.().find(item => item.id === "diskDrives.0")?.label).toBe("Disk.po")

    mockHandleGetDriveProps.mockReturnValue({ diskHasChanges: false, filename: "" })
    mockHandleGetFilename.mockReturnValue("")
    expect(children?.().find(item => item.id === "diskDrives.0")?.label)
      .toBe("retroControl.card.empty")
  })

  test("does not show notifications outside the Export tab", () => {
    mockGetCloudProvidersNeedingAuth.mockReturnValue(["GoogleDrive"])
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const tab = retroDiskControls.find(control => control.id === "diskCollection.newReleases")
    const children = tab?.dynamicChildren?.(context) ?? []
    expect(children.some(item => item.id.includes("notification"))).toBe(false)
    expect(children.some(item => item.indicator !== undefined)).toBe(false)
  })

  test("does not request cloud auth for Internet Archive disks with provider metadata", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const internetArchiveDisk = {
      ...collectionDisk("prodos"),
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      title: "Cause and Effect: What Makes It Happen",
      cloudData: { providerName: "GoogleDrive" } as CloudData,
    }

    const items = createRetroExportScreenItems(context, [internetArchiveDisk])

    expect(mockGetCloudProvidersNeedingAuth).toHaveBeenCalledWith([])
    expect(items.some(item => item.id.includes("notification"))).toBe(false)
  })

  test("does not retain deleted favorites in Export from a stale host collection", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const deletedFavorite = {
      ...collectionDisk("prodos"),
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      title: "Cause and Effect: What Makes It Happen",
      bookmarkId: "deleted-favorite",
    }
    context.diskCollection = [deletedFavorite]
    localStorage.removeItem("dbm-deleted-favorite")
    const exportTab = retroDiskControls.find(control => control.id === "diskCollection.export")

    const items = exportTab?.dynamicChildren?.(context) ?? []

    expect(items.some(item => item.label === deletedFavorite.title)).toBe(false)
  })

  test("marks favorites with X and deletes them only when leaving the screen", () => {
    const bookmarkId = "favorite-to-delete"
    const bookmarks = new DiskBookmarks()
    bookmarks.set({
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      id: bookmarkId,
      title: "Cause and Effect: What Makes It Happen",
      screenshotUrl: new URL("https://example.com/screenshot.png"),
      diskUrl: "https://example.com/cause-and-effect.woz",
      lastUpdated: new Date(0),
      vtocType: "prodos",
    })
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.diskBookmarks = bookmarks
    const favorites = retroMenuRegistry.resolve(context, "diskCollection")
      .find(item => item.id === "diskCollection.favorites")
    const items = typeof favorites?.children === "function" ? favorites.children() : []
    const diskIndex = items.findIndex(item => item.payload !== undefined)
    const disk = items[diskIndex]

    expect(disk).toMatchObject({
      checkmarkIndex: 1,
      checkedIndicator: "X",
      hideOptionValue: true,
      optionIndex: 0,
    })
    expect(disk.options).toHaveLength(2)
    expect(bookmarks.contains(bookmarkId)).toBe(true)

    const values = items.map(item => item.optionIndex ?? -1)
    values[diskIndex] = 1
    const refreshedItems = typeof favorites?.children === "function"
      ? favorites.children(items, values)
      : []
    const refreshedDisk = refreshedItems.find(item => item.payload !== undefined)
    expect(refreshedDisk?.optionIndex).toBe(1)

    favorites?.onLeave?.(refreshedItems, refreshedItems.map(item => item.optionIndex ?? -1))

    expect(bookmarks.contains(bookmarkId)).toBe(false)
    expect(localStorage.getItem(`dbm-${bookmarkId}`)).toBeNull()
  })

  test("hides blocked disks and disables unknown disks on the Export to HDV screen", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const items = createRetroExportItems(context, [
      collectionDisk("prodos"),
      collectionDisk("other"),
      collectionDisk(),
    ])
    const exportable = items.find(item => (item.payload as DiskCollectionItem | undefined)?.vtocType === "prodos")
    const blocked = items.find(item => (item.payload as DiskCollectionItem | undefined)?.vtocType === "other")
    const unknown = items.find(item => item.payload &&
      (item.payload as DiskCollectionItem).vtocType === undefined)

    expect(exportable?.selectable).toBe(true)
    expect(blocked).toBeUndefined()
    expect(unknown?.selectable).toBe(false)
    expect(unknown?.bulkSelectable).toBe(false)
    expect(unknown?.indicator).toBe("?")
    expect(items.at(-2)).toMatchObject({
      id: "diskCollection.export.sortSeparator",
      separator: true,
      selectable: false,
    })
    const sortSepLabel = items.at(-2)?.label
    expect(typeof sortSepLabel === "function" ? sortSepLabel(context) : sortSepLabel).toBe("retroControl.sortOrder")
    expect(items.at(-1)).toMatchObject({
      id: "diskCollection.export.sort",
      valueOnly: true,
    })
    expect(items.at(-1)?.refreshOptions).toBeDefined()
  })

  test("reports selected HDV export size against the 32 MB limit", () => {
    const localDisk = collectionDisk("prodos")
    const cloudDisk = {
      ...collectionDisk("prodos"),
      cloudData: { providerName: "OneDrive", itemId: "cloud-disk", fileSize: 1048576 } as CloudData,
    }
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const items = createRetroExportItems(context, [localDisk, cloudDisk]) as unknown as RetroResolvedControl[]
    const values = metadataValues(items as unknown as RetroControlMetadata[], context)

    expect(getRetroExportHdvSize(items, values)).toBeUndefined()
    values[items.findIndex(item => item.payload === localDisk)] = 1
    expect(getRetroExportHdvSize(items, values)).toBe("140 KB / 32 MB")
    values[items.findIndex(item => item.payload === cloudDisk)] = 1
    expect(getRetroExportHdvSize(items, values)).toBe("1.1 MB / 32 MB")

    const exportTab = retroMenuRegistry.resolve(context, "diskCollection")
      .find(control => control.id === "diskCollection.export")
    expect(exportTab?.submenuTitleValue?.(items, values)).toBe("1.1 MB / 32 MB")
  })

  test("shows the active VTOC spinner and leaves other unresolved disks as unknown", () => {
    const activeDisk = collectionDisk()
    activeDisk.diskUrl = "active.po"
    const waitingDisk = collectionDisk()
    waitingDisk.diskUrl = "waiting.po"

    for (const frame of ["/", "-", "\\", "!", "|"]) {
      expect(getRetroVtocIndicator(activeDisk, "active.po", frame)).toBe(frame)
    }
    expect(getRetroVtocIndicator(waitingDisk, "active.po", "/")).toBe("?")
    expect(getRetroVtocIndicator(collectionDisk("prodos"), "disk.po", "/")).toBeUndefined()
  })

  test("shows Export auth notifications only when relevant and hides Export while pending", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const cloudDisk = {
      ...collectionDisk("prodos"),
      type: DISK_COLLECTION_ITEM_TYPE.CLOUD_DRIVE,
      cloudData: { providerName: "OneDrive", itemId: "cloud-disk" } as CloudData,
    }
    mockGetCloudProvidersNeedingAuth.mockImplementation(disks =>
      disks.some(disk => disk.cloudData?.providerName === "OneDrive") ? ["OneDrive"] : [])

    const unresolvedCloudDisk = { ...cloudDisk, vtocType: undefined }
    const unresolvedItems = createRetroExportScreenItems(context, [unresolvedCloudDisk])
    expect(unresolvedItems[0].id).toBe("diskCollection.3.notification.OneDrive")

    const initialItems = createRetroExportScreenItems(context, [cloudDisk])
    expect(initialItems.some(item => item.id.includes("notification"))).toBe(false)

    const diskIndex = initialItems.findIndex(item => item.payload === cloudDisk)
    const selectedValues = metadataValues(initialItems, context)
    selectedValues[diskIndex] = 1
    const selectedItems = createRetroExportScreenItems(
      context,
      [cloudDisk],
      initialItems as unknown as RetroResolvedControl[],
      selectedValues,
    )
    expect(selectedItems[0].id).toBe("diskCollection.3.notification.OneDrive")
    expect(selectedItems[1]).toMatchObject({
      id: "diskCollection.3.notificationsSeparator",
      separator: true,
      selectable: false,
    })

    const exportTab = retroDiskControls.find(control => control.id === "diskCollection.export")
    expect(exportTab?.isSubmitVisible?.(
      context,
      selectedItems as unknown as RetroResolvedControl[],
      metadataValues(selectedItems, context),
    )).toBe(false)

    mockGetCloudProvidersNeedingAuth.mockReturnValue([])
    expect(exportTab?.isSubmitVisible?.(
      context,
      selectedItems as unknown as RetroResolvedControl[],
      metadataValues(selectedItems, context),
    )).toBe(true)
  })

  test("hides Export until a disk is selected", () => {
    mockHandleGetDriveProps.mockReturnValue({ filename: "" })
    mockHandleGetFilename.mockReturnValue("")
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const items = createRetroExportItems(context, [collectionDisk("prodos")])
    const values = metadataValues(items, context)
    const exportTab = retroMenuRegistry.resolve(context, "diskCollection")
      .find(control => control.id === "diskCollection.export")
    const diskItem = items.find(item => item.payload)

    expect(diskItem?.kind).toBe("choice")
    expect(exportTab?.isSubmitVisible?.(
      items as unknown as RetroResolvedControl[],
      values,
    )).toBe(false)

    const diskIndex = items.findIndex(item => item.payload)
    values[diskIndex] = 1
    expect(exportTab?.isSubmitVisible?.(
      items as unknown as RetroResolvedControl[],
      values,
    )).toBe(true)
  })

  test("has unique stable IDs", () => {
    const ids = retroMenuRegistry.getIds()
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("omits non-display controls from the Display menu", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const ids = retroMenuRegistry.resolve(context, "display").map(control => control.id)

    expect(ids).not.toContain("display.other")
    expect(ids).not.toContain("display.infoPanel")
  })

  test("commits fullscreen through Save without previewing it", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const fullscreen = retroMenuRegistry.resolve(context, "display")
      .find(control => control.id === "machine.fullscreen")

    expect(fullscreen?.options?.every(option => option.action && !option.preview)).toBe(true)
  })

  test("makes skin controls available without a separate Retro theme", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const controls = retroMenuRegistry.resolve(context, "options")
    const dependentIds = [
      "options.retroSkin",
      "options.retroSkin.text",
      "options.retroSkin.background",
      "options.retroSkin.border",
    ]

    dependentIds.forEach(id => {
      expect(controls.find(control => control.id === id)?.selectableWhen).toBeUndefined()
    })
  })

  test("preserves exact root ordering", () => {
    expect(retroMenuRegistry.getIds(null)).toEqual([
      "machine",
      "diskCollection",
      "display",
      "sound",
      "keyboard",
      "keyboard.joystick",
      "ports",
      "slots",
      "options",
      "quit",
    ])
  })

  test("preserves key submenu ordering", () => {
    expect(retroMenuRegistry.getIds("machine")).toEqual([
      "machine.boot",
      "machine.reset",
      "state.restore",
      "state.save",
      "machine.clipboard",
      "clipboard.copyText",
      "clipboard.pasteText",
      "machine.timeMachine",
      "snapshot.back",
      "snapshot.take",
      "snapshot.forward",
      "snapshot.saveState",
      "emulator.pause",
    ])
    expect(retroMenuRegistry.getIds("diskCollection")).toEqual([
      "diskCollection.builtIn",
      "diskCollection.newReleases",
      "diskCollection.favorites",
      "diskCollection.export",
      "diskCollection.drivesSeparator",
      "diskDrives.none",
      "diskDrives.0",
      "diskDrives.1",
      "diskDrives.2",
      "diskDrives.3",
    ])
    expect(retroMenuRegistry.getIds("options")).toEqual([
      "options.speed",
      "options.hotReload",
      "options.retroSkinSeparator",
      "options.theme",
      "options.retroSkin",
      "options.retroSkin.text",
      "options.retroSkin.background",
      "options.retroSkin.border",
      "options.other",
      "settings.reset",
    ])
    expect(retroMenuRegistry.getIds("display")).toEqual([
      "display.color",
      "display.monitorMode",
      "display.scanlines",
      "display.ghosting",
      "display.crtDistortion",
      "machine.fullscreen",
      "options.language",
    ])
    expect(retroMenuRegistry.getIds("sound")).toEqual([
      "sound.enabled",
      "sound.mockingboard",
      "sound.midi",
    ])
    expect(retroMenuRegistry.getIds("slots")).toEqual([
      "slots.1", "slots.2", "slots.3", "slots.4", "slots.5", "slots.6", "slots.7",
    ])
    expect(retroMenuRegistry.getIds("ports")).toEqual(["printerPort", "printer.imageWriterII"])
    expect(retroMenuRegistry.getIds("keyboard")).toEqual([
      "keyboard.lowercase",
      "keyboard.openApple",
    ])
    expect(retroMenuRegistry.getIds("keyboard.joystick")).toEqual([
      "keyboard.joystick.arrowKeys",
      "keyboard.joystick.reverseYAxis",
      "keyboard.joystick.siriusJoyport",
    ])
    expect(retroMenuRegistry.getIds("printerPort")).toEqual([])
    expect(retroMenuRegistry.getIds("printer.imageWriterII")).toEqual([])
  })

  test("uses contextual labels for direct actions", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const printer = retroMenuRegistry.resolve(context, "ports")
    const sound = retroMenuRegistry.resolve(context, "sound")

    expect(printer.find(item => item.id === "printer.imageWriterII")?.contextualActionLabel).toBe("Open")
    expect(sound.find(item => item.id === "sound.enabled")?.defaultIndex).toBe(1)
  })

  test("matches the standard Apple IIe Slot 3 memory-card options", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const slot3 = retroMenuRegistry.resolve(context, "slots")
      .find(item => item.id === "slots.3")

    expect(slot3?.options?.map(option => option.label)).toEqual([
      "retroControl.card.empty",
      "Apple 699-0221 (64KB / 80-Col / dHGR)",
      "AE RamWorks III (512KB / 80-Col / dHGR)",
      "AE RamWorks III (1MB / 80-Col / dHGR)",
      "AE RamWorks III (4MB / 80-Col / dHGR)",
      "AE RamWorks III (8MB / 80-Col / dHGR)",
      "VidHD (64KB / 80-Col / SHR)",
    ])
  })
})