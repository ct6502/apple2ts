import { FLUX_KIND } from "../../common/utility"
import { decodeDiskData } from "./decodedisk"
import { fluxLoopTicks, fluxTicksToCycles, isFluxTrack } from "./fluxtrack"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"
import { blankFluxDriveState, encodeFlux, readLittleEndian16, readLittleEndian32, readTestImage,
  wozWithFlux } from "./fluxtest_utils"
import { doSetEmuDriveNewData } from "./drivestate"

beforeAll(() => setIsTesting())
afterEach(() => jest.restoreAllMocks())

const emptyFloppy = (filename: string): DriveState => {
  const ds = blankFluxDriveState(0)
  ds.fluxKind = FLUX_KIND.NONE
  ds.isWriteProtected = false
  ds.filename = filename
  return ds
}

test("FLUX parse: a WOZ 2.1 flux track becomes a read-only flux track", () => {
  const flux = encodeFlux(Array(20000).fill(32))
  const woz = wozWithFlux(flux, 8)
  const ds = emptyFloppy("synthetic.woz")
  const data = decodeDiskData(ds, woz)
  expect(data.length).toBe(woz.length)
  expect(ds.fluxKind).toBe(FLUX_KIND.WOZ)
  expect(ds.fluxPsPerTick).toBe(125000)
  expect(ds.isWriteProtected).toBe(true)
  expect(isFluxTrack(ds, 8)).toBe(true)
  expect(isFluxTrack(ds, 0)).toBe(false)
  expect(ds.fluxLapEnd[8] - ds.fluxLapStart[8]).toBe(flux.length)
  expect(ds.fluxRevCycles[8]).toBeCloseTo(fluxTicksToCycles(20000 * 32, 125000), 6)
  expect(ds.fluxLoopCycles[8]).toBe(ds.fluxRevCycles[8])
})

test("INFO v2 with stray bytes at 66-69 is not flux", () => {
  const woz = wozWithFlux(encodeFlux(Array(100).fill(32)), 8)
  woz[20] = 2
  const ds = emptyFloppy("v2.woz")
  expect(decodeDiskData(ds, woz).length).toBe(woz.length)
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(isFluxTrack(ds, 8)).toBe(false)
  expect(ds.isWriteProtected).toBe(false)
})

// As in AppleWin: a FLUX chunk that cannot be played is ignored, and the file
// plays its TMAP bit tracks with its own write protection.
test("a bad FLUX chunk is ignored and the file plays its TMAP", () => {
  const errors = jest.spyOn(workerMessages, "passErrorMsg")
  const warnings = jest.spyOn(console, "warn").mockImplementation(() => undefined)
  const playsTmap = (woz: Uint8Array) => {
    const ds = emptyFloppy("bad.woz")
    expect(decodeDiskData(ds, woz).length).toBe(woz.length)
    expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
    expect(isFluxTrack(ds, 8)).toBe(false)
    expect(ds.trackStart[8]).toBeGreaterThan(0)
    expect(ds.isWriteProtected).toBe(false)
  }
  const cases: Array<[string, (w: Uint8Array) => void]> = [
    ["no FLUX id", w => { w[512 * (w[66] | (w[67] << 8))] = 0x58 }],
    ["empty track", w => { const t = 256 + 800; w[t + 4] = w[t + 5] = w[t + 6] = w[t + 7] = 0 }],
    ["past the end", w => { const t = 256 + 800; w[t + 6] = 0x7F }],
    ["3.5 inch", w => { w[21] = 2 }],
    ["TRKS index past the table", w => { w[512 * (w[66] | (w[67] << 8)) + 8 + 8] = 160 }],
    ["no flux time", w => {
      const t = 256 + 800
      w[t + 4] = 1; w[t + 5] = w[t + 6] = w[t + 7] = 0
      w[512 * ((w[t + 1] << 8) + w[t])] = 0
    }],
  ]
  for (const [, spoil] of cases) {
    const woz = wozWithFlux(encodeFlux(Array(100).fill(32)), 8)
    spoil(woz)
    playsTmap(woz)
  }
  // A track that ends in a 255 run
  const flux = encodeFlux(Array(100).fill(32))
  flux[flux.length - 1] = 255
  playsTmap(wozWithFlux(flux, 8))
  expect(errors).not.toHaveBeenCalled()
  expect(warnings).toHaveBeenCalledTimes(7)
  expect(String(warnings.mock.calls[6][0])).toMatch(/FLUX chunk ignored \(.*ends inside an interval\), using TMAP/)
})

