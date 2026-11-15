// Which drive bay takes a flux disk: A2R3 captures and 5.25" WOZ files with
// FLUX tracks are slot-6 media, never SmartPort (indices 0/1).
import { FLUX_KIND, getDefaultDiskDriveIndex, isHardDriveImage } from "../../common/utility"
import { decodeDiskData } from "./decodedisk"
import { doSetEmuDriveNewData, getCurrentDriveState, getHardDriveState } from "./drivestate"
import { setIsTesting } from "../worker2main"
import * as workerMessages from "../worker2main"
import { blankFluxDriveState, buildA2R3, encodeFlux, lapCapture, wozWithFlux } from "./fluxtest_utils"

beforeAll(() => setIsTesting())
afterEach(() => jest.restoreAllMocks())

const a2r = buildA2R3([lapCapture(0, Array<number>(400).fill(32), 2)], { resolution: 125000 })

const driveProps = (index: number, filename: string, diskData: Uint8Array): DriveProps => ({
  index,
  hardDrive: index <= 1,
  drive: index <= 1 ? index + 1 : index - 1,
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

test("an .a2r goes to the 5.25\" drive", () => {
  expect(isHardDriveImage("game.a2r", 4_000_000)).toBe(false)
  expect(getDefaultDiskDriveIndex("game.a2r", 4_000_000)).toBe(2)
})

test("an .a2r put in a SmartPort drive unforced goes to slot 6", () => {
  expect(doSetEmuDriveNewData(driveProps(0, "game.a2r", a2r))).toBe(true)
  expect(getCurrentDriveState().index).toBe(2)
  expect(getCurrentDriveState().filename).toBe("game.a2r")
  expect(getCurrentDriveState().fluxKind).toBe(FLUX_KIND.A2R3)
  expect(getHardDriveState(1).filename).not.toBe("game.a2r")
})

test("an A2R3 forced into a SmartPort drive is left out, as a WOZ is", () => {
  const passErrorMsg = jest.spyOn(workerMessages, "passErrorMsg")
  const ds = blankFluxDriveState(0)
  ds.hardDrive = true
  ds.fluxKind = FLUX_KIND.NONE
  ds.isWriteProtected = false
  ds.filename = "game.a2r"
  expect(decodeDiskData(ds, a2r, true).length).toBe(0)
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(ds.isWriteProtected).toBe(false)
  expect(passErrorMsg).not.toHaveBeenCalled()
})

// A 5.25" WOZ with FLUX tracks is large. It still goes in a slot-6 drive by
// its .woz suffix, both by default and when the UI forces the index, as a
// click on a drive, a cloud load or a URL parameter does.
test("a big 5.25\" FLUX WOZ goes in either slot-6 drive", () => {
  const woz = wozWithFlux(encodeFlux(Array(600000).fill(32)), 8)
  expect(woz.length).toBeGreaterThan(512 * 1024)
  expect(woz[21]).toBe(1)
  expect(getDefaultDiskDriveIndex("game.woz", woz.length)).toBe(2)
  for (const index of [2, 3]) {
    expect(doSetEmuDriveNewData(driveProps(index, "game.woz", woz), true)).toBe(true)
    expect(getCurrentDriveState().index).toBe(index)
    expect(getCurrentDriveState().filename).toBe("game.woz")
    expect(getCurrentDriveState().fluxKind).toBe(FLUX_KIND.WOZ)
  }
})
