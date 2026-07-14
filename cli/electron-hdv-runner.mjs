#!/usr/bin/env node

import { createHash } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
import os from "node:os"
import path from "node:path"

const fail = (message, exitCode = 1) => {
  process.stderr.write(`${message}\n`)
  process.exit(exitCode)
}

const parseArgs = (argv) => {
  const options = new Map()
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith("--")) continue

    const eq = token.indexOf("=")
    if (eq >= 0) {
      options.set(token.slice(2, eq), token.slice(eq + 1))
      continue
    }

    const key = token.slice(2)
    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith("--")) {
      options.set(key, next)
      i += 1
      continue
    }
    options.set(key, true)
  }
  return options
}

const requireOption = (options, key) => {
  if (!options.has(key)) {
    fail(`Missing required option --${key}`)
  }
  return String(options.get(key))
}

const parseOptionalNumber = (options, key, fallback) => {
  if (!options.has(key)) return fallback
  const value = Number(options.get(key))
  if (!Number.isFinite(value)) {
    fail(`Option --${key} must be a number`)
  }
  return value
}

const parseOptionalString = (options, key, fallback = "") => {
  if (!options.has(key)) return fallback
  return String(options.get(key))
}

const parseOptionalBoolean = (options, key, fallback = false) => {
  if (!options.has(key)) return fallback
  const raw = String(options.get(key)).trim().toLowerCase()
  if (["1", "true", "yes", "on"].includes(raw)) return true
  if (["0", "false", "no", "off"].includes(raw)) return false
  fail(`Option --${key} must be a boolean (true/false)`)
}

const normalizeServerBaseUrl = (value) => {
  const raw = String(value || "").trim()
  if (!raw) return ""
  if (raw.toLowerCase() === "none" || raw.toLowerCase() === "off") return ""
  return raw.endsWith("/") ? raw.slice(0, -1) : raw
}

const defaultPackagedAppExe = (appDir) => {
  if (process.platform === "win32") {
    return path.resolve(appDir, "out", "Apple2TS-win32-x64", "Apple2TS.exe")
  }
  if (process.platform === "darwin") {
    return path.resolve(appDir, "out", "Apple2TS-darwin-arm64", "Apple2TS.app")
  }
  return path.resolve(appDir, "out", "Apple2TS-linux-x64", "apple2ts")
}

const ffmpegCandidates = () => {
  const fromEnv = process.env.FFMPEG_PATH ? [process.env.FFMPEG_PATH] : []
  if (process.platform === "win32") {
    return [
      ...fromEnv,
      "C:\\Users\\bored\\AppData\\Local\\Microsoft\\WinGet\\Links\\ffmpeg.exe",
      "C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe",
      "ffmpeg.exe",
      "ffmpeg",
    ]
  }
  return [...fromEnv, "ffmpeg"]
}

const resolveFfmpegExe = async (explicitPath = "") => {
  const candidates = explicitPath ? [explicitPath] : ffmpegCandidates()
  for (const candidate of candidates) {
    try {
      if (!candidate) continue
      if (candidate.includes(path.sep) || candidate.includes("/")) {
        await fs.access(path.resolve(candidate))
        return path.resolve(candidate)
      }
      // For PATH-based candidates, run as shell command name.
      return candidate
    } catch {
      // try next
    }
  }
  return ""
}

const escapePowerShellSingleQuoted = (value) => String(value).replace(/'/g, "''")

const buildDefaultWindowRecorderCommand = ({ ffmpegExe }) => {
  if (process.platform !== "win32" || !ffmpegExe) {
    return ""
  }

  const exe = escapePowerShellSingleQuoted(ffmpegExe)
  return `powershell -NoProfile -Command "$ErrorActionPreference='Stop'; & '${exe}' -y -hide_banner -loglevel error -f gdigrab -framerate 30 -offset_x {captureX} -offset_y {captureY} -video_size {captureWidth}x{captureHeight} -i desktop -t {captureSeconds} -pix_fmt yuv420p '{videoPath}'"`
}

const extractLatestWindowBounds = (text) => {
  if (!text) return null
  const regex = /\[AUTOMATION\]\s+window-bounds\s+(\{[^\n\r]+\})/g
  let match = null
  for (const candidate of text.matchAll(regex)) {
    match = candidate
  }
  if (!match || !match[1]) {
    return null
  }
  try {
    const bounds = JSON.parse(match[1])
    const x = Math.max(0, Math.floor(Number(bounds.x) || 0))
    const y = Math.max(0, Math.floor(Number(bounds.y) || 0))
    const width = Math.max(1, Math.floor(Number(bounds.width) || 1))
    const height = Math.max(1, Math.floor(Number(bounds.height) || 1))
    return { x, y, width, height }
  } catch {
    return null
  }
}

const packagedAppCandidates = (appDir) => {
  if (process.platform === "win32") {
    return [
      path.resolve(appDir, "out", "Apple2TS-win32-x64", "Apple2TS.exe"),
      path.resolve(appDir, "out", "Apple2TS-win32-arm64", "Apple2TS.exe"),
      path.resolve(appDir, "out", "Apple2TS-win32-ia32", "Apple2TS.exe"),
    ]
  }

  if (process.platform === "darwin") {
    return [
      path.resolve(appDir, "out", "Apple2TS-darwin-arm64", "Apple2TS.app"),
      path.resolve(appDir, "out", "Apple2TS-darwin-x64", "Apple2TS.app"),
    ]
  }

  return [
    path.resolve(appDir, "out", "Apple2TS-linux-x64", "apple2ts"),
    path.resolve(appDir, "out", "Apple2TS-linux-arm64", "apple2ts"),
  ]
}

const resolveAutoPackagedExe = async (appDir) => {
  for (const candidate of packagedAppCandidates(appDir)) {
    try {
      const stat = await fs.stat(candidate)
      if (stat.isFile() || candidate.toLowerCase().endsWith(".app")) {
        return candidate
      }
    } catch {
      // Try next candidate.
    }
  }
  return ""
}

const resolveProfileDefaults = (profile, appDirForDefaults) => {
  const normalized = String(profile || "apple2ts-app-dev").trim()

  if (normalized === "none") {
    return {
      profile: "none",
      appDir: appDirForDefaults,
      appCommand: "",
      recorderCommand: "",
      exportedHdvPath: "",
      appExe: "",
    }
  }

  if (normalized === "apple2ts-app-dev") {
    return {
      profile: "apple2ts-app-dev",
      appDir: appDirForDefaults,
      appCommand: "npm run start:no-prestart -- -- --automation --disable-gpu --fullscreen --no-splash --user-data-dir \"{runtimeUserDataDir}\" --disk-cache-dir \"{runtimeDiskCacheDir}\" \"{launchPath}\"",
      recorderCommand: "",
      exportedHdvPath: "",
      appExe: "",
    }
  }

  if (normalized === "apple2ts-app-packaged") {
    return {
      profile: "apple2ts-app-packaged",
      appDir: appDirForDefaults,
      appCommand: "\"{appExe}\" --automation --disable-gpu --fullscreen --no-splash \"{launchPath}\"",
      recorderCommand: "",
      exportedHdvPath: "",
      appExe: defaultPackagedAppExe(appDirForDefaults),
    }
  }

  if (normalized === "apple2ts-app-packaged-auto") {
    return {
      profile: "apple2ts-app-packaged-auto",
      appDir: appDirForDefaults,
      appCommand: "\"{appExe}\" --automation --disable-gpu --fullscreen --no-splash \"{launchPath}\"",
      recorderCommand: "",
      exportedHdvPath: "",
      appExe: "",
    }
  }

  fail(
    `Unsupported --profile value '${normalized}'. Supported values: apple2ts-app-dev, apple2ts-app-packaged, apple2ts-app-packaged-auto, none`,
  )
}

const sha256Hex = (bytes) => createHash("sha256").update(bytes).digest("hex")

const ensureParentDirectory = async (filePath) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

const removeIfExists = async (filePath) => {
  if (!filePath) return
  try {
    await fs.rm(filePath, { force: true })
  } catch {
    // Ignore cleanup failures for stale artifacts.
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const sanitizePathComponent = (value, fallback = "session") => {
  const normalized = String(value || "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return normalized || fallback
}

const listFilesRecursive = async (rootDir) => {
  const files = []
  const queue = [rootDir]
  while (queue.length > 0) {
    const current = queue.pop()
    let entries = []
    try {
      entries = await fs.readdir(current, { withFileTypes: true })
    } catch {
      continue
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(fullPath)
      } else if (entry.isFile()) {
        files.push(fullPath)
      }
    }
  }
  return files
}

const checkAutomationMarkersInDist = async ({ distDir, markers }) => {
  const markerSet = new Set((markers || []).map((value) => String(value || "").trim()).filter(Boolean))
  if (markerSet.size === 0) {
    return { ok: true, missing: [] }
  }

  const candidates = []
  const indexPath = path.join(distDir, "index.html")
  candidates.push(indexPath)
  const assetsDir = path.join(distDir, "assets")
  const assetFiles = await listFilesRecursive(assetsDir)
  for (const candidate of assetFiles) {
    if (/\.(js|mjs|cjs)$/i.test(candidate)) {
      candidates.push(candidate)
    }
  }

  for (const candidate of candidates) {
    if (markerSet.size === 0) break
    let text = ""
    try {
      text = await fs.readFile(candidate, "utf8")
    } catch {
      continue
    }
    for (const marker of Array.from(markerSet)) {
      if (text.includes(marker)) {
        markerSet.delete(marker)
      }
    }
  }

  return {
    ok: markerSet.size === 0,
    missing: Array.from(markerSet),
  }
}

const runShellCommandWithTimeout = async ({ command, cwd, timeoutMs }) => {
  const proc = spawn(command, {
    cwd,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  })

  const output = []
  proc.stdout.on("data", (chunk) => output.push(String(chunk)))
  proc.stderr.on("data", (chunk) => output.push(String(chunk)))

  const result = await waitForExitWithTimeout(proc, timeoutMs)
  if (!result.completed) {
    await terminateProcessTree(proc)
    return {
      ok: false,
      code: null,
      message: "automation_prepare_timeout",
      output: flattenOutput(output, 40000),
    }
  }

  return {
    ok: result.code === 0,
    code: result.code,
    message: result.code === 0 ? "automation_prepare_ok" : `automation_prepare_exit_${result.code}`,
    output: flattenOutput(output, 40000),
  }
}

const ensureAutomationMarkers = async ({
  enabled,
  projectDir,
  distDir,
  markers,
  buildCommand,
  buildTimeoutMs,
}) => {
  if (!enabled) {
    return {
      ok: true,
      message: "automation_markers_check_disabled",
      built: false,
      details: "",
    }
  }

  const initialCheck = await checkAutomationMarkersInDist({ distDir, markers })
  if (initialCheck.ok) {
    return {
      ok: true,
      message: "automation_markers_present",
      built: false,
      details: "",
    }
  }

  if (!String(buildCommand || "").trim()) {
    return {
      ok: false,
      message: "automation_markers_missing_no_build_command",
      built: false,
      details: `Missing markers: ${initialCheck.missing.join(", ")}`,
    }
  }

  const prepareResult = await runShellCommandWithTimeout({
    command: buildCommand,
    cwd: projectDir,
    timeoutMs: Math.max(1000, Math.floor(buildTimeoutMs)),
  })

  if (!prepareResult.ok) {
    return {
      ok: false,
      message: prepareResult.message,
      built: true,
      details: prepareResult.output,
    }
  }

  const afterBuildCheck = await checkAutomationMarkersInDist({ distDir, markers })
  if (!afterBuildCheck.ok) {
    return {
      ok: false,
      message: "automation_markers_missing_after_build",
      built: true,
      details: `Missing markers: ${afterBuildCheck.missing.join(", ")}`,
    }
  }

  return {
    ok: true,
    message: "automation_markers_rebuilt",
    built: true,
    details: prepareResult.output,
  }
}

const replacePlaceholders = (template, values) =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!(key in values)) return match
    return String(values[key])
  })

