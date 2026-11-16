import { doSetMachineName, doSetRunMode, getExternalMachineState } from "./motherboard"
import { getShr } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// TimePilot GS draws against the raster: gameProcessThings erases every thing
// whose old bounding box is above zScanLine and then redraws it, and at wrap it
// runs one forced pass with zScanLine past the bottom. So the SHR window only
// holds a complete picture in the short gap before the beam reaches the top -
// which is exactly where an end-of-refresh snapshot lands. Measured below, the
// cloud layer (colour 1 and its interlace partner 9) then disappears from whole
// bands of scanlines on a large share of frames: that is the flicker, and a real
// IIgs never showed it because the VGC latches each line as it scans it
// (gssquared VideoScannerIIgs.cpp). captureShrBeamLine() reproduces that, so the
// two buffers can be compared over the same frames.
const TIMEPILOT = process.env.TIMEPILOT_IMG || "C:\\dev\\emu\\ap2\\DISKS\\timepilot_gs_v1.6.po"
// The game reaches play at ~frame 700; the cloud bands are stable from 1550 on.
const PLAY_START = Number(process.env.TIMEPILOT_FRAMES || 1550)
const SAMPLES = Number(process.env.TIMEPILOT_SAMPLES || 200)

const advance = (n: number) => { for (let i = 0; i < n; i++) jest.advanceTimersByTime(17) }

const mount = () => doSetEmuDriveNewData({
  index: 0, hardDrive: true, drive: 1, filename: "timepilot_gs_v1.6.po", status: "",
  motorRunning: false, diskHasChanges: false, isWriteProtected: false,
  diskData: new Uint8Array(fs.readFileSync(TIMEPILOT)), lastAppleWriteTime: 0,
  cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
} as DriveProps)

// Scanlines that actually show cloud colour. The flicker is a whole band going
// blank, so counting rows separates it from ordinary pixel churn far better than
// a byte total does.
const cloudRows = (shr: Uint8Array): number => {
  let rows = 0
  for (let y = 0; y < 200; y++) {
    for (let i = 0; i < 160; i++) {
      const b = shr[y * 160 + i]
      const lo = b & 15
      const hi = b >> 4
      if (lo === 1 || lo === 9 || hi === 1 || hi === 9) {
        rows++
        break
      }
    }
  }
  return rows
}

const stats = (rows: number[]) => {
  const sorted = rows.slice().sort((a, b) => a - b)
  return {
    min: sorted[0],
    median: sorted[Math.floor(sorted.length / 2)],
    mean: rows.reduce((a, b) => a + b, 0) / rows.length,
    // Biggest single-frame loss of cloud rows: the flicker is a drop, not an offset.
    maxDrop: Math.max(0, ...rows.slice(1).map((r, i) => rows[i] - r)),
  }
}

const PLANE_BYTES = new Set([0x11, 0x14, 0x41, 0x44, 0x4f, 0x66, 0x6f, 0xf4])
// TimePilot's plane sprite sits around rows 92-104, cols 40-72 at this scene.
const planePixels = (shr: Uint8Array): number => {
  let count = 0
  for (let y = 92; y < 110; y++) {
    for (let i = 40; i < 72; i++) {
      if (PLANE_BYTES.has(shr[y * 160 + i])) count++
    }
  }
  return count
}

test("timepilot: the beam-captured picture keeps the cloud layer", () => {
  jest.useFakeTimers()
  setIsTesting()
  doSetMachineName("APPLE2GS")
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  advance(60)
  expect(mount()).toBe(true)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)

  const displayed: number[] = []
  const snapshot: number[] = []
  const shownPlane: number[] = []
  const rawPlane: number[] = []
  let framesDiffering = 0
  for (let f = 0; f < PLAY_START + SAMPLES; f++) {
    // Hold the thrust key in bursts so the scene scrolls and the bands repaint.
    if (f >= 700 && (f - 700) % 90 === 0) {
      setKeyboardState({ isDown: true, key: 32, repeat: false })
      advance(3)
      setKeyboardState({ isDown: false, key: 32, repeat: false })
    }
    advance(1)
    if (f < PLAY_START) continue
    // The state's own shr buffer is what the UI blits, so measuring it covers the
    // whole path: the per-line capture in the run loop and posting it as the picture.
    const shown = getExternalMachineState().shr as Uint8Array
    const raw = getShr()
    displayed.push(cloudRows(shown))
    snapshot.push(cloudRows(raw))
    shownPlane.push(planePixels(shown))
    rawPlane.push(planePixels(raw))
    let differs = false
    for (let i = 0; i < 0x8000; i++) {
      if (shown[i] !== raw[i]) {
        differs = true
        break
      }
    }
    if (differs) framesDiffering++
  }

  const d = stats(displayed)
  const s = stats(snapshot)

  console.log("displayed stats", d, "snapshot stats", s, "framesDiffering", framesDiffering)
  console.log("shown plane", stats(shownPlane), "raw plane", stats(rawPlane),
    "shown zero frames", shownPlane.filter((n) => n === 0).length,
    "raw zero frames", rawPlane.filter((n) => n === 0).length)
  // The screen is what the beam captured, so the guest's own memory state at one
  // instant must not be what reaches the renderer.
  expect(framesDiffering).toBeGreaterThan(0)
  // No frame loses the cloud layer: every scanline band keeps painting.
  expect(d.min).toBeGreaterThanOrEqual(70)
  expect(d.mean).toBeGreaterThanOrEqual(88)
  expect(d.maxDrop).toBeLessThanOrEqual(26)
  // Keep the contrast honest: the raw snapshot really is the one that drops bands.
  expect(s.min).toBeLessThan(d.min)
  // Aircraft pixels survive the same late-sprite pass: the snapshot loses plane
  // pixels on more frames than the beam-captured picture, and a sprite erased by
  // a late mask cannot disappear from the display merely because its row was
  // captured. Measured: snapshot zeros 156/200 vs displayed 130/200.
  expect(shownPlane.filter((n) => n === 0).length)
    .toBeLessThan(rawPlane.filter((n) => n === 0).length)
  expect(stats(shownPlane).mean).toBeGreaterThan(stats(rawPlane).mean)
}, 900000)
