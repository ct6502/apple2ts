import { useRef, useState, KeyboardEvent } from "react";
import { handleGetDebugDump, handleGetDisassembly,
  handleGetS6502,
  passBreakpoints,
  passSetDisassembleAddress, passStepInto, passStepOut, passStepOver } from "./main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle as iconBreakpoint,
  faArrowRightToBracket as iconStepInto,
  faArrowsRotate as iconStepOver,
  faArrowUpFromBracket as iconStepOut,
} from "@fortawesome/free-solid-svg-icons";
import { toHex } from "./emulator/utility";

let lineHeight = 0 // 13.3333 // 10 * (96 / 72) pixels
let enableScrollEvent = true
const nlines = 40  // should this be an argument?
let timeout = 0
let newScrollAddress = 0

const DebugPanel = () => {
  const codeRef = useRef<HTMLDivElement>(null)
  const breakpointRef = useRef<HTMLDivElement>(null)
  const fakePointRef = useRef<SVGSVGElement>(null)
  const [breakpoints, setBreakpoints] = useState<Breakpoints>(new Map());
  const [address, setAddress] = useState('');
//  const [lineOffset, setLineOffset] = useState(0)

  const handleDisassembleAddrChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase());
  }

  const handleDisassembleAddrKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(address ? address : '0', 16)
      passSetDisassembleAddress(addr)
      setAddress(addr.toString(16).toUpperCase());
    }
  }

  const computeLineHeight = () => {
    if (codeRef && codeRef.current) {
//      const nlines = handleGetDisassembly().split('\n').length
  //    lineHeight = (disassemblyRef.current.clientHeight - 4) / nlines
      const n = codeRef.current.innerText.split('\n').length - 1
      if (n === 0) return
      lineHeight = (codeRef.current.scrollHeight - 4) / n
    }
  }

  const handleCodeScroll = () => {
    if (!enableScrollEvent) {
      enableScrollEvent = true
      return
    }
    if (codeRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const topLineIndex = Math.round(codeRef.current.scrollTop / lineHeight)
      const dv = codeRef.current.innerText.split('\n')
      const line = dv[topLineIndex]
      newScrollAddress = parseInt(line.slice(0, line.indexOf(':')), 16)
//      disassemblyRef.current.scrollTop = 1000
      if (timeout) clearTimeout(timeout)
      if (breakpointRef.current) breakpointRef.current.style.display = 'none'
      timeout = window.setTimeout(() => {
        console.log(`handleScroll ${codeRef.current ? codeRef.current.scrollTop : 0} newScrollAddress=${newScrollAddress.toString(16)}`)
        //          const bgColor = window.getComputedStyle(document.body).backgroundColor
//          if (disassemblyRef.current) disassemblyRef.current.style.color = bgColor
        timeout = 0
        passSetDisassembleAddress(newScrollAddress)
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
      const divRect = codeRef.current.getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / lineHeight)
        if (line < 0 || line >= nlines) return
        const addrStr = handleGetDisassembly().split('\n')[line]
        const addr = parseInt(addrStr.slice(0, addrStr.indexOf(':')), 16)
        const newBreakpoint: Breakpoint = {disabled: false}
        const newBreakpoints: Breakpoints = new Map(breakpoints);
        newBreakpoints.set(addr, newBreakpoint)
        setBreakpoints(newBreakpoints)
        passBreakpoints(newBreakpoints)
      }
    }
  }

  const handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    const addr = parseInt(event.currentTarget.getAttribute('data-key') || '-1')
    const newBreakpoints: Breakpoints = new Map(breakpoints);
    newBreakpoints.delete(addr)
    setBreakpoints(newBreakpoints)
    passBreakpoints(newBreakpoints)
    if (fakePointRef.current) fakePointRef.current.style.display = 'none'
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (codeRef.current && fakePointRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const divRect = event.currentTarget.getBoundingClientRect()
      const clickX = event.clientX - divRect.left
      if (clickX >= 1 && clickX <= 20) {
        const clickY = event.clientY - divRect.top - 2
        const line = Math.floor(clickY / lineHeight)
        if (line >= 0 && line < nlines) {
          codeRef.current.style.cursor = 'pointer'
          fakePointRef.current.style.display = 'initial'
          fakePointRef.current.style.top = `${6 + line * lineHeight}px`
          return
        }
      }
      codeRef.current.style.cursor = 'text'
      fakePointRef.current.style.display = 'none'
    }
  }

  const handleCodeMouseLeave = () => {
    if (fakePointRef.current) {
      fakePointRef.current.style.display = 'none'
    }
  }

  // const getAddressAtBottom = () => {
  //   const disArray = handleGetDisassembly().split('\n')
  //   const last = disArray[disArray.length - 2]
  //   return parseInt(last.slice(0, last.indexOf(':')), 16)
  // }

  const getLineOfDisassembly = (line: number) => {
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

    // const startIncrementOne = Math.max(addrTop - 256, 0)
    // let scrollPos = 0
    // const page = startIncrementOne >> 4
    // for (i = 0; i < page; i++) {
    //   disassemblyValue += `${toHex(i << 4, 4)}:\n`
    //   scrollPos++
    // }
    // for (i = startIncrementOne; i < addrTop; i++) {
    //   disassemblyValue += `${toHex(i, 4)}:\n`
    //   scrollPos++
    // }
    // disassemblyValue += disassembly
    // i = getAddressAtBottom() + 1
    // const endIncrementOne = Math.min(i + 255, 0xFFFF)
    // for (; i < endIncrementOne; i++) {
    //   disassemblyValue += `${toHex(i, 4)}:\n`
    // }
    // for (i = (endIncrementOne >> 4) + 1; i <= 0xFFF; i++) {
    //   disassemblyValue += `${toHex(i << 4, 4)}:\n`
    // }

    // We need to give React enough time to update the text contents
    // before the new scroll position is set. 100ms seems sufficient, 
    // 50ms causes jumping back to an intermediate scroll position.
    window.setTimeout(() => {
      if (codeRef.current) {
        enableScrollEvent = false
        if (lineHeight === 0) computeLineHeight()
        console.log(`constructDisassembly addrTop=${addrTop.toString(16)} currentScrollTop=${codeRef.current.scrollTop} new scrollTop=${scrollPos * lineHeight}`)
        codeRef.current.scrollTop = scrollPos * lineHeight + 2
        if (breakpointRef.current) breakpointRef.current.style.display = 'block'
      }
    }, 100)
    return disassemblyValue
  }

  const pc = 4 + getLineOfDisassembly(handleGetS6502().PC) * lineHeight
  const programCounterBar = (pc >= 0) ?
    <div className="programCounter" style={{top: `${pc}px`}}></div> : <></>

  return (
    <div className="controlBarNoWrap">
      <span>
        <span>
          <input className="address"
            type="text"
            placeholder=""
            value={address}
            onChange={handleDisassembleAddrChange}
            onKeyDown={handleDisassembleAddrKeyDown}
          />
          <button className="pushButton"
            title={"Step Into"}
            onClick={passStepInto}>
            <FontAwesomeIcon icon={iconStepInto} className="fa-rotate-90 icon"/>
          </button>
          <button className="pushButton"
            title={"Step Over"}
            onClick={passStepOver}>
            <span className="fa-stack small icon">
            <FontAwesomeIcon icon={iconStepOut} className="cropTop fa-stack-2x icon"/>
            <FontAwesomeIcon icon={iconStepOver} className="cropBottom fa-stack-2x icon"/>
            </span>
          </button>
          <button className="pushButton"
            title={"Step Out"}
            onClick={passStepOut}>
            <FontAwesomeIcon icon={iconStepOut} className="icon"/>
          </button>
        </span>
        <br/>
        <div className="controlBarNoWrap">
          <div ref={breakpointRef} 
              style={{
              position: "relative",
              width: '0px', // Set the width to your desired value
              height: `${nlines * 10 - 2}pt`, // Set the height to your desired value
            }}>
            <FontAwesomeIcon icon={iconBreakpoint} ref={fakePointRef}
              className="breakpointStyle fakePoint"/>
            {Array.from(breakpoints).map(([key, breakpoint]) => (
              (getLineOfDisassembly(key) >= 0) ?
                <FontAwesomeIcon icon={iconBreakpoint}
                  className={'breakpointStyle' + (breakpoint.disabled ? ' fakePoint' : '')}
                  key={key} data-key={key}
                  onClick={handleBreakpointClick}
                  style={{
                    top: `${6 + getLineOfDisassembly(key) * lineHeight}px`,
                    }}/> :
                <span key={key}></span>
              )
            )}
            {programCounterBar}
          </div>
          <div className="debugPanel"
            ref={codeRef}
            onScroll={handleCodeScroll}
            onKeyDown={handleCodeKeyDown}
            onMouseMove={handleCodeMouseMove}
            onMouseLeave={handleCodeMouseLeave}
            onClick={handleCodeClick}
            style={{
              width: '200px', // Set the width to your desired value
              height: `${nlines * 10 - 2}pt`, // Set the height to your desired value
              overflow: 'auto',
              paddingLeft: "15pt",
            }} >
            {constructDisassembly()}
          </div>
        </div>
      </span>
      <span>
        <div className="debugPanel"
          style={{
            width: '330px', // Set the width to your desired value
            height: `350pt`, // Set the height to your desired value
            overflow: 'auto',
            }}>
          {handleGetDebugDump()}
        </div>
      </span>
    </div>
  )
}

export default DebugPanel;
