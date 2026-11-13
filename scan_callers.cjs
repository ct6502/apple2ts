const fs = require('fs');
const rom = fs.readFileSync('gs_system.bin');
const FF = 0x10000;
function find(pat, label) {
  const hits = [];
  for (let i = 0; i + pat.length <= rom.length; i++) {
    let ok = true;
    for (let j = 0; j < pat.length; j++) if (rom[i+j] !== pat[j]) { ok = false; break; }
    if (ok) hits.push((0x10000 + i).toString(16));
  }
  console.log(label, JSON.stringify(hits));
}
// targets: a1b8 (installer), f882 (setdb e1)
find([0x20,0xb8,0xa1], 'JSR $a1b8:');
find([0x42,0xb8,0xa1], 'JSL $a1b8:');
find([0x22,0xb8,0xa1,0xff], 'JSL $ff a1b8:');
find([0x4c,0xb8,0xa1], 'JMP $a1b8:');
find([0x4d,0xb8,0xa1,0xff], 'JMP $ff a1b8:');
find([0x20,0x82,0xf8], 'JSR $f882:');
find([0x42,0x82,0xf8], 'JSL $f882:');
find([0x22,0x82,0xf8,0xff], 'JSL $ff f882:');
