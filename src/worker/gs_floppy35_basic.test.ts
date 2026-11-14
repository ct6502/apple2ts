import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { getTextPageAsString } from "./memory"
import { doSetEmuDriveNewData, getDriveDataByIndex, getDriveStateByIndex } from "./devices/drivestate"
import { setKeyboardState } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// A2DeskTop 1.5 is a stock ProDOS 8 800K volume whose /EXTRAS holds a real
// BASIC.SYSTEM. Its root startup record (`desktop.system`) is repointed at that
// file in memory so the guest comes up at the Applesoft prompt; everything
// after that - the SAVE and the LOAD - goes through the slot-5 3.5" drive and
// its block splice, which is what this suite is about.
const DISK_PATH = process.env.GS_FLOPPY35_BASIC_PATH ||
  "c:\\dev\\emu\\ap2\\A2DeskTop-1.5.po"
const hasDisk = fs.existsSync(DISK_PATH)

const BLOCK = 512
const u16 = (v: Uint8Array, at: number) => v[at] | (v[at + 1] << 8)
const nameAt = (v: Uint8Array, at: number) => {
  let name = ""
  for (let i = 0; i < 15; i++) {
    const c = v[at + 1 + i] & 0x7f
    if (!c) break
    name += String.fromCharCode(c)
  }
  return name
}
// A directory header block keeps its own record at offset 4 and children from
// 43; a continuation block packs from 0. Only the first block is needed here.
const dirEntries = (v: Uint8Array, block: number) => {
  const entries: { off: number, name: string, first: number, blocks: number, eof: number }[] = []
  for (let off = 43; off + 39 <= BLOCK; off += 39) {
    if ((v[block * BLOCK + off] & 0x0f) === 0) break
    const at = block * BLOCK + off
    entries.push({
      off, name: nameAt(v, at), first: u16(v, at + 17),
      blocks: u16(v, at + 19), eof: u16(v, at + 21),
    })
  }
  return entries
}

const patchStartupToBasic = (source: Uint8Array) => {
  const v = new Uint8Array(source)
  const root = dirEntries(v, 2)
  const launcher = root.find((e) => e.name.startsWith("DESKTOP.SYSTEM"))
  const extras = root.find((e) => e.name === "EXTRAS")
  if (!launcher || !extras) throw new Error("A2DeskTop volume layout changed")
  const basic = dirEntries(v, extras.first).find((e) => e.name.startsWith("BASIC.SYSTEM"))
  if (!basic) throw new Error("/EXTRAS/BASIC.SYSTEM not found")
  const at = 2 * BLOCK + launcher.off
  v[at + 17] = basic.first & 0xFF
  v[at + 18] = basic.first >> 8
  v[at + 19] = basic.blocks & 0xFF
  v[at + 20] = basic.blocks >> 8
  v[at + 21] = basic.eof & 0xFF
  v[at + 22] = basic.eof >> 8
  return v
}

const mount = (image: Uint8Array) => doSetEmuDriveNewData({
  index: 4, hardDrive: false, drive: 1, filename: "A2DeskTop-1.5.po", status: "",
  motorRunning: false, diskHasChanges: false, isWriteProtected: false,
  diskData: new Uint8Array(image), lastAppleWriteTime: 0, cloudData: null,
  writableFileHandle: null, lastLocalFileWriteTime: 0,
} as DriveProps)

// Apple II RETURN is $0D. Every key is held for five frames so the ROM's
// keyboard scan sees the strobe and its release.
const type = (text: string) => {
  for (const ch of text) {
    const key = ch.charCodeAt(0)
    setKeyboardState({ isDown: true, key, repeat: false })
    for (let f = 0; f < 5; f++) jest.advanceTimersByTime(17)
    setKeyboardState({ isDown: false, key: 0, repeat: false })
    for (let f = 0; f < 5; f++) jest.advanceTimersByTime(17)
  }
}
const run = (frames: number) => { for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17) }

const bootToBasic = () => {
  doSetRunMode(RUN_MODE.NEED_BOOT)
  doSetRunMode(RUN_MODE.RUNNING, false)
  for (let f = 0; f < 4000; f++) {
    jest.advanceTimersByTime(17)
    if (getTextPageAsString().includes("PRODOS BASIC")) return f
  }
  return -1
}

describe("3.5\" (slot 5) BASIC.SYSTEM save", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })

  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("SAVE then LOAD round-trips a program, and the image keeps it across a remount", () => {
    if (!hasDisk) {
      console.warn("Skipping test: " + DISK_PATH + " not found")
      return
    }
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    const startupImage = patchStartupToBasic(new Uint8Array(fs.readFileSync(DISK_PATH)))
    expect(mount(startupImage)).toBe(true)
    const ds = getDriveStateByIndex(4)
    expect(ds.is35).toBe(true)
    expect(ds.blockMedia35).toBe(true)

    expect(bootToBasic()).toBeGreaterThanOrEqual(0)
    const page = () => getTextPageAsString()

    type("10 REM 3.5 INCH ROUND TRIP 1234567890\r")
    type("20 A=40+2: B$=\"SAVED ON SONY 800K\"\r")
    type("30 PRINT A; B$\r")
    run(200)

    type("SAVE ROUNDTRIP\r")
    run(400)
    expect(ds.diskHasChanges).toBe(true)

    type("NEW\r")
    run(150)
    type("LOAD ROUNDTRIP\r")
    run(400)
    type("LIST\r")
    run(250)
    expect(page()).toContain("10  REM  3.5 INCH ROUND TRIP")
    expect(page()).toContain("A = 40 + 2")
    expect(page()).toContain("30  PRINT A;B$")
    expect(page()).not.toContain("SYNTAX ERROR")

    type("RUN\r")
    run(250)
    expect(page()).toContain("42SAVED ON SONY 800K")

    // The write spliced the sector back into the block image: the new file is
    // in the volume directory and the bytes differ from what was mounted.
    const written = new Uint8Array(getDriveDataByIndex(4))
    expect(dirEntries(written, 2).some((e) => e.name.startsWith("ROUNDTRIP"))).toBe(true)
    let changed = 0
    for (let i = 0; i < startupImage.length; i++) {
      if (written[i] !== startupImage[i]) changed++
    }
    expect(changed).toBeGreaterThan(0)

    // Remount exactly what the drive wrote and let the guest read it again.
    doSetRunMode(RUN_MODE.PAUSED, false)
    expect(mount(written)).toBe(true)
    expect(bootToBasic()).toBeGreaterThanOrEqual(0)
    type("LOAD ROUNDTRIP\r")
    run(400)
    type("LIST\r")
    run(250)
    expect(page()).toContain("10  REM  3.5 INCH ROUND TRIP")
    expect(page()).toContain("30  PRINT A;B$")
    type("RUN\r")
    run(250)
    expect(page()).toContain("42SAVED ON SONY 800K")
  }, 900000)
})
