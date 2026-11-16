// The flux hooks in diskdata.ts and drivestate.ts, driven through the slot 6
// soft switches. One file, because diskdata.ts keeps module-level state.
import { FLUX_KIND } from "../../common/utility"
import { handleDriveSoftSwitches } from "./diskdata"
import { doSetEmuDriveNewData, doSetEmuDriveProps, getCurrentDriveData, getCurrentDriveState,
  getDriveSaveState, restoreDriveSaveState } from "./drivestate"
import { FLUX_CPU_HZ, fluxAngle, fluxLand, isFluxTrack } from "./fluxtrack"
import { setCycleCount, s6502 } from "../instructions"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"
import { buildA2R3, lapCapture, lcg, readTestImage } from "./fluxtest_utils"

beforeAll(() => setIsTesting())
afterEach(() => jest.restoreAllMocks())

const sw = (n: number, value = -1) => handleDriveSoftSwitches(0xC0E0 + n, value)
const at = (cycles: number) => setCycleCount(cycles)

const mount = (filename: string, diskData: Uint8Array) => {
  const props: DriveProps = {
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
  }
  return doSetEmuDriveNewData(props)
}

const sum = (d: Uint8Array) => d.reduce((a, b) => (a * 31 + b) >>> 0, 7)

// Two captured tracks (q 0 and q 4) with different laps, three laps each.
const rnd = lcg(5)
const lapA = Array.from({ length: 3000 }, () => 28 + Math.floor(rnd() * 70))
const lapB = Array.from({ length: 2600 }, () => 30 + Math.floor(rnd() * 80))
const synthetic = buildA2R3([lapCapture(0, lapA, 3), lapCapture(4, lapB, 3)], { resolution: 125000 })

test("an A2R3 mounts read only, lands on lap 1 and is not sent back to the UI", () => {
  const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
  at(1000)
  expect(mount("synthetic.a2r", synthetic)).toBe(true)
  const ds = getCurrentDriveState()
  expect(ds.fluxKind).toBe(FLUX_KIND.A2R3)
  expect(ds.isWriteProtected).toBe(true)
  expect(getCurrentDriveData()).toBe(synthetic)
  const sent = passDriveProps.mock.calls.find(c => c[0].index === 2)
  expect(sent?.[0].diskData.length).toBe(0)
  expect(sent?.[0].isFlux).toBe(true)
  // The UI cannot write enable it.
  doSetEmuDriveProps({ ...sent![0], isWriteProtected: false })
  expect(getCurrentDriveState().isWriteProtected).toBe(true)
})

test("reads return latch bytes and a seek keeps the angle", () => {
  const ds = getCurrentDriveState()
  // Head to q 0 (where reset parks it); set it explicitly.
  at(2000)
  sw(9)                      // motor on
  ds.quarterTrack = 0
  ds.prevQuarterTrack = 0
  ds.currentPhase = 0
  let t = 2000
  // phase 0 on at q 0: no move, the platter keeps turning (no re-land)
  t += 50; at(t); sw(1)
  expect(ds.quarterTrack).toBe(0)
  const now0 = ds.fluxCycle
  t += 50; at(t); sw(1)
  expect(ds.fluxCycle).toBeCloseTo(now0 + 50, 6)
  // read for a while at q 0: bytes with the high bit set appear
  let highs = 0
  for (let i = 0; i < 20000; i++) {
    t += 4 + (i % 7); at(t)
    if (sw(0xC) & 0x80) highs++
  }
  expect(highs).toBeGreaterThan(1000)
  // step q 0 -> q 4 through the empty quarter tracks 1-3, all at the same cycle
  const before = fluxAngle(ds, 0)
  t += 4; at(t)
  sw(3)                      // phase 1 on  -> q 1
  sw(0)                      // phase 0 off -> q 2
  sw(5)                      // phase 2 on  -> q 3
  sw(2)                      // phase 1 off -> q 4
  expect(ds.quarterTrack).toBe(4)
  expect(isFluxTrack(ds, 4)).toBe(true)
  // The angle after the read cycles; within one empty-track bit
  const expected = (before + 4 / ds.fluxRevCycles[0]) % 1
  expect(Math.abs(fluxAngle(ds, 4) - expected)).toBeLessThan(2 / 51024)
  // and the head is in lap 1
  expect(ds.fluxCycle).toBeLessThan(ds.fluxRevCycles[4])
})

test("write mode keeps the platter turning and writes leave the data byte-identical", () => {
  const ds = getCurrentDriveState()
  const dd = getCurrentDriveData()
  const check = sum(dd)
  let t = s6502.cycleCount
  const start = ds.fluxCycle
  t += 10; at(t)
  sw(0xF, 0xFF)              // write mode on, load the latch
  for (let i = 0; i < 1000; i++) {
    t += 32; at(t)
    sw(0xD, 0xD5)            // write a byte
  }
  t += 10; at(t)
  sw(0xE)                    // back to read
  const turned = (ds.fluxCycle - start + ds.fluxLoopCycles[4]) % ds.fluxLoopCycles[4]
  expect(turned).toBeCloseTo((32020) % ds.fluxLoopCycles[4], 6)
  expect(sum(dd)).toBe(check)
  expect(ds.diskHasChanges).toBe(false)
  // write protect sense: Q6 high, Q7 low reads 0xFF
  sw(0xD)
  expect(sw(0xE)).toBe(0xFF)
})

