import { pcodes } from "./instructions";
import { toHex, isRelativeInstr, MODE } from "./utility";

const parseOperand = (operand: string): [MODE, number] => {
  let mode: MODE = MODE.IMPLIED;
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
      mode = (operand.length > 3) ? MODE.ABS : MODE.ZP_REL
    }

    if (operand.startsWith('$')) {
      operand = "0x" + operand.substring(1)
    }
    value = parseInt(operand)
  }

  return [mode, value]
}


let labels: { [key: string]: number } = {};


const getInstructionModeValue =
  (pc: number, instr: string, operand: string, pass: 1 | 2): [MODE, number] => {
    let mode = MODE.IMPLIED
    let value = -1
    const opParts = operand.match(
      /(?<num>[#$0-9()]*)(?<label>[A-Z]*)(?<labelSym>[+-]*)(?<labelOperand>[0-9]*)/)?.groups
    if (opParts) {
      if (opParts.num) {
        [mode, value] = parseOperand(operand)
      } else if (opParts.label) {
        if (!(opParts.label in labels)) {
          if (pass === 2) {
            console.error("Missing label: " + opParts.label)
            return [mode, value]
          }
        } else {
          value = labels[opParts.label]
        }
        if (isRelativeInstr(instr)) {
          mode = MODE.ZP_REL
          value = (value - pc + 254) % 256
        } else {
          mode = MODE.ABS
        }
        if (opParts.labelSym && opParts.labelOperand) {
          if (opParts.labelSym === '+') {
            value += parseInt(opParts.labelOperand)
          } else if (opParts.labelSym === '-') {
            value -= parseInt(opParts.labelOperand)
          }
        }
      }
    }
    return [mode, value]
}

const parseOnce = (start: number, code: Array<string>, pass: 1 | 2): Array<number> => {
  let pc = start
  let instructions: Array<number> = [];
  code.forEach(line => {
    let newInstructions: Array<number> = [];
    let hexValue = ''

    line = (line.split(';'))[0].trimEnd().toUpperCase()

    let output = (line + '                   ').slice(0, 30) + toHex(pc, 4) + "- "

    const parts = line.match(/(?<label>[A-Z]*) *(?<instr>[A-Z]*) *(?<operand>.*)/)?.groups
    if (line && parts) {

      parts.operand = parts.operand.replace(/\s/g, '')
      if (parts.operand && !parts.instr) {
        console.error("Missing instruction: " + line)
        instructions = []
        return
      }

      if (parts.instr === 'ORG') {
        if (pass === 2) console.log(output)
        return
      }

      if (pass === 1 && parts.label) {
        if (parts.label in labels) {
          console.error("Redefined label: " + parts.label)
          instructions = []
          return
        }
        if (parts.instr === 'EQU') {
          const [mode, value] = parseOperand(parts.operand)
          if (mode !== MODE.ABS && mode !== MODE.ZP_REL) {
            console.error("Illegal EQU value: " + parts.operand)
            instructions = []
            return
          }
          labels[parts.label] = value
          console.log(output)
          return
        } else {
          labels[parts.label] = pc
        }
      }
      if (parts.instr === 'EQU') {
        return
      }

      const [mode, value] = getInstructionModeValue(pc, parts.instr, parts.operand, pass)

      let match = -1
      match = pcodes.findIndex(pc => pc && pc.name === parts.instr && pc.mode === mode)
      if (match >= 0) {
        const pcode = pcodes[match]
        newInstructions.push(match);
        output += toHex(match)
        if (value >= 0) {
          if (pcode.mode !== mode) {
            console.error("Mismatch between instruction and mode: " + line)
            instructions = []
            return
          }
          newInstructions.push(value % 256)
          output += ' ' + toHex(newInstructions[1])
          if (pcode.PC === 3) {
            newInstructions.push(Math.trunc(value / 256))
            output += ' ' + toHex(newInstructions[2])
            hexValue = toHex(value, 4)
          } else {
            output += "   "
            hexValue = toHex(value)
          }
        } else {
          output += "      "
        }
        pc += pcode.PC
      } else {
        console.error("Unknown instruction: " + line)
        instructions = []
        return
      }

      output += '  ' + parts.instr + (hexValue !== '' ? " $" + hexValue : '')
      if (pass === 2) console.log(output)
      instructions.push(...newInstructions)
    }
  });

  return instructions
}

export const parseAssembly = (start: number, code: Array<string>): Array<number> => {
  labels = {}
  parseOnce(start, code, 1)
  const instructions = parseOnce(start, code, 2)
  return instructions
}

