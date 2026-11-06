import { FrameClock } from "./frameclock"

const interval = 16.6881

test("timer and audio wakeups share a deadline without duplicate frames", () => {
  const clock = new FrameClock()
  let frames = 0
  let now = 0
  const execute = () => { frames++; now += 8 }
  for (let tick = 0; tick < 6000; tick++) {
    now = Math.max(now, tick)
    clock.advance(now, interval, execute, () => now)
    clock.advance(now, interval, execute, () => now)
  }
  expect(frames).toBeGreaterThanOrEqual(359)
  expect(frames).toBeLessThanOrEqual(361)
})

test("timer keeps advancing if audio acknowledgement is delayed", () => {
  const clock = new FrameClock()
  let now = 0
  let frames = 0
  while (now < 1000) {
    clock.advance(now, interval, () => { frames++; now += 10 }, () => now)
    now += clock.delay(now)
  }
  expect(frames).toBe(60)
})

test("a long stall executes one frame instead of replaying missed ticks", () => {
  const clock = new FrameClock()
  const execute = jest.fn()
  clock.advance(0, interval, execute, () => 8)
  clock.advance(1000, interval, execute, () => 1008)
  expect(execute).toHaveBeenCalledTimes(2)
  for (let i = 0; i < 100; i++) clock.advance(1000, interval, execute, () => 1008)
  expect(execute).toHaveBeenCalledTimes(2)
  expect(clock.delay(1008)).toBe(1)
})

test("overloaded frames do not add a full audio interval after CPU work", () => {
  const clock = new FrameClock()
  let now = 0
  let frames = 0
  while (now < 1000) {
    clock.advance(now, interval, () => { frames++; now += 20 }, () => now)
    now += clock.delay(now)
  }
  expect(frames).toBeGreaterThanOrEqual(47)
})
