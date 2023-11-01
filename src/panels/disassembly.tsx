import React, { KeyboardEvent } from "react";
import { handleGetDisassembly,
  handleGetS6502,
  passBreakpoints,
  passSetDisassembleAddress } from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toHex } from "../emulator/utility/utility";
import {
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons";

class Disassembly extends React.Component<object,
  { breakpoints: Breakpoints;
  }> {
  lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
  enableScrollEvent = true
  nlines = 40  // should this be an argument?
  timeout = 0
  newScrollAddress = 0
  codeRef = React.createRef<HTMLDivElement>()
  breakpointRef = React.createRef<HTMLDivElement>()
  fakePointRef = React.createRef<SVGSVGElement>()

  constructor(props: object) {
    super(props);
    this.state = {
      breakpoints: new Map(),
    };
  }

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
      this.newScrollAddress = parseInt(line.slice(0, line.indexOf(':')), 16)
//      disassemblyRef.current.scrollTop = 1000
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
        if (line < 0 || line >= this.nlines) return
        const addrStr = handleGetDisassembly().split('\n')[line]
        const addr = parseInt(addrStr.slice(0, addrStr.indexOf(':')), 16)
        const newBreakpoint: Breakpoint = {disabled: false, hidden: false, once: false}
        const breakpoints: Breakpoints = new Map(this.state.breakpoints);
        breakpoints.set(addr, newBreakpoint)
        this.setState({breakpoints})
        passBreakpoints(breakpoints)
      }
    }
  }

  handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: Breakpoints = new Map(this.state.breakpoints);
    breakpoints.delete(addr)
    this.setState({breakpoints})
    passBreakpoints(breakpoints)
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
        if (line >= 0 && line < this.nlines) {
          this.codeRef.current.style.cursor = 'pointer'
          this.fakePointRef.current.style.display = 'initial'
          this.fakePointRef.current.style.top = `${2 + line * this.lineHeight}px`
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

  getLineOfDisassembly = (line: number) => {
    const disArray = handleGetDisassembly().split('\n')
    if (disArray.length <= 1) {
      return -1
    }
    const firstLine = parseInt(disArray[0].slice(0, disArray[0].indexOf(':')), 16)
    if (line < firstLine) return -1
    const last = disArray[disArray.length - 2]
    const lastLine = parseInt(last.slice(0, last.indexOf(':')), 16)
    if (line > lastLine) return -1
    for (let i = 0; i <= disArray.length - 2; i++) {
      const addr = parseInt(disArray[i].slice(0, disArray[i].indexOf(':')), 16)
      if (addr === line) return i
    }
    return -1
  }

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
    for (i = addrTop + this.nlines + 2; i <= 65535; i++) disassemblyValue += `${toHex(i, 4)}:\n`
    // We need to give React enough time to update the text contents
    // before the new scroll position is set. 100ms seems sufficient, 
    // 50ms causes jumping back to an intermediate scroll position.
    window.setTimeout(() => {
      if (this.codeRef.current) {
        this.enableScrollEvent = false
        if (this.lineHeight === 0) this.computeLineHeight()
        this.codeRef.current.scrollTop = scrollPos * this.lineHeight + 2
        if (this.breakpointRef.current) this.breakpointRef.current.style.display = 'block'
      }
    }, 100)
    return disassemblyValue
  }

  getBreakpointDiv = () => {
    if (handleGetDisassembly().length <= 1) return <></>
    const pc = this.getLineOfDisassembly(handleGetS6502().PC) * this.lineHeight
    const programCounterBar = (pc >= 0) ?
      <div className="programCounter" style={{top: `${pc}px`}}></div> : <></>
    return <div ref={this.breakpointRef} 
        style={{
        position: "relative",
        width: '0px',
        height: `${this.nlines * 10 - 2}pt`,
      }}>
      <FontAwesomeIcon icon={iconBreakpoint} ref={this.fakePointRef}
        className="breakpointStyle fakePoint"/>
      {Array.from(this.state.breakpoints).map(([key, breakpoint]) => (
        (this.getLineOfDisassembly(key) >= 0) ?
          <FontAwesomeIcon icon={iconBreakpoint}
            className={'breakpointStyle' + (breakpoint.disabled ? ' fakePoint' : '')}
            key={key} data-key={key}
            onClick={this.handleBreakpointClick}
            style={{
              top: `${2 + this.getLineOfDisassembly(key) * this.lineHeight}px`,
              }}/> :
          <span key={key}></span>
        )
      )}
      {programCounterBar}
    </div>
  }

  render() {
    return (
      <div className="flexRow thinBorder">
        {this.getBreakpointDiv()}
        <div className="debugPanel"
          ref={this.codeRef}
          onScroll={this.handleCodeScroll}
          onKeyDown={this.handleCodeKeyDown}
          onMouseMove={this.handleCodeMouseMove}
          onMouseLeave={this.handleCodeMouseLeave}
          onClick={this.handleCodeClick}
          style={{
            width: '200px', // Set the width to your desired value
            height: `${this.nlines * 10 - 2}pt`, // Set the height to your desired value
            overflow: 'auto',
            paddingLeft: "15pt",
          }} >
          {this.constructDisassembly()}
        </div>
      </div>
    )
  }
}

export default Disassembly;