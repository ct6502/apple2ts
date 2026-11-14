import { iigsRefreshCatchUpPlan } from "./motherboard"

// The scheduler must follow wall time, not run ahead of it: a callback that
// arrives early runs no frame, and a callback that arrives late runs every
// overdue refresh. Nothing is capped, because a cap drops frames.
test("timer early callback runs no frame", () => {
  // Negative difference floors to -1, which old code counted as one frame.
  expect(iigsRefreshCatchUpPlan(100, 116.6881, 16.6881))
    .toEqual({ overdueFrames: 0, framesDue: 0 })
})

test("timer on-time callback runs exactly one frame", () => {
  expect(iigsRefreshCatchUpPlan(100, 100, 16.6881))
    .toEqual({ overdueFrames: 1, framesDue: 1 })
})

test("timer late callback consumes every overdue refresh", () => {
  // Two whole refresh slots are already due on top of the current one.
  expect(iigsRefreshCatchUpPlan(133.3762, 100, 16.6881))
    .toEqual({ overdueFrames: 3, framesDue: 3 })
})

test("timer stalled callback runs every overdue refresh", () => {
  // A tab stalled for well over 100 refreshes catches up all of them; a bound
  // would silently drop animation state and tear sprites across the gap.
  expect(iigsRefreshCatchUpPlan(1800, 100, 16.6881))
  .toEqual({ overdueFrames: 102, framesDue: 102 })
})

test("timer warp mode yields one frame instead of dividing by zero", () => {
  // Warp deliberately sets refreshTime to 0.
  expect(iigsRefreshCatchUpPlan(100, 100, 0))
    .toEqual({ overdueFrames: 0, framesDue: 1 })
})
