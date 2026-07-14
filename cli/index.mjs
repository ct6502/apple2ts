#!/usr/bin/env node

import { Buffer } from "node:buffer"
import { createHash, randomUUID } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import path from "node:path"
import {
  buildRunnerPayload,
  closePersistentSession,
  ensureAutomationMarkers,
  launchPersistentSession,
  resolveAutoPackagedExe,
  resolveFfmpegExe,
  resolveProfileDefaults,
  runScenarioInPersistentSession,
  writeRunnerPayload,
} from "./electron-hdv-runner.mjs"

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
  export                 Export-focused automation commands
  batch                  Batch runner for large-scale disk testing

Examples:
  npm run cli -- machine get
  npm run cli -- machine set --speed-mode 3 --debug-enabled true
  npm run cli -- cpu set --pc 0x300 --a 0x41 --flag-z true
  npm run cli -- breakpoints create --address 0xC000 --instruction true --halt true
  npm run cli -- memory get --start 0x300 --length 32 --format hex
  npm run cli -- drives mount-file fd1 --file public/disks/blank.po
  npm run cli -- input text --text "PRINT CHR$(4);\\"CATALOG\\""
  npm run cli -- save-state export --output session.a2ts
  npm run cli -- export hdv-batch --input-dir disks --output-dir artifacts --shards 8 --shard-index 0
  npm run cli -- batch run --input disks.txt --output results.jsonl --shards 8 --shard-index 0
  npm run cli -- export hdv-batch --input-dir disks --output-dir artifacts --runner-preset electron-hdv-packaged-auto --runner-app-dir C:/git/apple2ts-app
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

const sha256Hex = (bytes) => createHash("sha256").update(bytes).digest("hex")

const DISK_FILE_EXTENSIONS = new Set([
  ".po",
  ".woz",
  ".hdv",
  ".2mg",
  ".dsk",
  ".do",
  ".nib",
  ".img",
])

const normalizePathForHash = (value) => value.replace(/\\/g, "/").toLowerCase()

const computeShardForValue = (value, shards) => {
  const digest = createHash("sha1").update(value).digest()
  const bucket = digest.readUInt32BE(0)
  return bucket % shards
}

const ensureParentDirectory = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

const looksLike2Img = (bytes) => {
  if (bytes.length < 64) {
    return false
  }
  return bytes[0] === 0x32 && bytes[1] === 0x49 && bytes[2] === 0x4D && bytes[3] === 0x47
}

const getCanonicalDiskBytes = (filename, bytes) => {
  const extension = path.extname(filename).toLowerCase()
  if (extension === ".2mg" && looksLike2Img(bytes)) {
    return {
      bytes: bytes.subarray(64),
      canonicalization: "strip-2img-header",
    }
  }

  return {
    bytes,
    canonicalization: "none",
  }
}

const loadDiskListFromFile = async (inputPath) => {
  const raw = await fs.readFile(inputPath, "utf8")
  const lower = inputPath.toLowerCase()
  if (lower.endsWith(".json")) {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      fail("batch input JSON must be an array of disk paths")
    }
    return parsed.map((value) => {
      if (typeof value === "string") return value
      if (value && typeof value === "object" && typeof value.path === "string") return value.path
      fail("batch input JSON entries must be strings or objects with a 'path' string")
    })
  }

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"))
}

const loadDiskListFromDirectory = async (inputDir) => {
  const stat = await fs.stat(inputDir).catch(() => null)
  if (!stat || !stat.isDirectory()) {
    fail(`input directory not found or not a directory: ${inputDir}`)
  }

  const files = []
  const visit = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        await visit(fullPath)
        continue
      }
      if (!entry.isFile()) {
        continue
      }
      const extension = path.extname(entry.name).toLowerCase()
      if (DISK_FILE_EXTENSIONS.has(extension)) {
        files.push(fullPath)
      }
    }
  }

  await visit(inputDir)
  files.sort((left, right) => left.localeCompare(right))
  return files
}

const getAliasedOptionValue = (options, names) => {
  for (const name of names) {
    if (options.has(name)) {
      return options.get(name)
    }
  }
  return undefined
}

const hasAnyOption = (options, names) => names.some((name) => options.has(name))

const applyTemplate = (template, variables) => {
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(variables, name) ? String(variables[name]) : ""
  })
}

const runShellCommand = async (command, timeoutMs) => {
  return new Promise((resolve) => {
    const isWindows = process.platform === "win32"
    const shell = isWindows ? "powershell.exe" : "sh"
    const args = isWindows
      ? ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", command]
      : ["-lc", command]
    const child = spawn(shell, args, { stdio: ["ignore", "pipe", "pipe"] })

    let stdout = ""
    let stderr = ""
    let finished = false
    let timedOut = false

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString("utf8")
    })

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString("utf8")
    })

    const timeout = setTimeout(() => {
      timedOut = true
      child.kill("SIGKILL")
    }, timeoutMs)

    child.on("close", (exitCode, signal) => {
      if (finished) return
      finished = true
      clearTimeout(timeout)
      resolve({
        exitCode,
        signal,
        timedOut,
        stdout,
        stderr,
      })
    })
  })
}

