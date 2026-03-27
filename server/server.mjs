import { createServer } from "node:http"
import { randomUUID } from "node:crypto"
import { promises as fs } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, "..")
const distDir = path.join(repoRoot, "dist")
const serverDir = __dirname
const host = "127.0.0.1"
const port = Number(process.env.PORT || 6502)
const commandTimeoutMs = Number(process.env.COMMAND_TIMEOUT_MS || 10000)

const clients = new Map()
const pendingCommands = new Map()

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".txt": "text/plain; charset=utf-8",
  ".wav": "audio/wav",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
}

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,PUT,DELETE,OPTIONS")
}

const writeJson = (res, statusCode, payload) => {
  setCorsHeaders(res)
  res.statusCode = statusCode
  res.setHeader("Content-Type", "application/json; charset=utf-8")
  res.end(JSON.stringify(payload))
}

const readJsonBody = async (req) => {
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  const raw = Buffer.concat(chunks).toString("utf8")
  return raw.length ? JSON.parse(raw) : {}
}

const getClientSummary = (client) => ({
  clientId: client.clientId,
  connectedAt: client.connectedAt,
  lastSeenAt: client.lastSeenAt,
  pathname: client.pathname,
  userAgent: client.userAgent,
  hasEventStream: Boolean(client.eventStream),
})

const writeEnvelope = (res, statusCode, data) => {
  writeJson(res, statusCode, { ok: true, data })
}

const writeErrorEnvelope = (res, statusCode, code, message) => {
  writeJson(res, statusCode, {
    ok: false,
    error: {
      code,
      message,
    },
  })
}

const getTargetClient = (clientId) => {
  if (clientId) {
    return clients.get(clientId) || null
  }
  let selected = null
  for (const client of clients.values()) {
    if (!selected || client.lastSeenAt > selected.lastSeenAt) {
      selected = client
    }
  }
  return selected
}

const getConnectedClient = (clientId) => {
  const client = getTargetClient(clientId)
  if (!client || !client.eventStream) {
    return null
  }
  return client
}

const runModeToApiName = (runMode) => {
  switch (runMode) {
    case 0:
      return "idle"
    case -1:
      return "running"
    case -2:
      return "paused"
    case -3:
      return "booting"
    case -4:
      return "resetting"
    default:
      return "idle"
  }
}

const getSessionResource = (client) => ({
  clientId: client.clientId,
  pathname: client.pathname,
  connectedAt: client.connectedAt,
  lastSeenAt: client.lastSeenAt,
  connected: Boolean(client.eventStream),
})

const getDriveId = (drive) => {
  if (drive.hardDrive) {
    return drive.drive === 1 ? "hd1" : "hd2"
  }
  return drive.drive === 1 ? "fd1" : "fd2"
}

const getMachineResource = (status) => {
  const machine = status?.machine || {}
  const drives = Array.isArray(status?.drives) ? status.drives : []
  return {
    runMode: runModeToApiName(Number(machine.runMode)),
    speedMode: Number(machine.speedMode ?? 0),
    machineName: machine.machineName || "APPLE2EE",
    ramWorksKb: Number(machine.ramWorksKb ?? 64),
    debugEnabled: Boolean(machine.isDebugging),
    showDebugPanel: Boolean(machine.showDebugTab),
    textPage: machine.textPage || "",
    drives: drives.map((drive) => ({
      driveId: getDriveId(drive),
      kind: drive.hardDrive ? "hard-drive" : "floppy",
      mounted: Boolean(drive.filename),
      filename: drive.filename || null,
      writeProtected: Boolean(drive.isWriteProtected),
      dirty: Boolean(drive.diskHasChanges),
    })),
  }
}

