# Apple2TS Client Feature Inventory

This document inventories the current Apple2TS client webapp feature surface before adding more server APIs.

The goal is to:

1. list what the client emulator already supports
2. separate currently exposed remote-control actions from broader client-only features
3. identify practical API groups to add next

This inventory follows the repository guidance to keep client webapp changes as small as possible.

## Current Remote-Control Coverage

The current browser bridge already exposes these actions through the integrated server:

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

Reference:

- `src/ui/remotecontrol.ts`

## Client Feature Inventory

### Emulator Lifecycle

Existing client controls include:

- boot
- reset
- pause
- resume

References:

- `src/ui/controls/controlbuttons.tsx`
- `src/ui/controls/debugbuttons.tsx`

### Machine Configuration

Existing machine configuration includes:

- Apple IIe unenhanced ROM
- Apple IIe enhanced ROM
- RAM size selection: 64 KB, 512 KB, 1024 KB, 4 MB, 8 MB
- speed mode selection
- debug mode toggle
- debug tab visibility

References:

- `src/ui/devices/machineconfig.tsx`
- `src/ui/controls/configbuttons.tsx`
- `src/ui/remotecontrol.ts`

### Display and UI Configuration

Existing display and UI controls include:

- color mode selection
- CRT scanlines toggle
- phosphor ghosting toggle
- sound enable/disable
- theme selection
- reset all settings

References:

- `src/ui/devices/displayconfig.tsx`
- `src/ui/controls/configbuttons.tsx`

### Keyboard, Mouse, and Game Input

Existing input-related features include:

- single keypress injection
- paste text into the emulator
- Open Apple / Closed Apple key press and release
- mouse event injection
- joystick button handling
- touch arrow keys
- Esc / Tab / Ctrl touch controls
- arrow keys as joystick
- touch joystick handedness and sensitivity
- tilt sensor as joystick

References:

- `src/ui/remotecontrol.ts`
- `src/ui/controls/keyboardbuttons.tsx`

### Debugger and Inspection

The debug UI already contains:

- CPU register display and editing
- processor status flag editing
- NMI toggle
- cycle count reset
- disassembly panel
- stack dump
- memory map
- memory dump
- soft-switch visibility

References:

- `src/ui/panels/debugtab.tsx`
- `src/ui/panels/state6502controls.tsx`
- `src/ui/main2worker.ts`

### Breakpoints

The client already supports:

- list breakpoints
- add breakpoint
- edit breakpoint
- enable/disable breakpoint
- delete breakpoint
- clear all breakpoints

References:

- `src/ui/panels/breakpointsview.tsx`
- `src/ui/main2worker.ts`

### Time Travel

The client already supports:

- create time-travel snapshot
- move backward
- move forward
- jump to a specific snapshot index
- inspect snapshot thumbnails
- save state with snapshots

References:

- `src/ui/controls/debugbuttons.tsx`
- `src/ui/panels/timetravelpanel.tsx`
- `src/ui/main2worker.ts`

### Memory and Binary Loading

The client already supports:

- full memory dump retrieval
- single-byte memory writes
- arbitrary soft-switch writes
- binary block loading into memory
- BASIC / source text loading through paste path

References:

- `src/ui/remotecontrol.ts`
- `src/ui/main2worker.ts`
- `src/ui/devices/disk/driveprops.ts`

### Disk and Media Handling

The client disk layer already supports:

- floppy and hard-disk image mounting
- automatic drive-slot selection based on media type
- write-protect toggle
- loading from raw in-memory buffers
- loading `.bin` files
- loading `.bas` and `.a` text files
- loading from local files
- loading from URLs
- loading from ZIP archives
- loading from Internet Archive
- loading from Google Drive
- loading from OneDrive
- local persistence/sync of changed disk images

References:

- `src/ui/remotecontrol.ts`
- `src/ui/devices/disk/driveprops.ts`
- `src/ui/devices/disk/diskinterface.tsx`

### Save State Import and Export

The client already supports:

- export emulator save state
- export save state with snapshots
- restore emulator save state from `.a2ts`
- preserve UI settings, breakpoints, speed/debug state, and audio-related state in save files

References:

- `src/ui/controls/controlbuttons.tsx`
- `src/ui/controls/debugbuttons.tsx`
- `src/ui/savestate.ts`

### Printer

The printer UI already supports:

- preview printer page output
- save stored printer data
- reprint stored data
- send to system printer
- clear/reset printer output

Reference:

- `src/ui/devices/printer/printerdialog.tsx`

### Serial and MIDI

The client UI already exposes:

- serial mode/device selection
- MIDI device selection
- Mockingboard-related audio UI

References:

- `src/ui/devices/serial/serialselect.tsx`
- `src/ui/controls/configbuttons.tsx`

## Candidate API Groups

To keep client changes small, the best next APIs are the ones already backed by existing client functions or worker messages.

### Group 1: Emulator Lifecycle

- boot
- reset
- pause
- resume
- step into
- step over
- step out

### Group 2: Breakpoints

- list breakpoints
- create breakpoint
- update breakpoint
- enable/disable breakpoint
- delete breakpoint
- clear all breakpoints

### Group 3: Time Travel

- list snapshots
- create snapshot
- move backward
- move forward
- jump to snapshot index

### Group 4: Save State

- export save state
- export save state with snapshots
- import/restore save state

### Group 5: Richer Debug Inspection

- get CPU registers
- set CPU registers
- set flags
- reset/set cycle count
- get stack
- get disassembly around PC or address
- get soft-switch descriptions

### Group 6: Richer Media APIs

- get drive details
- mount by URL
- mount by known library identifier
- unmount drive
- load binary block
- load BASIC source

## Recommended Implementation Order

Recommended order for the next API expansion:

1. emulator lifecycle and stepping
2. breakpoints
3. time travel
4. save-state import/export
5. richer debug inspection
6. richer media APIs

This order gives the server a useful remote automation and debugging surface while minimizing the amount of new client-side bridge work.
