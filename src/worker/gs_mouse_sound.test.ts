import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { memSet24 } from "./memory"
import { iigsADB } from "./iigs_adb"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { RUN_MODE } from "../common/utility"
import { setIsTesting, getSpeakerClickCount, resetSpeakerClickCount } from "./worker2main"

// The Apple IIgs has no mouse card: the mouse hangs off the ADB bus. Verify UI
// mouse events actually reach iigsADB (before this, MOUSEEVENT messages were
// only ever fed to the 6522 mouse card, so the Finder cursor never moved).
test("IIgs UI mouse events reach the ADB bus", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    // iigsADB is a module singleton, so clear any motion a previous test left.
    iigsADB.reset()

    const adb = iigsADB as unknown as {
      hasMouseData: () => boolean, readMouseData: () => number,
      getMouseRegisters: () => { x: number, y: number },
    }
    // Consume one full report: the X byte then the Y byte. Bits 6-0 are a
    // seven-bit two's complement displacement, so decode rather than mask.
    // The buttons are split: RIGHT lives in the X byte's bit 7, LEFT in the Y
    // byte's (gssquared ADB_Mouse::update_button_down).
    const readReport = () => {
      const x = adb.readMouseData()
      const y = adb.readMouseData()
      const disp = (b: number) => {
        const v = b & 0x7f
        return v >= 0x40 ? v - 0x80 : v
      }
      return {
        x: disp(x), y: disp(y),
        xNeg: (x & 0x40) !== 0, yNeg: (y & 0x40) !== 0,
        leftUp: (y & 0x80) !== 0, rightUp: (x & 0x80) !== 0,
      }
    }
    expect(adb.hasMouseData()).toBe(false)

    // First report only establishes the baseline - a delta from an unknown
    // origin would jump the pointer into a corner.
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
    expect(adb.hasMouseData()).toBe(false)

    // Moving right and down must produce a positive report for the OS to read.
    MouseCardEvent({ x: 0.6, y: 0.6, buttons: -1 })
    expect(adb.hasMouseData()).toBe(true)
    const fwd = readReport()
    expect(fwd.x).toBeGreaterThan(0)
    expect(fwd.y).toBeGreaterThan(0)
    expect(fwd.xNeg).toBe(false)
    expect(fwd.yNeg).toBe(false)
    expect(fwd.leftUp).toBe(true)

    // Moving back must produce the same displacement with the opposite sign.
    // The raw low six bits are the *complement* of a negative displacement,
    // not its magnitude: this is what the IIgs ROM's accumulator expects
    // (FF:9D44-FF:9D9E), and encoding |delta| there made the cursor climb
    // instead of going back.
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
    const back = readReport()
    expect(back.x).toBe(-fwd.x)
    expect(back.y).toBe(-fwd.y)
    expect(back.xNeg).toBe(true)
    expect(back.yNeg).toBe(true)

    // A button press has to register too: bit 7 of the LEFT byte clears while
    // the RIGHT byte keeps its released state.
    MouseCardEvent({ x: 0, y: 0, buttons: 0x10 })
    expect(adb.getMouseRegisters().y & 0x80).toBe(0x00)
    expect(adb.getMouseRegisters().x & 0x80).toBe(0x80)
    const down = readReport()
    expect(down.leftUp).toBe(false)
    expect(down.rightUp).toBe(true)
    MouseCardEvent({ x: 0, y: 0, buttons: 0x00 })
    expect(adb.getMouseRegisters().y & 0x80).toBe(0x80)
    expect(readReport().leftUp).toBe(true)

    // A reset drops the tracking baseline, so the next report only
    // re-establishes it instead of jumping the cursor into a corner.
    resetMouse()
    MouseCardEvent({ x: 0.9, y: 0.9, buttons: -1 })
    expect(adb.hasMouseData()).toBe(false)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})

