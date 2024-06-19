import React, { useState } from "react";
import { handleGetBreakpoints, passBreakpoints, passSetDisassembleAddress } from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil as iconBreakpointEdit,
  faXmark as iconBreakpointDelete,
  faPlus as iconBreakpointAdd,
} from "@fortawesome/free-solid-svg-icons";
import {
  faCircleHalfStroke as iconBreakpointExtra,
  faCircle as iconBreakpointEnabled,
} from "@fortawesome/free-solid-svg-icons";
import { faCircle as iconBreakpointDisabled } from "@fortawesome/free-regular-svg-icons";
import { getLineOfDisassembly } from "./debugpanelutilities";
import BreakpointEdit from "./breakpointedit";
import { Breakpoint, BreakpointMap, getBreakpointString, getBreakpointStyle } from "../emulator/utility/breakpoint";
import { useGlobalContext } from "../globalcontext";

const BreakpointsView = () => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const x = window.outerWidth / 2 - 200
  const y = window.outerHeight / 2 - 200
  const [dialogPosition, setDialogPosition] = useState([x, y])
  const [breakpointEditAddress, setBreakpointEditAddress] = useState(0)
  const [breakpointEditValue, setBreakpointEditValue] = useState(new Breakpoint())
  const [showBreakpointEdit, setShowBreakpointEdit] = useState(false)

  const handleAddressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    if (addr >= 0) {
      if (getLineOfDisassembly(addr) < 0) {
        passSetDisassembleAddress(addr)
      }
    }
  }

  const handleBreakpointClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      bp.disabled = !bp.disabled
      passBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
  }

  const handleBreakpointDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    if (breakpoints.delete(addr)) {
      passBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
  }

  const addBreakpoint = () => {
    setBreakpointEditAddress(-1)
    setBreakpointEditValue(new Breakpoint())
    setShowBreakpointEdit(true)
  }

  const removeAllBreakpoints = () => {
    passBreakpoints(new BreakpointMap())
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const handleBreakpointEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      // Save the original address. If it gets changed then
      // we'll need to remove the old one.
      setBreakpointEditAddress(addr)
      setBreakpointEditValue({ ...bp })
      setShowBreakpointEdit(true)
    }
  }

  const saveBreakpoint = () => {
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    breakpoints.delete(breakpointEditAddress)
    breakpoints.set(breakpointEditValue.address, breakpointEditValue)
    passBreakpoints(breakpoints)
    setShowBreakpointEdit(false)
  }

  const cancelEdit = () => {
    setShowBreakpointEdit(false)
  }

  const doSetDialogPosition = (x: number, y: number) => {
    setDialogPosition([x, y])
  }

  const getBreakpointIcon = (bp: Breakpoint) => {
    if (bp.disabled) {
      return iconBreakpointDisabled
    }
    if (bp.expression || bp.hitcount > 1) {
      return iconBreakpointExtra
    }
    return iconBreakpointEnabled
  }

  const breakpoints = handleGetBreakpoints()

  return (
    <div className="round-rect-border short-panel">
      <div className="bigger-font column-gap">Breakpoints</div>
      <div className="flex-column">
        <div className="flex-row-space-between">
          &nbsp;
          <div className="flex-row">
            <button className="push-button tight-button"
              title="Add new breakpoint"
              onClick={addBreakpoint}
              disabled={false}>
              <FontAwesomeIcon icon={iconBreakpointAdd} style={{ fontSize: '0.7em' }} />
            </button>
            <button className="push-button tight-button"
              title="Remove all breakpoints"
              onClick={removeAllBreakpoints}
              disabled={false}>
              <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '0.8em' }} />
            </button>
          </div>
        </div>
        <div className="debug-panel thinBorder"
          style={{
            width: '228px',
            height: '120pt',
            overflow: 'auto',
            paddingLeft: "5pt",
            cursor: "pointer"
          }}>
          {Array.from(breakpoints.values() as Breakpoint[]).map((bp: Breakpoint) => (
            <div key={bp.address}>
              <button className="breakpoint-pushbutton"
                data-key={bp.address}
                onClick={(e) => { handleBreakpointClick(e) }}>
                <FontAwesomeIcon className={getBreakpointStyle(bp)}
                  style={{ paddingRight: "0" }}
                  icon={getBreakpointIcon(bp)} />
              </button>
              <button className="breakpoint-pushbutton"
                data-key={bp.address}
                onClick={(e) => { handleBreakpointEdit(e) }}
                disabled={false}>
                <FontAwesomeIcon icon={iconBreakpointEdit} />
              </button>
              <button className="breakpoint-pushbutton"
                data-key={bp.address}
                onClick={(e) => { handleBreakpointDelete(e) }}>
                <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '1.3em' }} />
              </button>
              <span data-key={bp.address} onClick={handleAddressClick}>{getBreakpointString(bp)}</span>
            </div>
          ))}
        </div>
        {showBreakpointEdit &&
          <BreakpointEdit breakpoint={breakpointEditValue}
            saveBreakpoint={saveBreakpoint}
            cancelDialog={cancelEdit}
            dialogPositionX={dialogPosition[0]}
            dialogPositionY={dialogPosition[1]}
            setDialogPosition={doSetDialogPosition} />}
      </div>
    </div>
  )
}

export default BreakpointsView;