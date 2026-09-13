import { getMouseButtonReleaseEvents } from "./mouseevent"

const event = (buttons: number) => ({ x: 0, y: 0, buttons })

test("creates releases for buttons that are no longer held on re-entry", () => {
  expect(getMouseButtonReleaseEvents(0x00, false)).toEqual([event(0x00), event(0x01)])
  expect(getMouseButtonReleaseEvents(0x01, false)).toEqual([event(0x01)])
  for (const buttons of [0x02, 0x04, 0x08, 0x10]) {
    expect(getMouseButtonReleaseEvents(buttons, false)).toEqual([event(0x00)])
  }
  expect(getMouseButtonReleaseEvents(0x03, false)).toEqual([])
})

test("does not create mouse-card events for touch-device re-entry", () => {
  expect(getMouseButtonReleaseEvents(0x00, true)).toEqual([])
})
