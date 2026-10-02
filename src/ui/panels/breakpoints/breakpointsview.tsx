import { useState } from "react"
import { handleGetBreakpoints } from "../../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faTrash,
  faPlus as iconBreakpointAdd,
} from "@fortawesome/free-solid-svg-icons"
import BreakpointEdit from "./breakpointedit"
import { BreakpointMap, BreakpointNew } from "../../../common/breakpoint"
import { useGlobalContext } from "../../globalcontext"
import { setPreferenceBreakpoints } from "../../localstorage"
import BreakpointListItem from "./breakpointlist_item"

const BreakpointsView = (props: {updateDisplay: UpdateDisplay}) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const x = window.outerWidth / 2 - 200
  const y = window.outerHeight / 2 - 200
  const [dialogPosition, setDialogPosition] = useState([x, y])
  const [breakpointEditAddress, setBreakpointEditAddress] = useState(0)
  const [breakpointEditValue, setBreakpointEditValue] = useState(BreakpointNew())
  const [showBreakpointEdit, setShowBreakpointEdit] = useState(false)

  const addBreakpoint = () => {
    setBreakpointEditAddress(-1)
    setBreakpointEditValue(BreakpointNew())
    setShowBreakpointEdit(true)
  }

  const removeAllBreakpoints = () => {
    setPreferenceBreakpoints(new BreakpointMap())
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const saveBreakpoint = () => {
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    if (breakpointEditAddress >= 0) {
      breakpoints.delete(breakpointEditAddress)
    }
    // Sanity check for watchpoints - make sure we have a valid address,
    // otherwise our watchpoint address will say "Any", which is confusing
    // since it won't actually break.
    const bpToSave = breakpointEditValue.watchpoint
      ? { ...breakpointEditValue, address: Math.max(0, breakpointEditValue.address) }
      : breakpointEditValue
    breakpoints.set(bpToSave.address, bpToSave)
    setPreferenceBreakpoints(breakpoints)
    setShowBreakpointEdit(false)
  }

  const cancelEdit = () => {
    setShowBreakpointEdit(false)
  }

  const doSetDialogPosition = (x: number, y: number) => {
    setDialogPosition([x, y])
  }

  const breakpoints = handleGetBreakpoints()

  return (
    <div className="round-rect-border short-panel" style={{ width: "calc(100% - 20px)" }}>
      <div className="flex-row-space-between" style={{ marginBottom: "8px" }}>
        <div className="bigger-font">Breakpoints</div>
        <div className="flex-row">
          <button className="push-button tight-button"
            title="Add new breakpoint"
            onClick={addBreakpoint}
            disabled={false}>
            <FontAwesomeIcon icon={iconBreakpointAdd} style={{ fontSize: "0.7em" }} />
          </button>
          <button className="push-button tight-button"
            title="Remove all breakpoints"
            onClick={removeAllBreakpoints}
            disabled={false}>
            <FontAwesomeIcon icon={faTrash} style={{ fontSize: "0.8em" }} />
          </button>
        </div>
      </div>
      <div className="flex-column-gap">
        <div className="debug-panel mono-text thin-border"
          style={{
            width: "calc(100% - 12pt)",
            height: "98pt",
            overflow: "auto",
            paddingLeft: "5pt",
            cursor: "default"
          }}>
          {Array.from(breakpoints.values() as Breakpoint[]).map((bp: Breakpoint) => (
            <BreakpointListItem bp={bp}
              key={bp.address}
              setShowBreakpointEdit={setShowBreakpointEdit}
              setBreakpointEditAddress={setBreakpointEditAddress}
              setBreakpointEditValue={setBreakpointEditValue}
              updateDisplay={props.updateDisplay} />
          ))}
        </div>
        {showBreakpointEdit &&
          <BreakpointEdit breakpoint={breakpointEditValue}
            setBreakpoint={setBreakpointEditValue}
            saveBreakpoint={saveBreakpoint}
            cancelDialog={cancelEdit}
            dialogPositionX={dialogPosition[0]}
            dialogPositionY={dialogPosition[1]}
            setDialogPosition={doSetDialogPosition} />}
      </div>
    </div>
  )
}

export default BreakpointsView