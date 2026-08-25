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
})