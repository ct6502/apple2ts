import { RUN_MODE, DRIVE, MSG_WORKER, MSG_MAIN, MouseEventSimple, default6502State, COLOR_MODE, TEST_DEBUG } from "./emulator/utility/utility"
import { clickSpeaker, emulatorSoundEnable } from "./devices/speaker"
import { startupTextPage } from "./panels/startuptextpage"
import { doRumble } from "./devices/gamepad"
import { playMockingboard } from "./devices/mockingboard_audio"
import { receiveCommData } from "./devices/serialhub"
import { receiveMidiData,setEnhancedMidi } from "./devices/midiinterface"
import { BreakpointMap } from "./emulator/utility/breakpoint"
import { doPlayDriveSound } from "./devices/drivesounds"
import { copyCanvas } from "./copycanvas"
import { doSetDriveProps } from "./devices/driveprops"

let worker: Worker | null = null

let saveStateCallback: (sState: EmulatorSaveState) => void

export const setMain2Worker = (workerIn: Worker) => {
  worker = workerIn
}

const doPostMessage = (msg: MSG_MAIN, payload: MessagePayload) => {
  if (worker) worker.postMessage({msg, payload});
}

export const passSetRunMode = (runMode: RUN_MODE) => {
  doPostMessage(MSG_MAIN.RUN_MODE, runMode)
}

export const passSetState6502 = (state: STATE6502) => {
  doPostMessage(MSG_MAIN.STATE6502, state)
}

export const passBreakpoints = (breakpoints: BreakpointMap) => {
  doPostMessage(MSG_MAIN.BREAKPOINTS, breakpoints)
  // Force the state right away, so the UI can update.
  machineState.breakpoints = breakpoints
}

export const passStepInto = () => {
  doPostMessage(MSG_MAIN.STEP_INTO, true)
}

export const passStepOver = () => {
  doPostMessage(MSG_MAIN.STEP_OVER, true)
}

export const passStepOut = () => {
  doPostMessage(MSG_MAIN.STEP_OUT, true)
}

export const passSetDebug = (doDebug: boolean) => {
  doPostMessage(MSG_MAIN.DEBUG, doDebug)
}

export const passSetDisassembleAddress = (addr: number) => {
  if (addr >= -2 && addr <= 0xFFFF) {
    doPostMessage(MSG_MAIN.DISASSEMBLE_ADDR, addr)
  }
}

export const passSetSpeedMode = (mode: number) => {
  doPostMessage(MSG_MAIN.SPEED, mode)
  // Force the state right away, so the UI can update.
  machineState.speedMode = mode
}

export const passColorMode = (mode: COLOR_MODE) => {
  // Currently the emulator doesn't care about color mode.
  // Just set it directly on our machine state for later retrieval.
  // Somewhat roundabout but it keeps all the properties in one place.
  machineState.colorMode = mode
}

export const passCapsLock = (lock: boolean) => {
  // See comment under passColorMode
  machineState.capsLock = lock
}

export const passDarkMode = (mode: boolean) => {
  // See comment under passColorMode
  machineState.darkMode = mode
}

export const passHelpText = (helptext: string) => {
  // See comment under passColorMode
  machineState.helpText = helptext
}

export const passGoForwardInTime = () => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL_STEP, "FORWARD")
}

export const passGoBackInTime = () => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL_STEP, "BACKWARD")
}

export const passTimeTravelIndex = (index: number) => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL_INDEX, index)
}

export const passTimeTravelSnapshot = () => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL_SNAPSHOT, true)
}

export const passRestoreSaveState = (sState: EmulatorSaveState) => {
  doPostMessage(MSG_MAIN.RESTORE_STATE, sState)
}

export const passKeypress = (text: string) => {
  doPostMessage(MSG_MAIN.KEYPRESS, text)
}

export const passMouseEvent = (event: MouseEventSimple) => {
  doPostMessage(MSG_MAIN.MOUSEEVENT, event)
}

export const passPasteText = (text: string) => {
  text = text.replaceAll(/[”“]/g,'"')  // fancy quotes with regular
  text = text.replaceAll('\n','\r')  // LFs to CRs
  doPostMessage(MSG_MAIN.PASTE_TEXT, text)
}

