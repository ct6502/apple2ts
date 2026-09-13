import { getReleasedMouseButtons } from "./mouseevent"

test("releases buttons that are no longer held when the pointer reenters", () => {
  expect(getReleasedMouseButtons(0x00)).toEqual([0x00, 0x01])
  expect(getReleasedMouseButtons(0x01)).toEqual([0x01])
  expect(getReleasedMouseButtons(0x02)).toEqual([0x00])
  expect(getReleasedMouseButtons(0x03)).toEqual([])
  expect(getReleasedMouseButtons(0x04)).toEqual([0x00])
})
