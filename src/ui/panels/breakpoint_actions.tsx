import { useState } from "react"
import BreakpointActionControl from "./breakpointactioncontrol"

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
  
  const handleHaltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.halt = e.target.checked
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
      <div style={{marginLeft: "22px",
        ...(isDisabled && {
        opacity: 0.4,
        pointerEvents: "none"
      })}}>
        <div style={{height: "8px" }} />
        <input type="checkbox" id="memget" value="memget"
          className="check-radio-box shift-down"
          checked={props.breakpoint.halt}
          onChange={(e) => { handleHaltChange(e) }} />
        <label htmlFor="memget" className="dialog-title flush-left">Halt execution after actions</label>
      </div>
  </div>
}

export default Breakpoint_Actions
