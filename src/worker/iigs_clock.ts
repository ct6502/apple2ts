/**
 * iigs_clock.ts - Apple IIgs clock chip (CB serial bus) emulation
 *
 * Verbatim port of gssquared's RTC device (src/devices/rtc/RTC.hpp,
 * rtc_pram.cpp): the clock chip sits on the CB serial bus and exposes
 * $C033 (data) / $C034 (control). The system ROM's serial driver
 * (ff:b635/ff:b669 in bank FF) drives command/address/data transactions
 * over it to read and write the 256-byte battery RAM and the seconds
 * registers.
 *
 * $C034 bits 7-5 (raw value >> 5): bit 2 = start transaction, bit 1 =
 * read (vs write), bit 0 = clock enable. Reads of $C034 return the
 * control byte shifted back into bits 7-5; bit 7 doubles as the
 * "operation in progress" line the driver polls until clear.
 */

// RTC_START_TRANS / RTC_READ_WRITE / RTC_CLOCK_ENABLE (gssquared RTC.hpp)
const RTC_START_TRANS = 0b100
const RTC_CLOCK_ENABLE = 0b001

const UNIX_EPOCH_DELTA = 2082844800 // seconds between 1904 and 1970

enum RTC_State {
    AWAIT_COMMAND,
    AWAIT_COMMAND2,
    AWAIT_DATA,
}

class IIgsClock {
    private bram = new Uint8Array(256)
    private seconds = 0 // seconds since 1904, kept in seconds_bytes
    private commandReg: [number, number] = [0, 0]
    private dataReg = 0
    private ctlRegByte = RTC_CLOCK_ENABLE
    private transactionStepCount = 0
    private state = RTC_State.AWAIT_COMMAND

    constructor() {
        // gssquared RTC(): init_default_bram() then finish_construct().
        // init_default_bram fills bram[i] = i; we then override entries
        // 0xB0-0xB7 with the CB version signature block a real ROM3 IIgs
        // holds in battery RAM. The ROM's CB serial driver (ff:b540) reads
        // these over the serial bus (entry Y -> byte1=0x38|(Y>>5),
        // byte2=0x40|((Y&0x1F)<<2) -> bram[((byte1&7)<<5)|((byte2&0x7C)>>2)])
        // and copies them to $0310-$0317, which the signature check at
        // ff:71a0 then compares against $FF7350-$FF7357 = cb d2 c7 c2 10
        // a2 e8 03. Without this seed the check fails into "System Bad".
        for (let i = 0; i < 256; i++) this.bram[i] = i & 0xFF
        const sig = [0xcb, 0xd2, 0xc7, 0xc2, 0x10, 0xa2, 0xe8, 0x03]
        for (let i = 0; i < 8; i++) this.bram[0xb0 + i] = sig[i]
        this.updateSeconds()
    }

    reset(coldBoot = false): void {
        this.state = RTC_State.AWAIT_COMMAND
        this.ctlRegByte = RTC_CLOCK_ENABLE
        this.transactionStepCount = 0
        this.commandReg = [0, 0]
        this.dataReg = 0
        if (coldBoot) {
            for (let i = 0; i < 256; i++) this.bram[i] = i & 0xFF
            const sig = [0xcb, 0xd2, 0xc7, 0xc2, 0x10, 0xa2, 0xe8, 0x03]
            for (let i = 0; i < 8; i++) this.bram[0xb0 + i] = sig[i]
            this.updateSeconds()
        }
    }

    // ---- Data / control registers ($C033, $C034) -----------------------

    writeData(value: number): void {
        this.dataReg = value & 0xFF
    }

    readData(): number {
        return this.dataReg
    }

    writeControl(value: number): void {
        this.writeControlReg((value >> 5) & 0b111)
    }

    readControl(): number {
        this.tickClock()
        // rtc_pram read_C034: (rtcval << 5)
        return (this.ctlRegByte & 0xFF) << 5
    }

    // ---- gssquared RTC internals (verbatim logic) ----------------------

