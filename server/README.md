# Apple2TS Integrated Server

This directory contains the single-process server for Apple2TS.

WARNING: This server is intentionally limited to localhost (`127.0.0.1`) and is not hardened for remote access. Security controls are intentionally minimal for now because it is designed to work on localhost only.

The server has two responsibilities:

1. Serve the built client web app from `dist/`
2. Provide HTTP APIs that remotely control a connected browser client running the emulator

This is not a separate backend emulator. The emulator still runs in the browser. The server acts as:

- static file host
- client registry
- command broker
- status/memory API surface
- OpenAPI/Swagger documentation host

## Files

- `server.mjs`: Node.js HTTP server
- `openapi.json`: OpenAPI 3.1 specification for the remote-control API
- `swagger.html`: Swagger UI page for interactive API docs

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
5. Remote callers use `POST /api/control`
6. Server forwards commands over SSE to the browser
7. Browser executes the command using existing UI-to-worker control functions
8. Browser posts the command result to `POST /api/client/reply`

This keeps client changes minimal and avoids introducing a second service.

## Docs

- OpenAPI spec: `/openapi.json`
- Swagger UI: `/docs`

## Public API

### `GET /api/clients`

Lists connected browser sessions.

### `GET /api/status`

Returns the latest cached status from a connected client.

Optional query parameter:

- `clientId`

If omitted, the most recently active client is used.

### `GET /api/memory`

Requests a fresh memory dump from a connected client.

Optional query parameter:

- `clientId`

Memory is only available when the emulator is paused. Otherwise the browser returns an empty dump.

### `POST /api/control`

Sends a command to a connected browser client.

Request shape:

```json
{
  "clientId": "optional-client-id",
  "action": "setSpeedMode",
  "payload": {
    "speedMode": 3
  },
  "wait": true,
  "waitMs": 10000
}
```

If `clientId` is omitted, the most recently active client is targeted.

If `wait` is `false`, the command is accepted asynchronously and the server returns HTTP `202`.

## Supported Actions

Current commands implemented by the browser bridge:

- `getStatus`
- `getMemory`
- `setRunMode`
- `setSpeedMode`
- `setColorMode`
- `setMachineName`
- `setRamWorks`
- `setDebug`
- `setShowDebugTab`
- `keypress`
- `pasteText`
- `appleKey`
- `mouseEvent`
- `setMemory`
- `setSoftSwitches`
- `setDriveWriteProtected`
- `mountDisk`

Examples:

```bash
curl http://127.0.0.1:6502/api/status
```

```bash
curl -X POST http://127.0.0.1:6502/api/control \
  -H 'Content-Type: application/json' \
  -d '{"action":"setSpeedMode","payload":{"speedMode":3}}'
```

```bash
curl -X POST http://127.0.0.1:6502/api/control \
  -H 'Content-Type: application/json' \
  -d '{"action":"keypress","payload":{"key":"A","release":true}}'
```

## Mounting Disks

`mountDisk` expects base64-encoded disk content in `payload.dataBase64`.

Example payload:

```json
{
  "action": "mountDisk",
  "payload": {
    "driveIndex": 2,
    "filename": "disk.woz",
    "dataBase64": "AA=="
  }
}
```

The browser decides whether the image belongs in a floppy or hard-drive slot based on filename suffix and existing client logic.

## Current Constraints

- The emulator runs in the browser, not on the server
- The integrated server binds to `127.0.0.1` only
- Security hardening is intentionally minimal for now because this is a localhost-only workflow
- Control APIs require at least one browser client to be open against this server
- `GET /api/status` returns cached state, not a forced synchronous refresh
- `GET /api/memory` is synchronous but depends on a live connected client
- Swagger UI currently loads its JS/CSS from `unpkg`

## Good Next Steps

- add more API coverage for stepping, save states, breakpoints, and time travel
- add authenticated access if this is exposed beyond a trusted network
- self-host Swagger UI assets if external CDN dependency is undesirable
- add finer-grained memory read APIs instead of only full dumps
