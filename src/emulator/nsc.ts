
// Modified from nsc.ts from Apple2JS project by Michael Morrison
// https://github.com/whscullin/apple2js/blob/main/js/cards/nsc.ts

// Apple2JS sources are Copyright Will Skullin and Covered by MIT License

type bit = 0 | 1;

const PATTERN = [0xc5, 0x3a, 0xa3, 0x5c, 0xc5, 0x3a, 0xa3, 0x5c];

const A0 = 0x01;
const A2 = 0x04;

class NoSlotClock {
    bits: bit[] = [];
    pattern = new Array(64);
    patternIdx: number = 0;

    constructor() {
    }

    private patternMatch() {
        for (let idx = 0; idx < 8; idx++) {
            let byte = 0;
            for (let jdx = 0; jdx < 8; jdx++) {
                byte >>= 1;
                byte |= this.pattern.shift() ? 0x80 : 0x00;
            }
            if (byte !== PATTERN[idx]) {
                return false;
            }
        }
        return true;
    }

    private calcBits() {
        const shift = (val: number) => {
            for (let idx = 0; idx < 4; idx++) {
                this.bits.push(val & 0x08 ? 0x01 : 0x00);
                val <<= 1;
            }
        };
        const shiftBCD = (val: number) => {
            shift(Math.floor(val / 10));
            shift(Math.floor(val % 10));
        };

        const now = new Date();
        const year = now.getFullYear() % 100;
        const day = now.getDate();
        const weekday = now.getDay() + 1;
        const month = now.getMonth() + 1;
        const hour = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const hundredths = now.getMilliseconds() / 10;

        this.bits = [];

        shiftBCD(year);
        shiftBCD(month);
        shiftBCD(day);
        shiftBCD(weekday);
        shiftBCD(hour);
        shiftBCD(minutes);
        shiftBCD(seconds);
        shiftBCD(hundredths);
    }

    access(off: number) : void {
        // only want offset, not page
        off &= 0xff;
        if (off & A2) {
            this.patternIdx = 0;
        } else {
            const abit = off & A0;
            this.pattern[this.patternIdx++] = abit;
            if (this.patternIdx === 64) {
                if (this.patternMatch()) {
                    this.calcBits();
                }
                this.patternIdx = 0;
            }
        }
    }

    read(addr: number): number {
        addr &= 0xff;
        if (this.bits.length > 0) {
            const bit = this.bits.pop()!;
            return bit;
        } else {
            this.access(addr);
        }
        return -1;
    }

    reset() {
      this.patternIdx = 0;
    }
}

export const noSlotClock = new NoSlotClock();

