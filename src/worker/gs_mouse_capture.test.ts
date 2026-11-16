import { doSetMachineName } from "./motherboard"
import { MouseCardEvent, resetMouse, resetADBTracking } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { setIsTesting } from "./worker2main"

// F1 captures the mouse: the host pointer is locked and every mousemove arrives
// as movementX/Y, which the UI forwards with `relative: true`. The IIgs ADB mouse
// is a relative device, so those counts must go straight to queueMouse - neither
// the Event Manager closed loop (there is no absolute pointer to steer toward)
// nor dead reckoning (which would treat the fraction as a screen position and
// stop at the edges).
const adb = iigsADB

const disp = (b: number) => {
  const v = b & 0x7f
  return v >= 0x40 ? v - 0x80 : v
}

beforeEach(() => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  resetMouse()
  resetADBTracking()
  adb.reset()
})

test("captured motion is injected as relative counts", () => {
  MouseCardEvent({ x: 40 / 639, y: 0, buttons: -1, relative: true })
  let regs = adb.getMouseRegisters()
  expect(disp(regs.x)).toBe(40)
  expect(regs.y & 0x7f).toBe(0)

  adb.readMouseData()
  adb.readMouseData()

  MouseCardEvent({ x: -40 / 639, y: 0, buttons: -1, relative: true })
  regs = adb.getMouseRegisters()
  expect(disp(regs.x)).toBe(-40)
})

test("a captured move past the edge keeps queueing instead of clamping", () => {
  // Two screen-widths of motion in one event: the ADB report carries only +/-63
  // and the rest must stay queued, not be clipped to the screen.
  MouseCardEvent({ x: 2, y: 0, buttons: -1, relative: true })
  let reports = 0
  let total = 0
  while (adb.hasMouseData() && reports < 100) {
    total += disp(adb.readMouseData())
    adb.readMouseData()
    reports++
  }
  expect(total).toBe(2 * 639)
})

test.each([-1, 1])("captured bursts preserve every %i-count move until the guest reads them", (direction) => {
  for (let i = 0; i < 8; i++) {
    MouseCardEvent({ x: direction / 639, y: direction * 2 / 399, buttons: -1, relative: true })
  }
  let x = 0
  let y = 0
  while (adb.hasMouseData()) {
    x += disp(adb.readMouseData())
    y += disp(adb.readMouseData())
  }
  expect({ x, y }).toEqual({ x: direction * 8, y: direction * 8 })
})

test("captured motion arriving between X and Y preserves the report pair", () => {
  MouseCardEvent({ x: 12 / 639, y: 20 / 399, buttons: -1, relative: true })
  expect(disp(adb.readMouseData())).toBe(12)
  MouseCardEvent({ x: -4 / 639, y: -12 / 399, buttons: -1, relative: true })
  expect(disp(adb.readMouseData())).toBe(10)
  expect(disp(adb.readMouseData())).toBe(-4)
  expect(disp(adb.readMouseData())).toBe(-6)
  expect(adb.hasMouseData()).toBe(false)
})

test("leaving capture does not inject the captured distance as a jump", () => {
  // Absolute mode establishes a dead-reckoning baseline at the centre.
  MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
  MouseCardEvent({ x: 400 / 639, y: 0, buttons: -1, relative: true })
  while (adb.hasMouseData()) {
    adb.readMouseData()
    adb.readMouseData()
  }
  // Back in absolute mode the next event only re-seeds the baseline; the motion
  // performed while captured must not be replayed as one delta.
  MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
  expect(adb.hasMouseData()).toBe(false)
})
