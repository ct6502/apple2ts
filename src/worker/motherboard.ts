// Chris Torrence, 2022
import { passMachineState, passSoftSwitchDescriptions } from "./worker2main"
import { s6502, setState6502, reset6502, setCycleCount, setPC, getStackString, get6502Instructions } from "./instructions"
import { hiresAddressToLine, RUN_MODE, TEST_DEBUG, DEFAULT_SLOT_CONFIG } from "../common/utility"
import { resetFloppyDrives, doPauseDrive, getHardDriveState, doSetEmuDriveNewData } from "./devices/drivestate"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES, overrideSoftSwitch, resetSoftSwitches, setVideo7Override,
  restoreSoftSwitches, getSoftSwitchDescriptions, 
  syncSoftSwitchStatusFlags} from "./softswitches"
import { memory, memGet, getTextPage, getHires, memoryReset,
  updateAddressTables, setMemoryBlock, addressGetTable,
  getBasePlusAuxMemory,
  setRamWorks,
  RamWorksMaxBank,
  C800SlotGet,
  RamWorksBankGet,
  doSetRom,
  getZeroPage,
  getMemoryDump as getCpuMemoryDump,
  memSet,
  exportMemoryToHiresLine,
  getDataBlock,
  clearSlot} from "./memory"
import { setButtonState, handleGamepads } from "./devices/joystick"
import { handleGameSetup } from "./games/game_mappings"
import { breakpointMap, clearInterrupts, doSetBreakpointSkipOnce, processInstruction, resetCycleCountCallbacks, setStepOut, doSetBreakpoints } from "./cpu6502"
import { enableSerialCard, resetSerial } from "./devices/superserial/serial"
import { enableMouseCard } from "./devices/mouse"
import { enablePassportCard, resetPassport } from "./devices/passport/passport"
import { enableVera, resetVera } from "./devices/vera/vera"
import { enableMockingboard, resetMockingboard } from "./devices/mockingboard"
import { resetMouse, onMouseVBL } from "./devices/mouse"
import { enableDiskDrive } from "./devices/diskdata"
import { pollKeyboardRepeat, sendPastedText } from "./devices/keyboard"
import { enableHardDrive } from "./devices/harddrivedata"
import { parseAssembly } from "./utility/assembler"
import { BreakpointMap, BreakpointNew } from "../common/breakpoint"
import { code } from "../common/assemblycode"
import { clearTracelog, getTracelog, updateTrace } from "./tracelog"
import { getSiriusJoyport, setSiriusJoyport } from "./devices/sirius_joyport"
import { doSnapshot, fixSaveStates, getGoBackwardIndex, getGoForwardIndex, getTempStateIndex, getTimeTravelThumbnails, doGetSaveState, doRestoreSaveState } from "./save_restore"
import { SoftCard } from "./devices/softcard"
import { setSlotIOCallback } from "./memory"
import { hasHardDriveMounted } from "./devices/drivestate"

let speedMode = 0
let cpuSpeed = 0
export let isDebugging = false
let appMode = "default"
let showDebugTab = false
let refreshTime = 16.6881 // = 17030 / 1020.488
let cpuCyclesPerRefresh = 17030
let cpuRunMode = RUN_MODE.IDLE
let cyclesToRun = 0
let nextFrameTime = 0
let machineName: MACHINE_NAME = "APPLE2EE"
let veraSlot: VERA_SLOT = 0
let takeSnapshot = false
let gameSetupTimerID: NodeJS.Timeout | number = 0
let tracing = TEST_DEBUG
let speedTracker: Array<{time: number, cycles: number}> = []

export const resetCpuSpeedForTesting = () => {
  cpuSpeed = 0
}

