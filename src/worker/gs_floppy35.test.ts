import {
  decodeFloppy35Track,
  decodeSector62,
  encodeSector62,
  floppy35SectorOffset,
  FLOPPY35_BLOCK_BYTES,
  FLOPPY35_SECTORS,
  FLOPPY35_SECTOR_SIZE,
  FLOPPY35_TRACKS,
  getFloppy35PayloadInfo,
} from "./devices/floppy35"
import { getDriveBitstreamByIndex, getDriveDataByIndex, getDriveStateByIndex, doSetEmuDriveNewData } from "./devices/drivestate"
import { doSetMachineName } from "./motherboard"
import { iigsGetIwmEnable35, iigsSetIwmEnable35, memGet24, memSet24 } from "./memory"
import { iwmFlushWrites35, iwmResetTiming } from "./devices/diskdata"
import { s6502 } from "./instructions"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const DISK_PATH = process.env.GS_FLOPPY35_PATH || "C:\\dev\\emu\\ap2\\mcs.2mg"

const readByteAt = (stream: Uint8Array, bit: number) => {
  let byte = 0
  for (let b = 0; b < 8; b++) {
    const value = (stream[bit >> 3] >> (7 - (bit & 7))) & 1
    byte = (byte << 1) | value
    bit++
  }
  return byte
}

// Sync bytes are 10 bits wide, so fields after a gap are not byte-aligned in
// the containing buffer. Slide a bit window to find a marker.
const findBitPattern = (stream: Uint8Array, fromBit: number, toBit: number, pattern: number[]) => {
  for (let bit = fromBit; bit + pattern.length * 8 <= toBit; bit++) {
    let match = true
    for (let i = 0; i < pattern.length; i++) {
      if (readByteAt(stream, bit + i * 8) !== pattern[i]) { match = false; break }
    }
    if (match) return bit
  }
  return -1
}

test("6-and-2 sector encode/decode round-trips", () => {
  const buffer = new Uint8Array(524)
  for (let i = 0; i < buffer.length; i++) buffer[i] = (i * 37 + 11) & 0xFF
  buffer.fill(0, 0, 12)
  const nibbles = encodeSector62(buffer)
  expect(nibbles.length).toBe(703)
  const decoded = decodeSector62(nibbles)
  expect(decoded).not.toBeNull()
  expect(Array.from(decoded!)).toEqual(Array.from(buffer))
})

test("800K block image mounts as a 3.5\" disk with a full GCR bit stream", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  expect(info.size).toBe(FLOPPY35_BLOCK_BYTES)

  // The mount path routes an 800K image into slot 5 (drive-state index 4),
  // nibblizes it, and keeps the raw bytes for writeback.
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename: "test.2mg", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)

  const ds = getDriveStateByIndex(4)
  expect(ds.is35).toBe(true)
  expect(ds.blockMedia35).toBe(true)
  expect(ds.maxQuarterTrack).toBe(159)
  expect(ds.optimalTiming).toBe(16)

  const stream = getDriveBitstreamByIndex(4)
  expect(stream.length).toBeGreaterThan(FLOPPY35_BLOCK_BYTES)
  for (let index = 0; index < 160; index++) {
    // Track 0 has to start past the padding byte or the read engine treats it
    // as an empty track (offset 0 means "no data").
    expect(ds.trackStart[index]).toBeGreaterThan(0)
    expect(ds.trackNbits[index]).toBeGreaterThan(0)
  }

  // Track 0 side 0 starts with GAP A sync bytes, then the first physical
  // sector, which the interleave table makes logical sector 0. Sync bytes are
  // 10 bits wide, so scan at the bit level rather than in byte steps.
  const trackStartBit = ds.trackStart[0] * 8
  const trackEndBit = trackStartBit + ds.trackNbits[0]
  const addressBit = findBitPattern(stream, trackStartBit, trackEndBit, [0xD5, 0xAA, 0x96])
  expect(addressBit).toBeGreaterThanOrEqual(0)
  // 3 prologue + 5 encoded address bytes + DE AA FF, then GAP B.
  const dataBit = findBitPattern(
    stream, addressBit + 11 * 8, trackEndBit, [0xD5, 0xAA, 0xAD])
  expect(dataBit).toBeGreaterThanOrEqual(0)
  const sectorNibble = readByteAt(stream, dataBit + 24) // encoded sector 0
  expect(sectorNibble).toBe(0x96)
  const sectorNibbles = new Uint8Array(703)
  for (let i = 0; i < 703; i++) {
    sectorNibbles[i] = readByteAt(stream, dataBit + 32 + i * 8)
  }
  const decoded = decodeSector62(sectorNibbles)
  expect(decoded).not.toBeNull()

  // Interleave position 0 is logical sector 0 = the image's first block.
  expect(Array.from(decoded!.slice(12))).toEqual(
    Array.from(data.slice(info.offset, info.offset + 512)))
})

