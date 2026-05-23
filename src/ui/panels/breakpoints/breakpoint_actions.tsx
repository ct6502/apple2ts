import { useState } from "react"
import BreakpointActionControl from "./breakpointactioncontrol"
import CheckBox from "../checkbox"

const Breakpoint_Actions = (props: {breakpoint: Breakpoint}) => {
  const [triggerUpdate, setTriggerUpdate] = useState(false)

  const handleActionChange1 = (action: BreakpointAction) => {
    props.breakpoint.action1 = action
    setTriggerUpdate(!triggerUpdate)
  }

  const handleActionChange2 = (action: BreakpointAction) => {
    props.breakpoint.action2 = action
    setTriggerUpdate(!triggerUpdate)
  }

  const isDisabled = props.breakpoint.action1.action === "" && props.breakpoint.action2.action === ""

  return <div style={{marginTop: "10px"}}>
    <div>
      <span className="dialog-title">Actions:</span>
    </div>
    <div>
      <BreakpointActionControl action={props.breakpoint.action1}
        setAction={handleActionChange1} />
    </div>
    <div>
      <BreakpointActionControl action={props.breakpoint.action2}
        setAction={handleActionChange2}
      />
    </div>
    <CheckBox name="Halt execution after actions"
      checked={props.breakpoint.halt}
      setChecked={(checked) => {
        props.breakpoint.halt = checked
        setTriggerUpdate(!triggerUpdate)
      }}
      disabled={isDisabled} />
  </div>
}

export default Breakpoint_Actions
