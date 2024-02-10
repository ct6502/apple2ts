import { RUN_MODE, DRIVE, MSG_WORKER, MSG_MAIN, MouseEventSimple, default6502State, COLOR_MODE } from "./emulator/utility/utility"
import { clickSpeaker, emulatorSoundEnable } from "./devices/speaker"
import { startupTextPage } from "./panels/startuptextpage"
import { doRumble } from "./devices/gamepad"
import { playMockingboard } from "./devices/mockingboard_audio"
import { receiveMidiData } from "./devices/midiinterface"
import DisplayApple2 from "./display"
import { BreakpointMap } from "./panels/breakpoint"
import { doPlayDriveSound } from "./devices/drivesounds"
import { receiveCommData } from "./devices/iwii"
import { iconData, iconKey, iconName } from "./img/icons"
import { copyCanvas } from "./copycanvas"

let worker: Worker | null = null

let saveStateCallback: (saveState: EmulatorSaveState) => void

let display: DisplayApple2
export const updateDisplay = (speed?: number, helptext?: string) => {
  display.updateDisplay(speed, helptext)
}
export const setDisplay = (displayIn: DisplayApple2) => {
  display = displayIn
}

const doPostMessage = (msg: MSG_MAIN, payload: MessagePayload) => {
  if (!worker) {
    worker = new Worker(new URL('./emulator/worker2main', import.meta.url), {type:"module"})
    worker.onmessage = doOnMessage
  }
  worker.postMessage({msg, payload});
}

export const passSetRunMode = (runMode: RUN_MODE) => {
  doPostMessage(MSG_MAIN.RUN_MODE, runMode)
}

export const passSetState6502 = (state: STATE6502) => {
  doPostMessage(MSG_MAIN.STATE6502, state)
}

export const passBreakpoints = (breakpoints: BreakpointMap) => {
  doPostMessage(MSG_MAIN.BREAKPOINTS, breakpoints)
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
  machineState.speedMode = mode
}

export const passColorMode = (mode: COLOR_MODE) => {
  // Currently the emulator doesn't care about color mode.
  // Just set it directly on our machine state for later retrieval.
  // Somewhat roundabout but it keeps all the properties in one place.
  machineState.colorMode = mode
}

