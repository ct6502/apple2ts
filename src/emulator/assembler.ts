import { pcodes } from "./instructions";
import { toHex, isRelativeInstr, MODE } from "./utility";

const doOutput = false

type CodeLine = {
  label: string,
  instr: string,
  operand: string,
}

type LabelOperand = {
  label: string,
  operation: string,
  value: number,
  idx: string
}

const splitOperand = (operand: string) => {
  let idx = operand.split(',')
  const s = idx[0].split(/([+-])/)
  const codeLine: LabelOperand = {
    label: s[0] ? s[0] : '',
    operation: s[1] ? s[1] : '',
    value: s[2] ? parseInt(s[2].replace('#','').replace('$','0x')) : 0,
    idx: idx[1] ? idx[1] : ''
  }
  return codeLine
}

const parseNumberOptionalAddressMode = (operand: string): [MODE, number] => {
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

    const valueOperand = splitOperand(operand)
    if (valueOperand.operation && valueOperand.value) {
      switch (valueOperand.operation) {
        case '+': value += valueOperand.value
          break;
        case '-': value -= valueOperand.value
          break;
        default:
          throw new Error("Unknown operation in operand: " + operand);
      }
      value = (value % 65536 + 65536) % 65536
    }
  }

  return [mode, value]
}

let labels: { [key: string]: number } = {};