export const passAppleCommandKeyPress = (left: boolean) => {
  if (left) {
    machineState.button0 = true
  } else {
    machineState.button1 = true
  }
  doPostMessage(MSG_MAIN.APPLE_PRESS, left)
}

export const passAppleCommandKeyRelease = (left: boolean) => {
  if (left) {
    machineState.button0 = false
  } else {
    machineState.button1 = false
  }
  doPostMessage(MSG_MAIN.APPLE_RELEASE, left)
}

export const passSetGamepads = (gamePads: EmuGamepad[] | null) => {
  doPostMessage(MSG_MAIN.GAMEPAD, gamePads)
}

export const passSetBinaryBlock = (address: number, data: Uint8Array, run: boolean) => {
  const memBlock: SetMemoryBlock = {address, data, run}
  doPostMessage(MSG_MAIN.SET_BINARY_BLOCK, memBlock)
}

export const passSetMemory = (address: number, value: number) => {
  doPostMessage(MSG_MAIN.SET_MEMORY, {address, value})
}

export const passRxCommData = (data: Uint8Array) => {
  doPostMessage(MSG_MAIN.COMM_DATA, data)
}

export const passRxMidiData = (data: Uint8Array) => {
  doPostMessage(MSG_MAIN.MIDI_DATA, data)
}

const passThumbnailImage = (thumbnail: string) => {
  doPostMessage(MSG_MAIN.THUMBNAIL_IMAGE, thumbnail)
}

export const passSetRamWorks = (size: number) => {
  doPostMessage(MSG_MAIN.RamWorks, size)
  // This will also come from the emulator, but set it here so the UI updates.
  machineState.extraRamSize = size
}

export const passSetSoftSwitches = (addresses: Array<number> | null) => {
  doPostMessage(MSG_MAIN.SOFTSWITCHES, addresses)
}

export const passSetDriveProps = (props: DriveProps) => {
  doPostMessage(MSG_MAIN.DRIVE_PROPS, props)
}

let machineState: MachineState = {
  addressGetTable: [],
  altChar: true,
  breakpoints: new BreakpointMap(),
  button0: false,
  button1: false,
  c800Slot: 255,
  canGoBackward: true,
  canGoForward: true,
  capsLock: true,
  colorMode: COLOR_MODE.COLOR,
  cout: 0,
  cpuSpeed: 0,
  darkMode: false,
  disassembly: '',
  extraRamSize: 64,
  helpText: '',
  hires: new Uint8Array(),
  isDebugging: TEST_DEBUG,
  iTempState: 0,
  lores: new Uint8Array(),
  memoryDump: new Uint8Array(),
  nextInstruction: '',
  noDelayMode: false,
  ramWorksBank: 0,
  runMode: RUN_MODE.IDLE,
  s6502: default6502State(),
  speedMode: 0,
  softSwitches: {},
  stackString: '',
  textPage: new Uint8Array(1).fill(32),
  timeTravelThumbnails: new Array<TimeTravelThumbnail>(),
}