const getCpuResource = (status) => {
  const machineState = status?.machine?.machineState || {}
  const pStatus = Number(machineState.PStatus ?? 0)
  return {
    PC: Number(machineState.PC ?? 0),
    A: Number(machineState.Accum ?? 0),
    X: Number(machineState.XReg ?? 0),
    Y: Number(machineState.YReg ?? 0),
    S: Number(machineState.StackPtr ?? 0),
    IRQ: Number(machineState.flagIRQ ?? 0),
    PStatus: pStatus,
    cycleCount: Number(machineState.cycleCount ?? 0),
    flags: {
      N: Boolean(pStatus & (1 << 7)),
      V: Boolean(pStatus & (1 << 6)),
      B: Boolean(pStatus & (1 << 4)),
      D: Boolean(pStatus & (1 << 3)),
      I: Boolean(pStatus & (1 << 2)),
      Z: Boolean(pStatus & (1 << 1)),
      C: Boolean(pStatus & (1 << 0)),
      NMI: Boolean(machineState.flagNMI),
    },
  }
}

const buildCpuStateFromResource = (resource) => {
  const flags = resource?.flags || {}
  let pStatus
  if ("PStatus" in resource) {
    pStatus = Number(resource.PStatus)
  } else {
    pStatus = 0
    if (flags.N) pStatus |= 1 << 7
    if (flags.V) pStatus |= 1 << 6
    if (flags.B) pStatus |= 1 << 4
    if (flags.D) pStatus |= 1 << 3
    if (flags.I) pStatus |= 1 << 2
    if (flags.Z) pStatus |= 1 << 1
    if (flags.C) pStatus |= 1 << 0
  }

  return {
    PC: Number(resource.PC ?? 0),
    Accum: Number(resource.A ?? 0),
    XReg: Number(resource.X ?? 0),
    YReg: Number(resource.Y ?? 0),
    StackPtr: Number(resource.S ?? 0),
    flagIRQ: Number(resource.IRQ ?? 0),
    flagNMI: Boolean(flags.NMI),
    PStatus: pStatus,
    cycleCount: Number(resource.cycleCount ?? 0),
  }
}

const mergeCpuPatch = (current, patch) => {
  const next = {
    ...current,
    flags: {
      ...current.flags,
    },
  }

  if ("PC" in patch) next.PC = Number(patch.PC)
  if ("A" in patch) next.A = Number(patch.A)
  if ("X" in patch) next.X = Number(patch.X)
  if ("Y" in patch) next.Y = Number(patch.Y)
  if ("S" in patch) next.S = Number(patch.S)
  if ("IRQ" in patch) next.IRQ = Number(patch.IRQ)
  if ("cycleCount" in patch) next.cycleCount = Number(patch.cycleCount)
  if ("PStatus" in patch) next.PStatus = Number(patch.PStatus)
  if ("flags" in patch && patch.flags && typeof patch.flags === "object") {
    next.flags = {
      ...next.flags,
      ...patch.flags,
    }
  }

  return next
}

const allowedCpuPatchFields = new Set([
  "PC",
  "A",
  "X",
  "Y",
  "S",
  "IRQ",
  "PStatus",
  "cycleCount",
  "flags",
])

const getBreakpointsFromReply = async (client) => {
  const reply = await dispatchCommand(client, "getBreakpoints", {}, true)
  return Array.isArray(reply.result?.breakpoints) ? reply.result.breakpoints : []
}

const breakpointIdFromAddress = (address) => `bp:${Number(address)}`

const getBreakpointResource = (breakpoint) => ({
  breakpointId: breakpointIdFromAddress(breakpoint.address),
  address: Number(breakpoint.address),
  disabled: Boolean(breakpoint.disabled),
  watchpoint: Boolean(breakpoint.watchpoint),
  instruction: Boolean(breakpoint.instruction),
  hidden: Boolean(breakpoint.hidden),
  once: Boolean(breakpoint.once),
  memget: Boolean(breakpoint.memget),
  memset: Boolean(breakpoint.memset),
  expression1: breakpoint.expression1,
  expression2: breakpoint.expression2,
  expressionOperator: breakpoint.expressionOperator || "",
  hexvalue: Number(breakpoint.hexvalue ?? -1),
  hitcount: Number(breakpoint.hitcount ?? 1),
  nhits: Number(breakpoint.nhits ?? 0),
  memoryBank: breakpoint.memoryBank || "",
  action1: breakpoint.action1,
  action2: breakpoint.action2,
  halt: Boolean(breakpoint.halt),
})

