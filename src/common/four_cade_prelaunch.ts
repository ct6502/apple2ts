// ---------------------------------------------------------------------------
// 4cade prelaunch database
// ---------------------------------------------------------------------------
// Maps known disk images (identified by content hash) to their prelaunch
// metadata.  When a packed binary is available, the export decompresses it
// via a minimal 6502 interpreter (depack6502) and writes the resulting flat
// memory image to the HDV.  This produces the exact same game state that
// 4cade's launcher creates — no floppy-capture workarounds needed.
//
// When no packed binary is available, the export falls back to capturing a
// memory dump from the floppy boot and applying patches.
//
// Adding a new game:
//   1. Obtain the 4am crack DSK image
//   2. Compute its hash with fourCadeDiskHash() from prodos_hdv.ts
//   3. Read the game's prelaunch script from the 4cade repo
//   4. Add an entry below with patches (floppy disabling) and entry point
//   5. (Optional) Extract the packed binary from a 4cade .po disk and add
//      packedBinary/packedLoadAddress for decompression-based export

/** A single operation in the packed binary launch sequence. */
export type PrelaunchOp =
  | { op: "patch"; addr: number; val: number }   // LDA #val; STA addr
  | { op: "call"; addr: number }                  // JSR addr
  | { op: "decompress" }                          // JSR to packed binary entry
  | { op: "readRom" }                             // STA $C082 — LC read ROM, no write
  | { op: "rwRam2" }                              // BIT $C083; BIT $C083 — LC read/write RAM bank 2

export type FourCadePrelaunchEntry = {
  name: string
  patches: Array<{ addr: number; val: number }>  // byte patches applied to memory snapshot
  calls: number[]     // JSR addresses to call during init (in order)
  entry: number       // JMP target after init
  packedBinary?: string   // base64-encoded packed binary (SAN INC / Exomizer)
  packedLoadAddress?: number  // load address for packed binary
  /** Ordered operations for packed binary relay — matches the 4cade prelaunch
   *  script exactly: patch → decompress → patch → call → patch → JMP entry. */
  packedSequence?: PrelaunchOp[]
}

import { BURGERTIME_PACKED_B64 } from "./packed_binaries/burgertime_data"

// Prelaunch database keyed by FNV-1a hash of the raw DSK/WOZ-extracted image.
// Hashes are computed at export time via fourCadeDiskHash().
export const FOUR_CADE_PRELAUNCH_DB: Record<string, FourCadePrelaunchEntry> = {
  // BurgerTime (4am crack) — prelaunch by qkumba/Frank M.
  // Source: https://github.com/a2-4am/4cade/blob/main/src/prelaunch/burgertime.a
  // Packed binary: SAN INC / Exomizer format, extracted from 4cade .po disk.
  // Runtime decompression on Apple II — the relay executes the exact same
  // operation sequence as the 4cade prelaunch script.
  "1ca2d0a8": {
    name: "BurgerTime",
    patches: [],   // not used for packed binary path
    calls: [],     // not used for packed binary path
    entry: 0xA300, // game main loop entry
    packedBinary: BURGERTIME_PACKED_B64,
    packedLoadAddress: 0x416C,
    // Exact 4cade prelaunch sequence (src/prelaunch/burgertime.a).
    // Language card state management is critical: $0811 reads from LC RAM
    // bank 2 (where the decompressor stored segment 3 data).  Without
    // +ENABLE_ACCEL_LC (rwRam2) before the call, $0811 reads ROM instead
    // and fails to initialise game state — causing BRK at $6020.
    packedSequence: [
      { op: "patch", addr: 0x9014, val: 0x60 },  // RTS — decompressor: skip JSR $6400
      { op: "patch", addr: 0x9053, val: 0x60 },  // RTS — decompressor: change JMP $A300 to RTS
      { op: "readRom" },                           // +ENABLE_ACCEL → STA $C082 (LC = read ROM before decompress)
      { op: "decompress" },                        // JSR $416C — self-extracting decompression
      { op: "readRom" },                           // +DISABLE_ACCEL_AND_HIDE_ARTWORK → STA $C082
      { op: "patch", addr: 0x646B, val: 0xB1 },  // LDA (zp),Y — disable language card fill
      { op: "call",  addr: 0x6400 },              // game init
      { op: "rwRam2" },                            // +ENABLE_ACCEL_LC → BIT $C083; BIT $C083
      { op: "call",  addr: 0x0811 },              // post-init (needs LC RAM bank 2 readable)
      { op: "patch", addr: 0xA30A, val: 0x00 },  // game param (4cade: stx $A30A with X=0)
      { op: "patch", addr: 0xA30F, val: 0x01 },  // game param (4cade: stx $A30F with X=1)
    ],
  },
}