const waitForServerHealth = async (serverUrl, timeoutMs = 30000) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${serverUrl.replace(/\/+$/, "")}/api/health`)
      if (response.ok) {
        return true
      }
    } catch {
      // Keep polling until timeout.
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }
  return false
}

const stopManagedProcessTree = async (proc) => {
  if (!proc || proc.exitCode !== null) return

  if (process.platform === "win32") {
    await new Promise((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(proc.pid), "/t", "/f"], {
        windowsHide: true,
        stdio: ["ignore", "ignore", "ignore"],
      })
      killer.once("close", () => resolve())
      killer.once("error", () => resolve())
    })
    return
  }

  try {
    process.kill(proc.pid, "SIGTERM")
  } catch {
    return
  }
}

const startLocalControlServerIfNeeded = async (serverUrl) => {
  if (await waitForServerHealth(serverUrl, 1000)) {
    return {
      proc: null,
      managed: false,
    }
  }

  const serverProc = spawn(process.execPath, [path.resolve(process.cwd(), "server", "server.mjs")], {
    cwd: process.cwd(),
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  })

  const ready = await waitForServerHealth(serverUrl, 30000)
  if (!ready) {
    await stopManagedProcessTree(serverProc)
    fail(`Persistent Electron reuse could not start the local control server at ${serverUrl}`)
  }

  return {
    proc: serverProc,
    managed: true,
  }
}

const validateRunnerContractName = (value) => {
  if (value === "none" || value === "electron-hdv-v1") {
    return value
  }
  fail("--runner-contract must be one of: none, electron-hdv-v1")
}

const validateRunnerPresetName = (value) => {
  if (
    value === "none" ||
    value === "electron-hdv-dev" ||
    value === "electron-hdv-packaged" ||
    value === "electron-hdv-packaged-auto"
  ) {
    return value
  }
  fail(
    "--runner-preset must be one of: none, electron-hdv-dev, electron-hdv-packaged, electron-hdv-packaged-auto",
  )
}

const escapeDoubleQuoted = (value) => String(value).replaceAll('"', '\\"')

const buildHdvGenerationCommand = ({ diskPath, exportedHdvPath, diskName }) => {
  return [
    "node --import tsx cli/generate-hdv.mts",
    `--input \"${escapeDoubleQuoted(diskPath)}\"`,
    `--output \"${escapeDoubleQuoted(exportedHdvPath)}\"`,
    `--name \"${escapeDoubleQuoted(diskName)}\"`,
    '--volume "APPLE2TS"',
  ].join(" ")
}

const buildVtocExportabilityCommand = ({ diskPath }) => {
  return [
    "node --import tsx cli/check-vtoc-exportable.mts",
    `--input \"${escapeDoubleQuoted(diskPath)}\"`,
  ].join(" ")
}

const buildRunnerCommandFromPreset = (preset, { runnerAppDir, runnerAppExe, concurrency, captureVideo, headless }) => {
  const base = [
    "node cli/electron-hdv-runner.mjs",
    '--disk "{diskPath}"',
    '--result "{resultPath}"',
    '--video "{videoPath}"',
    '--log "{logPath}"',
    '--run-id "{runId}"',
    '--attempt {attempt}',
    '--raw-sha256 "{rawSha256}"',
    '--canonical-sha256 "{canonicalSha256}"',
    '--exported-hdv "{exportedHdvPath}"',
    '--capture-video {captureVideo}',
    '--headless {headless}',
    '--screen-text-marker "{launchMarker}"',
    '--require-exported-hdv true',
    '--menu-enter false',
    '--app-ready-timeout-ms 12000',
    '--disk-ready-timeout-ms 12000',
    '--control-api-ready-timeout-ms 5000',
  ]

  const appendProfile = (profileName) => {
    base.push(`--profile ${profileName}`)
    if (runnerAppDir) {
      base.push(`--app-dir "${escapeDoubleQuoted(runnerAppDir)}"`)
    }
  }

  switch (preset) {
    case "electron-hdv-dev":
      appendProfile("apple2ts-app-dev")
      break
    case "electron-hdv-packaged":
      appendProfile("apple2ts-app-packaged")
      if (!runnerAppExe) {
        fail("--runner-app-exe is required when --runner-preset=electron-hdv-packaged")
      }
      base.push(`--app-exe "${escapeDoubleQuoted(runnerAppExe)}"`)
      break
    case "electron-hdv-packaged-auto":
      appendProfile("apple2ts-app-packaged-auto")
      break
    default:
      fail(`Unsupported runner preset '${preset}'`)
  }

  if (Number(concurrency) > 1) {
    // Native key injection can target the wrong window when parallel workers run.
    base.push("--menu-enter-native-fallback false")
  }

  return base.join(" ")
}

const getRunnerProfileFromPreset = (preset) => {
  switch (preset) {
    case "electron-hdv-dev":
      return "apple2ts-app-dev"
    case "electron-hdv-packaged":
      return "apple2ts-app-packaged"
    case "electron-hdv-packaged-auto":
      return "apple2ts-app-packaged-auto"
    default:
      return "none"
  }
}

