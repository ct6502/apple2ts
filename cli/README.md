# apple2ts-cli

CLI to control Apple2TS emulator using Apple2TS API.

## Run

From the repo root:

```bash
npm run cli -- --help
```

The CLI talks to the integrated server over HTTP. The server defaults to:

```text
http://127.0.0.1:6502
```

Override it with:

```bash
npm run cli -- --server http://127.0.0.1:6502 machine get
```

## Command Groups

- `machine`: get state, patch settings, boot/reset/pause/resume
- `cpu`: inspect or patch CPU registers and flags
- `debug`: `step-into`, `step-over`, `step-out`
- `breakpoints`: list/create/update/delete/clear
- `memory`: read ranges, dump full memory, write bytes
- `soft-switches`: read or trigger soft-switch addresses
- `drives`: inspect, protect, eject, or mount media
- `input`: send text, key, key-code, Apple key, or mouse input
- `snapshots`: list/create/activate/step-back/step-forward
- `save-state`: export or import `.a2ts` data
- `export`: export-focused workflows (`hdv-batch` for large-scale disk automation)
- `batch`: large-scale local disk automation with sharding and retries

## Examples

```bash
npm run cli -- machine get
npm run cli -- machine set --speed-mode 3 --debug-enabled true
npm run cli -- machine pause
npm run cli -- cpu get
npm run cli -- cpu set --pc 0x300 --a 0x41 --flag-z true
npm run cli -- breakpoints list
npm run cli -- breakpoints create --address 0xC000 --instruction true --halt true
npm run cli -- memory get --start 0x300 --length 16 --format hex
npm run cli -- memory set --start 0x300 --data "A9 00 8D"
npm run cli -- soft-switches get
npm run cli -- soft-switches set --addresses 0xC050,0xC057
npm run cli -- drives list
npm run cli -- drives mount-file fd1 --file public/disks/blank.po
npm run cli -- drives mount-url fd1 --url https://example.com/demo.woz
npm run cli -- drives mount-library fd1 --library-id totalreplay
npm run cli -- drives mount-basic fd1 --file program.bas
npm run cli -- drives mount-block fd1 --file demo.bin --address 0x300
npm run cli -- input text --text "PRINT CHR$(4);\"CATALOG\""
npm run cli -- input key --key Enter
npm run cli -- input apple --side left --pressed true
npm run cli -- input mouse --x 120 --y 80 --buttons 1
npm run cli -- snapshots list
npm run cli -- snapshots create
npm run cli -- snapshots activate snap:3
npm run cli -- save-state export --output session.a2ts
npm run cli -- save-state import --file session.a2ts
npm run cli -- export hdv-batch --input-dir disks --output-dir artifacts --runner-command "my-runner --disk {diskPath} --result {resultPath}"
npm run cli -- batch run --input disks.txt --output results.jsonl --runner-command "my-runner --disk {diskPath} --result {resultPath}"
```

## Batch Runner

Preferred command for this scenario:

- `npm run cli -- export hdv-batch ...`

Compatibility alias:

- `npm run cli -- batch run ...`

The batch runner is designed for large local corpora where source URLs are unavailable
or unreliable. Each output record includes stable content hashes and per-attempt status.

### Input

- `export hdv-batch`: `--input-dir <path>` is required and recursively scans for disk images.
- `export hdv-batch` runs the same VTOC exportability check used by the export UI and skips disks classified as non-exportable (`other`/`dosup`).
- `export hdv-batch` generates a per-run launch marker and embeds it into generated menu disk titles; the runner waits for that marker (`--screen-text-marker`) to reduce false positives.
- `batch run`: `--input <path>` is required.
- `batch run` supports:
	- text file with one disk path per line (`#` comments supported)
	- JSON array of strings
	- JSON array of objects with a `path` field

Relative paths are resolved from `--root` when provided, otherwise from the current working directory.

### Required options

