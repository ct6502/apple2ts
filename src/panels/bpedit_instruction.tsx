import { useState } from "react";
import { BRK_ILLEGAL, BRK_INSTR, Breakpoint, getBreakpointString } from "../emulator/utility/breakpoint";
import EditField from "./editfield";
import PullDownMenu from "./pulldownmenu";
import { Droplist } from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../emulator/memory";
import { opCodeNames, opCodes, opTable } from "./opcodes";

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
  'Indirect ($FF)'
]

const BPEdit_Instruction = (props: {
  breakpoint: Breakpoint,
}) => {
  const [myInit, setMyInit] = useState(false)
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [popup, setPopup] = useState<string[]>([])
  const [addressMode, setAddressMode] = useState('')
  const [illegalOpcode, setIllegalOpcode] = useState(false)

  const resetPopup = () => {
    setPopup(opCodeNames)
  }

  if (!myInit) {
    if (props.breakpoint.address >= BRK_INSTR) {
      const opcode = props.breakpoint.address & 0xFF
      setInstruction(opCodes[opcode].name)
      setAddressMode(addressModes[opCodes[opcode].mode])
    }
    resetPopup()
    setMyInit(true)
  }

  const handleInstructionChange = (value: string) => {
    value = value.replace(/[^a-z]/gi, '').slice(0, 3).toUpperCase()
    const newPopup = []
    // Add all possible opcode matches to the popup list.
    if (value.length >= 0) {
      for (let i = 0; i < opCodeNames.length; i++) {
        if (opCodeNames[i].startsWith(value)) {
          newPopup.push(opCodeNames[i])
        }
      }
    }
    // No matches? Clear the current address and do not accept the new value.
    if (newPopup.length === 0) {
      props.breakpoint.address = 0
      setInstruction(value.length > 0 ? instruction : '')
      return
    }
    // Automatically fill in the instruction if only one match,
    // but only if there wasn't already a filled-in value.
    // That way the user can backspace to delete the current value.
    if (newPopup.length === 1 && instruction.length < 3) {
      value = newPopup[0]
      resetPopup()
    } else {
      setPopup(newPopup)
    }
    setInstruction(value)

    if (newPopup.length <= 1 && value.length === 3) {
      const modes = opTable[value]
      for (let i = 0; i < modes.length; i++) {
        if (modes[i] !== undefined) {
          setAddressMode(addressModes[i])
          props.breakpoint.address = modes[i] | BRK_INSTR
          break
        }
      }
    }

    // If we don't have a valid instruction yet, clear out the current value.
    if (value.length < 3 && props.breakpoint) {
      const address = 0
      props.breakpoint.address = address | BRK_INSTR
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleInstructionFromPopup = (v: string) => {
    handleInstructionChange(popup[parseInt(v ? v : '0', 16)])
  }

  const checkHexvalue = () => {
    if (props.breakpoint.hexvalue !== -1) {
      const bytes = opCodes[props.breakpoint.address & 0xFF].bytes
      if (bytes === 1) {
        props.breakpoint.hexvalue = -1
      } else if (bytes === 2) {
        props.breakpoint.hexvalue &= 0xFF
      }
    }
  }

  const handleAddressModeChange = (value: string) => {
    if (instruction.length < 3) return
    const modes = opTable[instruction]
    for (let i = 0; i < modes.length; i++) {
      if (addressModes[i] === value) {
        props.breakpoint.address = modes[i] | BRK_INSTR
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
    if (props.breakpoint.address >= BRK_INSTR) {
      result = getBreakpointString(props.breakpoint)
    }
    return result ? result : '--'
  }

  const handleHexValueChange = (value: string) => {
    let hexSize = 4
    if (instruction.length === 3) {
      const bytes = opCodes[props.breakpoint.address & 0xFF].bytes
      if (bytes < 3) hexSize = 2
    }
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, hexSize).toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.hexvalue = parseInt(value ? value : '-1', 16)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleIllegalOpcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIllegalOpcode(e.target.checked)
    props.breakpoint.address = e.target.checked ? BRK_ILLEGAL : 0
    setTriggerUpdate(!triggerUpdate)
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

  checkHexvalue()
  const v = props.breakpoint.hexvalue
  const hexvalue = v >= 0 ? v.toString(16).toUpperCase() : ''

  return (
    <div>
      <div className={"flex-row" + (illegalOpcode ? " disabled" : "")}
        style={{ alignItems: 'baseline' }}>
        <EditField name="Opcode:"
          initialFocus={true}
          value={instruction}
          setValue={handleInstructionChange}
          placeholder="LDA"
          width="5em" />
        <PullDownMenu values={popup}
          setValue={handleInstructionFromPopup} />
        <Droplist name="Mode:"
          value={addressMode}
          values={addressModes}
          setValue={handleAddressModeChange}
          userdata={props.breakpoint.address}
          isDisabled={isModeDisabledForOpcode} />
        <EditField name="Value:"
          value={hexvalue}
          setValue={handleHexValueChange}
          placeholder="any"
          width="3em" />
      </div>
      <div>
        <div style={{ height: "8px" }} />
        <input type="checkbox" id="memget" value="memget"
          className="check-radio-box shift-down"
          checked={props.breakpoint.address === BRK_ILLEGAL}
          onChange={(e) => { handleIllegalOpcodeChange(e) }} />
        <label htmlFor="memget" className="dialog-title flush-left">Any illegal 65c02 opcode</label>
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
