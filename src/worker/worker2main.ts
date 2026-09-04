import { doSetRunMode, doSetSpeedMode,
  doStepInto, doStepOver, doStepOut, doSetBinaryBlock, doLoadBinary, doRunBinary, doSetIsDebugging, doSetState6502, doTakeSnapshot, doSetPastedText, forceSoftSwitches,
  forceVideo7Override,
  doSetMemory,
  doSetMachineName,
  doSetRamWorks,
  doSetVeraSlot,
  doSetSlotConfig,
  doSetCycleCount,
  doSetShowDebugTab,
  doSetAppMode,
  doSetSiriusJoyport,
  setTracing,
  doExecuteBasicCommand,
  doSetCyclesToRun,
  getExternalMemoryView} from "./motherboard"
import { doSetEmuDriveNewData, doSetEmuDriveProps } from "./devices/drivestate"
import { apple2KeyRelease, setKeyboardState, sendTextToEmulator } from "./devices/keyboard"
import { pressAppleCommandKey, setGamepads, setReverseYAxis } from "./devices/joystick"
import { DRIVE, MSG_MAIN, MSG_WORKER, RUN_MODE } from "../common/utility"
import { doSetBasicStep, doSetBreakpoints } from "./cpu6502"
import { MouseCardEvent } from "./devices/mouse"
import { receiveMidiData } from "./devices/passport/passport"
import { receiveCommData } from "./devices/superserial/serial"
import { setTraceSettings } from "./tracelog"
import { getMemoryDump } from "./memory"
import { doGotoTimeTravelIndex, doSetThumbnailImage, doGetSaveStateWithSnapshots, doGetSaveState, doGoBackInTime, doGoForwardInTime, doRestoreSaveState } from "./save_restore"

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
  if (!isTesting) {
    try {
      self.postMessage({msg, payload})
    } catch (error) {
      console.error(`worker2main: doPostMessage error: ${error}`)
    }
  }
}

export const passVeraFramebuffer = (fb: Uint8ClampedArray<ArrayBuffer>, dcVideo: number) => {
  if (dcVideo !== 0) {
    doPostMessage(MSG_WORKER.VERA_FRAME, { fb, dcVideo })
  } else {
    doPostMessage(MSG_WORKER.VERA_FRAME, { dcVideo })
  }
}

export const passVeraPsgWrite = (event: VeraPsgWrite) => {
  doPostMessage(MSG_WORKER.VERA_PSG_WRITE, event)
}

export const passVeraPcmWrite = (event: VeraPcmWrite) => {
  doPostMessage(MSG_WORKER.VERA_PCM_WRITE, event)
}

export const passMachineState = (state: MachineState) => {
  doPostMessage(MSG_WORKER.MACHINE_STATE, state)
}

export const passClickSpeaker = (cycleCount: number) => {
  doPostMessage(MSG_WORKER.CLICK, cycleCount)
}

export const passDriveProps = (props: DriveProps, replaceDiskData = false) => {
  doPostMessage(MSG_WORKER.DRIVE_PROPS, replaceDiskData ? {props, replaceDiskData} : props)
}

export const passDriveSound = (sound: DRIVE) => {
  doPostMessage(MSG_WORKER.DRIVE_SOUND, sound)
}

