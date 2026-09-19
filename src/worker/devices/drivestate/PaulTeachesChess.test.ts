import { testDiskImage } from "./testDiskImage"

jest.setTimeout(60000)

test("PaulTeachesChess", () => testDiskImage("Paul Whitehead Teaches Chess.woz", 0xD285, 10000000, 11000000))