const shouldReuseElectronAppByDefault = ({ runnerContract, runnerPreset, concurrency }) => {
  return runnerContract === "electron-hdv-v1" && runnerPreset !== "none" && Number(concurrency) === 1
}

const createPersistentSessionContext = async ({
  runnerPreset,
  runnerAppDir,
  runnerAppExe,
  runId,
  serverUrl,
  headless,
}) => {
  const localControlServer = await startLocalControlServerIfNeeded(serverUrl)
  const profileName = getRunnerProfileFromPreset(runnerPreset)
  if (profileName === "none") {
    fail("Persistent Electron reuse requires a built-in Electron runner preset")
  }

  const defaultAppDir = runnerAppDir || path.resolve(process.cwd(), "..", "apple2ts-app")
  const profileDefaults = resolveProfileDefaults(profileName, defaultAppDir)
  const appDir = path.resolve(runnerAppDir || profileDefaults.appDir)

  let appExe = runnerAppExe || profileDefaults.appExe
  if (!appExe && profileDefaults.profile === "apple2ts-app-packaged-auto") {
    appExe = await resolveAutoPackagedExe(appDir)
    if (!appExe) {
      fail(`Could not auto-detect packaged app executable under ${appDir}. Use --runner-app-exe or build a packaged app first.`)
    }
  }

  const appDirStat = await fs.stat(appDir).catch(() => null)
  if (!appDirStat || !appDirStat.isDirectory()) {
    fail(`--runner-app-dir must point to a directory: ${appDir}`)
  }

  if (profileDefaults.appCommand.includes("{appExe}")) {
    if (!appExe) {
      fail("Persistent Electron reuse requires an app executable for this preset")
    }
    const appExePath = path.resolve(appExe)
    const appExeStat = await fs.stat(appExePath).catch(() => null)
    if (!appExeStat && !String(appExePath).toLowerCase().endsWith(".app")) {
      fail(`--runner-app-exe does not exist: ${appExePath}`)
    }
    appExe = appExePath
  }

  const automationCheck = await ensureAutomationMarkers({
    enabled: profileDefaults.profile === "apple2ts-app-dev",
    projectDir: process.cwd(),
    distDir: path.resolve(process.cwd(), "dist"),
    markers: [
      "machine-text-sample",
      "machine-text-fatal",
      "launch-key-attempt",
      "launch-before-",
      "automation-instrumentation-version",
    ],
    buildCommand: "npm run build",
    buildTimeoutMs: 180000,
  })
  if (!automationCheck.ok) {
    const detail = automationCheck.details ? `\n${automationCheck.details}` : ""
    fail(`Automation instrumentation check failed: ${automationCheck.message}${detail}`)
  }

  const ffmpegExe = await resolveFfmpegExe("")
  const session = await launchPersistentSession({
    runId,
    appDir,
    appCommand: profileDefaults.appCommand,
    appExe,
    serverUrl,
    headless,
    appReadyTimeoutMs: 90000,
    controlApiReadyTimeoutMs: 90000,
    controlApiPollMs: 250,
    controlApiRequestTimeoutMs: 2000,
  })

  return {
    session,
    localControlServer,
    ffmpegExe,
    profile: profileDefaults.profile,
    options: {
      captureSeconds: 15,
      recorderCommand: profileDefaults.recorderCommand,
      recorderStartDelayMs: 0,
      diskReadyTimeoutMs: 12000,
      windowTitle: "Apple2TS",
      menuEnterEnabled: false,
      menuEnterCount: 1,
      menuEnterDelayMs: 800,
      menuEnterIntervalMs: 150,
      menuEnterTimeoutMs: 3000,
      menuEnterNativeFallback: false,
      menuEnterNativeWindowTitle: "Apple2TS",
      menuEnterNativeTimeoutMs: 5000,
      menuEnterRetryCount: 2,
      menuEnterRetryDelayMs: 1500,
      controlApiReadyTimeoutMs: 5000,
      controlApiPollMs: 250,
      controlApiRequestTimeoutMs: 2000,
      waitForScreenTextEnabled: true,
      screenTextTimeoutMs: 15000,
      screenTextPrewaitMs: 1500,
      screenTextPollMs: 250,
      screenTextRequestTimeoutMs: 2000,
    },
  }
}

const inferDefaultRunnerContract = ({ runnerPreset, runnerCommandTemplate }) => {
  if (runnerPreset !== "none") {
    return "electron-hdv-v1"
  }

  if (typeof runnerCommandTemplate === "string" && /(^|\s)node\s+cli\/electron-hdv-runner\.mjs(\s|$)/.test(runnerCommandTemplate)) {
    return "electron-hdv-v1"
  }

  return "none"
}