- `export hdv-batch`: `--output-dir <path>` is required.
- For `export hdv-batch`, artifact paths are derived automatically:
	- `<outputDir>/results.jsonl`
	- `<outputDir>/videos`
	- `<outputDir>/logs`
	- `<outputDir>/runner-results`
	- `<outputDir>/exported-hdv`

- `batch run`: `--output <path>` is required (JSONL output file).
- One of:
	- `--runner-command <template>`: custom command template invoked per disk.
	- `--runner-preset <name>`: built-in Electron runner preset.

Built-in presets:

- `electron-hdv-dev`
- `electron-hdv-packaged`
- `electron-hdv-packaged-auto`

Preset-specific options:

- `--runner-app-dir <path>`
- `--runner-app-exe <path>` (required for `electron-hdv-packaged`)

The command template supports placeholders:

- `{diskPath}`
- `{resultPath}`
- `{videoPath}`
- `{logPath}`
- `{attempt}`
- `{runId}`
- `{rawSha256}`
- `{canonicalSha256}`

Your external runner should write JSON to `{resultPath}` when it succeeds.

When using `--runner-preset`, the CLI generates a command template automatically.

Contract options:

- `--runner-contract <name>` where name is:
	- `none` (default for `batch run`)
	- `electron-hdv-v1` (default for `export hdv-batch`)

If `--runner-preset` is used and `--runner-contract` is omitted, the CLI defaults to `electron-hdv-v1`.
For `export hdv-batch` presets, the generated runner command includes `--require-exported-hdv true`.
`export hdv-batch` always generates HDV files under `<outputDir>/exported-hdv` before launching the runner.

When `electron-hdv-v1` is active, the runner payload must follow:

- `cli/electron-hdv-runner-result.schema.json`

Minimum required payload fields for `electron-hdv-v1`:

- `contractVersion: 1`
- `scenario: "export-hdv-launch-test"`
- `status.exportOk` (boolean)
- `status.launchOk` (boolean)
- `timing.captureSeconds` (number)
- `timing.elapsedMs` (number)
- `artifacts.videoPath` (string)

If contract validation fails, the record is written as `runner_result_invalid`.

### Scale options

- `--shards <n>` and `--shard-index <i>`
- `--concurrency <n>` (optional, default: `1`)
- `--retries <n>` (optional, default: `0`)
- `--runner-timeout-ms <ms>`
- `--hdv-generate-timeout-ms <ms>`
- `--append true|false`

`export hdv-batch` does not accept `--run-id`; it is generated automatically.
`export hdv-batch` also does not accept explicit output artifact dirs (`--video-dir`, `--log-dir`, `--runner-results-dir`, `--exported-hdv-dir`).

### Result schema

Each JSONL line follows schema version 1 in:

- `cli/batch-result.schema.json`

When `runnerContract` is `electron-hdv-v1`, payload schema is:

- `cli/electron-hdv-runner-result.schema.json`

Identity fields include:

- `disk.rawSha256`: exact file bytes hash
- `disk.canonicalSha256`: normalized hash (currently strips 2IMG headers for `.2mg`)

### Example

```bash
npm run cli -- batch run \
	--input disks.txt \
	--output results-shard0.jsonl \
	--shards 8 \
	--shard-index 0 \
	--concurrency 4 \
	--retries 2 \
	--video-dir artifacts/videos \
	--log-dir artifacts/logs \
	--runner-command "electron-runner --disk \"{diskPath}\" --result \"{resultPath}\" --video \"{videoPath}\""
```

Starter runner in this repo:

- cli/electron-hdv-runner.mjs

It now runs as a process harness:

- launches an app command (default: apple2ts-app via npm start)
- waits for readiness window (5 seconds)
- keeps app alive for capture window (`--capture-seconds`)
- optionally runs a recorder command to write real video
- writes contract payload with launch/export classification

Runner-specific options:

