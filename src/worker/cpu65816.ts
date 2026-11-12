/**
 * cpu65816.ts - 65C816 CPU emulation skeleton for Apple IIgs
 * 
 * Based on the upstream web-a2e implementation.
 */

import { recordRomPc } from "./romtrace"

export enum Status816 {
    C = 0x01, // Carry
    Z = 0x02, // Zero
    I = 0x04, // Interrupt disable
    D = 0x08, // Decimal
    X = 0x10, // Index registers are 8 bits (native); Break (emulation) ??bit 4
    M = 0x20, // Accumulator is 8 bits (native); unused, always 1 (emulation) ??bit 5
    V = 0x40, // Overflow
    N = 0x80  // Negative
}

// Vectors

// Addressing mode identifiers, used only for cycle accounting. See
// addCycles() on CPU65816 for why this exists.
enum ADDR_MODE_816 {
    IMMEDIATE,
    DIRECT,
    DIRECT_X,
    DIRECT_Y,
    DIRECT_INDIRECT,          // (dp)
    DIRECT_INDIRECT_LONG,    // [dp]
    ABSOLUTE,
    ABSOLUTE_X,
    ABSOLUTE_Y,
    ABSOLUTE_LONG,
    ABSOLUTE_LONG_X,
    DIRECT_INDEXED_INDIRECT, // (dp,X)
    DIRECT_INDIRECT_INDEXED, // (dp),Y
    DIRECT_INDIRECT_LONG_INDEXED, // [dp],Y
    STACK_RELATIVE,          // d,S
    STACK_RELATIVE_INDIRECT_INDEXED, // (d,S),Y
    ABSOLUTE_INDIRECT,       // JMP (abs)
    ABSOLUTE_INDEXED_INDIRECT, // JMP (abs,X)
    ABSOLUTE_INDIRECT_LONG,  // JML [abs]
    ACCUMULATOR,
    NONE,
}

// Internal (no bus activity) cycles per addressing mode, i.e. published WDC
// cycle count minus the number of bus accesses made below. The values hold for
// both 8-bit and 16-bit operands because a 16-bit access is charged two bus
// cycles, exactly as on real hardware. `indexed` is true when an index registro
// register participates, which is what earns the page-crossing cycle.
const ADDR_CYCLES_816: {read: number, write: number, rmw: number}[] = [
    /* IMMEDIATE                    */ {read: 0, write: 0, rmw: 0},
    /* DIRECT                       */ {read: 0, write: 0, rmw: 1},
    /* DIRECT_X                     */ {read: 1, write: 1, rmw: 2},
    /* DIRECT_Y                     */ {read: 1, write: 1, rmw: 2},
    /* DIRECT_INDIRECT              */ {read: 0, write: 0, rmw: 2},
    /* DIRECT_INDIRECT_LONG         */ {read: 0, write: 0, rmw: 1},
    /* ABSOLUTE                     */ {read: 0, write: 0, rmw: 1},
    /* ABSOLUTE_X                   */ {read: 0, write: 0, rmw: 1},
    /* ABSOLUTE_Y                   */ {read: 0, write: 0, rmw: 1},
    /* ABSOLUTE_LONG                */ {read: 0, write: 0, rmw: 1},
    /* ABSOLUTE_LONG_X              */ {read: 0, write: 0, rmw: 2},
    /* DIRECT_INDEXED_INDIRECT      */ {read: 1, write: 1, rmw: 2},
    /* DIRECT_INDIRECT_INDEXED      */ {read: 0, write: 0, rmw: 2},
    /* DIRECT_INDIRECT_LONG_INDEXED */ {read: 0, write: 0, rmw: 1},
    /* STACK_RELATIVE               */ {read: 1, write: 1, rmw: 2},
    /* STACK_RELATIVE_IND_INDEXED   */ {read: 2, write: 2, rmw: 2},
    /* ABSOLUTE_INDIRECT            */ {read: 0, write: 0, rmw: 0},
    /* ABSOLUTE_INDEXED_INDIRECT    */ {read: 1, write: 0, rmw: 0},
    /* ABSOLUTE_INDIRECT_LONG       */ {read: 0, write: 0, rmw: 0},
    /* ACCUMULATOR                  */ {read: 0, write: 0, rmw: 0},
    /* NONE                         */ {read: 0, write: 0, rmw: 0},
]

// Modes where an index register is added to an address that is *not* just the
// direct page. These earn the page-crossing cycle on reads and an unconditional
// extra cycle on writes and read-modify-writes, because the CPU has to perform
// the index add even when it does not cross a page.
//
// The direct page indexed modes (dp,X / dp,Y) are deliberately absent: their
// index add is charged in the table above, and in emulation mode the access
// wraps inside page zero so it costs exactly what the 6502's zp,X costs.
// Private-bitset version of the mode set above, used by chargeAddress() — a
// typed-array dereference beats Set.prototype.has on the per-op hot path.
const INDEXED_ADDR_BITSET = new Uint8Array(32)
INDEXED_ADDR_BITSET[ADDR_MODE_816.ABSOLUTE_X] = 1
INDEXED_ADDR_BITSET[ADDR_MODE_816.ABSOLUTE_Y] = 1
INDEXED_ADDR_BITSET[ADDR_MODE_816.DIRECT_INDIRECT_INDEXED] = 1
INDEXED_ADDR_BITSET[ADDR_MODE_816.DIRECT_INDIRECT_LONG_INDEXED] = 1
INDEXED_ADDR_BITSET[ADDR_MODE_816.STACK_RELATIVE_INDIRECT_INDEXED] = 1
// Flat Int8Array views over ADDR_CYCLES_816 for chargeAddress(): the per-op
// hot path dereferences a typed array instead of walking three nested object
// properties per instruction.
const ADS = ADDR_MODE_816.ABSOLUTE_INDIRECT_LONG + 2
const ADR_CYC_READ = new Int8Array(ADS)
const ADR_CYC_WRITE = new Int8Array(ADS)
const ADR_CYC_RMW = new Int8Array(ADS)
for (let m = 0; m < ADDR_CYCLES_816.length; m++) {
    ADR_CYC_READ[m] = ADDR_CYCLES_816[m].read
    ADR_CYC_WRITE[m] = ADDR_CYCLES_816[m].write
    ADR_CYC_RMW[m] = ADDR_CYCLES_816[m].rmw
}

export const VEC_E_NMI = 0xFFFA;
export const VEC_E_RESET = 0xFFFC;
export const VEC_E_IRQ = 0xFFFE;
export const VEC_E_ABORT = 0xFFF8;
export const VEC_E_COP = 0xFFF4;

export const VEC_N_NMI = 0xFFEA;
export const VEC_N_IRQ = 0xFFEE;
export const VEC_N_BRK = 0xFFE6;
export const VEC_N_ABORT = 0xFFE8;
export const VEC_N_COP = 0xFFE4;

export type ReadCallback = (address: number) => number;
export type WriteCallback = (address: number, value: number) => void;
export type VectorReadCallback = (address: number) => number;

import { ICPU } from "./icpu";
import { specialJumpTable, iigsInterruptPending, memGet, memSet24 } from "./memory";
import { SWITCHES } from "./softswitches";
import { s6502 } from "./instructions";

export class CPU65816 implements ICPU {
    // 16-bit Accumulator (A) and 8-bit Data Bank (B is hidden in high byte when 8-bit)
    public A: number = 0; 
    public X: number = 0;
    public Y: number = 0;
    public S: number = 0; // Stack pointer
    public D: number = 0; // Direct Page
    // Program Counter (16-bit) and Program Bank (8-bit)
    public PC: number = 0;
    public PB: number = 0;
    public DB: number = 0; // Data Bank (8-bit)

    public P: number = 0; // Processor Status
    
    public emulationMode: boolean = true;
    public enteredNativeMode: boolean = false;
    public stopped: boolean = false;
    public waiting: boolean = false;
    public irqPending: boolean = false;

    // --- Cycle accounting ---
    // The 65816's published cycle count equals the number of bus accesses plus a
    // handful of internal (no bus activity) cycles per addressing mode. Every
    // read8()/write8() below already charges its bus cycle, so all we have to do
    // is charge the internal cycles. apple2ts's own 6502 core does this with an
    // explicit per-instruction table, but the 65816's operand width, bank
    // registers and extra addressing modes make a flat table far too big, so the
    // mode-relative approach mirrors gssquared's cpus/base_6502.cpp instead.
    private cycles = 0;
    private addrMode = ADDR_MODE_816.DIRECT;
    private addrCrossed = false;
    private blockMoveFirst = false;

    private addCycles(count: number) {
        this.cycles += count;
    }

    private readMemory: ReadCallback;
    private writeMemory: WriteCallback;
    private readVector: VectorReadCallback | null = null;

    constructor(readMemory: ReadCallback, writeMemory: WriteCallback) {
        this.readMemory = readMemory;
        this.writeMemory = writeMemory;
    }

    // The native core's registers and its mid-instruction bookkeeping are not
    // part of the legacy s6502 state. Save/restore has to carry them explicitly
    // or a GS state reloads with PC=0 and reboots over the SHR screen.
    public getSaveState(): CPU65816SaveState {
        return {
            A: this.A, X: this.X, Y: this.Y, S: this.S, D: this.D,
            PC: this.PC, PB: this.PB, DB: this.DB, P: this.P,
            emulationMode: this.emulationMode,
            enteredNativeMode: this.enteredNativeMode,
            stopped: this.stopped, waiting: this.waiting,
            irqPending: this.irqPending,
            cycles: this.cycles, addrMode: this.addrMode,
            addrCrossed: this.addrCrossed, blockMoveFirst: this.blockMoveFirst,
            slot5Dp: this.slot5Dp ? { dp: this.slot5Dp.dp, bytes: this.slot5Dp.bytes.slice() } : null,
        };
    }

