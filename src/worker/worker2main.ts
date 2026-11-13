import { setVeraFmEnabled } from "./devices/vera/vera"
import { attachAudioClockPort, doSetRunMode, doSetSpeedMode,
  doStepInto, doStepOver, doStepOut, doSetBinaryBlock, doLoadBinary, doRunBinary, doSetIsDebugging, doSetState6502, requestSnapshot, doSetPastedText, forceSoftSwitches,
  forceVideo7Override,
  doSetMemory,
  doWriteMemory,
  doSetMemoryWriteWatchpoint,
  doClearMemoryWriteWatchpoint,
  doSetMachineName,
  doSetIigsRomVersion,
  doSetRamWorks,
  doSetVeraSlot,
  doSetSlotConfig,
  doSetCycleCount,
  doSetShowDebugTab,
  doSetAppMode,
  setTracing,
  doExecuteBasicCommand,
  doSetCyclesToRun,
  getCpuRunMode,
  getExternalMemoryView,
  findExternalMemory,
  createExternalSessionSnapshot,
  compareExternalSessionMemory,
  restoreExternalSessionSnapshot,
  setMemoryDumpState,
  doSetAutoSnapshot,
  getIigsVblCount} from "./motherboard"
import { doSetEmuDriveNewData, doSetEmuDriveProps } from "./devices/drivestate"
import { apple2KeyRelease, openIigsRomDeskPanel, sendKeySequence, setKeyboardState, sendTextToEmulator } from "./devices/keyboard"
import {
  hasConditionalInputSequence,
  requestConditionalInputTermination,
  runConditionalInputSequence,
} from "./conditional_input"
import { s6502 } from "./instructions"
import { pressAppleCommandKey, setGamepads, setReverseYAxis } from "./devices/joystick"
import { AUTO_SNAPSHOT, DRIVE, MEMORY_DUMP_STATE, MSG_MAIN, MSG_WORKER, RUN_MODE, VeraSdStatus } from "../common/utility"
import { sdcard_attach_image, sdcard_detach_image, sdcard_get_status, set_sdcard_status_listener, sdcard_get_image, sdcard_set_write_protected, sdcard_clear_changes, sdcard_get_write_seq } from "./devices/vera/sdcard"
import { doSetBasicStep, doSetBreakpoints } from "./cpu6502"
import { MouseCardEvent, getMouseUiEventCount } from "./devices/mouse"
import { receiveMidiData } from "./devices/passport/passport"
import { receiveCommData } from "./devices/superserial/serial"
import { setTraceSettings } from "./tracelog"
import { doGotoTimeTravelIndex, doSetThumbnailImage, doGetSaveStateWithSnapshots, doGetSaveState, doGoBackInTime, doGoForwardInTime, doRestoreSaveState, doGetSaveStateForLocalStorage } from "./save_restore_worker"
import { setSiriusJoyport } from "./devices/sirius_joyport"
import { getCurrentMemory, memGet24, getCurrentMachineName, getShrDbg, getShrDump, resetShrDbg, setShrDbgTrace } from "./memory"
import { getIwmReadStats } from "./devices/diskdata"
import { getAdbLog, setAdbLogEnabled, clearAdbLog } from "./iigs_adb"
import { iigsEnsoniq, docAccess } from "./devices/iigs_ensoniq"
import { getRomTrace, setRomTraceEnabled, setRomTraceWatch, clearRomTrace } from "./romtrace"
import { enableGamePatches } from "./games/game_mappings"

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

let veraFrameSequence = 0

export const passVeraFramebuffer = (fb: Uint8ClampedArray<ArrayBuffer>, dcVideo: number) => {
  const sequence = ++veraFrameSequence
  if (dcVideo !== 0) {
    doPostMessage(MSG_WORKER.VERA_FRAME, { fb, dcVideo, sequence })
  } else {
    doPostMessage(MSG_WORKER.VERA_FRAME, { dcVideo, sequence })
  }
}

