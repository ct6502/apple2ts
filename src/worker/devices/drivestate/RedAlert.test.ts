import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Red Alert", () => testDiskImage("Red Alert.woz", 0x62C6, 3900000, 3950000))
