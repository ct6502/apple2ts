import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Glutton", () => testDiskImage("Glutton.woz", 0x4375, 33900000, 35100000))
