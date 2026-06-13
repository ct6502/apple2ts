# Apple2TS Server API Design

This document defines the proposed v1 server API that will replace the current proof-of-concept remote-control shape.

The design goals are:

1. provide a clean resource-oriented API instead of UI-action names
2. keep browser/client bridge changes minimal
3. separate read models from mutation actions
4. keep browser-only implementation details behind the server boundary

## Design Principles

### 1. Resource-Oriented Public API

The public API should model the emulator as resources:

- `session`
- `machine`
- `display`
- `drives`
- `debug/cpu`
- `debug/memory`
- `debug/breakpoints`
- `debug/snapshots`
- `save-states`

The internal browser bridge can still use command names such as `setRunMode` or `mountDisk`, but those should not be the long-term public API.

### 2. Explicit Endpoints Over Generic Control

The current PoC uses a generic control endpoint. For v1, explicit endpoints are preferred because they:

- document intent clearly
- make validation easier
- produce more stable client contracts
- keep OpenAPI useful

### 3. Synchronous-by-Default for Localhost MVP

Because this server is localhost-only and currently targets a single active browser client, the v1 design assumes synchronous request/reply behavior for most endpoints.

That means:

- reads return fresh or current state directly
- mutations return the updated resource or action result directly
- no async job system is required in the first design pass

If later needed, long-running operations can adopt `202 Accepted` plus job resources without changing the resource model.

### 4. Minimal Client-Webapp Changes

Per repository guidance, server/API work should reuse existing client capabilities whenever possible.

The first implementation waves should target features already backed by:

- current UI actions
- existing `main2worker` functions
- existing debugger and drive state

## Proposed MVP Surface

The recommended MVP includes these groups:

### Group 1: Session and Machine

- `GET /api/session`
- `GET /api/machine`
- `PATCH /api/machine`

### Group 2: Lifecycle Actions

- `POST /api/machine/boot`
- `POST /api/machine/reset`
- `POST /api/machine/pause`
- `POST /api/machine/resume`

### Group 3: Input

- `POST /api/input/keys`
- `POST /api/input/apple-keys`
- `POST /api/input/mouse`

### Group 4: Drives

- `GET /api/drives`
- `GET /api/drives/{driveId}`
- `PATCH /api/drives/{driveId}`
- `DELETE /api/drives/{driveId}`
- `POST /api/drives/{driveId}/mount`

### Group 5: Debug CPU and Memory

- `GET /api/debug/cpu`
- `PATCH /api/debug/cpu`
- `GET /api/debug/memory`
- `PUT /api/debug/memory`
- `GET /api/debug/memory/full`
- `GET /api/debug/soft-switches`
- `POST /api/debug/soft-switches`

### Group 6: Execution Control

- `POST /api/debug/step-into`
- `POST /api/debug/step-over`
- `POST /api/debug/step-out`

### Group 7: Breakpoints

- `GET /api/debug/breakpoints`
- `POST /api/debug/breakpoints`
- `PATCH /api/debug/breakpoints/{breakpointId}`
- `DELETE /api/debug/breakpoints/{breakpointId}`
- `DELETE /api/debug/breakpoints`

### Group 8: Time Travel

- `GET /api/debug/snapshots`
- `POST /api/debug/snapshots`
- `POST /api/debug/snapshots/{snapshotId}/activate`
- `POST /api/debug/snapshots/step-back`
- `POST /api/debug/snapshots/step-forward`

### Group 9: Save States

- `POST /api/save-states/export`
- `POST /api/save-states/import`

## Response Model

Use a consistent envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Errors:

```json
{
  "ok": false,
  "error": {
    "code": "NO_ACTIVE_SESSION",
    "message": "No browser client is connected."
  }
}
```

Benefits:

- uniform client handling
- simpler docs
- easy future extension with metadata

## Resource Model Notes

### Session

Represents the active browser client attached to the localhost server.

Important fields:

- connection status
- client id
- pathname
- last seen timestamp

### Machine

Represents top-level emulator state and configuration.

Important fields:

- run mode
- speed mode
- machine name
- RAM size
- debug mode
- debug panel visibility
- text page
- drive summary

### Drive

Represents one mounted drive slot.

Important fields:

- drive id
- kind: floppy or hard drive
- filename
- mounted state
- write-protected state
- dirty state
- last write time

### CPU

Represents the editable processor/debugger state.

Important fields:

- registers
- flags
- cycle count

### Breakpoint

The API should expose a stable `breakpointId` even if the current client uses address-based identity internally.

That avoids leaking implementation details into the external contract.

### Snapshot

Represents a time-travel state.

Important fields:

- snapshot id
- index
- cycle count
- timestamp
- optional thumbnail
- active flag

## Synchronous vs Action Endpoints

Use:

- `GET` for reads
- `PATCH` for partial resource updates
- `PUT` for whole payload writes, such as a memory block
- `POST` for actions that are not natural resource replacement
- `DELETE` for eject/remove/clear actions

Examples:

- `PATCH /api/machine` is better than `POST /api/machine/set-config`
- `POST /api/machine/reset` is better than overloading `PATCH /api/machine`
- `DELETE /api/drives/{driveId}` is clearer than `POST /api/drives/{driveId}/eject`

## Recommended First Implementation Order

1. session and machine
2. lifecycle actions
3. debug stepping
4. breakpoints
5. snapshots
6. save-state import/export
7. richer drive/media operations

## Draft Spec

The draft OpenAPI contract for this design is in:

- `server/openapi-v1-draft.json`
