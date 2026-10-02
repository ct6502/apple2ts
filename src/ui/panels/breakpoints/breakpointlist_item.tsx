import React from "react"
import { handleGetBreakpoints, handleGetExecutionBreakpoint, handleGetRunMode } from "../../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faPencil,
  faTrash,
} from "@fortawesome/free-solid-svg-icons"
import {
  faCircleHalfStroke as iconBreakpointExtra,
  faCircle as iconBreakpointEnabled,
} from "@fortawesome/free-solid-svg-icons"
import { faCircle as iconBreakpointDisabled } from "@fortawesome/free-regular-svg-icons"
import { setDisassemblyAddress, setDisassemblyVisibleMode } from "../disassembly/disassembly_utilities"
import { BreakpointMap, getBreakpointString, getBreakpointStyle } from "../../../common/breakpoint"
import { useGlobalContext } from "../../globalcontext"
import { DISASSEMBLE_VISIBLE, RUN_MODE } from "../../../common/utility"
import { setPreferenceBreakpoints } from "../../localstorage"

const BreakpointListItem = (props: {updateDisplay: UpdateDisplay,
  bp: Breakpoint,
  setShowBreakpointEdit: React.Dispatch<React.SetStateAction<boolean>>,
  setBreakpointEditAddress: React.Dispatch<React.SetStateAction<number>>,
  setBreakpointEditValue: React.Dispatch<React.SetStateAction<Breakpoint>>,
}) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()

  const handleAddressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (handleGetRunMode() !== RUN_MODE.PAUSED) return
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    if (addr >= 0) {
      setDisassemblyAddress(addr, true)
      setDisassemblyVisibleMode(DISASSEMBLE_VISIBLE.ADDRESS)
      props.updateDisplay()
    }
  }

  const handleBreakpointClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      bp.disabled = !bp.disabled
      setPreferenceBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
  }

  const handleBreakpointEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      // Save the original address. If it gets changed then
      // we'll need to remove the old one.
      props.setBreakpointEditAddress(addr)
      props.setBreakpointEditValue({ ...bp })
      props.setShowBreakpointEdit(true)
    }
  }

  const handleBreakpointDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    if (breakpoints.delete(addr)) {
      setPreferenceBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
  }

  const getBreakpointIcon = (bp: Breakpoint) => {
    if (bp.disabled) {
      return iconBreakpointDisabled
    }
    if (bp.expression1.register !== "" || bp.hitcount > 1) {
      return iconBreakpointExtra
    }
    return iconBreakpointEnabled
  }

  if (props.bp.hidden) {
    return <></>
  }

  return (
    <div key={props.bp.address}
     className={handleGetExecutionBreakpoint() === props.bp.address ? "breakpoint-hit" : ""}  >
      <button className="breakpoint-pushbutton"
        data-key={props.bp.address}
        onClick={(e) => { handleBreakpointClick(e) }}>
        <FontAwesomeIcon className={getBreakpointStyle(props.bp)}
          style={{ paddingRight: "0" }}
          icon={getBreakpointIcon(props.bp)} />
      </button>
      <button className="breakpoint-pushbutton"
        data-key={props.bp.address}
        title="Edit breakpoint"
        onClick={(e) => { handleBreakpointEdit(e) }}
        disabled={false}>
        <FontAwesomeIcon icon={faPencil} />
      </button>
      <button className="breakpoint-pushbutton"
        data-key={props.bp.address}
        title="Delete breakpoint"
        onClick={(e) => { handleBreakpointDelete(e) }}>
        <FontAwesomeIcon icon={faTrash} style={{ fontSize: "1.3em" }} />
      </button>
      <span
        style={{cursor: handleGetRunMode() === RUN_MODE.PAUSED ? "pointer" : "default",
        userSelect: "none"}}
        data-key={props.bp.address}
        onClick={handleAddressClick}>{getBreakpointString(props.bp)}</span>
    </div>
  )
}

export default BreakpointListItem