const validateElectronHdvRunnerPayload = (payload) => {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return "payload must be an object"
  }
  if (payload.contractVersion !== 1) {
    return "contractVersion must be 1"
  }
  if (payload.scenario !== "export-hdv-launch-test") {
    return "scenario must be 'export-hdv-launch-test'"
  }

  const status = payload.status
  if (!status || typeof status !== "object" || Array.isArray(status)) {
    return "status must be an object"
  }
  if (typeof status.exportOk !== "boolean") {
    return "status.exportOk must be a boolean"
  }
  if (typeof status.launchOk !== "boolean") {
    return "status.launchOk must be a boolean"
  }

  const timing = payload.timing
  if (!timing || typeof timing !== "object" || Array.isArray(timing)) {
    return "timing must be an object"
  }
  if (!Number.isFinite(Number(timing.captureSeconds))) {
    return "timing.captureSeconds must be a number"
  }
  if (!Number.isFinite(Number(timing.elapsedMs))) {
    return "timing.elapsedMs must be a number"
  }

  const artifacts = payload.artifacts
  if (!artifacts || typeof artifacts !== "object" || Array.isArray(artifacts)) {
    return "artifacts must be an object"
  }
  if (typeof artifacts.videoPath !== "string" || artifacts.videoPath.length === 0) {
    return "artifacts.videoPath must be a non-empty string"
  }

  const telemetry = payload.telemetry
  if (telemetry !== undefined && (typeof telemetry !== "object" || telemetry === null || Array.isArray(telemetry))) {
    return "telemetry must be an object"
  }

  const observationWindow = telemetry?.observationWindow
  if (observationWindow !== undefined) {
    if (typeof observationWindow !== "object" || observationWindow === null || Array.isArray(observationWindow)) {
      return "telemetry.observationWindow must be an object"
    }
    if (typeof observationWindow.expected !== "boolean") {
      return "telemetry.observationWindow.expected must be a boolean"
    }
    if (typeof observationWindow.mode !== "string" || observationWindow.mode.length === 0) {
      return "telemetry.observationWindow.mode must be a non-empty string"
    }
    if (typeof observationWindow.fastWindowArmed !== "boolean") {
      return "telemetry.observationWindow.fastWindowArmed must be a boolean"
    }
    if (observationWindow.expected) {
      if (!Number.isFinite(Number(observationWindow.startedAtMs))) {
        return "telemetry.observationWindow.startedAtMs must be a number when expected"
      }
      if (!Number.isFinite(Number(observationWindow.endedAtMs))) {
        return "telemetry.observationWindow.endedAtMs must be a number when expected"
      }
      if (!Number.isFinite(Number(observationWindow.durationMs))) {
        return "telemetry.observationWindow.durationMs must be a number when expected"
      }
      if (Number(observationWindow.durationMs) < 0) {
        return "telemetry.observationWindow.durationMs must be >= 0"
      }
    }
  }

  if (status.launchOk && observationWindow?.expected && Number(observationWindow.durationMs) <= 0) {
    return "telemetry.observationWindow.durationMs must be > 0 for successful launches"
  }

  return null
}

const validateRunnerPayloadAgainstContract = (payload, contractName) => {
  if (contractName === "none") {
    return null
  }
  if (contractName === "electron-hdv-v1") {
    return validateElectronHdvRunnerPayload(payload)
  }
  return `Unknown runner contract '${contractName}'`
}

