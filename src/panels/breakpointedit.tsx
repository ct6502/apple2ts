import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark as faBreakpointDelete,
} from "@fortawesome/free-solid-svg-icons";
import { Breakpoint, checkBreakpointExpression } from "./breakpoint";
import EditField from "./editfield";

class BreakpointEdit extends React.Component<
  {breakpoint: Breakpoint,
  saveBreakpoint: () => void,
  cancelDialog: () => void,
  dialogPositionX: number,
  dialogPositionY: number,
  setDialogPosition: (x: number, y: number) => void},
  { watchpoint: boolean,
    address: string,
    expression: string,
    hitcount: string,
    badExpression: string,
    memget: boolean,
    memset: boolean}>
{
  dialogRef = React.createRef<HTMLDivElement>();
  offsetX = 0
  offsetY = 0
  dragging = false

  constructor(props: { breakpoint: Breakpoint,
    saveBreakpoint: () => void,
    cancelDialog: () => void,
    dialogPositionX: number,
    dialogPositionY: number,
    setDialogPosition: (x: number, y: number) => void}) {
    super(props);
    this.state = {
      watchpoint: this.props.breakpoint.watchpoint,
      address: this.props.breakpoint.address.toString(16).toUpperCase(),
      expression: this.props.breakpoint.expression,
      hitcount: Math.max(this.props.breakpoint.hitcount, 1).toString(),
      badExpression: '',
      memget: this.props.breakpoint.memget,
      memset: this.props.breakpoint.memset,
    }
  }

  handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').toUpperCase()
    if (this.props.breakpoint) {
      this.props.breakpoint.address = parseInt(value || '0', 16)
      this.setState({address: value})
    }
  }

  handleExpressionChange = (value: string) => {
    let expression = value.replace("===", "==")
    expression = expression.replace(/[^#$0-9 abcdefxysp|&()=<>+\-*/]/gi, '')
    expression = expression.toUpperCase()
    if (this.props.breakpoint) {
      this.props.breakpoint.expression = expression
      const badExpression = checkBreakpointExpression(expression)
      this.setState({expression, badExpression})
    }
  }

  handleHitCountChange = (value: string) => {
    value = value.replace(/[^0-9]/gi, '')
    if (value.trim() !== '') {
      value = Math.max(parseInt(value), 1).toString()
    }
    if (this.props.breakpoint) {
      this.props.breakpoint.hitcount = parseInt(value || '1')
      this.setState({hitcount: value})
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
    this.setState({watchpoint: this.props.breakpoint.watchpoint})
  }

  handleMemgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.breakpoint.memget = e.target.checked
    this.setState({memget: this.props.breakpoint.memget})
  }

  handleMemsetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.props.breakpoint.memset = e.target.checked
    this.setState({memset: this.props.breakpoint.memset})
  }

  render() {
    return <div className="modal-overlay"
      onMouseMove={(e) => this.handleMouseMove(e)}>
      <div className="floating-dialog flex-column"
        ref={this.dialogRef}
        style={{left: `${this.props.dialogPositionX}px`, top: `${this.props.dialogPositionY}px`}}
        >
        <div className="flex-column">
          <div className="flex-row-space-between"
            onMouseDown={(e) => this.handleMouseDown(e)}
            onMouseMove={(e) => this.handleMouseMove(e)}
            onMouseUp={this.handleMouseUp}>
            <div className="white-title">Edit Breakpoint</div>
            <div onClick={this.props.cancelDialog}>
              <FontAwesomeIcon icon={faBreakpointDelete}
                className='breakpoint-pushbutton'
                style={{color: "white"}}/>
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
              onChange={(e) => {this.handleBreakAtChange(e)}}/>
            <label htmlFor="Address" className="white-title flush-left">Program Counter</label>
            <input type="radio" id="MemoryAccess" name="breakAt" value="memoryAccess"
              className="check-radio-box"
              checked={this.props.breakpoint.watchpoint}
              onChange={(e) => {this.handleBreakAtChange(e)}}/>
            <label htmlFor="MemoryAccess" className="white-title flush-left">Memory Access</label>
          </div>
          <EditField name="Address: "
            value={this.state.address}
            setValue={this.handleAddressChange}
            placeholder="F800"
            width="5em"/>
          {this.state.watchpoint ?
            <div className="flex-column">
              <div className="flex-row">
                <input type="checkbox" id="memset" value="memset"
                  className="check-radio-box shift-down"
                  checked={this.props.breakpoint.memset}
                  onChange={(e) => {this.handleMemsetChange(e)}}/>
                <label htmlFor="memset" className="white-title flush-left">Memory Write</label>
              </div>
              <div className="flex-row">
                <input type="checkbox" id="memget" value="memget"
                  className="check-radio-box shift-down"
                  checked={this.props.breakpoint.memget}
                  onChange={(e) => {this.handleMemgetChange(e)}}/>
                <label htmlFor="memget" className="white-title flush-left">Memory Read</label>
              </div>
          </div> : 
          <div>
              <EditField name="Expression: "
                value={this.state.expression}
                setValue={this.handleExpressionChange}
                warning={this.state.badExpression}
                placeholder="Break when expression evaluates to true"/>
              <EditField name="Hit&nbsp;count: "
                value={this.state.hitcount}
                setValue={this.handleHitCountChange}
                placeholder="1"
                width="5em"/>
            </div>
          }
        </div>
        <div className="flex-row-space-between">
          <div></div>
          <div className="flex-row">
            <button className="pushButton text-button"
              onMouseUp={this.props.saveBreakpoint}>
              <span className="bigger-font">OK</span>
            </button>
            <button className="pushButton text-button"
              onMouseUp={this.props.cancelDialog}>
              <span className="bigger-font">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  }
}

export default BreakpointEdit;