export const passCapsLock = (lock: boolean) => {
  // Currently the emulator doesn't care about color mode.
  // Just set it directly on our machine state for later retrieval.
  // Somewhat roundabout but it keeps all the properties in one place.
  machineState.capsLock = lock
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

export const passRestoreSaveState = (saveState: EmulatorSaveState) => {
  doPostMessage(MSG_MAIN.RESTORE_STATE, saveState)
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

export const passRxCommData = (data: Uint8Array) => {
  doPostMessage(MSG_MAIN.COMM_DATA, data)
}

export const passRxMidiData = (data: Uint8Array) => {
  doPostMessage(MSG_MAIN.MIDI_DATA, data)
}

const passThumbnailImage = (thumbnail: string) => {
  doPostMessage(MSG_MAIN.THUMBNAIL_IMAGE, thumbnail)
}

let machineState: MachineState = {
  runMode: RUN_MODE.IDLE,
  s6502: default6502State(),
  cpuSpeed: 0,
  speedMode: 0,
  isDebugging: false,
  altChar: true,
  noDelayMode: false,
  colorMode: COLOR_MODE.COLOR,
  capsLock: true,
  textPage: new Uint8Array(1).fill(32),
  lores: new Uint8Array(),
  hires: new Uint8Array(),
  debugDump: '',
  memoryDump: new Uint8Array(),
  addressGetTable: [],
  disassembly: '',
  nextInstruction: '',
  button0: false,
  button1: false,
  canGoBackward: true,
  canGoForward: true,
  iTempState: 0,
  timeTravelThumbnails: new Array<TimeTravelThumbnail>,
}

const doOnMessage = (e: MessageEvent) => {
  switch (e.data.msg as MSG_WORKER) {
    case MSG_WORKER.MACHINE_STATE: {
      const newState = e.data.payload as MachineState
      const cpuStateChanged = machineState.cpuSpeed !== newState.cpuSpeed ||
        machineState.cpuSpeed !== newState.cpuSpeed ||
        machineState.runMode !== newState.runMode ||
        machineState.speedMode !== newState.speedMode ||
        machineState.isDebugging !== newState.isDebugging ||
        machineState.debugDump !== newState.debugDump ||
        machineState.disassembly !== newState.disassembly ||
        machineState.nextInstruction !== newState.nextInstruction ||
        machineState.button0 !== newState.button0 ||
        machineState.button1 !== newState.button1 ||
        machineState.canGoBackward !== newState.canGoBackward ||
        machineState.canGoForward !== newState.canGoForward
      if (machineState.runMode !== newState.runMode) {
        emulatorSoundEnable(newState.runMode === RUN_MODE.RUNNING)
      }
      // This is a hack because the main thread owns these properties.
      // Force them back to their actual values.
      newState.colorMode = machineState.colorMode
      newState.capsLock = machineState.capsLock
      machineState = newState
      if (cpuStateChanged) updateDisplay(machineState.cpuSpeed)
      break
    }
    case MSG_WORKER.SAVE_STATE: {
      const saveState = e.data.payload as EmulatorSaveState
      saveStateCallback(saveState)
      break
    }
    case MSG_WORKER.CLICK:
      clickSpeaker(e.data.payload as number)
      break
    case MSG_WORKER.DRIVE_PROPS: {
      const props = e.data.payload as DriveProps
      driveProps[props.drive] = props
      updateDisplay()
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
      updateDisplay(0, helptext)
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
}

let showMouse = true

export const handleGetShowMouse = () => {
  return showMouse
}

export const handleGetRunMode = () => {
  return machineState.runMode
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

export const handleGetDebugDump = () => {
  return machineState.debugDump
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

export const handleGetSaveState = (callback: (saveState: EmulatorSaveState) => void,
  withSnapshots: boolean) => {
  saveStateCallback = callback
  doPostMessage(withSnapshots ? MSG_MAIN.GET_SAVE_STATE_SNAPSHOTS : MSG_MAIN.GET_SAVE_STATE, true)
}

const initDriveProps = (drive: number): DriveProps => {
  return {
    hardDrive: false,
    drive: drive,
    filename: "",
    status: "",
    diskHasChanges: false,
    motorRunning: false,
    diskData: new Uint8Array()
  }
}
const driveProps: DriveProps[] = [initDriveProps(0), initDriveProps(1), initDriveProps(2)];
driveProps[0].hardDrive = true

export const handleGetFilename = (drive: number) => {
  let f = driveProps[drive].filename
  if (f !== "") {
    const i = f.lastIndexOf('.')
    if (i > 0) {
      f = f.substring(0, i)
    }
    return f
  }
  return null
}

export const handleGetDriveProps = (drive: number) => {
  return driveProps[drive]
}

export const handleSetDiskFromURL = async (url: string) => {
  // Download the file from the fragment URL
  try {
    // Ask CT6502 for why we need to use this favicon header
    const favicon: { [key: string]: string } = {};
    favicon[iconKey()] = iconData()
    const response = await fetch(iconName() + url, { headers: favicon })
    if (!response.ok) {
      console.error(`HTTP error: status ${response.status}`)
      return
    }
    const blob = await response.blob()
    const buffer = await new Response(blob).arrayBuffer()
    const urlObj = new URL(url)
    let name = url
    const hasSlash = urlObj.pathname.lastIndexOf('/')
    if (hasSlash >= 0) {
      name = urlObj.pathname.substring(hasSlash + 1)
    }
    const props = driveProps[0]
    props.drive = 0
    props.filename = name
    props.diskData = new Uint8Array(buffer)
    doPostMessage(MSG_MAIN.DRIVE_PROPS, props)
    passSetRunMode(RUN_MODE.NEED_BOOT)
  } catch (e) {
    console.error(`Error fetching URL: ${url}`)
  }
}

export const handleSetDiskData = (drive: number,
  data: Uint8Array, filename: string) => {
  const props = driveProps[drive]
  props.drive = drive
  props.filename = filename
  props.diskData = data
  doPostMessage(MSG_MAIN.DRIVE_PROPS, props)
}
