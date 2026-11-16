/**
 * Bug 4 companion unit test for the clock-chip reset path.
 *
 * A Ctrl-Reset can arrive mid CB serial transaction. `iigsClock.reset(false)`
 * must drop the in-flight command framing without reseeding the 256-byte
 * battery RAM; only a cold boot (`reset(true)`) may rewrite the BRAM signature.
 * The ROM's reset boot depends on both halves: stale framing breaks its
 * signature read, but clearing the BRAM would erase the only signature it can
 * find again.
 */
import { iigsClock } from "./iigs_clock"

type ClockProbe = {
  state: number
  transactionStepCount: number
  ctlRegByte: number
  bram: Uint8Array
}
const probe = () => iigsClock as unknown as ClockProbe

const seedTransaction = () => {
  iigsClock.writeData(0x38)
  iigsClock.writeControl(0xa0)
}

test("warm reset clears a mid-flight CB transaction but keeps BRAM", () => {
  iigsClock.reset(true) // known cold state
  const before = new Uint8Array(probe().bram)

  seedTransaction()
  const seeded = probe()
  expect(seeded.state).not.toBe(0)
  expect(seeded.transactionStepCount).toBe(2)

  iigsClock.reset(false)
  const cleared = probe()
  expect(cleared.state).toBe(0) // AWAIT_COMMAND
  expect(cleared.transactionStepCount).toBe(0)
  expect(cleared.ctlRegByte & 0b100).toBe(0) // start-transaction released
  expect(cleared.bram).toEqual(before) // warm reset never reseeds BRAM
})

test("cold boot reseeds the ROM 03 BRAM signature", () => {
  iigsClock.reset(true)
  const signature = [0xcb, 0xd2, 0xc7, 0xc2, 0x10, 0xa2, 0xe8, 0x03]
  const sigAt = () => Array.from(probe().bram.slice(0xb0, 0xb8))

  expect(sigAt()).toEqual(signature)

  // A warm reset preserves deliberately modified BRAM bytes...
  probe().bram[0xb0] = 0x00
  iigsClock.reset(false)
  expect(probe().bram[0xb0]).toBe(0x00)

  // ...but a cold boot rebuilds the signature the self-test searches for.
  iigsClock.reset(true)
  expect(sigAt()).toEqual(signature)
  expect(probe().state).toBe(0)
  expect(probe().transactionStepCount).toBe(0)
})
