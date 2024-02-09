import React, { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark as iconBreakpointDelete,
} from "@fortawesome/free-solid-svg-icons";
import { Breakpoint, checkBreakpointExpression } from "./breakpoint";
import EditField from "./editfield";
import PullDownMenu from "./pulldownmenu";
import { getSoftSwitchDescriptions } from "../emulator/softswitches"
import { Droplist } from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../emulator/memory";

const BreakpointEdit = (props: {
  breakpoint: Breakpoint,
  saveBreakpoint: () => void,
  cancelDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void
}) => {
  const dialogRef = useRef(null)

  // const [state, setState] = useState({
  //   watchpoint: props.breakpoint.watchpoint,
  //   address: props.breakpoint.address.toString(16).toUpperCase(),
  //   expression: props.breakpoint.expression,
  //   hitcount: Math.max(props.breakpoint.hitcount, 1).toString(),
  //   hexvalue: '',
  //   memget: props.breakpoint.memget,
  //   memset: props.breakpoint.memset,
  //   memoryBank: MEMORY_BANKS[props.breakpoint.memoryBank].name,
  // })
  const [badExpression, setBadExpression] = useState('')
  const [triggerUpdate, setTriggerUpdate] = useState(false)
  const [offset, setOffset] = useState([0, 0])
  const [dragging, setDragging] = useState(false)

  const handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 4).toUpperCase()
    if (props.breakpoint) {
      const address = parseInt(value || '0', 16)
      if (address >= 0xC000 && address <= 0xC0FF) {
        props.breakpoint.memget = true
        props.breakpoint.memset = true
        const switches = getSoftSwitchDescriptions()
        if (switches[address]) {
          if (switches[address].includes("status")) {
            props.breakpoint.memset = false
          } else if (switches[address].includes("write")) {
            props.breakpoint.memget = false
          }
        }
      }
      props.breakpoint.address = address
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleExpressionChange = (value: string) => {
    let expression = value.replace("===", "==")
    expression = expression.replace(/[^#$0-9 abcdefxysp|&()=<>+\-*/]/gi, '')
    expression = expression.toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.expression = expression
      const badExpression = checkBreakpointExpression(expression)
      setBadExpression(badExpression)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleHexValueChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 2).toUpperCase()
    if (props.breakpoint) {
      props.breakpoint.hexvalue = parseInt(value ? value : '-1', 16)
      setTriggerUpdate(!triggerUpdate)
    }
  }

  const handleHitCountChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, '')
    if (value.trim() !== '') {
      value = Math.max(parseInt(value), 1).toString()
    }
    if (props.breakpoint) {
      props.breakpoint.hitcount = parseInt(value || '1')
      setTriggerUpdate(!triggerUpdate)
    }
  }

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
    props.breakpoint.watchpoint = e.target.value === "memoryAccess"
    handleExpressionChange(props.breakpoint.expression)
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.memget = e.target.checked
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.breakpoint.memset = e.target.checked
    setTriggerUpdate(!triggerUpdate)
  }

  const handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key];
      if (bank.name === value) {
        props.breakpoint.memoryBank = key
        setTriggerUpdate(!triggerUpdate)
        // bail early since we found a match
        return false
      }
    }
  }

  const isBankDisabledForAddress = (address: number, value: string) => {
    for (const bank of Object.values(MEMORY_BANKS)) {
      if (bank.name === value && address >= bank.min && address <= bank.max) {
        return false
      }
    }
    return true
  }

  const v = props.breakpoint.hexvalue
  const hexvalue = v >= 0 ? v.toString(16).toUpperCase() : ''

  return (
    <div className="modal-overlay"
      onMouseMove={(e) => handleMouseMove(e)}
      onMouseUp={handleMouseUp}>
      <div className="floating-dialog flex-column"
        ref={dialogRef}
        style={{
          left: `${props.dialogPositionX}px`, top: `${props.dialogPositionY}px`,
          width: "450px", height: "auto"
        }}
      >
        <div className="flex-column">
          <div className="flex-row-space-between"
            onMouseDown={(e) => handleMouseDown(e)}
            onMouseMove={(e) => handleMouseMove(e)}
            onMouseUp={handleMouseUp}>
            <div className="white-title">Edit Breakpoint or Watchpoint</div>
            <div onClick={props.cancelDialog}>
              <FontAwesomeIcon icon={iconBreakpointDelete}
                className='breakpoint-pushbutton'
                style={{ color: "white", fontSize: "12pt", marginTop: "4pt" }} />
            </div>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column">
          <div className="flex-row">
            <div className="white-title">Break at: </div>
            <input type="radio" id="Address" name="breakAt" value="address"
              className="check-radio-box"
              checked={!props.breakpoint.watchpoint}
              onChange={(e) => { handleBreakAtChange(e) }} />
            <label htmlFor="Address" className="white-title flush-left">Breakpoint</label>
            <input type="radio" id="MemoryAccess" name="breakAt" value="memoryAccess"
              className="check-radio-box"
              checked={props.breakpoint.watchpoint}
              onChange={(e) => { handleBreakAtChange(e) }} />
            <label htmlFor="MemoryAccess" className="white-title flush-left">Memory Watchpoint</label>
          </div>
          <div className="flex-row">
            <EditField name="Address: "
              value={props.breakpoint.address.toString(16).toUpperCase()}
              setValue={handleAddressChange}
              placeholder="F800"
              width="5em" />
            {props.breakpoint.watchpoint &&
              <div>
                <PullDownMenu values={getSoftSwitchDescriptions()} setValue={handleAddressChange} />
              </div>}
          </div>
          {props.breakpoint.watchpoint ?
            <div>
              <div style={{ height: "8px" }} />
              <input type="checkbox" id="memget" value="memget"
                className="check-radio-box shift-down"
                checked={props.breakpoint.memget}
                onChange={(e) => { handleMemgetChange(e) }} />
              <label htmlFor="memget" className="white-title flush-left">Read</label>
              <input type="checkbox" id="memset" value="memset"
                className="check-radio-box shift-down"
                checked={props.breakpoint.memset}
                onChange={(e) => { handleMemsetChange(e) }} />
              <label htmlFor="memset" className="white-title flush-left">Write</label>
              <EditField name="With hex value:"
                value={hexvalue}
                setValue={handleHexValueChange}
                placeholder="any"
                width="5em" />
            </div>
            :
            <div>
              <EditField name="Expression: "
                value={props.breakpoint.expression}
                setValue={handleExpressionChange}
                warning={badExpression}
                help="Example: (A > #$80) && ($2000 == #$C0)"
                placeholder="Break when expression evaluates to true" />
              <EditField name="Hit&nbsp;Count: "
                value={props.breakpoint.hitcount.toString()}
                setValue={handleHitCountChange}
                placeholder="1"
                width="5em" />
            </div>
          }
          <Droplist name="Memory&nbsp;Bank: "
            className="dark-mode-edit"
            value={MEMORY_BANKS[props.breakpoint.memoryBank].name}
            values={MemoryBankNames}
            setValue={handleMemoryBankChange}
            address={props.breakpoint.address}
            isDisabled={isBankDisabledForAddress} />
        </div>
        <div className="flex-row-space-between" style={{ marginTop: "5px" }}>
          <div></div>
          <div className="flex-row">
            <button className="pushButton text-button"
              onClick={props.saveBreakpoint}>
              <span className="bigger-font">OK</span>
            </button>
            <button className="pushButton text-button"
              onClick={props.cancelDialog}>
              <span className="bigger-font">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BreakpointEdit;
