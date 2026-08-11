import { run6502OnMem } from "./depack6502"
import { createQrHgrRuntimeBinary, createQrHgrScaledPixelBinary } from "./qr_hgr"

const hgrAddress = (x: number, y: number) =>
  0x2000 + (y & 0x07) * 0x400 + ((y >> 3) & 0x07) * 0x80 + ((y >> 6) & 0x03) * 0x28 + Math.floor(x / 7)

const isHgrPixelDark = (memory: Uint8Array, x: number, y: number) =>
  (memory[hgrAddress(x, y)] & (1 << (x % 7))) === 0

describe("Apple II HGR QR runtime", () => {
  test("contains the pinned generator and a trampoline that does not overlap its parameters", () => {
    const runtime = createQrHgrRuntimeBinary()
    const scaledPixelRenderer = createQrHgrScaledPixelBinary()

    expect(runtime).toHaveLength(0x2400 + scaledPixelRenderer.length)
    expect(Array.from(runtime.slice(0, 5))).toEqual([0x20, 0x42, 0x66, 0xb0, 0x35])
    expect(Array.from(runtime.slice(0x140, 0x14a))).toEqual([
      0xd0, 0x04, 0x20, 0x00, 0x6f, 0x60, 0x20, 0x07, 0x6f, 0x60,
    ])
    expect(Array.from(runtime.slice(0x14a, 0x14d))).toEqual([0x4c, 0x00, 0x84])
    expect(Array.from(runtime.slice(0x0f00, 0x0f0e))).toEqual([
      0x20, 0xe2, 0xf3, 0x2c, 0x52, 0xc0, 0x60,
      0x20, 0xd8, 0xf3, 0x2c, 0x52, 0xc0, 0x60,
    ])
    expect(Array.from(runtime.slice(0x1000, 0x1005))).toEqual([0xad, 0x20, 0x70, 0x85, 0xeb])
    expect(runtime[0x101e]).toBe(0x60)
    expect(runtime.slice(0x2400)).toEqual(scaledPixelRenderer)
  })

  test("generates centered 4x modules without a post-processing pass", () => {
    const memory = new Uint8Array(0x10000)
    memory.fill(0x7f, 0x2000, 0x4000)
    memory.set(createQrHgrRuntimeBinary(), 0x6000)
    memory[0x7020] = 0x25
    memory[0x7021] = 0x70
    memory[0x7022] = 1
    memory[0x7025] = "A".charCodeAt(0)
    memory[0xe6] = 0x20
    memory[0xf3e2] = 0x60
    run6502OnMem(memory, 0x7000)

    expect(memory[0xd7]).toBeGreaterThan(0)
    const originX = 140 - memory[0xd7] * 2
    const originY = 96 - memory[0xd7] * 2
    for (let y = originY; y < originY + 4; y++) {
      for (let x = originX; x < originX + 4; x++) {
        expect(isHgrPixelDark(memory, x, y)).toBe(true)
      }
    }
    expect(isHgrPixelDark(memory, originX + 28, originY)).toBe(false)
  })

  test("renders one dark QR module as a centered 4x4 HGR block", () => {
    const memory = new Uint8Array(0x10000)
    memory.fill(0x7f, 0x2000, 0x4000)
    memory[0xd7] = 21
    memory[0xce] = 0
    memory[0xcf] = 0
    memory[0xe6] = 0x20
    const scaledPixelRenderer = createQrHgrScaledPixelBinary()
    memory.set(scaledPixelRenderer, 0x8400)

    run6502OnMem(memory, 0x8400)

    for (let y = 54; y < 58; y++) {
      for (let x = 98; x < 102; x++) expect(isHgrPixelDark(memory, x, y)).toBe(true)
    }
    expect(isHgrPixelDark(memory, 102, 54)).toBe(false)
    expect(isHgrPixelDark(memory, 98, 58)).toBe(false)
  })
})