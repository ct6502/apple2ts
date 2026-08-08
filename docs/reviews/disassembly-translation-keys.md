# Disassembly translation-key structure review

This catalog contains 98 strings: 0 direct strings and 98 strings in 14 named groups.

Keys are grouped by hardware or UI concern. Every entry is a complete rendered line; interpolation supplies runtime data rather than separately translated fragments.

## Longest relative key paths

| Length | Key | English |
|---:|---|---|
| 31 | `display.selectFullScreenDisplay` | Select full-screen display |
| 31 | `languageCard.resetPrewriteLatch` | Language Card: Reset prewrite latch |
| 30 | `auxMemory.altzpStatusAuxiliary` | Zero page, stack, and bank-switched RAM: AUXILIARY (MSB = 1) |
| 30 | `display.selectAlternateCharset` | Select alternate character set |
| 30 | `displayMemory.80storeStatusOff` | PAGE2 selects display page 1 or 2 (MSB = 0) |
| 30 | `displayMemory.page2StatusClear` | Display-memory selection: PAGE 1 OR MAIN (MSB = 0) |
| 30 | `languageCard.armOrEnableWrites` | Language Card: Arm or enable writes |
| 30 | `laser128ex.disableDiskSlowdown` | Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| 30 | `transWarp.disableUntilColdBoot` | TransWarp: Disable acceleration until cold boot |
| 29 | `auxMemory.selectExpansionBank` | Select auxiliary expansion bank {{bank}} using {{addressing}} addressing |
| 29 | `display.mixedDisplayStatusOff` | Mixed display: OFF (MSB = 0) |
| 29 | `display.verticalBlankInactive` | Vertical blank: INACTIVE (MSB = 1) |
| 29 | `displayMemory.80storeStatusOn` | PAGE2 selects main or auxiliary display memory (MSB = 1) |
| 29 | `laser128ex.enableDiskSlowdown` | Laser 128EX: Enable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) |
| 28 | `display.mixedDisplayStatusOn` | Mixed display: ON (MSB = 1) |
| 28 | `display.selectPrimaryCharset` | Select primary character set |
| 28 | `displayMemory.page2StatusSet` | Display-memory selection: PAGE 2 OR AUXILIARY (MSB = 1) |
| 27 | `display.altCharsetStatusOff` | Alternate character set: OFF (MSB = 0) |
| 27 | `display.selectHiresGraphics` | Select hi-res graphics |
| 27 | `display.selectLoresGraphics` | Select lo-res graphics |
| 27 | `display.verticalBlankActive` | Vertical blank: ACTIVE (MSB = 0) |
| 27 | `gameIO.buttonMirrorReleased` | Pushbutton {{number}} mirror: RELEASED (MSB = 0) |
| 27 | `languageCard.useRamForReads` | Language Card: Use RAM for reads |
| 27 | `languageCard.useRomForReads` | Language Card: Use ROM for reads |
| 27 | `laser128ex.threePointSixMhz` | Laser 128EX: Select 3.6 MHz maximum CPU speed |
| 27 | `laser128ex.twoPointThreeMhz` | Laser 128EX: Select 2.3 MHz maximum CPU speed |
| 27 | `transWarp.configuredMaximum` | TransWarp: Select configured maximum speed |
| 26 | `cassette.sampleInputMirror` | Sample cassette-input mirror |
| 26 | `display.altCharsetStatusOn` | Alternate character set: ON (MSB = 1) |
| 26 | `display.hiresModeStatusOff` | Hi-res mode: OFF (MSB = 0) |
| 26 | `display.selectGraphicsMode` | Select graphics mode |
| 26 | `display.selectMixedDisplay` | Select mixed graphics/text |
| 26 | `gameIO.buttonMirrorPressed` | Pushbutton {{number}} mirror: PRESSED (MSB = 1) |
| 26 | `gameIO.paddleMirrorExpired` | Paddle {{number}} timer mirror: EXPIRED (MSB = 0) |
| 26 | `languageCard.disableWrites` | Language Card: Disable writes |
| 26 | `languageCard.readSourceRam` | Language Card read source: RAM (MSB = 1) |
| 26 | `languageCard.readSourceRom` | Language Card read source: ROM (MSB = 0) |
| 25 | `auxMemory.altzpStatusMain` | Zero page, stack, and bank-switched RAM: MAIN (MSB = 0) |
| 25 | `display.column80StatusOff` | 80-column display: OFF (MSB = 0) |
| 25 | `display.hiresModeStatusOn` | Hi-res mode: ON (MSB = 1) |
| 25 | `display.textModeStatusOff` | Text mode: OFF (MSB = 0) |
| 25 | `displayMemory.selectPage1` | Select display page 1 |
| 25 | `displayMemory.selectPage2` | Select display page 2 |
| 25 | `gameIO.paddleMirrorActive` | Paddle {{number}} timer mirror: ACTIVE (MSB = 1) |
| 25 | `notice.emulatorIdentifier` | INFO: Apple2TS emulator identifier: $CD |
| 24 | `auxMemory.altzpAuxiliary` | Select auxiliary zero page, stack, and bank-switched RAM |
| 24 | `auxMemory.writeAuxiliary` | Select auxiliary memory for writes |
| 24 | `auxMemory.writeStatusOff` | Auxiliary-memory writes: OFF (MSB = 0) |
| 24 | `display.column80StatusOn` | 80-column display: ON (MSB = 1) |
| 24 | `display.textModeStatusOn` | Text mode: ON (MSB = 1) |
| 24 | `displayMemory.80storeOff` | Make PAGE2 select display page 1 or 2 |
| 24 | `displayMemory.page2Clear` | Select display page 1, or main display memory with 80STORE |
| 24 | `gameIO.startPaddleTimers` | Start paddle timers |
| 24 | `keyboard.anyKeyDownClear` | Any-key-down flag: CLEAR (MSB = 0) |

