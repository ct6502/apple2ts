import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Space Quarks", () => testDiskImage("Space Quarks.woz", 0x4B09, 3900000, 3950000))