const spawnShellCommand = (command, cwd = process.cwd(), envOverrides = {}) =>
  spawn(command, {
    cwd,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
    env: {
      ...process.env,
      ...envOverrides,
    },
  })

const waitForExit = (proc) =>
  new Promise((resolve) => {
    proc.once("close", (code, signal) => {
      resolve({ code, signal })
    })
  })

const waitForExitWithTimeout = (proc, timeoutMs) =>
  Promise.race([
    waitForExit(proc).then((result) => ({ completed: true, ...result })),
    sleep(timeoutMs).then(() => ({ completed: false })),
  ])

const runPowerShell = async (script, timeoutMs = 5000) => {
  const proc = spawn("powershell.exe", [
    "-NoProfile",
    "-NonInteractive",
    "-ExecutionPolicy",
    "Bypass",
    "-Command",
    script,
  ], {
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  })

  const stdout = []
  const stderr = []
  collectProcessOutput(proc, [], (chunk) => {
    // Keep tiny debug buffers for error messages.
    if (stdout.length < 10) stdout.push(chunk)
    if (stderr.length < 10) stderr.push(chunk)
  })

  const result = await waitForExitWithTimeout(proc, timeoutMs)
  if (!result.completed) {
    await terminateProcessTree(proc)
    return {
      ok: false,
      message: "native_enter_timeout",
      details: "PowerShell fallback timed out",
    }
  }

  if (result.code !== 0) {
    return {
      ok: false,
      message: `native_enter_exit_${result.code}`,
      details: `${stdout.join("")} ${stderr.join("")}`.trim(),
    }
  }

  return {
    ok: true,
    message: "native_enter_ok",
    details: "",
  }
}

const sendNativeEnter = async ({
  appPid,
  enterCount,
  enterIntervalMs,
  nativeWindowTitle,
  nativeTimeoutMs,
}) => {
  if (process.platform !== "win32") {
    return {
      ok: false,
      message: "native_enter_unsupported_platform",
    }
  }

  const safeTitle = String(nativeWindowTitle || "Apple2TS").replace(/'/g, "''")
  const safeCount = Math.max(1, Math.floor(enterCount))
  const safeInterval = Math.max(0, Math.floor(enterIntervalMs))
  const safePid = Number.isFinite(Number(appPid)) ? Math.floor(Number(appPid)) : 0

  const script = [
    "$ws = New-Object -ComObject WScript.Shell",
    "Add-Type -AssemblyName System.Windows.Forms",
    "$ok = $false",
    `if (-not $ok) { try { $ok = $ws.AppActivate('${safeTitle}') } catch {} }`,
    "if (-not $ok) { try { $ok = $ws.AppActivate('Apple2TS') } catch {} }",
    `if (-not $ok -and ${safePid} -gt 0) { try { $ok = $ws.AppActivate(${safePid}) } catch {} }`,
    "if (-not $ok) { exit 2 }",
    "Start-Sleep -Milliseconds 150",
    `for ($i = 0; $i -lt ${safeCount}; $i++) { try { [System.Windows.Forms.SendKeys]::SendWait(' ') } catch { exit 3 }; Start-Sleep -Milliseconds 40; try { [System.Windows.Forms.SendKeys]::SendWait('{ENTER}') } catch { exit 4 }; if ($i -lt ${safeCount - 1}) { Start-Sleep -Milliseconds ${safeInterval} } }`,
  ].join("; ")

  const nativeResult = await runPowerShell(script, Math.max(1000, Math.floor(nativeTimeoutMs)))
  if (nativeResult.ok) {
    return {
      ok: true,
      message: `menu_enter_native_sent_x${safeCount}`,
    }
  }

  return {
    ok: false,
    message: `${nativeResult.message}${nativeResult.details ? ` (${nativeResult.details})` : ""}`,
  }
}

const terminateProcessTree = async (proc) => {
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

  await sleep(500)
  if (proc.exitCode === null) {
    try {
      process.kill(proc.pid, "SIGKILL")
    } catch {
      // Ignore if process has already exited.
    }
  }
}

const collectProcessOutput = (proc, sink, onChunk) => {
  proc.stdout.on("data", (chunk) => {
    const text = String(chunk)
    sink.push(text)
    if (onChunk) onChunk(text)
  })
  proc.stderr.on("data", (chunk) => {
    const text = String(chunk)
    sink.push(text)
    if (onChunk) onChunk(text)
  })
}

const waitForOutputMarker = async ({
  proc,
  readOutput,
  marker,
  timeoutMs,
  pollMs = 100,
}) => {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (marker.test(readOutput())) {
      return { ok: true }
    }
    if (proc.exitCode !== null) {
      return { ok: false, reason: "process_exited" }
    }
    await sleep(pollMs)
  }
  return { ok: false, reason: "timeout" }
}

const waitForPredicate = async ({
  proc,
  predicate,
  timeoutMs,
  pollMs = 100,
}) => {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (predicate()) {
      return { ok: true }
    }
    if (proc.exitCode !== null) {
      return { ok: false, reason: "process_exited" }
    }
    await sleep(pollMs)
  }
  return { ok: false, reason: "timeout" }
}