## memory

| Key | English | Fields |
|---|---|---|
| `memory.effectiveAddress` | Effective address: {{notation}} | notation |
| `memory.value` | Value: {{notation}} | notation |

## keyboard

| Key | English | Fields |
|---|---|---|
| `keyboard.character` | Keyboard: "{{character}}" | character |
| `keyboard.strobeClear` | Keyboard strobe: CLEAR (MSB = 0) | — |
| `keyboard.strobeSet` | Keyboard strobe: SET (MSB = 1) | — |
| `keyboard.anyKeyDownClear` | Any-key-down flag: CLEAR (MSB = 0) | — |
| `keyboard.anyKeyDownSet` | Any-key-down flag: SET (MSB = 1) | — |
| `keyboard.clearStrobe` | Clear keyboard strobe | — |

## cassette

| Key | English | Fields |
|---|---|---|
| `cassette.toggleOutput` | Toggle cassette output | — |
| `cassette.sampleInput` | Sample cassette input | — |
| `cassette.sampleInputMirror` | Sample cassette-input mirror | — |

## speaker

| Key | English | Fields |
|---|---|---|
| `speaker.toggleOutput` | Toggle speaker output | — |

## notice

| Key | English | Fields |
|---|---|---|
| `notice.emulatorIdentifier` | INFO: Apple2TS emulator identifier: $CD | — |
| `notice.noWriteEffect` | INFO: This write has no effect on {{machine}} | machine |
| `notice.multipleTriggers` | WARNING: This instruction triggers the soft switch multiple times | — |
| `notice.unknownWrite` | WARNING: This instruction writes an unknown value | — |

## rom

| Key | English | Fields |
|---|---|---|
| `rom.intCxOff` | Internal $Cx ROM: OFF (MSB = 0) | — |
| `rom.intCxOn` | Internal $Cx ROM: ON (MSB = 1) | — |
| `rom.slot3Off` | Slot 3 ROM: OFF (MSB = 0) | — |
| `rom.slot3On` | Slot 3 ROM: ON (MSB = 1) | — |
| `rom.internal` | Select internal ROM for {{range}} | range |
| `rom.slot` | Select slot ROM for {{range}} | range |

