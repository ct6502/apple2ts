// Minimal 65816 disassembler for ROM inspection (bank FF)
// Usage: node disasm_gs.cjs [start] [end]   (hex, default 8400-8600)
const fs = require('fs');

// Optional --file=<path.bin> to disassemble a raw binary (bank FF = last 64KB).
const fileArg = (process.argv.find(a => a.startsWith('--file=')) || '').slice(7);
let rom;
if (fileArg) {
  rom = fs.readFileSync(fileArg);
} else {
  const romFile = fs.readFileSync('src/worker/roms/rom_gs.ts', 'utf8');
  const match = romFile.match(/export const romBase64=`\s*([\s\S]*?)\s*`/);
  const base64Data = match[1].replace(/[\n\r\s]/g, '');
  rom = Buffer.from(base64Data, 'base64');
}
// Bank FF offset: ts file maps FF to the first 64KB; raw images put FE first.
const FF = fileArg ? (rom.length >= 0x40000 ? 0x30000 : 0x10000) : 0;
const rd = (i) => rom[FF + i];

const WIDE = !process.argv.includes('--8'); // --8 = 8-bit acc+index (emulation mode)
const posArgs = process.argv.slice(2).filter(a => !a.startsWith('--'));
const start = parseInt(posArgs[0] || '8400', 16);
const end = parseInt(posArgs[1] || '8600', 16);

