import path from "path"
import * as fs from "fs"
import { DEFAULT_SLOT_CONFIG, RUN_MODE } from "../common/utility"
import { processInstruction } from "./cpu6502"
import { doSetEmuDriveNewData, getCurrentDriveState } from "./devices/drivestate"
import { s6502 } from "./instructions"
import { memGet, memory } from "./memory"
import { configureMachine, doBoot, doSetRunMode, doSetSlotConfig } from "./motherboard"
import { createSessionSnapshot, getApple2State, restoreSessionSnapshot, setApple2State } from "./save_restore"
import { setIsTesting } from "./worker2main"

jest.setTimeout(60000)

test("v2 save state preserves the paddle timers", () => {
  setIsTesting()
  doSetSlotConfig({...DEFAULT_SLOT_CONFIG})
  configureMachine()
  s6502.cycleCount = 1000
  memGet(0xC070) // start the paddle timers
  const saved = getApple2State()
  s6502.cycleCount = 50000
  memGet(0xC070) // the program starts them again later

  setApple2State(saved, 2)

  // Paddle 0 is centred, so its timer runs out about 1,400 cycles after the start.
  s6502.cycleCount = 1100
  expect(memGet(0xC064) & 0x80).toBe(0x80)
  s6502.cycleCount = 3000
  expect(memGet(0xC064) & 0x80).toBe(0)
})

const runTo = (cycles: number) => {
  while (s6502.cycleCount < cycles) processInstruction()
}

const registers = () => ({
  PC: s6502.PC, Accum: s6502.Accum, XReg: s6502.XReg, YReg: s6502.YReg,
  StackPtr: s6502.StackPtr, PStatus: s6502.PStatus, cycleCount: s6502.cycleCount,
})

test("a snapshot taken while a disk is being read restores to the same machine", () => {
  setIsTesting()
  const disk = "Olympic Decathlon.woz"
  const data = fs.readFileSync(path.resolve(__dirname, "../../public/disks/", disk))
  doSetEmuDriveNewData({
    index: 2, hardDrive: false, drive: 1, filename: disk, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  })
  doBoot()
  doSetRunMode(RUN_MODE.RUNNING)

  // Save partway through the boot, while the disk turns and is being read.
  runTo(1_500_000)
  expect(getCurrentDriveState().motorRunning).toBe(true)
  createSessionSnapshot("reading")
  const savedAt = s6502.cycleCount

  // The machine that saved runs on and reads more of the disk.
  runTo(savedAt + 2_000_000)
  const expected = registers()
  const expectedRam = Uint8Array.from(memory.subarray(0, 0xC000))

  // Restore the snapshot and run for the same time: the machine must end up the same.
  restoreSessionSnapshot("reading")
  expect(s6502.cycleCount).toBe(savedAt)
  runTo(savedAt + 2_000_000)
  expect(registers()).toEqual(expected)
  expect(memory.subarray(0, 0xC000).findIndex((byte, i) => byte !== expectedRam[i])).toBe(-1)
})