## languageCard

| Key | English | Fields |
|---|---|---|
| `languageCard.bank1` | Language Card bank: 1 (MSB = 0) | — |
| `languageCard.bank2` | Language Card bank: 2 (MSB = 1) | — |
| `languageCard.readSourceRom` | Language Card read source: ROM (MSB = 0) | — |
| `languageCard.readSourceRam` | Language Card read source: RAM (MSB = 1) | — |
| `languageCard.selectBank` | Language Card: Select bank {{bank}} | bank |
| `languageCard.useRamForReads` | Language Card: Use RAM for reads | — |
| `languageCard.useRomForReads` | Language Card: Use ROM for reads | — |
| `languageCard.disableWrites` | Language Card: Disable writes | — |
| `languageCard.resetPrewriteLatch` | Language Card: Reset prewrite latch | — |
| `languageCard.armOrEnableWrites` | Language Card: Arm or enable writes | — |

## auxMemory

| Key | English | Fields |
|---|---|---|
| `auxMemory.readStatusOff` | Auxiliary-memory reads: OFF (MSB = 0) | — |
| `auxMemory.readStatusOn` | Auxiliary-memory reads: ON (MSB = 1) | — |
| `auxMemory.readMain` | Select main memory for reads | — |
| `auxMemory.readAuxiliary` | Select auxiliary memory for reads | — |
| `auxMemory.writeStatusOff` | Auxiliary-memory writes: OFF (MSB = 0) | — |
| `auxMemory.writeStatusOn` | Auxiliary-memory writes: ON (MSB = 1) | — |
| `auxMemory.writeMain` | Select main memory for writes | — |
| `auxMemory.writeAuxiliary` | Select auxiliary memory for writes | — |
| `auxMemory.selectExpansionBank` | Select auxiliary expansion bank {{bank}} using {{addressing}} addressing | bank, addressing |
| `auxMemory.altzpMain` | Select main zero page, stack, and bank-switched RAM | — |
| `auxMemory.altzpAuxiliary` | Select auxiliary zero page, stack, and bank-switched RAM | — |
| `auxMemory.altzpStatusMain` | Zero page, stack, and bank-switched RAM: MAIN (MSB = 0) | — |
| `auxMemory.altzpStatusAuxiliary` | Zero page, stack, and bank-switched RAM: AUXILIARY (MSB = 1) | — |

## displayMemory

| Key | English | Fields |
|---|---|---|
| `displayMemory.80storeStatusOff` | PAGE2 selects display page 1 or 2 (MSB = 0) | — |
| `displayMemory.80storeStatusOn` | PAGE2 selects main or auxiliary display memory (MSB = 1) | — |
| `displayMemory.80storeOff` | Make PAGE2 select display page 1 or 2 | — |
| `displayMemory.80storeOn` | Make PAGE2 select main or auxiliary display memory | — |
| `displayMemory.page2StatusClear` | Display-memory selection: PAGE 1 OR MAIN (MSB = 0) | — |
| `displayMemory.page2StatusSet` | Display-memory selection: PAGE 2 OR AUXILIARY (MSB = 1) | — |
| `displayMemory.selectPage1` | Select display page 1 | — |
| `displayMemory.selectPage2` | Select display page 2 | — |
| `displayMemory.page2Clear` | Select display page 1, or main display memory with 80STORE | — |
| `displayMemory.page2Set` | Select display page 2, or auxiliary display memory with 80STORE | — |

## display

