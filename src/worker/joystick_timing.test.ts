import { memGetC000, memSet } from "./memory"
import { doSetMachineName, getCpuCyclesPerRefresh, isIigsSlowMode } from "./motherboard"
import { setIsTesting } from "./worker2main"
import {
  checkJoystickValues,
  resetJoystick,
  restoreJoystickSaveState,
  setGamepadValue,
  setJoystickClockSource,
  setJoystickCyclesPerRefresh,
  setJoystickSlowMode,
} from "./devices/joystick"

const PADDLE0 = 0xC064
const readPaddle0 = () => memGetC000(PADDLE0) & 0x80
// Half of MAX_TIMEOUT_CYCLES: the centred-stick midpoint in 1.020484 MHz cycles.
const MIDPOINT = 1418
// The IIgs 2.8 MHz Settings budget is 46727 cycles per refresh, not the classic
// 34060 of the 2 MHz mode. Raw counts that cross the calibrated midpoint at
// that rate are scaled by 17030 / 46727.
const GS_FAST_CYCLES_PER_REFRESH = 46727
const GS_FAST_MIDPOINT = Math.ceil(MIDPOINT * GS_FAST_CYCLES_PER_REFRESH / 17030)

afterEach(() => {
  setJoystickClockSource(null)
  setJoystickSlowMode(false)
  setJoystickCyclesPerRefresh(17030)
  restoreJoystickSaveState(undefined) // clear leftover timers between cases
})

// A centered stick (value 0) must cross the PDL midpoint after the same real
// 2.8 ms regardless of the emulated CPU speed. MAX_TIMEOUT_CYCLES is calibrated
// at 17030 cycles per refresh (1.020484 MHz); the raw diff has to be scaled.
describe("joystick paddle timing across CPU speed modes", () => {
  test("normal speed keeps the centered paddle high at the midpoint", () => {
    setJoystickCyclesPerRefresh(17030)
    setGamepadValue(0, 0)

    // The midpoint is half of 0.00278 * 1.020484e6, about 1418 cycles.
    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT - 1, 0)
    expect(readPaddle0()).toBe(0x80)

    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })

  test("2 MHz scales the measured raw cycles back to the calibrated rate", () => {
    setJoystickCyclesPerRefresh(34060)
    setGamepadValue(0, 0)

    // At 2 MHz 1418 raw cycles are only 709 calibrated cycles, so the paddle
    // must still read high; the unscaled path compared 1418 directly and fell
    // low after barely half the real timeout.
    resetJoystick(1000)
    checkJoystickValues(1000 + 1418, 0)
    expect(readPaddle0()).toBe(0x80)
  })

  test("slow speed likewise normalises the raw cycle counter", () => {
    setJoystickCyclesPerRefresh(8515)
    setGamepadValue(0, 0)

    // At half speed 709 raw cycles are 1418 calibrated cycles, so they are
    // already past the midpoint; the unscaled path fell high after twice the
    // real timeout.
    resetJoystick(1000)
    checkJoystickValues(1000 + 709, 0)
    expect(readPaddle0()).toBe(0)
  })
})

