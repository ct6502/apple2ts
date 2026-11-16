import { FrameClock } from "./frameclock"
// Chris Torrence, 2022
import { passAudioReset, passMachineState, passSoftSwitchDescriptions, passWorkerOperationResult } from "./worker2main"
import { setCpuPcGetter } from "./cpu_pc"
import { s6502, setState6502, setCycleCount, setPC, getStackString, get6502Instructions } from "./instructions"
import { hiresAddressToLine, RUN_MODE, TEST_DEBUG, DEFAULT_SLOT_CONFIG, MEMORY_DUMP_STATE, AUTO_SNAPSHOT } from "../common/utility"
import { getMachineCapabilities, getMachineProfile, getProfileCyclesPerRefresh, getProfileDefaultSlotConfig, getProfileDefaultSpeedMode, getProfileSlotChoices, isGSMachine } from "../common/machine_profile"
import { sanitizeSlotConfig } from "../common/slot_options"
import { iigsSlotRegisterFor } from "../common/iigs_slots"
import { resetFloppyDrives, doPauseDrive, getHardDriveState } from "./devices/drivestate"
import { iigsEnsoniq } from "./devices/iigs_ensoniq"
import { passEnsoniqSound } from "./worker2main"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES, overrideSoftSwitch, resetSoftSwitches, setVideo7Override,
  restoreSoftSwitches, getSoftSwitchDescriptions, 
  syncSoftSwitchStatusFlags,
  SoftSwitchStates,
  SoftSwitchName} from "./softswitches"
import { memory, memGet, getTextPage, getHires, memoryReset,
  updateAddressTables, setMemoryBlock, addressGetTable,
  loadMainMemoryBlock,
  setRamWorks,
  setAuxCardEnabled,
  RamWorksMaxBank,
  C800SlotGet,
  RamWorksBankGet,
  doSetRom,
  getZeroPage,
  getShrCompletedDisplay,
  captureShrBeamLine,
  beginShrFrame,
  resetShrBeamFrame,
  memSet,
  exportMemoryToHiresLine,
  getDataBlock,
  setSlotDriver,
  clearSlot,
  getHeatMapMemGet,
  getHeatMapMemSet,
  getHeatMapMemGetMax,
  getHeatMapMemSetMax,
  resetHeatMapMemSet,
  resetHeatMapMemGet,
  getCurrentMemory,
  getMainMemory,
  getAuxMemory,
  getHgr1Memory,
  getHgr2Memory,
  memGet24,
  memSet24,
  gsROM,
  iigsSignalVbl,
  iigsSignalQuarterSecond,
  iigsSignalOneSecond,
  iigsSignalScanline,
  iigsShrScanlineAtBeam,
  iigsInterruptPending,
  iigsInitInterrupts,
  iigsClearInterrupts,

  iigsFloppyHasMedia,
  iigsGetIwmDriveSelect,
  iigsGetIwmEnable35,
  iigsGetIwmMotorOn,
  setIigsSlotRegister,
  setIigsRomVersion,
  isIigsRom03,
  iigsRegisters} from "./memory"
import { setButtonState, handleGamepads, setJoystickClockSource, setJoystickCyclesPerRefresh } from "./devices/joystick"
import { handleGameSetup } from "./games/game_mappings"
import { breakpointMap, clearInterrupts, doSetBreakpointSkipOnce, doSetMemoryWriteWatchpoint as setCpuMemoryWriteWatchpoint, resetCycleCountCallbacks, processCycleCountCallbacks, setStepOut, getHeatMapCPU, getHeatMapCPUMax, resetHeatMapCPU } from "./cpu6502"
import { ICPU } from "./icpu"
import { CPU6502Wrapper } from "./cpu6502_wrapper"
import { CPU65816 } from "./cpu65816"

let cpu: ICPU = new CPU6502Wrapper()
export const getCPU = (): ICPU => cpu
import { enableSerialCard, resetSerial } from "./devices/superserial/serial"
import { enableMouseCard } from "./devices/mouse"
import { enablePassportCard, resetPassport } from "./devices/passport/passport"
import { enableVera, resetVera } from "./devices/vera/vera"
import { videoTerm, enableVideoTerm, disableVideoTerm } from "./devices/videoterm"
import { vidhd } from "./devices/vidhd"
import { enableMockingboard, resetMockingboard } from "./devices/mockingboard"
import { clearSlotCardStateHandlers } from "./devices/slot_card_state"
import { resetMouse, onMouseVBL, iigsMouseStep } from "./devices/mouse"
import { enableDiskDrive, enableDiskDrive35, iwmResetTiming, processFloppyMotorTimeout } from "./devices/diskdata"
import { advanceKeySequence, interruptKeySequence, pollKeyboardRepeat, sendPastedText } from "./devices/keyboard"
import {
  advanceConditionalInputSequence,
  checkConditionalInputStop,
  finishConditionalInputSequence,
  requestConditionalInputTermination,
} from "./conditional_input"
import { enableHardDrive } from "./devices/harddrivedata"
import { parseAssembly } from "./utility/assembler"
import { code } from "../common/assemblycode"
import { clearTracelog, getTracelog, updateTrace } from "./tracelog"
import { compareSessionMemory, createSessionSnapshot, doSnapshot, fixSaveStates, getGoBackwardIndex, getGoForwardIndex, getTempStateIndex, getTimeTravelThumbnails, restoreSessionSnapshot } from "./save_restore_worker"
import { SoftCard } from "./devices/softcard"
import { setSlotIOCallback } from "./memory"
import { hasHardDriveMounted } from "./devices/drivestate"
import { findMemory, getMemoryView, resolveMemoryRangeRequest } from "./memory_view"
import { iigsADB } from "./iigs_adb"
import { iigsClock } from "./iigs_clock"

let speedMode = 0
// True once the UI or a test has chosen a speed. The IIgs defaults to 2.8 MHz
// (hardware fast mode) only while nobody has picked one: the 3.5" driver
// cannot clock 500 kbit/s media at a 1.02 MHz budget.
let speedModeExplicit = false
let iigsQuarterSecCounter = 0
let iigsOneSecCounter = 0
// Debug-only: count VBL interrupts so the browser can verify the 60 Hz rate.
let iigsVblCount = 0
export const getIigsVblCount = () => iigsVblCount
export const resetIigsVblCount = () => { iigsVblCount = 0 }
// $C036 reset value: bit 7 set = fast. gssquared resets the IIgs MMU to fast
// mode, and the ROM keeps it there while its slot-5 3.5" driver runs. The
// emulated clock has to agree with what the guest reads, or software that
// relies on fast mode (the disk driver needs ~45 CPU cycles per byte at
// 500 kbit/s) is silently throttled while $C036 reports fast.
export let iigsSpeedRegister = 0x80
export const setIigsSpeedRegister = (v: number) => { iigsSpeedRegister = v }
// $C036 bit 7 = fast (1) / slow (0). gssquared's physical clock model forces
// the slow pin to 1.024 MHz regardless of UI speed, but this emulator treats
// the Settings speed preference as authoritative: a classic title that drops
// the CPU clock for copy-protected disk I/O runs at the rate the user asked for
// instead of collapsing to 1 MHz. The bit still gates the speed-shadow latch.
export const isIigsSlowMode = () => !(iigsSpeedRegister & 0x80)
// The video scanner runs off the fixed 14 MHz master clock. The Settings speed
// preference decides how many CPU cycles fit into one refresh. The ROM's
// interrupt manager toggles $C036 on every interrupt entry and exit, so deriving
// the frame phase from `cycleCount % frameCycles` let a divisor change step the
// beam backwards: $C02E/$C02F could then never present the scanline a game waits
// for (the `LDA $C02E / CMP #$E8 / BNE -6` spin of section 52), and the DOC
// catch-up and mouse-stepper anchors inherited the jump. `iigsVideoClock`
// accumulates machine time in refresh-relative units. The host speed preference
// is authoritative, so a guest slow-mode toggle no longer rescales a CPU cycle.
// gssquared does the same by anchoring its scanner to the 14M rail.
let iigsVideoClock = 0

// ---- Ensoniq DOC catch-up state ----
// This lives at module scope on purpose. The run loop (doAdvance6502) is entered
// once per refresh, but the DOC's sample clock is anchored to machine time, not
// to the loop call: its refresh phase, its cursor inside the current refresh's
// output block and that block's length must persist between calls. They used to
// be declared inside doAdvance6502, so every call started with `refreshId = -1`
// and immediately re-ran the rollover: it generated a look-ahead block at the
// end of the call, then threw it away at the start of the next, advancing the
// DOC march ~1.5 refreshes per refresh. Posted audio stayed 1x (439 frames per
// block), so SenseiPlay's NTP player ran its timer oscillator at ~76 Hz instead
// of 50 Hz â€” everything 1.5x too fast with correct pitch.
let ensoniqRefreshId = -1
// Total DOC frames generated for the current refresh block. A rate change
// ($E1 write) starts a new segment at this cursor, so the block is posted as a
// sequence of rate-labelled segments rather than relabelled at the wrong rate.
let ensoniqOutCursor = 0
// DOC frames at the start of the current rate segment, plus the refresh
// fraction at which that segment began. `rate` is frames per DOC second.
interface DocRateSegment {
  startCursor: number
  endCursor: number
  rate: number
}
interface DocActiveSegment {
  startCursor: number
  startFraction: number
  rate: number
}
let ensoniqSegments: DocRateSegment[] = []
let ensoniqActiveSegment: DocActiveSegment | null = null
let ensoniqScratch = new Int16Array(2048 * 2)
// Catch-up may be entered recursively from a DOC access made inside a halt IRQ
// callback (that callback may program registers from the run loop's generate
// call). Guard it, and defer an $E1 rate re-base until generation finishes.
let ensoniqCatchUpBusy = false
let ensoniqRebasePending = false

