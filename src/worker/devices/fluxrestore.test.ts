// Save states from before flux support (a DriveState with no flux fields),
// and snapshots taken with an A2R3 mounted (its data left out), restored onto
// whatever is mounted now. Each scenario loads the drive modules fresh, so
// the module-level read state of diskdata.ts starts the same every time.
import { convertdsk2woz } from "../../common/convertdsk2woz"
import { FLUX_KIND } from "../../common/utility"
import { buildA2R3, fluxCursor, fluxLandWalk, lapCapture, lcg } from "./fluxtest_utils"

type Mods = {
  drive: typeof import("./drivestate"),
  disk: typeof import("./diskdata"),
  flux: typeof import("./fluxtrack"),
  cpu: typeof import("../instructions"),
}

const fresh = (): Mods => {
  let mods: Mods | null = null
  jest.isolateModules(() => {
    jest.requireActual<typeof import("../worker2main")>("../worker2main").setIsTesting()
    mods = {
      drive: jest.requireActual("./drivestate"),
      disk: jest.requireActual("./diskdata"),
      flux: jest.requireActual("./fluxtrack"),
      cpu: jest.requireActual("../instructions"),
    }
  })
  return mods as unknown as Mods
}

// The fields flux support added to DriveState.
const FLUX_FIELDS = ["fluxKind", "fluxPsPerTick", "fluxLapStart", "fluxLapEnd", "fluxRevCycles",
  "fluxLoopCycles", "fluxByte", "fluxTicks", "fluxIntervalEnd", "fluxCycle", "fluxIntervalStart", "fluxIntervalLength",
  "fluxBitsInInterval", "fluxBitIndex"]

// A save state as it was written before flux support.
const toOldFormat = (state: DriveSaveState): DriveSaveState => {
  const old = JSON.parse(JSON.stringify(state)) as DriveSaveState
  for (const ds of old.driveState as Array<Record<string, unknown>>) {
    for (const f of FLUX_FIELDS) delete ds[f]
  }
  return old
}

const copyOf = (state: DriveSaveState) => JSON.parse(JSON.stringify(state)) as DriveSaveState

