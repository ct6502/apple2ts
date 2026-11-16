import { convertdsk2woz } from "../../common/convertdsk2woz"
import { crc32, ERROR_CODE, FLUX_KIND, isHardDriveImage, isThreePointFiveInchImage } from "../../common/utility"
import { getMachineCapabilities } from "../../common/machine_profile"
import { getCurrentMachineName } from "../memory"
import { FLOPPY35_BLOCK_BYTES, FLOPPY35_OPTIMAL_TIMING, getFloppy35PayloadInfo } from "./floppy35"
import { passErrorMsg } from "../worker2main"
import { fluxLoopTicks, fluxTicksToCycles } from "./fluxtrack"

let errorMsg: ErrorMsg | null = null

// One flux track, before it is set on the drive.
type FluxTrack = {
  qtrtrack: number,
  start: number,
  end: number,
  revCycles: number,
  loopCycles: number,
}

// A WOZ 2.1 file with FLUX tracks. From INFO version 3 on, INFO bytes 66-67
// hold the FLUX chunk's block and bytes 68-69 the largest flux track in
// blocks. Earlier versions do not define those bytes.
const isWozFluxData = (diskData: Uint8Array) =>
  diskData.length > 69 &&
  String.fromCharCode(diskData[0], diskData[1], diskData[2], diskData[3]) === "WOZ2" &&
  String.fromCharCode(diskData[12], diskData[13], diskData[14], diskData[15]) === "INFO" &&
  diskData[20] >= 3 &&
  (diskData[67] << 8) + diskData[66] > 0 &&
  (diskData[69] << 8) + diskData[68] > 0