export const getIigsVideoClock = () => iigsVideoClock
// Test-only readback of the SHR captured-row boundary. Production code only
// compares it inside doAdvance6502; a speed-mode switch must leave it at frame
// 0 so the next timer callback does not fake a mid-refresh beginShrFrame().
export const getLastShrFrameForTesting = () => lastShrFrame
export const getIigsFrameUnits = () => cpuCyclesPerRefresh
// Last refresh boundary at which the captured SHR rows were cleared. This is
// machine state, not per-call state: doAdvance6502 is entered once per timer
// callback, and a callback can run while the machine is already *inside* the
// new refresh. Declaring it in the run loop made every invocation start with
// lastShrFrame = -1 and therefore call beginShrFrame immediately, mid-refresh;
// that cleared the row-captured flags while the beam had already passed them,
// so a sprite draw landing behind the beam was no longer folded into the
// displayed picture. The symptom is a missing/partial top-row character or a
// flickering aircraft under heavy timer jitter. Keep it at module scope and
// reset it only when the machine's video clock (and frame numbering) resets.
let lastShrFrame = -1
// A speed-mode switch resets the video clock without clearing the SHR display:
// the beam-captured rows are still the last ones the guest painted, and a late
// top-row sprite store arriving after the switch should still fold into them.
// A reset at boot calls resetShrBeamFrame() for the picture itself, so there
// -1 (no boundary yet) is correct; the speed switch keeps frame 0 as current.
export const resetIigsVideoClock = (preserveShrFrame = false) => {
  iigsVideoClock = 0
  lastShrFrame = preserveShrFrame ? 0 : -1
  // The DOC catch-up is phased against this clock, so its anchor has to restart
  // with it (boot, Ctrl-Reset and speed-mode changes all reset the clock).
  ensoniqRefreshId = -1
  ensoniqOutCursor = 0
  ensoniqSegments = []
  ensoniqActiveSegment = null
  ensoniqScratch.fill(0)
  ensoniqCatchUpBusy = false
  ensoniqRebasePending = false
}
// $C02E/$C02F are a pure function of this clock, so pinning the frame layout the
// CPU sees means being able to place the beam at a chosen position in a refresh.
export const setIigsVideoClockForTesting = (value: number) => { iigsVideoClock = value }
let cpuSpeed = 0
export let isDebugging = false
let appMode = "default"
let showDebugTab = false
let refreshTime = 16.6881 // = 17030 / 1020.488
let cpuCyclesPerRefresh = 17030
export const getCpuCyclesPerRefresh = () => cpuCyclesPerRefresh

// ---- GS-only Aztec 5.25" loader delay acceleration ----
// The decoded Aztec WOZ sectors contain a disk-resident copy-protection timer
// ($BD9E..$BDAA, called from the $BD00 loader). The IIgs executes the delay
// loop; the classic path never enters it, so the same title load takes roughly
// five times as long on the IIgs at 1.024 MHz or 2.8 MHz. The loop only burns
// CPU cycles: it touches no I/O and leaves $46/$47 at zero for the caller's
// $BDAB continuation. Fast-forward exactly those cycles, with the machine
// clock and video/DOC timeline advanced, so the disk keeps its elapsed-time
// position and the guest resumes at $BDAB with the counters already wrapped.
// The 13-byte signature is checked against live RAM; the motor + mounted 5.25"
// media check limits this to a real GS load. Classic optimalTiming, bitTiming
// and getNextByte are untouched. Test suites run disabled by default; the
// permanent regression enables this explicitly.
const nodeProcess = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process
const isJestWorker = !!nodeProcess?.env?.JEST_WORKER_ID
let gsDiskLoadAccelerationEnabled = !isJestWorker
const GS_AZTEC_DELAY_SIGNATURE = [
  0xA0, 0x12, 0x88, 0xD0, 0xFD, 0xE6, 0x46, 0xD0, 0xF7, 0xE6, 0x47, 0xD0, 0xF3,
]
const GS_AZTEC_DELAY_PC = 0xBD9E
const GS_AZTEC_DELAY_RESUME_PC = 0xBDAB

// Total delay-loop cycles for starting counters x ($46) and y ($47), derived
// from the measured instruction timings:
//  - normal outer iteration (INC $46 only) 99 cycles
//  - outer iteration where INC $46 wraps and INC $47 is still non-zero 106
//  - the final iteration (both counters wrap and the routine falls to $BDAB) 105
// The outer-loop visit count is block46 + (block47 - 1) * 256 (the wrap
// iterations are block47); 99DF => x=0x99,y=0xDF => 103+32*256=8295 visits and
// 8262*99 + 32*106 + 105 = 821435 cycles, the exact span measured on the real
// Aztec loader in motherboard.ts.
export const gsAztecDelayCycleCountForTesting = (x46: number, y47: number) => {
  const block46 = x46 === 0 ? 256 : 256 - x46
  const block47 = y47 === 0 ? 256 : 256 - y47
  const outer = block46 + (block47 - 1) * 256
  return (outer - block47) * 99 + (block47 - 1) * 106 + 105
}

const gsAztecDelaySignatureMatches = () => {
  const gsCpu = cpu as CPU65816
  if (gsCpu.PC !== GS_AZTEC_DELAY_PC || gsCpu.PB !== 0x00) return false
  for (let i = 0; i < GS_AZTEC_DELAY_SIGNATURE.length; i++) {
    if (memGet24(GS_AZTEC_DELAY_PC + i) !== GS_AZTEC_DELAY_SIGNATURE[i]) return false
  }
  return true
}

const gsAztecDelayCyclesAtCurrentCounters = () => {
  const dp = (cpu as CPU65816).D
  const x = memGet24((dp + 0x46) & 0xFFFF)
  const y = memGet24((dp + 0x47) & 0xFFFF)
  return gsAztecDelayCycleCountForTesting(x, y)
}

const gsAztecDelaySkip = () => {
  if (!isGSMachine(machineName) || !gsDiskLoadAccelerationEnabled) return 0
  if (!gsAztecDelaySignatureMatches()) return 0
  // The GS built-in slot 6 (and not the $C08x language-card window) must be
  // running real media: motor on, EN35 clear, and a disk mounted in the
  // selected drive.
  if (iigsGetIwmEnable35() || !iigsGetIwmMotorOn()) return 0
  if (!iigsFloppyHasMedia(2 + iigsGetIwmDriveSelect())) return 0
  return gsAztecDelayCyclesAtCurrentCounters()
}

// The delayed routine is pure CPU state, so the skip only moves the CPU clock
// (and the video/DOC timeline) forward; the caller's $BDAB continuation then
// runs normally. The two direct-page counters must be zero exactly as the loop
// leaves them; the routine's own final LDY #$0C (at $BDAB) sets Y.
let gsAztecDelaySkipCount = 0
export const resetGsAztecDelaySkipCountForTesting = () => {
  gsAztecDelaySkipCount = 0
}
export const gsAztecDelaySkipCountForTesting = () => gsAztecDelaySkipCount

const advanceGsAztecDelay = () => {
  const delayCycles = gsAztecDelaySkip()
  if (delayCycles <= 0) return 0
  gsAztecDelaySkipCount++
  const dp = (cpu as CPU65816).D
  memSet24((dp + 0x46) & 0xFFFF, 0)
  memSet24((dp + 0x47) & 0xFFFF, 0)
  ;(cpu as CPU65816).PC = GS_AZTEC_DELAY_RESUME_PC
  return delayCycles
}

export const setGsDiskLoadAccelerationForTesting = (enabled: boolean) => {
  gsDiskLoadAccelerationEnabled = enabled
}
// ---- Ensoniq DOC catch-up (shared by the run loop and every DOC access) ----
// gssquared calls ensoniq_catch_up() before applying any $C03C-$C03F access,
// on its periodic cycle handler and at frame end. A DOC write therefore has
// all earlier samples rendered with the old register state. Our old run-loop
// call ran only after the instruction that performed the write, so those
// samples were generated with the new state instead.
//
// Each refresh block is posted as one or more rate-labelled segments. A rate
// change ($E1 write) ends the active segment and starts a new one at the
// current refresh fraction, so the frames already generated are never relabelled
// at the new output rate. gssquared drops the fractional catch-up remainder on
// $E1 and re-anchors time at the new rate; this is the same re-base, with the
// already-rendered samples kept for the frame block.
const ensoniqEnsureScratch = (frames: number) => {
  const needed = frames * 2
  if (needed <= ensoniqScratch.length) return
  const next = new Int16Array(needed)
  const copySamples = Math.min(ensoniqOutCursor * 2, ensoniqScratch.length)
  next.set(ensoniqScratch.subarray(0, copySamples))
  ensoniqScratch = next
}

const ensoniqGenChunk = (endSample: number) => {
  const n = endSample - ensoniqOutCursor
  if (n <= 0) return
  ensoniqEnsureScratch(endSample)
  iigsEnsoniq.lastCyc = s6502.cycleCount
  iigsEnsoniq.lastCyclesPerRefresh = cpuCyclesPerRefresh
  iigsEnsoniq.lastSpeedMode = speedMode
  iigsEnsoniq.generateSamples(n, ensoniqScratch.subarray(ensoniqOutCursor * 2, endSample * 2))
  ensoniqOutCursor = endSample
}

const ensoniqPostSegments = () => {
  for (const segment of ensoniqSegments) {
    if (segment.endCursor <= segment.startCursor) continue
    // Never relabel a segment with whatever rate happens to be current now:
    // the segment was generated at segment.rate and its duration is frames/rate.
    passEnsoniqSound(
      ensoniqScratch.subarray(segment.startCursor * 2, segment.endCursor * 2),
      segment.rate,
    )
  }
  ensoniqSegments = []
}

const ensoniqFinishRefreshBlock = () => {
  if (ensoniqRefreshId < 0 || !ensoniqActiveSegment) return
  const active = ensoniqActiveSegment
  // Finish the active segment at the refresh boundary (fraction 1). Intermediate
  // catch-ups used floor() per elapsed fraction; the boundary uses round() so
  // a stable-rate refresh posts exactly round(rate / 60) frames, 439 at osce=32.
  const endCursor = active.startCursor +
    Math.round(active.rate * (1 - active.startFraction) / 60)
  ensoniqGenChunk(endCursor)
  ensoniqSegments.push({
    startCursor: active.startCursor,
    endCursor: ensoniqOutCursor,
    rate: active.rate,
  })
  ensoniqPostSegments()
}

const ensoniqStartRefreshBlock = () => {
  const rate = iigsEnsoniq.outputRate()
  ensoniqActiveSegment = { startCursor: 0, startFraction: 0, rate }
  ensoniqEnsureScratch(Math.max(1, Math.round(rate / 60)))
  ensoniqScratch.fill(0)
}

