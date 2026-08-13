/**
 * Z80 CPU Emulator Core for Apple2TS Microsoft SoftCard Emulation.
 *
 * Implements full Z80 register set, flags, instruction decoding,
 * and memory/IO interface callbacks.
 */

export interface Z80Bus {
  readByte(address: number): number
  writeByte(address: number, value: number): void
  readIO?(port: number): number
  writeIO?(port: number, value: number): void
}

export class Z80 {
  // Main 8-bit registers
  a = 0
  f = 0
  b = 0
  c = 0
  d = 0
  e = 0
  h = 0
  l = 0

  // Alternate (shadow) 8-bit registers
  aPrime = 0
  fPrime = 0
  bPrime = 0
  cPrime = 0
  dPrime = 0
  ePrime = 0
  hPrime = 0
  lPrime = 0

  // Index registers
  ix = 0
  iy = 0

  // Special 16-bit registers
  sp = 0xffff
  pc = 0x0000

  // Interrupt & Refresh registers
  i = 0
  r = 0

  // State flags
  iff1 = false
  iff2 = false
  im = 1
  halted = false

  // Bus reference
  bus: Z80Bus

  // Flag constants
  static readonly FLAG_S  = 0x80 // Sign
  static readonly FLAG_Z  = 0x40 // Zero
  static readonly FLAG_Y  = 0x20 // Bit 5
  static readonly FLAG_H  = 0x10 // Half Carry
  static readonly FLAG_X  = 0x08 // Bit 3
  static readonly FLAG_PV = 0x04 // Parity / Overflow
  static readonly FLAG_N  = 0x02 // Add / Subtract
  static readonly FLAG_C  = 0x01 // Carry

  // Precomputed parity table for fast flag updates
  private parityTable: boolean[] = new Array(256)

  constructor(bus: Z80Bus) {
    this.bus = bus
    this.initParityTable()
    this.reset()
  }

  private initParityTable(): void {
    for (let i = 0; i < 256; i++) {
      let bits = 0
      for (let b = 0; b < 8; b++) {
        if (i & (1 << b)) bits++
      }
      this.parityTable[i] = (bits % 2 === 0)
    }
  }

  reset(): void {
    this.a = 0xff
    this.f = 0xff
    this.b = 0
    this.c = 0
    this.d = 0
    this.e = 0
    this.h = 0
    this.l = 0

    this.aPrime = 0
    this.fPrime = 0
    this.bPrime = 0
    this.cPrime = 0
    this.dPrime = 0
    this.ePrime = 0
    this.hPrime = 0
    this.lPrime = 0

    this.ix = 0xffff
    this.iy = 0xffff
    this.sp = 0xffff
    this.pc = 0x0000

    this.i = 0
    this.r = 0
    this.iff1 = false
    this.iff2 = false
    this.im = 1
    this.halted = false
  }

  // Register pair getters & setters
  get bc(): number { return ((this.b << 8) | this.c) & 0xffff }
  set bc(val: number) { this.b = (val >> 8) & 0xff; this.c = val & 0xff }

  get de(): number { return ((this.d << 8) | this.e) & 0xffff }
  set de(val: number) { this.d = (val >> 8) & 0xff; this.e = val & 0xff }

  get hl(): number { return ((this.h << 8) | this.l) & 0xffff }
  set hl(val: number) { this.h = (val >> 8) & 0xff; this.l = val & 0xff }

  get af(): number { return ((this.a << 8) | this.f) & 0xffff }
  set af(val: number) { this.a = (val >> 8) & 0xff; this.f = val & 0xff }

  // Memory access helper methods
  read8(addr: number): number {
    return this.bus.readByte(addr & 0xffff) & 0xff
  }

  write8(addr: number, val: number): void {
    this.bus.writeByte(addr & 0xffff, val & 0xff)
  }

  read16(addr: number): number {
    const low = this.read8(addr)
    const high = this.read8(addr + 1)
    return ((high << 8) | low) & 0xffff
  }

  write16(addr: number, val: number): void {
    this.write8(addr, val & 0xff)
    this.write8(addr + 1, (val >> 8) & 0xff)
  }

  push16(val: number): void {
    this.sp = (this.sp - 2) & 0xffff
    this.write16(this.sp, val)
  }

  pop16(): number {
    const val = this.read16(this.sp)
    this.sp = (this.sp + 2) & 0xffff
    return val
  }

  // Fetch byte from PC
  fetch8(): number {
    const val = this.read8(this.pc)
    this.pc = (this.pc + 1) & 0xffff
    this.r = (this.r & 0x80) | ((this.r + 1) & 0x7f)
    return val
  }

  fetch16(): number {
    const low = this.fetch8()
    const high = this.fetch8()
    return ((high << 8) | low) & 0xffff
  }

  // Read signed 8-bit offset (for relative jumps & IX/IY displacement)
  fetchSigned8(): number {
    const val = this.fetch8()
    return val >= 0x80 ? val - 0x100 : val
  }

  // Core instruction step execution (returns T-states elapsed)
  step(): number {
    if (this.halted) {
      this.r = (this.r & 0x80) | ((this.r + 1) & 0x7f)
      return 4
    }

    const opcode = this.fetch8()
    return this.executeOpcode(opcode)
  }

