// ---------------------------------------------------------------------------
// Minimal standalone 6502 interpreter for running Exomizer decompression.
// ---------------------------------------------------------------------------
// Loads a packed binary into a flat 64 KB memory image, executes the
// decompression stub, and returns the resulting memory.  This is used at
// export time to decompress 4cade packed binaries so the HDV contains
// flat decompressed bytes — no runtime decompression on the Apple II.
//
// Only legal NMOS 6502 opcodes are implemented.  I/O soft-switch reads
// ($C000–$C0FF) return 0; writes are ignored.  This is sufficient for
// Exomizer / SAN INC packed binaries that don't need real hardware.
// ---------------------------------------------------------------------------

/** Execute a packed binary and return the 64 KB memory state.
 *  haltAddress: if provided, execution stops when PC reaches this address
 *  (used for multi-stage decompressors that JMP to the game entry).
 *  skipJSRs: set of addresses — JSR to any of these is treated as a NOP
 *  (skips game-init calls embedded in multi-stage decompressors).
 *  memInit: optional pre-fill regions applied BEFORE loading packedData.
 *  Used to set up dictionary state (e.g. HOME screen at $0400-$07FF). */
export const depack6502 = (
  packedData: Uint8Array,
  loadAddress: number,
  haltAddress?: number,
  skipJSRs?: Set<number>,
  memInit?: ReadonlyArray<{ addr: number; data: Uint8Array | readonly number[] }>,
): Uint8Array => {
  const mem = new Uint8Array(65536)
  mem.set(packedData, loadAddress)
  // memInit applied AFTER loading packed data so patches within the packed
  // binary range (e.g. BurgerTime $9014=$60) aren't overwritten by the load.
  if (memInit) {
    for (const { addr, data } of memInit) {
      for (let i = 0; i < data.length; i++) mem[(addr + i) & 0xFFFF] = data[i] & 0xFF
    }
  }

  // Trampoline at $FF00: JSR loadAddr; BRK
  const TRAMP = 0xFF00
  mem[TRAMP] = 0x20 // JSR
  mem[TRAMP + 1] = loadAddress & 0xFF
  mem[TRAMP + 2] = (loadAddress >> 8) & 0xFF
  mem[TRAMP + 3] = 0x00 // BRK → halt

  // If a halt address is specified, stop when PC reaches it instead of
  // placing a BRK (which the decompressor would overwrite with game data).
  const savedHaltByte = 0  // unused now but kept for API compat

  let PC = TRAMP
  let A = 0, X = 0, Y = 0, SP = 0xFF
  let N = false, V = false, D = false, I = true, Z = true, C = false

  const MAX_CYCLES = 50_000_000
  let cycles = 0

  // Stack helpers
  const push = (v: number) => { mem[0x100 + SP] = v & 0xFF; SP = (SP - 1) & 0xFF }
  const pull = () => { SP = (SP + 1) & 0xFF; return mem[0x100 + SP] }

  // Flag helpers
  const setNZ = (v: number) => { v &= 0xFF; N = (v & 0x80) !== 0; Z = v === 0; return v }
  const packP = () =>
    (N ? 0x80 : 0) | (V ? 0x40 : 0) | 0x20 | (D ? 0x08 : 0) |
    (I ? 0x04 : 0) | (Z ? 0x02 : 0) | (C ? 0x01 : 0)
  const unpackP = (p: number) => {
    N = !!(p & 0x80); V = !!(p & 0x40); D = !!(p & 0x08)
    I = !!(p & 0x04); Z = !!(p & 0x02); C = !!(p & 0x01)
  }

  // Memory read/write — soft-switch I/O is faked just enough to prevent
  // hardware-wait loops from hanging the decompressor:
  //   $C000 → 0x80 (keyboard: "key pressed" so BPL-wait loops exit)
  //   $C010 → 0x00 (keyboard strobe clear)
  //   $C030 → 0x00 (speaker toggle — ignore)
  //   $C050–$C05F → 0x00 (display switches — toggled by side-effect of read)
  //   $C061–$C067 → 0x00 (buttons/paddles — not pressed / timed out)
  //   everything else in $C000–$C0FF → 0x00
  const rd = (a: number): number => {
    if (a >= 0xC000 && a < 0xC100) {
      if (a === 0xC000) return 0x80  // keyboard: key pressed
      // VBL flag: toggle based on cycle count so both BPL and BMI loops exit.
      if (a === 0xC019) return (cycles & 0x2000) ? 0x80 : 0x00
      return 0
    }
    return mem[a]
  }
  const wr = (a: number, v: number) => {
    if (a >= 0xC000 && a < 0xC100) return // ignore I/O writes
    mem[a] = v & 0xFF
  }

  // Addressing-mode reads
  const imm = () => { const v = rd(PC); PC = (PC + 1) & 0xFFFF; return v }
  const zpAddr = () => imm()
  const zpXAddr = () => (imm() + X) & 0xFF
  const zpYAddr = () => (imm() + Y) & 0xFF
  const absAddr = () => { const lo = imm(); return lo | (imm() << 8) }
  const absXAddr = () => (absAddr() + X) & 0xFFFF
  const absYAddr = () => (absAddr() + Y) & 0xFFFF
  const indXAddr = () => { const z = (imm() + X) & 0xFF; return mem[z] | (mem[(z + 1) & 0xFF] << 8) }
  const indYAddr = () => { const z = imm(); return ((mem[z] | (mem[(z + 1) & 0xFF] << 8)) + Y) & 0xFFFF }

  // Branch helper
  const branch = (cond: boolean) => {
    const off = imm()
    if (cond) PC = (PC + (off > 127 ? off - 256 : off)) & 0xFFFF
  }

  // ADC / SBC (binary-mode only — decimal mode not needed for Exomizer)
  const adc = (v: number) => {
    const sum = A + v + (C ? 1 : 0)
    C = sum > 0xFF
    V = !!((~(A ^ v) & (A ^ sum)) & 0x80)
    A = setNZ(sum)
  }
  const sbc = (v: number) => {
    const diff = A - v - (C ? 0 : 1)
    C = diff >= 0
    V = !!(((A ^ v) & (A ^ diff)) & 0x80)
    A = setNZ(diff)
  }
  const cmp = (reg: number, v: number) => { const r = reg - v; C = r >= 0; setNZ(r) }

  // Main interpreter loop
  while (cycles++ < MAX_CYCLES) {
    // Stop when PC reaches the halt address (e.g. game entry after JMP $A300)
    if (haltAddress !== undefined && PC === haltAddress) return mem

    const op = rd(PC)
    PC = (PC + 1) & 0xFFFF

    switch (op) {
      // BRK — halt
      case 0x00:
        return mem

      // --- ORA ---
      case 0x09: A = setNZ(A | imm()); break
      case 0x05: A = setNZ(A | rd(zpAddr())); break
      case 0x15: A = setNZ(A | rd(zpXAddr())); break
      case 0x0D: A = setNZ(A | rd(absAddr())); break
      case 0x1D: A = setNZ(A | rd(absXAddr())); break
      case 0x19: A = setNZ(A | rd(absYAddr())); break
      case 0x01: A = setNZ(A | rd(indXAddr())); break
      case 0x11: A = setNZ(A | rd(indYAddr())); break

      // --- AND ---
      case 0x29: A = setNZ(A & imm()); break
      case 0x25: A = setNZ(A & rd(zpAddr())); break
      case 0x35: A = setNZ(A & rd(zpXAddr())); break
      case 0x2D: A = setNZ(A & rd(absAddr())); break
      case 0x3D: A = setNZ(A & rd(absXAddr())); break
      case 0x39: A = setNZ(A & rd(absYAddr())); break
      case 0x21: A = setNZ(A & rd(indXAddr())); break
      case 0x31: A = setNZ(A & rd(indYAddr())); break

      // --- EOR ---
      case 0x49: A = setNZ(A ^ imm()); break
      case 0x45: A = setNZ(A ^ rd(zpAddr())); break
      case 0x55: A = setNZ(A ^ rd(zpXAddr())); break
      case 0x4D: A = setNZ(A ^ rd(absAddr())); break
      case 0x5D: A = setNZ(A ^ rd(absXAddr())); break
      case 0x59: A = setNZ(A ^ rd(absYAddr())); break
      case 0x41: A = setNZ(A ^ rd(indXAddr())); break
      case 0x51: A = setNZ(A ^ rd(indYAddr())); break

      // --- ADC ---
      case 0x69: adc(imm()); break
      case 0x65: adc(rd(zpAddr())); break
      case 0x75: adc(rd(zpXAddr())); break
      case 0x6D: adc(rd(absAddr())); break
      case 0x7D: adc(rd(absXAddr())); break
      case 0x79: adc(rd(absYAddr())); break
      case 0x61: adc(rd(indXAddr())); break
      case 0x71: adc(rd(indYAddr())); break

      // --- SBC ---
      case 0xE9: sbc(imm()); break
      case 0xE5: sbc(rd(zpAddr())); break
      case 0xF5: sbc(rd(zpXAddr())); break
      case 0xED: sbc(rd(absAddr())); break
      case 0xFD: sbc(rd(absXAddr())); break
      case 0xF9: sbc(rd(absYAddr())); break
      case 0xE1: sbc(rd(indXAddr())); break
      case 0xF1: sbc(rd(indYAddr())); break

      // --- CMP ---
      case 0xC9: cmp(A, imm()); break
      case 0xC5: cmp(A, rd(zpAddr())); break
      case 0xD5: cmp(A, rd(zpXAddr())); break
      case 0xCD: cmp(A, rd(absAddr())); break
      case 0xDD: cmp(A, rd(absXAddr())); break
      case 0xD9: cmp(A, rd(absYAddr())); break
      case 0xC1: cmp(A, rd(indXAddr())); break
      case 0xD1: cmp(A, rd(indYAddr())); break
      // --- CPX ---
      case 0xE0: cmp(X, imm()); break
      case 0xE4: cmp(X, rd(zpAddr())); break
      case 0xEC: cmp(X, rd(absAddr())); break
      // --- CPY ---
      case 0xC0: cmp(Y, imm()); break
      case 0xC4: cmp(Y, rd(zpAddr())); break
      case 0xCC: cmp(Y, rd(absAddr())); break

      // --- LDA ---
      case 0xA9: A = setNZ(imm()); break
      case 0xA5: A = setNZ(rd(zpAddr())); break
      case 0xB5: A = setNZ(rd(zpXAddr())); break
      case 0xAD: A = setNZ(rd(absAddr())); break
      case 0xBD: A = setNZ(rd(absXAddr())); break
      case 0xB9: A = setNZ(rd(absYAddr())); break
      case 0xA1: A = setNZ(rd(indXAddr())); break
      case 0xB1: A = setNZ(rd(indYAddr())); break

      // --- LDX ---
      case 0xA2: X = setNZ(imm()); break
      case 0xA6: X = setNZ(rd(zpAddr())); break
      case 0xB6: X = setNZ(rd(zpYAddr())); break
      case 0xAE: X = setNZ(rd(absAddr())); break
      case 0xBE: X = setNZ(rd(absYAddr())); break

      // --- LDY ---
      case 0xA0: Y = setNZ(imm()); break
      case 0xA4: Y = setNZ(rd(zpAddr())); break
      case 0xB4: Y = setNZ(rd(zpXAddr())); break
      case 0xAC: Y = setNZ(rd(absAddr())); break
      case 0xBC: Y = setNZ(rd(absXAddr())); break

      // --- STA ---
      case 0x85: wr(zpAddr(), A); break
      case 0x95: wr(zpXAddr(), A); break
      case 0x8D: wr(absAddr(), A); break
      case 0x9D: wr(absXAddr(), A); break
      case 0x99: wr(absYAddr(), A); break
      case 0x81: wr(indXAddr(), A); break
      case 0x91: wr(indYAddr(), A); break

      // --- STX ---
      case 0x86: wr(zpAddr(), X); break
      case 0x96: wr(zpYAddr(), X); break
      case 0x8E: wr(absAddr(), X); break

      // --- STY ---
      case 0x84: wr(zpAddr(), Y); break
      case 0x94: wr(zpXAddr(), Y); break
      case 0x8C: wr(absAddr(), Y); break

      // --- ASL ---
      case 0x0A: C = !!(A & 0x80); A = setNZ(A << 1); break
      case 0x06: { const a = zpAddr(); let v = rd(a); C = !!(v & 0x80); v = setNZ(v << 1); wr(a, v); break }
      case 0x16: { const a = zpXAddr(); let v = rd(a); C = !!(v & 0x80); v = setNZ(v << 1); wr(a, v); break }
      case 0x0E: { const a = absAddr(); let v = rd(a); C = !!(v & 0x80); v = setNZ(v << 1); wr(a, v); break }
      case 0x1E: { const a = absXAddr(); let v = rd(a); C = !!(v & 0x80); v = setNZ(v << 1); wr(a, v); break }

      // --- LSR ---
      case 0x4A: C = !!(A & 1); A = setNZ(A >> 1); break
      case 0x46: { const a = zpAddr(); let v = rd(a); C = !!(v & 1); v = setNZ(v >> 1); wr(a, v); break }
      case 0x56: { const a = zpXAddr(); let v = rd(a); C = !!(v & 1); v = setNZ(v >> 1); wr(a, v); break }
      case 0x4E: { const a = absAddr(); let v = rd(a); C = !!(v & 1); v = setNZ(v >> 1); wr(a, v); break }
      case 0x5E: { const a = absXAddr(); let v = rd(a); C = !!(v & 1); v = setNZ(v >> 1); wr(a, v); break }

      // --- ROL ---
      case 0x2A: { const c = C ? 1 : 0; C = !!(A & 0x80); A = setNZ((A << 1) | c); break }
      case 0x26: { const a = zpAddr(); let v = rd(a); const c = C ? 1 : 0; C = !!(v & 0x80); v = setNZ((v << 1) | c); wr(a, v); break }
      case 0x36: { const a = zpXAddr(); let v = rd(a); const c = C ? 1 : 0; C = !!(v & 0x80); v = setNZ((v << 1) | c); wr(a, v); break }
      case 0x2E: { const a = absAddr(); let v = rd(a); const c = C ? 1 : 0; C = !!(v & 0x80); v = setNZ((v << 1) | c); wr(a, v); break }
      case 0x3E: { const a = absXAddr(); let v = rd(a); const c = C ? 1 : 0; C = !!(v & 0x80); v = setNZ((v << 1) | c); wr(a, v); break }

      // --- ROR ---
      case 0x6A: { const c = C ? 0x80 : 0; C = !!(A & 1); A = setNZ((A >> 1) | c); break }
      case 0x66: { const a = zpAddr(); let v = rd(a); const c = C ? 0x80 : 0; C = !!(v & 1); v = setNZ((v >> 1) | c); wr(a, v); break }
      case 0x76: { const a = zpXAddr(); let v = rd(a); const c = C ? 0x80 : 0; C = !!(v & 1); v = setNZ((v >> 1) | c); wr(a, v); break }
      case 0x6E: { const a = absAddr(); let v = rd(a); const c = C ? 0x80 : 0; C = !!(v & 1); v = setNZ((v >> 1) | c); wr(a, v); break }
      case 0x7E: { const a = absXAddr(); let v = rd(a); const c = C ? 0x80 : 0; C = !!(v & 1); v = setNZ((v >> 1) | c); wr(a, v); break }

      // --- INC ---
      case 0xE6: { const a = zpAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xF6: { const a = zpXAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xEE: { const a = absAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xFE: { const a = absXAddr(); wr(a, setNZ(rd(a) + 1)); break }

      // --- DEC ---
      case 0xC6: { const a = zpAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xD6: { const a = zpXAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xCE: { const a = absAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xDE: { const a = absXAddr(); wr(a, setNZ(rd(a) - 1)); break }

      // --- INX / INY / DEX / DEY ---
      case 0xE8: X = setNZ(X + 1); break
      case 0xC8: Y = setNZ(Y + 1); break
      case 0xCA: X = setNZ(X - 1); break
      case 0x88: Y = setNZ(Y - 1); break

      // --- Transfers ---
      case 0xAA: X = setNZ(A); break
      case 0xA8: Y = setNZ(A); break
      case 0x8A: A = setNZ(X); break
      case 0x98: A = setNZ(Y); break
      case 0xBA: X = setNZ(SP); break
      case 0x9A: SP = X; break

      // --- Stack ---
      case 0x48: push(A); break
      case 0x68: A = setNZ(pull()); break
      case 0x08: push(packP() | 0x10); break  // PHP (B flag set)
      case 0x28: unpackP(pull()); break        // PLP

      // --- Branches ---
      case 0x10: branch(!N); break  // BPL
      case 0x30: branch(N); break   // BMI
      case 0x50: branch(!V); break  // BVC
      case 0x70: branch(V); break   // BVS
      case 0x90: branch(!C); break  // BCC
      case 0xB0: branch(C); break   // BCS
      case 0xD0: branch(!Z); break  // BNE
      case 0xF0: branch(Z); break   // BEQ

      // --- JMP ---
      case 0x4C: PC = absAddr(); break
      case 0x6C: {
        const ptr = absAddr()
        // 6502 indirect JMP bug: wraps within page
        PC = mem[ptr] | (mem[(ptr & 0xFF00) | ((ptr + 1) & 0xFF)] << 8)
        break
      }

      // --- JSR / RTS / RTI ---
      case 0x20: {
        const target = absAddr()
        if (skipJSRs?.has(target)) break  // skip game-init calls
        const ret = (PC - 1) & 0xFFFF
        push((ret >> 8) & 0xFF)
        push(ret & 0xFF)
        PC = target
        break
      }
      case 0x60: {
        const lo = pull()
        const hi = pull()
        PC = ((hi << 8) | lo) + 1
        // If we return to the trampoline's BRK, we're done
        if (PC === TRAMP + 3) return mem
        break
      }
      case 0x40: {  // RTI
        unpackP(pull())
        const lo = pull()
        const hi = pull()
        PC = (hi << 8) | lo
        break
      }

      // --- BIT ---
      case 0x24: { const v = rd(zpAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }
      case 0x2C: { const v = rd(absAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }

      // --- Flag instructions ---
      case 0x18: C = false; break  // CLC
      case 0x38: C = true; break   // SEC
      case 0x58: I = false; break  // CLI
      case 0x78: I = true; break   // SEI
      case 0xD8: D = false; break  // CLD
      case 0xF8: D = true; break   // SED
      case 0xB8: V = false; break  // CLV

      // --- NOP ---
      case 0xEA: break

      // --- 65C02 extensions ---
      case 0x1A: A = setNZ(A + 1); break  // INC A
      case 0x3A: A = setNZ(A - 1); break  // DEC A
      case 0x80: branch(true); break       // BRA
      case 0x64: wr(zpAddr(), 0); break    // STZ zp
      case 0x74: wr(zpXAddr(), 0); break   // STZ zp,X
      case 0x9C: wr(absAddr(), 0); break   // STZ abs
      case 0x9E: wr(absXAddr(), 0); break  // STZ abs,X
      case 0xDA: push(X); break            // PHX
      case 0x5A: push(Y); break            // PHY
      case 0xFA: X = setNZ(pull()); break  // PLX
      case 0x7A: Y = setNZ(pull()); break  // PLY
      case 0x12: { const z = imm(); A = setNZ(A | rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // ORA (zp)
      case 0x32: { const z = imm(); A = setNZ(A & rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // AND (zp)
      case 0x52: { const z = imm(); A = setNZ(A ^ rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // EOR (zp)
      case 0x72: { const z = imm(); adc(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }            // ADC (zp)
      case 0x92: { const z = imm(); wr(mem[z] | (mem[(z + 1) & 0xFF] << 8), A); break }              // STA (zp)
      case 0xB2: { const z = imm(); A = setNZ(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }      // LDA (zp)
      case 0xD2: { const z = imm(); cmp(A, rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }         // CMP (zp)
      case 0xF2: { const z = imm(); sbc(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }            // SBC (zp)
      case 0x89: { Z = (A & imm()) === 0; break }  // BIT #imm
      case 0x34: { const v = rd(zpXAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }  // BIT zp,X
      case 0x3C: { const v = rd(absXAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break } // BIT abs,X
      case 0x04: { const a = zpAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v | A); break }     // TSB zp
      case 0x0C: { const a = absAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v | A); break }    // TSB abs
      case 0x14: { const a = zpAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v & ~A); break }    // TRB zp
      case 0x1C: { const a = absAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v & ~A); break }   // TRB abs
      case 0x7C: {  // JMP (abs,X)
        const base = absAddr()
        const ptr = (base + X) & 0xFFFF
        PC = mem[ptr] | (mem[(ptr + 1) & 0xFFFF] << 8)
        break
      }

      default: {
        // WDC 65C02: undefined opcodes are NOPs of varying sizes
        if (op === 0x5C || op === 0xDC || op === 0xFC) {
          imm(); imm()  // 3-byte NOP (abs)
        } else if ((op & 0x0F) === 0x02 || op === 0x44 || op === 0x54 || op === 0xD4 || op === 0xF4) {
          imm()  // 2-byte NOP (imm/zp)
        }
        // else: 1-byte NOP (columns 3, 7, B, F)
        break
      }
    }
  }

  throw new Error(`depack6502: exceeded ${MAX_CYCLES} cycle limit`)
}

/**
 * Execute 6502 code on an existing 64 KB memory buffer (in-place).
 * Sets up a trampoline at $0200: JSR target; BRK — then runs the interpreter.
 * Returns when BRK is hit (or haltAddress reached).
 * Used to run post-decompression setup calls (e.g. JSR $BC94) at build time.
 *
 * I/O handling matches depack6502: $C000→$80, $C019→$80 (VBL high to prevent
 * BIT $C019;BPL wait loops), all other $C0xx→0 for reads; writes ignored.
 */
export const run6502OnMem = (
  mem: Uint8Array,
  target: number,
  skipJSRs?: Set<number>,
  haltAddress?: number,
): void => {
  const TRAMP = 0x0200
  const savedBytes = [mem[TRAMP], mem[TRAMP + 1], mem[TRAMP + 2], mem[TRAMP + 3]]
  mem[TRAMP] = 0x20 // JSR
  mem[TRAMP + 1] = target & 0xFF
  mem[TRAMP + 2] = (target >> 8) & 0xFF
  mem[TRAMP + 3] = 0x00 // BRK → halt

  let PC = TRAMP
  let A = 0, X = 0, Y = 0, SP = 0xFF
  let N = false, V = false, D = false, I = true, Z = true, C = false

  const MAX_CYCLES = 50_000_000
  let cycles = 0

  const push = (v: number) => { mem[0x100 + SP] = v & 0xFF; SP = (SP - 1) & 0xFF }
  const pull = () => { SP = (SP + 1) & 0xFF; return mem[0x100 + SP] }
  const setNZ = (v: number) => { v &= 0xFF; N = (v & 0x80) !== 0; Z = v === 0; return v }
  const packP = () =>
    (N ? 0x80 : 0) | (V ? 0x40 : 0) | 0x20 | (D ? 0x08 : 0) |
    (I ? 0x04 : 0) | (Z ? 0x02 : 0) | (C ? 0x01 : 0)
  const unpackP = (p: number) => {
    N = !!(p & 0x80); V = !!(p & 0x40); D = !!(p & 0x08)
    I = !!(p & 0x04); Z = !!(p & 0x02); C = !!(p & 0x01)
  }

  const rd = (a: number): number => {
    if (a >= 0xC000 && a < 0xC100) {
      if (a === 0xC000) return 0x80  // keyboard: key pressed
      // VBL flag: toggle based on cycle count so both BPL and BMI loops exit.
      if (a === 0xC019) return (cycles & 0x2000) ? 0x80 : 0x00
      return 0
    }
    return mem[a]
  }
  const wr = (a: number, v: number) => {
    if (a >= 0xC000 && a < 0xC100) return
    mem[a] = v & 0xFF
  }

  const imm = () => { const v = rd(PC); PC = (PC + 1) & 0xFFFF; return v }
  const zpAddr = () => imm()
  const zpXAddr = () => (imm() + X) & 0xFF
  const zpYAddr = () => (imm() + Y) & 0xFF
  const absAddr = () => { const lo = imm(); return lo | (imm() << 8) }
  const absXAddr = () => (absAddr() + X) & 0xFFFF
  const absYAddr = () => (absAddr() + Y) & 0xFFFF
  const indXAddr = () => { const z = (imm() + X) & 0xFF; return mem[z] | (mem[(z + 1) & 0xFF] << 8) }
  const indYAddr = () => { const z = imm(); return ((mem[z] | (mem[(z + 1) & 0xFF] << 8)) + Y) & 0xFFFF }

  const branch = (cond: boolean) => {
    const off = imm()
    if (cond) PC = (PC + (off > 127 ? off - 256 : off)) & 0xFFFF
  }

  const adc = (v: number) => {
    const sum = A + v + (C ? 1 : 0)
    C = sum > 0xFF
    V = !!((~(A ^ v) & (A ^ sum)) & 0x80)
    A = setNZ(sum)
  }
  const sbc = (v: number) => {
    const diff = A - v - (C ? 0 : 1)
    C = diff >= 0
    V = !!(((A ^ v) & (A ^ diff)) & 0x80)
    A = setNZ(diff)
  }
  const cmp = (reg: number, v: number) => { const r = reg - v; C = r >= 0; setNZ(r) }

  const restore = () => {
    mem[TRAMP] = savedBytes[0]; mem[TRAMP + 1] = savedBytes[1]
    mem[TRAMP + 2] = savedBytes[2]; mem[TRAMP + 3] = savedBytes[3]
  }

  while (cycles++ < MAX_CYCLES) {
    if (haltAddress !== undefined && PC === haltAddress) { restore(); return }

    const op = rd(PC)
    PC = (PC + 1) & 0xFFFF

    switch (op) {
      case 0x00: restore(); return  // BRK — done

      // --- ORA ---
      case 0x09: A = setNZ(A | imm()); break
      case 0x05: A = setNZ(A | rd(zpAddr())); break
      case 0x15: A = setNZ(A | rd(zpXAddr())); break
      case 0x0D: A = setNZ(A | rd(absAddr())); break
      case 0x1D: A = setNZ(A | rd(absXAddr())); break
      case 0x19: A = setNZ(A | rd(absYAddr())); break
      case 0x01: A = setNZ(A | rd(indXAddr())); break
      case 0x11: A = setNZ(A | rd(indYAddr())); break

      // --- AND ---
      case 0x29: A = setNZ(A & imm()); break
      case 0x25: A = setNZ(A & rd(zpAddr())); break
      case 0x35: A = setNZ(A & rd(zpXAddr())); break
      case 0x2D: A = setNZ(A & rd(absAddr())); break
      case 0x3D: A = setNZ(A & rd(absXAddr())); break
      case 0x39: A = setNZ(A & rd(absYAddr())); break
      case 0x21: A = setNZ(A & rd(indXAddr())); break
      case 0x31: A = setNZ(A & rd(indYAddr())); break

      // --- EOR ---
      case 0x49: A = setNZ(A ^ imm()); break
      case 0x45: A = setNZ(A ^ rd(zpAddr())); break
      case 0x55: A = setNZ(A ^ rd(zpXAddr())); break
      case 0x4D: A = setNZ(A ^ rd(absAddr())); break
      case 0x5D: A = setNZ(A ^ rd(absXAddr())); break
      case 0x59: A = setNZ(A ^ rd(absYAddr())); break
      case 0x41: A = setNZ(A ^ rd(indXAddr())); break
      case 0x51: A = setNZ(A ^ rd(indYAddr())); break

      // --- ADC ---
      case 0x69: adc(imm()); break
      case 0x65: adc(rd(zpAddr())); break
      case 0x75: adc(rd(zpXAddr())); break
      case 0x6D: adc(rd(absAddr())); break
      case 0x7D: adc(rd(absXAddr())); break
      case 0x79: adc(rd(absYAddr())); break
      case 0x61: adc(rd(indXAddr())); break
      case 0x71: adc(rd(indYAddr())); break

      // --- SBC ---
      case 0xE9: sbc(imm()); break
      case 0xE5: sbc(rd(zpAddr())); break
      case 0xF5: sbc(rd(zpXAddr())); break
      case 0xED: sbc(rd(absAddr())); break
      case 0xFD: sbc(rd(absXAddr())); break
      case 0xF9: sbc(rd(absYAddr())); break
      case 0xE1: sbc(rd(indXAddr())); break
      case 0xF1: sbc(rd(indYAddr())); break

      // --- CMP ---
      case 0xC9: cmp(A, imm()); break
      case 0xC5: cmp(A, rd(zpAddr())); break
      case 0xD5: cmp(A, rd(zpXAddr())); break
      case 0xCD: cmp(A, rd(absAddr())); break
      case 0xDD: cmp(A, rd(absXAddr())); break
      case 0xD9: cmp(A, rd(absYAddr())); break
      case 0xC1: cmp(A, rd(indXAddr())); break
      case 0xD1: cmp(A, rd(indYAddr())); break

      // --- CPX ---
      case 0xE0: cmp(X, imm()); break
      case 0xE4: cmp(X, rd(zpAddr())); break
      case 0xEC: cmp(X, rd(absAddr())); break

      // --- CPY ---
      case 0xC0: cmp(Y, imm()); break
      case 0xC4: cmp(Y, rd(zpAddr())); break
      case 0xCC: cmp(Y, rd(absAddr())); break

      // --- LDA ---
      case 0xA9: A = setNZ(imm()); break
      case 0xA5: A = setNZ(rd(zpAddr())); break
      case 0xB5: A = setNZ(rd(zpXAddr())); break
      case 0xAD: A = setNZ(rd(absAddr())); break
      case 0xBD: A = setNZ(rd(absXAddr())); break
      case 0xB9: A = setNZ(rd(absYAddr())); break
      case 0xA1: A = setNZ(rd(indXAddr())); break
      case 0xB1: A = setNZ(rd(indYAddr())); break

      // --- LDX ---
      case 0xA2: X = setNZ(imm()); break
      case 0xA6: X = setNZ(rd(zpAddr())); break
      case 0xB6: X = setNZ(rd(zpYAddr())); break
      case 0xAE: X = setNZ(rd(absAddr())); break
      case 0xBE: X = setNZ(rd(absYAddr())); break

      // --- LDY ---
      case 0xA0: Y = setNZ(imm()); break
      case 0xA4: Y = setNZ(rd(zpAddr())); break
      case 0xB4: Y = setNZ(rd(zpXAddr())); break
      case 0xAC: Y = setNZ(rd(absAddr())); break
      case 0xBC: Y = setNZ(rd(absXAddr())); break

      // --- STA ---
      case 0x85: wr(zpAddr(), A); break
      case 0x95: wr(zpXAddr(), A); break
      case 0x8D: wr(absAddr(), A); break
      case 0x9D: wr(absXAddr(), A); break
      case 0x99: wr(absYAddr(), A); break
      case 0x81: wr(indXAddr(), A); break
      case 0x91: wr(indYAddr(), A); break

      // --- STX ---
      case 0x86: wr(zpAddr(), X); break
      case 0x96: wr(zpYAddr(), X); break
      case 0x8E: wr(absAddr(), X); break

      // --- STY ---
      case 0x84: wr(zpAddr(), Y); break
      case 0x94: wr(zpXAddr(), Y); break
      case 0x8C: wr(absAddr(), Y); break

      // --- INC/DEC mem ---
      case 0xE6: { const a = zpAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xF6: { const a = zpXAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xEE: { const a = absAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xFE: { const a = absXAddr(); wr(a, setNZ(rd(a) + 1)); break }
      case 0xC6: { const a = zpAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xD6: { const a = zpXAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xCE: { const a = absAddr(); wr(a, setNZ(rd(a) - 1)); break }
      case 0xDE: { const a = absXAddr(); wr(a, setNZ(rd(a) - 1)); break }

      // --- INC/DEC reg ---
      case 0xE8: X = setNZ(X + 1); break
      case 0xC8: Y = setNZ(Y + 1); break
      case 0xCA: X = setNZ(X - 1); break
      case 0x88: Y = setNZ(Y - 1); break

      // --- ASL ---
      case 0x0A: C = !!(A & 0x80); A = setNZ(A << 1); break
      case 0x06: { const a = zpAddr(); let v = rd(a); C = !!(v & 0x80); wr(a, setNZ(v << 1)); break }
      case 0x16: { const a = zpXAddr(); let v = rd(a); C = !!(v & 0x80); wr(a, setNZ(v << 1)); break }
      case 0x0E: { const a = absAddr(); let v = rd(a); C = !!(v & 0x80); wr(a, setNZ(v << 1)); break }
      case 0x1E: { const a = absXAddr(); let v = rd(a); C = !!(v & 0x80); wr(a, setNZ(v << 1)); break }

      // --- LSR ---
      case 0x4A: C = !!(A & 1); A = setNZ(A >> 1); break
      case 0x46: { const a = zpAddr(); let v = rd(a); C = !!(v & 1); wr(a, setNZ(v >> 1)); break }
      case 0x56: { const a = zpXAddr(); let v = rd(a); C = !!(v & 1); wr(a, setNZ(v >> 1)); break }
      case 0x4E: { const a = absAddr(); let v = rd(a); C = !!(v & 1); wr(a, setNZ(v >> 1)); break }
      case 0x5E: { const a = absXAddr(); let v = rd(a); C = !!(v & 1); wr(a, setNZ(v >> 1)); break }

      // --- ROL ---
      case 0x2A: { const oc = C; C = !!(A & 0x80); A = setNZ((A << 1) | (oc ? 1 : 0)); break }
      case 0x26: { const a = zpAddr(); let v = rd(a); const oc = C; C = !!(v & 0x80); wr(a, setNZ((v << 1) | (oc ? 1 : 0))); break }
      case 0x36: { const a = zpXAddr(); let v = rd(a); const oc = C; C = !!(v & 0x80); wr(a, setNZ((v << 1) | (oc ? 1 : 0))); break }
      case 0x2E: { const a = absAddr(); let v = rd(a); const oc = C; C = !!(v & 0x80); wr(a, setNZ((v << 1) | (oc ? 1 : 0))); break }
      case 0x3E: { const a = absXAddr(); let v = rd(a); const oc = C; C = !!(v & 0x80); wr(a, setNZ((v << 1) | (oc ? 1 : 0))); break }

      // --- ROR ---
      case 0x6A: { const oc = C; C = !!(A & 1); A = setNZ((A >> 1) | (oc ? 0x80 : 0)); break }
      case 0x66: { const a = zpAddr(); let v = rd(a); const oc = C; C = !!(v & 1); wr(a, setNZ((v >> 1) | (oc ? 0x80 : 0))); break }
      case 0x76: { const a = zpXAddr(); let v = rd(a); const oc = C; C = !!(v & 1); wr(a, setNZ((v >> 1) | (oc ? 0x80 : 0))); break }
      case 0x6E: { const a = absAddr(); let v = rd(a); const oc = C; C = !!(v & 1); wr(a, setNZ((v >> 1) | (oc ? 0x80 : 0))); break }
      case 0x7E: { const a = absXAddr(); let v = rd(a); const oc = C; C = !!(v & 1); wr(a, setNZ((v >> 1) | (oc ? 0x80 : 0))); break }

      // --- Transfers ---
      case 0xAA: X = setNZ(A); break
      case 0xA8: Y = setNZ(A); break
      case 0x8A: A = setNZ(X); break
      case 0x98: A = setNZ(Y); break
      case 0xBA: X = setNZ(SP); break
      case 0x9A: SP = X; break

      // --- Stack ---
      case 0x48: push(A); break
      case 0x68: A = setNZ(pull()); break
      case 0x08: push(packP() | 0x10); break
      case 0x28: unpackP(pull()); break

      // --- Branches ---
      case 0x10: branch(!N); break
      case 0x30: branch(N); break
      case 0x50: branch(!V); break
      case 0x70: branch(V); break
      case 0x90: branch(!C); break
      case 0xB0: branch(C); break
      case 0xD0: branch(!Z); break
      case 0xF0: branch(Z); break

      // --- JMP ---
      case 0x4C: PC = absAddr(); break
      case 0x6C: {
        const ptr = absAddr()
        PC = mem[ptr] | (mem[(ptr & 0xFF00) | ((ptr + 1) & 0xFF)] << 8)
        break
      }

      // --- JSR / RTS / RTI ---
      case 0x20: {
        const t = absAddr()
        if (skipJSRs?.has(t)) break
        const ret = (PC - 1) & 0xFFFF
        push((ret >> 8) & 0xFF)
        push(ret & 0xFF)
        PC = t
        break
      }
      case 0x60: {
        const lo = pull()
        const hi = pull()
        PC = ((hi << 8) | lo) + 1
        if (PC === TRAMP + 3) { restore(); return }
        break
      }
      case 0x40: {
        unpackP(pull())
        const lo = pull()
        const hi = pull()
        PC = (hi << 8) | lo
        break
      }

      // --- BIT ---
      case 0x24: { const v = rd(zpAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }
      case 0x2C: { const v = rd(absAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }

      // --- Flag instructions ---
      case 0x18: C = false; break
      case 0x38: C = true; break
      case 0x58: I = false; break
      case 0x78: I = true; break
      case 0xD8: D = false; break
      case 0xF8: D = true; break
      case 0xB8: V = false; break

      // --- NOP ---
      case 0xEA: break

      // --- 65C02 extensions ---
      case 0x1A: A = setNZ(A + 1); break  // INC A
      case 0x3A: A = setNZ(A - 1); break  // DEC A
      case 0x80: branch(true); break       // BRA
      case 0x64: wr(zpAddr(), 0); break    // STZ zp
      case 0x74: wr(zpXAddr(), 0); break   // STZ zp,X
      case 0x9C: wr(absAddr(), 0); break   // STZ abs
      case 0x9E: wr(absXAddr(), 0); break  // STZ abs,X
      case 0xDA: push(X); break            // PHX
      case 0x5A: push(Y); break            // PHY
      case 0xFA: X = setNZ(pull()); break  // PLX
      case 0x7A: Y = setNZ(pull()); break  // PLY
      case 0x12: { const z = imm(); A = setNZ(A | rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // ORA (zp)
      case 0x32: { const z = imm(); A = setNZ(A & rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // AND (zp)
      case 0x52: { const z = imm(); A = setNZ(A ^ rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }  // EOR (zp)
      case 0x72: { const z = imm(); adc(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }            // ADC (zp)
      case 0x92: { const z = imm(); wr(mem[z] | (mem[(z + 1) & 0xFF] << 8), A); break }              // STA (zp)
      case 0xB2: { const z = imm(); A = setNZ(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }      // LDA (zp)
      case 0xD2: { const z = imm(); cmp(A, rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }         // CMP (zp)
      case 0xF2: { const z = imm(); sbc(rd(mem[z] | (mem[(z + 1) & 0xFF] << 8))); break }            // SBC (zp)
      case 0x89: { Z = (A & imm()) === 0; break }  // BIT #imm
      case 0x34: { const v = rd(zpXAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break }  // BIT zp,X
      case 0x3C: { const v = rd(absXAddr()); Z = (A & v) === 0; N = !!(v & 0x80); V = !!(v & 0x40); break } // BIT abs,X
      case 0x04: { const a = zpAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v | A); break }     // TSB zp
      case 0x0C: { const a = absAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v | A); break }    // TSB abs
      case 0x14: { const a = zpAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v & ~A); break }    // TRB zp
      case 0x1C: { const a = absAddr(); const v = rd(a); Z = (A & v) === 0; wr(a, v & ~A); break }   // TRB abs
      case 0x7C: {  // JMP (abs,X)
        const base = absAddr()
        const ptr = (base + X) & 0xFFFF
        PC = mem[ptr] | (mem[(ptr + 1) & 0xFFFF] << 8)
        break
      }

      default: {
        // WDC 65C02: undefined opcodes are NOPs of varying sizes
        if (op === 0x5C || op === 0xDC || op === 0xFC) {
          imm(); imm()  // 3-byte NOP (abs)
        } else if ((op & 0x0F) === 0x02 || op === 0x44 || op === 0x54 || op === 0xD4 || op === 0xF4) {
          imm()  // 2-byte NOP (imm/zp)
        }
        // else: 1-byte NOP (columns 3, 7, B, F)
        break
      }
    }
  }

  restore()
  throw new Error(`run6502OnMem: exceeded ${MAX_CYCLES} cycle limit (target=$${target.toString(16).padStart(4, "0")})`)
}
