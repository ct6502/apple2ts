import { processInstruction } from "./cpu6502"
import { memory, updateAddressTables } from "./memory"
import { s6502, setPC } from "./instructions"
import { TEST_DEBUG, TEST_GRAPHICS } from "../common/utility"
import { parseAssembly } from "./utility/assembler"
import { advanceVideoByCpuDelta, createVideoScanout, CYCLES_PER_FRAME, VBL_CYCLES, VideoTiming, VISIBLE_SCANLINES } from "./video_timing"

// Make sure we don't accidentally leave debug mode on.
test("debugMode", () => {
  expect(TEST_DEBUG).toEqual(false)
  expect(TEST_GRAPHICS).toEqual(false)
})

test("processInstruction", () => {
  const pcode = parseAssembly(0x2000, [" LDA #$C0"])
  memory.set(pcode, 0x2000)
  updateAddressTables()
  setPC(0x2000)
  processInstruction()
  expect(s6502.PC).toEqual(0x2002)
  expect(s6502.Accum).toEqual(0xC0)
})

const runVideoChunks = (chunkCycles: number, chunkCount: number) => {
  const scanlines: number[] = []
  let completedFrames = 0
  const timing = new VideoTiming({
    setVbl: () => undefined,
    exportScanline: (line) => scanlines.push(line),
    completeFrame: () => completedFrames++,
  })

  for (let chunk = 0; chunk < chunkCount; chunk++) {
    for (let cycle = 0; cycle < chunkCycles; cycle++) {
      timing.advance(1)
    }
  }

  return { scanlines, completedFrames }
}

test("0.5 MHz chunks complete one video frame", () => {
  const result = runVideoChunks(CYCLES_PER_FRAME / 2, 2)
  expect(result.scanlines).toEqual(Array.from({length: VISIBLE_SCANLINES}, (_, line) => line))
  expect(result.completedFrames).toEqual(1)
})

test("0.1 MHz chunks complete one video frame", () => {
  const result = runVideoChunks(CYCLES_PER_FRAME / 10, 10)
  expect(result.scanlines).toEqual(Array.from({length: VISIBLE_SCANLINES}, (_, line) => line))
  expect(result.completedFrames).toEqual(1)
})

test("1 MHz chunk completes one video frame", () => {
  const result = runVideoChunks(CYCLES_PER_FRAME, 1)
  expect(result.scanlines).toEqual(Array.from({length: VISIBLE_SCANLINES}, (_, line) => line))
  expect(result.completedFrames).toEqual(1)
})

test("2 MHz chunk completes two video frames", () => {
  const result = runVideoChunks(CYCLES_PER_FRAME * 2, 1)
  const frame = Array.from({length: VISIBLE_SCANLINES}, (_, line) => line)
  expect(result.scanlines).toEqual([...frame, ...frame])
  expect(result.completedFrames).toEqual(2)
})

test("instruction overshoot does not contaminate the completed frame", () => {
  let lineZeroExports = 0
  let workingFrame = 0
  let publishedFrame = 0
  const scanout = createVideoScanout({
    setVbl: () => undefined,
    exportScanline: (line) => {
      if (line === 0) workingFrame = ++lineZeroExports
    },
    publishFrame: () => {
      publishedFrame = workingFrame
    },
  })

  scanout.advance(CYCLES_PER_FRAME + VBL_CYCLES)

  expect(workingFrame).toEqual(2)
  expect(publishedFrame).toEqual(1)
})

test("video advances by actual CPU cycle-count delta", () => {
  const advance = jest.fn()

  expect(advanceVideoByCpuDelta({advance}, 100, 112)).toEqual(12)
  expect(advance).toHaveBeenCalledWith(12)
})

test("video synchronization follows exact VBL boundaries", () => {
  const vbl: boolean[] = []
  const timing = new VideoTiming({
    setVbl: (active) => vbl.push(active),
    exportScanline: () => undefined,
    completeFrame: () => undefined,
  })

  timing.synchronize(VBL_CYCLES - 1)
  timing.synchronize(VBL_CYCLES)
  timing.synchronize(CYCLES_PER_FRAME)

  expect(vbl).toEqual([true, false, true])
})

test("video synchronization resumes after the restored scanline", () => {
  const scanlines: number[] = []
  const timing = new VideoTiming({
    setVbl: () => undefined,
    exportScanline: (line) => scanlines.push(line),
    completeFrame: () => undefined,
  })

  timing.synchronize(VBL_CYCLES + 10 * 65)
  timing.advance(65)

  expect(scanlines).toEqual([11])
})
