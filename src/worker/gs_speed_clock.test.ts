import { doSetMachineName, doSetSpeedMode, doSetRunMode, doReset,
  resetCpuSpeedForTesting, getIigsVideoClock, getIigsFrameUnits } from "./motherboard"
import { memSet } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

// The GS video clock counts raw machine cycles; the Settings speed preference
// sets how many cycles fit in one refresh. `$C036` bit 7 still selects the
// speed-shadow latch, but a guest that drops the bit to slow mode for
// copy-protected disk I/O must not rescale the video clock (and therefore the
// disk bit cell) back to 1.024 MHz. Old regression: `frameCycles / 17030`
// multiplied each cycle's video-clock worth, so a 2.8 MHz title in slow mode
// ran disk I/O at 1 MHz even though the host asked for 2.8 MHz.
describe("IIgs speed preference overrides $C036 slow mode", () => {
  test.each([0, 1, 2, 3])("mode %i keeps the refresh budget when $C036 is slow", (mode) => {
    jest.useFakeTimers()
    setIsTesting()
    try {
      doSetRunMode(RUN_MODE.PAUSED, false)
      doReset()
      resetCpuSpeedForTesting()
      doSetMachineName("APPLE2GS")
      doSetSpeedMode(mode)
      doSetRunMode(RUN_MODE.NEED_BOOT)
      doSetRunMode(RUN_MODE.RUNNING, false)
      jest.advanceTimersByTime(17)
      const before = getIigsVideoClock()
      const units = getIigsFrameUnits()
      memSet(0xC036, 0) // slow mode: bit 7 clear
      jest.advanceTimersByTime(17)
      const after = getIigsVideoClock()
      expect(after).toBeGreaterThan(before)
      expect((after - before) / units).toBeLessThan(2)
    } finally {
      doSetRunMode(RUN_MODE.PAUSED, false)
      doReset()
      resetCpuSpeedForTesting()
      jest.useRealTimers()
    }
  }, 900000)
})
