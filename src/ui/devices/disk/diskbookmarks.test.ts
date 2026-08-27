jest.mock("../../diskdialog/diskpanel_utils", () => ({
  DISK_COLLECTION_ITEM_TYPE: { INTERNET_ARCHIVE: 1 },
}))

import { DISK_BOOKMARKS_CHANGED_EVENT, DiskBookmarks } from "./diskbookmarks"
import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"

describe("DiskBookmarks", () => {
  const bookmarkId = "bookmark-event-test"

  afterEach(() => {
    localStorage.removeItem(`dbm-${bookmarkId}`)
  })

  test("notifies listeners and can reload changes from storage", () => {
    const bookmarks = new DiskBookmarks()
    const handleChanged = jest.fn()
    window.addEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleChanged)

    bookmarks.set({
      type: DISK_COLLECTION_ITEM_TYPE.INTERNET_ARCHIVE,
      id: bookmarkId,
      title: "Bookmark Event Test",
      screenshotUrl: new URL("https://archive.org/image"),
      lastUpdated: new Date(),
    })
    expect(handleChanged).toHaveBeenCalledTimes(1)

    const reloaded = new DiskBookmarks()
    expect(reloaded.contains(bookmarkId)).toBe(true)

    bookmarks.remove(bookmarkId)
    expect(handleChanged).toHaveBeenCalledTimes(2)
    window.removeEventListener(DISK_BOOKMARKS_CHANGED_EVENT, handleChanged)
  })
})
