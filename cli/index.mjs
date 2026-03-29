#!/usr/bin/env node

import { Buffer } from "node:buffer"
import { promises as fs } from "node:fs"
import path from "node:path"

const DEFAULT_SERVER = "http://127.0.0.1:6502"
const DEFAULT_OUTPUT = "pretty"

const helpText = `apple2ts-cli

Usage:
  npm run cli -- [global-options] <group> <command> [command-options]
  node cli/index.mjs [global-options] <group> <command> [command-options]

Global options:
  --server <url>         Server base URL. Default: ${DEFAULT_SERVER}
  --json                 Print raw JSON only
  --pretty               Print formatted JSON (default)
  --help                 Show help

Groups:
  machine                Get or control machine state
  cpu                    Get or patch CPU registers
  debug                  Single-step execution
  breakpoints            Manage breakpoints
  memory                 Read or write memory
  soft-switches          Read or trigger soft switches
  drives                 Inspect or modify drives
  input                  Send keyboard, Apple key, or mouse input
  snapshots              Manage debugger snapshots
  save-state             Export or import save states

Examples:
  npm run cli -- machine get
  npm run cli -- machine set --speed-mode 3 --debug-enabled true
  npm run cli -- cpu set --pc 0x300 --a 0x41 --flag-z true
  npm run cli -- breakpoints create --address 0xC000 --instruction true --halt true
  npm run cli -- memory get --start 0x300 --length 32 --format hex
  npm run cli -- drives mount-file fd1 --file public/disks/blank.po
  npm run cli -- input text --text "PRINT CHR$(4);\\"CATALOG\\""
  npm run cli -- save-state export --output session.a2ts
`

const printHelp = () => {
  process.stdout.write(`${helpText}\n`)
}

const fail = (message, exitCode = 1) => {
  process.stderr.write(`${message}\n`)
  process.exit(exitCode)
}

const maybeNumber = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    return null
  }

  if (/^0x[0-9a-f]+$/i.test(value)) {
    return Number.parseInt(value.slice(2), 16)
  }

  if (/^0b[01]+$/i.test(value)) {
    return Number.parseInt(value.slice(2), 2)
  }

  if (/^0o[0-7]+$/i.test(value)) {
    return Number.parseInt(value.slice(2), 8)
  }

  if (/^-?\d+$/.test(value)) {
    return Number.parseInt(value, 10)
  }

  return null
}

const parseRequiredNumber = (value, label) => {
  const parsed = maybeNumber(value)
  if (!Number.isInteger(parsed)) {
    fail(`${label} must be an integer. Received: ${value}`)
  }
  return parsed
}

const parseBoolean = (value, label) => {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value !== "string") {
    fail(`${label} must be true or false.`)
  }

  switch (value.toLowerCase()) {
    case "true":
    case "1":
    case "yes":
    case "on":
      return true
    case "false":
    case "0":
    case "no":
    case "off":
      return false
    default:
      fail(`${label} must be true or false. Received: ${value}`)
  }
}

const parseByteValue = (value) => {
  const parsed = parseRequiredNumber(value, "byte")
  if (parsed < 0 || parsed > 255) {
    fail(`byte values must be between 0 and 255. Received: ${value}`)
  }
  return parsed
}

const parseByteString = (value) => {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail("byte data must not be empty")
  }

  const normalized = value
    .trim()
    .split(/[\s,]+/)
    .filter(Boolean)

  if (normalized.length === 0) {
    fail("byte data must contain at least one value")
  }

  return normalized.map((item) => {
    if (/^[0-9a-f]{2}$/i.test(item)) {
      return Number.parseInt(item, 16)
    }
    return parseByteValue(item)
  })
}

const parseOptionTokens = (tokens) => {
  const options = new Map()
  const positionals = []

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]

    if (!token.startsWith("--")) {
      positionals.push(token)
      continue
    }

    const eqIndex = token.indexOf("=")
    if (eqIndex >= 0) {
      options.set(token.slice(2, eqIndex), token.slice(eqIndex + 1))
      continue
    }

    const key = token.slice(2)
    const next = tokens[index + 1]
    if (next !== undefined && !next.startsWith("--")) {
      options.set(key, next)
      index += 1
      continue
    }

    options.set(key, true)
  }

  return { options, positionals }
}

