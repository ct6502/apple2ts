import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("Miner2049er", () => testDiskImage("Miner2049er.woz", 0x0CB0, 19900000, 22000000))
