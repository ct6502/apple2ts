import { useState } from "react";
import { Breakpoint, checkBreakpointExpression } from "../emulator/utility/breakpoint";
import EditField from "./editfield";
import { getSoftSwitchDescriptions } from "../emulator/softswitches"
import { Droplist } from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../emulator/memory";

const BPEdit_Breakpoint = (props: {
  breakpoint: Breakpoint,
}) => {
  const [badExpression, setBadExpression] = useState('')
  const [triggerUpdate, setTriggerUpdate] = useState(false)

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 4).toUpperCase()
    if (props.breakpoint) {
      const address = parseInt(value || '0', 16)
      if (address >= 0xC000 && address <= 0xC0FF) {
        props.breakpoint.memget = true
        props.breakpoint.memset = true
        const switches = getSoftSwitchDescriptions()
        if (switches[address]) {
          if (switches[address].includes("status")) {
            props.breakpoint.memset = false
          } else if (switches[address].includes("write")) {
            props.breakpoint.memget = false
          }
        }
      }
      props.breakpoint.address = address
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleExpressionChange = (value: string) => {
    let expression = value.replace("===", "==")
    expression = expression.replace(/[^#$0-9 abcdefxysp|&()=<>+\-*/]/gi, '')
    expression = expression.toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.expression = expression
      const badExpression = checkBreakpointExpression(expression)
      setBadExpression(badExpression)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleHitCountChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, '')
    if (value.trim() !== '') {
      value = Math.max(parseInt(value), 1).toString()
    }
    if (props.breakpoint) {
      props.breakpoint.hitcount = parseInt(value || '1')
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

  const isBankDisabledForAddress = (value: string, address: number) => {
    for (const bank of Object.values(MEMORY_BANKS)) {
      if (bank.name === value && address >= bank.min && address <= bank.max) {
        return false
      }
    }
    return true
  }

  return (
    <div>
      <div className="flex-row">
        <EditField name="Address: "
          initialFocus={true}
          value={props.breakpoint.address.toString(16).toUpperCase()}
          setValue={handleAddressChange}
          placeholder="F800"
          width="5em" />
      </div>
      <div>
        <EditField name="Expression: "
          value={props.breakpoint.expression}
          setValue={handleExpressionChange}
          warning={badExpression}
          help="Example: (A > #$80) && ($2000 == #$C0)"
          placeholder="Break when expression evaluates to true" />
        <EditField name="Hit&nbsp;Count: "
          value={props.breakpoint.hitcount.toString()}
          setValue={handleHitCountChange}
          placeholder="1"
          width="5em" />
      </div>
      <Droplist name="Memory&nbsp;Bank: "
        value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
        values={MemoryBankNames}
        setValue={handleMemoryBankChange}
        userdata={props.breakpoint.address}
        isDisabled={isBankDisabledForAddress} />
    </div>
  )
}

export default BPEdit_Breakpoint;
