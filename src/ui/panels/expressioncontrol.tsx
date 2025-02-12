import { Droplist } from "./droplist";
import EditField from "./editfield";
import { toHex } from "../../common/utility";
import { useState } from "react";

interface ExpressionControlProps {
  expr: BreakpointExpression;
  setExpr: (expr: BreakpointExpression) => void;
  disabled?: boolean;
}

const ExpressionControl = (props: ExpressionControlProps) => {
  //  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [bpAddress, setBpAddress] = useState(toHex(props.expr.address))
  const [bpValue, setBpValue] = useState(toHex(props.expr.value))

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 4).toUpperCase()
    setBpAddress(value)
    props.expr.address = parseInt(value || '-1', 16)
    props.setExpr(props.expr)
  }

  const handleRegisterChange = (value: RegisterValues) => {
    props.expr.register = value
    //    setTriggerUpdate(!triggerUpdate)
    props.setExpr(props.expr)
  }

  const handleOperatorChange = (value: OperatorValues) => {
    props.expr.operator = value
    props.setExpr(props.expr)
  }

  const handleValueChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 2).toUpperCase()
    setBpValue(value)
    props.expr.value = parseInt(value || '-1', 16)
    props.setExpr(props.expr)
  }

  const spaces = '\u00A0\u00A0\u00A0\u00A0'
  const registers = [`${spaces}(none)`, `$${spaces}Address`, `A${spaces}Accumulator`,
  `X${spaces}X Register`, `Y${spaces}Y Register`, `S${spaces}Stack Pointer`,
  `P${spaces}Processor Status`]
  const regmap = ['', '$', 'A', 'X', 'Y', 'S', 'P']
  const index = regmap.indexOf(props.expr.register)

  return <span>
    <Droplist
      disabled={props.disabled}
      value={registers[index]}
      values={registers}
      setValue={(v: string) =>
        handleRegisterChange(v.substring(0, 1).replace(/\s/g, "") as RegisterValues)}
      narrow={true} />
    {
      (props.expr.register === '$') &&
      <EditField
        disabled={props.disabled || index === 0}
        value={bpAddress}
        setValue={handleAddressChange}
        placeholder="Any"
        width="3em" />
    }
    <Droplist
      monospace={true}
      disabled={props.disabled || index === 0}
      value={props.expr.operator}
      values={['==', '!=', '>', '>=', '<', '<=']}
      setValue={(v: string) => handleOperatorChange(v as OperatorValues)} />
    <span className="dialog-title" style={{ padding: 0 }}>$</span>
    <EditField
      disabled={props.disabled || index === 0}
      value={bpValue}
      setValue={handleValueChange}
      placeholder="FF"
      width="2em" />
  </span>
}

export default ExpressionControl