const mount = (m: Mods, filename: string, diskData: Uint8Array) => m.drive.doSetEmuDriveNewData({
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

const rnd = lcg(2024)
const dsk = new Uint8Array(143360).map(() => Math.floor(rnd() * 256))
const woz = convertdsk2woz(dsk, false)

const lapA = Array.from({ length: 3000 }, () => 28 + Math.floor(rnd() * 70))
const lapB = Array.from({ length: 2600 }, () => 30 + Math.floor(rnd() * 80))
const a2r = buildA2R3([lapCapture(0, lapA, 3), lapCapture(4, lapB, 3)])
const otherA2r = buildA2R3([lapCapture(0, lapB, 2), lapCapture(4, lapA, 2)])

const hash = (d: Uint8Array) => d.reduce((a, b) => (a * 31 + b) >>> 0, 7)

const highBytes = (trace: number[]) => trace.filter((v, i) => i % 3 === 0 && (v & 0x80)).length

// Drive the slot 6 soft switches from cycle `start`, with the head at q 0
// and phase 0: reads, a seek in to q 4 and back, and a few writes. Returns
// every read byte with the head's position after it.
const play = (m: Mods, start: number) => {
  const sw = (n: number, value = -1) => m.disk.handleDriveSoftSwitches(0xC0E0 + n, value)
  const steps = lcg(77)
  const trace: number[] = []
  let t = start
  m.cpu.setCycleCount(t)
  sw(9)                                  // motor on
  sw(1)                                  // phase 0 on: hold q 0
  for (let i = 0; i < 30000; i++) {
    t += 3 + Math.floor(steps() * 30)
    m.cpu.setCycleCount(t)
    if (i === 10000) { sw(3); sw(0); sw(5); sw(2) }         // q 0 to q 4
    if (i === 20000) { sw(3); sw(4); sw(1); sw(2) }         // q 4 to q 0
    if (i === 25000) {
      sw(0xF, 0xFF)                                         // write mode
      for (let w = 0; w < 50; w++) {
        t += 32
        m.cpu.setCycleCount(t)
        sw(0xD, 0xD5 + (w & 1))
      }
      sw(0xE)                                               // read mode
    }
    const ds = m.drive.getCurrentDriveState()
    trace.push(sw(0xC), ds.trackLocation, ds.quarterTrack)
  }
  return trace
}

const parkAtZero = (ds: DriveState) => {
  ds.quarterTrack = 0
  ds.prevQuarterTrack = 0
  ds.currentPhase = 0
}

// A full save state of the WOZ in drive 1 with the head parked at q 0.
const savedWoz = () => {
  const m = fresh()
  expect(mount(m, "bits.woz", woz)).toBe(true)
  const ds = m.drive.getCurrentDriveState()
  parkAtZero(ds)
  ds.trackLocation = 1234
  return m.drive.getDriveSaveState(true)
}

test("a pre-flux save state restores a bit-track drive exactly as the same state saved now", () => {
  const now = savedWoz()
  const old = toOldFormat(now)
  expect(Object.keys(old.driveState[2])).not.toContain("fluxKind")
  expect(Object.keys(now.driveState[2])).toContain("fluxKind")
  // A bit-track disk saves no flux tables.
  expect((now.driveState[2] as DriveState).fluxLapEnd).toEqual([])

  const a = fresh()
  a.drive.restoreDriveSaveState(copyOf(now))
  const traceNow = play(a, 5000)

  const b = fresh()
  expect(() => b.drive.restoreDriveSaveState(old)).not.toThrow()
  const ds = b.drive.getCurrentDriveState()
  // The flux fields come back as the defaults: no flux tracks.
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(ds.fluxPsPerTick).toBe(0)
  for (const f of ["fluxLapStart", "fluxLapEnd", "fluxRevCycles", "fluxLoopCycles"] as const) {
    expect(ds[f]).toEqual([])
  }
  expect(fluxCursor(ds)).toEqual({ fluxByte: 0, fluxTicks: 0, fluxIntervalEnd: 0, fluxCycle: 0,
    fluxIntervalStart: 0, fluxIntervalLength: 0, fluxBitsInInterval: 0, fluxBitIndex: 0 })
  expect(ds.trackLocation).toBe(1234)
  expect(ds.isWriteProtected).toBe(false)
  const traceOld = play(b, 5000)

  expect(traceOld).toEqual(traceNow)
  // Reads gave nibbles, and the writes landed on the disk the same way.
  expect(highBytes(traceOld)).toBeGreaterThan(1000)
  expect(b.drive.getCurrentDriveState().diskHasChanges).toBe(true)
  expect(hash(b.drive.getCurrentDriveData())).toBe(hash(a.drive.getCurrentDriveData()))
  expect(hash(b.drive.getCurrentDriveData())).not.toBe(hash(woz))
})

test("a pre-flux save state restored over a mounted A2R3 puts the bit-track disk back", () => {
  const old = toOldFormat(savedWoz())
  const m = fresh()
  expect(mount(m, "flux.a2r", a2r)).toBe(true)
  expect(m.drive.getCurrentDriveState().fluxKind).toBe(FLUX_KIND.A2R3)
  expect(() => m.drive.restoreDriveSaveState(old)).not.toThrow()
  const ds = m.drive.getCurrentDriveState()
  expect(ds.filename).toBe("bits.woz")
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(ds.fluxLapEnd).toEqual([])
  expect(highBytes(play(m, 5000))).toBeGreaterThan(1000)
})

// A time-travel snapshot taken while the A2R3 is playing.
const a2rSnapshot = (m: Mods) => {
  expect(mount(m, "flux.a2r", a2r)).toBe(true)
  parkAtZero(m.drive.getCurrentDriveState())
  play(m, 1000)
  const snap = m.drive.getDriveSaveState(false)
  expect(snap.driveData[2]).toBe("")
  expect((snap.driveState[2] as DriveState).fluxKind).toBe(FLUX_KIND.A2R3)
  return copyOf(snap)
}

test("an A2R3 snapshot restored with the same A2R3 mounted plays on from the saved cursor", () => {
  const m = fresh()
  const snap = a2rSnapshot(m)
  const saved = snap.driveState[2] as DriveState
  const dd = m.drive.getCurrentDriveData()
  play(m, m.cpu.s6502.cycleCount + 100)
  expect(fluxCursor(m.drive.getCurrentDriveState())).not.toEqual(fluxCursor(saved))
  expect(() => m.drive.restoreDriveSaveState(copyOf(snap))).not.toThrow()
  const ds = m.drive.getCurrentDriveState()
  expect(m.drive.getCurrentDriveData()).toBe(dd)
  expect(ds.fluxKind).toBe(FLUX_KIND.A2R3)
  expect(ds.isWriteProtected).toBe(true)
  expect(fluxCursor(ds)).toEqual(fluxCursor(saved))
  // The seek checkpoints were rebuilt for it: landing matches the walk.
  for (const q of [0, 4]) {
    for (const frac of [0, 0.25, 0.5, 0.999]) {
      const a = { ...ds }
      const b = { ...ds }
      m.flux.fluxLand(a, dd, q, frac)
      fluxLandWalk(b, dd, q, frac, m.flux)
      expect(fluxCursor(a)).toEqual(fluxCursor(b))
    }
  }
  expect(highBytes(play(m, m.cpu.s6502.cycleCount + 100))).toBeGreaterThan(1000)
  // Read only: the writes in play() left the file as it was.
  expect(hash(dd)).toBe(hash(a2r))
})

test("an A2R3 snapshot restored with a different disk mounted keeps that disk", () => {
  // A bit-track WOZ now in the drive.
  const m = fresh()
  const snap = a2rSnapshot(m)
  expect(mount(m, "bits.woz", woz)).toBe(true)
  const dd = m.drive.getCurrentDriveData()
  expect(() => m.drive.restoreDriveSaveState(copyOf(snap))).not.toThrow()
  let ds = m.drive.getCurrentDriveState()
  expect(ds.filename).toBe("bits.woz")
  expect(m.drive.getCurrentDriveData()).toBe(dd)
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
  expect(ds.fluxLapEnd).toEqual([])
  parkAtZero(ds)
  expect(highBytes(play(m, m.cpu.s6502.cycleCount + 100))).toBeGreaterThan(1000)

  // Another A2R3 now in the drive.
  const n = fresh()
  const snap2 = a2rSnapshot(n)
  expect(mount(n, "other.a2r", otherA2r)).toBe(true)
  const other = n.drive.getCurrentDriveData()
  const otherTable = [...n.drive.getCurrentDriveState().fluxLapEnd]
  expect(() => n.drive.restoreDriveSaveState(copyOf(snap2))).not.toThrow()
  ds = n.drive.getCurrentDriveState()
  expect(ds.filename).toBe("other.a2r")
  expect(n.drive.getCurrentDriveData()).toBe(other)
  expect(ds.fluxLapEnd).toEqual(otherTable)
  parkAtZero(ds)
  n.flux.fluxLand(ds, other, 0, 0)
  expect(highBytes(play(n, n.cpu.s6502.cycleCount + 100))).toBeGreaterThan(1000)
  expect(hash(other)).toBe(hash(otherA2r))

  // Nothing in the drive: there is no data to play the A2R3 from.
  const e = fresh()
  const snap3 = a2rSnapshot(e)
  expect(mount(e, "", new Uint8Array())).toBe(true)
  expect(() => e.drive.restoreDriveSaveState(copyOf(snap3))).not.toThrow()
  ds = e.drive.getCurrentDriveState()
  expect(e.drive.getCurrentDriveData().length).toBe(0)
  expect(ds.filename).toBe("")
  expect(ds.fluxKind).toBe(FLUX_KIND.NONE)
})
