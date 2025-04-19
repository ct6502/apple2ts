import path from "path"
import * as fs from "fs"
import { doSetEmuDriveNewData } from "./drivestate"
import { setIsTesting } from "../worker2main"
import { doBootForTests } from "../motherboard"
import { s6502 } from "../instructions"
import { processInstruction } from "../cpu6502"

// Test tricky WOZ disk images.
const testDiskImage = (disk: string, address: number, minCycleCount: number) => {
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
    lastWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalWriteTime: 0,
  }
  doSetEmuDriveNewData(props)
  doBootForTests()
  if (s6502.cycleCount >= 0) {
    for (let i = 0; i < 15000000; i++) {
      processInstruction()
      if (s6502.cycleCount > minCycleCount && s6502.PC === address) {
        break
      }
    }
    expect(s6502.PC).toEqual(address)
    expect(s6502.cycleCount).toBeGreaterThan(minCycleCount)
  } else {
    expect("").toEqual("cycle count should be greater than 0")

  }
}

// See https://github.com/ct6502/apple2ts/issues/51
test("KingsQuest", () => testDiskImage("KingsQuestA.woz", 0x4F2E, 41000000))

// See https://github.com/ct6502/apple2ts/issues/81
test("BalanceOfPower", () => testDiskImage("BalanceOfPower.woz", 0x5928, 33900000))
test("BlazingPaddles", () => testDiskImage("BlazingPaddles.woz", 0xB4BD, 6000000))
test("SammyLightfoot", () => testDiskImage("SammyLightfoot.woz", 0x785F, 11600000))

// Does not boot
// test("Miner2049er", () => testDiskImage("Miner2049er.woz", 0xFFFF, 6000000))
// test("WingsOfFury", () => testDiskImage("WingsOfFury.woz", 0xFFFF, 6000000))

