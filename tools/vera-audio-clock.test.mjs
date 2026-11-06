import { test } from "node:test"
import assert from "node:assert/strict"
import { AudioClock } from "../public/worklet/audio-clock.js"

function setup(rate = 48000) {
  const messages = []
  const port = { postMessage: message => messages.push(message), onmessage: null }
  return { clock: new AudioClock(rate, port), port, messages }
}

test("render quantum rounding does not reduce the clock rate", () => {
  for (const rate of [44100, 48000, 96000]) {
    const { clock, port, messages } = setup(rate)
    for (let samples = 0; samples < rate * 10; samples += 128) {
      clock.advance(128)
      if (clock.pending) port.onmessage()
    }
    assert.ok(Math.abs(messages.length - 10000 / 16.6881) < 2, `${rate}: ${messages.length}`)
  }
})

test("a stalled worker cannot accumulate clock messages", () => {
  const { clock, port, messages } = setup()
  for (let i = 0; i < 48000 / 128; i++) clock.advance(128)
  assert.equal(messages.length, 1)
  port.onmessage()
  clock.advance(128)
  assert.equal(messages.length, 2)
  for (let i = 0; i < 100; i++) clock.advance(128)
  assert.equal(messages.length, 2)
})

test("acknowledging a normal frame does not add an extra frame delay", () => {
  const { clock, port, messages } = setup()
  clock.advance(896)
  clock.advance(256)
  port.onmessage()
  clock.advance(512)
  assert.equal(messages.length, 2)
})
