export type WozSectorCandidateLabel =
  "prodos-physical-to-logical" |
  "dos-physical-to-logical" |
  "prodos-logical-to-physical" |
  "dos-logical-to-physical"

export type WozSectorCandidates = {
  candidates: Array<{ label: WozSectorCandidateLabel, data: Uint8Array }>
  decodedSectorCount: number
}

const six_and_two_decode = (() => {
  const table = new Int16Array(256)
  table.fill(-1)
  const six_and_two_mapping = [
    0x96, 0x97, 0x9A, 0x9B, 0x9D, 0x9E, 0x9F, 0xA6,
    0xA7, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB2, 0xB3,
    0xB4, 0xB5, 0xB6, 0xB7, 0xB9, 0xBA, 0xBB, 0xBC,
    0xBD, 0xBE, 0xBF, 0xCB, 0xCD, 0xCE, 0xCF, 0xD3,
    0xD6, 0xD7, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE,
    0xDF, 0xE5, 0xE6, 0xE7, 0xE9, 0xEA, 0xEB, 0xEC,
    0xED, 0xEE, 0xEF, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6,
    0xF7, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF
  ]
  for (let i = 0; i < six_and_two_mapping.length; i++) {
    table[six_and_two_mapping[i]] = i
  }
  return table
})()

const decode_4_and_4 = (first: number, second: number) => {
  return (((first & 0x55) << 1) | (second & 0x55)) & 0xFF
}

const decode_6_and_2 = (src: Uint8Array) => {
  if (src.length !== 343) return null

  const dest = new Uint8Array(343)
  for (let c = 0; c < 343; c++) {
    const value = six_and_two_decode[src[c]]
    if (value < 0) return null
    dest[c] = value
  }

  for (let c = 1; c < 342; c++) {
    dest[c] ^= dest[c - 1]
  }
  if (dest[342] !== dest[341]) return null

  const out = new Uint8Array(256)
  const bit_reverse = [0, 2, 1, 3]
  for (let c = 0; c < 84; c++) {
    out[c] = (dest[86 + c] << 2) | bit_reverse[dest[c] & 3]
    out[c + 86] = (dest[86 + c + 86] << 2) | bit_reverse[(dest[c] >> 2) & 3]
    out[c + 172] = (dest[86 + c + 172] << 2) | bit_reverse[(dest[c] >> 4) & 3]
  }
  out[84] = (dest[86 + 84] << 2) | bit_reverse[dest[84] & 3]
  out[170] = (dest[86 + 170] << 2) | bit_reverse[(dest[84] >> 2) & 3]
  out[85] = (dest[86 + 85] << 2) | bit_reverse[dest[85] & 3]
  out[171] = (dest[86 + 171] << 2) | bit_reverse[(dest[85] >> 2) & 3]

  return out
}

const getBit = (bits: Uint8Array, bitPosition: number, bitCount: number) => {
  const wrapped = ((bitPosition % bitCount) + bitCount) % bitCount
  const bytePosition = wrapped >> 3
  const shift = 7 - (wrapped & 7)
  return (bits[bytePosition] >> shift) & 1
}

const getByteAtBit = (bits: Uint8Array, bitPosition: number, bitCount: number) => {
  let value = 0
  for (let c = 0; c < 8; c++) {
    value = (value << 1) | getBit(bits, bitPosition + c, bitCount)
  }
  return value
}

const getNibbleAtBit = (bits: Uint8Array, bitPosition: number, bitCount: number) => {
  let value = 0
  for (let c = 0; c < 10; c++) {
    value = (value << 1) | getBit(bits, bitPosition + c, bitCount)
    if (value & 0x80) return { value, nextBitPosition: bitPosition + c + 1 }
  }
  return undefined
}

const findNibbleSequence = (
  bits: Uint8Array,
  bitPosition: number,
  bitCount: number,
  values: number[],
  maximumNibbles: number,
) => {
  const seen: number[] = []
  for (let c = 0; c < maximumNibbles; c++) {
    const nibble = getNibbleAtBit(bits, bitPosition, bitCount)
    if (!nibble) return undefined
    bitPosition = nibble.nextBitPosition
    seen.push(nibble.value)
    if (seen.length > values.length) seen.shift()
    if (seen.length === values.length && seen.every((value, index) => value === values[index])) {
      return bitPosition
    }
  }
  return undefined
}

