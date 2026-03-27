# Apple2TS Integrated Server

This directory contains the single-process server for Apple2TS.

WARNING: This server is intentionally limited to localhost (`127.0.0.1`) and is not hardened for remote access. Security controls are intentionally minimal because it is designed for a localhost workflow.

The server has two responsibilities:

1. Serve the built client web app from `dist/`
2. Provide an HTTP API for controlling a connected browser client running the emulator

This is not a backend emulator. The emulator still runs in the browser. The server acts as:

- static file host
- browser client registry
- SSE command bridge
- resource-oriented API surface
- OpenAPI/Swagger documentation host

## Files

- `server.mjs`: Node.js HTTP server
- `openapi.json`: canonical OpenAPI 3.1 contract for the v1 API surface
- `swagger.html`: Swagger UI page for interactive API docs
- `FEATURE_INVENTORY.md`: client feature inventory and candidate API groups
- `API_DESIGN.md`: v1 API design notes and resource model

## Run

Build the client first:

```bash
npm run build
```

Start the integrated server:

```bash
npm run serve
```

Defaults:

- host: `127.0.0.1`
- port: `6502`

Optional environment variables:

- `PORT`
- `COMMAND_TIMEOUT_MS`

Example:

```bash
PORT=6502 COMMAND_TIMEOUT_MS=15000 node server/server.mjs
```

## Architecture

The browser client connects back to the server after loading the app.

Flow:

1. Browser loads the Apple2TS app from this server
2. Browser registers itself with `POST /api/client/connect`
3. Browser opens an SSE stream on `GET /api/client/events`
4. Browser periodically posts state to `POST /api/client/state`
5. HTTP callers use resource-oriented endpoints such as `GET /api/machine` or `PATCH /api/debug/cpu`
6. Server forwards bridge commands over SSE to the browser
7. Browser executes those commands using existing UI-to-worker control functions
8. Browser posts the command result to `POST /api/client/reply`

This keeps client-webapp changes small and avoids introducing a second service.

## Docs

- OpenAPI spec: `/openapi.json`
- Swagger UI: `/docs`

## Implemented API Surface

Implemented v1-style endpoints:

- `GET /api/machine`
- `PATCH /api/machine`
- `POST /api/machine/boot`
- `POST /api/machine/reset`
- `POST /api/machine/pause`
- `POST /api/machine/resume`
- `GET /api/debug/cpu`
- `PATCH /api/debug/cpu`
- `POST /api/debug/step-into`
- `POST /api/debug/step-over`
- `POST /api/debug/step-out`
- `GET /api/debug/breakpoints`
- `POST /api/debug/breakpoints`
- `PATCH /api/debug/breakpoints/{breakpointId}`
- `DELETE /api/debug/breakpoints/{breakpointId}`
- `DELETE /api/debug/breakpoints`
- `GET /api/debug/snapshots`
- `POST /api/debug/snapshots`
- `POST /api/debug/snapshots/{snapshotId}/activate`
- `POST /api/debug/snapshots/step-back`
- `POST /api/debug/snapshots/step-forward`
- `POST /api/save-states/export`
- `POST /api/save-states/import`

The v1 OpenAPI contract also includes endpoint groups that are not implemented yet:

- `/api/input/*`
- `/api/drives/*`
- `/api/debug/memory*`
- `/api/debug/soft-switches`

## Examples

Get the current machine resource:

```bash
curl http://127.0.0.1:6502/api/machine
```

Pause execution:

```bash
curl -X POST http://127.0.0.1:6502/api/machine/pause
```

Update machine configuration:

```bash
curl -X PATCH http://127.0.0.1:6502/api/machine \
  -H 'Content-Type: application/json' \
  -d '{"speedMode":3,"debugEnabled":true}'
```

Read CPU state:

```bash
curl http://127.0.0.1:6502/api/debug/cpu
```

Create a breakpoint:

```bash
curl -X POST http://127.0.0.1:6502/api/debug/breakpoints \
  -H 'Content-Type: application/json' \
  -d '{"address":49152,"disabled":false,"instruction":true,"halt":true}'
```

Export a save state:

```bash
curl -X POST http://127.0.0.1:6502/api/save-states/export \
  -H 'Content-Type: application/json' \
  -d '{"includeSnapshots":true}'
```

## Current Constraints

- The emulator runs in the browser, not on the server
- The integrated server binds to `127.0.0.1` only
- Security hardening is intentionally minimal because this is a localhost-only workflow
- API calls that require live command execution depend on a connected browser SSE session
- The browser bridge remains the execution layer behind the public API
- Swagger UI currently loads its JS/CSS from `unpkg`

## Next Work

- implement the remaining v1 endpoint groups already described by `openapi.json`
- tighten bridge/session validation for multi-client correctness
- self-host Swagger UI assets if external CDN dependency is undesirable
- add automated route and bridge integration tests