const ensoniqRebaseRateNow = () => {
  if (!ensoniqActiveSegment) return
  const frameCycles = Math.max(1, cpuCyclesPerRefresh)
  const fraction = (iigsVideoClock % frameCycles) / frameCycles
  const active = ensoniqActiveSegment
  // End the old-rate segment at the frames already rendered. This keeps the
  // pre-$E1 samples at their old rate; the new segment starts here with the new
  // rate and runs to the refresh boundary.
  if (ensoniqOutCursor > active.startCursor) {
    ensoniqSegments.push({
      startCursor: active.startCursor,
      endCursor: ensoniqOutCursor,
      rate: active.rate,
    })
  }
  const nextActive = {
    startCursor: ensoniqOutCursor,
    startFraction: fraction,
    rate: iigsEnsoniq.outputRate(),
  }
  ensoniqActiveSegment = nextActive
  const expectedEnd = ensoniqOutCursor +
    Math.round(nextActive.rate * (1 - fraction) / 60)
  ensoniqEnsureScratch(expectedEnd)
}

export function ensoniqCatchUp() {
  if (ensoniqCatchUpBusy) return
  ensoniqCatchUpBusy = true
  try {
    const frameCycles = Math.max(1, cpuCyclesPerRefresh)
    // Video-clock position, not cycleCount: the DOC's sample clock is hardware
    // time, so a $C036 slow-mode flip must not move it.
    const refreshId = Math.floor(iigsVideoClock / frameCycles)
    if (refreshId !== ensoniqRefreshId) {
      // Complete the elapsed refresh, post its rate-labelled segments, then
      // start the new block at the new boundary.
      if (ensoniqRefreshId >= 0) ensoniqFinishRefreshBlock()
      ensoniqRefreshId = refreshId
      ensoniqOutCursor = 0
      ensoniqSegments = []
      ensoniqStartRefreshBlock()
    }
    if (!ensoniqActiveSegment) {
      ensoniqActiveSegment = { startCursor: 0, startFraction: 0, rate: iigsEnsoniq.outputRate() }
    }
    const fraction = (iigsVideoClock % frameCycles) / frameCycles
    const active = ensoniqActiveSegment
    const due = active.startCursor +
      Math.floor(active.rate * (fraction - active.startFraction) / 60)
    if (due > ensoniqOutCursor) ensoniqGenChunk(due)
  } finally {
    ensoniqCatchUpBusy = false
    if (ensoniqRebasePending) {
      ensoniqRebasePending = false
      ensoniqRebaseRateNow()
    }
  }
}

export function ensoniqRebaseAfterRateChange() {
  if (ensoniqCatchUpBusy) {
    ensoniqRebasePending = true
    return
  }
  ensoniqRebaseRateNow()
}

// Module-level registration: DOC device methods call these before applying a
// write and after a register-mode $E1 write.
iigsEnsoniq.docAccessCatchUp = ensoniqCatchUp
iigsEnsoniq.docRateRebase = ensoniqRebaseAfterRateChange

let cpuRunMode = RUN_MODE.IDLE
export const getCpuRunMode = () => cpuRunMode

let pendingRunModeOperation: number | undefined
let cyclesToRun = 0
let cycleToRunStart = -1
let executionSequence = 0
let executionState: "running" | "paused" = "paused"
let executionPauseReason: ExecutionPauseReason | null = "idle"
let executionBreakpointAddress: number | null = null
let executionMemoryWrite: MemoryWriteEvent | null = null
// let heatMapGetMem = false
let memoryDumpState: MEMORY_DUMP_STATE = MEMORY_DUMP_STATE.NONE
const frameClock = new FrameClock()
let machineName: MACHINE_NAME = "APPLE2EE"
let veraSlot: VERA_SLOT = 0
let autoSnapshot: AUTO_SNAPSHOT = AUTO_SNAPSHOT.AUTO_OFF
let autoSnapshotThreshold = 100000
let cyclesSinceLastSnapshot = 0
let takeSnapshot = false
let gameSetupTimerID: NodeJS.Timeout | number = 0
let tracing = TEST_DEBUG
let speedTracker: Array<{time: number, cycles: number}> = []

// export const setHeatMapGetMem = (state: boolean) => {
//   heatMapGetMem = state
//   updateExternalMachineState()
// }

export const setMemoryDumpState = (state: MEMORY_DUMP_STATE) => {
  memoryDumpState = state
  updateExternalMachineState()
}
  
export const resetCpuSpeedForTesting = () => {
  cpuSpeed = 0
}

export const getExternalMemoryView = (request: MemoryViewRequest) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Memory is available only while the emulator is paused")
  }
  return getMemoryView(request)
}

export const findExternalMemory = (request: MemorySearchRequest) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Memory is available only while the emulator is paused")
  }
  return findMemory(request)
}

export const createExternalSessionSnapshot = (snapshotId: string) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Session snapshots can be created only while the emulator is paused")
  }
  return createSessionSnapshot(snapshotId)
}

export const compareExternalSessionMemory = (request: SessionMemoryComparisonRequest) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Memory is available only while the emulator is paused")
  }
  return compareSessionMemory(request)
}

export const restoreExternalSessionSnapshot = (snapshotId: string) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Session snapshots can be restored only while the emulator is paused")
  }
  const receipt = restoreSessionSnapshot(snapshotId)
  doSetRunMode(RUN_MODE.PAUSED, false, undefined, {reason: "explicit"})
  return receipt
}

export const doSetMemoryWriteWatchpoint = (request: MemoryViewRequest) => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Memory write watchpoints can be changed only while the emulator is paused")
  }
  const resolved = resolveMemoryRangeRequest(request)
  if (resolved.length > 4096) {
    throw new Error("Memory write watchpoint length must be between 1 and 4096")
  }
  const auxBank = resolved.space === "aux" ? resolved.auxBank : null
  const watchpoint: MemoryWriteWatchpoint = {
    watchpointId: `mwp:${resolved.space}:${auxBank ?? "-"}:${resolved.address}:${resolved.length}`,
    address: resolved.address,
    length: resolved.length,
    space: resolved.space,
    auxBank,
  }
  setCpuMemoryWriteWatchpoint(watchpoint)
  return {...watchpoint, executionSequence}
}

export const doClearMemoryWriteWatchpoint = () => {
  if (cpuRunMode !== RUN_MODE.PAUSED) {
    throw new Error("Memory write watchpoints can be changed only while the emulator is paused")
  }
  return {cleared: setCpuMemoryWriteWatchpoint(null)}
}

export const setTracing = (doTracing: boolean) => {
  tracing = doTracing
}

// methods to capture start and end of VBL for other devices that may need it (mouse)
const startVBL = (): void => {
  SWITCHES.VBLINV.isSet = false
  onMouseVBL()
}

const endVBL = (): void => {
  SWITCHES.VBLINV.isSet = true
}

export const getSoftSwitches = (): SoftSwitchStates => {
  const softSwitches = {} as SoftSwitchStates
  for (const key in SWITCHES) {
    softSwitches[key as SoftSwitchName] = SWITCHES[key as SoftSwitchName].isSet
  }
  return softSwitches
}

export const getMachineName = () => {
  return machineName
}

export const doSetState6502 = (newState: STATE6502, operationId?: number) => {
  setState6502(newState)
  updateExternalMachineState()
  if (operationId !== undefined) passWorkerOperationResult(operationId)
}

const resetHeatMapCounts = () => {
  resetHeatMapCPU()
  resetHeatMapMemGet()
  resetHeatMapMemSet()
}

export const doSetCycleCount = (count: number) => {
  setCycleCount(count)
  resetHeatMapCounts()
  cyclesSinceLastSnapshot = s6502.cycleCount
  updateExternalMachineState()
}

export const doSetShowDebugTab = (show: boolean) => {
  showDebugTab = show
  updateExternalMachineState()
}

// const testTiming = () => {
//   let t0 = performance.now()
//   for (let j = 0; j < 10000; j++) {
//     for (let i = 0; i < 0xBFFF; i++) {
//       memGet(i, false)    
//     }
//   }
//   let tdiff = performance.now() - t0
//   console.log(`memGet time = ${tdiff}`)
//   t0 = performance.now()
//   for (let j = 0; j < 10000; j++) {
//     for (let i = 0; i < 0xBFFF; i++) {
//       memSet(i, 255)    
//     }
//   }
//   tdiff = performance.now() - t0
//   console.log(`memSet time = ${tdiff}`)
// }

export const softCard = new SoftCard(2)
let currentSlotConfig: SlotConfig = { ...DEFAULT_SLOT_CONFIG }

export const doSetSlotConfig = (config: SlotConfig) => {
  // The UI may post the saved classic layout first, before it applies a new
  // machine name. Never let a card that the selected machine has no hardware for
  // linger in the worker's slot config: a stale VERA at $C0xx otherwise keeps
  // its audio control visible after switching to the IIgs.
  currentSlotConfig = sanitizeSlotConfig(config, machineName)
  didConfiguration = false
  configureMachine()
  updateExternalMachineState()
}

export const getSlotConfig = () => {
  return currentSlotConfig
}

// $C02D follows the Control Panel assignment: a built-in function leaves the
// motherboard's slot firmware mapped, a card maps the card's ROM. Re-applied
// after any cold-boot path that touches the MMU registers.
export const applyIigsSlotConfig = () => {
  if (!isGSMachine(machineName)) return
  const register = iigsSlotRegisterFor(currentSlotConfig)
  setIigsSlotRegister(register)
  iigsRegisters[0x2D] = register
  updateAddressTables()
}

