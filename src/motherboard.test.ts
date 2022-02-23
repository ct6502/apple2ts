import {bank0, processInstruction} from "./motherboard";
import {PC, setPC, Accum} from "./instructions";
import {parseAssembly} from "./assembler";

test('processInstruction', () => {
  let pcode = parseAssembly(0x2000, [" LDA #$C0"]);
  bank0.set(pcode, 0x2000);
  setPC(0x2000);
  processInstruction()
  expect(PC).toEqual(0x2002);
  expect(Accum).toEqual(0xC0);
});