const handleBatch = async (context, command, tokens) => {
  const { options, positionals } = parseOptionTokens(tokens)

  if (command !== "run") {
    fail(`Unknown batch command: ${command}`)
  }
  assertNoExtraPositionals(positionals, "batch run")

  const hasInputPath = options.has("input")
  const hasInputDir = options.has("input-dir")
  if (hasInputPath && hasInputDir) {
    fail("Use either --input or --input-dir, not both")
  }
  if (!hasInputPath && !hasInputDir) {
    fail("Missing required option --input (or --input-dir)")
  }
  const inputPath = hasInputPath ? path.resolve(process.cwd(), String(requireOption(options, "input"))) : null
  const inputDir = hasInputDir ? path.resolve(process.cwd(), String(requireOption(options, "input-dir"))) : null
  const outputPath = path.resolve(process.cwd(), String(requireOption(options, "output")))
  const corpusRoot = options.has("root") ? path.resolve(process.cwd(), String(options.get("root"))) : process.cwd()
  const shards = options.has("shards") ? parseRequiredNumber(String(options.get("shards")), "shards") : 1
  const shardIndex = options.has("shard-index")
    ? parseRequiredNumber(String(options.get("shard-index")), "shard-index")
    : null
  const concurrency = options.has("concurrency")
    ? parseRequiredNumber(String(options.get("concurrency")), "concurrency")
    : 1
  const retries = options.has("retries")
    ? parseRequiredNumber(String(options.get("retries")), "retries")
    : 0
  const captureVideo = options.has("capture-video")
    ? parseBoolean(options.get("capture-video"), "capture-video")
    : true
  const headless = options.has("headless")
    ? parseBoolean(options.get("headless"), "headless")
    : false
  const runnerTimeoutMs = options.has("runner-timeout-ms")
    ? parseRequiredNumber(String(options.get("runner-timeout-ms")), "runner-timeout-ms")
    : 10000
  const hdvGenerateTimeoutMs = options.has("hdv-generate-timeout-ms")
    ? parseRequiredNumber(String(options.get("hdv-generate-timeout-ms")), "hdv-generate-timeout-ms")
    : 120000
  const runnerPreset = validateRunnerPresetName(
    options.has("runner-preset") ? String(options.get("runner-preset")) : "none",
  )
  const hasRunnerCommand = options.has("runner-command")
  if (hasRunnerCommand && runnerPreset !== "none") {
    fail("Use either --runner-command or --runner-preset, not both")
  }

  if (!hasRunnerCommand && runnerPreset === "none") {
    fail("Either --runner-command or --runner-preset is required")
  }

  const runnerAppDir = options.has("runner-app-dir")
    ? path.resolve(process.cwd(), String(options.get("runner-app-dir")))
    : ""
  const runnerAppExe = options.has("runner-app-exe")
    ? path.resolve(process.cwd(), String(options.get("runner-app-exe")))
    : ""

  const runnerCommandTemplate = hasRunnerCommand
    ? String(requireOption(options, "runner-command"))
    : buildRunnerCommandFromPreset(runnerPreset, { runnerAppDir, runnerAppExe, concurrency, captureVideo, headless })
  const defaultRunnerContract = inferDefaultRunnerContract({
    runnerPreset,
    runnerCommandTemplate,
  })

  const runnerContract = validateRunnerContractName(
    options.has("runner-contract")
      ? String(options.get("runner-contract"))
      : defaultRunnerContract,
  )
  const reuseApp = options.has("reuse-app")
    ? parseBoolean(options.get("reuse-app"), "reuse-app")
    : shouldReuseElectronAppByDefault({ runnerContract, runnerPreset, concurrency })
  const runnerResultsDir = options.has("runner-results-dir")
    ? path.resolve(process.cwd(), String(options.get("runner-results-dir")))
    : path.resolve(process.cwd(), ".apple2ts-batch", "runner-results")
  const exportedHdvDir = options.has("exported-hdv-dir")
    ? path.resolve(process.cwd(), String(options.get("exported-hdv-dir")))
    : null
  const videoDir = options.has("video-dir")
    ? path.resolve(process.cwd(), String(options.get("video-dir")))
    : null
  const logDir = options.has("log-dir")
    ? path.resolve(process.cwd(), String(options.get("log-dir")))
    : null
  const append = options.has("append") ? parseBoolean(options.get("append"), "append") : false
  const runId = options.has("run-id") ? String(options.get("run-id")) : randomUUID()
  const launchMarker = `RUN${runId.replace(/[^A-Za-z0-9]/g, "").slice(0, 8).toUpperCase() || "MARK"}`

  if (shards < 1) {
    fail("--shards must be at least 1")
  }
  if (shardIndex !== null && (shardIndex < 0 || shardIndex >= shards)) {
    fail("--shard-index must be between 0 and shards-1")
  }
  if (concurrency < 1) {
    fail("--concurrency must be at least 1")
  }
  if (retries < 0) {
    fail("--retries must be >= 0")
  }
  if (reuseApp && concurrency !== 1) {
    fail("--reuse-app currently requires --concurrency 1")
  }
  if (reuseApp && runnerPreset === "none") {
    fail("--reuse-app currently requires a built-in Electron runner preset")
  }

  const diskPaths = inputDir ? await loadDiskListFromDirectory(inputDir) : await loadDiskListFromFile(inputPath)
  if (inputDir && diskPaths.length === 0) {
    fail(`No supported disk images found under input directory: ${inputDir}`)
  }
  const resolvedDisks = diskPaths.map((diskPath) => {
    if (path.isAbsolute(diskPath)) {
      return path.normalize(diskPath)
    }
    return path.resolve(corpusRoot, diskPath)
  })

  const shardedDisks = resolvedDisks.filter((diskPath) => {
    if (shardIndex === null) return true
    const shard = computeShardForValue(normalizePathForHash(diskPath), shards)
    return shard === shardIndex
  })

  await ensureParentDirectory(outputPath)
  await fs.mkdir(runnerResultsDir, { recursive: true })
  if (videoDir) await fs.mkdir(videoDir, { recursive: true })
  if (logDir) await fs.mkdir(logDir, { recursive: true })
  if (exportedHdvDir) await fs.mkdir(exportedHdvDir, { recursive: true })
  if (!append) {
    await fs.writeFile(outputPath, "")
  }

  let writeQueue = Promise.resolve()
  const appendRecord = async (record) => {
    writeQueue = writeQueue.then(() => fs.appendFile(outputPath, `${JSON.stringify(record)}\n`))
    return writeQueue
  }

  const processDisk = async (diskPath) => {
    const filename = path.basename(diskPath)
    let rawBytes

    try {
      rawBytes = await fs.readFile(diskPath)
    } catch (error) {
      return {
        schemaVersion: 1,
        runId,
        createdAt: new Date().toISOString(),
        disk: {
          path: diskPath,
          filename,
          sizeBytes: 0,
          rawSha256: "0".repeat(64),
          canonicalSha256: "0".repeat(64),
          canonicalization: "none",
        },
        attempt: {
          index: 1,
          max: retries + 1,
          retryable: false,
        },
        status: {
          ok: false,
          code: error && error.code === "ENOENT" ? "input_not_found" : "input_read_error",
          message: error instanceof Error ? error.message : String(error),
        },
        timing: {
          elapsedMs: 0,
        },
      }
    }

    const canonical = getCanonicalDiskBytes(filename, rawBytes)
    const rawSha256 = sha256Hex(rawBytes)
    const canonicalSha256 = sha256Hex(canonical.bytes)
    const diskId = `${canonicalSha256.slice(0, 12)}-${filename.replace(/[^A-Za-z0-9._-]/g, "_")}`
    const maxAttempts = retries + 1
    let lastRecord = null

    if (exportedHdvDir && runnerContract === "electron-hdv-v1") {
      const vtocCheckCommand = buildVtocExportabilityCommand({ diskPath })
      const vtocCheck = await runShellCommand(vtocCheckCommand, Math.min(hdvGenerateTimeoutMs, 60000))

      if (vtocCheck.timedOut || vtocCheck.exitCode !== 0) {
        return {
          schemaVersion: 1,
          runId,
          createdAt: new Date().toISOString(),
          disk: {
            path: diskPath,
            filename,
            sizeBytes: rawBytes.length,
            rawSha256,
            canonicalSha256,
            canonicalization: canonical.canonicalization,
          },
          attempt: {
            index: 1,
            max: maxAttempts,
            retryable: false,
          },
          status: {
            ok: false,
            code: vtocCheck.timedOut ? "vtoc_check_timeout" : "vtoc_check_failed",
            message: vtocCheck.timedOut
              ? "VTOC exportability check timed out"
              : `VTOC exportability check failed with code ${vtocCheck.exitCode}`,
          },
          timing: {
            elapsedMs: 0,
          },
        }
      }

      try {
        const vtocPayload = JSON.parse(vtocCheck.stdout || "{}")
        const vtocType = String(vtocPayload.vtocType || "unknown")
        const exportable = Boolean(vtocPayload.exportable)
        if (!exportable && vtocType !== "dosup") {
          return {
            schemaVersion: 1,
            runId,
            createdAt: new Date().toISOString(),
            disk: {
              path: diskPath,
              filename,
              sizeBytes: rawBytes.length,
              rawSha256,
              canonicalSha256,
              canonicalization: canonical.canonicalization,
            },
            attempt: {
              index: 1,
              max: maxAttempts,
              retryable: false,
            },
            status: {
              ok: false,
              code: "disk_not_exportable",
              message: `Disk was skipped because VTOC check marked it non-exportable (${vtocType}).`,
            },
            timing: {
              elapsedMs: 0,
            },
            exportability: {
              vtocType,
            },
          }
        }
      } catch (error) {
        return {
          schemaVersion: 1,
          runId,
          createdAt: new Date().toISOString(),
          disk: {
            path: diskPath,
            filename,
            sizeBytes: rawBytes.length,
            rawSha256,
            canonicalSha256,
            canonicalization: canonical.canonicalization,
          },
          attempt: {
            index: 1,
            max: maxAttempts,
            retryable: false,
          },
          status: {
            ok: false,
            code: "vtoc_check_invalid",
            message: error instanceof Error ? error.message : String(error),
          },
          timing: {
            elapsedMs: 0,
          },
        }
      }
    }

    for (let attemptIndex = 1; attemptIndex <= maxAttempts; attemptIndex += 1) {
      const startedAt = Date.now()
      const runnerResultPath = path.join(runnerResultsDir, `${diskId}.attempt${attemptIndex}.json`)
      const videoPath = videoDir ? path.join(videoDir, `${diskId}.attempt${attemptIndex}.mp4`) : ""
      const logPath = logDir ? path.join(logDir, `${diskId}.attempt${attemptIndex}.log`) : ""
      const exportedHdvPath = exportedHdvDir ? path.join(exportedHdvDir, `${diskId}.hdv`) : ""
      const launchTitle = `${launchMarker}-${filename.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9]/g, "").slice(0, 20)}`

      let hdvGeneration = { exitCode: 0, signal: null, timedOut: false, stdout: "", stderr: "", command: "" }
      if (exportedHdvPath && runnerContract === "electron-hdv-v1") {
        const generationCommand = buildHdvGenerationCommand({
          diskPath,
          exportedHdvPath,
          diskName: launchTitle,
        })
        hdvGeneration = await runShellCommand(generationCommand, hdvGenerateTimeoutMs)
        if (hdvGeneration.timedOut || hdvGeneration.exitCode !== 0) {
          const failureRecord = {
            schemaVersion: 1,
            runId,
            createdAt: new Date().toISOString(),
            disk: {
              path: diskPath,
              filename,
              sizeBytes: rawBytes.length,
              rawSha256,
              canonicalSha256,
              canonicalization: canonical.canonicalization,
            },
            attempt: {
              index: attemptIndex,
              max: maxAttempts,
              retryable: attemptIndex < maxAttempts,
            },
            timing: {
              elapsedMs: Date.now() - startedAt,
            },
            artifacts: {
              runnerResultPath,
              videoPath: videoPath || undefined,
              logPath: logPath || undefined,
              exportedHdvPath,
            },
            status: {
              ok: false,
              code: hdvGeneration.timedOut ? "export_hdv_generation_timeout" : "export_hdv_generation_failed",
              message: hdvGeneration.timedOut
                ? `HDV generation timed out after ${hdvGenerateTimeoutMs} ms`
                : `HDV generation failed with code ${hdvGeneration.exitCode}`,
            },
            generation: {
              exitCode: hdvGeneration.exitCode,
              signal: hdvGeneration.signal,
              command: generationCommand,
            },
          }

          if (logPath) {
            const combined = [hdvGeneration.stdout, hdvGeneration.stderr].filter(Boolean).join("\n")
            await fs.writeFile(logPath, combined)
          }

          lastRecord = failureRecord
          await appendRecord(failureRecord)
          continue
        }
      }

      const diskTitleMarker = filename.replace(/\.[^.]+$/, "").replace(/[^A-Za-z0-9]/g, "").slice(0, 20)
      const combinedScreenMarker = [launchMarker, diskTitleMarker].filter(Boolean).join("|")

      const templatedCommand = applyTemplate(runnerCommandTemplate, {
        diskPath,
        resultPath: runnerResultPath,
        videoPath,
        logPath,
        exportedHdvPath,
        captureVideo,
        headless,
        launchMarker: combinedScreenMarker,
        attempt: attemptIndex,
        runId,
        rawSha256,
        canonicalSha256,
      })
      const command = `${templatedCommand} --capture-video ${captureVideo} --headless ${headless}`

      const baseRecord = {
        schemaVersion: 1,
        runId,
        createdAt: new Date().toISOString(),
        disk: {
          path: diskPath,
          filename,
          sizeBytes: rawBytes.length,
          rawSha256,
          canonicalSha256,
          canonicalization: canonical.canonicalization,
        },
        attempt: {
          index: attemptIndex,
          max: maxAttempts,
          retryable: false,
        },
        timing: {
          elapsedMs: Date.now() - startedAt,
        },
        artifacts: {
          runnerResultPath,
          videoPath: videoPath || undefined,
          logPath: logPath || undefined,
        },
        runner: reuseApp
          ? {
            exitCode: 0,
            signal: null,
            command: `[persistent-session] ${runnerPreset}`,
          }
          : {
            exitCode: 0,
            signal: null,
            command,
          },
      }

      if (persistentSessionContext) {
        try {
          const scenarioStartedAt = Date.now()
          const scenario = await runScenarioInPersistentSession(persistentSessionContext.session, {
            diskPath,
            runId,
            attempt: attemptIndex,
            videoPath,
            logPath,
            exportedHdvPath,
            requireExportedHdv: true,
            captureVideo,
            headless,
            screenTextMarker: combinedScreenMarker,
            ffmpegExe: persistentSessionContext.ffmpegExe,
            ...persistentSessionContext.options,
          })
          const payload = buildRunnerPayload({
            scenario,
            captureSeconds: persistentSessionContext.options.captureSeconds,
            elapsedMs: Date.now() - scenarioStartedAt,
            providedRawSha256: rawSha256,
            providedCanonicalSha256: canonicalSha256,
            runId,
            attempt: attemptIndex,
            profile: persistentSessionContext.profile,
            videoPath,
            logPath,
          })
          await writeRunnerPayload(runnerResultPath, payload)
          const contractError = validateRunnerPayloadAgainstContract(payload, runnerContract)
          if (contractError) {
            lastRecord = {
              ...baseRecord,
              attempt: {
                ...baseRecord.attempt,
                retryable: false,
              },
              status: {
                ok: false,
                code: "runner_result_invalid",
                message: `Runner contract validation failed: ${contractError}`,
              },
            }
          } else {
            lastRecord = {
              ...baseRecord,
              status: {
                ok: true,
                code: "ok",
              },
              payload,
            }
          }
        } catch (error) {
          lastRecord = {
            ...baseRecord,
            attempt: {
              ...baseRecord.attempt,
              retryable: attemptIndex < maxAttempts,
            },
            status: {
              ok: false,
              code: "runner_failed",
              message: error instanceof Error ? error.message : String(error),
            },
          }
        }
      } else {
        const runner = await runShellCommand(command, runnerTimeoutMs)
        baseRecord.runner = {
          exitCode: runner.exitCode,
          signal: runner.signal,
          command,
        }
        if (logPath) {
          const wrapperOutput = [runner.stdout, runner.stderr].filter(Boolean).join("\n")
          if (wrapperOutput.length > 0) {
            const existingLog = await fs.readFile(logPath, "utf8").catch(() => "")
            if (!existingLog) {
              await fs.writeFile(logPath, wrapperOutput)
            } else {
              await fs.appendFile(logPath, `\n\n[BATCH_WRAPPER]\n${wrapperOutput}`)
            }
          }
        }

        if (runner.timedOut) {
          lastRecord = {
            ...baseRecord,
            attempt: {
              ...baseRecord.attempt,
              retryable: true,
            },
            status: {
              ok: false,
              code: "runner_timeout",
              message: `Runner timed out after ${runnerTimeoutMs} ms`,
            },
          }
        } else if (runner.exitCode !== 0) {
          lastRecord = {
            ...baseRecord,
            attempt: {
              ...baseRecord.attempt,
              retryable: true,
            },
            status: {
              ok: false,
              code: "runner_failed",
              message: `Runner exited with code ${runner.exitCode}`,
            },
          }
        } else {
          let payload
          try {
            const rawPayload = await fs.readFile(runnerResultPath, "utf8")
            payload = JSON.parse(rawPayload)
            const contractError = validateRunnerPayloadAgainstContract(payload, runnerContract)
            if (contractError) {
              lastRecord = {
                ...baseRecord,
                attempt: {
                  ...baseRecord.attempt,
                  retryable: false,
                },
                status: {
                  ok: false,
                  code: "runner_result_invalid",
                  message: `Runner contract validation failed: ${contractError}`,
                },
              }
            } else {
              lastRecord = {
                ...baseRecord,
                status: {
                  ok: true,
                  code: "ok",
                },
                payload,
              }
            }
          } catch (error) {
            lastRecord = {
              ...baseRecord,
              attempt: {
                ...baseRecord.attempt,
                retryable: false,
              },
              status: {
                ok: false,
                code: error && error.code === "ENOENT" ? "runner_result_missing" : "runner_result_invalid",
                message: error instanceof Error ? error.message : String(error),
              },
            }
          }
        }
      }

      if (lastRecord.status.ok || !lastRecord.attempt.retryable || attemptIndex >= maxAttempts) {
        return lastRecord
      }
    }

    return lastRecord || {
      schemaVersion: 1,
      runId,
      createdAt: new Date().toISOString(),
      disk: {
        path: diskPath,
        filename,
        sizeBytes: rawBytes.length,
        rawSha256,
        canonicalSha256,
        canonicalization: canonical.canonicalization,
      },
      attempt: {
        index: maxAttempts,
        max: maxAttempts,
        retryable: false,
      },
      status: {
        ok: false,
        code: "unexpected_error",
        message: "Batch runner reached an unexpected state",
      },
      timing: {
        elapsedMs: 0,
      },
    }
  }

  let persistentSessionContext = null
  try {
    if (reuseApp) {
      persistentSessionContext = await createPersistentSessionContext({
        runnerPreset,
        runnerAppDir,
        runnerAppExe,
        runId,
        serverUrl: context.server,
        headless,
      })
    }

    let cursor = 0
    const workers = Array.from({ length: concurrency }, () => (async () => {
      while (true) {
        const index = cursor
        cursor += 1
        if (index >= shardedDisks.length) {
          return
        }
        const record = await processDisk(shardedDisks[index])
        await appendRecord(record)
      }
    })())

    await Promise.all(workers)
    await writeQueue
  } finally {
    if (persistentSessionContext) {
      await closePersistentSession(persistentSessionContext.session)
      if (persistentSessionContext.localControlServer?.managed) {
        await stopManagedProcessTree(persistentSessionContext.localControlServer.proc)
      }
    }
  }

  return {
    runId,
    inputPath,
    inputDir,
    outputPath,
    schemaPath: path.resolve(process.cwd(), "cli", "batch-result.schema.json"),
    runnerContract,
    runnerContractSchemaPath:
      runnerContract === "electron-hdv-v1"
        ? path.resolve(process.cwd(), "cli", "electron-hdv-runner-result.schema.json")
        : null,
    totals: {
      diskCount: shardedDisks.length,
      shards,
      shardIndex,
      concurrency,
      retries,
    },
  }
}