    public setSaveState(state: CPU65816SaveState) {
        this.A = state.A;
        this.X = state.X;
        this.Y = state.Y;
        this.S = state.S;
        this.D = state.D;
        this.PC = state.PC;
        this.PB = state.PB;
        this.DB = state.DB;
        this.P = state.P;
        this.emulationMode = state.emulationMode;
        this.enteredNativeMode = state.enteredNativeMode;
        this.stopped = state.stopped;
        this.waiting = state.waiting;
        this.irqPending = state.irqPending;
        this.cycles = state.cycles;
        this.addrMode = state.addrMode;
        this.addrCrossed = state.addrCrossed;
        this.blockMoveFirst = state.blockMoveFirst;
        this.slot5Dp = state.slot5Dp ? { dp: state.slot5Dp.dp, bytes: state.slot5Dp.bytes.slice() } : null;
    }

    public setVectorReadCallback(cb: VectorReadCallback) {
        this.readVector = cb;
    }

    public reset() {
        this.emulationMode = true;
        this.D = 0x0000;
        this.DB = 0x00;
        this.PB = 0x00;
        this.S = 0x01FF; // Emulation mode stack
        this.X = 0x00;
        this.Y = 0x00;
        
        // Reset flags for emulation mode
        this.setFlag(Status816.M, true);
        this.setFlag(Status816.X, true);
        this.setFlag(Status816.I, true);

        // Fetch reset vector (from bank 0)
        let vector = VEC_E_RESET;
        let low = this.readVector ? this.readVector(vector) : this.readMemory(vector);
        let high = this.readVector ? this.readVector(vector + 1) : this.readMemory(vector + 1);
        this.PC = low | (high << 8);

        this.stopped = false;
        this.waiting = false;
        this.slot5Dp = null;
    }

    private traceBuffer: string[] = [];
    private ffCount = 0;
    private dumped = false;

    // Raise the IRQ line (level-triggered). The CPU samples it once per
    // instruction; if the I flag is clear it is taken before the next fetch.
    public irq() {
        this.irqPending = true;
    }

    public clearIrq() {
        this.irqPending = false;
    }

    // Service an interrupt: push the return state, set I, clear D, fetch the
    // vector. Mirrors web-a2e's interrupt() verbatim. In emulation mode the
    // pushed P carries the 6502 B flag (bit 4 = FLAG816_X here): SET for a
    // software BRK, CLEARED for a hardware interrupt ??the handler's only way
    // to tell them apart.
    private interrupt(nativeVector: number, emulationVector: number, software: boolean) {
        if (!this.emulationMode) {
            this.push8(this.PB);
            this.push16(this.PC);
            this.push8(this.P);
        } else {
            this.push16(this.PC);
            this.push8(software ? (this.P | Status816.X) : (this.P & ~Status816.X));
        }
        this.setFlag(Status816.I, true);
        this.setFlag(Status816.D, false);
        this.PB = 0;
        const vec = this.emulationMode ? emulationVector : nativeVector;
        if (this.readVector) {
            const lo = this.readVector(vec);
            const hi = this.readVector(vec + 1);
            this.PC = lo | (hi << 8);
        } else {
            this.PC = this.read8or16(vec, false);
        }
        this.waiting = false;
    }

    // The ROM 01 slot-5 (3.5") firmware at FF:6AB5 uses direct page $57-$5A as
    // its inline-parameter scratch pointer *before* it copies the caller's
    // $40-$6E to $E1:$14E2 (FF:6F4D) and copies it back on the way out
    // (FF:6F70), so the restore hands the caller the firmware's own scratch.
    // ProDOS 8 keeps nothing there across a block call; Apple Pascal's p-machine
    // keeps its p-stack pointer ($56/$57) and p-code PC ($58/$59) there and
    // resumes at a garbage p-code PC, dying with "Execution error # 1" (Card Cat
    // 1.94 dies scanning slot 5). Keep the caller's four bytes across the call.
    private slot5Dp: { dp: number; bytes: number[] } | null = null;

    private slot5DriverDirectPage() {
        if (this.PC === 0x6AB6) {
            const dp = this.D;
            this.slot5Dp = {
                dp, bytes: [0x57, 0x58, 0x59, 0x5a].map(o => memGet((dp + o) & 0xFFFF, false) & 0xFF),
            };
        } else if (this.PC === 0x6F7F && this.slot5Dp) {
            const { dp, bytes } = this.slot5Dp;
            for (let i = 0; i < 4; i++) memSet24((dp + 0x57 + i) & 0xFFFF, bytes[i]);
            this.slot5Dp = null;
        }
    }

    public processInstruction(traceCallback?: ((str: string) => void) | null): number {
        // Debug-only PC trace (?romtrace=1). Off by default.
        recordRomPc((this.PB << 16) | this.PC)
        this.cycles = 0
        this.addrMode = ADDR_MODE_816.NONE
        this.addrCrossed = false
        if (this.stopped) return 1; // Burn 1 cycle
        // WAI: wait for an interrupt to arrive, not to be taken. Once one is
        // pending, fall through and service it (web-a2e: waiting_ cleared then
        // the pending NMI/IRQ is taken).
        const hasHardwareIrq = this.irqPending || (s6502.flagIRQ !== 0) || iigsInterruptPending();
        if (this.waiting) {
            if (!hasHardwareIrq) return 1;
            this.waiting = false;
        }
        // Sample IRQ before the next opcode fetch. A hardware IRQ takes the
        // $FFFE (emulation) / $FFEE (native) vector; software=false keeps the
        // B flag clear so the handler can tell it was hardware.
        if (!this.getFlag(Status816.I) && hasHardwareIrq) {
            this.irqPending = false;
            this.interrupt(VEC_N_IRQ, VEC_E_IRQ, false);
            // Two dummy fetches, three pushes and the vector pair: 7 cycles in
            // emulation mode and 8 in native mode, which pushes PB as well.
            return this.emulationMode ? 7 : 8;
        }

        const pc = this.PC;
        const pb = this.PB;

        if (pb === 0xFF && (this.PC === 0x6AB6 || this.PC === 0x6F7F)) this.slot5DriverDirectPage()

        // Peripheral card hooks (e.g. SmartPort / Hard Drive block access)
        if (pb === 0) {
            const fn = specialJumpTable[pc];
            if (fn && (!SWITCHES.INTCXROM.isSet || (pc & 0xF000) !== 0xC000)) {
                s6502.Accum = this.A & 0xFF;
                s6502.XReg = this.X & 0xFF;
                s6502.YReg = this.Y & 0xFF;
                s6502.StackPtr = this.S & 0xFF;
                s6502.PStatus = this.P;
                s6502.PC = this.PC;

                fn();

                this.A = (this.A & 0xFF00) | (s6502.Accum & 0xFF);
                this.X = (this.X & 0xFF00) | (s6502.XReg & 0xFF);
                this.Y = (this.Y & 0xFF00) | (s6502.YReg & 0xFF);
                this.S = (this.S & 0xFF00) | (s6502.StackPtr & 0xFF);
                this.P = s6502.PStatus;
            }
        }

        const opcode = this.fetch8();

        if (!this.dumped) {
            const tr = `PC=${pb.toString(16).padStart(2, '0')}:${pc.toString(16).padStart(4, '0')} Opcode=${opcode.toString(16).padStart(2, '0')} A=${this.A.toString(16)} X=${this.X.toString(16)} Y=${this.Y.toString(16)} S=${this.S.toString(16)} P=${this.P.toString(16)}`;
            this.traceBuffer.push(tr);
            if (this.traceBuffer.length > 100) this.traceBuffer.shift();

            if (opcode === 0xFF) {
                this.ffCount++;
                if (this.ffCount > 20) {
                    console.log("CRASHED INTO SEA OF FF! Last 100 instructions:");
                    console.log(this.traceBuffer.join('\n'));
                    this.dumped = true;
                }
            } else {
                this.ffCount = 0;
            }
        }
        
        this.executeOpcode(opcode);

        return this.cycles;
    }

