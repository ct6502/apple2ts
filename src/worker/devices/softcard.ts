// Microsoft Z-80 SoftCard for Apple2TS
// Ported from hardware-accurate web-a2e implementation (by Mike Daley / MAME a2softcard.cpp)

import { Z80, Z80Bus } from "../z80"
import { memory, addressGetTable } from "../memory"

export type ActiveCpuType = "6502" | "Z80"

export interface MotherboardMemoryBus {
  read(address: number): number
  write(address: number, value: number): void
}

/**
 * Address translation mapping (Z80 address -> Apple II address):
 *   Z80 $0000-$AFFF -> Apple II $1000-$BFFF  (44KB contiguous RAM for CP/M)
 *   Z80 $B000-$BFFF -> Apple II $D000-$DFFF  (Language Card bank 2)
 *   Z80 $C000-$CFFF -> Apple II $E000-$EFFF  (Language Card)
 *   Z80 $D000-$DFFF -> Apple II $F000-$FFFF  (Language Card)
 *   Z80 $E000-$EFFF -> Apple II $C000-$CFFF  (System I/O space)
 *   Z80 $F000-$FFFF -> Apple II $0000-$0FFF  (Zero page / stack)
 */
const ADDRESS_MAPPING = [
  0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8,
  0x9, 0xa, 0xb, 0xd, 0xe, 0xf, 0xc, 0x0,
]

export class SoftCard implements Z80Bus {
  enabled = true
  slot = 2
  activeCpu: ActiveCpuType = "6502"
  z80: Z80
  private z80Initialized = false
  private memoryBus: MotherboardMemoryBus | null = null

  constructor(slot = 2) {
    this.slot = slot
    this.z80 = new Z80(this)
  }

  reset(): void {
    this.activeCpu = "6502"
    this.z80Initialized = false
    this.z80.reset()
  }

  setMemoryBus(bus: MotherboardMemoryBus): void {
    this.memoryBus = bus
  }

  translateZ80Address(z80Addr: number): number {
    const highNibble = (z80Addr >> 12) & 0x0f
    const offset = z80Addr & 0x0fff
    return (ADDRESS_MAPPING[highNibble] << 12) | offset
  }

  readByte(address: number): number {
    const appleAddr = this.translateZ80Address(address)
    const page = appleAddr >>> 8

    // Fast direct RAM access for $0000 - $BFFF (main RAM)
    if (page < 0xc0) {
      const shifted = addressGetTable[page]
      return memory[shifted + (appleAddr & 0xff)]
    }

    // Fast direct RAM access for $D000 - $FFFF (Language Card / Upper RAM)
    if (page >= 0xd0) {
      const shifted = addressGetTable[page]
      if (shifted >= 0) {
        return memory[shifted + (appleAddr & 0xff)]
      }
    }

    // Fallback for I/O and slot space ($C000 - $CFFF)
    if (this.memoryBus) {
      return this.memoryBus.read(appleAddr) & 0xff
    }
    return 0xff
  }

  writeByte(address: number, value: number): void {
    const appleAddr = this.translateZ80Address(address)

    // Z80 writing to Apple II $Cn00 deactivates Z80
    // (Z80 $En00 maps to Apple II $Cn00 via address translation)
    if (appleAddr === (0xc000 | (this.slot << 8))) {
      this.deactivateZ80()
      return
    }

    const page = appleAddr >>> 8

    // Fast direct RAM write for $0000 - $BFFF
    if (page < 0xc0) {
      const shifted = addressGetTable[page]
      if (shifted >= 0) {
        memory[shifted + (appleAddr & 0xff)] = value & 0xff
        return
      }
    }

    // Fast direct RAM write for $D000 - $FFFF
    if (page >= 0xd0) {
      const shifted = addressGetTable[page]
      if (shifted >= 0) {
        memory[shifted + (appleAddr & 0xff)] = value & 0xff
        return
      }
    }

    // Fallback for I/O / softswitches ($C000 - $CFFF)
    if (this.memoryBus) {
      this.memoryBus.write(appleAddr, value & 0xff)
    }
  }

  activateZ80(): void {
    this.activeCpu = "Z80"
    if (!this.z80Initialized) {
      this.z80.reset()
      this.z80Initialized = true
    }
  }

  deactivateZ80(): void {
    this.activeCpu = "6502"
  }

  stepZ80(): number {
    if (this.activeCpu !== "Z80") return 0
    return this.z80.step()
  }
}
