import { doSetRunMode,
  doGetSaveState, doRestoreSaveState, doSetSpeedMode,
  doGoBackInTime, doGoForwardInTime,
  doStepInto, doStepOver, doStepOut, doSetBinaryBlock, doSetIsDebugging, doGotoTimeTravelIndex, doSetState6502, doTakeSnapshot, doGetSaveStateWithSnapshots, doSetThumbnailImage, doSetPastedText, forceSoftSwitches, 
  doSetMemory,
  doSetMachineName,
  doSetRamWorks,
  doSetCycleCount} from "./motherboard"
import { doSetEmuDriveNewData, doSetEmuDriveProps } from "./devices/drivestate"
import { sendTextToEmulator } from "./devices/keyboard"
import { pressAppleCommandKey, setGamepads } from "./devices/joystick"
import { DRIVE, MSG_MAIN, MSG_WORKER } from "../common/utility"
import { doSetBreakpoints } from "./cpu6502"
import { MouseCardEvent } from "./devices/mouse"
import { receiveMidiData } from "./devices/passport/passport"
import { receiveCommData } from "./devices/superserial/serial"

// This file must have worker types, but not DOM types.
// The global should be that of a dedicated worker.

// This fixes `self`'s type.
declare const self: DedicatedWorkerGlobalScope
export {}

let isTesting = false
export const setIsTesting = () => {
  isTesting = true
}

const doPostMessage = (msg: MSG_WORKER, payload: MessagePayload) => {
  if (!isTesting) self.postMessage({msg, payload})
}

export const passMachineState = (state: MachineState) => {
  doPostMessage(MSG_WORKER.MACHINE_STATE, state)
}

export const passClickSpeaker = (cycleCount: number) => {
  doPostMessage(MSG_WORKER.CLICK, cycleCount)
}

export const passDriveProps = (props: DriveProps) => {
  doPostMessage(MSG_WORKER.DRIVE_PROPS, props)
}

export const passDriveSound = (sound: DRIVE) => {
  doPostMessage(MSG_WORKER.DRIVE_SOUND, sound)
}

const passSaveState = (sState: EmulatorSaveState) => {
  doPostMessage(MSG_WORKER.SAVE_STATE, sState)
}

export const passRumble = (params: GamePadActuatorEffect) => {
  doPostMessage(MSG_WORKER.RUMBLE, params)
}

export const passHelptext = (helptext: string) => {
  doPostMessage(MSG_WORKER.HELP_TEXT, helptext)
}

export const passEnhancedMidi = (param: number) => {
  doPostMessage(MSG_WORKER.ENHANCED_MIDI, param)
}

export const passShowMouse = (state: boolean) => {
  doPostMessage(MSG_WORKER.SHOW_MOUSE, state)
}

export const passMockingboard = (sound: MockingboardSound) => {
  doPostMessage(MSG_WORKER.MBOARD_SOUND, sound)
}

export const passTxCommData = (data: Uint8Array) => {
  doPostMessage(MSG_WORKER.COMM_DATA, data)
}

export const passTxMidiData = (data: Uint8Array) => {
  doPostMessage(MSG_WORKER.MIDI_DATA, data)
}

export const passRequestThumbnail = (PC: number) => {
  doPostMessage(MSG_WORKER.REQUEST_THUMBNAIL, PC)
}

export const passSoftSwitchDescriptions = (desc: string[]) => {
  doPostMessage(MSG_WORKER.SOFTSWITCH_DESCRIPTIONS, desc)
}

export const pass6502Instructions = (instructions: Array<PCodeInstr1>) => {
  doPostMessage(MSG_WORKER.INSTRUCTIONS, instructions)
}