test("3.5\" async write clocks a data field onto the media and splices it back", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename: "test.2mg", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)

  const ds = getDriveStateByIndex(4)
  const stream = getDriveBitstreamByIndex(4)
  expect(ds.is35).toBe(true)

  // Track 0, side 0: find the first address field and the data field that
  // follows it (logical sector 0).
  const trackStartBit = ds.trackStart[0] * 8
  const trackEndBit = trackStartBit + ds.trackNbits[0]
  const addressBit = findBitPattern(stream, trackStartBit, trackEndBit, [0xD5, 0xAA, 0x96])
  expect(addressBit).toBeGreaterThanOrEqual(0)
  const dataBit = findBitPattern(stream, addressBit + 11 * 8, trackEndBit, [0xD5, 0xAA, 0xAD])
  expect(dataBit).toBeGreaterThanOrEqual(0)
  const sectorNibble = readByteAt(stream, dataBit + 24)

  // A payload different from the mounted image, so a successful splice shows.
  const buffer = new Uint8Array(524)
  for (let i = 12; i < 524; i++) buffer[i] = (i * 7 + 3) & 0xFF
  const field = [0xD5, 0xAA, 0xAD, sectorNibble, ...Array.from(encodeSector62(buffer)), 0xDE, 0xAA, 0xFF]

  // Put the IWM into 3.5" async-write mode the way the ROM does: Q6 on, then a
  // mode-register write with ENABLE released, then ENABLE asserted.
  iigsSetIwmEnable35(true)
  ds.spindleOn = true
  memSet24(0xC0ED, 0)
  memSet24(0xC0EF, 0xFF)
  memSet24(0xC0E9, 0)
  expect(iigsGetIwmEnable35()).toBe(true)

  iwmResetTiming()
  ds.quarterTrack = 0
  ds.trackLocation = dataBit - trackStartBit

  const handshake = () => memGet24(0xC0EC) & 0xFF
  for (const byte of field) {
    let guard = 0
    while ((handshake() & 0x80) === 0 && guard++ < 64) s6502.cycleCount += 6
    expect(guard).toBeLessThan(64)
    s6502.cycleCount += 4
    memSet24(0xC0ED, byte)
  }
  // The ROM waits for bit 6 to clear after the epilogue, i.e. until the last
  // byte has actually been clocked onto the media.
  let guard = 0
  while ((handshake() & 0x40) !== 0 && guard++ < 64) s6502.cycleCount += 6
  expect(guard).toBeLessThan(64)

  iwmFlushWrites35(4)
  expect(ds.diskHasChanges).toBe(true)
  iwmFlushWrites35(4)
  const image = getDriveDataByIndex(4)
  expect(Array.from(image.slice(info.offset, info.offset + 512)))
    .toEqual(Array.from(buffer.slice(12)))
  // Neighbouring sectors are untouched.
  expect(image[info.offset + 512]).toBe(data[info.offset + 512])
})

