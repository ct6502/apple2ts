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

const getConnectedClient = () => {
  let client = null
  for (const candidate of clients.values()) {
    if (!candidate.eventStream) continue
    if (!client || candidate.lastSeenAt > client.lastSeenAt) {
      client = candidate
    }
  }
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

const getDriveId = (drive) => {
  if (drive.hardDrive) {
    return drive.drive === 1 ? "hd1" : "hd2"
  }
  return drive.drive === 1 ? "fd1" : "fd2"
}

const getDriveResource = (drive) => ({
  driveId: getDriveId(drive),
  index: Number(drive.index ?? 0),
  kind: drive.hardDrive ? "hard-drive" : "floppy",
  mounted: Boolean(drive.filename),
  filename: drive.filename || null,
  status: String(drive.status || ""),
  writeProtected: Boolean(drive.isWriteProtected),
  dirty: Boolean(drive.diskHasChanges),
  motorRunning: Boolean(drive.motorRunning),
  lastWriteTime: Number(drive.lastWriteTime ?? -1) >= 0 ? Number(drive.lastWriteTime) : null,
  byteLength: Number(drive.byteLength ?? 0),
})

const getDriveResources = (status) => {
  const drives = Array.isArray(status?.drives) ? status.drives : []
  return drives.map(getDriveResource)
}

const findDriveResourceById = (drives, driveId) => drives.find((drive) => drive.driveId === driveId) || null

const findDriveResourceByIndex = (drives, index) =>
  drives.find((drive) => Number(drive.index) === Number(index)) || null

const getSoftSwitchResource = (status) => ({
  switches:
    status?.machine?.softSwitches && typeof status.machine.softSwitches === "object"
      ? status.machine.softSwitches
      : {},
})

const getMachineResource = (status) => {
  const machine = status?.machine || {}
  return {
    runMode: runModeToApiName(Number(machine.runMode)),
    speedMode: Number(machine.speedMode ?? 0),
    machineName: machine.machineName || "APPLE2EE",
    ramWorksKb: Number(machine.ramWorksKb ?? 64),
    debugEnabled: Boolean(machine.isDebugging),
    showDebugPanel: Boolean(machine.showDebugTab),
    textPage: machine.textPage || "",
    drives: getDriveResources(status).map(({ driveId, kind, mounted, filename, writeProtected, dirty }) => ({
      driveId,
      kind,
      mounted,
      filename,
      writeProtected,
      dirty,
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

const getStatusFromCommandResult = (result) => {
  if (!result || typeof result !== "object") {
    return null
  }
  if (result.machine || result.drives) {
    return result
  }
  if (result.status && typeof result.status === "object") {
    return result.status
  }
  return null
}

const updateClientStatusFromCommandResult = (client, result) => {
  const status = getStatusFromCommandResult(result)
  if (status) {
    client.latestState = status
  }
  client.lastSeenAt = Date.now()
  return status
}

const getFreshMachineResource = async (client) => {
  const status = await getStatusFromReply(client, "getStatus", {})
  client.latestState = status
  client.lastSeenAt = Date.now()
  return getMachineResource(status)
}

const getFreshStatus = async (client) => {
  const status = await getStatusFromReply(client, "getStatus", {})
  client.latestState = status
  client.lastSeenAt = Date.now()
  return status
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

const getMemoryDumpFromReply = async (client) => {
  const reply = await dispatchCommand(client, "getMemory", {}, true)
  const memoryDump = Array.isArray(reply.result?.memoryDump)
    ? reply.result.memoryDump.map((value) => Number(value))
    : null

  if (!memoryDump) {
    throw new Error("Memory dump was not available from the browser client.")
  }

  client.lastSeenAt = Date.now()
  return {
    byteLength: memoryDump.length,
    data: memoryDump,
  }
}

const formatBytesAsHex = (bytes) =>
  bytes.map((byte) => Number(byte).toString(16).padStart(2, "0").toUpperCase()).join(" ")

const getMemoryRangeResource = (memoryDump, start, length, format) => {
  const slice = memoryDump.slice(start, start + length)
  return {
    start,
    length,
    format,
    data: format === "hex" ? formatBytesAsHex(slice) : slice,
  }
}

const getDriveIdFromPath = (pathname) => decodeURIComponent(pathname.slice("/api/drives/".length))

const getDriveIdOrNull = (driveId) => (["hd1", "hd2", "fd1", "fd2"].includes(driveId) ? driveId : null)

const getMountedDriveResourceFromResult = (result, requestedDriveId) => {
  const status = getStatusFromCommandResult(result)
  if (!status) {
    return null
  }
  const driveResources = getDriveResources(status)
  const mountedDriveIndex =
    result && typeof result === "object" && "mountedDrive" in result ? Number(result.mountedDrive) : null

  if (Number.isInteger(mountedDriveIndex)) {
    const mountedDrive = findDriveResourceByIndex(driveResources, mountedDriveIndex)
    if (mountedDrive) {
      return mountedDrive
    }
  }

  return findDriveResourceById(driveResources, requestedDriveId)
}

const dispatchAcceptedInput = async (client, action, payload) => {
  const reply = await dispatchCommand(client, action, payload, true)
  updateClientStatusFromCommandResult(client, reply.result)
  return {
    accepted: true,
  }
}

const parseInteger = (value) => {
  const parsed = Number(value)
  return Number.isInteger(parsed) ? parsed : null
}

const validateMemoryBounds = (start, length) => {
  if (!Number.isInteger(start) || start < 0 || start > 65535) {
    throw new Error("start must be an integer between 0 and 65535")
  }
  if (!Number.isInteger(length) || length < 1 || length > 65536) {
    throw new Error("length must be an integer between 1 and 65536")
  }
  if (start + length > 65536) {
    throw new Error("Requested memory range exceeds 64 KB address space")
  }
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

    if (req.method === "GET" && url.pathname === "/api/machine") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await getFreshMachineResource(client))
      return
    }

    if (req.method === "PATCH" && url.pathname === "/api/machine") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "boot"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/reset") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "reset"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/pause") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "pause"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/machine/resume") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyLifecycleAction(client, "resume"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/input/keys") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const body = await readJsonBody(req)
      try {
        if (body.type === "key") {
          if (typeof body.key !== "string" || body.key.length === 0) {
            throw new Error("key is required for type 'key'")
          }
          writeEnvelope(
            res,
            200,
            await dispatchAcceptedInput(client, "keypress", {
              key: body.key,
              release: body.release !== false,
            }),
          )
          return
        }

        if (body.type === "keyCode") {
          const keyCode = parseInteger(body.keyCode)
          if (keyCode === null) {
            throw new Error("keyCode is required for type 'keyCode'")
          }
          writeEnvelope(
            res,
            200,
            await dispatchAcceptedInput(client, "keypress", {
              key: keyCode,
              release: body.release !== false,
            }),
          )
          return
        }

        if (body.type === "text") {
          if (typeof body.text !== "string") {
            throw new Error("text is required for type 'text'")
          }
          writeEnvelope(res, 200, await dispatchAcceptedInput(client, "pasteText", { text: body.text }))
          return
        }

        throw new Error("type must be one of 'key', 'keyCode', or 'text'")
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

    if (req.method === "POST" && url.pathname === "/api/input/apple-keys") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const body = await readJsonBody(req)
      try {
        if (body.side !== "left" && body.side !== "right") {
          throw new Error("side must be 'left' or 'right'")
        }
        if (typeof body.pressed !== "boolean") {
          throw new Error("pressed must be a boolean")
        }
        writeEnvelope(res, 200, await dispatchAcceptedInput(client, "appleKey", body))
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

    if (req.method === "POST" && url.pathname === "/api/input/mouse") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const body = await readJsonBody(req)
      try {
        const x = parseInteger(body.x)
        const y = parseInteger(body.y)
        const buttons = parseInteger(body.buttons)
        if (x === null || y === null || buttons === null) {
          throw new Error("x, y, and buttons must be integers")
        }
        writeEnvelope(res, 200, await dispatchAcceptedInput(client, "mouseEvent", { x, y, buttons }))
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

    if (req.method === "GET" && url.pathname === "/api/drives") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, getDriveResources(await getFreshStatus(client)))
      return
    }

    if (req.method === "GET" && url.pathname === "/api/debug/memory/full") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      try {
        writeEnvelope(res, 200, await getMemoryDumpFromReply(client))
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

    if (req.method === "GET" && url.pathname === "/api/debug/memory") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      try {
        const start = parseInteger(url.searchParams.get("start"))
        const length = parseInteger(url.searchParams.get("length"))
        const format = url.searchParams.get("format") || "bytes"

        if (start === null || length === null) {
          throw new Error("start and length query parameters are required")
        }
        if (format !== "bytes" && format !== "hex") {
          throw new Error("format must be 'bytes' or 'hex'")
        }

        validateMemoryBounds(start, length)

        const memoryDump = await getMemoryDumpFromReply(client)
        if (memoryDump.byteLength < start + length) {
          throw new Error("Memory dump unavailable for the requested range. Pause the emulator first.")
        }

        writeEnvelope(res, 200, getMemoryRangeResource(memoryDump.data, start, length, format))
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

    if (req.method === "PUT" && url.pathname === "/api/debug/memory") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const body = await readJsonBody(req)
      try {
        const start = parseInteger(body.start)
        const bytes = Array.isArray(body.data) ? body.data.map((value) => Number(value)) : null
        if (start === null || !bytes) {
          throw new Error("start and data are required")
        }
        if (bytes.length === 0) {
          throw new Error("data must contain at least one byte")
        }
        if (bytes.some((value) => !Number.isInteger(value) || value < 0 || value > 255)) {
          throw new Error("data must be an array of byte values between 0 and 255")
        }

        validateMemoryBounds(start, bytes.length)

        for (const [offset, value] of bytes.entries()) {
          const status = await getStatusFromReply(client, "setMemory", {
            address: start + offset,
            value,
          })
          client.latestState = status
          client.lastSeenAt = Date.now()
        }

        const memoryDump = await getMemoryDumpFromReply(client)
        if (memoryDump.byteLength < start + bytes.length) {
          throw new Error("Memory dump unavailable after write. Pause the emulator first.")
        }

        writeEnvelope(res, 200, getMemoryRangeResource(memoryDump.data, start, bytes.length, "bytes"))
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

    if (req.method === "GET" && url.pathname === "/api/debug/soft-switches") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, getSoftSwitchResource(await getFreshStatus(client)))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/soft-switches") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const body = await readJsonBody(req)
      try {
        const addresses = Array.isArray(body.addresses) ? body.addresses.map((value) => Number(value)) : null
        if (!addresses) {
          throw new Error("addresses is required")
        }
        if (addresses.some((value) => !Number.isInteger(value))) {
          throw new Error("addresses must contain integer soft-switch addresses")
        }
        const status = await getStatusFromReply(client, "setSoftSwitches", { addresses })
        client.latestState = status
        client.lastSeenAt = Date.now()
        writeEnvelope(res, 200, getSoftSwitchResource(status))
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

    if (req.method === "POST" && url.pathname === "/api/debug/step-into") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "into"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/step-over") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "over"))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/step-out") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await applyDebugStep(client, "out"))
      return
    }

    if (req.method === "GET" && url.pathname === "/api/debug/cpu") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await getFreshCpuResource(client))
      return
    }

    if (req.method === "PATCH" && url.pathname === "/api/debug/cpu") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await getBreakpointListResource(await getBreakpointsFromReply(client)))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/breakpoints") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await setBreakpointsAndReadBack(client, []))
      return
    }

    if (url.pathname === "/api/drives" || url.pathname.startsWith("/api/drives/")) {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }

      const mountPrefix = "/api/drives/"
      const mountSuffix = "/mount"
      const isMountRoute = req.method === "POST" && url.pathname.startsWith(mountPrefix) && url.pathname.endsWith(mountSuffix)
      const driveId = isMountRoute
        ? decodeURIComponent(url.pathname.slice(mountPrefix.length, -mountSuffix.length))
        : getDriveIdFromPath(url.pathname)
      const normalizedDriveId = getDriveIdOrNull(driveId)

      if (!normalizedDriveId) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Drive not found.")
        return
      }

      const status = await getFreshStatus(client)
      const driveResources = getDriveResources(status)
      const drive = findDriveResourceById(driveResources, normalizedDriveId)
      if (!drive) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Drive not found.")
        return
      }

      if (req.method === "GET" && url.pathname === `/api/drives/${normalizedDriveId}`) {
        writeEnvelope(res, 200, drive)
        return
      }

      if (req.method === "PATCH" && url.pathname === `/api/drives/${normalizedDriveId}`) {
        const body = await readJsonBody(req)
        try {
          const keys = Object.keys(body)
          if (keys.length === 0) {
            throw new Error("At least one drive field must be provided.")
          }
          if (keys.some((key) => key !== "writeProtected")) {
            throw new Error("Unknown drive fields. Only 'writeProtected' is supported.")
          }
          if (typeof body.writeProtected !== "boolean") {
            throw new Error("writeProtected must be a boolean")
          }

          const reply = await dispatchCommand(client, "setDriveWriteProtected", {
            driveIndex: drive.index,
            isWriteProtected: body.writeProtected,
          }, true)
          const nextStatus = updateClientStatusFromCommandResult(client, reply.result)
          const nextDrive = findDriveResourceById(getDriveResources(nextStatus || status), normalizedDriveId)
          writeEnvelope(res, 200, nextDrive || drive)
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

      if (req.method === "DELETE" && url.pathname === `/api/drives/${normalizedDriveId}`) {
        const reply = await dispatchCommand(client, "ejectDisk", { driveIndex: drive.index }, true)
        const nextStatus = updateClientStatusFromCommandResult(client, reply.result)
        const nextDrive =
          getMountedDriveResourceFromResult(reply.result, normalizedDriveId) ||
          findDriveResourceById(getDriveResources(nextStatus || status), normalizedDriveId) ||
          drive
        writeEnvelope(res, 200, nextDrive)
        return
      }

      if (isMountRoute && driveId === normalizedDriveId) {
        const body = await readJsonBody(req)
        try {
          if (typeof body.sourceType !== "string") {
            throw new Error("sourceType is required")
          }

          let reply
          switch (body.sourceType) {
            case "base64": {
              if (typeof body.dataBase64 !== "string" || !body.dataBase64) {
                throw new Error("dataBase64 is required for sourceType 'base64'")
              }
              if (typeof body.filename !== "string" || !body.filename) {
                throw new Error("filename is required for sourceType 'base64'")
              }
              reply = await dispatchCommand(client, "mountDisk", {
                driveIndex: drive.index,
                filename: body.filename,
                dataBase64: body.dataBase64,
              }, true)
              break
            }

            case "url": {
              if (typeof body.url !== "string" || !body.url) {
                throw new Error("url is required for sourceType 'url'")
              }
              reply = await dispatchCommand(client, "mountDiskFromUrl", {
                driveIndex: drive.index,
                url: body.url,
              }, true, commandTimeoutMs * 3)
              break
            }

            case "library-id": {
              if (typeof body.libraryId !== "string" || !body.libraryId) {
                throw new Error("libraryId is required for sourceType 'library-id'")
              }
              reply = await dispatchCommand(client, "mountDiskFromUrl", {
                driveIndex: drive.index,
                url: `a2ia://${body.libraryId}`,
              }, true, commandTimeoutMs * 3)
              break
            }

            case "binary-block": {
              if (typeof body.dataBase64 !== "string" || !body.dataBase64) {
                throw new Error("dataBase64 is required for sourceType 'binary-block'")
              }
              const address = parseInteger(body.address)
              if (address === null) {
                throw new Error("address is required for sourceType 'binary-block'")
              }
              reply = await dispatchCommand(client, "mountBinaryBlock", {
                address,
                autoRun: body.autoRun !== false,
                dataBase64: body.dataBase64,
              }, true)
              break
            }

            case "basic-text": {
              if (typeof body.text !== "string" || !body.text) {
                throw new Error("text is required for sourceType 'basic-text'")
              }
              reply = await dispatchCommand(client, "mountBasicText", {
                text: body.text,
                autoRun: body.autoRun !== false,
              }, true)
              break
            }

            default:
              throw new Error("Unsupported sourceType")
          }

          const nextStatus = updateClientStatusFromCommandResult(client, reply.result)
          const nextDrive =
            getMountedDriveResourceFromResult(reply.result, normalizedDriveId) ||
            findDriveResourceById(getDriveResources(nextStatus || status), normalizedDriveId) ||
            drive
          writeEnvelope(res, 200, nextDrive)
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
    }

    if (url.pathname.startsWith("/api/debug/breakpoints/")) {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      writeEnvelope(res, 200, await getSnapshotsFromReply(client))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      const snapshots = await applySnapshotAction(client, "createSnapshot")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots/step-back") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      const snapshots = await applySnapshotAction(client, "stepSnapshotBack")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/debug/snapshots/step-forward") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      const snapshots = await applySnapshotAction(client, "stepSnapshotForward")
      writeEnvelope(res, 200, getActiveSnapshot(snapshots))
      return
    }

    if (req.method === "POST" && /\/api\/debug\/snapshots\/[^/]+\/activate$/.test(url.pathname)) {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
        return
      }
      const body = await readJsonBody(req)
      writeEnvelope(res, 200, await exportSaveStateFromReply(client, Boolean(body.includeSnapshots)))
      return
    }

    if (req.method === "POST" && url.pathname === "/api/save-states/import") {
      const client = getConnectedClient()
      if (!client) {
        writeErrorEnvelope(res, 404, "NOT_FOUND", "Requested resource was not found.")
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

    if (req.method === "GET" && url.pathname === "/openapi.json") {
      await serveFile(res, path.join(serverDir, "openapi.json"))
      return
    }

    if (req.method === "GET" && (url.pathname === "/docs" || url.pathname === "/docs/")) {
      await serveFile(res, path.join(serverDir, "swagger.html"))
      return
    }

    if (req.method === "GET" && (url.pathname === "/launcher" || url.pathname === "/launcher/")) {
      await serveFile(res, path.join(serverDir, "launcher.html"))
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
