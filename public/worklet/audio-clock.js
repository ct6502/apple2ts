// One outstanding CPU request at a time. Audio rendering must never wait.
export class AudioClock {
  constructor(rate, port) {
    this.rate = rate
    this.port = port
    this.samples = 0
    this.nextTick = rate * 0.0166881
    this.pending = false
    port.onmessage = () => {
      this.pending = false
      // Discard overdue wakeups instead of replaying them as a burst.
      this.nextTick = Math.max(this.nextTick, this.samples)
    }
  }

  advance(count) {
    this.samples += count
    if (this.pending || this.samples < this.nextTick) return
    this.pending = true
    this.nextTick += this.rate * 0.0166881
    this.port.postMessage({ type: "audio-clock" })
  }
}
