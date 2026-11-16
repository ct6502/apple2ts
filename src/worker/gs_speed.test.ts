import { doSetMachineName, doSetSpeedMode, getCpuCyclesPerRefresh, resetCpuSpeedForTesting } from "./motherboard"
import { setIsTesting } from "./worker2main"

describe("Apple IIgs Speed Modes", () => {
  beforeEach(() => {
    setIsTesting()
    resetCpuSpeedForTesting()
  })

  afterEach(() => {
    doSetMachineName("APPLE2EE")
    doSetSpeedMode(0)
    resetCpuSpeedForTesting()
  })

  test("Apple IIgs speed settings match required MHz rates", () => {
    doSetMachineName("APPLE2GS")

    // Normal (speedMode = 0) -> 1.02 MHz (17030 cycles/refresh)
    doSetSpeedMode(0)
    expect(getCpuCyclesPerRefresh()).toBe(17030)

    // 2MHz (speedMode = 1) -> 2.8 MHz (46727 cycles/refresh)
    doSetSpeedMode(1)
    expect(getCpuCyclesPerRefresh()).toBe(46727)

    // 3MHz (speedMode = 2) -> 7.1 MHz (118486 cycles/refresh)
    doSetSpeedMode(2)
    expect(getCpuCyclesPerRefresh()).toBe(118486)

    // Fast (speedMode = 3) -> 14.3 MHz (238640 cycles/refresh)
    doSetSpeedMode(3)
    expect(getCpuCyclesPerRefresh()).toBe(238640)

    // Warp (speedMode = 4) -> 24x unthrottled
    doSetSpeedMode(4)
    expect(getCpuCyclesPerRefresh()).toBe(408720)
  })

  test("Standard Apple IIe speed settings remain intact", () => {
    doSetMachineName("APPLE2EE")

    // Normal -> 1.02 MHz (17030)
    doSetSpeedMode(0)
    expect(getCpuCyclesPerRefresh()).toBe(17030)

    // 2 MHz -> 34060
    doSetSpeedMode(1)
    expect(getCpuCyclesPerRefresh()).toBe(34060)

    // 3 MHz -> 51090
    doSetSpeedMode(2)
    expect(getCpuCyclesPerRefresh()).toBe(51090)

    // Fast (4 MHz) -> 68120
    doSetSpeedMode(3)
    expect(getCpuCyclesPerRefresh()).toBe(68120)

    // Warp -> 408720
    doSetSpeedMode(4)
    expect(getCpuCyclesPerRefresh()).toBe(408720)
  })

  test("Switching machine recalculates speed automatically", () => {
    doSetMachineName("APPLE2EE")
    doSetSpeedMode(1) // 2 MHz on IIe = 34060
    expect(getCpuCyclesPerRefresh()).toBe(34060)

    doSetMachineName("APPLE2GS") // 2.8 MHz on IIgs = 46727
    expect(getCpuCyclesPerRefresh()).toBe(46727)

    doSetMachineName("APPLE2EE") // back to 34060
    expect(getCpuCyclesPerRefresh()).toBe(34060)
  })
})