export const doOnMessage = (e: MessageEvent): {speed: number, helptext: string} | null => {
  switch (e.data.msg as MSG_WORKER) {
    case MSG_WORKER.MACHINE_STATE: {
      const newState = e.data.payload as MachineState
      if (machineState.runMode !== newState.runMode) {
        emulatorSoundEnable(newState.runMode === RUN_MODE.RUNNING)
      }
      // This is a hack because the main thread owns these properties.
      // Force them back to their actual values.
      newState.colorMode = machineState.colorMode
      newState.capsLock = machineState.capsLock
      newState.darkMode = machineState.darkMode
      newState.helpText = machineState.helpText
      machineState = newState
      return {speed: machineState.cpuSpeed, helptext: machineState.helpText}
    }
    case MSG_WORKER.SAVE_STATE: {
      const sState = e.data.payload as EmulatorSaveState
      saveStateCallback(sState)
      break
    }
    case MSG_WORKER.CLICK:
      clickSpeaker(e.data.payload as number)
      break
    case MSG_WORKER.DRIVE_PROPS: {
      doSetDriveProps(e.data.payload as DriveProps)
      return {speed: machineState.cpuSpeed, helptext: ''}
      break
    }
    case MSG_WORKER.DRIVE_SOUND: {
      const sound = e.data.payload as DRIVE
      doPlayDriveSound(sound)
      break
    }
    case MSG_WORKER.RUMBLE: {
      const params = e.data.payload as GamePadActuatorEffect
      doRumble(params)
      break
    }
    case MSG_WORKER.HELP_TEXT: {
      const helptext = e.data.payload as string
      return {speed: 0, helptext: helptext}
      break
    }
    case MSG_WORKER.SHOW_MOUSE: {
      showMouse = e.data.payload as boolean
      break
    }
    case MSG_WORKER.MBOARD_SOUND: {
      const mboard = e.data.payload as MockingboardSound
      playMockingboard(mboard)
      break
    }
    case MSG_WORKER.COMM_DATA: {
      const commdata = e.data.payload as Uint8Array
      receiveCommData(commdata)
      break
    }
    case MSG_WORKER.MIDI_DATA: {
      const mididata = e.data.payload as Uint8Array
      receiveMidiData(mididata)
      break
    }
    case MSG_WORKER.ENHANCED_MIDI: {
      const midiarg = e.data.payload as number
      setEnhancedMidi(midiarg)
      break
    }
    case MSG_WORKER.REQUEST_THUMBNAIL: {
      copyCanvas((blob) => {
        const reader = new FileReader();
        reader.onloadend = function() {
          passThumbnailImage(reader.result as string)
        }        
        reader.readAsDataURL(blob)
      }, true)
      break
    }
    default:
      console.error("main2worker: unknown msg: " + JSON.stringify(e.data))
      break
  }
  return null
}

let showMouse = true

export const handleGetShowMouse = () => {
  return showMouse
}

export const handleGetRunMode = () => {
  return machineState.runMode
}

export const handleGetBreakpoints = () => {
  return machineState.breakpoints
}

export const handleGetCout = () => {
  return machineState.cout
}

export const handleGetSpeedMode = () => {
  return machineState.speedMode
}

export const handleGetIsDebugging = () => {
  return machineState.isDebugging
}

export const handleGetState6502 = () => {
  return machineState.s6502
}

export const handleGetTextPage = () => {
  return machineState.textPage
}

export const setStartTextPage = () => {
  if (machineState.textPage.length === 1) {
    machineState.textPage = startupTextPage
  }
}

export const handleGetLores = () => {
  return machineState.lores
}

export const handleGetHires = () => {
  return machineState.hires
}

export const handleGetNoDelayMode = () => {
  return machineState.noDelayMode
}

export const handleGetAltCharSet = () => {
  return machineState.altChar
}

export const handleGetStackString = () => {
  return machineState.stackString
}

export const handleGetSoftSwitches = () => {
  return machineState.softSwitches
}

export const handleGetC800Slot = () => {
  return machineState.c800Slot
}

export const handleGetRamWorksBank = () => {
  return machineState.ramWorksBank
}

export const handleGetMemoryDump = () => {
  return machineState.memoryDump
}

export const handleGetAddressGetTable = () => {
  return machineState.addressGetTable
}

export const handleGetDisassembly = () => {
  return machineState.disassembly
}

export const handleGetNextInstruction = () => {
  return machineState.nextInstruction
}

export const handleGetLeftButton = () => {
  return machineState.button0
}

export const handleGetRightButton = () => {
  return machineState.button1
}

export const handleCanGoBackward = () => {
  return machineState.canGoBackward
}

export const handleCanGoForward = () => {
  return machineState.canGoForward
}

export const handleGetTempStateIndex = () => {
  return machineState.iTempState
}

export const handleGetTimeTravelThumbnails = () => {
  return machineState.timeTravelThumbnails
}

export const handleGetColorMode = () => {
  return machineState.colorMode
}

export const handleGetCapsLock = () => {
  return machineState.capsLock
}

export const handleGetDarkMode = () => {
  return machineState.darkMode
}

export const handleGetSaveState = (callback: (sState: EmulatorSaveState) => void,
  withSnapshots: boolean) => {
  saveStateCallback = callback
  doPostMessage(withSnapshots ? MSG_MAIN.GET_SAVE_STATE_SNAPSHOTS : MSG_MAIN.GET_SAVE_STATE, true)
}

export const handleGetMemSize = () => {
  return machineState.extraRamSize
}

export const handleGetHelpText = () => {
  return machineState.helpText
}
