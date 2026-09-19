import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Algernon", () => testDiskImage("Algernon.woz", 0xE76F, 25000000, 26000000))
