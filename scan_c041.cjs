// Find every ROM site that writes $C041/$C047 (INTEN / CLEARINT)
const fs = require('fs');
const rom = fs.readFileSync('gs_system.bin');
const FF = 0x10000; // gs_system.bin layout: FE @0, FF @0x10000

// 16-bit absolute stores (operand low16 == 0xC041/0xC047)
const stores16 = {0x8D:'STA abs',0x9D:'STA abs,X',0x99:'STA abs,Y',0x9C:'STY abs',0x9E:'STX abs',0x94:'STY abs,X',0x96:'STX abs,Y',0x8C:'STY abs',0x8E:'STX abs'};
// long stores (24-bit operand == 0x00C041/0x00C047)
const storesL = {0x8F:'STA long',0x9F:'STA long,X',0x92:'STA dpy',0x62:'STA dp,y?'};

function scan() {
  const hits = [];
  for (let i = 0; i + 4 <= rom.length; i++) {
    const op = rom[i];
    if (stores16[op]) {
      const off = rom[i+1] | (rom[i+2] << 8);
      if (off === 0xC041 || off === 0xC047) hits.push({addr:'ff:'+(FF+i-0x10000).toString(16), op:stores16[op], off:off.toString(16)});
    }
    if (storesL[op]) {
      const addr = rom[i+1] | (rom[i+2] << 8) | (rom[i+3] << 16);
      if (addr === 0x00C041 || addr === 0x00C047) hits.push({addr:'ff:'+(FF+i-0x10000).toString(16), op:storesL[op], off:addr.toString(16)});
    }
    // TAS / TXA->? no. Also "STA $C041" via direct page when D=0: 85/95/91/92/81/87 with dp byte 0x41 is ambiguous; skip.
  }
  return hits;
}
console.log(JSON.stringify(scan(), null, 1));
