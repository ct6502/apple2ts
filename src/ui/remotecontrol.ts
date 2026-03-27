import { RUN_MODE } from "../common/utility"
import { BreakpointMap } from "../common/breakpoint"
import {
  handleGetBreakpoints,
  handleCanGoBackward,
  handleCanGoForward,
  handleGetC800Slot,
  handleGetIsDebugging,
  handleGetMachineName,
  handleGetMemSize,
  handleGetMemoryDump,
  handleGetRunMode,
  handleGetSaveState,
  handleGetShowDebugTab,
  handleGetSoftSwitches,
  handleGetSpeedMode,
  handleGetStackString,
  handleGetState6502,
  handleGetTextPageAsString,
  handleGetTempStateIndex,
  handleGetTimeTravelThumbnails,
  passGoBackInTime,
  passGoForwardInTime,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  passKeyRelease,
  passKeypress,
  passMouseEvent,
  passPasteText,
  passSetBinaryBlock,
  passSetDebug,
  passSetState6502,
  passSetMemory,
  passSetRunMode,
  passSetSoftSwitches,
  passStepInto,
  passStepOut,
  passStepOver,
  passTimeTravelIndex,
  passTimeTravelSnapshot,
} from "./main2worker"
import {
  setPreferenceBreakpoints,
  setPreferenceColorMode,
  setPreferenceDebugMode,
  setPreferenceMachineName,
  setPreferenceRamWorks,
  setPreferenceSpeedMode,
} from "./localstorage"
import { RestoreSaveState } from "./savestate"
import { getUIState } from "./ui_settings"
import { getMockingboardMode } from "./devices/audio/mockingboard_audio"
import { isAudioEnabled } from "./devices/audio/speaker"
import {
  handleGetFilename,
  handleEjectDisk,
  handleGetDriveProps,
  handleSetDiskOrFileFromBuffer,
  handleSetDiskFromURL,
  handleSetDiskWriteProtected,
} from "./devices/disk/driveprops"

const CONNECT_RETRY_MS = 3000
const HEARTBEAT_MS = 2000

type RemoteCommand = {
  commandId: string,
  action: string,
  payload?: Record<string, unknown>,
}

let started = false
let clientId = ""
let eventSource: EventSource | null = null
let heartbeatId = 0
let reconnectId = 0

const isRemoteServerAvailable = () => {
  return window.location.protocol === "http:" || window.location.protocol === "https:"
}

const decodeBase64 = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

const toByteArray = (value: Uint8Array) => {
  return Array.from(value)
}

const sleep = (ms: number) => {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

const bytesToBase64 = (bytes: Uint8Array) => {
  let binary = ""
  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }
  return btoa(binary)
}

const stringToBase64 = (value: string) => {
  return bytesToBase64(new TextEncoder().encode(value))
}

const base64ToString = (value: string) => {
  const binary = atob(value)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new TextDecoder().decode(bytes)
}

const getDriveSummary = () => {
  return [0, 1, 2, 3].map((index) => {
    const drive = handleGetDriveProps(index)
    return {
      index: drive.index,
      drive: drive.drive,
      hardDrive: drive.hardDrive,
      filename: drive.filename,
      status: drive.status,
      motorRunning: drive.motorRunning,
      diskHasChanges: drive.diskHasChanges,
      isWriteProtected: drive.isWriteProtected,
      lastWriteTime: drive.lastWriteTime,
      byteLength: drive.diskData.length,
    }
  })
}

const collectStatus = () => {
  return {
    timestamp: Date.now(),
    machine: {
      runMode: handleGetRunMode(),
      speedMode: handleGetSpeedMode(),
      machineName: handleGetMachineName(),
      ramWorksKb: handleGetMemSize(),
      isDebugging: handleGetIsDebugging(),
      showDebugTab: handleGetShowDebugTab(),
      machineState: handleGetState6502(),
      textPage: handleGetTextPageAsString(),
      stackString: handleGetStackString(),
      c800Slot: handleGetC800Slot(),
      softSwitches: handleGetSoftSwitches(),
      memoryAvailable: handleGetRunMode() === RUN_MODE.PAUSED,
    },
    ui: getUIState(),
    drives: getDriveSummary(),
  }
}

