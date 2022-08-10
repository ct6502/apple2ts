import { pcodes } from "./instructions";
import { MODE } from "./utility";
import { parseAssembly } from "./assembler";

test('parseAssembly address modes', () => {
  let a = parseAssembly(0x2000, [" BRK"])
  expect(a).toEqual([0x00])
  expect(pcodes[a[0]].mode).toEqual(MODE.IMPLIED)

  a = parseAssembly(0x2000, [" LDA #65"])
  expect(a).toEqual([0xA9, 0x41])
  expect(pcodes[a[0]].mode).toEqual(MODE.IMM)

  a = parseAssembly(0x2000, [" LDA #$C0"])
  expect(a).toEqual([0xA9, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.IMM)

  a = parseAssembly(0x2000, [" LDA $C0"])
  expect(a).toEqual([0xA5, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.ZP_REL)

  a = parseAssembly(0x2000, [" LDA $C0,X"])
  expect(a).toEqual([0xB5, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.ZP_X)

  a = parseAssembly(0x2000, [" LDX $C0,Y"])
  expect(a).toEqual([0xB6, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.ZP_Y)

  a = parseAssembly(0x2000, [" LDA $00C0"])
  expect(a).toEqual([0xAD, 0xC0, 0x00])
  expect(pcodes[a[0]].mode).toEqual(MODE.ABS)

  a = parseAssembly(0x2000, [" LDA $1234"])
  expect(a).toEqual([0xAD, 0x34, 0x12])
  expect(pcodes[a[0]].mode).toEqual(MODE.ABS)

  a = parseAssembly(0x2000, [" LDA $1234,X"])
  expect(a).toEqual([0xBD, 0x34, 0x12])
  expect(pcodes[a[0]].mode).toEqual(MODE.ABS_X)

  a = parseAssembly(0x2000, [" LDA $1234,Y"])
  expect(a).toEqual([0xB9, 0x34, 0x12])
  expect(pcodes[a[0]].mode).toEqual(MODE.ABS_Y)

  a = parseAssembly(0x2000, [" LDA ($C0,X)"])
  expect(a).toEqual([0xA1, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.IND_X)

  a = parseAssembly(0x2000, [" LDA ($C0),Y"])
  expect(a).toEqual([0xB1, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.IND_Y)

  a = parseAssembly(0x2000, [" JMP ($1234)"])
  expect(a).toEqual([0x6C, 0x34, 0x12])
  expect(pcodes[a[0]].mode).toEqual(MODE.IND)

  a = parseAssembly(0x2000, [" LDA ($C0)"])
  expect(a).toEqual([0xB2, 0xC0])
  expect(pcodes[a[0]].mode).toEqual(MODE.IND)

  a = parseAssembly(0x2000, [" JMP ($1234,X)"])
  expect(a).toEqual([0x7C, 0x34, 0x12])
  expect(pcodes[a[0]].mode).toEqual(MODE.IND_X)

})
