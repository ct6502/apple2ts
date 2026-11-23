import { doSetMachineName, doSetSpeedMode, doSetRunMode, doReset,
  getIigsBeamFrameCount, getIigsBeamPos, getIigsVideoClock, setIigsBeamPosForTesting,
  resetCpuSpeedForTesting, iigsSpeedRegister, VIDEO_CYCLES_PER_FRAME,
  VIDEO_CYCLES_PER_LINE } from "./motherboard"
import { memGet24 } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

// The IIgs video counters are two views of ONE scan index (gssquared
// `VideoScannerII`: 65 video cycles per line, 262 lines per refresh). $C02E is
// the vertical counter, $C02F carries the horizontal counter plus bit 0 of the
// vertical one. Beam-racing code waits for a $C02E value and then reads $C02F to
// decide where in the line it landed - so both counters must agree about where
// the line starts.
//
// The old model rederived them from the CPU-cycle frame with different periods:
// the vertical rows used the VBL length (178.0 video cycles at 2.8 MHz) and the
// horizontal counter used the visible-line length (178.5). The phases drifted,
// and on a VBL row start the hcounter was nearly a full line behind, so a
// raster routine that caught a VBL row and then read $C02F found itself at the
// wrong end of the line. XMAS Demo's $43BC helper does exactly that, branching on
// $46-$4D, and spun forever with SHR off - the black screen after the title
// sequence.
describe("IIgs $C02E/$C02F share one scan index", () => {
  beforeEach(() => {
    setIsTesting()
    doSetMachineName("APPLE2GS")
  })

  afterEach(() => {
    resetCpuSpeedForTesting()
  })

  test("every one of the 262 rows starts a fresh horizontal counter", () => {
    // The row start has to restart the hcounter on *every* row, VBL rows
    // included: a raster routine that catches a VBL row must not find itself a
    // whole line into the counter.
    for (let line = 0; line < 262; line++) {
      setIigsBeamPosForTesting(line * VIDEO_CYCLES_PER_LINE)
      expect(memGet24(0xC02F) & 0x7f).toBe(0)
      // Seven video cycles into the line is the XMAS window: $C02F reads $46.
      setIigsBeamPosForTesting(line * VIDEO_CYCLES_PER_LINE + 7)
      expect(memGet24(0xC02F) & 0x7f).toBe(0x46)
      setIigsBeamPosForTesting(line * VIDEO_CYCLES_PER_LINE + 7 + 7)
      expect(memGet24(0xC02F) & 0x7f).toBe(0x4d)
      setIigsBeamPosForTesting(line * VIDEO_CYCLES_PER_LINE + 64)
      expect(memGet24(0xC02F) & 0x7f).toBe(0x7f)
    }
  })

  test("$C02E walks 262 rows: VBL pairs, the $7D-$7F wrap, then the visible rows", () => {
    const rows: number[] = []
    for (let line = 0; line < 262; line++) {
      setIigsBeamPosForTesting(line * VIDEO_CYCLES_PER_LINE + 1)
      rows.push(memGet24(0xC02E))
    }
    // $C02E is vcounter >> 1, so each value covers two scanlines. The last six
    // VBL rows wrap to $0FA-$0FF ($7D-$7F), not $1FA-$1FF (gssquared).
    const expected = [
      ...Array.from({ length: 32 }, (_, i) => 0xe0 + i).flatMap(v => [v, v]),
      ...[0x7d, 0x7d, 0x7e, 0x7e, 0x7f, 0x7f],
      ...Array.from({ length: 96 }, (_, i) => 0x80 + i).flatMap(v => [v, v]),
    ]
    expect(rows).toEqual(expected)
    expect(new Set(rows).size).toBe(32 + 3 + 96)
  })
})

// The beam belongs to the video scanner (17030 video cycles per refresh), not to
// the CPU-cycle counter: it must advance exactly one refresh per frame however
// the guest drives $C036. Deriving the frame phase from CPU cycles made the
// counter jump when the clock changed mid-frame.
describe("the beam advances exactly one refresh per frame", () => {
  test("while the guest toggles $C036", () => {
    jest.useFakeTimers()
    setIsTesting()
    try {
      doSetRunMode(RUN_MODE.PAUSED, false)
      doReset()
      doSetMachineName("APPLE2GS")
      doSetSpeedMode(1)
      doSetRunMode(RUN_MODE.NEED_BOOT)
      doSetRunMode(RUN_MODE.RUNNING, false)
      jest.advanceTimersByTime(17) // warm-up refresh, before the frame clock has a deadline
      const seen = new Set<number>()
      let frames = 0
      for (let f = 0; f < 60; f++) {
        const before = getIigsBeamFrameCount()
        const clockBefore = getIigsVideoClock()
        jest.advanceTimersByTime(17)
        const advanced = getIigsBeamFrameCount() - before
        // The timer can catch up an overdue refresh, but the beam must never
        // stall or rewind.
        expect(advanced).toBeGreaterThanOrEqual(1)
        expect(advanced).toBeLessThanOrEqual(2)
        frames += advanced
        expect(getIigsVideoClock() - clockBefore).toBeGreaterThan(0)
        expect(getIigsBeamPos()).toBeGreaterThanOrEqual(0)
        expect(getIigsBeamPos()).toBeLessThan(VIDEO_CYCLES_PER_FRAME)
        seen.add(iigsSpeedRegister & 0x80)
      }
      expect(frames).toBeGreaterThanOrEqual(60)
      expect(frames).toBeLessThanOrEqual(62)
      // The boot ROM drives the register both ways, which used to step the frame
      // phase backwards when it was derived from CPU cycles.
      expect(seen.size).toBe(2)
    } finally {
      doSetRunMode(RUN_MODE.PAUSED, false)
      doReset()
      jest.useRealTimers()
    }
  }, 900000)
})
