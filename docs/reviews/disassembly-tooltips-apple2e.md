# Apple IIe disassembly tooltip review

Each row records the semantic-tooltip outcome. Adjacent addresses with the same behavior share one range. _No semantic tooltip_ means that the address is known but the operation intentionally displays no semantic or generic value tooltip. Blue code spans mark only runtime-dependent text; they are not part of the actual tooltip.
The Value column uses representative runtime values only to make conditional tooltip text concrete; it does not imply a particular source register, preceding instruction, or machine state.

| Range | Access | Value | Tooltip |
|---|---|---|---|
| $C000–$C00F | Read | $5D | Keyboard: "`]`"<br>Keyboard strobe: `CLEAR` (MSB = `0`) |
| $C000–$C00F | Read | $DD | Keyboard: "`]`"<br>Keyboard strobe: `SET` (MSB = `1`) |
| $C000 | Write |  | Make PAGE2 select display page 1 or 2 |
| $C001 | Write |  | Make PAGE2 select main or auxiliary display memory |
| $C002 | Write |  | Select main memory for reads |
| $C003 | Write |  | Select auxiliary memory for reads |
| $C004 | Write |  | Select main memory for writes |
| $C005 | Write |  | Select auxiliary memory for writes |
| $C006 | Write |  | Select slot ROM for $C100-$CFFF |
| $C007 | Write |  | Select internal ROM for $C100-$CFFF |
| $C008 | Write |  | Select main zero page, stack, and bank-switched RAM |
| $C009 | Write |  | Select auxiliary zero page, stack, and bank-switched RAM |
| $C00A | Write |  | Select internal ROM for $C300-$C3FF |
| $C00B | Write |  | Select slot ROM for $C300-$C3FF |
| $C00C | Write |  | Set display width to 40 columns |
| $C00D | Write |  | Set display width to 80 columns |
| $C00E | Write |  | Select primary character set |
| $C00F | Write |  | Select alternate character set |
| $C010 | Read | $00 | Any-key-down flag: `CLEAR` (MSB = `0`)<br>Clear keyboard strobe |
| $C010 | Read | $80 | Any-key-down flag: `SET` (MSB = `1`)<br>Clear keyboard strobe |
| $C010–$C01F | Write |  | Clear keyboard strobe |
| $C011 | Read | $00 | Language Card bank: `1` (MSB = `0`) |
| $C011 | Read | $80 | Language Card bank: `2` (MSB = `1`) |
| $C012 | Read | $00 | Language Card read source: `ROM` (MSB = `0`) |
| $C012 | Read | $80 | Language Card read source: `RAM` (MSB = `1`) |
| $C013 | Read | $00 | Auxiliary-memory reads: `OFF` (MSB = `0`) |
| $C013 | Read | $80 | Auxiliary-memory reads: `ON` (MSB = `1`) |
| $C014 | Read | $00 | Auxiliary-memory writes: `OFF` (MSB = `0`) |
| $C014 | Read | $80 | Auxiliary-memory writes: `ON` (MSB = `1`) |
| $C015 | Read | $00 | Internal $Cx ROM: `OFF` (MSB = `0`) |
| $C015 | Read | $80 | Internal $Cx ROM: `ON` (MSB = `1`) |
| $C016 | Read | $00 | Zero page, stack, and bank-switched RAM: `MAIN` (MSB = `0`) |
| $C016 | Read | $80 | Zero page, stack, and bank-switched RAM: `AUXILIARY` (MSB = `1`) |
| $C017 | Read | $00 | Slot 3 ROM: `OFF` (MSB = `0`) |
| $C017 | Read | $80 | Slot 3 ROM: `ON` (MSB = `1`) |
| $C018 | Read | $00 | PAGE2 selects display page 1 or 2 (MSB = `0`) |
| $C018 | Read | $80 | PAGE2 selects main or auxiliary display memory (MSB = `1`) |
| $C019 | Read | $00 | Vertical blank: `ACTIVE` (MSB = `0`) |
| $C019 | Read | $80 | Vertical blank: `INACTIVE` (MSB = `1`) |
| $C01A | Read | $00 | Text mode: `OFF` (MSB = `0`) |
| $C01A | Read | $80 | Text mode: `ON` (MSB = `1`) |
| $C01B | Read | $00 | Mixed display: `OFF` (MSB = `0`) |
| $C01B | Read | $80 | Mixed display: `ON` (MSB = `1`) |
| $C01C | Read | $00 | Display-memory selection: `PAGE 1 OR MAIN` (MSB = `0`) |
| $C01C | Read | $80 | Display-memory selection: `PAGE 2 OR AUXILIARY` (MSB = `1`) |
| $C01D | Read | $00 | Hi-res mode: `OFF` (MSB = `0`) |
| $C01D | Read | $80 | Hi-res mode: `ON` (MSB = `1`) |
| $C01E | Read | $00 | Alternate character set: `OFF` (MSB = `0`) |
| $C01E | Read | $80 | Alternate character set: `ON` (MSB = `1`) |
| $C01F | Read | $00 | 80-column display: `OFF` (MSB = `0`) |
| $C01F | Read | $80 | 80-column display: `ON` (MSB = `1`) |
| $C020 | Read/write |  | Toggle cassette output |
| $C030 | Read/write |  | Toggle speaker output |
| $C040 | Read/write |  | Pulse game-port strobe |
| $C04F | Read/write |  | INFO: Apple2TS emulator identifier: $CD |
| $C050 | Read/write |  | Select graphics mode |
| $C051 | Read/write |  | Select text mode |
| $C052 | Read/write |  | Select full-screen display |
| $C053 | Read/write |  | Select mixed graphics/text |
| $C054 | Read/write |  | Select display page 1, or main display memory with 80STORE |
| $C055 | Read/write |  | Select display page 2, or auxiliary display memory with 80STORE |
| $C056 | Read/write |  | Select lo-res graphics |
| $C057 | Read/write |  | Select hi-res graphics |
| $C058 | Read/write |  | Disable annunciator 0 |
| $C059 | Read/write |  | Enable annunciator 0 |
| $C05A | Read/write |  | Disable annunciator 1 |
| $C05B | Read/write |  | Enable annunciator 1 |
| $C05C | Read/write |  | Disable annunciator 2 |
| $C05D | Read/write |  | Enable annunciator 2 |
| $C05E | Read/write |  | Disable annunciator 3<br>Enable DHIRES |
| $C05F | Read/write |  | Enable annunciator 3<br>Disable DHIRES |
| $C060 | Read |  | Sample cassette input |
| $C060–$C06F | Write |  | _No semantic tooltip_ |
| $C061 | Read | $00 | Pushbutton 0: `RELEASED` (MSB = `0`) |
| $C061 | Read | $80 | Pushbutton 0: `PRESSED` (MSB = `1`) |
| $C062 | Read | $00 | Pushbutton 1: `RELEASED` (MSB = `0`) |
| $C062 | Read | $80 | Pushbutton 1: `PRESSED` (MSB = `1`) |
| $C063 | Read | $00 | Pushbutton 2: `RELEASED` (MSB = `0`) |
| $C063 | Read | $80 | Pushbutton 2: `PRESSED` (MSB = `1`) |
| $C064 | Read | $00 | Paddle 0 timer: `EXPIRED` (MSB = `0`) |
| $C064 | Read | $80 | Paddle 0 timer: `ACTIVE` (MSB = `1`) |
| $C065 | Read | $00 | Paddle 1 timer: `EXPIRED` (MSB = `0`) |
| $C065 | Read | $80 | Paddle 1 timer: `ACTIVE` (MSB = `1`) |
| $C066 | Read | $00 | Paddle 2 timer: `EXPIRED` (MSB = `0`) |
| $C066 | Read | $80 | Paddle 2 timer: `ACTIVE` (MSB = `1`) |
| $C067 | Read | $00 | Paddle 3 timer: `EXPIRED` (MSB = `0`) |
| $C067 | Read | $80 | Paddle 3 timer: `ACTIVE` (MSB = `1`) |
| $C068 | Read |  | Sample cassette-input mirror |
| $C069 | Read | $00 | Pushbutton 0 mirror: `RELEASED` (MSB = `0`) |
| $C069 | Read | $80 | Pushbutton 0 mirror: `PRESSED` (MSB = `1`) |
| $C06A | Read | $00 | Pushbutton 1 mirror: `RELEASED` (MSB = `0`) |
| $C06A | Read | $80 | Pushbutton 1 mirror: `PRESSED` (MSB = `1`) |
| $C06B | Read | $00 | Pushbutton 2 mirror: `RELEASED` (MSB = `0`) |
| $C06B | Read | $80 | Pushbutton 2 mirror: `PRESSED` (MSB = `1`) |
| $C06C | Read | $00 | Paddle 0 timer mirror: `EXPIRED` (MSB = `0`) |
| $C06C | Read | $80 | Paddle 0 timer mirror: `ACTIVE` (MSB = `1`) |
| $C06D | Read | $00 | Paddle 1 timer mirror: `EXPIRED` (MSB = `0`) |
| $C06D | Read | $80 | Paddle 1 timer mirror: `ACTIVE` (MSB = `1`) |
| $C06E | Read | $00 | Paddle 2 timer mirror: `EXPIRED` (MSB = `0`) |
| $C06E | Read | $80 | Paddle 2 timer mirror: `ACTIVE` (MSB = `1`) |
| $C06F | Read | $00 | Paddle 3 timer mirror: `EXPIRED` (MSB = `0`) |
| $C06F | Read | $80 | Paddle 3 timer mirror: `ACTIVE` (MSB = `1`) |
| $C070 | Read/write |  | Start paddle timers |
| $C071 | Read |  | Start paddle timers |
| $C071 | Write | $03 | Start paddle timers<br>Select auxiliary expansion bank $03 using Neptune addressing |
| $C072 | Read/write |  | Start paddle timers |
| $C073–$C074 | Read |  | Start paddle timers |
| $C073 | Write | $03 | Start paddle timers<br>Select auxiliary expansion bank $03 using RamWorks addressing |
| $C074 | Write | $00 | Start paddle timers<br>TransWarp: Select configured maximum speed<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C074 | Write | $01 | Start paddle timers<br>TransWarp: Select 1 MHz<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C074 | Write | $03 | Start paddle timers<br>TransWarp: Disable acceleration until cold boot<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C074 | Write | $40 | Start paddle timers<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C074 | Write | $A0 | Start paddle timers<br>Laser 128EX: Select 2.3 MHz maximum CPU speed<br>Laser 128EX: Enable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C074 | Write | $C0 | Start paddle timers<br>Laser 128EX: Select 3.6 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| $C075–$C07F | Read/write |  | Start paddle timers |
| $C080 | Read |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Disable writes |
| $C080 | Write |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |
| $C081 | Read |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Arm or enable writes |
| $C081–$C082 | Write |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Reset prewrite latch |
| $C082 | Read |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Disable writes |
| $C083 | Read |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Arm or enable writes |
| $C083–$C084 | Write |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |
| $C084 | Read |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Disable writes |
| $C085 | Read |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Arm or enable writes |
| $C085–$C086 | Write |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Reset prewrite latch |
| $C086 | Read |  | Language Card: Select bank 2<br>Language Card: Use ROM for reads<br>Language Card: Disable writes |
| $C087 | Read |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Arm or enable writes |
| $C087 | Write |  | Language Card: Select bank 2<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |
| $C088 | Read |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Disable writes |
| $C088 | Write |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |
| $C089 | Read |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Arm or enable writes |
| $C089–$C08A | Write |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Reset prewrite latch |
| $C08A | Read |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Disable writes |
| $C08B | Read |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Arm or enable writes |
| $C08B–$C08C | Write |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |
| $C08C | Read |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Disable writes |
| $C08D | Read |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Arm or enable writes |
| $C08D–$C08E | Write |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Reset prewrite latch |
| $C08E | Read |  | Language Card: Select bank 1<br>Language Card: Use ROM for reads<br>Language Card: Disable writes |
| $C08F | Read |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Arm or enable writes |
| $C08F | Write |  | Language Card: Select bank 1<br>Language Card: Use RAM for reads<br>Language Card: Reset prewrite latch |

## Instruction-sensitive cases

These representative instructions exercise tooltips whose meaning or warning depends on how the instruction accesses the soft switch. Indexed and indirect examples assume that the displayed instruction is at the current PC; paused state does not reliably resolve those operands on other rows (issue #303).

| Instruction | Write value | Tooltip |
|---|---|---|
| `INC $C030` | — | WARNING: This instruction triggers the soft switch multiple times |
| `STA $C070,X (X = $03)` | $03 | Start paddle timers<br>WARNING: This instruction triggers the soft switch multiple times<br>Select auxiliary expansion bank $03 using RamWorks addressing |
| `INC $C073` | UNKNOWN | Start paddle timers<br>WARNING: This instruction writes an unknown value |
| `STA $C070,X (X = $04)` | $01 | Start paddle timers<br>WARNING: This instruction triggers the soft switch multiple times<br>TransWarp: Select 1 MHz<br>Laser 128EX: Select 1 MHz maximum CPU speed<br>Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| `INC $C074` | UNKNOWN | Start paddle timers<br>WARNING: This instruction writes an unknown value |