const collectMemory = () => {
  return {
    timestamp: Date.now(),
    machineState: handleGetState6502(),
    memoryDump: toByteArray(handleGetMemoryDump()),
  }
}

const collectBreakpoints = () => {
  return Array.from(handleGetBreakpoints().entries() as IterableIterator<[number, Breakpoint]>).map(([address, breakpoint]) => ({
    ...breakpoint,
    address,
  }))
}

const collectSnapshots = () => {
  const activeIndex = handleGetTempStateIndex()
  return handleGetTimeTravelThumbnails().map((snapshot, index) => ({
    snapshotId: `snap:${index}`,
    index,
    cycleCount: snapshot.s6502.cycleCount,
    label: null,
    thumbnail: snapshot.thumbnail || null,
    active: index === activeIndex,
  }))
}

const waitForSnapshotChange = async (beforeIndex: number, beforeLength: number) => {
  for (let i = 0; i < 40; i++) {
    await sleep(10)
    const snapshots = handleGetTimeTravelThumbnails()
    const currentIndex = handleGetTempStateIndex()
    if (snapshots.length !== beforeLength || currentIndex !== beforeIndex) {
      return collectSnapshots()
    }
  }
  return collectSnapshots()
}

const executeSnapshotAction = async (action: () => void) => {
  const beforeIndex = handleGetTempStateIndex()
  const beforeLength = handleGetTimeTravelThumbnails().length
  action()
  return waitForSnapshotChange(beforeIndex, beforeLength)
}

const exportSaveState = async (withSnapshots: boolean) => {
  const saveState = await new Promise<EmulatorSaveState>((resolve) => {
    handleGetSaveState((state) => {
      resolve(state)
    }, withSnapshots)
  })

  saveState.emulator = {
    name: "Apple2TS Emulator",
    date: new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString(),
    version: 1.0,
    ...getUIState(),
    audioEnable: isAudioEnabled(),
    mockingboardMode: getMockingboardMode(),
    speedMode: handleGetSpeedMode(),
    isDebugging: handleGetIsDebugging(),
    runMode: handleGetRunMode(),
    breakpoints: JSON.stringify(Array.from(handleGetBreakpoints().entries())),
  }

  let filename = "apple2ts"
  for (let i = 0; i < 4; i++) {
    const name = handleGetFilename(i)
    if (name) {
      filename = name
      break
    }
  }

  const json = JSON.stringify(saveState, null, 2)
  return {
    filename: `${filename}.a2ts`,
    mimeType: "text/plain",
    dataBase64: stringToBase64(json),
  }
}

const executeStep = async (stepAction: () => void) => {
  const previousCycleCount = handleGetState6502().cycleCount
  stepAction()

  for (let i = 0; i < 40; i++) {
    await sleep(10)
    const currentState = handleGetState6502()
    if (handleGetRunMode() === RUN_MODE.PAUSED && currentState.cycleCount !== previousCycleCount) {
      return collectStatus()
    }
  }

  return collectStatus()
}

const postJson = async (url: string, body: Record<string, unknown>) => {
  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
}

const postState = async () => {
  if (!clientId) return
  await postJson("/api/client/state", {
    clientId,
    state: collectStatus(),
  })
}

const postReply = async (commandId: string, ok: boolean, result: unknown, error = "") => {
  if (!clientId) return
  await postJson("/api/client/reply", {
    clientId,
    commandId,
    ok,
    result,
    error,
  })
}

const startHeartbeat = () => {
  if (heartbeatId) return
  heartbeatId = window.setInterval(() => {
    void postState()
  }, HEARTBEAT_MS)
}

const stopHeartbeat = () => {
  if (!heartbeatId) return
  window.clearInterval(heartbeatId)
  heartbeatId = 0
}

