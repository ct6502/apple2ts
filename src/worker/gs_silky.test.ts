import { doSetMachineName, doSetRunMode, doSetSpeedMode } from "./motherboard"
import { getShr, megaIIAux, memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// SilkyGS (volume CLASSICSGS) is a family of NES ports that boots GS/OS from a
// SystemDisk in S7D1 and the game volume in S7D2. Its blitter stores pixels
// with DB=$00 while RAMWRT is set, so the writes land in the aux fast RAM and
// only reach the video scanner through the Mega II aux shadow. Shadowing every
// bank-$00 write into Mega II main left the SHR screen a uniform palette-0
// blue even though the game was drawing every frame (Super Mario Bros title
// screen). See memSet24 -> iigsEffectiveAuxWrite/shadowIigsWrite.
const SYS_PATH = process.env.GS_SILKY_SYS || "C:\\dev\\emu\\ap2\\SystemDisk.2mg"
const GAME_PATH = process.env.GS_SILKY_GAME || "C:\\dev\\emu\\ap2\\SilkyGS\\SilkyGS.2mg"

const mount = (p: string, index: number, name: string) =>
  doSetEmuDriveNewData({
    index, hardDrive: true, drive: index + 1, filename: name, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(p)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)

const advance = (n: number) => { for (let i = 0; i < n; i++) jest.advanceTimersByTime(17) }
// Normalized mouse position; the closed-loop stepper moves the guest cursor
// there and the click is delivered only after it arrives.
const mouseTo = (x: number, y: number) => { MouseCardEvent({ x, y, buttons: -1 }); advance(25) }
const doubleClick = () => {
  for (let i = 0; i < 2; i++) {
    MouseCardEvent({ x: -1, y: -1, buttons: 0x10 }); advance(6)
    MouseCardEvent({ x: -1, y: -1, buttons: 0x00 }); advance(6)
  }
}

test("SilkyGS: Super Mario Bros draws into the SHR screen", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()
    doSetSpeedMode(1)
    expect(mount(SYS_PATH, 0, "SystemDisk.2mg")).toBe(true)
    expect(mount(GAME_PATH, 1, "SilkyGS.2mg")).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    advance(4000)

    // Finder: double-click the SUPERMARIOGS folder, then the app inside it.
    // The icon rows sit at image y 120 and 108 in the 640x400 SHR frame.
    mouseTo(80 / 640, 120 / 400)
    doubleClick()
    advance(240)
    mouseTo(80 / 640, 108 / 400)
    doubleClick()
    advance(600)

    const shr = getShr()
    let nonZero = 0
    const rowsWithBytes = Array.from({ length: 200 }, (_, y) => {
      let n = 0
      for (let i = 0; i < 160; i++) if (shr[y * 160 + i]) n++
      nonZero += n
      return n
    }).filter((n) => n > 0).length
    let megaAuxNonZero = 0
    for (let i = 0x2000; i < 0xa000; i++) if (megaIIAux[i]) megaAuxNonZero++

    expect(memGet24(0xe0c029) & 0x80).toBe(0x80)
    // The title screen fills more than half the visible scanlines; a blank SHR
    // screen has rowsWithBytes = 0 and only the palette bytes non-zero.
    expect(rowsWithBytes).toBeGreaterThan(100)
    expect(nonZero).toBeGreaterThan(5000)
    expect(megaAuxNonZero).toBeGreaterThan(5000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    jest.useRealTimers()
  }
}, 600000)