  // Execute single opcode or prefix dispatch
  private executeOpcode(op: number): number {
    switch (op) {
      // NOP
      case 0x00: return 4

      // LD BC, nn
      case 0x01: this.bc = this.fetch16(); return 10
      // LD (BC), A
      case 0x02: this.write8(this.bc, this.a); return 7
      // INC BC
      case 0x03: this.bc = (this.bc + 1) & 0xffff; return 6
      // INC B
      case 0x04: this.b = this.inc8(this.b); return 4
      // DEC B
      case 0x05: this.b = this.dec8(this.b); return 4
      // LD B, n
      case 0x06: this.b = this.fetch8(); return 7
      // RLCA
      case 0x07: {
        const c = (this.a & 0x80) !== 0
        this.a = ((this.a << 1) | (c ? 1 : 0)) & 0xff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 (c ? Z80.FLAG_C : 0) | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // EX AF, AF'
      case 0x08: {
        const tmpA = this.a; this.a = this.aPrime; this.aPrime = tmpA
        const tmpF = this.f; this.f = this.fPrime; this.fPrime = tmpF
        return 4
      }
      // ADD HL, BC
      case 0x09: this.addHL(this.bc); return 11
      // LD A, (BC)
      case 0x0a: this.a = this.read8(this.bc); return 7
      // DEC BC
      case 0x0b: this.bc = (this.bc - 1) & 0xffff; return 6
      // INC C
      case 0x0c: this.c = this.inc8(this.c); return 4
      // DEC C
      case 0x0d: this.c = this.dec8(this.c); return 4
      // LD C, n
      case 0x0e: this.c = this.fetch8(); return 7
      // RRCA
      case 0x0f: {
        const c = (this.a & 0x01) !== 0
        this.a = ((this.a >> 1) | (c ? 0x80 : 0)) & 0xff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 (c ? Z80.FLAG_C : 0) | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // DJNZ e
      case 0x10: {
        const offset = this.fetchSigned8()
        this.b = (this.b - 1) & 0xff
        if (this.b !== 0) {
          this.pc = (this.pc + offset) & 0xffff
          return 13
        }
        return 8
      }
      // LD DE, nn
      case 0x11: this.de = this.fetch16(); return 10
      // LD (DE), A
      case 0x12: this.write8(this.de, this.a); return 7
      // INC DE
      case 0x13: this.de = (this.de + 1) & 0xffff; return 6
      // INC D
      case 0x14: this.d = this.inc8(this.d); return 4
      // DEC D
      case 0x15: this.d = this.dec8(this.d); return 4
      // LD D, n
      case 0x16: this.d = this.fetch8(); return 7
      // RLA
      case 0x17: {
        const oldC = (this.f & Z80.FLAG_C) !== 0
        const newC = (this.a & 0x80) !== 0
        this.a = ((this.a << 1) | (oldC ? 1 : 0)) & 0xff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 (newC ? Z80.FLAG_C : 0) | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // JR e
      case 0x18: {
        const offset = this.fetchSigned8()
        this.pc = (this.pc + offset) & 0xffff
        return 12
      }
      // ADD HL, DE
      case 0x19: this.addHL(this.de); return 11
      // LD A, (DE)
      case 0x1a: this.a = this.read8(this.de); return 7
      // DEC DE
      case 0x1b: this.de = (this.de - 1) & 0xffff; return 6
      // INC E
      case 0x1c: this.e = this.inc8(this.e); return 4
      // DEC E
      case 0x1d: this.e = this.dec8(this.e); return 4
      // LD E, n
      case 0x1e: this.e = this.fetch8(); return 7
      // RRA
      case 0x1f: {
        const oldC = (this.f & Z80.FLAG_C) !== 0
        const newC = (this.a & 0x01) !== 0
        this.a = ((this.a >> 1) | (oldC ? 0x80 : 0)) & 0xff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 (newC ? Z80.FLAG_C : 0) | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // JR NZ, e
      case 0x20: {
        const offset = this.fetchSigned8()
        if ((this.f & Z80.FLAG_Z) === 0) {
          this.pc = (this.pc + offset) & 0xffff
          return 12
        }
        return 7
      }
      // LD HL, nn
      case 0x21: this.hl = this.fetch16(); return 10
      // LD (nn), HL
      case 0x22: {
        const addr = this.fetch16()
        this.write16(addr, this.hl)
        return 16
      }
      // INC HL
      case 0x23: this.hl = (this.hl + 1) & 0xffff; return 6
      // INC H
      case 0x24: this.h = this.inc8(this.h); return 4
      // DEC H
      case 0x25: this.h = this.dec8(this.h); return 4
      // LD H, n
      case 0x26: this.h = this.fetch8(); return 7
      // DAA
      case 0x27: this.daa(); return 4

      // JR Z, e
      case 0x28: {
        const offset = this.fetchSigned8()
        if ((this.f & Z80.FLAG_Z) !== 0) {
          this.pc = (this.pc + offset) & 0xffff
          return 12
        }
        return 7
      }
      // ADD HL, HL
      case 0x29: this.addHL(this.hl); return 11
      // LD HL, (nn)
      case 0x2a: {
        const addr = this.fetch16()
        this.hl = this.read16(addr)
        return 16
      }
      // DEC HL
      case 0x2b: this.hl = (this.hl - 1) & 0xffff; return 6
      // INC L
      case 0x2c: this.l = this.inc8(this.l); return 4
      // DEC L
      case 0x2d: this.l = this.dec8(this.l); return 4
      // LD L, n
      case 0x2e: this.l = this.fetch8(); return 7
      // CPL
      case 0x2f: {
        this.a = (~this.a) & 0xff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV | Z80.FLAG_C)) |
                 Z80.FLAG_H | Z80.FLAG_N | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // JR NC, e
      case 0x30: {
        const offset = this.fetchSigned8()
        if ((this.f & Z80.FLAG_C) === 0) {
          this.pc = (this.pc + offset) & 0xffff
          return 12
        }
        return 7
      }
      // LD SP, nn
      case 0x31: this.sp = this.fetch16(); return 10
      // LD (nn), A
      case 0x32: {
        const addr = this.fetch16()
        this.write8(addr, this.a)
        return 13
      }
      // INC SP
      case 0x33: this.sp = (this.sp + 1) & 0xffff; return 6
      // INC (HL)
      case 0x34: {
        const val = this.read8(this.hl)
        this.write8(this.hl, this.inc8(val))
        return 11
      }
      // DEC (HL)
      case 0x35: {
        const val = this.read8(this.hl)
        this.write8(this.hl, this.dec8(val))
        return 11
      }
      // LD (HL), n
      case 0x36: this.write8(this.hl, this.fetch8()); return 10
      // SCF
      case 0x37: {
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 Z80.FLAG_C | (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // JR C, e
      case 0x38: {
        const offset = this.fetchSigned8()
        if ((this.f & Z80.FLAG_C) !== 0) {
          this.pc = (this.pc + offset) & 0xffff
          return 12
        }
        return 7
      }
      // ADD HL, SP
      case 0x39: this.addHL(this.sp); return 11
      // LD A, (nn)
      case 0x3a: {
        const addr = this.fetch16()
        this.a = this.read8(addr)
        return 13
      }
      // DEC SP
      case 0x3b: this.sp = (this.sp - 1) & 0xffff; return 6
      // INC A
      case 0x3c: this.a = this.inc8(this.a); return 4
      // DEC A
      case 0x3d: this.a = this.dec8(this.a); return 4
      // LD A, n
      case 0x3e: this.a = this.fetch8(); return 7
      // CCF
      case 0x3f: {
        const c = (this.f & Z80.FLAG_C) !== 0
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
                 (c ? Z80.FLAG_H : 0) | (c ? 0 : Z80.FLAG_C) |
                 (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
        return 4
      }

      // LD r, r' (0x40 - 0x7f)
      case 0x40: return 4 // LD B, B
      case 0x41: this.b = this.c; return 4
      case 0x42: this.b = this.d; return 4
      case 0x43: this.b = this.e; return 4
      case 0x44: this.b = this.h; return 4
      case 0x45: this.b = this.l; return 4
      case 0x46: this.b = this.read8(this.hl); return 7
      case 0x47: this.b = this.a; return 4

      case 0x48: this.c = this.b; return 4
      case 0x49: return 4 // LD C, C
      case 0x4a: this.c = this.d; return 4
      case 0x4b: this.c = this.e; return 4
      case 0x4c: this.c = this.h; return 4
      case 0x4d: this.c = this.l; return 4
      case 0x4e: this.c = this.read8(this.hl); return 7
      case 0x4f: this.c = this.a; return 4

      case 0x50: this.d = this.b; return 4
      case 0x51: this.d = this.c; return 4
      case 0x52: return 4 // LD D, D
      case 0x53: this.d = this.e; return 4
      case 0x54: this.d = this.h; return 4
      case 0x55: this.d = this.l; return 4
      case 0x56: this.d = this.read8(this.hl); return 7
      case 0x57: this.d = this.a; return 4

      case 0x58: this.e = this.b; return 4
      case 0x59: this.e = this.c; return 4
      case 0x5a: this.e = this.d; return 4
      case 0x5b: return 4 // LD E, E
      case 0x5c: this.e = this.h; return 4
      case 0x5d: this.e = this.l; return 4
      case 0x5e: this.e = this.read8(this.hl); return 7
      case 0x5f: this.e = this.a; return 4

      case 0x60: this.h = this.b; return 4
      case 0x61: this.h = this.c; return 4
      case 0x62: this.h = this.d; return 4
      case 0x63: this.h = this.e; return 4
      case 0x64: return 4 // LD H, H
      case 0x65: this.h = this.l; return 4
      case 0x66: this.h = this.read8(this.hl); return 7
      case 0x67: this.h = this.a; return 4

      case 0x68: this.l = this.b; return 4
      case 0x69: this.l = this.c; return 4
      case 0x6a: this.l = this.d; return 4
      case 0x6b: this.l = this.e; return 4
      case 0x6c: this.l = this.h; return 4
      case 0x6d: return 4 // LD L, L
      case 0x6e: this.l = this.read8(this.hl); return 7
      case 0x6f: this.l = this.a; return 4

      case 0x70: this.write8(this.hl, this.b); return 7
      case 0x71: this.write8(this.hl, this.c); return 7
      case 0x72: this.write8(this.hl, this.d); return 7
      case 0x73: this.write8(this.hl, this.e); return 7
      case 0x74: this.write8(this.hl, this.h); return 7
      case 0x75: this.write8(this.hl, this.l); return 7
      case 0x76: this.halted = true; return 4 // HALT
      case 0x77: this.write8(this.hl, this.a); return 7

      case 0x78: this.a = this.b; return 4
      case 0x79: this.a = this.c; return 4
      case 0x7a: this.a = this.d; return 4
      case 0x7b: this.a = this.e; return 4
      case 0x7c: this.a = this.h; return 4
      case 0x7d: this.a = this.l; return 4
      case 0x7e: this.a = this.read8(this.hl); return 7
      case 0x7f: return 4 // LD A, A

      // ALU operations A, r (0x80 - 0xbf)
      case 0x80: this.add8(this.b); return 4
      case 0x81: this.add8(this.c); return 4
      case 0x82: this.add8(this.d); return 4
      case 0x83: this.add8(this.e); return 4
      case 0x84: this.add8(this.h); return 4
      case 0x85: this.add8(this.l); return 4
      case 0x86: this.add8(this.read8(this.hl)); return 7
      case 0x87: this.add8(this.a); return 4

      case 0x88: this.adc8(this.b); return 4
      case 0x89: this.adc8(this.c); return 4
      case 0x8a: this.adc8(this.d); return 4
      case 0x8b: this.adc8(this.e); return 4
      case 0x8c: this.adc8(this.h); return 4
      case 0x8d: this.adc8(this.l); return 4
      case 0x8e: this.adc8(this.read8(this.hl)); return 7
      case 0x8f: this.adc8(this.a); return 4

      case 0x90: this.sub8(this.b); return 4
      case 0x91: this.sub8(this.c); return 4
      case 0x92: this.sub8(this.d); return 4
      case 0x93: this.sub8(this.e); return 4
      case 0x94: this.sub8(this.h); return 4
      case 0x95: this.sub8(this.l); return 4
      case 0x96: this.sub8(this.read8(this.hl)); return 7
      case 0x97: this.sub8(this.a); return 4

      case 0x98: this.sbc8(this.b); return 4
      case 0x99: this.sbc8(this.c); return 4
      case 0x9a: this.sbc8(this.d); return 4
      case 0x9b: this.sbc8(this.e); return 4
      case 0x9c: this.sbc8(this.h); return 4
      case 0x9d: this.sbc8(this.l); return 4
      case 0x9e: this.sbc8(this.read8(this.hl)); return 7
      case 0x9f: this.sbc8(this.a); return 4

      case 0xa0: this.and8(this.b); return 4
      case 0xa1: this.and8(this.c); return 4
      case 0xa2: this.and8(this.d); return 4
      case 0xa3: this.and8(this.e); return 4
      case 0xa4: this.and8(this.h); return 4
      case 0xa5: this.and8(this.l); return 4
      case 0xa6: this.and8(this.read8(this.hl)); return 7
      case 0xa7: this.and8(this.a); return 4

      case 0xa8: this.xor8(this.b); return 4
      case 0xa9: this.xor8(this.c); return 4
      case 0xaa: this.xor8(this.d); return 4
      case 0xab: this.xor8(this.e); return 4
      case 0xac: this.xor8(this.h); return 4
      case 0xad: this.xor8(this.l); return 4
      case 0xae: this.xor8(this.read8(this.hl)); return 7
      case 0xaf: this.xor8(this.a); return 4

      case 0xb0: this.or8(this.b); return 4
      case 0xb1: this.or8(this.c); return 4
      case 0xb2: this.or8(this.d); return 4
      case 0xb3: this.or8(this.e); return 4
      case 0xb4: this.or8(this.h); return 4
      case 0xb5: this.or8(this.l); return 4
      case 0xb6: this.or8(this.read8(this.hl)); return 7
      case 0xb7: this.or8(this.a); return 4

      case 0xb8: this.cp8(this.b); return 4
      case 0xb9: this.cp8(this.c); return 4
      case 0xba: this.cp8(this.d); return 4
      case 0xbb: this.cp8(this.e); return 4
      case 0xbc: this.cp8(this.h); return 4
      case 0xbd: this.cp8(this.l); return 4
      case 0xbe: this.cp8(this.read8(this.hl)); return 7
      case 0xbf: this.cp8(this.a); return 4

      // RET NZ
      case 0xc0: if ((this.f & Z80.FLAG_Z) === 0) { this.pc = this.pop16(); return 11 } return 5
      // POP BC
      case 0xc1: this.bc = this.pop16(); return 10
      // JP NZ, nn
      case 0xc2: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_Z) === 0) this.pc = addr
        return 10
      }
      // JP nn
      case 0xc3: this.pc = this.fetch16(); return 10
      // CALL NZ, nn
      case 0xc4: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_Z) === 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // PUSH BC
      case 0xc5: this.push16(this.bc); return 11
      // ADD A, n
      case 0xc6: this.add8(this.fetch8()); return 7
      // RST 00h
      case 0xc7: this.push16(this.pc); this.pc = 0x0000; return 11

      // RET Z
      case 0xc8: if ((this.f & Z80.FLAG_Z) !== 0) { this.pc = this.pop16(); return 11 } return 5
      // RET
      case 0xc9: this.pc = this.pop16(); return 10
      // JP Z, nn
      case 0xca: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_Z) !== 0) this.pc = addr
        return 10
      }
      // CB Prefix (Bitwise / Shift)
      case 0xcb: return this.executeCBPrefix()
      // CALL Z, nn
      case 0xcc: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_Z) !== 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // CALL nn
      case 0xcd: {
        const addr = this.fetch16()
        this.push16(this.pc)
        this.pc = addr
        return 17
      }
      // ADC A, n
      case 0xce: this.adc8(this.fetch8()); return 7
      // RST 08h
      case 0xcf: this.push16(this.pc); this.pc = 0x0008; return 11