test("write-protected 3.5\" media does not record an async write", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename: "test.2mg", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: true,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)

  const ds = getDriveStateByIndex(4)
  expect(ds.isWriteProtected).toBe(true)
  const stream = getDriveBitstreamByIndex(4)
  const trackStartBit = ds.trackStart[0] * 8
  const trackEndBit = trackStartBit + ds.trackNbits[0]
  const addressBit = findBitPattern(stream, trackStartBit, trackEndBit, [0xD5, 0xAA, 0x96])
  const dataBit = findBitPattern(stream, addressBit + 11 * 8, trackEndBit, [0xD5, 0xAA, 0xAD])
  expect(dataBit).toBeGreaterThanOrEqual(0)
  const sectorNibble = readByteAt(stream, dataBit + 24)
  const buffer = new Uint8Array(524)
  for (let i = 12; i < 524; i++) buffer[i] = (i * 5 + 9) & 0xFF
  const field = [0xD5, 0xAA, 0xAD, sectorNibble, ...Array.from(encodeSector62(buffer)), 0xDE, 0xAA, 0xFF]

  iigsSetIwmEnable35(true)
  ds.spindleOn = true
  memSet24(0xC0ED, 0)
  memSet24(0xC0EF, 0xFF)
  memSet24(0xC0E9, 0)
  iwmResetTiming()
  ds.quarterTrack = 0
  ds.trackLocation = dataBit - trackStartBit

  const handshake = () => memGet24(0xC0EC) & 0xFF
  for (const byte of field) {
    let guard = 0
    while ((handshake() & 0x80) === 0 && guard++ < 64) s6502.cycleCount += 6
    expect(guard).toBeLessThan(64)
    s6502.cycleCount += 4
    memSet24(0xC0ED, byte)
  }
  let guard = 0
  while ((handshake() & 0x40) !== 0 && guard++ < 64) s6502.cycleCount += 6
  expect(guard).toBeLessThan(64)

  iwmFlushWrites35(4)
  expect(ds.diskHasChanges).toBe(false)
  const image = getDriveDataByIndex(4)
  expect(Array.from(image.slice(info.offset, info.offset + 524)))
    .toEqual(Array.from(data.slice(info.offset, info.offset + 524)))
})

const SECTORS_PER_ZONE = [12, 11, 10, 9, 8]

const mount800K = (data: Uint8Array) => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename: "test.2mg", status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: data, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)).toBe(true)
  return { ds: getDriveStateByIndex(4), stream: getDriveBitstreamByIndex(4) }
}

// A ProDOS volume is 1600 blocks spread over all 80 cylinders, and the last 16
// of them carry the directory and the file data a `LOAD` reads back. The track
// number is 7 bits: 6 live in the address field's low-track byte and the 7th in
// bit 0 of the side byte. Decoding only the low 6 makes cylinders 64-79 report
// themselves as 0-15, and every write splice into them is then discarded for
// addressing the wrong track.
test("3.5\" media decodes all 160 track-sides with their own cylinder and block", () => {
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  const { ds, stream } = mount800K(data)
  const seen = new Uint8Array(FLOPPY35_SECTORS)

  for (let track = 0; track < FLOPPY35_TRACKS; track++) {
    for (let side = 0; side < 2; side++) {
      const index = track * 2 + side
      const decoded = decodeFloppy35Track(
        stream, ds.trackStart[index], ds.trackNbits[index])
      expect(decoded).toHaveLength(SECTORS_PER_ZONE[Math.floor(track / 16)])
      for (const sector of decoded) {
        expect(sector.track).toBe(track)
        expect(sector.side).toBe(side)
        const block = floppy35SectorOffset(track, sector.sector, side)
        expect(block).toBeGreaterThanOrEqual(0)
        expect(block).toBeLessThan(FLOPPY35_SECTORS)
        expect(Array.from(sector.data)).toEqual(Array.from(
          data.subarray(info.offset + block * FLOPPY35_SECTOR_SIZE,
            info.offset + (block + 1) * FLOPPY35_SECTOR_SIZE)))
        seen[block] = 1
      }
    }
  }
  // Every block of the volume is reachable through exactly one field.
  expect(seen.filter(v => v === 1).length).toBe(FLOPPY35_SECTORS)
})