const T = {
  0x00:['brk','imp'],0x02:['cop','imp'],0x04:['tsb','dp'],0x05:['ora','dp'],0x06:['ora','dpx'],0x07:['ora','dpindlong'],
  0x08:['php','imp'],0x09:['ora','imm8'],0x0a:['asl','acc'],0x0b:['phd','imp'],0x0c:['tsb','abs'],0x0d:['ora','abs'],
  0x0e:['ora','absx'],0x0f:['ora','absl'],0x10:['bpl','rel'],0x11:['ora','dpindidx'],0x12:['ora','dpind'],
  0x13:['ora','stkidx'],0x14:['trb','dp'],0x15:['ora','dpx'],0x16:['ora','dpx'],0x17:['ora','dpindidxlong'],
  0x18:['clc','imp'],0x19:['ora','absy'],0x1a:['inc','acc'],0x1b:['tcs','imp'],0x1c:['trb','abs'],0x1d:['ora','absx'],
  0x1e:['ora','absx'],0x1f:['ora','abslx'],0x20:['jsr','abs'],0x21:['and','dpidxind'],0x22:['jsl','absl'],
  0x23:['and','stk'],0x24:['bit','dp'],0x25:['and','dp'],0x26:['and','dpx'],0x27:['and','dpindlong'],0x28:['plp','imp'],
  0x29:['and','imm8'],0x2a:['rol','acc'],0x2b:['pld','imp'],0x2c:['bit','abs'],0x2d:['and','abs'],0x2e:['and','absx'],
  0x2f:['and','absl'],0x30:['bmi','rel'],0x31:['and','dpindidx'],0x32:['and','dpind'],0x33:['and','stkidx'],
  0x34:['bit','dpx'],0x35:['and','dpx'],0x36:['and','dpx'],0x37:['and','dpindidxlong'],0x38:['sec','imp'],
  0x39:['and','absy'],0x3a:['dec','acc'],0x3b:['tsc','imp'],0x3c:['bit','absx'],0x3d:['and','absx'],0x3e:['and','absx'],
  0x3f:['and','abslx'],0x40:['rti','imp'],0x41:['eor','dpidxind'],0x42:['wdm','imm8'],0x43:['eor','stk'],
  0x44:['mvp','imp2'],0x45:['eor','dp'],0x46:['eor','dpx'],0x47:['eor','dpindlong'],0x48:['pha','imp'],
  0x49:['eor','imm8'],0x4a:['lsr','acc'],0x4b:['phk','imp'],0x4c:['jmp','abs'],0x4d:['eor','abs'],0x4e:['eor','absx'],
  0x4f:['eor','absl'],0x50:['bvc','rel'],0x51:['eor','dpindidx'],0x52:['eor','dpind'],0x53:['eor','stkidx'],
  0x54:['mvn','imp2'],0x55:['eor','dpx'],0x56:['eor','dpx'],0x57:['eor','dpindidxlong'],0x58:['cli','imp'],
  0x59:['eor','absy'],0x5a:['phy','imp'],0x5b:['tcd','imp'],0x5c:['jml','absl'],0x5d:['eor','absx'],0x5e:['eor','absx'],
  0x5f:['eor','abslx'],0x60:['rts','imp'],0x61:['adc','dpidxind'],0x62:['per','rel16'],0x63:['adc','stk'],
  0x64:['stz','dp'],0x65:['adc','dp'],0x66:['adc','dpx'],0x67:['adc','dpindlong'],0x68:['pla','imp'],
  0x69:['adc','imm8'],0x6a:['ror','acc'],0x6b:['rtl','imp'],0x6c:['jmp','absind'],0x6d:['adc','abs'],0x6e:['adc','absx'],
  0x6f:['adc','absl'],0x70:['bvs','rel'],0x71:['adc','dpindidx'],0x72:['adc','dpind'],0x73:['adc','stkidx'],
  0x74:['stz','dpx'],0x75:['adc','dpx'],0x76:['adc','dpx'],0x77:['adc','dpindidxlong'],0x78:['sei','imp'],
  0x79:['adc','absy'],0x7a:['ply','imp'],0x7b:['tdc','imp'],0x7c:['jmp','absidx'],0x7d:['adc','absx'],0x7e:['adc','absx'],
  0x7f:['adc','abslx'],0x80:['bra','rel'],0x81:['sta','dpidxind'],0x82:['brl','rel16'],0x83:['sta','stk'],
  0x84:['sty','dp'],0x85:['sta','dp'],0x86:['stx','dp'],0x87:['sta','dpindlong'],0x88:['dey','imp'],
  0x89:['bit','imm8'],0x8a:['txa','imp'],0x8b:['phb','imp'],0x8c:['sty','abs'],0x8d:['sta','abs'],0x8e:['stx','abs'],
  0x8f:['sta','absl'],0x90:['bcc','rel'],0x91:['sta','dpindidx'],0x92:['sta','dpind'],0x93:['sta','stkidx'],
  0x94:['sty','dpx'],0x95:['sta','dpx'],0x96:['stx','dpy'],0x97:['sta','dpindidxlong'],0x98:['tya','imp'],
  0x99:['sta','absy'],0x9a:['txs','imp'],0x9b:['txy','imp'],0x9c:['stz','abs'],0x9d:['sta','absx'],0x9e:['stz','absx'],
  0x9f:['sta','abslx'],0xa0:['ldy','imm16'],0xa1:['lda','dpidxind'],0xa2:['ldx','imm16'],0xa3:['lda','stk'],
  0xa4:['ldy','dp'],0xa5:['lda','dp'],0xa6:['ldx','dp'],0xa7:['lda','dpindlong'],0xa8:['tay','imp'],
  0xa9:['lda','imm16'],0xaa:['tax','imp'],0xab:['plb','imp'],0xac:['ldy','abs'],0xad:['lda','abs'],0xae:['ldx','abs'],
  0xaf:['lda','absl'],0xb0:['bcs','rel'],0xb1:['lda','dpindidx'],0xb2:['lda','dpind'],0xb3:['lda','stkidx'],
  0xb4:['ldy','dpx'],0xb5:['lda','dpx'],0xb6:['ldx','dpy'],0xb7:['lda','dpindidxlong'],0xb8:['clv','imp'],
  0xb9:['lda','absy'],0xba:['tsx','imp'],0xbb:['tyx','imp'],0xbc:['ldy','absx'],0xbd:['lda','absx'],0xbe:['ldx','absy'],
  0xbf:['lda','abslx'],0xc0:['cpy','imm16'],0xc1:['cmp','dpidxind'],0xc2:['rep','imm8'],0xc3:['cmp','stk'],
  0xc4:['cpy','dp'],0xc5:['cmp','dp'],0xc6:['dec','dp'],0xc7:['cmp','dpindlong'],0xc8:['iny','imp'],
  0xc9:['cmp','imm16'],0xca:['dex','imp'],0xcb:['wai','imp'],0xcc:['cpy','abs'],0xcd:['cmp','abs'],0xce:['dec','abs'],
  0xcf:['cmp','absl'],0xd0:['bne','rel'],0xd1:['cmp','dpindidx'],0xd2:['cmp','dpind'],0xd3:['cmp','stkidx'],
  0xd4:['pei','dp'],0xd5:['cmp','dpx'],0xd6:['cmp','dpx'],0xd7:['cmp','dpindidxlong'],0xd8:['cld','imp'],
  0xd9:['cmp','absy'],0xda:['phx','imp'],0xdb:['stp','imp'],0xdc:['jml','abslind'],0xdd:['cmp','absx'],0xde:['cmp','absx'],
  0xdf:['cmp','abslx'],0xe0:['cpx','imm16'],0xe1:['sbc','dpidxind'],0xe2:['sep','imm8'],0xe3:['sbc','stk'],
  0xe4:['cpx','dp'],0xe5:['sbc','dp'],0xe6:['sbc','dp'],0xe7:['sbc','dpindlong'],0xe8:['inx','imp'],
  0xe9:['sbc','imm16'],0xea:['nop','imp'],0xeb:['xba','imp'],0xec:['cpx','abs'],0xed:['sbc','abs'],0xee:['sbc','abs'],
  0xef:['sbc','absl'],0xf0:['beq','rel'],0xf1:['sbc','dpindidx'],0xf2:['sbc','dpind'],0xf3:['sbc','stkidx'],
  0xf4:['pea','imm16'],0xf5:['sbc','dpx'],0xf6:['sbc','dpx'],0xf7:['sbc','dpindidxlong'],0xf8:['sed','imp'],
  0xf9:['sbc','absy'],0xfa:['plx','imp'],0xfb:['xce','imp'],0xfc:['jsr','absidx'],0xfd:['sbc','absx'],0xfe:['sbc','absx'],
  0xff:['sbc','abslx'],
};

