import { DISK_COLLECTION_ITEM_TYPE } from "../../diskdialog/diskpanel_utils"

const storageKeyPrefix = "dbm-"
export const DISK_BOOKMARKS_CHANGED_EVENT = "apple2ts-disk-bookmarks-changed"

export type DiskBookmark = {
  type: DISK_COLLECTION_ITEM_TYPE,
  id: string,
  title: string,
  screenshotUrl: URL,
  diskUrl?: string,
  detailsUrl?: URL,
  lastUpdated: Date,
  cloudData?: CloudData,
  vtocType?: VtocType
  vtocVersion?: number
}

export class DiskBookmarks {
  private bookmarks = new Map<string, DiskBookmark>()

  public constructor() {
    this.reload()
  }

  public reload() {
    this.bookmarks.clear()
    Object.keys(localStorage).forEach((storageKey) => {
      if (storageKey.startsWith(storageKeyPrefix)) {
        const storageValue = localStorage.getItem(storageKey)

        if (storageValue) {
          const bookmark = JSON.parse(storageValue)
          this.bookmarks.set(storageKey.substring(storageKeyPrefix.length), bookmark)
        } else {
          localStorage.removeItem(storageKey)
        }
      }
    })
  }

  *[Symbol.iterator](): Generator<DiskBookmark> {
    for (const item of this.bookmarks.values()) {
      yield item
    }
  }

  public contains(id: string): boolean {
    return this.bookmarks.has(id)
  }

  public get(id: string): DiskBookmark | undefined {
    for (const bookmark of this.bookmarks.values()) {
      if (bookmark.id == id) {
        return bookmark
      }
    }

    return undefined
  }

  public set(bookmark: DiskBookmark) {
    try {
      localStorage.setItem(storageKeyPrefix + bookmark.id, JSON.stringify(bookmark))
      this.bookmarks.set(bookmark.id, bookmark)
      window.dispatchEvent(new Event(DISK_BOOKMARKS_CHANGED_EVENT))
    } catch (error) {
      console.warn(error)
    }
  }

  public remove(bookmarkId: string) {
    try {
      this.bookmarks.delete(bookmarkId)
      localStorage.removeItem(storageKeyPrefix + bookmarkId)
      window.dispatchEvent(new Event(DISK_BOOKMARKS_CHANGED_EVENT))
    } catch (error) {
      console.warn(error)
    }
  }
}