- `--profile <name>` (default: `apple2ts-app-dev`)
- `--app-dir <path>` (default: `../apple2ts-app` from this repo)
- `--app-exe <path>` (used by packaged profile command templates)
- `--app-command <command>`
- `--recorder-command <command>`
- `--recorder-start-delay-ms <ms>`
- `--app-ready-timeout-ms <ms>` (wait for `[AUTOMATION] window-ready` marker)
- `--disk-ready-timeout-ms <ms>` (wait for `[AUTOMATION] disk-loaded|state-loaded` marker)
- `--server <url>` (Apple2TS control API base URL, default `http://127.0.0.1:6502`; use `none` to disable API control and rely on native fallback)
- `--menu-enter <true|false>` (default `true`; inject launch sequence (SPACE then ENTER) after disk/state ready)
- `--menu-enter-count <n>` (default `1`; number of launch-sequence attempts)
- `--menu-enter-delay-ms <ms>` (default `800`; delay before first launch-key press)
- `--menu-enter-interval-ms <ms>` (default `150`; delay between launch-key presses)
- `--menu-enter-timeout-ms <ms>` (default `3000`; timeout per launch-key API request)
- `--menu-enter-native-fallback <true|false>` (default `true` on Windows; uses native SendKeys if API injection fails or API is disabled)
- `--menu-enter-native-window-title <title>` (default: same value as `--window-title`)
- `--menu-enter-native-timeout-ms <ms>` (default `5000`; timeout for native SendKeys fallback)
- `--menu-enter-retry-count <n>` (default `2`; additional ENTER retry attempts after screen-text timeout)
- `--menu-enter-retry-delay-ms <ms>` (default `1500`; delay before each retry attempt)
- `--control-api-ready-timeout-ms <ms>` (default `15000`; max wait for control channel readiness)
- `--control-api-poll-ms <ms>` (default `250`; control readiness poll cadence)
- `--control-api-request-timeout-ms <ms>` (default `2000`; timeout per control readiness request)
- `--wait-for-screen-text <true|false>` (default `true`; advisory pre-launch check by polling text page)
- `--instrumentation-ready-timeout-ms <ms>` (default `3000`; wait for renderer automation instrumentation handshake event)
- `--screen-text-marker <text>` (default: source disk filename without extension)
- `--screen-text-timeout-ms <ms>` (default `30000`; full-window marker timeout used for final status classification)
- `--screen-text-prewait-ms <ms>` (default `1500`; short pre-launch marker wait before sending launch key)
- `--screen-text-poll-ms <ms>` (default `250`; poll cadence)
- `--screen-text-request-timeout-ms <ms>` (default `2000`; timeout per poll request)
- `--ensure-automation-markers <true|false>` (default `true` for `apple2ts-app-dev`; verifies renderer automation instrumentation exists in dist)
- `--automation-project-dir <path>` (default: runner current working directory)
- `--automation-dist-dir <path>` (default: `{automation-project-dir}/dist`)
- `--automation-markers <csv>` (default: `machine-text-sample,machine-text-fatal,launch-key-attempt,launch-before-,automation-instrumentation-version`)
- `--automation-build-command <command>` (default: `npm run build`; runs only when markers are missing)
- `--automation-build-timeout-ms <ms>` (default `180000`)
- `--window-title <title>` (window-only capture target, default `Apple2TS`)
- `--ffmpeg-exe <path>` (optional override for ffmpeg binary)
- `--exported-hdv <path>`
- `--require-exported-hdv <true|false>` (when true, fail if exported HDV path is missing)

Supported profiles:

- `apple2ts-app-dev`: launches Electron app via `npm run start:no-prestart -- -- --automation --disable-gpu --fullscreen --no-splash "{launchPath}"`
- `apple2ts-app-packaged`: launches packaged app via `"{appExe}" --automation --disable-gpu --fullscreen --no-splash "{launchPath}"`
- `apple2ts-app-packaged-auto`: same as packaged, but auto-detects `{appExe}` in common `out/` build paths
- `none`: no profile defaults (use explicit `--app-command`)

Placeholder tokens supported in `--app-command` and `--recorder-command`:

