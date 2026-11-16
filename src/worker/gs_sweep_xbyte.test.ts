import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { memGet24, memSet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { resetMouse } from "./devices/mouse"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// What $C024 byte does the ROM's mouse accumulator actually want?
//
// Section 41 measured the symptom precisely: positive reports are applied
// exactly ($BF -> +63, $A1 -> +33) while negative ones are not ($FF should be
// -63 and does not go left at all). The 16-bit adds at $FF:9D77 and $FF:9D8F are
// arithmetically correct, so the arithmetic is not the fault - the report byte
// the guest receives does not match what this ROM's accumulator decodes.
//
// Hand-decoding $FF:9D49-$FF:9D6E is unreliable (it is native-mode 8-bit code and
// a 6502-shaped decoder mis-aligns it), so measure instead: hand the ROM one
// arbitrary X byte at a time and record what it writes to the cursor words. The
// first sweep already showed the striking result that bit 6 set sends the cursor
// to the screen maximum for every magnitude, including magnitude 0 - i.e. no
// value of the X byte produces leftward motion at all.
const FRAMES = Number(process.env.GSSWP_FRAMES || 4000)
const PO_PATH = process.env.GSSWP_PO || "C:\\dev\\emu\\ap2\\GSOS601.po"

const XLO = 0x047c, XHI = 0x057c, YLO = 0x04fc, YHI = 0x05fc
const h2 = (v: number) => "$" + v.toString(16).toUpperCase().padStart(2, "0")

const cur = () => memGet24(XLO) | (memGet24(XHI) << 8)

test("GSOS601: sweep the X report byte and record the cursor words", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()
    const data = fs.readFileSync(PO_PATH)
    expect(doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "GSOS601.po", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    const adb = iigsADB as any

    // Count how many $C024 reads the ROM makes for one probe, so we know it
    // consumed the report rather than leaving it queued.
    let reads = 0
    const origRead = adb.readMouseData.bind(adb)
    adb.readMouseData = () => { reads++; return origRead() }

    const rows: string[] = []
    // All eight low-bit magnitudes with each of bits 6 and 7 set.
    const probes: number[] = []
    for (const mag of [0x00, 0x01, 0x02, 0x08, 0x10, 0x20, 0x3e, 0x3f]) {
      for (const hi of [0x00, 0x40, 0x80, 0xc0]) probes.push(hi | mag)
    }
    for (const b of probes) {
      // Park both axes by writing the words directly. Re-centring with motion
      // does not work, precisely because negative motion is the thing under
      // test: the cursor only ever climbs and pins at the screen maximum.
      memSet24(XLO, 0x80); memSet24(XHI, 0x01)
      memSet24(YLO, 0x40); memSet24(YHI, 0x00)
      for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
      const before = cur()
      reads = 0
      adb.mouseRegs[0] = b
      adb.mouseRegs[1] = 0x80          // no Y motion, button up
      adb.mouseHasData = true
      adb.reportInProgress = false
      for (let f = 0; f < 20; f++) jest.advanceTimersByTime(17)
      const d = ((cur() - before) & 0xffff)
      rows.push(
        "  " + h2(b) +
        "   X=" + h2(memGet24(XLO)) + "/" + h2(memGet24(XHI)) +
        "  Y=" + h2(memGet24(YLO)) + "/" + h2(memGet24(YHI)) +
        "  delta=" + String(d > 32767 ? d - 65536 : d).padStart(5) +
        "  reads=" + reads)
    }
    console.log("[SWEEP] X report byte -> cursor words (X=$047C/$057C, Y=$04FC/$05FC):\n" + rows.join("\n"))

    // Same sweep on the second report byte. The X sweep showed bit 6 always
    // sends the cursor to the screen maximum, which means negative X motion is
    // unreachable; the question is whether Y behaves the same way or whether the
    // two axes genuinely differ.
    const yrows: string[] = []
    for (const b of probes) {
      memSet24(XLO, 0x80); memSet24(XHI, 0x01)
      memSet24(YLO, 0x40); memSet24(YHI, 0x00)
      for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
      const before = memGet24(YLO) | (memGet24(YHI) << 8)
      adb.mouseRegs[0] = 0x80          // no X motion, button up
      adb.mouseRegs[1] = b
      adb.mouseHasData = true
      adb.reportInProgress = false
      for (let f = 0; f < 20; f++) jest.advanceTimersByTime(17)
      const d = ((memGet24(YLO) | (memGet24(YHI) << 8)) - before) & 0xffff
      yrows.push(
        "  " + h2(b) +
        "   X=" + h2(memGet24(XLO)) + "/" + h2(memGet24(XHI)) +
        "  Y=" + h2(memGet24(YLO)) + "/" + h2(memGet24(YHI)) +
        "  delta=" + String(d > 32767 ? d - 65536 : d).padStart(5))
    }
    console.log("[SWEEP] Y report byte -> cursor words:\n" + yrows.join("\n"))

    // Fingerprint: with bit 6 set the low byte of the cursor drops by 1 while
    // the high byte rises by 1, i.e. the 16-bit delta is rebuilt as +$0xx
    // instead of -$Fxx. The high half is the byte POPped second, so watch what
    // the negative branch actually pushed: $FF:9D53 is "LDX #$00FF", $9D5A
    // "PHX", $9D5B "PHA", and the two PLA that consume them are $9D8D / $9D95.
    const cpu = getCPU() as any
    const notes: string[] = []
    let watch = false
    const orig = cpu.processInstruction.bind(cpu)
    cpu.processInstruction = (cb?: any) => {
      if (watch && cpu.PB === 0xff && cpu.PC >= 0x9d4d && cpu.PC <= 0x9d9c) {
        const s = cpu.S
        notes.push("  $" + cpu.PC.toString(16).toUpperCase() +
          " op=" + h2(memGet24(0xff0000 | cpu.PC)) +
          " A=" + h2(cpu.A) + " X=" + h2(cpu.X) + " Y=" + h2(cpu.Y) +
          " S=" + h2((s >> 8) & 0xff) + h2(s & 0xff) +
          "  stack[S-3..S]=" + [0, 1, 2, 3].map((k) => h2(memGet24(s - k))).join(""))
      }
      return orig(cb)
    }
    memSet24(XLO, 0x80); memSet24(XHI, 0x01)
    memSet24(YLO, 0x40); memSet24(YHI, 0x00)
    for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
    watch = true
    adb.mouseRegs[0] = 0x40          // magnitude 0, bit 6 set: the negative path
    adb.mouseRegs[1] = 0x80
    adb.mouseHasData = true
    adb.reportInProgress = false
    for (let f = 0; f < 20; f++) jest.advanceTimersByTime(17)
    watch = false
    console.log("[SWEEP] negative-path trace (stack bytes at the current S):\n" + notes.join("\n"))
    expect(true).toBe(true)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
