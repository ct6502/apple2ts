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
```

## Notes

- The CLI does not talk to the browser emulator directly. It only uses the server API.
- A connected browser client is still required for most commands.
- Output is pretty-printed JSON by default. Use `--json` for compact machine-readable output.

