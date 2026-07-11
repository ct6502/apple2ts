import { Droplist } from "../droplist"
import EditField from "../editfield"
import { toHex } from "../../../common/utility"
import { useState } from "react"

interface BreakpointActionControlProps {
  action: BreakpointAction;
  setAction: (action: BreakpointAction) => void;
}

const BreakpointActionControl = (props: BreakpointActionControlProps) => {
  const [bpAddress, setBpAddress] = useState(toHex(props.action.address))
  const [bpValue, setBpValue] = useState(toHex(props.action.value))

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, "").slice(0, 4).toUpperCase()
    setBpAddress(value)
    props.setAction({ ...props.action, address: parseInt(value || "-1", 16) })
  }

  const handleRegisterChange = (value: RegisterValues) => {
    props.setAction({ ...props.action, register: value })
  }

  const handleActionChange = (value: BPActions) => {
    props.setAction({ ...props.action, action: value })
  }

  const handleValueChange = (value: string) => {
    const maxlen = props.action.register === "C" ? 4 : 2
    value = value.replace(/[^0-9a-f]/gi, "").slice(0, maxlen).toUpperCase()
    setBpValue(value)
    props.setAction({ ...props.action, value: parseInt(value || "-1", 16) })
  }

  const actionLabels = ["(no action)", "Set", "Jump to", "Print to console", "Snapshot"]
  const actionValues: BPActions[] = ["", "set", "jump", "print", "snapshot"]
  const actionIndex = actionValues.indexOf(props.action.action)

  const handleDroplistActionChange = (selectedText: string) => {
    // Find the index of the selected text in the actionLabels array
    const selectedIndex = actionLabels.indexOf(selectedText)
    // Use that index to get the corresponding action value
    const actionValue = actionValues[selectedIndex]
    handleActionChange(actionValue)
    if (actionValue === "jump") {
      handleRegisterChange("$")
    }
  }

  const registerLabels = ["Address", "Accumulator",
  "X Register", "Y Register", "Stack Pointer",
  "Processor Status", "Program Counter"]
  const registerValues = [ "$", "A", "X", "Y", "S", "P", "C"]
  const effectiveRegister = props.action.register || "A"
  const registerIndex = registerValues.indexOf(effectiveRegister)

  const handleDroplistRegisterChange = (selectedText: string) => {
    // Find the index of the selected text in the registers array
    const selectedIndex = registerLabels.indexOf(selectedText)
    // Use that index to get the corresponding register value
    const registerValue = registerValues[selectedIndex] as RegisterValues
    handleRegisterChange(registerValue)
  }

  const isJump = props.action.action === "jump"
  const isPrint = props.action.action === "print"
  const isSnapshot = props.action.action === "snapshot"

  return <div style={{marginLeft: "30px"}}>
    <Droplist
      value={actionLabels[actionIndex]}
      values={actionLabels}
      setValue={handleDroplistActionChange} />
    {(!isSnapshot && !isPrint) &&
    <span>
      {isJump ? <span className="dialog-title">address</span> :
        <Droplist
          disabled={actionIndex === 0}
          value={registerLabels[registerIndex]}
          values={registerLabels}
          setValue={handleDroplistRegisterChange} />
      }
      {
        (props.action.register === "$") &&
        <span>
        <span className="dialog-title" style={{ padding: 0 }}>$</span>
        <EditField
          disabled={actionIndex === 0}
          value={bpAddress}
          setValue={handleAddressChange}
          isHex={true}
          placeholder="Any"
          width="3em" />
        </span>
      }
      { (!isJump) &&
        <span>
          <span className="dialog-title" style={{ padding: 0,
          ...((actionIndex === 0) && {
          opacity: 0.4,
          pointerEvents: "none"
          })}}>{(props.action.register === "C") ? " to address $" : " to value $"}</span>
          <EditField
            disabled={actionIndex === 0}
            value={bpValue}
            setValue={handleValueChange}
            isHex={true}
            placeholder="FF"
            width="3em" />
        </span>
      }
    </span>
    }
  </div>
}

export default BreakpointActionControl