let didConfiguration = false
export const configureMachine = () => {
  if (didConfiguration) return
  didConfiguration = true
  resetCycleCountCallbacks()
  clearSlotCardStateHandlers()

  for (let s = 1; s <= 7; s++) {
    clearSlot(s)
  }

  // Apple IIgs: slots are Control Panel assignments, not card scans. Slots 1-6
  // normally run the motherboard's own slot firmware; only a configured card
  // gets its $C02D (SLTROMSEL) bit set.
  if (isGSMachine(machineName)) {
    disableVideoTerm()
    disableVidHD()
    setAuxCardEnabled(true)

    // Neither a SoftCard nor a Vera exists on the IIgs. A configure pass taken
    // for another machine - the UI posts the stored slot config before the
    // machine name on a fresh profile - leaves both flags set, and doBoot()
    // reads softCard.enabled as an input to the slot-7 decision.
    softCard.enabled = false
    veraSlot = 0

    // The built-in IWM serves both built-in drive families. The slot-5 Smart
    // Port (3.5") and slot-6 Disk Port (5.25") firmware lives in ROM, so no
    // card is installed for either.
    enableDiskDrive35()

    if (currentSlotConfig[1] === "gsPrinter" || currentSlotConfig[1] === "ssc") {
      // The SSC card and the built-in printer port are both a 6551 ACIA in the
      // slot-1 I/O space; $C02D decides whether the card's ROM or the internal
      // firmware at $FF:C100 answers.
      enableSerialCard(true, 1)
    }
    if (currentSlotConfig[4] === "mockingboard") {
      enableMockingboard(true, 4)
    }
    if (currentSlotConfig[7] === "smartport") {
      enableHardDrive(hasHardDriveMounted())
    }

    applyIigsSlotConfig()

    get6502Instructions()
    return
  }

  // Apple IIe/II+ configuration continues below...

  // Ensure Slot 3 is configured properly: on IIe default to 'aux', 'vidhd' or 'none', on II+ allow 'videoterm', 'vidhd' or 'none'
  if (machineName === "APPLE2P") {
    if (currentSlotConfig[3] !== "none" && currentSlotConfig[3] !== "videoterm" && currentSlotConfig[3] !== "vidhd") {
      currentSlotConfig[3] = "videoterm"
    }
  } else {
    if (currentSlotConfig[3] !== "none" && currentSlotConfig[3] !== "aux" && currentSlotConfig[3] !== "vidhd") {
      currentSlotConfig[3] = "aux"
    }
  }

  softCard.enabled = false
  veraSlot = 0

  const setupSoftCard = (slot: number) => {
    clearSlot(slot)
    softCard.slot = slot
    softCard.enabled = true
    softCard.setMemoryBus({
      read: (addr: number) => memGet(addr, false),
      write: (addr: number, val: number) => memSet(addr, val),
    })
    setSlotIOCallback(slot, (addr: number, value = -1) => {
      if ((addr >> 8) === (0xC0 + slot) && value >= 0) {
        softCard.activateZ80()
      }
      return -1
    })
  }

  // Slot 1
  if (currentSlotConfig[1] === "ssc") {
    enableSerialCard()
  }

  // Slot 2
  if (currentSlotConfig[2] === "softcard") {
    setupSoftCard(2)
  } else if (currentSlotConfig[2] === "passport") {
    enablePassportCard(true, 2)
  } else if (currentSlotConfig[2] === "vera") {
    enableVera(true, 2)
    veraSlot = 2
  }

  // Slot 3
  if (currentSlotConfig[3] === "videoterm") {
    enableVideoTerm()
  } else {
    disableVideoTerm()
  }
  if (currentSlotConfig[3] === "vidhd") {
    enableVidHD(3)
  } else {
    disableVidHD()
  }
  setAuxCardEnabled(currentSlotConfig[3] === "aux" || currentSlotConfig[3] === "vidhd")

  // Slot 4
  if (currentSlotConfig[4] === "mockingboard") {
    enableMockingboard(true, 4)
  } else if (currentSlotConfig[4] === "mouse") {
    enableMouseCard(true, 4)
  } else if (currentSlotConfig[4] === "vera") {
    enableVera(true, 4)
    veraSlot = 4
  } else if (currentSlotConfig[4] === "softcard") {
    setupSoftCard(4)
  }

  // Slot 5
  if (currentSlotConfig[5] === "mouse") {
    enableMouseCard(true, 5)
  } else if (currentSlotConfig[5] === "mockingboard") {
    enableMockingboard(true, 5)
  } else if (currentSlotConfig[5] === "softcard") {
    setupSoftCard(5)
  }

  // Slot 6
  if (currentSlotConfig[6] === "disk2") {
    enableDiskDrive()
  }

  // Slot 7
  if (currentSlotConfig[7] === "smartport") {
    if (!softCard.enabled || hasHardDriveMounted()) {
      enableHardDrive()
    }
  }

  get6502Instructions()
}

export const enableVidHD = (slot = 3) => {
  vidhd.enabled = true
  vidhd.slot = slot
  vidhd.reset()
  setSlotDriver(slot, vidhd.rom)
}

export const disableVidHD = () => {
  vidhd.enabled = false
  vidhd.reset()
}

const iigsHasHardDriveMedia = () => {
  return getHardDriveState(1).filename !== "" || getHardDriveState(2).filename !== ""
}

// True when the Apple IIgs has a disk image in either of its built-in floppy
// bays: slot 6 (5.25", drive-state indices 2/3) or slot 5 (3.5", indices 4/5).
// Tests for actual media the same way the IWM data path does
// (iigsFloppyHasMedia), so the two can never disagree about whether a drive is
// loaded. Also covers the Slot 7 SmartPort hard drives, so that mounting a
// hard-disk image and pressing Ctrl-Reset re-runs the full device scan
// (matching section 26a's floppy fix).
const iigsHasFloppyMedia = () => {
  for (const index of [2, 3, 4, 5]) {
    if (iigsFloppyHasMedia(index)) return true
  }
  return false
}

const iigsHasAnyDiskMedia = () => iigsHasFloppyMedia() || iigsHasHardDriveMedia()

const resetMachine = () => {
  softCard.reset()
  videoTerm.reset()
  if (vidhd.enabled) {
    vidhd.reset()
  }
  resetFloppyDrives()
  setButtonState()
  resetMouse()
  // The ADB micro's internal RAM survives a system reset, and the ROM keeps its
  // warm-boot marker in uC RAM $51 ($A5 = warm, see iigsADB.reset()). Ctrl-Reset
  // must leave that RAM in place, including when it is pressed during the boot's
  // device scan: a real Ctrl-Reset is warm, and clearing this marker made every
  // press restart the full power-on ADB/device scan, which is what the user felt
  // as a complete reset. doBoot() still clears it for a real power-on cold start.
  iigsADB.reset(false)
  resetPassport()
  if (veraSlot !== 0) {
    resetVera()
  }
  resetSerial()
  // A Ctrl-Reset or reboot can arrive mid-RTC transaction; without clearing the
  // CB serial framing/serial state the ROM's battery-RAM signature read fails
  // into the fatal-error path (ROM 03 in particular). Cold boot reseeds BRAM
  // through memoryReset()/iigsClock.reset(true); a reset only clears transaction.
  if (isGSMachine(machineName)) {
    iigsClock.reset(false)
  }
  // A reset or reboot must silence every sound device still holding state, not
  // just the slot cards. The Mockingboard oscillators keep their timer state in
  // slot ROM, and the IIgs DOC keeps its oscillator/wavetable state in the chip,
  // so both would keep sounding (or ringing) after Ctrl-Reset without this.
  if (currentSlotConfig[4] === "mockingboard") {
    resetMockingboard(4)
  }
  if (currentSlotConfig[5] === "mockingboard") {
    resetMockingboard(5)
  }
  if (isGSMachine(machineName)) {
    iigsEnsoniq.reset()
  }
}

export const doBoot = () => {
  setCycleCount(0)
  memoryReset()
  if (isGSMachine(machineName)) iigsEnsoniq.reset()
  doSetRom(machineName)
  // memoryReset() wipes the peripheral-card windows, so a boot has to rebuild
  // the slot layout even when configureMachine() already ran for a mounted
  // image. Leaving didConfiguration set made the second boot leave every slot
  // ROM at the power-up fill: VERA, serial, and the other cards vanished until
  // the next doSetSlotConfig() call, and the rebooted game could not initialize
  // the card whose reset handler had just asked the ROM to boot it.
  didConfiguration = false
  configureMachine()
  if (code.length > 0) {
    const pcode = parseAssembly(0x300, code.split("\n"))
    memory.set(pcode, 0x300)
  }
//  testTiming()

  const isIigs = isGSMachine(machineName)

  if (isIigs ? hasHardDriveMounted() : (!softCard.enabled || hasHardDriveMounted())) {
    enableHardDrive()
  }

  if (isIigs) {
    iigsInitInterrupts()
    applyIigsSlotConfig()
  }
  doReset()
  // Power-on is a cold start: the ADB micro-controller's internal RAM (and with
  // it the ROM's warm-boot marker at uC RAM $51) is undefined until the ROM
  // writes it, unlike a Ctrl-Reset which leaves it in place. doReset() above
  // deliberately keeps that RAM warm for every reset, so the boot must clear it
  // after, not before (the reset would otherwise undo the power-on cold start).
  iigsADB.reset(true)
  // This is a hack. If we don't currently have a hard drive image on boot,
  // temporarily disable the hard drive and then re-enable it later.
  // This allows the floppy disk to boot instead.
  const ds = getHardDriveState(1)
  if (ds.filename === "") {
    enableHardDrive(false)
    // The IIgs does not re-enable on a timer: mounting an image enables the
    // driver itself, and the ROM's device scan is still running 200 ms after a
    // cold boot, so a card that appears mid-scan becomes the startup device and
    // the 3.5"/5.25" firmware is never tried.
    if (!isIigs && (!softCard.enabled || hasHardDriveMounted())) {
      setTimeout(() => { enableHardDrive() }, 200)
    }
  }
}

