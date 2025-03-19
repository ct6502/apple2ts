const storageKeyPrefix = "dbm-"

export type DiskBookmark = {
  title: string,
  screenshotUrl: URL,
  diskUrl: URL
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
    let found = false

   Array.from(this.bookmarks.keys()).forEach(key => {
      if (key == id) {
        found = true
        return
      }
    })

    return found
  }

  public add(id: string, bookmark: DiskBookmark) {
    try {
      localStorage.setItem(storageKeyPrefix + id, JSON.stringify(bookmark))
      this.bookmarks.set(id, bookmark)
    } catch (error) {
      console.warn(error)
    }
  }

  public remove(id: string) {
    try {
      this.bookmarks.delete(id)
      localStorage.removeItem(storageKeyPrefix + id)
    } catch (error) {
      console.warn(error)
    }
  }
}