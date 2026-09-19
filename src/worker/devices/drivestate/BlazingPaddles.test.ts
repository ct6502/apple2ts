import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("BlazingPaddles", () => testDiskImage("BlazingPaddles.woz", 0xB4BD, 5900000, 6100000))
