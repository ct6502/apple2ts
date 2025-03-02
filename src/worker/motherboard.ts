// Chris Torrence, 2022
import { Buffer } from "buffer"
import { passMachineState, passRequestThumbnail, passSoftSwitchDescriptions } from "./worker2main"
import { s6502, setState6502, reset6502, setCycleCount, setPC, getStackString, getStackDump, setStackDump, get6502Instructions } from "./instructions"
import { COLOR_MODE, MAX_SNAPSHOTS, RUN_MODE, RamWorksMemoryStart, TEST_DEBUG, UI_THEME } from "../common/utility"
import { getDriveSaveState, restoreDriveSaveState, resetDrive, doPauseDrive, getHardDriveState } from "./devices/drivestate"
// import { slot_omni } from "./roms/slot_omni_cx00"
import { SWITCHES, overrideSoftSwitch, resetSoftSwitches,
  restoreSoftSwitches, getSoftSwitchDescriptions } from "./softswitches"
import { memory, memGet, getTextPage, getHires, memoryReset,
  updateAddressTables, setMemoryBlock, addressGetTable, 
  getBasePlusAuxMemory,
  setRamWorks,
  RamWorksMaxBank,
  C800SlotGet,
  RamWorksBankGet,
  doSetRom} from "./memory"
import { setButtonState, handleGamepads } from "./devices/joystick"
import { handleGameSetup } from "./games/game_mappings"
import { breakpointMap, clearInterrupts, doSetBreakpointSkipOnce, processInstruction, setStepOut } from "./cpu6502"
import { enableSerialCard, resetSerial } from "./devices/superserial/serial"
import { enableMouseCard } from "./devices/mouse"
import { enablePassportCard, resetPassport } from "./devices/passport/passport"
import { enableMockingboard, resetMockingboard } from "./devices/mockingboard"
import { resetMouse, onMouseVBL } from "./devices/mouse"
import { enableDiskDrive } from "./devices/diskdata"
import { sendPastedText } from "./devices/keyboard"
import { enableHardDrive } from "./devices/harddrivedata"
import { parseAssembly } from "./utility/assembler"
import { code } from "../common/assemblycode"

let startTime = 0
let prevTime = 0
let speedMode = 0
let cpuSpeed = 0
export let isDebugging = TEST_DEBUG
let refreshTime = 16.6881 // 17030 / 1020.488
let cpuCyclesPerRefresh = 17030
let timeDelta = 0
let cpuRunMode = RUN_MODE.IDLE
let machineName: MACHINE_NAME = "APPLE2EE"
let iRefresh = 0
let takeSnapshot = false
let iTempState = 0
const saveStates: Array<EmulatorSaveState> = []
let gameSetupTimerID: NodeJS.Timeout | number = 0

// methods to capture start and end of VBL for other devices that may need it (mouse)
const startVBL = (): void => {
  SWITCHES.VBL.isSet = true
  onMouseVBL()
}

const endVBL = (): void => {
  SWITCHES.VBL.isSet = false
}

const getSoftSwitches = () => {
  const softSwitches: { [name: string]: boolean } = {}
  for (const key in SWITCHES) {
    softSwitches[key] = SWITCHES[key as keyof typeof SWITCHES].isSet
  }
  return softSwitches
}

export const getApple2State = (): Apple2SaveState => {
  // Make a copy
  const save6502 = JSON.parse(JSON.stringify(s6502))
  // Find the largest page of RamWorks memory that has some non-0xFF data.
  let memkeep = RamWorksMemoryStart
  for (let i = RamWorksMemoryStart; i < memory.length; i++) {
    if (memory[i] !== 0xFF) {
      // If we find any non-0xFF's, jump to the next page of memory.
      // We only add 255 since we still do the i++ for the loop
      i += 255 - (i % 256)
      memkeep = i + 1
    }
  }
  const membuffer = Buffer.from(memory.slice(0, memkeep))
  // let memdiff: { [addr: number]: number } = {};
  // for (let i = 0; i < memory.length; i++) {
  //   if (prevMemory[i] !== memory[i]) {
  //     memdiff[i] = memory[i]
  //   }
  // }
  // prevMemory = memory
  return {
    s6502: save6502,
    extraRamSize: 64 * (RamWorksMaxBank + 1),
    machineName: machineName,
    softSwitches: getSoftSwitches(),
    memory: membuffer.toString("base64"),
  }
}