- `{diskPath}`
- `{launchPath}` (resolved launch target: exported HDV when present, otherwise source disk)
- `{videoPath}`
- `{captureSeconds}`
- `{exportedHdvPath}`
- `{appPid}` (recorder only)
- `{appExe}`
- `{ffmpegExe}`
- `{windowTitle}`
- `{captureX}`
- `{captureY}`
- `{captureWidth}`
- `{captureHeight}`

Runner behavior notes:

- Capture does not start until the app emits automation markers for window readiness and disk/state load.
- On Windows, if `--recorder-command` is omitted, the runner uses a default ffmpeg `gdigrab` command that records the app window region only (desktop source constrained to automation-reported window bounds).
- The runner fails immediately if fatal signatures are detected: `I/O ERROR`, `PATH NOT FOUND`, `SYNTAX ERROR`, or monitor crash pattern (`^[0-9A-F]{4}-` then newline and `*`).
- The runner logs sampled machine screen text (`[AUTOMATION] machine_text_sample ...`) when API polling is available to aid regex/debug analysis.
- For `apple2ts-app-dev`, the runner preflights renderer automation markers in dist and auto-runs `npm run build` when they are missing, preventing stale frontend bundles from silently dropping automation events.

Example using the starter runner:

```bash
npm run cli -- export hdv-batch \
	--input-dir disks \
	--output-dir artifacts \
	--runner-command "node cli/electron-hdv-runner.mjs --disk \"{diskPath}\" --result \"{resultPath}\" --video \"{videoPath}\" --log \"{logPath}\" --run-id \"{runId}\" --attempt \"{attempt}\" --raw-sha256 \"{rawSha256}\" --canonical-sha256 \"{canonicalSha256}\" --profile apple2ts-app-dev --app-dir \"C:/git/apple2ts-app\""
```

CI-friendly one-liner using built-in preset (no escaped runner template):

```bash
npm run cli -- export hdv-batch \
	--input-dir disks \
	--output-dir artifacts \
	--runner-preset electron-hdv-packaged-auto \
	--runner-app-dir "C:/git/apple2ts-app"
```

Example using packaged app profile on Windows:

```bash
npm run cli -- export hdv-batch \
	--input-dir disks \
	--output-dir artifacts \
	--runner-command "node cli/electron-hdv-runner.mjs --disk \"{diskPath}\" --result \"{resultPath}\" --video \"{videoPath}\" --log \"{logPath}\" --profile apple2ts-app-packaged --app-dir \"C:/git/apple2ts-app\" --app-exe \"C:/git/apple2ts-app/out/Apple2TS-win32-x64/Apple2TS.exe\""
```

Example using auto-packaged profile (no explicit `--app-exe`):

```bash
npm run cli -- export hdv-batch \
	--input-dir disks \
	--output-dir artifacts \
	--runner-command "node cli/electron-hdv-runner.mjs --disk \"{diskPath}\" --result \"{resultPath}\" --video \"{videoPath}\" --log \"{logPath}\" --profile apple2ts-app-packaged-auto --app-dir \"C:/git/apple2ts-app\""
```

Example payload written by Electron runner (`{resultPath}`):

```json
{
	"contractVersion": 1,
	"scenario": "export-hdv-launch-test",
	"status": {
		"exportOk": true,
		"launchOk": true,
		"classification": "ok"
	},
	"timing": {
		"captureSeconds": 30,
		"elapsedMs": 31782
	},
	"hashes": {
		"inputRawSha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
		"inputCanonicalSha256": "abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789",
		"exportHdvSha256": "fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210"
	},
	"telemetry": {
		"finalRunMode": "running",
		"cycleCountStart": 100,
		"cycleCountEnd": 400000
	},
	"artifacts": {
		"videoPath": "C:/artifacts/videos/sample.mp4",
		"logPath": "C:/artifacts/logs/sample.log"
	}
}
```

## Notes

- The CLI does not talk to the browser emulator directly. It only uses the server API.
- A connected browser client is still required for most commands.
- Output is pretty-printed JSON by default. Use `--json` for compact machine-readable output.

