import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark as iconBreakpointDelete,
} from "@fortawesome/free-solid-svg-icons";
import { Breakpoint, checkBreakpointExpression } from "./breakpoint";
import EditField from "./editfield";
import PullDownMenu from "./pulldownmenu";
import { getSoftSwitchDescriptions } from "../emulator/softswitches"
import Droplist from "./droplist";
import { MEMORY_BANKS, MemoryBankKeys, MemoryBankNames } from "../emulator/memory";

class BreakpointEdit extends React.Component<
  {
    breakpoint: Breakpoint,
    saveBreakpoint: () => void,
    cancelDialog: () => void,
    dialogPositionX: number,
    dialogPositionY: number,
    setDialogPosition: (x: number, y: number) => void
  },
  {
    watchpoint: boolean,
    address: string,
    expression: string,
    hitcount: string,
    badExpression: string,
    value: string,
    memget: boolean,
    memset: boolean,
    memoryBank: string
  }>
{
  dialogRef = React.createRef<HTMLDivElement>();
  offsetX = 0
  offsetY = 0
  dragging = false

  constructor(props: {
    breakpoint: Breakpoint,
    saveBreakpoint: () => void,
    cancelDialog: () => void,
    dialogPositionX: number,
    dialogPositionY: number,
    setDialogPosition: (x: number, y: number) => void
  }) {
    super(props);
    this.state = {
      watchpoint: this.props.breakpoint.watchpoint,
      address: this.props.breakpoint.address.toString(16).toUpperCase(),
      expression: this.props.breakpoint.expression,
      hitcount: Math.max(this.props.breakpoint.hitcount, 1).toString(),
      badExpression: '',
      value: '',
      memget: this.props.breakpoint.memget,
      memset: this.props.breakpoint.memset,
      memoryBank: MEMORY_BANKS[this.props.breakpoint.memoryBank].name
    }
  }

  handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 4).toUpperCase()
    if (this.props.breakpoint) {
      const address = parseInt(value || '0', 16)
      if (address >= 0xC000 && address <= 0xC0FF) {
        this.props.breakpoint.memget = true
        this.props.breakpoint.memset = true
        const switches = getSoftSwitchDescriptions()
        if (switches[address]) {
          if (switches[address].includes("status")) {
            this.props.breakpoint.memset = false
          } else if (switches[address].includes("write")) {
            this.props.breakpoint.memget = false
          }
        }
      }
      this.props.breakpoint.address = address
      this.setState({ address: value })
    }
  }

  handleExpressionChange = (value: string) => {
    let expression = value.replace("===", "==")
    expression = expression.replace(/[^#$0-9 abcdefxysp|&()=<>+\-*/]/gi, '')
    expression = expression.toUpperCase()
    if (this.props.breakpoint) {
      this.props.breakpoint.expression = expression
      const badExpression = checkBreakpointExpression(expression)
      this.setState({ expression, badExpression })
    }
  }

  handleHexValueChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').slice(0, 2).toUpperCase()
    if (this.props.breakpoint) {
      this.props.breakpoint.value = parseInt(value, 16)
      this.setState({ value })
    }
  }

  handleHitCountChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, '')
    if (value.trim() !== '') {
      value = Math.max(parseInt(value), 1).toString()
    }
    if (this.props.breakpoint) {
      this.props.breakpoint.hitcount = parseInt(value || '1')
      this.setState({ hitcount: value })
    }
  }

  handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    this.dragging = true
    const dialog = this.dialogRef.current;
    if (dialog) {
      // Offset of the mouse down event within the dialog title bar.
      // This way we drag the window from where the user clicked.
      this.offsetX = e.clientX - dialog.offsetLeft
      this.offsetY = e.clientY - dialog.offsetTop
    }
  }

  handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (this.dragging) {
      const dialog = this.dialogRef.current;
      if (dialog) {
        const left = e.clientX - this.offsetX;
        const top = e.clientY - this.offsetY;
        this.props.setDialogPosition(left, top)
        dialog.style.left = `${left}px`;
        dialog.style.top = `${top}px`;
      }
    }
  }

  handleMouseUp = () => {
    this.dragging = false
  }

  handleBreakAtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.breakpoint.watchpoint = e.target.value === "memoryAccess"
    this.handleExpressionChange(this.props.breakpoint.expression)
    this.setState({ watchpoint: this.props.breakpoint.watchpoint })
  }

  handleMemgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.breakpoint.memget = e.target.checked
    this.setState({ memget: this.props.breakpoint.memget })
  }

  handleMemsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.breakpoint.memset = e.target.checked
    this.setState({ memset: this.props.breakpoint.memset })
  }

  handleMemoryBankChange = (value: string) => {
    for (const key of MemoryBankKeys) {
      const bank = MEMORY_BANKS[key];
      if (bank.name === value) {
        this.props.breakpoint.memoryBank = key
        this.setState({ memoryBank: value })
        return false
      }
    }
  }

  isBankDisabledForAddress = (address: number, value: string) => {
    for (const bank of Object.values(MEMORY_BANKS)) {
      if (bank.name === value && address >= bank.min && address <= bank.max) {
        return false
      }
    }
    return true
  }

  render() {
    return <div className="modal-overlay"
      onMouseMove={(e) => this.handleMouseMove(e)}>
      <div className="floating-dialog flex-column"
        ref={this.dialogRef}
        style={{
          left: `${this.props.dialogPositionX}px`, top: `${this.props.dialogPositionY}px`,
          width: "450px", height: "auto"
        }}
      >
        <div className="flex-column">
          <div className="flex-row-space-between"
            onMouseDown={(e) => this.handleMouseDown(e)}
            onMouseMove={(e) => this.handleMouseMove(e)}
            onMouseUp={this.handleMouseUp}>
            <div className="white-title">Edit Breakpoint or Watchpoint</div>
            <div onClick={this.props.cancelDialog}>
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
              checked={!this.props.breakpoint.watchpoint}
              onChange={(e) => { this.handleBreakAtChange(e) }} />
            <label htmlFor="Address" className="white-title flush-left">Breakpoint</label>
            <input type="radio" id="MemoryAccess" name="breakAt" value="memoryAccess"
              className="check-radio-box"
              checked={this.props.breakpoint.watchpoint}
              onChange={(e) => { this.handleBreakAtChange(e) }} />
            <label htmlFor="MemoryAccess" className="white-title flush-left">Memory Watchpoint</label>
          </div>
          <div className="flex-row">
            <EditField name="Address: "
              value={this.state.address}
              setValue={this.handleAddressChange}
              placeholder="F800"
              width="5em" />
            {this.props.breakpoint.watchpoint &&
              <div>
                <div className="flex-row">
                  <PullDownMenu values={getSoftSwitchDescriptions()} setValue={this.handleAddressChange} />
                  <input type="checkbox" id="memget" value="memget"
                    className="check-radio-box shift-down"
                    checked={this.props.breakpoint.memget}
                    onChange={(e) => { this.handleMemgetChange(e) }} />
                  <label htmlFor="memget" className="white-title flush-left">Read</label>
                  <input type="checkbox" id="memset" value="memset"
                    className="check-radio-box shift-down"
                    checked={this.props.breakpoint.memset}
                    onChange={(e) => { this.handleMemsetChange(e) }} />
                  <label htmlFor="memset" className="white-title flush-left">Write</label>
                </div>
              </div>}
          </div>
          {this.state.watchpoint ?
            <div>
              <EditField name="With hex value:"
                value={this.state.value}
                setValue={this.handleHexValueChange}
                placeholder="any"
                width="5em" />
              <div style={{ height: "32px" }} />
            </div>
            :
            <div>
              <EditField name="Expression: "
                value={this.state.expression}
                setValue={this.handleExpressionChange}
                warning={this.state.badExpression}
                help="Example: ($2000 == #$C0) && (A > #$80)"
                placeholder="Break when expression evaluates to true" />
              <EditField name="Hit&nbsp;Count: "
                value={this.state.hitcount}
                setValue={this.handleHitCountChange}
                placeholder="1"
                width="5em" />
            </div>
          }
          <Droplist name="Memory&nbsp;Bank: "
            value={this.state.memoryBank}
            values={MemoryBankNames}
            setValue={this.handleMemoryBankChange}
            address={parseInt(this.state.address || '0', 16)}
            isDisabled={this.isBankDisabledForAddress} />
        </div>
        <div className="flex-row-space-between">
          <div></div>
          <div className="flex-row">
            <button className="pushButton text-button"
              onClick={this.props.saveBreakpoint}>
              <span className="bigger-font">OK</span>
            </button>
            <button className="pushButton text-button"
              onClick={this.props.cancelDialog}>
              <span className="bigger-font">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  }
}

export default BreakpointEdit;