// === Zero-page capture state ===
// When active, the emulator boots a floppy at ludicrous speed, waits for a
// breakpoint at the game entry address, snapshots zero page, then restores
// the previous emulator state and posts the result back to the UI.
let captureActive = false
let captureSavedState: EmulatorSaveState | null = null
let captureSavedSpeedMode = 0
let captureSavedRunMode: RUN_MODE = RUN_MODE.IDLE
let captureSavedBreakpoints: BreakpointMap | null = null
let captureTimeoutId: ReturnType<typeof setTimeout> | null = null
let captureCallback: ((result: CaptureBootResult | null) => void) | null = null
let captureRequest: CaptureBootStateRequest | null = null
let captureWaitingForPostDelay = false
let capturePostDelayId: ReturnType<typeof setTimeout> | null = null
let captureEarlyLowMemory: Uint8Array | null = null

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

export const getSoftSwitches = () => {
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  return softSwitches
}

export const getMachineName = () => {
  return machineName
}

export const doSetState6502 = (newState: STATE6502) => {
  setState6502(newState)
  updateExternalMachineState()
}

export const doSetCycleCount = (count: number) => {
  setCycleCount(count)
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
//       memGet(i)    
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
  currentSlotConfig = { ...config }
  didConfiguration = false
  updateExternalMachineState()
}

export const getSlotConfig = () => {
  return currentSlotConfig
}

