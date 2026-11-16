import { iigsADB } from "./iigs_adb"

// A press must be visible to the guest in the very next report it reads - not
// deferred behind unread reports, and never lost.
//
// The report layout is gssquared's ADB_Mouse::update_button_down(): register 0
// byte 0 carries the RIGHT button (button 1) in bit 7 and byte 1 carries the
// LEFT button (button 0) in bit 7. 0x80 = released, 0x00 = pressed. The IIgs
// ROM reads them apart (FF:9D31 "TYA / ROL A" takes LEFT from the Y byte,
// FF:9D33 "TXA / BMI" takes RIGHT from the X byte), so putting the same state
// in both bytes makes one physical click look like two button transitions -
// which GS/OS reads as a double click. That is why a single click used to open
// a Finder icon.
//
// Bits 6-0 of each byte are a seven-bit two's complement displacement. Motion
// and button state travel in the SAME report: on real ADB hardware the
// micro-controller composes the snapshot from live state at poll time (KEGS's
// adb_read_c024), and gssquared patches the waiting register's button bits on
// every event (ADB_Mouse::update_button_down).

const adb = iigsADB

// Read one full report the way the ROM's task does: the X byte from $C024,
// then the Y byte.
function readReport() {
  const x = adb.readMouseData()
  const y = adb.readMouseData()
  const disp = (b: number) => {
    const v = b & 0x7f
    return v >= 0x40 ? v - 0x80 : v
  }
  return {
    x: disp(x), y: disp(y),
    leftUp: (y & 0x80) !== 0,
    rightUp: (x & 0x80) !== 0,
    rawX: x, rawY: y,
  }
}

beforeEach(() => {
  adb.reset()
})

test("LEFT and RIGHT live in different bytes of register 0", () => {
  // Force a zero-motion report so the layout of both bytes is visible.
  adb.queueMouse(1, 1)
  const rest = readReport()
  expect(rest.rawX & 0x80).toBe(0x80)   // RIGHT released
  expect(rest.rawY & 0x80).toBe(0x80)   // LEFT released

  // Left press: byte 1 drops, byte 0 must stay released.
  adb.setMouseButton(0, true)
  const leftDown = readReport()
  expect(leftDown.leftUp).toBe(false)
  expect(leftDown.rightUp).toBe(true)

  // Left release, then right press: the other byte moves instead.
  adb.setMouseButton(0, false)
  readReport()
  adb.setMouseButton(1, true)
  const rightDown = readReport()
  expect(rightDown.leftUp).toBe(true)
  expect(rightDown.rightUp).toBe(false)
})

test("a press while a motion report is unread is visible in that report", () => {
  adb.queueMouse(10, 5)
  expect(adb.hasMouseData()).toBe(true)

  // Press now: waiting report's button bits reflect the press, the motion is
  // still delivered in the same snapshot (drag-like, exactly what real
  // hardware reports when the button is pressed on a moving mouse).
  adb.setMouseButton(0, true)

  const r = readReport()
  expect(r.x).toBe(10)
  expect(r.y).toBe(5)
  expect(r.leftUp).toBe(false)
})

test("a press with no pending motion produces a button-only report", () => {
  adb.setMouseButton(0, true)

  const r = readReport()
  expect(r.x).toBe(0)
  expect(r.y).toBe(0)
  expect(r.leftUp).toBe(false)
  // fully consumed: no stale report or button change keeps the IRQ line up
  expect(adb.hasMouseData()).toBe(false)
})

test("a natural click (press, poll, release) yields exactly two clean reports", () => {
  adb.setMouseButton(0, true)
  const down = readReport()
  expect(down.leftUp).toBe(false)

  // release comes after the guest consumed the press report
  adb.setMouseButton(0, false)
  const up = readReport()
  expect(up.x).toBe(0)
  expect(up.y).toBe(0)
  expect(up.leftUp).toBe(true)
  expect(adb.hasMouseData()).toBe(false)
})

test("a release while dragging keeps the motion and shows the release", () => {
  adb.setMouseButton(0, true)
  readReport() // consume the press

  adb.queueMouse(-20, -10)
  adb.setMouseButton(0, false)

  const r = readReport()
  expect(r.x).toBe(-20)
  expect(r.y).toBe(-10)
  expect(r.leftUp).toBe(true)
})

test("a click landing entirely between two guest polls does not wedge the line", () => {
  // down then up with no reads in between: on this snapshot model (like
  // KEGS/gssquared, both compute from live state) the guest can miss the
  // press, but no pending state may stay latched and hold the interrupt line.
  adb.setMouseButton(0, true)
  adb.setMouseButton(0, false)
  const r = readReport()
  expect(r.leftUp).toBe(true)
  expect(adb.hasMouseData()).toBe(false)
})

test("one left press latches one report, not two", () => {
  adb.setMouseButton(0, true)
  const first = readReport()
  expect(first.leftUp).toBe(false)
  // Consumed: nothing else may be waiting, or the ROM's task would dispatch a
  // second (identical) button event and GS/OS would see a double click.
  expect(adb.mouseReportPending()).toBe(false)
})
