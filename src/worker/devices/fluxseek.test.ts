// Seek checkpoints: landing from the nearest checkpoint gives exactly the
// cursor of the walk from the loop start, and steps across flux tracks
// stay fast.
import { handleDriveSoftSwitches } from "./diskdata"
import { doSetEmuDriveNewData, getCurrentDriveData, getCurrentDriveState } from "./drivestate"
import { FLUX_CHECKPOINT_BYTES, fluxBuildCheckpoints, fluxLand, fluxLoopTicks,
  fluxTicksToCycles, isFluxTrack } from "./fluxtrack"
import { setCycleCount, s6502 } from "../instructions"
import { setIsTesting } from "../worker2main"
import { blankFluxDriveState, buildA2R3, encodeFlux, fluxCursor, fluxLandWalk, lapCapture,
  lcg, readTestImage } from "./fluxtest_utils"

beforeAll(() => setIsTesting())

// Land at many angles with the checkpoints and with the walk; the cursors
// must be identical, field for field.
const expectSameLandings = (ds: DriveState, dd: Uint8Array, q: number, count: number, seed: number) => {
  const rnd = lcg(seed)
  const fracs = [0, 1, 0.5, 1e-9, 1 - 1e-9]
  for (let i = 0; i < count; i++) fracs.push(rnd())
  // Angles that fall exactly on, or just either side of, transitions near
  // checkpoint bytes.
  const rev = ds.fluxRevCycles[q]
  let ticks = 0
  for (let i = ds.fluxLapStart[q]; i < ds.fluxLapEnd[q] && fracs.length < count + 400; i++) {
    ticks += dd[i]
    if (dd[i] !== 255 && (i - ds.fluxLapStart[q]) % FLUX_CHECKPOINT_BYTES < 3) {
      const t = fluxTicksToCycles(ticks, ds.fluxPsPerTick)
      if (t <= rev) fracs.push(t / rev, (t - 1e-6) / rev, (t + 1e-6) / rev)
    }
  }
  const a = { ...ds }
  const b = { ...ds }
  for (const frac of fracs) {
    fluxLand(a, dd, q, frac)
    fluxLandWalk(b, dd, q, frac)
    expect(fluxCursor(a)).toEqual(fluxCursor(b))
  }
  return fracs.length
}

test("a checkpointed landing equals the walk on a synthetic track", () => {
  const ps = 125000
  const rnd = lcg(77)
  const intervals: number[] = []
  for (let i = 0; i < 60000; i++) {
    const r = rnd()
    // 1, 2 and 3 cells, now and then a long no-flux run (several 255 bytes,
    // so intervals straddle the checkpoint bytes), and the odd 0 tick byte.
    intervals.push(r < 0.002 ? 255 * (2 + Math.floor(rnd() * 6)) + Math.floor(rnd() * 255)
      : r < 0.003 ? 0 : Math.round((r < 0.6 ? 32 : r < 0.9 ? 64 : 96) * (0.9 + 0.2 * rnd())))
  }
  const bytes = encodeFlux(intervals)
  const start = 1000
  const dd = new Uint8Array(start + bytes.length + 100)
  dd.set(bytes, start)
  const ds = blankFluxDriveState(ps)
  // Three loops: one where the revolution is the whole loop, two where it is
  // shorter (an A2R3 capture of more than one lap).
  const loopTicks = fluxLoopTicks(dd, start, start + bytes.length)
  ds.fluxLapStart[0] = start
  ds.fluxLapEnd[0] = start + bytes.length
  ds.fluxLoopCycles[0] = fluxTicksToCycles(loopTicks, ps)
  ds.fluxRevCycles[0] = ds.fluxLoopCycles[0]
  ds.fluxLapStart[1] = start
  ds.fluxLapEnd[1] = start + bytes.length
  ds.fluxLoopCycles[1] = ds.fluxLoopCycles[0]
  ds.fluxRevCycles[1] = ds.fluxLoopCycles[0] * 0.45
  ds.fluxLapStart[2] = start + 37
  ds.fluxLapEnd[2] = start + bytes.length
  ds.fluxLoopCycles[2] = fluxTicksToCycles(fluxLoopTicks(dd, start + 37, start + bytes.length), ps)
  ds.fluxRevCycles[2] = ds.fluxLoopCycles[2] * 0.7
  fluxBuildCheckpoints(ds, dd)
  for (const q of [0, 1, 2]) {
    expect(expectSameLandings(ds, dd, q, 3000, 100 + q)).toBeGreaterThan(3000)
  }
})

