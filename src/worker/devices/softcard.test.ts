import { SoftCard } from "./softcard"

test("SoftCard initial state", () => {
  const card = new SoftCard(4)
  expect(card.slot).toBe(4)
  expect(card.activeCpu).toBe("6502")
})

test("SoftCard Z80 address remapping (web-a2e / MAME piecewise 6-bank mapping)", () => {
  const card = new SoftCard(4)

  // Z80 $0000-$AFFF -> Apple II $1000-$BFFF (44KB RAM)
  expect(card.translateZ80Address(0x0000)).toBe(0x1000)
  expect(card.translateZ80Address(0x2000)).toBe(0x3000)
  expect(card.translateZ80Address(0xafff)).toBe(0xbfff)

  // Z80 $B000-$BFFF -> Apple II $D000-$DFFF (Language Card bank 2)
  expect(card.translateZ80Address(0xb000)).toBe(0xd000)

  // Z80 $C000-$CFFF -> Apple II $E000-$EFFF (Language Card)
  expect(card.translateZ80Address(0xc000)).toBe(0xe000)

  // Z80 $D000-$DFFF -> Apple II $F000-$FFFF (Language Card)
  expect(card.translateZ80Address(0xd000)).toBe(0xf000)

  // Z80 $E000-$EFFF -> Apple II $C000-$CFFF (I/O space)
  expect(card.translateZ80Address(0xe000)).toBe(0xc000)
  expect(card.translateZ80Address(0xe400)).toBe(0xc400) // $En00 -> $Cn00

  // Z80 $F000-$FFFF -> Apple II $0000-$0FFF (Zero page / stack)
  expect(card.translateZ80Address(0xf000)).toBe(0x0000)
  expect(card.translateZ80Address(0xffff)).toBe(0x0fff)
})

test("SoftCard Z80 write to Apple II $Cn00 deactivates Z80", () => {
  const card = new SoftCard(4)
  card.activateZ80()
  expect(card.activeCpu).toBe("Z80")

  // Writing to Z80 $E400 (translates to Apple II $C400 for Slot 4) deactivates Z80
  card.writeByte(0xe400, 0x00)
  expect(card.activeCpu).toBe("6502")
})

test("Z80 execution NOP and LD instructions", () => {
  const memory = new Uint8Array(0x10000)
  const card = new SoftCard(4)
  card.setMemoryBus({
    read: (addr) => memory[addr],
    write: (addr, val) => { memory[addr] = val },
  })

  // Z80 PC starts at 0x0000, which maps to Apple II 0x1000
  // Write Z80 instructions at Apple II 0x1000:
  // 0x00: NOP
  // 0x3E 0x42: LD A, 0x42
  memory[0x1000] = 0x00 // NOP
  memory[0x1001] = 0x3e // LD A, 0x42
  memory[0x1002] = 0x42

  card.activateZ80()
  expect(card.z80.pc).toBe(0x0000)

  card.stepZ80() // NOP
  expect(card.z80.pc).toBe(0x0001)

  card.stepZ80() // LD A, 0x42
  expect(card.z80.pc).toBe(0x0003)
  expect(card.z80.a).toBe(0x42)
})
