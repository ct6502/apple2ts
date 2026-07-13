#!/usr/bin/env node

import { createHash } from "node:crypto"
import { spawn } from "node:child_process"
import { promises as fs } from "node:fs"
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
      appCommand: "npm run start:no-prestart -- -- --automation --disable-gpu --fullscreen --no-splash \"{launchPath}\"",
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

const replacePlaceholders = (template, values) =>
  template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key) => {
    if (!(key in values)) return match
    return String(values[key])
  })

const spawnShellCommand = (command, cwd = process.cwd()) =>
  spawn(command, {
    cwd,
    shell: true,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
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
    "$ok = $false",
    `if (${safePid} -gt 0) { try { $ok = $ws.AppActivate(${safePid}) } catch {} }`,
    `if (-not $ok) { try { $ok = $ws.AppActivate('${safeTitle}') } catch {} }`,
    "if (-not $ok) { try { $ok = $ws.AppActivate('Apple2TS') } catch {} }",
    "if (-not $ok) { exit 2 }",
    "Start-Sleep -Milliseconds 150",
    `for ($i = 0; $i -lt ${safeCount}; $i++) { $ws.SendKeys('{ENTER}'); if ($i -lt ${safeCount - 1}) { Start-Sleep -Milliseconds ${safeInterval} } }`,
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

const flattenOutput = (chunks, maxChars = 200000) => {
  const joined = chunks.join("")
  if (joined.length <= maxChars) return joined
  return `${joined.slice(0, maxChars)}\n...[truncated ${joined.length - maxChars} chars]...\n`
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
}) => {
  const normalizedServer = normalizeServerBaseUrl(serverUrl)
  const normalizedMarker = String(marker || "").trim().toLowerCase()

  if (!normalizedServer) {
    return {
      ok: false,
      message: "screen_text_check_skipped_empty_server",
    }
  }

  if (!normalizedMarker) {
    return {
      ok: false,
      message: "screen_text_check_skipped_empty_marker",
    }
  }

  const endpoint = `${normalizedServer}/api/machine`
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
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
      if (textPage.toLowerCase().includes(normalizedMarker)) {
        return {
          ok: true,
          message: `screen_text_found:${normalizedMarker}`,
        }
      }
    }

    await sleep(Math.max(50, pollMs))
  }

  return {
    ok: false,
    message: `screen_text_timeout:${normalizedMarker}`,
  }
}

