import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("BalanceOfPower", () => testDiskImage("BalanceOfPower.woz", 0x5928, 33900000, 35000000))