    private executeOpcode(opcode: number) {
        switch (opcode) {
            // --- LDA ---
            case 0xA9: this.opLDA(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0xA5: this.opLDA(this.addrDirect()); break;
            case 0xB5: this.opLDA(this.addrDirectX()); break;
            case 0xA1: this.opLDA(this.addrDirectIndexedIndirect()); break; // LDA (dp,X)
            case 0xB1: this.opLDA(this.addrDirectIndirectIndexed()); break; // LDA (dp),Y
            case 0xB2: this.opLDA(this.addrDirectIndirect()); break;        // LDA (dp)
            case 0xA7: this.opLDA(this.addrDirectIndirectLong()); break;    // LDA [dp]
            case 0xB7: this.opLDA(this.addrDirectIndirectLongIndexed()); break; // LDA [dp],Y
            case 0xAD: this.opLDA(this.addrAbsolute()); break;
            case 0xBD: this.opLDA(this.addrAbsoluteX()); break;
            case 0xB9: this.opLDA(this.addrAbsoluteY()); break;
            case 0xAF: this.opLDA(this.addrAbsoluteLong()); break;
            case 0xBF: this.opLDA(this.addrAbsoluteLongX()); break;
            case 0xA3: this.opLDA(this.addrStackRelative()); break;
            case 0xB3: this.opLDA(this.addrStackRelativeIndirectIndexed()); break;

            // --- STA ---
            case 0x85: this.opSTA(this.addrDirect()); break;
            case 0x95: this.opSTA(this.addrDirectX()); break;
            case 0x81: this.opSTA(this.addrDirectIndexedIndirect()); break; // STA (dp,X)
            case 0x91: this.opSTA(this.addrDirectIndirectIndexed()); break; // STA (dp),Y
            case 0x92: this.opSTA(this.addrDirectIndirect()); break;        // STA (dp)
            case 0x87: this.opSTA(this.addrDirectIndirectLong()); break;    // STA [dp]
            case 0x97: this.opSTA(this.addrDirectIndirectLongIndexed()); break; // STA [dp],Y
            case 0x8D: this.opSTA(this.addrAbsolute()); break;
            case 0x9D: this.opSTA(this.addrAbsoluteX()); break;
            case 0x99: this.opSTA(this.addrAbsoluteY()); break;
            case 0x8F: this.opSTA(this.addrAbsoluteLong()); break;
            case 0x9F: this.opSTA(this.addrAbsoluteLongX()); break;
            case 0x83: this.opSTA(this.addrStackRelative()); break;
            case 0x93: this.opSTA(this.addrStackRelativeIndirectIndexed()); break;

            // --- ORA ---
            case 0x09: this.opORA(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0x05: this.opORA(this.addrDirect()); break;
            case 0x15: this.opORA(this.addrDirectX()); break;
            case 0x12: this.opORA(this.addrDirectIndirect()); break;
            case 0x01: this.opORA(this.addrDirectIndexedIndirect()); break;
            case 0x11: this.opORA(this.addrDirectIndirectIndexed()); break;
            case 0x07: this.opORA(this.addrDirectIndirectLong()); break;
            case 0x17: this.opORA(this.addrDirectIndirectLongIndexed()); break;
            case 0x0D: this.opORA(this.addrAbsolute()); break;
            case 0x1D: this.opORA(this.addrAbsoluteX()); break;
            case 0x19: this.opORA(this.addrAbsoluteY()); break;
            case 0x0F: this.opORA(this.addrAbsoluteLong()); break;
            case 0x1F: this.opORA(this.addrAbsoluteLongX()); break;
            case 0x03: this.opORA(this.addrStackRelative()); break;
            case 0x13: this.opORA(this.addrStackRelativeIndirectIndexed()); break;

            // --- AND ---
            case 0x29: this.opAND(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0x25: this.opAND(this.addrDirect()); break;
            case 0x35: this.opAND(this.addrDirectX()); break;
            case 0x32: this.opAND(this.addrDirectIndirect()); break;
            case 0x21: this.opAND(this.addrDirectIndexedIndirect()); break;
            case 0x31: this.opAND(this.addrDirectIndirectIndexed()); break;
            case 0x27: this.opAND(this.addrDirectIndirectLong()); break;
            case 0x37: this.opAND(this.addrDirectIndirectLongIndexed()); break;
            case 0x2D: this.opAND(this.addrAbsolute()); break;
            case 0x3D: this.opAND(this.addrAbsoluteX()); break;
            case 0x39: this.opAND(this.addrAbsoluteY()); break;
            case 0x2F: this.opAND(this.addrAbsoluteLong()); break;
            case 0x3F: this.opAND(this.addrAbsoluteLongX()); break;
            case 0x23: this.opAND(this.addrStackRelative()); break;
            case 0x33: this.opAND(this.addrStackRelativeIndirectIndexed()); break;

            // --- EOR ---
            case 0x49: this.opEOR(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0x45: this.opEOR(this.addrDirect()); break;
            case 0x55: this.opEOR(this.addrDirectX()); break;
            case 0x52: this.opEOR(this.addrDirectIndirect()); break;
            case 0x41: this.opEOR(this.addrDirectIndexedIndirect()); break;
            case 0x51: this.opEOR(this.addrDirectIndirectIndexed()); break;
            case 0x47: this.opEOR(this.addrDirectIndirectLong()); break;
            case 0x57: this.opEOR(this.addrDirectIndirectLongIndexed()); break;
            case 0x4D: this.opEOR(this.addrAbsolute()); break;
            case 0x5D: this.opEOR(this.addrAbsoluteX()); break;
            case 0x59: this.opEOR(this.addrAbsoluteY()); break;
            case 0x4F: this.opEOR(this.addrAbsoluteLong()); break;
            case 0x5F: this.opEOR(this.addrAbsoluteLongX()); break;
            case 0x43: this.opEOR(this.addrStackRelative()); break;
            case 0x53: this.opEOR(this.addrStackRelativeIndirectIndexed()); break;

            // --- CMP ---
            case 0xC9: this.opCMP(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0xC5: this.opCMP(this.addrDirect()); break;
            case 0xD5: this.opCMP(this.addrDirectX()); break;
            case 0xD2: this.opCMP(this.addrDirectIndirect()); break;
            case 0xC1: this.opCMP(this.addrDirectIndexedIndirect()); break;
            case 0xD1: this.opCMP(this.addrDirectIndirectIndexed()); break;
            case 0xC7: this.opCMP(this.addrDirectIndirectLong()); break;
            case 0xD7: this.opCMP(this.addrDirectIndirectLongIndexed()); break;
            case 0xCD: this.opCMP(this.addrAbsolute()); break;
            case 0xDD: this.opCMP(this.addrAbsoluteX()); break;
            case 0xD9: this.opCMP(this.addrAbsoluteY()); break;
            case 0xCF: this.opCMP(this.addrAbsoluteLong()); break;
            case 0xDF: this.opCMP(this.addrAbsoluteLongX()); break;
            case 0xC3: this.opCMP(this.addrStackRelative()); break;
            case 0xD3: this.opCMP(this.addrStackRelativeIndirectIndexed()); break;

            // --- ADC ---
            case 0x69: this.opADC(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0x65: this.opADC(this.addrDirect()); break;
            case 0x75: this.opADC(this.addrDirectX()); break;
            case 0x72: this.opADC(this.addrDirectIndirect()); break;
            case 0x61: this.opADC(this.addrDirectIndexedIndirect()); break;
            case 0x71: this.opADC(this.addrDirectIndirectIndexed()); break;
            case 0x67: this.opADC(this.addrDirectIndirectLong()); break;
            case 0x77: this.opADC(this.addrDirectIndirectLongIndexed()); break;
            case 0x6D: this.opADC(this.addrAbsolute()); break;
            case 0x7D: this.opADC(this.addrAbsoluteX()); break;
            case 0x79: this.opADC(this.addrAbsoluteY()); break;
            case 0x6F: this.opADC(this.addrAbsoluteLong()); break;
            case 0x7F: this.opADC(this.addrAbsoluteLongX()); break;
            case 0x63: this.opADC(this.addrStackRelative()); break;
            case 0x73: this.opADC(this.addrStackRelativeIndirectIndexed()); break;

            // --- SBC ---
            case 0xE9: this.opSBC(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0xE5: this.opSBC(this.addrDirect()); break;
            case 0xF5: this.opSBC(this.addrDirectX()); break;
            case 0xF2: this.opSBC(this.addrDirectIndirect()); break;
            case 0xE1: this.opSBC(this.addrDirectIndexedIndirect()); break;
            case 0xF1: this.opSBC(this.addrDirectIndirectIndexed()); break;
            case 0xE7: this.opSBC(this.addrDirectIndirectLong()); break;
            case 0xF7: this.opSBC(this.addrDirectIndirectLongIndexed()); break;
            case 0xED: this.opSBC(this.addrAbsolute()); break;
            case 0xFD: this.opSBC(this.addrAbsoluteX()); break;
            case 0xF9: this.opSBC(this.addrAbsoluteY()); break;
            case 0xEF: this.opSBC(this.addrAbsoluteLong()); break;
            case 0xFF: this.opSBC(this.addrAbsoluteLongX()); break;
            case 0xE3: this.opSBC(this.addrStackRelative()); break;
            case 0xF3: this.opSBC(this.addrStackRelativeIndirectIndexed()); break;
            // --- LDX ---
            case 0xA2: this.opLDX(this.addrImmediate(this.getFlag(Status816.X))); break;
            case 0xA6: this.opLDX(this.addrDirect()); break;
            case 0xB6: this.opLDX(this.addrDirectY()); break;
            case 0xAE: this.opLDX(this.addrAbsolute()); break;
            case 0xBE: this.opLDX(this.addrAbsoluteY()); break;

            // --- LDY ---
            case 0xA0: this.opLDY(this.addrImmediate(this.getFlag(Status816.X))); break;
            case 0xA4: this.opLDY(this.addrDirect()); break;
            case 0xB4: this.opLDY(this.addrDirectX()); break;
            case 0xAC: this.opLDY(this.addrAbsolute()); break;
            case 0xBC: this.opLDY(this.addrAbsoluteX()); break;

            // --- STX ---
            case 0x86: this.opSTX(this.addrDirect()); break;
            case 0x96: this.opSTX(this.addrDirectY()); break;
            case 0x8E: this.opSTX(this.addrAbsolute()); break;

            // --- STY ---
            case 0x84: this.opSTY(this.addrDirect()); break;
            case 0x94: this.opSTY(this.addrDirectX()); break;
            case 0x8C: this.opSTY(this.addrAbsolute()); break;

            // --- CPX ---
            case 0xE0: this.opCPX(this.addrImmediate(this.getFlag(Status816.X))); break;
            case 0xE4: this.opCPX(this.addrDirect()); break;
            case 0xEC: this.opCPX(this.addrAbsolute()); break;

            // --- CPY ---
            case 0xC0: this.opCPY(this.addrImmediate(this.getFlag(Status816.X))); break;
            case 0xC4: this.opCPY(this.addrDirect()); break;
            case 0xCC: this.opCPY(this.addrAbsolute()); break;

            // --- Branches ---
            case 0x90: this.doBranch(!this.getFlag(Status816.C)); break; // BCC
            case 0xB0: this.doBranch(this.getFlag(Status816.C)); break;  // BCS
            case 0xD0: this.doBranch(!this.getFlag(Status816.Z)); break; // BNE
            case 0xF0: this.doBranch(this.getFlag(Status816.Z)); break;  // BEQ
            case 0x10: this.doBranch(!this.getFlag(Status816.N)); break; // BPL
            case 0x30: this.doBranch(this.getFlag(Status816.N)); break;  // BMI
            case 0x50: this.doBranch(!this.getFlag(Status816.V)); break; // BVC
            case 0x70: this.doBranch(this.getFlag(Status816.V)); break;  // BVS
            case 0x80: this.doBranch(true); break; // BRA (Branch Always)
            case 0x82: this.doBranch(true, true); break; // BRL (Branch Always Long)

            // --- INC (Memory) ---
            case 0xE6: this.opINC(this.addrDirect()); break;
            case 0xF6: this.opINC(this.addrDirectX()); break;
            case 0xEE: this.opINC(this.addrAbsolute()); break;
            case 0xFE: this.opINC(this.addrAbsoluteX()); break;
            // INC A (Accumulator) is 0x1A
            case 0x1A:
                const eightBit = this.getFlag(Status816.M);
                if (eightBit) {
                    const lo = (this.A + 1) & 0xFF;
                    this.A = (this.A & 0xFF00) | lo;
                    this.setFlag(Status816.Z, lo === 0);
                    this.setFlag(Status816.N, (lo & 0x80) !== 0);
                } else {
                    this.A = (this.A + 1) & 0xFFFF;
                    this.setFlag(Status816.Z, this.A === 0);
                    this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
                }
                break;

            // --- DEC (Memory) ---
            case 0xC6: this.opDEC(this.addrDirect()); break;
            case 0xD6: this.opDEC(this.addrDirectX()); break;
            case 0xCE: this.opDEC(this.addrAbsolute()); break;
            case 0xDE: this.opDEC(this.addrAbsoluteX()); break;
            // DEC A (Accumulator) is 0x3A
            case 0x3A:
                const eightBitDec = this.getFlag(Status816.M);
                if (eightBitDec) {
                    const lo = (this.A - 1) & 0xFF;
                    this.A = (this.A & 0xFF00) | lo;
                    this.setFlag(Status816.Z, lo === 0);
                    this.setFlag(Status816.N, (lo & 0x80) !== 0);
                } else {
                    this.A = (this.A - 1) & 0xFFFF;
                    this.setFlag(Status816.Z, this.A === 0);
                    this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
                }
                break;

            // --- INX, DEX, INY, DEY ---
            case 0xE8: this.opINX(); this.simple(); break;
            case 0xCA: this.opDEX(); this.simple(); break;
            case 0xC8: this.opINY(); this.simple(); break;
            case 0x88: this.opDEY(); this.simple(); break;

            // --- Flags ---
            case 0x18: this.setFlag(Status816.C, false); this.simple(); break; // CLC
            case 0x38: this.setFlag(Status816.C, true); this.simple(); break;  // SEC
            case 0x58: this.setFlag(Status816.I, false); this.simple(); break; // CLI
            case 0x78: this.setFlag(Status816.I, true); this.simple(); break;  // SEI
            case 0xB8: this.setFlag(Status816.V, false); this.simple(); break; // CLV
            case 0xD8: this.setFlag(Status816.D, false); this.simple(); break; // CLD
            case 0xF8: this.setFlag(Status816.D, true); this.simple(); break;  // SED

            // --- Register Transfers ---
            case 0xAA: this.opTransfer('A', 'X'); this.simple(); break; // TAX
            case 0x8A: this.opTransfer('X', 'A'); this.simple(); break; // TXA
            case 0xA8: this.opTransfer('A', 'Y'); this.simple(); break; // TAY
            case 0x98: this.opTransfer('Y', 'A'); this.simple(); break; // TYA
            case 0xBA: this.opTransfer('S', 'X'); this.simple(); break; // TSX
            case 0x9A: this.opTransfer('X', 'S'); this.simple(); break; // TXS
            case 0x9B: this.opTransfer('X', 'Y'); this.simple(); break; // TXY
            case 0xBB: this.opTransfer('Y', 'X'); this.simple(); break; // TYX
            case 0x5B: this.opTCD(); this.simple(); break; // TCD
            case 0x7B: this.opTDC(); this.simple(); break; // TDC
            case 0x3B: this.opTSC(); this.simple(); break; // TSC
            case 0x1B: this.opTCS(); this.simple(); break; // TCS
            case 0xEB: this.opXBA(); this.simple(); break; // XBA

            // --- Stack Operations ---
            case 0x48: this.opPush('A'); break; // PHA
            case 0x68: this.opPop('A'); break;  // PLA
            case 0xDA: this.opPush('X'); break; // PHX
            case 0xFA: this.opPop('X'); break;  // PLX
            case 0x5A: this.opPush('Y'); break; // PHY
            case 0x7A: this.opPop('Y'); break;  // PLY
            case 0x08: this.opPush('P'); break; // PHP
            case 0x28: this.opPop('P'); break;  // PLP
            case 0x8B: this.opPush('B'); break; // PHB
            case 0xAB: this.opPop('B'); break;  // PLB
            case 0x0B: this.opPush('D'); break; // PHD
            case 0x2B: this.opPop('D'); break;  // PLD
            case 0x4B: this.opPush('K'); break; // PHK
            case 0xF4: this.opPush('PEA', this.fetch16()); break; // PEA
            case 0xD4: this.opPush('PEI', this.addrDirectIndirect()); break; // PEI
            case 0x62: { // PER ??pushes PC-1 + signed offset (PC is already past the 3-byte operand)
                let perOffset = this.fetch16();
                if (perOffset & 0x8000) perOffset -= 0x10000;
                this.opPush('PER', (this.PC + perOffset) & 0xFFFF);
                break;
            }

            // --- Shifts and Rotates ---
            case 0x0A: this.opShift('ASL', -1); break; // ASL A
            case 0x06: this.opShift('ASL', this.addrDirect()); break;
            case 0x16: this.opShift('ASL', this.addrDirectX()); break;
            case 0x0E: this.opShift('ASL', this.addrAbsolute()); break;
            case 0x1E: this.opShift('ASL', this.addrAbsoluteX()); break;

            case 0x4A: this.opShift('LSR', -1); break; // LSR A
            case 0x46: this.opShift('LSR', this.addrDirect()); break;
            case 0x56: this.opShift('LSR', this.addrDirectX()); break;
            case 0x4E: this.opShift('LSR', this.addrAbsolute()); break;
            case 0x5E: this.opShift('LSR', this.addrAbsoluteX()); break;

            case 0x2A: this.opShift('ROL', -1); break; // ROL A
            case 0x26: this.opShift('ROL', this.addrDirect()); break;
            case 0x36: this.opShift('ROL', this.addrDirectX()); break;
            case 0x2E: this.opShift('ROL', this.addrAbsolute()); break;
            case 0x3E: this.opShift('ROL', this.addrAbsoluteX()); break;

            case 0x6A: this.opShift('ROR', -1); break; // ROR A
            case 0x66: this.opShift('ROR', this.addrDirect()); break;
            case 0x76: this.opShift('ROR', this.addrDirectX()); break;
            case 0x6E: this.opShift('ROR', this.addrAbsolute()); break;
            case 0x7E: this.opShift('ROR', this.addrAbsoluteX()); break;

            // --- Bit Operations ---
            case 0x89: this.opBIT(this.addrImmediate(this.getFlag(Status816.M))); break;
            case 0x24: this.opBIT(this.addrDirect()); break;
            case 0x2C: this.opBIT(this.addrAbsolute()); break;
            case 0x34: this.opBIT(this.addrDirectX()); break;
            case 0x3C: this.opBIT(this.addrAbsoluteX()); break;
            case 0x14: this.opTRB(this.addrDirect()); break;
            case 0x1C: this.opTRB(this.addrAbsolute()); break;
            case 0x04: this.opTSB(this.addrDirect()); break;
            case 0x0C: this.opTSB(this.addrAbsolute()); break;

            // --- Jumps and Returns ---
            case 0x4C: this.PC = this.addrAbsolute() & 0xFFFF; break; // JMP abs
            case 0x6C: this.PC = this.addrAbsoluteIndirect() & 0xFFFF; break; // JMP (abs)
            case 0x7C: this.PC = this.addrAbsoluteIndexedIndirect() & 0xFFFF; this.phantomRead(); break; // JMP (abs,X)
            case 0x5C:
                const jmpLong = this.addrAbsoluteLong();
                this.PC = jmpLong & 0xFFFF;
                this.PB = (jmpLong >> 16) & 0xFF;
                break; // JML
            case 0xDC:
                const jmpLongInd = this.addrAbsoluteIndirectLong();
                this.PC = jmpLongInd & 0xFFFF;
                this.PB = (jmpLongInd >> 16) & 0xFF;
                break; // JML [abs]

            case 0x20: // JSR abs
                this.addrMode = ADDR_MODE_816.NONE
                this.push16((this.PC + 1) & 0xFFFF);
                // The 65816 pushes the return address before reading the target.
                this.phantomRead();
                this.PC = this.addrAbsolute() & 0xFFFF;
                break;
            case 0xFC: // JSR (abs,X)
                this.addrMode = ADDR_MODE_816.NONE
                this.push16((this.PC + 1) & 0xFFFF);
                this.phantomRead();
                this.phantomRead();
                this.PC = this.addrAbsoluteIndexedIndirect() & 0xFFFF;
                break;
            case 0x22: // JSL
                this.addrMode = ADDR_MODE_816.NONE
                const jslTarget = this.addrAbsoluteLong();
                this.push8Wide(this.PB);
                this.push16Wide((this.PC - 1) & 0xFFFF); // PC is already incremented by 3 for abs long
                this.normaliseStack();
                this.phantomRead();
                this.PB = (jslTarget >> 16) & 0xFF;
                this.PC = jslTarget & 0xFFFF;
                break;

            case 0x60: // RTS
                this.phantomRead();
                this.PC = (this.pop16() + 1) & 0xFFFF;
                this.phantomRead();
                this.phantomRead();
                break;
            case 0x6B: // RTL
                // Pop in reverse order of push: PC (2 bytes) then PB (1 byte)
                this.phantomRead();
                this.PC = (this.pop16Wide() + 1) & 0xFFFF;
                this.PB = this.pop8Wide();
                this.normaliseStack();
                this.phantomRead();
                break;
            case 0x40: // RTI
                this.opPop('P');
                this.PC = this.pop16();
                if (!this.emulationMode) this.PB = this.pop8();
                break;

            // --- Misc ---
            case 0xEA: this.simple(); break; // NOP
            case 0x42: this.fetch8(); this.simple(); break; // WDM (consumes 1 byte)
            case 0xDB: this.stopped = true; this.simple(); break; // STP
            case 0xCB: this.waiting = true; this.simple(); break; // WAI
            case 0x00: // BRK (software interrupt; pushes the B flag set)
                this.PC = (this.PC + 1) & 0xFFFF; // BRK is a 2-byte instruction
                // BRK fetches the byte after the opcode before pushing.
                this.phantomRead();
                this.interrupt(VEC_N_BRK, VEC_E_IRQ, true);
                break;
            case 0x02: // COP
                this.PC = (this.PC + 1) & 0xFFFF;
                this.phantomRead();
                this.interrupt(VEC_N_COP, VEC_E_COP, true);
                break;
            case 0x54: // MVN
            case 0x44: { // MVP
                // Block move: operands are destBank, srcBank; DB becomes destBank.
                // One byte per execution; PC rewinds until A wraps to $FFFF.
                // Matches web-a2e: 0x54 increments X/Y, 0x44 decrements.
                const destBank = this.fetch8();
                const srcBank = this.fetch8();
                this.DB = destBank;
                const from = (srcBank << 16) | this.X;
                const to = (destBank << 16) | this.Y;
                this.write8(to, this.read8(from));
                // The first pass takes two extra cycles (the operand bytes get
                // re-fetched on every subsequent pass), later ones just one.
                const isFirstPass = !this.blockMoveFirst;
                this.blockMoveFirst = true;
                this.phantomRead();
                if (isFirstPass) {
                    this.phantomRead();
                }
                if (opcode === 0x54) {
                    this.X = (this.X + 1) & 0xFFFF;
                    this.Y = (this.Y + 1) & 0xFFFF;
                } else {
                    this.X = (this.X - 1) & 0xFFFF;
                    this.Y = (this.Y - 1) & 0xFFFF;
                }
                if (this.getFlag(Status816.X)) {
                    this.X &= 0xFF;
                    this.Y &= 0xFF;
                }
                this.A = (this.A - 1) & 0xFFFF;
                if (this.A !== 0xFFFF) {
                    this.PC = (this.PC - 3) & 0xFFFF; // re-execute the same MVN
                } else {
                    this.blockMoveFirst = false;
                }
                break;
            }

            case 0xFB: // XCE (Exchange Carry and Emulation bit)
                this.opXCE();
                this.simple();
                break;
            case 0xC2: // REP (Reset Processor Status Bits)
                this.opREP();
                this.simple();
                break;
            case 0xE2: // SEP (Set Processor Status Bits)
                this.opSEP();
                this.simple();
                break;
            // --- STZ ---
            case 0x64: this.opSTZ(this.addrDirect()); break;
            case 0x74: this.opSTZ(this.addrDirectX()); break;
            case 0x9C: this.opSTZ(this.addrAbsolute()); break;
            case 0x9E: this.opSTZ(this.addrAbsoluteX()); break;
            
            // TODO: other opcodes...
            default:
                // Unimplemented opcode
                const self = this as any;
                if (!self.unimplementedReported) self.unimplementedReported = new Set();
                if (!self.unimplementedReported.has(opcode)) {
                    console.error("CPU65816 Unimplemented opcode: " + opcode.toString(16).padStart(2, '0') + " at PC=" + this.PC.toString(16));
                    self.unimplementedReported.add(opcode);
                }
                break;
        }
    }

    private read8or16(address: number, eightBit: boolean): number {
        if (eightBit) return this.read8(address);
        const lo = this.read8(address);
        const hi = this.read8((address + 1) & 0xFFFFFF); // Wrap depends on addressing mode, simplified here
        return lo | (hi << 8);
    }

    private write8or16(address: number, value: number, eightBit: boolean) {
        this.write8(address, value & 0xFF);
        if (!eightBit) {
            this.write8((address + 1) & 0xFFFFFF, (value >> 8) & 0xFF);
        }
    }

    private opLDA(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.A = (this.A & 0xFF00) | (value & 0xFF);
            this.setFlag(Status816.Z, (value & 0xFF) === 0);
            this.setFlag(Status816.N, (value & 0x80) !== 0);
        } else {
            this.A = value & 0xFFFF;
            this.setFlag(Status816.Z, this.A === 0);
            this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
        }
    }

    private opSTA(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("write", eightBit ? 1 : 2);
        this.write8or16(address, this.A, eightBit);
    }

    private opORA(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.A = (this.A & 0xFF00) | ((this.A | value) & 0xFF);
            this.setFlag(Status816.Z, (this.A & 0xFF) === 0);
            this.setFlag(Status816.N, (this.A & 0x80) !== 0);
        } else {
            this.A = (this.A | value) & 0xFFFF;
            this.setFlag(Status816.Z, this.A === 0);
            this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
        }
    }

    private opAND(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.A = (this.A & 0xFF00) | ((this.A & value) & 0xFF);
            this.setFlag(Status816.Z, (this.A & 0xFF) === 0);
            this.setFlag(Status816.N, (this.A & 0x80) !== 0);
        } else {
            this.A = (this.A & value) & 0xFFFF;
            this.setFlag(Status816.Z, this.A === 0);
            this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
        }
    }

    private opEOR(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.A = (this.A & 0xFF00) | ((this.A ^ value) & 0xFF);
            this.setFlag(Status816.Z, (this.A & 0xFF) === 0);
            this.setFlag(Status816.N, (this.A & 0x80) !== 0);
        } else {
            this.A = (this.A ^ value) & 0xFFFF;
            this.setFlag(Status816.Z, this.A === 0);
            this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
        }
    }

    private opCMP(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            const a8 = this.A & 0xFF;
            const res = a8 - value;
            this.setFlag(Status816.C, a8 >= value);
            this.setFlag(Status816.Z, (res & 0xFF) === 0);
            this.setFlag(Status816.N, (res & 0x80) !== 0);
        } else {
            const res = this.A - value;
            this.setFlag(Status816.C, this.A >= value);
            this.setFlag(Status816.Z, (res & 0xFFFF) === 0);
            this.setFlag(Status816.N, (res & 0x8000) !== 0);
        }
    }

    private opLDX(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.X = value & 0xFF; // X/Y high byte is zeroed when 8-bit (unlike A)
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x80) !== 0);
        } else {
            this.X = value & 0xFFFF;
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x8000) !== 0);
        }
    }

    private opLDY(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            this.Y = value & 0xFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x80) !== 0);
        } else {
            this.Y = value & 0xFFFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x8000) !== 0);
        }
    }

    private opSTX(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("write", eightBit ? 1 : 2);
        this.write8or16(address, this.X, eightBit);
    }

    private opSTY(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("write", eightBit ? 1 : 2);
        this.write8or16(address, this.Y, eightBit);
    }

    private opCPX(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            const x8 = this.X & 0xFF;
            const res = x8 - value;
            this.setFlag(Status816.C, x8 >= value);
            this.setFlag(Status816.Z, (res & 0xFF) === 0);
            this.setFlag(Status816.N, (res & 0x80) !== 0);
        } else {
            const res = this.X - value;
            this.setFlag(Status816.C, this.X >= value);
            this.setFlag(Status816.Z, (res & 0xFFFF) === 0);
            this.setFlag(Status816.N, (res & 0x8000) !== 0);
        }
    }

    private opCPY(address: number) {
        const eightBit = this.getFlag(Status816.X);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const value = this.read8or16(address, eightBit);
        if (eightBit) {
            const y8 = this.Y & 0xFF;
            const res = y8 - value;
            this.setFlag(Status816.C, y8 >= value);
            this.setFlag(Status816.Z, (res & 0xFF) === 0);
            this.setFlag(Status816.N, (res & 0x80) !== 0);
        } else {
            const res = this.Y - value;
            this.setFlag(Status816.C, this.Y >= value);
            this.setFlag(Status816.Z, (res & 0xFFFF) === 0);
            this.setFlag(Status816.N, (res & 0x8000) !== 0);
        }
    }

    private opSTZ(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("write", eightBit ? 1 : 2);
        this.write8or16(address, 0, eightBit);
    }

    // --- Branch Instructions ---
    private doBranch(condition: boolean, offset16: boolean = false) {
        let offset = 0;
        let pcAfterOperand = 0;
        if (offset16) {
            offset = this.fetch16();
            pcAfterOperand = this.PC;
            if (condition) {
                // 16-bit signed offset
                if (offset & 0x8000) offset -= 0x10000;
                this.PC = (this.PC + offset) & 0xFFFF;
            }
        } else {
            offset = this.fetch8();
            pcAfterOperand = this.PC;
            if (condition) {
                // 8-bit signed offset
                if (offset & 0x80) offset -= 0x100;
                this.PC = (this.PC + offset) & 0xFFFF;
            }
        }
        if (!condition) {
            // Not taken: just the opcode and the operand byte.
            return;
        }
        // A taken branch burns a cycle, and one more if the target ends up in a
        // different page than the instruction after the operand.
        this.phantomRead();
        this.addCycles((pcAfterOperand & 0xFF00) !== (this.PC & 0xFF00) ? 1 : 0);
    }

    private opINC(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("rmw", eightBit ? 1 : 2);
        let value = this.read8or16(address, eightBit);
        value++;
        if (eightBit) {
            value &= 0xFF;
            this.setFlag(Status816.Z, value === 0);
            this.setFlag(Status816.N, (value & 0x80) !== 0);
        } else {
            value &= 0xFFFF;
            this.setFlag(Status816.Z, value === 0);
            this.setFlag(Status816.N, (value & 0x8000) !== 0);
        }
        this.write8or16(address, value, eightBit);
    }

    private opDEC(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("rmw", eightBit ? 1 : 2);
        let value = this.read8or16(address, eightBit);
        value--;
        if (eightBit) {
            value &= 0xFF;
            this.setFlag(Status816.Z, value === 0);
            this.setFlag(Status816.N, (value & 0x80) !== 0);
        } else {
            value &= 0xFFFF;
            this.setFlag(Status816.Z, value === 0);
            this.setFlag(Status816.N, (value & 0x8000) !== 0);
        }
        this.write8or16(address, value, eightBit);
    }

    private opINX() {
        const eightBit = this.getFlag(Status816.X);
        this.X++;
        if (eightBit) {
            this.X &= 0xFF;
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x80) !== 0);
        } else {
            this.X &= 0xFFFF;
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x8000) !== 0);
        }
    }

    private opDEX() {
        const eightBit = this.getFlag(Status816.X);
        this.X--;
        if (eightBit) {
            this.X &= 0xFF;
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x80) !== 0);
        } else {
            this.X &= 0xFFFF;
            this.setFlag(Status816.Z, this.X === 0);
            this.setFlag(Status816.N, (this.X & 0x8000) !== 0);
        }
    }

    private opINY() {
        const eightBit = this.getFlag(Status816.X);
        this.Y++;
        if (eightBit) {
            this.Y &= 0xFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x80) !== 0);
        } else {
            this.Y &= 0xFFFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x8000) !== 0);
        }
    }

    private opDEY() {
        const eightBit = this.getFlag(Status816.X);
        this.Y--;
        if (eightBit) {
            this.Y &= 0xFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x80) !== 0);
        } else {
            this.Y &= 0xFFFF;
            this.setFlag(Status816.Z, this.Y === 0);
            this.setFlag(Status816.N, (this.Y & 0x8000) !== 0);
        }
    }

    // Signed overflow for ADC/SBC: set exactly when the two operands share a
    // sign and the result does not.
    //
    // The obvious way to write this is
    //     (!((a ^ b) & mask) && ((a ^ r) & mask)) !== 0
    // and it is WRONG. `!x && y` evaluates to the *boolean* false when the
    // first term fails, and `false !== 0` is TRUE in JavaScript, because
    // strict inequality never coerces across types. So the expression reports
    // overflow for every add whose operands have different signs - which is
    // precisely the case that cannot overflow. The bitwise form below always
    // yields a number, so the `!== 0` comparison behaves.
    //
    // This was not cosmetic: the IIgs ROM's cursor accumulator (FF:9D8D) adds
    // the signed mouse delta with two 8-bit ADCs and the routine it then calls
    // (FF:9E76) branches on V to detect the cursor leaving the screen. With V
    // stuck on, every leftward move was judged out of bounds and the cursor was
    // clamped to the screen maximum - the cursor that only ever climbed.
    private static readonly overflow8 = (a: number, b: number, r: number): boolean =>
        ((~(a ^ b)) & (a ^ r) & 0x80) !== 0;
    private static readonly overflow16 = (a: number, b: number, r: number): boolean =>
        ((~(a ^ b)) & (a ^ r) & 0x8000) !== 0;

    private opADC(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const operand = this.read8or16(address, eightBit);
        const carryIn = this.getFlag(Status816.C) ? 1 : 0;

        if (this.getFlag(Status816.D)) {
            if (eightBit) {
                const a = this.A & 0xFF;
                let al = (a & 0x0F) + (operand & 0x0F) + carryIn;
                if (al >= 0x0A) al = ((al + 0x06) & 0x0F) + 0x10;
                let ua = (a & 0xF0) + (operand & 0xF0) + al;
                if (ua >= 0xA0) ua += 0x60;
                const sa = (a & 0x80 ? (a & 0xF0) - 0x100 : (a & 0xF0)) + 
                           (operand & 0x80 ? (operand & 0xF0) - 0x100 : (operand & 0xF0)) + 
                           al;
                const result8 = ua & 0xFF;
                this.A = (this.A & 0xFF00) | result8;
                this.setFlag(Status816.C, ua >= 0x100);
                this.setFlag(Status816.Z, result8 === 0);
                this.setFlag(Status816.V, sa < -128 || sa > 127);
                this.setFlag(Status816.N, (result8 & 0x80) !== 0);
            } else {
                let aLo = this.A & 0xFF;
                let aHi = (this.A >> 8) & 0xFF;
                let bLo = operand & 0xFF;
                let bHi = (operand >> 8) & 0xFF;

                let al = (aLo & 0x0F) + (bLo & 0x0F) + carryIn;
                if (al >= 0x0A) al = ((al + 0x06) & 0x0F) + 0x10;
                let uaLo = (aLo & 0xF0) + (bLo & 0xF0) + al;
                if (uaLo >= 0xA0) uaLo += 0x60;
                let cOutLo = uaLo >= 0x100 ? 1 : 0;

                let ah = (aHi & 0x0F) + (bHi & 0x0F) + cOutLo;
                if (ah >= 0x0A) ah = ((ah + 0x06) & 0x0F) + 0x10;
                let uaHi = (aHi & 0xF0) + (bHi & 0xF0) + ah;
                if (uaHi >= 0xA0) uaHi += 0x60;

                const result16 = ((uaHi & 0xFF) << 8) | (uaLo & 0xFF);
                this.A = result16;
                this.setFlag(Status816.C, uaHi >= 0x100);
                this.setFlag(Status816.Z, result16 === 0);
                this.setFlag(Status816.N, (uaHi & 0x80) !== 0);
                const sa = (aHi & 0x80 ? (aHi & 0xF0) - 0x100 : (aHi & 0xF0)) + 
                           (bHi & 0x80 ? (bHi & 0xF0) - 0x100 : (bHi & 0xF0)) + 
                           ah;
                this.setFlag(Status816.V, sa < -128 || sa > 127);
            }
            return;
        }

        if (eightBit) {
            const a8 = this.A & 0xFF;
            const result = a8 + operand + carryIn;
            const result8 = result & 0xFF;
            this.setFlag(Status816.C, result > 0xFF);
            this.setFlag(Status816.Z, result8 === 0);
            this.setFlag(Status816.N, (result8 & 0x80) !== 0);
            this.setFlag(Status816.V, CPU65816.overflow8(a8, operand, result8));
            this.A = (this.A & 0xFF00) | result8; // Keep high byte intact
        } else {
            const result = this.A + operand + carryIn;
            const result16 = result & 0xFFFF;
            this.setFlag(Status816.C, result > 0xFFFF);
            this.setFlag(Status816.Z, result16 === 0);
            this.setFlag(Status816.N, (result16 & 0x8000) !== 0);
            this.setFlag(Status816.V, CPU65816.overflow16(this.A, operand, result16));
            this.A = result16;
        }
    }

    private opSBC(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const operand = this.read8or16(address, eightBit);
        const carryIn = this.getFlag(Status816.C) ? 1 : 0;

        if (this.getFlag(Status816.D)) {
            if (eightBit) {
                const a = this.A & 0xFF;
                const n1 = operand ^ 0xFF;
                let al = (a & 0x0F) - (operand & 0x0F) + carryIn - 1;
                if (al < 0) al = ((al - 0x06) & 0x0F) - 0x10;
                let ua = (a & 0xF0) - (operand & 0xF0) + al;
                const v = CPU65816.overflow8(a, n1, ua);
                if (ua < 0) ua -= 0x60;
                const result8 = ua & 0xFF;
                this.A = (this.A & 0xFF00) | result8;
                this.setFlag(Status816.C, ua >= 0);
                this.setFlag(Status816.Z, result8 === 0);
                this.setFlag(Status816.V, v);
                this.setFlag(Status816.N, (result8 & 0x80) !== 0);
            } else {
                let aLo = this.A & 0xFF;
                let aHi = (this.A >> 8) & 0xFF;
                let bLo = operand & 0xFF;
                let bHi = (operand >> 8) & 0xFF;

                let al = (aLo & 0x0F) - (bLo & 0x0F) + carryIn - 1;
                if (al < 0) al = ((al - 0x06) & 0x0F) - 0x10;
                let uaLo = (aLo & 0xF0) - (bLo & 0xF0) + al;
                if (uaLo < 0) uaLo -= 0x60;
                const cOutLo = uaLo >= 0 ? 1 : 0;

                const n1Hi = bHi ^ 0xFF;
                let ah = (aHi & 0x0F) - (bHi & 0x0F) + cOutLo - 1;
                if (ah < 0) ah = ((ah - 0x06) & 0x0F) - 0x10;
                let uaHi = (aHi & 0xF0) - (bHi & 0xF0) + ah;
                const v = CPU65816.overflow8(aHi, n1Hi, uaHi);
                if (uaHi < 0) uaHi -= 0x60;

                const result16 = ((uaHi & 0xFF) << 8) | (uaLo & 0xFF);
                this.A = result16;
                this.setFlag(Status816.C, uaHi >= 0);
                this.setFlag(Status816.Z, result16 === 0);
                this.setFlag(Status816.V, v);
                this.setFlag(Status816.N, (uaHi & 0x80) !== 0);
            }
            return;
        }

        if (eightBit) {
            const a8 = this.A & 0xFF;
            const invertedOperand = operand ^ 0xFF;
            const result = a8 + invertedOperand + carryIn;
            const result8 = result & 0xFF;
            this.setFlag(Status816.C, result >= 0x100);
            this.setFlag(Status816.Z, result8 === 0);
            this.setFlag(Status816.N, (result8 & 0x80) !== 0);
            this.setFlag(Status816.V, CPU65816.overflow8(a8, invertedOperand, result8));
            this.A = (this.A & 0xFF00) | result8; // Keep high byte intact
        } else {
            const invertedOperand = operand ^ 0xFFFF;
            const result = this.A + invertedOperand + carryIn;
            const result16 = result & 0xFFFF;
            this.setFlag(Status816.C, result >= 0x10000);
            this.setFlag(Status816.Z, result16 === 0);
            this.setFlag(Status816.N, (result16 & 0x8000) !== 0);
            this.setFlag(Status816.V, CPU65816.overflow16(this.A, invertedOperand, result16));
            this.A = result16;
        }
    }

    // --- 65816 Specific Instructions ---

    private opXCE() {
        const carry = this.getFlag(Status816.C);
        this.setFlag(Status816.C, this.emulationMode);
        this.setEmulation(carry);
    }

    private opREP() {
        const val = this.fetch8();
        this.setP(this.P & ~val);
    }

    private opSEP() {
        const val = this.fetch8();
        this.setP(this.P | val);
    }

    // --- State Management ---

    private setP(value: number) {
        this.P = value;
        this.applyWidthConstraints();
    }

    private setEmulation(e: boolean) {
        if (!e && this.emulationMode) {
            // Transitioning from emulation to native mode: clear slow mode
            this.enteredNativeMode = true;
        }
        this.emulationMode = e;
        this.applyWidthConstraints();
    }

    private applyWidthConstraints() {
        if (this.emulationMode) {
            this.P |= Status816.M | Status816.X;
            this.X &= 0x00FF;
            this.Y &= 0x00FF;
            this.S = 0x0100 | (this.S & 0x00FF);
        } else {
            if (this.P & Status816.X) {
                this.X &= 0x00FF;
                this.Y &= 0x00FF;
            }
        }
    }

    // --- Bus & Memory ---

    private read8(address: number): number {
        this.addCycles(1);
        return this.readMemory(address & 0xFFFFFF);
    }

    private write8(address: number, value: number) {
        this.addCycles(1);
        this.writeMemory(address & 0xFFFFFF, value & 0xFF);
    }

    // A bus cycle with no data movement: the 6502/65816's dummy reads. The bus
    // is not actually read because apple2ts's own 6502 core does not model the
    // side effects of a phantom read either (matters for $C0xx softswitches).
    private phantomRead() {
        this.addCycles(1)
    }

    // One-byte instructions with no operand: the opcode fetch is the only bus
    // access, so the second cycle is purely internal.
    private simple() {
        this.phantomRead()
    }

    // Charge the internal cycles belonging to the addressing mode that the
    // current instruction used. `addrMode`/`addrCrossed` are set by the addr*()
    // method, which the switch always evaluates before the op*() method.
    private chargeAddress(access: "read" | "write" | "rmw", width = 1) {
        const mode = this.addrMode
        this.addCycles(access === "read" ? ADR_CYC_READ[mode]
            : access === "write" ? ADR_CYC_WRITE[mode] : ADR_CYC_RMW[mode])
        if (access === "read") {
            if (this.addrCrossed) this.addCycles(1)
            return
        }
        if (INDEXED_ADDR_BITSET[mode] === 0) return
        // An indexed store or read-modify-write always pays the extra cycle,
        // even when it does not cross a page boundary.
        this.addCycles(1)
        if (access === "write" && width === 2) this.addCycles(1)
    }

    private fetch8(): number {
        const address = (this.PB << 16) | this.PC;
        const value = this.read8(address);
        this.PC = (this.PC + 1) & 0xFFFF;
        return value;
    }

    private fetch16(): number {
        const lo = this.fetch8();
        const hi = this.fetch8();
        return lo | (hi << 8);
    }

    // --- Addressing Modes ---

    protected addrImmediate(eightBit: boolean): number {
        this.addrMode = ADDR_MODE_816.IMMEDIATE
        const addr = (this.PB << 16) | this.PC;
        this.PC = (this.PC + (eightBit ? 1 : 2)) & 0xFFFF;
        return addr;
    }

    protected addrAbsolute(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE
        const addr = this.fetch16();
        return (this.DB << 16) | addr;
    }

    protected addrAbsoluteLong(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_LONG
        const lo = this.fetch16();
        const bank = this.fetch8();
        return (bank << 16) | lo;
    }

    protected addrDirect(): number {
        this.addrMode = ADDR_MODE_816.DIRECT
        const offset = this.fetch8();
        const addr = (this.D + offset) & 0xFFFF;
        // Direct page is always in Bank 0
        return addr;
    }

    protected addrDirectX(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_X
        const offset = this.fetch8();
        // Emulation mode wraps around page zero if D=0, but native doesn't
        let addr = this.D + offset + this.X;
        if (this.emulationMode && this.D === 0) {
            addr = addr & 0x00FF;
        } else {
            // The 65816 charges an extra cycle whenever the direct page's low
            // byte is non-zero, because the index add can leave the page.
            this.addrCrossed = (this.D & 0xFF) !== 0;
            addr = addr & 0xFFFF;
        }
        return addr;
    }

    protected addrDirectY(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_Y
        const offset = this.fetch8();
        let addr = this.D + offset + this.Y;
        if (this.emulationMode && this.D === 0) {
            addr = addr & 0x00FF;
        } else {
            this.addrCrossed = (this.D & 0xFF) !== 0;
            addr = addr & 0xFFFF;
        }
        return addr;
    }

    protected addrDirectIndirect(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_INDIRECT
        const dpOffset = this.fetch8();
        const addrPtr = (this.D + dpOffset) & 0xFFFF;

        const lo = this.read8(addrPtr);
        const hi = this.read8((addrPtr + 1) & 0xFFFF);

        return (this.DB << 16) | (lo | (hi << 8));
    }

    protected addrDirectIndirectLong(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_INDIRECT_LONG
        const dpOffset = this.fetch8();
        const addrPtr = (this.D + dpOffset) & 0xFFFF;

        const lo = this.read8(addrPtr);
        const hi = this.read8((addrPtr + 1) & 0xFFFF);
        const bank = this.read8((addrPtr + 2) & 0xFFFF);

        return (bank << 16) | (lo | (hi << 8));
    }

    protected addrAbsoluteX(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_X
        const lo = this.fetch16();
        // The index add carries out of the 16-bit word into the bank, as on
        // hardware (gssquared address_abs_x: eaddr = full_db | base + index).
        const addr = (this.DB << 16) + lo + this.X;
        this.addrCrossed = (lo & 0xFF00) !== (addr & 0xFF00);
        return addr;
    }

    protected addrAbsoluteY(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_Y
        const lo = this.fetch16();
        // The index add carries out of the 16-bit word into the bank, as on
        // hardware (gssquared address_abs_y: eaddr = full_db | base + index).
        const addr = (this.DB << 16) + lo + this.Y;
        this.addrCrossed = (lo & 0xFF00) !== (addr & 0xFF00);
        return addr;
    }

    protected addrAbsoluteLongX(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_LONG_X
        const lo = this.fetch16();
        const bank = this.fetch8();
        // Crosses bank boundaries
        return ((bank << 16) | lo) + this.X;
    }

    protected addrDirectIndexedIndirect(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_INDEXED_INDIRECT
        // (dp,X)
        const dpOffset = this.fetch8();
        let ptr = this.D + dpOffset + this.X;
        if (this.emulationMode && this.D === 0) ptr &= 0x00FF;
        else ptr &= 0xFFFF;

        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        return (this.DB << 16) | (lo | (hi << 8));
    }

    protected addrDirectIndirectIndexed(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_INDIRECT_INDEXED
        // (dp),Y
        const dpOffset = this.fetch8();
        const ptr = (this.D + dpOffset) & 0xFFFF;

        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        const baseAddr = lo | (hi << 8);
        const addr = (baseAddr + this.Y) & 0xFFFF;
        this.addrCrossed = (baseAddr & 0xFF00) !== (addr & 0xFF00);

        return (this.DB << 16) | addr;
    }

    protected addrDirectIndirectLongIndexed(): number {
        this.addrMode = ADDR_MODE_816.DIRECT_INDIRECT_LONG_INDEXED
        // [dp],Y
        const dpOffset = this.fetch8();
        const ptr = (this.D + dpOffset) & 0xFFFF;

        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        const bank = this.read8((ptr + 2) & 0xFFFF);

        const baseAddr = (bank << 16) | (lo | (hi << 8));
        return baseAddr + this.Y;
    }

    protected addrStackRelative(): number {
        this.addrMode = ADDR_MODE_816.STACK_RELATIVE
        // d,S
        const offset = this.fetch8();
        const addr = (this.S + offset) & 0xFFFF;
        return addr; // Always Bank 0
    }

    protected addrStackRelativeIndirectIndexed(): number {
        this.addrMode = ADDR_MODE_816.STACK_RELATIVE_INDIRECT_INDEXED
        // (d,S),Y
        const offset = this.fetch8();
        const ptr = (this.S + offset) & 0xFFFF;

        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        const baseAddr = lo | (hi << 8);
        const addr = (baseAddr + this.Y) & 0xFFFF;
        this.addrCrossed = (baseAddr & 0xFF00) !== (addr & 0xFF00);

        return (this.DB << 16) | addr;
    }

    // --- Opcodes Implementations 100% ---

    private opTransfer(src: string, dest: string) {
        let val = 0;

        // Read source
        switch (src) {
            case 'A': val = this.A; break;
            case 'X': val = this.X; break;
            case 'Y': val = this.Y; break;
            case 'S': val = this.S; break;
            case 'D': val = this.D; break;
        }

        // Write dest
        switch (dest) {
            case 'A': 
                const destM = !this.getFlag(Status816.M);
                if (destM) this.A = val & 0xFFFF;
                else this.A = (this.A & 0xFF00) | (val & 0xFF);
                this.setFlag(Status816.Z, (destM ? this.A : this.A & 0xFF) === 0);
                this.setFlag(Status816.N, ((destM ? this.A : this.A & 0xFF) & (destM ? 0x8000 : 0x80)) !== 0);
                break;
            case 'X':
                const destX = !this.getFlag(Status816.X);
                this.X = destX ? val & 0xFFFF : val & 0xFF;
                this.setFlag(Status816.Z, this.X === 0);
                this.setFlag(Status816.N, (this.X & (destX ? 0x8000 : 0x80)) !== 0);
                break;
            case 'Y':
                const destY = !this.getFlag(Status816.X);
                this.Y = destY ? val & 0xFFFF : val & 0xFF;
                this.setFlag(Status816.Z, this.Y === 0);
                this.setFlag(Status816.N, (this.Y & (destY ? 0x8000 : 0x80)) !== 0);
                break;
            case 'S':
                this.S = this.emulationMode ? (0x0100 | (val & 0xFF)) : (val & 0xFFFF);
                break;
            case 'D':
                this.D = val & 0xFFFF;
                this.setFlag(Status816.Z, this.D === 0);
                this.setFlag(Status816.N, (this.D & 0x8000) !== 0);
                break;
        }
    }

    private opTCD() {
        this.D = this.A & 0xFFFF;
        this.setFlag(Status816.Z, this.D === 0);
        this.setFlag(Status816.N, (this.D & 0x8000) !== 0);
    }

    private opTDC() {
        this.A = this.D & 0xFFFF;
        this.setFlag(Status816.Z, this.A === 0);
        this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
    }

    private opTSC() {
        this.A = this.S & 0xFFFF;
        this.setFlag(Status816.Z, this.A === 0);
        this.setFlag(Status816.N, (this.A & 0x8000) !== 0);
    }

    private opTCS() {
        this.S = this.emulationMode ? (0x0100 | (this.A & 0xFF)) : (this.A & 0xFFFF);
    }

    private opXBA() {
        const lo = this.A & 0xFF;
        const hi = (this.A >> 8) & 0xFF;
        this.A = (lo << 8) | hi;
        this.setFlag(Status816.Z, hi === 0);
        this.setFlag(Status816.N, (hi & 0x80) !== 0);
    }

    // Stack pushes and pulls burn internal cycles on top of the bus accesses:
    // a push is the opcode plus one internal cycle, a pull needs the opcode, a
    // dummy read of PC and a cycle to increment the stack pointer.
    private opPush(reg: string, val: number = 0) {
        switch (reg) {
            case 'A': this.getFlag(Status816.M) ? this.push8(this.A & 0xFF) : this.push16(this.A); break;
            case 'X': this.getFlag(Status816.X) ? this.push8(this.X & 0xFF) : this.push16(this.X); break;
            case 'Y': this.getFlag(Status816.X) ? this.push8(this.Y & 0xFF) : this.push16(this.Y); break;
            case 'P': this.push8(this.P | (this.emulationMode ? 0x10 : 0x00)); break; // Break flag injected in E mode
            case 'B': this.push8Wide(this.DB); this.normaliseStack(); break;
            case 'D': this.push16Wide(this.D); this.normaliseStack(); break;
            case 'K': this.push8Wide(this.PB); this.normaliseStack(); break;
            case 'PEA': case 'PEI': this.push16Wide(val); this.normaliseStack(); return;
            // PER also has to add the signed offset to the current PC.
            case 'PER': this.phantomRead(); this.push16Wide(val); this.normaliseStack(); return;
        }
        this.phantomRead();
    }

    private opPop(reg: string) {
        // Dummy read of PC, plus a cycle to increment the stack pointer.
        this.phantomRead();
        this.phantomRead();
        let val = 0;
        switch (reg) {
            case 'A':
                const m = this.getFlag(Status816.M);
                val = m ? this.pop8() : this.pop16();
                this.A = m ? (this.A & 0xFF00) | val : val;
                this.setFlag(Status816.Z, val === 0);
                this.setFlag(Status816.N, (val & (m ? 0x80 : 0x8000)) !== 0);
                break;
            case 'X':
                const x8 = this.getFlag(Status816.X);
                val = x8 ? this.pop8() : this.pop16();
                this.X = val;
                this.setFlag(Status816.Z, val === 0);
                this.setFlag(Status816.N, (val & (x8 ? 0x80 : 0x8000)) !== 0);
                break;
            case 'Y':
                const y8 = this.getFlag(Status816.X);
                val = y8 ? this.pop8() : this.pop16();
                this.Y = val;
                this.setFlag(Status816.Z, val === 0);
                this.setFlag(Status816.N, (val & (y8 ? 0x80 : 0x8000)) !== 0);
                break;
            case 'P':
                this.P = this.pop8();
                if (this.emulationMode) {
                    this.setFlag(Status816.M, true);
                    this.setFlag(Status816.X, true);
                }
                break;
            case 'B':
                this.DB = this.pop8Wide();
                this.normaliseStack();
                this.setFlag(Status816.Z, this.DB === 0);
                this.setFlag(Status816.N, (this.DB & 0x80) !== 0);
                break;
            case 'D':
                this.D = this.pop16Wide();
                this.normaliseStack();
                this.setFlag(Status816.Z, this.D === 0);
                this.setFlag(Status816.N, (this.D & 0x8000) !== 0);
                break;
        }
    }

    private opShift(type: string, address: number) {
        const isAcc = (address === -1);
        const eightBit = this.getFlag(Status816.M);
        if (isAcc) {
            this.addrMode = ADDR_MODE_816.ACCUMULATOR
            // ASL A and friends take two cycles: the fetch plus one internal.
            this.addCycles(1)
        } else {
            this.chargeAddress("rmw", eightBit ? 1 : 2)
        }
        let val = isAcc ? (eightBit ? this.A & 0xFF : this.A) : this.read8or16(address, eightBit);
        
        let carryOut = false;
        if (type === 'ASL') {
            carryOut = (val & (eightBit ? 0x80 : 0x8000)) !== 0;
            val = (val << 1) & (eightBit ? 0xFF : 0xFFFF);
        } else if (type === 'LSR') {
            carryOut = (val & 1) !== 0;
            val = (val >> 1) & (eightBit ? 0x7F : 0x7FFF);
        } else if (type === 'ROL') {
            const oldCarry = this.getFlag(Status816.C) ? 1 : 0;
            carryOut = (val & (eightBit ? 0x80 : 0x8000)) !== 0;
            val = ((val << 1) | oldCarry) & (eightBit ? 0xFF : 0xFFFF);
        } else if (type === 'ROR') {
            const oldCarry = this.getFlag(Status816.C) ? (eightBit ? 0x80 : 0x8000) : 0;
            carryOut = (val & 1) !== 0;
            val = ((val >> 1) | oldCarry) & (eightBit ? 0xFF : 0xFFFF);
        }

        this.setFlag(Status816.C, carryOut);
        this.setFlag(Status816.Z, val === 0);
        this.setFlag(Status816.N, (val & (eightBit ? 0x80 : 0x8000)) !== 0);

        if (isAcc) {
            if (eightBit) this.A = (this.A & 0xFF00) | val;
            else this.A = val;
        } else {
            this.write8or16(address, val, eightBit);
        }
    }

    private opBIT(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("read", eightBit ? 1 : 2);
        const val = this.read8or16(address, eightBit);
        const mask = eightBit ? 0xFF : 0xFFFF;
        const res = (this.A & mask) & val;
        this.setFlag(Status816.Z, res === 0);
        this.setFlag(Status816.N, (val & (eightBit ? 0x80 : 0x8000)) !== 0);
        this.setFlag(Status816.V, (val & (eightBit ? 0x40 : 0x4000)) !== 0);
    }

    private opTRB(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("rmw", eightBit ? 1 : 2);
        const val = this.read8or16(address, eightBit);
        const mask = eightBit ? 0xFF : 0xFFFF;
        this.setFlag(Status816.Z, ((this.A & mask) & val) === 0);
        const newVal = val & ~(this.A & mask);
        this.write8or16(address, newVal, eightBit);
    }

    private opTSB(address: number) {
        const eightBit = this.getFlag(Status816.M);
        this.chargeAddress("rmw", eightBit ? 1 : 2);
        const val = this.read8or16(address, eightBit);
        const mask = eightBit ? 0xFF : 0xFFFF;
        this.setFlag(Status816.Z, ((this.A & mask) & val) === 0);
        const newVal = val | (this.A & mask);
        this.write8or16(address, newVal, eightBit);
    }

    protected addrAbsoluteIndirect(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_INDIRECT
        const ptr = this.fetch16();
        // JMP/JSRL (absolute indirect): fetch the pointer operand from the
        // instruction's bank, but always read the 16-bit target from bank $00.
        // Reading the pointer through PB sent execution into bank $11's data
        // buffer and drove it into a BRK/COP there.
        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        return lo | (hi << 8);
    }

    protected addrAbsoluteIndexedIndirect(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_INDEXED_INDIRECT
        const ptr = (this.fetch16() + this.X) & 0xFFFF;
        const lo = this.read8((this.PB << 16) | ptr);
        const hi = this.read8((this.PB << 16) | ((ptr + 1) & 0xFFFF));
        return lo | (hi << 8);
    }

    protected addrAbsoluteIndirectLong(): number {
        this.addrMode = ADDR_MODE_816.ABSOLUTE_INDIRECT_LONG
        const ptr = this.fetch16();
        const lo = this.read8(ptr);
        const hi = this.read8((ptr + 1) & 0xFFFF);
        const bank = this.read8((ptr + 2) & 0xFFFF);
        return (bank << 16) | lo | (hi << 8);
    }

    // --- Stack ---

    private push8(value: number) {
        this.write8(this.S, value);
        if (this.emulationMode) {
            this.S = 0x0100 | ((this.S - 1) & 0x00FF);
        } else {
            this.S = (this.S - 1) & 0xFFFF;
        }
    }

    private pop8(): number {
        if (this.emulationMode) {
            this.S = 0x0100 | ((this.S + 1) & 0x00FF);
        } else {
            this.S = (this.S + 1) & 0xFFFF;
        }
        return this.read8(this.S);
    }

    protected push16(value: number) {
        this.push8((value >> 8) & 0xFF);
        this.push8(value & 0xFF);
    }

    protected pop16(): number {
        const lo = this.pop8();
        const hi = this.pop8();
        return lo | (hi << 8);
    }

    // Wide versions for 65816-specific instructions (JSL, RTL, PHD, PLD, etc.)
    // These don't enforce page-one wrapping during the operation
    private push8Wide(value: number) {
        this.write8(this.S, value);
        this.S = (this.S - 1) & 0xFFFF;
    }

    private pop8Wide(): number {
        this.S = (this.S + 1) & 0xFFFF;
        return this.read8(this.S);
    }

    private push16Wide(value: number) {
        this.push8Wide((value >> 8) & 0xFF);
        this.push8Wide(value & 0xFF);
    }

    private pop16Wide(): number {
        const lo = this.pop8Wide();
        const hi = this.pop8Wide();
        return lo | (hi << 8);
    }

    private normaliseStack() {
        if (this.emulationMode) {
            this.S = 0x0100 | (this.S & 0x00FF);
        }
    }

    // --- Helpers ---

    private setFlag(flag: Status816, value: boolean) {
        if (value) {
            this.P |= flag;
        } else {
            this.P &= ~flag;
        }
    }

    private getFlag(flag: Status816): boolean {
        return (this.P & flag) !== 0;
    }
}

