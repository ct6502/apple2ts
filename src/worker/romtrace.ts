// Debug-only 65816 PC trace, used to compare where the Apple IIgs ROM boot
// scan diverges between two environments (the jest harness boots a 5.25" floppy,
// the browser does not - see AGENTS.md section 26b). Off unless ?romtrace=1 is
// in the URL, so it costs nothing in normal use.
//
// Two views of the same data:
//   first - the first MAX_SEQUENCE program counters executed after the last
//           clearRomTrace(), in order. Diffing two of these finds the exact
//           instruction where two runs diverge.
//   hist  - how many times each program counter was executed, which shows where
//           a run is spinning (a scan that dies looks completely different from
//           a scan that is churning through slot ROMs).
export interface ForeignEntry {
  pc: number
  bank: number
  // The program counters immediately before the jump, so the instruction that
  // branched out of the ROM can be identified.
  context: number[]
}

export interface RomTrace {
  enabled: boolean
  instructions: number
  first: number[]
  last: number[]
  // PC sampled every TIMELINE_STRIDE instructions. A full sequence is far too
  // long to ship out of the worker, but this is enough to see where a run goes
  // next: which routine it enters, and how long it stays there.
  timeline: number[]
  hist: Record<string, number>
  foreign: ForeignEntry[]
  // TEMP: lead-in context for the first hits on the watched PCs / ranges.
  watches: ForeignEntry[]
}

const WATCH_PCS: number[] = []
// Flat pairs of [lo, hi) 24-bit addresses.
const WATCH_RANGES: number[] = []

// Large enough to cover a whole boot scan (the harness runs ~9M instructions
// between a reset and ProDOS), which is what makes an automatic diff against
// another environment possible.
const MAX_SEQUENCE = 300000
const MAX_LAST = 600
const MAX_HIST = 400
const MAX_FOREIGN = 8
// How many program counters of lead-in to keep for each foreign-bank entry.
const FOREIGN_CONTEXT = 40
// How often, in instructions, to sample the PC into `timeline`.
const TIMELINE_STRIDE = 50000

let enabled = false
let instructions = 0
const first: number[] = []
const last: number[] = []
const hist = new Map<number, number>()
const foreign: ForeignEntry[] = []
const watches: ForeignEntry[] = []
const timeline: number[] = []

// On an Apple IIgs only banks $D0-$FF are ROM; $00 is where the 65816 comes up.
// Anything else is RAM, so executing there means something branched somewhere it
// should not have. That is the fingerprint of the browser-only boot failure
// (AGENTS.md section 26c), so capture where it first happens.
const isExpectedBank = (bank: number) => bank === 0x00 || bank >= 0xd0

export const setRomTraceEnabled = (value: boolean) => { enabled = value }

export const setRomTraceWatch = (pcs: number[], ranges: number[] = []) => {
  WATCH_PCS.length = 0
  for (const p of pcs) WATCH_PCS.push(p >>> 0)
  WATCH_RANGES.length = 0
  for (const r of ranges) WATCH_RANGES.push(r >>> 0)
  watches.length = 0
}

export const clearRomTrace = () => {
  instructions = 0
  first.length = 0
  last.length = 0
  hist.clear()
  foreign.length = 0
  watches.length = 0
  timeline.length = 0
}

// Called once per 65816 instruction. Deliberately a single boolean check plus
// two cheap operations, so the disabled path costs nothing measurable.
export const recordRomPc = (pc24: number) => {
  if (!enabled) return
  instructions++
  if (first.length < MAX_SEQUENCE) first.push(pc24)
  // Ring buffer of the most recent PCs. `first` shows where a run starts, but
  // what matters for a stuck machine is where it is right now.
  last.push(pc24)
  if (last.length > MAX_LAST) last.shift()
  hist.set(pc24, (hist.get(pc24) ?? 0) + 1)
  // Record one timeline sample every TIMELINE_STRIDE instructions, so the
  // whole run can be reconstructed cheaply (~instructions/50000 samples) and
  // the moment a run falls into a ROM routine or the idle loop is visible.
  if (timeline.length === 0 || instructions - timeline.length * TIMELINE_STRIDE >= TIMELINE_STRIDE) {
    timeline.push(pc24)
  }
  const bank = (pc24 >>> 16) & 0xff
  if (foreign.length < MAX_FOREIGN && !isExpectedBank(bank)) {
    foreign.push({
      pc: pc24,
      bank,
      context: last.slice(Math.max(0, last.length - 1 - FOREIGN_CONTEXT), last.length - 1),
    })
  }
  // TEMP probe: keep the lead-in to a watched PC so a jump into a specific
  // address names the instruction that made it.
  let watched = WATCH_PCS.includes(pc24)
  if (!watched) {
    for (let i = 0; i + 1 < WATCH_RANGES.length; i += 2) {
      if (pc24 >= WATCH_RANGES[i] && pc24 < WATCH_RANGES[i + 1]) { watched = true; break }
    }
  }
  if (watched && watches.length < 6) {
    watches.push({
      pc: pc24,
      bank,
      context: last.slice(Math.max(0, last.length - 1 - 200), last.length - 1),
    })
  }
}

export const getRomTrace = (): RomTrace => {
  const entries = Array.from(hist.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_HIST)
  const histOut: Record<string, number> = {}
  for (const [pc, count] of entries) histOut[pc.toString(16)] = count
  return { enabled, instructions, first, last, timeline, hist: histOut, foreign, watches }
}