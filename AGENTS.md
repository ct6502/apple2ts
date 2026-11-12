# Apple IIgs Emulation Notes (apple2ts, branch `test/gs`)

Working notes for the 65816 / IIgs support. This used to be a 4000-line
chronological log; it is now a reference organised by subsystem: the hardware
facts we model, the traps that cost real time, and what is still open. History
lives in git.

---

## 0. Ground rules

**Reference implementations**

| path | use it for |
|---|---|
| `c:\dev\gssquared` | **gold standard.** `src/cpus/*`, `src/mmus/mmu_iigs.hpp`, `src/mmus/mmu_iie.cpp`, `src/devices/iwm/IWM2.hpp`, `src/devices/rtc/RTC_PRAM.hpp`, `src/devices/es5503/ensoniq.cpp`, `src/devices/adb/{ADB_Micro,ADB_Mouse,ADB_Keyboard}.hpp`, `src/display/display.cpp`, `src/display/VideoScannerIIgs.cpp`, `Docs/DevelopLog.md` |
| `c:\dev\kegs` | second opinion, plain C: `adb.c`, `doc.c`. Kenton's comments explain intent |
| `c:\dev\gsplus` | third opinion |

`web-a2e` is **not** authoritative — its cold-reset states, IWM softswitches and
status flags are incomplete, and copying them produced the `System Bad: GGGG0000`
loop. Never "improve" a gssquared behaviour by inventing something; port it.

**Machine facts that make sense of everything else**

- 65816 runs at **2.8 MHz in both modes**. `$C036` bit 7 = fast (1) / slow
  (1.024 MHz). There is no native-mode speed factor (one was added and removed:
  commit `76d9f58b`). Native code is simply faster because it does more per cycle.
- One video refresh is always 1/60 s. Speed mode changes how many CPU cycles fit
  into it; `$C036` changes what a cycle is worth. Both are handled by the video
  clock (§8), never by changing the frame length mid-flight.
- Banks `$00-$DF` are RAM, `$D0-$FF` is ROM. `$E0/$E1` are Mega II main/aux.
- **Two system ROMs.** ROM 01 is 128 KB in banks `$FE-$FF`; ROM 03 is 256 KB
  in banks `$FC-$FF`. The machine menu chooses between them (§9), and the live
  cursor lives in a different place on each (§6).

**Workflow constraints (learned the hard way)**

- **Never copy a disk image into `public/disks`.** Vite's watcher dies with
  `EBUSY` on a 32 MB file and kills the dev server; the browser then shows
  `ERR_CONNECTION_REFUSED`, which reads as "the emulator has no display".
  Serve images from `C:\Users\USER\AppData\Local\Temp\opencode\diskserver.cjs`
  (port 6503, `Access-Control-Allow-Origin: *`) and deep-link them:
  `http://localhost:6502/?machine=apple2gs&boot=true&drive=0#http://localhost:6503/GSOS601.po`
- Check the page before blaming the emulator: zero canvases = page never loaded;
  a canvas of the right size with `lit = 0` = emulator problem.
- Debug hooks are **request/response**, never sticky worker flags: a worker
  module can be re-evaluated under a live page (Vite HMR, machine switch) and
  silently lose module state.
- Headless-Chrome claims must be about observed data, and an ear test beats any
  offline analysis of buffer contents (a UI-gain or render-side fault is
  invisible in the PCM we hand to the audio graph).

---

## 1. CPU (65816)

- **Cycle accounting**: every bus access costs 1 cycle (`read8`/`write8`),
  `phantomRead()` charges a dummy read without touching the bus,
  `ADDR_CYCLES_816` holds the internal cycles per addressing mode (read / write /
  RMW), plus per-instruction extras (implied +1, shifts +1, pushes +1, pulls +2,
  taken branch +1 (+1 on page cross), JSR +1, JSL +1, RTS +3, RTI +2, RTL +2,
  BRK/COP +1, PER +1, MVN/MVP +2 first pass / +1 after). `processInstruction()`
  returns the accumulator and the run loop does `s6502.cycleCount += cycles`.
  `src/worker/gs_cycles.test.ts` pins published WDC counts (128 cases) and
  asserts emulation-mode instr/cycle parity with the IIe (~0.36-0.38).
- **`$AA` = TAX, `$8A` = TXA, `$CA` = DEX in every mode.** gssquared does the
  same in all five cores (`opcodes.hpp:271/281/142`). Do not "fix" this to PLY /
  BRK / PHY — that breaks the GS/OS boot, and gssquared is the reference.
- **8-bit mode: the high byte of A is the B register.** It must survive 8-bit
  ops untouched (`AND #$7F`, `ASL A`, ...). Seeing `A=$84FF` with M=1 is normal.
- **Overflow flag** must be computed bitwise:
  `(~(a ^ b) & (a ^ r) & 0x80) !== 0` (and `0x8000` for 16-bit). The obvious
  `!((a^b)&0x80) && ((a^r)&0x80) !== 0` is a JS type bug: `&&` returns `false`
  whenever the first term fails, and `false !== 0` is `true`, so V was set
  exactly when overflow is impossible. Six sites (8/16-bit ADC, 8/16-bit SBC,
  and both decimal-mode ADCs) shared it; the ROM's cursor reconcile trusts V
  absolutely, which is why mouse motion pinned to the screen edge.
- **Stack**: native instructions (JSL, RTL, PHD, PLD, PHB, PLB, PHK, PEA, PEI,
  PER) use `push8Wide`/`push16Wide`/... and `normaliseStack()` **after** the
  whole instruction. The plain helpers wrap to page 1 per byte and corrupt the
  high byte of JSL return addresses.
- **Interrupts**: the IIgs IRQ line is **level triggered** on `$C046` bit 7 and
  must be re-evaluated **every instruction**, not only inside the VBL window.
  Sampling only during VBL left `cpu.irqPending` asserted across the long
  non-VBL part of each frame and produced a spurious IRQ into `$C074` the next
  time the guest cleared I.
- **Run housekeeping runs every instruction.** An 8-instruction batch (11 % of
  V8 profile) deferred VBL/IRQ/motor/DOC catch-up/mouse stepper and starved the
  SmartPort reads during a ProDOS 8 boot (`INSERT SYSTEM DISK -ERR 01`), only
  in the real-time browser loop.
- **Peripheral hooks**: `specialJumpTable[$C7C0]` / `[$C7C3]` are checked before
  the opcode fetch in bank 00, syncing A/X/Y/S/P with `s6502`.
- **Absolute-indirect pointer bank**: `JMP (abs)` (`$6C`) fetches its 16-bit
  operand from the instruction's bank, but reads the target word itself from
  bank `$00`, not from PB. Reading the pointer through PB sent execution into
  bank `$11`'s data buffer and drove it into a BRK/COP there (XRick's interrupt
  code). `addrAbsoluteIndirect()` therefore uses the 16-bit bank-0 address,
  matching gssquared's `OP_JMP_IND`. Regression: `gs_jmp_indirect.test.ts`.
- **Absolute-indexed addresses carry over the 16-bit word into the bank.** In
  `addrAbsoluteX()`/`addrAbsoluteY()` the effective address is
  `(DB << 16) + operand + index`, *not* `(DB << 16) | ((operand + index) &
  $FFFF)`: gssquared's `address_abs_x`/`address_abs_y` deliberately leave the
  carry. Masking it made NFCDemo's MegaDemo `BBS-DEMO` copy loop (`DB=$11`,
  `STA $FC23,X`, X rising through `$E3xx`) write `$11DFFF/$11E000` instead of
  `$12DFFF/$12E000`, overwriting the loop's own `$11:E009/$11:E00C` until it hit
  a COP. The same test file carries the regression
  ("9D STA abs,X carries the index into the next bank"): `gs_jmp_indirect.test.ts`.

---

## 2. Memory map / MMU

- **ROM mapping derives from the image size, never from a ROM constant.** ROM 01
  is 128 KB in `$FE`/`$FF` (image offset 0 = `$FE`, `0x10000` = `$FF`); ROM 03 is
  256 KB in `$FC`-`$FF` (offset 0 = `$FC` … `0x30000` = `$FF`). `doSetRom()` sets
  `iigsRomFirstBank = 0x100 - banks` and `iigsRomBankFFOffset = (banks - 1) << 16`,
  and **every** read of "the ROM" derives from those: `memGet24`, the bank
  `$00/$E0/$E1` language-card window, the `$C071-$C07F` BRK/IRQ firmware and the
  `$C100-$CFFF` internal-ROM fallbacks. A literal `0x10000` in any of those sites
  silently reads bank `$FD` on ROM 03. `isIigsRom03()` is a size test, and the
  last bank (`iigsRomBankFFOffset`) is the IIe-compatibility image both ROMs
  expose through the language card. Source: `src/worker/roms/rom_gs_system03.ts`
  (256 KB, md5 `ba89edf2729a28a17cd9e0f7a0ac9a39`), embedded like the ROM 01 one.
- Banks `$00`, `$E0`, `$E1` see the fast ROM through the language-card window
  for `$D000-$FFFF` while `BSRREADRAM` is clear, and slot space `$C100-$CFFF`
  via `memGet`. `$C071-$C07F` is **BRK/IRQ firmware code** (the vectors point
  there), always read from bank `$FF` ROM, never from RAM.
- `$C100-$C7FF` must call `manageC800(slot)`: accessing slot 3 with `SLOTC3ROM`
  clear asserts `INTC8ROM` (80-column firmware owns `$C800-$CFFF`); `$CFFF`
  clears it. Skipping this sent A2DeskTop's `$C366 → $C803` into the Slot 7 card
  and popped the stack.
- `$E0` = `megaIIMain`, `$E1` = `megaIIAux`. Both are separate 64 KB arrays,
  **filled with `0x00` at power-on** (`0xFF` made the ROM take the
  `LDA $E115FE / BMI` error path straight into uninitialised RAM).
- `$01` = fast RAM at `memory[RamWorksMemoryStart + off]`. **Cold boot zeroes
  bank `$01`'s first 64 KB** (`iigsInitInterrupts`). ROM 03's task glue keeps the
  current record pointer at `$00:$1824` and dereferences `LDA [$1824],$9C`, i.e. a
  24-bit far pointer into **bank `$01` page 0**; a non-zero word there means "a
  callback is registered". The generic 0xFF power-on fill made `$01:$009C` read
  `$FFFF`, the gate at `$FE:0FC3` dispatched record `$FFFFFF` and the return-address
  patch at `$FE:2FDF` (`STA $02,S`) popped `$00:0000` — so ~20 s into the MYCRATE
  Finder the machine dropped into the monitor on `BRK #$02`. gssquared and KEGS
  heap-allocate fast RAM, so bank `$01` already reads `$00` for them; ROM 01 never
  enters that glue (measured: zero `$E1:04xx` task writes on ROM 01). Regression:
  `gs_mycrate_rom.test.ts` (both ROMs; commenting out that one `memory.fill`
  reproduces the monitor at frame 1210 ≈ 20 s).
