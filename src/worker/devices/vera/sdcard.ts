// Commander X16 Emulator
// Copyright (c) 2019 Michael Steil
// Copyright (c) 2020 Frank van den Hoef
// Port to typescript and mods by Michael Morrison
// All rights reserved. License: 2-clause BSD

import type { VeraSdStatus } from "../../../common/utility"

const SPI_CLOCK_RATE_MHZ = 12 // really 12.5, but it won't matter

let ss: boolean = false
let busy: boolean = false
let autotx: boolean = false
let sending_byte: number = 0xff
let received_byte: number = 0xff
let outcounter: number = 0
let sdcard_attached: boolean = false
let is_acmd: boolean = false
let is_idle: boolean = true
let is_initialized: boolean = false
let ongoing_multiblock_read: boolean = false

let sdcard_data: Uint8Array | null = null
let sdcard_name: string = ""

const rxbuf = new Uint8Array(3 + 512)
let rxbuf_idx: number = 0
let lba: number = 0
let last_cmd: number = 0

let response: Uint8Array | null = new Uint8Array(1)
let response_length = 0
let response_counter = 0
let selected = false

let current_lba: number | undefined = undefined
let sdcard_write_protected: boolean = false
let sdcard_has_changes: boolean = false
let status_listener: ((status: VeraSdStatus) => void) | null = null

export const set_sdcard_status_listener = (listener: ((status: VeraSdStatus) => void) | null): void => {
  status_listener = listener
}

export const sdcard_get_status = (): VeraSdStatus => ({
  attached: sdcard_attached && sdcard_data !== null,
  name: sdcard_name,
  size: sdcard_data ? sdcard_data.length : 0,
  lba: current_lba,
  writeProtected: sdcard_write_protected,
  hasChanges: sdcard_has_changes,
})

export const sdcard_set_write_protected = (wp: boolean): void => {
  sdcard_write_protected = wp
  if (status_listener) status_listener(sdcard_get_status())
}

export const sdcard_clear_changes = (): void => {
  sdcard_has_changes = false
  if (status_listener) status_listener(sdcard_get_status())
}

export const sdcard_get_image = (): Uint8Array | null => {
  return sdcard_data
}

export const sdcard_attach_image = (data: Uint8Array | null, name: string = "sd.img"): void => {
  sdcard_detach()
  if (data && data.length > 0) {
    sdcard_data = data
    sdcard_name = name
    sdcard_attached = true
    sdcard_has_changes = false
    sdcard_write_protected = false
    is_initialized = false
    is_idle = true
    current_lba = undefined
    console.log(`[VERA SD] Attached image '${name}' (${data.length} bytes, ${Math.floor(data.length / 512)} sectors)`)
    if (status_listener) status_listener(sdcard_get_status())
  }
}

export const sdcard_detach_image = (): void => {
  sdcard_detach()
}

export const vera_spi_init = (): void => {
  ss = false
  busy = false
  autotx = false
  received_byte = 0xff

  is_acmd = false
  is_idle = true
  is_initialized = false
  ongoing_multiblock_read = false

  response_length = 0
  response_counter = 0

  selected = false
}

export const vera_spi_step = (clocks: number): void => {
  if (busy) {
    outcounter += clocks * SPI_CLOCK_RATE_MHZ
    if (outcounter >= 10) {
      busy = false
      if (sdcard_attached && sdcard_data) {
        received_byte = sdcard_handle(sending_byte)
      } else {
        received_byte = 0xff
      }
    }
  }
}

export const vera_spi_read = (reg: number): number => {
  switch (reg) {
    case 0:
      if (autotx && ss && !busy) {
        // autotx mode will automatically send $FF after each read
        sending_byte = 0xff
        busy = true
        outcounter = 0
      }
      return received_byte
    case 1:
      return (busy ? 1 : 0) << 7 | (autotx ? 1 : 0) << 2 | (ss ? 1 : 0)
  }
  return 0
}

export const vera_spi_write = (reg: number, value: number): void => {
  switch (reg) {
    case 0:
      if (ss && !busy) {
        sending_byte = value
        busy = true
        outcounter = 0
      }
      break
    case 1:
      if ((ss ? 1 : 0) !== (value & 1)) {
        ss = (value & 1) !== 0
        if (ss) {
          sdcard_select(ss)
        }
      }
      autotx = !!(value & 4)
      break
  }
}

// MMC/SD command (SPI mode)
const CMD0 = 0
const CMD8 = 8
const CMD9 = 9
const ACMD41 = 0x80 | 41
const CMD12 = 12
const CMD13 = 13
const CMD16 = 16
const CMD17 = 17
const CMD18 = 18
const CMD24 = 24
const CMD55 = 55
const CMD58 = 58

const FileSizeBytes = (): number => {
  return sdcard_data ? sdcard_data.length : 0
}

