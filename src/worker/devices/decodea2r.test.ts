import { ERROR_CODE, FLUX_KIND } from "../../common/utility"
import { decodeA2R3, decodeDiskData } from "./decodedisk"
import { fluxLoopTicks, fluxTicksToCycles, isFluxTrack } from "./fluxtrack"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"
import { blankFluxDriveState, buildA2R3, lapCapture, readLittleEndian16, readLittleEndian32,
  readTestImage } from "./fluxtest_utils"

beforeAll(() => setIsTesting())
afterEach(() => jest.restoreAllMocks())

const emptyFloppy = (filename = "test.a2r"): DriveState => {
  const ds = blankFluxDriveState(0)
  ds.fluxKind = FLUX_KIND.NONE
  ds.isWriteProtected = false
  ds.filename = filename
  return ds
}

// Load the file through decodeDiskData, which must refuse it, and return the
// reason the user is shown.
const refusal = (data: Uint8Array) => {
  const passErrorMsg = jest.spyOn(workerMessages, "passErrorMsg")
  passErrorMsg.mockClear()
  const ds = emptyFloppy()
  expect(decodeDiskData(ds, data).length).toBe(0)
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(passErrorMsg).toHaveBeenCalledTimes(1)
  const { message, code } = passErrorMsg.mock.calls[0][0]
  expect(code).toBe(ERROR_CODE.ERROR)
  return message.replace("Unable to load: test.a2r: ", "")
}

const lap = Array<number>(400).fill(32)   // 400 x 4 us

test("not an A2R3 returns false", () => {
  expect(decodeA2R3(emptyFloppy(), new Uint8Array(20000))).toBe(false)
})

test("A2R3 table: loop between the first and last marks, rev = mark 0 to mark 1", () => {
  const cap = lapCapture(8, lap, 2)
  const a2r = buildA2R3([cap], { resolution: 125000 })
  const ds = emptyFloppy()
  expect(decodeA2R3(ds, a2r)).toBe(true)
  expect(ds.fluxKind).toBe(FLUX_KIND.A2R3)
  expect(ds.isWriteProtected).toBe(true)
  expect(ds.maxQuarterTrack).toBe(8)
  expect(isFluxTrack(ds, 8)).toBe(true)
  expect(isFluxTrack(ds, 0)).toBe(false)
  // A location with no capture is an empty track.
  expect(ds.trackStart[0]).toBe(0)
  expect(ds.fluxLapEnd[8] - ds.fluxLapStart[8]).toBe(800)   // two laps of 400 bytes
  expect(ds.fluxRevCycles[8]).toBeCloseTo(fluxTicksToCycles(400 * 32, 125000), 6)
  expect(ds.fluxLoopCycles[8]).toBeCloseTo(fluxTicksToCycles(800 * 32, 125000), 6)
})

test("a location captured twice plays the capture with the most marks; ties keep the first", () => {
  const two = lapCapture(4, Array<number>(300).fill(40), 1)    // 2 marks
  const three = lapCapture(4, lap, 2)                           // 3 marks
  const ds = emptyFloppy()
  expect(decodeA2R3(ds, buildA2R3([two, three]))).toBe(true)
  expect(ds.fluxLapEnd[4] - ds.fluxLapStart[4]).toBe(800)
  const tieA = lapCapture(4, Array<number>(300).fill(40), 2)
  const tieB = lapCapture(4, lap, 2)
  const ds2 = emptyFloppy()
  expect(decodeA2R3(ds2, buildA2R3([tieA, tieB]))).toBe(true)
  expect(ds2.fluxLapEnd[4] - ds2.fluxLapStart[4]).toBe(600)
})

test("type 2 (bit stream) captures are skipped", () => {
  const ds = emptyFloppy()
  expect(decodeA2R3(ds, buildA2R3([{ ...lapCapture(4, lap, 2), type: 2 }, lapCapture(8, lap, 2)]))).toBe(true)
  expect(isFluxTrack(ds, 4)).toBe(false)
  expect(isFluxTrack(ds, 8)).toBe(true)
})

const good = lapCapture(4, lap, 2)

test.each([
  ["a 3.5 inch capture", buildA2R3([good], { driveType: 2 }), "not a 5.25\" A2R3 (INFO drive type)"],
  ["a resolution of 0", buildA2R3([good], { resolution: 0 }), "a resolution of 0"],
  ["a record that is not C or X", buildA2R3([good], { endByte: 0x5A }), "a capture record that is not 'C' or 'X'"],
  ["a location past 159", buildA2R3([{ ...good, location: 160 }]), "a location past quarter track 159 (160)"],
  ["fewer than 2 marks", buildA2R3([{ ...good, marks: [1] }]),
    "quarter track 4: fewer than 2 index marks, no whole lap"],
  ["a mark past the data", buildA2R3([{ ...good, marks: [1, 400 * 32 + 1, 999999] }]),
    "quarter track 4: an index mark past the end of its data"],
  ["marks that do not make a lap", buildA2R3([{ ...good, marks: [1, 2] }]),
    "quarter track 4: index marks that do not make a lap"],
  ["no captures", buildA2R3([]), "no captures at all"],
])("refuses %s", (_why, data, reason) => {
  expect(refusal(data)).toBe(reason)
})

