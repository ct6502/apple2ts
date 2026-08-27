const mockLoadDemoZooSnapshot = jest.fn()
const mockLoadDemoZooResult = jest.fn()

jest.mock("../../diskdialog/diskpanel_utils", () => ({ DISK_COLLECTION_ITEM_TYPE: { DEMOZOO: 2 } }))
jest.mock("./demozoodialog", () => ({
  demoZooTypeFilters: [
    { id: "all", labelKey: "demoZoo.all" },
    { id: "demo", labelKey: "demoZoo.demo" },
  ],
  loadDemoZooSnapshot: () => mockLoadDemoZooSnapshot(),
  loadDemoZooResult: (...args: unknown[]) => mockLoadDemoZooResult(...args),
  filterDemoZooItems: (items: Array<{ title: string; author: string; type: string }>, type: string, query: string) =>
    items.filter(item => (type === "all" || item.type.toLowerCase().includes(type)) &&
      (!query || item.title.toLowerCase().includes(query) || item.author.toLowerCase().includes(query))),
  createDemoZooCloudData: (item: { id: number }) => ({ itemId: `demozoo_${item.id}` }),
}))
jest.mock("../../ui_utilities", () => ({ showGlobalProgressModal: jest.fn() }))

import { ControlRegistry } from "../../controls/controlregistry"
import { createControlContext } from "../../retro/retromenucontext"
import { createRetroDemoZooControl } from "./demozoo_retro"

const productions = Array.from({ length: 51 }, (_, index) => ({
  id: index + 1,
  title: index === 50 ? "Wizard Demo" : `Production ${index + 1}`,
  author: index === 50 ? "Merlin" : "Author",
  type: "Demo",
  screenshotUrl: "",
  demozooUrl: `https://demozoo.org/productions/${index + 1}/`,
}))

describe("retro DemoZoo screen", () => {
  test("filters productions, pages results, favorites, and loads a selection", async () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    const control = createRetroDemoZooControl(2)
    control.parentId = null
    const registry = new ControlRegistry([control])
    const screen = registry.resolve(context)[0]
    const children = screen.children as (items?: never[]) => ReturnType<typeof registry.resolve>
    let items = children()

    expect(screen.submenuTitle).toBe("DemoZoo")
    expect(screen.actionLabel).toBe("Search")
    expect(items.map(item => item.label)).toEqual(["Type", "Title"])

    mockLoadDemoZooSnapshot.mockResolvedValueOnce(productions)
    await items[0].action?.()
    items = children(items as never[])
    expect(items).toHaveLength(53)

    items = await items.at(-1)?.loadMoreOnNavigatePastEnd?.() ?? []
    expect(items.at(-1)?.label).toBe("Wizard Demo")
    items = items[1].onTextInput?.("wizard") ?? []
    expect(items.map(item => item.label)).toEqual(["Type", "Title", "Results", "Wizard Demo"])

    let favorite = false
    context.diskBookmarks = {
      contains: jest.fn(() => favorite),
      set: jest.fn(() => { favorite = true }),
      remove: jest.fn(() => { favorite = false }),
    } as never
    items = children(items as never[])
    items = items.at(-1)?.onHorizontalInput?.(1) ?? []
    expect(context.diskBookmarks.set).toHaveBeenCalledWith(expect.objectContaining({
      id: "demozoo_51",
      title: "Wizard Demo",
      type: 2,
    }))
    expect(items.at(-1)?.indicator).toBe("*")

    mockLoadDemoZooResult.mockResolvedValueOnce(true)
    await items.at(-1)?.action?.()
    expect(mockLoadDemoZooResult).toHaveBeenCalledWith(expect.objectContaining({ id: 51 }), 2)
    expect(context.close).toHaveBeenCalled()
  })
})