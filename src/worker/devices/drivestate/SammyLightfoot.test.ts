import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("SammyLightfoot", () => testDiskImage("SammyLightfoot.woz", 0x785F, 11600000, 11800000))
