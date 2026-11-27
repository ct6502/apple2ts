import { FLUX_KIND } from "../../common/utility"

// The timed flux player, shared by WOZ 2.1 FLUX tracks and A2R3 captures.
//
// A flux track is a loop of bytes from fluxLapStart to fluxLapEnd, which are
// offsets into the drive's data. Each byte is a count of ticks of
// fluxPsPerTick picoseconds. A byte of 255 means "add it and keep reading",
// and a byte below 255 ends an interval with a flux transition.
//
// We keep time as a running total: the time of a transition is the total tick
// count since the loop start, converted to cycles in one step, so rounding
// never accumulates from one interval to the next. Every time in the cursor is
// measured in CPU cycles from the start of the current pass of the loop.
//
// Each interval becomes max(1, round(interval / cell)) bits, zeros and then a
// 1 at the transition, spread evenly across the interval. We do not add
// synthetic weak bits here: a long run with no flux simply gives many zeros.
// Every transition is moved by a small jitter, new on each revolution (below).
//
// Writes are never applied to flux tracks, so the disk is write protected.

// motherboard.ts schedules 17,030 CPU cycles every 16.6881 ms at normal
// speed. Flux times are real times, so they must use that same emulated
// clock, unlike the bit tracks, which count one cycle per microsecond.
export const FLUX_CPU_HZ = 17030 / 16.6881e-3

// The drive's bit cell, 4 us, in cycles of that clock.
export const FLUX_CELL_CYCLES = 4e-6 * FLUX_CPU_HZ

const CYCLES_PER_PS = FLUX_CPU_HZ / 1e12

// Convert a tick total to cycles. We always convert a running total, never a
// single interval, so the conversion error never adds up.
export const fluxTicksToCycles = (ticks: number, psPerTick: number) =>
  ticks * psPerTick * CYCLES_PER_PS

export const isFluxTrack = (ds: DriveState, qtrtrack: number) =>
  ds.fluxLapEnd[qtrtrack] > 0

// The sum of every interval's ticks between two bytes of the data.
export const fluxLoopTicks = (dd: Uint8Array, start: number, end: number) => {
  let ticks = 0
  for (let i = start; i < end; i++) ticks += dd[i]
  return ticks
}

// Jitter. A real drive never reads a transition at exactly the same time twice,
// and some protections depend on it: an interval near 6 us (1.5 cells) reads
// as one cell on some revolutions and two on others. With a fixed time it
// always rounds the same way. Repton's track 34 holds about 8,200 such
// intervals per revolution, and its flux only boots with the jitter.
//
// Every flux transition moves by a whole number of ticks from -fluxJitterTicks
// to +fluxJitterTicks, a new value each time the head passes it, so every
// revolution differs. The jitter moves the transition, not the running tick
// total, so it never adds up and the track keeps its time. The value is a hash
// of the transition's place in the data (the byte after its interval) and of
// how many times this drive has passed a loop's seam, so it is the same for any
// walk that reaches that transition on that pass, and the same on every boot.
export let fluxJitterTicks = 2
export const setFluxJitterTicks = (ticks: number) => { fluxJitterTicks = ticks }

// The number of loop seams each drive has passed, by drive index.
const fluxPasses: number[] = []
export const fluxPassOf = (ds: DriveState) => fluxPasses[ds.index] ?? 0

export const fluxJitterAt = (byte: number, pass: number) => {
  if (fluxJitterTicks <= 0) return 0
  let h = (Math.imul(byte, 0x9E3779B1) ^ Math.imul(pass + 1, 0x85EBCA6B)) >>> 0
  h = Math.imul(h ^ (h >>> 16), 0x7FEB352D) >>> 0
  h = Math.imul(h ^ (h >>> 15), 0x846CA68B) >>> 0
  h = (h ^ (h >>> 16)) >>> 0
  return (h % (2 * fluxJitterTicks + 1)) - fluxJitterTicks
}

