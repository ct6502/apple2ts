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

jest.mock("../devices/disk/diskdrive", () => ({
  __esModule: true,
  default: () => null,
  DISK_DRIVE_LABELS: ["S7,D1", "S7,D2", "S6,D1", "S6,D2"],
  demoZooEnabled: false,
}))
const mockHandleGetDriveProps = jest.fn()
const mockHandleGetFilename = jest.fn()
jest.mock("../devices/disk/driveprops", () => ({
  handleGetDriveProps: (...args: unknown[]) => mockHandleGetDriveProps(...args),
  handleGetFilename: (...args: unknown[]) => mockHandleGetFilename(...args),
}))
jest.mock("../devices/disk/diskimagechooser", () => ({ DiskImageChooser: () => null }))
jest.mock("../devices/printer/imagewriter", () => ({
  __esModule: true,
  default: () => null,
  retroImageWriterControls: [
    {
      id: "slots.devices",
      parentId: "slots",
      order: 7,
      label: "Devices",
      separator: true,
      selectable: false,
    },
    {
      id: "slots.imageWriterII",
      parentId: "slots",
      order: 8,
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
  getRetroExportHdvSize,
  getRetroVtocIndicator,
  retroDiskControls,
} from "../devices/disk/diskinterface"
import { DISK_COLLECTION_ITEM_TYPE } from "../diskdialog/diskpanel_utils"
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
      label: "retroControl.sortOrder",
      separator: true,
      selectable: false,
    })
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
    expect(getRetroExportHdvSize(items, values)).toBe("1.14 MB / 32 MB")

    const exportTab = retroMenuRegistry.resolve(context, "diskCollection")
      .find(control => control.id === "diskCollection.export")
    expect(exportTab?.submenuTitleValue?.(items, values)).toBe("1.14 MB / 32 MB")
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
      "slots",
      "ports",
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
      "slots.devices", "slots.imageWriterII",
    ])
    expect(retroMenuRegistry.getIds("ports")).toEqual(["printerPort", "modemPort"])
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
    expect(retroMenuRegistry.getIds("modemPort")).toEqual([])
  })

  test("uses contextual labels for direct actions", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const slots = retroMenuRegistry.resolve(context, "slots")
    const sound = retroMenuRegistry.resolve(context, "sound")

    expect(slots.find(item => item.id === "slots.imageWriterII")?.contextualActionLabel).toBe("Open")
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