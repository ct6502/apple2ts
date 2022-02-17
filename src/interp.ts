import { Accum, bank0, pcodes, PC, getInstrString, getProcessorStatus,
  incrementPC, toHex } from './instructions'

let doDebug = false
export const setDebug = (debug = true) => doDebug = debug;

const TEXT_PAGE1 = 0x400;
const TEXT_PAGE2 = 0x800;
const offset = [0, 0x80, 0x100, 0x180, 0x200, 0x280, 0x300, 0x380,
  0x28, 0xA8, 0x128, 0x1A8, 0x228, 0x2A8, 0x328, 0x3A8,
  0x50, 0xD0, 0x150, 0x1D0, 0x250, 0x2D0, 0x350, 0x3D0];

export function getTextPage(textPage2: boolean) {
  const textPage = new Uint8Array(960);
  for (let j = 0; j < 24; j++) {
    let start = (textPage2 ? TEXT_PAGE2 : TEXT_PAGE1) + offset[j]
    textPage.set(bank0.slice(start, start + 40), j * 40);
  }
  return textPage;
}

export function getHGR(page2: boolean) {
  const offset = page2 ? 0x4000 : 0x2000
  const hgrPage = new Uint8Array(40 * 192);
  for (let j = 0; j < 192; j++) {
    const addr = offset + 40 * (Math.trunc(j / 64)) +
      1024 * (j % 8) + 128 * (Math.trunc(j / 8) & 7)
    hgrPage.set(bank0.slice(addr, addr + 40), j*40)
  }
  return hgrPage;
}

export const processInstruction = () => {
  let cycles = 0;
  const instr = bank0[PC]
  const vLo = PC < 0xFFFF ? bank0[PC + 1] : 0
  const vHi = PC < 0xFFFE ? bank0[PC + 2] : 0
  const code = pcodes[instr];
  // Don't print debug during the Apple WAIT subroutine
  // const PClocal = PC
  // const bank0local = bank0
  if (code) {
    const PC1 = PC
    // if (PC1 === 0xF3F6) {
    //   doDebug = true
    //   console.log("stop!")
    // }
    cycles = code.execute(vLo, vHi);
    // Do not output during the Apple II's WAIT subroutine
    if (doDebug && (PC1 < 0xFCA8 || PC1 > 0xFCB3)) {
      const out = `${getProcessorStatus()}  ${getInstrString(instr, vLo, vHi)}`;
      console.log(out);
    }
    if (Accum > 255 || Accum < 0) {
      console.error("Out of bounds")
      return 0
    }
    incrementPC(code.PC);
  } else {
    console.error("Missing instruction: $" + toHex(instr) + " PC=" + toHex(PC, 4))
    return 0
  }
  return cycles
}
