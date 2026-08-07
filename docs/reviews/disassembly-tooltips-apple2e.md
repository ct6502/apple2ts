# Apple IIe disassembly tooltip review

Each row is a concrete rendered tooltip. Adjacent addresses with the same behavior share one range. Blue code spans mark only runtime-dependent text; they are not part of the actual tooltip.
The Value column uses representative runtime values only to make conditional tooltip text concrete; it does not imply a particular source register, preceding instruction, or machine state.

| Range | Access | Value | Tooltip |
|---|---|---|---|
| $C000–$C00F | Read | $5D | Keyboard = "`]`"; Strobe is `CLEAR` (bit 7 = `0`) |
| $C000–$C00F | Read | $DD | Keyboard = "`]`"; Strobe is `SET` (bit 7 = `1`) |
| $C000 | Write |  | Disable PAGE2 display-memory banking |
| $C001 | Write |  | Enable PAGE2 display-memory banking |
| $C002 | Write |  | Select main memory for reads |
| $C003 | Write |  | Select auxiliary memory for reads |
| $C004 | Write |  | Select main memory for writes |
| $C005 | Write |  | Select auxiliary memory for writes |
| $C006 | Write |  | Select slot ROM for $C100-$CFFF |
| $C007 | Write |  | Select internal ROM for $C100-$CFFF |
| $C008 | Write |  | Select main zero page and stack |
| $C009 | Write |  | Select auxiliary zero page and stack |
| $C00A | Write |  | Select internal ROM for $C300-$C3FF |
| $C00B | Write |  | Select slot 3 ROM |
| $C00C | Write |  | Select 40-column display |
| $C00D | Write |  | Select 80-column display |
| $C00E | Write |  | Select primary character set |
| $C00F | Write |  | Select alternate character set |
| $C010 | Read | $00 | Any Key Down = `NO` (bit 7 = `0`); Clear keyboard strobe |
| $C010 | Read | $80 | Any Key Down = `YES` (bit 7 = `1`); Clear keyboard strobe |
| $C010–$C01F | Write |  | Clear keyboard strobe |
| $C011 | Read | $00 | Language Card Bank = `1` (bit 7 = `0`) |
| $C011 | Read | $80 | Language Card Bank = `2` (bit 7 = `1`) |
| $C012 | Read | $00 | Language Card Read Source = `ROM` (bit 7 = `0`) |
| $C012 | Read | $80 | Language Card Read Source = `RAM` (bit 7 = `1`) |
| $C013 | Read | $00 | Auxiliary-Memory Reads = `OFF` (bit 7 = `0`) |
| $C013 | Read | $80 | Auxiliary-Memory Reads = `ON` (bit 7 = `1`) |
| $C014 | Read | $00 | Auxiliary-Memory Writes = `OFF` (bit 7 = `0`) |
| $C014 | Read | $80 | Auxiliary-Memory Writes = `ON` (bit 7 = `1`) |
| $C015 | Read | $00 | Internal $Cx ROM = `OFF` (bit 7 = `0`) |
| $C015 | Read | $80 | Internal $Cx ROM = `ON` (bit 7 = `1`) |
| $C016 | Read | $00 | Auxiliary Zero Page and Stack = `OFF` (bit 7 = `0`) |
| $C016 | Read | $80 | Auxiliary Zero Page and Stack = `ON` (bit 7 = `1`) |
| $C017 | Read | $00 | Slot 3 ROM = `OFF` (bit 7 = `0`) |
| $C017 | Read | $80 | Slot 3 ROM = `ON` (bit 7 = `1`) |
| $C018 | Read | $00 | PAGE2 Display-Memory Banking = `OFF` (bit 7 = `0`) |
| $C018 | Read | $80 | PAGE2 Display-Memory Banking = `ON` (bit 7 = `1`) |
| $C019 | Read | $00 | Vertical Blank = `ACTIVE` (bit 7 = `0`) |
| $C019 | Read | $80 | Vertical Blank = `INACTIVE` (bit 7 = `1`) |
| $C01A | Read | $00 | Text Mode = `OFF` (bit 7 = `0`) |
| $C01A | Read | $80 | Text Mode = `ON` (bit 7 = `1`) |
| $C01B | Read | $00 | Mixed Display = `OFF` (bit 7 = `0`) |
| $C01B | Read | $80 | Mixed Display = `ON` (bit 7 = `1`) |
| $C01C | Read | $00 | Display Page = `1` (bit 7 = `0`) |
| $C01C | Read | $80 | Display Page = `2` (bit 7 = `1`) |
| $C01D | Read | $00 | Hi-Res Mode = `OFF` (bit 7 = `0`) |
| $C01D | Read | $80 | Hi-Res Mode = `ON` (bit 7 = `1`) |
| $C01E | Read | $00 | Alternate Character Set = `OFF` (bit 7 = `0`) |
| $C01E | Read | $80 | Alternate Character Set = `ON` (bit 7 = `1`) |
| $C01F | Read | $00 | 80-Column Display = `OFF` (bit 7 = `0`) |
| $C01F | Read | $80 | 80-Column Display = `ON` (bit 7 = `1`) |
| $C020 | Read/write |  | Toggle cassette output |
| $C030 | Read/write |  | Toggle speaker output |
| $C040 | Read/write |  | Pulse game-port strobe |
| $C04F | Read/write |  | Apple2TS emulation marker always = $CD |
| $C050 | Read/write |  | Select graphics mode |
| $C051 | Read/write |  | Select text mode |
| $C052 | Read/write |  | Select full-screen display |
| $C053 | Read/write |  | Select mixed graphics/text |
| $C054 | Read/write |  | Select display page 1 |
| $C055 | Read/write |  | Select display page 2 |
| $C056 | Read/write |  | Select lo-res graphics |
| $C057 | Read/write |  | Select hi-res graphics |
| $C058 | Read/write |  | Disable annunciator 0 |
| $C059 | Read/write |  | Enable annunciator 0 |
| $C05A | Read/write |  | Disable annunciator 1 |
| $C05B | Read/write |  | Enable annunciator 1 |
| $C05C | Read/write |  | Disable annunciator 2 |
| $C05D | Read/write |  | Enable annunciator 2 |
| $C05E | Read/write |  | Disable annunciator 3; enable DHIRES |
| $C05F | Read/write |  | Enable annunciator 3; disable DHIRES |
| $C060 | Read |  | Sample cassette input |
| $C061 | Read | $00 | Pushbutton 0 = `RELEASED` (bit 7 = `0`) |
| $C061 | Read | $80 | Pushbutton 0 = `PRESSED` (bit 7 = `1`) |
| $C062 | Read | $00 | Pushbutton 1 = `RELEASED` (bit 7 = `0`) |
| $C062 | Read | $80 | Pushbutton 1 = `PRESSED` (bit 7 = `1`) |
| $C063 | Read | $00 | Pushbutton 2 = `RELEASED` (bit 7 = `0`) |
| $C063 | Read | $80 | Pushbutton 2 = `PRESSED` (bit 7 = `1`) |
| $C064 | Read | $00 | Paddle 0 Timer = `EXPIRED` (bit 7 = `0`) |
| $C064 | Read | $80 | Paddle 0 Timer = `ACTIVE` (bit 7 = `1`) |
| $C065 | Read | $00 | Paddle 1 Timer = `EXPIRED` (bit 7 = `0`) |
| $C065 | Read | $80 | Paddle 1 Timer = `ACTIVE` (bit 7 = `1`) |
| $C066 | Read | $00 | Paddle 2 Timer = `EXPIRED` (bit 7 = `0`) |
| $C066 | Read | $80 | Paddle 2 Timer = `ACTIVE` (bit 7 = `1`) |
| $C067 | Read | $00 | Paddle 3 Timer = `EXPIRED` (bit 7 = `0`) |
| $C067 | Read | $80 | Paddle 3 Timer = `ACTIVE` (bit 7 = `1`) |
| $C068 | Read |  | Sample cassette-input mirror |
| $C069 | Read | $00 | Pushbutton 0 Mirror = `RELEASED` (bit 7 = `0`) |
| $C069 | Read | $80 | Pushbutton 0 Mirror = `PRESSED` (bit 7 = `1`) |
| $C06A | Read | $00 | Pushbutton 1 Mirror = `RELEASED` (bit 7 = `0`) |
| $C06A | Read | $80 | Pushbutton 1 Mirror = `PRESSED` (bit 7 = `1`) |
| $C06B | Read | $00 | Pushbutton 2 Mirror = `RELEASED` (bit 7 = `0`) |
| $C06B | Read | $80 | Pushbutton 2 Mirror = `PRESSED` (bit 7 = `1`) |
| $C06C | Read | $00 | Paddle 0 Timer Mirror = `EXPIRED` (bit 7 = `0`) |
| $C06C | Read | $80 | Paddle 0 Timer Mirror = `ACTIVE` (bit 7 = `1`) |
| $C06D | Read | $00 | Paddle 1 Timer Mirror = `EXPIRED` (bit 7 = `0`) |
| $C06D | Read | $80 | Paddle 1 Timer Mirror = `ACTIVE` (bit 7 = `1`) |
| $C06E | Read | $00 | Paddle 2 Timer Mirror = `EXPIRED` (bit 7 = `0`) |
| $C06E | Read | $80 | Paddle 2 Timer Mirror = `ACTIVE` (bit 7 = `1`) |
| $C06F | Read | $00 | Paddle 3 Timer Mirror = `EXPIRED` (bit 7 = `0`) |
| $C06F | Read | $80 | Paddle 3 Timer Mirror = `ACTIVE` (bit 7 = `1`) |
| $C070 | Read/write |  | Start paddle timers |
| $C071 | Write | $03 | Select auxiliary bank $03 using Neptune addressing; start paddle timers |
| $C073 | Write | $03 | Select auxiliary bank $03 using RamWorks addressing; start paddle timers |
| $C074 | Read/write |  | Laser 128EX compatibility = NOT EMULATED |
| $C080 | Read |  | Select LC bank 2; use RAM for reads; disable writes |
| $C080 | Write |  | Select LC bank 2; use RAM for reads; reset prewrite latch |
| $C081 | Read |  | Select LC bank 2; use ROM for reads; arm/enable writes |
| $C081–$C082 | Write |  | Select LC bank 2; use ROM for reads; reset prewrite latch |
| $C082 | Read |  | Select LC bank 2; use ROM for reads; disable writes |
| $C083 | Read |  | Select LC bank 2; use RAM for reads; arm/enable writes |
| $C083–$C084 | Write |  | Select LC bank 2; use RAM for reads; reset prewrite latch |
| $C084 | Read |  | Select LC bank 2; use RAM for reads; disable writes |
| $C085 | Read |  | Select LC bank 2; use ROM for reads; arm/enable writes |
| $C085–$C086 | Write |  | Select LC bank 2; use ROM for reads; reset prewrite latch |
| $C086 | Read |  | Select LC bank 2; use ROM for reads; disable writes |
| $C087 | Read |  | Select LC bank 2; use RAM for reads; arm/enable writes |
| $C087 | Write |  | Select LC bank 2; use RAM for reads; reset prewrite latch |
| $C088 | Read |  | Select LC bank 1; use RAM for reads; disable writes |
| $C088 | Write |  | Select LC bank 1; use RAM for reads; reset prewrite latch |
| $C089 | Read |  | Select LC bank 1; use ROM for reads; arm/enable writes |
| $C089–$C08A | Write |  | Select LC bank 1; use ROM for reads; reset prewrite latch |
| $C08A | Read |  | Select LC bank 1; use ROM for reads; disable writes |
| $C08B | Read |  | Select LC bank 1; use RAM for reads; arm/enable writes |
| $C08B–$C08C | Write |  | Select LC bank 1; use RAM for reads; reset prewrite latch |
| $C08C | Read |  | Select LC bank 1; use RAM for reads; disable writes |
| $C08D | Read |  | Select LC bank 1; use ROM for reads; arm/enable writes |
| $C08D–$C08E | Write |  | Select LC bank 1; use ROM for reads; reset prewrite latch |
| $C08E | Read |  | Select LC bank 1; use ROM for reads; disable writes |
| $C08F | Read |  | Select LC bank 1; use RAM for reads; arm/enable writes |
| $C08F | Write |  | Select LC bank 1; use RAM for reads; reset prewrite latch |
