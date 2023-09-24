import { doSetCPUState,
  doGetSaveState, doRestoreSaveState, doSetNormalSpeed,
  doGoBackInTime, doGoForwardInTime,
  doStepInto, doStepOver, doStepOut, doSetBinaryBlock } from "./motherboard";
import { doSetDriveProps } from "./drivestate"
import { sendPastedText, sendTextToEmulator } from "./keyboard"
import { pressAppleCommandKey, setGamepads } from "./joystick"
import { DRIVE, MSG_MAIN, MSG_WORKER } from "./utility";
import { doSetBreakpoint, doSetDebug } from "./cpu6502";
import { MouseCardEvent } from "./mouse";
import { receiveCommData } from "./serial";

// This file must have worker types, but not DOM types.
// The global should be that of a dedicated worker.

// This fixes `self`'s type.
declare var self: DedicatedWorkerGlobalScope;
export {};

const doPostMessage = (msg: MSG_WORKER, payload: any) => {
  self.postMessage({msg, payload});
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

const passSaveState = (saveState: EmulatorSaveState) => {
  doPostMessage(MSG_WORKER.SAVE_STATE, saveState)
}

export const passRumble = (params: GamePadActuatorEffect) => {
  doPostMessage(MSG_WORKER.RUMBLE, params)
}

export const passHelptext = (helptext: string) => {
  doPostMessage(MSG_WORKER.HELP_TEXT, helptext)
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

self.onmessage = (e: MessageEvent) => {
  switch (e.data.msg as MSG_MAIN) {
    case MSG_MAIN.STATE:
      doSetCPUState(e.data.payload)
      break;
    case MSG_MAIN.DEBUG:
      doSetDebug(e.data.payload)
      break;
    case MSG_MAIN.BREAKPOINT:
      doSetBreakpoint(e.data.payload)
      break;
    case MSG_MAIN.STEP_INTO:
      doStepInto()
      break;
    case MSG_MAIN.STEP_OVER:
      doStepOver()
      break;
    case MSG_MAIN.STEP_OUT:
      doStepOut()
      break;
    case MSG_MAIN.SPEED:
      doSetNormalSpeed(e.data.payload)
      break;
    case MSG_MAIN.TIME_TRAVEL:
      if (e.data.payload === "FORWARD") {
          doGoForwardInTime()
      } else {
          doGoBackInTime()
      }
      break;
    case MSG_MAIN.RESTORE_STATE:
      doRestoreSaveState(e.data.payload as EmulatorSaveState)
      break;
    case MSG_MAIN.KEYPRESS:
      sendTextToEmulator(e.data.payload)
      break;
    case MSG_MAIN.MOUSEEVENT:
      MouseCardEvent(e.data.payload)
      break;
    case MSG_MAIN.PASTE_TEXT:
      sendPastedText(e.data.payload)
      break;
    case MSG_MAIN.APPLE_PRESS:
      pressAppleCommandKey(true, e.data.payload)
      break;
    case MSG_MAIN.APPLE_RELEASE:
      pressAppleCommandKey(false, e.data.payload)
      break;
    case MSG_MAIN.GET_SAVE_STATE:
      passSaveState(doGetSaveState(true))
      break;
    case MSG_MAIN.DRIVE_PROPS:
      const props = e.data.payload as DriveProps
      doSetDriveProps(props)
      break;
    case MSG_MAIN.GAMEPAD:
      setGamepads(e.data.payload)
      break
    case MSG_MAIN.SET_BINARY_BLOCK:
      const memBlock = e.data.payload as SetMemoryBlock
      doSetBinaryBlock(memBlock.address, memBlock.data, memBlock.run)
      break
    case MSG_MAIN.COMM_DATA:
      receiveCommData(e.data.payload)
      break;
      default:
      console.error(`worker2main: unhandled msg: ${e.data.msg}`)
      break;
  }
}