// Read the next interval into the cursor. At the end of the loop we go back to
// its start and keep the time continuous, which is the seam of the loop.
const nextInterval = (ds: DriveState, dd: Uint8Array, qtrtrack: number) => {
  const end = ds.fluxLapEnd[qtrtrack]
  if (ds.fluxByte >= end) {
    ds.fluxByte = ds.fluxLapStart[qtrtrack]
    ds.fluxTicks = 0
    ds.fluxCycle -= ds.fluxLoopCycles[qtrtrack]
    // The last transition may have been jittered past the loop's end.
    ds.fluxIntervalEnd -= ds.fluxLoopCycles[qtrtrack]
    fluxPasses[ds.index] = fluxPassOf(ds) + 1
  }
  let sum = 0
  let value = 255
  while (value === 255 && ds.fluxByte < end) {
    value = dd[ds.fluxByte++]
    sum += value
  }
  ds.fluxTicks += sum
  const jitter = fluxJitterAt(ds.fluxByte, fluxPassOf(ds))
  const intervalEnd = fluxTicksToCycles(ds.fluxTicks + jitter, ds.fluxPsPerTick)
  ds.fluxIntervalStart = ds.fluxIntervalEnd
  ds.fluxIntervalLength = intervalEnd - ds.fluxIntervalEnd
  ds.fluxIntervalEnd = intervalEnd
  ds.fluxBitsInInterval = Math.max(1, Math.round(ds.fluxIntervalLength / FLUX_CELL_CYCLES))
  ds.fluxBitIndex = 0
}

// Seek checkpoints. Without them, landing on a track would walk up to one
// revolution of intervals for every quarter-track step. For each flux track,
// at every FLUX_CHECKPOINT_BYTES bytes of flux data, we keep the first
// interval that starts at or past that byte and the tick total before it.
// They are built from the data and never saved, and they give exactly the
// cursor that the walk from the loop start would give.
export const FLUX_CHECKPOINT_BYTES = 64

type FluxCheckpoints = {
  data: Uint8Array,
  start: number,
  end: number,
  bytes: Int32Array,
  ticks: Float64Array,
}

// The checkpoints of each drive, by quarter track.
const driveCheckpoints: Array<Array<FluxCheckpoints | undefined>> = []

const buildCheckpoints = (dd: Uint8Array, start: number, end: number): FluxCheckpoints => {
  const size = Math.ceil((end - start) / FLUX_CHECKPOINT_BYTES) + 1
  const bytes = new Int32Array(size)
  const ticks = new Float64Array(size)
  let count = 0
  let nextCheckpoint = start
  let total = 0
  let i = start
  while (i < end) {
    // Here i is the first byte of an interval, read as nextInterval reads it.
    if (i >= nextCheckpoint) {
      bytes[count] = i
      ticks[count] = total
      count++
      while (nextCheckpoint <= i) nextCheckpoint += FLUX_CHECKPOINT_BYTES
    }
    let value = 255
    while (value === 255 && i < end) {
      value = dd[i++]
      total += value
    }
  }
  // An empty loop has the loop start alone, and plays zeros.
  if (count === 0) count = 1
  return {
    data: dd,
    start,
    end,
    bytes: bytes.subarray(0, count),
    ticks: ticks.subarray(0, count),
  }
}

// The checkpoints of a flux track. We build them here if this drive has none
// for the track yet, or if the ones it has were built for other data or for
// another loop.
const checkpointsOf = (ds: DriveState, dd: Uint8Array, qtrtrack: number) => {
  if (!driveCheckpoints[ds.index]) driveCheckpoints[ds.index] = []
  const table = driveCheckpoints[ds.index]
  let checkpoints = table[qtrtrack]
  if (!checkpoints || checkpoints.data !== dd ||
    checkpoints.start !== ds.fluxLapStart[qtrtrack] || checkpoints.end !== ds.fluxLapEnd[qtrtrack]) {
    checkpoints = buildCheckpoints(dd, ds.fluxLapStart[qtrtrack], ds.fluxLapEnd[qtrtrack])
    table[qtrtrack] = checkpoints
  }
  return checkpoints
}

// Build the checkpoints of every flux track of a drive, once its table is
// known: after a mount and after a restore. A drive with no flux disk lets go
// of the ones it had.
export const fluxBuildCheckpoints = (ds: DriveState, dd: Uint8Array) => {
  if (ds.fluxKind === FLUX_KIND.NONE || dd.length === 0) {
    driveCheckpoints[ds.index] = []
    return
  }
  for (let qtrtrack = 0; qtrtrack < ds.fluxLapEnd.length; qtrtrack++) {
    if (isFluxTrack(ds, qtrtrack)) checkpointsOf(ds, dd, qtrtrack)
  }
}

