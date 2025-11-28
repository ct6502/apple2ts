import { useState } from "react"
import EditField from "./editfield"
import { Droplist } from "./droplist"
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../../common/memorybanks"
import { toHex } from "../../common/utility"
import ExpressionControl from "./expressioncontrol"
import Breakpoint_Actions from "./breakpoint_actions"

const BPEdit_Breakpoint = (props: {
  breakpoint: Breakpoint,
}) => {
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [bpAddress, setBpAddress] = useState(props.breakpoint.address >= 0 ?
    toHex(props.breakpoint.address) : "")

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, "").slice(0, 4).toUpperCase()
    setBpAddress(value)
    const address = parseInt(value || "-1", 16)
    props.breakpoint.address = address
    setTriggerUpdate(!triggerUpdate)
  }

  const handleExpressionChange1 = (expr: BreakpointExpression) => {
    props.breakpoint.expression1 = expr
    setTriggerUpdate(!triggerUpdate)
  }

  const handleExpressionChange2 = (expr: BreakpointExpression) => {
    props.breakpoint.expression2 = expr
    setTriggerUpdate(!triggerUpdate)
  }

  const handleExpressionOperatorChange = (value: ExpressionOperator) => {
    props.breakpoint.expressionOperator = value
    setTriggerUpdate(!triggerUpdate)
  }

  const handleHitCountChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, "")
    if (value.trim() !== "") {
      value = Math.max(parseInt(value), 1).toString()
    }
    props.breakpoint.hitcount = parseInt(value || "1")
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key]
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
          value={bpAddress}
          setValue={handleAddressChange}
          placeholder="Any"
          width="5em" />
      </div>
      <div style={{ marginTop: "16px" }}>
        <EditField name="Hit&nbsp;Count: "
          value={props.breakpoint.hitcount.toString()}
          setValue={handleHitCountChange}
          placeholder="1"
          width="5em" />
        <span className="dialog-title">Expression:</span>
        <ExpressionControl expr={props.breakpoint.expression1}
          setExpr={handleExpressionChange1} />
        <span style={{ marginLeft: "1em", marginRight: "1em" }}>
          <Droplist
            monospace={true}
            disabled={props.breakpoint.expression1.register === ""}
            value={props.breakpoint.expressionOperator}
            values={["", "&&", "||"]}
            setValue={(v: string) => handleExpressionOperatorChange(v as ExpressionOperator)} />
        </span>
        <ExpressionControl expr={props.breakpoint.expression2}
          setExpr={handleExpressionChange2}
          disabled={props.breakpoint.expression1.register === "" || props.breakpoint.expressionOperator === ""}
        />
      </div>
      <Droplist name="Memory&nbsp;Bank: "
        value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
        values={MemoryBankNames}
        setValue={handleMemoryBankChange}
        userdata={props.breakpoint.address}
        isDisabled={isBankDisabledForAddress} />

      <Breakpoint_Actions breakpoint={props.breakpoint}/>

    </div>
  )
}

export default BPEdit_Breakpoint
