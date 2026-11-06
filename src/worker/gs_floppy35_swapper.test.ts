import {
  decodeFloppy35Track,
  encodeSector62,
  floppy35SectorOffset,
  getFloppy35PayloadInfo,
} from "./devices/floppy35"
import {
  doSetEmuDriveNewData,
  getDriveBitstreamByIndex,
  getDriveDataByIndex,
  getDriveStateByIndex,
} from "./devices/drivestate"
import { doSetMachineName } from "./motherboard"
import { iigsSetIwmEnable35, memGet24, memSet24 } from "./memory"
import { iwmResetTiming } from "./devices/diskdata"
import { s6502 } from "./instructions"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// The standby disk swapper hands a running drive new media (`swapStandbyDisk`
// posts `passSetDriveNewData(props, true)`), so the mount path - not a boot -
// is what has to make sense of it. Two things can go wrong that a single-disk
// test cannot see: the GCR stream left over from the outgoing volume, and the
// write burst the IWM was still clocking when the disk was pulled.
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

const mount35 = (diskData: Uint8Array, filename: string) => {
  // Only the media changes - the way the swapper posts it, with the machine
  // already running. Resetting the machine here would wipe the IWM state the
  // second test is about.
  expect(doSetEmuDriveNewData({
    index: 4, hardDrive: false, drive: 1, filename, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData, lastAppleWriteTime: 0, cloudData: null,
    writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps, true)).toBe(true)
}

// Every decoded field of one track-side has to carry the block image's bytes.
const expectTrackMatchesImage = (image: Uint8Array, headerOffset: number, trackSide: number) => {
  const ds = getDriveStateByIndex(4)
  const stream = getDriveBitstreamByIndex(4)
  const sectors = decodeFloppy35Track(
    stream, ds.trackStart[trackSide], ds.trackNbits[trackSide])
  expect(sectors.length).toBeGreaterThan(0)
  for (const sector of sectors) {
    const block = floppy35SectorOffset(trackSide >> 1, sector.sector, trackSide & 1)
    const at = headerOffset + block * 512
    expect(Array.from(sector.data)).toEqual(Array.from(
      image.subarray(at, at + 512)))
  }
}

test("swapping the disk in a slot-5 bay replays the GCR stream of the disk that arrived", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  mount35(data, "Disk 1.2mg")
  expect(getDriveStateByIndex(4).is35).toBe(true)

  // Disk 2 of the same group: block 0 holds something different.
  const second = new Uint8Array(data)
  for (let i = 0; i < 512; i++) second[info.offset + i] = (i * 31 + 7) & 0xFF
  mount35(second, "Disk 2.2mg")

  const ds = getDriveStateByIndex(4)
  expect(ds.filename).toBe("Disk 2.2mg")
  expect(ds.is35).toBe(true)
  expect(ds.blockMedia35).toBe(true)
  // The head is where the swapper left it, but the media underneath it is new.
  expectTrackMatchesImage(second, info.offset, 0)
  expectTrackMatchesImage(second, info.offset, 1)
  expect(ds.diskHasChanges).toBe(false)
})

test("a write burst still in flight cannot edit the disk swapped in behind it", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")
  const data = new Uint8Array(fs.readFileSync(DISK_PATH))
  const info = getFloppy35PayloadInfo(data)
  mount35(data, "Disk 1.2mg")

  const ds = getDriveStateByIndex(4)
  const stream = getDriveBitstreamByIndex(4)
  const trackStartBit = ds.trackStart[0] * 8
  const trackEndBit = trackStartBit + ds.trackNbits[0]
  const addressBit = findBitPattern(stream, trackStartBit, trackEndBit, [0xD5, 0xAA, 0x96])
  const dataBit = findBitPattern(stream, addressBit + 11 * 8, trackEndBit, [0xD5, 0xAA, 0xAD])
  expect(dataBit).toBeGreaterThanOrEqual(0)
  const sectorNibble = readByteAt(stream, dataBit + 24)

  const buffer = new Uint8Array(524)
  for (let i = 12; i < 524; i++) buffer[i] = (i * 7 + 3) & 0xFF
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
    s6502.cycleCount += 4
    memSet24(0xC0ED, byte)
  }
  // Stop here: the epilogue byte is still sitting in the IWM's write buffer, so
  // the burst has not been clocked out and its track has not been spliced.
  // That is the state a user's swap click lands in.
  expect(handshake() & 0x40).not.toBe(0)

  const second = new Uint8Array(data)
  for (let i = 0; i < 512; i++) second[info.offset + i] = (i * 31 + 7) & 0xFF
  const pristine = new Uint8Array(second)
  mount35(second, "Disk 2.2mg")

  // The guest comes back to the new disk and lets the spindle turn.
  const ds2 = getDriveStateByIndex(4)
  ds2.spindleOn = true
  ds2.trackLocation = dataBit - trackStartBit
  const freshStream = getDriveBitstreamByIndex(4).slice()
  let guard = 0
  while ((handshake() & 0x40) !== 0 && guard++ < 200) s6502.cycleCount += 6
  s6502.cycleCount += 600
  handshake()

  // Not one bit of the outgoing disk's field may be clocked onto the media that
  // arrived: the IWM still held a byte, and the LSS would otherwise put it on
  // the new track under the same head position.
  const swappedStream = getDriveBitstreamByIndex(4)
  expect(Array.from(swappedStream.slice(ds2.trackStart[0], ds2.trackStart[0] + ds2.trackNbits[0] / 8)))
    .toEqual(Array.from(freshStream.slice(ds2.trackStart[0], ds2.trackStart[0] + ds2.trackNbits[0] / 8)))
  // And its dirty track must not be spliced against the new stream either - that
  // would mark a disk the guest never wrote as modified, and the swapper would
  // offer to save a changed Disk 2 that arrived clean.
  expect(Array.from(getDriveDataByIndex(4))).toEqual(Array.from(pristine))
  expect(ds2.diskHasChanges).toBe(false)
  expectTrackMatchesImage(pristine, info.offset, 0)
})