// The IIgs $C020-$C04F range short-circuits the normal softswitch path in
// memSet24, so $C030 never reached the speaker unless it was handled
// explicitly - which is why the IIgs was silent.
test("IIgs $C030 speaker click reaches the audio output", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    // Stay PAUSED so the power-on self-test is not still driving $C030 while we
    // measure.
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetSpeakerClickCount()
    expect(getSpeakerClickCount()).toBe(0)
    // Toggle $C030 a handful of times, exactly as software does.
    for (let i = 0; i < 5; i++) memSet24(0xC030, i & 1)
    expect(getSpeakerClickCount()).toBe(5)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})

// KEGS conformance for the ADB mouse-off conditions (adb.c:1445).
//
//   if(((g_adb_mode & 0x2) != 0) || (g_mouse_dev_addr != g_mouse_ctl_addr)){
//           /* mouse is off, return 0, or mouse is not autopoll */
//           g_adb_mouse_valid_data = 0;
//           adb_clear_mouse_int();
//           return 0;
//   }
//
// apple2ts used to keep the mouse reporting regardless, because modes was
// tracked but never read and mouseAddr was a constant that could never differ
// from the controller's view.
test("the ADB mouse goes silent when the mode byte says mouse off", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doSetRunMode(RUN_MODE.PAUSED, false)
    iigsADB.reset()
    resetMouse()
    const adb = iigsADB as unknown as {
      hasMouseData: () => boolean, readMouseData: () => number,
    }
    const readReport = () => {
      const x = adb.readMouseData()
      const y = adb.readMouseData()
      const v = x & 0x7f
      return { x: v >= 0x40 ? v - 0x80 : v, y: y & 0x7f }
    }

    // Straight ahead: a movement produces a report.
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
    MouseCardEvent({ x: 0.6, y: 0.6, buttons: -1 })
    expect(adb.hasMouseData()).toBe(true)
    const forward = readReport()
    expect(forward.x).toBeGreaterThan(0)

    // $C026 command $04 with $02: set the ADB mode bit that disables the mouse.
    memSet24(0xC026, 0x04)
    memSet24(0xC026, 0x02)
    expect(adb.hasMouseData()).toBe(false)

    // And while it is off, a movement is not reported at all.
    MouseCardEvent({ x: 0.7, y: 0.7, buttons: -1 })
    expect(adb.hasMouseData()).toBe(false)
    expect(adb.readMouseData()).toBe(0)

    // $05 clears it again.
    memSet24(0xC026, 0x05)
    memSet24(0xC026, 0x02)
    expect(adb.hasMouseData()).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})

test("the ADB mouse goes silent when the configuration command moves it", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doSetRunMode(RUN_MODE.PAUSED, false)
    iigsADB.reset()
    resetMouse()
    const adb = iigsADB as unknown as {
      hasMouseData: () => boolean, readMouseData: () => number,
    }

    MouseCardEvent({ x: 0.5, y: 0.5, buttons: -1 })
    MouseCardEvent({ x: 0.6, y: 0.6, buttons: -1 })
    expect(adb.hasMouseData()).toBe(true)

    // $06 set configuration: byte 0 is the keyboard nibble in the low bits and
    // the mouse nibble in the high bits (KEGS adb_set_config). $34 says the
    // mouse is now at 3 and the keyboard at 4, which is where they already are.
    // $06 takes three parameter bytes; only the first moves the addresses.
    memSet24(0xC026, 0x06)
    memSet24(0xC026, 0x34)
    memSet24(0xC026, 0x00)
    memSet24(0xC026, 0x00)
    memSet24(0xC026, 0x00)
    memSet24(0xC026, 0x00)
    expect(adb.hasMouseData()).toBe(true)

    // $44 moves the mouse to address 4, which the physical mouse is not at.
    memSet24(0xC026, 0x06)
    memSet24(0xC026, 0x44)
    memSet24(0xC026, 0x00)
    memSet24(0xC026, 0x00)
    expect(adb.hasMouseData()).toBe(false)

    // Moving it back to 3 restores reporting.
    memSet24(0xC026, 0x06)
    memSet24(0xC026, 0x34)
    memSet24(0xC026, 0x00)
    memSet24(0xC026, 0x00)
    expect(adb.hasMouseData()).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
})