// The IIgs PDL timing must follow the rate the guest is actually executing at,
// not the Settings speed preference alone. The IWM disk bit-cell clock in
// memory.ts normalises through `isIigsSlowMode()` the same way: $C036 bit 7 = 0
// selects the nominal 1.020484 MHz clock even when Settings says 2.8 MHz. A
// classic title that drops the slow pin for copy-protected disk I/O then sees
// the paddle midpoint at 1418 raw cycles rather than twice that.
describe("$C036 slow mode drives the paddle execution rate", () => {
  test("slow mode uses the 1.02 MHz execution rate, not the Settings 2.8 MHz budget", () => {
    setJoystickCyclesPerRefresh(GS_FAST_CYCLES_PER_REFRESH) // Settings: IIgs 2.8 MHz
    setJoystickSlowMode(true) // the guest wrote $C036 bit 7 = 0
    setGamepadValue(0, 0)

    // A centred paddle crosses at 1418 raw cycles of the actual 1.020484 MHz
    // execution rate. The old Settings-only scale (17030 / 46727 ≈ 0.36) kept
    // this read high until 3891 raw cycles, i.e. full deflection.
    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT - 1, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })

  test("fast mode restores the Settings rate when $C036 bit 7 is set again", () => {
    setJoystickCyclesPerRefresh(GS_FAST_CYCLES_PER_REFRESH)
    setJoystickSlowMode(false)
    setGamepadValue(0, 0)

    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(1000 + GS_FAST_MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })

  test("a live clock source tracks slow mode across a mid-execution $C036 write", () => {
    const rate = { cyclesPerRefresh: GS_FAST_CYCLES_PER_REFRESH, slowMode: false }
    setJoystickClockSource(() => rate)
    setGamepadValue(0, 0)

    // Fast mode: the 2.8 MHz Settings budget shrinks the apparent raw diff.
    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(1000 + GS_FAST_MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)

    // $C036 bit 7 = 0: the same raw count now means the real 1.020484 MHz
    // execution rate. This is the value the provider sees the moment the guest
    // writes the register, without the run loop having to call a setter.
    // The 2.8 MHz pulse started at 1000 expires at 1000 + GS_FAST_MIDPOINT
    // (3891), so the strobe has to come after that to re-arm the axis.
    rate.slowMode = true
    resetJoystick(6000)
    checkJoystickValues(6000 + MIDPOINT - 1, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(6000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)

    // Back to fast mode: the paddle scale follows the live Settings rate. The
    // slow-mode pulse at 6000 expired 1418 raw cycles later.
    rate.slowMode = false
    resetJoystick(11000)
    checkJoystickValues(11000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(11000 + GS_FAST_MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })

  test("the live source wins over the fixed fall-back and re-reads Settings changes", () => {
    const rate = { cyclesPerRefresh: GS_FAST_CYCLES_PER_REFRESH, slowMode: false }
    setJoystickClockSource(() => rate)
    setJoystickCyclesPerRefresh(17030)

    // The source's 2.8 MHz budget is authoritative over the fall-back.
    resetJoystick(4000)
    checkJoystickValues(4000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)

    // A Settings switch to normal speed while $C036 stays fast makes the raw
    // count calibrated without any extra setter call. The 2.8 MHz pulse from
    // 4000 is only re-armable after its scaled expiry at 4000 + GS_FAST_MIDPOINT.
    rate.cyclesPerRefresh = 17030
    resetJoystick(9000)
    checkJoystickValues(9000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })
})

// Root integration pin. This test fails until motherboard.ts registers the
// live source in doSetMachineName, after cpuCyclesPerRefresh is set:
//   setJoystickClockSource(() => ({
//     cyclesPerRefresh: cpuCyclesPerRefresh,
//     slowMode: isGSMachine(machineName) && isIigsSlowMode(),
//   }))
// It drives the real $C036 soft-switch write path in memory.ts through a
// machine reset, not the synthetic provider used by the unit tests below.
describe("motherboard integration registers the live execution rate", () => {
  test("doSetMachineName + $C036 writes drive paddle timing", () => {
    setIsTesting()
    doSetMachineName("APPLE2GS")
    expect(getCpuCyclesPerRefresh()).toBe(GS_FAST_CYCLES_PER_REFRESH)
    setGamepadValue(0, 0)

    // Fast mode: the 2.8 MHz Settings budget shrinks 1418 raw cycles below the
    // calibrated midpoint; the scaled raw crossing is GS_FAST_MIDPOINT.
    expect(isIigsSlowMode()).toBe(false)
    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(1000 + GS_FAST_MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)

    // The guest writes $C036 bit 7 = 0: the source reports slow mode on the
    // very next paddle read, so a centred paddle crosses at 1418 raw cycles.
    // The fast pulse from 1000 expires at 1000 + GS_FAST_MIDPOINT.
    memSet(0xC036, 0)
    expect(isIigsSlowMode()).toBe(true)
    resetJoystick(6000)
    checkJoystickValues(6000 + MIDPOINT - 1, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(6000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)

    // Bit 7 set back to 1 restores the Settings budget again.
    memSet(0xC036, 0x80)
    expect(isIigsSlowMode()).toBe(false)
    resetJoystick(11000)
    checkJoystickValues(11000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0x80)
    checkJoystickValues(11000 + GS_FAST_MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
  })
})

// The NE558 is four one-shots behind one shared trigger line. A strobe while a
// timer is still running must not restart that axis, and each axis keeps its
// own expiry (gssquared arm_paddle_axis / game_input_trigger[4]).
describe("per-axis one-shot timers", () => {
  const PADDLE2 = 0xC066
  const readPaddle = (addr: number) => memGetC000(addr) & 0x80

  test("a second strobe inside a running pulse does not restart it", () => {
    setJoystickCyclesPerRefresh(17030)
    setGamepadValue(0, 0)

    resetJoystick(1000)
    checkJoystickValues(1000 + 1000, 0)
    expect(readPaddle0()).toBe(0x80) // still running

    // The old model restarted the shared start here, so reading 1000 cycles
    // after the strobe stayed high; a real 558 has already counted out 2000.
    resetJoystick(2000)
    checkJoystickValues(3000, 0)
    expect(readPaddle0()).toBe(0)
  })

  test("a strobe after the pulse expired arms the axis again", () => {
    setJoystickCyclesPerRefresh(17030)
    setGamepadValue(0, 0)

    resetJoystick(1000)
    checkJoystickValues(1000 + MIDPOINT, 0)
    expect(readPaddle0()).toBe(0)
    resetJoystick(1000 + MIDPOINT + 1)
    checkJoystickValues(1000 + MIDPOINT + 1 + MIDPOINT - 1, 0)
    expect(readPaddle0()).toBe(0x80)
  })

  test("each axis runs from its own start instant", () => {
    setJoystickCyclesPerRefresh(17030)
    setGamepadValue(0, 0) // axis 0: centred, 1418 cycles
    setGamepadValue(2, 1) // axis 2: full deflection, 2836 cycles

    resetJoystick(1000)
    // 2900: axis 0 has expired, axis 2 (2836) still runs.
    checkJoystickValues(2900, 0)
    expect(readPaddle0()).toBe(0)
    expect(readPaddle(PADDLE2)).toBe(0x80)

    // The strobe re-arms only axis 0; axis 2 keeps its 1000 start.
    resetJoystick(2500)
    checkJoystickValues(3900, 0)
    expect(readPaddle0()).toBe(0x80) // 2500 + 1400 < 1418
    expect(readPaddle(PADDLE2)).toBe(0) // 3900 - 1000 = 2900 > 2836
  })
})