const getBreakpointListResource = (breakpoints) => breakpoints.map(getBreakpointResource)

const parseBreakpointId = (breakpointId) => {
  if (!/^bp:-?\d+$/.test(String(breakpointId))) {
    return null
  }
  return Number(String(breakpointId).slice(3))
}

const setBreakpointsAndReadBack = async (client, breakpoints) => {
  const reply = await dispatchCommand(client, "setBreakpoints", { breakpoints }, true)
  const resultBreakpoints = Array.isArray(reply.result?.breakpoints) ? reply.result.breakpoints : breakpoints
  client.lastSeenAt = Date.now()
  return getBreakpointListResource(resultBreakpoints)
}

const findBreakpointResourceByAddress = (breakpoints, address) =>
  breakpoints.find((breakpoint) => Number(breakpoint.address) === Number(address)) || null

const getSnapshotResources = (snapshots) =>
  (Array.isArray(snapshots) ? snapshots : []).map((snapshot) => ({
    snapshotId: String(snapshot.snapshotId),
    index: Number(snapshot.index ?? 0),
    cycleCount: Number(snapshot.cycleCount ?? 0),
    label: snapshot.label ?? null,
    thumbnail: snapshot.thumbnail ?? null,
    active: Boolean(snapshot.active),
  }))

const getStatusFromReply = async (client, action, payload) => {
  const reply = await dispatchCommand(client, action, payload, true)
  return reply.result
}

const getFreshMachineResource = async (client) => {
  const status = await getStatusFromReply(client, "getStatus", {})
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getMachineResource(status)
}

const allowedMachinePatchFields = new Set([
  "runMode",
  "speedMode",
  "machineName",
  "ramWorksKb",
  "debugEnabled",
  "showDebugPanel",
])

const applyMachinePatch = async (client, patch) => {
  let lastStatus = client.latestState

  if ("runMode" in patch) {
    if (patch.runMode !== "running" && patch.runMode !== "paused") {
      throw new Error("runMode must be 'running' or 'paused'")
    }
    lastStatus = await getStatusFromReply(client, "setRunMode", {
      runMode: patch.runMode === "running" ? -1 : -2,
    })
  }

  if ("speedMode" in patch) {
    const speedMode = Number(patch.speedMode)
    if (!Number.isFinite(speedMode)) {
      throw new Error("speedMode must be a number")
    }
    lastStatus = await getStatusFromReply(client, "setSpeedMode", { speedMode })
  }

  if ("machineName" in patch) {
    if (patch.machineName !== "APPLE2EU" && patch.machineName !== "APPLE2EE") {
      throw new Error("machineName must be 'APPLE2EU' or 'APPLE2EE'")
    }
    lastStatus = await getStatusFromReply(client, "setMachineName", {
      machineName: patch.machineName,
    })
  }

  if ("ramWorksKb" in patch) {
    const ramWorksKb = Number(patch.ramWorksKb)
    if (![64, 512, 1024, 4096, 8192].includes(ramWorksKb)) {
      throw new Error("ramWorksKb must be one of 64, 512, 1024, 4096, or 8192")
    }
    lastStatus = await getStatusFromReply(client, "setRamWorks", { size: ramWorksKb })
  }

  if ("debugEnabled" in patch) {
    lastStatus = await getStatusFromReply(client, "setDebug", {
      enabled: Boolean(patch.debugEnabled),
    })
  }

  if ("showDebugPanel" in patch) {
    lastStatus = await getStatusFromReply(client, "setShowDebugTab", {
      enabled: Boolean(patch.showDebugPanel),
    })
  }

  if (!lastStatus) {
    return getFreshMachineResource(client)
  }

  client.latestState = lastStatus
  client.lastSeenAt = Date.now()
  return getMachineResource(lastStatus)
}

