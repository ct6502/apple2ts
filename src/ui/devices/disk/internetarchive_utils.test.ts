import {
  resolveIaDiskFilesFromDetails,
  getDiskImageUrlFromIdentifier,
  clearIaResolveCache,
} from "./internetarchive_utils"

describe("Internet Archive utils - smart disk resolution", () => {
  test("woz-a-day collection selects primary zip ignoring 00playable and extras", () => {
    const json = {
      metadata: { emulator_ext: "woz" },
      files: {
        "/00playable.woz": { size: "121621" },
        "/00playable_screenshot.png": { size: "212688" },
        "/Ultima III (woz-a-day collection).zip": { size: "111472" },
        "/Ultima III extras (woz-a-day collection).zip": { size: "11565916" },
        "/history/files/Ultima III (woz-a-day collection).zip.~1~": { size: "111470" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("wozaday_Ultima_III_Exodus", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/wozaday_Ultima_III_Exodus/Ultima%20III%20(woz-a-day%20collection).zip"
    )
    expect(resolved.fileSize).toBe(111472)
    expect(resolved.allUrls).toHaveLength(1)
  })

  test("show all with multiple direct disk files returns all disks sorted naturally", () => {
    const json = {
      metadata: {},
      files: {
        "/SpaceQuest_Disk_2.dsk": { size: "143360" },
        "/SpaceQuest_Disk_1.dsk": { size: "143360" },
        "/SpaceQuest_Disk_3.dsk": { size: "143360" },
        "/screenshot.png": { size: "2345" },
        "/meta.xml": { size: "123" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("space_quest_collection", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/space_quest_collection/SpaceQuest_Disk_1.dsk"
    )
    expect(resolved.fileSize).toBe(143360)
    expect(resolved.allUrls?.map(u => u.toString())).toEqual([
      "https://archive.org/download/space_quest_collection/SpaceQuest_Disk_1.dsk",
      "https://archive.org/download/space_quest_collection/SpaceQuest_Disk_2.dsk",
      "https://archive.org/download/space_quest_collection/SpaceQuest_Disk_3.dsk",
    ])
  })

  test("show all with single direct disk file returns single disk", () => {
    const json = {
      files: {
        "/0495_Kings_Quest_IV_Disk_1.po": { size: "819200" },
        "/0495_Kings_Quest_IV_Disk_1_screenshot.gif": { size: "35371" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("e2gs_0495_Kings_Quest_IV_Disk_1", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/e2gs_0495_Kings_Quest_IV_Disk_1/0495_Kings_Quest_IV_Disk_1.po"
    )
    expect(resolved.fileSize).toBe(819200)
    expect(resolved.allUrls).toHaveLength(1)
  })

  test("4am crack collection selects primary zip ignoring 00playable and extras", () => {
    const json = {
      metadata: { emulator_ext: "dsk" },
      files: {
        "/00playable.dsk": { size: "143360" },
        "/Apple II Test Disk (4am crack) extras.zip": { size: "27040309" },
        "/Apple II Test Disk (4am crack).zip": { size: "32118" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("AppleIITestDisk4amCrack", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/AppleIITestDisk4amCrack/Apple%20II%20Test%20Disk%20(4am%20crack).zip"
    )
    expect(resolved.fileSize).toBe(32118)
    expect(resolved.allUrls).toHaveLength(1)
  })

  test("fallback to 00playable when no direct disks and no zip exist", () => {
    const json = {
      metadata: { emulator_ext: "woz" },
      files: {
        "/00playable.woz": { size: "12345" },
        "/00playable_screenshot.png": { size: "5432" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("legacy_item", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/legacy_item/00playable.woz"
    )
    expect(resolved.fileSize).toBe(12345)
    expect(resolved.allUrls).toHaveLength(1)
  })

  test("getDiskImageUrlFromIdentifier fetches and caches multi-disk resolution", async () => {
    clearIaResolveCache("multi_item")
    const mockJson = {
      metadata: {},
      files: {
        "/DiskA.woz": { size: "100" },
        "/DiskB.woz": { size: "200" },
      },
    }
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockJson,
    } as Response)
    Object.defineProperty(globalThis, "fetch", { configurable: true, value: fetchMock })

    const [resolvedUrl, fileSize, allUrls] = await getDiskImageUrlFromIdentifier("multi_item")
    expect(resolvedUrl?.toString()).toBe("https://archive.org/download/multi_item/DiskA.woz")
    expect(fileSize).toBe(100)
    expect(allUrls?.map(u => u.toString())).toEqual([
      "https://archive.org/download/multi_item/DiskA.woz",
      "https://archive.org/download/multi_item/DiskB.woz",
    ])

    // Second call should hit the cache without another fetch
    fetchMock.mockClear()
    const [cachedUrl, cachedSize, cachedAll] = await getDiskImageUrlFromIdentifier("multi_item")
    expect(cachedUrl?.toString()).toBe("https://archive.org/download/multi_item/DiskA.woz")
    expect(cachedSize).toBe(100)
    expect(cachedAll?.map(u => u.toString())).toEqual([
      "https://archive.org/download/multi_item/DiskA.woz",
      "https://archive.org/download/multi_item/DiskB.woz",
    ])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  test("ignores .nib files and chooses available .dsk or .woz instead", () => {
    const json = {
      files: {
        "/King_Quest_III_Disk_1.nib": { size: "232960" },
        "/King_Quest_III_Disk_1.dsk": { size: "143360" },
        "/King_Quest_III_Disk_2.dsk": { size: "143360" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("kq3", json)
    expect(resolved.primaryUrl?.toString()).toBe(
      "https://archive.org/download/kq3/King_Quest_III_Disk_1.dsk"
    )
    expect(resolved.allUrls?.map(u => u.toString())).toEqual([
      "https://archive.org/download/kq3/King_Quest_III_Disk_1.dsk",
      "https://archive.org/download/kq3/King_Quest_III_Disk_2.dsk",
    ])
  })

  test("returns not found when only .nib files exist", () => {
    const json = {
      files: {
        "/King_Quest_III_Disk_1.nib": { size: "232960" },
      },
    }

    const resolved = resolveIaDiskFilesFromDetails("kq3_nib_only", json)
    expect(resolved.primaryUrl).toBeUndefined()
    expect(resolved.fileSize).toBe(-1)
  })
})
