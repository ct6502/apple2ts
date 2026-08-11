import { run6502OnMem } from "./depack6502"
import { createQrHgrRuntimeBinary, createQrHgrScalerBinary } from "./qr_hgr"

const hgrAddress = (x: number, y: number) =>
  0x2000 + (y & 0x07) * 0x400 + ((y >> 3) & 0x07) * 0x80 + ((y >> 6) & 0x03) * 0x28 + Math.floor(x / 7)

const setHgrPixel = (memory: Uint8Array, x: number, y: number, dark: boolean) => {
  const address = hgrAddress(x, y)
  const mask = 1 << (x % 7)
  if (dark) memory[address] &= ~mask
  else memory[address] |= mask
}

const isHgrPixelDark = (memory: Uint8Array, x: number, y: number) =>
  (memory[hgrAddress(x, y)] & (1 << (x % 7))) === 0

describe("Apple II HGR QR runtime", () => {
  test("contains the pinned generator and a trampoline that does not overlap its parameters", () => {
    const runtime = createQrHgrRuntimeBinary()
    const scaler = createQrHgrScalerBinary()

    expect(runtime).toHaveLength(0x2400 + scaler.length)
    expect(Array.from(runtime.slice(0, 5))).toEqual([0x20, 0x42, 0x66, 0xb0, 0x35])
    expect(Array.from(runtime.slice(0x1000, 0x1005))).toEqual([0xad, 0x20, 0x70, 0x85, 0xeb])
    expect(runtime[0x101e]).toBe(0x60)
    expect(runtime.slice(0x2400, 0x2400 + scaler.length)).toEqual(scaler)
  })

  test("generates and scales a QR while preserving Applesoft zero page", () => {
    const memory = new Uint8Array(0x10000)
    memory.set(createQrHgrRuntimeBinary(), 0x6000)
    memory[0x7020] = 0x25
    memory[0x7021] = 0x70
    memory[0x7022] = 1
    memory[0x7025] = "A".charCodeAt(0)
    run6502OnMem(memory, 0x7000)
    memory.set([0x16, 0x27, 0x38, 0x49], 0x06)
    run6502OnMem(memory, 0x8400)

    expect(memory[0xd7]).toBeGreaterThan(0)
    expect(Array.from(memory.slice(0x06, 0x0a))).toEqual([0x16, 0x27, 0x38, 0x49])
    let lightPixels = 0
    for (let y = 0; y < 192; y++) {
      for (let x = 0; x < 280; x++) {
        if (!isHgrPixelDark(memory, x, y)) lightPixels++
      }
    }
    expect(lightPixels).toBeGreaterThan(0)
    expect(lightPixels).toBeLessThan(280 * 192)
  })

  test("redraws each QR module as a centered inverted 4x4 HGR block", () => {
    const memory = new Uint8Array(0x10000)
    memory.fill(0x7f, 0x2000, 0x4000)
    memory[0xd7] = 21
    setHgrPixel(memory, 49, 7, true)
    setHgrPixel(memory, 69, 27, true)
    const scaler = createQrHgrScalerBinary()
    memory.set(scaler, 0x8400)

    run6502OnMem(memory, 0x8400)

    const revealSequence = [0x2c, 0x52, 0xc0, 0x2c, 0x54, 0xc0, 0x2c, 0x50, 0xc0, 0x60]
    expect(Array.from(scaler).some((_, offset) =>
      revealSequence.every((byte, index) => scaler[offset + index] === byte)
    )).toBe(true)
    expect(scaler.length).toBeLessThanOrEqual(0x9200 - 0x8400)
    for (let y = 54; y < 58; y++) {
      for (let x = 98; x < 102; x++) expect(isHgrPixelDark(memory, x, y)).toBe(false)
    }
    for (let y = 134; y < 138; y++) {
      for (let x = 178; x < 182; x++) expect(isHgrPixelDark(memory, x, y)).toBe(false)
    }
    expect(isHgrPixelDark(memory, 102, 54)).toBe(true)
    expect(isHgrPixelDark(memory, 49, 7)).toBe(true)
  })
})