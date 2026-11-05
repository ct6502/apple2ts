import { MSG_MAIN, MSG_WORKER } from "./utility"

test.each([
  ["worker-to-main", MSG_WORKER],
  ["main-to-worker", MSG_MAIN],
])("%s messages have unique numeric identifiers", (_direction, messages) => {
  const identifiers = Object.values(messages).filter(value => typeof value === "number")
  expect(new Set(identifiers).size).toBe(identifiers.length)
})

test("VERA frames cannot be dispatched as serial configuration messages", () => {
  expect(Number(MSG_WORKER.VERA_FRAME)).not.toBe(Number(MSG_WORKER.SERIAL_CONFIG_CHANGE))
})