- **Text page 2 shadowing is a ROM 03 feature — on the write side only.**
  gssquared's `shadow_is_enabled()` gates only the `$0800-$0BFF` window on
  `is_rom03` (= `rom_banks >= 4`), because ROM 01 has no TEXT2 shadow at all;
  TEXT1 `$0400-$07FF`, both hires windows and the SHR/AUXHGR windows are ungated.
  `shadowIigsWrite` checks `isIigsRom03()` for `$0800-$0BFF`, and that is the
  whole story: it decides whether a CPU store to `$0800` *reaches* the Mega II
  page. It says nothing about where the beam reads from, so `iigsTextMainSource`
  / `iigsTextAuxSource` must **not** mirror the gate. Extrapolating it into the
  renderer (commit `503ed876`: "ROM 01 keeps page 2 in fast RAM, so read fast
  RAM") hid every page written straight through `$E0`/`$E1` — which on ROM 01 is
  the only route to page 2, and what Applecorn's MOS does (§11.14).
- **Bank-`$01` text stores have to shadow into Mega II too.** `memSet24`'s bank-01
  path only wrote `memory[RamWorksMemoryStart + off]`, so a native guest keeping
  its 80-column page in bank `$01` (ProSel-16) left the Mega II aux page blank
  while the scanner still read only Mega II (§4) — the alternate half of each
  cell came out empty and the menu looked garbled. The write shadow follows the
  same switches gssquared's `bank_shadow_write` / `megaiiWrite` do: `$0400-$07FF`
  honours `$C035` bit 0 (clear → shadow), `$0800-$0BFF` honors bit 5 and is
  absent on ROM 01 (`!isIigsRom03() || bit set` → no shadow), and `$C029` bit 0
  selects `megaIIAux` over `megaIIMain`. The `$2000-$9FFF` SHR shadow stays as
  documented below. Regression: `gs_prosel.test.ts` (the ProSel menu decodes
  from the Mega II pages, not fast RAM).
- **Language-card RAM is never shadowed between bank 01 and bank `$E1`.** A stray
  `megaIIAux[off] = data` in the bank-01 LC write path corrupted the GS/OS volume
  prefix and produced `Fatal system error 0308`.
- **IOLC shadow inhibit**: `$C035` bit 6 (`SHADOW_INH_IOLC`) set means banks
  `$00`/`$01` **stop** shadowing I/O and the language-card ROM across
  `$C000-$CFFF`; those addresses become plain fast RAM (bank `$00` main or aux by
  ALTZP, bank `$01` always aux). gssquared models this as
  `is_iolc_shadowed() == !(reg_shadow & SHADOW_INH_IOLC)` plus
  `bank_shadow_read/write`, and `shadow_is_enabled()` never shadows `$C0xx`.
  Ignoring it corrupts anything that relocates code through bank 1 `$C000` —
  MCS's music driver did and ran off into `$00:E03B` (§11.1). `isIigsIolcShadowed()`
  gates both `memGet24` and `memSet24`, but only for `$C000-$CFFF`; the
  `$D000-$FFFF` language-card half still follows the `BSRREADRAM` rules on the
  assumption that nobody sets the inhibit expecting RAM there.
- **Bank-$00 shadow target follows the *effective* bank** (`iigsEffectiveAuxWrite` +
  `shadowIigsWrite`, from gssquared `calc_aux_write` / `shadow_is_enabled`). The
  video scanner reads Mega II main/aux, not fast RAM, so every bank-$00 store has
  to be mirrored into the same bank the IIe switch table picked: 80STORE+PAGE2
  for text pages `$04-$07` and hires `$20-$3F`, ALTZP for pages `$00-$01` and
  `$C0-$FF`, RAMWRT above that. Mirroring everything into Mega II **main** and
  skipping `$6000-$9FFF` entirely left RAMWRT SHR blits invisible: the SilkyGS
  ports (Super Mario Bros) draw with DB=$00 while RAMWRT is set, so the screen
  stayed a uniform palette-0 blue although the game was blitting every frame
  (§11.7). `$2000-$5FFF` needs either the SHR or the AUXHGR inhibit clear,
  `$6000-$9FFF` is SHR only.
- **`SPEED_SHADOW_ALL` (`$C036` bit 4) extends that shadow to banks `$02-$7F`**
  (`shadowIigsBankWrite`, from gssquared `set_ram_shadow_banks` +
  `bank_shadow_write`). GS/OS's block-copy helper (`$08:8A5F`) brackets a copy
  with `$C035 = $57` / `$C036 |= $10` and restores `$1E`/`$84` through long
  `$E0C03x` writes. The CPU bank selects the target: odd banks address Mega II
  aux (while `$C029` bit 0 latches the bank, linearized with SHR), even banks
  address main; the `$C035` inhibit bits still apply. With it set, `$xxC000-$xxCFFF`
  is the Mega II I/O page while IOLC shadowing is on. Ignoring the bit left
  Arkanoid (launched from MYCRATE) without its bricks and with permanent ball
  trails: its playfield compose lives in bank `$09`, and only the direct `$E1`
  paddle blit reached the screen (§11.10).
- **Floating bus**: `memory.ts` keeps a byte (power-on `$EE`) refreshed from the
  video scanner. An empty slot's `$C0xx` read returns it. Returning
  `Math.random()` made every run of MCS differ (76 reads, the first at `$C300`,
  the 80-column firmware entry, which software branches on). The Apple IIe
  `$C070-$C07F` paddle noise and `rand() <= 0xB4` are deliberate and tested
  (Castle Wolfenstein) — leave them.
- **Aux linearization (SHR / `$C029` bit 6)**: `phys = $2000 + ((x & 1) << 14) | (x >> 1)`
  for the `$2000-$9FFF` window; `is_aux_linear()` is `auxLinear || shrEnabled`,
  matching gssquared. Applied to bank `$E1` reads/writes, the bank `$01` shadow
  that feeds it, and inverted in `getShr()`.
- **Trap**: `vidhd.extractShrBuffer(memory, auxStart)` **adds `$2000` itself**.
  Passing the SHR window start doubled the offset and `slice()` clamped the
  result, so `processSuperHiRes()` returned `false` on every frame and the SHR
  screen was never drawn at all (the boot text still looked fine). Pass `0` and
  size the buffer `0xA000`. Whenever a fixed-size buffer comes back short,
  suspect a clamped `slice`.

---

## 3. Soft switches and registers

| addr | behaviour |
|---|---|
| `$C000/$C010` | legacy keyboard data / any-key-down. Real hardware clears bit 7 of `$C000` on **any** `$C010` access. |
| `$C026` | ADB micro data: write = command register, read = the micro's own report byte **first**, then the queued command response (KEGS `adb_read_c026` ADB_IDLE). |
| `$C027` | ADB micro status. bit 7 mouse data, bit 5 data register full, bit 3 keyboard data, bit 1 next `$C024` read is Y; bits 6/4/2 are the mouse / data / keyboard interrupt enables and the only writable ones. **Bit 0 always reads 0** — the ROM's boot-time command loop (`FF:851E`) spins on it before writing the next argument byte, so publishing "the micro still wants arguments" there deadlocks the self-test into 「Fatal system error-> 0911」. gssquared never sets `command_register_full`; KEGS masks bit 0 out. ROM 01 writes `$10` here at `FF:F9E0` (the data-interrupt enable, which is how the desk manager is woken), GS/OS `$40` at `$C47C`. |
| `$C02D` | `SLTROMSEL`, default `0b11110110` (slots 7,6,5,4,2,1 = card). Must track the configured cards. |
| `$C02E/$C02F` | video counter. The counter is 9 bits and runs `$100-$1BF` over the 192 visible rows, `$1C0-$1FF` over the first 64 VBL rows, and **`$0FA-$0FF` over the last six** (gssquared `get_vcounter()`: `$1FF + 1` is `$000`, which it then forces to `$0FA`). `$C02E = (vcounter >> 1) & 0xFF` (`$80-$DF` visible, `$E0-$FF` VBL, `$7D-$7F` in those last six rows); `$C02F = ((vcounter & 1) << 7) \| hcounter`, `hcounter` runs `$00` then `$40-$7F`. Tass Times spins at `$2F90` until `$C02E == $E8`. Reading the pair as one 16-bit value and doing `ASL / ADC #$0000 / AND #$01FF` on it rebuilds the raw 9 bits, which is how Stars & Planets waits for `$00FA` — modelling the wrap as `$1FA-$1FF` makes that value unreachable, and its title screen then never hands control to the program (§11.17). |
| `$C029` | bit 7 SHR, bit 6 aux linearize, bit 5 mono, bit 0 Mega II bank latch (aux vs main) |
| `$C030` | speaker. The cone toggles on **reads as well as writes** (Applesoft `BELL` is `LDA $C030`); both paths must call `checkSoftSwitches`. |
| `$C031` | disk control: bit 6 `EN35` selects the 3.5"/5.25" family, bit 7 `HDSEL` |
| `$C033/$C034` | RTC data/control (see below) |
| `$C035` | `STAT` shadowing: bit 0 = text page 1, bit 5 = text page 2 (clear = shadowed into Mega II main), bit 6 = `SHADOW_INH_IOLC` (see §2) |
| `$C036` | bit 7 = CPU clock: 1 = 2.8 MHz, 0 = 1.024 MHz; bit 4 = `SPEED_SHADOW_ALL` (§2); bit 6 is a ROM 03 power-on latch (cold reset seeds `$C0`, ROM 01 `$80`). Writes mask bits 6-5 back off unless the value is exactly `$40` on ROM 03 (KEGS `moremem.c`), so a stray shadow-enable cannot survive a speed write |
| `$C03C-$C03F` | Ensoniq DOC (§5) |
| `$C046` | `INTFLAG`: bit 7 = a source is pending AND enabled. **Cold boot must read 0**, or the ROM runs its diagnostic self-test and prints `System Bad: GGGG0000`. |
| `$C047` | interrupt acknowledge |
| `$C054/$C055` | 80-column page 1/2 firmware. On ROM 01 `FF:C054-C056` is a firmware epilogue and `$E1:00FF` is the ROM's **interrupt-nesting counter**, not a page register. |
| `$C068` | `STATE` register, read/write: ALTZP, PAGE2, RAMRD, RAMWRT, RDROM (`!BSRREADRAM`), BSRBANK2, INTCXROM. Must call `updateAddressTables()`. |
| `$C0E0-$C0EF` | IWM (§7) |
| `$C100-$CFFF` | slot space; see `manageC800` above |

`$C050-$C05D` deliberately keep the **generic** softswitch path. Replacing them
with gssquared's explicit status bits changed GS/OS's rendered palette (6
colours instead of >8) and broke six suites; returning floating bus for
`$C050-$C05F` and 0 for `$C000` were tried and reverted too.

**RTC / battery RAM** (`src/worker/iigs_clock.ts`, ported from
`RTC_PRAM.hpp`): two-byte command framing for 256 bytes of BRAM, a real seconds
counter from Unix epoch, and the warm-reset signature
`CB D2 C7 C2 10 A2 E8 03` seeded at BRAM `$B0-$B7`. `reset(coldBoot)` must clear
the transaction state, or a reboot mid-transaction fails BRAM framing and the
ROM takes the fatal-error path.

**Interrupt dispatchers** installed by `iigsInitInterrupts()`: the ROM overwrites
them with its own (`$E1:0010 = JML $FFB7CC`, the full manager), so the
hand-written minimal manager is dead code — harmless, do not build on it.
`$E1:0034 = JML $FEC5C8` (the ADB mouse dispatch that publishes the event
record) is **order-dependent, not a permanent install**: the ROM's own startup
loop at `$FF:FA62` re-stubs the whole `$E1:$0030-$0053` block with
`JML $FF:B5DE` after our cold-boot write, and a booted guest may replace it
again. Measured on Stars & Planets (ProDOS 16) it ends as the ROM's stub, and on
GS/OS 6.0.1 the mouse that actually arrives comes from the `$FF:C4xx`
Mouse-Card-compatible firmware, not from this vector (§11.18). So nothing may
assume the emulator's install is what runs.

---

## 4. Video

- Super Hi-Res source is 640x200 (or 320x200); output is **640x400**, each of the
  200 scanlines emitted twice, aspect 1.6. 320 mode also doubles X. Legacy Apple
  II output stays 560x384 / 1.458. Rendering is destination-driven, so games and
  the desktop fill the same space and the window never resizes.
- `getShr()` reads Mega II aux through the interleaved window; see §2.
- **The displayed SHR picture is captured scanline by scanline, not snapshotted at
  the refresh boundary.** `captureShrBeamLine(line)` runs from the run loop's beam
  crossing, and `getShrDisplayed()` is what `MachineState.shr` posts. A
  raster-scheduled guest erases and redraws band by band behind the beam, so a
  whole-window snapshot lands wherever the beam happens to be and shows layers no
  real IIgs ever displayed (TimePilot GS's clouds, §11.16). gssquared's VGC fetches
  each line's 160 bytes as it scans it, the SCB at `hc == 6` and the palette right
  after (`VideoScannerIIgs.cpp`: linear `$2000 + vc*160`), and that is what is
  reproduced — the same 32 KB per frame, in 200 pieces. `getShr()` deliberately
  stays the **raw window**: `getShrDump()` and ~15 `gs_*` assertions read memory,
  not the screen, so do not route them through the displayed frame. While SHR is
  off `getShrDisplayed()` falls back to it, which keeps the legacy Mega II display
  and the classic machines untouched.
- **Late stores fold into the captured picture, but only pixels painted late may
  be erased, and TimePilot's cloud bytes keep their existing erasures.** A store
  that lands after the beam has taken that row is folded into `shrBeamFrame`
  immediately: a late nonzero paints over whatever the beam captured (MsPacMan's
  top-row character would otherwise come out half painted over the maze) and
  marks that byte in `shrLatePainted`. A late zero clears only a byte that a late
  nonzero painted this refresh; a zero landing on a byte the beam captured as
  background is an erase behind the beam and leaves the captured picture alone.
  That is hardware behaviour: the VGC already took the background, and the real
  screen keeps it until the next refresh. A blanket zero fold wiped the captured
  top/back band of Kernkompetenz's rotating cube and made its apex disappear.
  `captureShrBeamLine()` clears the mark for the rows it captures, so a mark from
  the previous refresh cannot leak into this one. The exception is a TimePilot GS
  cloud byte (palette nibble 1 or 9): a late zero or opaque `0xFF` mask landing
  there is the cloud layer/mask erasing behind the beam, so the captured band
  stays; a coloured sprite pixel still paints.
  MSpacMan's maze uses the same palette nibble, so the exception is scoped by the
  mounted media (`setIigsCloudLayerFilename`), never guessed from bytes. The fold
  takes the whole SCB table (`$7D00-$7DFF`) and palette table (`$7E00-$7FFF`)
  unconditionally: those bytes are latched per line / per frame, not per-row pixel
  draws, so a late rewrite must reach the displayed table or a stale fill bit or
  palette byte can make a folded sprite invisible. Regression:
  `gs_shr_late_store.test.ts` (late paint, background-preserving zero,
  late-painted erase, cloud exceptions, tables); `gs_timepilot_flicker` is the
  end-to-end census.
- **Capture rows reset at the refresh boundary, not at beam line 0.** The guest
  writes during VBL after a refresh has ended but before the beam reaches line 0;
  clearing `shrCapturedRows` at line 0 leaves those stores seeing the previous
  frame's rows marked captured, so a mask pass gets folded as a late draw over the
  already-captured plane and erases it, giving TimePilot's aircraft exactly the
  flicker the late-sprite fold was meant to remove. `beginShrFrame()` runs at the
  `cycleInFrame` wrap (`motherboard.ts` run loop) and clears only the row flags;
  `captureShrBeamLine()` just captures. `lastShrFrame` itself is module-scope,
  because `doAdvance6502` is entered once per timer callback and a callback can
  arrive while the machine is already inside the new refresh; a per-call local
  initialized to `-1` would call `beginShrFrame()` on every callback and clear the
  flags mid-refresh. A speed-mode switch also resets the video clock but keeps
  frame 0 as the current boundary (`resetIigsVideoClock(true)`), so the rows the
  guest painted before the switch still fold late stores; starting at `-1` there
  would fake another mid-refresh reset. Regression: `gs_shr_late_store` ("a
  store before beam line 0...") and the browser plane census
  (`gs_timepilot_flicker`).
- **Scanline interrupt**: while exporting a visible line, if
  `memGet24(0xE19D00 + line) & 0x40` (SCB bit 6) call `iigsSignalScanline()`
  (gssquared `VideoScannerIIgs.cpp`). Without it GS/OS's Event Manager never
  erases/redraws its arrow and the factory cursor sits in the top-left corner
  forever. **The emulator no longer draws a cursor overlay** — the guest does
  (`drawIigsCursor`, `setHostCursorNorm`, `cursorX/Y` in `MachineState` are all
  deleted; do not bring them back).
- **Save-state completeness for the scanline interrupt**: the enable lives in
  `vgcIntReg`, not only in the `$C023` byte inside `iigsRegisters`, so a save
  must carry it outside RAM. `iigsGetVgcSaveState()` /
  `iigsRestoreVgcSaveState()` (in `src/worker/memory.ts`) persist
  `vgcIntReg`, `vblPending` and `quarterSecondPending`; a legacy save without
  the block falls back to `iigsRegisters[$C023] & $07` and loses only stale
  asserted bits, so the next scanline can raise the interrupt again. Without
  this a restored GS/OS desktop stops repainting the cursor even though ADB
  motion reaches the guest. Regression: `save_restore_vgc.test.ts`.
- **Text page source**: the IIgs legacy scanner reads **Mega II main/aux RAM**
  (banks `$E0`/`$E1`) and nothing else — `iigsTextMainSource` /
  `iigsTextAuxSource` return `megaIIMain` / `megaIIAux` unconditionally, for both
  pages and both halves of the 80-column merge. `$C035` only redirects *CPU*
  accesses into that RAM (§2), so reading fast RAM whenever a shadow bit says
  "inhibited" (or whenever the ROM is 01) hides whatever the guest put there
  directly: ProDOS 16 systems (`$E0:$0400` / `$E1:$0400`) render black, and
  Applecorn's MOS banner never appears (§11.14). Classic machines keep reading
  bank `$00`/`$01`. **The write side has to feed it:** bank-`$01` stores that
  bypass the bank-`$00` shadow switch table must still be mirrored into
  `megaIIMain`/`megaIIAux` under `$C035`/`$C029` (§2) or a guest keeping its
  text page in fast RAM (ProSel-16) shows blank columns. Regression:
  `gs_prosel.test.ts`.
- MouseText decoding must be enabled for `APPLE2GS` as well as `APPLE2EE`
  (`graphics.ts`, `copycanvas.ts`), or the startup bar shows `@ A L` instead of
  the Apple glyphs and lines.
- **VERA video renders every layer every frame.** `src/worker/devices/vera/video.ts`
  used to carry a `warp_mode` + `frame_count` shortcut that skipped layer/palette
  composition on 63 of every 64 frames "for performance". That is lost animation
  and missing lines, never acceptable. The shortcut is removed: if a frame is
  drawn, every enabled layer must be composed for it. A future optimisation must
  keep the picture complete, not drop frames or scanlines to buy CPU. Regression:
  `vera.test.ts` (Sprite Demo frames) and the full `video_step` frame checks.
- Known rendering defects still open: see §11.

---

## 5. Audio — Ensoniq ES5503 (DOC)

Registers (`src/worker/devices/iigs_ensoniq.ts`), from the Apple IIgs Hardware
Reference (the DOC has no public datasheet):

```
$E0  Oscillator Interrupt Register  bit7 IRQ, bits5-1 oscillator
$E1  Oscillator Enable   osce = ((v >> 1) & 0x1f) + 1, reset count 1, reset value 2
$E2  A/D
$00+n/$20+n  frequency (16-bit)      $40+n  volume (0-255)
$60+n  data (last byte read)         $80+n  wavetable pointer (page aligned)
$A0+n  control: 7-4 channel, 3 IRQ enable, 2-1 mode (00 free-run, 01 one-shot,
       10 sync, 11 swap), 0 halt
$C0+n  size: bits 5-3 (256B..32KB), bits 2-0 address resolution
SR = 894886 / (osce + 2)              DOC RAM: 64 KB, zero-filled at power-on
```

Rules that are easy to get wrong:

- `$C03D` is a **pipeline**: return the previously latched value and fetch the
  byte at the current address. `$E0` is fetched once per transaction (the ROM's
  IRQ dispatcher reads `$C03D` twice; without this it acknowledges two
  oscillators for one interrupt).
- A `$C03C` write with bit 6 clear must **clear `soundadrh`**.
- **`$E0` must return the oscillator it just acknowledged**: `retval = i << 1;
  rege0 = retval | 0x80; return retval | 0x41`. Returning the previous latch made
  every read look like "no interrupt", the ROM manager entered 35 times and
  dispatched to nothing, and Tass Times' `WAI` sound driver never woke.
- **Never gate sample generation on `vol > 0`.** The Apple TN #23 timer trick is
  a zero-volume oscillator with a frequency and the halt bit clear; it is what
  wakes the driver. Gate on `!(control & 1) && freq > 0`.
- Halt/wrap semantics (`haltOsc`, ported from `ensoniq.cpp`): free-run stops at
  the end of the wave **or at a zero byte**; sync/AM loops and retriggers the odd
  partner; swap starts the partner (`control &= ~1`, `acc = 0`); free-run wrap
  subtracts `(wtsize - 1) << resshift` to keep fractional phase; in every case
  `if (control & 0x08) irqpend = 1`. A CPU-written halt with bit 3 clear does
  not IRQ.
- **Wave data is signed int8**: `d = (byte ^ 0x80)`, sign-extended; mix is
  `trunc(sum / 8)`. gssquared does exactly this (`ensoniq.cpp:181,194`), and the
  unsigned version's DC rail made the old build *look* 1.7x bassier and ~3.7 dB
  louder while adding clipping harmonics. The `$C03C` low nibble (analog volume)
  is **not** applied to the DOC stream in gssquared (its slew is behind `#if 0`,
  `apply_volume=false`); keep it for diagnostics only.
- **Mono mirror**: if every non-halted enabled oscillator shares the same CA0,
  copy that channel to both L and R (`ensoniq_mirror_mono_to_stereo`).
- **Sampling is interleaved, not per frame**: `ensoniqCatchUp` in the run loop
  generates the samples due for the current cycle position into a scratch buffer;
  the buffer is posted once per refresh. Generating one block per frame capped
  the timer oscillator's halt rate at 60/s and played Tass Times' title at
  **exactly half tempo** with correct pitch — a bug an FFT cannot see.
- **The per-refresh budget *is* the tempo.** At `osce=32` a refresh posts
  `round(26320/60) = 439` frames; generating more than that per refresh clocks
  the whole march fast, so both the TN #23 timer tick and streamed samples speed
  up together. The 667/refresh overshoot was the module-state lookahead bug; the
  333/refresh shortfall was the active-oscillator gate. Both are fixed (see §11.2).
- **Catch up before the access, and keep the rate segments.** Every `$C03C-$C03F`
  access calls `docAccessCatchUp` before applying the write/read, exactly like
  gssquared's `ensoniq_write_C0xx` / `ensoniq_read_C0xx`; a register-mode `$E1`
  write calls `docRateRebase` after the chip write. A refresh is posted as
  rate-labelled segments, so frames rendered before the `$E1` change keep their
  old-rate duration instead of being relabelled by the rate current at the
  boundary. `ensoniqCatchUp` guards recursion from a halt-IRQ callback and defers
  the re-base until generation finishes. Regression: `gs_ensoniq.test.ts` ("a DOC
  write catches up before applying the new register value" and "an $E1 rate change
  splits the refresh block into old-rate and new-rate segments").
- **XRick is the ear test.** Its DOC streamed effects and music were confirmed
  audibly correct once catches ran before the access and rate segments landed;
  the raw PCM boundaries stay continuous (1.03x the interior slope, so no clicks),
  and the boot probe showed ≤30 frames of drift over 1631 refreshes.
- UI transport: `iigs_ensoniq_audio.ts` queues blocks with
  `nextTime += frames / rate`, and the gain is **1.0** (unity, as gssquared's
  `apply_volume=false` stream).
- **The transport resamples, not the AudioContext.** `resampleDocBlock` carries a
  fractional read position (plus the previous block's last frame) across blocks and
  builds every `AudioBuffer` at `ctx.sampleRate`. Handing the context one
  DOC-rate `AudioBufferSourceNode` per refresh makes *it* resample each block from
  phase zero, and `outputRate()` is never an integer divisor of the device rate —
  439 frames at 26320 Hz is 800.68 device frames, so ~1.7 frames per block are
  never emitted and every 16.7 ms boundary lands on a step. Measured on real Tass
  Times title PCM: boundary jumps 2.32x the stream's own interior slope (0.93x with
  the carry), which is the clicking noise riding on any DOC stream. gssquared hits
  the identical thing with SDL and says so: "feeding SDL small chunks at the raw DOC
  rate made SDL's internal chunk resampler glitch audibly". Do not port its ±0.5%
  queue-depth servo: it would detune the music by up to 8 cents, and our lead
  hysteresis already handles a dry queue. Regression:
  `src/ui/devices/audio/ensoniq_resample.test.ts` (fails on the old code: the buffer
  comes back at 26320 instead of the device rate).
- Open: `$00-$FF` of DOC RAM must be non-zero before the Note Synthesizer path is
  used (TN #23).

---

## 6. Input

### Keyboard

The IIgs's keyboard is ADB device 2 **and** drives the legacy `$C000`/`$C010`
register in parallel (every key with an Apple II ASCII value goes to both).
`setKeyboardState()` must therefore queue the ADB event **and fall through** to
`setKeyStrobe`; the early return that shipped with ADB delivery left ProDOS-8-era
software (Tass Times) with no keys at all. ADB event bytes: keycode on down,
`code | 0x80` on **up** (the opposite of the IIe convention); host auto-repeat is
not re-queued. The momentary modifier keys are the exception — see below.

`handleKeyMapping()` is the identity unless a game matches, so `"\n"` arrives as
10, not RETURN — the Apple II RETURN is `0x0D`.

**The IIgs letter case comes from ADB, not from the browser's text.** The host
event's `key` carries whatever Caps Lock and Shift the browser applied, and
`convertAppleKey()` still answers that host ASCII for classic machines. On the
IIgs branch `setKeyboardState()` instead computes the legacy `$C000` byte from
the ADB keycode plus the live `$C025` modifiers (`adbKeycodeToAscii`, transcribed
from gssquared `ADB_ASCII.hpp`). Letters start lowercase; Caps Lock flips bit 2
on **key-up only** (gssquared `ADB_Micro.hpp:505`) and Shift bit 0 uppercases.
This is what fixes two measured GS/OS bugs: Caps Lock or no Caps Lock used to
print uppercase because the old path trusted the host text, and Backspace arrived
as `$08` (left arrow) because `convertAppleKey()`'s Backspace special case ran
before the ADB; ADB_DELETE ($33) maps to `$7F`, the delete GS/OS expects.
Regression: `gs_keyboard_adb.test.ts` ("Caps Lock toggles on key-up…",
"Shift changes ADB letters and Backspace maps to delete 0x7F").

**Key chords live in `$C025`, nowhere else** (`src/worker/iigs_adb.ts`). An ADB
event byte carries exactly one keycode and has no modifier field, so while `$C025`
reads 0 a chord is physically unexpressible: Closed Apple + Escape arrives as a
bare Escape. Layout (gssquared `adb_mod_key_t` in `ADB_Keyboard.hpp:6`, read
against `ADB_Micro.hpp:503-504`): bit0 shift, bit1 control, bit2 caps lock, bit3
auto-repeat, bit4 keypad, bit5 "modifiers updated" latch, **bit6 closed (Closed
Apple, ADB_OPTION `$3A`), bit7 open (Open Apple, ADB_COMMAND `$37`)**. The names
are the reverse of the bits they drive: ADB_COMMAND is Open Apple and ADB_OPTION
is Closed Apple. `queueKeyboard()` derives the byte from the event:
`MODIFIER_KEY_BITS` maps the `$36-$3A` modifier keycodes to their bit, a down
(bit7 clear) sets it plus `MOD_LATCH`, and the same keycode with bit7 set clears
it. `readModifiers()` drops the latch after a read; the bits stay. The old
`setModifiers()` is gone and had no callers: modifier state is a consequence of
the event stream, so a side-channel setter would let a test assert a chord the
guest could never have been sent.

- **The two Apple keys are different ADB keys.** Open Apple is ADB_COMMAND
  `$37` and drives bit7; Closed Apple is ADB_OPTION `$3A` and drives bit6.
  `DOM_TO_ADB` maps `AltLeft`/`MetaLeft` to `$37` and `AltRight`/`MetaRight` to
  `$3A`. The old table mapped both Alt keys to `$3A`, so every host binding's
  Closed Apple reported Option and no bit7 chord existed.
- **A key-up reports its own keycode.** The old single `adbKeyDownCode` tracker
  held one key: hold Closed Apple, press Escape, release the Apple key first, and
  the release went out as *Escape* going up, leaving the Closed Apple bit stuck in
  `$C025` forever. An up whose down was never seen still goes out, so a stuck key
  cannot survive a focus loss.
- **A pure modifier does not touch the legacy strobe.** `convertAppleKey()`
  answers `-1` for modifier keys, so `state.key < 0` returns after the ADB queue;
  falling through would have cleared the any-key-down line of the key actually
  being held under the chord. A real key still **deliberately** falls through.
- **The host has to send them at all.** `canvas.tsx` `sendAdbModifier()` forwards
  whatever `adbModifierRole()` recognises keydown and keyup through
  `passAdbModifierKey()`, outside the single-key `hardwareKeyboardKey` tracker;
  `releaseAdbModifiers()` (in `releaseBlurredModifierState()`) releases whatever
  was still held — now a per-`code` list, so holding both Alts and releasing one
  cannot drop the other. **Caps Lock goes through this path too**: it is a
  hardware toggle, not a held bit, but the worker consumes its key-up and flips
  `$C025` bit 2, so excluding it left every GS/OS letter lowercase (or uppercase
  through the old host-text path). The gate returns early on a non-IIgs machine:
  a `key: -1` event there would cancel the held key's AKD strobe for nothing.
- **"Which host key is an Apple key" lives in `src/ui/adbmodifiers.ts`**, and the
  full binding set — not just `AltLeft`/`AltRight` — must drive `$C025`. On
  Windows `Alt + Esc` is stolen by the OS (it cycles windows), so the physical
  `rAlt-Esc` chord a browser test had been "proving" is **unpressable**; only the
  numpad bindings reach the page. `isOpenAppleCode`/`isClosedAppleCode` therefore
  accept `Numpad0`/`Numpad5` and `NumpadDecimal`/`NumpadEnter` alongside the Alt
  and Meta pairs, and `canvas.tsx`'s four hand-rolled `isOpenAppleDown/Up`,
  `isClosedAppleDown/Up` predicates are deleted in favour of that one table, so
  the ADB path and the legacy `OPEN_APPLE`/`CLOSED_APPLE` paths cannot drift apart
  again. `handleKeyDown` also had to call `sendAdbModifier` **before** the
  numpad-fire and Alt-`preventDefault` early returns, or a recognised binding
  set `$C025` for the key it suppressed. Regression: `adbmodifiers.test.ts` (every
  binding resolves to its role; `Meta` only with `useOpenAppleKey`; plain keys
  return `null`) — removing the numpad clauses turns it red.
- **The on-screen Apple keys take the same path.** `keyboardcontrol.tsx` pairs
  `OPEN_APPLE`/`CLOSED_APPLE` with `passAdbModifierKey("AltLeft"|"AltRight")` on
  both press and release, so a click drives `$C025` like a real key. The on-screen
  Caps Lock click also posts an ADB Caps Lock key-down plus key-up, because the
  GS/OS letter case follows the micro's bit 2 rather than the UI preference.
  Shift and Control on that panel are latching toggles, not momentary presses, and
  are intentionally not mapped.
- **Measured against GS/OS 6.0.1**, which is what made this worth documenting:
  the Finder **consumes `$C000`**, polls `$C025` ~1.1 times per frame, and **never
  polls ADB device 2**. So `$C000` carries the key and `$C025` carries the chord —
  neither pipeline is optional.
- **The ROM's Desk Accessories menu is the ADB micro's own report, not a key.**
  `Ctrl + Open Apple + Esc` never reaches the guest as a keystroke: KEGS `adb.c:1687`
  and gssquared `ADB_Micro.hpp:1026` (`desktop_manager_key_sequence`) intercept the
  sequence *in the micro*, latch a data-register byte whose **bit 5** means "the
  desk-manager key sequence", and raise the ADB **data-register interrupt** — which is
  why ROM 01 writes `$10` to `$C027` at `FF:F9E0` during boot (that enable bit).
  `queueKeyboard()` recognises the three-key form and returns `true`; the Escape is
  **swallowed**, not buffered (both references take an `else if`), so it appears in no
  ADB key register and, because `setKeyboardState()` honours the return value, in no
  legacy `$C000` either — on real hardware `$C000` is fed from that register, so a key
  the micro did not buffer cannot show up there. Reaching the report first needed the
  `$C027` layout fixed (§3), and that is what the `0911` fatal error was: bit 0 is the
  command-register-full flag the ROM's boot loop spins on, so it must stay clear.
  - The menu belongs to the **ROM's** desk manager, so it is visible on the startup
    screen and under ProDOS 8. Under booted GS/OS the report is delivered and consumed
    with nothing drawn, which is authentic — GS/OS owns the desk manager there — so the
    menu item is not a way to summon the drawer described below.
  - UI: `passIigsDeskPanel()` posts `MSG_MAIN.IIGS_DESK_PANEL` (fire-and-forget) and the
    worker runs `openIigsRomDeskPanel()` while `RUN_MODE.RUNNING`. It injects ADB events
    only — no `$C000`, no closed loop — because the micro answers the sequence itself.
    Two entries carry it, both `machineName === "APPLE2GS"` only: a one-click
    `faDesktop` push-button in the top bar (`src/ui/controls/configbuttons.tsx`, id
    `tour-iigs-desk-button`, tooltip `machine.iigsDeskPanel`) and the machine-menu item
    under it. The button exists because the menu path costs two clicks (gear → item) and
    the real chord costs three held keys.
  - Regression: `gs_rom_desk_panel.test.ts` — the micro in isolation (report latched and
    read back as `$20`, the interrupt raised and cleared, two-key forms left as ordinary
    keys, report ahead of a queued command response, and `$C027` bit 0 clear while a
    multi-argument command is still being framed), plus a no-disk ROM boot that first
    asserts the boot *finished* (`Check startup device!`, no 「Fatal system error->
    0911」) and then that its text page really shows
    `Desk Accessories / Control Panel / Alternate Display Mode`.
    Disabling the intercept turns 4 cases red and the boot stays at
    `Check startup device!`; re-adding the bit-0 report turns 3 red, including the boot.
  - **Verified in the real UI** (`Temp\opencode\gs_rom_desk_ui.cjs`,
    `gs_rom_desk_chord.cjs`, `gs_rom_desk_button.cjs`, no disk, fresh Chrome profile):
    the one-click top-bar button changes 68 canvas rows, clicking the machine-menu item
    changes 90, and pressing the physical chord
    `Ctrl + Numpad0 (Open Apple) + Esc` changes 89 — all three draw the same screen:
    title `Desk Accessories`, `Control Panel`, `Alternate Display Mode`, `Quit`, and the
    `Select: ↓↑   Open: ↵` footer. `gs_rom_desk_button.cjs [waitS] [port] [machine]`
    also answers the visibility question: `present: true` with the `桌面配件（…）`
    tooltip on the IIgs, `present: false` on the IIe. The earlier browser failure was
    not the UI: the no-disk boot itself had died at 「Fatal system error-> 0911」, so
    the click had no desk manager to wake.

**The GS/OS DA (Desk Accessories) drawer** opens on Closed Apple + Escape, which a
user presses with the bindings above — there is no injected function for it, because
the same closed loop that types a key (`sendKeySequence()`, waiting on the `$C010`
strobe) is what a chord needs: the Closed Apple bit (6) must already be in `$C025`
when the guest reads the Escape, and both the legacy latch and the ADB key register
hold exactly one value, so the release has to wait for the guest to take the press.
The shape that works is (Closed Apple down) + (key in `$C000`) + (Closed Apple up),
and putting the modifier downs in `onConsumed` does not: a one-key sequence calls
`onConsumed` and then `finishKeySequence` in the same tick, so press and release
land together and nothing is "held". `isKeyboardInputBusy()` short-circuits an
injection that would corrupt a sequence already in flight.
- Regression: `gs_command_key.test.ts` boots GS/OS on the real desktop and proves
  the guest **consumes** the legacy `$C000` strobe while the modifier bit is still
  held — Closed Apple (bit6) + Escape, and Open Apple (bit7) + `W`, which arrives as
  the ADB's lowercase `w` in `$C000`. The Finder on this boot leaves the volume icons
  on an unframed desktop, so the old "front window closes" row measurement was a
  boot-state artefact, not a chord; do not build a window assertion on it again.
  Driving no `$C025` turns the chord cases red; re-merging `AltRight` onto `$3A`
  turns the closed/open distinction red.
- **The drawer itself does not open, and it is not our rendering.** An earlier
  note here claimed no local image has a `Desk Accs` folder. That was a bad
  needle-scan of raw sectors and it is **false** — decoded with
  `Temp\opencode\prodos_dir_entries.cjs`, every GS volume here ships a *populated*
  one: GSOS601.po blk 771 (`controlpanel`, `zipda`, `chronosiiv2.0`, `mr.apple`),
  SystemDisk.2mg blk 543 (`controlpanel`), MYCRATE.2MG blk 585 (10 entries incl.
  `calculator`, `mediacontrol`, `niftylist.cda`), freegemas / AlterEgo blk 1437
  (11 entries). Three measurements then localised the fault:
  1. the Finder's boot-time DA scan **does** read that media — a SmartPort
     ReadBlock probe on MYCRATE logged block 585, then 586-619 (the whole
     ControlPanel file) and 11540 (NIFTYLIST.CDA);
  2. the menu-bar drawer hole is absent in the **guest's own** Super Hi-Res
     bytes: decoding the top 12 SHR lines of a booted GSOS601 desktop gives the
     clock glyphs at x 276-311 and white pixels at x 312-318 on lines 1-9
     (column 319 is the black screen border), i.e. the Finder never drew it, and
     our renderer never dropped it;
  3. gssquared and KEGS contain no "drawer" code at all, which is consistent —
     the hole is pure guest drawing.
  So Closed Apple + Esc is delivered and taken (the Finder reads the Escape out of
  `$C000` while the Closed Apple bit (6) is still held in `$C025`) but there is
  nothing on this media for it to open. *Why* the Finder ends with an empty DA list after reading the DA files is an
  open guest-side question, plausibly the same family as the QuickDraw II mask/transfer
  defects (§11.5). This is why the machine-menu item is labelled and wired for the
  **ROM** menu above rather than the drawer: it is the DA screen that demonstrably
  appears, and the drawer chord stays covered as a chord, not as a visible result.

### ADB micro-controller (`src/worker/iigs_adb.ts`)

Commands to `$C026` are the **ADB micro** command set, classified by bits 7-6:
`00xxxxxx` micro commands (abort/reset/flush/modes/config/micro memory/replies),
`01xxxxxx` FDB housekeeping, `10xxxxxx` transmit 2 bytes (FDB *listen*),
`11xxxxxx` poll FDB (FDB *talk*). Two framing rules that hang GS/OS if wrong:

1. **Controller replies carry no header** — payload starts with the count.
2. **FDB poll replies do** — bit 7 present, bit 6 micro reset, bits 2-0 = count-1.

Also: the argument counter is `cmd.length - 1 === argumentsExpected` (seeding it
with 1 executed 2-argument commands after one argument and parsed the second as
a new command).

Device model: register 3 is the status word `[event, addr | handler | SRQ]`
(init `[0, addr | 0x20]`); mouse register 0 holds the motion report; the keyboard
latch starts at `$FF,$FF` (zeros read as a keypress). Commands `$04`/`$05`
(modes) and `$06` (config, bytes = `mouse_ctl << 4 | kbd_ctl`) change whether
motion is reported at all — KEGS drops `$C024` and the mouse IRQ when
`modes & 0x02` or the device/controller addresses disagree.

**Keyboard auto-poll off means SRQ mode.** Bit 0 of the modes byte
(`ADB_MODE_KBD_AUTOPOLL_OFF`) is what XRick/Wolf3D's ADB driver sets with
`$04,$01` before installing a `_SRQPoll` completion routine. gssquared calls the
mask `keyboard_auto_poll_enabled` (`ADB_Micro.hpp:25`) although its
`process_event` comment says auto-poll is disabled and it branches into SRQ when
the bit is set; the reference's mask name is a misnomer. In that mode the
ROM's keyboard interrupt enable (`$C027` bit 2) is not what carries a key: a
host key event must instead latch the micro's data-register report with bit 3
("service request valid", `DATA_REPORT_SERVICE_REQUEST`) so the report byte is
`$08`; the data interrupt enable (`$C027` bit 4) then raises the interrupt and
the ROM dispatcher (`FF:BE5A` in ROM 01's area) calls its SRQ service. Without
the report the key is only visible through `$C027` bit 3 and no interrupt ever
asserts. The report's byte-count field stays 0 (status byte, no response bytes),
as gssquared's `read_data_register()` leaves `response_bytes` at zero for this
path. A host key up latches the same report; the auto-repeat guard above still
applies. Regression: `gs_keyboard_adb.test.ts` ("an SRQ-mode host key latches
the data-interrupt service request report" and "without SRQ mode a host key
makes no data report").

**`$11` ("send FDB keycode") is an echo of a key, not a new host event.** A
driver that has received a key through SRQ hands it back to the micro with
`$11` (XRick's `PassADBKeyIfOk` does this). That writes the micro's own key
latch but must **not** latch another service-request report: doing so makes the
completion routine interrupt itself forever, which is the XRick/Wolf3D key loop.
gssquared `store_key_to_buffer()` (`ADB_Micro.hpp:698/608`) writes `key_latch`
and leaves `send_data_register` alone. The latch holds a mapped Apple II ASCII
byte plus the key-present bit, not the raw FDB keycode: `$11` runs the keycode
through `map_key(lang, code, empty modifiers)` before storing it, so K `$28`
becomes `'k' | $80 = $EB`; an unmapped keycode becomes `$80` (present, no ASCII).
The modifier byte beside it carries the keypad flag (`0x10`) for raw keycodes
`$43-$5C` (gssquared `ADB_Micro.hpp:605`), not the live modifiers. Regression:
`gs_keyboard_adb.test.ts` ("a guest `$11` echo writes the key latch without
latching another report", "a guest `$11` echo keeps the keypad flag for keypad
keycodes").

**Mouse report layout** (gssquared `ADB_Mouse.hpp`, KEGS `adb.c:1557`):

```
register 0 byte 0:  bit7 = RIGHT button (1 = up) | bit6 = moved right | bits5-0 = X
register 0 byte 1:  bit7 = LEFT  button (1 = up) | bit6 = moved up    | bits5-0 = Y
```

- Magnitude is a **7-bit two's complement** field: `(dx & 0x3f) | (dx < 0 ? 0x40 : 0)`,
  **not** `abs(dx) & 0x3f`. Encoding the absolute value delivered a leftward move
  of `-m` as `m - 64` (only `-32` was correct).
- **Both buttons in the same byte is the bug**: writing one button bit into both
  bytes made one physical click look like two transitions, so GS/OS read a single
  click as a double click (icons opened) and the ROM's post loop ran twice. The
  CPU-level PostEvent dedup that used to paper over this is **removed** — do not
  restore it. `updateButtonDown()` sets bit 7 of each byte only and leaves the
  motion bits alone; `setMouseButton(0|1, pressed)` sets one latch and
  `patchReportButton()` folds the live state into an unread report.
- Y must be captured **before** `consumeReport()` overwrites the register.
  `hasMouseData()` must include an unread report, and `consumeReport()` re-latches
  any leftover motion, so the IRQ deasserts and re-asserts per chunk instead of
  latching forever (one latched IRQ starved the Finder).
- **An unread report is never overwritten; queued motion waits behind it.**
  `latchMouseReport()` returns while `mouseHasData || reportInProgress`, so host
  events that arrive before the guest reads register 0 stay in
  `pendingX/pendingY` and go out as one clamped chunk when `consumeReport()`
  clears both flags. Without that guard every host move re-latched over the
  unread pair, so a burst of eight `-1` reports reached the guest as a single
  `-1`. That matters because a guest may decode the field itself: Excalibur masks
  a negative report with `& $3F`, XORs `$3F`, and subtracts the result, so `-1`
  (field `$7F`) subtracts zero and a collapsed burst produces no motion at all.
  The seven-bit encoding above is unchanged — the bug was dropping queued motion,
  not encoding it wrong. KEGS `adb.c` keeps the same target-minus-delivered
  accumulator. Regression: `gs_mouse_capture` (two × eight ±1 events must drain
  as ±8, and motion arriving between the X and Y reads must not replace the Y
  byte of the report already in progress).
- **Closed-loop cursor sync** (`devices/mouse.ts`): the host pointer sets a target
  (`round(normX * 639)`, `round(normY * 399) >> 1`, halved again in 320-mode SHR);
  `iigsMouseStep()` (once per frame) reads the guest cursor from the holes and
  injects a ≤ ±63 chunk toward it, waiting for the guest to consume each step.
  Measured convergence is within one count on both axes, edges included.
- **The loop needs live feedback, not just an Event Manager** (freegemas): the
  Tool Locator says GS/OS is up, but a program can keep its own cursor and read
  the ADB bytes itself. freegemas reads `$C024` twice per frame from bank `$09`
  and accumulates the deltas; the holes stay `(0,0)` forever. Steering against
  that origin applies real motion toward a phantom target, so the game's pointer
  raced into the bottom-right corner and looked dead. `iigsClosedLoopActive()`
  therefore also requires a published position now, and a report the guest
  consumed without the position following marks the feedback stale
  (`adbFeedbackStale`) and falls back to dead reckoning; a position that moves
  while we are not steering re-arms it. Games driven this way track movement
  with an arbitrary constant offset (the first event only seeds the baseline),
  which is correct for a guest that applies relative deltas.
- **Clicks are deferred**: transitions go on a queue and `drainIigsClicks()`
  delivers one per frame, only after the target is reached and no report is
  unread (a press and its release must never share a report — patching an unread
  report would swallow the press). 20-frame timeout so a non-polling guest cannot
  swallow a click. Outside SHR the queue flushes immediately.
- `romAdbTaskActive()` distinguishes a guest that draws its own pointer (Tass
  Times) from one that does not. It stamps **only genuine polls** — `$C027` reads
  from `FF:C4D0-$C560` with bits 7 and 1 both clear — because GS/OS runs the same
  task to *consume* reports; stamping every read made the (now removed) overlay
  blink.
- **F1 captures the mouse** (`canvas.tsx`): pointer lock turns mousemove into
  `movementX/Y`, forwarded as `MouseEventSimple.relative`. The ADB mouse is a
  relative device, so `iigsADBEvent` queues those counts directly — no closed
  loop (there is no absolute pointer to steer toward) and no dead reckoning
  (which would clamp at the screen edges). `stopIigsCursorTarget()` drops any
  steering target and the dead-reckoning baseline first, or both paths would
  move the cursor and leaving capture would replay the captured distance as one
  jump. F1 again or Escape releases the lock; a lock lost mid-drag also sends
  both button releases. Non-IIgs machines have no relative input path, so their
  capture accumulates into a virtual clamped pointer instead — the mouse card
  only takes absolute positions (and still has to enable `MOUSE_ON`), so motion
  stops at the screen edge there; only the IIgs gets unbounded relative motion.
- The boot welcome text page (`panels/help/startuptextpage.ts`) advertises
  `SHIFT+ESC` for the control panel and F1 for mouse capture. It is the same
  drawn text page for every non-game-mode machine, not ROM output. Its strings
  live in `startup.*` in `src/i18n/catalogs/messages.pot` (and each `.po` must
  carry the same msgctxt or `--require-merged` fails); `languages/*.ts` are
  generated with `npm run generate-i18n-catalogs`, so edit the catalogs, not
  those files.
- Three different things are called a "control panel" here, and the naming is
  load-bearing: apple2ts's own settings panel, the IIgs **ROM Control Panel**, which
  is one item inside the **Desk Accessories** menu the ROM's desk manager draws on
  `Ctrl + Open Apple + Esc` (the micro intercept above), and the GS/OS **Desk
  Accessories drawer** (`Closed Apple + Esc`), which the Finder never draws on this
  media (§11.13). Hence `machine.iigsDeskPanel` says "Desk Accessories", not
  "Control Panel": the menu it opens contains the Control Panel.

Cursor position depends on the ROM revision, and `getIigsMousePos()` branches on
it (gssquared `keygloo_mouse_sync.hpp read_em_mouse_pos`):

- **ROM 01**: the text-page holes `$047C/$057C` (X) and `$04FC/$05FC` (Y),
  data-bank relative. Measurement on GS/OS 6.0.1 shows the `$E1` mirrors carry
  the same value, so either source works.
- **ROM 03**: the `$E1:0190-$0193` bank globals (X low/high at `$0190/$0192`, Y at
  `$0191/$0193`; `megaIIAux[0x190] | (megaIIAux[0x192] << 8)`). ROM 03 leaves the
  text-page holes at 0, so reading them pins the closed-loop stepper at the
  origin and the guest cursor never follows the host pointer.

**Save-state completeness.** The CPU's `$C027` bytes record only what the guest
wrote; the micro-controller's own `interruptEnables`, modes/configuration,
device registers, staged mouse/keyboard reports and command framing are emulator
state and cannot be rebuilt from RAM. `IIGSADB.getSaveState()` /
`restoreSaveState()` persist all of it, and a legacy save without `iigsADB`
restores the controller to power-on defaults. Missing that block leaves `$C027`
reading enabled while the controller's enables are zero, so a restored GS/OS
desktop or startup dialog appears frozen although its code and cursor holes are
intact. Regression: `save_restore_adb.test.ts`.

---

## 7. Storage

- Drive indices: **0/1 = S7** (hard drives / SmartPort), **2/3 = S6** (5.25"),
  **4/5 = S5** (3.5"). `MAX_DRIVES = 6`.
- **Mounting keeps the bay the user chose.** `canDriveTakeImage(index, filename,
  size, hasThreeInchBay)` (in `src/common/utility.ts`) is the only rule allowed to
  move a disk, and it moves one only when that bay physically cannot hold the
  media: S7 takes any block image (an 800 KB one included, as a small SmartPort
  volume), S6 takes 5.25" media only, S5 is the IIgs 3.5" pair and does not exist
  on other machines (`getDefaultDiskDriveIndex` then answers 0). Before this, the
  UI had a two-family clamp that silently re-inserted an 800 KB disk into S6D1 and
  an 800 KB `.po` into S7D1, whatever the user picked.
- A headerless 800 KB image is 3.5" media whatever its name (`.2mg`, `.po`,
  `.dsk`, `.do`); the 2IMG container adds 64 bytes and may carry a short trailing
  chunk.
- **A `.woz` is classified by size, and the size gap is real.** A WOZ is a
  *captured bitstream*, so its length is what was recorded rather than the volume
  size: 5.25" media has at most 35 track-sides and stays under ~370 KB, while
  3.5" media carries 160 and comes in around 1.2 MB (`Cavern_Cobra_IIgs.woz` is
  1,296,147 B). `WOZ_525_MAX_SIZE = 512 KB` splits the two populations, and such
  a capture is slot-5 media: `canDriveTakeImage` lets it into S5 and refuses S6,
  and `getDefaultDiskDriveIndex` answers 4 on a IIgs but 2 when there is no
  3.5" bay (slot 7 serves block data and cannot play a bitstream off either
  disk size). The classifier runs on a bare file size for the disk catalog and
  the swapper too, so it cannot read the INFO chunk — the gap is the only signal
  available there. Two more consequences of the capture/block split: a 140 KB
  `.po` is *not* accepted by the 3.5" bay (physically right, and the decoder
  requires 3.5" block media there anyway), and a 800 KB `.dsk`/`.do` **is** a
  block dump rather than a capture, so `isRawBlockImage` keeps it out of the
  nibble family and it can still be served as block data from slot 7.
- **A IIgs slot-5 bay stays media-driven: an *empty* bay must not report a 3.5"
  mechanism.** `is35` is a property of the media. Presenting the Sony status
  lines from an empty bay does make the ROM's built-in SMART PORT firmware
  (`$FF:C500` → shared driver `FF:6AB5`) report two units, so Card Cat prints
  `5 Apple II Liron Drive Controller (SP:2) ... 3.5 Disk "DISK 3.5"`, but the
  ROM's boot-time device scan then allocates ~498 bytes more and GS/OS 6.0.1's
  ExpressLoad buffer moves from `$7E:FC56` to `$7E:FA64`. 498 ≡ 1 (mod 7), so a
  7-byte relocation record that used to fit before the bank end starts at
  `$7E:FFFF`; its `$F5` handler reads the 6 body bytes with `LDA ($52),Y`, which
  wraps inside bank `$7E` instead of reading `$7F:0000..5`, and MYCRATE.2MG dies
  with `Sorry, system error $0201 occurred while loading the desk accessory
  NIFTYLIST.CDA.` The shift is instruction-deterministic and independent of
  speed mode, RAM size, Sony sense values and unit count, and there is no timing
  window: Card Cat's own scan needs the status lines early while MYCRATE needs
  them gone past 4M cycles. gssquared instantiates both slot-5 drives
  unconditionally, so this looks like a genuine GS/OS 6.0.1 loader bug on real
  hardware too. An empty bay therefore answers `(SP:0, no units)`; mount 3.5"
  media and it reports the mechanism and `DISK 3.5` as before. Regressions:
  `gs_cardcat.test.ts` (empty bay) and `gs_mycrate.test.ts` (boot).
- **Slot 7's unit count belongs to the card model, not to gssquared.** gssquared's
  slot-7 `pdblock3` is Liron firmware that advertises 32 units (`PDB3_MAX_UNITS`)
  and errors on the DIB reads of its empty ones; GSplus stops at 16
  (`iwm.h:MAX_C7_DISKS`). Our slot 7 is the generated ProDOS 8 block driver +
  `$C7C3` SmartPort hook. It advertises `SP_MAX_UNIT = 32` units - the same
  capacity as the reference `pdblock3` - while only `SP_DRIVE_UNITS = 2`
  (units 1-2) are backed by `driveState`; every other unit answers offline `$E0`
  and its DIB read fails with the same "SP DIB read err" line gssquared produces,
  so Card Cat shows `(SP:32)`. With no hard-disk image
  mounted the card stays disabled at cold boot (the `doBoot` hack that lets a
  floppy boot first) and Card Cat only prints the generic "Apple II Liron Drive
  Controller Card" line. The count is not cosmetic: GS/OS 6.0.1 sizes its
  boot-time device structures at 84 bytes per advertised unit, and at the old
  `SP_MAX_UNIT = 2` its ExpressLoad buffer sat flush against the end of bank
  `$7E` (§11.11). Model a card capacity, not a mounted-volume count - and keep
  the capacity independent of the media, so `hasSmartPortDrive` /
  `getSmartPortDataLength` answer offline for the empty units whatever is
  mounted.
- **A configure pass taken for another machine must not reach the IIgs boot.**
  A fresh profile's browser order is `loadPreferences()` (posts the stored slot
  config - classic IIe defaults, because the worker itself starts as APPLE2EE)
  → `handleInputParams()` (posts `MACHINE_NAME` from `?machine=`) →
  `handleFragment()` (mounts the image, then `NEED_BOOT`), so the IIe branch of
  `configureMachine()` runs first and that branch sets `softCard.enabled = false`.
  `doBoot()` read exactly that flag to decide whether to present the slot-7 ProDOS
  driver and the GS branch never restored it, so a deep link came up with the card
  **enabled** plus a 200 ms `enableHardDrive()` timer - and the ROM is still walking
  the slots at 200 ms, so it finds a slot-7 device, executes `$C700` (with
  `INTCXROM` still set that is the internal `E2 40 / 70 1B` no-device stub) and
  lands in `$00:E000` / `$00:F128` instead of loading the 3.5" system disk. Measured
  with the boot-order probe: only the timer is needed to reproduce it, the enabled
  install at boot is harmless because `doReset()` runs no code in between. Fix: the
  GS branch clears `softCard.enabled`/`veraSlot` (a IIgs has neither) and installs
  the slot-7 driver disabled unless a hard-disk image is mounted, and `doBoot()`
  keys the IIgs purely off `hasHardDriveMounted()` with **no timer** - mounting an
  image enables the driver itself (`drivestate.ts`, `enableHardDrive(true)`).
  Regression: `gs_boot_order.test.ts` (fails with SCB set size 1 - stuck on the
  boot splash - when the timer guard is removed).
- **A loaded drive must label its track or the panel looks dead.** The drive
  panel renders `DISK_DRIVE_LABELS[index] + driveProps.status`, and only
  `moveHead()` wrote that label - the 3.5" head moves through `moveHead35()`, so
  S5,D1 showed nothing at all and reads as a crash. A 3.5" `quarterTrack` is a
  **track-side** index (80 tracks x 2 sides, `maxQuarterTrack = 159`), so the
  label is `Trk ${quarterTrack >> 1}`, not `/ 4` as on a 5.25" drive. Hard-drive
  labels show the block number, and **both** slot-7 entry points must publish
  it: `processHardDriveBlockAccess` (`$C7C0`) did, but GS/OS reads through the
  SmartPort entry (`$C7C3`), so a volume booted by GS/OS froze at the block the
  ROM's own scan last read (S7,D2 in particular, since the boot scan only
  touched S7,D1). `processSmartPortAccess` now stamps `ds.status` from both the
  read and write block fields.
- `doResetDiskDrive()` must set `quarterTrack = 0` (real drives spring back to
  track 0). Parked at the outer stop, a Ctrl-Reset read the wrong track.
- **Ctrl-Reset**: clear the `$03F2-$03F4` signature (`$03F3 ^ $A5 == $03F4`) when
  any media is mounted (floppy *or* hard drive, `iigsHasAnyDiskMedia()`), so the
  ROM takes the cold device scan; leave it alone otherwise, which is what keeps
  Ctrl-Reset landing on the Applesoft `]` prompt.
- **IWM** (`$C0E0-$C0EF`): even read with Q6=1,Q7=0 (`$C0EE`) returns
  `(mode & 0x1F) | (motor ? 0x20 : 0)`; odd write with Q6=1,Q7=1 (`$C0EF`)
  latches `mode = v & 0x1F`. Without this the ROM's `SELIWM` polls forever.
  `$C0E8` (Q6=0,Q7=0) is the data register. **An empty bay must keep returning
  the ROM byte** — the power-on disk self-test reads it before any drive is
  enabled, and feeding it live bits derails the boot.
- **ROM 03's power-on self-test probes both IWM lines**, and the 5.25" family
  must answer them or the boot hangs (KEGS applies a SmartPort patch instead;
  gssquared does not, and porting the hardware behaviour boots without it):
  - **Status bit 7 (`$C0EE`) is the 5.25" write-protect sense.** Ported from
    gssquared `Floppy525_woz::read_sense`: an empty bay reads 1 (the LED's beam
    is unblocked, indistinguishable from a write-protected disk) and an asserted
    PHASE1 forces 1 as well, otherwise it follows the WP flag. A constant 0
    leaves ROM 03 spinning at `$FF:5820`.
  - **Handshake (`$C0EC`, Q6=0/Q7=1) idle is `$80`**, not `$C0`: ready with no
    underrun (gssquared `reg_handshake` after reset). The 5.25" family never
    enters async mode. ROM 03's write-handshake self-test waits for bit 6 to
    clear and spins at `$FF:57B7` otherwise. The 3.5" family still owns these
    bits through `iwmReadHandshake35`.
- **SmartPort** (`src/worker/devices/harddrivedata.ts`): status `$F0` on line,
  `$B4` write-protected, `$E0` offline (returns offline for an empty unit so
  GS/OS skips it instead of offering to initialise it). **Bit 0 is the
  disk-switched flag** for a block device (see the latch below); it is not
  "device currently open", which is the character-device meaning. Unit 0 reports
  the card's full unit count. DIB subtype `$20` (hard disk). 0x10000 blocks must
  report `$FFFF`. **Do not set the extended bits `$C0`**: GS/OS switches to the
  extended command set, whose parameter lists carry a 3-byte pointer, and we only
  decode the 2-byte form — the boot stalls on the welcome screen. Bit 0 needs no
  extended advertisement, which is why it is the usable half of KEGS's `$2E`
  DISKSW response.
- ProDOS block driver hook `$C7C0`: `$42` cmd, `$43` drive, `$44/$45` buffer,
  `$46/$47` block. Error codes: `$27` I/O, `$28` no device, `$2B` write-protected,
  `$2F` offline.
- A 2MG whose header is corrupt (this happens) is fine: detect the `"2IMG"` magic
  and always use offset 64. gssquared trusts `data_offset` and would read garbage.
- **The two floppy families live in different clock domains, and this is the
  subtle part of the IWM.** The **5.25" LSS is clocked by raw CPU cycles** —
  `iwmReadDataRegister()` gets `s6502.cycleCount` with **no speed scaling**, 4
  cycles per bit cell, exactly as gssquared's `Floppy525_woz` does in *every*
  speed mode. The Disk II / ProDOS read loops are cycle-timed too, so the two
  keep their relationship at 2.8 MHz. Scaling the bit model to wall time
  (`frameCycles / 17030`) makes the ROM re-read the same register 2.7 times
  before the next bit cell arrives, the `D5 AA 96` sync loop at `$C65E`/`FF:6700`
  never locks on, and the boot ends at `CHECK STARTUP DEVICE!`. Only the
  **3.5"** drive follows machine time — gssquared overrides `get_current_time()`
  with `get_vid_cycles()` for `Floppy35_woz` alone, because 500 kbit/s media
  cannot be sustained by a 1.02 MHz budget.
- **3.5" media (`src/worker/devices/floppy35.ts`)** is a *block* nibblizer, not a
  captured-bit one: the 800 KB volume image is expanded per track-side into
  self-synchronising GCR fields and streamed at machine time, and the ROM's own
  decoder is the ground truth. Zoned layout is 16 cylinders each of
  12/11/10/9/8 sectors per side (160 track-sides, 1600 blocks). Writes splice the
  sector back into the block image at `64 + sectorOffset(track, sector, side)`,
  flushed on a data-register read (`iwmFlushWrites35`). Captured 3.5" WOZ2 images
  play directly (see the next bullet); captured `.do`/`.nib` 3.5" still has no
  importer.
- **WOZ2 declares its disk type in INFO byte 1, at file offset 21 — not 61.**
  `decodeWoz2` used to read offset 61, which is the tail of the creator field and
  *always 0*, so `driveState.is35` never became true and even a capture placed in
  slot 5 was clocked as 5.25" media. Chunks start at offset 12 (the header is
  12 bytes: `WOZ2` + 8 safety bytes) and INFO is the first one, so offset 20 is
  the version, 21 the type (1 = 5.25", 2/3 = 3.5"), 22 write-protect, 23 sides
  and 59 the optimal bit cell. A 3.5" capture declares 16 (= 2 µs, a 5.25" one 32)
  and `getNextByte` advances by `optimalTiming/8` CPU cycles per bit in *both*
  families, so the declared value needs no family adjustment — but the 3.5"
  capture still runs on the machine-time media clock, which is what
  `driveState.is35` selects (`blockMedia35` stays false, so the nibblizer
  branches in `decodedisk.ts` are skipped and `driveBitstream` *is* the same
  `Uint8Array` as `driveData` — a write edits the captured image in place, and
  `iwmFlushWrites35` only has to raise `diskHasChanges`).
- **The 3.5" track number is 7 bits, and the write-back decoder has to rebuild
  it.** The nibblizer writes six bits into the address field's low-track byte and
  puts bit 6 of the cylinder in **bit 0 of the side byte** (gssquared
  `emit_address_field`: "side number ($00 or $20) and high part of track number
  ($01 for tracks >= 64)"), so `decodeFloppy35Track` must return
  `lowTrack | ((sideAndTrack & 0x01) << 6)`. Reading only `lowTrack` makes
  cylinders 64-79 claim to be 0-15, and `spliceFloppy35Track`'s
  `sector.track !== track` guard then discards **every** sector written there —
  silently, with no error to the guest. That is the "saved a file and it came
  back wrong" class: an 800 KB volume is 1600 blocks, so blocks 1280-1599 (the
  tail of a full directory tree, and often the file data a `SAVE` allocates)
  never reach the image, and the next mount re-nibblizes the stale bytes, which
  Applesoft reports as `?SYNTAX ERROR`. Reads were never the problem: all 1600
  blocks of `mcs.2mg`, `SystemDisk.2mg` and `SystemDisk-P8.2mg` decode byte-exact
  from their own fields, and `gs_floppy35_boot` proves the live path carries real
  file bytes (GS/OS 6.0.1 to its Finder desktop, and ProDOS 8 2.4.3 with its
  34-block `/PRODOS` plus the 13-block `DESKTOP.SYSTEM` to the Apple II DeskTop
  banner, both from slot 5). Write coherence inside a session is fine by
  construction: `writeBit35` edits the nibblized stream in place, so the next
  pass of the head returns the new bytes, and only the *image* needed the fix.
  Beware the blind spot that let this ship: `gs_floppy35_boot` computes the
  cylinder itself from the track-side index instead of trusting `sector.track`.
  Regressions: `gs_floppy35` "decodes all 160 track-sides with their own cylinder
  and block" (asserts `sector.track === track` for all 160) and "async write to
  the last cylinder splices into its block" (writes cylinder 79/side 1 through
  the live IWM async path, reads the sector back from the stream, then remounts
  the spliced image and reads it again). Reverting the one `| ((sideAndTrack &
  0x01) << 6)` turns both red (`Expected: 64 / Received: 0`, `diskHasChanges`
  false).
- **A real Applesoft `SAVE`/`LOAD` through slot 5 round-trips byte-exactly.**
  Measured on `A2DeskTop-1.5.po` (a stock ProDOS 8 800K volume with
  `/EXTRAS/BASIC.SYSTEM`) booted from S5D1 at 2.8 MHz: the prompt arrives at
  ~frame 593, `SAVE ROUNDTRIP` sets `diskHasChanges` and changes 106 bytes of the
  image (the directory/bitmap update plus the file's data block),
  `NEW`/`LOAD`/`LIST`
  give all three lines back unaltered, and `RUN` prints
  `42SAVED ON SONY 800K`. Remounting the spliced image and booting it again
  reproduces the same listing and output, so the write reached the media, not
  only the in-session bit stream. Regression: `gs_floppy35_basic` (patches the
  root `desktop.system` record in memory to point at `BASIC.SYSTEM`, so no
  fixture disk is stored in the repo).
- **Swapping 3.5" media under a running drive is a disk change, and the IWM has
  to be told.** The standby swapper changes the volume without resetting the
  machine, and the IWM keeps *one* async shift register shared by both Sony bays
  (`asyncShift35`/`asyncBuffer35` plus the per-drive `dirtyTracks35`). Anything it
  still holds describes the disk that is leaving: `iwmDiskChange35(driveIndex)`
  (`drivestate.ts`, in `doSetEmuDriveNewData`) hands the outgoing image one last
  flush and then forgets the burst — but only when that burst belongs to *this*
  bay (`writeBurstDrive35`), because truncating the other bay's in-flight field
  would corrupt a disk that did not change. A write the guest never read back
  goes with the burst that carried it, which is the same durability boundary the
  firmware's own verify loop sets. Left alone, the queued byte gets
  clocked on the next handshake and `writeBit35` edits the *incoming* nibblized
  stream in place, then `iwmFlushWrites35` splices that track into the fresh image:
  media corruption plus a false `diskHasChanges` that offers to save a clean disk.
  A capture (WOZ) has nothing to reset — it is written in place, and a machine
  reset already clears this state through `iigsResetIwm()`, which is why only a
  *swap* exposes it. Beware the vacuous test: a sector with a broken field fails
  the guest's own BVS, so asserting only the decoded sectors or only the image
  bytes passes with the bug in. Compare against a snapshot of the freshly
  nibblized stream. Regression: `gs_floppy35_swapper` (turns red with bytes
  `53,106 → 21,127` at the field prologue when the guard goes).
- **A host disk swap has to be *announced*, or the guest keeps the volume it
  cached.** Resetting the IWM burst (above) protects the bytes; it says nothing
  to the OS. Every status call a guest makes about a bay is a pure function of
  "is there media, how many blocks, is it write-protected", so swapping one
  800 KB volume for another is **byte-identical** to all of them and GS/OS never
  re-reads the directory. The fix is a per-bay `diskSwitched` latch
  (`driveState`, initialised false) that `doSetEmuDriveNewData` raises on a mount
  *and* on an eject, and that the guest acknowledges:
  - **Slot 7 (SmartPort)**: `getSmartPortStatusByte` ORs `SP_STATUS_DISK_SWITCHED`
    (bit 0) into `$F0`/`$B4` and **clears the latch on that read** — gssquared
    `pdblock3.cpp get_drive_info()` does exactly this with its per-unit
    `disk_switched[PDB3_MAX_UNITS]`, set on mount (:453, :563) and unmount
    (:580, :598, :608). An empty bay returns plain `$E0` with no latch: there is
    no media whose switch to report. Both the STATUS and the DIB path use the
    same helper, so either one acknowledges.
  - **Slot 5 (Sony 3.5")**: the mechanism already had the plumbing —
    `refreshSense35` selector `0b0110` returns `diskSwitched ? 1 : 0` (gssquared
    `Floppy35_woz::refresh_sense`, "reversed sense"), CONT35 `$9` clears it and
    `$E` (guest eject) sets it. What was missing is the *host* side:
    `initDriveState` wiped the flag on every mount, so a swap looked like a disk
    that had never changed.
  - **The insert that follows an eject must not clear the latch.** KEGS says so
    in as many words (`config.c:1733-1736`, "DO NOT change dsk->just_ejected"),
    and its insert path ejects the outgoing image first (`config.c:1738` →
    `iwm_eject_disk`, `iwm.c:3624`), so a swap leaves the flag set for the next
    poll. Hence
    `Boolean(prevDrive?.diskSwitched) || hasRequestedMedia || prevDrive.filename !== ""`.
    gssquared is only half a model here: `pdblock3` latches on mount, but
    `Floppy35_woz::mount()` clears `disk_switched` *after* the `unmount()` that
    `Floppy_woz::mount()` performs internally (`Floppy35_woz.cpp:36,52,67`), so a
    same-call 3.5" swap clears that latch there too. We use `pdblock3` as the
    SmartPort precedent and KEGS's preserved latch on the Sony side.
    Neither reference raises an interrupt or resets the machine on a swap:
    detection is purely poll-based, so the indicator has to survive until the
    guest reads it.
  - Measured on **Spirit of Excalibur** (three 800 KB volumes, 1 → 3 → 2 → 3):
    without the latch the first swap is invisible and the game sits on its red
    `INSERT DISK 3 INTO DRIVE AND PRESS THE SPACE BAR` prompt forever (SHR
    `nz = 3764`, hash `930559076`). With it, the same swap draws
    `INSERT DISK 2` (`nz = 3764`, hash
    `-1342674185`) and the sequence reaches the England map and its
    `START A NEW GAME / LOAD A SAVED GAME` menu. **The two red screens have the
    same non-zero byte count** — only the hash and a rendered PNG tell them
    apart, which is how the first red run was misread as "the swap worked".
    Regression: `gs_excalibur`, both bays.
- **A 1.02 MHz CPU cannot read 3.5" media, and that is not an emulator defect.**
  500 kbit/s = 2 µs per bit cell = 62.5 KB/s, which at 1.024 MHz leaves 16.3 CPU
  cycles per byte; the tightest polled loop (`LDA $C0EC / BPL / LDA $C0ED /
  STA (ptr),Y / INY / BNE`) is 22-23, so the stream overruns no matter what the
  driver does. Our media clock is wall-time (`iigsDiskBitCellCycles()` = 2.04
  CPU cycles/bit in `$C036` slow mode, 5.72 at 2.8 MHz) and the references agree:
  gssquared's `Floppy35_woz::get_current_time()` is `clock->get_vid_cycles()`
  with `vid_cycles_per_second = 1,020,484` in **every** clock mode, and
  KEGS/GSplus advance the head from `dfcyc >> 16` microseconds. KEGS and GSplus
  never run the IIgs at 1 MHz - their CPU speed follows `$C036` bit 7 and the
  ROM keeps it fast. Selecting "1.02 MHz" in our machine-speed menu therefore
  reproduces a genuinely throttled IIgs: a 3.5" boot parks at
  `Check startup device!`, and 3.5" I/O inside a `$C036` slow-mode window cannot
  complete either. This is why the IIgs default is 2.8 MHz (§8) and why nothing
  in the UI may post a speed before `doSetMachineName`. **Measured on Modulae**
  (`modulae (1990)(free tools association).2mg`): at the default 2.8 MHz the
  decrunch reaches the animated title screen (`S5,D1 Trk 44`, canvas differing
  in every one of twelve consecutive samples); with explicit speed0 it parks at
  `Check startup device!` / `S5,D1 Trk 0` while `cycleCount` keeps advancing and
  FPS stays 60. That parked screen is not a false-stuck worker or a decrunch
  defect — it is this 1.02 MHz media-budget starvation.
- **The slot-5 firmware clobbers the caller's direct page `$57-$5A`.** The
  ProDOS-8 entry offset at `$C5FF` is `$0A`, so Apple Pascal's BIOS trampoline
  (bank-0 `$9E32`, which pops a 13-byte frame) enters at `$C50D`. That stub does
  `CLC; ROR A; AND #$80; STA $E1:0FB0` (always 0 on this entry) and reaches the
  shared block driver at `FF:6AB5` (`PHK; PLB; BCC`). The `BCC` path stores its
  inline parameter pointer in DP `$57-$5A` at `FF:6ACB`/`$6ACD` **before** it
  saves DP `$40-$6E` to `$E1:$14E2` (`FF:6F4D`), and the exit (`FF:6F70`,
  `MVN $00,$E1`, PC `$6F7F`) restores that copy — so the caller gets firmware
  scratch back. ProDOS 8 survives (it keeps nothing live there); Apple Pascal's
  p-machine keeps its p-stack pointer (`$56/$57`) and p-code PC (`$58/$59`) in
  the direct page, resumed at p-code PC `$009E` and printed
  `Execution error # 1` right after `Checking Card Slot 5 of 7` (Card Cat 1.94).
  `CPU65816.slot5DriverDirectPage()` snapshots the four bytes at `FF:6AB6` and
  re-applies them at `FF:6F7F`. The other entries (`$C500`/`$C502`/`$C504`/
  `$C506`/`$C50A`) set `$E1:0FB0 = $C0` instead, take `BMI FF:6AEB`, and never
  reach the clobber. Regression: `gs_cardcat.test.ts`.
- **ROM 03's slot-5 block driver preserves a narrower direct page window than
  ROM 01.** ROM 01 (and the IIe firmware) save DP `$40-$6E` around a block
  access (`FF:6F4D`/`FF:6F70`); ROM 03's counterpart (`FF:5BAD` entry,
  `FF:5E94` exit) saves only `$40-$62`, via four `MVN` copies of `#$0022` at
  `FF:6031/$6063/$6089/$609C`. Diversi-Cache 1.0b (1987 DSR Inc, on the ACS
  Musique disk) installs an 8-bit ProDOS 8 cache driver in bank 2 and patches
  three slot-5 dispatch entries (`$E1:0F6F/$0F77/$0FA7`) that the ROM-03 stubs
  at `FF:4C4F/$4CDA/$3E5A` jump through. Its unit-1 read path keeps a
  sync-byte compare buffer in DP `$65-$67` (`STA $67` at `$02C4`), so the short
  window returns scratch over the caller's TXTTAB: BASIC.SYSTEM's freshly
  `NEW`-ed `$0801` came back as `$0840` and the first program line failed with
  `?SYNTAX ERROR`. `doSetRom()` widens the four lengths `#$0022` -> `#$002F`
  in the decoded ROM-03 image (signature-checked, bank-FF offsets
  `$6035/$6067/$608D/$60A0`), matching ROM 01; the two `$E1` save buffers are
  `$30` apart (`$14E2 + $30 = $1512`) so they still do not overlap. Like KEGS's
  slot-5 patches this is a firmware-compatibility fix, not an emulator bug: the
  shipped dump (md5 `ba89edf2729a28a17cd9e0f7a0ac9a39`) fails the same way on
  real ROM 03 hardware. Regression: `gs_acs_musique.test.ts` (ROM 03 reaches
  the menu at ~frame 498 with `TXTTAB` `$0801` and no `SYNTAX|ERROR`; ROM 01 is
  the control).
- **ROM 03 moved the `$E10000` tool-set table, and ACS's music players hardcode
  ROM 01's copy address.** The dispatcher (`FE:00C5`) reads its table pointer
  from `$E103C0`; each ROM points it at its own table — ROM 01 at `$FE:012F`
  (`21 00 00 00`), ROM 03 at `$FE:0139` (`31 00 00 00`) — because ROM 03's
  prologue is 10 bytes longer (`PEA $FE01`/`PEA $3700`), so the table and the
  error epilogue in front of it moved together. ACS's three bank-3 player
  overlays copy 132 bytes with a hardcoded `LDA $FE012F,X` (three occurrences in
  the image; `$FE0139` appears nowhere) into `$11:E1D0`, publish it through
  `$E103C0` and patch tool set `$19`. On ROM 03 that copy begins with the
  dispatcher's error epilogue `2B 3B 18 69 0A 00 1B 8A 38 6B` instead of the
  count, so every lookup is shifted and resolves to garbage. The first tool call
  after installation is the ROM's own `FD:03FC` helper (tool set 1 / function
  `$0D`); it gets error 2 and the helper's `JSR`/`RTS` frame lands on `$0001` →
  `BRK` → monitor (`A=X=2`). Replacing the three `BF 2F 01 FE` bytes with
  `BF 39 01 FE` in a copy of the image makes ROM 03 drive the DOC exactly like
  ROM 01 (`osce=32`, 5-6 live oscillators), so this is a guest ROM-01 assumption,
  not an emulator defect: the shipped ROM 03 image fails the same way on real
  hardware. Workaround: ROM 01, or patch a copy of the image. Regression:
  `gs_rom03.test.ts` pins both table addresses and the 10-byte epilogue.
- `doSetEmuDriveNewData()` must copy `props.isWriteProtected` into the drive
  state, not only the disk data. It used to keep whatever the previous mount
  left there, so a write-protected image mounted as the boot volume made GS/OS
  refuse to write its directory blocks.

---

## 8. Timing

- **The video beam is a function of machine time only.** `iigsVideoClock`
  accumulates refresh-relative units; a CPU cycle is worth
  `frameCycles / 17030`, so slow mode advances the beam 2.74x per cycle and a
  frame is always 1/60 s. `frameCycles` stays `cpuCyclesPerRefresh` and does
  **not** follow `$C036`. Using `cycleCount % frameCycles` as the phase meant
  every `$C036` write moved the beam backwards by up to a whole frame: `$C02E`
  could go back in time, scanline/VBL windows were re-scanned, and the DOC and
  mouse anchors inherited the jump. Reset the clock in `doReset()` and
  `doSetSpeedMode()`; the speed-mode reset keeps the captured-row boundary at
  frame 0 (`resetIigsVideoClock(true)`) rather than `-1`, or the next timer
  callback calls `beginShrFrame()` mid-refresh and drops a late SHR draw (§4).
- VBL is the first `vblCycles` of each frame and must agree with `$C019` and
  `readIigsVideoCounter`.
- Verified: 4074 VBLs / 4074 refreshes over 4000 frames with `$C036` flipping
  both ways.
- Speed modes: 1.02 MHz (17030 cycles/refresh), 2.8 (46727), 7.1, 14.3.
- **The 3.5" media clock is wall time, not CPU cycles** (`iigsDiskBitCellCycles()`
  in `memory.ts`: 2 µs per cell, i.e. 2.04 CPU cycles in `$C036` slow mode and
  5.72 at 2.8 MHz). That is the opposite of the 5.25" LSS (§7), whose firmware
  loop is cycle-timed. Do not try to make a slow-mode 3.5" read work by shrinking
  the cell: at 1.024 MHz the 62.5 KB/s byte rate already exceeds what any polled
  loop can drain (16.3 cycles/byte available, 22-23 needed).
- **`$C036` bit 7 SET means FAST (2.8 MHz)**, clear means 1.024 MHz — verified in
  gssquared `mmu_iigs.hpp` (`set_slow_mode(value & 0x80 ? false : true)`); the
  `// bit 7 slow` comment in `mmu_iigs.cpp` is stale. Cold boot seeds `0x80`
  (ROM 03 uses `0xC0`), and `doReset()` re-seeds it.
- **The IIgs defaults to speed mode 1 (2.8 MHz)** when the host never explicitly
  picked one (`speedModeExplicit` in `doSetMachineName`); classic 8-bit machines
  keep mode 0. `cpuCyclesPerRefresh` is then indexed from the IIgs table, so the
  video clock stays in machine time and the 5.25" LSS keeps counting CPU cycles.
  Everything timed in *frames* has to be re-checked after this: ProDOS 8's
  welcome page is only on screen for a few hundred frames at 2.8 MHz before
  A2DeskTop takes over, so `gs_floppy_late` watches every frame instead of
  sampling the end of the run.
- **The refresh timer follows wall time.** `doAdvance6502Timer` runs no frame
  when the callback arrives early (a negative interval used to count as one), and
  consumes every overdue refresh slot — there is no catch-up cap. Dropping whole
  refreshes loses animation state and tears sprites across the gap; quality beats
  headroom. Warp mode (`speedMode` 4) deliberately sets `refreshTime = 0` to fire
  immediately instead of dividing by zero. Regression: `gs_timer_catchup.test.ts`
  (a stalled callback runs all 102 overdue refreshes).
- **Nothing in the UI may post a speed before `doSetMachineName`.** `display.tsx`
  used to call `passSpeedMode(0)` while starting up, which marked the mode as an
  explicit user choice and pinned the IIgs to 1.02 MHz in the real UI. Jest hid
  it because the worker tests call `doSetMachineName` directly. At that budget
  the 3.5" driver cannot clock 500 kbit/s media, so the boot scan never locks
  and the ROM parks at **"Check startup device!"** with the drive idle — what
  looks like "ROM 03 hangs on boot", and reproduces identically on ROM 01. Only
  a saved preference or a real user choice may set the speed; the worker then
  publishes the effective `speedMode` in `MACHINE_STATE`, so the dropdown still
  reads 2.8 MHz. Guard: `gs_speed_default.test.ts` (own module registry, so
  `speedModeExplicit` is still false).
- **Speed modes 2 and 3 (7.1 / 14.3 MHz) boot no volume at all — open.** Those
  rows only scale `cpuCyclesPerRefresh`; `$C036` still means exactly what §1
  says (bit 7 = 1.024 or 2.8 MHz), so a "7.1 MHz" machine presents a CPU that is
  never faster than 2.8 MHz in the ROM's own units. ROM 01's boot-time speed
  calibration then never converges and the device scan is abandoned: measured
  with `SystemDisk.2mg` on ROM 01 (so it is not an image defect), modes 0/1 reach
  the slot-7 driver (`f=55 s7 pc=$c700` at 1.02 MHz, `f=0` at 2.8 MHz) while modes
  2/3 **never enter `$C700`** — the first bank-0 slot visit is slot 6 (f=67) then
  slot 5, preceded by an `INTCXROM` flip storm at `FF:9F8F`/`FF:A94F`/`FF:9FFB`/
  `FF:A1B7`. The tell is `$C036`: modes 2/3 write `$84` at `FF:FCE9` then `$04` at
  `FF:FCB2`, **once per refresh for ~90 frames** — that is ROM 01's own TRB-slow /
  STA-fast pair (`FF:FCAC XBA / FF:FCAD LDA #$80 / FF:FCAF TRB $C036` …
  `FF:FCDB` countdown … `FF:FCE5 XBA / FF:FCE6 STA $C036`) with the settle loop
  between, i.e. the ROM keeps asking for slow, waiting, restoring fast, and asking
  again. Modes 0/1 never issue the `$04` write. After ~90 frames the ROM falls to
  `$FF:A0D0` → `$FF:A5A3` and parks at "Check startup device!". VBL/refresh
  cadence is correct in every mode (+51/+51 per 50 frames), so this is not the
  video clock. gssquared, KEGS and GSplus model no accelerator, so there is
  nothing to port — making 7.1/14.3 mean anything needs a decision about what
  `$C036` should offer beyond the two real clock pins (§11.15).

---

## 9. Boot, disks, UI

- `?machine=apple2gs`, `?boot=true`, `?drive=N` (0/1 = S7, 2/3 = S6, 4/5 = S5),
  `?speed=`, `#http://...` fragment disk. Named bay parameters: `?s7d1`/`?s7d2`
  (`?hd1`/`?hd2`), `?s6d1`/`?s6d2` (`?d1`/`?d2`) and `?s5d1`/`?s5d2` for the IIgs
  3.5" pair.
- **Bay parameters live in the query, never after the `#`.** The hash carries
  exactly one disk URL (its bay comes from `?drive=N`), so `…#s5d1=SystemDisk.2mg`
  asks for a disk *named* `s5d1=SystemDisk.2mg` and nothing reaches slot 5. Measured
  on fresh profiles: `?machine=apple2gs&s5d1=<url>` mounts S5,D1 (head walks to
  Trk 24 and GS/OS boots from it), `s5d2` mounts alongside an `s7d1` boot volume,
  `s6d1` takes a 140 KB woz (Trk 7), `hd1` is the same as `s7d1` (label
  `*GSOS601.po`), and `{a,b}` still builds a swapper (`?machine=apple2gs&s5d1={A,B}`
  needs ~40 s because both images download first — at 22 s it still looks idle).
  Any landed `sNdM=` already posts `NEED_BOOT` (inputparams.ts:647), so `boot=true`
  is optional with a named bay. Regression: `inputparams` (s5 pair → indices 4/5 and
  the query-only rule).
- **The multi-disk swapper is a six-bay feature, slot 5 included.** `standbyDisks`
  and `standbyActiveIndex` in `driveprops.ts` were hard-coded to four entries, so
  indices 4/5 silently got no standby list at all: no `faLayerGroup` badge, no swap
  menu, and "Load Additional Disk(s)" had nowhere to put the disk. Both arrays are
  now sized `MAX_DRIVES` and every accessor guards on `MAX_DRIVES`, so `?s5d1={A,B}`
  behaves like `?d1={A,B}`. Two adjacent gaps had to close for that to be true:
  `getMultiDiskConfigFromItem` (`diskpanel_utils.ts`) needed the `s5d1`/`s5d2` keys
  in *both* the diskUrl-object and the `item.params` branches — without them a
  collection entry naming the pair fell through to the primary-URL fallback and the
  two disks landed in the slot-7 block bays, where there is no 3.5" media clock at
  all — and `getPrimaryDiskUrl`'s key list (`s6d1 || s5d1 || s7d1 || …`) so an IIgs
  item's "primary" disk is the floppy a user would actually be handed. Regressions:
  `diskswapper` (per-bay groups for all six bays, a slot-5 swap re-posts
  `doSetEmuDriveNewData` with `forceIndex=true`, `ejectAllDisks(5)` clears only bay
  5), `diskpanel_utils` (the s5 keys), `gs_floppy35_swapper` (§7). Verified in the
  real UI on a fresh profile: the badge appears on S5,D1, its menu lists both disks
  with a tick on the active one, and clicking the second entry leaves
  `A2DeskTop-1.5-en_800k.2mg` at Trk 0 with the badge still there.
- **Swapping standby media must not force Save As.** Excalibur writes its
  URL-loaded Disk 1 during boot, so `diskHasChanges` is true but there is no
  writable file handle. The graphical `diskdrive.tsx` menu used to await
  `showSaveFilePicker()` before swapping; cancellation throws `AbortError`,
  leaving Disk 1 mounted. Like the Retro menu, it now saves only an existing
  writable handle. `swapStandbyDisk` first copies outgoing bytes and dirty state
  into the standby list, so an unsaved disk stays available without a native
  dialog. On return, `doSetEmuDriveNewData` restores `diskHasChanges` and
  `lastAppleWriteTime` from the standby props **after decoding** (the decoder
  clears the dirty flag), so the worker's reply cannot silently mark an unsaved
  image clean. `gs_excalibur` covers that remount in both bays with synthetic
  media. Explicit Save As remains available. `diskswapper` tests the actual
  graphical callbacks with and without FileSystem API support, checks the dirty
  bytes survive a round trip, and waits for an existing handle's save to finish
  before mounting another disk.
- **The Link Builder emits a IIgs link only if it names the machine.** A link with
  `slot*=gs*` and no `?machine=` is useless twice over: it opens whatever machine the
  visitor last used (so a IIgs volume gets scanned by an IIe), and `inputparams`
  filters every `gsPrinter`/`gsMouse`/`gsSmartPort` value out unless the URL itself
  says `machine=apple2gs`. Classic entries therefore keep emitting no `machine=` —
  that is how a link follows the visitor's own saved choice. Verified end to end:
  the builder on a running IIgs emits
  `?machine=apple2gs&s5d1=http%3A%2F%2Flocalhost%3A6503%2FSystemDisk.2mg`, and that
  link on a fresh profile comes up as a IIgs (`#tour-iigs-desk-button` present,
  `8 MB`) with `SystemDisk.2mg` in S5,D1 reading Trk 43.
  - `retrieveFromEmulatorSettings()` maps `APPLE2GS` to the IIgs row and reads the
    speed label from `speedNamesFor(machineName)` — the GS table names rows 2-5 after
    the clock (`1.02/2.8/7.1/14.3 MHz`) where the classic table uses multipliers, and
    a classic label looked up in the GS table returns -1, which silently dropped
    `speed=` from the link. The IIgs default is 2.8 MHz (index 3), classic 1 MHz
    (index 2), so each family skips its own row only.
  - Changing the machine **reseeds `slotConfig` to that family's defaults**: the two
    share no card ids, so a classic list carried into a GS link emitted
    `slot2=vera&slot4=mouse&slot6=disk2&tab=vera` (and a GS list carried the other
    way died in the parser). Measured, without the reseed a GS link carries
    `ramdisk=4096&slot1=none&slot2=vera&slot3=aux&slot4=mouse&slot5=none&slot6=disk2&tab=vera`.
  - The disk tab now offers the IIgs bays: slot 6 rows appear for `gsDiskPort` as
    well as `disk2`, and a new slot 5 pair (`s5d1`/`s5d2`, gated on `gsSmartPort` or
    the legacy `disk35`) with `linkBuilder.slot5Drive1/2` in `messages.pot` + all 15
    `.po`. Regressions: `linkbuilder` (IIgs cases).
- **`?boot=true` must wait for the fragment disk to mount** (`__pendingBootAfterDisk`
  + `.finally`, so a failed mount still boots). Booting first scanned an empty
  drive.
- Slot configuration for the IIgs is fixed: S1 printer/ssc, S2 modem, S3 80-col
  (no cards), S4 mouse/mockingboard, S5 3.5", S6 5.25", S7 SmartPort. Drives are
  motherboard hardware, so the drive panel must **not** grey them out when the
  slot says `"none"` except for slot 7.
- The drive panel picks its art per bay: `floppy35{on,off}[-empty].png` for the
  IIgs slot-5 pair, `disk2*` for slot 6, `harddrive*` for slot 7. The 3.5" lamp is
  the **spindle** (`dprops.spindleOn`, latched by CONT35), not `motorRunning` —
  the 5.25" motor line never drives it. The icons are composited from
  `apple-35-floppy-drive.png` with the house layout (activity lamp bottom-left,
  filename across the top, rainbow apple bottom-right so it shares the Disk II and
  hard-card corner, which is also where the swapper badge lands). The loaded art
  shows only the disk's **leading edge** in the slot: a full card standing up
  there touches the dark band and the two merge into one black mass over the top
  half of the icon.
- The 3.5" icon's dark band carries the white filename, so its geometry is bound to
  the CSS overlay. It copies the **hard card's own numbers** - `harddriveOn.png`
  bands at x 6-185, y 6-36 of a 192x110 art, and `floppy35*.png` is 191x110 with the
  band at x 6-185, y 6-33 - so the two beige bays read as one family and the shared
  `.disk-label` (75px wide at a 7px left offset = source x 16-184) lands on the band
  with **no per-bay CSS at all**. A full-bleed black strip instead fuses with the
  panel's 1px `.disk-image` border and the whole top reads as one heavy frame.
  Measure insets in **CSS pixels**: the art is shown at 85x55, so one source pixel
  is worth 0.445 CSS px across but 0.5 down - equal source insets render as a
  visibly thinner gap left and right, and a label box wider than ~78px overflows the
  85px image and reads as the band sticking out. The earlier per-bay
  `.disk-label-onlight` did exactly that (and truncated names the hard card shows in
  full), so it is deleted; do not re-add a background plate either - the band is
  already dark there and a translucent box inside it showed up as a chipped corner.
- `iigsInitInterrupts()` runs on **cold boot only**. Ctrl-Reset must preserve low
  memory and `$03F2-$03F4`.
- IIgs speed labels in the dropdown and in `linkbuilder` / MCP settings must match
  `SPEED_MODES`.
- **The footer RAM readout follows the machine, not the slot-3 card.**
  `getMemorySizeLabel` (`src/common/utility.ts`) prints the IIgs as **8 MB**: the
  FPI's 23-bit RAM decode caps the installed 8 MB expansion card at banks
  `$00-$7F` on both ROM revisions (gssquared `iigs_memory.hpp`), and `gsRAM`
  allocates exactly that. The IIgs has no auxiliary slot card, so deriving the
  label from "is there an aux card?" fell through to 64 KB. Classic machines
  still add the slot-3 aux bank to the 64 KB base; the Apple II+ ignores it.
  Regression: `memory_label.test.ts`.
- **The machine menu's Apple IIgs entry carries a ROM submenu**: "ROM 01" and
  "ROM 03", persisted as the `iigsRom` localStorage key
  (`get/setPreferenceIigsRomVersion`, `MSG_MAIN.IIGS_ROM`). A PopupMenu parent
  with a `subMenu` never runs its own `onClick`, so each ROM item selects
  `APPLE2GS` itself when another machine is current; it posts the ROM version
  **before** `setPreferenceMachineName`, so the worker loads the right image on
  its first `doSetRom`. Switching ROMs cold-boots (`doSetIigsRomVersion` →
  `doBoot()`) and applies `$C036` seeding and the ROM-03 mouse source.
  Preference origin is `machine.iigsRom`. A page reload needs no extra work:
  `loadPreferences()` posts the stored version (`localstorage.ts`) **before**
  `MACHINE_NAME`, so the worker's `doSetRom` picks ROM 03 on its first load and
  the menu's tick always matches the running ROM.

---

## 10. Tooling and debug hooks

| tool / hook | what it does |
|---|---|
| `...\Temp\opencode\dis65816.cjs` | 65816 disassembler. `node dis65816.cjs <file.json> [at:N] [count] [m16] [x16]`; opcode table parsed from `c:\dev\gssquared\src\debugger\trace_opcodes.cpp`; accepts a plain `{start, bytes}` object |
| `...\Temp\opencode\diskserver.cjs` | static server on :6503 for `c:\dev\emu\ap2`, CORS open |
| `...\Temp\opencode\gs_deep_link.cjs` | fresh-profile deep-link check: `node gs_deep_link.cjs <waitS> <disk> <driveIdx> [rom] [port]` launches headless Chrome with an empty profile (so the browser really runs the `SLOT_CONFIG -> MACHINE_NAME -> mount -> NEED_BOOT` order), boots the link and prints canvas colour stats + a PNG. Pass `?romtrace=1` in its URL so `__romTracePeek([0x00FC1234,...])` can prove which ROM banks are mapped |
| `...\Temp\opencode\mckey.cjs`, `mcpeek.cjs`, `mc1.cjs` | MCS key injection / memory peeking over CDP |
| `...\Temp\opencode\prodos_names.cjs`, `prodos_dir_entries.cjs` | read-only ProDOS volume decoder: `node prodos_names.cjs <image> [filter]` walks the volume directory tree, `node prodos_dir_entries.cjs <image> <dirBlock>` dumps one block. **A directory *header* block keeps its own record at offset 4 and its children from 43 onward; a storage block packs from 0** — dumping a header block from 0 gives garbage. Verified entry offsets: byte 0 `(storageType<<4)\|nameLength`, name 15 B at +1, **file type +16, first block +17/+18, blocks used +19/+20, EOF 3 B at +21**. The textbook 17/18-19/36-37 offsets are wrong and produced `eof=12124162`. Ground truth: SystemDisk.2mg `start.gs.os` 13/27/13169 |
| `...\Temp\opencode\gs_da_drawer2.cjs` | real-UI DA drawer check: `node gs_da_drawer2.cjs <image> [waitS] [port] [driveIdx]` boots the volume on a fresh profile, clicks the machine-menu item, then sends the raw `rAlt`+`Esc` chord, saving `drawer_<TAG>_<n>.png` and printing per-step changed-row counts. The crop must start at the first **bright** canvas row: the IIgs black border puts the screen top at row 40 of the 818x511 canvas, so a strip taken from row 0 is blank |
| `...\Temp\opencode\gs_rom_desk_button.cjs` | real-UI check of the one-click IIgs Desk Accessories button: `node gs_rom_desk_button.cjs [waitS] [port] [machine]` boots a fresh profile with **no disk**, reports `#tour-iigs-desk-button` (`present` + tooltip + rect), clicks it and prints the changed canvas-row count with `deskbtn_<machine>_<n>.png`. It doubles as the visibility probe (`present: false` on the IIe) and is the fastest way to see whether the ROM boot actually reached its desk manager |
| `...\Temp\opencode\gs_applecorn_ui.cjs` | real-UI Applecorn check: `node gs_applecorn_ui.cjs [waitS] [port] [rom]` boots `applecorn-0.54-beta.po` on S5,D1 with a fresh profile, presses `1` with a raw CDP key, prints the changed canvas-row count, peeks `$E1`/`$E0:$0800` back into the 80-column merge (`__romTracePeek`) and saves `acui_rom<rom>.png` |
| `...\Temp\opencode\gs_stars_play.cjs` | real-UI Stars & Planets check: `node gs_stars_play.cjs <bootWaitS> [port] [stepWaitS]` boots the volume on a fresh profile and diffs the canvas **per pixel** over the screen bounding box after each step, which is what proves the app is alive: Return changes 240623 of 417999 pixels, a digit 13622, a panel button 1833. `stepWaitS` must be ≥ 25 s — the program's own module load takes ~20 s at 1990 disk speed, and a shorter wait reads the whole thing as frozen (§11.17) |
| `...\Temp\opencode\gs_stars_ui.cjs` | superseded by `gs_stars_play.cjs`: it waits 3 s per keystroke and counts changed canvas **row sums**, so it reports 0 changed rows for keystrokes that actually redraw the screen. Kept only for the PNG series `stars_<disk>_d<n>_k<n>.png`. Two traps, both real: too short a window, and a metric too coarse to see SHR changes (§11.17) |
| `...\Temp\opencode\tp_cloud_census.cjs` | real-UI raster-flicker census (§11.16): `node tp_cloud_census.cjs [waitS] [port] [sampleMs] [tag]` boots TimePilot GS on a fresh profile, samples the canvas once per **painted** frame for `sampleMs` and prints how many scanline bands still carry cloud-white. The row set is chosen by the *maximum* over the run, not the median, so two builds of the emulator are comparable — a median would silently drop exactly the rows that flicker. Run it once with `captureShrBeamLine()` commented out to get the "before" number |
| `...\Temp\opencode\gs_woz35_bay.cjs` | real-UI bay check for a large `.woz`: `node gs_woz35_bay.cjs <url> [waitS] [port]` boots a fresh profile on `?drive=N` and prints each bay's label + status (it walks up from every `.disk-label` to the smallest ancestor naming exactly one `S[567],D[12]`) plus any error dialog, and saves `%TEMP%\woz35_bay.png`. This is what proves a capture asked for slot 6 actually lands in S5,D1 and reaches its title screen |
| `...\Temp\opencode\gs_s5_swapper.cjs` | real-UI check of the slot-5 multi-disk swapper: `node gs_s5_swapper.cjs <urlA> <urlB> [waitS] [port]` boots a fresh profile on `?machine=apple2gs&boot=true&s5d1={A,B}`, reports which bay holds which file plus whether it carries a `.disk-multidisk-badge`, clicks the badge, dumps the menu and clicks the second entry, then re-reads the bay. **PopupMenu items are `div.droplist-option`** — the obvious `.popupmenu-item` / `[class*=popup] div` selectors match nothing and make an open menu look empty. Its `Network.requestWillBeSent` log counts the disk-server fetches, but remember the page URL itself contains `6503/` in its query, so the navigation always shows up as an extra "request" |
| `...\Temp\opencode\gs_linkbuilder.cjs` | real-UI Link Builder check: `build [waitS] [port]` boots a fresh-profile IIgs, opens 連結產生器 and dumps every `select` (name/value/options) plus the readonly link textarea; `emit [waitS] [port] [url]` also picks Custom URL on each drive row, types the URL into the 3.5" drive-1 field (matched by its language-independent `http://example.com/floppy35.dsk` placeholder) and prints the emitted link; `visit <port> <url> [waitS]` opens that link on its own fresh profile and reports `#tour-iigs-desk-button`, the footer (`2.61 MHz, 8 MB`), `.disk-label` texts and the `S5,S1…` bay statuses — the only way to prove a built link actually boots the machine it names |
| `...\Temp\opencode\gs_chord_ui.cjs`, `gs_menu_visibility.cjs` | real-UI key-chord check: `node gs_chord_ui.cjs [waitS] [port]` boots GS/OS on a fresh profile and compares canvas **scanline row-sums** around raw host keys, so `bare W changed rows: 0` vs `Closed-Apple + W changed rows: 281` is the observed evidence (§6); the visibility variant takes a `[machine]` argument and stops before the keystrokes, which is how the IIgs-only menu item was confirmed absent on the IIe. Select menu entries by `/機器配置\|machine configuration/i` title text — headless Chrome renders the UI in the user's language, and the `basic-button` id is reused by several components |
| `...\Temp\opencode\gs_excalibur_ui.cjs` | `node gs_excalibur_ui.cjs <s7d1\|s5d1> [bootWaitS] [port] [stepWaitS]` boots all three Excalibur volumes in one standby group, selects leaf `.droplist-option` items through 3 → 2 → 3 and presses Space after each swap. Use 180 s boot / 45 s steps for the 3.5" path; PNGs and per-pixel diffs distinguish prompts from the final menu. It asserts each mounted filename, logs browser exceptions, and returns to Disk 1 if it was dirty to verify the unsaved marker survives. |
| `...\Temp\opencode\bmp2png.cjs`, `shr2png.cjs` | Convert a 32-bit BMP or raw 32 KB SHR window to PNG. PNG chunk lengths, CRC and IHDR dimensions are big-endian; SHR palettes follow each scanline's SCB. |
| `?romtrace=1` | PC histogram + `window.__romTrace`, `__romTracePeek(addrs)` reads guest memory (peekPc/peekCode/peekZp) |
| `?iwmgaps=1` | IWM read-cadence stats on `window.__iwmStats` |
| `?adbtrace=1` | ADB log ring on `window.__adbLog` (pc-stamped) |
| `?ensoniqdbg=1` | DOC state on `window.__ensoniqDocStats` (osc rows, osce, irqTicks, block ring, vblCount) |
| `window.__audioDebug` / `__ensoniqDebug` / `__ensoniqBlocks` | speaker clicks, Ensoniq context state, blocks actually started |
| `?shr=1` style dumps | `__shrWindow` memory dump used for SHR inspection |

**Measurement traps**

- A 65816 PC is logged **after** operand fetch in a wrapper (`LDA $C03D` at
  `b915` logs as `b918`). Allow for the operand length.
- A PC filter that ignores the bank silently mixes bank 0 loops into banked
  ranges.
- `readData` is `$C026`; `$C024` is `readMouseData`. Wrapping the wrong one
  reports a confident zero. A helper that reads `$C024` from inside a wrapped
  `readMouseData` re-enters it — guard against recursion.
- GS/OS runs native mode, so `$AD`/`$8D` are 4-byte long forms; an absolute-only
  decoder finds zero `$C02x` accesses. Wrap the device method and read `cpu.PB/PC`.
- **Raw CDP key events need `canvas.focus()`** and `type: "rawKeyDown"`
  (`keyDown` is dropped). Click `#tour-reset-button` instead of synthesising
  Ctrl+R; synthetic Ctrl+R is unreliable.
- Typing multi-character programs through CDP loses characters; real key events
  into the guest are slow. Prefer jest (`setKeyboardState` direct) for anything
  that types.
- A probe that sends `setKeyboardState({key})` **without `isDown: true`** silently
  takes the release branch and types nothing.
- `dis65816.cjs` with a plain `{start, bytes}` object ignores `at:`/`count` and
  decodes the **whole** buffer; if the slice does not end on an instruction
  boundary it throws mid-print and produces no output at all. Pad the tail with
  `$EA` (`NOP`) and it decodes cleanly.
- CDP `Runtime.evaluate` needs `awaitPromise: true` for `decodeAudioData`, and
  large dumps must be chunked (~120k floats per call). Channel data is float
  -1..1, not int16.
- `gs_boot_out.txt` and `gsos_boot.bmp` are **rewritten by every run** of
  `gs_boot`/`gsos_boot` and their diff is not evidence: the `$FF:85xx` gate-trace
  A values vary run to run (measured 0x8029/0x802f/0x8033 on the same code), so
  a dirty artifact after a fix says nothing about the fix.

---

## 11. Open issues

1. **MCS (`mcs.2mg`) splash timeout — RESOLVED.** The ProDOS-8 splash
   (`MCS Copyright (c) 1986 Will Harvey` / `PRODOS 8 V1.2 06-SEP-86`) waits at
   `01:33C8` (65816 native mode, bank-1 fast RAM) for a key on the
   **`$E0:C000`** keyboard register and exits via `STA $E0:C010`. With no key it
   times out after ~9.6 s per pass (two passes), loads the demo
   `/MUSICGS/LEROY` into bank 0 `$2000-$4000` (MLI `$CC`/`$C8`/`$C9`/`$CA` all
   return success), then relocates its music driver at `01:a9ee-$aa16`: it
   writes `$C035 = $5F` (**SHADOW_INH_IOLC, bit 6**), block-copies `$1E00`
   bytes from `$00:2512` to `$C000,Y` with DB = `$01`, and restores `$C035`.
   Our `memGet24`/`memSet24` routed bank `$00`/`$01` `$C000-$CFFF` to the Mega
   II unconditionally, so the copy poked soft switches (`$C02D`, `$C03C/D`, ...)
   and the machine ran off into `00:E03B` (`JMP` to itself) instead of
   reaching the editor. Fix: honour bit 6 — while `SHADOW_INH_IOLC` is set,
   banks `$00`/`$01` expose fast RAM across `$C000-$CFFF` (bank 1 = aux, bank 0
   by ALTZP), matching gssquared `is_iolc_shadowed()` /
   `bank_shadow_read/write`. No key now ends in the editor with the LEROY demo
   loaded (SHR on, measures shown, DOC streaming the song); a key at the splash
   goes straight to the empty editor (`01:a64c`). Regression:
   `gs_mcs_nokey.test.ts`. Note the splash timeout is measured in CPU cycles,
   so the frame it lands on follows the speed mode: ~925 at the current 2.8 MHz
   default, ~3200 at 1.02 MHz.
2. **SenseiPlay music too fast — RESOLVED.** Two stacked bugs, both in the run
   loop's Ensoniq catch-up:
   - The catch-up state (`ensoniqRefreshId`/`ensoniqOutCursor`/
     `ensoniqSamplesPerRefresh`/`ensoniqScratch`) was declared *inside*
     `doAdvance6502`, so every call started with `refreshId = -1`, re-ran the
     rollover, generated a look-ahead block at the end of the call that the next
     call threw away, and advanced the DOC march ~1.5 refreshes per refresh
     (measured 40004 generated samples/s against a 26320 Hz chip — ~667 per
     refresh instead of 439). Posted audio stayed 1x (439 frames per block), so
     the timer oscillator ticked at ~76 Hz and the tracker ran 1.5x fast with
     correct pitch.
   - Gating generation on `hasActiveOscillators()` (commit `bd90c7d4`) then
     paused the DOC clock whenever all voices momentarily halted — about a
     quarter of every tracker refresh — so with the lookahead gone the march
     ran ~0.76x and the music dragged. The chip's sample clock must advance
     every refresh regardless of activity (the silence path fills zeros but
     keeps `samplesGenerated` moving).
   Fix: hoist the catch-up state to module scope, drop the `force` look-ahead
   (generate only up to elapsed time), and always generate (silence fast path).
   Verified: generated = 26343 samples/s = 439/refresh exactly (was 40004 then
   20003); the TN #23 timer voice now ticks at 50.2 Hz and the player's
   `Pos:` line advances ~18.3 rows/s.
   - Corrected ground truth: the authored average is **2.735 ticks/row** (pattern
     0 is 3,3,3,2 repeating = 2.75; the song overall 2.81), not 2.05 — the
     earlier 2.05 came from reading only rows 0 and 3 of pattern 0, and the
     "37 rows/s" was the broken (1.5x) build's measurement. At 50.2 Hz that is
     17.8-18.3 rows/s, which is what the fixed build produces.
   - Regression tests: `gs_ensoniq.test.ts` (silence path keeps the clock moving;
     TN #23 timer ticks at the chip's own rate) and `gs_doc_clock.test.ts`
     (run loop: exactly one outRate/60 block per refresh).
3. **Silpheed pitch** — same instrumentation, during playback.
4. **MYCRATE app library** — Silpheed is the only app confirmed to launch
   (reaches its "PRESS A JOY BUTTON" prompt). SynthLab and others: the Finder
   reached, the icon never double-clicked in automation. Unverified, not broken.
   Note that a *joystick button* in apple2ts is Open/Closed Apple (`AltLeft`/
   `AltRight`, numpad `0`/`5`/`.`/Enter), a gamepad button, or the touch joystick;
   arrow keys are axes, and only with "Use Arrow Keys as Joystick" enabled.
5. **Two QuickDraw II rendering defects** (not input related): Finder
   desktop-layer icons render as solid black bars (the same icons inside a volume
   window render correctly), and grayed-out menu items render as garbage glyphs
   while enabled items are fine. Both point at the mask/transfer path of QD II
   copybits (`TOOL034`), compare against `display.cpp`.
6. **3.5" floppies — RESOLVED for 2MG block images and WOZ2 captures.**
   `src/worker/devices/floppy35.ts`
   expands the 800 KB volume into self-synchronising GCR fields per track-side
   (zoned 12/11/10/9/8 sectors, 160 track-sides), streams them on the machine
   clock and splices writes back into the block image. `SystemDisk.2mg` boots
   from slot 5 into the SHR Finder desktop and every field still decodes to the
   *written* image afterwards (`gs_floppy35`, `gs_floppy35_boot`). A ProDOS 8
   volume does the same: `A2DeskTop-1.5-en_800k.2mg` reaches its banner from slot
   5, so the guest's own kernel and startup application arrive byte-exact through
   the live IWM path. Writes were the weak half until the 7-bit track number was
   rebuilt in the decoder — cylinders 64-79 aliased to 0-15 and their written
   sectors were dropped (§7); now all 160 track-sides splice, verified through a
   remount. A captured 3.5" WOZ2 now plays through slot 5 as well:
   `Cavern_Cobra_IIgs.woz` (1,296,147 B, write-protected) reaches its Super
   Hi-Res title from S5,D1 under **both** ROMs (`gs_floppy35_woz`), once the
   classifier puts it in the bay and `decodeWoz2` reads the disk type from INFO
   byte 1 instead of the creator padding (§7). Still open: captured `.do`/`.nib`
   3.5" images have no importer.
7. **SilkyGS ports render a blank SHR screen — RESOLVED.** Volume `SilkyGS.2mg`
   in S7D2 with `SystemDisk.2mg` in S7D1; picking e.g. Super Mario Bros left the
   screen a uniform palette-0 blue although the game blitted every frame. Every
   bank-$00 store was mirrored into Mega II **main** regardless of the effective
   bank and the `$6000-$9FFF` half of the SHR window was not mirrored at all, so
   the ports' RAMWRT blits (DB=$00) landed in aux fast RAM where the video
   scanner never looked. Fix: `iigsEffectiveAuxWrite` + `shadowIigsWrite` in
   `memSet24` follow gssquared `calc_aux_write`/`shadow_is_enabled` (§2).
   Regression: `gs_silky.test.ts` (Finder double-click into the port, then
   asserts >100 scanlines of SHR pixels and >5000 non-zero Mega II aux bytes).
   **That test is currently red on the byte count** — 2874 non-zero, with SHR on and
   100+ scanlines carrying pixels — measured identical at `HEAD` with this branch's
   ADB work reverted, so the blit path still works but the title screen is sparser
   than the assertion expects. Open: whether the port now draws less (a Finder
   timing/double-click difference at the 2.8 MHz default) or the threshold was
   calibrated on a luckier run.
8. **freegemas.2mg mouse would not move — RESOLVED.** The game is a self-booting
   GS/OS match-3 port that keeps its own cursor: it reads `$C024` twice per
   frame (X then Y) from bank `$09` and accumulates the deltas itself, so the
   Event Manager never publishes a position and the text holes stay `(0,0)`.
   The closed-loop stepper therefore saw the cursor at the origin and injected
   ±63 chunks toward the host target every frame; the game applied them and its
   pointer raced into the bottom-right corner and stuck there. The Tool Locator
   flag is not evidence that a guest maintains the EM cursor. Fix: the loop
   requires a non-zero published position and demotes to dead reckoning when a
   consumed report leaves it unmoved (§6). Verified end to end: the pointer
   tracks relative motion and a left click on "Timetrial mode" starts the board
   (regression: `gs_freegemas.test.ts`).
9. **GS/OS 6.0.1 ExpressLoad bank straddle — open, guest-side.** MYCRATE.2MG
   boots from S7 with no slot-5 media (`gs_mycrate`), but the same volume fails
   with `Sorry, system error $0201 ... NIFTYLIST.CDA` whenever a 3.5" disk is
   mounted in slot 5 at boot, because the ROM reports the mechanism, the boot
   allocation grows by ~498 bytes and a 7-byte relocation record lands on
   `$7E:FFFF` (§7). No emulator setting avoids it other than not presenting the
   slot-5 mechanism (`GS_35DELAY` bisect: 1M cycles still crashes, 4M/10M boot
   but Card Cat's scan then fails at both). It is a GS/OS loader limitation, not
   a drive-model bug; do not "fix" it by hiding the drive. §11.11 was the same defect
   reached another way (ROM 03's allocation instead of a mounted slot-5 disk), with
   the straddling record and the bogus fix-up measured byte for byte; that path is
   now resolved by the SmartPort card's advertised capacity (§7), which moves the
   whole allocation by a multiple of 7 bytes - this slot-5 case has not been
   re-measured since.
10. **Arkanoid from MYCRATE: no bricks, permanent sprite trails — RESOLVED.**
    Same disk boots fine from floppy and the MYCRATE copy works in
    gssquared/gsplus, so the fault was ours. The game composes its playfield in
    bank `$09` inside a GS/OS copy bracketed by `$C035 = $57` / `$C036 |= $10`
    (`$08:8A5F`), i.e. it relies on `SPEED_SHADOW_ALL` to mirror bank `$09`
    writes into Mega II aux; the paddle is blitted straight to `$E1`, which is
    why it moved while the bricks never appeared and old pixels were never
    erased. We ignored `$C036` bit 4, so bank-$09 stores stayed in fast RAM —
    bank `$09` held the level while `$E1` kept the hatch wall. Fix:
    `shadowIigsBankWrite` (§2). Regression: `gs_shadow_all.test.ts`.
11. **MYCRATE desktop on ROM 03 — RESOLVED: the SmartPort card advertised too
    few units.**
    Only with MYCRATE as the boot volume; plain `SystemDisk.2mg` renders
    byte-identically on both ROMs. The whole visible chain (no icons, garbled menu
    bar, "Infinite loop while walking icon list", and the
    `Finder requires System 6.0.1 … ($0401)` alert) comes from **one 11-byte
    relocation record that MYCRATE's own fix-up walker cannot read across a bank
    boundary**, measured with `gs_rom03_reloc.test.ts`:
    - The fix-up engine is **MYCRATE's own bank-`$01` loader**, a byte-exact copy of
      MYCRATE.2MG file offsets `$C3C5-$C8C4` (`memory = file + $143B`), not ROM code
      and not anything the emulator injects: `$01:D6D7` reads an 11-byte record with
      `LDA ($52),Y`, `$01:DA46` dispatches on the kind (`$56` = size) and modifier
      (`$58` = `$00` direct, `$F0` use the high word, `$F8` use the low byte, ≥$80
      rotate, <$80 shift), and `$01:DAAx` (`$87 5a` = `STA [$5A]`) writes the value at
      the 24-bit destination staged in DP `$995A-$995C`.
    - `LDA ($52),Y` is a **16-bit** indirect, so it cannot read past `$xx:FFFF`: a
      record that straddles a bank boundary is read *wrapped* inside its first bank.
      The `$08:$0000` module has exactly two records, and both ROMs produce the same
      bytes — `e2 02 f0 77 6c 00 00 0f 40 00 c0` and `e2 02 f0 dc bb 00 00 0f 40 00 c0`
      (i.e. `$08:6C77 ← $C008` and `$08:BBDC ← $C008`) — only the *placement*
      differs. With the old 2-unit SmartPort card ROM 01 put the list at `$7F:01C0`
      and ROM 03 (whose 256 KB startup allocates less here) at **`$7E:FFF3`**, so
      the second record started at `$7E:FFFE` and wrapped. With the 32-unit card
      (§7) the lists sit at `$7E:F7E8` (ROM 01) and `$7E:F61B` (ROM 03), both whole
      (32 units plus the slot-5 bays reproduce gssquared's own `$7E:F4F1`).
    - Read wrapped, that record decodes as a 2-byte fix-up of **`$08:$0000` ←
      `$4F08`**, which lands on the first word of MYCRATE's own stub and replaces its
      `PHK; PLB` (`4b ab`). The stub then leaves `DB = $E1` when it re-launches, so
      MYCRATE reads its icon tables at `$0410/$0428` through **Mega II aux** (where
      they hold `$A0` text-page spaces) instead of bank `$08` — the walk loops, the
      relaunch runs with `D = $0000`, and the MEM tool's `MaxAmountAvail`
      (`JSL $E10000`, `X=$1801`) reads its parameter list through DP `$0000`, returns
      `A=$0401 C=1` and pops the alert.
    - The emulator executed exactly what the guest asked for: DP `$995A = 00 00 08`
      (dest) and `$995E = 08 4f` (value) were both written by MYCRATE's own loader
      from its own (wrapped) record. `$01:DAAE` runs 250 times on ROM 01 and never
      touches bank `$08`; on ROM 03 it runs 213 times and the offender is call #176
      (~frame 930).
    - **The list placement follows the slot-7 card's advertised unit count.** GS/OS
      sizes its boot-time device structures at **84 bytes per SmartPort unit** the
      driver status reports: 2 -> 16 units moved ROM 03's list by `14 x 84 = 1176`
      bytes, 2 -> 32 by `30 x 84 = 2520`, and 32 units plus the always-present
      slot-5 bays reproduced gssquared's own `$7E:F4F1`. Advertising more units
      while all but two answer offline still moves the list, so GS/OS charges for
      the advertised capacity, not for mounted volumes. gssquared's `pdblock3`
      advertises `PDB3_MAX_UNITS = 32`; GSplus stops at `MAX_C7_DISKS = 16`; the
      old card advertised 2, which parked the ExpressLoad buffer flush against the
      bank end. `SP_MAX_UNIT = 32` with `SP_DRIVE_UNITS = 2` (§7) keeps the stub's
      `PHK; PLB` (`4b ab`) intact and the Finder boots without `$0401`. The same
      capacity fixes AlterEgo: its loader (a different GS/OS build, running at
      `$01:D724` with DP `$9900`) put a record list at `$7E:FFF8` with 16 units and
      died on `LoadDump.DA`; with 32 that list moves clear and the game boots to
      its title screen (regression: `gs_alterego.test.ts`). A different module's
      7-byte record still ends at `$7E:FFFA`, so its last byte wraps - measured,
      and it does not prevent the boot.
12. **MYCRATE menu music noise — fixed at the transport, unconfirmed by ear.**
    The DOC itself is not the source: over a 1600-frame MYCRATE boot the guest
    writes the chip 138 631 times, loads 65 272 of the 64 KB of DOC RAM and sets
    `oscsenabled = 32` at ~frame 119, then leaves **every** oscillator halted, so
    headless automation captures no music PCM at all — the menu that plays the tune
    needs real interaction. The defect that puts noise under any DOC stream is the
    per-block resample restart in the UI transport (§5), measured on real Tass
    Times title audio at 2.32x the signal's own sample-to-sample slope every
    16.7 ms. Needs the user's ear on the MYCRATE menu itself.
13. **GS/OS DA drawer never opens — guest-side, open.** Closed Apple + Esc reaches
    `$C025` and the Finder takes the chord, but the menu-bar drawer hole is never
    though every local volume ships a populated `System/Desk Accs` and the Finder
    reads those blocks at boot. Decoded from the guest's own SHR bytes, so this is
    **not** a render-side defect; the cause is the same QuickDraw II mask/transfer
    family as §11.5. The machine-menu item therefore opens the **ROM's** Desk
    Accessories menu instead (§6), which works; nothing here is waiting on the
    ADB-micro intercept or the `$C027` realignment — both are in, and the earlier
    `0911` fatal error they seemed to cause was our own bit-0 report (§3).
14. **Applecorn 0.54-beta "crashes" on the IIgs — RESOLVED: it never crashed.**
    `applecorn-0.54-beta.po` in S5,D1 came up as a screen of interleaved garbage
    on both ROMs after picking BBC BASIC, and looked frozen. The guest was fine:
    its MOS boots, loads `/APLCORN.SYSTEM` and writes its own banner
    (`Applecorn v0.54-beta-0-g3325769`, `BASIC`, `>`) with native 24-bit stores
    into `$E0:$0800` / `$E1:$0800` (measured 960 writes per bank — the two halves
    of the 80-column page). The renderer read page 2 from bank-`$00` fast RAM on
    **both** ROMs, just for different reasons: ROM 01 through the extrapolated
    `!isIigsRom03()` branch, ROM 03 through the `$C035` bit-5 test, because
    Applecorn leaves `$C035 = $28` there (ROM 01: `$08`) — and the beam does not
    care about either (§2, §4). So both showed the identical stale page, whose
    surviving text was an earlier boot attempt's `ram too large **** Unable to
    load APLCORN`. Fix: `iigsTextMainSource` / `iigsTextAuxSource` return Mega II
    unconditionally. Verified in the real UI on both ROMs
    (`Temp\opencode\gs_applecorn_ui.cjs [waitS] [port] [rom]`: 213 changed canvas
    rows after the keystroke, and `__romTracePeek` over `$E1/$E0:$0800` merges
    back to the banner) and in jest: `gs_applecorn.test.ts` boots the volume on
    ROM 01 and ROM 03, asserts the banner **and** that BBC BASIC answers a typed
    `PRINT 6*7` with `42`, pins the bytes to the Mega II banks (the fast-RAM merge
    must *not* hold them), and keeps the //e reading its own fast RAM. Restoring
    either old branch turns both ROM cases red with exactly the garbage the user
    reported.
15. **`doom-hd.hdv` "loads forever then freezes" — the guest aborts, and its own
    fix is the one mode we cannot run.** The volume is a GSplus raw block image
    (2,670,592 B) and its bundled readme says *"The game needs an accelerator and
    4 MB of memory."* At the 2.8 MHz default it really does boot and runs its own
    init — the WAD is clearly in (`ADDING DOOM1.WAD` / `SHAREWARE VERSION`) — but
    dies mid-`R_Init`: the last thing on the text page is an unfinished progress
    bar (`R_INIT: DOOM REFRESH DAEMON - [……]`), `$03:669A` (DOOM's own teardown /
    error exit) is hit exactly once, and the machine then runs away through bank
    `$00`'s `$C0xx-$CFxx` window while the stack unwinds, so a keypress changes
    nothing on screen. That is the "卡很久、感覺當住" the user saw, and it is not a
    bad read: nothing in our SmartPort path is failing. The accelerator the volume
    asks for is speed mode 2 or 3, which currently boots **no** volume at all
    (§8), so there is no working high-speed option to test it under. Open: whether
    DOOM's abort is only the missing cycles or also a 65816 feature we model
    wrong — deciding that needs modes 2/3 to boot first.
16. **TimePilot GS clouds flicker — RESOLVED: the screen was a one-instant
    snapshot of the SHR window.** Nothing was ever skipped for speed (§4): the
    guest *is* drawing every frame. TimePilot schedules against the raster —
    `gameProcessThings` erases every thing already above `zScanLine` and then
    redraws it, and at wrap `gsRasterDone` forces one extra pass with
    `zScanLine = #$7dff` — so for most of a refresh the window legitimately holds
    a layer that is erased and not yet redrawn. Posting that as the picture made
    the cloud bands vanish on a large share of frames. Measured on the same 200
    frames (1550-1750, jest, counting the scanlines that carry cloud colour 1/9):
    the raw end-of-refresh buffer has median 81 cloud rows with **53 frames below
    70** and a minimum of 53 — whole bands, top to bottom, missing for a frame at a
    time. The beam-captured picture over those identical frames: median 98,
    **0 frames below 70**, minimum 76, and no single frame loses more than 22 rows
    (the raw buffer loses 35). In the real UI the same difference shows as the
    median number of cloud bands per painted frame going from 33 to 42 of the same
    row set (361 painted samples, and both numbers reproduced on a second run),
    with three bands never appearing at all without the fix. A handful of beam
    frames still lose the top band — that is the guest genuinely racing the beam at
    wrap, and gssquared would show it too.
    Regression: `gs_timepilot_flicker.test.ts`, red both ways: not calling
    `captureShrBeamLine()` and posting `getShr()` again makes the two buffers
    identical (`framesDiffering = 0`) and fails all three census bounds.
    - Late draws: `noteLateShrStore` folds a store after the beam captures its row
      into the displayed frame immediately. A late nonzero paints (MSpacMan's top
      row stays complete) and marks the byte; a late zero clears only that
      late-painted byte, so an erase landing on captured background does not wipe
      the captured layer. TimePilot's cloud bytes are the exception: a late zero
      or opaque `0xFF` mask there is the cloud layer/mask erasing behind the beam
      and stays captured; a coloured plane pixel still paints. A blanket "leave
      every cloud byte alone" rule dropped the plane pixels and made the aircraft
      flicker. The mask wrongly folded at all
      because `shrCapturedRows` was reset at beam line 0, so VBL stores still saw
      the previous frame as captured; reset at the refresh boundary (`beginShrFrame`)
      is what fixed the aircraft. Browser census (Chrome, fixed crop): before the
      boundary reset the player sprite drew only 8 plane pixels in two of 28
      gameplay frames and 33 in a third; after it the same 36 plane pixels
      appeared in every one of 28. The late-zero background rule fixed
      Kernkompetenz's cube apex: offline frames 6140/6160 complete the cube where
      the zero fold had flattened its top, and the marker is cleared per captured
      row in `captureShrBeamLine()`.
      The SCB table and palette table are folded whole as well: a late rewrite
      landing there belongs to the displayed frame even though no pixel row flag
      applies, because the VGC latches the SCB per line and the palette at the
      frame's start. A stale control or palette byte can otherwise make an
      otherwise-folded sprite invisible under load.
    - Module-scope `lastShrFrame` and the uncapped timer are part of the same
      fix: a per-callback `-1` fake boundary cleared the flags on every timer
      jitter, and a speed-mode switch (`Ctrl+4` Fast) reset the video clock
      without preserving that boundary until `doSetSpeedMode` used
      `resetIigsVideoClock(true)`. The timer must run every overdue refresh; a
      cap would be a frame drop, not a scheduling convenience.
    - Regression: `gs_shr_late_store.test.ts` (late paint, background-preserving
      zero, late-painted erase, TimePilot cloud zero and mask skip, MSpacMan
      scoping, SCB/palette table folds, and the refresh-boundary store case),
      `gs_timer_catchup.test.ts` (early/late/all-overdue/warp scheduling), §4.
    - Browser verification (Chrome canvas clips, 14.3 MHz after Ctrl+4):
      MSpacMan active gameplay captured 160 frames at 50 ms over the same maze
      and character sprites — the posted picture kept 5822-5929 non-zero bytes on
      every frame, with the top row and sprites intact. TimePilot GS enemy waves
      under the same speed show yellow enemy aircraft in every sampled heavy
      frame (player sprite and enemies both present). These are the exact scenes
      the complaint named, not only synthetic buffer comparisons.
17. **Stars & Planets (1990, Advanced Ideas) freezes — RESOLVED: the video
    counter's last six rows were one bank too high.** `stars & planets
    (1990)(advanced ideas).2mg` is a self-contained 800 KB GS/OS volume, so it
    boots straight to its own title. Booted from slot 5 in the real UI it stopped
    on "Welcome to the //gs" with the head parked (Trk 66) and the same picture
    forever — and the same stall from **slot 7**, where no nibblizer is involved,
    exonerated the 3.5" media path immediately. The PC histogram was a
    six-instruction spin at `$01:A06B-$A079` (~4.7M hits in 4000 frames) inside
    GS/OS's bank-01 startup: `LDA $E0C02E / ASL / ADC #$0000 / AND #$01FF / CMP
    #$00FA / BNE`. With M=16 the 4-byte `LDA abs,long` reads **both** counters,
    and `ASL; ADC #$0000` rotates `$C02F` bit 7 (the counter's bit 0) back into
    bit 0, so the sequence rebuilds the raw 9-bit vertical counter and waits for
    `$00FA`. Our model produced the wrap rows as `$1FA-$1FF` instead of
    gssquared's `$0FA-$0FF`, so `$C02E` reported `$FD-$FF` where hardware reports
    `$7D-$7F` and the value `$0FA` never existed. Fix: `readIigsVideoCounter`
    wraps to `0xfa + (line - 64)` (§3).
    - Measured on the fix from slot 7 in jest: the title screen arrives (SHR on,
      `$C029 = $C1`, 31311 of the 32768 window bytes non-zero) and Return starts
      the program, whose solar system then changes the SHR picture 119 times over
      the next 2400 frames, the first change at frame 1200. That 1200-frame wait
      is the program's own module load running at 1990 disk speed (~20 s), so any
      window shorter than that reads as "frozen" — which is exactly how the 3 s
      per keystroke harness misled the first round of this investigation.
    - With the `$1FA` wrap restored the title screen *does* paint (32489 non-zero,
      the same static picture) and then nothing ever changes again: 0 changes
      across the identical 2400-frame window. So the visible symptom is "title,
      then dead", and from the 3.5" drive the boot is slow enough that it never
      even reaches that title inside a short wait, which is the "splash" reading
      above.
    - Verified in the real UI with `Temp\opencode\gs_stars_play.cjs [bootWaitS]
      [port] [stepWaitS]`, which waits 25 s per step and diffs the canvas
      **per pixel** over the screen bounding box: 240623 of 417999 pixels change
      after Return, 13622 after a digit key, 1833 after clicking a panel button.
      The older row-sum harness (`gs_stars_ui.cjs`) reported 0 changed *rows* for
      those same keystrokes — small SHR changes do not move a row mean.
    - Regressions: `gs_vcounter.test.ts` (all 262 row values of a refresh in
      order, the reconstructed 9-bit counter reaches `$0FA`, and Tass Times'
      `$C02E == $E8` stays reachable — all three red with the `$1FA` wrap) and
      `gs_stars.test.ts` (the same red end-to-end on the volume: the frozen build
      fails with `firstChangeFrame = -1` and `changes = 0`).
18. **Stars & Planets does not respond to the mouse — not a defect: the volume
    never asks for ADB.** Listed here only because it looks like one. The title
    screen is keyboard-driven: it polls `$C000` ~10 times a
    frame from `$01:109F0` and `$C08B` from `$01:9E59/$9E5D`, and measurement over
    the whole post-boot run shows it **never** writes `$C027` bit 6 (the mouse
    interrupt enable), never reads `$C024` or `$C026`, issues no ADB command after
    the ROM's own boot self-test, and makes zero `$E10000` tool calls while idle.
    `$E1:0030` is rewritten by the guest OS, but `$E1:0034` stays the ROM's
    unclaimed `JML $FF:B5DE` stub. The ROM is therefore right to refuse the
    pointer: its mouse dispatch at `$FF:B973` is `LDA $C027 / STA $E100C5 / ASL /
    BPL $B989 / BCC $B989 / JSL $E10034`, so it needs **both** bit 7 (mouse data)
    and bit 6 (mouse interrupt enabled) before it will call the task — and bit 6
    is the enable this guest never sets. Our status byte is not the difference:
    `readStatus()` reports bit 7 unconditionally, as KEGS `adb_read_c027` and
    gssquared `ADB_Micro.hpp::read_status` do, and only the *interrupt* follows
    the enable bits. `$C027` ends at `$98` (mouse and keyboard data pending,
    unread) — authentic for a guest that ignores ADB and polls `$C000` instead.
    GS/OS 6.0.1 applications get their mouse through the `$FF:C4xx`
    Mouse-Card-compatible firmware instead (`$C479 TSB $C027` sets bit 6, `$C4D2`
    reads `$C024`); a ProDOS 16-era program that never enters it gets none.
    Digit keys do work (13622 pixels change), so the app is usable.
19. **Spirit of Excalibur ignores disk swaps — RESOLVED.** Both S7,D1 and
    S5,D1 accepted the new image without telling the guest. Same-size volumes
    returned identical status, so the game stayed on `INSERT DISK 3`. Mounts
    and ejects now latch `diskSwitched`: SmartPort reports and clears it through
    status bit 0, while Sony sense selector 6 reports it until CONT35 `$9`
    acknowledges (§7). `gs_excalibur` boots disk 1 and swaps 3 → 2 → 3 through
    both bays to the England map and new-game menu; removing the latch makes
    both cases fail with only 3764 non-zero SHR bytes instead of >20000.
    The graphical swapper had a second blocker: Disk 1 becomes dirty during
    slot-5 boot, and its forced Save As picker aborted the swap on cancellation.
    It now retains unsaved URL media in standby without prompting (§9), and
    remounting restores the dirty flag and write timestamp after decoding.
    Verified in fresh Chrome profiles through both bays: 1 → 3 → 2 → 3 reaches
    the England map and `START A NEW GAME / LOAD A SAVED GAME`; returning to
    Disk 1 in S5,D1 keeps its `*` unsaved marker after the worker reply.
20. **Spirit of Excalibur's captured cursor cannot reach the upper-left —
    RESOLVED.** With F1 held the pointer lock and the relative path both work
    (queued counts reach `iigsADB.queueMouse`), but the in-game cursor stayed in
    the lower-right. The game keeps its own cursor, so `getIigsMousePos()`
    (text-page holes / `$E1:0190`) is the wrong reader and stays `(0,0)`; the raw
    disk operands `$000299`/`$00029B` are relocation inputs, and the live
    addresses come from the `STA long` operands at `$06:8A2E` (X) and `$06:89EF`
    (Y) — `$02:0DCB`/`$02:0DCD` in the observed boot. Its decoder clamps a
    positive delta at 319/199, and for a negative one masks `& $3F`, XORs `$3F`
    and subtracts, so a `-1` report subtracts zero. Eight host `-1` events per
    frame should therefore arrive as one `-8` chunk, but the latch re-ran on every
    event and overwrote the unread pair, so the guest only ever saw `-1` and the
    cursor never moved. Fix: `latchMouseReport()` refuses to relatch while
    `mouseHasData || reportInProgress`, leaving later motion pending until
    `consumeReport()` (the seven-bit encoding is untouched). Measured: captured
    ±8 bursts drain as ±8 and a mid-pair move no longer replaces the Y byte
    (`gs_mouse_capture`), and on a real boot in both S7,D1 and S5,D1 the game's
    cursor goes `(319,199)` → `(0,0)` after 960 single-count events, where the old
    code left it at `(319,199)` (`gs_excalibur`). In headed Chrome with a real F1
    pointer lock the same peek went `(319,199)` → `(0,0)` twice, and a second F1
    released the lock. The screenshots at that point show the England map
    question page, not a drawn pointer, so the evidence is the guest's cursor
    variables, not a visible sprite.

---

## 12. Myths that were disproved (do not re-chase)

| theory | reality |
|---|---|
| The swapper changed the filename, so GS/OS knows the disk changed | Mounting same-size media leaves ordinary status identical. SmartPort must latch status bit 0; Sony must retain its disk-switched sense until guest acknowledgement. Excalibur otherwise keeps asking for disk 3 in both bays (§7, §11.19) |
| The Event Manager is broken / events never reach GS/OS | They did; one click arrived as two transitions because both report bytes carried the button bit |
| `$AA` must become PLY in native mode | gssquared uses TAX in all cores |
| PostEvent is called twice, dedup it in the CPU | Symptom of the report layout; dedup removed |
| `$47C/$4FC` cursor holes never move, nothing reads `$C024` | True only before the Finder is up (~1100 frames); at ~4000 they track |
| Excalibur's cursor still cannot reach the upper-left, so the seven-bit encoding must be wrong | The encoding is right. Eight `-1` events were collapsed into one by the latch, and the game's own decoder turns a `-1` report into a zero delta. Preserving the burst is the fix; do not add a game-specific sensitivity or write the cursor (§6, §11.20) |
| `getIigsMousePos()` is where a game's cursor lives | It reads the GS/OS / ROM cursor (text holes, `$E1:0190`). A self-contained game can keep its own variables: Excalibur's are reached through relocated `STA long` operands at `$06:8A2E`/`$06:89EF`, and the raw disk addresses are only relocation inputs (§11.20) |
| The VBL path / ROM task queue is dead | The ROM's full manager runs constantly; GS/OS replaces `$E1:0030` with its own |
| Publish the host pointer into `$E1:00E9` | Removed; the closed-loop stepper does it without touching guest memory |
| `$E1:00FF` is the 80-column text-page register | It is the ROM's interrupt-nesting counter |
| The DOC mix lost its bass | The old build had a DC rail that faked bass; the real change was −3.7 dB of level |
| `$C029` bit 6 means something to the video mode | It is MMU aux linearization only (gssquared `set_new_video` ignores it) |
| Replacing `$C050-$C05D` with gssquared's explicit bits is an improvement | Changed the palette and broke six suites |
| `extractShrBuffer` was fine, the caller forgot to check | It silently adds `$2000`; the buffer was clamped short |
| An 8-instruction batch is a free perf win | Starved SmartPort reads in the browser only |
| The IIgs renderer must read text page 2 from fast RAM on ROM 01 (or whenever `$C035` bit 5 is set) | The beam only ever scans Mega II; `$C035` redirects *CPU* accesses. Applecorn writes `$E0/$E1:$0800` and leaves `$C035 = $28`, so both read-side branches showed the same stale page on their respective ROMs (§2, §4, §11.14) |
| SenseiPlay's 37 rows/s is the authored tempo | Wrong NTP pattern offset (a stray `p++` in the header walk) made the tempo look self-consistent; the real average is ~2.735 ticks/row (~18.3 rows/s at 50 Hz). The 37 rows/s came from a build whose DOC march ran 1.5x fast; the (also wrong) 2.05-ticks/row estimate read only rows 0 and 3 of pattern 0 |
| The MCS splash hangs unless a key arrives | The no-key timeout *is* the demo loader. It crashed because banks `$00`/`$01` kept routing `$C000-$CFFF` to the Mega II soft switches while `$C035` bit 6 asked for fast RAM, so the driver relocation poked I/O instead of copying |
| A live Tool Locator / Event Manager means the guest publishes its cursor | freegemas keeps its own cursor and reads `$C024` directly; the holes stay `(0,0)` and closed-loop steering pinned its pointer in a corner. The flag says GS/OS is up, not that this program uses the EM cursor |
| "One refresh is always 1/60 s, so every peripheral must follow machine time" | True for the beam and the 3.5" drive, **false for the 5.25" LSS**: gssquared counts raw CPU cycles for it in every speed mode, because the Disk II firmware's read loop is cycle-timed as well. Scaling it to wall time broke the 5.25" boot at the 2.8 MHz default |
| An empty slot-5 bay should present the 3.5" mechanism because gssquared always instantiates the drives | The extra unit shifts GS/OS 6.0.1's ExpressLoad buffer by 498 bytes and MYCRATE dies in NIFTYLIST.CDA (§7, §11.9). The bay type follows the media |
| ROM 03 needs KEGS's SmartPort `$C036` patch | KEGS patches the ROM image at `$FF:57C9`; porting the hardware (5.25" sense bit and handshake idle `$80`) boots the unpatched image, which is what gssquared does |
| ROM 03 publishes the cursor in the same text-page holes as ROM 01 | It leaves the holes at 0; the live cursor is `$E1:0190-$0193` (§6) |
| `!softCard.enabled` means "this machine has no SoftCard" | It is whatever the last configure pass left behind, and the IIgs branch used to restore nothing; on a IIgs the slot-7 card follows mounted media, not that flag (§7) |
| "ROM 03 hangs at 'Check startup device!' — a ROM 03 boot bug" | Not a ROM difference: the UI posted speed 0 at startup, marking the mode explicit and pinning the IIgs to 1.02 MHz, where the 3.5" driver cannot clock 500 kbit/s media. ROM 01 hangs identically. The menu switch itself works (§8) |
| Modulae's decrunch stalls or looks false-stuck at boot | Not an emulator defect. At the default 2.8 MHz it reaches the animated Modulae title (`S5,D1 Trk 44`) and the canvas keeps changing; pinned to explicit speed0 it parks at `Check startup device!` / `S5,D1 Trk 0` while cycles advance and FPS stays 60. The 1.02 MHz 3.5" limitation (§7) |
| ROM 03's MYCRATE crash-to-monitor at ~20 s must be a soft switch or a bit | Measured, not guessed: diffing the two ROMs' `$C035`/`$C036` traffic gives one real difference (`$C035` bit 5, TEXT2 shadow) and nothing else — `$C036` bit 4 is never set, and KEGS-style masking of the speed write never changed an observed value. The crash came from the *power-on content* of bank-`$01` page 0 (§2, §11.11) |
| The DOC music noise is in the chip's mix | Our mix matches gssquared byte for byte (`trunc(mix/8)`, signed int8 wave byte, the highest-oscillator triple-add). The clicking lived in the UI transport, which resampled every per-refresh block from phase zero (§5, §11.12) |
| `LDA [$1824],$9C` in the ROM-03 task glue means the direct page should follow DB | The 65816's direct page is bank `$00` by architecture and gssquared pins it there too; the pointer is real, the memory behind it was just uninitialised |
| ROM 03's MYCRATE `$0401` alert means a GS/OS tool or our RAM content is wrong | Both ROMs produce the *same* two relocation records for the `$08:$0000` module. GS/OS places the list, and its boot-time allocation grows 84 bytes per SmartPort unit the slot-7 driver status advertises. Our old 2-unit card parked ROM 03's list at `$7E:FFF3`, so the second record straddled into `$7F` and MYCRATE's 16-bit `LDA ($52),Y` walker read it wrapped (the bogus `$4F08 → $08:$0000` store). Advertising the reference card's 32 units moves it to `$7E:F61B` and the alert is gone (§7, §11.11) |
| AlterEgo's `Sorry, system error $0201 ... LoadDump.DA` means a bad image or an AlterEgo-only problem | Same bank-straddle class as MYCRATE, different GS/OS build and loader: with a 16-unit card its record list sat at `$7E:FFF8` (`$01:D724`, DP `$9900`) and the 11-byte read wrapped to `$7E:0000`. The 32-unit card moves it clear; gsplus and gssquared never showed it because neither leaves the buffer at that boundary (§7, §11.11) |
| gssquared's disassembler calls `$87`/`$97` EOR/ADC, so our core is wrong | That is the *trace disassembly* table's label; every gssquared core executes `STA [$nn]` / `STA [$nn],Y` there, as we do (`src/worker/cpu65816.ts:368`). The write data is A's own low/high bytes |
| ACS Musique option 2's `BRK` on ROM 03 means our `$E10000` dispatcher or stack is wrong | The dispatcher is fine (the frame and both table pointers were measured correct). The guest hardcodes ROM 01's tool-set table address `$FE:012F` in three player overlays; ROM 03's 10-byte-longer prologue moved it to `$FE:0139`, so ACS publishes the dispatcher's error epilogue as its table and the ROM's own tool call fails. It plays on ROM 01, and on ROM 03 once those three `LDA $FE012F,X` bytes are retargeted (§7) |
| GS/OS applications only ever see keys through ADB keyboard register 0, so the legacy `$C000` strobe is optional for them | Measured on GS/OS 6.0.1: the Finder consumes `$C000` and polls `$C025` every frame while **never** polling ADB device 2. The legacy register is the key's carrier and `$C025` the modifier's (§6) |
| "IIgs chords can't be pressed" is a host-keyboard problem needing a UI button | The chord was unexpressible at three layers: host modifier presses stopped in `canvas.tsx` (`convertAppleKey` → `key: -1` early return), `AltRight` shared Open Apple's `$3A`, and `$C025` was never driven by any event. A button is only the last piece; without the first three, real keys could not form a chord either (§6) |
| Clicking the DA drawer proves the drawer works | Nothing visibly opens, but **not** because the media lacks DAs. Every local GS volume has a populated `System/Desk Accs`, the Finder reads those blocks at boot, and the drawer hole is missing from the guest's *own* SHR bytes — so Closed Apple + Esc is taken with nothing to open (§6) |
| Realigning `$C027` is impossible — it breaks the boot and three suites | The realignment is what the ROM asks for. The 「Fatal system error-> 0911」 was our own bit 0: the boot-time command loop at `FF:851E` spins on "command register full" until it reads 0 before writing the next argument, so reporting the awaiting-arguments state there starves the self-test. Both references leave bit 0 clear; with it clear the desk-manager report lands and every suite passes (§3, §6) |
| The ROM's Desk Accessories menu is a key combination the guest can be handed | It is the **ADB micro's** own data-register report (bit 5) plus the data-register interrupt; the micro swallows the Escape, so no `$C000`/`$C025` chord — however correct — can raise it (§6) |
| A link that names only IIgs slot cards will open a IIgs | `?slot1=gsPrinter&…` without `?machine=apple2gs` opens the *visitor's* last machine and the parser drops every `gs*` card value, so the builder's own IIgs link came up as an IIe (`1.02 MHz, 128 KB`) on a fresh profile. Naming the machine is also what makes the `gs*` cards legal (§9) |
| `SystemDisk-P8.2mg` prints `UNABLE TO LOAD PRODOS` from the 3.5" drive, so the drive corrupts reads | It prints the same thing from **slot 7**, where no nibblizer exists at all — the image has no kernel to load: its `/PRODOS` record is 5 blocks / `eof=1668`, while a real ProDOS 8 is 34 blocks / 17128 bytes (`A2DeskTop-1.5-en_800k.2mg`, which boots from slot 5 to its banner). A bad needle-scan of the diff against `SystemDisk.2mg` suggested the 3.5" path was involved because the drive sat at Trk 76; the block-0 booter and the `/PRODOS` blocks of the two images are byte-identical (§7) |
| `…#s5d1=url.2mg` mounts the IIgs 3.5" drive | The hash is exactly one disk URL; bay parameters are read from the query only, so that hash asks for a disk *named* `s5d1=url.2mg` (§9) |
| CDP-synthesised key events prove a chord is pressable | They bypass the OS. On Windows `Alt + Esc` is stolen (window cycling), so the physical `rAlt-Esc` a browser test "verified" cannot be typed; only the numpad bindings reach the page, and those were not driving `$C025` (§6) |
| No local image has a `Desk Accs` folder | False — it came from scanning raw sectors for an ASCII needle. ProDOS stores names with bit-7 case flags, so nothing matched. Decoded directory blocks: GSOS601.po 4 entries, SystemDisk.2mg 1, MYCRATE.2MG 10, freegemas / AlterEgo 11 (§6) |
| The missing menu-bar drawer hole is our renderer dropping it | Decoded from the guest's SHR buffer: the Finder wrote white there. gssquared and KEGS have no drawer code either — it is guest drawing (§6) |
| A `.woz` is 5.25" media whatever its size | Only the *short* ones are. A WOZ stores captured flux, so length follows track-sides: 35 for 5.25" (under ~370 KB) against 160 for 3.5" (~1.2 MB). The old hard rule sent `Cavern_Cobra_IIgs.woz` out of the bay the user picked and into S6,D1, where the 5.25" LSS cannot decode it (§7) |
| `driveState.is35` can come from WOZ offset 61 | Offset 61 is the tail of the *creator* field and always 0, so a genuine 3.5" capture read as 5.25" even inside slot 5. The declared type is INFO byte 1 = file offset 21; a 3.5" one declares optimal bit cell 16 at offset 59 (§7) |
| "Other emulators read 3.5\" media at 1 MHz, so ours should too" | Those emulators have no 1 MHz IIgs: KEGS/GSplus follow `$C036` bit 7 (the ROM keeps it fast) and gssquared's 3.5" head is advanced by `vid_cycles`, which run at a fixed 1.02 MHz even in its 1.02 clock mode. 500 kbit/s leaves 16.3 CPU cycles per byte at 1.024 MHz while the tightest polled loop needs 22-23, so the stream overruns; at 2.8 MHz the budget is 45.8. The IIgs default is 2.8 MHz for this reason (§7, §8) |
| `$04`/`$1C` should be `TSB abs,X` / `TRB abs,X`, because a `$C036 <= $04` write looked like a bad opcode index | Our table is right and so is the ROM: `$04` = TSB direct, `$0C` = TSB absolute, `$14` = TRB direct, `$1C` = TRB absolute — identical in gssquared `opcodes.hpp:274-278`, KEGS/GSplus `instable.h` + `disas.h`, and apple2ts's own classic table (`instructions.ts:780-790`; core at `cpu65816.ts:649`). The `$04` value is what `TRB $C036` *writes* to a register holding `$84` (`$84 & ~$80`), not a mis-decoded instruction. The real question that write raises is which speed mode may issue it at all (§8) |
| 「你有因為加快而減少drawing嗎」— the flicker means we skip drawing to keep up | No rendering is ever dropped for speed. The clouds vanished because the picture posted to the UI was the SHR window as of one instant, taken at the refresh boundary, while the guest erases and redraws band by band behind the beam (§4, §11.16) |
| Stars & Planets stalls because the 3.5" drive cannot deliver its data | It stalls identically from slot 7, where there is no nibblizer at all. The wait was on `$C02E/$C02F`: the counter's last six rows are `$0FA-$0FF`, and we produced `$1FA-$1FF`, so the value its raster-sync loop polls for never existed (§3, §11.17) |
| Stars & Planets is frozen because its title screen does not react | Two different things. The load behind Return takes ~20 s (1200 frames) at 1990 disk speed, so a short measurement window reads "dead"; and with the `$1FA` wrap the title paints but nothing ever changes again — the same missing `$0FA` wait (§11.17) |
| Stars & Planets ignoring the mouse means our ADB mouse is broken | The volume never enables `$C027` bit 6, never reads `$C024`/`$C026` and makes no tool call while idle, so the ROM's own gate at `$FF:B973` correctly refuses to dispatch. It is keyboard-driven and its digit keys work; our status byte already matches KEGS and gssquared (§11.18) |

---

## 13. File map

- `src/worker/cpu65816.ts` — 65816 core, stack normalisation, cycle accounting,
  IRQ sampling, `specialJumpTable`, `slot5DriverDirectPage` (slot-5 DP guard, §7)
- `src/worker/memory.ts` — bank map (ROM 01/03 banks derived from the image
  size), Mega II main/aux, soft switches, `$C02x`/`$C03x` registers (`$C036`
  speed + ROM-03 power-on latch), text-page sources, SHR extraction (`getShr`,
  raw window) and the beam-captured display frame (`captureShrBeamLine` /
  `getShrDisplayed`, §4), floating
  bus, slot strobes, IWM status/handshake answers, `getIigsMousePos`
- `src/worker/roms/rom_gs_system03.ts` — embedded 256 KB ROM 03 system image
  (banks `$FC-$FF`); `src/worker/roms/rom_gs_system.ts` is ROM 01 (banks `$FE-$FF`)
- `src/worker/motherboard.ts` — run loop, video clock, VBL, housekeeping, Ensoniq
  catch-up, speed modes, reset vs cold boot; the run loop's beam crossing is also
  what patches the displayed SHR picture
- `src/worker/iigs_adb.ts` — ADB micro + device model, report latching, buttons,
  `$C025` modifiers driven from the event byte, the desk-manager report and the
  `$C027` bit layout (§3, §6)
- `src/worker/devices/mouse.ts` — IIgs event routing, closed-loop cursor, click queue
- `src/worker/devices/keyboard.ts` — legacy strobe + ADB, DOM→ADB table,
  `openIigsRomDeskPanel()` (the `Ctrl + Open Apple + Esc` the machine menu sends, §6)
- `src/ui/adbmodifiers.ts` — the single table of which host key carries which IIgs
  ADB modifier (Alt / Meta / numpad bindings, §6)
- `src/worker/devices/iigs_ensoniq.ts` — DOC
- `src/worker/devices/diskdata.ts`, `drivestate.ts`, `decodedisk.ts`,
  `harddrivedata.ts` — IWM, drives, 2MG/PO/WOZ, SmartPort
- `src/worker/devices/floppy35.ts` — 3.5" GCR field generation, sector offsets,
  write splice (and the 7-bit track number its decoder rebuilds); machine-time
  media clock (§7)
- `src/worker/iigs_clock.ts` — RTC + battery RAM
- `src/ui/devices/audio/iigs_ensoniq_audio.ts` — the DOC *transport*: block queue,
  lead control, and `resampleDocBlock` (the carried fractional resampler, §5)
- `src/worker/memory.ts::iigsInitInterrupts` — tool vectors, `$E1:0034`
- `src/ui/graphics.ts`, `canvas.tsx`, `copycanvas.ts` — rendering, aspect, text
- `src/ui/inputparams.ts`, `main2worker.ts` — URL params, debug-hook plumbing
- Tests worth knowing: `gsos_boot`, `gs_cycles`, `gs_adc_flags`, `gs_mouse_sync`,
  `gs_mouse_neg`, `gs_mouse_capture`, `gs_cursor_repaint`, `gs_cursor_draw`,
  `gs_cursor_y`, `gs_adb_button`, `gs_vbl_cadence`,
  `gs_vcounter` (the `$C02E/$C02F` frame layout row by row, the 9-bit value a
  guest rebuilds from the pair, and that `$C02E == $E8` is still reachable, §3,
  §11.17), `gs_stars` (Stars & Planets from slot 7: its SHR title screen and the
  solar-system animation that Return starts — red with the `$1FA` wrap, §11.17),
  `gs_rom_adb_task`,
  `gs_ensoniq`, `gs_doc_clock`, `gs_tass`, `gs_tass_title_tempo`,
  `gs_tass_click_freeze`, `gs_textpage`, `gs_floppy_late`, `gs_ctrl_reset`,
  `gs_keyboard_adb`, `gs_mcs_nokey`, `gs_silky`, `gs_freegemas`,
  `gs_rom_desk_panel` (the ADB micro's desk-manager report: `$C027` bit 0 stays clear,
  the no-disk boot finishes its ADB self-test, and the ROM's `Desk Accessories` menu
  really reaches the text page, §6),
  `gs_command_key` (IIgs key chords on a booted GS/OS desktop: the `$C025`
  modifier byte, Open/Closed Apple as distinct keys, per-code key-up, and the
  guest consuming `$C000` while the Open Apple bit stays held, §6),
  `gs_floppy35` / `gs_floppy35_boot` (3.5" read, write, zone layout, the 7-bit
  cylinder on every track-side, and GS/OS + ProDOS 8 booting from slot 5),
  `gs_floppy35_basic` (a real Applesoft `SAVE`/`LOAD` on A2DeskTop-1.5.po through
  slot 5: `SAVE`, `NEW`/`LOAD`/`LIST`/`RUN`, then the spliced image is remounted
  and loaded again, §7),
  `gs_floppy35_swapper` (changing the disk in a slot-5 bay while the machine runs:
  the incoming volume replays its own GCR stream, and an async write burst still
  in flight from the outgoing one cannot edit the image that just arrived, §7),
  `gs_excalibur` (Spirit of Excalibur disk 1 → 3 → 2 → 3 in S7,D1 and S5,D1:
  both paths reach the England map/menu, and removing the disk-change latch
  leaves the game on its first disk-3 request; synthetic-media cases also pin
  the dirty flag and write timestamp on remount. The shipped cases then drive
  960 captured single-count moves and require the game's own relocated cursor to
  reach `(0,0)` from `(319,199)`, which stays put without the ADB latch guard,
  §7, §9, §11.19, §11.20),
  `gs_mouse_capture` (the F1 capture path into the ADB: +40/−40 counts, a move
  past the edge that keeps queueing instead of clamping, two screen widths that
  drain completely, leaving capture without replaying the captured distance, and
  the two burst cases that pin an unread report against overwriting — eight ±1
  events must drain as ±8, and motion between the X and Y reads must not replace
  the Y byte, §6, §11.20),
  `gs_floppy35_woz` (a protected 3.5" WOZ capture — `Cavern_Cobra_IIgs.woz`,
  1,296,147 B: INFO byte 1 declares the type and offset 61 does not, asking for
  S6 moves it to S5 rather than the other way round, it mounts as a capture and
  not a block volume with all 160 track-sides mapped, and ProDOS 16 boots to its
  title from slot 5 under **both** ROM 01 and ROM 03, §7, §11.6),
  `gs_applecorn` (Applecorn 0.54-beta from S5,D1 on both ROMs: the MOS banner
  reaches the screen, BBC BASIC answers a typed `PRINT 6*7`, the banner bytes are
  in the Mega II banks and not in fast RAM, and the //e still reads its own page,
  §2, §4, §11.14),
  `gs_prosel` (ProSel-16 on the real `PROSEL_V84.PO` volume: its 80-column native
  menu decodes out of the Mega II pages after 6000 fake-timer frames, so the same
  bank-`$01` text is fed to `$0400-$0BFF` under `$C035`/`$C029`; §2, §4),
  `gs_shr_late_store` (late SHR paint/erase, TimePilot cloud zero and opaque mask,
  MSpacMan scoping, and a VBL store before beam line 0 is not late; §4, §11.16),
  `gs_timepilot_flicker` (TimePilot GS on a real volume: the picture the UI gets is
  the beam-captured frame, and it keeps the cloud bands on every one of 200 sampled
  frames while the raw end-of-refresh buffer loses them on a quarter of them — red
  if the per-scanline capture is not run *or* if `MachineState.shr` goes back to
  `getShr()`, §4, §11.16),
  `gs_speed`, `gs_speed_default` (IIgs 2.8 MHz default, §8), `gs_boot`,
  `gs_hdd_boot`, `gs_slots_mockingboard`, `gs_boot_order` (browser message order
  on a fresh profile: slot config → machine switch → 3.5" boot, §7),
  `gs_test_coldboot`, `gs_fatal`, `gs_cardcat` (Pascal p-machine vs. the slot-5
  driver's DP clobber), `gs_acs_musique` (Diversi-Cache on ROM 03: the widened
  slot-5 DP window keeps TXTTAB, §7), `gs_shadow_all` (`SPEED_SHADOW_ALL`), `gs_rom03`
  (four-bank mapping + reset vector, GS/OS boot to the Finder, ROM-03 cursor
  convergence, and the `$E10000` tool-set table at `$FE:0139` vs ROM 01's
  `$FE:012F`, §7), `gs_mycrate_rom` (MYCRATE under both ROMs: no crash-to-monitor,
  §11.11 — deleting the bank-`$01` fill reproduces the monitor at frame 1210),
  `gs_rom03_reloc` (MYCRATE's own relocation walker: the record bytes are identical
  on both ROMs, neither list may put a record on a bank boundary, and the stub must
  keep `PHK; PLB` with no `$08:$0000` fix-up — pins §11.11 and the 32-unit
  SmartPort capacity), `gs_alterego` (AlterEgo.2mg boots to its SHR title screen
  under ROM 03 with no `$0201`/`LoadDump.DA` alert),
  `ensoniq_resample` (carried resampler continuity, length and buffer rate),
  `memory_label` (footer RAM readout: IIgs 8 MB vs. classic aux-card totals, §9),
  `linkbuilder` (IIgs links: `machine=apple2gs` and no `speed=` at the GS default,
  the GS speed table in `retrieveFromEmulatorSettings`, the S5 3.5" rows emitting
  `s5d1=`, and reseeding `slotConfig` so no classic card reaches a GS link, §9),
  `diskswapper` (the standby-disk group is per bay for **all six** bays: a slot-5
  pair gets its own list and badge, a swap installs that disk and re-posts it with
  `forceIndex=true`, ejecting one bay leaves the others, and graphical swaps keep
  unsaved URL media without forcing Save As while existing handles save first, §9),
  `adbmodifiers` (which host key carries which IIgs Apple-key role — Alt / Meta /
  numpad bindings, so a Windows user can actually press a chord, §6)

Known failures that are not this branch's last change: `gs_silky.test.ts`, whose
SHR byte count is 2874 against a `> 5000` assertion. The latter was measured
identical at `HEAD` with the ADB work reverted, so it is a pre-existing coverage
regression, not a desk-panel one: SHR mode is on and more than 100 scanlines carry
bytes, but the title screen is far sparser than when the test was written (§11.7).
Also `gs_trace_boot.test.ts` (slot-7 `A2DeskTop-VERA.hdv`): its first check, the
ProDOS 8 MACHID byte at `$BF98`, reads `$55` where `$2A` is expected, so none of the
A2DeskTop/DHIRES assertions below it ever run. Measured byte-identical with the
swapper work reverted, and the test file itself has not been touched since
`ab11575f`. `vera.test.ts`, previously listed here, now passes.