// Put the head at a fraction of one revolution into the first lap of a flux
// track. The bits before that point are thrown away.
export const fluxLand = (ds: DriveState, dd: Uint8Array, qtrtrack: number, fraction: number) => {
  if (!isFluxTrack(ds, qtrtrack)) return
  const target = Math.min(Math.max(fraction, 0), 1) * ds.fluxRevCycles[qtrtrack]
  // Start from the last checkpoint at or before the target. Every interval
  // before it ends at or before the target, so the walk from the loop start
  // would pass it with this very cursor. The first checkpoint is the loop
  // start itself.
  const checkpoints = checkpointsOf(ds, dd, qtrtrack)
  let lo = 0
  let hi = checkpoints.bytes.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (fluxTicksToCycles(checkpoints.ticks[mid], ds.fluxPsPerTick) <= target) lo = mid
    else hi = mid - 1
  }
  ds.fluxByte = checkpoints.bytes[lo]
  ds.fluxTicks = checkpoints.ticks[lo]
  // The transition just before a checkpoint keeps its jitter, as on the walk.
  // The loop start has no transition before it in this pass.
  const jitter = ds.fluxByte > ds.fluxLapStart[qtrtrack] ? fluxJitterAt(ds.fluxByte, fluxPassOf(ds)) : 0
  ds.fluxIntervalEnd = fluxTicksToCycles(ds.fluxTicks + jitter, ds.fluxPsPerTick)
  ds.fluxCycle = 0
  nextInterval(ds, dd, qtrtrack)
  // Walk to the interval that holds the target. A loop is at least one
  // revolution long, so this stops before the seam. Where we land is decided
  // by the transitions' times without jitter, which always run forward.
  while (fluxTicksToCycles(ds.fluxTicks, ds.fluxPsPerTick) <= target &&
    ds.fluxByte < ds.fluxLapEnd[qtrtrack]) {
    nextInterval(ds, dd, qtrtrack)
  }
  ds.fluxCycle = target
  while (ds.fluxBitIndex < ds.fluxBitsInInterval - 1 &&
    ds.fluxIntervalStart + (ds.fluxBitIndex + 1) * ds.fluxIntervalLength / ds.fluxBitsInInterval <= target) {
    ds.fluxBitIndex++
  }
}

// The head's angle on a flux track, as a fraction of one revolution.
export const fluxAngle = (ds: DriveState, qtrtrack: number) => {
  const rev = ds.fluxRevCycles[qtrtrack]
  if (rev <= 0) return 0
  const angle = ds.fluxCycle % rev
  return (angle < 0 ? angle + rev : angle) / rev
}

// Turn the platter by `cycles`. Every bit that passes the head goes to
// `shift`, the read latch. With a null `shift` the bits are dropped, as they
// are during a seek, in write mode and after the sequencer reset.
export const fluxAdvance = (
  ds: DriveState,
  dd: Uint8Array,
  qtrtrack: number,
  cycles: number,
  shift: ((bit: number) => void) | null,
) => {
  if (!isFluxTrack(ds, qtrtrack)) return
  // A save state from before the head ever landed has no interval yet.
  if (ds.fluxBitsInInterval <= 0) fluxLand(ds, dd, qtrtrack, 0)
  // Time never runs backwards on the platter.
  if (cycles <= 0) return
  ds.fluxCycle += cycles
  const loop = ds.fluxLoopCycles[qtrtrack]
  // A loop with no time in it never turns.
  if (loop <= 0) return
  // After a long idle gap (motor off, or the emulator paused) we drop whole
  // loops, since the track repeats every loop, and play at most two.
  const behind = ds.fluxCycle - ds.fluxIntervalStart
  if (behind > 2 * loop) {
    ds.fluxCycle -= (Math.floor(behind / loop) - 1) * loop
  }
  while (ds.fluxIntervalStart + (ds.fluxBitIndex + 1) * ds.fluxIntervalLength / ds.fluxBitsInInterval <=
    ds.fluxCycle) {
    ds.fluxBitIndex++
    const last = ds.fluxBitIndex === ds.fluxBitsInInterval
    if (shift) shift(last ? 1 : 0)
    if (last) nextInterval(ds, dd, qtrtrack)
  }
}