const scheduleReconnect = () => {
  if (reconnectId) return
  stopHeartbeat()
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
  reconnectId = window.setTimeout(() => {
    reconnectId = 0
    void connectToRemoteServer()
  }, CONNECT_RETRY_MS)
}

const connectToRemoteServer = async () => {
  if (!isRemoteServerAvailable()) return

  try {
    const response = await fetch("/api/client/connect", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pathname: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    })
    if (!response.ok) return

    const payload = await response.json() as { clientId: string }
    clientId = payload.clientId

    if (eventSource) {
      eventSource.close()
    }
    eventSource = new EventSource(`/api/client/events?clientId=${encodeURIComponent(clientId)}`)
    eventSource.addEventListener("command", (event) => {
      void handleCommand(event as MessageEvent<string>)
    })
    eventSource.onerror = () => {
      scheduleReconnect()
    }

    startHeartbeat()
    await postState()
  } catch {
    scheduleReconnect()
  }
}

const executeCommand = async (action: string, payload: Record<string, unknown>) => {
  switch (action) {
    case "getStatus":
      return collectStatus()

    case "getMemory":
      return collectMemory()

    case "setRunMode":
      passSetRunMode(Number(payload.runMode))
      return collectStatus()

    case "setSpeedMode":
      setPreferenceSpeedMode(Number(payload.speedMode))
      return collectStatus()

    case "setColorMode":
      setPreferenceColorMode(Number(payload.colorMode))
      return collectStatus()

    case "setMachineName":
      setPreferenceMachineName(payload.machineName as MACHINE_NAME)
      return collectStatus()

    case "setRamWorks":
      setPreferenceRamWorks(Number(payload.size))
      return collectStatus()

    case "setDebug":
      passSetDebug(Boolean(payload.enabled))
      return collectStatus()

    case "setShowDebugTab":
      setPreferenceDebugMode(Boolean(payload.enabled))
      return collectStatus()

    case "keypress": {
      const value = payload.key
      const keyCode = typeof value === "string" ? value.charCodeAt(0) : Number(value)
      passKeypress(keyCode)
      if (payload.release !== false) {
        passKeyRelease()
      }
      return collectStatus()
    }

    case "pasteText":
      passPasteText(String(payload.text || ""))
      return collectStatus()

    case "appleKey":
      if (payload.side === "left") {
        if (payload.pressed === false) {
          passAppleCommandKeyRelease(true)
        } else {
          passAppleCommandKeyPress(true)
        }
      } else if (payload.pressed === false) {
        passAppleCommandKeyRelease(false)
      } else {
        passAppleCommandKeyPress(false)
      }
      return collectStatus()

    case "mouseEvent":
      passMouseEvent({
        x: Number(payload.x),
        y: Number(payload.y),
        buttons: Number(payload.buttons),
      })
      return collectStatus()

    case "setMemory":
      passSetMemory(Number(payload.address), Number(payload.value))
      return collectStatus()

    case "setCpuState":
      passSetState6502(payload.state as STATE6502)
      return collectStatus()

    case "getBreakpoints":
      return {
        breakpoints: collectBreakpoints(),
      }

    case "setBreakpoints":
      setPreferenceBreakpoints(new BreakpointMap(
        ((payload.breakpoints as Breakpoint[]) || []).map((breakpoint) => [breakpoint.address, breakpoint]),
      ))
      return {
        breakpoints: collectBreakpoints(),
      }

    case "getSnapshots":
      return {
        snapshots: collectSnapshots(),
      }

    case "createSnapshot":
      return {
        snapshots: await executeSnapshotAction(() => {
          passTimeTravelSnapshot()
        }),
      }

    case "activateSnapshot": {
      const snapshotId = String(payload.snapshotId || "")
      const index = Number(snapshotId.replace(/^snap:/, ""))
      if (!Number.isInteger(index) || index < 0) {
        throw new Error("Invalid snapshot id")
      }
      return {
        snapshots: await executeSnapshotAction(() => {
          passTimeTravelIndex(index)
        }),
      }
    }

    case "stepSnapshotBack":
      if (!handleCanGoBackward()) {
        return {
          snapshots: collectSnapshots(),
        }
      }
      return {
        snapshots: await executeSnapshotAction(() => {
          passGoBackInTime()
        }),
      }

    case "stepSnapshotForward":
      if (!handleCanGoForward()) {
        return {
          snapshots: collectSnapshots(),
        }
      }
      return {
        snapshots: await executeSnapshotAction(() => {
          passGoForwardInTime()
        }),
      }

    case "exportSaveState":
      return exportSaveState(Boolean(payload.includeSnapshots))

    case "importSaveState": {
      const dataBase64 = String(payload.dataBase64 || "")
      if (!dataBase64) {
        throw new Error("dataBase64 is required")
      }
      RestoreSaveState(base64ToString(dataBase64))
      return collectStatus()
    }

    case "setSoftSwitches":
      passSetSoftSwitches((payload.addresses as number[]) || null)
      return collectStatus()

    case "stepInto":
      return executeStep(() => {
        passStepInto()
      })

    case "stepOver":
      return executeStep(() => {
        passStepOver()
      })

    case "stepOut":
      return executeStep(() => {
        passStepOut()
      })

    case "setDriveWriteProtected":
      handleSetDiskWriteProtected(Number(payload.driveIndex), Boolean(payload.isWriteProtected))
      return collectStatus()

    case "mountDisk": {
      const dataBase64 = String(payload.dataBase64 || "")
      const filename = String(payload.filename || "remote.woz")
      const driveIndex = Number(payload.driveIndex || 0)
      const bytes = decodeBase64(dataBase64)
      const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
      const mountedDrive = handleSetDiskOrFileFromBuffer(driveIndex, arrayBuffer, filename, null, null)
      return {
        mountedDrive,
        status: collectStatus(),
      }
    }

    case "mountDiskFromUrl": {
      const url = String(payload.url || "")
      const driveIndex = Number(payload.driveIndex || 0)
      if (!url) {
        throw new Error("url is required")
      }
      await handleSetDiskFromURL(url, undefined, driveIndex)
      return {
        status: collectStatus(),
      }
    }

    case "mountBinaryBlock": {
      const dataBase64 = String(payload.dataBase64 || "")
      if (!dataBase64) {
        throw new Error("dataBase64 is required")
      }
      const address = Number(payload.address ?? 0x300)
      const autoRun = payload.autoRun !== false
      passSetBinaryBlock(address, decodeBase64(dataBase64), autoRun)
      return {
        status: collectStatus(),
      }
    }

    case "mountBasicText": {
      const text = String(payload.text || "")
      if (!text) {
        throw new Error("text is required")
      }
      const autoRun = payload.autoRun !== false
      let nextText = text
      if (autoRun) {
        const trimmed = text.trim()
        const hasLineNumbers = /^[0-9]/.test(trimmed) || /[\n\r][0-9]/.test(trimmed)
        nextText += hasLineNumbers ? "\nRUN\n" : "\n"
      }
      passPasteText(nextText)
      return {
        status: collectStatus(),
      }
    }

    case "ejectDisk":
      handleEjectDisk(Number(payload.driveIndex))
      return {
        status: collectStatus(),
      }

    default:
      throw new Error(`Unsupported action '${action}'`)
  }
}

const handleCommand = async (event: MessageEvent<string>) => {
  const command = JSON.parse(event.data) as RemoteCommand
  try {
    const result = await executeCommand(command.action, command.payload || {})
    await postReply(command.commandId, true, result)
    await postState()
  } catch (error) {
    await postReply(
      command.commandId,
      false,
      null,
      error instanceof Error ? error.message : String(error),
    )
  }
}

export const startRemoteControlBridge = () => {
  if (started) return
  started = true
  void connectToRemoteServer()
}