const getOperandModeValue =
  (pc: number, instr: string, operand: string, pass: 1 | 2): [MODE, number] => {
    let mode = MODE.IMPLIED
    let value = -1
    if (operand.match(/^[#]?[$0-9()]+/)) {
      return parseNumberOptionalAddressMode(operand)
    }
    const labelOperand = splitOperand(operand)
    if (labelOperand.label) {
      // See if we have an immediate value, like #CONST, <CONST >CONST
      const lb = labelOperand.label.startsWith('<')
      const hb = labelOperand.label.startsWith('>')
      const isImmediate = labelOperand.label.startsWith('#') || hb || lb
      if (isImmediate) {
        labelOperand.label = labelOperand.label.substring(1)
      }
      if (labelOperand.label in labels) {
        value = labels[labelOperand.label]
        if (hb) {
          value = (value >> 8) & 0xff
        } else if (lb) {
          value = value & 0xff
        }
      } else if (pass === 2) {
        throw new Error("Missing label: " + labelOperand.label);
      }
      if (labelOperand.operation && labelOperand.value) {
        switch (labelOperand.operation) {
          case '+': value += labelOperand.value
            break;
          case '-': value -= labelOperand.value
            break;
          default:
            throw new Error("Unknown operation in operand: " + operand);
        }
        value = (value % 65536 + 65536) % 65536
      }
      if (isRelativeInstr(instr)) {
        mode = MODE.ZP_REL
        value = (value - pc + 254)
        if (value > 255) value -= 256
      } else {
        if (isImmediate) {
          mode = MODE.IMM
        } else {
          mode = (value >= 0 && value <= 255) ? MODE.ZP_REL : MODE.ABS
          mode = (labelOperand.idx === 'X') ? (mode === MODE.ABS ? MODE.ABS_X : MODE.ZP_X) : mode
          mode = (labelOperand.idx === 'Y') ? (mode === MODE.ABS ? MODE.ABS_Y : MODE.ZP_Y) : mode
        }
      }
    }
    return [mode, value]
}

const splitLine = (line: string, prevLabel: string) => {
  line = line.replace(/\s+/g, ' ')
  const s = line.split(' ')
  const codeLine: CodeLine = {
    label: s[0] ? s[0] : prevLabel,
    instr: s[1] ? s[1] : '',
    operand: s[2] ? s[2] : ''
  }
  return codeLine
}

const handleLabel = (parts: CodeLine, pc: number) => {
  if (parts.label in labels) {
    throw new Error("Redefined label: " + parts.label)
  }
  if (parts.instr === 'EQU') {
    //const [mode, value] = parseNumberOptionalAddressMode(parts.operand)
    const [mode, value] = getOperandModeValue(pc, parts.instr, parts.operand, 2)
    if (mode !== MODE.ABS && mode !== MODE.ZP_REL) {
      throw new Error("Illegal EQU value: " + parts.operand)
    }
    // console.log(`LABEL=${parts.label} VALUE=${value.toString(16)}`)
    labels[parts.label] = value
  } else {
    // console.log(`LABEL=${parts.label} PC=${pc.toString(16)}`)
    labels[parts.label] = pc
  }
}

const getHexCodesForInstruction = (match: number, value: number) => {
  const newInstructions: Array<number> = [];
  const pcode = pcodes[match]
  newInstructions.push(match);
  if (value >= 0) {
    newInstructions.push(value % 256)
    if (pcode.PC === 3) {
      newInstructions.push(Math.trunc(value / 256))
    }
  }
  return newInstructions
}

const parseOnce = (start: number, code: Array<string>, pass: 1 | 2): Array<number> => {
  let pc = start
  const instructions: Array<number> = [];
  let prevLabel = ''
  code.forEach(line => {
    line = (line.split(';'))[0].trimEnd().toUpperCase()
    if (!line) return
    let output = (line + '                   ').slice(0, 30) + toHex(pc, 4) + "- "

    const codeLine = splitLine(line, prevLabel)
    prevLabel = ''

    // Just a label by itself, just tack onto the beginning of next line.
    if (!codeLine.instr) {
      prevLabel = codeLine.label
      return
    }

    if (codeLine.instr === 'ORG') {
      if (doOutput && pass === 2) console.log(output)
      return
    }

    if (pass === 1 && codeLine.label) {
      handleLabel(codeLine, pc)
    }

    if (codeLine.instr === 'EQU') {
      return
    }

    let newInstructions: Array<number> = []
    let mode: MODE
    let value: number

    // Check psdudo-ops first
    // ASC is merlin syntax, and so is '' vs ""
    if (codeLine.instr === 'ASC' || codeLine.instr === 'DA') {
      let operand = codeLine.operand
      let hb = 0x00
      if (operand.startsWith('"') && operand.endsWith('"')) {
        hb = 0x80
      } else if (operand.startsWith('\'') && operand.endsWith('\'')) {
        hb = 0x00
      } else {
        throw new Error("Invalid string: " + operand);
      }

      operand = operand.substring(1, operand.length-1)
      for(let i=0;i<operand.length;i++) {
        newInstructions.push(operand.charCodeAt(i) | hb)
      }
      newInstructions.push(0x00)
      pc += (operand.length + 1)
    } else {
      [mode, value] = getOperandModeValue(pc, codeLine.instr, codeLine.operand, pass)

      if (codeLine.instr === 'DB') {
        newInstructions.push(value & 0xff)
        pc++
      } else if (codeLine.instr === 'DW') {
        newInstructions.push(value & 0xff)
        newInstructions.push((value >> 8) & 0xff)
        pc+=2
      } else if (codeLine.instr === 'DS') {
        for(let i=0;i<value;i++) {
          newInstructions.push(0x00)
          pc++
        }
      } else {
        if (pass === 2 && isRelativeInstr(codeLine.instr) && (value < 0 || value > 255)) {
          throw new Error(`Branch instruction out of range: ${line} value: ${value} pass: ${pass}`);
        }

        const match = pcodes.findIndex(pc => pc && pc.name === codeLine.instr && pc.mode === mode)
        if (match < 0) {
          throw new Error(`Unknown instruction: ${codeLine.instr} mode=${mode} pass=${pass}`);
        }
        newInstructions = getHexCodesForInstruction(match, value)
        pc += pcodes[match].PC
      }
    }

    if (doOutput && pass === 2) {
      newInstructions.forEach(i => {output += ` ${toHex(i)}`});
      console.log(output)
    }
    instructions.push(...newInstructions)
  });

  if (doOutput && pass === 2) {
    let output = ""
    instructions.forEach(i => {output += ` ${toHex(i)}`});
    console.log(output)
  }

  return instructions
}

export const parseAssembly = (start: number, code: Array<string>): Array<number> => {
  labels = {}
  try {
    parseOnce(start, code, 1)
    const instructions = parseOnce(start, code, 2)
    return instructions
  } catch (error) {
    console.error(error)
    return []
  }
}

