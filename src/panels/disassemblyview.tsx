import React, { KeyboardEvent, useRef } from "react";
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

const DisassemblyView = (props:
  { breakpoints: BreakpointMap; setBreakpoints: (breakpoints: BreakpointMap) => void; }) => {
  const [lineHeight, setLineHeight] = React.useState(0)
  const [enableScrollEvent, setEnableScrollEvent] = React.useState(true)
  const [newScrollAddress, setNewScrollAddress] = React.useState(0)
  const codeRef = useRef(null)
  const breakpointRef = useRef(null)
  const fakePointRef = useRef(null)

  const computeLineHeight = () => {
    if (codeRef && codeRef.current) {
      //      const nlines = handleGetDisassembly().split('\n').length
      //    setlineHeight = (disassemblyRef.current.clientHeight - 4) / nlines
      const div = codeRef.current as HTMLDivElement
      const n = div.innerText.split('\n').length - 1
      if (n === 0) return
      setLineHeight((div.scrollHeight - 4) / n)
    }
  }

  const handleCodeScroll = () => {
    if (!enableScrollEvent) {
      setEnableScrollEvent(true)
      return
    }
    if (codeRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const div = codeRef.current as HTMLDivElement
      const topLineIndex = Math.round(div.scrollTop / lineHeight)
      const dv = div.innerText.split('\n')
      const line = dv[topLineIndex]
      const newAddr = parseInt(line.slice(0, line.indexOf(':')), 16)
      if (newAddr === newScrollAddress) return
      setNewScrollAddress(newAddr)
      if (breakpointRef.current) {
        (breakpointRef.current as HTMLDivElement).style.display = 'none'
      }
      window.setTimeout(() => {
        passSetDisassembleAddress(newAddr)
      }, 50)
    }
  }

  const handleCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()  // suppress normal scroll events
      const currentAddr = getAddressAtTop()
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
      const currentAddr = getAddressAtTop()
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

  const getAddressAtTop = () => {
    const disassembly = handleGetDisassembly()
    return parseInt(disassembly.slice(0, disassembly.indexOf(':')), 16)
  }

  const handleCodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (codeRef && codeRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const divRect = (codeRef.current as HTMLDivElement).getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / lineHeight)
        if (line < 0 || line >= nlines) return
        const code = handleGetDisassembly().split('\n')[line]
        const addr = parseInt(code.slice(0, code.indexOf(':')), 16)
        const bp: Breakpoint = new Breakpoint()
        bp.address = addr
        const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints);
        breakpoints.set(addr, bp)
        props.setBreakpoints(breakpoints)
      }
    }
  }

  const handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const breakpoints: BreakpointMap = new BreakpointMap(props.breakpoints)
    const bp = breakpoints.get(addr)
    if (bp) {
      if (bp.disabled) {
        bp.disabled = false
      } else {
        breakpoints.delete(addr)
      }
      props.setBreakpoints(breakpoints)
    }
    if (fakePointRef.current) {
      (fakePointRef.current as HTMLDivElement).style.display = 'none'
    }
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (codeRef.current && fakePointRef.current) {
      const div = codeRef.current as HTMLDivElement
      const fakePoint = fakePointRef.current as HTMLDivElement
      if (lineHeight === 0) computeLineHeight()
      const divRect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX >= 1 && clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / lineHeight)
        if (line >= 0 && line < nlines) {
          div.style.cursor = 'pointer'
          fakePoint.style.display = 'initial'
          fakePoint.style.top = `${bpOffset + line * lineHeight}px`
          return
        }
      }
      div.style.cursor = 'text'
      fakePoint.style.display = 'none'
    }
  }

  const handleCodeMouseLeave = () => {
    if (fakePointRef.current) {
      const fakePoint = fakePointRef.current as HTMLDivElement
      fakePoint.style.display = 'none'
    }
  }

  // const getAddressAtBottom = () => {
  //   const disArray = handleGetDisassembly().split('\n')
  //   const last = disArray[disArray.length - 2]
  //   return parseInt(last.slice(0, last.indexOf(':')), 16)
  // }

  const constructDisassembly = () => {
    const disassembly = handleGetDisassembly()
    if (disassembly.length <= 1) {
      return ''
    }
    const addrTop = getAddressAtTop()
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
      if (codeRef.current) {
        const div = codeRef.current as HTMLDivElement
        setEnableScrollEvent(false)
        if (lineHeight === 0) computeLineHeight()
        div.scrollTop = scrollPos * lineHeight + 2
        // For some reason the breakpoint icons are not visible unless we re-set the display style.
        if (breakpointRef.current) {
          (breakpointRef.current as HTMLDivElement).style.display = 'block'
        }
      }
    }, 100)
    return disassemblyValue
  }

  const getBreakpointDiv = () => {
    if (handleGetDisassembly().length <= 1) return <></>
    const pc = getLineOfDisassembly(handleGetState6502().PC) * lineHeight
    const programCounterBar = (pc >= 0) &&
      <div className="programCounter" style={{ top: `${pc}px` }}></div>
    return <div ref={breakpointRef}
      style={{
        position: "relative",
        width: '0px',
        height: `${nlines * 10 - 2}pt`,
      }}>
      <FontAwesomeIcon icon={iconBreakpoint} ref={fakePointRef}
        className="breakpoint-style breakpoint-position fakePoint"
        style={{ pointerEvents: 'none', display: 'none' }} />
      {Array.from(props.breakpoints).map(([key, breakpoint]) => (
        (getLineOfDisassembly(key) >= 0) ?
          <FontAwesomeIcon icon={getBreakpointIcon(breakpoint)}
            className={'breakpoint-position ' + getBreakpointStyle(breakpoint)}
            key={key} data-key={key}
            onClick={handleBreakpointClick}
            style={{
              top: `${bpOffset + getLineOfDisassembly(key) * lineHeight}px`,
            }} /> :
          <span key={key}></span>
      )
      )}
      {programCounterBar}
    </div>
  }

  // Need to set tabIndex={-1} on the div to get onKeyDown to work.
  // Could change to tabIndex={0} to make the div part of the tab order.
  return (
    <div className="flex-row thinBorder">
      {getBreakpointDiv()}
      <div className="debug-panel"
        ref={codeRef}
        onScroll={handleCodeScroll}
        onKeyDown={handleCodeKeyDown}
        onMouseMove={handleCodeMouseMove}
        onMouseLeave={handleCodeMouseLeave}
        onClick={handleCodeClick}
        tabIndex={-1}
        style={{
          width: '200px',
          height: `${nlines * 10 - 2}pt`,
          overflow: 'auto',
          paddingLeft: "15pt",
          outline: "none",
          marginTop: "0pt",
        }} >
        {constructDisassembly()}
      </div>
    </div>
  )
}

export default DisassemblyView