// Code converted from the C code library available at:
// https://github.com/mr-stivo/dsk2woz2
//
import { toASCII, uint16toBytes, uint32toBytes } from "./utility"

/**
  Appends a byte to a woz at a supplied position: number, returning the
  position immediately after the byte.
  @param woz The woz to write into.
  @param position The position to write at.
  @param value The byte to write.
  @returns The position immediately after the byte.
*/
const write_byte = (woz: Uint8Array, position: number, value: number) => {
  const shift = position & 7
  const byte_position = position >>> 3
  woz[byte_position] |= value >>> shift
  if (shift) woz[byte_position+1] |= value << (8 - shift)
  return position + 8;
}

/**
  Encodes a byte into Apple 4-and-4 format and appends it to a woz.
  @param woz The woz to write into.
  @param position The position to write at.
  @param value The byte to encode and write.
  @returns The position immediately after the encoded byte.
*/
const write_4_and_4 = (woz: Uint8Array, position: number, value: number) => {
  position = write_byte(woz, position, (value >>> 1) | 0xAA);
  position = write_byte(woz, position, value | 0xAA);
  return position;
}

/**
  Appends a 6-and-2-style 10-bit sync word to a woz.
  @param woz The woz to write into.
  @param position The position to write at.
  @returns The position immediately after the sync word.
*/
const write_sync = (woz: Uint8Array, position: number) => {
  position = write_byte(woz, position, 0xFF);
  // Skip two bits, i.e. leave them as 0s
  return position + 2
}

/*!
  Converts a 256-byte source woz into the 343 byte values that
  contain the Apple 6-and-2 encoding of that woz.
  @param dest The at-least-343 byte woz to which the encoded sector is written.
  @param src The 256-byte source data.
*/
const encode_6_and_2 = (src: Uint8Array) => {
  const six_and_two_mapping = [
    0x96, 0x97, 0x9A, 0x9B, 0x9D, 0x9E, 0x9F, 0xA6,
    0xA7, 0xAB, 0xAC, 0xAD, 0xAE, 0xAF, 0xB2, 0xB3,
    0xB4, 0xB5, 0xB6, 0xB7, 0xB9, 0xBA, 0xBB, 0xBC,
    0xBD, 0xBE, 0xBF, 0xCB, 0xCD, 0xCE, 0xCF, 0xD3,
    0xD6, 0xD7, 0xD9, 0xDA, 0xDB, 0xDC, 0xDD, 0xDE,
    0xDF, 0xE5, 0xE6, 0xE7, 0xE9, 0xEA, 0xEB, 0xEC,
    0xED, 0xEE, 0xEF, 0xF2, 0xF3, 0xF4, 0xF5, 0xF6,
    0xF7, 0xF9, 0xFA, 0xFB, 0xFC, 0xFD, 0xFE, 0xFF
  ];

  const dest = new Uint8Array(343)

  // Fill in byte values: the first 86 bytes contain shuffled
  // and combined copies of the bottom two bits of the sector
  // contents; the 256 bytes afterwards are the remaining
  // six bits.
  const bit_reverse = [0, 2, 1, 3];
  for (let c = 0; c < 84; c++) {
    dest[c] =
      bit_reverse[src[c] & 3] |
      (bit_reverse[src[c + 86] & 3] << 2) |
      (bit_reverse[src[c + 172] & 3] << 4);
  }
  dest[84] =
    (bit_reverse[src[84] & 3] << 0) |
    (bit_reverse[src[170] & 3] << 2);
  dest[85] =
      (bit_reverse[src[85] & 3] << 0) |
      (bit_reverse[src[171] & 3] << 2);

  for (let c = 0; c < 256; c++) {
    dest[86 + c] = src[c] >>> 2;
  }

  // Exclusive OR each byte with the one before it.
  dest[342] = dest[341];
  let location = 342;
  while(location > 1) {
    location--;
    dest[location] ^= dest[location - 1];
  }

  // Map six-bit values up to full bytes.
  for (let c = 0; c < 343; c++) {
    dest[c] = six_and_two_mapping[dest[c]];
  }
  return dest
}

