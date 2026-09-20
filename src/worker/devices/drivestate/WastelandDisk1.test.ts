import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("WastelandDisk1", () => testDiskImage("WastelandDisk1.woz", 0x42FB, 12000000, 13000000))
