import { FLUX_CELL_CYCLES, FLUX_CPU_HZ, FLUX_JITTER_STEP_PS, fluxAdvance, fluxAngle, fluxIsMarginal,
  fluxJitterAt, fluxJitterTicks, fluxLand, fluxLoopTicks, fluxPassOf, fluxTicksToCycles,
  setFluxJitterTicks } from "./fluxtrack"
import { blankFluxDriveState, encodeFlux, lcg } from "./fluxtest_utils"

// Put a loop of flux bytes at q, starting at `start` in dd.
const installLoop = (ds: DriveState, dd: Uint8Array, q: number, start: number,
  bytes: number[], revTicks?: number) => {
  dd.set(bytes, start)
  const end = start + bytes.length
  const loop = fluxTicksToCycles(fluxLoopTicks(dd, start, end), ds.fluxPsPerTick)
  ds.fluxLapStart[q] = start
  ds.fluxLapEnd[q] = end
  ds.fluxLoopCycles[q] = loop
  ds.fluxRevCycles[q] = revTicks ? fluxTicksToCycles(revTicks, ds.fluxPsPerTick) : loop
}

// The bits the player must give, worked out here from the intervals. The first
// interval is where the head lands, read without jitter. After it, a marginal
// interval (fluxIsMarginal) adds fluxJitterAt(byte after it, pass) steps of
// 125 ns to the move every later transition carries. Each interval between two
// transitions is max(1, round(length / cell)) bits, zeros and then a 1.
// Only the bits at or before `cycles` from the landing are given.
const expectedBits = (ps: number, intervals: number[], start: number, pass: number,
  laps: number, cycles: number) => {
  const loop = fluxTicksToCycles(intervals.reduce((a, b) => a + b, 0), ps)
  const out: number[] = []
  let prevEnd = 0
  let carry = 0
  let first = true
  for (let lap = 0; lap < laps; lap++) {
    let byte = start
    let cum = 0
    for (const iv of intervals) {
      byte += Math.floor(iv / 255) + 1
      cum += iv
      if (!first && fluxIsMarginal(iv * ps)) carry += fluxJitterAt(byte, pass + lap) * FLUX_JITTER_STEP_PS
      first = false
      const end = lap * loop + fluxTicksToCycles(cum + carry / ps, ps)
      const len = end - prevEnd
      const k = Math.max(1, Math.round(len / FLUX_CELL_CYCLES))
      for (let m = 1; m <= k; m++) {
        if (prevEnd + m * len / k > cycles) return out
        out.push(m === k ? 1 : 0)
      }
      prevEnd = end
    }
  }
  return out
}

// Run `fn` with the jitter set to `ticks`, then put the selected jitter back.
const withJitter = (ticks: number, fn: () => void) => {
  const selected = fluxJitterTicks
  setFluxJitterTicks(ticks)
  try { fn() } finally { setFluxJitterTicks(selected) }
}

test("the time base is the emulator's CPU rate and the cell is 4 us of it", () => {
  expect(FLUX_CPU_HZ).toBeCloseTo(17030 / 0.0166881, 6)
  expect(FLUX_CELL_CYCLES).toBeCloseTo(4e-6 * 17030 / 0.0166881, 9)
})

