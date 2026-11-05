import { convertdsk2woz } from "../../common/convertdsk2woz"
import { crc32, ERROR_CODE, isHardDriveImage, isThreePointFiveInchImage } from "../../common/utility"
import { getCurrentMachineName } from "../memory"
import { FLOPPY35_BLOCK_BYTES, FLOPPY35_OPTIMAL_TIMING, getFloppy35PayloadInfo } from "./floppy35"
import { passErrorMsg } from "../worker2main"

let errorMsg: ErrorMsg | null = null

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
  const fluxBlockNumber = (diskData[67] << 8) + diskData[66]
  const fluxBlockSize = (diskData[69] << 8) + diskData[68]
  if (fluxBlockNumber > 0 && fluxBlockSize > 0) {
    errorMsg = { message: `Unable to load: ${driveState.filename} contains a FLUX chunk`, code: ERROR_CODE.ERROR }
    return false
  }
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
    // Apple IIgs 3.5" media: a raw 800K block image needs nibblizing. The
    // original bytes stay here for writeback; doSetEmuDriveNewData generates
    // the GCR stream the IWM reads. Only the slot-5 pair (indices 4/5) is that
    // drive: the same image in slot 7 is a SmartPort block volume and in slot 6
    // it is 5.25" media it cannot hold.
    if (!isWoz && getCurrentMachineName() === "APPLE2GS" &&
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
      (isWoz || fname.endsWith(".woz") || fname.endsWith(".dsk") || fname.endsWith(".do") || fname.endsWith(".po"))) {
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
