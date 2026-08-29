jest.mock("../../localstorage", () => ({
  RETRO_SKIN: { APPLE_IIE: 0, APPLE_IIGS: 1, APPLE_IIPLUS: 2 },
}))
const mockShowGlobalProgressModal = jest.fn()
jest.mock("../../ui_utilities", () => ({
  showGlobalProgressModal: (...args: unknown[]) => mockShowGlobalProgressModal(...args),
}))

import { RETRO_SKIN } from "../../localstorage"
import { ControlRegistry } from "../../controls/controlregistry"
import { createControlContext } from "../../retro/retromenucontext"
import {
  createRetroCloudDriveControl,
  type CloudBrowserItem,
  type CloudBrowserProvider,
} from "./clouddrive_retro"

describe("retro cloud drive screen", () => {
  test("signs in, browses folders, filters files, and loads a disk", async () => {
    let signedIn = false
    const rootItems: CloudBrowserItem[] = [
      { id: "folder", name: "Games", kind: "folder" },
      { id: "disk", name: "Disk.po", kind: "file" },
      { id: "text", name: "Notes.txt", kind: "file" },
    ]
    const listFolder = jest.fn(async (folderId: string) => folderId === "root"
      ? rootItems
      : [{ id: "nested", name: "Nested.woz", kind: "file" } as CloudBrowserItem])
    const loadFile = jest.fn(async () => true)
    const provider: CloudBrowserProvider = {
      id: "diskDrives.0.load.testDrive",
      displayName: "Test Drive",
      hasAuthToken: () => signedIn,
      signIn: async () => { signedIn = true; return true },
      listFolder,
      loadFile,
    }
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    const control = createRetroCloudDriveControl(0, provider)
    control.parentId = null
    const screen = new ControlRegistry([control]).resolve(context)[0]
    const children = screen.children as () => ReturnType<ControlRegistry<typeof context>["resolve"]>

    expect(children()).toEqual([])
    await screen.afterOpen?.()
    let items = children()
    expect(items.map(item => item.label)).toEqual([
      `${String.fromCodePoint(0xe098)}${String.fromCodePoint(0xe099)} Games`,
      "Disk.po",
    ])
    expect(items.map(item => item.contextualActionLabel)).toEqual(["Open", "Load"])
    expect(items[0].useRetroFont).toBe(true)
    expect(items.every(item => item.options === undefined && item.onHorizontalInput === undefined)).toBe(true)
    expect(mockShowGlobalProgressModal).toHaveBeenCalledWith(true, "Fetching cloud data")
    expect(mockShowGlobalProgressModal).toHaveBeenLastCalledWith(false)

    await items[0].action?.()
    items = children()
    expect(items.map(item => item.label)).toEqual(["..", "Nested.woz"])
    await items[1].action?.()
    expect(loadFile).toHaveBeenCalledWith(expect.objectContaining({ id: "nested" }), 0)
    expect(context.close).toHaveBeenCalled()
    expect(mockShowGlobalProgressModal).toHaveBeenLastCalledWith(false)

    await items[0].action?.()
    context.retroSkin = RETRO_SKIN.APPLE_IIPLUS
    expect(children()[0].label).toBe("[] Games")
  })
})