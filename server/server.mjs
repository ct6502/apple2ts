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
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
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