let didConfiguration = false
export const configureMachine = () => {
  if (didConfiguration) return
  didConfiguration = true
  resetCycleCountCallbacks()

  for (let s = 1; s <= 7; s++) {
    clearSlot(s)
  }

  // Ensure Slot 3 is locked to 'aux' on IIe, or 'none' on II+
  if (machineName === "APPLE2P") {
    currentSlotConfig[3] = "none"
  } else {
    currentSlotConfig[3] = "aux"
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

const resetMachine = () => {
  softCard.reset()
  resetFloppyDrives()
  setButtonState()
  resetMouse()
  resetPassport()
  if (veraSlot !== 0) {
    resetVera()
  }
  resetSerial()
  if (currentSlotConfig[4] === "mockingboard") {
    resetMockingboard(4)
  }
  if (currentSlotConfig[5] === "mockingboard") {
    resetMockingboard(5)
  }
}

export const doBoot = () => {
  setCycleCount(0)
  memoryReset()
  doSetRom(machineName)
  configureMachine()
  if (code.length > 0) {
    const pcode = parseAssembly(0x300, code.split("\n"))
    memory.set(pcode, 0x300)
  }
//  testTiming()

  if (!softCard.enabled || hasHardDriveMounted()) {
    enableHardDrive()
  }

  doReset()
  // This is a hack. If we don't currently have a hard drive image on boot,
  // temporarily disable the hard drive and then re-enable it later.
  // This allows the floppy disk to boot instead.
  const ds = getHardDriveState(1)
  if (ds.filename === "") {
    enableHardDrive(false)
    setTimeout(() => { enableHardDrive(true) }, 200)
  }
}

export const doReset = () => {
  clearInterrupts()
  resetSoftSwitches()
  // Reset banked RAM
  memGet(0xC082)
  reset6502()
  resetMachine()
  // Force the help text panel back to default on reset/reboot paths.
  handleGameSetup(true)
  if (getSiriusJoyport()) {
    setSiriusJoyport(false)
    const currentCycle = s6502.cycleCount
    const intervalId = setInterval(() => {
      if ((s6502.cycleCount - currentCycle) > 1000) {
        setSiriusJoyport(true)
        clearInterval(intervalId)
      }
    }, 50)
  }
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
export const doSetSpeedMode = (speedModeIn: number) => {
  speedMode = speedModeIn
  // speedMode = -2 is slowest, but add 2 to it to make the arrays be zero based.
  // speedMode = 0 is still 1 MHz, so no risk of backwards compatibility issues.
  refreshTime = (speedMode === 4) ? 0 : 16.6881
  cpuCyclesPerRefresh = 17030 * ([0.1, 0.5, 1, 2, 3, 4, 24])[speedMode + 2]
  resetRefreshCounter()
}

// Boot a floppy disk image, run at ludicrous speed until the given entry
// address is reached, then capture zero page ($00-$FF) and restore the
// previous emulator state.  The callback receives a 256-byte Uint8Array
// on success, or null on timeout.
export const startCaptureBootState = (
  req: CaptureBootStateRequest,
  callback: (result: CaptureBootResult | null) => void
) => {
  // 1. Save current emulator state (full, including disk data)
  captureSavedState = doGetSaveState(true)
  captureSavedSpeedMode = speedMode
  captureSavedRunMode = cpuRunMode
  captureSavedBreakpoints = new BreakpointMap(breakpointMap)
  captureCallback = callback
  captureRequest = req

  // 2. Load the floppy image into slot 6 drive 1
  const driveProps: DriveProps = {
    index: 2,  // slot 6 drive 1
    hardDrive: false,
    drive: 1,
    filename: req.filename,
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: true,
    diskData: req.diskImage,
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }
  doSetEmuDriveNewData(driveProps, true)

  // Clear any existing hard drive so floppy boots
  const emptyDriveProps: DriveProps = {
    index: 0,
    hardDrive: true,
    drive: 1,
    filename: "",
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: true,
    diskData: new Uint8Array(0),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }
  doSetEmuDriveNewData(emptyDriveProps, true)

  // 3. Set a hidden one-shot breakpoint at the entry address
  const bp = BreakpointNew()
  bp.address = req.entryAddress
  bp.once = true
  bp.hidden = true
  const captureBreakpoints = new BreakpointMap()
  captureBreakpoints.set(req.entryAddress, bp)
  doSetBreakpoints(captureBreakpoints)

  // 4. Set ludicrous speed
  doSetSpeedMode(4)

  // 5. Start a fresh boot
  captureActive = true
  doSetRunMode(RUN_MODE.NEED_BOOT)

  // 6. Safety timeout
  const timeoutMs = req.timeoutMs ?? 15000
  captureTimeoutId = setTimeout(() => {
    if (captureActive) {
      console.warn(`[Capture] Timed out after ${timeoutMs}ms waiting for entry at $${req.entryAddress.toString(16).toUpperCase()}`)
      finishCaptureBootState(true)
    }
  }, timeoutMs)
}

const finishCaptureBootState = (timedOut = false) => {
  // Read zero page (and optionally full memory) before restoring state
  let result: CaptureBootResult | null = null
  if (!timedOut) {
    const zp = getZeroPage()
    result = { zeroPage: zp }
    if (captureRequest?.captureMemory) {
      result.memoryDump = getCpuMemoryDump()
    }
    if (captureWaitingForPostDelay) {
      // Two-stage capture: record the PC at time of late capture
      result.capturedPC = s6502.PC
      result.earlyLowMemory = captureEarlyLowMemory ?? undefined
      console.log(`[Capture] Late capture at PC=$${s6502.PC.toString(16).toUpperCase().padStart(4, "0")}, captured ${zp.length} bytes of zero page${result.memoryDump ? ` + ${result.memoryDump.length} bytes memory dump` : ""}${result.earlyLowMemory ? ` + ${result.earlyLowMemory.length} bytes early low memory` : ""}`)
    } else {
      console.log(`[Capture] Hit entry point, captured ${zp.length} bytes of zero page${result.memoryDump ? ` + ${result.memoryDump.length} bytes memory dump` : ""}`)
    }
  }

  // Clear the timeout
  if (captureTimeoutId) {
    clearTimeout(captureTimeoutId)
    captureTimeoutId = null
  }
  if (capturePostDelayId) {
    clearTimeout(capturePostDelayId)
    capturePostDelayId = null
  }
  captureWaitingForPostDelay = false
  captureEarlyLowMemory = null

  // Restore previous emulator state
  captureActive = false
  if (captureSavedState) {
    doRestoreSaveState(captureSavedState, false)
    captureSavedState = null
  }
  if (captureSavedBreakpoints) {
    doSetBreakpoints(captureSavedBreakpoints)
    captureSavedBreakpoints = null
  }
  doSetSpeedMode(captureSavedSpeedMode)
  // Restore the run mode (the emulator may have been running, paused, or idle)
  cpuRunMode = captureSavedRunMode
  updateExternalMachineState()

  // Send result
  if (captureCallback) {
    captureCallback(result)
    captureCallback = null
  }
  captureRequest = null
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

export const doSetMachineName = (name: MACHINE_NAME, reset = true) => {
  machineName = name
  currentSlotConfig[3] = name === "APPLE2P" ? "none" : "aux"
  didConfiguration = false
  doSetRom(machineName)
  configureMachine()
  if (reset) doReset()
  updateExternalMachineState()
}

export const doSetVeraSlot = (slot: VERA_SLOT) => {
  if (slot !== 0 && slot !== 2 && slot !== 4) return
  if (veraSlot === slot) return
  veraSlot = slot
  didConfiguration = false
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

let timeout: NodeJS.Timeout | null = null

// Set a flag and save our slice at the end of the next 6502 display cycle.
// Otherwise we risk saving in the middle of a keystroke.
export const doTakeSnapshot = (collapseEvents = false) => {
  if (timeout) {
    clearTimeout(timeout)
  }
  if (collapseEvents) {
    timeout = setTimeout(() => {takeSnapshot = true; timeout = null}, 100)
  } else {
    takeSnapshot = true
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
  processInstruction(tracing ? updateTrace : null)
  doSetRunMode(RUN_MODE.PAUSED)
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
    processInstruction(tracing ? updateTrace : null)
    doStepOut()
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
  nextFrameTime = performance.now()
}

export const doSetRunMode = (cpuRunModeIn: RUN_MODE, doShowDebugTab = true) => {
  configureMachine()
  if (doShowDebugTab && cpuRunMode === RUN_MODE.RUNNING && cpuRunModeIn === RUN_MODE.PAUSED) {
    showDebugTab = true
  }
  cpuRunMode = cpuRunModeIn
  if (cpuRunMode === RUN_MODE.PAUSED) {
    // If a zero-page capture is active and we just hit the breakpoint,
    // complete the capture before doing anything else.
    if (captureActive) {
      if (captureRequest?.waitForDiskIo && !captureWaitingForPostDelay) {
        // Two-stage capture: entry breakpoint confirmed boot succeeded.
        // Resume execution and capture later (after disk I/O completes).
        captureWaitingForPostDelay = true
        const delayMs = captureRequest.postEntryDelayMs ?? 3000
        console.log(`[Capture] Hit entry $${captureRequest.entryAddress.toString(16).toUpperCase()}, resuming for ${delayMs}ms to let disk I/O finish...`)
        // Save full memory now (before the game's init modifies code regions).
        // This preserves code at $6400+, RWTS at $0600, etc.
        // Late capture provides disk-read buffer data ($8000+).
        captureEarlyLowMemory = getCpuMemoryDump()
        // Clear the one-shot breakpoint so it doesn't fire again
        doSetBreakpoints(new BreakpointMap())
        // Resume at ludicrous speed
        cpuRunMode = RUN_MODE.RUNNING
        // Set the delayed capture timer
        capturePostDelayId = setTimeout(() => {
          capturePostDelayId = null
          if (captureActive) {
            console.log(`[Capture] Post-entry delay elapsed, pausing to capture at PC=$${s6502.PC.toString(16).toUpperCase().padStart(4, "0")}`)
            doSetRunMode(RUN_MODE.PAUSED)
          }
        }, delayMs)
        return
      }
      finishCaptureBootState()
      return
    }
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
  resetRefreshCounter()
  // Jump start the emulator if we have never executed anything.
  if (cpuSpeed === 0) {
    cpuSpeed = 1
    doAdvance6502Timer()
  }
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

export const doSetPastedText = (text: string) => {
  const doPaste = () => {
    sendPastedText(text)
  }
  doAutoboot(doPaste)
}

const getMemoryDump = () => {
  if (cpuRunMode === RUN_MODE.PAUSED) {
    return getBasePlusAuxMemory()
  }
  return new Uint8Array()
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
    extraRamSize: 64 * (RamWorksMaxBank + 1),
    hires: getHires(),
    iTempState: getTempStateIndex(),
    isDebugging: isDebugging,
    isTracing: false,
    lores: getTextPage(true),
    machineName: machineName,
    memoryDump: getMemoryDump(),
    noDelayMode: !SWITCHES.COLUMN80.isSet && SWITCHES.DHIRES.isSet && machineName !== "APPLE2P",
    ramWorksBank: RamWorksBankGet(),
    runMode: cpuRunMode,
    s6502: s6502,
    showDebugTab: showDebugTab,
    slotConfig: currentSlotConfig,
    softSwitches: getSoftSwitches(),
    speedMode: speedMode,
    stackString: doGetStackString(),
    textPage: getTextPage(),
    timeTravelThumbnails: getTimeTravelThumbnails(),
    tracelog: cpuRunMode === RUN_MODE.PAUSED ? getTracelog() : [],
    veraSlot: veraSlot,
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

//let quickReturn = 0
let cycleToRunStart = -1

const doAdvance6502 = () => {
  if (cpuRunMode === RUN_MODE.IDLE || cpuRunMode === RUN_MODE.PAUSED) {
    return
  }
  if (cpuRunMode === RUN_MODE.NEED_BOOT) {
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING)
  } else if (cpuRunMode === RUN_MODE.NEED_RESET) {
    doReset()
    doSetRunMode(RUN_MODE.RUNNING)
  }
  let cycleTotal = 0
  let currentLine = -1
  if (cyclesToRun > 0) {
    cycleToRunStart = s6502.cycleCount
  }
  for (;;) {
    let cycles = 0
    if (softCard.activeCpu === "Z80") {
      const stepT = softCard.stepZ80() || 4
      cycles = Math.max(1, Math.round(stepT / 2))
      s6502.cycleCount += cycles
    } else {
      cycles = processInstruction(tracing ? updateTrace : null)
    }
    if (cycles < 0) break
    cycleTotal += cycles
    const cycleInFrame = s6502.cycleCount % 17030
    if (cycleInFrame < 4550) {
      // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
      // Note that VBLINV is the inverse of the vertical blanking status,
      // so if it's set then vertical blanking needs to be activated.
      if (SWITCHES.VBLINV.isSet) {
        startVBL()
      }
    } else {
      endVBL()
      const line = Math.floor((cycleInFrame - 4550) / 65)
      if (line !== currentLine && line < 192) {
        currentLine = line
        exportMemoryToHiresLine(line)
      }
    }
    if (cyclesToRun > 0 && (s6502.cycleCount - cycleToRunStart) >= cyclesToRun) {
      cyclesToRun = 0
      doSetRunMode(RUN_MODE.PAUSED)
      break
    }
    if (cycleTotal >= cpuCyclesPerRefresh) {
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
  
  handleGamepads()
  pollKeyboardRepeat()
  updateExternalMachineState()
  if (takeSnapshot) {
    takeSnapshot = false
    doSnapshot()
  }
}


const doAdvance6502Timer = () => {
  doAdvance6502()
  nextFrameTime += refreshTime
  // Calculate exactly how long until the next frame is due
  const now = performance.now()
  let delay = nextFrameTime - now
  if (delay < 0) {
    // If we're already past the time for the next frame, we were probably
    // stopped at a breakpoint or the browser was paused. In that case,
    // just set the next frame time to now.
    nextFrameTime = now
    delay = 0
  }
  delay = (cpuRunMode === RUN_MODE.PAUSED) ? 20 : Math.max(1, delay)
  setTimeout(doAdvance6502Timer, delay)
}
