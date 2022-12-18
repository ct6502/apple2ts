import { doSetCPUState,
  doGetSaveState, doRestoreSaveState, doSetNormalSpeed,
  doGoBackInTime, doGoForwardInTime } from "../motherboard";
import { doSetDriveProps } from "../diskdata"
import { addToBuffer } from "../keyboard"
import { pressAppleCommandKey } from "../joystick"
import { DRIVE } from "../utility";

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

export const passDriveProps = (props: DriveProps) => {
  doPostMessage("DRIVE_PROPS", props)
}

export const passDriveSound = (sound: DRIVE) => {
  doPostMessage("DRIVE_SOUND", sound)
}

const passSaveState = (saveState: string) => {
  doPostMessage("SAVE_STATE", saveState)
}

self.onmessage = (e: MessageEvent) => {
  switch (e.data.msg) {
    case "STATE":
      doSetCPUState(e.data.payload)
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
      addToBuffer(e.data.payload)
      break;
    case "APPLE_PRESS":
      pressAppleCommandKey(true, e.data.payload)
      break;
    case "APPLE_RELEASE":
      pressAppleCommandKey(false, e.data.payload)
      break;
    case "GET_SAVE_STATE":
      passSaveState(doGetSaveState())
      break;
    case "DRIVE_PROPS":
      doSetDriveProps(e.data.payload)
      break;
    default:
      console.log("worker2main onmessage: unknown msg: " + JSON.stringify(e.data))
      break;
  }
}
