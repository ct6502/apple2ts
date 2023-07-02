import { convertdsk2woz } from "./convertdsk2woz"
import { replaceSuffix } from "./utility";

let crcTable = new Uint32Array(256).fill(0)

const makeCRCTable = () => {
  let c;
  for (let n =0; n < 256; n++) {
    c = n;
    for (let k =0; k < 8; k++) {
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
}

export const crc32 = (data: Uint8Array, offset = 0) => {
  if (crcTable[255] === 0) {
    makeCRCTable()
  }
  let crc = 0 ^ (-1);
  for (let i = offset; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
};

const decodeWoz2 = (driveState: DriveState, diskData: Uint8Array): boolean => {
  const woz2 = [0x57, 0x4F, 0x5A, 0x32, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz2 = woz2.find((value, i) => value !== diskData[i]) === undefined
  if (!isWoz2) return false
  driveState.isWriteProtected = diskData[22] === 1
  const crc = diskData.slice(8, 12)
  const storedCRC = crc[0] + (crc[1] << 8) + (crc[2] << 16) + crc[3] * (2 ** 24)
  const actualCRC = crc32(diskData, 12)
  if (storedCRC !== 0 && storedCRC !== actualCRC) {
    alert("CRC checksum error: " + driveState.filename)
    return false
  }
  for (let htrack=0; htrack < 80; htrack++) {
    const tmap_index = diskData[88 + htrack * 2]
    if (tmap_index < 255) {
      const tmap_offset = 256 + 8 * tmap_index
      const trk = diskData.slice(tmap_offset, tmap_offset + 8)
      driveState.trackStart[htrack] = 512*(trk[0] + (trk[1] << 8))
      // const nBlocks = trk[2] + (trk[3] << 8)
      driveState.trackNbits[htrack] = trk[4] + (trk[5] << 8) + (trk[6] << 16) + trk[7] * (2 ** 24)
    } else {
      driveState.trackStart[htrack] = 0
      driveState.trackNbits[htrack] = 51200
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
  for (let htrack=0; htrack < 80; htrack++) {
    const tmap_index = diskData[88 + htrack * 2]
    if (tmap_index < 255) {
      driveState.trackStart[htrack] = 256 + tmap_index * 6656
      const trk = diskData.slice(driveState.trackStart[htrack] + 6646,
        driveState.trackStart[htrack] + 6656)
      driveState.trackNbits[htrack] = trk[2] + (trk[3] << 8)
    } else {
      driveState.trackStart[htrack] = 0
      driveState.trackNbits[htrack] = 51200
    }
  }
  return true
}

const isDSK = (filename: String) => {
  const f = filename.toLowerCase()
  const isDSK = f.endsWith(".dsk") || f.endsWith(".do")
  const isPO = f.endsWith(".po")
  return isDSK || isPO
}

const decodeDSK = (driveState: DriveState, diskData: Uint8Array) => {
  let f = driveState.filename.toLowerCase()
  const isPO = f.endsWith(".po")
  const newData = convertdsk2woz(diskData, isPO)
  if (newData.length === 0) {
    return new Uint8Array()
  }
  driveState.filename = replaceSuffix(driveState.filename, 'woz')
  driveState.diskHasChanges = true
  return newData
}

const int32 = (data: Uint8Array) => {
  return data[0] + 256 * (data[1] + 256 * (data[2] + 256 * data[3]))
}

const decode2MG = (driveState: DriveState, diskData: Uint8Array): Uint8Array => {
//    const nblocks = int32(diskData.slice(0x14, 0x18))
  const offset = int32(diskData.slice(0x18, 0x1c))
  const nbytes = int32(diskData.slice(0x1c, 0x20))
  let magic = ''
  for (let i = 0; i < 4; i++) magic += String.fromCharCode(diskData[i]) 
  if (magic !== '2IMG') {
    console.error("Corrupt 2MG file.")
    return new Uint8Array()
  }
  if (diskData[12] !== 1) {
    console.error("Only ProDOS 2MG files are supported.")
    return new Uint8Array()
  }
  driveState.filename = replaceSuffix(driveState.filename, 'hdv')
  driveState.diskHasChanges = true
  return diskData.slice(offset, offset + nbytes)
}

export const isHardDriveImage = (filename: string) => {
  const f = filename.toLowerCase()
  return f.endsWith('.hdv') || f.endsWith('.po') || f.endsWith('.2mg')
}

export const decodeDiskData = (driveState: DriveState, diskData: Uint8Array): Uint8Array => {
  driveState.diskHasChanges = false
  const fname = driveState.filename.toLowerCase()
  if (isHardDriveImage(fname)) {
    driveState.hardDrive = true
    driveState.status = ''
    if (fname.endsWith('.hdv') || fname.endsWith('.po')) {
      return diskData
    }
    if (fname.endsWith('.2mg')) {
      return decode2MG(driveState, diskData)
    }
  }
  if (isDSK(driveState.filename)) {
    diskData = decodeDSK(driveState, diskData)
  }
  if (decodeWoz2(driveState, diskData)) {
    return diskData
  }
  if (decodeWoz1(driveState, diskData)) {
    return diskData
  }
  if (fname !== '') {
    console.error("Unknown disk format.")
  }
  return new Uint8Array()
}
