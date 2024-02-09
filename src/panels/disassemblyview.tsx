import React, { KeyboardEvent } from "react";
import {
  handleGetDisassembly,
  handleGetState6502,
  passSetDisassembleAddress
} from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toHex } from "../emulator/utility/utility";
import {
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons";
import { getLineOfDisassembly } from "./debugpanelutilities";
import { Breakpoint, BreakpointMap, getBreakpointIcon, getBreakpointStyle } from "./breakpoint";

const nlines = 40
const bpOffset = 2

class DisassemblyView extends React.Component<{ breakpoints: BreakpointMap; setBreakpoints: (breakpoints: BreakpointMap) => void; }, object> {
  lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
  enableScrollEvent = true
  timeout = 0
  newScrollAddress = 0
  codeRef = React.createRef<HTMLDivElement>()
  breakpointRef = React.createRef<HTMLDivElement>()
  fakePointRef = React.createRef<SVGSVGElement>()

  computeLineHeight = () => {
    if (this.codeRef && this.codeRef.current) {
      //      const nlines = handleGetDisassembly().split('\n').length
      //    this.lineHeight = (disassemblyRef.current.clientHeight - 4) / nlines
      const n = this.codeRef.current.innerText.split('\n').length - 1
      if (n === 0) return
      this.lineHeight = (this.codeRef.current.scrollHeight - 4) / n
    }
  }

  handleCodeScroll = () => {
    if (!this.enableScrollEvent) {
      this.enableScrollEvent = true
      return
    }
    if (this.codeRef.current) {
      if (this.lineHeight === 0) this.computeLineHeight()
      const topLineIndex = Math.round(this.codeRef.current.scrollTop / this.lineHeight)
      const dv = this.codeRef.current.innerText.split('\n')
      const line = dv[topLineIndex]
      const newScrollAddress = parseInt(line.slice(0, line.indexOf(':')), 16)
      if (newScrollAddress === this.newScrollAddress) return
      this.newScrollAddress = newScrollAddress
      if (this.timeout) clearTimeout(this.timeout)
      if (this.breakpointRef.current) this.breakpointRef.current.style.display = 'none'
      this.timeout = window.setTimeout(() => {
        this.timeout = 0
        passSetDisassembleAddress(this.newScrollAddress)
      }, 50)
    }
  }

  handleCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()  // suppress normal scroll events
      const currentAddr = this.getAddressAtTop()
      let newAddress = currentAddr + 1
      if (e.metaKey) {
        newAddress = 0xFFFF
      } else if (e.ctrlKey) {
        // Jump down to start of next page
        newAddress = ((currentAddr >> 8) + 1) << 8
      }
      passSetDisassembleAddress(Math.min(newAddress, 0xFFFF))
    }
    else if (e.key === 'ArrowUp') {
      e.preventDefault()  // suppress normal scroll events
      const currentAddr = this.getAddressAtTop()
      if (currentAddr <= 0) return
      let newAddress = currentAddr - 1
      if (e.metaKey) {
        newAddress = 0
      } else if (e.ctrlKey) {
        // Jump back to start of page (or previous page if at $XX00)
        newAddress = ((currentAddr - 1) >> 8) << 8
      }
      passSetDisassembleAddress(Math.max(newAddress, 0))
    }
  }

  getAddressAtTop = () => {
    const disassembly = handleGetDisassembly()
    return parseInt(disassembly.slice(0, disassembly.indexOf(':')), 16)
  }

  handleCodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.codeRef && this.codeRef.current) {
      if (this.lineHeight === 0) this.computeLineHeight()
      const divRect = this.codeRef.current.getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / this.lineHeight)
        if (line < 0 || line >= nlines) return
        const code = handleGetDisassembly().split('\n')[line]
        const addr = parseInt(code.slice(0, code.indexOf(':')), 16)
        const bp: Breakpoint = new Breakpoint()
        bp.address = addr
        const breakpoints: BreakpointMap = new BreakpointMap(this.props.breakpoints);
        breakpoints.set(addr, bp)
        this.props.setBreakpoints(breakpoints)
      }
    }
  }

  handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: BreakpointMap = new BreakpointMap(this.props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      if (bp.disabled) {
        bp.disabled = false
      } else {
        breakpoints.delete(addr)
      }
      this.props.setBreakpoints(breakpoints)
    }
    if (this.fakePointRef.current) this.fakePointRef.current.style.display = 'none'
  }

  handleCodeMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (this.codeRef.current && this.fakePointRef.current) {
      if (this.lineHeight === 0) this.computeLineHeight()
      const divRect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX >= 1 && clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / this.lineHeight)
        if (line >= 0 && line < nlines) {
          this.codeRef.current.style.cursor = 'pointer'
          this.fakePointRef.current.style.display = 'initial'
          this.fakePointRef.current.style.top = `${bpOffset + line * this.lineHeight}px`
          return
        }
      }
      this.codeRef.current.style.cursor = 'text'
      this.fakePointRef.current.style.display = 'none'
    }
  }

  handleCodeMouseLeave = () => {
    if (this.fakePointRef.current) {
      this.fakePointRef.current.style.display = 'none'
    }
  }

  // const getAddressAtBottom = () => {
  //   const disArray = handleGetDisassembly().split('\n')
  //   const last = disArray[disArray.length - 2]
  //   return parseInt(last.slice(0, last.indexOf(':')), 16)
  // }

  constructDisassembly = () => {
    const disassembly = handleGetDisassembly()
    if (disassembly.length <= 1) {
      return ''
    }
    const addrTop = this.getAddressAtTop()
    let disassemblyValue = ''
    let i = 0
    for (i = 0; i < addrTop; i++) disassemblyValue += `${toHex(i, 4)}:\n`
    const scrollPos = i
    disassemblyValue += disassembly
    for (i = addrTop + nlines + 2; i <= 65535; i++) disassemblyValue += `${toHex(i, 4)}:\n`
    // We need to give React enough time to update the text contents
    // before the new scroll position is set. 100ms seems sufficient, 
    // 50ms causes jumping back to an intermediate scroll position.
    window.setTimeout(() => {
      if (this.codeRef.current) {
        this.enableScrollEvent = false
        if (this.lineHeight === 0) this.computeLineHeight()
        this.codeRef.current.scrollTop = scrollPos * this.lineHeight + 2
        // For some reason the breakpoint icons are not visible unless we re-set the display style.
        if (this.breakpointRef.current) this.breakpointRef.current.style.display = 'block'
      }
    }, 100)
    return disassemblyValue
  }

  getBreakpointDiv = () => {
    if (handleGetDisassembly().length <= 1) return <></>
    const pc = getLineOfDisassembly(handleGetState6502().PC) * this.lineHeight
    const programCounterBar = (pc >= 0) &&
      <div className="programCounter" style={{ top: `${pc}px` }}></div>
    return <div ref={this.breakpointRef}
      style={{
        position: "relative",
        width: '0px',
        height: `${nlines * 10 - 2}pt`,
      }}>
      <FontAwesomeIcon icon={iconBreakpoint} ref={this.fakePointRef}
        className="breakpoint-style breakpoint-position fakePoint"
        style={{ pointerEvents: 'none', display: 'none' }} />
      {Array.from(this.props.breakpoints).map(([key, breakpoint]) => (
        (getLineOfDisassembly(key) >= 0) ?
          <FontAwesomeIcon icon={getBreakpointIcon(breakpoint)}
            className={'breakpoint-position ' + getBreakpointStyle(breakpoint)}
            key={key} data-key={key}
            onClick={this.handleBreakpointClick}
            style={{
              top: `${bpOffset + getLineOfDisassembly(key) * this.lineHeight}px`,
            }} /> :
          <span key={key}></span>
      )
      )}
      {programCounterBar}
    </div>
  }

  render() {
    // Need to set tabIndex={-1} on the div to get onKeyDown to work.
    // Could change to tabIndex={0} to make the div part of the tab order.
    return (
      <div className="flex-row thinBorder">
        {this.getBreakpointDiv()}
        <div className="debug-panel"
          ref={this.codeRef}
          onScroll={this.handleCodeScroll}
          onKeyDown={this.handleCodeKeyDown}
          onMouseMove={this.handleCodeMouseMove}
          onMouseLeave={this.handleCodeMouseLeave}
          onClick={this.handleCodeClick}
          tabIndex={-1}
          style={{
            width: '200px',
            height: `${nlines * 10 - 2}pt`,
            overflow: 'auto',
            paddingLeft: "15pt",
            outline: "none",
            marginTop: "0pt",
          }} >
          {this.constructDisassembly()}
        </div>
      </div>
    )
  }
}

export default DisassemblyView;