import { doSetEmuDriveNewData, getHardDriveData } from "./drivestate"
import { processInstruction } from "../cpu6502"
import { isCarry, setPC } from "../instructions"
import { memGet, memorySetForTests, memSet } from "../memory"
import { setIsTesting } from "../worker2main"

const nblocks = 32  // images of 10000 bytes or less are rejected
const blockPattern = (block: number) =>
  Uint8Array.from({length: 512}, (_, i) => (block * 37 + i + (i >> 8) * 91) & 0xFF)

const mountTestDrive = () => {
  const diskData = new Uint8Array(512 * nblocks)
  for (let block = 0; block < nblocks; block++) {
    diskData.set(blockPattern(block), 512 * block)
  }
  const props: DriveProps = {
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: "blocks.hdv",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }
  expect(doSetEmuDriveNewData(props)).toBe(true)
}

// Call the slot 7 ProDOS block driver the same way ProDOS (or ProRWTS) does.
const callBlockDriver = (command: number, block: number, buffer: number) => {
  memSet(0x42, command)
  memSet(0x43, 0x70)  // slot 7, drive 1
  memSet(0x44, buffer & 0xFF)
  memSet(0x45, buffer >>> 8)
  memSet(0x46, block & 0xFF)
  memSet(0x47, block >>> 8)
  setPC(0xC7C0)
  processInstruction()
}

const readAsCPU = (addr: number, length = 512) =>
  Uint8Array.from({length}, (_, i) => memGet((addr + i) & 0xFFFF, false))

beforeAll(() => {
  setIsTesting()
})

afterEach(() => {
  memGet(0xC082)  // ROM, bank-switched RAM write protected
})

test("hard drive block read into $DF00 in bank 1 continues at $E000", () => {
  memorySetForTests()
  mountTestDrive()
  memGet(0xC083)
  memGet(0xC083)  // read/write RAM, bank 2
  for (let i = 0; i < 256; i++) memSet(0xD000 + i, 0xA5)
  memGet(0xC08B)
  memGet(0xC08B)  // read/write RAM, bank 1
  callBlockDriver(1, 3, 0xDF00)
  expect(isCarry()).toBe(false)
  expect(readAsCPU(0xDF00)).toEqual(blockPattern(3))
  memGet(0xC083)  // bank 2 must be untouched
  expect(readAsCPU(0xD000, 256)).toEqual(new Uint8Array(256).fill(0xA5))
})

test("hard drive block write from $DF00 in bank 1 saves what the CPU sees", () => {
  memorySetForTests()
  mountTestDrive()
  memGet(0xC08B)
  memGet(0xC08B)  // read/write RAM, bank 1
  const data = blockPattern(99)
  for (let i = 0; i < 512; i++) memSet(0xDF00 + i, data[i])
  callBlockDriver(2, 5, 0xDF00)
  expect(isCarry()).toBe(false)
  const [diskData, offset] = getHardDriveData(1)
  expect(diskData.slice(offset + 512 * 5, offset + 512 * 6)).toEqual(data)
  // Neighboring blocks are unchanged.
  expect(diskData.slice(offset + 512 * 4, offset + 512 * 5)).toEqual(blockPattern(4))
  expect(diskData.slice(offset + 512 * 6, offset + 512 * 7)).toEqual(blockPattern(6))
})

test("hard drive block read into $BF00 leaves bank-switched RAM alone", () => {
  memorySetForTests()
  mountTestDrive()
  memGet(0xC08B)
  memGet(0xC08B)  // read/write RAM, bank 1
  for (let i = 0; i < 256; i++) memSet(0xD000 + i, 0xA5)
  callBlockDriver(1, 7, 0xBF00)
  expect(isCarry()).toBe(false)
  expect(readAsCPU(0xBF00, 256)).toEqual(blockPattern(7).slice(0, 256))
  expect(readAsCPU(0xD000, 256)).toEqual(new Uint8Array(256).fill(0xA5))
})
