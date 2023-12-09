import React from "react";
import { passSetDisassembleAddress } from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPencil as iconBreakpointEdit,
  faXmark as iconBreakpointDelete,
  faPlus as iconBreakpointAdd,
} from "@fortawesome/free-solid-svg-icons";
import { getLineOfDisassembly } from "./debugpanelutilities";
import BreakpointEdit from "./breakpointedit";
import { Breakpoint, Breakpoints, getBreakpointIcon, getBreakpointString, getBreakpointStyle } from "./breakpoint";

class BreakpointsView extends React.Component<
  {breakpoints: Breakpoints;
  setBreakpoints: (breakpoints: Breakpoints) => void},
  {showBreakpointEdit: boolean}>
{
  lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
  nlines = 12  // should this be an argument?
  breakpointEditAddress = 0
  breakpointEditValue = new Breakpoint()
  dialogPositionX = 1050
  dialogPositionY = 650

  constructor(props: { breakpoints: Breakpoints;
    setBreakpoints: (breakpoints: Breakpoints) => void}) {
    super(props);
    this.state = {
      showBreakpointEdit: false,
    };
  }

  handleAddressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    if (addr >= 0) {
      if (getLineOfDisassembly(addr) < 0) {
        passSetDisassembleAddress(addr)
      }
    }
  }

  handleBreakpointClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: Breakpoints = new Map(this.props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      bp.disabled = !bp.disabled
      this.props.setBreakpoints(breakpoints)
    }
  }

  handleBreakpointDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: Breakpoints = new Map(this.props.breakpoints)
    if (breakpoints.delete(addr)) {
      this.props.setBreakpoints(breakpoints)
    }
  }

  addBreakpoint = () => {
    this.breakpointEditAddress = -1
    this.breakpointEditValue = new Breakpoint
  this.setState({showBreakpointEdit: true})
  }

  removeAllBreakpoints = () => {
    this.props.setBreakpoints(new Map())
  }

  handleBreakpointEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: Breakpoints = new Map(this.props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      // Save the original address. If it gets changed then
      // we'll need to remove the old one.
      this.breakpointEditAddress = addr
      this.breakpointEditValue = {...bp}
      this.setState({showBreakpointEdit: true})
    }
  }

  saveBreakpoint = () => {
    const breakpoints: Breakpoints = new Map(this.props.breakpoints)
    breakpoints.delete(this.breakpointEditAddress)
    breakpoints.set(this.breakpointEditValue.address, this.breakpointEditValue)
    this.props.setBreakpoints(breakpoints)
    this.setState({showBreakpointEdit: false})
  }

  cancelEdit = () => {
    this.setState({showBreakpointEdit: false})
  }

  setDialogPosition = (x: number, y: number) => {
    this.dialogPositionX = x
    this.dialogPositionY = y
  }

  render() {
    return (
      <div className="flex-column">
        <div className="flex-row-space-between">
          <div className="bigger-font"
            style={{paddingTop: "15px",
            paddingBottom: "3px",
            paddingLeft: "5px",
            }}>Breakpoints</div>
          <div className="flex-row">
            <button className="pushButton tightButton"
              title="Add new breakpoint"
              onClick={this.addBreakpoint}
              disabled={false}>
            <FontAwesomeIcon icon={iconBreakpointAdd} style={{ fontSize: '0.7em' }}/>
            </button>
            <button className="pushButton tightButton"
              title="Remove all breakpoints"
              onClick={this.removeAllBreakpoints}
              disabled={false}>
            <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '0.8em' }}/>
            </button>
          </div>
        </div>
        <div className="debugPanel thinBorder"
          style={{
            width: '213px',
            height: `${this.nlines * 10 - 2}pt`,
            overflow: 'auto',
            paddingLeft: "5pt",
            cursor: "pointer"
          }}>
          {Array.from(this.props.breakpoints).map(([key, breakpoint]) => (
            <div key={key}>
              <button className="breakpoint-pushbutton"
                data-key={key}
                onClick={(e) => {this.handleBreakpointClick(e)}}>
                <FontAwesomeIcon className={getBreakpointStyle(breakpoint)}
                  style={{paddingRight: "0"}}
                  icon={getBreakpointIcon(breakpoint)}/>
              </button>
              <button className="breakpoint-pushbutton"
                data-key={key}
                onClick={(e) => {this.handleBreakpointEdit(e)}}
                disabled={false}>
                <FontAwesomeIcon icon={iconBreakpointEdit}/>
              </button>
              <button className="breakpoint-pushbutton"
                data-key={key}
                onClick={(e) => {this.handleBreakpointDelete(e)}}>
                <FontAwesomeIcon icon={iconBreakpointDelete} style={{ fontSize: '1.3em' }}/>
              </button>
              <span data-key={key} onClick={this.handleAddressClick}>{getBreakpointString(breakpoint)}</span>
            </div>
            )
          )}
        </div>
        {this.state.showBreakpointEdit && <BreakpointEdit breakpoint={this.breakpointEditValue} saveBreakpoint={this.saveBreakpoint}
          cancelDialog={this.cancelEdit}
          dialogPositionX={this.dialogPositionX}
          dialogPositionY={this.dialogPositionY}
          setDialogPosition={this.setDialogPosition}/>}
      </div>
    )
  }
}

export default BreakpointsView;