import { useState } from "react";
import { Breakpoint } from "./breakpoint";
import EditField from "./editfield";
import PullDownMenu from "./pulldownmenu";
import { Droplist } from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../emulator/memory";
import { opCodeNames, opCodes, opTable } from "./opcodes";
import { toHex } from "../emulator/utility/utility";

const addressModes = [
  'Implied',
  'Immediate #$FF',
  'Zero page/Relative',
  'Zero page,X $FF,X',
  'Zero page,Y $FF,Y',
  'Absolute $1234',
  'Abs,X $1234,X',
  'Abs,Y $1234,Y',
  'Indirect,X ($FF,X)',
  'Indirect,Y ($FF),Y',
  'Indirect   ($1234)'
]

const BPEdit_Instruction = (props: {
  breakpoint: Breakpoint,
}) => {
  const [myInit, setMyInit] = useState(false)
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [popup, setPopup] = useState<string[]>([])
  const [addressMode, setAddressMode] = useState('')

  if (!myInit) {
    if (props.breakpoint.address >= 0x10000) {
      const opcode = props.breakpoint.address & 0xFF
      setInstruction(opCodes[opcode].name)
      setAddressMode(addressModes[opCodes[opcode].mode])
    }
    setMyInit(true)
  }

  const handleInstructionChange = (value: string) => {
    value = value.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase()
    const newPopup = []
    // Add all possible opcode matches to the popup list.
    if (value.length > 0) {
      for (let i = 0; i < opCodeNames.length; i++) {
        if (opCodeNames[i].startsWith(value)) {
          newPopup.push(opCodeNames[i])
        }
      }
    }
    // No matches? Clear the current address and do not accept the new value.
    if (newPopup.length === 0) {
      props.breakpoint.address = 0
      setPopup(newPopup)
      setInstruction(value.length > 0 ? instruction : '')
      return
    }
    // Automatically fill in the instruction if only one match,
    // but only if there wasn't already a filled-in value.
    // That way the user can backspace to delete the current value.
    if (newPopup.length === 1 && instruction.length < 3) {
      value = newPopup[0]
      newPopup.pop()
    }
    setPopup(newPopup)
    setInstruction(value)

    if (newPopup.length <= 1 && value.length === 3) {
      const modes = opTable[value]
      for (let i = 0; i < modes.length; i++) {
        if (modes[i]) {
          setAddressMode(addressModes[i])
          props.breakpoint.address = modes[i] | 0x10000
          break
        }
      }
    }

    // If we don't have a valid instruction yet, clear out the current value.
    if (value.length < 3 && props.breakpoint) {
      const address = 0
      props.breakpoint.address = address | 0x10000
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleInstructionFromPopup = (v: string) => {
    handleInstructionChange(popup[parseInt(v ? v : '0', 16)])
  }

  const handleAddressModeChange = (value: string) => {
    if (instruction.length < 3) return
    const modes = opTable[instruction]
    for (let i = 0; i < modes.length; i++) {
      if (addressModes[i] === value) {
        props.breakpoint.address = modes[i] | 0x10000
        setAddressMode(value)
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isModeDisabledForOpcode = (value: string, userdata: number) => {
    if (instruction.length < 3) return true
    const modes = opTable[instruction]
    for (let i = 0; i < modes.length; i++) {
      if (addressModes[i] === value) return (modes[i] ? false : true)
    }
    return true
  }

  const getInstructionBreakpointString = () => {
    let result = ''
    if (props.breakpoint.address >= 0x10000) {
      const opcode = props.breakpoint.address & 0xFF
      // const opcode = opCodes[instruction]
      // if (opcode) {
      //   result = opcode.toString(16).toUpperCase()
      // }
      result += toHex(opcode, 2)
      const hex = props.breakpoint.hexvalue
      if (hex >= 0) {
        result += ' ' + toHex(hex & 0xFF, 2)
        if (hex > 0xFF) {
          result += ' ' + toHex(hex >> 8, 2)
        }
      }
    }
    return result ? result : '??'
  }

  const handleHexValueChange = (value: string) => {
    const hexSize = props.breakpoint.instruction ? 4 : 2
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, hexSize).toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.hexvalue = parseInt(value ? value : '-1', 16)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key];
      if (bank.name === value) {
        props.breakpoint.memoryBank = key
        setTriggerUpdate(!triggerUpdate)
        // bail early since we found a match
        return false
      }
    }
  }

  const v = props.breakpoint.hexvalue
  const hexvalue = v >= 0 ? v.toString(16).toUpperCase() : ''

  return (
    <div>
      <div className="flex-row">
        <EditField name="Instruction: "
          initialFocus={true}
          value={instruction}
          setValue={handleInstructionChange}
          placeholder="LDA"
          width="5em" />
        {popup.length > 1 &&
          <PullDownMenu open={true} values={popup} setValue={handleInstructionFromPopup} />
        }
        <Droplist name="Address&nbsp;Mode: "
          value={addressMode}
          values={addressModes}
          setValue={handleAddressModeChange}
          userdata={props.breakpoint.address}
          isDisabled={isModeDisabledForOpcode} />
      </div>
      <div>
        <EditField name="With hex value:"
          value={hexvalue}
          setValue={handleHexValueChange}
          placeholder="any"
          width="5em" />
      </div>
      <div className="dialog-title">{getInstructionBreakpointString()}</div>
      <Droplist name="Memory&nbsp;Bank: "
        value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
        values={MemoryBankNames}
        setValue={handleMemoryBankChange}
        userdata={props.breakpoint.address}
        isDisabled={() => false} />
    </div>
  )
}

export default BPEdit_Instruction;