const requireOption = (options, key, label = key) => {
  if (!options.has(key)) {
    fail(`Missing required option --${label}`)
  }
  return options.get(key)
}

const getOptionalNumber = (options, key, label = key) => {
  if (!options.has(key)) {
    return undefined
  }
  return parseRequiredNumber(String(options.get(key)), label)
}

const getOptionalBoolean = (options, key, label = key) => {
  if (!options.has(key)) {
    return undefined
  }
  return parseBoolean(options.get(key), label)
}

const assertNoExtraPositionals = (positionals, context) => {
  if (positionals.length > 0) {
    fail(`Unexpected positional arguments for ${context}: ${positionals.join(" ")}`)
  }
}

const assertNoOptions = (options, context) => {
  if (options.size > 0) {
    fail(`Unexpected options for ${context}: ${Array.from(options.keys()).map((key) => `--${key}`).join(", ")}`)
  }
}

const prettyPrint = (value) => {
  if (typeof value === "string") {
    process.stdout.write(`${value}\n`)
    return
  }

  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`)
}

const buildUrl = (baseUrl, pathname, query = undefined) => {
  const url = new URL(pathname, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`)
  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) {
        continue
      }
      url.searchParams.set(key, String(value))
    }
  }
  return url
}

const apiRequest = async (context, method, pathname, { query, body, raw = false } = {}) => {
  const url = buildUrl(context.server, pathname, query)
  const requestInit = {
    method,
    headers: {},
  }

  if (body !== undefined) {
    requestInit.headers["Content-Type"] = "application/json"
    requestInit.body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(url, requestInit)
  } catch (error) {
    fail(`Request failed: ${error instanceof Error ? error.message : String(error)}`)
  }

  let payload = null
  const text = await response.text()
  if (text.length > 0) {
    try {
      payload = JSON.parse(text)
    } catch {
      payload = text
    }
  }

  if (!response.ok) {
    if (payload && typeof payload === "object" && payload.error && typeof payload.error === "object") {
      fail(`HTTP ${response.status}: ${payload.error.code || "ERROR"}: ${payload.error.message || "Request failed"}`)
    }
    if (payload && typeof payload === "object" && typeof payload.error === "string") {
      fail(`HTTP ${response.status}: ${payload.error}`)
    }
    fail(`HTTP ${response.status}: ${typeof payload === "string" ? payload : response.statusText}`)
  }

  if (raw) {
    return payload
  }

  if (payload && typeof payload === "object" && "ok" in payload) {
    if (payload.ok === false) {
      fail(payload?.error?.message || "Request failed")
    }
    return payload.data
  }

  return payload
}

const readFileBase64 = async (filePath) => {
  const resolvedPath = path.resolve(process.cwd(), filePath)
  const data = await fs.readFile(resolvedPath)
  return {
    resolvedPath,
    filename: path.basename(resolvedPath),
    dataBase64: data.toString("base64"),
  }
}

const readUtf8File = async (filePath) => {
  const resolvedPath = path.resolve(process.cwd(), filePath)
  return {
    resolvedPath,
    text: await fs.readFile(resolvedPath, "utf8"),
  }
}

const writeBase64File = async (filePath, dataBase64) => {
  const resolvedPath = path.resolve(process.cwd(), filePath)
  await fs.writeFile(resolvedPath, Buffer.from(dataBase64, "base64"))
  return resolvedPath
}

const outputResult = async (context, result, formatter = undefined) => {
  if (formatter) {
    const formatted = await formatter(result)
    if (formatted !== undefined) {
      process.stdout.write(`${formatted}\n`)
      return
    }
  }

  if (context.output === "json") {
    process.stdout.write(`${JSON.stringify(result)}\n`)
    return
  }

  prettyPrint(result)
}

