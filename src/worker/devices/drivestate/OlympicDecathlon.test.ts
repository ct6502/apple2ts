import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("OlympicDecathlon", () => testDiskImage("Olympic Decathlon.woz", 0x1A13, 8700000, 9100000))