test("a hard-sectored capture is refused", () => {
  const a2r = buildA2R3([lapCapture(4, lap, 2)])
  const info = 8 + 8
  expect(String.fromCharCode(...a2r.slice(info - 8, info - 4))).toBe("INFO")
  expect(decodeA2R3(emptyFloppy(), a2r)).toBe(true)
  a2r[info + 36] = 16   // 16 sector holes
  expect(refusal(a2r)).toBe("hard-sectored A2R3 captures are not supported")
})

test("RWCP chunks with different resolutions are refused; the same resolution plays", () => {
  // A second RWCP chunk, with its own capture, after the first file's chunks.
  const withSecond = (resolution: number) => {
    const first = buildA2R3([lapCapture(4, lap, 2)], { resolution: 125000 })
    const other = buildA2R3([lapCapture(8, lap, 2)], { resolution })
    const rwcp = 8 + 8 + 37
    expect(String.fromCharCode(...other.slice(rwcp, rwcp + 4))).toBe("RWCP")
    const len = 8 + readLittleEndian16(other, rwcp + 4)
    const out = new Uint8Array(first.length + len)
    out.set(first)
    out.set(other.subarray(rwcp, rwcp + len), first.length)
    return out
  }
  expect(refusal(withSecond(62500))).toBe("its RWCP chunks have different resolutions")
  const ds = emptyFloppy()
  expect(decodeA2R3(ds, withSecond(125000))).toBe(true)
  expect(isFluxTrack(ds, 4)).toBe(true)
  expect(isFluxTrack(ds, 8)).toBe(true)
  expect(ds.fluxPsPerTick).toBe(125000)
})

const chop = readTestImage("Choplifter param 3.a2r")
const testChop = chop ? test : test.skip

testChop("A2R3 parse of Choplifter param 3.a2r: 54 captures, 3 marks, 61111 ps", () => {
  const a2r = chop as Uint8Array
  const ds = emptyFloppy("Choplifter param 3.a2r")
  expect(decodeDiskData(ds, a2r)).toBe(a2r)   // played from the file itself
  expect(ds.fluxKind).toBe(FLUX_KIND.A2R3)
  expect(ds.fluxPsPerTick).toBe(61111)
  expect(ds.isWriteProtected).toBe(true)
  // Walk the records independently: 'C', type, location, mark count, marks,
  // data size, data.
  let record = 53 + 8 + 16
  let count = 0
  let maxLocation = 0
  while (a2r[record] === 0x43) {
    const location = readLittleEndian16(a2r, record + 2)
    const markCount = a2r[record + 4]
    const marks = Array.from({ length: markCount }, (_, i) => readLittleEndian32(a2r, record + 5 + 4 * i))
    const dataSize = readLittleEndian32(a2r, record + 5 + 4 * markCount)
    const dataOffset = record + 9 + 4 * markCount
    expect(markCount).toBe(3)
    expect(isFluxTrack(ds, location)).toBe(true)
    // The loop starts on the interval that holds mark 0: the ticks before
    // it are at most mark 0, and with that interval they pass it.
    const before = fluxLoopTicks(a2r, dataOffset, ds.fluxLapStart[location])
    expect(before).toBeLessThanOrEqual(marks[0])
    // ... and ends on the interval that holds the last mark.
    const toEnd = fluxLoopTicks(a2r, dataOffset, ds.fluxLapEnd[location])
    expect(toEnd).toBeLessThanOrEqual(marks[2])
    let i = ds.fluxLapEnd[location]
    let ticks = toEnd
    do { ticks += a2r[i] } while (a2r[i++] === 255)
    expect(ticks).toBeGreaterThan(marks[2])
    // One revolution is about 200 ms (300 rpm).
    const revSeconds = (marks[1] - marks[0]) * 61111e-12
    expect(revSeconds).toBeGreaterThan(0.19)
    expect(revSeconds).toBeLessThan(0.21)
    expect(ds.fluxRevCycles[location]).toBeCloseTo(fluxTicksToCycles(marks[1] - marks[0], 61111), 6)
    count++
    maxLocation = Math.max(maxLocation, location)
    record = dataOffset + dataSize
  }
  expect(a2r[record]).toBe(0x58)
  expect(count).toBe(54)
  expect(ds.maxQuarterTrack).toBe(maxLocation)
  expect(ds.maxQuarterTrack).toBe(136)
})
