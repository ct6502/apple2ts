import React, { useState } from "react";
import { passSetDisassembleAddress } from "../main2worker";
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
import { Breakpoint, BreakpointMap, getBreakpointString, getBreakpointStyle } from "./breakpoint";
import { TEST_DEBUG } from "../emulator/utility/utility";

const BreakpointsView = (props: {
  breakpoints: BreakpointMap;
  setBreakpoints: (breakpoints: BreakpointMap) => void
}) => {
  const nlines = 12  // should this be an argument?
  const x = window.innerWidth / 2 - 200
  const y = window.innerHeight / 2 - 200
  const [dialogPosition, setDialogPosition] = useState([x, y])
  const [breakpointEditAddress, setBreakpointEditAddress] = useState(0)
  const [breakpointEditValue, setBreakpointEditValue] = useState(new Breakpoint())
  const [showBreakpointEdit, setShowBreakpointEdit] = useState(TEST_DEBUG)

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
    const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      bp.disabled = !bp.disabled
      props.setBreakpoints(breakpoints)
    }
  }

  const handleBreakpointDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints)
    if (breakpoints.delete(addr)) {
      props.setBreakpoints(breakpoints)
    }
  }

  const addBreakpoint = () => {
    setBreakpointEditAddress(-1)
    setBreakpointEditValue(new Breakpoint())
    setShowBreakpointEdit(true)
  }

  const removeAllBreakpoints = () => {
    props.setBreakpoints(new BreakpointMap())
  }

  const handleBreakpointEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints)
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
    const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints)
    breakpoints.delete(breakpointEditAddress)
    breakpoints.set(breakpointEditValue.address, breakpointEditValue)
    props.setBreakpoints(breakpoints)
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

  return (
    <div className="flex-column">
      <div className="flex-row-space-between">
        <div className="bigger-font"
          style={{
            paddingTop: "15px",
            paddingBottom: "3px",
            paddingLeft: "5px",
          }}>Breakpoints</div>
        <div className="flex-row">
          <button className="push-button tightButton"
            title="Add new breakpoint"
            onClick={addBreakpoint}
            disabled={false}>
            <FontAwesomeIcon icon={iconBreakpointAdd} style={{ fontSize: '0.7em' }} />
          </button>
          <button className="push-button tightButton"
            title="Remove all breakpoints"
            onClick={removeAllBreakpoints}
            disabled={false}>
            <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '0.8em' }} />
          </button>
        </div>
      </div>
      <div className="debug-panel thinBorder"
        style={{
          width: '213px',
          height: `${nlines * 11 - 2}pt`,
          overflow: 'auto',
          paddingLeft: "5pt",
          cursor: "pointer"
        }}>
        {Array.from(props.breakpoints).map(([key, breakpoint]) => (
          <div key={key}>
            <button className="breakpoint-pushbutton"
              data-key={key}
              onClick={(e) => { handleBreakpointClick(e) }}>
              <FontAwesomeIcon className={getBreakpointStyle(breakpoint)}
                style={{ paddingRight: "0" }}
                icon={getBreakpointIcon(breakpoint)} />
            </button>
            <button className="breakpoint-pushbutton"
              data-key={key}
              onClick={(e) => { handleBreakpointEdit(e) }}
              disabled={false}>
              <FontAwesomeIcon icon={iconBreakpointEdit} />
            </button>
            <button className="breakpoint-pushbutton"
              data-key={key}
              onClick={(e) => { handleBreakpointDelete(e) }}>
              <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '1.3em' }} />
            </button>
            <span data-key={key} onClick={handleAddressClick}>{getBreakpointString(breakpoint)}</span>
          </div>
        )
        )}
      </div>
      {showBreakpointEdit &&
        <BreakpointEdit breakpoint={breakpointEditValue}
          saveBreakpoint={saveBreakpoint}
          cancelDialog={cancelEdit}
          dialogPositionX={dialogPosition[0]}
          dialogPositionY={dialogPosition[1]}
          setDialogPosition={doSetDialogPosition} />}
    </div>
  )
}

export default BreakpointsView;