import {doBranch, PC} from "./instructions";

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