test("a snapshot leaves the A2R3 out but keeps the cursor", () => {
  const ds = getCurrentDriveState()
  const dd = getCurrentDriveData()
  const snap = getDriveSaveState(false)
  expect(snap.driveData[2]).toBe("")
  const cursor = ds.fluxCycle
  // move on, then go back in time
  let t = s6502.cycleCount
  for (let i = 0; i < 100; i++) { t += 40; at(t); sw(0xC) }
  expect(getCurrentDriveState().fluxCycle).not.toBeCloseTo(cursor, 3)
  const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
  restoreDriveSaveState(snap)
  expect(getCurrentDriveData()).toBe(dd)
  expect(getCurrentDriveState().fluxCycle).toBeCloseTo(cursor, 9)
  const sent = passDriveProps.mock.calls.find(c => c[0].index === 2)
  expect(sent?.[0].diskData.length).toBe(0)
  // A full save state keeps the data.
  expect(getDriveSaveState(true).driveData[2].length).toBeGreaterThan(0)
})

test("a 10-minute idle gap with the motor off returns quickly", () => {
  const ds = getCurrentDriveState()
  let t = s6502.cycleCount + 600 * FLUX_CPU_HZ
  at(t)
  const t0 = Date.now()
  sw(9)
  sw(0xC)
  expect(Date.now() - t0).toBeLessThan(2000)
  expect(ds.fluxCycle).toBeLessThan(2 * ds.fluxLoopCycles[ds.quarterTrack] + 100)
  t += 10; at(t)
})

// The nibbles an independent straight-line decode of the file gives: each
// interval in real time is k = max(1, round(us / 4)) cells, fed through
// the latch rule in diskdata.ts (the hold from issue 230). Two passes of the loop.
const referenceNibbles = (dd: Uint8Array, start: number, end: number, psPerTick: number) => {
  const nibbles: number[] = []
  let reg = 0
  let hold = false
  const shift = (bit: number) => {
    if (hold) {
      hold = !bit
    } else if (reg & 0x80) {
      reg = 0x2 | bit
    } else {
      reg = (reg << 1) | bit
      if (reg & 0x80) { hold = true; nibbles.push(reg & 0xFF) }
    }
  }
  for (let pass = 0; pass < 2; pass++) {
    let acc = 0
    for (let i = start; i < end; i++) {
      acc += dd[i]
      if (dd[i] === 255) continue
      const k = Math.max(1, Math.round(acc * psPerTick * 1e-6 / 4))
      for (let j = 1; j < k; j++) shift(0)
      shift(1)
      acc = 0
    }
  }
  return nibbles
}

// Read q through the soft switches every 2 cycles and check the nibbles match
// the reference decode, from wherever the first 16 of them line up.
const readMatchesReference = (filename: string, image: Uint8Array, q: number) => {
  let t = s6502.cycleCount + 10
  at(t)
  expect(mount(filename, image)).toBe(true)
  const ds = getCurrentDriveState()
  const dd = getCurrentDriveData()
  expect(isFluxTrack(ds, q)).toBe(true)
  ds.quarterTrack = q
  ds.prevQuarterTrack = q
  fluxLand(ds, dd, q, 0)
  sw(9)
  sw(0xC)
  const got: number[] = []
  let last = 0
  for (let i = 0; i < 400000 && got.length < 4000; i++) {
    t += 2; at(t)
    const v = sw(0xC)
    if ((v & 0x80) && v !== last) got.push(v)
    last = v
  }
  const ref = referenceNibbles(dd, ds.fluxLapStart[q], ds.fluxLapEnd[q], ds.fluxPsPerTick)
  const key = got.slice(10, 26).join(",")
  let at0 = -1
  for (let i = 0; i + 16 < ref.length && at0 < 0; i++) {
    if (ref.slice(i, i + 16).join(",") === key) at0 = i
  }
  expect(at0).toBeGreaterThanOrEqual(0)
  expect(got.slice(10, 3010)).toEqual(ref.slice(at0, at0 + 3000))
}

const chop = readTestImage("Choplifter param 3.a2r")
const testChop = chop ? test : test.skip

testChop("Choplifter param 3.a2r track 0 reads the nibbles of its capture", () => {
  readMatchesReference("Choplifter param 3.a2r", chop as Uint8Array, 0)
})

const bandits = readTestImage("Bandits HALF (speed test 20).woz")
const testBandits = bandits ? test : test.skip

testBandits("Bandits HALF (speed test 20).woz flux track 1 reads the nibbles of its flux", () => {
  readMatchesReference("Bandits HALF (speed test 20).woz", bandits as Uint8Array, 4)
})