| Key | English | Fields |
|---|---|---|
| `display.altCharsetStatusOff` | Alternate character set: OFF (MSB = 0) | — |
| `display.altCharsetStatusOn` | Alternate character set: ON (MSB = 1) | — |
| `display.selectPrimaryCharset` | Select primary character set | — |
| `display.selectAlternateCharset` | Select alternate character set | — |
| `display.textModeStatusOff` | Text mode: OFF (MSB = 0) | — |
| `display.textModeStatusOn` | Text mode: ON (MSB = 1) | — |
| `display.selectGraphicsMode` | Select graphics mode | — |
| `display.selectTextMode` | Select text mode | — |
| `display.mixedDisplayStatusOff` | Mixed display: OFF (MSB = 0) | — |
| `display.mixedDisplayStatusOn` | Mixed display: ON (MSB = 1) | — |
| `display.selectFullScreenDisplay` | Select full-screen display | — |
| `display.selectMixedDisplay` | Select mixed graphics/text | — |
| `display.hiresModeStatusOff` | Hi-res mode: OFF (MSB = 0) | — |
| `display.hiresModeStatusOn` | Hi-res mode: ON (MSB = 1) | — |
| `display.selectLoresGraphics` | Select lo-res graphics | — |
| `display.selectHiresGraphics` | Select hi-res graphics | — |
| `display.disableDhires` | Disable DHIRES | — |
| `display.enableDhires` | Enable DHIRES | — |
| `display.verticalBlankActive` | Vertical blank: ACTIVE (MSB = 0) | — |
| `display.verticalBlankInactive` | Vertical blank: INACTIVE (MSB = 1) | — |
| `display.column80StatusOff` | 80-column display: OFF (MSB = 0) | — |
| `display.column80StatusOn` | 80-column display: ON (MSB = 1) | — |
| `display.setWidth` | Set display width to {{columns}} columns | columns |

## annunciator

| Key | English | Fields |
|---|---|---|
| `annunciator.disable` | Disable annunciator {{number}} | number |
| `annunciator.enable` | Enable annunciator {{number}} | number |

## transWarp

| Key | English | Fields |
|---|---|---|
| `transWarp.configuredMaximum` | TransWarp: Select configured maximum speed | — |
| `transWarp.oneMhz` | TransWarp: Select 1 MHz | — |
| `transWarp.disableUntilColdBoot` | TransWarp: Disable acceleration until cold boot | — |

## laser128ex

| Key | English | Fields |
|---|---|---|
| `laser128ex.oneMhz` | Laser 128EX: Select 1 MHz maximum CPU speed | — |
| `laser128ex.twoPointThreeMhz` | Laser 128EX: Select 2.3 MHz maximum CPU speed | — |
| `laser128ex.threePointSixMhz` | Laser 128EX: Select 3.6 MHz maximum CPU speed | — |
| `laser128ex.disableDiskSlowdown` | Laser 128EX: Disable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) | — |
| `laser128ex.enableDiskSlowdown` | Laser 128EX: Enable automatic 1 MHz slowdown for port 7 disk access (write-once bit 5) | — |

## gameIO

| Key | English | Fields |
|---|---|---|
| `gameIO.pulseStrobe` | Pulse game-port strobe | — |
| `gameIO.startPaddleTimers` | Start paddle timers | — |
| `gameIO.buttonReleased` | Pushbutton {{number}}: RELEASED (MSB = 0) | number |
| `gameIO.buttonPressed` | Pushbutton {{number}}: PRESSED (MSB = 1) | number |
| `gameIO.paddleExpired` | Paddle {{number}} timer: EXPIRED (MSB = 0) | number |
| `gameIO.paddleActive` | Paddle {{number}} timer: ACTIVE (MSB = 1) | number |
| `gameIO.buttonMirrorReleased` | Pushbutton {{number}} mirror: RELEASED (MSB = 0) | number |
| `gameIO.buttonMirrorPressed` | Pushbutton {{number}} mirror: PRESSED (MSB = 1) | number |
| `gameIO.paddleMirrorExpired` | Paddle {{number}} timer mirror: EXPIRED (MSB = 0) | number |
| `gameIO.paddleMirrorActive` | Paddle {{number}} timer mirror: ACTIVE (MSB = 1) | number |
