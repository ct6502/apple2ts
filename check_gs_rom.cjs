// Check the IIgs ROM content
const fs = require('fs');

// Read the rom_gs.ts file
const romFile = fs.readFileSync('src/worker/roms/rom_gs.ts', 'utf8');

// Extract the base64 string
const match = romFile.match(/export const romBase64=`\s*([\s\S]*?)\s*`/);
if (!match) {
    console.error('Could not find romBase64 in file');
    process.exit(1);
}

const base64Data = match[1].replace(/[\n\r\s]/g, '');
console.log(`Base64 length: ${base64Data.length} chars`);

// Decode to binary
const rom = Buffer.from(base64Data, 'base64');
console.log(`ROM binary length: ${rom.length} bytes (${(rom.length/1024).toFixed(1)}KB)`);

// Check reset vector at $FFFC (Bank FF)
const resetVectorLo = rom[0xFFFC];
const resetVectorHi = rom[0xFFFD];
const resetVector = resetVectorLo | (resetVectorHi << 8);

console.log(`\nReset Vector at FF:FFFC = $${resetVectorHi.toString(16).padStart(2,'0')}${resetVectorLo.toString(16).padStart(2,'0')} (${resetVector.toString(16).padStart(4,'0')})`);

// Check BRK vector at $FFE6 (Bank FF)
const brkVectorLo = rom[0xFFE6];
const brkVectorHi = rom[0xFFE7];
const brkVector = brkVectorLo | (brkVectorHi << 8);

console.log(`BRK Vector at FF:FFE6 = $${brkVectorHi.toString(16).padStart(2,'0')}${brkVectorLo.toString(16).padStart(2,'0')} (${brkVector.toString(16).padStart(4,'0')})`);

// Check the code at reset vector location
console.log(`\nFirst 16 bytes of ROM:`);
for (let i = 0; i < 16; i++) {
    process.stdout.write(`${rom[i].toString(16).padStart(2,'0')} `);
}
console.log();

// Check bytes at $C071-$C07F (BRK/IRQ handler firmware)
console.log(`\nBytes at FF:C071-C07F (BRK/IRQ handler):`);
for (let i = 0xC071; i <= 0xC07F; i++) {
    process.stdout.write(`${rom[i].toString(16).padStart(2,'0')} `);
}
console.log();

// Check if ROM looks valid
if (resetVector === 0 || resetVector === 0xFFFF) {
    console.error('\n❌ ERROR: Reset vector is invalid!');
} else {
    console.log(`\n✅ Reset vector looks valid, points to $${resetVector.toString(16).padStart(4,'0')}`);
}