/*!
  Converts a DSK-style track to a WOZ-style track.
  @param dest The 6646-byte woz that will contain the WOZ track. Both track contents and the
      proper suffix will be written.
  @param src The 4096-byte woz that contains the DSK track — 16 instances of 256 bytes, each
      a fully-decoded sector.
  @param track_number The track number to encode into this track.
  @param is_prodos @c true if the DSK image is in Pro-DOS order; @c false if it is in DOS 3.3 order.
*/
const serialise_track = (src: Uint8Array, track_number: number, is_prodos: boolean) => {
  let track_position = 0;    // This is the track position **in bits**.
  const dest = new Uint8Array(6646).fill(0)

  // Write gap 1.
  for (let c = 0; c < 16; c++) {
      track_position = write_sync(dest, track_position);
  }

  // Step through the sectors in physical order.
  for (let sector = 0; sector < 16; sector++) {
    // Prologue.
    track_position = write_byte(dest, track_position, 0xD5);
    track_position = write_byte(dest, track_position, 0xAA);
    track_position = write_byte(dest, track_position, 0x96);
    // Volume, track, setor and checksum, all in 4-and-4 format.
    track_position = write_4_and_4(dest, track_position, 254);
    track_position = write_4_and_4(dest, track_position, track_number);
    track_position = write_4_and_4(dest, track_position, sector);
    track_position = write_4_and_4(dest, track_position, 254 ^ track_number ^ sector);
    // Epilogue.
    track_position = write_byte(dest, track_position, 0xDE);
    track_position = write_byte(dest, track_position, 0xAA);
    track_position = write_byte(dest, track_position, 0xEB);

    // Write gap 2.
    for (let c = 0; c < 7; c++) {
        track_position = write_sync(dest, track_position);
    }

    // Write the sector body.
    // Prologue.
    track_position = write_byte(dest, track_position, 0xD5);
    track_position = write_byte(dest, track_position, 0xAA);
    track_position = write_byte(dest, track_position, 0xAD);

    // Map from this physical sector to a logical sector.
    const ls = (sector === 15) ? 15 : ((sector * (is_prodos ? 8 : 7)) % 15);

    // Sector contents.
    const contents = encode_6_and_2(src.slice(ls * 256, ls * 256 + 256));
    for (let c = 0; c < contents.length; c++) {
      track_position = write_byte(dest, track_position, contents[c]);            
    }

    // Epilogue.
    track_position = write_byte(dest, track_position, 0xDE);
    track_position = write_byte(dest, track_position, 0xAA);
    track_position = write_byte(dest, track_position, 0xEB);

    // Write gap 3.
    for (let c = 0; c < 16; c++) {
      track_position = write_sync(dest, track_position);
    }
  }
  return dest
}

export const convertdsk2woz = (dskData: Uint8Array, isPO: boolean) => {
  if (dskData.length !== 35 * 16 * 256) {
    return new Uint8Array()
  }
  const woz = new Uint8Array(512*3 + 512*35*13).fill(0)
  woz.set(toASCII("WOZ2\xFF\n\r\n"), 0)
  woz.set(toASCII("INFO"), 12)
  woz[16] = 60    // Chunk size
  woz[20] = 2     // INFO version: 2
  woz[21] = 1     // Disk type: 5.25"
  woz[22] = 0     // Write protection: disabled
  woz[23] = 0     // Cross-track synchronised image: no
  woz[24] = 1     // MC3470 fake bits have been removed: yes
  woz.fill(32, 25, 57)
  woz.set(toASCII("Apple2TS (CT6502)"), 25)
  woz[57] = 1     // Disk sides: 1
  woz[58] = 0     // Boot sector format: 0 (unknown)
  woz[59] = 32    // Optimal bit timing: 32 (4us)
  woz[60] = 0     // Compatible hardware: 0 (unknown)
  woz[62] = 0     // Required RAM: 0 (unknown)
  woz[64] = 13    // Largest track blocks (512 bytes): 13 (default track size)
  woz.set(toASCII("TMAP"), 80)
  woz[84] = 160    // Chunk size
  woz.fill(0xFF, 88, 88 + 160)  // Fill the TMAP with empty tracks
  // Now fill in the quarter tracks around each whole track
  let offset = 0;
  for (let c = 0; c < 35; c++) {
    offset = 88 + (c << 2)
    if (c > 0) woz[offset - 1] = c
    woz[offset] = woz[offset + 1] = c
  }
  woz.set(toASCII("TRKS"), 248)
  woz.set(uint32toBytes(1280 + 35*13*512), 252)
  for (let c = 0; c < 35; c++) {
    offset = 256 + (c << 3);
    woz.set(uint16toBytes(3 + c*13), offset)  // start block
    woz[offset + 2] = 13   // block count
    woz.set(uint32toBytes(50304), offset + 4)  // start block
    const trackInput = dskData.slice(c * 16 * 256, (c + 1) * 16 * 256)
    const trackData = serialise_track(trackInput, c, isPO)
    offset = 512 * (3 + 13 * c)
    woz.set(trackData, offset)
  }
  return woz
}