const applyLifecycleAction = async (client, action) => {
  let runMode
  switch (action) {
    case "boot":
      runMode = -3
      break
    case "reset":
      runMode = -4
      break
    case "pause":
      runMode = -2
      break
    case "resume":
      runMode = -1
      break
    default:
      throw new Error(`Unsupported lifecycle action '${action}'`)
  }

  const status = await getStatusFromReply(client, "setRunMode", { runMode })
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getMachineResource(status)
}

const applyDebugStep = async (client, action) => {
  const stepActionMap = {
    into: "stepInto",
    over: "stepOver",
    out: "stepOut",
  }
  const commandAction = stepActionMap[action]
  if (!commandAction) {
    throw new Error(`Unsupported debug step action '${action}'`)
  }

  const status = await getStatusFromReply(client, commandAction, {})
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getCpuResource(status)
}

const getFreshCpuResource = async (client) => {
  const status = await getStatusFromReply(client, "getStatus", {})
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getCpuResource(status)
}

const applyCpuPatch = async (client, patch) => {
  const current = await getFreshCpuResource(client)
  const next = mergeCpuPatch(current, patch)
  const status = await getStatusFromReply(client, "setCpuState", {
    state: buildCpuStateFromResource(next),
  })
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getCpuResource(status)
}

const getSnapshotsFromReply = async (client) => {
  const reply = await dispatchCommand(client, "getSnapshots", {}, true)
  return getSnapshotResources(reply.result?.snapshots)
}

const applySnapshotAction = async (client, action, payload = {}) => {
  const reply = await dispatchCommand(client, action, payload, true)
  client.lastSeenAt = Date.now()
  return getSnapshotResources(reply.result?.snapshots)
}

const getActiveSnapshot = (snapshots) => snapshots.find((snapshot) => snapshot.active) || null

const exportSaveStateFromReply = async (client, includeSnapshots) => {
  const reply = await dispatchCommand(client, "exportSaveState", { includeSnapshots }, true, commandTimeoutMs * 3)
  client.lastSeenAt = Date.now()
  return {
    filename: String(reply.result?.filename || "apple2ts.a2ts"),
    mimeType: String(reply.result?.mimeType || "text/plain"),
    dataBase64: String(reply.result?.dataBase64 || ""),
  }
}

const importSaveStateFromReply = async (client, dataBase64) => {
  const status = await getStatusFromReply(client, "importSaveState", { dataBase64 })
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getMachineResource(status)
}

const sendSseEvent = (res, eventName, data) => {
  res.write(`event: ${eventName}\n`)
  res.write(`data: ${JSON.stringify(data)}\n\n`)
}

const failPendingCommandsForClient = (clientId, errorMessage) => {
  for (const [commandId, pending] of pendingCommands.entries()) {
    if (pending.clientId !== clientId) continue
    clearTimeout(pending.timeout)
    pending.reject(new Error(errorMessage))
    pendingCommands.delete(commandId)
  }
}

const dispatchCommand = (client, action, payload, waitForReply = true, waitMs = commandTimeoutMs) => {
  if (!client || !client.eventStream) {
    return Promise.reject(new Error("No connected browser client is available"))
  }

  const commandId = randomUUID()
  sendSseEvent(client.eventStream, "command", { commandId, action, payload })

  if (!waitForReply) {
    return Promise.resolve({ commandId, accepted: true })
  }

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCommands.delete(commandId)
      reject(new Error(`Timed out waiting for command '${action}'`))
    }, waitMs)

    pendingCommands.set(commandId, {
      clientId: client.clientId,
      resolve,
      reject,
      timeout,
    })
  })
}

