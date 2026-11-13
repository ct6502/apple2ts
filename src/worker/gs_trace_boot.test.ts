import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memGet24, memory } from "./memory"
import { SWITCHES } from "./softswitches"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"
import * as path from "path"

test("Apple IIgs boots ProDOS 8 and A2DeskTop from Slot 7 hard drive into DHIRES", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")

    const hdvPath = path.join(__dirname, "..", "..", "public", "disks", "A2DeskTop-VERA.hdv")
    const data = fs.readFileSync(hdvPath)
    const props: DriveProps = {
      index: 0,
      hardDrive: true,
      drive: 1,
      filename: "A2DeskTop-VERA.hdv",
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
    doSetEmuDriveNewData(props)

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Advance 800 frames (~13.6 seconds) to allow ProDOS and A2DeskTop to initialize
    for (let f = 0; f < 800; f++) {
      jest.advanceTimersByTime(17)
    }

    // Verify ProDOS 8 MACHID
    expect(memGet24(0xBF98)).toBe(0x2a)

    // Verify A2DeskTop initialized 80-column Double Hi-Res graphics
    expect(SWITCHES.TEXT.isSet).toBe(false)
    expect(SWITCHES.HIRES.isSet).toBe(true)
    expect(SWITCHES.DHIRES.isSet).toBe(true)
    expect(SWITCHES.COLUMN80.isSet).toBe(true)
    expect(SWITCHES.STORE80.isSet).toBe(true)

    // Verify DHIRES frame buffer is actively rendered (desktop pattern/icons)
    let mainHgrNonZero = 0, auxHgrNonZero = 0
    for (let a = 0x2000; a < 0x4000; a++) {
      if (memory[a] !== 0) mainHgrNonZero++
      if (memory[0x18000 + a] !== 0) auxHgrNonZero++
    }
    expect(mainHgrNonZero).toBeGreaterThan(5000)
    expect(auxHgrNonZero).toBeGreaterThan(5000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
