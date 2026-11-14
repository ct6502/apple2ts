const fs = require('fs');
const c = fs.readFileSync('c:/dev/apple2ts/src/worker/roms/rom_gs.ts', 'utf8');
const str = c.split('`')[1].replace(/[\n\r\s]/g, '');
const buf = Buffer.from(str, 'base64');
console.log('ROM at FF:0010:', buf.slice(0x10010, 0x10020));
