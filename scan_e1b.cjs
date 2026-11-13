const fs = require('fs');
const rom = fs.readFileSync('gs_system.bin');
const FF = 0x10000;
// 16-bit stores with operand < $0100 (would hit E1 low when DB=$E1)
const stores16 = {0x9D:'STA abs16',0x99:'STA abs16,X',0x95:'STA abs,X',0x94:'STA abs,Y',0x9C:'STY abs16',0x9E:'STX abs16',0x8D:'STA abs16'};
function scan16() {
  const hits = [];
  for (let i = 0; i + 3 <= rom.length; i++) {
    const op = rom[i];
    if (stores16[op]) {
      const off = rom[i+1] | (rom[i+2] << 8);
      if (off < 0x100) hits.push({addr:(0x10000+i).toString(16), op:stores16[op], off:off.toString(16)});
    }
  }
  return hits;
}
// MVP (0x44) with dest bank E1, any offset
function scanMvp() {
  const hits = [];
  for (let i = 0; i + 7 <= rom.length; i++) {
    if (rom[i] === 0x44) {
      const sB = rom[i+1], dB = rom[i+4];
      const sA = rom[i+2] | (rom[i+3] << 8), dA = rom[i+5] | (rom[i+6] << 8);
      if (dB === 0xE1) hits.push({addr:(0x10000+i).toString(16), sB:sB.toString(16), sA:sA.toString(16), dA:dA.toString(16)});
    }
  }
  return hits;
}
// PHB-immediate patterns: 48 E1 (push imm #E1) — opcode 0x48 is PHB; immediate push is 0x48? No: PHB=0x48, push imm = 0x48? In 65816, PHX=0x48? Let's just find LDA #imm; PLB pairs
function scanLdaPlb() {
  const hits = [];
  for (let i = 0; i + 4 <= rom.length; i++) {
    // LDA #imm16 (A9) ... PLB (AB) within 6 bytes
    if (rom[i] === 0xA9) {
      const imm = rom[i+1] | (rom[i+2] << 8);
      for (let j = i+3; j <= i+6 && j+1 <= rom.length; j++) {
        if (rom[j] === 0xAB) { hits.push({addr:(0x10000+i).toString(16), imm:imm.toString(16)}); break; }
      }
    }
  }
  return hits;
}
console.log('16-bit stores -> off<$100:', JSON.stringify(scan16(), null, 1));
console.log('MVP -> E1:', JSON.stringify(scanMvp(), null, 1));
console.log('LDA #imm; PLB:', JSON.stringify(scanLdaPlb(), null, 1));
