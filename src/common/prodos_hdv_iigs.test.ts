import {
  createMenuRelayBootstrap,
  createPackedBinaryRelay,
  createProDosRelayWrapper,
  determineVtocType,
  lookupFourCadeByTitle,
} from "./prodos_hdv"
import { processInstruction } from "../worker/cpu6502"
import { reset6502, s6502, setCycleCount, setPC } from "../worker/instructions"
import { memory, updateAddressTables } from "../worker/memory"

const findSequence = (bytes: Uint8Array, sequence: number[]) => {
  for (let offset = 0; offset <= bytes.length - sequence.length; offset++) {
    if (sequence.every((byte, index) => bytes[offset + index] === byte)) return offset
  }
  return -1
}

const readWord = (bytes: Uint8Array, offset: number) =>
  bytes[offset] | (bytes[offset + 1] << 8)

const branchTarget = (baseAddress: number, bytes: Uint8Array, offset: number) => {
  const displacement = bytes[offset + 1] < 0x80
    ? bytes[offset + 1]
    : bytes[offset + 1] - 0x100
  return baseAddress + offset + 2 + displacement
}

describe("IIgs 4cade block loading", () => {
  test("recognizes archive titles with combined crack suffixes as 4cade", () => {
    const title = "CHIVALRY (4AM AND SAN INC CRACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("standard")
    expect(determineVtocType("chivalry.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("wraps the relay at a ProDOS-safe load address", () => {
    const relay = Uint8Array.from({ length: 395 }, (_, index) => index & 0xFF)
    const wrapper = createProDosRelayWrapper(relay)

    expect(wrapper).toHaveLength(0x300)
    expect(Array.from(wrapper.slice(0, 20))).toEqual([
      0xA0, 0x00,
      0xB9, 0x00, 0x21, 0x99, 0x00, 0x03,
      0xB9, 0x00, 0x22, 0x99, 0x00, 0x04,
      0xC8, 0xD0, 0xF1,
      0x4C, 0x00, 0x03,
    ])
    expect(wrapper.slice(0x100, 0x100 + relay.length)).toEqual(relay)
    expect(wrapper.slice(0x100 + relay.length)).toEqual(new Uint8Array(512 - relay.length))

    reset6502()
    memory.fill(0)
    updateAddressTables()
    memory.set(wrapper, 0x2000)
    setPC(0x2000)
    setCycleCount(0)
    for (let instruction = 0; instruction < 5000 && s6502.PC !== 0x0300; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0x0300)
    expect(memory.slice(0x0300, 0x0300 + relay.length)).toEqual(relay)
    expect(memory.slice(0x0300 + relay.length, 0x0500)).toEqual(
      new Uint8Array(512 - relay.length),
    )
  })

  test("runs a relocated packed relay without touching ProDOS global pages", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 1, 0x70, [], -1, 0x2100)
    const wrapper = createProDosRelayWrapper(relay, true)
    const parameterOffset = findSequence(relay, [3, 0, 0, 8, 2, 0, 1, 0])
    const mliOffset = findSequence(relay, [0x20, 0x00, 0xBF, 0x80])

    expect(Array.from(wrapper.slice(0, 3))).toEqual([0x4C, 0x00, 0x21])
    expect(wrapper.slice(0x100, 0x100 + relay.length)).toEqual(relay)
    expect(readWord(relay, mliOffset + 4)).toBe(0x2100 + parameterOffset)
    expect(findSequence(relay, [0x20, 0xC0, 0xC7])).toBe(-1)
  })

  test("installs a runtime MLI bootstrap outside page 2", () => {
    const baseAddress = 0x2000
    const bootstrap = createMenuRelayBootstrap()
    const bytes = bootstrap.bytes
    const mliOffset = findSequence(bytes, [0x20, 0x00, 0xBF, 0x80])
    const parameterOffset = bytes.length - 6

    expect(Array.from(bytes.slice(0, 3))).toEqual([0xAD, 0x30, 0xBF])
    expect(mliOffset).toBeGreaterThan(0)
    expect(findSequence(bytes, [0x20, 0xC0, 0xC7])).toBe(-1)
    expect(readWord(bytes, mliOffset + 4)).toBe(baseAddress + parameterOffset)
    expect(readWord(bytes, 4)).toBe(baseAddress + parameterOffset + 1)
    expect(Array.from(bytes.slice(parameterOffset))).toEqual([3, 0, 0, 3, 0, 0])
    expect(bootstrap.blockLoOffsets).toEqual([parameterOffset + 4])
    expect(bootstrap.blockHiOffsets).toEqual([parameterOffset + 5])

    const bcsOffsets = Array.from(bytes.keys()).filter((offset) => bytes[offset] === 0xB0)
    expect(bcsOffsets).toHaveLength(1)
    const errorAddresses = bcsOffsets.map((offset) => branchTarget(baseAddress, bytes, offset))
    expect(bytes[errorAddresses[0] - baseAddress]).toBe(0x00)
  })

  test("patches only the MLI block parameter in the menu bootstrap", () => {
    const bootstrap = createMenuRelayBootstrap()
    for (const offset of bootstrap.blockLoOffsets) bootstrap.bytes[offset] = 2
    for (const offset of bootstrap.blockHiOffsets) bootstrap.bytes[offset] = 0
    const parameterOffset = bootstrap.bytes.length - 6

    expect(bootstrap.blockLoOffsets).toEqual([parameterOffset + 4])
    expect(bootstrap.blockHiOffsets).toEqual([parameterOffset + 5])
    expect(Array.from(bootstrap.bytes.slice(parameterOffset))).toEqual([3, 0, 0, 3, 2, 0])
    expect(findSequence(bootstrap.bytes, [0x20, 0xC0, 0xC7])).toBe(-1)
  })

  test("uses only ProDOS MLI for packed block reads", () => {
    const baseAddress = 0x0300
    const relay = createPackedBinaryRelay(0x01AA, 0x0800, 6, 0x70, [], 0x6BA5)
    const mliOffset = findSequence(relay, [0x20, 0x00, 0xBF, 0x80])
    const parameterOffset = findSequence(relay, [3, 0, 0, 8, 0xAA, 1, 6, 0])

    expect(Array.from(relay.slice(0, 6))).toEqual([
      0xAD, 0x30, 0xBF, 0x8D, (baseAddress + parameterOffset + 1) & 0xFF,
      (baseAddress + parameterOffset + 1) >> 8,
    ])
    expect(relay.length).toBeLessThanOrEqual(512)
    expect(mliOffset).toBeGreaterThan(0)
    expect(findSequence(relay, [0x20, 0xC0, 0xC7])).toBe(-1)
    expect(parameterOffset).toBeGreaterThan(mliOffset)
    expect(readWord(relay, mliOffset + 4)).toBe(baseAddress + parameterOffset)

    const phaseOneBcsOffsets = Array.from(relay.keys())
      .filter((offset) => offset < 64 && relay[offset] === 0xB0)
    expect(phaseOneBcsOffsets).toHaveLength(1)
    const errorAddresses = phaseOneBcsOffsets.map((offset) =>
      branchTarget(baseAddress, relay, offset),
    )
    expect(relay[errorAddresses[0] - baseAddress]).toBe(0x00)
  })

  test("encodes all packed blocks in the ProDOS MLI state", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 6, 0x70, [], -1)
    expect(findSequence(relay, [3, 0, 0, 8, 2, 0, 6, 0])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x20, 0x00, 0xBF, 0x80])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x20, 0xC0, 0xC7])).toBe(-1)
  })
})