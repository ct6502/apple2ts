import { memGet, memSet, memoryReset, memorySetForTests } from "./memory";

type ExpectValue = (i: number) => void

const doWriteIndexToMemory = (offset: number, start: number, end: number) => {
  for (let i = start; i <= end; i++) {
    const addr = (i * 256 + offset)
    memSet(addr, i)
  }
}

const doWriteValueToMemory = (offset: number, start: number, end: number, value: number) => {
  for (let i = start; i <= end; i++) {
    const addr = (i * 256 + offset)
    memSet(addr, value)
  }
}

const doTestMemory = (offset: number, start: number, end: number, expectValue: ExpectValue) => {
  for (let i = start; i <= end; i++) {
    const addr = (i * 256 + offset)
    expect(memGet(addr)).toEqual(expectValue(i));
  }
}

const expectIndex = (i: number = 0) => i

test('readMainMemIndex', () => {
  memorySetForTests()
  doTestMemory(0, 0, 0xBF, expectIndex)
  doTestMemory(1, 0, 0xBF, expectIndex)
  doTestMemory(0xFE, 0, 0xBF, expectIndex)
  doTestMemory(0xFF, 0, 0xBF, expectIndex)
})

test('readAuxMemEmpty', () => {
  memorySetForTests()
  // AUX read enable
  memSet(0xC003, 1)
  expect(memGet(0xC013)).toEqual(0x8d);
  doTestMemory(0, 0x02, 0xBF, () => 0xFF)
  // Pages 0 and 1 should still be from MAIN
  doTestMemory(0, 0, 0x01, expectIndex)
  // This should still write to MAIN
  doWriteIndexToMemory(0, 0, 0xBF)
  doTestMemory(0, 0x02, 0xBF, () => 0xFF)
  // MAIN read enable
  memSet(0xC002, 1)
  expect(memGet(0xC013)).toEqual(0x0d);
  // First value in each page of main should have that index
  doTestMemory(0, 0x02, 0xBF, expectIndex)
})

test('readAuxMemIndex', () => {
  // Put index in AUX; main should just be 0xFF's
  memorySetForTests(true)
  // AUX read enable
  memSet(0xC003, 1)
  doTestMemory(0, 0x02, 0xBF, expectIndex)
  doTestMemory(1, 0x02, 0xBF, expectIndex)
  doTestMemory(0xFE, 0x02, 0xBF, expectIndex)
  doTestMemory(0xFF, 0x02, 0xBF, expectIndex)
  memSet(0xC002, 1)
})

test('readMainMemEmpty', () => {
  // Put index in AUX; main should just be 0xFF's
  memorySetForTests(true)
  doTestMemory(0, 0, 0xBF, () => 0xFF)
})

test('readWriteMainMem', () => {
  memoryReset()
  doWriteIndexToMemory(0, 0, 0xBF)
  doTestMemory(0, 0, 0xBF, expectIndex)
  doWriteIndexToMemory(1, 0, 0xBF)
  doTestMemory(1, 0, 0xBF, expectIndex)
  doWriteIndexToMemory(0xFE, 0, 0xBF)
  doTestMemory(0xFE, 0, 0xBF, expectIndex)
  doWriteIndexToMemory(0xFF, 0, 0xBF)
  doTestMemory(0xFF, 0, 0xBF, expectIndex)
})

test('readWriteAuxMem', () => {
  memoryReset()
  // AUX write enable
  memSet(0xC005, 1)
  expect(memGet(0xC014)).toEqual(0x8d);
  doWriteIndexToMemory(0, 0, 0xBF)
  // Should still be reading from MAIN
  doTestMemory(0, 0x02, 0xBF, () => 0xFF)
  // AUX read enable
  memSet(0xC003, 1)
  doTestMemory(0, 0x02, 0xBF, expectIndex)
  // MAIN write enable, and write some values
  memSet(0xC004, 1)
  expect(memGet(0xC014)).toEqual(0x0d)
  doWriteValueToMemory(0, 0, 0xBF, 0xA0)
  // Should still be reading from AUX
  doTestMemory(0, 0x02, 0xBF, expectIndex)
  // MAIN read enable
  memSet(0xC002, 1)
  doTestMemory(0, 0x02, 0xBF, () => 0xA0)
})