export const setApple2State = (newState: Apple2SaveState, version: number) => {
  const new6502: STATE6502 = JSON.parse(JSON.stringify(newState.s6502))
  setState6502(new6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    // Our switches have changed slightly over time, so ignore errors.
    // We will fix up any changed softswitches below.
    try {
      SWITCHES[keyTyped].isSet = softSwitches[key]
    } catch {
      // do nothing
    }
  }
  // If we have an old save file, we need to set the BSR_WRITE switch
  // based upon the old bank-switched RAM switches.
  if ("WRITEBSR1" in softSwitches) {
    // We didn't have prewrite before, so just make sure it's off.
    SWITCHES.BSR_PREWRITE.isSet = false
    SWITCHES.BSR_WRITE.isSet = softSwitches.WRITEBSR1 || softSwitches.WRITEBSR2 ||
      softSwitches.RDWRBSR1 || softSwitches.RDWRBSR2
  }
  const newmemory = new Uint8Array(Buffer.from(newState.memory, "base64"))
  if (version < 1) {
    // Main memory
    memory.set(newmemory.slice(0, 0x10000))
    // ROM and peripheral card memory moved from 0x20000 down to 0x10000
    memory.set(newmemory.slice(0x20000, 0x27F00), 0x10000)
    // AUX memory moved from 0x10000 up to RamWorksMemoryStart
    memory.set(newmemory.slice(0x10000, 0x20000), RamWorksMemoryStart)
    // See if we have additional RamWorks memory
    const ramWorks = (newmemory.length - 0x27F00) / 1024
    if (ramWorks > 0) {
      // If there's more data, it's the new RamWorks memory.
      setRamWorks(ramWorks + 64)  // the 64 is existing AUX memory
      memory.set(newmemory.slice(0x27F00), RamWorksMemoryStart + 0x10000)
    }
  } else {
    // Adjust our current RamWorks memory to match the restored state.
    setRamWorks(newState.extraRamSize)
    // Note that our restored memory might be much smaller in size if
    // the RamWorks is mostly filled with 0xFF's.
    memory.set(newmemory)
  }
  // Machine name might not be in older save states, so use a default in that case.
  machineName = newState.machineName || "APPLE2EE"
  doSetMachineName(machineName, false)
  updateAddressTables()
  // Force the help text to be reset if necessary.
  handleGameSetup(true)
}

const getDisplaySaveState = () => {
  // These will actually get filled in by the main thread,
  // but we need to have them here to return the correct type.
  const displayState: DisplaySaveState = {
    name: "",
    date: "",
    version: 0.0,
    arrowKeysAsJoystick: true,
    colorMode: 0,
    showScanlines: false,
    capsLock: false,
    audioEnable: false,
    mockingboardMode: 0,
    speedMode: 0,
    helptext: "",
    isDebugging: false,
    runMode: RUN_MODE.IDLE,
    breakpoints: breakpointMap,
    stackDump: getStackDump()
  }
  return displayState
}