const sw = (n: number) => handleDriveSoftSwitches(0xC0E0 + n, -1)

const mount = (filename: string, diskData: Uint8Array) => doSetEmuDriveNewData({
  index: 2,
  hardDrive: false,
  drive: 1,
  filename,
  status: "",
  motorRunning: false,
  diskHasChanges: false,
  isWriteProtected: false,
  diskData,
  lastAppleWriteTime: 0,
  cloudData: null,
  writableFileHandle: null,
  lastLocalFileWriteTime: 0,
})

// Step the head from q 0 in to `inner` and back out, one quarter track per
// phase switch, `steps` switches in all. Returns the milliseconds taken.
const stepAcross = (steps: number, inner: number) => {
  const ds = getCurrentDriveState()
  let t = s6502.cycleCount + 100
  setCycleCount(t)
  sw(9)                                  // motor on
  ds.quarterTrack = 0
  ds.prevQuarterTrack = 0
  ds.currentPhase = 0
  sw(1)                                  // phase 0 on: hold q 0
  const rnd = lcg(31)
  let done = 0
  let dir = 1
  const t0 = performance.now()
  while (done < steps) {
    const q = ds.quarterTrack
    if (dir > 0 && q >= inner) dir = -1
    if (dir < 0 && q <= 0) dir = 1
    const phase = (q >> 1) & 3
    t += 500 + Math.floor(rnd() * 20000)  // a few ms between switches
    setCycleCount(t)
    if (q % 2 === 0) {
      sw(2 * ((phase + dir + 4) & 3) + 1)  // the next phase on: half way
    } else {
      // between two phases: switch off the one we are leaving
      const from = dir > 0 ? (q - 1) >> 1 : (q + 1) >> 1
      sw(2 * (from & 3))
    }
    expect(ds.quarterTrack).toBe(q + dir)
    done++
  }
  return performance.now() - t0
}

// Wall-clock limits run only on request (FLUX_BENCHMARK=1), as in the VERA
// benchmark: a slow shared runner must not fail them at random.
const benchmark = process.env.FLUX_BENCHMARK === "1"

test("200 steps across the flux tracks of a synthetic A2R3 stay fast", () => {
  const rnd = lcg(9)
  const captures = []
  // A capture at every quarter track from 0 to 20, each a lap of 50000
  // intervals (about 200 ms of 4 us cells) captured 1 lap over.
  for (let q = 0; q <= 20; q++) {
    const lap = Array.from({ length: 50000 }, () => 28 + Math.floor(rnd() * 70))
    captures.push(lapCapture(q, lap, 1))
  }
  expect(mount("seek.a2r", buildA2R3(captures))).toBe(true)
  const ds = getCurrentDriveState()
  for (let q = 0; q <= 20; q++) expect(isFluxTrack(ds, q)).toBe(true)
  const ms = stepAcross(200, 20)
  if (benchmark) expect(ms).toBeLessThan(150)
})

const images: Array<[string, Uint8Array | null]> = [
  ["Bandits HALF (speed test 20).woz", readTestImage("Bandits HALF (speed test 20).woz")],
  ["Choplifter param 3.a2r", readTestImage("Choplifter param 3.a2r")],
]

for (const [name, image] of images) {
  const testImage = image ? test : test.skip
  testImage(`${name}: checkpointed landings equal the walk on every flux track`, () => {
    expect(mount(name, image as Uint8Array)).toBe(true)
    const ds = getCurrentDriveState()
    const dd = getCurrentDriveData()
    let fluxTracks = 0
    for (let q = 0; q < 160; q++) {
      if (!isFluxTrack(ds, q)) continue
      fluxTracks++
      expectSameLandings(ds, dd, q, 200, q)
    }
    expect(fluxTracks).toBeGreaterThan(0)
  })

  testImage(`${name}: 200 steps across its tracks stay fast`, () => {
    expect(mount(name, image as Uint8Array)).toBe(true)
    const ds = getCurrentDriveState()
    let inner = 0
    for (let q = 0; q < 160; q++) if (isFluxTrack(ds, q)) inner = q
    const ms = stepAcross(200, Math.min(inner, 40))
    if (benchmark) expect(ms).toBeLessThan(150)
  })
}