export const doReset = () => {
  clearInterrupts()
  resetSoftSwitches()
  resetIigsVideoClock()
  // The displayed SHR frame is beam-captured, so a reset must drop the last
  // frame's contents instead of letting them be posted until the beam repaints
  // a line (which never happens while the machine sits paused).
  resetShrBeamFrame()
  // Reset banked RAM
  memGet(0xC082, false)
  cpu.reset()
  if (isGSMachine(machineName)) {
    iigsClearInterrupts()
    // A reset must clear the interrupt enable too, not just the pending flags.
    // iigsClearInterrupts() leaves $C041 INTEN untouched; GS/OS keeps its VBL
    // enable (bit 3) there, and the first post-reset VBL re-raises $C046 bit 7
    // from the stale enable. The ROM then takes the diagnostic self-test path
    // (System Bad: FFFF0000) instead of booting. Cold boot already zeroes $C041
    // in memory.ts; Ctrl-Reset needs the same.
    iigsRegisters[0x41] = 0
    // A hardware reset returns the CPU to fast mode; software reads the same
    // value back from $C036, so keep both views in step across Ctrl-Reset.
    // ROM 03 additionally latches bit 6 (power-on status) on reset.
    const speedRegister = isIigsRom03() ? 0xC0 : 0x80
    setIigsSpeedRegister(speedRegister)
    iigsRegisters[0x36] = speedRegister
    // The IWM's logic state sequencer runs on wall-clock cycles. A reset can
    // follow a long pause (breakpoint, menu), so restart its timing rather
    // than letting it shift thousands of idle bits into the data register.
    iwmResetTiming()
    // The IIgs ROM decides cold boot vs warm reset with
    //   LDA $03F3 / EOR #$A5 / CMP $03F4
    // and the boot sequence writes that signature into $03F2-$03F4 as it goes.
    // Once it is there, a reset is treated as "warm": the ROM walks the slots
    // but never touches the IWM (measured: 0 $C0E0-$C0EF reads after a
    // Ctrl-Reset, against 399,707 during the cold boot that does find the
    // disk), so inserting a floppy and pressing Ctrl-Reset could never boot it.
    //
    // Clear the signature whenever media is present, including while the ROM is
    // still publishing the provisional $00/$E0/$45 value. The ROM's warm path
    // jumps through that provisional value to the device-scan code, but a reset
    // has already torn down the scan's state: measured, preserving it + the warm
    // ADB marker leaves the ROM idling on the copyright screen with zero IWM
    // reads. Zeroing it makes the ROM re-run the scan, which with the warm ADB
    // marker reaches ProDOS again in ~175 frames (5.25") without clearing the
    // ADB RAM, so repeated Ctrl-Reset presses behave like a warm reset rather
    // than a power-on cold start. With no media the warm path is kept, which is
    // what makes Ctrl-Reset land on the Applesoft prompt (gs_ctrl_reset.test.ts).
    if (iigsHasAnyDiskMedia()) {
      memSet24(0x000000 + 0x03f2, 0x00)
      memSet24(0x000000 + 0x03f3, 0x00)
      memSet24(0x000000 + 0x03f4, 0x00)
    }
    // A hardware reset clears SLTROMSEL; the machine then re-applies the
    // Control Panel assignment.
    applyIigsSlotConfig()
    // The ADB micro-controller repeat-rate table follows the installed ROM:
    // ROM 03's table is the reverse order plus two extra-slow slots.
    iigsADB.setRom03(isIigsRom03())
  }
  resetMachine()
  // Boot and Ctrl-Reset must silence transports that hold already-scheduled
  // audio (Mockingboard oscillators/envelopes, MIDI notes, the VERA PSG/FM/PCM
  // queue, and DOC buffers). resetMachine() clears the worker-side sound-chip
  // state; this companion signal clears the UI-side scheduling graphs.
  passAudioReset()
  // Otherwise Heat Map data survives a reset/reboot indefinitely (it was
  // previously cleared only by doSetCycleCount, a time-travel-only path),
  // so PC/memory activity from before this reboot stays mixed in with the
  // new run.
  resetHeatMapCounts()
  cyclesSinceLastSnapshot = s6502.cycleCount
  // Force the help text panel back to default on reset/reboot paths.
  handleGameSetup(true)
}

// The theoretical maximum speed is about 66 MHz if we completely disable
// the 6502 cpu and just do screen refreshes.
// If we enable the 6502, and just play with the cpuCyclesPerRefresh,
// then for the Choplifter demo screen the results look something like:
//  17030:     5.5 MHz
//  17030 * 2: 9.2 MHz
//  17030 * 3: 12.9 MHz
//  17030 * 4: 15.4 MHz
//  17030 * 5: 17.4 MHz
//  17030 * 10: 23.8 MHz
//  17030 * 20: 29.1 MHz
//
// If we also change the GUI iRefresh interval (see down below) to 10,
// then we get:
//  17030:     17.5 MHz
//  17030 * 2: 24.4 MHz
//  17030 * 3: 27.3 MHz
//  17030 * 4: 29.2 MHz
//  17030 * 5: 30.8 MHz
//  17030 * 10: 33.2 MHz
//
// Note that making the cyclesPerRefresh too large can cause games to be
// less responsive to keyboard input, since we're checking the keyboard
// less often.
export const doSetSpeedMode = (speedModeIn: number, operationId?: number) => {
  speedMode = speedModeIn
  speedModeExplicit = true
  // Profiles own the refresh budget, so a machine switch cannot pair a GS
  // cycle table with a classic refresh interval. Warp yields to the timer.
  const profile = getMachineProfile(machineName)
  refreshTime = speedMode === 4 ? 0 : profile.speed.refreshTime
  cpuCyclesPerRefresh = getProfileCyclesPerRefresh(profile, speedMode)
  setJoystickCyclesPerRefresh(cpuCyclesPerRefresh)
  // The new CPU rate changes frame length, so restart the clock in the new
  // frame â€” but not the captured-row boundary: the guest is still painting
  // the frame the beam is halfway through, and -1 here would make the next run
  // loop call beginShrFrame() mid-refresh and drop those late draws.
  resetIigsVideoClock(true)
  resetRefreshCounter()
  updateExternalMachineState()
  if (operationId !== undefined) passWorkerOperationResult(operationId)
}

export const doSetAppMode = (mode: string) => {
  appMode = mode
}

export const runOnlyMode = () => {
  return appMode === "game" || appMode === "embed"
}

export const doSetIsDebugging = (enable: boolean) => {
  isDebugging = enable
  updateExternalMachineState()
}

export const doSetAutoSnapshot = (autoSnapshotIn: AUTO_SNAPSHOT) => {
  autoSnapshot = autoSnapshotIn
  cyclesSinceLastSnapshot = s6502.cycleCount
  switch (autoSnapshot) {
    case AUTO_SNAPSHOT.AUTO_OFF:  // fall through
    case AUTO_SNAPSHOT.AUTO_100K:
      autoSnapshotThreshold = 100000
      break
    case AUTO_SNAPSHOT.AUTO_1M:
      autoSnapshotThreshold = 1000000
      break
    default:
      console.error(`Unknown auto snapshot mode: ${autoSnapshot}`)
      autoSnapshotThreshold = 100000
      break
  }
}

export const doSetMemory = (addr: number, value: number) => {
  if (addr >> 8 === 0xC0) {
    memSet(addr, value)
  } else {
    memory[addr] = value
  }
  // If we have set an HGR memory location (for example) be sure to
  // pass our updated data to the main thread.
  if (addr >= 0x2000 && addr <= 0x5FFF && cpuRunMode === RUN_MODE.PAUSED) {
    exportMemoryToHiresLine(hiresAddressToLine(addr))
  }
  updateExternalMachineState()
}

