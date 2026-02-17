# Changelog

## [v3.2.0](https://github.com/ct6502/apple2ts/tree/v3.2.0) (2026-02-17)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v3.1.1...v3.2.0)

**Implemented enhancements:**

- Enhancement Add Return Key to UI, or Soft Keyboard [\#210](https://github.com/ct6502/apple2ts/issues/210)

**Fixed bugs:**

- SPF - Stress ProDOS Filesystem Hangs [\#212](https://github.com/ct6502/apple2ts/issues/212)
- Speed warp seems to have stopped working [\#201](https://github.com/ct6502/apple2ts/issues/201)

**Merged pull requests:**

- Add Apple II+ mode with II+-accurate text decoding/rendering [\#211](https://github.com/ct6502/apple2ts/pull/211) ([mocha-moonatic](https://github.com/mocha-moonatic))
- Merge pull request \#207 from ct6502/main [\#208](https://github.com/ct6502/apple2ts/pull/208) ([ct6502](https://github.com/ct6502))
- Avoid infinite loop with breakpoint actions [\#207](https://github.com/ct6502/apple2ts/pull/207) ([ct6502](https://github.com/ct6502))
- merge [\#203](https://github.com/ct6502/apple2ts/pull/203) ([ct6502](https://github.com/ct6502))

## [v3.1.1](https://github.com/ct6502/apple2ts/tree/v3.1.1) (2026-01-17)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v3.1...v3.1.1)

**Implemented enhancements:**

- iPhone support [\#198](https://github.com/ct6502/apple2ts/issues/198)
- Add a no UI theme for embedded use? [\#197](https://github.com/ct6502/apple2ts/issues/197)
- Add curved distortion effect for display, like a CRT [\#194](https://github.com/ct6502/apple2ts/issues/194)
- Make plugin for VSCode with emulator [\#176](https://github.com/ct6502/apple2ts/issues/176)

**Fixed bugs:**

- Emulator strips the header off 2MG files when it saves them back out [\#200](https://github.com/ct6502/apple2ts/issues/200)
- Disk image downloads don't set the correct name and content type [\#199](https://github.com/ct6502/apple2ts/issues/199)
- $C010 bit 7 "Any Key Down" not being set [\#192](https://github.com/ct6502/apple2ts/issues/192)

**Merged pull requests:**

- Fix text query string param bug [\#196](https://github.com/ct6502/apple2ts/pull/196) ([boredsenseless](https://github.com/boredsenseless))
- Improved perf when passing BASIC code via query string [\#195](https://github.com/ct6502/apple2ts/pull/195) ([boredsenseless](https://github.com/boredsenseless))

## [v3.1](https://github.com/ct6502/apple2ts/tree/v3.1) (2025-11-23)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v3.0...v3.1)

**Implemented enhancements:**

- Ghosting effect for green and amber screens [\#184](https://github.com/ct6502/apple2ts/issues/184)
- Support for quarter track reading for Apple2TS [\#179](https://github.com/ct6502/apple2ts/issues/179)
- Support Video7 Mixed DHGR + Monochrome mode [\#173](https://github.com/ct6502/apple2ts/issues/173)
- Support Video7 560x192 Monochrome mode [\#172](https://github.com/ct6502/apple2ts/issues/172)
- Add support for performing actions on breakpoint hit [\#58](https://github.com/ct6502/apple2ts/issues/58)
- Consider having "sub" time travel save states in between the main time travel states [\#33](https://github.com/ct6502/apple2ts/issues/33)

**Fixed bugs:**

- Empty peripheral slots should have random bus noise [\#190](https://github.com/ct6502/apple2ts/issues/190)
- Incorrect behavior on softswitch sequence [\#188](https://github.com/ct6502/apple2ts/issues/188)
- Bug Report: Inconsistent Disk Loading in "Show new releases" Tab [\#186](https://github.com/ct6502/apple2ts/issues/186)
- Software picker window behavior \(Android\) [\#181](https://github.com/ct6502/apple2ts/issues/181)
- Fast Typing results in dropped characters by keyboard [\#177](https://github.com/ct6502/apple2ts/issues/177)

**Closed issues:**

- Possible workaround solution for Glutton [\#171](https://github.com/ct6502/apple2ts/issues/171)
- Apple 2TS does not work on the sample WOZ images provided in applesauce [\#81](https://github.com/ct6502/apple2ts/issues/81)

**Merged pull requests:**

- Fixed Minimal theme issues when appMode=game [\#189](https://github.com/ct6502/apple2ts/pull/189) ([boredsenseless](https://github.com/boredsenseless))
- Rework Video7 processing.  Add 160x mode [\#187](https://github.com/ct6502/apple2ts/pull/187) ([code-bythepound](https://github.com/code-bythepound))
- Fix: Issue 181 - Software picker window behavior \(Android\) [\#183](https://github.com/ct6502/apple2ts/pull/183) ([boredsenseless](https://github.com/boredsenseless))
- Fix for theme switching bug [\#182](https://github.com/ct6502/apple2ts/pull/182) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Some URL fragments fail to load disk image [\#178](https://github.com/ct6502/apple2ts/pull/178) ([boredsenseless](https://github.com/boredsenseless))
- Fixed disk collection panel scrolling bug in Minimal theme [\#175](https://github.com/ct6502/apple2ts/pull/175) ([boredsenseless](https://github.com/boredsenseless))
- Fix bug where debug panel always displays once clicked [\#174](https://github.com/ct6502/apple2ts/pull/174) ([boredsenseless](https://github.com/boredsenseless))
- Fixed all remaining tours bugs in Minimal theme [\#170](https://github.com/ct6502/apple2ts/pull/170) ([boredsenseless](https://github.com/boredsenseless))
- Fixed bug where info panel flyout was not displayed in Minimal theme [\#169](https://github.com/ct6502/apple2ts/pull/169) ([boredsenseless](https://github.com/boredsenseless))
- Minor UI tweaks for consistency across Classic and Minimal themes [\#168](https://github.com/ct6502/apple2ts/pull/168) ([boredsenseless](https://github.com/boredsenseless))

## [v3.0](https://github.com/ct6502/apple2ts/tree/v3.0) (2025-05-07)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.9...v3.0)

**Implemented enhancements:**

- Combine Help and Debug panels into tabs within the Debug section [\#167](https://github.com/ct6502/apple2ts/issues/167)
- Add support for Video7 modes for text colors, to support K2 Presentation Program [\#165](https://github.com/ct6502/apple2ts/issues/165)
- Allow URL parameter to auto-load a particular Total Replay game [\#153](https://github.com/ct6502/apple2ts/issues/153)

**Fixed bugs:**

- Suggestion on the update of the disk position when track changes [\#166](https://github.com/ct6502/apple2ts/issues/166)
- Flickering on Shufflepuck [\#161](https://github.com/ct6502/apple2ts/issues/161)
- Can not turn off scanlines from url [\#156](https://github.com/ct6502/apple2ts/issues/156)
- Apple IIe unenhanced still has Mouse Text characters [\#98](https://github.com/ct6502/apple2ts/issues/98)
- Color Mode button does not render correctly on certain platforms [\#96](https://github.com/ct6502/apple2ts/issues/96)

**Merged pull requests:**

- C8 and NSC fixes [\#164](https://github.com/ct6502/apple2ts/pull/164) ([code-bythepound](https://github.com/code-bythepound))
- Set VBL at the start of doAdvance6502 instead of the end [\#163](https://github.com/ct6502/apple2ts/pull/163) ([colinleroy](https://github.com/colinleroy))
- Add CodeMirror editor for use with JSON [\#162](https://github.com/ct6502/apple2ts/pull/162) ([ct6502](https://github.com/ct6502))
- Fixed tab editing in the exPectin panel [\#160](https://github.com/ct6502/apple2ts/pull/160) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Apple exPectin [\#159](https://github.com/ct6502/apple2ts/pull/159) ([boredsenseless](https://github.com/boredsenseless))
- Disable cache for PR builds, just like main [\#158](https://github.com/ct6502/apple2ts/pull/158) ([ct6502](https://github.com/ct6502))
- Added "Shufflepuck Cafe" to new releases [\#157](https://github.com/ct6502/apple2ts/pull/157) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Scanlines not always positioned correctly [\#155](https://github.com/ct6502/apple2ts/pull/155) ([boredsenseless](https://github.com/boredsenseless))
- Added Kontrabant and Encounter Adventure to new releases [\#154](https://github.com/ct6502/apple2ts/pull/154) ([boredsenseless](https://github.com/boredsenseless))

## [v2.9](https://github.com/ct6502/apple2ts/tree/v2.9) (2025-04-06)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.8...v2.9)

**Implemented enhancements:**

- move UI properties into their own file instead of inside machineState [\#152](https://github.com/ct6502/apple2ts/issues/152)
- Add more speed settings such as 2 MHz, 3Mhz, etc [\#146](https://github.com/ct6502/apple2ts/issues/146)
- Add support for UI themes [\#118](https://github.com/ct6502/apple2ts/issues/118)
- Refactor the code to isolate the emulator and UI code into their own folders [\#112](https://github.com/ct6502/apple2ts/issues/112)
- Watch files on disk for changes, and then reload [\#46](https://github.com/ct6502/apple2ts/issues/46)
- For test purpose, adding the Klaus Dormann's 6502 testsuite would be great [\#43](https://github.com/ct6502/apple2ts/issues/43)

**Fixed bugs:**

- Full Klaus Dormann Test including BRK / interrupt [\#138](https://github.com/ct6502/apple2ts/issues/138)
- Problem with "basic=\[escaped basic program\]" URL parameter [\#136](https://github.com/ct6502/apple2ts/issues/136)
- 6502 / 65c02 branch handling for cross page is not accurate [\#134](https://github.com/ct6502/apple2ts/issues/134)
- Possible HGR issue? [\#131](https://github.com/ct6502/apple2ts/issues/131)
- Minimal mode in Firefox does not appear correct - has tan borders and no buttons [\#126](https://github.com/ct6502/apple2ts/issues/126)

**Closed issues:**

- Edu-Ware Spelling Bee Games crashes Apple II on one game [\#117](https://github.com/ct6502/apple2ts/issues/117)
- Card Emulation [\#115](https://github.com/ct6502/apple2ts/issues/115)

**Merged pull requests:**

- Change touch joystick image, revamp the math, add optional tilt menu … [\#151](https://github.com/ct6502/apple2ts/pull/151) ([ct6502](https://github.com/ct6502))
- Updated disk collection code to use item rather than index [\#150](https://github.com/ct6502/apple2ts/pull/150) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Tabs for the disk collection panel [\#149](https://github.com/ct6502/apple2ts/pull/149) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Touch Joystick [\#148](https://github.com/ct6502/apple2ts/pull/148) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Handled case where port is default/null when generating OneDrive auth redirect URL [\#147](https://github.com/ct6502/apple2ts/pull/147) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Updated loadDisk\(\) to correctly handle all disk collection item URL types [\#145](https://github.com/ct6502/apple2ts/pull/145) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Bookmarks added via the Internet Archive panel were not recognized in the  [\#144](https://github.com/ct6502/apple2ts/pull/144) ([boredsenseless](https://github.com/boredsenseless))
- Feature: PopupMenu component and disk drive context menu [\#143](https://github.com/ct6502/apple2ts/pull/143) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Cloud disk bookmarks \(with dynamic screenshots!\) [\#142](https://github.com/ct6502/apple2ts/pull/142) ([boredsenseless](https://github.com/boredsenseless))
- Fix: Progress modal not dismissed when loading disks from Google Drive [\#141](https://github.com/ct6502/apple2ts/pull/141) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Disk bookmarks [\#140](https://github.com/ct6502/apple2ts/pull/140) ([boredsenseless](https://github.com/boredsenseless))
- Fix for bug 136 [\#139](https://github.com/ct6502/apple2ts/pull/139) ([boredsenseless](https://github.com/boredsenseless))
- Support for zipped disk images [\#137](https://github.com/ct6502/apple2ts/pull/137) ([boredsenseless](https://github.com/boredsenseless))
- Updated DiskInterface to only wrap on narrow screen in Minimal mode [\#135](https://github.com/ct6502/apple2ts/pull/135) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Consolidated disk image collection \(built-in disks and new releases\) [\#133](https://github.com/ct6502/apple2ts/pull/133) ([boredsenseless](https://github.com/boredsenseless))
- Minimal theme flyout panel fixes [\#130](https://github.com/ct6502/apple2ts/pull/130) ([boredsenseless](https://github.com/boredsenseless))
- Minor UI tweaks for drive menu and Minimal theme [\#129](https://github.com/ct6502/apple2ts/pull/129) ([boredsenseless](https://github.com/boredsenseless))
- Minimal theme discoverability improvements [\#128](https://github.com/ct6502/apple2ts/pull/128) ([boredsenseless](https://github.com/boredsenseless))
- Minimal theme now works for non-webkit browsers [\#127](https://github.com/ct6502/apple2ts/pull/127) ([boredsenseless](https://github.com/boredsenseless))
- Feature: Added proper paging support to the Internet Archive search via infinite scrollbar [\#125](https://github.com/ct6502/apple2ts/pull/125) ([boredsenseless](https://github.com/boredsenseless))
- Minor UI tweaks to the Internet Archive feature [\#124](https://github.com/ct6502/apple2ts/pull/124) ([boredsenseless](https://github.com/boredsenseless))
- "Save Disk to Device" feature [\#122](https://github.com/ct6502/apple2ts/pull/122) ([boredsenseless](https://github.com/boredsenseless))
- Fixed fullscreen scanlines positioning bug [\#121](https://github.com/ct6502/apple2ts/pull/121) ([boredsenseless](https://github.com/boredsenseless))
- Read/write disk images and hot reload feature [\#120](https://github.com/ct6502/apple2ts/pull/120) ([boredsenseless](https://github.com/boredsenseless))
- Added support for UI themes and created new "Minimal" theme [\#119](https://github.com/ct6502/apple2ts/pull/119) ([boredsenseless](https://github.com/boredsenseless))
- Fixed first-time upload bug for OneDrive [\#116](https://github.com/ct6502/apple2ts/pull/116) ([boredsenseless](https://github.com/boredsenseless))
- Tweak diskdrive useEffect to pay attention to more drive props so it … [\#114](https://github.com/ct6502/apple2ts/pull/114) ([ct6502](https://github.com/ct6502))
- Reorganize code, split into UI, Common, Worker folders. Fixes \#112 [\#113](https://github.com/ct6502/apple2ts/pull/113) ([ct6502](https://github.com/ct6502))

## [v2.8](https://github.com/ct6502/apple2ts/tree/v2.8) (2025-02-11)

[Full Changelog](https://github.com/ct6502/apple2ts/compare/v2.7...v2.8)

**Implemented enhancements:**

- Add support for Google Drive to Cloud Drive [\#108](https://github.com/ct6502/apple2ts/issues/108)
- Support for loading/saving disk images via cloud drive \(e.g., OneDrive\) [\#103](https://github.com/ct6502/apple2ts/issues/103)
- Add Guided Tours to walk users thru different features [\#101](https://github.com/ct6502/apple2ts/issues/101)
- Add "inverse black and white" color mode [\#91](https://github.com/ct6502/apple2ts/issues/91)

**Fixed bugs:**

- \# - url not working [\#102](https://github.com/ct6502/apple2ts/issues/102)
- iOS 18.x.x: Keyboard does not come up [\#99](https://github.com/ct6502/apple2ts/issues/99)

**Merged pull requests:**

- Cloud drive updates - split CloudDrive object into CloudData and CloudProvider [\#111](https://github.com/ct6502/apple2ts/pull/111) ([ct6502](https://github.com/ct6502))
- Add Google Drive to Cloud options. Fixes \#108 [\#110](https://github.com/ct6502/apple2ts/pull/110) ([ct6502](https://github.com/ct6502))
- Boredsenseless/sync perf improvements [\#109](https://github.com/ct6502/apple2ts/pull/109) ([boredsenseless](https://github.com/boredsenseless))
- Added OneDrive session support for better perf and stability [\#107](https://github.com/ct6502/apple2ts/pull/107) ([boredsenseless](https://github.com/boredsenseless))
- Refactored cloud drive code to make it easier to add new providers [\#106](https://github.com/ct6502/apple2ts/pull/106) ([boredsenseless](https://github.com/boredsenseless))
- Boredsenseless/drive icons removed [\#105](https://github.com/ct6502/apple2ts/pull/105) ([boredsenseless](https://github.com/boredsenseless))
- Cloud drive disk image load/save and auto-sync \(powered by Microsoft OneDrive\) [\#104](https://github.com/ct6502/apple2ts/pull/104) ([boredsenseless](https://github.com/boredsenseless))
- Added support for COLOR\_MODE.INVERSEBLACKANDWHITE [\#100](https://github.com/ct6502/apple2ts/pull/100) ([boredsenseless](https://github.com/boredsenseless))

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
