// Builders for the flux player tests. Synthetic data only: real captures are
// read from FLUX_TEST_IMAGES and never committed.
import * as fs from "fs"
import path from "path"
import { convertdsk2woz } from "../../common/convertdsk2woz"
import { FLUX_KIND, uint32toBytes } from "../../common/utility"
import { FLUX_CELL_CYCLES, FLUX_CPU_HZ } from "./fluxtrack"

// Real test images, from the folders named by FLUX_TEST_IMAGES (a list, split
// like PATH). Tests that need them are skipped when they are absent.
export const FLUX_TEST_IMAGES = process.env.FLUX_TEST_IMAGES || ""

// The real images the tests look for there:
// - Bandits HALF (speed test 20).woz: a 5.25" WOZ 2.1 (INFO v3) with FLUX tracks.
// - Choplifter param 3.a2r: a 5.25" A2R3 capture with 3 index marks per location.
export const readTestImage = (name: string): Uint8Array | null => {
  for (const folder of FLUX_TEST_IMAGES.split(path.delimiter).filter(Boolean)) {
    const p = path.join(folder, name)
    if (fs.existsSync(p)) return new Uint8Array(fs.readFileSync(p))
  }
  return null
}

// A floppy DriveState with no tracks, for driving fluxtrack.ts directly.
export const blankFluxDriveState = (psPerTick: number): DriveState => ({
  index: 2,
  hardDrive: false,
  drive: 1,
  status: "",
  filename: "test",
  diskHasChanges: false,
  motorRunning: true,
  isWriteProtected: true,
  isSynchronized: false,
  quarterTrack: 0,
  prevQuarterTrack: 0,
  writeMode: false,
  currentPhase: 0,
  trackStart: Array<number>(160).fill(0),
  trackNbits: Array<number>(160).fill(51024),
  trackLocation: 0,
  maxQuarterTrack: 0,
  lastAppleWriteTime: -1,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: -1,
  optimalTiming: 32,
  is35: false,
  blockMedia35: false,
  spindleOn: false,
  enable35: false,
  diskReady: false,
  stepDirection: 0,
  diskSwitched: false,
  diskInPlace: false,
  stepEnd: 0,
  readyEnd: 0,
  spindleOffEnd: 0,
  headRemainder35: 0,
  headPending35: 0,
  headCycle35: 0,
  fluxKind: FLUX_KIND.WOZ,
  fluxPsPerTick: psPerTick,
  fluxLapStart: Array<number>(160).fill(0),
  fluxLapEnd: Array<number>(160).fill(0),
  fluxRevCycles: Array<number>(160).fill(0),
  fluxLoopCycles: Array<number>(160).fill(0),
  fluxByte: 0,
  fluxTicks: 0,
  fluxCycle: 0,
  fluxIntervalStart: 0,
  fluxIntervalLength: 0,
  fluxIntervalEnd: 0,
  fluxBitsInInterval: 0,
  fluxBitIndex: 0,
})

export const readLittleEndian16 = (data: Uint8Array, offset: number) => data[offset] | (data[offset + 1] << 8)

export const readLittleEndian32 = (data: Uint8Array, offset: number) =>
  data[offset] + (data[offset + 1] << 8) + (data[offset + 2] << 16) + data[offset + 3] * (2 ** 24)

// Encode tick intervals as flux bytes: 255 = add and continue.
export const encodeFlux = (intervals: number[]): number[] => {
  const out: number[] = []
  for (let iv of intervals) {
    while (iv >= 255) { out.push(255); iv -= 255 }
    out.push(iv)
  }
  return out
}

// Deterministic pseudo-random numbers (no Math.random in tests).
export const lcg = (seed: number) => {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    return s / 2 ** 32
  }
}

export type TestCapture = {
  type?: number,
  location: number,
  marks: number[],
  data: number[],
}

// An A2R3 file: header, INFO (37 bytes), RWCP with the captures and 'X'.
export const buildA2R3 = (captures: TestCapture[],
  opts: { driveType?: number, resolution?: number, endByte?: number } = {}): Uint8Array => {
  const info = [1, ...Array(32).fill(0x20), opts.driveType ?? 1, 1, 1, 0]
  const records: number[] = []
  for (const c of captures) {
    records.push(0x43, c.type ?? 3, c.location & 255, c.location >> 8, c.marks.length)
    for (const m of c.marks) records.push(...uint32toBytes(m))
    records.push(...uint32toBytes(c.data.length), ...c.data)
  }
  records.push(opts.endByte ?? 0x58)
  const rwcp = [1, ...uint32toBytes(opts.resolution ?? 125000), ...Array(11).fill(0), ...records]
  const bytes = [
    0x41, 0x32, 0x52, 0x33, 0xFF, 0x0A, 0x0D, 0x0A,
    0x49, 0x4E, 0x46, 0x4F, ...uint32toBytes(info.length), ...info,
    0x52, 0x57, 0x43, 0x50, ...uint32toBytes(rwcp.length), ...rwcp,
  ]
  // Pad past decodeDiskData's 10000-byte minimum with an unknown chunk.
  const pad = Math.max(0, 10100 - bytes.length)
  bytes.push(0x50, 0x41, 0x44, 0x20, ...uint32toBytes(pad), ...Array(pad).fill(0))
  return new Uint8Array(bytes)
}

