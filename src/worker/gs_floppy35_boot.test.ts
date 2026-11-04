import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, getTextPageAsString } from "./memory"
import {
  doSetEmuDriveNewData,
  getDriveBitstreamByIndex,
  getDriveDataByIndex,
  getDriveStateByIndex,
} from "./devices/drivestate"
import { decodeFloppy35Track, floppy35SectorOffset } from "./devices/floppy35"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// GS/OS 6.0.1 SystemDisk on the IIgs's built-in slot-5 3.5" drive (drive
// index 4). The ROM's 3.5" driver runs at 2.8 MHz fast mode: 500 kbit/s media
// is one byte per ~45 CPU cycles, which a 1.02 MHz budget cannot sustain. The
// boot therefore also pins the IIgs default speed (see doSetMachineName).
//
// The image is a real 800 KB ProDOS volume, so the boot has to work through
// the ROM's own IWM driver, not a block shim. While mounting, GS/OS rewrites
// the root and SYSTEM directory key blocks (last-modified date) - that is the
// write path being exercised - so the media must still decode to the *written*
// block image everywhere afterwards.
const DISK_PATH = process.env.GS_FLOPPY35_BOOT_PATH || "C:\\dev\\emu\\ap2\\SystemDisk.2mg"
const FRAMES = Number(process.env.GS_FLOPPY35_BOOT_FRAMES || 4200)
const SHR_SCB_OFFSET = 0x7D00
const IMAGE_OFFSET = 64 // 2MG header

test("SystemDisk boots from slot 5 and leaves the 3.5\" media intact", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = new Uint8Array(fs.readFileSync(DISK_PATH))
    expect(doSetEmuDriveNewData({
      index: 4, hardDrive: false, drive: 1, filename: "SystemDisk.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    const ds = getDriveStateByIndex(4)
    expect(ds.is35).toBe(true)
    expect(ds.blockMedia35).toBe(true)

    const sectorCounts = () => {
      const stream = getDriveBitstreamByIndex(4)
      const counts: number[] = []
      for (let t = 0; t < 160; t++) {
        const nbits = ds.trackNbits[t], start = ds.trackStart[t]
        counts.push(nbits && start ? decodeFloppy35Track(stream, start, nbits).length : -1)
      }
      return counts
    }
    // 800 KB media is zoned: 16 cylinders each of 12/11/10/9/8 sectors, both
    // sides, which adds up to the volume's 1600 blocks.
    const ZONE_SECTORS = [12, 11, 10, 9, 8]
    const zoneCounts: number[] = []
    for (let t = 0; t < 160; t++) zoneCounts.push(ZONE_SECTORS[Math.floor(t / 32)])
    const beforeCounts = sectorCounts()
    expect(beforeCounts).toEqual(zoneCounts)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    // The GS/OS Finder desktop is drawn in SHR with several palettes: the boot
    // splash holds a single SCB value until GS/OS takes over (~frame 2800 at
    // 2.8 MHz), then the desktop palette rows fill in.
    const shr = getShr()
    const scbs = new Set<number>()
    for (let y = 0; y < 200; y++) scbs.add(shr[SHR_SCB_OFFSET + y])
    expect(scbs.size).toBeGreaterThanOrEqual(5)
    let shrNonZero = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) shrNonZero++
    expect(shrNonZero).toBeGreaterThan(20000)

    // No sector was damaged by the boot: same field count on every track side.
    expect(sectorCounts()).toEqual(beforeCounts)

    // Every field on the media still decodes to the block image, including the
    // directory blocks the guest rewrote during the boot.
    const stream = getDriveBitstreamByIndex(4)
    const image = getDriveDataByIndex(4)
    let mismatched = 0
    for (let t = 0; t < 160; t++) {
      const nbits = ds.trackNbits[t], start = ds.trackStart[t]
      if (!nbits || !start) continue
      const track = t >> 1, side = t & 1
      for (const s of decodeFloppy35Track(stream, start, nbits)) {
        const at = IMAGE_OFFSET + floppy35SectorOffset(track, s.sector, side) * 512
        for (let i = 0; i < 512; i++) {
          if (s.data[i] !== image[at + i]) { mismatched++; break }
        }
      }
    }
    expect(mismatched).toBe(0)

    // GS/OS only touches the volume metadata (the two directory key blocks)
    // when it mounts a writable volume, so the write path really ran.
    expect(ds.diskHasChanges).toBe(true)
    const changed: number[] = []
    for (let b = 0; b < 1600; b++) {
      const at = IMAGE_OFFSET + b * 512
      for (let i = 0; i < 512; i++) {
        if (image[at + i] !== data[at + i]) { changed.push(b); break }
      }
    }
    expect(changed.length).toBeGreaterThan(0)
    expect(changed.length).toBeLessThanOrEqual(8)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)

// The 800 KB Apple II DeskTop volume boots ProDOS 8 (not GS/OS) straight from
// slot 5, so the guest pulls its own kernel and its startup application out of
// the GCR fields: /PRODOS is 34 blocks and DESKTOP.SYSTEM another 13, plus the
// directory and module blocks. A wrong byte anywhere in that chain shows up as
// a failed load rather than a garbled screen, which is what makes this the
// end-to-end proof that the drive hands the guest the volume's real bytes.
const P8_PATH = process.env.GS_FLOPPY35_P8_PATH || "C:\\dev\\emu\\ap2\\A2DeskTop-1.5-en_800k.2mg"
const P8_FRAMES = Number(process.env.GS_FLOPPY35_P8_FRAMES || 1600)

test("ProDOS 8 loads its kernel and startup application from slot-5 3.5\" media", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    const data = new Uint8Array(fs.readFileSync(P8_PATH))
    expect(doSetEmuDriveNewData({
      index: 4, hardDrive: false, drive: 1, filename: "A2DeskTop.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)).toBe(true)

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)
    let seenProdos = ""
    let seenStartup = ""
    for (let f = 0; f < P8_FRAMES && !(seenProdos && seenStartup); f++) {
      jest.advanceTimersByTime(17)
      const page = getTextPageAsString()
      if (!seenProdos && page.includes("ProDOS 8")) seenProdos = `frame ${f}`
      if (!seenStartup && page.includes("Starting Apple II DeskTop")) seenStartup = `frame ${f}`
    }
    expect(seenProdos).toMatch(/^frame /)
    expect(seenStartup).toMatch(/^frame /)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
