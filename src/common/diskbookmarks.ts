const storageKeyPrefix = "dbm-"

export type DiskBookmark = {
  id: string,
  title: string,
  screenshotUrl: URL,
  diskUrl: URL,
  detailsUrl: URL,
  lastUpdated: Date
}

export class DiskBookmarks {
  private bookmarks: Map<string, DiskBookmark>

  public constructor() {
    this.bookmarks = new Map<string, DiskBookmark>()
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
      yield item;
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
    } catch (error) {
      console.warn(error)
    }
  }

  public remove(bookmarkId: string) {
    try {
      this.bookmarks.delete(bookmarkId)
      localStorage.removeItem(storageKeyPrefix + bookmarkId)
    } catch (error) {
      console.warn(error)
    }
  }
}