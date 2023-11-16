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
  {address: string,
    expression: string,
    hitcount: string,
    badExpression: string}>
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
      address: this.props.breakpoint.address.toString(16).toUpperCase(),
      expression: this.props.breakpoint.expression,
      hitcount: Math.max(this.props.breakpoint.hitcount, 1).toString(),
      badExpression: '',
    }
  }

  handleAddressChange = (value: string) => {
    value = value.replace(/[^0-9a-f]/gi, '').toUpperCase()
    if (this.props.breakpoint) {
      this.props.breakpoint.address = parseInt(value, 16)
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

  render() {
    return <div className="modal-overlay"
      onMouseMove={(e) => this.handleMouseMove(e)}>
      <div className="breakpoint-edit flex-column-space-between"
        ref={this.dialogRef}
        style={{left: `${this.props.dialogPositionX}px`, top: `${this.props.dialogPositionY}px`}}
        >
        <div className="flexColumn">
          <div className="flexRowSpaceBetween"
            onMouseDown={(e) => this.handleMouseDown(e)}
            onMouseMove={(e) => this.handleMouseMove(e)}
            onMouseUp={this.handleMouseUp}>
            <div className="white-title">Edit Breakpoint</div>
            <div onClick={this.props.cancelDialog}>
              <FontAwesomeIcon icon={faBreakpointDelete}
                className='breakpoint-button'
                style={{color: "white"}}/>
            </div>
          </div>
          <div className="horiz-rule"></div>
        </div>
        <div className="flex-column-space-between">
          <EditField name="Address"
            value={this.state.address}
            setValue={this.handleAddressChange}
            placeholder="F800"
            width="5em"/>
          <EditField name="Expression"
            value={this.state.expression}
            setValue={this.handleExpressionChange}
            warning={this.state.badExpression}
            placeholder="Break when expression evaluates to true"/>
          <EditField name="Hit&nbsp;count"
            value={this.state.hitcount}
            setValue={this.handleHitCountChange}
            placeholder="1"
            width="5em"/>
        </div>
        <div className="flexRowSpaceBetween">
          <div></div>
          <div className="flexRow">
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
