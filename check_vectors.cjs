const fs = require('fs');
const romFile = fs.readFileSync('src/worker/roms/rom_gs.ts', 'utf8');
const match = romFile.match(/export const romBase64=`\s*([\s\S]*?)\s*`/);
const rom = Buffer.from(match[1].replace(/[\n\r\s]/g, ''), 'base64');

console.log('Bytes at FF:0000-000F:');
for(let i=0; i<16; i++) process.stdout.write(rom[i].toString(16).padStart(2,'0')+' ');
console.log('\n');

console.log('Native mode vectors at FF:FFE0-FFFF:');
for(let i=0xFFE0; i<=0xFFFF; i++) {
    if((i-0xFFE0)%8===0) process.stdout.write('\n'+i.toString(16)+': ');
    process.stdout.write(rom[i].toString(16).padStart(2,'0')+' ');
}
console.log('\n');

// Check where FF:0005 points (it's executing BRK there)
console.log('Code at FF:0000-0010:');
for(let i=0; i<17; i++) {
    console.log(`FF:${i.toString(16).padStart(4,'0')}: ${rom[i].toString(16).padStart(2,'0')}`);
}
