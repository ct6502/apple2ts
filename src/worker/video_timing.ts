export const CYCLES_PER_FRAME = 17030
export const VBL_CYCLES = 4550
export const VISIBLE_SCANLINES = 192

type VideoTimingCallbacks = {
  setVbl: (active: boolean) => void,
  exportScanline: (line: number) => void,
  completeFrame: () => void,
}

type VideoScanoutCallbacks = Omit<VideoTimingCallbacks, "completeFrame"> & {
  publishFrame: () => void,
}

export class VideoTiming {
  private cycleInFrame = 0
  private currentLine = -1
  private readonly callbacks: VideoTimingCallbacks

  constructor(callbacks: VideoTimingCallbacks) {
    this.callbacks = callbacks
  }

  reset() {
    this.cycleInFrame = 0
    this.currentLine = -1
  }

  synchronize(cycleCount: number) {
    this.cycleInFrame = ((cycleCount % CYCLES_PER_FRAME) + CYCLES_PER_FRAME) % CYCLES_PER_FRAME
    this.currentLine = this.cycleInFrame < VBL_CYCLES
      ? -1
      : Math.min(
        VISIBLE_SCANLINES - 1,
        Math.floor((this.cycleInFrame - VBL_CYCLES) / 65),
      )
    this.callbacks.setVbl(this.cycleInFrame < VBL_CYCLES)
  }

  advance(cycles: number) {
    let remaining = cycles
    while (remaining > 0) {
      const step = Math.min(remaining, CYCLES_PER_FRAME - this.cycleInFrame)
      this.cycleInFrame += step
      remaining -= step

      if (this.cycleInFrame < VBL_CYCLES) {
        this.callbacks.setVbl(true)
      } else {
        this.callbacks.setVbl(false)
        const lastVisibleLine = Math.min(
          VISIBLE_SCANLINES - 1,
          Math.floor((this.cycleInFrame - VBL_CYCLES) / 65),
        )
        while (this.currentLine < lastVisibleLine) {
          this.currentLine++
          this.callbacks.exportScanline(this.currentLine)
        }
      }

      if (this.cycleInFrame === CYCLES_PER_FRAME) {
        this.callbacks.completeFrame()
        this.cycleInFrame = 0
        this.currentLine = -1
      }
    }
  }
}

export const createVideoScanout = (callbacks: VideoScanoutCallbacks) => {
  return new VideoTiming({
    setVbl: callbacks.setVbl,
    exportScanline: callbacks.exportScanline,
    completeFrame: callbacks.publishFrame,
  })
}

export const advanceVideoByCpuDelta = (
  timing: Pick<VideoTiming, "advance">,
  cycleCountBefore: number,
  cycleCountAfter: number,
) => {
  const elapsedCycles = cycleCountAfter - cycleCountBefore
  if (elapsedCycles > 0) timing.advance(elapsedCycles)
  return Math.max(0, elapsedCycles)
}