export const passErrorMsg = (event: ErrorMsg) => {
  doPostMessage(MSG_WORKER.ERRORMSG, event)
}

export const passVeraPsgWrite = (event: VeraPsgWrite) => {
  doPostMessage(MSG_WORKER.VERA_PSG_WRITE, event)
}

export const passVeraPsgBatch = (events: VeraPsgWrite[]) => {
  doPostMessage(MSG_WORKER.VERA_PSG_BATCH, events)
}

export const passVeraPcmWrite = (event: VeraPcmWrite) => {
  doPostMessage(MSG_WORKER.VERA_PCM_WRITE, event)
}

let pendingFmWrites: VeraFmWrite[] = []
export const passVeraFmWrite = (event: VeraFmWrite) => {
  pendingFmWrites.push(event)
}

export const passVeraFmReset = () => {
  pendingFmWrites = []
  doPostMessage(MSG_WORKER.VERA_FM_RESET, null)
}

export const passVeraSdStatus = (status: VeraSdStatus) => {
  doPostMessage(MSG_WORKER.VERA_SD_STATUS, status)
}
set_sdcard_status_listener(passVeraSdStatus)

export const passMachineState = (state: MachineState) => {
  if (pendingFmWrites.length) {
    doPostMessage(MSG_WORKER.VERA_FM_WRITE, pendingFmWrites)
    pendingFmWrites = []
  }
  doPostMessage(MSG_WORKER.MACHINE_STATE, state)
}

export const passClickSpeaker = (cycleCount: number) => {
  speakerClickCount++
  doPostMessage(MSG_WORKER.CLICK, cycleCount)
}

// Test-only hook: lets the suite assert that a machine type actually drives
// the speaker. Not used by the emulator itself.
let speakerClickCount = 0
export const getSpeakerClickCount = () => speakerClickCount
export const resetSpeakerClickCount = () => { speakerClickCount = 0 }

export const passDriveProps = (props: DriveProps, replaceDiskData = false) => {
  doPostMessage(MSG_WORKER.DRIVE_PROPS, replaceDiskData ? {props, replaceDiskData} : props)
}

export const passDriveSound = (sound: DRIVE) => {
  doPostMessage(MSG_WORKER.DRIVE_SOUND, sound)
}

// Apple IIgs IWM read-cadence instrumentation. Only ever touched when the UI
// asks for it via ?iwmgaps=1, so it costs nothing in normal use. The UI polls
// rather than the worker pushing every frame: a worker module can be
// re-evaluated (Vite dev HMR, machine switch), which silently drops sticky
// flags, whereas a request/response always answers. See the IwmReadStats
// comment in devices/diskdata.ts for what the counters mean.
export const passIwmReadStats = (stats: MessagePayload) => {
  doPostMessage(MSG_WORKER.IWM_READ_STATS, stats)
}

// Debug-only ADB event ring (?adbtrace=1). See the noteAdbLog comment in
// iigs_adb.ts. Poll pattern for the same worker-reload reason as IwmReadStats.
export const passAdbTrace = (entries: MessagePayload) => {
  doPostMessage(MSG_WORKER.ADB_TRACE, entries)
}

// Debug-only Ensoniq DOC access stats (?ensoniqdbg=1). Same request/response
// pattern as IwmReadStats, for the same worker-reload reason.
export const passEnsoniqDocStats = (stats: MessagePayload) => {
  doPostMessage(MSG_WORKER.ENSONIQ_DOC_STATS, stats)
}

// Debug-only 65816 PC trace (?romtrace=1). See src/worker/romtrace.ts.
export const passRomTrace = (trace: MessagePayload) => {
  doPostMessage(MSG_WORKER.ROM_TRACE, trace)
}

const passMemory = (mem: Uint8Array) => {
  doPostMessage(MSG_WORKER.GET_MEMORY_RESPONSE, mem)
}