const handleMachine = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `machine ${command}`)

  switch (command) {
    case "get":
    case "status":
      assertNoOptions(options, `machine ${command}`)
      return apiRequest(context, "GET", "/api/machine")
    case "boot":
    case "reset":
    case "pause":
    case "resume":
      assertNoOptions(options, `machine ${command}`)
      return apiRequest(context, "POST", `/api/machine/${command}`)
    case "set": {
      const patch = {}
      const mappings = [
        ["run-mode", "runMode", (value) => String(value)],
        ["speed-mode", "speedMode", (value) => parseRequiredNumber(String(value), "speed-mode")],
        ["machine-name", "machineName", (value) => String(value)],
        ["ramworks-kb", "ramWorksKb", (value) => parseRequiredNumber(String(value), "ramworks-kb")],
        ["debug-enabled", "debugEnabled", (value) => parseBoolean(value, "debug-enabled")],
        ["show-debug-panel", "showDebugPanel", (value) => parseBoolean(value, "show-debug-panel")],
      ]

      for (const [flag, field, parser] of mappings) {
        if (options.has(flag)) {
          patch[field] = parser(options.get(flag))
        }
      }

      if (Object.keys(patch).length === 0) {
        fail("machine set requires at least one patch option")
      }

      return apiRequest(context, "PATCH", "/api/machine", { body: patch })
    }
    default:
      fail(`Unknown machine command: ${command}`)
  }
}

const handleCpu = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `cpu ${command}`)

  switch (command) {
    case "get":
    case "status":
      assertNoOptions(options, `cpu ${command}`)
      return apiRequest(context, "GET", "/api/debug/cpu")
    case "set": {
      const patch = {}
      const mappings = [
        ["pc", "PC"],
        ["a", "A"],
        ["x", "X"],
        ["y", "Y"],
        ["s", "S"],
        ["irq", "IRQ"],
        ["p-status", "PStatus"],
        ["cycle-count", "cycleCount"],
      ]

      for (const [flag, field] of mappings) {
        if (options.has(flag)) {
          patch[field] = parseRequiredNumber(String(options.get(flag)), flag)
        }
      }

      const flags = {}
      const flagMappings = [
        ["flag-n", "N"],
        ["flag-v", "V"],
        ["flag-b", "B"],
        ["flag-d", "D"],
        ["flag-i", "I"],
        ["flag-z", "Z"],
        ["flag-c", "C"],
        ["flag-nmi", "NMI"],
      ]

      for (const [flag, field] of flagMappings) {
        if (options.has(flag)) {
          flags[field] = parseBoolean(options.get(flag), flag)
        }
      }

      if (Object.keys(flags).length > 0) {
        patch.flags = flags
      }

      if (Object.keys(patch).length === 0) {
        fail("cpu set requires at least one patch option")
      }

      return apiRequest(context, "PATCH", "/api/debug/cpu", { body: patch })
    }
    default:
      fail(`Unknown cpu command: ${command}`)
  }
}

const handleDebug = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoOptions(options, `debug ${command}`)
  assertNoExtraPositionals(positionals, `debug ${command}`)

  switch (command) {
    case "step-into":
    case "step-over":
    case "step-out":
      return apiRequest(context, "POST", `/api/debug/${command}`)
    default:
      fail(`Unknown debug command: ${command}`)
  }
}

const normalizeBreakpointId = (value) => {
  if (/^bp:-?\d+$/.test(value)) {
    return value
  }
  return `bp:${parseRequiredNumber(value, "breakpoint-id")}`
}

const collectBreakpointFields = (options) => {
  const patch = {}
  const numericFields = [
    ["address", "address"],
    ["hexvalue", "hexvalue"],
    ["hitcount", "hitcount"],
    ["nhits", "nhits"],
  ]
  const booleanFields = [
    ["disabled", "disabled"],
    ["watchpoint", "watchpoint"],
    ["instruction", "instruction"],
    ["hidden", "hidden"],
    ["once", "once"],
    ["memget", "memget"],
    ["memset", "memset"],
    ["halt", "halt"],
  ]
  const stringFields = [
    ["expression1", "expression1"],
    ["expression2", "expression2"],
    ["expression-operator", "expressionOperator"],
    ["memory-bank", "memoryBank"],
    ["action1", "action1"],
    ["action2", "action2"],
  ]

  for (const [flag, field] of numericFields) {
    if (options.has(flag)) {
      patch[field] = parseRequiredNumber(String(options.get(flag)), flag)
    }
  }

  for (const [flag, field] of booleanFields) {
    if (options.has(flag)) {
      patch[field] = parseBoolean(options.get(flag), flag)
    }
  }

  for (const [flag, field] of stringFields) {
    if (options.has(flag)) {
      patch[field] = String(options.get(flag))
    }
  }

  return patch
}

