// Disassemble around the reset vector
const fs = require('fs');

const romFile = fs.readFileSync('src/worker/roms/rom_gs.ts', 'utf8');
const match = romFile.match(/export const romBase64=`\s*([\s\S]*?)\s*`/);
const base64Data = match[1].replace(/[\n\r\s]/g, '');
const rom = Buffer.from(base64Data, 'base64');

console.log('Code at Reset Vector ($FA62):');
for (let i = 0xFA62; i < 0xFA62 + 32; i++) {
    process.stdout.write(`${i.toString(16).padStart(4,'0')}: ${rom[i].toString(16).padStart(2,'0')} `);
    if ((i - 0xFA62 + 1) % 8 === 0) console.log();
}
console.log();

console.log('\nCode at $B670-$B690 (where it gets stuck):');
for (let i = 0xB670; i < 0xB690; i++) {
    process.stdout.write(`${i.toString(16).padStart(4,'0')}: ${rom[i].toString(16).padStart(2,'0')} `);
    if ((i - 0xB670 + 1) % 8 === 0) console.log();
}
console.log();

console.log('\nBRK handler at $C071:');
for (let i = 0xC071; i < 0xC080; i++) {
    process.stdout.write(`${i.toString(16).padStart(4,'0')}: ${rom[i].toString(16).padStart(2,'0')} `);
    if ((i - 0xC071 + 1) % 8 === 0) console.log();
}
