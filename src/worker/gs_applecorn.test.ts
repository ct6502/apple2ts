import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import {
  getTextPageAsString,
  isIigsRom03,
  megaIIAux,
  megaIIMain,
  memory,
  setIigsRomVersion,
} from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE, RamWorksMemoryStart } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Applecorn 0.54-beta is a BBC Micro MOS boot floppy. Its MOS draws the banner
// ("Applecorn v0.54-beta-0-g…", "BASIC", the ">" prompt) on text page 2 by
// storing 24-bit into $E0:$0800 / $E1:$0800 - the Mega II RAM the IIgs video
// scanner reads. On ROM 01 that is the *only* route to page 2: TEXT2 shadowing
// ($C035 bit 5) does not exist there, so a CPU store to $0800 stays in fast RAM
// (gssquared shadow_is_enabled gates the $0800-$0BFF window on is_rom03). On
// ROM 03 Applecorn leaves $C035 = $28, so it inhibits the shadow even where the
// MMU would honour it - and either way the beam reads Mega II.
//
// Reading page 2 from fast RAM whenever the ROM is 01, or whenever bit 5 is set,
// therefore displayed a stale page and the boot looked dead on both ROMs.
// getTextPage() now reads Mega II unconditionally for the IIgs, and this pins
// that:
//   - ROM 01 and ROM 03 both reach the banner and answer a keystroke;
//   - the banner lives in Mega II, not in bank-$00 fast RAM, on ROM 01;
//   - the //e keeps reading its own fast RAM page (no Mega II there at all).
// Restoring either old read-side branch - the !isIigsRom03() test or the $C035
// bit test - turns the matching ROM case red at the banner assertion.
const DISK_PATH = process.env.GS_APPLECORN_PATH || "C:\\dev\\emu\\ap2\\applecorn-0.54-beta.po"
const hasDisk = fs.existsSync(DISK_PATH)
const BANNER = "Applecorn v0.54-beta"
const BASIC = "BASIC"

// The renderer's own 24-line text address table.
const OFFSET = [
  0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380, 0x28, 0xA8, 0x128, 0x1A8,
  0x228, 0x2A8, 0x328, 0x3A8, 0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350, 0x3D0,
]

// The renderer's 80-column merge: aux carries the left cell of each pair.
const page80 = (main: Uint8Array, aux: Uint8Array, base: number) => {
  let out = ""
  for (const off of OFFSET) {
    for (let i = 0; i < 40; i++) {
      out += String.fromCharCode(aux[base + off + i] & 0x7F)
      out += String.fromCharCode(main[base + off + i] & 0x7F)
    }
  }
  return out
}

const type = (s: string) => {
  for (const ch of s) {
    const k = ch.charCodeAt(0)
    setKeyboardState({ isDown: true, key: k, repeat: false })
    for (let f = 0; f < 5; f++) jest.advanceTimersByTime(17)
    setKeyboardState({ isDown: false, key: 0, repeat: false })
    for (let f = 0; f < 5; f++) jest.advanceTimersByTime(17)
  }
}

const boot = (machine: MACHINE_NAME, index: number, rom?: "01" | "03") => {
  doSetMachineName(machine)
  if (rom) setIigsRomVersion(rom)
  expect(doSetEmuDriveNewData({
    index, hardDrive: true, drive: 1, filename: "applecorn-0.54-beta.po", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
}

// Waits for Applecorn's own ROM-picker menu ("Choose a BBC Micro ROM").
const waitForMenu = (limit = 2000) => {
  for (let f = 1; f <= limit; f++) {
    jest.advanceTimersByTime(17)
    if (getTextPageAsString().includes("Choose a BBC Micro ROM")) return f
  }
  return -1
}

const chooseBasic = () => {
  type("1")
  for (let f = 0; f < 1800; f++) jest.advanceTimersByTime(17)
}

describe("applecorn on the IIgs slot-5 3.5\" drive", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })
  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  const runCases: [string, "01" | "03"][] = [["ROM 01", "01"], ["ROM 03", "03"]]
  test.each(runCases)(
    "%s reaches the MOS banner and answers a keystroke",
    (_label, rom) => {
      if (!hasDisk) {
        console.warn(`applecorn image missing: ${DISK_PATH}`)
        return
      }
      boot("APPLE2GS", 4, rom)
      expect(isIigsRom03()).toBe(rom === "03")
      expect(waitForMenu()).toBeGreaterThan(0)
      chooseBasic()

      const screen = getTextPageAsString()
      expect(screen).toContain(BANNER)
      expect(screen).toContain(BASIC)
      expect(screen).toContain(">")

      // MOS is live: BBC BASIC answers PRINT 6*7.
      type("PRINT 6*7\r")
      for (let f = 0; f < 900; f++) jest.advanceTimersByTime(17)
      expect(getTextPageAsString()).toContain("42")
    },
    600000
  )

  test("ROM 01 keeps page 2 in Mega II, where the scanner reads it", () => {
    if (!hasDisk) {
      console.warn(`applecorn image missing: ${DISK_PATH}`)
      return
    }
    boot("APPLE2GS", 4, "01")
    waitForMenu()
    chooseBasic()

    // The banner is written straight through $E0/$E1, so it is in the Mega II
    // banks as two halves of the 80-column page: aux carries the left cell of
    // each pair. Bank-$00/$01 fast RAM - what a read-side !isIigsRom03() branch
    // would have picked - never sees the store and holds a stale page.
    expect(page80(megaIIMain, megaIIAux, 0x0800)).toContain(BANNER)
    expect(page80(memory, memory.subarray(RamWorksMemoryStart), 0x0800)).not.toContain(BANNER)
  }, 600000)

  test("the //e reads its own fast-RAM page 2", () => {
    if (!hasDisk) {
      console.warn(`applecorn image missing: ${DISK_PATH}`)
      return
    }
    // No slot-5 bay on a //e, so the same volume mounts as a SmartPort volume.
    boot("APPLE2EE", 0)
    expect(waitForMenu()).toBeGreaterThan(0)
    chooseBasic()

    expect(getTextPageAsString()).toContain(BANNER)
    // A //e has no Mega II in its display path: the renderer reads its own fast
    // RAM, and the unscanned $E0/$E1 banks never see the banner.
    expect(page80(megaIIMain, megaIIAux, 0x0800)).not.toContain(BANNER)
  }, 600000)
})