const flattenOutput = (chunks, maxChars = 200000) => {
  const joined = chunks.join("")
  if (joined.length <= maxChars) return joined
  return `${joined.slice(0, maxChars)}\n...[truncated ${joined.length - maxChars} chars]...\n`
}

const collapseMachineTextFatalLines = (combinedLog) => {
  const lines = String(combinedLog || "").split(/\r?\n/)
  const fatalIndexes = []

  for (let i = 0; i < lines.length; i += 1) {
    if (/^\[AUTOMATION\]\s+machine-text-fatal\b/i.test(lines[i])) {
      fatalIndexes.push(i)
    }
  }

  if (fatalIndexes.length <= 1) {
    return combinedLog
  }

  const keepIndex = fatalIndexes[fatalIndexes.length - 1]
  const filtered = lines.filter((line, index) => {
    if (!/^\[AUTOMATION\]\s+machine-text-fatal\b/i.test(line)) return true
    return index === keepIndex
  })

  return filtered.join("\n")
}

const buildTelemetryTextMarkers = (combinedLog) => {
  const lines = String(combinedLog || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const automationLines = lines.filter((line) => /\[AUTOMATION\]/i.test(line))
  if (automationLines.length > 0) {
    return automationLines.slice(-200)
  }

  return lines.slice(-200)
}

const FATAL_TEXT_PATTERNS = [
  /\bI\s*\/\s*O\s+ERROR\b/i,
  /\bFILE\s+NOT\s+FOUND\b/i,
  /\bPATH\s+NOT\s+FOUND\b/i,
  /\bSYNTAX\s+ERROR\b/i,
]

const MONITOR_CRASH_PATTERN = /(?:^|\r?\n)[0-9A-F]{4}-\s*\r?\n\*/i
const MONITOR_CRASH_INLINE_PATTERN = /\b[0-9A-F]{4}-[^\n\r]{0,256}\*/i

const hasMonitorCrashSignature = (text) => {
  const sample = String(text || "")
  const normalized = sample.replace(/\r/g, "\n")
  return MONITOR_CRASH_PATTERN.test(sample) || MONITOR_CRASH_INLINE_PATTERN.test(normalized)
}

const summarizeScreenText = (text, maxLen = 160) => {
  const flat = String(text || "")
    .replace(/[\x00-\x1F]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (flat.length <= maxLen) return flat
  return `${flat.slice(0, maxLen)}...`
}

const parseMarkerCandidates = (marker) => {
  return String(marker || "")
    .split(/[|,]/g)
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

const textContainsAnyMarkerCandidate = (text, marker) => {
  const haystack = String(text || "").toLowerCase()
  const candidates = parseMarkerCandidates(marker)
  if (candidates.length === 0) {
    return false
  }
  return candidates.some((candidate) => haystack.includes(candidate))
}

const detectFatalScreenCondition = (text) => {
  const sample = String(text || "")
  const normalized = sample.replace(/\r/g, "\n")
  for (const needle of FATAL_TEXT_PATTERNS) {
    if (needle.test(normalized)) {
      return {
        code: "fatal_screen_text",
        message: needle.source,
      }
    }
  }

  if (hasMonitorCrashSignature(sample)) {
    return {
      code: "fatal_screen_text",
      message: "Monitor crash signature detected",
    }
  }

  return null
}

const detectRendererFatalEvent = (text) => {
  const normalized = String(text || "")
  const machineSampleRegex = /^\[AUTOMATION\]\s+machine-text-sample\s+(\{[^\n\r]*\})$/gim
  const machineSampleMatches = Array.from(normalized.matchAll(machineSampleRegex))
  for (let index = machineSampleMatches.length - 1; index >= 0; index -= 1) {
    const machineSampleMatch = machineSampleMatches[index]
    if (!machineSampleMatch || !machineSampleMatch[1]) {
      continue
    }
    try {
      const payload = JSON.parse(machineSampleMatch[1])
      const sample = String(payload.sample || "")
      if (hasMonitorCrashSignature(sample)) {
        return {
          code: "fatal_screen_text",
          message: "Monitor crash signature detected",
          source: "renderer-machine-text",
        }
      }
    } catch {
      if (hasMonitorCrashSignature(machineSampleMatch[1])) {
        return {
          code: "fatal_screen_text",
          message: "Monitor crash signature detected",
          source: "renderer-machine-text",
        }
      }
    }
  }

  const regex = /^\[AUTOMATION\]\s+machine-text-fatal\s+(\{[^\n\r]*\})$/gim
  let match = null
  for (const candidate of normalized.matchAll(regex)) {
    match = candidate
  }
  if (!match || !match[1]) {
    return null
  }

  try {
    const payload = JSON.parse(match[1])
    const payloadCode = String(payload.code || "fatal_screen_text")
    return {
      code: payloadCode === "monitor_crash" ? "fatal_screen_text" : payloadCode,
      message: String(payload.label || payload.needle || "Renderer machine-text fatal event"),
      source: "renderer-machine-text",
    }
  } catch {
    return {
      code: "fatal_screen_text",
      message: "Renderer machine-text fatal event",
      source: "renderer-machine-text",
    }
  }
}

const extractLatestAutomationMachineSample = (text) => {
  const normalized = String(text || "")
  const regex = /^\[AUTOMATION\]\s+machine-text-sample\s+(\{[^\n\r]*\})$/gim
  let match = null
  for (const candidate of normalized.matchAll(regex)) {
    match = candidate
  }
  if (!match || !match[1]) {
    return ""
  }

  try {
    const payload = JSON.parse(match[1])
    return summarizeScreenText(String(payload.sample || ""))
  } catch {
    return ""
  }
}

const hasScreenTextMarkerInAutomationSamples = (text, marker) => {
  const normalized = String(text || "")
  const candidates = parseMarkerCandidates(marker)
  if (candidates.length === 0) {
    return false
  }

  const machineSampleRegex = /^\[AUTOMATION\]\s+machine-text-sample\s+(\{[^\n\r]*\})$/gim
  for (const match of normalized.matchAll(machineSampleRegex)) {
    if (!match || !match[1]) continue
    try {
      const payload = JSON.parse(match[1])
      const sampleText = String(payload.sample || "").toLowerCase()
      if (candidates.some((candidate) => sampleText.includes(candidate))) {
        return true
      }
    } catch {
      // Ignore malformed sample lines.
    }
  }

  return false
}

const hasAutomationLoadSuccessSignal = (text) => {
  const normalized = String(text || "")
  if (/\[AUTOMATION\]\s+(disk-loaded|state-loaded)\b/i.test(normalized)) {
    return true
  }
  if (/\[AUTOMATION\]\s+disk-load-dispatched\b[^\n\r]*\(acknowledged\)/i.test(normalized)) {
    return true
  }

  const machineSampleRegex = /^\[AUTOMATION\]\s+machine-text-sample\s+(\{[^\n\r]*\})$/gim
  for (const match of normalized.matchAll(machineSampleRegex)) {
    if (!match || !match[1]) continue
    try {
      const payload = JSON.parse(match[1])
      const rawLength = Number(payload.rawLength || 0)
      const sampleText = String(payload.sample || "").trim()
      if (rawLength > 0 || sampleText.length > 0) {
        return true
      }
    } catch {
      // Ignore malformed sample lines.
    }
  }

  return false
}

const postJson = async ({ url, body, timeoutMs }) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    return {
      ok: response.ok,
      status: response.status,
      payload,
    }
  } finally {
    clearTimeout(timer)
  }
}

const getJson = async ({ url, timeoutMs }) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
    })

    let payload = null
    try {
      payload = await response.json()
    } catch {
      payload = null
    }

    return {
      ok: response.ok,
      status: response.status,
      payload,
    }
  } finally {
    clearTimeout(timer)
  }
}

