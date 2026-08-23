jest.mock("../devices/disk/diskdrive", () => ({
  __esModule: true,
  default: () => null,
  DISK_DRIVE_LABELS: ["S7,D1", "S7,D2", "S6,D1", "S6,D2"],
  demoZooEnabled: false,
}))
jest.mock("../devices/disk/driveprops", () => ({}))
jest.mock("../devices/disk/diskimagechooser", () => ({ DiskImageChooser: () => null }))
jest.mock("../devices/printer/imagewriter", () => () => null)

import { retroMenuRegistry } from "./retromenucomposition"

describe("Retro menu metadata structure", () => {
  test("has unique stable IDs", () => {
    const ids = retroMenuRegistry.getIds()
    expect(new Set(ids).size).toBe(ids.length)
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
      "options.theme",
      "options.retroSkin",
      "options.language",
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
    ])
    expect(retroMenuRegistry.getIds("sound")).toEqual([
      "sound.enabled",
      "sound.mockingboard",
      "sound.midi",
    ])
    expect(retroMenuRegistry.getIds("slots")).toEqual([
      "slots.1", "slots.2", "slots.3", "slots.4", "slots.5", "slots.6", "slots.7",
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
    ])
    expect(retroMenuRegistry.getIds("printerPort")).toEqual([])
    expect(retroMenuRegistry.getIds("modemPort")).toEqual([])
  })
})