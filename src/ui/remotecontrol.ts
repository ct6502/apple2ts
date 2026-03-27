import { RUN_MODE } from "../common/utility"
import {
  handleGetC800Slot,
  handleGetIsDebugging,
  handleGetMemoryDump,
  handleGetRunMode,
  handleGetShowDebugTab,
  handleGetSoftSwitches,
  handleGetSpeedMode,
  handleGetStackString,
  handleGetState6502,
  handleGetTextPageAsString,
  passAppleCommandKeyPress,
  passAppleCommandKeyRelease,
  passKeyRelease,
  passKeypress,
  passMouseEvent,
  passPasteText,
  passSetDebug,
  passSetMemory,
  passSetRunMode,
  passSetSoftSwitches,
} from "./main2worker"
import {
  setPreferenceColorMode,
  setPreferenceDebugMode,
  setPreferenceMachineName,
  setPreferenceRamWorks,
  setPreferenceSpeedMode,
} from "./localstorage"
import { getUIState } from "./ui_settings"
import {
  handleGetDriveProps,
  handleSetDiskOrFileFromBuffer,
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

    case "setSoftSwitches":
      passSetSoftSwitches((payload.addresses as number[]) || null)
      return collectStatus()

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
