import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Stars & Planets (1990, Advanced Ideas) is a self-booting ProDOS 16 volume.
// It draws its Super Hi-Res title screen and then waits for a key; Return
// starts the program, whose own module load runs at 1990 disk speed for ~20 s
// before the solar system appears and marches.
//
// Before the program starts, and again inside its animation loop, the guest
// rebuilds the 9-bit vertical counter from $C02E/$C02F ($01:A06B: one 16-bit
// read, ASL, ADC #$0000, AND #$01FF) and spins until it reads $00FA. That
// value only exists if the last six scanlines of the frame wrap to $0FA-$0FF
// rather than $1FA-$1FF — the counter is 9 bits, so $1FF + 1 is $000 and
// gssquared `VideoScannerII.hpp::get_vcounter()` forces it to $0FA. With the
// wrong wrap the title screen still paints (so a "did the boot reach SHR"
// check passes) and then the picture freezes permanently: exactly the "會卡住"
// this pins. gs_vcounter.test.ts covers the counter arithmetic itself; this is
// the end-to-end proof that a real volume gets past it.
//
// Note what is NOT a defect here: the app is keyboard-driven. It polls $C000
// ~10 times per frame, never sets the ADB mouse interrupt bit ($C027 bit 6),
// never reads $C024/$C026 and makes no $E10000 tool call while idle, so the
// ROM's mouse dispatch at $FF:B973 correctly refuses to fire and the pointer
// does nothing. A still screen means the load is running, not that input is
// being lost.
const DISK_PATH = process.env.GS_STARS_PATH || "C:\\dev\\emu\\ap2\\stars-planets.2mg"
const hasDisk = fs.existsSync(DISK_PATH)

// The SHR window is 32 KB; colour nibbles live 8 bytes apart along a line, so
// hashing every 8th byte is cheap enough to repeat per sample frame.
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

describe("Stars & Planets on the IIgs", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })
  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("boots to its title screen and animates after Return", () => {
    if (!hasDisk) {
      console.warn(`stars & planets image missing: ${DISK_PATH}`)
      return
    }
    doSetMachineName("APPLE2GS")
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "stars-planets.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    for (let f = 0; f < 3000; f++) jest.advanceTimersByTime(17)
    const title = shrStats()
    // The title panel is a full-width picture: ~31 KB of the 32 KB window
    // carries non-zero bytes.
    expect(title.nz).toBeGreaterThan(20000)

    setKeyboardState({ key: 0x0d, isDown: true, repeat: false, domCode: "Enter" })
    setKeyboardState({ key: 0x0d, isDown: false, repeat: false, domCode: "Enter" })

    // Sampling every 10 frames: the first change lands around frame 1200 and
    // the march continues for the rest of the window (measured 119 changes).
    let prev = title.h
    let changes = 0
    let firstChangeFrame = -1
    for (let f = 1; f <= 2400; f++) {
      jest.advanceTimersByTime(17)
      if (f % 10 !== 0) continue
      const s = shrStats()
      if (s.h !== prev) {
        changes++
        if (firstChangeFrame < 0) firstChangeFrame = f
        prev = s.h
      }
    }
    expect(firstChangeFrame).toBeGreaterThan(0)
    expect(firstChangeFrame).toBeLessThan(1500)
    expect(changes).toBeGreaterThan(50)
  }, 600000)
})
