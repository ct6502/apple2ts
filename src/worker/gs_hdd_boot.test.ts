import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { getTextPageAsString, memGet24, iigsSlotRegister } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"
import * as path from "path"

test("Apple IIgs Slot 7 Hard Drive boot", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")

    // Mount A2DeskTop-VERA.hdv in Slot 7 Drive 1
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

    console.log("iigsSlotRegister before boot:", iigsSlotRegister.toString(2))
    console.log("Reading $C701 before boot:", memGet24(0x00C701).toString(16))

    // Track if PC reaches $C700 (slot 7 ROM entry) and $0801 (ProDOS boot block)
    const cpu = getCPU() as any
    let c700Seen = false
    let bootBlockSeen = false
    const origPI = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      const pb = cpu.PB, pc = cpu.PC
      if (pb === 0 && pc === 0xC700) c700Seen = true
      if (pb === 0 && pc === 0x0801) bootBlockSeen = true
      return origPI(cb)
    }

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Run 600 frames
    for (let f = 0; f < 600; f++) {
      jest.advanceTimersByTime(17)
    }

    const screen = getTextPageAsString()
    console.log("C700 seen:", c700Seen)
    console.log("Boot block 0x0801 seen:", bootBlockSeen)
    console.log("End CPU state:", `PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)} S=${cpu.S.toString(16)} P=${cpu.P.toString(16)}`)
    console.log("Screen:\n", screen.slice(0, 300))

    expect(c700Seen).toBe(true)
    expect(bootBlockSeen).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})
