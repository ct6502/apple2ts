const mockSearchInternetArchive = jest.fn()
const mockLoadInternetArchiveResult = jest.fn()
const mockCreateInternetArchiveCloudData = jest.fn(result => ({ itemId: result.identifier }))

jest.mock("../../diskdialog/diskpanel_utils", () => ({
  DISK_COLLECTION_ITEM_TYPE: { INTERNET_ARCHIVE: 1 },
}))
jest.mock("./internetarchive_utils", () => ({
  generateUrlFromInternetArchiveId: (identifier: string) => new URL(`https://archive.org/${identifier}`),
}))

jest.mock("./internetarchive", () => ({
  internetArchiveCollections: [
    { id: "collection-one", title: "Apple II Library: Collection One", imageUrl: "one.jpg" },
    { id: "collection-two", title: "Collection Two", imageUrl: "two.jpg" },
  ],
  searchInternetArchive: (...args: unknown[]) => mockSearchInternetArchive(...args),
  loadInternetArchiveResult: (...args: unknown[]) => mockLoadInternetArchiveResult(...args),
  createInternetArchiveCloudData: (result: { identifier: string }) => mockCreateInternetArchiveCloudData(result),
}))
jest.mock("../../ui_utilities", () => ({ showGlobalProgressModal: jest.fn() }))

import { createControlContext } from "../../retro/retromenucontext"
import { ControlRegistry } from "../../controls/controlregistry"
import { createRetroInternetArchiveControl } from "./internetarchive_retro"

describe("retro Internet Archive screen", () => {
  beforeEach(() => {
    mockSearchInternetArchive.mockReset()
    mockLoadInternetArchiveResult.mockReset()
  })

  test("searches typed titles, appends pages, and launches a selected result", async () => {
    const context = createControlContext(undefined, key => key, "en", () => undefined)
    context.close = jest.fn()
    const control = createRetroInternetArchiveControl(2)
    control.parentId = null
    const registry = new ControlRegistry([control])
    const screen = registry.resolve(context)[0]
    const children = screen.children as (items?: never[]) => ReturnType<typeof registry.resolve>
    let items = children()

    expect(screen.submenuTitle).toBe("Internet Archive")
    expect(screen.actionLabel).toBe("Search")
    expect(items.map(item => item.label)).toEqual(["Collection", "Title"])
    expect(items[0].options?.map(option => option.label)).toEqual(["Collection One", "Collection Two"])
    expect(items[1]).toMatchObject({ textInput: true, textValue: "" })

    mockSearchInternetArchive.mockResolvedValueOnce({ results: [], total: 0 })
    await items[0].action?.()
    expect(mockSearchInternetArchive).toHaveBeenCalledWith("", "collection-one", 1)

    items = items[1].onTextInput?.("wizard") ?? []
    mockSearchInternetArchive.mockResolvedValueOnce({
      results: [{ identifier: "one", title: "Wizard One" }],
      total: 2,
    })
    await items[1].action?.()
    items = children(items as never[])

    expect(mockSearchInternetArchive).toHaveBeenCalledWith("wizard", "collection-one", 1)
    expect(items.map(item => item.label)).toEqual(["Collection", "Title", "Results", "Wizard One"])
    expect(items.at(-1)?.contextualActionLabel).toBe("Load")

    let favorite = false
    const setFavorite = jest.fn(() => { favorite = true })
    const removeFavorite = jest.fn(() => { favorite = false })
    context.diskBookmarks = {
      contains: jest.fn(() => favorite),
      set: setFavorite,
      remove: removeFavorite,
    } as never
    items = children(items as never[])
    items = items.at(-1)?.onHorizontalInput?.(1) ?? []
    expect(setFavorite).toHaveBeenCalledWith(expect.objectContaining({
      id: "one",
      title: "Wizard One",
      type: 1,
    }))
    expect(items.at(-1)?.indicator).toBe("*")
    items = items.at(-1)?.onHorizontalInput?.(-1) ?? []
    expect(removeFavorite).toHaveBeenCalledWith("one")
    expect(items.at(-1)?.indicator).toBeUndefined()

    mockSearchInternetArchive.mockResolvedValueOnce({
      results: [{ identifier: "two", title: "Wizard Two" }],
      total: 2,
    })
    items = await items.at(-1)?.loadMoreOnNavigatePastEnd?.() ?? []
    expect(mockSearchInternetArchive).toHaveBeenLastCalledWith("wizard", "collection-one", 2)
    expect(items.at(-1)?.label).toBe("Wizard Two")

    mockLoadInternetArchiveResult.mockResolvedValue(true)
    await items.at(-1)?.action?.()
    expect(mockLoadInternetArchiveResult).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: "two" }),
      2,
    )
    expect(context.close).toHaveBeenCalled()
  })
})
