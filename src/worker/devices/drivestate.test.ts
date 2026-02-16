import path from "path"
import * as fs from "fs"
import { doSetEmuDriveNewData } from "./drivestate"
import { setIsTesting } from "../worker2main"
import { doBoot, doSetRunMode } from "../motherboard"
import { s6502 } from "../instructions"
import { processInstruction } from "../cpu6502"
import { RUN_MODE } from "../../common/utility"

// Test tricky WOZ disk images.
const testDiskImage = (disk: string, address: number, minCycleCount: number, maxCycleCount: number) => {
  setIsTesting()
  const filePath = path.resolve(__dirname, "../../../public/disks/", disk)
  const data = fs.readFileSync(filePath)
  const props: DriveProps = {
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: disk,
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
  // We cannot just call doSetRunMode(RUN_MODE.NEED_BOOT) since that relies
  // on asynchronous callbacks to keep the emulator running. Using async
  // within Jest causes the tests to just quietly return without running
  // anything afterwards.
  doBoot()
  doSetRunMode(RUN_MODE.RUNNING)
  if (s6502.cycleCount >= 0) {
    for (let i = 0; i < 15000000; i++) {
      processInstruction()
      if (s6502.PC === address && s6502.cycleCount > minCycleCount) {
        break
      }
    }
    expect(s6502.PC).toEqual(address)
    expect(s6502.cycleCount).toBeGreaterThan(minCycleCount)
    expect(s6502.cycleCount).toBeLessThan(maxCycleCount)
//    console.log(`Disk: ${disk} Cycle Count: ${s6502.cycleCount}`)
  } else {
    expect("").toEqual("cycle count should be greater than 0")

  }
}

// For these tests, we should reach the specified address
// within the specified cycle count range.

test("OlympicDecathlon", () => testDiskImage("Olympic Decathlon.woz", 0x1A13, 8700000, 9100000))

// See https://github.com/ct6502/apple2ts/issues/51
test("KingsQuest", () => testDiskImage("KingsQuestA.woz", 0x4F2E, 40000000, 41000000))

// See https://github.com/ct6502/apple2ts/issues/81
test("BalanceOfPower", () => testDiskImage("BalanceOfPower.woz", 0x5928, 33900000, 35000000))
test("BlazingPaddles", () => testDiskImage("BlazingPaddles.woz", 0xB4BD, 5900000, 6100000))
test("Glutton", () => testDiskImage("Glutton.woz", 0x4375, 33900000, 34100000))
test("Miner2049er", () => testDiskImage("Miner2049er.woz", 0x0CB0, 19900000, 22000000))
test("SammyLightfoot", () => testDiskImage("SammyLightfoot.woz", 0x785F, 11600000, 11800000))
test("WingsOfFury", () => testDiskImage("WingsOfFuryA.woz", 0x40B9, 17000000, 17500000))

// Test usage of optimal timing
test("PaulTeachesChess", () => testDiskImage("Paul Whitehead Teaches Chess.woz", 0xD285, 10000000, 11000000))

// Works fine but cannot easily test because the hang happened after
// choosing the "Build a Town" menu option. See issue #81 for details.
// See if we reach the "choose keyboard/joystick" option, just to verify that we boot.
test("StickybearTown", () => testDiskImage("StickybearTown.woz", 0x9F68, 27000000, 28000000))

// See https://github.com/ct6502/apple2ts/issues/179
test("Frogger", () => testDiskImage("Frogger.woz", 0x9C4E, 5900000, 6100000))