export const doWriteMemory = (addr: number, data: Uint8Array, operationId?: number) => {
  let bytesProcessed = 0
  try {
    for (const value of data) {
      memSet(addr + bytesProcessed, value)
      bytesProcessed += 1
    }
    refreshMemoryBlock(addr, data.length)
    if (operationId !== undefined) passWorkerOperationResult(operationId)
  } catch (error) {
    if (operationId === undefined) throw error
    passWorkerOperationResult(
      operationId,
      `Memory write processed ${bytesProcessed} of ${data.length} bytes; the next byte and earlier writes may have taken effect. ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

const refreshMemoryBlock = (addr: number, length: number) => {
  if (cpuRunMode === RUN_MODE.PAUSED) {
    const hiresLines = new Set<number>()
    for (let offset = 0; offset < length; offset++) {
      const address = addr + offset
      if (address >= 0x2000 && address <= 0x5FFF) {
        hiresLines.add(hiresAddressToLine(address))
      }
    }
    hiresLines.forEach(exportMemoryToHiresLine)
  }
  updateExternalMachineState()
}

export const doLoadBinary = (
  addr: number,
  data: Uint8Array,
  operationId?: number,
) => {
  try {
    configureMachine()
    loadMainMemoryBlock(addr, data)
    refreshMemoryBlock(addr, data.length)
    if (operationId !== undefined) passWorkerOperationResult(operationId)
  } catch (error) {
    if (operationId === undefined) throw error
    passWorkerOperationResult(operationId, error instanceof Error ? error.message : String(error))
  }
}

export const doSetMachineName = (name: MACHINE_NAME, reset = true, publishState = true) => {
  machineName = name
  // The paddle hardware times out in wall-clock time, but the guest measures it
  // in raw CPU cycles and a classic title on the IIgs can calibrate its own loop
  // against the 1.020484 MHz slow clock ($C036 bit 7 clear). Normalise the
  // measured cycles against that execution-rate request, not the Settings budget,
  // or a centred stick reads as full deflection when the user selected 2.8 MHz
  // for a title that runs its paddle code at 1.02 MHz. Registration must happen
  // here, not at module load: motherboard.ts is imported back through the
  // joystick's game_mappings -> keyboard -> memory cycle, so the joystick export
  // is only fully bound once the worker modules have all loaded.
  setJoystickClockSource(() => ({
    cyclesPerRefresh: cpuCyclesPerRefresh,
    slowMode: isGSMachine(machineName) && isIigsSlowMode(),
  }))

  if (isGSMachine(machineName)) {
    cpu = new CPU65816(memGet24, memSet24)
    ;(cpu as CPU65816).setVectorReadCallback((address: number) => {
      // 65816 vector pull (VP) always reads from Bank $FF ROM on Apple IIgs
      return memGet24(0xFF0000 | (address & 0xFFFF))
    })
  } else {
    cpu = new CPU6502Wrapper()
  }
  // Let debugging instrumentation (iigs_adb etc., which cannot import this
  // module without a cycle) see where in the guest a softswitch read happened.
  setCpuPcGetter(() => {
    const c = cpu as unknown as { PB?: number; PC?: number }
    return c.PB !== undefined && c.PC !== undefined ? (c.PB << 16) | c.PC : -1
  })

  const profile = getMachineProfile(name)
  if (profile.family === "gs") {
    currentSlotConfig = getProfileDefaultSlotConfig(profile, name)
  } else {
    // Switching between classic models keeps the user's card layout; only slot
    // 3 has to change family (Videoterm on the II+, RAMWorks on the IIe).
    const slot3Cards = getProfileSlotChoices(profile, name, 3).map(choice => choice.card)
    if (!slot3Cards.includes(currentSlotConfig[3])) {
      currentSlotConfig[3] = getProfileDefaultSlotConfig(profile, name)[3]
    }
  }
  didConfiguration = false
  doSetRom(machineName)
  configureMachine()
  if (!speedModeExplicit) speedMode = getProfileDefaultSpeedMode(profile)
  refreshTime = speedMode === 4 ? 0 : profile.speed.refreshTime
  cpuCyclesPerRefresh = getProfileCyclesPerRefresh(profile, speedMode)
  setJoystickCyclesPerRefresh(cpuCyclesPerRefresh)
  if (isGSMachine(machineName)) {
    iigsInitInterrupts()
    applyIigsSlotConfig()
  }
  if (reset) doReset()
  if (publishState) updateExternalMachineState()
}

// The IIgs ROM revision is a machine-wide choice (machine menu "ROM 01" /
// "ROM 03"). Swapping the system ROM is a hardware change, so it cold-boots:
// doBoot() reloads the ROM, clears memory and runs the reset path.
export const doSetIigsRomVersion = (version: IigsRomVersion, reset = true, publishState = true) => {
  if (!setIigsRomVersion(version)) return
  if (isGSMachine(machineName)) {
    if (reset) {
      doBoot()
    } else {
      doSetRom(machineName)
      didConfiguration = false
      configureMachine()
      iigsInitInterrupts()
    }
  }
  if (publishState) updateExternalMachineState()
}

export const doSetVeraSlot = (slot: VERA_SLOT) => {
  if (slot !== 0 && slot !== 2 && slot !== 4) return
  if (!getMachineCapabilities(machineName).hasVeraCard) {
    // Preferences keep a classic VERA slot across machine switches, but the
    // IIgs has no slot card bus position for it. Clearing it here must not
    // mutate the GS Control Panel's built-in slot assignments.
    if (veraSlot !== 0) {
      veraSlot = 0
      didConfiguration = false
      configureMachine()
      updateExternalMachineState()
    }
    return
  }
  if (veraSlot === slot) return
  veraSlot = slot
  if (slot === 2) {
    currentSlotConfig[2] = "vera"
    if (currentSlotConfig[4] === "vera") currentSlotConfig[4] = "none"
  } else if (slot === 4) {
    currentSlotConfig[4] = "vera"
    if (currentSlotConfig[2] === "vera") currentSlotConfig[2] = "none"
  } else {
    if (currentSlotConfig[2] === "vera") currentSlotConfig[2] = "none"
    if (currentSlotConfig[4] === "vera") currentSlotConfig[4] = "none"
  }
  didConfiguration = false
  configureMachine()
  updateExternalMachineState()
}

// Temporarily hijack the CPU to change the string variable value.
// Put the string `name="value"` into the $200 input buffer and then call
// the Applesoft routine to parse it and set the new value.
export const doExecuteBasicCommand = (command: string) => {
  const prevState = {...s6502}
  const stackPlusBuffer = getDataBlock(0x100)
  const code = `
       JSR   $D82A
LOOP   JMP   LOOP
`
  const addr = 0x100
  const pcode = parseAssembly(addr, code.split("\n"))
  for (let i = 0; i < command.length; i++) {
    memory[0x200 + i] = command.charCodeAt(i)
  }
  memory[0x200 + command.length] = 0  // null terminate the command
  memory.set(pcode, addr)
  // Applesoft expects to find the input buffer address at $B8, $B9.
  memory[0xB8] = 0x00
  memory[0xB9] = 0x02
  // Accumulator is expected to contain the first character of the variable name.
  s6502.Accum = command.charCodeAt(0)
  s6502.PC = addr
  // Applesoft takes about 1100 cycles + 39 cycles per character to process a string,
  // and about 20,000 cycles to process a float.
  // So just wait a bit longer than that before restoring our previous state.
  setTimeout(() => {
    setMemoryBlock(0x100, stackPlusBuffer)
    setState6502(prevState)
  }, 30)
}

export const doSetRamWorks = (size: number) => {
  setRamWorks(size)
  updateExternalMachineState()
}

// Snapshots are requested from several directions - auto-repeat keystrokes, breakpoint
// "snapshot" actions, and the Time Travel button - and each one needs to land at the end
// of a display cycle rather than mid-instruction, so requests are collapsed into a single
// trailing timeout.
const SNAPSHOT_COLLAPSE_MS = 90
// A trailing timeout with no floor can be starved: a caller that keeps firing more often
// than SNAPSHOT_COLLAPSE_MS would reset the timer forever and the snapshot would never be
// taken, silently. Once a burst has run this long, stop collapsing and take it anyway.
const SNAPSHOT_MAX_WAIT_MS = 200

let timeout: NodeJS.Timeout | null = null
let firstRequestTime: number | null = null

// Set a flag and save our slice at the end of the next 6502 display cycle.
// Otherwise we risk saving in the middle of a keystroke.
export const requestSnapshot = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  const now = performance.now()
  if (firstRequestTime === null) firstRequestTime = now
  // Have we waited too long?
  if ((now - firstRequestTime) >= SNAPSHOT_MAX_WAIT_MS) {
    firstRequestTime = null
    takeSnapshot = true
  } else {
    timeout = setTimeout(() => {
      takeSnapshot = true
      timeout = null
      firstRequestTime = null
    }, SNAPSHOT_COLLAPSE_MS)
  }
}

export const doStepInto = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  // Remove all tracelog values if we are no longer tracing.
  if (!tracing) clearTracelog()
  if (cpu.processInstruction(tracing ? updateTrace : null) !== -1) {
    doSetRunMode(RUN_MODE.PAUSED, true, undefined, {reason: "step"})
  }
}

export const doStepOver = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  if (memGet(s6502.PC, false) === 0x20) {
    // Remove all tracelog values if we are no longer tracing.
    if (!tracing) clearTracelog()
    // If we're at a JSR then briefly step in, then step out.
    if (cpu.processInstruction(tracing ? updateTrace : null) !== -1) doStepOut()
  } else {
    // Otherwise just do a single step.
    doStepInto()
  }
}

export const doStepOut = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  setStepOut()
  doSetRunMode(RUN_MODE.RUNNING)
}

const resetRefreshCounter = () => {
  speedTracker = [{time: performance.now(), cycles: s6502.cycleCount}]
  frameClock.reset(performance.now())
}

export const doSetRunMode = (
  cpuRunModeIn: RUN_MODE,
  doShowDebugTab = true,
  operationId?: number,
  stop?: ExecutionStopDescriptor,
) => {
  if (cpuRunModeIn !== RUN_MODE.RUNNING) {
    requestConditionalInputTermination("unexpected_stop")
    interruptKeySequence()
  }
  if (pendingRunModeOperation !== undefined && pendingRunModeOperation !== operationId) {
    passWorkerOperationResult(pendingRunModeOperation, "Worker operation was superseded")
  }
  const isTransitional = cpuRunModeIn === RUN_MODE.NEED_BOOT || cpuRunModeIn === RUN_MODE.NEED_RESET
  pendingRunModeOperation = isTransitional ? operationId : undefined
  configureMachine()
  if (doShowDebugTab && cpuRunMode === RUN_MODE.RUNNING && cpuRunModeIn === RUN_MODE.PAUSED) {
    showDebugTab = true
  }
  cpuRunMode = cpuRunModeIn
  if (cpuRunMode === RUN_MODE.RUNNING && executionState !== "running") {
    executionSequence++
    executionState = "running"
    executionPauseReason = null
    executionBreakpointAddress = null
    executionMemoryWrite = null
    if (cyclesToRun > 0) {
      cycleToRunStart = s6502.cycleCount
    }
  } else if (cpuRunMode === RUN_MODE.PAUSED && (executionState !== "paused" || stop !== undefined)) {
    executionSequence++
    executionState = "paused"
    executionPauseReason = stop?.reason ?? "explicit"
    executionBreakpointAddress = stop?.breakpointAddress ?? null
    executionMemoryWrite = stop?.memoryWrite ?? null
  } else if (
    cpuRunMode === RUN_MODE.IDLE
    && (executionState !== "paused" || executionPauseReason !== "idle")
  ) {
    executionSequence++
    executionState = "paused"
    executionPauseReason = "idle"
    executionBreakpointAddress = null
    executionMemoryWrite = null
  }
  if (cpuRunMode === RUN_MODE.PAUSED) {
    syncSoftSwitchStatusFlags()
    if (gameSetupTimerID) {
      clearInterval(gameSetupTimerID)
      gameSetupTimerID = 0
    }
    doPauseDrive()
  } else if (cpuRunMode === RUN_MODE.RUNNING) {
    doPauseDrive(true)
    doSetBreakpointSkipOnce()
    // If we go back in time and then resume running, remove all future states.
    fixSaveStates()
    if (!gameSetupTimerID) {
      gameSetupTimerID = setInterval(handleGameSetup, 1000)
    }  
  }
  // Remove all tracelog values if we are no longer tracing.
  if (!tracing) clearTracelog()
  updateExternalMachineState()
  if (cpuRunModeIn !== RUN_MODE.RUNNING && !isTransitional) {
    finishConditionalInputSequence(s6502.cycleCount)
  }
  resetRefreshCounter()
  // Jump start the emulator if we have never executed anything.
  if (cpuSpeed === 0) {
    cpuSpeed = 1
    doAdvance6502Timer()
  }
  if (operationId !== undefined && !isTransitional) passWorkerOperationResult(operationId)
}

export const doSetCyclesToRun = (cycles: number) => {
  if (isNaN(cycles) || cycles < 1) {
    cyclesToRun = 0
  } else {
    cyclesToRun = cycles
  }
}

const doAutoboot = (fn: () => void) => {
  if (cpuRunMode === RUN_MODE.IDLE) {
    doSetRunMode(RUN_MODE.NEED_BOOT)
    // Wait a bit for the cpu to boot and then do reset.
    setTimeout(() => {
      doSetRunMode(RUN_MODE.NEED_RESET)
      // After giving the reset some time, load the binary block.
      setTimeout(() => { fn() }, 200)
    }, 200)
  } else {
    fn()
  }
}

export const doSetBinaryBlock = (addr: number, data: Uint8Array, run: boolean) => {
  const loadBlock = () => {
    setMemoryBlock(addr, data)
    if (run) {
      setPC(addr)
    }
  }
  doAutoboot(loadBlock)
}

export const doRunBinary = (addr: number, data: Uint8Array, entryAddress = addr) => {
  // A direct run starts from reset hardware state before execution resumes.
  configureMachine()
  doReset()
  setMemoryBlock(addr, data)
  setPC(entryAddress)
  doSetRunMode(RUN_MODE.RUNNING, false)
}

export const doSetPastedText = (text: string) => {
  const doPaste = () => {
    sendPastedText(text)
  }
  doAutoboot(doPaste)
}

const getMemoryDump = () => {
  if (cpuRunMode === RUN_MODE.IDLE || !isDebugging) {
    return new Uint8Array()
  }
  // Only get the memory relevant to the current memory dump state.
  switch (memoryDumpState) {
    case MEMORY_DUMP_STATE.CURRENT:
      return getCurrentMemory()
    case MEMORY_DUMP_STATE.MAIN:
      return getMainMemory()
    case MEMORY_DUMP_STATE.AUX:
      return getAuxMemory()
    case MEMORY_DUMP_STATE.HGR1:
      return getHgr1Memory()
    case MEMORY_DUMP_STATE.HGR2:
      return getHgr2Memory()
    case MEMORY_DUMP_STATE.NONE:
    default:
      return new Uint8Array()
  }
}

const getCurrentMemoryIfNeeded = () => {
  if (cpuRunMode === RUN_MODE.IDLE || !isDebugging || memoryDumpState === MEMORY_DUMP_STATE.CURRENT) {
    return new Uint8Array()
  }
  return getCurrentMemory()
}

const getBasicMemory = () => {
  const zp = getZeroPage()
  const varStart = zp[0x69] | (zp[0x6A] << 8)
  const arrStart = zp[0x6B] | (zp[0x6C] << 8)
  let basicVars = memory.slice(varStart, arrStart + 1)
  const nvarLength = basicVars.length - 1
  // Make sure there's a zero byte at the end of the variables.
  basicVars[nvarLength] = 0
  // For strings, extract the string, append them to the end of basicVars,
  // and then update the pointer to point to the new location.
  for (let addr = 0; addr < nvarLength; addr += 7) {
    const vardata = basicVars.slice(addr, addr + 7)
    const nameByte1 = vardata[0]
    if (nameByte1 === 0) break // No more variables
    const nameByte2 = vardata[1]
    const isString = (nameByte1 & 0x80) === 0 && (nameByte2 & 0x80)
    if (isString) {
      const strAddr = vardata[3] | (vardata[4] << 8)
      const strLen = vardata[2]
      const value = memory.slice(strAddr, strAddr + strLen)
      basicVars[addr + 3] = basicVars.length & 0xFF
      basicVars[addr + 4] = (basicVars.length >> 8) & 0xFF
      basicVars = new Uint8Array([...basicVars, ...value])
    }
  }
  return basicVars
}

const doGetStackString = () => {
  return (cpuRunMode !== RUN_MODE.IDLE) ? getStackString() : ""
}

let didPassSoftSwitchDescriptions = false

export const getExternalMachineState = () => {
  // Make sure the push button values are up to date, since they can
  // be modifed by other softswitches (like for the Sirius Joyport).
  memGet(SWITCHES.PB0.isSetAddr, false)
  memGet(SWITCHES.PB1.isSetAddr, false)
  const state: MachineState = {
    addressGetTable: addressGetTable,
    altChar: SWITCHES.ALTCHARSET.isSet,
    basicMemory: getBasicMemory(),
    breakpoints: breakpointMap,
    button0: SWITCHES.PB0.isSet,
    button1: SWITCHES.PB1.isSet,
    canGoBackward: getGoBackwardIndex() >= 0,
    canGoForward: getGoForwardIndex() >= 0,
    c800Slot: C800SlotGet(),
    cout: memGet(0x0039, false) << 8 | memGet(0x0038, false),
    cpuSpeed: cpuSpeed,
    currentMemory: getCurrentMemoryIfNeeded(),
    extraRamSize: 64 * (RamWorksMaxBank + 1),
    execution: {
      executionSequence,
      state: executionState,
      pauseReason: executionPauseReason,
      breakpoint: executionBreakpointAddress === null ? null : {
        breakpointId: `bp:${executionBreakpointAddress}`,
        address: executionBreakpointAddress,
      },
      memoryWrite: executionMemoryWrite,
      PC: s6502.PC,
      A: s6502.Accum,
      X: s6502.XReg,
      Y: s6502.YReg,
      S: s6502.StackPtr,
      PStatus: s6502.PStatus,
      machineName,
      memoryConfiguration: {
        slot3Card: currentSlotConfig[3],
        ramWorksKb: 64 * (RamWorksMaxBank + 1),
      },
    },
    heatMapCPU: getHeatMapCPU(),
    heatMapCPUMax: getHeatMapCPUMax(),
    heatMapGetMem: getHeatMapMemGet(),
    heatMapGetMemMax: getHeatMapMemGetMax(),
    heatMapSetMem: getHeatMapMemSet(),
    heatMapSetMemMax: getHeatMapMemSetMax(),
    hires: getHires(),
    iTempState: getTempStateIndex(),
    isDebugging: isDebugging,
    isTracing: tracing,
    lores: getTextPage(true),
    machineName: machineName,
    memoryDump: getMemoryDump(),
    noDelayMode: !SWITCHES.COLUMN80.isSet && SWITCHES.DHIRES.isSet && machineName !== "APPLE2P",
    ramWorksBank: RamWorksBankGet(),
    runMode: cpuRunMode,
    s6502: s6502,
    showDebugTab: showDebugTab,
    shr: getShrCompletedDisplay(),
    slotConfig: currentSlotConfig,
    softSwitches: getSoftSwitches(),
    speedMode: speedMode,
    stackString: doGetStackString(),
    textPage: getTextPage(),
    timeTravelThumbnails: getTimeTravelThumbnails(),
    tracelog: cpuRunMode === RUN_MODE.PAUSED ? getTracelog() : [],
    veraSlot: veraSlot,
    vidhdActive: vidhd.active || ((gsROM && gsROM.length > 0) ? SWITCHES.NEWVIDEO.isSet : false),
    zeroPage: getZeroPage(),
  }
  return state
}

export const updateExternalMachineState = () => {
  const state = getExternalMachineState()
  passMachineState(state)
  // We need to pass this just once to the UI thread, so it can display
  // the list of soft switches in the breakpoint dialog. Crossing my fingers
  // that this will _always_ get called before someone displays the dialog.
  if (!didPassSoftSwitchDescriptions) {
    didPassSoftSwitchDescriptions = true
    passSoftSwitchDescriptions(getSoftSwitchDescriptions())
  }

}


export const forceSoftSwitches = (addresses: Array<number> | null) => {
  if (addresses) {
    for (let i = 0; i < addresses.length; i++) {
      overrideSoftSwitch(addresses[i])
    }
  } else {
    restoreSoftSwitches()
  }
  if (addresses && (addresses[0] <= 0xC00F || addresses[0] >= 0xC050)) {
    updateAddressTables()
  }
  updateExternalMachineState()
}

export const forceVideo7Override = (override: Video7Override) => {
  setVideo7Override(override.mode, override.enabled)
  updateAddressTables()
  updateExternalMachineState()
}


const doAdvance6502 = () => {
  if (cpuRunMode === RUN_MODE.IDLE || cpuRunMode === RUN_MODE.PAUSED) {
    return
  }
  if (cpuRunMode === RUN_MODE.NEED_BOOT) {
    const operationId = pendingRunModeOperation
    pendingRunModeOperation = undefined
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING)
    if (operationId !== undefined) passWorkerOperationResult(operationId)
  } else if (cpuRunMode === RUN_MODE.NEED_RESET) {
    const operationId = pendingRunModeOperation
    pendingRunModeOperation = undefined
    doReset()
    doSetRunMode(RUN_MODE.RUNNING)
    if (operationId !== undefined) passWorkerOperationResult(operationId)
  }
  let cycleTotal = 0
  let currentLine = -1
  let cachedSpeedMode = -999

  // ---- Ensoniq DOC catch-up (interleaved sample generation) ----
  // gssquared's ensoniq_catch_up ties ES5503 sample generation (and therefore
  // oscillator halt IRQ delivery) to emulated machine time and runs it on every
  // register access and periodic handler, so the driver's re-key happens
  // between halts. Our old per-video-frame single block ran the march once per
  // refresh; a halt past sample 0 stayed halted until the next refresh's
  // generateSamples ran, so the timer-oscillator tick (Apple TN #23) was
  // capped at 60/s and every sequencer running off it played at half tempo â€”
  // Tass Times title music measured exactly 2.0x slower than real hardware
  // (bassline motif cycle 4.0s vs 2.0s) while every pitch stayed correct.
  //
  // The DOC catch-up state and implementation are module-scoped (see
  // ensoniqCatchUp near the state declaration). A DOC access inside an
  // instruction can use the same state to catch up before applying its register
  // change, matching gssquared's access-time catch-up.


  // Hoisted invariants: machineName, speedMode and tracing do not change while
  // this loop runs (mode changes arrive as worker messages, which can only be
  // delivered between invocations of doAdvance6502). Everything below used to
  // be recomputed per instruction â€” hoisting them is 11% of CPU time in the
  // V8 profile.
  const isIIgs = isGSMachine(machineName)
  const traceCb = tracing ? updateTrace : null
  // Frame length in video-clock units. On the IIgs this is the selected CPU
  // rate's refresh budget. The Settings speed preference is authoritative and
  // deliberately overrides $C036 slow mode: a classic title that drops the CPU
  // clock to 1.024 MHz for copy-protected disk I/O must not also erase the
  // user's 2.8 MHz choice. $C036 still selects the speed-shadow latch and other
  // register bits, but it no longer rescales what a CPU cycle is worth.
  let frameCycles = isIIgs ? cpuCyclesPerRefresh : 17030
  let vblCycles = Math.round((isIIgs ? 12460 / 46727 : 4550 / 17030) * frameCycles)
  let cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1
  let cachedSlowMode = isIigsSlowMode()
  const videoStart = isIIgs ? iigsVideoClock : s6502.cycleCount
  // Last emulated refresh the IIgs mouse sync ran on (see iigsMouseStep).
  let lastMouseSyncFrame = -1
  // The SHR captured-row state is cleared at the refresh boundary, not at beam
  // line 0: the guest may store to the previous frame's rows during VBL, and
  // only a boundary crossing makes those stores belong to the new frame (see
  // beginShrFrame). lastShrFrame is module-scoped so a timer callback entering
  // this loop mid-refresh does not fake a boundary and clear the flags early.

  for (;;) {
    let cycles = 0
    let delaySkipped = false
    // Aztec's GS-only loader timer: fast-forward the pure CPU delay at $BD9E
    // instead of executing its nested counter loops. The same elapsed cycles
    // then reach the IWM's $C0EC read path (iwmPrevCycleCount), so the disk
    // position is exactly where it would have been after the delay; the guest
    // resumes at $BDAB with $46/$47 already wrapped to zero.
    if (isIIgs && (cpu as CPU65816).PC === GS_AZTEC_DELAY_PC) {
      cycles = advanceGsAztecDelay()
      if (cycles > 0) {
        delaySkipped = true
        s6502.cycleCount += cycles
        cycleTotal += cycles
        processCycleCountCallbacks()
      }
    }
    if (!delaySkipped && softCard.activeCpu === "Z80") {
      const stepT = softCard.stepZ80() || 4
      cycles = Math.max(1, Math.round(stepT / 2))
      s6502.cycleCount += cycles
      cycleTotal += cycles
    } else if (!delaySkipped) {
      // Batch 8 instructions between the per-batch housekeeping below (VBL
      // lines, floppy motor, conditional input, IRQ polarity, VIA timers).
      // Those checks only need sub-scanline resolution, so running them every
      // single instruction was pure overhead â€” the run loop body showed 11%
      // self time in the V8 profile.
      for (let bi = 0; bi < 1; bi++) {
        cycles = cpu.processInstruction(traceCb)
        if (cycles < 0) break
        // The classic CPU writes s6502.cycleCount inside processInstruction(),
        // so advancing it again here doubled the Apple II clock (~2.03 MHz at
        // the Normal setting). The 65816 returns cycles without writing them
        // and still needs the run-loop advance.
        if (isIIgs) s6502.cycleCount += cycles
        cycleTotal += cycles
      }
      if (isIIgs) processCycleCountCallbacks()
      if (cycles < 0) break
    }
    // Advance the video clock by the machine time this instruction consumed.
    // The selected speed preference defines one video frame's CPU budget, so a
    // classic-title slow-mode toggle does not change the frame phase or the
    // user's requested clock.
    if (isIIgs) iigsVideoClock += cycles
    // Floppy motor-off delay, measured in CPU cycles so it stays locked to the
    // emulated machine's clock rather than to wall time. See stopMotor() in
    // devices/diskdata.ts.
    processFloppyMotorTimeout()
    if (!checkConditionalInputStop()) advanceKeySequence()
    if (advanceConditionalInputSequence()) {
      doSetRunMode(RUN_MODE.PAUSED, false, undefined, {reason: "input-sequence"})
      break
    }
    if (cycles < 0) break
    if (cachedSpeedMode !== speedMode || cachedSlowMode !== isIigsSlowMode()) {
      cachedSpeedMode = speedMode
      cachedSlowMode = isIigsSlowMode()
      frameCycles = isIIgs ? cpuCyclesPerRefresh : 17030
      vblCycles = Math.round((isIIgs ? 12460 / 46727 : 4550 / 17030) * frameCycles)
      cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1
    }
    const videoPos = isIIgs ? iigsVideoClock : s6502.cycleCount
    const cycleInFrame = videoPos % frameCycles
    const nowFrame = frameCycles > 0 ? Math.floor(videoPos / frameCycles) : 0
    if (isIIgs && nowFrame !== lastShrFrame) {
      lastShrFrame = nowFrame
      beginShrFrame()
    }
    if (cycleInFrame < vblCycles) {
      // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
      // Note that VBLINV is the inverse of the vertical blanking status,
      // so if it's set then vertical blanking needs to be activated.
      if (SWITCHES.VBLINV.isSet) {
        startVBL()
        // IIgs: VBL is a hardware interrupt â€” signal it and raise the IRQ line if enabled.
        if (isIIgs) {
          iigsSignalVbl()
          iigsVblCount++
          iigsQuarterSecCounter++
          if (iigsQuarterSecCounter >= 15) {
            iigsQuarterSecCounter = 0
            iigsSignalQuarterSecond()
          }
          iigsOneSecCounter++
          if (iigsOneSecCounter >= 60) {
            iigsOneSecCounter = 0
            iigsSignalOneSecond()
          }
        }
      }
    } else {
      endVBL()
      // 192 visible lines fill the frame after the VBL window. The per-line
      // cycle count scales with the frame budget: at the 2.8 MHz rate this is
      // (46727-12460)/192 = 178.5; at Normal (1.02 MHz) it is
      // (17030-4550)/192 = 65, the Mega II's 65-cycle scanline.
      const line = Math.floor((cycleInFrame - vblCycles) / cyclesPerLine)
      if (line !== currentLine && line < 192) {
        currentLine = line
        exportMemoryToHiresLine(line)
        // IIgs: patch the displayed SHR picture for the lines this beam position
        // covers, so what the screen shows is what the guest had drawn as the
        // beam got there - not whatever memory looks like at one instant.
        if (isIIgs) captureShrBeamLine(line)
        // IIgs SHR scanline interrupt: gssquared's VideoScannerIIgs raises the
        // VGC scanline IRQ while scanning a line whose SCB has bit 6 set. GS/OS
        // uses it to time its cursor draw/erase to the cursor's row, so without
        // it the Event Manager never repaints the pointer and the factory
        // cursor stays parked wherever it was first shown.
        if (isIIgs && SWITCHES.NEWVIDEO.isSet && iigsShrScanlineAtBeam(line)) {
          iigsSignalScanline()
        }
      }
    }
    // The IIgs IRQ line is level-driven by $C046 bit 7 ("a source is pending
    // AND enabled"), not latched. Re-evaluate it every instruction rather than
    // only inside the VBL window: as soon as the handler acknowledges via
    // $C047 the line drops. Sampling it only during VBL let a stale
    // cpu.irqPending survive across VBL windows and fire a spurious IRQ the
    // next time the I flag was cleared, which derailed the GS/OS boot.
    if (isIIgs) {
      if (iigsInterruptPending()) {
        cpu.irq?.()
      } else {
        cpu.clearIrq?.()
      }
    }
    // Ensoniq: catch the DOC march up to the elapsed emulated time so halt
    // IRQs fire mid-refresh and the driver can re-key the timer oscillator
    // before the next catch-up (see the block comment at ensoniqCatchUp).
    if (isIIgs) ensoniqCatchUp()
    // Apple IIgs mouse: converge the guest's cursor on the host pointer once
    // per emulated frame (gssquared does the same from its frame hook). Doing
    // it per instruction would hammer the ADB; per frame is plenty because the
    // guest only polls the mouse a handful of times inside a frame.
    if (isIIgs && nowFrame !== lastMouseSyncFrame) {
      lastMouseSyncFrame = nowFrame
      iigsMouseStep()
      // The ADB micro-controller's keyboard auto-repeat runs from its own
      // 60 Hz frame handler (gssquared ADB_Micro::frame_handler); tick it once
      // per emulated refresh so a held key repeats without host e.repeat events.
      iigsADB.repeatTick()
    }
    if (cyclesToRun > 0 && (s6502.cycleCount - cycleToRunStart) >= cyclesToRun) {
      cyclesToRun = 0
      doSetRunMode(RUN_MODE.PAUSED, true, undefined, {reason: "cycle-limit"})
      break
    }
    if (isIIgs ? (iigsVideoClock - videoStart) >= frameCycles
               : cycleTotal >= cpuCyclesPerRefresh) {
      break
    }
  }
  if (speedTracker.length > 120) {
    speedTracker.shift()
  }
  speedTracker.push({time: performance.now(), cycles: s6502.cycleCount})
  const speedInCyclesPerMS = speedTracker.length > 1 ? (speedTracker[speedTracker.length - 1].cycles - speedTracker[0].cycles) / (speedTracker[speedTracker.length - 1].time - speedTracker[0].time) : 0
  // The / 10 gets rid of the ones digit, which turns into the thousandths digit.
  cpuSpeed = (speedInCyclesPerMS < 10000) ? Math.round(speedInCyclesPerMS / 10) / 100 :
    Math.round(speedInCyclesPerMS / 100) / 10
  
  // Apple IIgs Ensoniq ES5503: the run loop generates the DOC output in
  // cycle-anchored chunks (see ensoniqCatchUp above). Block delivery is gated on
  // refresh rollover â€” the next catch-up call completes the elapsed refresh and
  // posts the whole outRate/60 block, so the UI transport still sees 439-frame
  // per-refresh posts while halts can re-key mid-refresh. This trailing call
  // only catches up to the *elapsed* time (the loop can break without having run
  // its own catch-up, e.g. on `cycles < 0`); it must not generate ahead of the
  // machine clock, or the DOC march outruns the audio we post and tempo rises.
  if (isIIgs) {
    try {
      ensoniqCatchUp()
    } catch (e) {
      console.error("ensoniq frame gen error", e)
    }
  }

  handleGamepads()
  pollKeyboardRepeat()
  updateExternalMachineState()
  if (autoSnapshot !== AUTO_SNAPSHOT.AUTO_OFF) {
    if ((s6502.cycleCount - cyclesSinceLastSnapshot) >= autoSnapshotThreshold) {
      cyclesSinceLastSnapshot = s6502.cycleCount
      requestSnapshot()
    }
  }
  if (takeSnapshot) {
    takeSnapshot = false
    doSnapshot()
  }
}



let audioClockPort: MessagePort | null = null
const advanceScheduledFrame = () => frameClock.advance(
  performance.now(), refreshTime, doAdvance6502, () => performance.now(),
)

export const attachAudioClockPort = (port: MessagePort) => {
  audioClockPort?.close()
  audioClockPort = port
  port.onmessage = () => {
    // Audio wakes the worker if background timer throttling made it late.
    // The shared deadline prevents duplicate frames and catch-up bursts.
    try {
      advanceScheduledFrame()
    } finally {
      port.postMessage({ type: "ack" })
    }
  }
}

// Exported so gs_timer_catchup.test.ts keeps covering the arithmetic. The
// production timer uses FrameClock instead of recomputing a plan per callback.
export const iigsRefreshCatchUpPlan = (
  now: number, nextFrameTime: number, refreshTime: number,
): { overdueFrames: number, framesDue: number } => {
  if (refreshTime <= 0) return { overdueFrames: 0, framesDue: 1 }
  if (now < nextFrameTime) return { overdueFrames: 0, framesDue: 0 }
  const overdueFrames = 1 + Math.floor((now - nextFrameTime) / refreshTime)
  return { overdueFrames, framesDue: overdueFrames }
}

const doAdvance6502Timer = () => {
  advanceScheduledFrame()
  const delay = cpuRunMode === RUN_MODE.PAUSED ? 20 : frameClock.delay(performance.now())
  setTimeout(doAdvance6502Timer, delay)
}
