import { doSetMachineName, doSetSpeedMode, getCpuCyclesPerRefresh } from "./motherboard"
import { setIsTesting } from "./worker2main"

// The UI must not post a speed before the machine name. That would mark the
// mode as an explicit user choice, so doSetMachineName could not apply the
// per-machine default and the IIgs ran at 1.02 MHz: its 3.5" driver cannot
// clock 500 kbit/s media from that budget and the ROM stopped at
// "Check startup device!". This file has its own module registry, so
// speedModeExplicit is still false when the first test runs.
describe("Default speed when the host never picked one", () => {
  beforeAll(() => {
    setIsTesting()
  })

  test("IIgs gets 2.8 MHz and the IIe 1.02 MHz", () => {
    doSetMachineName("APPLE2GS")
    expect(getCpuCyclesPerRefresh()).toBe(46727)

    doSetMachineName("APPLE2EE")
    expect(getCpuCyclesPerRefresh()).toBe(17030)
  })

  test("an explicit choice survives a machine switch", () => {
    doSetSpeedMode(0)
    doSetMachineName("APPLE2GS")
    expect(getCpuCyclesPerRefresh()).toBe(17030)
  })
})