const ReadBlock = (blockLba: number, dest: Uint8Array): boolean => {
  if (!sdcard_data) return false
  const offset = blockLba * 512
  if (offset + 512 > sdcard_data.length) return false
  dest.set(sdcard_data.subarray(offset, offset + 512))
  return true
}

const WriteBlock = (blockLba: number, src: Uint8Array): boolean => {
  if (!sdcard_data) return false
  if (sdcard_write_protected) return false
  const offset = blockLba * 512
  if (offset + 512 > sdcard_data.length) return false
  sdcard_data.set(src.subarray(0, 512), offset)
  if (!sdcard_has_changes) {
    sdcard_has_changes = true
    if (status_listener) status_listener(sdcard_get_status())
  }
  return true
}

export const sdcard_set_path = (path: string): void => {
  sdcard_name = path
}

export const sdcard_detach = (): void => {
  if (sdcard_attached || sdcard_data) {
    sdcard_data = null
    sdcard_name = ""
    sdcard_attached = false
    sdcard_has_changes = false
    sdcard_write_protected = false
    is_initialized = false
    is_idle = true
    current_lba = undefined
    console.log("[VERA SD] Detached image")
    if (status_listener) status_listener(sdcard_get_status())
  }
}

export const sdcard_select = (select: boolean): void => {
  selected = select
  rxbuf_idx = 0
}

const set_response_csd = (): void => {
  const rr = new Uint8Array([
    0xff, // dummy
    0xff, // dummy
    0x00, // R1 response
    0xff, // dummy
    0xfe, // begin block
    0x40, // CSD_STRUCTURE [7:6] = 1, RESERVED [5:0] = 0
    0x0e, // TAAC = 0x0e
    0x00, // NSAC = 0x00
    0x32, // TRAN_SPEED = 0x32
    0x5b, // CCC (11:4)
    0x59, // CCC (3:0) [7-4], READ_BL_LEN [3-0]
    0x00, // READ_BL_PARTIAL [7], WRITE_BLK_MISALIGN [6], READ_BLK_MISALIGN [5], DSR_IMP [4], RESERVED [3:0]
    0x00, // RESERVED [7:6], C_SIZE(21:16) [5:0]
    0x00, // C_SIZE(15:8)
    0x00, // C_SIZE(7:0)
    0x7f, // RESERVED [7], ERASE_BLK_EN[6], SECTOR_SIZE(6:1) [5:0]
    0x80, // SECTOR_SIZE(0) [7], WP_GRP_SIZE [6:0]
    0x0a, // WP_GRP_ENABLE [7], RESERVED [6:5], R2W_FACTOR [4:2], WRITE_BL_LEN (3:2) [1:0]
    0x40, // WRITE_BL_LEN (1:0) [7:6], WRITE_BL_PARTIAL [5], RESERVED [4:0]
    0x00, // FILE_FORMAT_GRP [7] = 0, COPY [6], PERM_WRITE_PROTECT [5], TMP_WRITE_PROTECT [4], RESERVED [3:0]
    0x01  // CRC[7:1], ALWAYS_1 [0]
  ])
  const c_size = (FileSizeBytes() >> 19) - 1
  rr[12] |= (c_size >> 16) & 0x3f
  rr[13] = (c_size >> 8) & 0xff
  rr[14] = c_size & 0xff

  response = rr
  response_length = 21
}

const set_response_r1 = (): void => {
  const r1 = is_idle ? 1 : 0
  response = new Uint8Array([r1])
  response_length = 1
}

const set_response_r2 = (): void => {
  if (is_initialized) {
    const r2 = new Uint8Array([0x00, 0x00])
    response = r2
    response_length = r2.length
  } else {
    const r2 = new Uint8Array([0x1F, 0xFF])
    response = r2
    response_length = r2.length
  }
}

const set_response_r3 = (): void => {
  const r3 = new Uint8Array([0xC0, 0xFF, 0x80, 0x00])
  response = r3
  response_length = r3.length
}

const set_response_r7 = (): void => {
  const r7 = new Uint8Array([1, 0x00, 0x00, 0x01, 0xAA])
  response = r7
  response_length = r7.length
}

// Return length of reply (1+512+2 for a data block, or 1 for error token)
const loadBlock = (dest: Uint8Array): number => {
  dest[0] = 0xFE // Data token for CMD17/18
  if (lba * 512 >= FileSizeBytes()) {
    dest[0] = 0x08 // Error token: out of range
    return 1
  }
  ReadBlock(lba, dest.subarray(1, 1 + 512))
  dest[1 + 512] = 0xFF
  dest[1 + 512 + 1] = 0xFF
  return 1 + 512 + 2
}