const handleBreakpoints = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)

  switch (command) {
    case "list":
      assertNoOptions(options, "breakpoints list")
      assertNoExtraPositionals(positionals, "breakpoints list")
      return apiRequest(context, "GET", "/api/debug/breakpoints")
    case "clear":
      assertNoOptions(options, "breakpoints clear")
      assertNoExtraPositionals(positionals, "breakpoints clear")
      return apiRequest(context, "DELETE", "/api/debug/breakpoints")
    case "create": {
      assertNoExtraPositionals(positionals, "breakpoints create")
      const body = collectBreakpointFields(options)
      if (!("address" in body)) {
        fail("breakpoints create requires --address")
      }
      return apiRequest(context, "POST", "/api/debug/breakpoints", { body })
    }
    case "update": {
      const breakpointId = positionals[0]
      if (!breakpointId) {
        fail("breakpoints update requires a breakpoint id or address")
      }
      const extra = positionals.slice(1)
      assertNoExtraPositionals(extra, "breakpoints update")
      const body = collectBreakpointFields(options)
      if (Object.keys(body).length === 0) {
        fail("breakpoints update requires at least one patch option")
      }
      return apiRequest(context, "PATCH", `/api/debug/breakpoints/${normalizeBreakpointId(breakpointId)}`, {
        body,
      })
    }
    case "delete":
    case "remove": {
      const breakpointId = positionals[0]
      if (!breakpointId) {
        fail(`breakpoints ${command} requires a breakpoint id or address`)
      }
      const extra = positionals.slice(1)
      assertNoExtraPositionals(extra, `breakpoints ${command}`)
      return apiRequest(context, "DELETE", `/api/debug/breakpoints/${normalizeBreakpointId(breakpointId)}`)
    }
    default:
      fail(`Unknown breakpoints command: ${command}`)
  }
}

const handleMemory = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `memory ${command}`)

  switch (command) {
    case "get":
      return apiRequest(context, "GET", "/api/debug/memory", {
        query: {
          start: parseRequiredNumber(String(requireOption(options, "start")), "start"),
          length: parseRequiredNumber(String(requireOption(options, "length")), "length"),
          format: options.has("format") ? String(options.get("format")) : "bytes",
        },
      })
    case "full":
      assertNoOptions(options, "memory full")
      return apiRequest(context, "GET", "/api/debug/memory/full")
    case "set": {
      const start = parseRequiredNumber(String(requireOption(options, "start")), "start")
      let data
      if (options.has("data")) {
        data = parseByteString(String(options.get("data")))
      } else {
        const bytes = []
        let index = 0
        while (options.has(`byte${index}`)) {
          bytes.push(parseByteValue(String(options.get(`byte${index}`))))
          index += 1
        }
        if (bytes.length === 0) {
          fail("memory set requires --data with bytes such as \"A9 00 8D\"")
        }
        data = bytes
      }
      return apiRequest(context, "PUT", "/api/debug/memory", { body: { start, data } })
    }
    default:
      fail(`Unknown memory command: ${command}`)
  }
}

const handleSoftSwitches = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `soft-switches ${command}`)

  switch (command) {
    case "get":
    case "list":
      assertNoOptions(options, `soft-switches ${command}`)
      return apiRequest(context, "GET", "/api/debug/soft-switches")
    case "set": {
      const rawAddresses = String(requireOption(options, "addresses"))
      const addresses = rawAddresses.split(/[,\s]+/).filter(Boolean).map((value) => parseRequiredNumber(value, "addresses"))
      if (addresses.length === 0) {
        fail("soft-switches set requires at least one address")
      }
      return apiRequest(context, "POST", "/api/debug/soft-switches", { body: { addresses } })
    }
    default:
      fail(`Unknown soft-switches command: ${command}`)
  }
}

const parseDriveId = (value) => {
  if (!["fd1", "fd2", "hd1", "hd2"].includes(value)) {
    fail(`drive id must be one of fd1, fd2, hd1, hd2. Received: ${value}`)
  }
  return value
}

