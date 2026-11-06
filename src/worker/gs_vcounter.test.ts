import { doSetMachineName, resetCpuSpeedForTesting, getIigsFrameUnits,
  setIigsVideoClockForTesting } from "./motherboard"
import { memGet24 } from "./memory"
import { setIsTesting } from "./worker2main"

// The frame layout $C02E/$C02F report, ported from gssquared
// `VideoScannerII.hpp::get_vcounter()`:
//   vert < 192  -> $100 + vert        (the 192 visible rows)
//   vert < 256  -> $1C0 + (vert-192)  (the first 64 VBL rows)
//   else        -> $0FA + (vert-256)  (the last six rows)
// Our frame puts VBL first, so the sequence below walks the clock in that order.
//
// The last three lines are the whole point. The counter is 9 bits, so $1FF + 1
// is $000 and gssquared then forces it to $0FA - the wrap rows are $0FA-$0FF,
// *not* $1FA-$1FF. Read as $C02E = vcounter >> 1 that is $7D-$7F, not $FD-$FF.
const vblRows = 70
const visibleRows = 192

const frameGeometry = () => {
  const frameCycles = getIigsFrameUnits()
  const vblCycles = Math.round((12460 / 46727) * frameCycles)
  return { frameCycles, vblCycles, vblRow: vblCycles / vblRows, visRow: (frameCycles - vblCycles) / visibleRows }
}

// Rebuild the 9-bit counter the way a guest that wants more than 8 bits does:
// one 16-bit read of the pair, then `ASL / ADC #$0000 / AND #$01FF`, which is
// Stars & Planets' own spin at $01:A06B. $C02F bit 7 carries the counter's bit 0,
// so it survives as the carry the ADC puts back into bit 0.
const readVcounter = () => {
  const a16 = memGet24(0xC02E) | (memGet24(0xC02F) << 8)
  const shifted = (a16 << 1) & 0xffff
  return (shifted + ((a16 >> 15) & 1)) & 0x1ff
}

beforeEach(() => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
})

afterEach(() => {
  resetCpuSpeedForTesting()
})

test("IIgs: $C02E/$C02F walk the 262 rows of a refresh in order", () => {
  const { vblRow, visRow, vblCycles, frameCycles } = frameGeometry()
  const seen: number[] = []
  for (let row = 0; row < vblRows; row++) {
    setIigsVideoClockForTesting(Math.floor((row + 0.5) * vblRow))
    seen.push(readVcounter())
  }
  for (let row = 0; row < visibleRows; row++) {
    setIigsVideoClockForTesting(Math.floor(vblCycles + (row + 0.5) * visRow))
    seen.push(readVcounter())
  }
  const expected = [
    ...Array.from({ length: 64 }, (_, i) => 0x1c0 + i),
    ...Array.from({ length: 6 }, (_, i) => 0x0fa + i),
    ...Array.from({ length: 192 }, (_, i) => 0x100 + i),
  ]
  expect(seen).toEqual(expected)
  // Every row is reachable exactly once, and the frame wraps back onto itself.
  expect(new Set(seen).size).toEqual(262)
  setIigsVideoClockForTesting(0)
  expect(readVcounter()).toEqual(seen[0])
  setIigsVideoClockForTesting(frameCycles)
  expect(readVcounter()).toEqual(seen[0])
})

test("IIgs: the vcounter wrap reaches $0FA, so a guest spinning on it exits", () => {
  // Stars & Planets waits for the reconstructed counter to equal $00FA before it
  // turns SHR on. With the wrap modelled as $1FA-$1FF that value never appears
  // and the GS/OS boot parks on its splash with the drive head frozen.
  const { frameCycles } = frameGeometry()
  let hits = 0
  for (let cyc = 0; cyc < frameCycles; cyc++) {
    setIigsVideoClockForTesting(cyc)
    if (readVcounter() === 0x0fa) hits++
  }
  expect(hits).toBeGreaterThan(0)
  expect(hits).toBeLessThan(frameCycles / 200)
})

test("IIgs: $C02E still reports the VBL window software polls for", () => {
  // Tass Times refreshes its cursor on `LDA $C02E / CMP #$E8 / BNE`, which is a
  // row of the first 64 VBL values. The wrap fix must not move that window.
  const { frameCycles } = frameGeometry()
  const values = new Set<number>()
  for (let cyc = 0; cyc < frameCycles; cyc++) {
    setIigsVideoClockForTesting(cyc)
    values.add(memGet24(0xC02E))
  }
  expect(values.has(0xe8)).toBe(true)
  expect(values.has(0x7d)).toBe(true)
})
