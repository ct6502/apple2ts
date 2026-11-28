import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Genetic Drift", () => testDiskImage("Genetic Drift.woz", 0x6509, 5100000, 5300000))
