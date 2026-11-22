import { testWithFixtures } from "../test/fixture_test"
import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr } from "./memory"
import { doSetEmuDriveNewData, getDriveStateByIndex } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// GS/OS on the built-in slot-5 3.5" drive (index 4) while the *other* slot-5
// bay (index 5) gets media. The IWM has one LSS, one shift register and one
// async write state for both bays, so a media change used to clear that shared
// state - and with it the spindle latch and the ready bit of every 3.5" drive.
// The booting bay then sat at "not ready" forever: the guest keeps polling sense
// 0xD and never issues another motor-on, so drive 1 stopped for good the moment
// a disk was put into drive 2. Only the bay whose media moved may be disturbed.
const BOOT_PATH = process.env.GS_FLOPPY35_CROSSBAY_BOOT || "C:\\dev\\emu\\ap2\\SystemDisk.2mg"
const OTHER_PATH = process.env.GS_FLOPPY35_CROSSBAY_OTHER || "C:\\dev\\emu\\ap2\\mcs.2mg"
const FRAMES = Number(process.env.GS_FLOPPY35_CROSSBAY_FRAMES || 4200)
const MOUNT_AT = 400
const SHR_SCB_OFFSET = 0x7D00

const mount = (index: number, drive: number, path: string, data?: Uint8Array) => {
  const bytes = data ?? new Uint8Array(fs.readFileSync(path))
  expect(doSetEmuDriveNewData({
    index, hardDrive: false, drive, filename: path.split("\\").pop() ?? "disk", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: true,
    diskData: bytes, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
}

const shrNonZero = () => {
  let nz = 0
  const shr = getShr()
  for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) nz++
  return nz
}

const boot = (preloadOther: boolean) => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  mount(4, 1, BOOT_PATH)
  if (preloadOther) mount(5, 2, OTHER_PATH)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
}

const finish = () => {
  doSetRunMode(RUN_MODE.PAUSED, false)
  resetCpuSpeedForTesting()
  jest.useRealTimers()
}

// The drive being read has to keep its mechanism: /ENBL asserted, the Sony
// spindle latch on and the ready latch still up.
const expectDrive1Running = () => {
  const ds = getDriveStateByIndex(4)
  expect(ds.enable35).toBe(true)
  expect(ds.spindleOn).toBe(true)
  expect(ds.diskReady).toBe(true)
}

// GS/OS fills the desktop's palette rows once it takes over from the boot
// splash, which is the difference a stalled boot never reaches.
const expectDesktop = () => {
  const shr = getShr()
  const scbs = new Set<number>()
  for (let y = 0; y < 200; y++) scbs.add(shr[SHR_SCB_OFFSET + y])
  expect(scbs.size).toBeGreaterThanOrEqual(5)
  expect(shrNonZero()).toBeGreaterThan(20000)
}

testWithFixtures(BOOT_PATH, OTHER_PATH)("a media change in the idle slot-5 bay leaves a booting bay alone", () => {
  try {
    boot(true)
    // The idle bay already holds media, so this is a *media change* - the path
    // that used to reset the shared data path and both bays' mechanism.
    const swap = new Uint8Array(fs.readFileSync(OTHER_PATH))
    let sawRead = false
    for (let f = 0; f < FRAMES; f++) {
      jest.advanceTimersByTime(17)
      if (f === MOUNT_AT) {
        const ds1 = getDriveStateByIndex(4)
        sawRead = ds1.spindleOn && ds1.diskReady
        mount(5, 2, "swapped.2mg", swap)
        expectDrive1Running()
        expect(getDriveStateByIndex(5).filename).toBe("swapped.2mg")
      }
    }
    expect(sawRead).toBe(true)
    expectDesktop()
  } finally {
    finish()
  }
}, 900000)

testWithFixtures(BOOT_PATH, OTHER_PATH)("a first insert into the empty slot-5 bay leaves a booting bay alone", () => {
  try {
    boot(false)
    const shortFrames = 700
    let sawRead = false
    for (let f = 0; f < shortFrames; f++) {
      jest.advanceTimersByTime(17)
      if (f === MOUNT_AT) {
        const ds1 = getDriveStateByIndex(4)
        sawRead = ds1.spindleOn && ds1.diskReady
        mount(5, 2, OTHER_PATH)
        expectDrive1Running()
      }
    }
    expect(sawRead).toBe(true)
    // The boot kept reading after the insert (the splash needs a live slot-5
    // read path to appear at all).
    expect(shrNonZero()).toBeGreaterThan(20000)
  } finally {
    finish()
  }
}, 900000)