const serveStaticFile = async (res, pathname) => {
  const normalizedPath = pathname === "/" ? "/index.html" : pathname
  const resolvedPath = path.resolve(distDir, `.${normalizedPath}`)
  const safeRoot = `${distDir}${path.sep}`
  if (resolvedPath !== distDir && !resolvedPath.startsWith(safeRoot)) {
    writeJson(res, 403, { error: "Forbidden" })
    return
  }

  let filePath = resolvedPath
  try {
    const stat = await fs.stat(filePath)
    if (stat.isDirectory()) {
      filePath = path.join(filePath, "index.html")
    }
  } catch {
    filePath = path.join(distDir, "index.html")
  }

  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath)
    res.statusCode = 200
    res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream")
    res.end(data)
  } catch (error) {
    writeJson(res, 404, { error: "File not found", details: error.message })
  }
}

const serveFile = async (res, filePath) => {
  try {
    const data = await fs.readFile(filePath)
    const ext = path.extname(filePath)
    res.statusCode = 200
    res.setHeader("Content-Type", MIME_TYPES[ext] || "application/octet-stream")
    res.end(data)
  } catch (error) {
    writeJson(res, 404, { error: "File not found", details: error.message })
  }
}

const server = createServer(async (req, res) => {
  setCorsHeaders(res)

  if (!req.url) {
    writeJson(res, 400, { error: "Missing request URL" })
    return
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204
    res.end()
    return
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`)

  try {
    if (req.method === "POST" && url.pathname === "/api/client/connect") {
      const body = await readJsonBody(req)
      const clientId = randomUUID()
      clients.set(clientId, {
        clientId,
        connectedAt: Date.now(),
        lastSeenAt: Date.now(),
        pathname: body.pathname || "/",
        userAgent: body.userAgent || "",
        latestState: null,
        eventStream: null,
        heartbeat: null,
      })
      writeJson(res, 200, { clientId })
      return
    }

    if (req.method === "GET" && url.pathname === "/api/client/events") {
      const clientId = url.searchParams.get("clientId")
      const client = clientId ? clients.get(clientId) : null
      if (!client) {
        writeJson(res, 404, { error: "Unknown client" })
        return
      }

      res.writeHead(200, {
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Content-Type": "text/event-stream; charset=utf-8",
      })

      client.lastSeenAt = Date.now()
      client.eventStream = res
      client.heartbeat = setInterval(() => {
        res.write(": keep-alive\n\n")
      }, 15000)
      sendSseEvent(res, "hello", { clientId })

      req.on("close", () => {
        if (client.heartbeat) clearInterval(client.heartbeat)
        client.heartbeat = null
        if (client.eventStream === res) {
          client.eventStream = null
        }
        client.lastSeenAt = Date.now()
        failPendingCommandsForClient(clientId, "Browser client disconnected")
      })
      return
    }

    if (req.method === "POST" && url.pathname === "/api/client/state") {
      const body = await readJsonBody(req)
      const client = clients.get(body.clientId)
      if (!client) {
        writeJson(res, 404, { error: "Unknown client" })
        return
      }
      client.lastSeenAt = Date.now()
      client.latestState = body.state || null
      writeJson(res, 200, { ok: true })
      return
    }

    if (req.method === "POST" && url.pathname === "/api/client/reply") {
      const body = await readJsonBody(req)
      const pending = pendingCommands.get(body.commandId)
      if (!pending) {
        writeJson(res, 404, { error: "Unknown command" })
        return
      }

      clearTimeout(pending.timeout)
      pendingCommands.delete(body.commandId)

      if (body.ok === false) {
        pending.reject(new Error(body.error || "Command failed"))
      } else {
        pending.resolve({
          clientId: body.clientId,
          commandId: body.commandId,
          result: body.result,
        })
      }

      writeJson(res, 200, { ok: true })
      return
    }

    if (req.method === "GET" && url.pathname === "/api/clients") {
      writeJson(res, 200, {
        clients: [...clients.values()].map(getClientSummary),
      })
      return
    }

    if (req.method === "GET" && url.pathname === "/api/session") {
      const client = getTargetClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No browser client is connected.")
        return
      }
      writeEnvelope(res, 200, getSessionResource(client))
      return
    }

    if (req.method === "GET" && url.pathname === "/api/machine") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await getFreshMachineResource(client))
      return
    }

    if (req.method === "PATCH" && url.pathname === "/api/machine") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }

      const body = await readJsonBody(req)
      const keys = Object.keys(body)
      if (keys.length === 0) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", "At least one machine field must be provided.")
        return
      }
      const unknownKeys = keys.filter((key) => !allowedMachinePatchFields.has(key))
      if (unknownKeys.length > 0) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", `Unknown machine fields: ${unknownKeys.join(", ")}`)
        return
      }

      try {
        writeEnvelope(res, 200, await applyMachinePatch(client, body))
      } catch (error) {
        writeErrorEnvelope(
          res,
          400,
          "BAD_REQUEST",
          error instanceof Error ? error.message : String(error),
        )
      }
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/boot") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "boot"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/reset") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "reset"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/pause") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "pause"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/resume") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "resume"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/step-into") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "into"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/step-over") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "over"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/step-out") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "out"))
      return
    }

    if (req.method === "GET" && url.pathname === "/api/debug/cpu") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await getFreshCpuResource(client))
      return
    }

    if (req.method === "PATCH" && url.pathname === "/api/debug/cpu") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }

      const body = await readJsonBody(req)
      const keys = Object.keys(body)
      if (keys.length === 0) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", "At least one CPU field must be provided.")
        return
      }
      const unknownKeys = keys.filter((key) => !allowedCpuPatchFields.has(key))
      if (unknownKeys.length > 0) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", `Unknown CPU fields: ${unknownKeys.join(", ")}`)
        return
      }

      try {
        writeEnvelope(res, 200, await applyCpuPatch(client, body))
      } catch (error) {
        writeErrorEnvelope(
          res,
          400,
          "BAD_REQUEST",
          error instanceof Error ? error.message : String(error),
        )
      }
      return
    }

    if (req.method === "GET" && url.pathname === "/api/debug/breakpoints") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await getBreakpointListResource(await getBreakpointsFromReply(client)))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/breakpoints") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }

      const body = await readJsonBody(req)
      if (!Number.isFinite(Number(body.address))) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", "Breakpoint address is required.")
        return
      }

      const breakpoints = await getBreakpointsFromReply(client)
      const nextBreakpoint = {
        ...body,
        address: Number(body.address),
      }
      const filtered = breakpoints.filter((breakpoint) => Number(breakpoint.address) !== nextBreakpoint.address)
      filtered.push(nextBreakpoint)
      const nextResources = await setBreakpointsAndReadBack(client, filtered)
      writeEnvelope(res, 200, findBreakpointResourceByAddress(nextResources, nextBreakpoint.address))
      return
    }

    if (req.method === "DELETE" && url.pathname === "/api/debug/breakpoints") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await setBreakpointsAndReadBack(client, []))
      return
    }

    if (url.pathname.startsWith("/api/debug/breakpoints/")) {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }

      const breakpointId = decodeURIComponent(url.pathname.slice("/api/debug/breakpoints/".length))
      const address = parseBreakpointId(breakpointId)
      if (address === null) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Breakpoint not found.")
        return
      }

      const breakpoints = await getBreakpointsFromReply(client)
      const index = breakpoints.findIndex((breakpoint) => Number(breakpoint.address) === address)
      if (index < 0) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Breakpoint not found.")
        return
      }

      if (req.method === "PATCH") {
        const body = await readJsonBody(req)
        const nextBreakpoint = {
          ...breakpoints[index],
          ...body,
          address: "address" in body ? Number(body.address) : address,
        }
        const filtered = breakpoints.filter((_, breakpointIndex) => breakpointIndex !== index)
        filtered.push(nextBreakpoint)
        const nextResources = await setBreakpointsAndReadBack(client, filtered)
        writeEnvelope(res, 200, findBreakpointResourceByAddress(nextResources, nextBreakpoint.address))
        return
      }

      if (req.method === "DELETE") {
        const filtered = breakpoints.filter((_, breakpointIndex) => breakpointIndex !== index)
        writeEnvelope(res, 200, await setBreakpointsAndReadBack(client, filtered))
        return
      }
    }

    if (req.method === "GET" && url.pathname === "/api/debug/snapshots") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      writeEnvelope(res, 200, await getSnapshotsFromReply(client))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const snapshots = await applySnapshotAction(client, "createSnapshot")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots/step-back") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const snapshots = await applySnapshotAction(client, "stepSnapshotBack")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots/step-forward") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const snapshots = await applySnapshotAction(client, "stepSnapshotForward")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && /\/api\/debug\/snapshots\/[^/]+\/activate$/.test(url.pathname)) {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const snapshotId = decodeURIComponent(url.pathname.slice("/api/debug/snapshots/".length, -"/activate".length))
      if (!/^snap:\d+$/.test(snapshotId)) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Snapshot not found.")
        return
      }
      const snapshots = await applySnapshotAction(client, "activateSnapshot", { snapshotId })
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/save-states/export") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const body = await readJsonBody(req)
      writeEnvelope(res, 200, await exportSaveStateFromReply(client, Boolean(body.includeSnapshots)))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/save-states/import") {
      const client = getConnectedClient(url.searchParams.get("clientId"))
      if (!client) {
        writeErrorEnvelope(res, 404, "NO_ACTIVE_SESSION", "No connected browser client is available.")
        return
      }
      const body = await readJsonBody(req)
      const dataBase64 = String(body.dataBase64 || "")
      if (!dataBase64) {
        writeErrorEnvelope(res, 400, "BAD_REQUEST", "dataBase64 is required.")
        return
      }
      writeEnvelope(res, 200, await importSaveStateFromReply(client, dataBase64))
      return
    }

    if (req.method === "GET" && url.pathname === "/api/status") {
      const client = getTargetClient(url.searchParams.get("clientId"))
      if (!client) {
        writeJson(res, 404, { error: "No client is connected" })
        return
      }
      writeJson(res, 200, {
        client: getClientSummary(client),
        state: client.latestState,
      })
      return
    }

    if (req.method === "GET" && url.pathname === "/api/memory") {
      const client = getTargetClient(url.searchParams.get("clientId"))
      if (!client) {
        writeJson(res, 404, { error: "No client is connected" })
        return
      }
      const response = await dispatchCommand(client, "getMemory", {}, true)
      writeJson(res, 200, response)
      return
    }

    if (req.method === "POST" && url.pathname === "/api/control") {
      const body = await readJsonBody(req)
      const client = getTargetClient(body.clientId)
      if (!client) {
        writeJson(res, 404, { error: "No client is connected" })
        return
      }
      const waitForReply = body.wait !== false
      const response = await dispatchCommand(
        client,
        body.action,
        body.payload || {},
        waitForReply,
        Number(body.waitMs || commandTimeoutMs),
      )
      writeJson(res, waitForReply ? 200 : 202, response)
      return
    }

    if (req.method === "GET" && url.pathname === "/openapi.json") {
      await serveFile(res, path.join(serverDir, "openapi.json"))
      return
    }

    if (req.method === "GET" && url.pathname === "/openapi-v1-draft.json") {
      await serveFile(res, path.join(serverDir, "openapi-v1-draft.json"))
      return
    }

    if (req.method === "GET" && (url.pathname === "/docs" || url.pathname === "/docs/")) {
      await serveFile(res, path.join(serverDir, "swagger.html"))
      return
    }

    await serveStaticFile(res, url.pathname)
  } catch (error) {
    writeJson(res, 500, {
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error),
    })
  }
})

server.listen(port, host, async () => {
  let hasDist = true
  try {
    await fs.access(path.join(distDir, "index.html"))
  } catch {
    hasDist = false
  }

  const url = `http://${host}:${port}`
  console.log(`Apple2TS server listening on ${url} (localhost only)`)
  if (!hasDist) {
    console.log("Build output not found. Run 'npm run build' before 'npm run serve'.")
  }
})
