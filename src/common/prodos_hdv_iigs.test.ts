import {
  createMenuRelayBootstrap,
  createPackedBinaryRelay,
  createProDosRelayWrapper,
  determineVtocType,
  generateMenuLaunchProgram,
  generateMenuSourceProgram,
  lookupFourCadeByTitle,
} from "./prodos_hdv"
import { parsePrelaunchScript } from "./four_cade_prelaunch_db"
import { processInstruction } from "../worker/cpu6502"
import { reset6502, s6502, setAccumulator, setCycleCount, setPC } from "../worker/instructions"
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
  test("menu uses full HGR and cycles adjacent case-insensitive title initials", () => {
    const source = generateMenuSourceProgram([
      { filename: "ALPHA", displayName: "Aztec" },
      { filename: "ANOTHER", displayName: "Apple Panic" },
      { filename: "BETA", displayName: "Blazing Paddles" },
    ], undefined, [], [], "A2TSHLP")

    expect(source).toContain("20 MAX=3:I=PEEK(1145):IF I<1 OR I>MAX THEN I=1")
    expect(source).toContain("21 G=0:C$=\"AAB\"")
    expect(source).toContain("85 IF K0>96 AND K0<123 THEN K0=K0-32")
    expect(source).toContain("87 P=0:IF ASC(MID$(C$,I,1))=K0 THEN P=I+1:IF P>MAX THEN P=1")
    expect(source).toContain("88 IF P>0 THEN IF ASC(MID$(C$,P,1))<>K0 THEN P=0")
    expect(source).toContain("89 IF P>0 THEN 93")
    expect(source).toContain("90 FOR J=1 TO MAX")
    expect(source).toContain("91 IF ASC(MID$(C$,J,1))=K0 THEN P=J:J=MAX")
    expect(source).toContain("70 IF K0=8 OR K0=21 THEN G=0:POKE 49236,0:GOSUB 1000:GOTO 40")
    expect(source).toContain("93 IF P>0 THEN G=0:POKE 49236,0:I=P:GOSUB 1000")
    expect(source).toContain("40 IF PEEK(49152)<128 THEN 40")
    expect(source).toContain("46 IF G=0 AND K0=27 THEN G=1:POKE 49237,0:GOTO 40")
    expect(source).toContain("47 IF G=1 AND K0=27 THEN G=0:POKE 49236,0:GOTO 40")
    expect(source).toContain("1010 POKE 49232,0:POKE 49234,0:POKE 49239,0")
    expect(source).not.toContain("1010 POKE 49232,0:POKE 49234,0:POKE 49236,0")
    expect(source).toContain("BLOAD SHOTS/SCREEN\"+N$+\",A$2000")
    expect(source).toContain("BLOAD SHOTS/KEY\"+N$+\",A$4000")
    expect(source).toContain("1014 IF G=0 THEN POKE 49236,0")
    expect(source).toContain("1015 IF G=1 THEN POKE 49237,0")
    expect(source).not.toContain("PEEK(49251)")
    expect(source).not.toContain("POKE 49235")
    expect(source).not.toContain("VTAB")
    expect(source).not.toContain("HTAB")
    expect(source).not.toContain("INVERSE")
  })

  test("single-disk menu omits the keyboard page and Escape transition", () => {
    const source = generateMenuSourceProgram([
      { filename: "ALPHA", displayName: "Aztec" },
    ], undefined, [], [], "A2TSHLP")

    expect(source).toContain("1010 POKE 49232,0:POKE 49234,0:POKE 49236,0:POKE 49239,0")
    expect(source).toContain("BLOAD SHOTS/SCREEN\"+N$+\",A$2000")
    expect(source).not.toContain("BLOAD SHOTS/KEY")
    expect(source).not.toContain("K0=27")
    expect(source).not.toContain("POKE 49237")
  })

  test("shows an issue QR code for an unlaunchable imported disk and returns to its screen", () => {
    const source = generateMenuLaunchProgram([
      { filename: "BROKEN", displayName: "Broken Disk & Demo", imageKind: "prodos" },
    ], undefined, [], [], "A2TSHLP")

    expect(source).not.toContain("PRODOS FILES IMPORTED")
    expect(source).toContain("80 IF K(I)=4 THEN GOSUB 3000:GOTO 220")
    expect(source).toContain("3000 PRINT D$;\"BLOAD A2TSHLP/QR.BIN,A$6000\"")
    expect(source).not.toContain("PRINT CHR$(7)")
    expect(source).not.toContain("QRSCALE")
    expect(source).toContain("3010 A$=U$+T$(I):L=LEN(A$):FOR J=1 TO L:POKE 28708+J,ASC(MID$(A$,J,1)):NEXT")
    expect(source).toContain("3020 POKE 28704,37:POKE 28705,112:POKE 28706,L:POKE 28707,0:POKE 28708,0")
    const doubleBufferedGeneration = "3030 HGR:HGR2:POKE 230,32:CALL 28672:CALL 33792:POKE 49168,0"
    expect(source).toContain(doubleBufferedGeneration)
    expect(doubleBufferedGeneration.indexOf("HGR:")).toBeLessThan(doubleBufferedGeneration.indexOf("HGR2"))
    expect(doubleBufferedGeneration.indexOf("HGR2")).toBeLessThan(doubleBufferedGeneration.indexOf("CALL 28672"))
    expect(doubleBufferedGeneration).not.toContain("POKE 49233")
    expect(source).toContain("3040 IF PEEK(49152)<128 THEN 3040")
    expect(source).toContain("3050 X=PEEK(49168):RETURN")
    expect(source).toContain("\"Broken+Disk+%26+Demo\"")
    expect(source).toContain("220 TEXT:HOME:PRINT CHR$(4);\"RUN A2TSHLP/MENUSRC\":END")
  })

  test("keeps a large ProDOS image titled Aztec out of the 4cade path", () => {
    expect(determineVtocType("Aztec.po", new Uint8Array(819200), "Aztec")).toBe("prodos")
  })

  test("recognizes archive titles with combined crack suffixes as 4cade", () => {
    const title = "CHIVALRY (4AM AND SAN INC CRACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("standard")
    expect(determineVtocType("chivalry.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("recognizes Phaser Fire's SAN INC archive title as 4cade", () => {
    const title = "PHASER FIRE (SAN INC CRACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("phaser.fire")
    expect(determineVtocType("phaser fire.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("recognizes Bubble Bobble's SAN INC archive title as 4cade", () => {
    const title = "BUBBLE BOBBLE (SAN INC PACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("bubble.bobble")
    expect(determineVtocType("bubble bobble.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("recognizes Pitfall II's full 4am archive title as 4cade", () => {
    const title = "Pitfall II: Lost Caverns (4am crack)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("pitfall.ii")
    expect(determineVtocType("pitfall ii.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("recognizes Chrono Warrior's SAN INC archive title as 4cade", () => {
    const title = "CHRONO WARRIOR (SAN INC PACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("chrono.warrior")
    expect(determineVtocType("chrono warrior.po", new Uint8Array(), title)).toBe("4cade")
  })

  test("recognizes Technocop's SAN INC archive title as 4cade", () => {
    const title = "TECHNOCOP (SAN INC PACK)"

    expect(lookupFourCadeByTitle(title)?.prelaunch).toBe("technocop")
    expect(determineVtocType("technocop.po", new Uint8Array(), title)).toBe("4cade")
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

  test("relocates a packed relay below its loaded payload", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 34, 0x70, [], -1)
    const wrapper = createProDosRelayWrapper(relay)
    const parameterOffset = findSequence(relay, [3, 0, 0, 8, 2, 0, 34, 0])
    const mliOffset = findSequence(relay, [0x20, 0x00, 0xBF, 0x80])

    expect(Array.from(wrapper.slice(0, 3))).toEqual([0xA0, 0x00, 0xB9])
    expect(wrapper.slice(0x100, 0x100 + relay.length)).toEqual(relay)
    expect(readWord(relay, mliOffset + 4)).toBe(0x0300 + parameterOffset)
    expect(findSequence(relay, [0x20, 0xC0, 0xC7])).toBe(-1)
  })

  test("clears relay bytes from the text page before prelaunch", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 34, 0x70, [], 0x6000)
    const clearBytes = [
      0xA9, 0xA0, 0xA2, 0x00,
      0x9D, 0x00, 0x04, 0x9D, 0x00, 0x05,
      0x9D, 0x00, 0x06, 0x9D, 0x00, 0x07,
      0xE8, 0xD0, 0xF1,
    ]
    const clearOffset = findSequence(relay, clearBytes)

    expect(clearOffset).toBeGreaterThan(0)
    reset6502()
    memory.fill(0x41, 0x0400, 0x0800)
    memory.set(relay.slice(clearOffset, clearOffset + clearBytes.length + 3), 0x0106)
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 2000 && s6502.PC !== 0x6000; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0x6000)
    expect(memory.slice(0x0400, 0x0800)).toEqual(new Uint8Array(0x400).fill(0xA0))
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

  test("emits a numeric indirect jump for Phaser Fire", () => {
    const relay = createPackedBinaryRelay(2, 0x4000, 1, 0x70, [], { indirect: 0x20 })

    expect(findSequence(relay, [0x6C, 0x20, 0x00])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x4C, 0x20, 0x00])).toBe(-1)
  })

  test("installs Bubble Bobble's trailing reset handler", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 1, 0x70, [
      { op: "reset_vector" },
    ], 0x6000)

    expect(findSequence(relay, [
      0xA9, 0x37, 0x8D, 0xF2, 0x03, 0x8D, 0xFC, 0xFF,
      0xA9, 0x01, 0x8D, 0xF3, 0x03, 0x8D, 0xFD, 0xFF,
      0x49, 0xA5, 0x8D, 0xF4, 0x03,
      0x4C, 0x00, 0x60,
      0x8D, 0x82, 0xC0, 0xEE, 0xF4, 0x03, 0x6C, 0xFC, 0xFF,
    ])).toBeGreaterThan(0)
  })

  test("installs Pitfall II's reset handler and callback routines on the stack page", () => {
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const callback1 = [0x38, 0xE9, 0x08, 0xC9, 0x02, 0x90, 0x03, 0x4C, 0x0A, 0xAE, 0x4C, 0xF9, 0xAD]
    const callback2 = [0x38, 0xE9, 0x08, 0xC9, 0x02, 0x90, 0x03, 0x4C, 0x0A, 0xAE, 0x4C, 0x21, 0xAE]
    const relay = createPackedBinaryRelay(2, 0x0800, 28, 0x70, [
      { op: "reset_handler", mode: "rdRam2" },
      { op: "install_routine", loAddr: 0x2DF6, hiAddr: 0x2DF7, bytes: callback1 },
      { op: "install_routine", loAddr: 0x2E07, hiAddr: 0x2E08, bytes: callback2 },
    ], 0x6000)
    const prelaunchOffset = findSequence(relay, clearPrefix)
    const callback1Offset = findSequence(relay, callback1)
    const callback2Offset = findSequence(relay, callback2)
    const callback1Store = findSequence(relay, [0x8D, 0xF6, 0x2D, 0xA9])
    const callback2Store = findSequence(relay, [0x8D, 0x07, 0x2E, 0xA9])
    const callback1Address = 0x0106 + callback1Offset - prelaunchOffset
    const callback2Address = 0x0106 + callback2Offset - prelaunchOffset

    expect(findSequence(relay, [0x8D, 0xF2, 0x03, 0xA9])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x8D, 0x80, 0xC0, 0x6C, 0xFC, 0xFF])).toBeGreaterThan(0)
    expect(callback1Address).toBeGreaterThanOrEqual(0x0106)
    expect(callback2Address).toBeGreaterThan(callback1Address)
    expect(relay[callback1Store - 1] | (relay[callback1Store + 4] << 8)).toBe(callback1Address)
    expect(relay[callback2Store - 1] | (relay[callback2Store + 4] << 8)).toBe(callback2Address)

    reset6502()
    memory.fill(0)
    memory.set(relay.slice(prelaunchOffset), 0x0106)
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 5000 && s6502.PC !== 0x6000; instruction++) {
      processInstruction()
    }

    const resetAddress = memory[0x03F2] | (memory[0x03F3] << 8)
    expect(s6502.PC).toBe(0x6000)
    expect(memory[0x03F4]).toBe(memory[0x03F3] ^ 0xA5)
    expect(Array.from(memory.slice(resetAddress, resetAddress + 6))).toEqual([
      0x8D, 0x80, 0xC0, 0x6C, 0xFC, 0xFF,
    ])
    expect(memory[0x2DF6] | (memory[0x2DF7] << 8)).toBe(callback1Address)
    expect(memory[0x2E07] | (memory[0x2E08] << 8)).toBe(callback2Address)
    expect(Array.from(memory.slice(callback1Address, callback1Address + callback1.length)))
      .toEqual(callback1)
    expect(Array.from(memory.slice(callback2Address, callback2Address + callback2.length)))
      .toEqual(callback2)

    const runCallback = (address: number, accumulator: number) => {
      setAccumulator(accumulator)
      setPC(address)
      for (let instruction = 0; instruction < 8 && s6502.PC < 0xAD00; instruction++) {
        processInstruction()
      }
      return s6502.PC
    }
    expect(runCallback(callback1Address, 8)).toBe(0xADF9)
    expect(runCallback(callback1Address, 10)).toBe(0xAE0A)
    expect(runCallback(callback2Address, 8)).toBe(0xAE21)
    expect(runCallback(callback2Address, 10)).toBe(0xAE0A)
  })

  test("launches Chrono Warrior without installing its cheat-only callback", () => {
    const parsed = parsePrelaunchScript(`
      jmp skip
    callback
      jsr $BC9D
      rts
    skip
      +ENABLE_ACCEL_LC
      lda #$60
      sta $2079
      jsr $2000
      +GET_MACHINE_STATUS_LC_RW
      and #CHEATS_ENABLED
      beq +
      lda #<callback
      sta $BC90
      lda #>callback
      sta $BC91
    +
      +DISABLE_ACCEL_LC
      jmp $1B40
    `)
    expect(parsed).toBeDefined()
    if (!parsed || typeof parsed.entry !== "number") throw new Error("Chrono Warrior did not parse")

    const relay = createPackedBinaryRelay(2, 0x2000, 1, 0x70, parsed.sequence, parsed.entry)
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const prelaunchOffset = findSequence(relay, clearPrefix)

    reset6502()
    memory.fill(0)
    memory.set(relay.slice(prelaunchOffset), 0x0106)
    memory[0xDFB7] = 0x60  // EnableAccelerator in LC bank 2
    memory[0xDFB4] = 0x60  // DisableAccelerator in LC bank 2
    memory[0x2000] = 0x60  // decompressor stub
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 3000 && s6502.PC !== 0x1B40; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0x1B40)
    expect(memory[0x2079]).toBe(0x60)
    expect(memory[0xBC90]).toBe(0)
    expect(memory[0xBC91]).toBe(0)
  })

  test("launches Technocop with a forced reboot and no cheat hooks", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL_LC
      inc $3F4
      lda MachineStatus
      and #CHEATS_ENABLED
      pha
      lda #$60
      sta $A01
      +READ_ROM_NO_WRITE
      jsr $800
      pla
      beq +
      ldy #2
    - lda hook_cheat, y
      sta $FA85, y
      dey
      bpl -
    + +DISABLE_ACCEL_AND_HIDE_ARTWORK_LC
      jmp $F800
    `)
    expect(parsed).toBeDefined()
    if (!parsed || typeof parsed.entry !== "number") throw new Error("Technocop did not parse")

    const relay = createPackedBinaryRelay(2, 0x0800, 1, 0x70, parsed.sequence, parsed.entry)
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const prelaunchOffset = findSequence(relay, clearPrefix)

    reset6502()
    memory.fill(0)
    memory.set(relay.slice(prelaunchOffset), 0x0106)
    memory[0xDFB7] = 0x60
    memory[0xDFB4] = 0x60
    memory[0xDFAE] = 0x60
    memory.set([0x2C, 0x83, 0xC0, 0x2C, 0x83, 0xC0, 0x60], 0x0800)
    memory[0x03F4] = 0xA5
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 3000 && s6502.PC !== 0xF800; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0xF800)
    expect(memory[0x03F4]).toBe(0xA6)
    expect(memory[0x0A01]).toBe(0x60)
    expect(memory[0xFA85]).toBe(0)
  })

  test("launches Talon with a standalone $0100 reset wrapper", () => {
    const parsed = parsePrelaunchScript(`
      lda #$60
      sta $919B
      jsr $3FF8
      +RESET_VECTOR $100
      +GET_MACHINE_STATUS
      and #CHEATS_ENABLED
      beq +
      lda #$60
      sta $18E9
    + jmp $BE9B
    `)
    expect(parsed).toBeDefined()
    if (!parsed || typeof parsed.entry !== "number") throw new Error("Talon did not parse")

    const relay = createPackedBinaryRelay(2, 0x3FF8, 1, 0x70, parsed.sequence, parsed.entry)
    const copyOffset = findSequence(relay, [0xA2, 0x06, 0xBD])
    const copySource = readWord(relay, copyOffset + 3)
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const prelaunchOffset = findSequence(relay, clearPrefix)

    expect(copyOffset).toBeGreaterThan(0)
    expect(Array.from(relay.slice(copySource - 0x0300 + 1, copySource - 0x0300 + 7))).toEqual([
      0x8D, 0x82, 0xC0, 0x6C, 0xFC, 0xFF,
    ])

    reset6502()
    memory.fill(0)
    memory.set(relay, 0x0300)
    updateAddressTables()
    setPC(0x0300 + copyOffset)
    for (let instruction = 0; instruction < 32 && s6502.PC !== 0x0300 + copyOffset + 11; instruction++) {
      processInstruction()
    }
    expect(Array.from(memory.slice(0x0100, 0x0106))).toEqual([
      0x8D, 0x82, 0xC0, 0x6C, 0xFC, 0xFF,
    ])

    memory.set(relay.slice(prelaunchOffset), 0x0106)
    memory[0x3FF8] = 0x60
    setPC(0x0106)
    for (let instruction = 0; instruction < 3000 && s6502.PC !== 0xBE9B; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0xBE9B)
    expect(memory[0x919B]).toBe(0x60)
    expect(memory[0x18E9]).toBe(0)
    expect(Array.from(memory.slice(0x03F2, 0x03F5))).toEqual([0x00, 0x01, 0xA4])
  })

  test("launches Hard Hat Mack with its embedded patcher routine", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL_AND_HIDE_ARTWORK
      lda #<patcher
      sta $9431
      lda #>patcher
      sta $942E
      jsr $4856
    patcher rts
      lda #1
      sta $2218
      +DISABLE_ACCEL
      lda #$07
      pha
      lda #$FF
      pha
      rts
    `)
    expect(parsed).toBeDefined()
    if (!parsed || typeof parsed.entry !== "number") throw new Error("Hard Hat Mack did not parse")

    const relay = createPackedBinaryRelay(2, 0x4856, 1, 0x70, parsed.sequence, parsed.entry)
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const prelaunchOffset = findSequence(relay, clearPrefix)

    reset6502()
    memory.fill(0)
    memory.set(relay.slice(prelaunchOffset), 0x0106)
    memory[0xDFAE] = 0x60
    memory[0xDFB4] = 0x60
    memory[0xDFB7] = 0x60
    memory.set([
      0xAD, 0x2E, 0x94, 0x48, // LDA $942E; PHA
      0xAD, 0x31, 0x94, 0x48, // LDA $9431; PHA
      0x60,                   // RTS to byte after inline patcher RTS
    ], 0x4856)
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 3000 && s6502.PC !== 0x0800; instruction++) {
      processInstruction()
    }

    const patcherAddress = memory[0x9431] | (memory[0x942E] << 8)
    expect(s6502.PC).toBe(0x0800)
    expect(memory[patcherAddress]).toBe(0x60)
    expect(Array.from(memory.slice(patcherAddress + 1, patcherAddress + 6))).toEqual([
      0xA9, 0x01, 0x8D, 0x18, 0x22,
    ])
    expect(memory[0x2218]).toBe(0x01)
    expect(s6502.StackPtr).toBe(0xFD)
  })

  test("launches Spare Change through its stack callback", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL
      lda #$60
      sta $2778
      jsr $2700
      lda #>(callback - 1)
      pha
      lda #<(callback - 1)
      pha
      sec
      php
      jmp $BD26
    callback
      +DISABLE_ACCEL_AND_HIDE_ARTWORK
      jmp $2000
    `)
    expect(parsed).toBeDefined()
    if (!parsed || typeof parsed.entry !== "number") throw new Error("Spare Change did not parse")

    const harnessSequence = parsed.sequence.map((step) =>
      step.op === "call" || step.op === "decompress" ? { ...step, addr: 0x0200 } : step,
    )
    const relay = createPackedBinaryRelay(2, 0x2700, 1, 0x70, harnessSequence, parsed.entry)
    const clearPrefix = [0xA9, 0xA0, 0xA2, 0x00, 0x9D, 0x00, 0x04]
    const prelaunchOffset = findSequence(relay, clearPrefix)
    const stackJumpTailOffset = findSequence(relay, [0x38, 0x08, 0x4C, 0x26, 0xBD])
    const callbackAddress = 0x0106 + stackJumpTailOffset + 5 - prelaunchOffset
    const returnAddress = callbackAddress - 1

    expect(stackJumpTailOffset).toBeGreaterThan(prelaunchOffset)
    expect(relay[stackJumpTailOffset - 5]).toBe(returnAddress >> 8)
    expect(relay[stackJumpTailOffset - 2]).toBe(returnAddress & 0xFF)

    reset6502()
    memory.fill(0)
    memory.set(relay.slice(prelaunchOffset), 0x0106)
    memory[0x0200] = 0x60
    memory.set([0x28, 0x60], 0xBD26) // PLP; RTS to callback
    updateAddressTables()
    setPC(0x0106)
    for (let instruction = 0; instruction < 3000 && s6502.PC !== 0x2000; instruction++) {
      processInstruction()
    }

    expect(s6502.PC).toBe(0x2000)
    expect(memory[0x2778]).toBe(0x60)
    expect(s6502.StackPtr).toBe(0xFF)
  })

  test("encodes all packed blocks in the ProDOS MLI state", () => {
    const relay = createPackedBinaryRelay(2, 0x0800, 6, 0x70, [], -1)
    expect(findSequence(relay, [3, 0, 0, 8, 2, 0, 6, 0])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x20, 0x00, 0xBF, 0x80])).toBeGreaterThan(0)
    expect(findSequence(relay, [0x20, 0xC0, 0xC7])).toBe(-1)
  })
})