const passSaveState = (sState: EmulatorSaveState) => {
  doPostMessage(MSG_WORKER.SAVE_STATE, sState)
}

const passSaveStateLocalStorage = (sState: EmulatorSaveState | object) => {
  doPostMessage(MSG_WORKER.SAVE_STATE_LOCAL_STORAGE, sState)
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

export const passEnsoniqSound = (samples: Int16Array, sampleRate: number) => {
  try {
    doPostMessage(MSG_WORKER.ENSONIQ_SOUND as any, { samples, sampleRate })
  } catch (error) {
    console.error(`worker2main: passEnsoniqSound error: ${error}`)
  }
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
      case MSG_MAIN.AUTO_SNAPSHOT:
        doSetAutoSnapshot(e.data.payload as AUTO_SNAPSHOT)
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
        requestSnapshot()
        break
      case MSG_MAIN.THUMBNAIL_IMAGE:
        doSetThumbnailImage(e.data.payload as string)
        break
      case MSG_MAIN.RESTORE_STATE:
        doRestoreSaveState(e.data.payload as EmulatorSaveState, true)
        break
      case MSG_MAIN.KEYBOARD_STATE:
        requestConditionalInputTermination("cancelled")
        setKeyboardState(e.data.payload as KeyboardState)
        if (e.data.operationId !== undefined) passWorkerOperationResult(e.data.operationId)
        break
      case MSG_MAIN.KEY_SEQUENCE:
        if (e.data.operationId === undefined) break
        if (getCpuRunMode() !== RUN_MODE.RUNNING) {
          passWorkerOperationResult(e.data.operationId, undefined, {
            outcome: "not_running",
            keysDelivered: 0,
            keyMayHaveBeenObserved: false,
          })
          break
        }
        if (hasConditionalInputSequence()) {
          passWorkerOperationResult(e.data.operationId, undefined, {
            outcome: "input_busy",
            keysDelivered: 0,
            keyMayHaveBeenObserved: false,
          })
          break
        }
        void sendKeySequence(e.data.payload as KeySequenceRequest).then(
          (result) => passWorkerOperationResult(e.data.operationId, undefined, result),
          (error) => passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          ),
        )
        break
      case MSG_MAIN.IIGS_DESK_PANEL:
        if (getCpuRunMode() === RUN_MODE.RUNNING) {
          openIigsRomDeskPanel()
        }
        break
      case MSG_MAIN.CONDITIONAL_KEY_SEQUENCE:
        if (e.data.operationId === undefined) break
        try {
          const request = e.data.payload as ConditionalKeySequenceRequest
          const runMode = getCpuRunMode()
          if (runMode !== RUN_MODE.RUNNING && !(runMode === RUN_MODE.PAUSED && request.startExecution)) {
            passWorkerOperationResult(e.data.operationId, undefined, {
              outcome: "not_running",
              completedPhases: 0,
              failurePhase: 0,
              keyDeliveries: [],
              cyclesElapsed: 0,
            })
            break
          }
          const result = runConditionalInputSequence(request, s6502.cycleCount)
          if (runMode === RUN_MODE.PAUSED && hasConditionalInputSequence()) {
            doSetRunMode(RUN_MODE.RUNNING, false)
          }
          void result.then(
            (value) => passWorkerOperationResult(e.data.operationId, undefined, value),
            (error) => passWorkerOperationResult(
              e.data.operationId,
              error instanceof Error ? error.message : String(error),
            ),
          )
        } catch (error) {
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
        break
      case MSG_MAIN.CANCEL_CONDITIONAL_KEY_SEQUENCE: {
        const cancelled = requestConditionalInputTermination("cancelled")
        if (cancelled) doSetRunMode(RUN_MODE.PAUSED, false, undefined, {reason: "input-sequence"})
        if (e.data.operationId !== undefined) {
          passWorkerOperationResult(e.data.operationId, undefined, {cancelled})
        }
        break
      }
      case MSG_MAIN.KEYPRESS:
        requestConditionalInputTermination("cancelled")
        sendTextToEmulator(e.data.payload as number)
        break
      case MSG_MAIN.KEYRELEASE:
        apple2KeyRelease()
        break
      case MSG_MAIN.MOUSEEVENT:
        MouseCardEvent(e.data.payload)
        break
      case MSG_MAIN.PASTE_TEXT:
        requestConditionalInputTermination("cancelled")
        doSetPastedText(e.data.payload as string)
        break
      case MSG_MAIN.APPLE_PRESS:
        pressAppleCommandKey(true, e.data.payload)
        break
      case MSG_MAIN.APPLE_RELEASE:
        pressAppleCommandKey(false, e.data.payload)
        break
      case MSG_MAIN.GET_MEMORY_REQUEST:
        passMemory(getCurrentMemory())
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
      case MSG_MAIN.COMPARE_SESSION_MEMORY:
      case MSG_MAIN.FIND_MEMORY:
        try {
          passWorkerOperationResult(
            e.data.operationId,
            undefined,
            e.data.msg === MSG_MAIN.COMPARE_SESSION_MEMORY
              ? compareExternalSessionMemory(e.data.payload as SessionMemoryComparisonRequest)
              : findExternalMemory(e.data.payload as MemorySearchRequest),
          )
        } catch (error) {
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
        break
      case MSG_MAIN.SET_MEMORY_WRITE_WATCHPOINT:
        try {
          passWorkerOperationResult(
            e.data.operationId,
            undefined,
            doSetMemoryWriteWatchpoint(e.data.payload as MemoryViewRequest),
          )
        } catch (error) {
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
        break
      case MSG_MAIN.CLEAR_MEMORY_WRITE_WATCHPOINT:
        try {
          passWorkerOperationResult(
            e.data.operationId,
            undefined,
            doClearMemoryWriteWatchpoint(),
          )
        } catch (error) {
          passWorkerOperationResult(
            e.data.operationId,
            error instanceof Error ? error.message : String(error),
          )
        }
        break
      case MSG_MAIN.CREATE_SESSION_SNAPSHOT:
      case MSG_MAIN.RESTORE_SESSION_SNAPSHOT:
        try {
          passWorkerOperationResult(
            e.data.operationId,
            undefined,
            e.data.msg === MSG_MAIN.CREATE_SESSION_SNAPSHOT
              ? createExternalSessionSnapshot(String(e.data.payload))
              : restoreExternalSessionSnapshot(String(e.data.payload)),
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
      case MSG_MAIN.GET_SAVE_STATE_LOCAL_STORAGE:
        passSaveStateLocalStorage(doGetSaveStateForLocalStorage())
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
      case MSG_MAIN.WRITE_MEMORY: {
        const setmem = e.data.payload
        doWriteMemory(setmem.address, setmem.data, e.data.operationId)
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
      case MSG_MAIN.AUDIO_CLOCK:
        if (e.ports[0]) attachAudioClockPort(e.ports[0])
        break
      case MSG_MAIN.VERA_FM_ENABLED:
        setVeraFmEnabled(e.data.payload as boolean)
        break
      case MSG_MAIN.IIGS_ROM:
        doSetIigsRomVersion(e.data.payload as IigsRomVersion)

        break
      case MSG_MAIN.VERA_SLOT:
        doSetVeraSlot(e.data.payload as VERA_SLOT)
        break
      case MSG_MAIN.SLOT_CONFIG:
        doSetSlotConfig(e.data.payload as SlotConfig)
        break
      case MSG_MAIN.IWM_STATS_REQUEST:
        // Answer immediately with whatever the sampler has accumulated for the
        // current boot attempt.
        passIwmReadStats(getIwmReadStats() as MessagePayload)
        break
      case MSG_MAIN.ENSONIQ_DOC_REQUEST:
        // ?ensoniqdbg=1: answer with how much the program has touched the
        // DOC and whether any oscillator is running, so "the game is silent"
        // can be split into "no chip access", "programmed but silent", and
        // "producing samples but the transport dropped them".
        passEnsoniqDocStats({
          docAccess: { ...docAccess },
          osce: iigsEnsoniq.osce,
          rege1: iigsEnsoniq.rege1,
          outRate: iigsEnsoniq.outputRate(),
          monoMirrorCount: iigsEnsoniq.monoMirrorCount,
          irqTicks: iigsEnsoniq.irqTicks,
          vblCount: getIigsVblCount(),
          speedMode: iigsEnsoniq.lastSpeedMode,
          cyclesPerRefresh: iigsEnsoniq.lastCyclesPerRefresh,
          blocks: iigsEnsoniq.blocks.slice(0, 6),
          active: iigsEnsoniq.hasActiveOscillators(),
          soundadrl: iigsEnsoniq.soundadrl,
          soundadrh: iigsEnsoniq.soundadrh,
          systemVolume: iigsEnsoniq.systemVolume,
          osc: iigsEnsoniq.oscillators.slice(0, Math.min(12, Math.max(4, iigsEnsoniq.osce))).map(o => ({
            ctrl: o.control, vol: o.vol, freq: o.freq,
            wt: o.wavetblpointer, acc: o.accumulator, irq: o.irqpend,
          })),
          timerOsc: {
            ctrl: iigsEnsoniq.oscillators[31].control,
            vol: iigsEnsoniq.oscillators[31].vol,
            freq: iigsEnsoniq.oscillators[31].freq,
            wt: iigsEnsoniq.oscillators[31].wavetblpointer,
            wtsize: iigsEnsoniq.oscillators[31].wavetblsize,
            resolution: iigsEnsoniq.oscillators[31].resolution,
            acc: iigsEnsoniq.oscillators[31].accumulator,
            irq: iigsEnsoniq.oscillators[31].irqpend,
          },
        } as unknown as MessagePayload)
        break
      case MSG_MAIN.ADB_TRACE_REQUEST: {

        // ?adbtrace=1: answer with the ADB UI/report/read ring so a browser
        // run can see the whole event chain (see iigs_adb.ts noteAdbLog).
        // The machine name and event count help a dead-calm log say which
        // layer dropped the chain: routing (machine name), delivery (count),
        // or gating (enabled).
        const req = (e.data.payload ?? {}) as { enabled?: boolean, clear?: boolean }
        setAdbLogEnabled(req.enabled === true)
        if (req.clear) clearAdbLog()
        passAdbTrace({
          entries: getAdbLog(),
          machine: getCurrentMachineName(),
          eventCount: getMouseUiEventCount(),
        } as unknown as MessagePayload)
        break
      }
      case MSG_MAIN.ROM_TRACE_REQUEST: {
        // Payload: {enable?: boolean, clear?: boolean, peek?: number[]}.
        // Enabling and clearing travel with the request rather than living in a
        // sticky worker flag, which a module re-evaluation would silently reset.
        const req = (e.data.payload ?? {}) as { enable?: boolean, clear?: boolean, peek?: number[], watch?: number[], watchRange?: number[], shrDbg?: boolean, shrDbgReset?: boolean, wantShr?: boolean, traceWriters?: boolean, codeAt?: number[], codeWindows?: Array<{ a: number, n: number }> }
        if (req.enable !== undefined) setRomTraceEnabled(req.enable)
        if (req.watch) setRomTraceWatch(req.watch, req.watchRange)
        if (req.clear) clearRomTrace()
        const trace = getRomTrace() as unknown as Record<string, unknown>
        // A PC histogram says where the machine is spinning but not what it is
        // spinning on. Peeking at the code under the current PC and at the zero
        // page flags around $A0-$B0 turns "stuck at 00:861D" into a diagnosis.
        const cur = (trace.last as number[])[(trace.last as number[]).length - 1]
        if (typeof cur === "number") {
          const code: number[] = []
          for (let k = 0; k < 24; k++) code.push(memGet24((cur & 0xffff0000) | ((cur + k) & 0xffff)))
          const zp: number[] = []
          for (let a = 0x00a0; a <= 0x00af; a++) zp.push(memGet24(a))
          trace.peekPc = cur
          trace.peekCode = code
          trace.peekZp = zp
        }
        if (req.peek) {
          trace.peekValues = req.peek.map((addr) => memGet24(addr >>> 0))
        }
        // The write census names the instruction storing into the displayed window;
        // this fetches the code around it so the sprite draw and its erase can be
        // read rather than guessed at. The key is (PB << 16) | PC, so bank and
        // offset have to be split again for memGet24.
        const fetchCode = (addr: number, len: number) => {
          const bank = (addr >>> 16) & 0xff
          const start = addr & 0xffff
          const bytes: number[] = []
          for (let k = 0; k < len; k++) bytes.push(memGet24((bank << 16) | ((start + k) & 0xffff)))
          return { addr: bank.toString(16) + ":" + start.toString(16), bytes }
        }
        if (req.codeAt) {
          trace.codeBlocks = req.codeAt.map((addr) => fetchCode(addr, 256))
        }
        // A whole routine, not a 256-byte straddle: the census names the storing
        // instruction but the erase that surrounds it can sit two streets away, and
        // re-running a boot to get another 256 bytes costs minutes.
        if (req.codeWindows) {
          trace.codeWindows = req.codeWindows.map((w) => fetchCode(w.a, Math.min(Math.max(w.n | 0, 16), 4096)))
        }
        // A game that leaves stale sprites is either being displayed from a buffer
        // it is not redrawing or redrawing the one we show without erasing. Those
        // look identical on the canvas and differ only in where the writes land,
        // so the SHR write census rides along with the trace poll.
        if (req.traceWriters !== undefined) setShrDbgTrace(req.traceWriters)
        trace.vbls = getIigsVblCount()
        trace.shrDbg = req.shrDbg ? getShrDbg() : undefined
        if (req.wantShr) trace.shrDump = getShrDump()
        if (req.shrDbgReset) resetShrDbg()
        passRomTrace(trace)
        break
      }
      case MSG_MAIN.VERA_SD_IMAGE: {
        const payload = e.data.payload as { data: Uint8Array | null, name: string } | null
        if (!payload || !payload.data) {
          sdcard_detach_image()
        } else {
          sdcard_attach_image(payload.data, payload.name)
        }
        passVeraSdStatus(sdcard_get_status())
        break
      }
      case MSG_MAIN.VERA_SD_GET_IMAGE: {
        const data = sdcard_get_image()
        const status = sdcard_get_status()
        doPostMessage(MSG_WORKER.VERA_SD_IMAGE_DATA, data ? { data, name: status.name, writeSeq: sdcard_get_write_seq() } : null)
        break
      }
      case MSG_MAIN.VERA_SD_WRITE_PROTECT: {
        sdcard_set_write_protected(e.data.payload as boolean)
        break
      }
      case MSG_MAIN.VERA_SD_CLEAR_CHANGES: {
        sdcard_clear_changes(typeof e.data.payload === "number" ? e.data.payload : undefined)
        break
      }
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
        setSiriusJoyport(e.data.payload)
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
      case MSG_MAIN.MEMORY_DUMP_STATE:
        setMemoryDumpState(e.data.payload as MEMORY_DUMP_STATE)
        break
      case MSG_MAIN.ENABLE_GAME_PATCHES:
        enableGamePatches(e.data.payload as boolean)
        break
      default:
        console.error(`worker2main: unhandled msg: ${JSON.stringify(e.data)}`)
        break
    }
  }
}
