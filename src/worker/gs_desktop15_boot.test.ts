import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting } from "./motherboard"
import { memory } from "./memory"
import { SWITCHES } from "./softswitches"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

describe("Apple IIgs A2DeskTop 1.5 Boot Verification", () => {
  const poPath = "c:\\dev\\emu\\ap2\\A2DeskTop-1.5.po"
  const hasFile = fs.existsSync(poPath)

  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })

  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("Mount A2DeskTop-1.5.po in Slot 7 Drive 1 after startup and boot", () => {
    if (!hasFile) {
      console.warn("Skipping test: " + poPath + " not found")
      return
    }

    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Run 500 frames to reach "Check startup device!"
    for (let f = 0; f < 500; f++) {
      jest.advanceTimersByTime(17)
    }

    expect(SWITCHES.TEXT.isSet).toBe(true)

    // Mount A2DeskTop-1.5.po in S7,D1
    const data = fs.readFileSync(poPath)
    const props: DriveProps = {
      index: 0,
      hardDrive: true,
      drive: 1,
      filename: "A2DeskTop-1.5.po",
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
    const accepted = doSetEmuDriveNewData(props)
    expect(accepted).toBe(true)

    // Trigger Reboot
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Run frames to let ProDOS load DeskTop into Double Hi-Res
    for (let f = 0; f < 800; f++) {
      jest.advanceTimersByTime(17)
    }

    // Must enter Double Hi-Res graphics
    expect(SWITCHES.TEXT.isSet).toBe(false)
    expect(SWITCHES.HIRES.isSet).toBe(true)
    expect(SWITCHES.DHIRES.isSet).toBe(true)
    expect(SWITCHES.COLUMN80.isSet).toBe(true)

    let mainHgrNonZero = 0, auxHgrNonZero = 0
    for (let a = 0x2000; a < 0x4000; a++) {
      if (memory[a] !== 0) mainHgrNonZero++
      if (memory[0x18000 + a] !== 0) auxHgrNonZero++
    }
    expect(mainHgrNonZero).toBeGreaterThan(1000)
    expect(auxHgrNonZero).toBeGreaterThan(1000)
  })
})
