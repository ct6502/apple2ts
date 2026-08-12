import { Z80, Z80Bus } from "../z80"

export type ActiveCpuType = "6502" | "Z80"

export interface MotherboardMemoryBus {
  read(address: number): number
  write(address: number, value: number): void
}

export class SoftCard implements Z80Bus {
  enabled = true
  slot = 2 // Default Slot 2 (0xC0A0 - 0xC0AF) to avoid collision with Slot 4 Mockingboard
  activeCpu: ActiveCpuType = "6502"
  z80: Z80

  private memoryBus: MotherboardMemoryBus | null = null

  constructor(slot = 2) {
    this.slot = slot
    this.z80 = new Z80(this)
  }

  setMemoryBus(memoryBus: MotherboardMemoryBus): void {
    this.memoryBus = memoryBus
  }

  reset(): void {
    this.activeCpu = "6502"
    this.z80.reset()
  }

  /**
   * Check if an address corresponds to the SoftCard toggle softswitch ($C0n0).
   * Slot 4: 0xC0C0, Slot 2: 0xC0A0
   */
  isToggleSwitch(address: number): boolean {
    const slotOffset = (this.slot + 8) << 4 // Slot 4 -> 0xC0, Slot 2 -> 0xA0
    const targetBase = 0xc000 | slotOffset
    return (address & 0xfff0) === targetBase
  }

  /**
   * Toggle between 6502 and Z80 CPU execution.
   */
  toggleCpu(): void {
    this.activeCpu = this.activeCpu === "Z80" ? "6502" : "Z80"
  }

  /**
   * Remap 16-bit Z80 address space to Apple II 64K RAM space.
   * SoftCard hardware mapping:
   *  Z80 0x0000 - 0xEFFF -> Apple II RAM 0x1000 - 0xFFFF
   *  Z80 0xF000 - 0xFFFF -> Apple II RAM 0x0000 - 0x0FFF
   */
  translateZ80Address(address: number): number {
    const zAddr = address & 0xffff

    // I/O space bypass (0xC000 - 0xC0FF)
    if (zAddr >= 0xc000 && zAddr <= 0xc0ff) {
      return zAddr
    }

    if (zAddr <= 0xefff) {
      return (zAddr + 0x1000) & 0xffff
    } else {
      return (zAddr - 0xf000) & 0xffff
    }
  }

  // Z80Bus Implementation

  readByte(address: number): number {
    const appleAddr = this.translateZ80Address(address)

    // Check for SoftCard CPU toggle switch
    if (this.isToggleSwitch(appleAddr)) {
      this.toggleCpu()
    }

    if (this.memoryBus) {
      return this.memoryBus.read(appleAddr) & 0xff
    }
    return 0xff
  }

  writeByte(address: number, value: number): void {
    const appleAddr = this.translateZ80Address(address)

    // Check for SoftCard CPU toggle switch
    if (this.isToggleSwitch(appleAddr)) {
      this.toggleCpu()
    }

    if (this.memoryBus) {
      this.memoryBus.write(appleAddr, value & 0xff)
    }
  }

  readIO(port: number): number {
    return this.readByte(port & 0xffff)
  }

  writeIO(port: number, value: number): void {
    this.writeByte(port & 0xffff, value)
  }

  /**
   * Step Z80 execution for one instruction cycle if Z80 is currently active.
   * Returns T-states consumed by Z80.
   */
  stepZ80(): number {
    if (this.activeCpu !== "Z80") return 0
    return this.z80.step()
  }
}
