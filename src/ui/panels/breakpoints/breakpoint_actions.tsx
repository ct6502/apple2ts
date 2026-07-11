import BreakpointActionControl from "./breakpointactioncontrol"
import CheckBox from "../checkbox"

const Breakpoint_Actions = (props: {
  breakpoint: Breakpoint,
  setBreakpoint: (bp: Breakpoint) => void,
}) => {

  const handleActionChange1 = (action: BreakpointAction) => {
    props.setBreakpoint({ ...props.breakpoint, action1: action })
  }

  const handleActionChange2 = (action: BreakpointAction) => {
    props.setBreakpoint({ ...props.breakpoint, action2: action })
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
      setChecked={(checked) => props.setBreakpoint({ ...props.breakpoint, halt: checked })}
      disabled={isDisabled} />
  </div>
}

export default Breakpoint_Actions