const passMemory = (mem: Uint8Array) => {
  doPostMessage(MSG_WORKER.GET_MEMORY_RESPONSE, mem)
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

export const passShowAppleMouse = (state: boolean) => {
  doPostMessage(MSG_WORKER.SHOW_APPLE_MOUSE, state)
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

export const passSerialConfig = (config: SerialConfig) => {
  doPostMessage(MSG_WORKER.SERIAL_CONFIG_CHANGE, config)
}

export const passWorkerOperationResult = (
  operationId: number,
  error?: string,
  value?: MessagePayload,
) => {
  doPostMessage(
    MSG_WORKER.OPERATION_RESULT,
    value === undefined ? {operationId, error} : {operationId, error, value},
  )
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
        doSetRunMode(e.data.payload as RUN_MODE, true, e.data.operationId)
        break
      case MSG_MAIN.CYCLES_TO_RUN:
        doSetCyclesToRun(e.data.payload as number)
        break
      case MSG_MAIN.STATE6502:
        doSetState6502(e.data.payload as STATE6502, e.data.operationId)
        break
      case MSG_MAIN.DEBUG:
        doSetIsDebugging(e.data.payload)
        break
      case MSG_MAIN.APP_MODE:
        doSetAppMode(e.data.payload as string)
        break
      case MSG_MAIN.SHOW_DEBUG_TAB:
        doSetShowDebugTab(e.data.payload as boolean)
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
      case MSG_MAIN.BASIC_STEP:
        doSetBasicStep()
        break
      case MSG_MAIN.SPEED:
        doSetSpeedMode(e.data.payload as number, e.data.operationId)
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
      case MSG_MAIN.KEYBOARD_STATE:
        setKeyboardState(e.data.payload as KeyboardState)
        if (e.data.operationId !== undefined) passWorkerOperationResult(e.data.operationId)
        break
      case MSG_MAIN.KEYPRESS:
        sendTextToEmulator(e.data.payload as number)
        break
      case MSG_MAIN.KEYRELEASE:
        apple2KeyRelease()
        break
      case MSG_MAIN.MOUSEEVENT:
        MouseCardEvent(e.data.payload)
        break
      case MSG_MAIN.PASTE_TEXT:
        doSetPastedText(e.data.payload as string)
        break
      case MSG_MAIN.APPLE_PRESS:
        pressAppleCommandKey(true, e.data.payload)
        break
      case MSG_MAIN.APPLE_RELEASE:
        pressAppleCommandKey(false, e.data.payload)
        break
      case MSG_MAIN.GET_MEMORY:
        passMemory(getMemoryDump())
        break
      case MSG_MAIN.GET_MEMORY_VIEW:
        try {
          passWorkerOperationResult(
            e.data.operationId,
            undefined,
            getExternalMemoryView(e.data.payload as MemoryViewRequest),
          )
        } catch (error) {
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
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
        const payload = e.data.payload as DriveProps | { props: DriveProps, forceIndex: boolean }
        try {
          const accepted = "props" in payload
            ? doSetEmuDriveNewData(payload.props, payload.forceIndex)
            : doSetEmuDriveNewData(payload)
          if (e.data.operationId !== undefined) {
            if (!accepted) throw new Error("Worker rejected disk image")
            passWorkerOperationResult(e.data.operationId)
          }
        } catch (error) {
          if (e.data.operationId === undefined) throw error
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
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
      case MSG_MAIN.RUN_BINARY: {
        const binary = e.data.payload as RunBinary
        doRunBinary(binary.address, binary.data, binary.entryAddress)
        break
      }
      case MSG_MAIN.LOAD_BINARY: {
        const binary = e.data.payload as LoadBinary
        doLoadBinary(binary.address, binary.data, e.data.operationId)
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
      case MSG_MAIN.VERA_SLOT:
        doSetVeraSlot(e.data.payload as VERA_SLOT)
        break
      case MSG_MAIN.SLOT_CONFIG:
        doSetSlotConfig(e.data.payload as SlotConfig)
        break
      case MSG_MAIN.REVERSE_YAXIS:
        setReverseYAxis(e.data.payload)
        break
      case MSG_MAIN.SOFTSWITCHES:
        forceSoftSwitches(e.data.payload)
        break
      case MSG_MAIN.VIDEO7_OVERRIDE:
        forceVideo7Override(e.data.payload as Video7Override)
        break
      case MSG_MAIN.SIRIUS_JOYPORT:
        doSetSiriusJoyport(e.data.payload)
        break
      case MSG_MAIN.EXECUTE_BASIC_COMMAND: {
        const command = e.data.payload as string
        doExecuteBasicCommand(command)
        break
      }
      case MSG_MAIN.TRACING:
        setTracing(e.data.payload as boolean)
        break
      case MSG_MAIN.TRACE_SETTINGS:
        setTraceSettings(e.data.payload)
        break
      default:
        console.error(`worker2main: unhandled msg: ${JSON.stringify(e.data)}`)
        break
    }
  }
}