      // RET NC
      case 0xd0: if ((this.f & Z80.FLAG_C) === 0) { this.pc = this.pop16(); return 11 } return 5
      // POP DE
      case 0xd1: this.de = this.pop16(); return 10
      // JP NC, nn
      case 0xd2: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_C) === 0) this.pc = addr
        return 10
      }
      // OUT (n), A
      case 0xd3: {
        const port = this.fetch8()
        if (this.bus.writeIO) {
          this.bus.writeIO((this.a << 8) | port, this.a)
        }
        return 11
      }
      // CALL NC, nn
      case 0xd4: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_C) === 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // PUSH DE
      case 0xd5: this.push16(this.de); return 11
      // SUB n
      case 0xd6: this.sub8(this.fetch8()); return 7
      // RST 10h
      case 0xd7: this.push16(this.pc); this.pc = 0x0010; return 11

      // RET C
      case 0xd8: if ((this.f & Z80.FLAG_C) !== 0) { this.pc = this.pop16(); return 11 } return 5
      // EXX
      case 0xd9: {
        let tmp = this.b; this.b = this.bPrime; this.bPrime = tmp
        tmp = this.c; this.c = this.cPrime; this.cPrime = tmp
        tmp = this.d; this.d = this.dPrime; this.dPrime = tmp
        tmp = this.e; this.e = this.ePrime; this.ePrime = tmp
        tmp = this.h; this.h = this.hPrime; this.hPrime = tmp
        tmp = this.l; this.l = this.lPrime; this.lPrime = tmp
        return 4
      }
      // JP C, nn
      case 0xda: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_C) !== 0) this.pc = addr
        return 10
      }
      // IN A, (n)
      case 0xdb: {
        const port = this.fetch8()
        if (this.bus.readIO) {
          this.a = this.bus.readIO((this.a << 8) | port) & 0xff
        }
        return 11
      }
      // CALL C, nn
      case 0xdc: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_C) !== 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // DD Prefix (IX)
      case 0xdd: return this.executeIXIYPrefix(true)
      // SBC A, n
      case 0xde: this.sbc8(this.fetch8()); return 7
      // RST 18h
      case 0xdf: this.push16(this.pc); this.pc = 0x0018; return 11

      // RET PO
      case 0xe0: if ((this.f & Z80.FLAG_PV) === 0) { this.pc = this.pop16(); return 11 } return 5
      // POP HL
      case 0xe1: this.hl = this.pop16(); return 10
      // JP PO, nn
      case 0xe2: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_PV) === 0) this.pc = addr
        return 10
      }
      // EX (SP), HL
      case 0xe3: {
        const val = this.read16(this.sp)
        this.write16(this.sp, this.hl)
        this.hl = val
        return 19
      }
      // CALL PO, nn
      case 0xe4: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_PV) === 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // PUSH HL
      case 0xe5: this.push16(this.hl); return 11
      // AND n
      case 0xe6: this.and8(this.fetch8()); return 7
      // RST 20h
      case 0xe7: this.push16(this.pc); this.pc = 0x0020; return 11

      // RET PE
      case 0xe8: if ((this.f & Z80.FLAG_PV) !== 0) { this.pc = this.pop16(); return 11 } return 5
      // JP (HL)
      case 0xe9: this.pc = this.hl; return 4
      // JP PE, nn
      case 0xea: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_PV) !== 0) this.pc = addr
        return 10
      }
      // EX DE, HL
      case 0xeb: {
        const tmp = this.de
        this.de = this.hl
        this.hl = tmp
        return 4
      }
      // CALL PE, nn
      case 0xec: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_PV) !== 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // ED Prefix (Extended Instructions)
      case 0xed: return this.executeEDPrefix()
      // XOR n
      case 0xee: this.xor8(this.fetch8()); return 7
      // RST 28h
      case 0xef: this.push16(this.pc); this.pc = 0x0028; return 11

      // RET P
      case 0xf0: if ((this.f & Z80.FLAG_S) === 0) { this.pc = this.pop16(); return 11 } return 5
      // POP AF
      case 0xf1: this.af = this.pop16(); return 10
      // JP P, nn
      case 0xf2: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_S) === 0) this.pc = addr
        return 10
      }
      // DI
      case 0xf3: this.iff1 = false; this.iff2 = false; return 4
      // CALL P, nn
      case 0xf4: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_S) === 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // PUSH AF
      case 0xf5: this.push16(this.af); return 11
      // OR n
      case 0xf6: this.or8(this.fetch8()); return 7
      // RST 30h
      case 0xf7: this.push16(this.pc); this.pc = 0x0030; return 11

      // RET M
      case 0xf8: if ((this.f & Z80.FLAG_S) !== 0) { this.pc = this.pop16(); return 11 } return 5
      // LD SP, HL
      case 0xf9: this.sp = this.hl; return 6
      // JP M, nn
      case 0xfa: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_S) !== 0) this.pc = addr
        return 10
      }
      // EI
      case 0xfb: this.iff1 = true; this.iff2 = true; return 4
      // CALL M, nn
      case 0xfc: {
        const addr = this.fetch16()
        if ((this.f & Z80.FLAG_S) !== 0) {
          this.push16(this.pc)
          this.pc = addr
          return 17
        }
        return 10
      }
      // FD Prefix (IY)
      case 0xfd: return this.executeIXIYPrefix(false)
      // CP n
      case 0xfe: this.cp8(this.fetch8()); return 7
      // RST 38h
      case 0xff: this.push16(this.pc); this.pc = 0x0038; return 11

      default: return 4
    }
  }

  // Helper arithmetic & logic methods
  private inc8(val: number): number {
    const res = (val + 1) & 0xff
    this.f = (this.f & Z80.FLAG_C) |
             (res === 0 ? Z80.FLAG_Z : 0) |
             (res & Z80.FLAG_S) |
             ((res & 0x0f) === 0 ? Z80.FLAG_H : 0) |
             (val === 0x7f ? Z80.FLAG_PV : 0) |
             (res & (Z80.FLAG_Y | Z80.FLAG_X))
    return res
  }

  private dec8(val: number): number {
    const res = (val - 1) & 0xff
    this.f = (this.f & Z80.FLAG_C) |
             Z80.FLAG_N |
             (res === 0 ? Z80.FLAG_Z : 0) |
             (res & Z80.FLAG_S) |
             ((val & 0x0f) === 0 ? Z80.FLAG_H : 0) |
             (val === 0x80 ? Z80.FLAG_PV : 0) |
             (res & (Z80.FLAG_Y | Z80.FLAG_X))
    return res
  }

  private add8(val: number): void {
    const res = this.a + val
    const res8 = res & 0xff
    const carryBits = this.a ^ val ^ res8
    this.f = (res8 === 0 ? Z80.FLAG_Z : 0) |
             (res8 & Z80.FLAG_S) |
             ((carryBits & 0x10) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x80) !== 0 ? Z80.FLAG_PV : 0) |
             (res > 0xff ? Z80.FLAG_C : 0) |
             (res8 & (Z80.FLAG_Y | Z80.FLAG_X))
    this.a = res8
  }

  private adc8(val: number): void {
    const c = (this.f & Z80.FLAG_C) !== 0 ? 1 : 0
    const res = this.a + val + c
    const res8 = res & 0xff
    const carryBits = this.a ^ val ^ res8
    this.f = (res8 === 0 ? Z80.FLAG_Z : 0) |
             (res8 & Z80.FLAG_S) |
             ((carryBits & 0x10) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x80) !== 0 ? Z80.FLAG_PV : 0) |
             (res > 0xff ? Z80.FLAG_C : 0) |
             (res8 & (Z80.FLAG_Y | Z80.FLAG_X))
    this.a = res8
  }

  private sub8(val: number): void {
    const res = this.a - val
    const res8 = res & 0xff
    const carryBits = this.a ^ val ^ res8
    this.f = Z80.FLAG_N |
             (res8 === 0 ? Z80.FLAG_Z : 0) |
             (res8 & Z80.FLAG_S) |
             ((carryBits & 0x10) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x80) !== 0 ? Z80.FLAG_PV : 0) |
             (res < 0 ? Z80.FLAG_C : 0) |
             (res8 & (Z80.FLAG_Y | Z80.FLAG_X))
    this.a = res8
  }

  private sbc8(val: number): void {
    const c = (this.f & Z80.FLAG_C) !== 0 ? 1 : 0
    const res = this.a - val - c
    const res8 = res & 0xff
    const carryBits = this.a ^ val ^ res8
    this.f = Z80.FLAG_N |
             (res8 === 0 ? Z80.FLAG_Z : 0) |
             (res8 & Z80.FLAG_S) |
             ((carryBits & 0x10) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x80) !== 0 ? Z80.FLAG_PV : 0) |
             (res < 0 ? Z80.FLAG_C : 0) |
             (res8 & (Z80.FLAG_Y | Z80.FLAG_X))
    this.a = res8
  }

  private and8(val: number): void {
    this.a = (this.a & val) & 0xff
    this.f = Z80.FLAG_H |
             (this.a === 0 ? Z80.FLAG_Z : 0) |
             (this.a & Z80.FLAG_S) |
             (this.parityTable[this.a] ? Z80.FLAG_PV : 0) |
             (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
  }

  private xor8(val: number): void {
    this.a = (this.a ^ val) & 0xff
    this.f = (this.a === 0 ? Z80.FLAG_Z : 0) |
             (this.a & Z80.FLAG_S) |
             (this.parityTable[this.a] ? Z80.FLAG_PV : 0) |
             (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
  }

  private or8(val: number): void {
    this.a = (this.a | val) & 0xff
    this.f = (this.a === 0 ? Z80.FLAG_Z : 0) |
             (this.a & Z80.FLAG_S) |
             (this.parityTable[this.a] ? Z80.FLAG_PV : 0) |
             (this.a & (Z80.FLAG_Y | Z80.FLAG_X))
  }

  private cp8(val: number): void {
    const res = this.a - val
    const res8 = res & 0xff
    const carryBits = this.a ^ val ^ res8
    this.f = Z80.FLAG_N |
             (res8 === 0 ? Z80.FLAG_Z : 0) |
             (res8 & Z80.FLAG_S) |
             ((carryBits & 0x10) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x80) !== 0 ? Z80.FLAG_PV : 0) |
             (res < 0 ? Z80.FLAG_C : 0) |
             (val & (Z80.FLAG_Y | Z80.FLAG_X))
  }

  private addHL(val: number): void {
    const hl = this.hl
    const res = hl + val
    const carryBits = hl ^ val ^ res
    this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
             ((carryBits & 0x1000) !== 0 ? Z80.FLAG_H : 0) |
             (res > 0xffff ? Z80.FLAG_C : 0) |
             (((res >> 8) & 0xff) & (Z80.FLAG_Y | Z80.FLAG_X))
    this.hl = res & 0xffff
  }

  private daa(): void {
    let a = this.a
    let f = this.f
    let incr = 0
    let carry = false

    if ((f & Z80.FLAG_H) !== 0 || (a & 0x0f) > 0x09) incr |= 0x06
    if ((f & Z80.FLAG_C) !== 0 || a > 0x99) {
      incr |= 0x60
      carry = true
    }

    if ((f & Z80.FLAG_N) !== 0) {
      a = (a - incr) & 0xff
    } else {
      a = (a + incr) & 0xff
    }

    f = (f & Z80.FLAG_N) |
        (a === 0 ? Z80.FLAG_Z : 0) |
        (a & Z80.FLAG_S) |
        (this.parityTable[a] ? Z80.FLAG_PV : 0) |
        (carry ? Z80.FLAG_C : 0) |
        (a & (Z80.FLAG_Y | Z80.FLAG_X))

    this.a = a
    this.f = f
  }

  // Bit & Shift Prefix CB
  private executeCBPrefix(): number {
    const cbOp = this.fetch8()
    const regIdx = cbOp & 0x07
    const opType = (cbOp >> 3) & 0x07
    const group = (cbOp >> 6) & 0x03

    let val = this.getRegByIdx(regIdx)

    if (group === 0) {
      // Shift / Rotate
      switch (opType) {
        case 0: { // RLC
          const c = (val & 0x80) !== 0
          val = ((val << 1) | (c ? 1 : 0)) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
        case 1: { // RRC
          const c = (val & 0x01) !== 0
          val = ((val >> 1) | (c ? 0x80 : 0)) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
        case 2: { // RL
          const oldC = (this.f & Z80.FLAG_C) !== 0
          const newC = (val & 0x80) !== 0
          val = ((val << 1) | (oldC ? 1 : 0)) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (newC ? Z80.FLAG_C : 0)
          break
        }
        case 3: { // RR
          const oldC = (this.f & Z80.FLAG_C) !== 0
          const newC = (val & 0x01) !== 0
          val = ((val >> 1) | (oldC ? 0x80 : 0)) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (newC ? Z80.FLAG_C : 0)
          break
        }
        case 4: { // SLA
          const c = (val & 0x80) !== 0
          val = (val << 1) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
        case 5: { // SRA
          const c = (val & 0x01) !== 0
          val = ((val >> 1) | (val & 0x80)) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
        case 6: { // SLL (undocumented)
          const c = (val & 0x80) !== 0
          val = ((val << 1) | 1) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
        case 7: { // SRL
          const c = (val & 0x01) !== 0
          val = (val >> 1) & 0xff
          this.f = (val === 0 ? Z80.FLAG_Z : 0) | (val & Z80.FLAG_S) | (this.parityTable[val] ? Z80.FLAG_PV : 0) | (c ? Z80.FLAG_C : 0)
          break
        }
      }
      this.setRegByIdx(regIdx, val)
      return regIdx === 6 ? 15 : 8
    } else if (group === 1) {
      // BIT b, r
      const bit = opType
      const bitVal = (val & (1 << bit)) !== 0
      this.f = (this.f & Z80.FLAG_C) | Z80.FLAG_H | (bitVal ? 0 : (Z80.FLAG_Z | Z80.FLAG_PV)) | (val & (Z80.FLAG_Y | Z80.FLAG_X))
      return regIdx === 6 ? 12 : 8
    } else if (group === 2) {
      // RES b, r
      val &= ~(1 << opType)
      this.setRegByIdx(regIdx, val & 0xff)
      return regIdx === 6 ? 15 : 8
    } else {
      // SET b, r
      val |= (1 << opType)
      this.setRegByIdx(regIdx, val & 0xff)
      return regIdx === 6 ? 15 : 8
    }
  }

  private sbcHL(val: number): void {
    const c = (this.f & Z80.FLAG_C) !== 0 ? 1 : 0
    const hl = this.hl
    const res = hl - val - c
    const res16 = res & 0xffff
    const carryBits = hl ^ val ^ res16
    this.f = Z80.FLAG_N |
             (res16 === 0 ? Z80.FLAG_Z : 0) |
             ((res16 >> 8) & Z80.FLAG_S) |
             ((carryBits & 0x1000) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x8000) !== 0 ? Z80.FLAG_PV : 0) |
             (res < 0 ? Z80.FLAG_C : 0)
    this.hl = res16
  }

  private adcHL(val: number): void {
    const c = (this.f & Z80.FLAG_C) !== 0 ? 1 : 0
    const hl = this.hl
    const res = hl + val + c
    const res16 = res & 0xffff
    const carryBits = hl ^ val ^ res16
    this.f = (res16 === 0 ? Z80.FLAG_Z : 0) |
             ((res16 >> 8) & Z80.FLAG_S) |
             ((carryBits & 0x1000) !== 0 ? Z80.FLAG_H : 0) |
             ((carryBits & 0x8000) !== 0 ? Z80.FLAG_PV : 0) |
             (res > 0xffff ? Z80.FLAG_C : 0)
    this.hl = res16
  }

  // Extended ED Prefix
  private executeEDPrefix(): number {
    const edOp = this.fetch8()
    switch (edOp) {
      // LD I, A
      case 0x47: this.i = this.a; return 9
      // LD R, A
      case 0x4f: this.r = this.a; return 9
      // LD A, I
      case 0x57: {
        this.a = this.i
        this.f = (this.f & Z80.FLAG_C) | (this.a === 0 ? Z80.FLAG_Z : 0) | (this.a & Z80.FLAG_S) | (this.iff2 ? Z80.FLAG_PV : 0)
        return 9
      }
      // LD A, R
      case 0x5f: {
        this.a = this.r
        this.f = (this.f & Z80.FLAG_C) | (this.a === 0 ? Z80.FLAG_Z : 0) | (this.a & Z80.FLAG_S) | (this.iff2 ? Z80.FLAG_PV : 0)
        return 9
      }
      // LD (nn), BC / DE / HL / SP
      case 0x43: { const addr = this.fetch16(); this.write16(addr, this.bc); return 20 }
      case 0x53: { const addr = this.fetch16(); this.write16(addr, this.de); return 20 }
      case 0x63: { const addr = this.fetch16(); this.write16(addr, this.hl); return 20 }
      case 0x73: { const addr = this.fetch16(); this.write16(addr, this.sp); return 20 }
      // LD BC / DE / HL / SP, (nn)
      case 0x4b: { const addr = this.fetch16(); this.bc = this.read16(addr); return 20 }
      case 0x5b: { const addr = this.fetch16(); this.de = this.read16(addr); return 20 }
      case 0x6b: { const addr = this.fetch16(); this.hl = this.read16(addr); return 20 }
      case 0x7b: { const addr = this.fetch16(); this.sp = this.read16(addr); return 20 }
      // SBC HL, BC / DE / HL / SP
      case 0x42: this.sbcHL(this.bc); return 15
      case 0x52: this.sbcHL(this.de); return 15
      case 0x62: this.sbcHL(this.hl); return 15
      case 0x72: this.sbcHL(this.sp); return 15
      // ADC HL, BC / DE / HL / SP
      case 0x4a: this.adcHL(this.bc); return 15
      case 0x5a: this.adcHL(this.de); return 15
      case 0x6a: this.adcHL(this.hl); return 15
      case 0x7a: this.adcHL(this.sp); return 15
      // NEG
      case 0x44: case 0x54: case 0x64: case 0x74:
      case 0x4c: case 0x5c: case 0x6c: case 0x7c: {
        const oldA = this.a
        this.a = 0
        this.sub8(oldA)
        return 8
      }
      // RETN / RETI
      case 0x45: case 0x55: case 0x65: case 0x75:
      case 0x4d: case 0x5d: case 0x6d: case 0x7d: {
        this.pc = this.pop16()
        this.iff1 = this.iff2
        return 14
      }
      // LDI
      case 0xa0: {
        const val = this.read8(this.hl)
        this.write8(this.de, val)
        this.hl = (this.hl + 1) & 0xffff
        this.de = (this.de + 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_C)) | (this.bc !== 0 ? Z80.FLAG_PV : 0)
        return 16
      }
      // LDIR
      case 0xb0: {
        const val = this.read8(this.hl)
        this.write8(this.de, val)
        this.hl = (this.hl + 1) & 0xffff
        this.de = (this.de + 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_C)) | (this.bc !== 0 ? Z80.FLAG_PV : 0)
        if (this.bc !== 0) {
          this.pc = (this.pc - 2) & 0xffff
          return 21
        }
        return 16
      }
      // LDD
      case 0xa8: {
        const val = this.read8(this.hl)
        this.write8(this.de, val)
        this.hl = (this.hl - 1) & 0xffff
        this.de = (this.de - 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_C)) | (this.bc !== 0 ? Z80.FLAG_PV : 0)
        return 16
      }
      // LDDR
      case 0xb8: {
        const val = this.read8(this.hl)
        this.write8(this.de, val)
        this.hl = (this.hl - 1) & 0xffff
        this.de = (this.de - 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_C)) | (this.bc !== 0 ? Z80.FLAG_PV : 0)
        if (this.bc !== 0) {
          this.pc = (this.pc - 2) & 0xffff
          return 21
        }
        return 16
      }
      // CPI
      case 0xa1: {
        const val = this.read8(this.hl)
        const res = (this.a - val) & 0xff
        this.hl = (this.hl + 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (Z80.FLAG_N) | (res === 0 ? Z80.FLAG_Z : 0) | (res & Z80.FLAG_S) | (this.bc !== 0 ? Z80.FLAG_PV : 0) | (this.f & Z80.FLAG_C)
        return 16
      }
      // CPIR
      case 0xb1: {
        const val = this.read8(this.hl)
        const res = (this.a - val) & 0xff
        this.hl = (this.hl + 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (Z80.FLAG_N) | (res === 0 ? Z80.FLAG_Z : 0) | (res & Z80.FLAG_S) | (this.bc !== 0 ? Z80.FLAG_PV : 0) | (this.f & Z80.FLAG_C)
        if (this.bc !== 0 && res !== 0) {
          this.pc = (this.pc - 2) & 0xffff
          return 21
        }
        return 16
      }
      // CPD
      case 0xa9: {
        const val = this.read8(this.hl)
        const res = (this.a - val) & 0xff
        this.hl = (this.hl - 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (Z80.FLAG_N) | (res === 0 ? Z80.FLAG_Z : 0) | (res & Z80.FLAG_S) | (this.bc !== 0 ? Z80.FLAG_PV : 0) | (this.f & Z80.FLAG_C)
        return 16
      }
      // CPDR
      case 0xb9: {
        const val = this.read8(this.hl)
        const res = (this.a - val) & 0xff
        this.hl = (this.hl - 1) & 0xffff
        this.bc = (this.bc - 1) & 0xffff
        this.f = (Z80.FLAG_N) | (res === 0 ? Z80.FLAG_Z : 0) | (res & Z80.FLAG_S) | (this.bc !== 0 ? Z80.FLAG_PV : 0) | (this.f & Z80.FLAG_C)
        if (this.bc !== 0 && res !== 0) {
          this.pc = (this.pc - 2) & 0xffff
          return 21
        }
        return 16
      }
      // IM 0, 1, 2
      case 0x46: case 0x66: this.im = 0; return 8
      case 0x56: case 0x76: this.im = 1; return 8
      case 0x5e: case 0x7e: this.im = 2; return 8
      default: return 8
    }
  }

  // IX / IY Prefix (DD / FD)
  private executeIXIYPrefix(isIX: boolean): number {
    const prefixOp = this.fetch8()
    const getReg = (): number => isIX ? this.ix : this.iy
    const setReg = (val: number): void => { if (isIX) this.ix = val & 0xffff; else this.iy = val & 0xffff }

    // LD IX/IY, nn
    if (prefixOp === 0x21) {
      setReg(this.fetch16())
      return 14
    }
    // LD (nn), IX/IY
    if (prefixOp === 0x22) {
      this.write16(this.fetch16(), getReg())
      return 20
    }
    // LD IX/IY, (nn)
    if (prefixOp === 0x2a) {
      setReg(this.read16(this.fetch16()))
      return 20
    }
    // INC IX/IY
    if (prefixOp === 0x23) {
      setReg(getReg() + 1)
      return 10
    }
    // DEC IX/IY
    if (prefixOp === 0x2b) {
      setReg(getReg() - 1)
      return 10
    }
    // POP IX/IY
    if (prefixOp === 0xe1) {
      setReg(this.pop16())
      return 14
    }
    // PUSH IX/IY
    if (prefixOp === 0xe5) {
      this.push16(getReg())
      return 15
    }
    // LD SP, IX/IY
    if (prefixOp === 0xf9) {
      this.sp = getReg()
      return 10
    }
    // EX (SP), IX/IY
    if (prefixOp === 0xe3) {
      const tmp = this.read16(this.sp)
      this.write16(this.sp, getReg())
      setReg(tmp)
      return 23
    }
    // JP (IX/IY)
    if (prefixOp === 0xe9) {
      this.pc = getReg()
      return 8
    }
    // ADD IX/IY, rr
    if (prefixOp === 0x09 || prefixOp === 0x19 || prefixOp === 0x29 || prefixOp === 0x39) {
      const regVal = prefixOp === 0x09 ? this.bc : prefixOp === 0x19 ? this.de : prefixOp === 0x29 ? getReg() : this.sp
      const base = getReg()
      const res = base + regVal
      const carryBits = base ^ regVal ^ res
      this.f = (this.f & (Z80.FLAG_S | Z80.FLAG_Z | Z80.FLAG_PV)) |
               ((carryBits & 0x1000) !== 0 ? Z80.FLAG_H : 0) |
               (res > 0xffff ? Z80.FLAG_C : 0)
      setReg(res)
      return 15
    }

    // IX/IY Displacement Opcodes: (IX+d) / (IY+d)
    // INC (IX+d)
    if (prefixOp === 0x34) {
      const d = this.fetchSigned8()
      const addr = (getReg() + d) & 0xffff
      const val = this.inc8(this.read8(addr))
      this.write8(addr, val)
      return 23
    }
    // DEC (IX+d)
    if (prefixOp === 0x35) {
      const d = this.fetchSigned8()
      const addr = (getReg() + d) & 0xffff
      const val = this.dec8(this.read8(addr))
      this.write8(addr, val)
      return 23
    }
    // LD (IX+d), n
    if (prefixOp === 0x36) {
      const d = this.fetchSigned8()
      const val = this.fetch8()
      this.write8((getReg() + d) & 0xffff, val)
      return 19
    }
    // LD r, (IX+d)  (opcodes 0x46, 0x4E, 0x56, 0x5E, 0x66, 0x6E, 0x7E)
    if ([0x46, 0x4e, 0x56, 0x5e, 0x66, 0x6e, 0x7e].includes(prefixOp)) {
      const d = this.fetchSigned8()
      const val = this.read8((getReg() + d) & 0xffff)
      const rIdx = (prefixOp - 0x40) >> 3
      this.setRegByIdx(rIdx, val)
      return 19
    }
    // LD (IX+d), r  (opcodes 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x77)
    if ([0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x77].includes(prefixOp)) {
      const d = this.fetchSigned8()
      const rIdx = prefixOp & 0x07
      this.write8((getReg() + d) & 0xffff, this.getRegByIdx(rIdx))
      return 19
    }
    // ALU A, (IX+d): ADD(0x86), ADC(0x8E), SUB(0x96), SBC(0x9E), AND(0xA6), XOR(0xAE), OR(0xB6), CP(0xBE)
    if ([0x86, 0x8e, 0x96, 0x9e, 0xa6, 0xae, 0xb6, 0xbe].includes(prefixOp)) {
      const d = this.fetchSigned8()
      const val = this.read8((getReg() + d) & 0xffff)
      switch (prefixOp) {
        case 0x86: this.add8(val); break
        case 0x8e: this.adc8(val); break
        case 0x96: this.sub8(val); break
        case 0x9e: this.sbc8(val); break
        case 0xa6: this.and8(val); break
        case 0xae: this.xor8(val); break
        case 0xb6: this.or8(val); break
        case 0xbe: this.cp8(val); break
      }
      return 19
    }

    // Default fallback execute normal opcode
    return this.executeOpcode(prefixOp)
  }

  private getRegByIdx(idx: number): number {
    switch (idx) {
      case 0: return this.b
      case 1: return this.c
      case 2: return this.d
      case 3: return this.e
      case 4: return this.h
      case 5: return this.l
      case 6: return this.read8(this.hl)
      case 7: return this.a
      default: return 0
    }
  }

  private setRegByIdx(idx: number, val: number): void {
    val &= 0xff
    switch (idx) {
      case 0: this.b = val; break
      case 1: this.c = val; break
      case 2: this.d = val; break
      case 3: this.e = val; break
      case 4: this.h = val; break
      case 5: this.l = val; break
      case 6: this.write8(this.hl, val); break
      case 7: this.a = val; break
    }
  }
}
