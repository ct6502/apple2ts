import { memGetC000 } from "./memory"
import {
  checkJoystickValues,
  resetJoystick,
  setGamepadValue,
  setJoystickCyclesPerRefresh,
} from "./devices/joystick"

const PADDLE0 = 0xC064
const readPaddle0 = () => memGetC000(PADDLE0) & 0x80

// A centered stick (value 0) must cross the PDL midpoint after the same real
// 2.8 ms regardless of the emulated CPU speed. MAX_TIMEOUT_CYCLES is calibrated
// at 17030 cycles per refresh (1.020484 MHz); the raw diff has to be scaled.
describe("joystick paddle timing across CPU speed modes", () => {
  afterEach(() => setJoystickCyclesPerRefresh(17030))

  test("normal speed keeps the centered paddle high at the midpoint", () => {
    setJoystickCyclesPerRefresh(17030)
    setGamepadValue(0, 0)

    // The midpoint is half of 0.00278 * 1.020484e6, about 1418 cycles.
    resetJoystick(1000)
    checkJoystickValues(1000 + 1417, 0)
    expect(readPaddle0()).toBe(0x80)

    resetJoystick(1000)
    checkJoystickValues(1000 + 1418, 0)
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
