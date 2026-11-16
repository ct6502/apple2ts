import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, memGet24 } from "./memory"
import { MouseCardEvent } from "./devices/mouse"
import { doSetEmuDriveNewData, getDriveDataByIndex, getDriveStateByIndex } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const DISK_DIR = process.env.GS_EXC_DIR || "C:\\dev\\emu\\ap2\\DISKS"
const diskPath = (n: number) => `${DISK_DIR}\\Spirit of Excalibur Dk${n}.2mg`
const testWithDisks = [1, 2, 3].every((n) => fs.existsSync(diskPath(n))) ? test : test.skip

const shrStats = () => {
  const shr = getShr()
  let nz = 0
  let h = 0
  for (let i = 0; i < shr.length; i++) {
    if (shr[i]) nz++
    if ((i & 7) === 0) h = (h * 31 + shr[i]) | 0
  }
  return { nz, h }
}

const mount = (index: number, n: number) => doSetEmuDriveNewData({
  index, hardDrive: index <= 1, drive: 1,
  filename: `Spirit of Excalibur Dk${n}.2mg`, status: "",
  motorRunning: false, diskHasChanges: false, isWriteProtected: false,
  diskData: new Uint8Array(fs.readFileSync(diskPath(n))), lastAppleWriteTime: 0,
  cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
} as DriveProps)

const runFrames = (n: number) => {
  for (let f = 0; f < n; f++) jest.advanceTimersByTime(17)
}

const getGameMousePos = () => {
  // The loader relocates the cursor globals; read their addresses from the live STA operands.
  const pointer = (operand: number) => memGet24(operand) | (memGet24(operand + 1) << 8) | (memGet24(operand + 2) << 16)
  const word = (address: number) => memGet24(address) | (memGet24(address + 1) << 8)
  return { x: word(pointer(0x068a2e)), y: word(pointer(0x0689ef)) }
}

const pressSpace = () => {
  setKeyboardState({ key: 0x20, isDown: true, repeat: false, domCode: "Space" })
  setKeyboardState({ key: 0x20, isDown: false, repeat: false, domCode: "Space" })
}

describe("Spirit of Excalibur disk swaps on the IIgs", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
    // A leftover slot-7 volume would take boot priority over the slot-5 case.
    for (let i = 0; i < 6; i++) {
      doSetEmuDriveNewData({
        index: i, hardDrive: i <= 1, drive: (i % 2) + 1, filename: "", status: "",
        motorRunning: false, diskHasChanges: false, isWriteProtected: false,
        diskData: new Uint8Array(), lastAppleWriteTime: 0, cloudData: null,
        writableFileHandle: null, lastLocalFileWriteTime: 0,
      } as DriveProps)
    }
  })
  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test.each([
    { bay: "S7,D1", index: 0 },
    { bay: "S5,D1", index: 4 },
  ])("remounting dirty standby media in $bay preserves its unsaved state", ({ index }) => {
    doSetMachineName("APPLE2GS")
    const diskData = new Uint8Array(800 * 1024).fill(0x7e)
    expect(doSetEmuDriveNewData({
      index, hardDrive: index <= 1, drive: 1, filename: "Modified.po", status: "",
      motorRunning: false, diskHasChanges: true, isWriteProtected: false,
      diskData, lastAppleWriteTime: 1234, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: -1,
    } as DriveProps, true)).toBe(true)
    expect(getDriveStateByIndex(index)).toEqual(expect.objectContaining({
      diskHasChanges: true,
      lastAppleWriteTime: 1234,
    }))
    expect(getDriveDataByIndex(index)).toEqual(diskData)
  })

  testWithDisks.each([
    { bay: "S7,D1", index: 0 },
    { bay: "S5,D1", index: 4 },
  ])("swaps in $bay reach the menu and captured mouse bursts reach the upper-left", ({ index }) => {
    doSetMachineName("APPLE2GS")
    expect(mount(index, 1)).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    // The credits must finish before the guest can accept disk 3.
    runFrames(6000)
    const credits = shrStats()
    expect(credits.nz).toBeGreaterThan(20000)
    const parkedStatus = getDriveStateByIndex(index).status

    expect(mount(index, 3)).toBe(true)
    runFrames(4000)
    const afterSwap = shrStats()
    // Both disk prompts have the same byte count; only reaching the final menu proves the swaps.
    expect(afterSwap.nz).toBeLessThan(10000)
    expect(afterSwap.h).not.toBe(credits.h)
    expect(getDriveStateByIndex(index).status).not.toBe(parkedStatus)

    for (const n of [2, 3]) {
      expect(mount(index, n)).toBe(true)
      pressSpace()
      runFrames(3000)
    }
    const menu = shrStats()
    expect(menu.nz).toBeGreaterThan(20000)
    expect(menu.h).not.toBe(afterSwap.h)
    MouseCardEvent({ x: 2, y: 2, buttons: -1, relative: true })
    runFrames(120)
    expect(getGameMousePos()).toEqual({ x: 319, y: 199 })

    // The game's decoder treats -1 as zero; overwriting a burst with its last event strands the cursor.
    for (let f = 0; f < 120; f++) {
      for (let event = 0; event < 8; event++) {
        MouseCardEvent({ x: -1 / 319, y: -1 / 199, buttons: -1, relative: true })
      }
      runFrames(1)
    }
    runFrames(60)
    expect(getGameMousePos()).toEqual({ x: 0, y: 0 })
  }, 900000)
})
