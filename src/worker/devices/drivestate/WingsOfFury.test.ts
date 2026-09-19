import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("WingsOfFury", () => testDiskImage("WingsOfFuryA.woz", 0x40B9, 17000000, 17500000))