// We do this weird check so we can safely run this code from the node.js
// command line where self will be undefined.
if (typeof self !== "undefined") {
  self.onmessage = (e: MessageEvent) => {
    if (!e.data || typeof e.data !== "object") {
      // console.error(`worker2main: invalid message: ${JSON.stringify(e.data)}`)
      return
    }
    if (!("msg" in e.data)) return
    switch (e.data.msg as MSG_MAIN) {
      case MSG_MAIN.RUN_MODE:
        doSetRunMode(e.data.payload)
        break
      case MSG_MAIN.STATE6502:
        doSetState6502(e.data.payload as STATE6502)
        break
      case MSG_MAIN.DEBUG:
        doSetIsDebugging(e.data.payload)
        break
      case MSG_MAIN.BREAKPOINTS:
        doSetBreakpoints(e.data.payload)
        break
      case MSG_MAIN.STEP_INTO:
        doStepInto()
        break
      case MSG_MAIN.STEP_OVER:
        doStepOver()
        break
      case MSG_MAIN.STEP_OUT:
        doStepOut()
        break
      case MSG_MAIN.SPEED:
        doSetSpeedMode(e.data.payload as number)
        break
      case MSG_MAIN.TIME_TRAVEL_STEP:
        if (e.data.payload === "FORWARD") {
            doGoForwardInTime()
        } else {
            doGoBackInTime()
        }
        break
      case MSG_MAIN.TIME_TRAVEL_INDEX:
        doGotoTimeTravelIndex(e.data.payload)
        break
      case MSG_MAIN.TIME_TRAVEL_SNAPSHOT:
        doTakeSnapshot()
        break
      case MSG_MAIN.THUMBNAIL_IMAGE:
        doSetThumbnailImage(e.data.payload as string)
        break
      case MSG_MAIN.RESTORE_STATE:
        doRestoreSaveState(e.data.payload as EmulatorSaveState, true)
        break
      case MSG_MAIN.KEYPRESS:
        sendTextToEmulator(e.data.payload)
        break
      case MSG_MAIN.MOUSEEVENT:
        MouseCardEvent(e.data.payload)
        break
      case MSG_MAIN.PASTE_TEXT:
        doSetPastedText(e.data.payload as string)
//        sendPastedText(e.data.payload)
        break
      case MSG_MAIN.APPLE_PRESS:
        pressAppleCommandKey(true, e.data.payload)
        break
      case MSG_MAIN.APPLE_RELEASE:
        pressAppleCommandKey(false, e.data.payload)
        break
      case MSG_MAIN.GET_SAVE_STATE:
        passSaveState(doGetSaveState(true))
        break
      case MSG_MAIN.GET_SAVE_STATE_SNAPSHOTS:
        passSaveState(doGetSaveStateWithSnapshots())
        break
      case MSG_MAIN.DRIVE_PROPS: {
        const props = e.data.payload as DriveProps
        doSetEmuDriveProps(props)
        break
      }
      case MSG_MAIN.DRIVE_NEW_DATA: {
        const props = e.data.payload as DriveProps
        doSetEmuDriveNewData(props)
        break
      }
      case MSG_MAIN.GAMEPAD:
        setGamepads(e.data.payload)
        break
      case MSG_MAIN.SET_BINARY_BLOCK: {
        const memBlock = e.data.payload as SetMemoryBlock
        doSetBinaryBlock(memBlock.address, memBlock.data, memBlock.run)
        break
      }
      case MSG_MAIN.SET_CYCLECOUNT:
        doSetCycleCount(e.data.payload as number)
        break
      case MSG_MAIN.SET_MEMORY: {
        const setmem = e.data.payload
        doSetMemory(setmem.address, setmem.value)
        break
      }
      case MSG_MAIN.COMM_DATA:
        receiveCommData(e.data.payload)
        break
      case MSG_MAIN.MIDI_DATA:
        receiveMidiData(e.data.payload)
        break
      case MSG_MAIN.RAMWORKS:
        doSetRamWorks(e.data.payload as number)
        break
      case MSG_MAIN.MACHINE_NAME:
        doSetMachineName(e.data.payload as MACHINE_NAME)
        break
      case MSG_MAIN.SOFTSWITCHES:
        forceSoftSwitches(e.data.payload)
        break
      default:
        console.error(`worker2main: unhandled msg: ${JSON.stringify(e.data)}`)
        break
    }
  }
}
