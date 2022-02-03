import { bank0, pcodes, PC, getInstrString, getProcessorStatus,
  incrementPC, isBreak, setBreak, toHex } from './instructions'

let doDebug = false
export const setDebug = (debug = true) => doDebug = debug;

const textPage = new Uint8Array(960);
const TEXT_PAGE1 = 0x400;
const offset = [0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380,
  0x28, 0xA8, 0x128, 0x1A8, 0x228, 0x2A8, 0x328, 0x3A8,
  0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350, 0x3D0];

export function getTextPage1() {
  for (let i = 0; i < 24; i++) {
    let start = TEXT_PAGE1 + offset[i]
    textPage.set(bank0.slice(start, start + 40), i * 40);
  }
  return textPage;
}

export const processInstruction = () => {
  if (!isBreak()) {
    const instr = bank0[PC]
    const vLo = PC < 0xFFFF ? bank0[PC + 1] : 0
    const vHi = PC < 0xFFFE ? bank0[PC + 2] : 0
    const code = pcodes[instr];
    if (doDebug) {
      const out = `${getProcessorStatus()}  ${getInstrString(instr, vLo, vHi)}`
      console.log(out);
    }
    if (!code) {
      console.error("Missing instruction: $" + toHex(instr))
      setBreak();
      return;
    }
    code.execute(vLo, vHi);
    incrementPC(code.PC);
  }
}
