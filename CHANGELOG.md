# Changelog

## [v2.7](https://github.com/ct6502/apple2ts/tree/v2.7) (2025-01-19)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.6...v2.7)

**Implemented enhancements:**

- For BASIC programs have a blank ProDOS disk automatically loaded so you can save to disk [\#94](https://github.com/ct6502/apple2ts/issues/94)
- Add symbol labels to the actual addresses in the disassembly view [\#93](https://github.com/ct6502/apple2ts/issues/93)
- Add support for user-defined symbol tables for the disassembly view [\#92](https://github.com/ct6502/apple2ts/issues/92)
- Change the "Color" button to be a droplist instead of just cycling through the options [\#90](https://github.com/ct6502/apple2ts/issues/90)
- Add support for scanlines, similar to an old-school CRT [\#89](https://github.com/ct6502/apple2ts/issues/89)
- Upgrade Wizard Replay to v1.1 [\#88](https://github.com/ct6502/apple2ts/issues/88)
- Add a CHANGELOG detailing changes and versions [\#87](https://github.com/ct6502/apple2ts/issues/87)

**Merged pull requests:**

- Support for CRT scanlines [\#95](https://github.com/ct6502/apple2ts/pull/95) ([boredsenseless](https://github.com/boredsenseless))

## [v2.6](https://github.com/ct6502/apple2ts/tree/v2.6) (2025-01-02)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.5...v2.6)

**Implemented enhancements:**

- Add button to reset Cycle Count [\#86](https://github.com/ct6502/apple2ts/issues/86)
- Allow BASIC programs to be used in URLs [\#84](https://github.com/ct6502/apple2ts/issues/84)

**Fixed bugs:**

- Mouse Support fails on state restore [\#85](https://github.com/ct6502/apple2ts/issues/85)

## [v2.5](https://github.com/ct6502/apple2ts/tree/v2.5) (2024-11-04)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.4...v2.5)

**Implemented enhancements:**

- Copy MouseText characters from the screen as Unicode [\#78](https://github.com/ct6502/apple2ts/issues/78)
- Add drag-n-drop for BASIC or assembly code files [\#45](https://github.com/ct6502/apple2ts/issues/45)

**Fixed bugs:**

- Games like Injured Engine don't work with enhanced Apple IIe, require unenhanced [\#83](https://github.com/ct6502/apple2ts/issues/83)
- Unable to start Print Shop Companion [\#79](https://github.com/ct6502/apple2ts/issues/79)
- King's Quest floppy disk does not boot properly [\#51](https://github.com/ct6502/apple2ts/issues/51)
- Rare browser out-of-memory error, possibly with quickly passing large disk images for snapshots [\#48](https://github.com/ct6502/apple2ts/issues/48)

**Merged pull requests:**

- Add initial 'weak bit' support to WOZ format [\#80](https://github.com/ct6502/apple2ts/pull/80) ([code-bythepound](https://github.com/code-bythepound))

## [v2.4](https://github.com/ct6502/apple2ts/tree/v2.4) (2024-07-29)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.3...v2.4)

**Implemented enhancements:**

- Accelerometer support [\#71](https://github.com/ct6502/apple2ts/issues/71)
- Assembler Opcode 'STA' Is not resulting in correct binary [\#66](https://github.com/ct6502/apple2ts/issues/66)
- Hex bytes of a data table. [\#65](https://github.com/ct6502/apple2ts/issues/65)
- Memory size options [\#64](https://github.com/ct6502/apple2ts/issues/64)
- Multiple HD images [\#63](https://github.com/ct6502/apple2ts/issues/63)
- When click on disk icon, have a menu for either download or eject, rather than auto download [\#60](https://github.com/ct6502/apple2ts/issues/60)

**Fixed bugs:**

- Ejecting S7,D2 ejects S7,D1 instead [\#75](https://github.com/ct6502/apple2ts/issues/75)
- Backspace generating Left Arrow rather than Delete confusing users/apps [\#73](https://github.com/ct6502/apple2ts/issues/73)
- Visicalc Advanced does not boot [\#69](https://github.com/ct6502/apple2ts/issues/69)
- Save state doesn't properly set the speed to Fast upon Restore [\#68](https://github.com/ct6502/apple2ts/issues/68)
- A2osX boot fails [\#67](https://github.com/ct6502/apple2ts/issues/67)
- S6,D2 file selection loads into S6,D1 [\#62](https://github.com/ct6502/apple2ts/issues/62)

**Merged pull requests:**

- Split enhanced midi functionality to separate file [\#74](https://github.com/ct6502/apple2ts/pull/74) ([code-bythepound](https://github.com/code-bythepound))
- Ultima 5 Multi-instrument MIDI mods \(for review only\) [\#72](https://github.com/ct6502/apple2ts/pull/72) ([code-bythepound](https://github.com/code-bythepound))
- Add No Slot Clock support [\#70](https://github.com/ct6502/apple2ts/pull/70) ([code-bythepound](https://github.com/code-bythepound))

## [v2.3](https://github.com/ct6502/apple2ts/tree/v2.3) (2024-03-30)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.2...v2.3)

**Implemented enhancements:**

- Enter fullscreen [\#57](https://github.com/ct6502/apple2ts/issues/57)
- Add 'memory bank' property for breakpoints [\#50](https://github.com/ct6502/apple2ts/issues/50)
- While debugging, click on graphics screen to jump to that region in memory in the debugger [\#47](https://github.com/ct6502/apple2ts/issues/47)
- Migrate to Functional Components [\#44](https://github.com/ct6502/apple2ts/issues/44)
- Add a "View Memory" panel [\#34](https://github.com/ct6502/apple2ts/issues/34)

**Fixed bugs:**

- can't paste text on windows chrome [\#54](https://github.com/ct6502/apple2ts/issues/54)
- Restore save state from one of the precanned disk images, does not restore help text [\#53](https://github.com/ct6502/apple2ts/issues/53)
- Clicking on a time travel snapshot ejects the current floppy [\#52](https://github.com/ct6502/apple2ts/issues/52)
- Debug watchpoints should not trigger when reading current instruction [\#49](https://github.com/ct6502/apple2ts/issues/49)
- In monochrome, pixel scaling results in ugly artifacts [\#42](https://github.com/ct6502/apple2ts/issues/42)
- The Apple II Game "Drol" Controls Not Working Right [\#41](https://github.com/ct6502/apple2ts/issues/41)
- 65C02 BIT emulation bug [\#40](https://github.com/ct6502/apple2ts/issues/40)
- Mobile Browser Keyboard Issue [\#21](https://github.com/ct6502/apple2ts/issues/21)

**Merged pull requests:**

- Add WebSerial support [\#61](https://github.com/ct6502/apple2ts/pull/61) ([code-bythepound](https://github.com/code-bythepound))
- Change Meta sequence to Ctrl+Meta+key [\#56](https://github.com/ct6502/apple2ts/pull/56) ([code-bythepound](https://github.com/code-bythepound))
- add support for SD MIDI \]\[+ extra IO ports [\#39](https://github.com/ct6502/apple2ts/pull/39) ([code-bythepound](https://github.com/code-bythepound))

## [v2.2](https://github.com/ct6502/apple2ts/tree/v2.2) (2024-01-10)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.1...v2.2)

**Implemented enhancements:**

- Add a thumbnail image to the save states, display in the time travel panel [\#37](https://github.com/ct6502/apple2ts/issues/37)
- Consider adding a "save time travel state" shortcut [\#36](https://github.com/ct6502/apple2ts/issues/36)
- Include the time travel history in the save state, so you can do deugging easier \(maybe make optional\) [\#32](https://github.com/ct6502/apple2ts/issues/32)
- Add optional "value" to watchpoints [\#31](https://github.com/ct6502/apple2ts/issues/31)

**Merged pull requests:**

- Add support for passport midi style cards & WebMIDI [\#38](https://github.com/ct6502/apple2ts/pull/38) ([code-bythepound](https://github.com/code-bythepound))
- Updates to SuperSerial card to prepare for WebSerial [\#35](https://github.com/ct6502/apple2ts/pull/35) ([code-bythepound](https://github.com/code-bythepound))

## [v2.1](https://github.com/ct6502/apple2ts/tree/v2.1) (2023-12-03)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.0...v2.1)

**Fixed bugs:**

- Windows: 'VITE\_GIT\_SHA' is not recognized [\#30](https://github.com/ct6502/apple2ts/issues/30)

**Merged pull requests:**

- Use EDM ROM if debug is active on boot [\#29](https://github.com/ct6502/apple2ts/pull/29) ([code-bythepound](https://github.com/code-bythepound))
- Add SmartPort status and DIB for Unit 1 [\#28](https://github.com/ct6502/apple2ts/pull/28) ([code-bythepound](https://github.com/code-bythepound))
- Add missing TSB and TRB instructions [\#27](https://github.com/ct6502/apple2ts/pull/27) ([code-bythepound](https://github.com/code-bythepound))
- Merge Mouse and Clock to single Card [\#26](https://github.com/ct6502/apple2ts/pull/26) ([code-bythepound](https://github.com/code-bythepound))
- Add Ramworks expanded memory [\#25](https://github.com/ct6502/apple2ts/pull/25) ([code-bythepound](https://github.com/code-bythepound))

## [v2.0](https://github.com/ct6502/apple2ts/tree/v2.0) (2023-10-07)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v1.2...v2.0)

**Implemented enhancements:**

- Perf Question : Lookup table vs switch [\#23](https://github.com/ct6502/apple2ts/issues/23)

**Fixed bugs:**

- Does not display weird "no-delay" HGR mode, used in Prince of Persia [\#24](https://github.com/ct6502/apple2ts/issues/24)
- Disk drive noises remain on after reset [\#22](https://github.com/ct6502/apple2ts/issues/22)

**Closed issues:**

- Please add Mockingboard support [\#5](https://github.com/ct6502/apple2ts/issues/5)

## [v1.2](https://github.com/ct6502/apple2ts/tree/v1.2) (2023-09-28)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v1.1...v1.2)

**Merged pull requests:**

- Imagewriter updates [\#20](https://github.com/ct6502/apple2ts/pull/20) ([code-bythepound](https://github.com/code-bythepound))
- First cut at ImageWriter II support [\#19](https://github.com/ct6502/apple2ts/pull/19) ([code-bythepound](https://github.com/code-bythepound))
- add black and white display mode [\#17](https://github.com/ct6502/apple2ts/pull/17) ([code-bythepound](https://github.com/code-bythepound))
- Miscchanges [\#16](https://github.com/ct6502/apple2ts/pull/16) ([code-bythepound](https://github.com/code-bythepound))
- Super Serial Card driver [\#15](https://github.com/ct6502/apple2ts/pull/15) ([code-bythepound](https://github.com/code-bythepound))
- Finish support for C800 space [\#14](https://github.com/ct6502/apple2ts/pull/14) ([code-bythepound](https://github.com/code-bythepound))

## [v1.1](https://github.com/ct6502/apple2ts/tree/v1.1) (2023-08-27)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v1.0.0...v1.1)

**Merged pull requests:**

- Mouse Updates [\#13](https://github.com/ct6502/apple2ts/pull/13) ([code-bythepound](https://github.com/code-bythepound))
- Add method to show/hide mouse cursor [\#12](https://github.com/ct6502/apple2ts/pull/12) ([code-bythepound](https://github.com/code-bythepound))
- First cut at AppleMouse card workalike driver [\#11](https://github.com/ct6502/apple2ts/pull/11) ([code-bythepound](https://github.com/code-bythepound))
- Refactor IRQ and NMI activation [\#10](https://github.com/ct6502/apple2ts/pull/10) ([code-bythepound](https://github.com/code-bythepound))
- Pass mouse events from canvas main to worker [\#9](https://github.com/ct6502/apple2ts/pull/9) ([code-bythepound](https://github.com/code-bythepound))
- Add methods to control slot IO [\#8](https://github.com/ct6502/apple2ts/pull/8) ([code-bythepound](https://github.com/code-bythepound))
- Add new VBL strategy [\#7](https://github.com/ct6502/apple2ts/pull/7) ([code-bythepound](https://github.com/code-bythepound))
- Add Prodos-compatible clock card. [\#6](https://github.com/ct6502/apple2ts/pull/6) ([code-bythepound](https://github.com/code-bythepound))

## [v1.0.0](https://github.com/ct6502/apple2ts/tree/v1.0.0) (2023-07-08)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v0.9...v1.0.0)

## [v0.9](https://github.com/ct6502/apple2ts/tree/v0.9) (2023-07-06)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v0.8...v0.9)

**Merged pull requests:**

- Port number change [\#4](https://github.com/ct6502/apple2ts/pull/4) ([kirby](https://github.com/kirby))

## [v0.8](https://github.com/ct6502/apple2ts/tree/v0.8) (2022-12-23)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v0.7...v0.8)

## [v0.7](https://github.com/ct6502/apple2ts/tree/v0.7) (2022-04-24)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v0.6...v0.7)

## [v0.6](https://github.com/ct6502/apple2ts/tree/v0.6) (2022-03-21)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v0.5...v0.6)

**Merged pull requests:**

- Diskwrite [\#3](https://github.com/ct6502/apple2ts/pull/3) ([ct6502](https://github.com/ct6502))

## [v0.5](https://github.com/ct6502/apple2ts/tree/v0.5) (2022-02-19)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/3d0eaf01c5f3c30f524a974ad6314744e8232b39...v0.5)

**Merged pull requests:**

- Canvas [\#2](https://github.com/ct6502/apple2ts/pull/2) ([ct6502](https://github.com/ct6502))



\* *This Changelog was automatically generated by [github_changelog_generator](https://github.com/github-changelog-generator/github-changelog-generator)*