const waitForScreenText = async ({
  serverUrl,
  marker,
  timeoutMs,
  pollMs,
  requestTimeoutMs,
  shouldAbort,
}) => {
  const normalizedServer = normalizeServerBaseUrl(serverUrl)
  const markerCandidates = parseMarkerCandidates(marker)

  if (!normalizedServer) {
    return {
      ok: false,
      message: "screen_text_check_skipped_empty_server",
    }
  }

  if (markerCandidates.length === 0) {
    return {
      ok: false,
      message: "screen_text_check_skipped_empty_marker",
    }
  }

  const endpoint = `${normalizedServer}/api/machine`
  const started = Date.now()
  let lastText = ""
  while (Date.now() - started < timeoutMs) {
    const abortFatal = typeof shouldAbort === "function" ? shouldAbort() : null
    if (abortFatal) {
      return {
        ok: false,
        message: "screen_text_aborted_fatal",
        fatal: abortFatal,
        lastText,
      }
    }

    const reply = await getJson({
      url: endpoint,
      timeoutMs: requestTimeoutMs,
    }).catch((error) => ({
      ok: false,
      status: 0,
      payload: {
        error: error instanceof Error ? error.message : String(error),
      },
    }))

    if (reply.ok) {
      const textPage = String(reply.payload?.data?.textPage || "")
      lastText = textPage
      const fatal = detectFatalScreenCondition(textPage)
      if (fatal) {
        return {
          ok: false,
          message: `screen_text_fatal:${fatal.code}`,
          fatal,
          lastText,
        }
      }
      if (textContainsAnyMarkerCandidate(textPage, marker)) {
        return {
          ok: true,
          message: `screen_text_found:${markerCandidates.join("|")}`,
          lastText,
        }
      }
    }

    await sleep(Math.max(50, pollMs))
  }

  return {
    ok: false,
    message: `screen_text_timeout:${markerCandidates.join("|")}`,
    lastText,
  }
}

const waitForControlApiReady = async ({
  serverUrl,
  timeoutMs,
  pollMs,
  requestTimeoutMs,
  shouldAbort,
}) => {
  const normalizedServer = normalizeServerBaseUrl(serverUrl)
  if (!normalizedServer) {
    return {
      ok: false,
      message: "control_api_skipped_empty_server",
    }
  }

  const endpoint = `${normalizedServer}/api/machine`
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    const abortFatal = typeof shouldAbort === "function" ? shouldAbort() : null
    if (abortFatal) {
      return {
        ok: false,
        message: "control_api_aborted_fatal",
      }
    }

    const reply = await getJson({
      url: endpoint,
      timeoutMs: requestTimeoutMs,
    }).catch((error) => ({
      ok: false,
      status: 0,
      payload: {
        error: error instanceof Error ? error.message : String(error),
      },
    }))

    if (reply.ok && reply.payload?.ok === true) {
      return {
        ok: true,
        message: "control_api_ready",
      }
    }

    await sleep(Math.max(50, pollMs))
  }

  return {
    ok: false,
    message: "control_api_timeout",
  }
}

const injectMenuEnter = async ({
  serverUrl,
  appPid,
  enterCount,
  enterIntervalMs,
  requestTimeoutMs,
  nativeFallback,
  nativeWindowTitle,
  nativeTimeoutMs,
}) => {
  const normalizedServer = normalizeServerBaseUrl(serverUrl)
  if (!normalizedServer) {
    if (nativeFallback) {
      return sendNativeEnter({
        appPid,
        enterCount,
        enterIntervalMs,
        nativeWindowTitle,
        nativeTimeoutMs,
      })
    }

    return {
      ok: false,
      message: "menu_enter_skipped_empty_server",
    }
  }

  const endpoint = `${normalizedServer}/api/input/keys`
  let apiFailed = false
  let apiFailureMessage = ""
  for (let index = 0; index < enterCount; index += 1) {
    const spaceKeyResponse = await postJson({
      url: endpoint,
      body: {
        type: "keyCode",
        keyCode: 32,
        release: true,
      },
      timeoutMs: requestTimeoutMs,
    }).catch((error) => ({
      ok: false,
      status: 0,
      payload: {
        error: error instanceof Error ? error.message : String(error),
      },
    }))

    if (spaceKeyResponse.ok) {
      await sleep(40)
      const enterKeyResponse = await postJson({
        url: endpoint,
        body: {
          type: "keyCode",
          keyCode: 13,
          release: true,
        },
        timeoutMs: requestTimeoutMs,
      }).catch((error) => ({
        ok: false,
        status: 0,
        payload: {
          error: error instanceof Error ? error.message : String(error),
        },
      }))

      if (!enterKeyResponse.ok) {
        apiFailed = true
        apiFailureMessage =
          enterKeyResponse.payload?.error ||
          enterKeyResponse.payload?.message ||
          `menu_enter_failed_http_${enterKeyResponse.status}`
        break
      }
    }

    let accepted = spaceKeyResponse.ok
    if (!accepted) {
      const textFallbackResponse = await postJson({
        url: endpoint,
        body: {
          type: "text",
          text: " ",
        },
        timeoutMs: requestTimeoutMs,
      }).catch((error) => ({
        ok: false,
        status: 0,
        payload: {
          error: error instanceof Error ? error.message : String(error),
        },
      }))

      accepted = textFallbackResponse.ok
      if (!accepted) {
        apiFailed = true
        apiFailureMessage =
          textFallbackResponse.payload?.error ||
          textFallbackResponse.payload?.message ||
          spaceKeyResponse.payload?.error ||
          spaceKeyResponse.payload?.message ||
          `menu_enter_failed_http_${textFallbackResponse.status || spaceKeyResponse.status}`
        break
      }
    }

    if (index + 1 < enterCount && enterIntervalMs > 0) {
      await sleep(enterIntervalMs)
    }
  }

  if (apiFailed) {
    if (nativeFallback && process.platform === "win32") {
      const nativeResult = await sendNativeEnter({
        appPid,
        enterCount,
        enterIntervalMs,
        nativeWindowTitle,
        nativeTimeoutMs,
      })
      if (nativeResult.ok) return nativeResult

      return {
        ok: false,
        message: `${apiFailureMessage}; ${nativeResult.message}`,
      }
    }

    return {
      ok: false,
      message: apiFailureMessage,
    }
  }

  return {
    ok: true,
    message: `menu_enter_sent_x${enterCount}`,
  }
}

const maybeReadFile = async (filePath) => {
  try {
    const bytes = await fs.readFile(filePath)
    return bytes
  } catch {
    return null
  }
}