const handleDrives = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)

  switch (command) {
    case "list":
      assertNoOptions(options, "drives list")
      assertNoExtraPositionals(positionals, "drives list")
      return apiRequest(context, "GET", "/api/drives")
    case "get": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoOptions(options, "drives get")
      assertNoExtraPositionals(positionals.slice(1), "drives get")
      return apiRequest(context, "GET", `/api/drives/${driveId}`)
    }
    case "protect": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives protect")
      const writeProtected = parseBoolean(requireOption(options, "write-protected"), "write-protected")
      return apiRequest(context, "PATCH", `/api/drives/${driveId}`, { body: { writeProtected } })
    }
    case "eject": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives eject")
      return apiRequest(context, "DELETE", `/api/drives/${driveId}`)
    }
    case "mount-file": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives mount-file")
      const filePath = String(requireOption(options, "file"))
      const fileData = await readFileBase64(filePath)
      const filename = options.has("filename") ? String(options.get("filename")) : fileData.filename
      return apiRequest(context, "POST", `/api/drives/${driveId}/mount`, {
        body: {
          sourceType: "base64",
          filename,
          dataBase64: fileData.dataBase64,
        },
      })
    }
    case "mount-url": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives mount-url")
      return apiRequest(context, "POST", `/api/drives/${driveId}/mount`, {
        body: {
          sourceType: "url",
          url: String(requireOption(options, "url")),
        },
      })
    }
    case "mount-library": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives mount-library")
      return apiRequest(context, "POST", `/api/drives/${driveId}/mount`, {
        body: {
          sourceType: "library-id",
          libraryId: String(requireOption(options, "library-id")),
        },
      })
    }
    case "mount-basic": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives mount-basic")
      let text = options.has("text") ? String(options.get("text")) : undefined
      if (!text && options.has("file")) {
        const fileContents = await readUtf8File(String(options.get("file")))
        text = fileContents.text
      }
      if (!text) {
        fail("drives mount-basic requires --text or --file")
      }
      const autoRun = options.has("auto-run") ? parseBoolean(options.get("auto-run"), "auto-run") : true
      return apiRequest(context, "POST", `/api/drives/${driveId}/mount`, {
        body: {
          sourceType: "basic-text",
          text,
          autoRun,
        },
      })
    }
    case "mount-block": {
      const driveId = parseDriveId(positionals[0] || "")
      assertNoExtraPositionals(positionals.slice(1), "drives mount-block")
      const fileData = await readFileBase64(String(requireOption(options, "file")))
      const address = parseRequiredNumber(String(requireOption(options, "address")), "address")
      const autoRun = options.has("auto-run") ? parseBoolean(options.get("auto-run"), "auto-run") : true
      return apiRequest(context, "POST", `/api/drives/${driveId}/mount`, {
        body: {
          sourceType: "binary-block",
          address,
          autoRun,
          dataBase64: fileData.dataBase64,
        },
      })
    }
    default:
      fail(`Unknown drives command: ${command}`)
  }
}

const handleInput = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `input ${command}`)

  switch (command) {
    case "key":
      return apiRequest(context, "POST", "/api/input/keys", {
        body: {
          type: "key",
          key: String(requireOption(options, "key")),
          release: options.has("release") ? parseBoolean(options.get("release"), "release") : true,
        },
      })
    case "key-code":
      return apiRequest(context, "POST", "/api/input/keys", {
        body: {
          type: "keyCode",
          keyCode: parseRequiredNumber(String(requireOption(options, "key-code")), "key-code"),
          release: options.has("release") ? parseBoolean(options.get("release"), "release") : true,
        },
      })
    case "text":
      return apiRequest(context, "POST", "/api/input/keys", {
        body: {
          type: "text",
          text: String(requireOption(options, "text")),
        },
      })
    case "apple":
      return apiRequest(context, "POST", "/api/input/apple-keys", {
        body: {
          side: String(requireOption(options, "side")),
          pressed: parseBoolean(requireOption(options, "pressed"), "pressed"),
        },
      })
    case "mouse":
      return apiRequest(context, "POST", "/api/input/mouse", {
        body: {
          x: parseRequiredNumber(String(requireOption(options, "x")), "x"),
          y: parseRequiredNumber(String(requireOption(options, "y")), "y"),
          buttons: parseRequiredNumber(String(requireOption(options, "buttons")), "buttons"),
        },
      })
    default:
      fail(`Unknown input command: ${command}`)
  }
}

