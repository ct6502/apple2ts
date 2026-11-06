// Timer and audio notifications share a deadline; neither owns the CPU.
export class FrameClock {
  private deadline = 0
  private advancing = false

  reset(now: number) {
    this.deadline = now
  }

  advance(now: number, interval: number, execute: () => void, readTime: () => number): boolean {
    if (this.advancing || now < this.deadline) return false
    this.advancing = true
    // Reserve the slot before execution, which can change run mode/reset.
    this.deadline += interval
    try {
      execute()
    } finally {
      this.deadline = Math.max(this.deadline, readTime())
      this.advancing = false
    }
    return true
  }

  delay(now: number): number {
    return Math.max(1, Math.ceil(this.deadline - now))
  }
}
