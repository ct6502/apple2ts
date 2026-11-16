// The Apple IIgs ROM Desk Accessories menu, opened the way the hardware opens it.
//
// Control + Open Apple + Escape is not a key combination the guest is ever told
// about. The ADB micro-controller intercepts the sequence and answers with a
// data-register report whose bit 5 means "the desk-manager key sequence"
// (gssquared ADB_Micro.hpp:1026, KEGS adb.c:1687); that report - not a keystroke -
// is what wakes the ROM's desk manager, which then draws its own menu (Control
// Panel / Alternate Display Mode / Visit Monitor / Memory Peeker / Quit) over
// whatever the machine was showing.
//
// Until queueKeyboard() produced the report, nothing in the emulator could make
// it, so the menu was unreachable: no host key reached it and a UI button had
// nothing to inject. Part 1 tests the micro in isolation; part 2 boots the ROM
// with no disk and measures the text page, because the claim worth defending is
// that the screen changes.

import { doBoot, doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getTextPage, memGet24, memGetC000 } from "./memory"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { openIigsRomDeskPanel, setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"

// $C027 bit 5 (data register full) and the report byte's own bit 5 (the
// desk-manager sequence) are both 0x20 - see iigs_adb.ts for the layouts.
const STATUS_DATA_AVAILABLE = 0x20
const DESK_MANAGER_REPORT = 0x20
const STATUS_DATA_INTERRUPT = 0x10
const MOD_CONTROL = 0x02
const MOD_OPEN = 0x80

const down = (domCode: string, key = -1) =>
  setKeyboardState({ key, isDown: true, repeat: false, domCode })
const up = (domCode: string, key = -1) =>
  setKeyboardState({ key, isDown: false, repeat: false, domCode })

// The 40x24 text page as lowercase letters and digits only, so the border
// glyphs and inverse-video bits do not have to be modelled to match a string.
const screenWords = () =>
  Array.from(getTextPage())
    .map((c) => String.fromCharCode(c & 0x7f))
    .join("")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()

const hasMenu = (words: string) =>
  words.includes("deskaccessories") && words.includes("controlpanel")
  && words.includes("alternatedisplaymode")

const pump = (frames: number) => {
  for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
}

describe("the ADB micro-controller's desk-manager sequence", () => {
  beforeEach(() => {
    doSetMachineName("APPLE2GS")
    iigsADB.reset()
  })

  test("Control + Open Apple + Escape latches a report instead of a key", () => {
    // A key held under the chord: the micro swallows the Escape, so the legacy
    // latch must keep that key rather than lose it or turn into an Escape.
    down("KeyA", 97)
    expect(memGetC000(0xC000)).toBe(0x80 | 97)

    down("ControlLeft")
    down("AltLeft")
    expect(iigsADB.peekModifiers() & (MOD_CONTROL | MOD_OPEN)).toBe(MOD_CONTROL | MOD_OPEN)

    down("Escape", 27)
    expect(memGetC000(0xC000)).toBe(0x80 | 97)
    // The Escape was swallowed to make the report, so it reaches neither the
    // legacy latch nor the ADB key register. (The modifier downs above do buffer
    // their own keycodes - that is what a real ADB keyboard sends - so the
    // register is not empty; it just is not the Escape.)
    expect(iigsADB.getKeyboardEvent()[0]).not.toBe(0x35)
    expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(STATUS_DATA_AVAILABLE)
    expect(iigsADB.readData()).toBe(DESK_MANAGER_REPORT)
    expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)

    up("Escape", 27)
    up("AltLeft")
    up("ControlLeft")
  })

  test("the report raises the data interrupt the desk manager waits on", () => {
    // ROM 01 writes $10 to $C027 at FF:F9E0, which is this enable bit.
    iigsADB.writeStatus(STATUS_DATA_INTERRUPT)
    expect(iigsADB.interruptPending()).toBe(false)
    openIigsRomDeskPanel()
    expect(iigsADB.interruptPending()).toBe(true)
    expect(iigsADB.readData()).toBe(DESK_MANAGER_REPORT)
    expect(iigsADB.interruptPending()).toBe(false)
  })

  test("two keys are not the sequence", () => {
    // Without Open Apple the Escape is an ordinary key: it reaches the ADB
    // buffer and the legacy latch, and no report is made.
    down("ControlLeft")
    down("Escape", 27)
    expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
    expect(iigsADB.getKeyboardEvent()[0]).toBe(0x35)
    expect(memGetC000(0xC000)).toBe(0x80 | 27)
    up("Escape", 27)
    up("ControlLeft")

    // Open Apple + Escape (the drawer chord) is likewise just a key here.
    down("AltLeft")
    down("Escape", 27)
    expect(iigsADB.readStatus() & STATUS_DATA_AVAILABLE).toBe(0)
    expect(iigsADB.getKeyboardEvent()[0]).toBe(0x35)
  })

  test("the command register never reports itself full in $C027", () => {
    // Bit 0 is the micro's "waiting for more argument bytes" flag. The ROM's
    // boot-time command loop (FF:851E) spins on it before writing the next
    // byte, so reporting it deadlocks the ADB self-test and the machine ends at
    // 「Fatal system error-> 0911」. KEGS masks it out of adb_read_c027 and
    // gssquared never sets it.
    iigsADB.writeCommand(0x06) // set configuration: three arguments follow
    expect(iigsADB.readStatus() & 0x01).toBe(0)
    iigsADB.writeCommand(0x00)
    iigsADB.writeCommand(0x00)
    iigsADB.writeCommand(0x00)
    expect(iigsADB.readStatus() & 0x01).toBe(0)
  })

  test("the report does not outrank a command response, but comes first", () => {
    // $C026 reads the micro's own report byte before the queued command reply,
    // exactly as KEGS's adb_read_c026 (ADB_IDLE) and gssquared's
    // read_data_register do; otherwise a guest reading status would see bit 5
    // and get a device reply it did not ask for.
    openIigsRomDeskPanel()
    iigsADB.writeCommand(0x00)
    expect(iigsADB.readData()).toBe(DESK_MANAGER_REPORT)
  })
})

describe("the ROM draws the Desk Accessories menu", () => {
  beforeAll(() => {
    jest.useFakeTimers()
    setIsTesting()
    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    // No disk mounted: the ROM keeps the desk manager to itself, which is the
    // state the startup screen ("Check startup device!") sits in.
    pump(600)
  })

  afterAll(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("the no-disk boot finishes the ROM's ADB self-test", () => {
    // The desk manager only has a screen to draw over if the boot got that far.
    // A $C027 that misreports the command register stops the ROM's walk at
    // FF:851E and this screen becomes 「Fatal system error-> 0911」 instead, with
    // nothing left for the chord to open.
    const boot = screenWords()
    expect(boot).not.toContain("fatalsystemerror")
    expect(boot).toContain("checkstartupdevice")
  })

  test("the chord the machine menu sends puts the menu on the text page", () => {
    const before = screenWords()
    expect(before).not.toContain("deskaccessories")

    // Exactly what MSG_MAIN.IIGS_DESK_PANEL runs.
    openIigsRomDeskPanel()

    let frames = 0
    while (frames < 180 && !hasMenu(screenWords())) {
      pump(1)
      frames++
    }
    const after = screenWords()
    console.log(`[desk] menu after ${frames} frames: ${after.replace(/z+/g, " | ").slice(0, 400)}`)
    expect(hasMenu(after)).toBe(true)
    // The guest took the report, so the micro has nothing left to hand out.
    expect(memGet24(0x00c027) & STATUS_DATA_AVAILABLE).toBe(0)
  })
})
