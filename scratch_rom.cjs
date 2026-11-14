const fs = require('fs');
const b = fs.readFileSync('C:\\dev\\web-a2e\\roms\\342-0077-B.bin');
const b64 = b.toString('base64');
let lines = [];
for (let i = 0; i < b64.length; i += 64) {
    lines.push(b64.substring(i, i + 64));
}
fs.writeFileSync('C:\\dev\\apple2ts\\src\\worker\\roms\\rom_gs.ts', 'export const romBase64=`\n' + lines.join('\n') + '\n`;\n');
console.log('ROM 01 successfully converted!');
