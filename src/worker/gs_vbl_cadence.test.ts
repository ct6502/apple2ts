import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting,
  getIigsVblCount, resetIigsVblCount, iigsSpeedRegister, getIigsVideoClock,
  getIigsFrameUnits } from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The video frame must be driven by elapsed machine time, never by
// `s6502.cycleCount % frameCycles`.
//
// The ROM's interrupt manager writes $C036 on every interrupt entry and exit,
// which flips slow mode (1.024 MHz <-> 2.8 MHz) underneath the run loop. When
// the frame phase was derived from the CPU cycle count, each flip changed the
// divisor and the phase stepped backwards, so the VBL window was re-entered
// several times per frame and the guest starved in interrupt handling.
//
// This boots GS/OS 6.0.1 - the workload that really does flip the register -
// and asserts the two properties the video clock guarantees: $C036 does change
// during the run, and the VBL still fires exactly once per video refresh while
// it does.
const FRAMES = Number(process.env.GSVBL_FRAMES || 4000)
const PO_PATH = process.env.GSVBL_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"

test("IIgs: VBL fires once per refresh even while GS/OS toggles $C036", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = fs.readFileSync(PO_PATH)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    resetIigsVblCount()
    const clockStart = getIigsVideoClock()

    // Sample $C036 across the whole run: the ROM's own speed-setting code and
    // its interrupt manager write the register during boot and while 8-bit
    // drivers run, long before GS/OS settles on fast mode at the Finder.
    const speedValues = new Set<number>()
    for (let f = 0; f < FRAMES; f++) {
      jest.advanceTimersByTime(17)
      speedValues.add(iigsSpeedRegister & 0x80)
    }

    const vbls = getIigsVblCount()
    const clockEnd = getIigsVideoClock()
    const frameUnits = getIigsFrameUnits()
    const refreshes = Math.floor(clockEnd / frameUnits) - Math.floor(clockStart / frameUnits)
    console.log(`[VBLCADENCE] frames=${FRAMES} vbls=${vbls} refreshes=${refreshes} ` +
      `videoUnits=${clockEnd - clockStart} $C036 bit7 seen: ` +
      [...speedValues].map((v) => v ? "fast" : "slow").join("+"))

    // The regression only exists if the OS actually toggles the speed register.
    expect(speedValues.size).toBe(2)
    // Exactly one VBL per video refresh, not several.
    expect(vbls).toBe(refreshes)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
