// Test script to verify stack wrapping behavior for JSL/RTL
const fs = require('fs');

// Read the compiled CPU code (we'll need to run this after build)
console.log('Stack Wrapping Test for JSL/RTL');
console.log('================================\n');

console.log('Expected behavior:');
console.log('1. JSL pushes PB (1 byte) then PC-1 (2 bytes) using Wide functions');
console.log('2. In Emulation mode with SP=$01FF:');
console.log('   - Push PB to $01FF, SP becomes $01FE');
console.log('   - Push PC-1 high byte to $01FE, SP becomes $01FD');
console.log('   - Push PC-1 low byte to $01FD, SP becomes $01FC');
console.log('   - normaliseStack() is called, SP stays $01FC (already in page 1)');
console.log('');
console.log('3. With SP=$0101:');
console.log('   - Push PB to $0101, SP becomes $0100');
console.log('   - Push PC-1 high byte to $0100, SP becomes $00FF');
console.log('   - Push PC-1 low byte to $00FF, SP becomes $00FE');
console.log('   - normaliseStack() wraps SP to $01FE');
console.log('');
console.log('Wrong behavior (old implementation):');
console.log('1. With SP=$0101:');
console.log('   - Push PB to $0101, wrap to $01FF immediately');
console.log('   - Push PC-1 high byte to $01FF, wrap to $01FE');
console.log('   - Push PC-1 low byte to $01FE, wrap to $01FD');
console.log('   Result: Return address is corrupted!');
console.log('');
console.log('To test: Run the emulator and check if RTL returns to correct addresses.');
console.log('Previous crash: RTL at ff:859d returned to ff:0005 (wrong)');
console.log('Expected: RTL should return to the address pushed by JSL');
