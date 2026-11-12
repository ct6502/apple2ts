import { doSetEmuDriveNewData, getHardDriveData } from "./drivestate"
import { processInstruction } from "../cpu6502"
import { isCarry, setPC, s6502 } from "../instructions"
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

// Drive a SmartPort call through the generated $C7C3 slot firmware and return
// the final PC. The stack frame mimics a caller's JSR: it stores the address
// the caller will resume at minus one. The slot firmware must consume the
// inline parameter bytes below that saved address before RTS.
const callSmartPortDriver = (extended: boolean) => {
  memorySetForTests()
  mountTestDrive()
  const inlineStart = 0x0F55
  const savedAddr = inlineStart - 1
  s6502.StackPtr = 0xEE  // stack frame at $1EE: scratch; $1EF/$1F0 saved address
  memSet(0x1EF, savedAddr & 0xFF)
  memSet(0x1F0, savedAddr >>> 8)
  // Inline command byte + parameter pointer. Standard is command + 2 bytes,
  // extended is command + 4 bytes.
  memSet(inlineStart, extended ? 0x41 : 0x01)
  memSet(inlineStart + 1, 0x70)
  memSet(inlineStart + 2, 0x0F)
  if (extended) {
    memSet(inlineStart + 3, 0)
    memSet(inlineStart + 4, 0)
  }
  // Parameter list: count, unit, buffer, block (extended uses 32-bit fields).
  memSet(0x0F70, 3)
  memSet(0x0F71, 1)
  memSet(0x0F72, 0x00)
  memSet(0x0F73, 0x1D)
  if (extended) {
    memSet(0x0F74, 0)
    memSet(0x0F75, 0)
    memSet(0x0F76, 3)
    memSet(0x0F77, 0)
    memSet(0x0F78, 0)
    memSet(0x0F79, 0)
  } else {
    memSet(0x0F74, 3)
    memSet(0x0F75, 0)
    memSet(0x0F76, 0)
  }
  const expectedPC = inlineStart + (extended ? 5 : 3)
  setPC(0xC7C3)
  for (let i = 0; i < 80 && s6502.PC !== expectedPC; i++) {
    processInstruction()
  }
  return {
    pc: s6502.PC,
    scratch: memGet(0x1EE),
    buffer: readAsCPU(0x1D00),
  }
}

test("standard SmartPort inline call returns after 3 bytes", () => {
  const { pc, scratch, buffer } = callSmartPortDriver(false)
  expect(pc).toBe(0x0F58)  // $0F55 + 3
  expect(scratch).toBe(3)   // stack scratch tells the firmware to skip 3 bytes
  expect(isCarry()).toBe(false)
  expect(buffer).toEqual(blockPattern(3))
})

test("extended SmartPort inline call returns after 5 bytes", () => {
  const { pc, scratch, buffer } = callSmartPortDriver(true)
  expect(pc).toBe(0x0F5A)  // $0F55 + 5
  expect(scratch).toBe(5)   // stack scratch tells the firmware to skip 5 bytes
  expect(isCarry()).toBe(false)
  expect(buffer).toEqual(blockPattern(3))
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