const matchesBytesAtBit = (bits: Uint8Array, bitPosition: number, bitCount: number, values: number[]) =>
  values.every((value, index) => getByteAtBit(bits, bitPosition + (index * 8), bitCount) === value)

const readLittleEndian16 = (data: Uint8Array, offset: number) => data[offset] | (data[offset + 1] << 8)

const readLittleEndian32 = (data: Uint8Array, offset: number) =>
  data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16) | data[offset + 3] * (2 ** 24)

type WozTrackBits = {
  bits: Uint8Array
  bitCount: number
}

const getWozTracks = (wozData: Uint8Array): Array<WozTrackBits | undefined> | undefined => {
  if (wozData.length < 256) return undefined
  const sig = String.fromCharCode(wozData[0], wozData[1], wozData[2], wozData[3])
  if (sig !== "WOZ1" && sig !== "WOZ2") return undefined

  let tmapOffset = -1
  let trksOffset = -1
  let ptr = 12
  while (ptr + 8 <= wozData.length) {
    const id = String.fromCharCode(wozData[ptr], wozData[ptr + 1], wozData[ptr + 2], wozData[ptr + 3])
    const size = readLittleEndian32(wozData, ptr + 4)
    const dataOffset = ptr + 8
    if (dataOffset + size > wozData.length) break
    if (id === "TMAP") tmapOffset = dataOffset
    if (id === "TRKS") trksOffset = dataOffset
    ptr = dataOffset + size
  }

  if (tmapOffset < 0 || trksOffset < 0) return undefined
  const tracks: Array<WozTrackBits | undefined> = new Array(160)

  for (let q = 0; q < 160; q++) {
    const tmapIndex = wozData[tmapOffset + q]
    if (tmapIndex === undefined || tmapIndex >= 0xFF) continue

    if (sig === "WOZ2") {
      const meta = trksOffset + (tmapIndex * 8)
      if (meta + 8 > wozData.length) continue
      const startBlock = readLittleEndian16(wozData, meta)
      const blockCount = readLittleEndian16(wozData, meta + 2)
      const bitCount = readLittleEndian32(wozData, meta + 4)
      const start = startBlock * 512
      const byteCount = Math.max(1, Math.ceil(bitCount / 8))
      if (blockCount <= 0 || bitCount <= 0 || start + byteCount > wozData.length) continue
      tracks[q] = { bits: wozData.slice(start, start + byteCount), bitCount }
    } else {
      const start = trksOffset + (tmapIndex * 6656)
      if (start + 6656 > wozData.length) continue
      const bitCount = readLittleEndian16(wozData, start + 6648)
      const byteCount = Math.max(1, Math.ceil(bitCount / 8))
      if (bitCount <= 0 || start + byteCount > wozData.length) continue
      tracks[q] = { bits: wozData.slice(start, start + byteCount), bitCount }
    }
  }

  return tracks
}


const DOS_PHYSICAL_TO_LOGICAL = [0, 13, 11, 9, 7, 5, 3, 1, 14, 12, 10, 8, 6, 4, 2, 15]
const PRODOS_PHYSICAL_TO_LOGICAL = [0, 2, 4, 6, 8, 10, 12, 14, 1, 3, 5, 7, 9, 11, 13, 15]
const DOS_LOGICAL_TO_PHYSICAL = [0, 7, 14, 6, 13, 5, 12, 4, 11, 3, 10, 2, 9, 1, 8, 15]
const PRODOS_LOGICAL_TO_PHYSICAL = [0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15]

type DecodedWozSector = {
  track: number
  sector: number
  data: Uint8Array
}

const MAX_DATA_PROLOGUE_NIBBLES = 20

