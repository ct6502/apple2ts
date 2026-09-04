import { RamWorksMemoryStart } from "../common/utility"
import { addressGetTable, RamWorksBankGet, RamWorksMaxBank, memory, getAuxCardEnabled } from "./memory"
import { SWITCHES } from "./softswitches"

const getBackingLocation = (address: number) => {
  if (address >= 0xC000) return { space: "system" as const }
  const offset = addressGetTable[address >>> 8] + (address & 0xFF)
  if (offset < 0x10000) return { space: "main" as const }
  if (offset >= RamWorksMemoryStart) {
    return {
      space: "aux" as const,
      auxBank: Math.floor((offset - RamWorksMemoryStart) / 0x10000),
    }
  }
  return { space: "system" as const }
}

const getEffectiveSegments = (
  address: number,
  length: number,
  space: MemorySpace,
  auxBank: number,
) => {
  const segments: MemoryViewSegment[] = []
  for (let current = address; current < address + length; current++) {
    const location = space === "active"
      ? getBackingLocation(current)
      : space === "aux"
        ? { space, auxBank }
        : { space }
    const previous = segments.at(-1)
    if (
      previous
      && previous.address + previous.length === current
      && previous.space === location.space
      && previous.auxBank === location.auxBank
    ) {
      previous.length++
    } else {
      segments.push({address: current, length: 1, ...location})
    }
  }
  return segments
}

export const getMemoryView = (request: MemoryViewRequest): MemoryView => {
  const {address, length, space} = request
  if (!Number.isInteger(address) || address < 0 || address > 0xFFFF) {
    throw new Error("Memory address must be between $0000 and $FFFF")
  }
  if (!Number.isInteger(length) || length < 1 || address + length > 0x10000) {
    throw new Error("Memory range must fit within $0000-$FFFF")
  }
  if (!(["active", "main", "aux"] as MemorySpace[]).includes(space)) {
    throw new Error("Unknown memory space")
  }
  if (request.auxBank !== undefined && space !== "aux") {
    throw new Error("Auxiliary bank is valid only for auxiliary memory")
  }
  if (space !== "active" && address + length > 0xC000) {
    throw new Error("Physical memory range must fit within $0000-$BFFF")
  }
  const selectedAuxBank = RamWorksBankGet()
  const auxBank = request.auxBank ?? selectedAuxBank
  if (space === "aux") {
    if (!getAuxCardEnabled()) throw new Error("Auxiliary memory is not configured")
    if (!Number.isInteger(auxBank) || auxBank < 0 || auxBank > RamWorksMaxBank) {
      throw new Error(`Auxiliary bank must be between 0 and ${RamWorksMaxBank}`)
    }
  }

  let bytes: Uint8Array
  if (space === "active") {
    bytes = new Uint8Array(length)
    for (let index = 0; index < length; index++) {
      const current = address + index
      const offset = addressGetTable[current >>> 8] + (current & 0xFF)
      bytes[index] = memory[offset]
    }
  } else {
    const offset = space === "main" ? address : RamWorksMemoryStart + auxBank * 0x10000 + address
    bytes = memory.slice(offset, offset + length)
  }

  const effectiveSegments = getEffectiveSegments(address, length, space, auxBank)
  return {
    address,
    length,
    requestedSpace: space,
    requestedAuxBank: request.auxBank ?? null,
    effectiveAuxBank: effectiveSegments.some((segment) => segment.space === "aux")
      ? auxBank
      : null,
    effectiveSegments,
    mapping: {
      RAMRD: SWITCHES.RAMRD.isSet,
      RAMWRT: SWITCHES.RAMWRT.isSet,
      ALTZP: SWITCHES.ALTZP.isSet,
      "80STORE": SWITCHES.STORE80.isSet,
      PAGE2: SWITCHES.PAGE2.isSet,
      HIRES: SWITCHES.HIRES.isSet,
    },
    bytes,
  }
}
