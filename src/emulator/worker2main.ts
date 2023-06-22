import { doSetCPUState,
  doGetSaveState, doRestoreSaveState, doSetNormalSpeed,
  doGoBackInTime, doGoForwardInTime,
  doStepInto, doStepOver, doStepOut } from "./motherboard";
import { doSetDriveProps } from "./drivestate"
import { sendTextToEmulator } from "./keyboard"
import { pressAppleCommandKey, setGamepads } from "./joystick"
import { DRIVE } from "./utility";
import { doSetBreakpoint, doSetDebug } from "./cpu6502";

// This file must have worker types, but not DOM types.
// The global should be that of a dedicated worker.

// This fixes `self`'s type.
declare var self: DedicatedWorkerGlobalScope;
export {};

const doPostMessage = (msg: string, payload: any) => {
  self.postMessage({msg, payload});
}

export const passMachineState = (state: MachineState) => {
  doPostMessage("MACHINE_STATE", state)
}

export const passClickSpeaker = (cycleCount: number) => {
  doPostMessage("CLICK", cycleCount)
}

export const passDriveProps = (props: DriveProps) => {
  doPostMessage("DRIVE_PROPS", props)
}

export const passDriveSound = (sound: DRIVE) => {
  doPostMessage("DRIVE_SOUND", sound)
}

const passSaveState = (saveState: string) => {
  doPostMessage("SAVE_STATE", saveState)
}

export const passRumble = (params: GamePadActuatorEffect) => {
  doPostMessage("RUMBLE", params)
}

export const passHelptext = (helptext: string) => {
  doPostMessage("HELP_TEXT", helptext)
}

self.onmessage = (e: MessageEvent) => {
  switch (e.data.msg) {
    case "STATE":
      doSetCPUState(e.data.payload)
      break;
    case "DEBUG":
      doSetDebug(e.data.payload)
      break;
    case "BREAKPOINT":
      doSetBreakpoint(e.data.payload)
      break;
    case "STEP_INTO":
      doStepInto()
      break;
    case "STEP_OVER":
      doStepOver()
      break;
    case "STEP_OUT":
      doStepOut()
      break;
    case "SPEED":
      doSetNormalSpeed(e.data.payload)
      break;
    case "TIME_TRAVEL":
      if (e.data.payload === "FORWARD") {
          doGoForwardInTime()
      } else {
          doGoBackInTime()
      }
      break;
    case "RESTORE_STATE":
      doRestoreSaveState(e.data.payload)
      break;
    case "KEYBUFFER":
      sendTextToEmulator(e.data.payload)
      break;
    case "APPLE_PRESS":
      pressAppleCommandKey(true, e.data.payload)
      break;
    case "APPLE_RELEASE":
      pressAppleCommandKey(false, e.data.payload)
      break;
    case "GET_SAVE_STATE":
      passSaveState(doGetSaveState(true))
      break;
    case "DRIVE_PROPS":
      const props = e.data.payload as DriveProps
      doSetDriveProps(props)
      break;
    case "GAMEPAD":
      setGamepads(e.data.payload)
      break
    default:
      break;
  }
}
