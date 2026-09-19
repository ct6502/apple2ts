import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("StickybearTown", () => testDiskImage("StickybearTown.woz", 0x9F68, 27000000, 28000000))