let pc = start;
while (pc <= end) {
  const op = rd(pc);
  const [mn, mode] = T[op] || ['???','imp'];
  let bytes = [op];
  let arg = '';
  const g8 = (i) => rd(pc + i);
  const g16 = (i) => rd(pc + i) | (rd(pc + i + 1) << 8);
  const hx8 = (v) => v.toString(16).padStart(2, '0');
  const hx16 = (v) => v.toString(16).padStart(4, '0');
  const hx24 = (v) => v.toString(16).padStart(6, '0');
  switch (mode) {
    case 'imp': break;
    case 'acc': arg = 'A'; break;
    case 'imm8': arg = '#$' + hx8(g8(1)); bytes.push(rd(pc+1)); break;
    case 'imm16':
      if (!WIDE) { arg = '#$' + hx8(g8(1)); bytes.push(rd(pc+1)); }
      else { arg = '#$' + hx16(g16(1)); bytes.push(rd(pc+1), rd(pc+2)); }
      break;
    case 'absl': arg = '$' + hx24(g16(1) | (g8(3) << 16)); bytes.push(rd(pc+1), rd(pc+2), rd(pc+3)); break;
    case 'abslx': arg = '$' + hx24(g16(1) | (g8(3) << 16)) + ',X'; bytes.push(rd(pc+1), rd(pc+2), rd(pc+3)); break;
    case 'dp': arg = '$' + hx8(g8(1)); bytes.push(rd(pc+1)); break;
    case 'dpx': arg = '$' + hx8(g8(1)) + ',X'; bytes.push(rd(pc+1)); break;
    case 'dpy': arg = '$' + hx8(g8(1)) + ',Y'; bytes.push(rd(pc+1)); break;
    case 'dpind': arg = '($' + hx8(g8(1)) + ')'; bytes.push(rd(pc+1)); break;
    case 'dpindlong': arg = '[$' + hx8(g8(1)) + ']'; bytes.push(rd(pc+1)); break;
    case 'dpidxind': arg = '($' + hx8(g8(1)) + ',X)'; bytes.push(rd(pc+1)); break;
    case 'dpindidx': arg = '($' + hx8(g8(1)) + '),Y'; bytes.push(rd(pc+1)); break;
    case 'dpindidxlong': arg = '[$' + hx8(g8(1)) + '],Y'; bytes.push(rd(pc+1)); break;
    case 'abs': arg = '$' + hx16(g16(1)); bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'absx': arg = '$' + hx16(g16(1)) + ',X'; bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'absy': arg = '$' + hx16(g16(1)) + ',Y'; bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'absind': arg = '($' + hx16(g16(1)) + ')'; bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'absidx': arg = '($' + hx16(g16(1)) + ',X)'; bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'abslind': arg = '[$' + hx16(g16(1)) + ']'; bytes.push(rd(pc+1), rd(pc+2)); break;
    case 'rel': { let o = g8(1); if (o & 0x80) o -= 0x100; arg = '$' + hx16((pc + 2 + o) & 0xFFFF); bytes.push(rd(pc+1)); break; }
    case 'rel16': { let o = g16(1); if (o & 0x8000) o -= 0x10000; arg = '$' + hx16((pc + 3 + o) & 0xFFFF); bytes.push(rd(pc+1), rd(pc+2)); break; }
    case 'stk': arg = '$' + hx8(g8(1)) + ',S'; bytes.push(rd(pc+1)); break;
    case 'stkidx': arg = '($' + hx8(g8(1)) + ',S),Y'; bytes.push(rd(pc+1)); break;
    case 'imp2': arg = '$' + hx8(g8(1)) + ',$' + hx8(g8(2)); bytes.push(rd(pc+1), rd(pc+2)); break;
  }
  const hex = bytes.map(b => hx8(b)).join(' ').padEnd(9);
  console.log(`ff:${hx16(pc)}:  ${hex}  ${mn.padEnd(5)} ${arg}`);
  pc += bytes.length;
}
