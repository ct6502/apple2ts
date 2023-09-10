import { memGet, memSet, memoryReset, memorySetForTests, setSlotDriver } from "./memory";

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

test('testC800', () => {
  memoryReset()
  const slot1 = new Uint8Array(2*1024).fill(1)
  const slot2 = new Uint8Array(2*1024).fill(2)
  const slot3 = new Uint8Array(2*1024).fill(3)
  setSlotDriver(1, slot1)
  setSlotDriver(2, slot2)
  setSlotDriver(3, slot3)

  // start with INTCXROM and SLOTC3ROM clear
  memSet(0xC006,0)
  memSet(0xC00A,0)

  // check rom
  expect(memGet(0xC800)).toEqual(0x4C)
 
  // reset, should still be internal
  memGet(0xCFFF)
  expect(memGet(0xC800)).toEqual(0x4C)

  // reset, access S2, should switch to S2
  memGet(0xCFFF)
  memGet(0xC200)
  expect(memGet(0xC800)).toEqual(0x02)

  // access S1, should still be S2 without reset
  memGet(0xC100)
  expect(memGet(0xC800)).toEqual(0x02)

  // set INTC8ROM by accessing c3/w SLOTC3 off, should immediately switch
  memGet(0xC300)
  expect(memGet(0xC800)).toEqual(0x4C)

  // reset, access S1, should switch to S1
  memGet(0xCFFF)
  memGet(0xC100)
  expect(memGet(0xC800)).toEqual(0x01)

  // access S2, should still be S1
  memGet(0xC200)
  expect(memGet(0xC800)).toEqual(0x01)

  // TEST INTCXROM SIDE EFFECTS
  // set INTCXROM
  memSet(0xC007,0)

  // check rom
  expect(memGet(0xC800)).toEqual(0x4C)
 
  // reset, should still be internal
  memGet(0xCFFF)
  expect(memGet(0xC800)).toEqual(0x4C)

  // reset, access S2, should still be internal
  memGet(0xCFFF)
  memGet(0xC200)
  expect(memGet(0xC800)).toEqual(0x4c)

  // clear INTCXROM
  memSet(0xC006,0)

  // check rom
  expect(memGet(0xC800)).toEqual(0x4C)
 
  // reset, access S2, should be S2
  memGet(0xCFFF)
  memGet(0xC200)
  expect(memGet(0xC800)).toEqual(0x02)

  // set INTCXROM
  memSet(0xC007,0)

  // should be internal
  expect(memGet(0xC800)).toEqual(0x4C)

  // clear INTCXROM
  memSet(0xC006,0)

  // should still be S2
  expect(memGet(0xC800)).toEqual(0x02)

  // TEST INTC8ROM SIDE EFFECTS
  // set SLOTC3ROM
  memSet(0xC00B,0)
  expect(memGet(0xC300)).toEqual(0x03)
  // clear SLOTC3ROM
  memSet(0xC00A,0)
  expect(memGet(0xC300)).not.toEqual(0x03)

  memGet(0xCFFF)
  // set SLOTC3ROM
  memSet(0xC00B,0)
  expect(memGet(0xC300)).toEqual(0x03)
  expect(memGet(0xC800)).toEqual(0x03)

  // clear SLOTC3ROM
  memSet(0xC00A,0)
  expect(memGet(0xC300)).not.toEqual(0x03)

  // above get should also set INTC8ROM
  expect(memGet(0xC800)).not.toEqual(0x03)

  // access S2, should still be internal
  memGet(0xC200)
  expect(memGet(0xC800)).not.toEqual(0x02)
})