const fileExists = async (filePath) => {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

const runScenario = async ({
  diskPath,
  runId,
  attempt,
  videoPath,
  logPath,
  captureSeconds,
  appDir,
  appCommand,
  recorderCommand,
  recorderStartDelayMs,
  appReadyTimeoutMs,
  diskReadyTimeoutMs,
  windowTitle,
  ffmpegExe,
  exportedHdvPath,
  requireExportedHdv,
  appExe,
  serverUrl,
  menuEnterEnabled,
  menuEnterCount,
  menuEnterDelayMs,
  menuEnterIntervalMs,
  menuEnterTimeoutMs,
  menuEnterNativeFallback,
  menuEnterNativeWindowTitle,
  menuEnterNativeTimeoutMs,
  menuEnterRetryCount,
  menuEnterRetryDelayMs,
  controlApiReadyTimeoutMs,
  controlApiPollMs,
  controlApiRequestTimeoutMs,
  waitForScreenTextEnabled,
  instrumentationReadyTimeoutMs,
  screenTextMarker,
  screenTextTimeoutMs,
  screenTextPrewaitMs,
  screenTextPollMs,
  screenTextRequestTimeoutMs,
  captureVideo,
}) => {
  const diskData = await fs.readFile(diskPath)
  const hasExportedHdv = exportedHdvPath && (await fileExists(exportedHdvPath))
  if (requireExportedHdv && !hasExportedHdv) {
    return {
      status: {
        exportOk: false,
        launchOk: false,
        classification: "export_hdv_missing",
        message: "Configured to require exported HDV, but --exported-hdv was missing or not found.",
      },
      telemetry: {
        finalRunMode: "unknown",
        cycleCountStart: 0,
        cycleCountEnd: 0,
        textMarkers: [
          "[AUTOMATION] require-exported-hdv enabled",
          `[AUTOMATION] missing-exported-hdv ${exportedHdvPath || "(empty)"}`,
        ],
      },
      hashes: {
        inputRawSha256: sha256Hex(diskData),
        inputCanonicalSha256: sha256Hex(diskData),
        exportHdvSha256: null,
      },
    }
  }

  const resolvedLaunchPath = hasExportedHdv ? exportedHdvPath : diskPath

  const processOutput = []
  let liveOutput = ""
  const scenarioStartedAt = Date.now()
  const appendTiming = (label, details = "") => {
    const elapsed = Date.now() - scenarioStartedAt
    processOutput.push(`[AUTOMATION] timing t+${elapsed}ms ${label}${details ? ` ${details}` : ""}\n`)
  }
  const appendOutput = (text) => {
    liveOutput += text
    if (liveOutput.length > 400000) {
      liveOutput = liveOutput.slice(-200000)
    }
  }
  const safeCaptureSeconds = Math.max(1, Math.floor(captureSeconds))
  const shouldWaitForScreenText = Boolean(waitForScreenTextEnabled && captureVideo)
  const launchProbeMs = 5000
  const runtimeSessionId = `${Date.now()}-${process.pid}-${Math.random().toString(16).slice(2, 8)}`
  const runtimeBaseDir = path.resolve(
    os.tmpdir(),
    "apple2ts-hdv-runner",
    sanitizePathComponent(path.basename(diskPath, path.extname(diskPath)), "disk"),
    sanitizePathComponent(runId || "run", "run"),
    sanitizePathComponent(String(attempt), "attempt"),
    runtimeSessionId,
  )
  const runtimeUserDataDir = path.join(runtimeBaseDir, "user-data")
  const runtimeDiskCacheDir = path.join(runtimeBaseDir, "cache")
  const runtimeAppDataRoamingDir = path.join(runtimeBaseDir, "appdata-roaming")
  const runtimeAppDataLocalDir = path.join(runtimeBaseDir, "appdata-local")
  const runtimeTempDir = path.join(runtimeBaseDir, "tmp")
  await fs.mkdir(runtimeUserDataDir, { recursive: true })
  await fs.mkdir(runtimeDiskCacheDir, { recursive: true })
  await fs.mkdir(runtimeAppDataRoamingDir, { recursive: true })
  await fs.mkdir(runtimeAppDataLocalDir, { recursive: true })
  await fs.mkdir(runtimeTempDir, { recursive: true })
  const appCmd = appCommand || "npm run start:no-prestart -- -- --automation --disable-gpu --fullscreen --no-splash \"{launchPath}\""
  const launchCommand = replacePlaceholders(appCmd, {
    diskPath,
    launchPath: resolvedLaunchPath,
    videoPath,
    captureSeconds: safeCaptureSeconds,
    exportedHdvPath,
    appExe,
    runtimeUserDataDir,
    runtimeDiskCacheDir,
  })

  let appProc = null
  let recorderProc = null
  let earlyExit = null
  let fatalDetection = null
  const appEnvOverrides = process.platform === "win32"
    ? {
      APPDATA: runtimeAppDataRoamingDir,
      LOCALAPPDATA: runtimeAppDataLocalDir,
      TEMP: runtimeTempDir,
      TMP: runtimeTempDir,
    }
    : {}

  try {
    let liveFatalDetection = null
    const detectLiveFatal = () => {
      if (liveFatalDetection) return liveFatalDetection

      const rendererFatal = detectRendererFatalEvent(liveOutput)
      if (rendererFatal) {
        liveFatalDetection = rendererFatal
        return liveFatalDetection
      }

      const outputFatal = detectFatalScreenCondition(liveOutput)
      if (outputFatal) {
        liveFatalDetection = {
          ...outputFatal,
          source: "app-output",
        }
        return liveFatalDetection
      }

      return null
    }

    appProc = spawnShellCommand(launchCommand, appDir, appEnvOverrides)
    collectProcessOutput(appProc, processOutput, appendOutput)
    appendTiming("app_spawned")

    const exitPromise = waitForExit(appProc)
    earlyExit = await Promise.race([
      exitPromise,
      sleep(launchProbeMs).then(() => null),
    ])

    let launchOk = !earlyExit
    let loadReadyOk = false
    let menuEnterResult = null
    let screenTextResult = null
    let controlApiResult = null
    let screenMarkerSeen = false
    let instrumentationReady = false
    let lastMachineTextSummary = ""
    let sawMachineText = false

    if (launchOk) {
      const appReady = await waitForOutputMarker({
        proc: appProc,
        readOutput: () => liveOutput,
        marker: /\[AUTOMATION\]\s+window-ready/i,
        timeoutMs: Math.max(1000, Math.floor(appReadyTimeoutMs)),
      })
      if (!appReady.ok) {
        launchOk = false
      } else {
        appendTiming("window_ready")
        const diskReady = await waitForOutputMarker({
          proc: appProc,
          readOutput: () => liveOutput,
          marker: /\[AUTOMATION\]\s+(disk-loaded|state-loaded)\b/i,
          timeoutMs: Math.max(1000, Math.floor(diskReadyTimeoutMs)),
        })
        loadReadyOk = diskReady.ok
        if (!diskReady.ok) {
          const markerSeenInOutput = shouldWaitForScreenText
            ? hasScreenTextMarkerInAutomationSamples(liveOutput, screenTextMarker)
            : false
          if (markerSeenInOutput) {
            screenMarkerSeen = true
            loadReadyOk = true
            processOutput.push("[AUTOMATION] disk_ready_by_screen_marker\n")
            appendTiming("screen_marker_seen", "source=renderer_output")
          } else if (hasAutomationLoadSuccessSignal(liveOutput)) {
            loadReadyOk = true
            processOutput.push("[AUTOMATION] disk_ready_fallback_signal_detected\n")
          } else {
            const lateLoadGraceMs = 5000
            processOutput.push(`[AUTOMATION] disk_ready_grace_wait ${lateLoadGraceMs}ms\n`)
            const lateLoad = await waitForPredicate({
              proc: appProc,
              timeoutMs: lateLoadGraceMs,
              predicate: () => {
                const markerSeen = shouldWaitForScreenText
                  ? hasScreenTextMarkerInAutomationSamples(liveOutput, screenTextMarker)
                  : false
                if (markerSeen) {
                  screenMarkerSeen = true
                  appendTiming("screen_marker_seen", "source=renderer_output_grace")
                }
                return markerSeen || hasAutomationLoadSuccessSignal(liveOutput)
              },
            })

            if (lateLoad.ok) {
              loadReadyOk = true
              processOutput.push("[AUTOMATION] disk_ready_grace_success\n")
            } else {
              launchOk = false
              processOutput.push(`[AUTOMATION] disk_ready_grace_timeout ${lateLoad.reason || "timeout"}\n`)
            }
          }
        } else {
          const instrumentationReadyResult = await waitForOutputMarker({
            proc: appProc,
            readOutput: () => liveOutput,
            marker: /\[AUTOMATION\]\s+automation-instrumentation-version\b/i,
            timeoutMs: Math.max(500, Math.floor(instrumentationReadyTimeoutMs)),
          })
          instrumentationReady = instrumentationReadyResult.ok
          processOutput.push(
            `[AUTOMATION] ${instrumentationReady ? "automation_instrumentation_ready" : "automation_instrumentation_timeout"}\n`,
          )
        }

        if (launchOk && menuEnterEnabled) {
          controlApiResult = await waitForControlApiReady({
            serverUrl,
            timeoutMs: Math.max(1000, Math.floor(controlApiReadyTimeoutMs)),
            pollMs: Math.max(50, Math.floor(controlApiPollMs)),
            requestTimeoutMs: Math.max(250, Math.floor(controlApiRequestTimeoutMs)),
            shouldAbort: detectLiveFatal,
          })
          processOutput.push(`[AUTOMATION] ${controlApiResult.message}\n`)
        }

        if (launchOk && shouldWaitForScreenText) {
          screenTextResult = await waitForScreenText({
            serverUrl,
            marker: screenTextMarker,
            timeoutMs: Math.max(250, Math.floor(screenTextPrewaitMs)),
            pollMs: Math.max(50, Math.floor(screenTextPollMs)),
            requestTimeoutMs: Math.max(250, Math.floor(screenTextRequestTimeoutMs)),
            shouldAbort: detectLiveFatal,
          })
          processOutput.push(`[AUTOMATION] ${screenTextResult.message}\n`)
          const prewaitSummary = summarizeScreenText(screenTextResult.lastText || "")
          if (prewaitSummary) {
            processOutput.push(`[AUTOMATION] screen_text_prewait_sample ${prewaitSummary}\n`)
            sawMachineText = true
          }
          if (screenTextResult.ok) {
            screenMarkerSeen = true
            appendTiming("screen_marker_seen", "source=control_api_prewait")
          }
          if (screenTextResult.fatal) {
            fatalDetection = {
              ...screenTextResult.fatal,
              source: "machine-text-prewait",
            }
            launchOk = false
            processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          }

          const preMenuRendererFatal = detectRendererFatalEvent(liveOutput)
          if (preMenuRendererFatal) {
            fatalDetection = preMenuRendererFatal
            launchOk = false
            processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          }
        }

        if (launchOk && menuEnterEnabled && !fatalDetection && !screenMarkerSeen) {
          if (menuEnterDelayMs > 0) {
            const delayStart = Date.now()
            while (Date.now() - delayStart < menuEnterDelayMs) {
              if (detectLiveFatal()) break
              await sleep(50)
            }
          }

          const beforeMenuEnterFatal = detectRendererFatalEvent(liveOutput)
          if (beforeMenuEnterFatal) {
            fatalDetection = beforeMenuEnterFatal
            launchOk = false
            processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          }

          if (fatalDetection) {
            menuEnterResult = {
              ok: false,
              message: "menu_enter_skipped_due_to_fatal_detection",
            }
          } else {

            menuEnterResult = await injectMenuEnter({
              serverUrl,
              appPid: appProc?.pid || 0,
              enterCount: Math.max(1, Math.floor(menuEnterCount)),
              enterIntervalMs: Math.max(0, Math.floor(menuEnterIntervalMs)),
              requestTimeoutMs: Math.max(250, Math.floor(menuEnterTimeoutMs)),
              nativeFallback: Boolean(menuEnterNativeFallback),
              nativeWindowTitle: menuEnterNativeWindowTitle,
              nativeTimeoutMs: Math.max(1000, Math.floor(menuEnterNativeTimeoutMs)),
            })
            processOutput.push(`[AUTOMATION] ${menuEnterResult.message}\n`)
          }

          if (
            menuEnterResult.ok &&
            shouldWaitForScreenText &&
            screenTextResult &&
            !screenTextResult.ok &&
            menuEnterRetryCount > 0
          ) {
            for (let retryIndex = 0; retryIndex < menuEnterRetryCount; retryIndex += 1) {
              const beforeRetryFatal = detectRendererFatalEvent(liveOutput)
              if (beforeRetryFatal) {
                fatalDetection = beforeRetryFatal
                launchOk = false
                processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
                menuEnterResult = {
                  ok: false,
                  message: "menu_enter_retry_skipped_due_to_fatal_detection",
                }
                break
              }

              if (menuEnterRetryDelayMs > 0) {
                const retryDelayStart = Date.now()
                while (Date.now() - retryDelayStart < menuEnterRetryDelayMs) {
                  if (detectLiveFatal()) break
                  await sleep(50)
                }
              }
              const retryResult = await injectMenuEnter({
                serverUrl,
                appPid: appProc?.pid || 0,
                enterCount: Math.max(1, Math.floor(menuEnterCount)),
                enterIntervalMs: Math.max(0, Math.floor(menuEnterIntervalMs)),
                requestTimeoutMs: Math.max(250, Math.floor(menuEnterTimeoutMs)),
                nativeFallback: Boolean(menuEnterNativeFallback),
                nativeWindowTitle: menuEnterNativeWindowTitle,
                nativeTimeoutMs: Math.max(1000, Math.floor(menuEnterNativeTimeoutMs)),
              })
              processOutput.push(
                `[AUTOMATION] menu_enter_retry_${retryIndex + 1}_${retryResult.ok ? "ok" : "failed"} ${retryResult.message}\n`,
              )

              const afterRetryFatal = detectRendererFatalEvent(liveOutput)
              if (afterRetryFatal) {
                fatalDetection = afterRetryFatal
                launchOk = false
                processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
                menuEnterResult = {
                  ok: false,
                  message: "menu_enter_retry_stopped_due_to_fatal_detection",
                }
                break
              }

              if (!retryResult.ok) {
                menuEnterResult = retryResult
                break
              }
            }
          }
        }

        if (launchOk && menuEnterEnabled && screenMarkerSeen) {
          menuEnterResult = {
            ok: true,
            message: "menu_enter_skipped_screen_marker_seen",
          }
          processOutput.push(`[AUTOMATION] ${menuEnterResult.message}\n`)
        }
      }
    }

    let statusLaunchOk = launchOk

    const initialFatal = detectFatalScreenCondition(liveOutput)
    const rendererFatal = detectRendererFatalEvent(liveOutput)
    if (rendererFatal) {
      fatalDetection = rendererFatal
      processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
      statusLaunchOk = false
    } else if (initialFatal) {
      fatalDetection = {
        ...initialFatal,
        source: "app-output",
      }
      processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
      statusLaunchOk = false
    }

    if (launchOk && !fatalDetection && captureVideo) {
      const effectiveRecorderCommand =
        recorderCommand || buildDefaultWindowRecorderCommand({ ffmpegExe })

      const captureBounds = extractLatestWindowBounds(liveOutput) || {
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
      }

      if (effectiveRecorderCommand) {
        if (recorderStartDelayMs > 0) {
          await sleep(recorderStartDelayMs)
        }
        const renderedRecorder = replacePlaceholders(effectiveRecorderCommand, {
          diskPath,
          launchPath: resolvedLaunchPath,
          videoPath,
          captureSeconds: safeCaptureSeconds,
          appPid: appProc.pid,
          exportedHdvPath,
          appExe,
          ffmpegExe,
          windowTitle,
          captureX: captureBounds.x,
          captureY: captureBounds.y,
          captureWidth: captureBounds.width,
          captureHeight: captureBounds.height,
        })
        recorderProc = spawnShellCommand(renderedRecorder, appDir)
        collectProcessOutput(recorderProc, processOutput, appendOutput)
      } else {
        await ensureParentDirectory(videoPath)
        await fs.writeFile(videoPath, "")
      }

      const captureStartedAt = Date.now()
      let captureDeadline = captureStartedAt + (safeCaptureSeconds * 1000)
      const postMarkerTotalBudgetMs = 5000
      const postMarkerTeardownReserveMs = 1000
      let postMarkerHardStopAt = null
      let usedFastCaptureWindow = false
      let fastWindowArmed = false
      const armFastCaptureWindow = (reason) => {
        const armedAt = Date.now()
        const fastDeadline = armedAt + Math.max(500, postMarkerTotalBudgetMs - postMarkerTeardownReserveMs)
        postMarkerHardStopAt = armedAt + postMarkerTotalBudgetMs
        if (!fastWindowArmed || fastDeadline < captureDeadline) {
          captureDeadline = Math.min(captureDeadline, fastDeadline)
          fastWindowArmed = true
          usedFastCaptureWindow = true
          processOutput.push(`[AUTOMATION] fast_capture_window_armed ${postMarkerTotalBudgetMs}ms reason=${reason}\n`)
          appendTiming("fast_window_armed", `reason=${reason}`)
        }
      }

      if (!screenMarkerSeen && shouldWaitForScreenText && hasScreenTextMarkerInAutomationSamples(liveOutput, screenTextMarker)) {
        screenMarkerSeen = true
        processOutput.push(`[AUTOMATION] screen_text_found_in_renderer_output ${String(screenTextMarker || "").toLowerCase()}\n`)
      }

      if (screenMarkerSeen) {
        armFastCaptureWindow("screen_marker_pre_capture")
      } else if (loadReadyOk) {
        // Once load success is confirmed, bound the remaining run to a short post-load window.
        armFastCaptureWindow("load_ready_pre_capture")
      }
      appendTiming("capture_window_start")
      const canPollMachineText = Boolean(normalizeServerBaseUrl(serverUrl))
      let nextMachinePollAt = captureStartedAt

      while (Date.now() < captureDeadline) {
        if (appProc && appProc.exitCode !== null) {
          statusLaunchOk = false
          fatalDetection = fatalDetection || {
            code: "app_exited_during_capture",
            message: "Application exited during capture window",
            source: "app-process",
          }
          processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          break
        }

        const outputFatal = detectFatalScreenCondition(liveOutput)
        const outputRendererFatal = detectRendererFatalEvent(liveOutput)
        if (outputRendererFatal) {
          statusLaunchOk = false
          fatalDetection = outputRendererFatal
          processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          break
        }

        if (outputFatal) {
          statusLaunchOk = false
          fatalDetection = {
            ...outputFatal,
            source: "app-output",
          }
          processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
          break
        }

        if (
          !screenMarkerSeen &&
          shouldWaitForScreenText &&
          hasScreenTextMarkerInAutomationSamples(liveOutput, screenTextMarker)
        ) {
          screenMarkerSeen = true
          processOutput.push(`[AUTOMATION] screen_text_found_in_renderer_output ${String(screenTextMarker || "").toLowerCase()}\n`)
          appendTiming("screen_marker_seen", "source=renderer_output_loop")
          armFastCaptureWindow("screen_marker_in_renderer_output")
        }

        if (canPollMachineText && Date.now() >= nextMachinePollAt) {
          nextMachinePollAt = Date.now() + 500
          const machineReply = await getJson({
            url: `${normalizeServerBaseUrl(serverUrl)}/api/machine`,
            timeoutMs: Math.max(250, Math.floor(controlApiRequestTimeoutMs)),
          }).catch(() => null)

          if (machineReply && machineReply.ok) {
            const textPage = String(machineReply.payload?.data?.textPage || "")
            if (!screenMarkerSeen && textContainsAnyMarkerCandidate(textPage, screenTextMarker)) {
              screenMarkerSeen = true
              processOutput.push(`[AUTOMATION] screen_text_found_during_capture ${String(screenTextMarker || "").toLowerCase()}\n`)
              appendTiming("screen_marker_seen", "source=control_api_capture")
              armFastCaptureWindow("screen_marker_during_capture")
            }
            const machineSummary = summarizeScreenText(textPage)
            if (machineSummary && machineSummary !== lastMachineTextSummary) {
              lastMachineTextSummary = machineSummary
              processOutput.push(`[AUTOMATION] machine_text_sample ${machineSummary}\n`)
              sawMachineText = true
            }
            const machineFatal = detectFatalScreenCondition(textPage)
            if (machineFatal) {
              statusLaunchOk = false
              fatalDetection = {
                ...machineFatal,
                source: "machine-text",
              }
              processOutput.push(`[AUTOMATION] fatal_detected ${fatalDetection.code} ${fatalDetection.message}\n`)
              break
            }
          }
        }

        await sleep(100)
      }
      appendTiming("capture_window_end")

      if (recorderProc) {
        const remainingBudgetMs = postMarkerHardStopAt ? Math.max(100, postMarkerHardStopAt - Date.now()) : null
        const recorderGraceMs = remainingBudgetMs === null
          ? (usedFastCaptureWindow ? 500 : 4000)
          : Math.min(usedFastCaptureWindow ? 500 : 4000, remainingBudgetMs)
        processOutput.push(`[AUTOMATION] recorder_finalize_wait ${recorderGraceMs}ms\n`)
        // Keep finalization short in fast-window mode so total post-marker delay stays near 5s.
        const recorderExit = await waitForExitWithTimeout(recorderProc, recorderGraceMs)
        if (!recorderExit.completed) {
          await terminateProcessTree(recorderProc)
        }
      }
    } else if (launchOk && !fatalDetection && !captureVideo) {
      processOutput.push("[AUTOMATION] capture_disabled_by_option\n")
    }

    if (recorderProc && recorderProc.exitCode === null) {
      await terminateProcessTree(recorderProc)
    }
    if (appProc) {
      await terminateProcessTree(appProc)
    }

    const exportHdvBytes = exportedHdvPath ? await maybeReadFile(exportedHdvPath) : null
    const exportOk = Boolean(exportHdvBytes && exportHdvBytes.length > 0)

    let classification = "ok"
    let message = "Launch/capture window completed."

    if (fatalDetection) {
      statusLaunchOk = false
      classification = fatalDetection.code
      message = `Failure signature detected (${fatalDetection.source}): ${fatalDetection.message}`
    } else if (!launchOk) {
      classification = "launch_failed"
      message = `App exited before ${launchProbeMs} ms readiness window.`
      if (!/\[AUTOMATION\]\s+window-ready/i.test(liveOutput)) {
        classification = "app_not_ready"
        message = `App did not report window-ready within ${appReadyTimeoutMs} ms.`
      } else if (!loadReadyOk) {
        classification = "disk_not_loaded"
        message = `App did not report disk-loaded/state-loaded within ${diskReadyTimeoutMs} ms.`
      } else if (!instrumentationReady) {
        classification = "automation_instrumentation_missing"
        message = `Renderer automation instrumentation did not report ready event within ${instrumentationReadyTimeoutMs} ms.`
      }
    } else if (!exportOk) {
      classification = "export_not_verified"
      message = "Launch completed but exported HDV was not found."
    }

    if (
      shouldWaitForScreenText &&
      controlApiResult &&
      !controlApiResult.ok &&
      !sawMachineText &&
      /\[AUTOMATION\]\s+machine-text-sample\b/i.test(liveOutput) === false
    ) {
      classification = "screen_text_unavailable"
      statusLaunchOk = false
      message = "Control API unavailable and no machine text was captured from renderer automation events."
    }

    if (classification === "ok" && menuEnterEnabled && menuEnterResult && !menuEnterResult.ok) {
      processOutput.push(`[AUTOMATION] menu_enter_warning ${menuEnterResult.message}\n`)
    }

    if (classification === "ok" && shouldWaitForScreenText && !screenMarkerSeen) {
      const reason = screenTextResult?.message || "screen_text_not_observed"
      processOutput.push(`[AUTOMATION] screen_text_marker_not_observed ${reason}\n`)
    }

    if (classification === "disk_not_loaded" && shouldWaitForScreenText && screenMarkerSeen) {
      classification = "ok"
      statusLaunchOk = true
      message = "Launch/capture window completed. Disk title marker detected."
      processOutput.push("[AUTOMATION] disk_loaded_by_screen_marker\n")
    }

    if (classification === "ok" && waitForScreenTextEnabled && !shouldWaitForScreenText) {
      processOutput.push("[AUTOMATION] screen_text_checks_skipped_capture_disabled\n")
    }

    if (resolvedLaunchPath === diskPath && path.extname(diskPath).toLowerCase() !== ".hdv") {
      classification = classification === "ok" ? "source_disk_launched" : classification
      message = `${message} Launch target remained source disk (no HDV launch target resolved).`
    }

    if (classification !== "ok") {
      processOutput.push(`[RESULT] 🔴 FAIL classification=${classification}\n`)
      processOutput.push(`[AUTOMATION] run_failed classification=${classification} message=${message}\n`)
      const finalSample =
        extractLatestAutomationMachineSample(liveOutput) ||
        summarizeScreenText(screenTextResult?.lastText || "") ||
        summarizeScreenText(liveOutput)
      if (finalSample) {
        processOutput.push(`[AUTOMATION] failure_text_capture ${finalSample}\n`)
      }
    } else {
      processOutput.push("[RESULT] ✅ PASS\n")
    }
    appendTiming("scenario_complete", `classification=${classification}`)

    const combinedLog = collapseMachineTextFatalLines(flattenOutput(processOutput))
    if (logPath) {
      await ensureParentDirectory(logPath)
      await fs.writeFile(logPath, combinedLog, "utf8")
    }

    return {
      status: {
        exportOk,
        launchOk: statusLaunchOk,
        classification,
        message,
      },
      telemetry: {
        finalRunMode: statusLaunchOk ? "running" : "unknown",
        cycleCountStart: 0,
        cycleCountEnd: 0,
        textMarkers: buildTelemetryTextMarkers(combinedLog),
      },
      hashes: {
        inputRawSha256: sha256Hex(diskData),
        inputCanonicalSha256: sha256Hex(diskData),
        exportHdvSha256: exportHdvBytes ? sha256Hex(exportHdvBytes) : null,
      },
    }
  } catch (error) {
    if (recorderProc) {
      await terminateProcessTree(recorderProc)
    }
    if (appProc) {
      await terminateProcessTree(appProc)
    }

    const combinedLog = flattenOutput(processOutput)
    if (logPath) {
      await ensureParentDirectory(logPath)
      await fs.writeFile(logPath, combinedLog, "utf8")
    }

    return {
      status: {
        exportOk: false,
        launchOk: false,
        classification: "runner_error",
        message: error instanceof Error ? error.message : String(error),
      },
      telemetry: {
        finalRunMode: "unknown",
        cycleCountStart: 0,
        cycleCountEnd: 0,
        textMarkers: buildTelemetryTextMarkers(combinedLog),
      },
      hashes: {
        inputRawSha256: sha256Hex(diskData),
        inputCanonicalSha256: sha256Hex(diskData),
        exportHdvSha256: null,
      },
    }
  }
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))

  const diskPath = path.resolve(requireOption(options, "disk"))
  const resultPath = path.resolve(requireOption(options, "result"))
  const videoPath = path.resolve(requireOption(options, "video"))
  const logPath = options.has("log") ? path.resolve(String(options.get("log"))) : ""

  await removeIfExists(resultPath)
  await removeIfExists(videoPath)
  if (logPath) {
    await removeIfExists(logPath)
  }

  const runId = options.has("run-id") ? String(options.get("run-id")) : ""
  const attempt = parseOptionalNumber(options, "attempt", 1)
  const captureSeconds = parseOptionalNumber(options, "capture-seconds", 15)
  const defaultAppDir = path.resolve(process.cwd(), "..", "apple2ts-app")
  const requestedProfile = parseOptionalString(options, "profile", "apple2ts-app-dev")
  const profileDefaults = resolveProfileDefaults(requestedProfile, defaultAppDir)

  const appDir = path.resolve(parseOptionalString(options, "app-dir", profileDefaults.appDir))
  let appExe = parseOptionalString(options, "app-exe", profileDefaults.appExe)
  const appCommand = parseOptionalString(options, "app-command", profileDefaults.appCommand)
  const recorderCommand = parseOptionalString(options, "recorder-command", profileDefaults.recorderCommand)
  const recorderStartDelayMs = parseOptionalNumber(options, "recorder-start-delay-ms", 0)
  const appReadyTimeoutMs = parseOptionalNumber(options, "app-ready-timeout-ms", 45000)
  const diskReadyTimeoutMs = parseOptionalNumber(options, "disk-ready-timeout-ms", 45000)
  const windowTitle = parseOptionalString(options, "window-title", "Apple2TS")
  const serverUrl = normalizeServerBaseUrl(
    parseOptionalString(options, "server", process.env.APPLE2TS_SERVER_URL || "http://127.0.0.1:6502"),
  )
  const menuEnterEnabled = parseOptionalBoolean(options, "menu-enter", true)
  const menuEnterCount = parseOptionalNumber(options, "menu-enter-count", 1)
  const menuEnterDelayMs = parseOptionalNumber(options, "menu-enter-delay-ms", 800)
  const menuEnterIntervalMs = parseOptionalNumber(options, "menu-enter-interval-ms", 150)
  const menuEnterTimeoutMs = parseOptionalNumber(options, "menu-enter-timeout-ms", 3000)
  const menuEnterNativeFallback = parseOptionalBoolean(
    options,
    "menu-enter-native-fallback",
    process.platform === "win32",
  )
  const menuEnterNativeWindowTitle = parseOptionalString(options, "menu-enter-native-window-title", windowTitle)
  const menuEnterNativeTimeoutMs = parseOptionalNumber(options, "menu-enter-native-timeout-ms", 5000)
  const menuEnterRetryCount = parseOptionalNumber(options, "menu-enter-retry-count", 2)
  const menuEnterRetryDelayMs = parseOptionalNumber(options, "menu-enter-retry-delay-ms", 1500)
  const controlApiReadyTimeoutMs = parseOptionalNumber(options, "control-api-ready-timeout-ms", 15000)
  const controlApiPollMs = parseOptionalNumber(options, "control-api-poll-ms", 250)
  const controlApiRequestTimeoutMs = parseOptionalNumber(options, "control-api-request-timeout-ms", 2000)
  const waitForScreenTextEnabled = parseOptionalBoolean(options, "wait-for-screen-text", true)
  const instrumentationReadyTimeoutMs = parseOptionalNumber(options, "instrumentation-ready-timeout-ms", 3000)
  const defaultScreenTextMarker = path.basename(diskPath, path.extname(diskPath))
  const screenTextMarker = parseOptionalString(options, "screen-text-marker", defaultScreenTextMarker)
  const screenTextTimeoutMs = parseOptionalNumber(options, "screen-text-timeout-ms", 15000)
  const screenTextPrewaitMs = parseOptionalNumber(options, "screen-text-prewait-ms", 1500)
  const screenTextPollMs = parseOptionalNumber(options, "screen-text-poll-ms", 250)
  const screenTextRequestTimeoutMs = parseOptionalNumber(options, "screen-text-request-timeout-ms", 2000)
  const captureVideo = parseOptionalBoolean(options, "capture-video", true)
  const ensureAutomationMarkersEnabled = parseOptionalBoolean(
    options,
    "ensure-automation-markers",
    profileDefaults.profile === "apple2ts-app-dev",
  )
  const automationProjectDir = path.resolve(parseOptionalString(options, "automation-project-dir", process.cwd()))
  const automationDistDir = path.resolve(parseOptionalString(options, "automation-dist-dir", path.join(automationProjectDir, "dist")))
  const automationMarkers = parseOptionalString(
    options,
    "automation-markers",
    "machine-text-sample,machine-text-fatal,launch-key-attempt,launch-before-,automation-instrumentation-version",
  )
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
  const automationBuildCommand = parseOptionalString(options, "automation-build-command", "npm run build")
  const automationBuildTimeoutMs = parseOptionalNumber(options, "automation-build-timeout-ms", 180000)
  const requestedFfmpegExe = parseOptionalString(options, "ffmpeg-exe", "")
  const exportedHdvPath = parseOptionalString(options, "exported-hdv", profileDefaults.exportedHdvPath)
  const requireExportedHdv = parseOptionalBoolean(options, "require-exported-hdv", false)

  const providedRawSha256 = options.has("raw-sha256") ? String(options.get("raw-sha256")) : ""
  const providedCanonicalSha256 = options.has("canonical-sha256") ? String(options.get("canonical-sha256")) : ""

  try {
    const stat = await fs.stat(diskPath)
    if (!stat.isFile()) {
      fail(`--disk must point to a file: ${diskPath}`)
    }
  } catch {
    fail(`--disk does not exist: ${diskPath}`)
  }

  try {
    const stat = await fs.stat(appDir)
    if (!stat.isDirectory()) {
      fail(`--app-dir must point to a directory: ${appDir}`)
    }
  } catch {
    fail(`--app-dir does not exist: ${appDir}`)
  }

  if (!appExe && profileDefaults.profile === "apple2ts-app-packaged-auto") {
    appExe = await resolveAutoPackagedExe(appDir)
    if (!appExe) {
      fail(
        `Could not auto-detect packaged app executable under ${appDir}. Use --app-exe or build a packaged app first.`,
      )
    }
  }

  if (appCommand.includes("{appExe}")) {
    if (!appExe) {
      fail("--app-command requires {appExe}, but no --app-exe value was provided")
    }
    try {
      const stat = await fs.stat(path.resolve(appExe))
      if (!stat.isFile() && !String(appExe).toLowerCase().endsWith(".app")) {
        fail(`--app-exe must point to a file (or .app bundle on macOS): ${appExe}`)
      }
    } catch {
      fail(`--app-exe does not exist: ${appExe}`)
    }
  }

  const automationCheck = await ensureAutomationMarkers({
    enabled: ensureAutomationMarkersEnabled,
    projectDir: automationProjectDir,
    distDir: automationDistDir,
    markers: automationMarkers,
    buildCommand: automationBuildCommand,
    buildTimeoutMs: automationBuildTimeoutMs,
  })
  process.stdout.write(`[AUTOMATION] ${automationCheck.message}\n`)
  if (!automationCheck.ok) {
    const detail = automationCheck.details ? `\n${automationCheck.details}` : ""
    fail(`Automation instrumentation check failed: ${automationCheck.message}${detail}`)
  }

  const startedAt = Date.now()
  const ffmpegExe = await resolveFfmpegExe(requestedFfmpegExe)
  const scenario = await runScenario({
    diskPath,
    runId,
    attempt,
    videoPath,
    logPath,
    captureSeconds,
    appDir,
    appCommand,
    recorderCommand,
    recorderStartDelayMs,
    appReadyTimeoutMs,
    diskReadyTimeoutMs,
    windowTitle,
    serverUrl,
    menuEnterEnabled,
    menuEnterCount,
    menuEnterDelayMs,
    menuEnterIntervalMs,
    menuEnterTimeoutMs,
    menuEnterNativeFallback,
    menuEnterNativeWindowTitle,
    menuEnterNativeTimeoutMs,
    menuEnterRetryCount,
    menuEnterRetryDelayMs,
    controlApiReadyTimeoutMs,
    controlApiPollMs,
    controlApiRequestTimeoutMs,
    waitForScreenTextEnabled,
    instrumentationReadyTimeoutMs,
    screenTextMarker,
    screenTextTimeoutMs,
    screenTextPrewaitMs,
    screenTextPollMs,
    screenTextRequestTimeoutMs,
    captureVideo,
    ffmpegExe,
    exportedHdvPath: exportedHdvPath ? path.resolve(exportedHdvPath) : "",
    requireExportedHdv,
    appExe: appExe ? path.resolve(appExe) : "",
  })
  const elapsedMs = Date.now() - startedAt

  const payload = {
    contractVersion: 1,
    scenario: "export-hdv-launch-test",
    status: scenario.status,
    timing: {
      captureSeconds,
      elapsedMs,
    },
    hashes: {
      ...scenario.hashes,
      providedRawSha256: providedRawSha256 || null,
      providedCanonicalSha256: providedCanonicalSha256 || null,
    },
    telemetry: scenario.telemetry,
    metadata: {
      runId,
      attempt,
      runner: "electron-hdv-runner-harness",
      profile: profileDefaults.profile,
    },
    artifacts: {
      videoPath,
      logPath: logPath || undefined,
    },
  }

  await ensureParentDirectory(resultPath)
  await fs.writeFile(resultPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8")

  process.stdout.write(`Wrote runner result: ${resultPath}\n`)
  process.exit(0)
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
