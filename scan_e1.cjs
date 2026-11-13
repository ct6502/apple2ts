const fs = require('fs');
const rom = fs.readFileSync('gs_system.bin');
// FF bank at 0x10000 for 128KB image
const FF = 0x10000;
function scanMvn() {
  const hits = [];
  for (let i = 0; i + 7 <= rom.length; i++) {
    const op = rom[i];
    if (op === 0x54 || op === 0x44) {
      const sB = rom[i+1], dB = rom[i+4];
      const sA = rom[i+2] | (rom[i+3] << 8);
      const dA = rom[i+5] | (rom[i+6] << 8);
      if (dB === 0xE1 && dA < 0x1000) {
        hits.push({addr: 0x10000 + i, op: op.toString(16), sB: sB.toString(16), sA: sA.toString(16), dB: dB.toString(16), dA: dA.toString(16)});
      }
    }
  }
  return hits;
}
function scanLongStores() {
  const stores = new Set([0x8F, 0x9F, 0x92, 0x62, 0x63, 0x5F]);
  const hits = [];
  for (let i = 0; i + 4 <= rom.length; i++) {
    const op = rom[i];
    if (stores.has(op)) {
      const addr = (rom[i+1] | (rom[i+2] << 8) | (rom[i+3] << 16));
      const bank = (addr >> 16) & 0xFF, off = addr & 0xFFFF;
      if (bank === 0xE1 && off < 0x100) {
        hits.push({addr: (0x10000 + i).toString(16), op: op.toString(16), target: addr.toString(16)});
      }
    }
  }
  return hits;
}
console.log('MVN/MVP -> E1 low:', JSON.stringify(scanMvn(), null, 1));
console.log('Long stores -> E1 <$100:', JSON.stringify(scanLongStores(), null, 1));
