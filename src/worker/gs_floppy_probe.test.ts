import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { memory, megaIIAux, getCurrentMachineName, iigsGetIwmDriveSelect, iigsGetIwmEnable35, iigsRegisters } from "./memory"
import { SWITCHES } from "./softswitches"
import { doSetEmuDriveNewData, getDriveDataByIndex, getDriveStateByIndex } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Diagnostic (not an assertion of success): boot an ordinary 5.25" ProDOS
// floppy on the Apple IIgs through the built-in IWM and report how far it got.
//
// The IWM data path itself is proven here: the ROM reaches "Check startup
// device!", strobes the stepper lines, enables the motor and consumes real
// 6-and-2 nibbles out of the data register. It has NOT yet found the boot
// volume, so the IIgs floppy boot is still incomplete - see AGENTS.md.
const PO_PATH = process.env.GSFLOPPY_PO || "public/disks/A2DeskTop-VERA.po"

test(`Apple IIgs slot 6 5.25" floppy IWM diagnostic: ${PO_PATH}`, () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = fs.readFileSync(PO_PATH)
    const props: DriveProps = {
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "A2DeskTop-VERA.po",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(data),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    }
    expect(doSetEmuDriveNewData(props)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 1500; f++) jest.advanceTimersByTime(17)

    let shrNonZero = 0
    for (let i = 0x2000; i < 0xA000; i++) if (megaIIAux[i] !== 0) shrNonZero++
    console.log(`machine=${getCurrentMachineName()} TEXT=${SWITCHES.TEXT.isSet} ` +
      `HIRES=${SWITCHES.HIRES.isSet} 80COL=${SWITCHES.COLUMN80.isSet} ` +
      `SHR non-zero=${shrNonZero}/32768`)

    const ds = getDriveStateByIndex(2)
    console.log(`IWM: enable35=${iigsGetIwmEnable35()} driveSel=${iigsGetIwmDriveSelect()} ` +
      `C02D=${iigsRegisters[0x2D].toString(16)}`)
    console.log(`drive2: file="${ds.filename}" motor=${ds.motorRunning} ` +
      `qtrTrack=${ds.quarterTrack} maxQtr=${ds.maxQuarterTrack} ` +
      `trackLoc=${ds.trackLocation} trackStart0=${ds.trackStart[0]} trackNbits0=${ds.trackNbits[0]}`)
    const ddata = getDriveDataByIndex(2)
    console.log(`drive2 media length=${ddata.length} (WOZ track 0 starts at 1536)`)

    const textLines: string[] = []
    for (let row = 0; row < 24; row++) {
      let line = ""
      const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
      for (let col = 0; col < 80; col++) {
        const isAux = col % 2 === 0
        const cell = isAux ? memory[0x18000 + base + Math.floor(col / 2)] : memory[base + Math.floor(col / 2)]
        const ch = cell & 0x7F
        line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : " "
      }
      if (line.trim().length > 0) textLines.push(line.replace(/\s+$/, ""))
    }
    console.log("TEXT SCREEN:\n" + textLines.join("\n"))

    // What we can assert today: the ROM found the drive, enabled it and pulled
    // real bits through the IWM data register (a zero trackLocation would mean
    // the LSS never advanced).
    expect(ds.filename).toBe("A2DeskTop-VERA.po")
    expect(ds.trackLocation).toBeGreaterThan(0)
    expect(ddata.length).toBeGreaterThan(1536)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