test("no drift over 100k intervals: every transition lands at its running-total time", () => {
  const ps = 61111   // a resolution whose intervals are never whole cycles
  const rnd = lcg(12345)
  const intervals: number[] = []
  for (let i = 0; i < 100000; i++) {
    const r = rnd()
    // 4, 8 and 12 us cells with +-5% jitter, and now and then a long no-flux run
    const cells = r < 0.6 ? 1 : r < 0.9 ? 2 : r < 0.999 ? 3 : 40
    intervals.push(Math.round(cells * 65.45 * (0.95 + 0.1 * rnd())))
  }
  const bytes = encodeFlux(intervals)
  const dd = new Uint8Array(bytes.length + 16)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 16, bytes)
  // The exact time of every transition, from the running total of ticks.
  const times: number[] = []
  let cum = 0
  for (const iv of intervals) { cum += iv; times.push(fluxTicksToCycles(cum, ps)) }

  fluxLand(ds, dd, 0, 0)
  let ones = 0
  let bits = 0
  const shift = (bit: number) => { bits++; ones += bit }
  let now = 0
  let next = 0
  const stepRnd = lcg(999)
  const end = times[times.length - 1]
  while (now < end) {
    // CPU-like steps: 3 to 45 cycles between disk accesses
    const step = 3 + Math.floor(stepRnd() * 43)
    now += step
    fluxAdvance(ds, dd, 0, step, shift)
    while (next < times.length && times[next] <= now) next++
    expect(ones).toBe(next)
  }
  expect(ones).toBe(100000)
  // Every interval gave k = max(1, round(interval / cell)) bits.
  let expectedBits = 0
  let prev = 0
  for (const t of times) {
    expectedBits += Math.max(1, Math.round((t - prev) / FLUX_CELL_CYCLES))
    prev = t
  }
  expect(bits).toBe(expectedBits)
})

const bitsOf = (ps: number, intervals: number[], cycles: number) => {
  const bytes = encodeFlux(intervals)
  const dd = new Uint8Array(bytes.length)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 0, bytes)
  fluxLand(ds, dd, 0, 0)
  const out: number[] = []
  fluxAdvance(ds, dd, 0, cycles, b => out.push(b))
  return out
}

test("the 1-vs-2-cell boundary is 6.0 us: 95 ticks of 62.5 ns is one cell, 97 is two", () => {
  withJitter(0, () => {
    const one = bitsOf(62500, [95, 95, 95], fluxTicksToCycles(3 * 95, 62500))
    expect(one).toEqual([1, 1, 1])
    const two = bitsOf(62500, [97, 97, 97], fluxTicksToCycles(3 * 97, 62500))
    expect(two).toEqual([0, 1, 0, 1, 0, 1])
  })
})

test("only a marginal interval moves, by the selected jitter, and keeps its move", () => {
  // 98 ticks of 61,111 ps = 5.989 us (marginal) and 131 = 8.006 us (not):
  // never exactly 1.5 cells, so no interval rounds on a knife edge.
  const ps = 61111
  const intervals: number[] = []
  for (let i = 0; i < 600; i++) intervals.push(i % 2 ? 98 : 131)
  expect(fluxIsMarginal(98 * ps)).toBe(fluxJitterTicks > 0)
  expect(fluxIsMarginal(131 * ps)).toBe(false)
  const bytes = encodeFlux(intervals)
  const dd = new Uint8Array(bytes.length)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 0, bytes)
  const pass = fluxPassOf(ds)
  const loop = ds.fluxLoopCycles[0]
  fluxLand(ds, dd, 0, 0)
  const out: number[] = []
  fluxAdvance(ds, dd, 0, 2 * loop, b => out.push(b))
  expect(out).toEqual(expectedBits(ps, intervals, 0, pass, 3, 2 * loop))
  if (fluxJitterTicks > 0) {
    // An 8 us interval is "01" every time; a 6 us one reads "1" (one cell)
    // on some passes and "01" (two) on others.
    expect(out.join("")).toContain("01101")
    expect(out.join("")).toContain("010101")
  }
})

test("a 1-tick interval still gives a transition", () => {
  const bits = bitsOf(125000, [32, 1, 32], fluxTicksToCycles(65, 125000))
  expect(bits).toEqual([1, 1, 1])
})

test("a long no-flux run plays as zeros, no synthetic weak bits", () => {
  // 40 us with no flux: 10 cells
  const bits = bitsOf(125000, [32, 320, 32], fluxTicksToCycles(384, 125000))
  expect(bits).toEqual([1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1])
})

