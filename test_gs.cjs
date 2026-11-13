const fs = require('fs');
const content = fs.readFileSync('c:/dev/apple2ts/src/worker/roms/rom_gs.ts', 'utf8');
const lines = content.split('\n');
let str = '';
for (let line of lines) {
    if (line.includes('export const romBase64')) continue;
    str += line.trim().replace(/"/g, '').replace(/\+/g, '').replace(/;/g, '');
}
const buf = Buffer.from(str, 'base64');
console.log('Decoded length:', buf.length);
