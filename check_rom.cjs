const fs = require('fs');
const data = fs.readFileSync('c:/dev/apple2ts/src/worker/roms/rom_gs.ts', 'utf8');
const match = data.match(/export const romBase64=`([\s\S]+?)`/);
if (match) {
    const b64 = match[1].replace(/\n/g, '');
    const buf = Buffer.from(b64, 'base64');
    console.log('8300:', buf.slice(0x8300, 0x8320).toString('hex').match(/../g).join(' '));
}