const decodeWozTrackSectors = (wozTrack: Uint8Array, bitCount: number) => {
  const sectors: DecodedWozSector[] = []
  const seenSectors = new Set<string>()

  for (let bitPosition = 0; bitPosition < bitCount; bitPosition++) {
    const first = getByteAtBit(wozTrack, bitPosition, bitCount)
    const second = getByteAtBit(wozTrack, bitPosition + 8, bitCount)
    const third = getByteAtBit(wozTrack, bitPosition + 16, bitCount)

    if (first === 0xD5 && second === 0xAA && third === 0x96) {
      const volume = decode_4_and_4(
        getByteAtBit(wozTrack, bitPosition + 24, bitCount),
        getByteAtBit(wozTrack, bitPosition + 32, bitCount),
      )
      const track = decode_4_and_4(
        getByteAtBit(wozTrack, bitPosition + 40, bitCount),
        getByteAtBit(wozTrack, bitPosition + 48, bitCount),
      )
      const sector = decode_4_and_4(
        getByteAtBit(wozTrack, bitPosition + 56, bitCount),
        getByteAtBit(wozTrack, bitPosition + 64, bitCount),
      )
      const checksum = decode_4_and_4(
        getByteAtBit(wozTrack, bitPosition + 72, bitCount),
        getByteAtBit(wozTrack, bitPosition + 80, bitCount),
      )
      const addressEpilogue = matchesBytesAtBit(wozTrack, bitPosition + 88, bitCount, [0xDE, 0xAA, 0xEB])
      if (((volume ^ track ^ sector) & 0xFF) === checksum && addressEpilogue && sector >= 0 && sector < 16) {
        let dataBitPosition = findNibbleSequence(
          wozTrack,
          bitPosition + 112,
          bitCount,
          [0xD5, 0xAA, 0xAD],
          MAX_DATA_PROLOGUE_NIBBLES,
        )
        if (!dataBitPosition) continue

        const encodedSector = new Uint8Array(343)
        for (let c = 0; c < encodedSector.length; c++) {
          const nibble = getNibbleAtBit(wozTrack, dataBitPosition, bitCount)
          if (!nibble) break
          encodedSector[c] = nibble.value
          dataBitPosition = nibble.nextBitPosition
        }
        if (encodedSector.includes(0)) continue
        if (!findNibbleSequence(wozTrack, dataBitPosition, bitCount, [0xDE, 0xAA], 2)) continue

        const decodedSector = decode_6_and_2(encodedSector)
        if (!decodedSector) continue
        const key = `${track}:${sector}`
        if (seenSectors.has(key)) continue

        sectors.push({ track, sector, data: decodedSector })
        seenSectors.add(key)
      }
      continue
    }
  }

  return sectors
}

export const decodeWozToSectorCandidates = (wozData: Uint8Array): WozSectorCandidates | undefined => {
  const tracks = getWozTracks(wozData)
  if (!tracks) return undefined

  const candidates = [
    { label: "prodos-physical-to-logical", data: new Uint8Array(35 * 16 * 256), map: PRODOS_PHYSICAL_TO_LOGICAL },
    { label: "dos-physical-to-logical", data: new Uint8Array(35 * 16 * 256), map: DOS_PHYSICAL_TO_LOGICAL },
    { label: "prodos-logical-to-physical", data: new Uint8Array(35 * 16 * 256), map: PRODOS_LOGICAL_TO_PHYSICAL },
    { label: "dos-logical-to-physical", data: new Uint8Array(35 * 16 * 256), map: DOS_LOGICAL_TO_PHYSICAL },
  ] as const
  let decodedSectorCount = 0
  const seen = new Set<string>()

  for (let q = 0; q < tracks.length; q++) {
    const track = tracks[q]
    if (!track || track.bitCount < 5000) continue
    for (const sector of decodeWozTrackSectors(track.bits, track.bitCount)) {
      if (sector.track < 0 || sector.track >= 35 || sector.sector < 0 || sector.sector >= 16) continue
      const key = `${sector.track}:${sector.sector}`
      if (seen.has(key)) continue
      seen.add(key)
      decodedSectorCount++
      for (const candidate of candidates) {
        const mappedSector = candidate.map[sector.sector]
        candidate.data.set(sector.data, ((sector.track * 16) + mappedSector) * 256)
      }
    }
  }

  if (decodedSectorCount === 0) return undefined
  return {
    candidates: candidates.map(({ label, data }) => ({ label, data })),
    decodedSectorCount,
  }
}

export const convertwoz2dsk = (wozData: Uint8Array, isPO: boolean) => {
  const decoded = decodeWozToSectorCandidates(wozData)
  if (!decoded) return new Uint8Array()
  const label = isPO ? "prodos-logical-to-physical" : "dos-logical-to-physical"
  return decoded.candidates.find(candidate => candidate.label === label)?.data ?? new Uint8Array()
}