test("3.5\" async write to the last cylinder splices into its block", () => {
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  const { ds, stream } = mount800K(data)

  const index = FLOPPY35_TRACKS * 2 - 1 // cylinder 79, side 1
  const trackStartBit = ds.trackStart[index] * 8
  const trackEndBit = trackStartBit + ds.trackNbits[index]
  const addressBit = findBitPattern(stream, trackStartBit, trackEndBit, [0xD5, 0xAA, 0x96])
  expect(addressBit).toBeGreaterThanOrEqual(0)
  const dataBit = findBitPattern(stream, addressBit + 11 * 8, trackEndBit, [0xD5, 0xAA, 0xAD])
  expect(dataBit).toBeGreaterThanOrEqual(0)
  const sectorNibble = readByteAt(stream, dataBit + 24)
  // Which logical sector this field holds comes from the decoder, so the block
  // under test is the one the drive itself claims to be writing.
  const decoded = decodeFloppy35Track(stream, ds.trackStart[index], ds.trackNbits[index])
  expect(decoded.length).toBeGreaterThan(0)
  const block = floppy35SectorOffset(FLOPPY35_TRACKS - 1, decoded[0].sector, 1)

  const buffer = new Uint8Array(524)
  for (let i = 12; i < 524; i++) buffer[i] = (i * 13 + 5) & 0xFF
  const field = [0xD5, 0xAA, 0xAD, sectorNibble,
    ...Array.from(encodeSector62(buffer)), 0xDE, 0xAA, 0xFF]

  iigsSetIwmEnable35(true)
  ds.spindleOn = true
  memSet24(0xC0ED, 0)
  memSet24(0xC0EF, 0xFF)
  memSet24(0xC0E9, 0)
  iwmResetTiming()
  ds.quarterTrack = index
  ds.trackLocation = dataBit - trackStartBit

  const handshake = () => memGet24(0xC0EC) & 0xFF
  for (const byte of field) {
    let guard = 0
    while ((handshake() & 0x80) === 0 && guard++ < 64) s6502.cycleCount += 6
    expect(guard).toBeLessThan(64)
    s6502.cycleCount += 4
    memSet24(0xC0ED, byte)
  }
  let guard = 0
  while ((handshake() & 0x40) !== 0 && guard++ < 64) s6502.cycleCount += 6
  expect(guard).toBeLessThan(64)

  iwmFlushWrites35(4)
  expect(ds.diskHasChanges).toBe(true)
  const image = getDriveDataByIndex(4)
  expect(Array.from(
    image.subarray(info.offset + block * FLOPPY35_SECTOR_SIZE,
      info.offset + block * FLOPPY35_SECTOR_SIZE + 512)))
    .toEqual(Array.from(buffer.slice(12)))

  // Read it back the way the drive will: the bits under the head already carry
  // the new sector, so an in-session reread is coherent.
  const afterWrite = decodeFloppy35Track(stream, ds.trackStart[index], ds.trackNbits[index])
  const written = afterWrite.find((s) => s.sector === decoded[0].sector)
  expect(written).toBeDefined()
  expect(Array.from(written!.data)).toEqual(Array.from(buffer.slice(12)))

  // And remounting the spliced image re-nibblizes the same bytes. This is the
  // `SAVE HELLO` then `LOAD HELLO` case across a remount: before the track
  // number was decoded as 7 bits the splice threw the sector away, the host
  // image kept the stale block, and the reloaded file came back as garbage -
  // which Applesoft reports as `?SYNTAX ERROR`.
  const { ds: remountDs, stream: remountStream } = mount800K(new Uint8Array(image))
  const reread = decodeFloppy35Track(
    remountStream, remountDs.trackStart[index], remountDs.trackNbits[index])
  const again = reread.find((s) => s.sector === decoded[0].sector)
  expect(again).toBeDefined()
  expect(Array.from(again!.data)).toEqual(Array.from(buffer.slice(12)))
})