export const doGetSaveState = (full: boolean): EmulatorSaveState => {
  const state = { emulator: getDisplaySaveState(),
    state6502: getApple2State(),
    driveState: getDriveSaveState(full),
    thumbnail: "",
    snapshots: null
  }
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doGetSaveStateWithSnapshots = (): EmulatorSaveState => {
  const state = doGetSaveState(true)
  state.snapshots = saveStates
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doSetState6502 = (newState: STATE6502) => {
  setState6502(newState)
  updateExternalMachineState()
}

export const doSetCycleCount = (count: number) => {
  setCycleCount(count)
  updateExternalMachineState()
}

export const doRestoreSaveState = (sState: EmulatorSaveState, eraseSnapshots = false) => {
  doReset()
  // There was never a version 0.9 (it was before the version was saved),
  // but this gives us a number to key off of.
  const version = sState.emulator?.version ? sState.emulator.version : 0.9
  setApple2State(sState.state6502, version)
  if (sState.emulator?.stackDump) {
    setStackDump(sState.emulator.stackDump)
  }
  restoreDriveSaveState(sState.driveState)
  if (eraseSnapshots) {
    saveStates.length = 0
    iTempState = 0
  }
  if (sState.snapshots) {
    saveStates.length = 0
    saveStates.push(...sState.snapshots)
    iTempState = saveStates.length
  }
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

let didConfiguration = false
const configureMachine = () => {
  if (didConfiguration) return
  didConfiguration = true
  enableSerialCard()
  enablePassportCard(true, 2)
  enableMockingboard(true, 4)
  enableMouseCard(true, 5)
  enableDiskDrive()
  enableHardDrive()
  get6502Instructions()
}

const resetMachine = () => {
  resetDrive()
  setButtonState()
  resetMouse()
  resetPassport()
  resetSerial()
  resetMockingboard(4)
}

const doBoot = () => {
  setCycleCount(0)
  memoryReset()
  doSetRom(machineName)
  configureMachine()
  if (code.length > 0) {
    const pcode = parseAssembly(0x300, code.split("\n"))
    memory.set(pcode, 0x300)
  }
//  testTiming()
  doReset()
  // Force the help text to be reset if necessary.
  handleGameSetup(true)
  // This is a hack. If we don't currently have a hard drive image on boot,
  // temporarily disable the hard drive and then re-enable it later.
  // This allows the floppy disk to boot instead.
  const ds = getHardDriveState(1)
  if (ds.filename === "") {
    enableHardDrive(false)
    setTimeout(() => { enableHardDrive() }, 200)
  }
}

const doReset = () => {
  clearInterrupts()
  resetSoftSwitches()
  // Reset banked RAM
  memGet(0xC082)
  reset6502()
  resetMachine()
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
  refreshTime = ([16.6881, 16.6881, 1])[speedMode]
  cpuCyclesPerRefresh = ([17030, 17030 * 4, 17030 * 4])[speedMode]
  resetRefreshCounter()
}

export const doSetIsDebugging = (enable: boolean) => {
  isDebugging = enable
  updateExternalMachineState()
  // We need to pass this just once to the UI thread, so it can display
  // the list of soft switches in the breakpoint dialog. Crossing my fingers
  // that this will _always_ get called before someone displays the dialog.
  passSoftSwitchDescriptions(getSoftSwitchDescriptions())
}

export const doSetMemory = (addr: number, value: number) => {
  memory[addr] = value
  // If we have set an HGR memory location (for example) be sure to
  // pass our updated date to the main thread.
  if (isDebugging) {
    updateExternalMachineState()
  }
}

export const doSetMachineName = (name: MACHINE_NAME, reset = true) => {
  if (machineName !== name) {
    machineName = name
    doSetRom(machineName)
    if (reset) doReset()
    updateExternalMachineState()
  }
}

export const doSetRamWorks = (size: number) => {
  setRamWorks(size)
  updateExternalMachineState()
}

const getGoBackwardIndex = () => {
  const newTmp = iTempState - 1
  if (newTmp < 0 || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

const getGoForwardIndex = () => {
  const newTmp = iTempState + 1
  if (newTmp >= saveStates.length || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

const doSnapshot = () => {
  if (saveStates.length === MAX_SNAPSHOTS) {
    saveStates.shift()
  }
  saveStates.push(doGetSaveState(false))
  // This is at the current "time" and is just past our recently-saved state.
  iTempState = saveStates.length
  passRequestThumbnail(saveStates[saveStates.length - 1].state6502.s6502.PC)
}

export const doGoBackInTime = () => {
  let newTmp = getGoBackwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    // if this is the first time we're called, make sure our current
    // state is up to date
    if (iTempState === saveStates.length) {
      doSnapshot()
      newTmp = Math.max(iTempState - 2, 0)
    }
    iTempState = newTmp
    doRestoreSaveState(saveStates[iTempState])
  }, 50)
}

export const doGoForwardInTime = () => {
  const newTmp = getGoForwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = newTmp
    doRestoreSaveState(saveStates[newTmp])
  }, 50)
}

export const doGotoTimeTravelIndex = (index: number) => {
  if (index < 0 || index >= saveStates.length) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = index
    doRestoreSaveState(saveStates[index])
  }, 50)
}

const getTimeTravelThumbnails = () => {
  const result: Array<TimeTravelThumbnail> = []
  for (let i = 0; i < saveStates.length; i++) {
    result[i] = {s6502: saveStates[i].state6502.s6502, thumbnail: saveStates[i].thumbnail}
  }
  return result
}

export const doSetThumbnailImage = (thumbnail: string) => {
  if (saveStates.length > 0) {
    saveStates[saveStates.length - 1].thumbnail = thumbnail
  }
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
  processInstruction()
  doSetRunMode(RUN_MODE.PAUSED)
}

export const doStepOver = () => {
  doSetBreakpointSkipOnce()
  if (cpuRunMode === RUN_MODE.IDLE) {
    doBoot()
    cpuRunMode = RUN_MODE.PAUSED
  }
  if (memGet(s6502.PC, false) === 0x20) {
    // If we're at a JSR then briefly step in, then step out.
    processInstruction()
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
  iRefresh = 0
  prevTime = performance.now()
  startTime = prevTime
}

export const doSetRunMode = (cpuRunModeIn: RUN_MODE) => {
  configureMachine()
  cpuRunMode = cpuRunModeIn
  if (cpuRunMode === RUN_MODE.PAUSED) {
    if (gameSetupTimerID) {
      clearInterval(gameSetupTimerID)
      gameSetupTimerID = 0
    }
    doPauseDrive()
  } else if (cpuRunMode === RUN_MODE.RUNNING) {
    doPauseDrive(true)
    doSetBreakpointSkipOnce()
    // If we go back in time and then resume running, remove all future states.
    while (saveStates.length > 0 && iTempState < (saveStates.length - 1)) saveStates.pop()
    iTempState = saveStates.length
    if (!gameSetupTimerID) {
      gameSetupTimerID = setInterval(handleGameSetup, 1000)
    }  
  }
  updateExternalMachineState()
  resetRefreshCounter()
  if (cpuSpeed === 0) {
    cpuSpeed = 1
    doAdvance6502Timer()
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
  if (isDebugging && cpuRunMode === RUN_MODE.PAUSED) {
    return getBasePlusAuxMemory()
  }
  return new Uint8Array()
}

const doGetStackString = () => {
  return (isDebugging && cpuRunMode !== RUN_MODE.IDLE) ? getStackString() : ""
}

const updateExternalMachineState = () => {
  const state: MachineState = {
    addressGetTable: addressGetTable,
    altChar: SWITCHES.ALTCHARSET.isSet,
    arrowKeysAsJoystick: true,  // ignored by main thread
    breakpoints: breakpointMap,
    button0: SWITCHES.PB0.isSet,
    button1: SWITCHES.PB1.isSet,
    canGoBackward: getGoBackwardIndex() >= 0,
    canGoForward: getGoForwardIndex() >= 0,
    capsLock: true,  // ignored by main thread
    c800Slot: C800SlotGet(),
    colorMode: COLOR_MODE.COLOR,  // ignored by main thread
    showScanlines: false,
    cout: memGet(0x0039) << 8 | memGet(0x0038),
    cpuSpeed: cpuSpeed,
    theme: UI_THEME.CLASSIC,  // ignored by main thread
    extraRamSize: 64 * (RamWorksMaxBank + 1),
    helpText: "",  // ignored by main thread
    hires: getHires(),
    iTempState: iTempState,
    isDebugging: isDebugging,
    lores: getTextPage(true),
    machineName: machineName,
    memoryDump: getMemoryDump(),
    noDelayMode: !SWITCHES.COLUMN80.isSet && !SWITCHES.AN3.isSet,
    ramWorksBank: RamWorksBankGet(),
    runMode: cpuRunMode,
    s6502: s6502,
    softSwitches: getSoftSwitches(),
    speedMode: speedMode,
    stackString: doGetStackString(),
    textPage: getTextPage(),
    timeTravelThumbnails: getTimeTravelThumbnails(),
    useOpenAppleKey: false,  // ignored by main thread,
    hotReload: false
  }
  passMachineState(state)
}


export const forceSoftSwitches = (addresses: Array<number> | null) => {
  if (addresses) {
    for (let i = 0; i < addresses.length; i++) {
      overrideSoftSwitch(addresses[i])
    }
  } else {
    restoreSoftSwitches()
  }
  updateExternalMachineState()
}

const doAdvance6502 = () => {
  const newTime = performance.now()
  timeDelta = newTime - prevTime
  if (timeDelta < refreshTime) return
  prevTime = newTime
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
  for (;;) {
    const cycles = processInstruction()
    if (cycles < 0) break
    cycleTotal += cycles
    if ((cycleTotal % 17030) >= 12480) {
      // Return "low" for 70 scan lines out of 262 (70 * 65 cycles = 4550)
      if (!SWITCHES.VBL.isSet) {
        startVBL()
      }
    }
    if (cycleTotal >= cpuCyclesPerRefresh) {
      endVBL()
      break
    }
  }
  iRefresh++
  const speedInCyclesPerMS = (iRefresh * cpuCyclesPerRefresh) / (performance.now() - startTime)
  // The / 10 gets rid of the ones digit, which turns into the thousandths digit.
  cpuSpeed = (speedInCyclesPerMS < 10000) ? Math.round(speedInCyclesPerMS / 10) / 100 :
    Math.round(speedInCyclesPerMS / 100) / 10
  // Lengthening this refresh interval has very little impact on the speed.
  if (iRefresh % 2) {
    handleGamepads()
    updateExternalMachineState()
  }
  if (takeSnapshot) {
    takeSnapshot = false
    doSnapshot()
  }
}

// To speed up the emulator in fast mode, we can change this refresh interval.
// This makes the GUI less responsive since we are starving the main thread.
// The results look something like:
//  iRefresh + 1:     5.5 MHz
//  iRefresh + 2:     7.9 MHz
//  iRefresh + 3:     9.6 MHz
//  iRefresh + 4:     11.3 MHz
//  iRefresh + 5:     12.6 MHz
//  iRefresh + 10:    18.0 MHz
//  iRefresh + 20:    23.2 MHz
//
const doAdvance6502Timer = () => {
  doAdvance6502()
  const iRefreshFinish = iRefresh + ([1, 5, 10])[speedMode]
  while (cpuRunMode === RUN_MODE.RUNNING && iRefresh !== iRefreshFinish) {
    doAdvance6502()
  }
  setTimeout(doAdvance6502Timer, cpuRunMode === RUN_MODE.RUNNING ? 0 : 20)
}