const handleExport = async (context, command, tokens) => {
  switch (command) {
    case "hdv-batch": {
      const { options, positionals } = parseOptionTokens(tokens)
      assertNoExtraPositionals(positionals, "export hdv-batch")

      if (hasAnyOption(options, ["input", "output", "video-dir", "log-dir", "runner-results-dir", "exported-hdv-dir"])) {
        fail(
          "export hdv-batch now requires --input-dir and --output-dir (legacy --input/--output and explicit artifact dirs are not supported)",
        )
      }
      if (hasAnyOption(options, ["run-id", "runId"])) {
        fail("export hdv-batch no longer accepts --run-id")
      }

      const inputDirValue = getAliasedOptionValue(options, ["input-dir", "inputDir"])
      if (inputDirValue === undefined) {
        fail("Missing required option --input-dir")
      }
      const outputDirValue = getAliasedOptionValue(options, ["output-dir", "outputDir"])
      if (outputDirValue === undefined) {
        fail("Missing required option --output-dir")
      }

      const outputDir = path.resolve(process.cwd(), String(outputDirValue))
      const nextTokens = [
        ...tokens,
        "--input-dir",
        String(inputDirValue),
        "--output",
        path.join(outputDir, "results.jsonl"),
        "--video-dir",
        path.join(outputDir, "videos"),
        "--log-dir",
        path.join(outputDir, "logs"),
        "--runner-results-dir",
        path.join(outputDir, "runner-results"),
        "--exported-hdv-dir",
        path.join(outputDir, "exported-hdv"),
      ]

      const hasRunnerContractOption = nextTokens.some(
        (token) => token === "--runner-contract" || token.startsWith("--runner-contract="),
      )
      const finalTokens = hasRunnerContractOption ? nextTokens : [...nextTokens, "--runner-contract", "electron-hdv-v1"]
      return handleBatch(context, "run", finalTokens)
    }
    case "batch":
      return handleBatch(context, "run", tokens)
    default:
      fail(`Unknown export command: ${command}`)
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
    case "export":
      return handleExport(context, command, tokens)
    case "batch":
      return handleBatch(context, command, tokens)
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
