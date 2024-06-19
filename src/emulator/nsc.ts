
// Modified from nsc.ts from Apple2JS project by Michael Morrison
// https://github.com/whscullin/apple2js/blob/main/js/cards/nsc.ts

// Apple2JS sources are Copyright Will Skullin and Covered by MIT License

type bit = 0 | 1

const PATTERN = [0xC5, 0x3A, 0xA3, 0x5C, 0xC5, 0x3A, 0xA3, 0x5C]

const A0 = 0x01
const A2 = 0x04

class NoSlotClock {
  bits: bit[] = []
  pattern = new Array(64)
  patternIdx = 0
  
  constructor() {
  }
  
  private reset = () => {
    this.patternIdx = 0
  }

  private checkPattern = (bit: bit) => {
    const byte = PATTERN[Math.floor(this.patternIdx / 8)]
    const wantbit = (byte >> (this.patternIdx % 8)) & 0x01
    return bit === wantbit
  }
  
  private calcBits = () => {
    const shift = (val: number) => {
      this.bits.push(val & 0x08 ? 1 : 0)
      this.bits.push(val & 0x04 ? 1 : 0)
      this.bits.push(val & 0x02 ? 1 : 0)
      this.bits.push(val & 0x01 ? 1 : 0)
    }
    const shiftBCD = (val: number) => {
      shift(Math.floor(val / 10))
      shift(Math.floor(val % 10))
    }
    
    const now = new Date()
    const year = now.getFullYear() % 100
    const day = now.getDate()
    const weekday = now.getDay() + 1
    const month = now.getMonth() + 1
    const hour = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const hundredths = now.getMilliseconds() / 10
    
    this.bits = []
    
    shiftBCD(year)
    shiftBCD(month)
    shiftBCD(day)
    shiftBCD(weekday)
    shiftBCD(hour)
    shiftBCD(minutes)
    shiftBCD(seconds)
    shiftBCD(hundredths)
  }
  
  private access = (addr: number) => {
    // bit A2 high = NSC read cycle, A2 low = write cycle
    if (addr & A2) {
      // Any "read" will reset the pattern matching
      this.reset()
    } else {
      // See if our bit matches the appropriate bit in the 64-bit pattern
      if (this.checkPattern((addr & A0) as bit)) {
        this.patternIdx++
        // If we successfully matched all 64 bits, calculate the time
        if (this.patternIdx === 64) {
          this.calcBits()
        }
      } else {
        this.reset()
      }
    }
  }
  
  read = (addr: number) => {
    let value = -1
    if (this.bits.length > 0) {
      // Only return a value if we have an NSC read cycle (A2 high)
      if (addr & A2) {
        value = this.bits.pop() as bit
      }
    } else {
      this.access(addr)
    }
    return value
  }

}

export const noSlotClock = new NoSlotClock()

