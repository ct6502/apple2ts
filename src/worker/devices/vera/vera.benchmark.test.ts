import { processInstruction, resetCycleCountCallbacks } from "../../cpu6502"
import { s6502, setPC } from "../../instructions"
import { memGet, memSet } from "../../memory"
import { doBoot } from "../../motherboard"
import { setIsTesting } from "../../worker2main"
import { enableVera, initVera, resetVera } from "./vera"
import { buildVeraDemo, getVeraMode7DemoAssembly, getVeraSpriteDemoAssembly } from "./vera_demos"
import { video_get_framebuffer, video_reset, video_step, video_write } from "./video"

const benchmarkTest = process.env.VERA_BENCHMARK === "1" ? test : test.skip
const SCANLINES_PER_FRAME = 525
const CYCLES_PER_SCANLINE = 32.000001
const WARMUP_FRAMES = 10
const MEASURED_FRAMES = 300
const MEASURED_INSTRUCTIONS = 1_000_000

const loadDemo = (source: (slot: number) => string[]) => {
  const startAddress = 0x2000
  const demo = buildVeraDemo(source, 2, startAddress)
  demo.bytes.forEach((byte, index) => { memSet(startAddress + index, byte) })
  setPC(startAddress)
  let instructionsRemaining = 20000
  while (instructionsRemaining-- > 0) {
    const returning = s6502.PC === 0 || memGet(s6502.PC) === 0x60
    processInstruction()
    if (returning) break
  }
}

const framebufferChecksum = () => {
  const framebuffer = video_get_framebuffer()
  let hash = 2166136261
  for (let index = 0; index < framebuffer.length; index++) {
    hash = Math.imul(hash ^ framebuffer[index], 16777619)
  }
  return hash >>> 0
}

const renderFrame = () => {
  for (let line = 0; line < SCANLINES_PER_FRAME; line++) {
    video_step(1, CYCLES_PER_SCANLINE, false)
  }
}

const writeVram = (address: number, data: Uint8Array) => {
  video_write(0x00, address & 0xFF)
  video_write(0x01, (address >> 8) & 0xFF)
  video_write(0x02, 0x10 | ((address >> 16) & 1))
  for (const value of data) video_write(0x03, value)
}

const configureTileMap = (colorDepth: 2 | 3) => {
	const tile = new Uint8Array(colorDepth === 3 ? 64 : 32)
	for (let index = 0; index < tile.length; index++) {
		tile[index] = colorDepth === 3 ? (index & 7) + 1 : (((index & 7) + 1) << 4) | ((index + 1) & 7) + 1
	}
	writeVram(0, tile)
	writeVram(0x10000, new Uint8Array(128 * 64 * 2))
	video_write(0x0D, 0x60 | colorDepth) // 128x64 tile map
  video_write(0x0E, 0x80) // map at VRAM $10000
  video_write(0x0F, 0x00) // 8x8 tiles at VRAM $00000
  video_write(0x09, 0x11) // VGA output with layer 0 enabled
}

const configureSprites = () => {
  const shape = new Uint8Array(16 * 32)
  shape.fill(0x12)
  writeVram(0x18000, shape)
  const attributes = new Uint8Array(16 * 8)
  for (let sprite = 0; sprite < 16; sprite++) {
    const offset = sprite * 8
    const x = (sprite * 37) % 600
    const y = (sprite * 29) % 440
    attributes[offset + 1] = 0x0C
    attributes[offset + 2] = x & 0xFF
    attributes[offset + 3] = x >> 8
    attributes[offset + 4] = y & 0xFF
    attributes[offset + 5] = y >> 8
    attributes[offset + 6] = 0x0C
    attributes[offset + 7] = 0x90
  }
  writeVram(0x1FC00, attributes)
  video_write(0x09, 0x51) // VGA output with layer 0 and sprites enabled
}

const setTileScroll = (frame: number) => {
  const hscroll = (frame * 3 + 5) & 0x3FF
  const vscroll = (frame * 2 + 3) & 0x1FF
  video_write(0x10, hscroll & 0xFF)
  video_write(0x11, hscroll >> 8)
  video_write(0x12, vscroll & 0xFF)
  video_write(0x13, vscroll >> 8)
}

const runBenchmark = (name: string, source: (slot: number) => string[]) => {
  doBoot()
  initVera()
  resetVera()
  video_reset()
  enableVera(true, 2)
  loadDemo(source)

  for (let frame = 0; frame < WARMUP_FRAMES; frame++) renderFrame()
  const start = performance.now()
  for (let frame = 0; frame < MEASURED_FRAMES; frame++) renderFrame()
  const elapsed = performance.now() - start

  console.log(`[VERA benchmark] ${name}: ${(elapsed / MEASURED_FRAMES).toFixed(3)} ms/frame, checksum ${framebufferChecksum()}`)
}

const runCpuBenchmark = (name: string, veraEnabled: boolean) => {
  doBoot()
  resetCycleCountCallbacks()
  if (veraEnabled) {
    initVera()
    resetVera()
    enableVera(true, 2)
  }
  for (let address = 0x2000; address < 0x4000; address++) memSet(address, 0xEA)

  const start = performance.now()
  for (let batch = 0; batch < 100; batch++) {
    setPC(0x2000)
    for (let instruction = 0; instruction < MEASURED_INSTRUCTIONS / 100; instruction++) {
      processInstruction()
    }
  }
  const elapsed = performance.now() - start
  console.log(`[VERA benchmark] ${name}: ${elapsed.toFixed(1)} ms/million instructions`)
}

const runTileBenchmark = (colorDepth: 2 | 3, sprites = false) => {
  doBoot()
  initVera()
  resetVera()
  video_reset()
  configureTileMap(colorDepth)
  if (sprites) configureSprites()
  for (let frame = 0; frame < WARMUP_FRAMES; frame++) {
    setTileScroll(frame)
    renderFrame()
  }
  const start = performance.now()
  for (let frame = 0; frame < MEASURED_FRAMES; frame++) {
    setTileScroll(frame + WARMUP_FRAMES)
    renderFrame()
  }
  const elapsed = performance.now() - start
  console.log(`[VERA benchmark] tilemap-${1 << colorDepth}bpp${sprites ? "+sprites" : ""}: ${(elapsed / MEASURED_FRAMES).toFixed(3)} ms/frame, checksum ${framebufferChecksum()}`)
}

describe("VERA rendering benchmark", () => {
  beforeAll(setIsTesting)

  benchmarkTest("sprite rendering", () => {
    runBenchmark("sprites", getVeraSpriteDemoAssembly)
  })

  benchmarkTest("256-color bitmap rendering", () => {
    runBenchmark("bitmap-8bpp", getVeraMode7DemoAssembly)
  })

  benchmarkTest("256-color tile-map rendering", () => { runTileBenchmark(3) })

  benchmarkTest("256-color tile-map and sprite rendering", () => { runTileBenchmark(3, true) })

  benchmarkTest("16-color tile-map rendering", () => { runTileBenchmark(2) })

	benchmarkTest("16-color tile-map and sprite rendering", () => { runTileBenchmark(2, true) })

  benchmarkTest("per-instruction synchronization", () => {
    runCpuBenchmark("CPU-only", false)
    runCpuBenchmark("CPU-with-VERA", true)
  })
})
