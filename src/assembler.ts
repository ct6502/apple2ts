import { pcodes, MODE } from "./instructions";

const parseOperand = (operand: string): [MODE, number] => {
  let mode: MODE = MODE.IMP;
  let value = -1

  if (operand.length > 0) {
    if (operand.startsWith('#')) {
      mode = MODE.IMM
      operand = operand.substring(1)
    } else if (operand.startsWith('(')) {
      if (operand.endsWith(",Y")) {
        mode = MODE.IND_Y
      } else if (operand.endsWith(",X)")) {
        mode = MODE.IND_X
      } else {
        mode = MODE.IND
      }
      operand = operand.substring(1)
    } else if (operand.endsWith(",X")) {
      mode = (operand.length > 5) ? MODE.ABS_X : MODE.ZP_X
    } else if (operand.endsWith(",Y")) {
      mode = (operand.length > 5) ? MODE.ABS_Y : MODE.ZP_Y
    } else {
      mode = (operand.length > 3) ? MODE.ABS : MODE.ZP
    }

    if (operand.startsWith('$')) {
      operand = "0x" + operand.substring(1)
    }
    value = parseInt(operand)
  }

  return [mode, value]
}

export const parseAssembly = (code: Array<string>): Array<number> => {
  let instructions: Array<number> = [];
  code.forEach(line => {
    line = line.trim()
    if (line.length > 0) {
      const instr = line.substring(0, 3)
      const operand = line.substring(4)
      const [mode, value] = parseOperand(operand)

      let match = -1
      match = pcodes.findIndex(pc => pc && pc.name === instr && pc.mode === mode)
      if (match >= 0) {
        const pcode = pcodes[match]
        instructions.push(match);
        if (value >= 0) {
          if (pcode.mode !== mode) {
            console.error("Mismatch between instruction and mode: " + line)
            instructions = []
            return
          }
          instructions.push(value % 256)
          if (pcode.PC === 3) {
            instructions.push(Math.trunc(value / 256))
          }
        }
      } else {
        console.error("Unknown instruction: " + line)
        instructions = []
        return
      }
    }
  });

  return instructions
}
