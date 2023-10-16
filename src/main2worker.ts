import { STATE, DRIVE, MSG_WORKER, MSG_MAIN, MouseEventSimple } from "./emulator/utility"
import { doPlayDriveSound } from "./diskinterface"
import { clickSpeaker, emulatorSoundEnable } from "./speaker"
import { startupTextPage } from "./startuptextpage"
import { doRumble } from "./gamepad"
import { setShowMouse } from "./canvas"
import { playMockingboard } from "./mockingboard_audio"
import { receiveCommData } from "./imagewriter"
import DisplayApple2 from "./display"

let worker: Worker | null = null

let saveStateCallback: (saveState: EmulatorSaveState) => void

let display: DisplayApple2
export const updateDisplay = (speed?: number, helptext?: string) => {
  display.updateDisplay(speed, helptext)
}
export const setDisplay = (displayIn: DisplayApple2) => {
  display = displayIn
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const doPostMessage = (msg: MSG_MAIN, payload: any) => {
  if (!worker) {
    worker = new Worker(new URL('./emulator/worker2main', import.meta.url), {type:"module"})
    worker.onmessage = doOnMessage
  }
  worker.postMessage({msg, payload});
}

export const passSetCPUState = (state: STATE) => {
  doPostMessage(MSG_MAIN.STATE, state)
}

export const passSetBreakpoint = (breakpoint: number) => {
  doPostMessage(MSG_MAIN.BREAKPOINT, breakpoint)
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

export const passSetNormalSpeed = (normal: boolean) => {
  doPostMessage(MSG_MAIN.SPEED, normal)
}

export const passGoForwardInTime = () => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL, "FORWARD")
}

export const passGoBackInTime = () => {
  doPostMessage(MSG_MAIN.TIME_TRAVEL, "BACKWARD")
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
  doPostMessage(MSG_MAIN.PASTE_TEXT, text)
}

export const passAppleCommandKeyPress = (left: boolean) => {
  doPostMessage(MSG_MAIN.APPLE_PRESS, left)
}

export const passAppleCommandKeyRelease = (left: boolean) => {
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

let machineState: MachineState = {
  state: STATE.IDLE,
  speed: 0,
  altChar: true,
  noDelayMode: false,
  textPage: new Uint8Array(1).fill(32),
  lores: new Uint8Array(),
  hires: new Uint8Array(),
  debugDump: '',
  button0: false,
  button1: false,
  canGoBackward: true,
  canGoForward: true
}

const doOnMessage = (e: MessageEvent) => {
  switch (e.data.msg as MSG_WORKER) {
    case MSG_WORKER.MACHINE_STATE: {
      const cpuStateChanged = machineState.speed !== e.data.payload.speed ||
        machineState.state !== e.data.payload.state ||
        machineState.debugDump !== e.data.payload.debugDump ||
        machineState.button0 !== e.data.payload.button0 ||
        machineState.button1 !== e.data.payload.button1 ||
        machineState.canGoBackward !== e.data.payload.canGoBackward ||
        machineState.canGoForward !== e.data.payload.canGoForward
      if (machineState.state !== e.data.payload.state) {
        emulatorSoundEnable(e.data.payload.state === STATE.RUNNING)
      }
      machineState = e.data.payload
      if (cpuStateChanged) updateDisplay(machineState.speed)
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
      const set = e.data.payload as boolean
      setShowMouse(set)
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
    default:
      console.error("main2worker: unknown msg: " + JSON.stringify(e.data))
      break
    }
}

export const handleGetState = () => {
  return machineState.state
}

export const handleGetTextPage = () => {
  return machineState.textPage
}

export const setStartTextPage = () => {
  machineState.textPage = startupTextPage
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

export const handleGetButton = (left: boolean) => {
  return left ? machineState.button0 : machineState.button1
}

export const handleCanGoBackward = () => {
  return machineState.canGoBackward
}

export const handleCanGoForward = () => {
  return machineState.canGoForward
}

export const handleGetSaveState = (callback: (saveState: EmulatorSaveState) => void) => {
  saveStateCallback = callback
  doPostMessage(MSG_MAIN.GET_SAVE_STATE, true)
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

// async function fetchData(url: string): Promise<Uint8Array> {
//   let result: Uint8Array
//   try {
//     const response = await fetch(url, {mode:'cors'});
//     const buffer = await response.arrayBuffer();
//     const uint8Array = new Uint8Array(buffer);
//     result = uint8Array;
//   } catch (error) {
//     console.error('Error:', error);
//     result = new Uint8Array()
//   }
//   return result
// }

export const handleSetDiskData = (drive: number,
  data: Uint8Array, filename: string) => {
  const props = driveProps[drive]
  props.drive = drive
  props.filename = filename
  // const url = 'https://archive.org/download/TotalReplay/Total%20Replay%20v5.0-beta.3.hdv'
  // fetchData(url)
  // .then(data => {
  //   props.diskData = data
  //   doPostMessage(MSG_MAIN.DRIVE_PROPS, props)
  // })
  props.diskData = data
  doPostMessage(MSG_MAIN.DRIVE_PROPS, props)
}
