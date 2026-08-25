jest.mock("../devices/disk/diskdrive", () => ({
  __esModule: true,
  default: () => null,
  DISK_DRIVE_LABELS: ["S7,D1", "S7,D2", "S6,D1", "S6,D2"],
  demoZooEnabled: false,
}))
const mockHandleGetDriveProps = jest.fn()
jest.mock("../devices/disk/driveprops", () => ({
  handleGetDriveProps: (...args: unknown[]) => mockHandleGetDriveProps(...args),
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
import { retroDiskControls } from "../devices/disk/diskinterface"
import { createControlContext, type RetroMenuContext } from "./retromenucontext"

describe("Retro menu metadata structure", () => {
  test("uses Select for a loaded Disk Drive menu and Load for an empty drive", () => {
    const drive = retroDiskControls.find(control => control.id === "diskDrives.0")
    const actionLabel = drive?.actionLabel as (context: RetroMenuContext) => string
    const context = createControlContext(undefined, key => key, "en", () => undefined)

    mockHandleGetDriveProps.mockReturnValue({ filename: "Disk.po" })
    expect(actionLabel(context)).toBe("retroControl.select")

    mockHandleGetDriveProps.mockReturnValue({ filename: "" })
    expect(actionLabel(context)).toBe("retroControl.load")
  })

  test("has unique stable IDs", () => {
    const ids = retroMenuRegistry.getIds()
    expect(new Set(ids).size).toBe(ids.length)
  })

  test("exposes the Settings tour Debug target in the Display menu", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const infoPanel = retroMenuRegistry.resolve(context, "display")
      .find(control => control.id === "display.infoPanel")

    expect(infoPanel?.tourTargets).toContain("#tour-debug-button")
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
      "guidedTours",
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
      "options.clock",
      "options.mouse",
      "options.ramDisk",
      "options.retroSkinSeparator",
      "options.theme",
      "options.retroSkin",
      "options.retroSkin.text",
      "options.retroSkin.background",
      "options.retroSkin.border",
      "options.other",
      "options.hotReload",
      "settings.reset",
    ])
    expect(retroMenuRegistry.getIds("display")).toEqual([
      "display.color",
      "display.scanlines",
      "display.ghosting",
      "display.crtDistortion",
      "machine.fullscreen",
      "display.other",
      "display.infoPanel",
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
    expect(retroMenuRegistry.getIds("guidedTours")).toEqual([
      "guidedTours.main",
      "guidedTours.settings",
      "guidedTours.debug",
      "guidedTours.links",
      "guidedTours.reportIssue",
      "guidedTours.privacyPolicy",
    ])
    expect(retroMenuRegistry.getIds("printerPort")).toEqual([])
    expect(retroMenuRegistry.getIds("modemPort")).toEqual([])
  })

  test("uses contextual labels for direct actions", () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    const slots = retroMenuRegistry.resolve(context, "slots")
    const help = retroMenuRegistry.resolve(context, "guidedTours")
    const sound = retroMenuRegistry.resolve(context, "sound")

    expect(slots.find(item => item.id === "slots.imageWriterII")?.contextualActionLabel).toBe("Open")
    expect(sound.find(item => item.id === "sound.enabled")?.defaultIndex).toBe(1)
    expect(help.find(item => item.id === "guidedTours.reportIssue")?.contextualActionLabel)
      .toBe("retroControl.open")
    expect(help.find(item => item.id === "guidedTours.privacyPolicy")?.contextualActionLabel)
      .toBe("retroControl.open")

    const open = jest.spyOn(window, "open").mockImplementation(() => null)
    help.find(item => item.id === "guidedTours.reportIssue")?.action?.()
    help.find(item => item.id === "guidedTours.privacyPolicy")?.action?.()
    expect(open).toHaveBeenNthCalledWith(
      1,
      "https://github.com/ct6502/apple2ts/issues",
      "_blank",
      "noopener,noreferrer",
    )
    expect(open).toHaveBeenNthCalledWith(
      2,
      "https://ct6502.org/privacy/",
      "_blank",
      "noopener,noreferrer",
    )
    open.mockRestore()
  })
})