const sdcard_handle = (inbyte: number): number => {
  if (!selected || !sdcard_attached || !sdcard_data) {
    return 0xFF
  }
  let outbyte = 0xFF
  if (rxbuf_idx == 0 && inbyte == 0xFF) {
    // send response data
    if (response) {
      outbyte = response[response_counter++]
      if (response_counter == response_length) {
        if (ongoing_multiblock_read) {
          const read_multiblock_next_response = new Uint8Array(1 + 512 + 2)
          // Prepare next multiblock reply
          lba++
          current_lba = lba
          if (status_listener) status_listener(sdcard_get_status())
          response_length = loadBlock(read_multiblock_next_response)
          // Stop multiblock read if error
          if (response_length == 1) {
            ongoing_multiblock_read = false
          }
          response = read_multiblock_next_response
          response_counter = 0
        } else {
          response = null
          ongoing_multiblock_read = false
        }
      }
    }
  } else {
    rxbuf[rxbuf_idx++] = inbyte
    if ((rxbuf[0] & 0xC0) == 0x40 && rxbuf_idx == 6) {
      rxbuf_idx = 0
      // Check for start-bit + transmission bit
      if ((rxbuf[0] & 0xC0) != 0x40) {
        response = null
        return 0xFF
      }
      rxbuf[0] &= 0x3F
      // Use upper command bit to indicate this is an ACMD
      if (is_acmd) {
        rxbuf[0] |= 0x80
        is_acmd = false
      }

      last_cmd = rxbuf[0]
      switch (rxbuf[0]) {
        case CMD0: {
          // GO_IDLE_STATE: Resets the SD Memory Card
          is_idle = true
          set_response_r1()
          break
        }

        case CMD8: {
          // SEND_IF_COND: Sends SD Memory Card interface condition
          set_response_r7()
          break
        }

        case CMD9: {
          // SEND_CSD: Sends card-specific data
          set_response_csd()
          break
        }

        case ACMD41: {
          // SD_SEND_OP_COND
          is_idle = false
          is_initialized = true
          set_response_r1()
          break
        }

        case CMD12: {
          // STOP_TRANSMISSION: Abort ongoing multiple block read
          ongoing_multiblock_read = false
          set_response_r1()
          break
        }

        case CMD13: {
          // SEND_STATUS
          set_response_r2()
          break
        }
        case CMD16: {
          // SET_BLOCKLEN
          set_response_r1()
          break
        }
        case CMD18: {
          // READ_MULTIPLE_BLOCK
          ongoing_multiblock_read = true
          lba = ((rxbuf[1] << 24) | (rxbuf[2] << 16) | (rxbuf[3] << 8) | rxbuf[4]) >>> 0
          current_lba = lba
          if (status_listener) status_listener(sdcard_get_status())
          const read_block_response = new Uint8Array(2 + 512 + 2)
          read_block_response[0] = 0 // R1 response to command
          response_length = 1 + loadBlock(read_block_response.subarray(1))
          if (response_length == 2) {
            ongoing_multiblock_read = false
          }
          response = read_block_response
          break
        }
        case CMD17: {
          // READ_SINGLE_BLOCK
          lba = ((rxbuf[1] << 24) | (rxbuf[2] << 16) | (rxbuf[3] << 8) | rxbuf[4]) >>> 0
          current_lba = lba
          if (status_listener) status_listener(sdcard_get_status())
          const read_block_response = new Uint8Array(2 + 512 + 2)
          read_block_response[0] = 0 // R1 response to command
          response_length = 1 + loadBlock(read_block_response.subarray(1))
          if (response_length == 2) {
            ongoing_multiblock_read = false
          }
          response = read_block_response
          break
        }

        case CMD24: {
          // WRITE_BLOCK
          lba = ((rxbuf[1] << 24) | (rxbuf[2] << 16) | (rxbuf[3] << 8) | rxbuf[4]) >>> 0
          current_lba = lba
          if (status_listener) status_listener(sdcard_get_status())
          if (rxbuf_idx > 4 && lba * 512 >= FileSizeBytes()) {
            const bad_lba = new Uint8Array([0x00, 0x08])
            response = bad_lba
            response_length = 2
          } else {
            set_response_r1()
          }
          break
        }

        case CMD55: {
          // APP_CMD: Next command is an application specific command
          is_acmd = true
          set_response_r1()
          break
        }

        case CMD58: {
          // READ_OCR: Read the OCR register of the card
          set_response_r3()
          break
        }

        default: {
          set_response_r1()
          break
        }
      }
      response_counter = 0

    } else if (rxbuf_idx == 515) {
      rxbuf_idx = 0
      // Check for 'start block' byte
      if (last_cmd == CMD24 && rxbuf[0] == 0xFE) {
        if (lba * 512 < FileSizeBytes()) {
          WriteBlock(lba, rxbuf.subarray(1, 513))
          response = new Uint8Array([0x05]) // Data accepted token
          response_length = 1
          response_counter = 0
        }
      }
    }
  }
  return outbyte
}
