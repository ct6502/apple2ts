// Check what opcode is at ff:b5e0
const fs = require('fs');

// Read gsROM from public/roms
const romPath = 'public/roms/Apple IIgs ROM 3.dsk';
if (!fs.existsSync(romPath)) {
    console.log('ROM file not found at', romPath);
    console.log('Please provide base64 ROM or file path');
    process.exit(1);
}

// For now, just note what we should check
console.log('Need to check ROM at offset corresponding to FF:B5E0');
console.log('ROM is 128KB (0x20000 bytes)');
console.log('Bank FF starts at offset 0x1F0000 in 24-bit address space');
console.log('But in our 128KB ROM:');
console.log('  Bank FE = offset 0x00000-0x0FFFF');
console.log('  Bank FF = offset 0x10000-0x1FFFF');
console.log('So FF:B5E0 = offset 0x1B5E0 in ROM');
console.log('');
console.log('Byte at 0x1B5E0 should be checked');
console.log('If it is 0x6B, then it IS an RTL instruction');
console.log('If not, there is a PC corruption or opcode decode bug');
