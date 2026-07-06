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
      }
    }

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
    } else if (!exportOk) {
      classification = "export_not_verified"
      message = "Launch completed but exported HDV was not found."
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
        launchOk,
        classification,
        message,
      },
      telemetry: {
        finalRunMode: launchOk ? "running" : "unknown",
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
