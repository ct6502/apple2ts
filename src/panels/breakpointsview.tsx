import React from "react";
import { passSetDisassembleAddress } from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons";
import { getLineOfDisassembly } from "./debugpanelutilities";

class BreakpointsView extends React.Component<
{ breakpoints: Breakpoints; setBreakpoints: (breakpoints: Breakpoints) => void}, object> {
  lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
  nlines = 12  // should this be an argument?

  handleAddressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    if (addr >= 0) {
      if (getLineOfDisassembly(addr) < 0) {
        passSetDisassembleAddress(addr)
      }
    }
  }

  handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: Breakpoints = new Map(this.props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      bp.disabled = !bp.disabled
      this.props.setBreakpoints(breakpoints)
    }
  }

  removeAllBreakpoints = () => {
    this.props.setBreakpoints(new Map())
  }

  render() {
    return (
      <div className="flexColumn">
        <div className="flexRowSpaceBetween">
          <div className="biggerFont"
            style={{paddingTop: "15px",
            paddingBottom: "3px",
            paddingLeft: "5px",
            }}>Breakpoints</div>
          <button className="pushButton tightButton"
            title="Remove all breakpoints"
            onClick={this.removeAllBreakpoints}
            disabled={false}>
          <FontAwesomeIcon icon={faXmark} style={{ fontSize: '0.7em' }}/>
          </button>
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
            <FontAwesomeIcon icon={iconBreakpoint}
                className={'breakpointStyle' + (breakpoint.disabled ? ' fakePoint' : '')}
                key={key} data-key={key}
                onClick={this.handleBreakpointClick}/>
            <span data-key={key} onClick={this.handleAddressClick}>{breakpoint.code}</span>
          </div>
          )
        )}
        </div>
      </div>
    )
  }
}

export default BreakpointsView;