test("a FLUX map with no tracks is not flux", () => {
  const woz = wozWithFlux(encodeFlux(Array(100).fill(32)), 8)
  woz[512 * (woz[66] | (woz[67] << 8)) + 8 + 8] = 255
  const ds = emptyFloppy("noflux.woz")
  expect(decodeDiskData(ds, woz).length).toBe(woz.length)
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(ds.isWriteProtected).toBe(false)
})

// The UI locks write protect only on what the worker plays as flux.
test("the UI is told flux only when the FLUX chunk plays", () => {
  const sentIsFlux = (woz: Uint8Array) => {
    const passDriveProps = jest.spyOn(workerMessages, "passDriveProps")
    expect(doSetEmuDriveNewData({
      index: 2,
      hardDrive: false,
      drive: 1,
      filename: "f.woz",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: woz,
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    })).toBe(true)
    const sent = passDriveProps.mock.calls.filter(c => c[0].index === 2).pop()
    passDriveProps.mockRestore()
    return sent?.[0].isFlux
  }
  const flux = encodeFlux(Array(100).fill(32))
  expect(sentIsFlux(wozWithFlux(flux, 8))).toBe(true)
  const bad = wozWithFlux(flux, 8)
  bad[512 * (bad[66] | (bad[67] << 8)) + 8 + 8] = 160   // TRKS index past the table
  jest.spyOn(console, "warn").mockImplementation(() => undefined)
  expect(sentIsFlux(bad)).toBe(false)
  const noTracks = wozWithFlux(flux, 8)
  noTracks[512 * (noTracks[66] | (noTracks[67] << 8)) + 8 + 8] = 255
  expect(sentIsFlux(noTracks)).toBe(false)
})

const bandits = readTestImage("Bandits HALF (speed test 20).woz")
const testBandits = bandits ? test : test.skip

testBandits("FLUX parse of Bandits HALF (speed test 20).woz matches its own FLUX map", () => {
  const woz = bandits as Uint8Array
  const ds = emptyFloppy("Bandits HALF (speed test 20).woz")
  expect(decodeDiskData(ds, woz).length).toBe(woz.length)
  expect(ds.fluxKind).toBe(FLUX_KIND.WOZ)
  expect(ds.isWriteProtected).toBe(true)
  // Walk the chunks independently of the decoder.
  let flux = -1
  let tmap = -1
  for (let p = 12; p + 8 <= woz.length; p += 8 + readLittleEndian32(woz, p + 4)) {
    const id = String.fromCharCode(...woz.slice(p, p + 4))
    if (id === "FLUX") flux = p + 8
    if (id === "TMAP") tmap = p + 8
  }
  expect(flux).toBe(512 * readLittleEndian16(woz, 66) + 8)
  let fluxCount = 0
  for (let q = 0; q < 160; q++) {
    const idx = woz[flux + q]
    if (idx === 255) {
      expect(isFluxTrack(ds, q)).toBe(false)
      if (woz[tmap + q] !== 255) expect(ds.trackStart[q]).toBeGreaterThan(0)
      continue
    }
    fluxCount++
    const trk = 256 + 8 * idx
    const start = 512 * readLittleEndian16(woz, trk)
    const nbytes = readLittleEndian32(woz, trk + 4)
    expect(ds.fluxLapStart[q]).toBe(start)
    expect(ds.fluxLapEnd[q]).toBe(start + nbytes)
    const seconds = fluxLoopTicks(woz, start, start + nbytes) * 125e-9
    expect(seconds).toBeGreaterThan(0.19)
    expect(seconds).toBeLessThan(0.21)
  }
  // Tracks 1.0 to 20.0 are flux in this image (q 4-80); the rest are bits.
  expect(fluxCount).toBe(77)
  expect(isFluxTrack(ds, 4)).toBe(true)
  expect(isFluxTrack(ds, 80)).toBe(true)
  expect(isFluxTrack(ds, 81)).toBe(false)
  expect(ds.trackStart[81]).toBeGreaterThan(0)
  expect(isFluxTrack(ds, 0)).toBe(false)
  expect(ds.trackStart[0]).toBeGreaterThan(0)
})