    private writeControlReg(cmd: number): void {
        if (cmd & 0b101) {
            switch (this.state) {
                case RTC_State.AWAIT_COMMAND:
                    this.commandReg[0] = this.dataReg
                    this.commandReg[1] = 0
                    // Two-byte command: first byte matches 0b0'0111'000
                    // (mask 0x78, value 0x38) — the 256-byte BRAM form.
                    if ((this.dataReg & 0x78) === 0x38) {
                        this.state = RTC_State.AWAIT_COMMAND2
                    } else {
                        this.state = RTC_State.AWAIT_DATA
                    }
                    break

                case RTC_State.AWAIT_COMMAND2:
                    this.commandReg[1] = this.dataReg
                    this.state = RTC_State.AWAIT_DATA
                    break

                case RTC_State.AWAIT_DATA:
                    this.executeCommand()
                    this.state = RTC_State.AWAIT_COMMAND
                    break
            }
            this.transactionStepCount = 2
        }
        this.ctlRegByte = cmd
    }

    private executeCommand(): void {
        const cmd = this.commandReg[0]
        this.updateSeconds()

        // seconds registers: lo / next-to-lo / next-to-hi / hi
        if ((cmd & 0b01111111) === 0b00000001) {
            if (cmd & 0b10000000) this.dataReg = (this.seconds >>> 0) & 0xFF
            else this.seconds = (this.seconds & ~0xFF) | this.dataReg
        } else if ((cmd & 0b01111111) === 0b00000101) {
            if (cmd & 0b10000000) this.dataReg = (this.seconds >>> 8) & 0xFF
            else this.seconds = (this.seconds & ~0xFF00) | ((this.dataReg & 0xFF) << 8)
        } else if ((cmd & 0b01111111) === 0b00001001) {
            if (cmd & 0b10000000) this.dataReg = (this.seconds >>> 16) & 0xFF
            else this.seconds = (this.seconds & ~0xFF0000) | ((this.dataReg & 0xFF) << 16)
        } else if ((cmd & 0b01111111) === 0b00001101) {
            if (cmd & 0b10000000) this.dataReg = (this.seconds >>> 24) & 0xFF
            else this.seconds = (this.seconds & ~0xFF000000) | ((this.dataReg & 0xFF) << 24)
        } else if ((cmd & 0x73) === 0x41) {
            // 4 RAM addresses - z010ab01  (mask 0b0'111'00'11 = 0x73)
            const addr = (cmd & 0x30) >> 2 // (cmd & 0b0'000'11'00) >> 2
            if (cmd & 0b10000000) this.dataReg = this.bram[addr & 0xFF]
            else this.bram[addr & 0xFF] = this.dataReg
        } else if ((cmd & 0x43) === 0x41) {
            // 16 RAM addresses - z1abcd01  (mask 0b0'1'0000'11 = 0x43)
            const addr = (cmd & 0x3C) >> 2 // (cmd & 0b0'0'1111'00) >> 2
            if (cmd & 0b10000000) this.dataReg = this.bram[addr & 0xFF]
            else this.bram[addr & 0xFF] = this.dataReg
        } else if ((cmd & 0x78) === 0x38) {
            // two byte command - 256-byte BRAM access (0b0'0111'000 = 0x38)
            const addr = ((cmd & 0b111) << 5) | ((this.commandReg[1] & 0b01111100) >> 2)
            if (cmd & 0b10000000) this.dataReg = this.bram[addr & 0xFF]
            else this.bram[addr & 0xFF] = this.dataReg
        }
        // else: unknown command - data_reg untouched
    }

    private tickClock(): void {
        // ctl_reg.clock_enable_assert && ctl_reg.start_transaction
        if ((this.ctlRegByte & RTC_CLOCK_ENABLE) && (this.ctlRegByte & RTC_START_TRANS)) {
            this.transactionStepCount--
            if (this.transactionStepCount === 0) {
                this.ctlRegByte &= ~RTC_START_TRANS
            }
        }
    }

    private updateSeconds(): void {
        const now = Math.floor(Date.now() / 1000)
        this.seconds = (now + UNIX_EPOCH_DELTA) >>> 0
    }
}

// Singleton instance
export const iigsClock = new IIgsClock()
