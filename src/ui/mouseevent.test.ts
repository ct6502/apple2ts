import { getMouseButtonReleaseEvents } from "./mouseevent"

const event = (buttons: number) => ({ x: 0, y: 0, buttons })

test("creates releases for buttons that are no longer held on re-entry", () => {
  // Only the main button (button 0) synthesizes a release on re-entry; the
  // closed-apple button (0x01) is never synthesized because that spurious
  // release injected a second ADB button transition into the middle of a
  // click sequence, which GS/OS read as a double click.
  expect(getMouseButtonReleaseEvents(0x00, false)).toEqual([event(0x00)])
  expect(getMouseButtonReleaseEvents(0x01, false)).toEqual([])
  for (const buttons of [0x02, 0x04, 0x08, 0x10]) {
    expect(getMouseButtonReleaseEvents(buttons, false)).toEqual([event(0x00)])
  }
  expect(getMouseButtonReleaseEvents(0x03, false)).toEqual([])
})

test("does not create mouse-card events for touch-device re-entry", () => {
  expect(getMouseButtonReleaseEvents(0x00, true)).toEqual([])
})