const waitForControlApiReady = async ({
  serverUrl,
  timeoutMs,
  pollMs,
  requestTimeoutMs,
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
    const keyCodeResponse = await postJson({
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

    let accepted = keyCodeResponse.ok
    if (!accepted) {
      const textFallbackResponse = await postJson({
        url: endpoint,
        body: {
          type: "text",
          text: "\r",
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
          keyCodeResponse.payload?.error ||
          keyCodeResponse.payload?.message ||
          `menu_enter_failed_http_${textFallbackResponse.status || keyCodeResponse.status}`
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
  screenTextMarker,
  screenTextTimeoutMs,
  screenTextPollMs,
  screenTextRequestTimeoutMs,
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
  const appendOutput = (text) => {
    liveOutput += text
    if (liveOutput.length > 400000) {
      liveOutput = liveOutput.slice(-200000)
    }
  }
  const safeCaptureSeconds = Math.max(1, Math.floor(captureSeconds))
  const launchProbeMs = 5000
  const appCmd = appCommand || "npm run start:no-prestart -- -- --automation --disable-gpu --fullscreen --no-splash \"{launchPath}\""
  const launchCommand = replacePlaceholders(appCmd, {
    diskPath,
    launchPath: resolvedLaunchPath,
    videoPath,
    captureSeconds: safeCaptureSeconds,
    exportedHdvPath,
    appExe,
  })

  let appProc = null
  let recorderProc = null
  let earlyExit = null

  try {
    appProc = spawnShellCommand(launchCommand, appDir)
    collectProcessOutput(appProc, processOutput, appendOutput)

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
        const diskReady = await waitForOutputMarker({
          proc: appProc,
          readOutput: () => liveOutput,
          marker: /\[AUTOMATION\]\s+(disk-loaded|state-loaded)\b/i,
          timeoutMs: Math.max(1000, Math.floor(diskReadyTimeoutMs)),
        })
        loadReadyOk = diskReady.ok
        if (!diskReady.ok) {
          launchOk = false
        }

        if (waitForScreenTextEnabled || menuEnterEnabled) {
          controlApiResult = await waitForControlApiReady({
            serverUrl,
            timeoutMs: Math.max(1000, Math.floor(controlApiReadyTimeoutMs)),
            pollMs: Math.max(50, Math.floor(controlApiPollMs)),
            requestTimeoutMs: Math.max(250, Math.floor(controlApiRequestTimeoutMs)),
          })
          processOutput.push(`[AUTOMATION] ${controlApiResult.message}\n`)
        }

        if (waitForScreenTextEnabled) {
          screenTextResult = await waitForScreenText({
            serverUrl,
            marker: screenTextMarker,
            timeoutMs: Math.max(1000, Math.floor(screenTextTimeoutMs)),
            pollMs: Math.max(50, Math.floor(screenTextPollMs)),
            requestTimeoutMs: Math.max(250, Math.floor(screenTextRequestTimeoutMs)),
          })
          processOutput.push(`[AUTOMATION] ${screenTextResult.message}\n`)
        }

        if (menuEnterEnabled) {
          if (menuEnterDelayMs > 0) {
            await sleep(menuEnterDelayMs)
          }

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

          if (
            menuEnterResult.ok &&
            waitForScreenTextEnabled &&
            screenTextResult &&
            !screenTextResult.ok &&
            menuEnterRetryCount > 0
          ) {
            for (let retryIndex = 0; retryIndex < menuEnterRetryCount; retryIndex += 1) {
              if (menuEnterRetryDelayMs > 0) {
                await sleep(menuEnterRetryDelayMs)
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
              if (!retryResult.ok) {
                menuEnterResult = retryResult
                break
              }
            }
          }
        }
      }
    }

    let statusLaunchOk = launchOk

    if (launchOk) {
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

      await sleep(safeCaptureSeconds * 1000)
    }

    if (recorderProc) {
      // Give recorder a short grace window to flush/finalize outputs (for MP4 moov atom).
      const recorderExit = await waitForExitWithTimeout(recorderProc, 4000)
      if (!recorderExit.completed) {
        await terminateProcessTree(recorderProc)
      }
    }
    if (appProc) {
      await terminateProcessTree(appProc)
    }

    const exportHdvBytes = exportedHdvPath ? await maybeReadFile(exportedHdvPath) : null
    const exportOk = Boolean(exportHdvBytes && exportHdvBytes.length > 0)

    let classification = "ok"
    let message = "Launch/capture window completed."

    if (!launchOk) {
      classification = "launch_failed"
      message = `App exited before ${launchProbeMs} ms readiness window.`
      if (!/\[AUTOMATION\]\s+window-ready/i.test(liveOutput)) {
        classification = "app_not_ready"
        message = `App did not report window-ready within ${appReadyTimeoutMs} ms.`
      } else if (!loadReadyOk) {
        classification = "disk_not_loaded"
        message = `App did not report disk-loaded/state-loaded within ${diskReadyTimeoutMs} ms.`
      }
    } else if (menuEnterEnabled && menuEnterResult && !menuEnterResult.ok) {
      statusLaunchOk = false
      classification = "menu_enter_failed"
      message = `Failed to inject ENTER for MENUSRC launch: ${menuEnterResult.message}`
    } else if (!exportOk) {
      classification = "export_not_verified"
      message = "Launch completed but exported HDV was not found."
    }

    if (
      classification === "ok" &&
      waitForScreenTextEnabled &&
      screenTextResult &&
      !screenTextResult.ok
    ) {
      classification = "screen_text_not_ready"
      message = `Launch completed, but disk-name marker was not observed: ${screenTextResult.message}`
    }

    if (resolvedLaunchPath === diskPath && path.extname(diskPath).toLowerCase() !== ".hdv") {
      classification = classification === "ok" ? "source_disk_launched" : classification
      message = `${message} Launch target remained source disk (no HDV launch target resolved).`
    }

    const combinedLog = flattenOutput(processOutput)
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
        textMarkers: combinedLog
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0)
          .slice(0, 20),
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
        textMarkers: combinedLog
          .split(/\r?\n/)
          .filter((line) => line.trim().length > 0)
          .slice(0, 20),
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
  const captureSeconds = parseOptionalNumber(options, "capture-seconds", 30)
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
  const defaultScreenTextMarker = path.basename(diskPath, path.extname(diskPath))
  const screenTextMarker = parseOptionalString(options, "screen-text-marker", defaultScreenTextMarker)
  const screenTextTimeoutMs = parseOptionalNumber(options, "screen-text-timeout-ms", 30000)
  const screenTextPollMs = parseOptionalNumber(options, "screen-text-poll-ms", 250)
  const screenTextRequestTimeoutMs = parseOptionalNumber(options, "screen-text-request-timeout-ms", 2000)
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

  const startedAt = Date.now()
  const ffmpegExe = await resolveFfmpegExe(requestedFfmpegExe)
  const scenario = await runScenario({
    diskPath,
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
    screenTextMarker,
    screenTextTimeoutMs,
    screenTextPollMs,
    screenTextRequestTimeoutMs,
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
