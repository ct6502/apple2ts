import { pcodes } from "./instructions"
import { memGetRaw } from "./memory"
import { MODE, toHex } from "./utility"

const nlines = 65536  // should this be an argument?

export const getDisassembly = (addr: number) => {
  if (addr === -1) return ''
  const start = new Date();
  if (addr === -2) addr = 0;//s6502.PC
  let r = ''
  for (let i=0; i < nlines; i++) {
    const instr = memGetRaw(addr)
    // const vLo = memGet(addr + 1)
    // const vHi = memGet(addr + 2)
    const code =  pcodes[instr]
    if (!code) {
      console.log("oh oh")
    }
    const vLo = (code.PC >= 2) ? toHex(memGetRaw(addr + 1)) : '  '
    const vHi = (code.PC === 3) ? toHex(memGetRaw(addr + 2)) : '  '
    let value = ''
    switch (code.mode) {
      case MODE.IMPLIED: break  // BRK
      case MODE.IMM: value = `#$${vLo}`; break      // LDA #$01
      case MODE.ZP_REL: value = `$${vLo}`; break   // LDA $C0 or BCC $FF
      case MODE.ZP_X: value = `$${vLo},X`; break     // LDA $C0,X
      case MODE.ZP_Y: value = `$${vLo},Y`; break     // LDX $C0,Y
      case MODE.ABS: value = `$${vHi}${vLo}`; break      // LDA $1234
      case MODE.ABS_X: value = `$${vHi}${vLo},X`; break    // LDA $1234,X
      case MODE.ABS_Y: value = `$${vHi}${vLo},Y`; break    // LDA $1234,Y
      case MODE.IND_X: value = `($${vHi.trim()}${vLo},X)`; break    // LDA ($FF,X) or JMP ($1234,X)
      case MODE.IND_Y: value = `($${vLo}),Y`; break    // LDA ($FF),Y
      case MODE.IND: value = `($${vHi.trim()}${vLo})`; break       // JMP ($1234) or LDA ($C0)
    }
//    r += (i === 10) ? '⬤ ' : ((i === 12) ? '▬▬▶' : '   ')
    r += `${i} ${toHex(addr, 4)}: ${toHex(instr)} ${vLo} ${vHi}  ${code.name} ${value}\n`
    addr += code.PC
    if (addr > 65535) break;
  }

  const end = new Date()
  console.log(` time = ${end.getMilliseconds() - start.getMilliseconds()}`)

  return r
}
