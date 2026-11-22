import { FrameClock } from "./frameclock"
// Chris Torrence, 2022
import { passAudioReset, passClickSpeaker, passMachineState, passSoftSwitchDescriptions, passWorkerOperationResult } from "./worker2main"
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
// The video scanner itself, anchored to the 14 MHz master clock exactly like
// gssquared's `VideoScannerII` (65 video cycles per line, 262 lines per
// refresh). $C02E and $C02F are two views of ONE scan index there, so they can
// never disagree about where the beam is. Our counters used to be rederived per
// read from the CPU-cycle frame: the vertical rows used the VBL length while
// the horizontal counter used the visible-line length (178.0 vs 178.5 video
// cycles at 2.8 MHz), so their phases drifted and at a VBL row start the
// horizontal counter sat nearly a whole line behind. Software that beam-races
// - waits for `$C02E == $F0`, then reads $C02F and branches on the result -
// needs a consistent line start, and this is that consistent index.
export const VIDEO_CYCLES_PER_LINE = 65
export const VIDEO_CYCLES_PER_FRAME = VIDEO_CYCLES_PER_LINE * 262 // 17030, one NTSC refresh
// The VBL rows (192-261) open our refresh, exactly 70 scanlines long.
export const VBL_VIDEO_CYCLES = VIDEO_CYCLES_PER_LINE * 70
let iigsBeamPos = 0 // video cycles into the current refresh, 0 <= pos < 17030
let iigsBeamFrames = 0 // refreshes the beam has finished (frame numbering)
export const getIigsBeamPos = () => iigsBeamPos
export const getIigsBeamFrameCount = () => iigsBeamFrames
// How many CPU cycles fit in one refresh: the effective clock. $C036 bit 7 = 0
// asks for the machine's 1.020484 MHz slow clock, which gssquared implements as
// "1 CPU cycle == 1 video cycle" (MMU_IIgs::set_slow_mode: value & 0x80 ? fast :
// slow), so a slow refresh is exactly the scanner's 17030 video cycles. Bit 7 =
// 1 (and the power-on default on ROM 03) runs the fast clock, whose rate comes
// from the Settings speed preference. Every real-time <-> CPU-cycle conversion
// must use this function, not cpuCyclesPerRefresh: the IWM bit cell, the ADB
// repeat cadence and the DOC block cadence all have to follow the clock the
// guest actually selected, or the media outruns the CPU during a 1 MHz phase.
export const getIigsCpuCyclesPerRefresh = () =>
  isGSMachine(machineName) && isIigsSlowMode() ? VIDEO_CYCLES_PER_FRAME : cpuCyclesPerRefresh

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
// of 50 Hz Ã¢â‚¬â€ everything 1.5x too fast with correct pitch.
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
// Settings speed rate: the fast-clock cycles per refresh. The effective clock is
// getIigsCpuCyclesPerRefresh() instead; tests that pin the Settings rate use this.
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
// Last refresh at which the per-frame IIgs devices ran: the ADB micro-controller
// (keyboard auto-repeat) and the mouse stepper. Like lastShrFrame this is machine
// state, not per-call state: doAdvance6502 is entered once per timer callback,
// and while the 65816 waits in WAI (an idle prompt, the Finder's event loop) a
// call returns after part of a refresh, so two or three calls can fall inside one
// emulated frame. A per-call sentinel then ticked the micro-controller more than
// once per frame and halved the ADB repeat delay: the ROM's configured 45-frame
// delay fired after ~21 frames (0.36 s instead of 0.75 s) and the configured
// 4-frame rate repeated every 2 frames, so a short key hold produced extra
// characters. The ADB micro is a 60 Hz device; one tick per emulated frame is the
// contract (gssquared ADB_Micro::frame_handler).
let lastIigsFrameTick = -1
// A speed-mode switch resets the video clock without clearing the SHR display:
// the beam-captured rows are still the last ones the guest painted, and a late
// top-row sprite store arriving after the switch should still fold into them.
// A reset at boot calls resetShrBeamFrame() for the picture itself, so there
// -1 (no boundary yet) is correct; the speed switch keeps frame 0 as current.
export const resetIigsVideoClock = (preserveShrFrame = false) => {
  iigsVideoClock = 0
  iigsBeamPos = 0
  iigsBeamFrames = 0
  lastShrFrame = preserveShrFrame ? 0 : -1
  // Frame numbering restarts with the clock, so the next run-loop call must tick
  // the per-frame devices again even if it lands inside refresh 0.
  lastIigsFrameTick = -1
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
// $C02E/$C02F are a pure function of the beam position inside a refresh, so
// pinning the frame layout the CPU sees means being able to place the beam at a
// chosen position in a refresh. The setter takes the clock's CPU-cycle units and
// maps them onto the scan index, so existing tests keep their geometry.
export const setIigsVideoClockForTesting = (value: number) => {
  iigsVideoClock = value
  const units = Math.max(1, cpuCyclesPerRefresh)
  const inFrame = ((value % units) + units) % units
  iigsBeamPos = (inFrame * VIDEO_CYCLES_PER_FRAME / units) % VIDEO_CYCLES_PER_FRAME
  // The refresh id has to follow the clock too: the DOC's catch-up state keys on
  // the finished-refresh count, and a suite that jumps the clock to a boundary
  // must look like a finished refresh, not a rewind inside the same one.
  iigsBeamFrames = Math.floor(value / units)
}
// Test-only: place the scanner at an exact video cycle inside the refresh, so a
// suite can walk the 262 rows the counters report without running the machine.
export const setIigsBeamPosForTesting = (value: number) => { iigsBeamPos = value }
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
  // Machine time inside the refresh, from the video scanner: the DOC's sample
  // clock is hardware time, so neither a $C036 slow-mode flip nor a Settings
  // speed change may move it.
  const fraction = iigsBeamPos / VIDEO_CYCLES_PER_FRAME
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
    // Video-clock position, not cycleCount: the DOC's sample clock is hardware
    // time, so a $C036 slow-mode flip must not move it.
    const refreshId = iigsBeamFrames
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
    const fraction = iigsBeamPos / VIDEO_CYCLES_PER_FRAME
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
  // Power-on is a cold start: invalidate the warm-start signature before the
  // ROM starts. A Ctrl-Reset deliberately keeps it (see doReset); gssquared's
  // computer_t::reset(cold_start) only zeroes $03F2-$03F4 for a cold start.
  if (isGSMachine(machineName)) {
    memSet24(0x03f2, 0x00)
    memSet24(0x03f3, 0x00)
    memSet24(0x03f4, 0x00)
  }
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

// On a real IIgs the ROM's Ctrl-Reset handler beeps before it looks at the
// warm-start signature: FF:FA87 does JSR $F89A (the tone call) and only then
// FF:FA8A runs the $03F3 ^ $A5 == $03F4 check and FF:FADE does JMP ($03F2).
// When that signature is valid doReset jumps straight through $03F2, so the
// handler never runs and Ctrl-Reset would be silent. Replay the ROM's tone with
// the number of toggles and the $C030 cadence its speaker loop drives (FF:A0AF
// LDA $C030: three ~1612-cycle iterations then one ~2014-cycle iteration): a
// single 93-toggle beep.
//
// The tone is delivered 24 toggles per frame instead of all at once. A reset
// posts AUDIO_RESET, and the UI tears its speaker worklet down on that message,
// so a single batch would be dropped while the graph rebuilds. Spreading the
// batches lets the later ones land in the live worklet, the way the ROM's own
// frame-spread beep survives the same teardown.
const iigsResetBeepToggles = 93
const iigsResetBeepPattern = [1612, 1612, 1612, 2014]
const iigsResetBeepBatch = 24
const iigsResetBeepFrameMs = 17
const playIigsResetBeep = () => {
  // The cadence is deliberately not tied to the CPU's real cycle counter: the
  // worklet only plays the spacing between toggles, and keeping this sequence
  // contiguous means a batch boundary cannot change the tone's pitch.
  let cycle = s6502.cycleCount + iigsResetBeepPattern[0]
  let toggle = 0
  const postBatch = () => {
    const end = Math.min(toggle + iigsResetBeepBatch, iigsResetBeepToggles)
    while (toggle < end) {
      passClickSpeaker(cycle)
      cycle += iigsResetBeepPattern[toggle % iigsResetBeepPattern.length]
      toggle++
    }
    if (toggle < iigsResetBeepToggles) setTimeout(postBatch, iigsResetBeepFrameMs)
  }
  postBatch()
}

export const doReset = () => {
  // The Programmer's Guide warm-start signature lives at $03F2-$03F4:
  // $03F2/$03F3 are the little-endian warm-start address, and $03F4 is the
  // checksum ($03F3 ^ $A5). Capture it before any reset state is torn down so a
  // valid signature can survive a Ctrl-Reset and be honoured below.
  const gsWarmSignature = isGSMachine(machineName)
    ? [(memGet24(0x03f2) & 0xff), (memGet24(0x03f3) & 0xff), (memGet24(0x03f4) & 0xff)]
    : null
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
    // The Programmer's Guide warm-start signature lives at $03F2-$03F4:
    //   $03F2/$03F3 = little-endian warm target, $03F4 = checksum ($03F3 ^ $A5)
    // A warm Ctrl-Reset must preserve it; only power-on/cold start invalidates it
    // (gssquared's computer_t::reset(cold_start) clears $03F2-$03F4 only for a
    // cold start). Zeroing it on Ctrl-Reset turned every reset with media into
    // the cold device-scan path.
    // A hardware reset clears SLTROMSEL; the machine then re-applies the
    // Control Panel assignment.
    applyIigsSlotConfig()
    // The ADB micro-controller repeat-rate table follows the installed ROM:
    // ROM 03's table is the reverse order plus two extra-slow slots.
    iigsADB.setRom03(isIigsRom03())
  }
  resetMachine()
  let iigsWarmStarted = false
  if (gsWarmSignature) {
    const [sigLow, sigHigh, sigChecksum] = gsWarmSignature
    const signatureValid = ((sigHigh ^ 0xa5) & 0xff) === sigChecksum
    // $00/$E0/$45 and the $03/$E0/$45 tail the ROM writes on its provisional
    // warm path (the startup slot lands in the low byte) are the device-scan
    // marker family. Their target is not the guide's generic JMP ($03F2) entry
    // unless the ROM's provisional path (FF:FADB LDY #3 / JMP FEE6) decides so;
    // leave the whole family to the ROM instead of jumping the classic vector.
    const provisionalSignature = sigHigh === 0xe0 && sigChecksum === 0x45
    if (signatureValid && !provisionalSignature) {
      // A valid Programmer's Guide signature is a warm start: the ROM's reset
      // handler jumps through $03F2/$03F3. The target is always read from the
      // signature ($03F3<<8 | $03F2), never a fixed address, so every OS's own
      // warm entry works: DOS 3.3 uses $9DBF ($03F2=$BF,$03F3=$9D,$03F4=$38),
      // ProDOS uses $BE00 ($03F2=$00,$03F3=$BE,$03F4=$1B), and others differ.
      // This ROM's reset path never takes that branch (its code invalidates the
      // signature at FF:8055/59), so honour the book's warm start here.
      const warmStart = (sigHigh << 8) | sigLow
      ;(cpu as CPU65816).PC = warmStart & 0xffff
      // The ROM beeps from the same handler we skipped to get here; sound it
      // after the audio-reset signal below so the tone reaches the worklet that
      // reset rebuilds.
      iigsWarmStarted = true
    }
  }
  // Boot and Ctrl-Reset must silence transports that hold already-scheduled
  // audio (Mockingboard oscillators/envelopes, MIDI notes, the VERA PSG/FM/PCM
  // queue, and DOC buffers). resetMachine() clears the worker-side sound-chip
  // state; this companion signal clears the UI-side scheduling graphs.
  passAudioReset()
  if (iigsWarmStarted) playIigsResetBeep()
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
  // frame Ã¢â‚¬â€ but not the captured-row boundary: the guest is still painting
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
  // capped at 60/s and every sequencer running off it played at half tempo Ã¢â‚¬â€
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
  // be recomputed per instruction Ã¢â‚¬â€ hoisting them is 11% of CPU time in the
  // V8 profile.
  const isIIgs = isGSMachine(machineName)
  const traceCb = tracing ? updateTrace : null
  // Refresh length in CPU cycles, from the effective clock (see
  // getIigsCpuCyclesPerRefresh): $C036 bit 7 = 0 runs the CPU at exactly
  // VIDEO_CYCLES_PER_FRAME (17030) cycles per refresh, bit 7 = 1 spends the
  // Settings fast budget. beamStep maps CPU cycles onto the scanner, so the CPU
  // rate decides how much machine time a cycle buys while iigsBeamPos keeps the
  // beam on its own 14 MHz anchor. Both are recomputed below when the guest
  // flips the latch mid-refresh.
  let frameCycles = isIIgs ? getIigsCpuCyclesPerRefresh() : 17030
  let beamStep = isIIgs ? VIDEO_CYCLES_PER_FRAME / Math.max(1, frameCycles) : 0
  // Classic-only geometry: the IIgs reads the scanner through iigsBeamPos.
  let vblCycles = Math.round((4550 / 17030) * frameCycles)
  let cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1
  let cachedSlowMode = isIigsSlowMode()
  // Machine time this call has run, in video cycles. The refresh budget is
  // counted here rather than on iigsVideoClock so it is independent of how the
  // guest drives the speed latch mid-frame.
  let beamElapsed = 0
  // The per-frame IIgs devices are gated on lastIigsFrameTick at module scope
  // (see the declaration): the old local sentinel re-armed on every call, which
  // ticked the ADB repeat and mouse stepper more than once per emulated frame.

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
      // single instruction was pure overhead Ã¢â‚¬â€ the run loop body showed 11%
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
    // Advance the machine timeline by the CPU cycles this instruction consumed.
    // iigsVideoClock stays in CPU cycles (the disk and joystick timing use it);
    // iigsBeamPos is the scanner, which runs off the 14 MHz rail, so it advances
    // by however much *machine* time those CPU cycles took at the current clock.
    if (isIIgs) {
      iigsVideoClock += cycles
      beamElapsed += cycles * beamStep
      iigsBeamPos += cycles * beamStep
      while (iigsBeamPos >= VIDEO_CYCLES_PER_FRAME) {
        iigsBeamPos -= VIDEO_CYCLES_PER_FRAME
        iigsBeamFrames++
      }
    }
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
      frameCycles = isIIgs ? getIigsCpuCyclesPerRefresh() : 17030
      beamStep = isIIgs ? VIDEO_CYCLES_PER_FRAME / Math.max(1, frameCycles) : 0
      vblCycles = Math.round((4550 / 17030) * frameCycles)
      cyclesPerLine = ((frameCycles - vblCycles) / 192) || 1
    }
    // The IIgs reads its scanner through iigsBeamPos (65 video cycles per line,
    // 262 lines, VBL rows first); the classic machine keeps its CPU-cycle frame.
    const videoPos = isIIgs ? iigsVideoClock : s6502.cycleCount
    const cycleInFrame = isIIgs ? iigsBeamPos : videoPos % frameCycles
    const nowFrame = isIIgs
      ? iigsBeamFrames
      : (frameCycles > 0 ? Math.floor(videoPos / frameCycles) : 0)
    if (isIIgs && nowFrame !== lastShrFrame) {
      lastShrFrame = nowFrame
      beginShrFrame()
    }
    const vblEnd = isIIgs ? VBL_VIDEO_CYCLES : vblCycles
    const lineLength = isIIgs ? VIDEO_CYCLES_PER_LINE : cyclesPerLine
    if (cycleInFrame < vblEnd) {
      // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
      // Note that VBLINV is the inverse of the vertical blanking status,
      // so if it's set then vertical blanking needs to be activated.
      if (SWITCHES.VBLINV.isSet) {
        startVBL()
        // IIgs: VBL is a hardware interrupt Ã¢â‚¬â€ signal it and raise the IRQ line if enabled.
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
      // 192 visible lines fill the frame after the VBL window. On the IIgs the
      // scanner gives every line exactly 65 video cycles (gssquared
      // VideoScannerII); the classic machine keeps its CPU-cycle frame.
      const line = Math.floor((cycleInFrame - vblEnd) / lineLength)
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
    if (isIIgs && nowFrame !== lastIigsFrameTick) {
      lastIigsFrameTick = nowFrame
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
    if (isIIgs ? beamElapsed >= VIDEO_CYCLES_PER_FRAME
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
  // refresh rollover Ã¢â‚¬â€ the next catch-up call completes the elapsed refresh and
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
