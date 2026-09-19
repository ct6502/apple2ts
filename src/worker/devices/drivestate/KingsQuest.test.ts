import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("KingsQuest", () => testDiskImage("KingsQuestA.woz", 0x4F2E, 40000000, 41000000))