const handleSnapshots = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals.slice(command === "activate" ? 1 : 0), `snapshots ${command}`)

  switch (command) {
    case "list":
      assertNoOptions(options, "snapshots list")
      return apiRequest(context, "GET", "/api/debug/snapshots")
    case "create":
      assertNoOptions(options, "snapshots create")
      return apiRequest(context, "POST", "/api/debug/snapshots")
    case "activate": {
      assertNoOptions(options, "snapshots activate")
      const snapshotId = positionals[0]
      if (!snapshotId) {
        fail("snapshots activate requires a snapshot id")
      }
      return apiRequest(context, "POST", `/api/debug/snapshots/${encodeURIComponent(snapshotId)}/activate`)
    }
    case "step-back":
      assertNoOptions(options, "snapshots step-back")
      return apiRequest(context, "POST", "/api/debug/snapshots/step-back")
    case "step-forward":
      assertNoOptions(options, "snapshots step-forward")
      return apiRequest(context, "POST", "/api/debug/snapshots/step-forward")
    default:
      fail(`Unknown snapshots command: ${command}`)
  }
}

const handleSaveState = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)
  assertNoExtraPositionals(positionals, `save-state ${command}`)

  switch (command) {
    case "export": {
      const result = await apiRequest(context, "POST", "/api/save-states/export", {
        body: {
          includeSnapshots: options.has("include-snapshots")
            ? parseBoolean(options.get("include-snapshots"), "include-snapshots")
            : false,
        },
      })

      const outputPath = options.has("output") ? String(options.get("output")) : result.filename
      const savedPath = await writeBase64File(outputPath, result.dataBase64)
      return {
        filename: result.filename,
        mimeType: result.mimeType,
        outputPath: savedPath,
      }
    }
    case "import": {
      const fileData = await readFileBase64(String(requireOption(options, "file")))
      return apiRequest(context, "POST", "/api/save-states/import", {
        body: {
          dataBase64: fileData.dataBase64,
        },
      })
    }
    default:
      fail(`Unknown save-state command: ${command}`)
  }
}

const parseGlobalArgs = (argv) => {
  const context = {
    server: DEFAULT_SERVER,
    output: DEFAULT_OUTPUT,
  }

  const remaining = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (token === "--server") {
      index += 1
      if (index >= argv.length) {
        fail("--server requires a URL value")
      }
      context.server = argv[index]
      continue
    }
    if (token.startsWith("--server=")) {
      context.server = token.slice("--server=".length)
      continue
    }
    if (token === "--json") {
      context.output = "json"
      continue
    }
    if (token === "--pretty") {
      context.output = "pretty"
      continue
    }
    if (token === "--help" || token === "-h") {
      context.help = true
      continue
    }
    remaining.push(token)
  }

  return { context, remaining }
}

const dispatch = async (context, group, command, tokens) => {
  switch (group) {
    case "machine":
      return handleMachine(context, command, tokens)
    case "cpu":
      return handleCpu(context, command, tokens)
    case "debug":
      return handleDebug(context, command, tokens)
    case "breakpoints":
      return handleBreakpoints(context, command, tokens)
    case "memory":
      return handleMemory(context, command, tokens)
    case "soft-switches":
      return handleSoftSwitches(context, command, tokens)
    case "drives":
      return handleDrives(context, command, tokens)
    case "input":
      return handleInput(context, command, tokens)
    case "snapshots":
      return handleSnapshots(context, command, tokens)
    case "save-state":
      return handleSaveState(context, command, tokens)
    default:
      fail(`Unknown command group: ${group}`)
  }
}

const main = async () => {
  const { context, remaining } = parseGlobalArgs(process.argv.slice(2))

  if (context.help || remaining.length === 0) {
    printHelp()
    process.exit(0)
  }

  const [group, command, ...tokens] = remaining
  if (!command) {
    fail("A command is required. Use --help to see available commands.")
  }

  const result = await dispatch(context, group, command, tokens)
  await outputResult(context, result)
}

try {
  await main()
} catch (error) {
  fail(error instanceof Error ? error.message : String(error))
}
