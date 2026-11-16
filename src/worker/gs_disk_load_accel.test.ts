import {
  doSetMachineName,
  doSetRunMode,
  doSetSpeedMode,
  getCPU,
  getCpuCyclesPerRefresh,
  gsAztecDelayCycleCountForTesting,
  gsAztecDelaySkipCountForTesting,
  resetCpuSpeedForTesting,
  resetGsAztecDelaySkipCountForTesting,
  setGsDiskLoadAccelerationForTesting,
} from "./motherboard"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { memGet24, memSet, memSet24 } from "./memory"
import { s6502 } from "./instructions"
import { Status816 } from "./cpu65816"
import { getMachineProfile, getProfileCyclesPerRefresh } from "../common/machine_profile"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Regression for the GS-only Aztec 5.25" loader delay acceleration.
//
// The decoded Aztec sectors contain a copy-protection timer at $BD9E..$BDAA
// called from the $BD00 loader. The IIgs executes it; the classic path never
// enters it, which is why a GS title load takes roughly five times as long.
// The loop is pure CPU state (no I/O) and leaves $46/$47 zero for the caller's
// $BDAB continuation, so the emulator fast-forwards exactly those cycles and
// resumes at $BDAB. The signature, motor and mounted-media checks keep this
// GS-only. The cycle formula is pinned against the measured 99DF span.
const PO_PATH = "public/disks/A2DeskTop-VERA.po"
const SIGNATURE = [
  0xA0, 0x12, 0x88, 0xD0, 0xFD, 0xE6, 0x46, 0xD0, 0xF7, 0xE6, 0x47, 0xD0, 0xF3,
]

const mkProps = (index: number): DriveProps => ({
  index,
  hardDrive: false,
  drive: 1,
  filename: "A2DeskTop-VERA.po",
  status: "",
  motorRunning: false,
  diskHasChanges: false,
  isWriteProtected: false,
  diskData: new Uint8Array(fs.readFileSync(PO_PATH)),
  lastAppleWriteTime: 0,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: 0,
})

const gsBudget = (mode: number) =>
  getProfileCyclesPerRefresh(getMachineProfile("APPLE2GS"), mode)

const motorOn = () => memSet(0xC0E9, 0)
const motorOff = () => memSet(0xC0E8, 0)

const installDelayLoop = () => {
  for (let i = 0; i < SIGNATURE.length; i++) {
    memSet24(0xBD9E + i, SIGNATURE[i])
  }
  // $BDAB resumes as an infinite JMP so the run loop cannot fall into the rest
  // of the copy-protection routine after the fast-forward.
  memSet24(0xBDAB, 0x4C)
  memSet24(0xBDAC, 0xAB)
  memSet24(0xBDAD, 0xBD)
}

const setDelayCpuState = () => {
  const cpu = getCPU() as any
  cpu.PB = 0
  cpu.DB = 0
  cpu.D = 0
  cpu.S = 0x01FF
  cpu.Y = 0
  cpu.emulationMode = true
  cpu.P = Status816.M | Status816.X
  cpu.PC = 0xBD9E
  memSet24(0x46, 0x99)
  memSet24(0x47, 0xDF)
}

describe("GS-only Aztec 5.25 inch loader delay acceleration", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
    resetGsAztecDelaySkipCountForTesting()
    doSetRunMode(RUN_MODE.PAUSED, false)
    doSetMachineName("APPLE2GS")
    expect(doSetEmuDriveNewData(mkProps(2))).toBe(true)
  })

  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    motorOff()
    setGsDiskLoadAccelerationForTesting(false)
    jest.useRealTimers()
  })

  test("pins the exact measured delay-loop cycle span", () => {
    expect(gsAztecDelayCycleCountForTesting(0x99, 0xDF)).toBe(821435)
    expect(gsAztecDelayCycleCountForTesting(0xFE, 0xFF)).toBe(204)
    expect(gsAztecDelayCycleCountForTesting(0xFF, 0xFE)).toBe(25456)
    expect(gsAztecDelayCycleCountForTesting(0xFF, 0xFF)).toBe(105)
  })

  test("fast-forwards the Aztec delay and resumes at $BDAB", () => {
    resetCpuSpeedForTesting()
    setGsDiskLoadAccelerationForTesting(true)
    doSetSpeedMode(0)
    expect(getCpuCyclesPerRefresh()).toBe(gsBudget(0))
    motorOn()
    installDelayLoop()
    setDelayCpuState()

    const before = s6502.cycleCount
    doSetRunMode(RUN_MODE.RUNNING, false)
    jest.advanceTimersByTime(17)
    expect(gsAztecDelaySkipCountForTesting()).toBe(1)
    expect(s6502.cycleCount - before).toBeGreaterThanOrEqual(821435)
    expect(s6502.cycleCount - before).toBeLessThanOrEqual(821435 + gsBudget(0) + 1)
    expect(memGet24(0x46)).toBe(0)
    expect(memGet24(0x47)).toBe(0)
    expect((getCPU() as any).PC).toBe(0xBDAB)
  })

  test("does not fast-forward when acceleration is disabled", () => {
    resetCpuSpeedForTesting()
    setGsDiskLoadAccelerationForTesting(false)
    doSetSpeedMode(0)
    motorOn()
    installDelayLoop()
    setDelayCpuState()
    doSetRunMode(RUN_MODE.RUNNING, false)
    jest.advanceTimersByTime(17)
    expect(gsAztecDelaySkipCountForTesting()).toBe(0)
    expect((getCPU() as any).PC).not.toBe(0xBDAB)
  })

  test("leaves the classic path at its Settings speed budget", () => {
    doSetMachineName("APPLE2EE")
    doSetSpeedMode(0)
    expect(getCpuCyclesPerRefresh()).toBe(
      getProfileCyclesPerRefresh(getMachineProfile("APPLE2EE"), 0))
  })
})