test("the seam: the loop repeats with time continuous", () => {
  const ps = 61111
  const rnd = lcg(7)
  const intervals: number[] = []
  for (let i = 0; i < 500; i++) intervals.push(60 + Math.floor(rnd() * 140))
  const bytes = encodeFlux(intervals)
  const dd = new Uint8Array(bytes.length)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 0, bytes)
  const loop = ds.fluxLoopCycles[0]
  const pass = fluxPassOf(ds)
  fluxLand(ds, dd, 0, 0)
  const out: number[] = []
  // Advance 3 whole loops in odd steps
  let t = 0
  while (t + 7.3 < 3 * loop) { fluxAdvance(ds, dd, 0, 7.3, b => out.push(b)); t += 7.3 }
  fluxAdvance(ds, dd, 0, 3 * loop - t, b => out.push(b))
  // Each pass moves its own marginal intervals; the bits are those of the passes.
  expect(out).toEqual(expectedBits(ps, intervals, 0, pass, 4, 3 * loop))
  if (fluxJitterTicks === 0) {
    const perLoop = out.length / 3
    expect(Number.isInteger(perLoop)).toBe(true)
    expect(out.slice(perLoop, 2 * perLoop)).toEqual(out.slice(0, perLoop))
    expect(out.slice(2 * perLoop)).toEqual(out.slice(0, perLoop))
    expect(out.filter(b => b === 1).length).toBe(1500)
  }
  expect(fluxAngle(ds, 0)).toBeCloseTo(0, 9)
})

test("a 10-minute idle gap returns quickly and keeps the angle", () => {
  const ps = 125000
  const intervals = Array<number>(50000).fill(32)
  const bytes = encodeFlux(intervals)
  const dd = new Uint8Array(bytes.length)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 0, bytes)
  fluxLand(ds, dd, 0, 0)
  const gap = 600 * FLUX_CPU_HZ
  const t0 = Date.now()
  fluxAdvance(ds, dd, 0, gap, () => undefined)
  expect(Date.now() - t0).toBeLessThan(2000)
  const loop = ds.fluxLoopCycles[0]
  expect(fluxAngle(ds, 0)).toBeCloseTo((gap % loop) / loop, 6)
})

test("a seek at 0.25 of lap 3 lands at 0.25 of lap 1 of the new track", () => {
  const ps = 125000
  const rnd = lcg(42)
  const lapA: number[] = []
  for (let i = 0; i < 3000; i++) lapA.push(28 + Math.floor(rnd() * 70))
  const lapB: number[] = []
  for (let i = 0; i < 2500; i++) lapB.push(30 + Math.floor(rnd() * 90))
  const ticksA = lapA.reduce((a, b) => a + b, 0)
  const ticksB = lapB.reduce((a, b) => a + b, 0)
  // q 0: three laps of A; q 4: three laps of B. One revolution = one lap.
  const bytesA = encodeFlux([...lapA, ...lapA, ...lapA])
  const bytesB = encodeFlux([...lapB, ...lapB, ...lapB])
  const dd = new Uint8Array(bytesA.length + bytesB.length + 100)
  const ds = blankFluxDriveState(ps)
  installLoop(ds, dd, 0, 0, bytesA, ticksA)
  installLoop(ds, dd, 4, bytesA.length + 100, bytesB, ticksB)
  fluxLand(ds, dd, 0, 0)
  const revA = ds.fluxRevCycles[0]
  fluxAdvance(ds, dd, 0, 2.25 * revA, null)
  expect(ds.fluxCycle).toBeCloseTo(2.25 * revA, 6)
  const frac = fluxAngle(ds, 0)
  expect(frac).toBeCloseTo(0.25, 9)
  fluxLand(ds, dd, 4, frac)
  const revB = ds.fluxRevCycles[4]
  expect(ds.fluxCycle).toBeCloseTo(0.25 * revB, 6)
  // The cursor is in lap 1 of B, on the interval that holds that time.
  expect(ds.fluxByte).toBeGreaterThan(ds.fluxLapStart[4])
  expect(ds.fluxByte).toBeLessThanOrEqual(ds.fluxLapStart[4] + lapB.length)
  expect(ds.fluxIntervalStart).toBeLessThanOrEqual(ds.fluxCycle)
  expect(ds.fluxIntervalEnd).toBeGreaterThan(ds.fluxCycle)
  // Seek cost stays bounded: landing walks at most one revolution.
  const t0 = Date.now()
  for (let i = 0; i < 200; i++) fluxLand(ds, dd, 4, 0.999)
  expect(Date.now() - t0).toBeLessThan(2000)
})