const decodeWoz2 = (driveState: DriveState, diskData: Uint8Array): boolean => {
  const woz2 = [0x57, 0x4F, 0x5A, 0x32, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz2 = woz2.find((value, i) => value !== diskData[i]) === undefined
  if (!isWoz2) return false
  driveState.isWriteProtected = diskData[22] === 1
  driveState.isSynchronized = diskData[23] === 1
  // WOZ2's INFO chunk is the first one (header 12 bytes + chunk header 8), and
  // its byte 1 is the disk type: 1 = 5.25", 2/3 = 3.5". Offset 61, which an
  // earlier version of this read, is the tail of the creator field and always
  // 0 - so a real 3.5" capture never reached the slot-5 media clock.
  // The declared optimal bit timing is in the same units for both families
  // (3.5 media declares 16 for a 2 us cell), and getNextByte advances by
  // optimalTiming/8 CPU cycles per bit, so it needs no family adjustment.
  driveState.is35 = diskData[21] === 2 || diskData[21] === 3
  driveState.blockMedia35 = false
  driveState.optimalTiming = (diskData[59] > 0) ? diskData[59]
    : (driveState.is35 ? FLOPPY35_OPTIMAL_TIMING : 32)
  // if (driveState.optimalTiming !== 32) {
  //   console.log(`${driveState.filename} optimal timing = ${driveState.optimalTiming}`)
  // }
  const crc = diskData.slice(8, 12)
  const storedCRC = crc[0] + (crc[1] << 8) + (crc[2] << 16) + crc[3] * (2 ** 24)
  const actualCRC = crc32(diskData, 12)
  if (storedCRC !== 0 && storedCRC !== actualCRC) {
    errorMsg = { message: `CRC checksum error: ${driveState.filename}`, code: ERROR_CODE.ERROR }
    return false
  }
  for (let qtrtrack = 0; qtrtrack < 160; qtrtrack++) {
    const tmap_index = diskData[88 + qtrtrack]
    if (tmap_index < 255) {
      const tmap_offset = 256 + 8 * tmap_index
      const trk = diskData.slice(tmap_offset, tmap_offset + 8)
      driveState.trackStart[qtrtrack] = 512 * ((trk[1] << 8) + trk[0])
      // const nBlocks = trk[2] + (trk[3] << 8)
      driveState.trackNbits[qtrtrack] = trk[4] + (trk[5] << 8) + (trk[6] << 16) + trk[7] * (2 ** 24)
      driveState.maxQuarterTrack = qtrtrack
    }
  }
  // As AppleWin does, we ignore a FLUX chunk that we cannot play, and the
  // file plays its TMAP bit tracks.
  if (isWozFluxData(diskData) && !decodeWozFlux(driveState, diskData)) {
    console.warn(`[WOZ FLUX] ${errorMsg?.message}`)
    errorMsg = null
  }
  return true
}

// WOZ 2.1 FLUX tracks. The FLUX chunk maps a quarter track to a TRKS entry
// whose data is flux rather than bits: bytes of 125 ns ticks, where 255 means
// "add it and keep reading", and the entry's bit count is its byte count. A
// flux track wins over the TMAP entry at the same quarter track. We set
// nothing on the drive unless every flux track is good.
const decodeWozFlux = (driveState: DriveState, diskData: Uint8Array): boolean => {
  const WOZ_FLUX_PS_PER_TICK = 125000
  const ignore = (reason: string) => {
    errorMsg = {
      message: `${driveState.filename}: FLUX chunk ignored (${reason}), using TMAP`,
      code: ERROR_CODE.WARNING,
    }
    return false
  }
  if (diskData[21] !== 1) return ignore("flux tracks on a 3.5\" disk cannot be played")
  const chunk = 512 * ((diskData[67] << 8) + diskData[66])
  const id = String.fromCharCode(diskData[chunk], diskData[chunk + 1], diskData[chunk + 2], diskData[chunk + 3])
  if (chunk + 8 + 160 > diskData.length || id !== "FLUX") return ignore("no FLUX chunk at its INFO block")
  const tracks: FluxTrack[] = []
  for (let qtrtrack = 0; qtrtrack < 160; qtrtrack++) {
    const trksIndex = diskData[chunk + 8 + qtrtrack]
    if (trksIndex === 255) continue
    const track = qtrtrack / 4
    if (trksIndex >= 160) return ignore(`flux track ${track} has a TRKS index past the table`)
    const trk = 256 + 8 * trksIndex
    const start = 512 * ((diskData[trk + 1] << 8) + diskData[trk])
    const byteCount = diskData[trk + 4] + (diskData[trk + 5] << 8) + (diskData[trk + 6] << 16) + diskData[trk + 7] * (2 ** 24)
    if (byteCount === 0) return ignore(`flux track ${track} is empty`)
    if (start === 0 || start + byteCount > diskData.length) {
      return ignore(`flux track ${track} runs past the end of the file`)
    }
    if (diskData[start + byteCount - 1] === 255) return ignore(`flux track ${track} ends inside an interval`)
    const loopTicks = fluxLoopTicks(diskData, start, start + byteCount)
    if (loopTicks === 0) return ignore(`flux track ${track} has no flux time`)
    const loopCycles = fluxTicksToCycles(loopTicks, WOZ_FLUX_PS_PER_TICK)
    // A WOZ flux track holds exactly one revolution.
    tracks.push({
      qtrtrack,
      start,
      end: start + byteCount,
      revCycles: loopCycles,
      loopCycles,
    })
  }
  if (tracks.length === 0) return true
  driveState.fluxLapStart = Array<number>(160).fill(0)
  driveState.fluxLapEnd = Array<number>(160).fill(0)
  driveState.fluxRevCycles = Array<number>(160).fill(0)
  driveState.fluxLoopCycles = Array<number>(160).fill(0)
  for (const track of tracks) {
    driveState.fluxLapStart[track.qtrtrack] = track.start
    driveState.fluxLapEnd[track.qtrtrack] = track.end
    driveState.fluxRevCycles[track.qtrtrack] = track.revCycles
    driveState.fluxLoopCycles[track.qtrtrack] = track.loopCycles
    driveState.maxQuarterTrack = Math.max(driveState.maxQuarterTrack, track.qtrtrack)
  }
  driveState.fluxKind = FLUX_KIND.WOZ
  driveState.fluxPsPerTick = WOZ_FLUX_PS_PER_TICK
  // We cannot write to flux tracks, so the disk is always write protected.
  driveState.isWriteProtected = true
  return true
}

const decodeWoz1 = (driveState: DriveState, diskData: Uint8Array): boolean => {
  const woz1 = [0x57, 0x4F, 0x5A, 0x31, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz1 = woz1.find((value, i) => value !== diskData[i]) === undefined
  if (!isWoz1) {
    return false
  }
  driveState.isWriteProtected = diskData[22] === 1
  driveState.is35 = false
  driveState.blockMedia35 = false
  for (let qtrtrack=0; qtrtrack < 160; qtrtrack++) {
    const tmap_index = diskData[88 + qtrtrack]
    if (tmap_index < 255) {
      driveState.trackStart[qtrtrack] = 256 + tmap_index * 6656
      const trk = diskData.slice(driveState.trackStart[qtrtrack] + 6646,
        driveState.trackStart[qtrtrack] + 6656)
      driveState.trackNbits[qtrtrack] = trk[2] + (trk[3] << 8)
      driveState.maxQuarterTrack = qtrtrack
    }
  }
  return true
}

// A2R3 flux captures of 5.25" disks play straight from the file, read only.
//
// We walk the chunks from offset 8 by their sizes. Every RWCP chunk must have
// the same resolution, since one tick length plays every capture, and we
// refuse a hard-sectored disk, whose index marks come once per sector hole
// and so do not give a revolution. Each captured location loops between the
// first and last index marks of its capture, so the seam of the loop is at an
// index mark. When the head seeks, we keep its angle as a fraction of one
// revolution, from mark 0 to mark 1. A location captured more than once plays
// the capture with the most index marks, or the first one in the file on a
// tie. A location with no capture is an empty track (trackStart 0), like a
// WOZ track with no TMAP entry.
const A2R3_MAGIC = [0x41, 0x32, 0x52, 0x33, 0xFF, 0x0A, 0x0D, 0x0A]

const readLittleEndian16 = (data: Uint8Array, offset: number) => data[offset] | (data[offset + 1] << 8)

const readLittleEndian32 = (data: Uint8Array, offset: number) =>
  data[offset] + (data[offset + 1] << 8) + (data[offset + 2] << 16) + data[offset + 3] * (2 ** 24)

type A2R3Capture = {
  location: number,
  indexMarks: number[],
  dataOffset: number,
  dataSize: number,
}

export const decodeA2R3 = (driveState: DriveState, diskData: Uint8Array): boolean => {
  const isA2R3 = A2R3_MAGIC.find((value, i) => value !== diskData[i]) === undefined
  if (!isA2R3) return false
  const refuse = (reason: string) => {
    errorMsg = { message: `Unable to load: ${driveState.filename}: ${reason}`, code: ERROR_CODE.ERROR }
    return false
  }
  let driveType = -1
  let resolution = -1
  const chosen: Array<A2R3Capture | undefined> = new Array(160)
  let ptr = 8
  while (ptr + 8 <= diskData.length) {
    const id = String.fromCharCode(diskData[ptr], diskData[ptr + 1], diskData[ptr + 2], diskData[ptr + 3])
    const size = readLittleEndian32(diskData, ptr + 4)
    const body = ptr + 8
    if (body + size > diskData.length) return refuse(`the ${id} chunk runs past the end of the file`)
    if (id === "INFO") {
      if (size < 34) return refuse("the INFO chunk is too short")
      driveType = diskData[body + 33]
      // A hard-sectored disk gives an index mark for every sector hole, so
      // its marks do not give a revolution.
      if (size >= 37 && diskData[body + 36] !== 0) return refuse("hard-sectored A2R3 captures are not supported")
    } else if (id === "RWCP") {
      if (size < 16) return refuse("the RWCP chunk is too short")
      const chunkResolution = readLittleEndian32(diskData, body + 1)
      if (chunkResolution === 0) return refuse("a resolution of 0")
      // One resolution plays every capture.
      if (resolution > 0 && chunkResolution !== resolution) {
        return refuse("its RWCP chunks have different resolutions")
      }
      resolution = chunkResolution
      const end = body + size
      // The capture records, each a 'C', end with an 'X'.
      let record = body + 16
      while (record < end && diskData[record] !== 0x58) {
        if (diskData[record] !== 0x43) return refuse("a capture record that is not 'C' or 'X'")
        if (record + 5 > end) return refuse("a capture record runs past its chunk")
        const captureType = diskData[record + 1]
        const location = readLittleEndian16(diskData, record + 2)
        const markCount = diskData[record + 4]
        if (record + 9 + 4 * markCount > end) return refuse("a capture record runs past its chunk")
        const indexMarks: number[] = []
        for (let i = 0; i < markCount; i++) {
          indexMarks.push(readLittleEndian32(diskData, record + 5 + 4 * i))
        }
        const dataSize = readLittleEndian32(diskData, record + 5 + 4 * markCount)
        const dataOffset = record + 9 + 4 * markCount
        if (dataOffset + dataSize > end) return refuse("a capture's data runs past its chunk")
        if (location >= 160) return refuse(`a location past quarter track 159 (${location})`)
        // Type 2 is a bit-stream capture, not flux timing, so we skip it.
        if (captureType !== 2) {
          const previous = chosen[location]
          if (!previous || markCount > previous.indexMarks.length) {
            chosen[location] = {
              location,
              indexMarks,
              dataOffset,
              dataSize,
            }
          }
        }
        record = dataOffset + dataSize
      }
      if (record >= end) return refuse("the capture records do not end in 'X'")
    }
    ptr = body + size
  }
  if (driveType !== 1) return refuse("not a 5.25\" A2R3 (INFO drive type)")
  if (resolution <= 0) return refuse("no RWCP chunk")

  // We build every track first, and set them on the drive only when every
  // capture is good.
  const tracks: FluxTrack[] = []
  for (let qtrtrack = 0; qtrtrack < 160; qtrtrack++) {
    const capture = chosen[qtrtrack]
    if (!capture) continue
    const markCount = capture.indexMarks.length
    if (markCount < 2) return refuse(`quarter track ${qtrtrack}: fewer than 2 index marks, no whole lap`)
    // One walk over the capture finds the first byte of each interval that
    // holds the first, the second and the last index mark.
    const marks = [capture.indexMarks[0], capture.indexMarks[1], capture.indexMarks[markCount - 1]]
    const markBytes = [0, 0, 0]
    let found = 0
    let ticks = 0
    let intervalByte = 0
    for (let i = 0; i < capture.dataSize && found < 3; i++) {
      const value = diskData[capture.dataOffset + i]
      ticks += value
      if (value === 255) continue
      while (found < 3 && marks[found] < ticks) markBytes[found++] = intervalByte
      intervalByte = i + 1
    }
    if (found < 3) return refuse(`quarter track ${qtrtrack}: an index mark past the end of its data`)
    if (markBytes[1] <= markBytes[0] || markBytes[2] <= markBytes[0]) {
      return refuse(`quarter track ${qtrtrack}: index marks that do not make a lap`)
    }
    const start = capture.dataOffset + markBytes[0]
    const end = capture.dataOffset + markBytes[2]
    const loopTicks = fluxLoopTicks(diskData, start, end)
    const revTicks = capture.indexMarks[1] - capture.indexMarks[0]
    if (loopTicks <= 0 || revTicks <= 0) return refuse(`quarter track ${qtrtrack}: an empty lap`)
    const loopCycles = fluxTicksToCycles(loopTicks, resolution)
    tracks.push({
      qtrtrack,
      start,
      end,
      revCycles: Math.min(fluxTicksToCycles(revTicks, resolution), loopCycles),
      loopCycles,
    })
  }
  if (tracks.length === 0) return refuse("no captures at all")
  driveState.fluxLapStart = Array<number>(160).fill(0)
  driveState.fluxLapEnd = Array<number>(160).fill(0)
  driveState.fluxRevCycles = Array<number>(160).fill(0)
  driveState.fluxLoopCycles = Array<number>(160).fill(0)
  for (const track of tracks) {
    driveState.fluxLapStart[track.qtrtrack] = track.start
    driveState.fluxLapEnd[track.qtrtrack] = track.end
    driveState.fluxRevCycles[track.qtrtrack] = track.revCycles
    driveState.fluxLoopCycles[track.qtrtrack] = track.loopCycles
    driveState.maxQuarterTrack = Math.max(driveState.maxQuarterTrack, track.qtrtrack)
  }
  driveState.fluxKind = FLUX_KIND.A2R3
  driveState.fluxPsPerTick = resolution
  driveState.isWriteProtected = true
  driveState.isSynchronized = false
  return true
}

// const isDSK = (filename: string) => {
//   const f = filename.toLowerCase()
//   const isDSK = f.endsWith(".dsk") || f.endsWith(".do")
//   const isPO = f.endsWith(".po")
//   return isDSK || isPO
// }

const decodeDSK = (driveState: DriveState, diskData: Uint8Array) => {
  const f = driveState.filename.toLowerCase()
  const isPO = f.endsWith(".po")
  const newData = convertdsk2woz(diskData, isPO)
  if (newData.length === 0) {
    return new Uint8Array()
  }
  return newData
}

export const decodeDiskData = (
  driveState: DriveState,
  diskData: Uint8Array,
  enforceDriveKind = false,
): Uint8Array => {
  driveState.diskHasChanges = false
  errorMsg = null
  const fname = driveState.filename.toLowerCase()
  const isWoz = diskData.length >= 4 && diskData[0] === 0x57 && diskData[1] === 0x4F && diskData[2] === 0x5A
  if (diskData.length > 10000) {
    // An A2R3 capture plays from the file itself. Like a WOZ, it is never
    // forced into a SmartPort drive.
    const isA2R3 = A2R3_MAGIC.find((value, i) => value !== diskData[i]) === undefined
    if (isA2R3 && enforceDriveKind && driveState.hardDrive) {
      return new Uint8Array()
    }
    if (decodeA2R3(driveState, diskData)) {
      return diskData
    }
    if (errorMsg !== null) {
      passErrorMsg(errorMsg)
      return new Uint8Array()
    }
    // Apple IIgs 3.5" media: a raw 800K block image needs nibblizing. The
    // original bytes stay here for writeback; doSetEmuDriveNewData generates
    // the GCR stream the IWM reads. Only the slot-5 pair (indices 4/5) is that
    // drive: the same image in slot 7 is a SmartPort block volume and in slot 6
    // it is 5.25" media it cannot hold.
    if (!isWoz && getMachineCapabilities(getCurrentMachineName()).hasThreeInchBay &&
      driveState.index >= 4 && driveState.index <= 5 &&
      isThreePointFiveInchImage(fname, diskData.length)) {
      const { size } = getFloppy35PayloadInfo(diskData)
      if (size !== FLOPPY35_BLOCK_BYTES) {
        errorMsg = { message: `Unknown format or unable to decode: ${driveState.filename}`, code: ERROR_CODE.ERROR }
        passErrorMsg(errorMsg)
        return new Uint8Array()
      }
      driveState.is35 = true
      driveState.blockMedia35 = true
      driveState.optimalTiming = FLOPPY35_OPTIMAL_TIMING
      driveState.maxQuarterTrack = 159
      // The head starts at track 0 and the drive panel labels a loaded floppy
      // by its track, so an empty status reads as "this bay is dead".
      driveState.status = " Trk 0"
      return diskData
    }
    // A block image mounted in a slot-7 bay is a SmartPort volume, including an
    // 800 KB one that would be 3.5" media in slot 5.
    if (!isWoz && (driveState.hardDrive || isHardDriveImage(fname, diskData?.length)) &&
      (isHardDriveImage(fname, diskData?.length) || isThreePointFiveInchImage(fname, diskData.length))) {
      if (enforceDriveKind && !driveState.hardDrive) {
        return new Uint8Array()
      }
      driveState.hardDrive = true
      driveState.is35 = false
      driveState.blockMedia35 = false
      driveState.status = ""
      return diskData
    }
    if (enforceDriveKind && driveState.hardDrive &&
      (isWoz || fname.endsWith(".woz") || fname.endsWith(".a2r") || fname.endsWith(".dsk") || fname.endsWith(".do") || fname.endsWith(".po"))) {
      return new Uint8Array()
    }
    // We might have a DSK file that has already been renamed as a WOZ
    // but is still in DSK format. So double check the disk data length.
    if (diskData.length === 143360) {
      diskData = decodeDSK(driveState, diskData)
    }
    if (decodeWoz2(driveState, diskData)) {
      return diskData
    }
    if (decodeWoz1(driveState, diskData)) {
      return diskData
    }
  }
  if (fname !== "") {
    if (errorMsg === null) {
      errorMsg = { message: `Unknown format or unable to decode: ${driveState.filename}`, code: ERROR_CODE.ERROR }
    }
    passErrorMsg(errorMsg)
  }
  return new Uint8Array()
}