// A capture of `laps` identical laps of `lap` intervals; marks fall at the
// first transition of each lap (as an index sensor would, within one interval).
export const lapCapture = (location: number, lap: number[], laps: number): TestCapture => {
  const intervals: number[] = []
  for (let i = 0; i < laps + 1; i++) intervals.push(...lap)
  const lapTicks = lap.reduce((a, b) => a + b, 0)
  const marks: number[] = []
  for (let i = 0; i <= laps; i++) marks.push(i * lapTicks + 1)
  return {
    location,
    marks,
    data: encodeFlux(intervals),
  }
}

// A landing that walks every interval from the start of the loop, written
// out here independently of fluxtrack.ts. fluxLand starts from the nearest
// seek checkpoint instead, and the tests check that it gives exactly the
// cursor this walk gives.
export const fluxLandWalk = (ds: DriveState, dd: Uint8Array, q: number, frac: number) => {
  const next = () => {
    const end = ds.fluxLapEnd[q]
    if (ds.fluxByte >= end) {
      ds.fluxByte = ds.fluxLapStart[q]
      ds.fluxTicks = 0
      ds.fluxCycle -= ds.fluxLoopCycles[q]
      ds.fluxIntervalEnd = 0
    }
    let sum = 0
    let value = 255
    while (value === 255 && ds.fluxByte < end) {
      value = dd[ds.fluxByte++]
      sum += value
    }
    ds.fluxTicks += sum
    const intervalEnd = ds.fluxTicks * ds.fluxPsPerTick * (FLUX_CPU_HZ / 1e12)
    ds.fluxIntervalStart = ds.fluxIntervalEnd
    ds.fluxIntervalLength = intervalEnd - ds.fluxIntervalEnd
    ds.fluxIntervalEnd = intervalEnd
    ds.fluxBitsInInterval = Math.max(1, Math.round(ds.fluxIntervalLength / FLUX_CELL_CYCLES))
    ds.fluxBitIndex = 0
  }
  const rev = ds.fluxRevCycles[q]
  const target = Math.min(Math.max(frac, 0), 1) * rev
  ds.fluxByte = ds.fluxLapStart[q]
  ds.fluxTicks = 0
  ds.fluxIntervalEnd = 0
  ds.fluxCycle = 0
  next()
  while (ds.fluxIntervalEnd <= target && ds.fluxByte < ds.fluxLapEnd[q]) next()
  ds.fluxCycle = target
  while (ds.fluxBitIndex < ds.fluxBitsInInterval - 1 &&
    ds.fluxIntervalStart + (ds.fluxBitIndex + 1) * ds.fluxIntervalLength / ds.fluxBitsInInterval <= target) {
    ds.fluxBitIndex++
  }
}

// The cursor fields of a drive, for exact comparisons.
export const fluxCursor = (ds: DriveState) => ({
  fluxByte: ds.fluxByte,
  fluxTicks: ds.fluxTicks,
  fluxCycle: ds.fluxCycle,
  fluxIntervalStart: ds.fluxIntervalStart,
  fluxIntervalLength: ds.fluxIntervalLength,
  fluxIntervalEnd: ds.fluxIntervalEnd,
  fluxBitsInInterval: ds.fluxBitsInInterval,
  fluxBitIndex: ds.fluxBitIndex,
})

// A 16-sector WOZ2 with a FLUX chunk added: INFO v3, flux at quarter track `q`.
export const wozWithFlux = (fluxBytes: number[], q = 8) => {
  const base = convertdsk2woz(new Uint8Array(143360), false)
  const fluxBlock = Math.ceil(base.length / 512)
  const dataBlock = fluxBlock + 1
  const out = new Uint8Array(512 * (dataBlock + Math.ceil(fluxBytes.length / 512) + 1))
  out.set(base)
  out[8] = out[9] = out[10] = out[11] = 0   // no CRC check
  out[20] = 3
  out[66] = fluxBlock & 255; out[67] = fluxBlock >> 8
  out[68] = 1; out[69] = 0
  const chunk = 512 * fluxBlock
  out.set([0x46, 0x4C, 0x55, 0x58, 160, 0, 0, 0], chunk)
  out.fill(255, chunk + 8, chunk + 168)
  out[chunk + 8 + q] = 100           // TRKS entry 100
  const trk = 256 + 8 * 100
  out[trk] = dataBlock & 255; out[trk + 1] = dataBlock >> 8
  out[trk + 2] = Math.ceil(fluxBytes.length / 512)
  out[trk + 4] = fluxBytes.length & 255; out[trk + 5] = (fluxBytes.length >> 8) & 255
  out[trk + 6] = (fluxBytes.length >> 16) & 255
  out.set(fluxBytes, 512 * dataBlock)
  // A TMAP entry at the same q, which FLUX must win over.
  out[88 + q] = 0
  return out
}
