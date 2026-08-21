import { passLoadBinary, passRunBinary } from "./main2worker"

export const getBinaryLoadError = (
  address: number,
  data: Uint8Array,
  entryAddress: number | null,
  requireWritableRam = true,
) => {
  if (!Number.isInteger(address) || address < 0 || address > 0xFFFF) {
    return "Address must be an integer from 0 to 65535"
  }
  if (data.length === 0) {
    return "Binary data must contain at least one byte"
  }
  if (address + data.length > 0x10000) {
    return "Binary data extends beyond address 65535"
  }
  if (requireWritableRam && (address > 0xBFFF || address + data.length > 0xC000)) {
    return "Binary data extends beyond writable RAM at $BFFF"
  }
  if (entryAddress !== null && (!Number.isInteger(entryAddress) || entryAddress < 0 || entryAddress > 0xFFFF)) {
    return "Entry address must be an integer from 0 to 65535"
  }
  return null
}

export const loadBinary = (
  address: number,
  data: Uint8Array,
) => {
  passLoadBinary(address, data)
}

export const runBinary = (
  address: number,
  data: Uint8Array,
  entryAddress = address,
) => {
  passRunBinary(address, data, entryAddress)
}
