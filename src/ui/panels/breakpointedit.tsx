import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import BPEdit_Breakpoint from "./bpedit_breakpoint";
import BPEdit_Watchpoint from "./bpedit_watchpoint";
import BPEdit_Instruction from "./bpedit_instruction";
import { Breakpoint } from "../../common/breakpoint";

const BreakpointEdit = (props: {
  breakpoint: Breakpoint,
  saveBreakpoint: () => void,
  cancelDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void
}) => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dialogRef.current) {
      setDragging(true)
      const div = dialogRef.current as HTMLDivElement
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      setOffset([e.clientX - div.offsetLeft, e.clientY - div.offsetTop])
    }
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (dragging && dialogRef.current) {
      const div = dialogRef.current as HTMLDivElement
      const left = e.clientX - offset[0];
      const top = e.clientY - offset[1];
      props.setDialogPosition(left, top)
      div.style.left = `${left}px`;
      div.style.top = `${top}px`;
    }
  }

  const handleMouseUp = () => {
    setDragging(false)
  }

  const handleBreakAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.watchpoint = e.target.value === "watchpoint"
    props.breakpoint.instruction = e.target.value === "instruction"
    if (props.breakpoint) {
      props.breakpoint.address = props.breakpoint.instruction ? 0 :
        props.breakpoint.address
    }
    setTriggerUpdate(!triggerUpdate)
  }

  const isBreakpoint = !props.breakpoint.watchpoint && !props.breakpoint.instruction

  return (
    <div className="modal-overlay"
      tabIndex={0} // Make the div focusable
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          props.cancelDialog()
        } else if (event.key === 'Enter') {
          props.saveBreakpoint()
        }
      }}
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{
          left: `${props.dialogPositionX}px`, top: `${props.dialogPositionY}px`,
          width: "525px", height: "auto"
        }}
      >
        <div className="flex-column">
          <div className="flex-row-space-between"
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
            <div className="dialog-title">Edit Breakpoint</div>
            <button className="push-button"
              onClick={props.cancelDialog}>
              <FontAwesomeIcon icon={faXmark} style={{ fontSize: '0.8em' }} />
            </button>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column">
          <div className="flex-row">
            <div className="dialog-title">Break at: </div>
            <input type="radio"
              id="Address"
              name="breakAt" value="address"
              className="check-radio-box"
              checked={!(props.breakpoint.watchpoint || props.breakpoint.instruction)}
              onChange={(e) => { handleBreakAtChange(e) }} />
            <label htmlFor="Address" className="dialog-title flush-left">Breakpoint</label>
            <input type="radio" id="Watchpoint" name="watch" value="watchpoint"
              className="check-radio-box"
              checked={props.breakpoint.watchpoint}
              onChange={(e) => { handleBreakAtChange(e) }} />
            <label htmlFor="Watchpoint" className="dialog-title flush-left">Watchpoint</label>
            <input type="radio" id="Instruction" name="instruction" value="instruction"
              className="check-radio-box"
              checked={props.breakpoint.instruction}
              onChange={(e) => { handleBreakAtChange(e) }} />
            <label htmlFor="Instruction" className="dialog-title flush-left">Instruction</label>
          </div>

          {isBreakpoint && <BPEdit_Breakpoint breakpoint={props.breakpoint} />}
          {props.breakpoint.watchpoint && <BPEdit_Watchpoint
            breakpoint={props.breakpoint} />}
          {props.breakpoint.instruction && <BPEdit_Instruction
            breakpoint={props.breakpoint} />}

          <div className="flex-row-space-between" style={{ marginTop: "5px" }}>
            <div></div>
            <div className="flex-row">
              <button className="push-button text-button"
                onClick={props.saveBreakpoint}>
                <span className="centered-title">OK</span>
              </button>
              <button className="push-button text-button"
                onClick={props.cancelDialog}>
                <span className="centered-title">Cancel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakpointEdit;
