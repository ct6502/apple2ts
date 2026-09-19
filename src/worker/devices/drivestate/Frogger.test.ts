import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Frogger", () => testDiskImage("Frogger.woz", 0x9C4E, 5900000, 6100000))
