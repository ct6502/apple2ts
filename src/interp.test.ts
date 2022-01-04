import {doBranch, PC} from "./instructions";
import { parseAssembly } from "./assembler";

test('doBranch', () => {
  doBranch(0);
  expect(PC).toEqual(0x2000);
  doBranch(1);
  expect(PC).toEqual(0x2001);
  doBranch(127);
  expect(PC).toEqual(0x2001 + 127);
  doBranch(255);
  expect(PC).toEqual(0x2001 + 126);
  doBranch(128);
  expect(PC).toEqual(0x1FFF);
  doBranch(1);
  expect(PC).toEqual(0x2000);
});

test('parseAssembly address modes', () => {
  expect(parseAssembly(["BRK"])).toEqual([0x00])
  expect(parseAssembly(["LDA #65"])).toEqual([0xA9, 0x41])
  expect(parseAssembly(["LDA #$41"])).toEqual([0xA9, 0x41])
  expect(parseAssembly(["LDA $41"])).toEqual([0xA5, 0x41])
  expect(parseAssembly(["LDA $41,X"])).toEqual([0xB5, 0x41])
  expect(parseAssembly(["LDA $41,X"])).toEqual([0xB5, 0x41])
  expect(parseAssembly(["LDA $0041"])).toEqual([0xAD, 0x41, 0x00])
  expect(parseAssembly(["LDA $1234"])).toEqual([0xAD, 0x34, 0x12])
})
