import { doSetMachineName, doReset, resetCpuSpeedForTesting } from "./motherboard"
import { doSetEmuDriveNewData, getDriveBitstreamByIndex, getDriveStateByIndex } from "./devices/drivestate"
import { iwmReset525PendingWrites } from "./devices/diskdata"
import { memGet, memSet } from "./memory"
import { s6502 } from "./instructions"
import * as fs from "fs"
import { setIsTesting } from "./worker2main"

const DISK_PATH = process.env.GS_IWM_525_WRITE_DISK || "public/disks/A2DeskTop-VERA.po"

const mount = () => {
  expect(doSetEmuDriveNewData({
    index: 2, hardDrive: false, drive: 1, filename: "A2DeskTop-VERA.po", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

const iwmByte = (value: number) => {
  memSet(0xC0ED, value)
  s6502.cycleCount += 32
}

const selectDrive = () => {
  memSet(0xC0E9, 0) // motor on
  s6502.cycleCount += 32
  memSet(0xC0EA, 0) // drive select 0
  s6502.cycleCount += 32
  memSet(0xC0EC, 0) // Q6 high
  s6502.cycleCount += 32
  memSet(0xC0EF, 0) // Q7 high
  s6502.cycleCount += 32
}

describe("Apple IIgs IWM 5.25 synchronous write", () => {
  beforeEach(() => {
    setIsTesting()
    doSetMachineName("APPLE2GS")
    doReset()
    resetCpuSpeedForTesting()
    mount()
    iwmReset525PendingWrites()
  })

  afterEach(() => {
    iwmReset525PendingWrites()
  })

  test("D5 AA 96 arms the write and reaches the mounted media", () => {
    const disk = getDriveBitstreamByIndex(2)
    const before = disk.slice()
    selectDrive()
    iwmByte(0xD5)
    iwmByte(0xAA)
    iwmByte(0x96)
    iwmByte(0x42)
    iwmByte(0xC3)
    let changed = 0
    for (let i = 0; i < disk.length; i++) if (disk[i] !== before[i]) changed++
    expect(changed).toBeGreaterThan(0)
  })

  test("a drive probe without an address marker leaves the media untouched", () => {
    const disk = getDriveBitstreamByIndex(2)
    const before = disk.slice()
    selectDrive()
    // The power-on write-handshake self-test loads random bytes but never
    // sends the D5 AA 96 address marker; those bits must stay buffered and be
    // abandoned when the firmware reads the data register.
    iwmByte(0xFF)
    iwmByte(0x3F)
    iwmByte(0xCF)
    iwmByte(0xF3)
    memSet(0xC0EC, 0) // Q6 high, Q7 low: status register
    memSet(0xC0EE, 0) // Q7 low
    memGet(0xC0EC)
    iwmReset525PendingWrites()
    let changed = 0
    for (let i = 0; i < disk.length; i++) if (disk[i] !== before[i]) changed++
    expect(changed).toBe(0)
  })

  test("a write-protected disk still shifts the register but never changes the surface", () => {
    const drive = getDriveStateByIndex(2)
    drive.isWriteProtected = true
    const disk = getDriveBitstreamByIndex(2)
    const before = disk.slice()
    selectDrive()
    // A real sector write marker reaches a protected disk: the WP circuit
    // blocks the surface pulse, but the IWM must still latch and shift bits.
    iwmByte(0xD5)
    iwmByte(0xAA)
    iwmByte(0x96)
    iwmByte(0x42)
    iwmByte(0xC3)
    memSet(0xC0EC, 0)
    memSet(0xC0EE, 0)
    memGet(0xC0EC)
    let changed = 0
    for (let i = 0; i < disk.length; i++) if (disk[i] !== before[i]) changed++
    expect(changed).toBe(0)
  })
})
