
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
  
  private patternMatch = () => {
    for (let idx = 0; idx < 8; idx++) {
      let byte = 0
      for (let jdx = 0; jdx < 8; jdx++) {
        byte >>= 1
        byte |= this.pattern.shift() ? 0x80 : 0x00
      }
      if (byte !== PATTERN[idx]) {
        return false
      }
    }
    return true
  }
  
  private calcBits = () => {
    const shift = (val: number) => {
      for (let idx = 0; idx < 4; idx++) {
        this.bits.push(val & 0x08 ? 0x01 : 0x00)
        val <<= 1
      }
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
  
  access = (addr: number) => {
    // only want offset, not page
    addr &= 0xFF
    if (addr & A2) {
      this.patternIdx = 0
    } else {
      const abit = addr & A0
      this.pattern[this.patternIdx++] = abit
      if (this.patternIdx === 64) {
        if (this.patternMatch()) {
          this.calcBits()
        }
        this.patternIdx = 0
      }
    }
  }
  
  read = (addr: number) => {
    addr &= 0xFF
    if (this.bits.length > 0) {
      const bit = this.bits.pop()
      return (bit !== undefined) ? bit : -1
    }
    this.access(addr)
    return -1
  }
  
  reset = () => {
    this.patternIdx = 0
  }
}

export const noSlotClock = new NoSlotClock()

