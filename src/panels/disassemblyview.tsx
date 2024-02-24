import React, { KeyboardEvent, useRef } from "react";
import {
  handleGetDisassembly,
  handleGetRunMode,
  handleGetState6502,
  passSetDisassembleAddress
} from "../main2worker";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { RUN_MODE, toHex } from "../emulator/utility/utility";
import {
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons";
import { Breakpoint, BreakpointMap, getBreakpointIcon, getBreakpointStyle } from "./breakpoint";

const nlines = 40
const bpOffset = 0

type DisassemblyViewProps = {
  breakpoints: BreakpointMap;
  setBreakpoints: (breakpoints: BreakpointMap) => void;
}

const DisassemblyView = (props: DisassemblyViewProps) => {
  const [lineHeight, setLineHeight] = React.useState(0)
  const [newScrollAddress, setNewScrollAddress] = React.useState(0)
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const scrollableRef = useRef(null)
  const disassemblyRef = useRef(null)
  const fakePointRef = useRef(null)

  const computeLineHeight = () => {
    if (scrollableRef && scrollableRef.current) {
      const div = scrollableRef.current as HTMLDivElement
      const n = (div.textContent || '').split('\n').length - 1
      if (n === 0) return
      setLineHeight((div.scrollHeight - 4) / n)
    }
  }

  const handleCodeScroll = () => {
    // Clear the previous timeout
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current);
    }
    timeoutIdRef.current = setTimeout(() => {
      computeLineHeight()
      if (lineHeight === 0) return
      if (!scrollableRef.current) return
      // const newAddr = findTopChild()
      // if (newAddr < 0) return
      const div = scrollableRef.current as HTMLDivElement
      const topLineIndex = Math.round(div.scrollTop / lineHeight)
      const dv = (div.textContent || '').split('\n')
      const line = dv[topLineIndex]
      const newAddr = parseInt(line.slice(0, line.indexOf(':')), 16)
      if (newAddr === newScrollAddress) return
      setNewScrollAddress(newAddr)
      passSetDisassembleAddress(newAddr)
    }, 50); // 200 ms delay
  }

  const handleCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()  // suppress normal scroll events
      const currentAddr = getAddressAtTop()
      let newAddress = currentAddr + ((e.key === 'ArrowDown') ? 1 : -1)
      if (e.metaKey) {
        newAddress = (e.key === 'ArrowDown') ? 0xFFFF : 0
      } else if (e.ctrlKey) {
        // Down array: Jump down to start of next page
        // Up arrow: Jump back to start of page (or previous page if at $XX00)
        newAddress = (e.key === 'ArrowDown') ? ((currentAddr >> 8) + 1) << 8 :
          ((currentAddr - 1) >> 8) << 8
      }
      newAddress = Math.max(Math.min(newAddress, 0xFFFF), 0)
      if (newAddress !== currentAddr) {
        passSetDisassembleAddress(newAddress)
      }
    }
  }

  const getAddressAtTop = () => {
    const disassembly = handleGetDisassembly()
    return parseInt(disassembly.slice(0, disassembly.indexOf(':')), 16)
  }

  const handleCodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disassemblyRef.current) return
    computeLineHeight()
    const divRect = (disassemblyRef.current as HTMLDivElement).getBoundingClientRect()
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

  const handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation()
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
    if (disassemblyRef.current && fakePointRef.current) {
      const div = disassemblyRef.current as HTMLDivElement
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

  const getScrollableContents = () => {
    let result = '' //'\n\n\nPause to view disassembly'
    if (handleGetRunMode() === RUN_MODE.PAUSED) {
      for (let i = 0; i <= 65535; i++) result += `${toHex(i, 4)}:\n`
    }
    return result
  }

  const getAddress = (line: string) => {
    return parseInt(line.slice(0, line.indexOf(':')), 16)
  }

  // const fWeight = (opcode: string) => {
  //   if ((["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ", "JSR", "JMP", "RTS"]).includes(opcode)) return "bold"
  //   return ""
  // }

  const borderStyle = (opcode: string) => {
    if ((["JMP", "RTS"]).includes(opcode)) return "disassembly-separator"
    //    if ((["JSR"]).includes(opcode)) return "dashed 1px #444444"
    return ""
  }

  const getOperand = (operand: string) => {
    const ops = operand.split(/(\$[0-9A-Fa-f]{4})/)
    return (ops.length === 3) ? <span>{ops[0]}
      <span style={{ color: "#3d5aff", cursor: "pointer" }}
        onClick={() => {
          passSetDisassembleAddress(parseInt(ops[1].slice(1), 16))
        }}>{ops[1]}</span>
      {ops[2]}</span> : <span>{ops[0]}     </span>
  }

  const getChromacodedLine = (line: string) => {
    const hexcodes = line.slice(0, 16)
    const opcode = line.slice(16, 19)
    return <span className={borderStyle(opcode)}>{hexcodes}
      <span className="disassembly-opcode">{opcode}</span>
      {getOperand(line.slice(19))}</span>
  }

  const getDisassemblyDiv = () => {
    const disArray = handleGetDisassembly().split('\n')
    if (disArray.length <= 1) return <div
      style={{
        position: "relative",
        width: '200px',
        top: "0px",
        height: `${nlines * 10 - 2}pt`,
      }}>
    </div>
    const scrollPos = getAddress(disArray[0])
    window.setTimeout(() => {
      if (scrollableRef.current) {
        const div = scrollableRef.current as HTMLDivElement
        computeLineHeight()
        div.scrollTop = scrollPos * lineHeight + 2
      }
    }, 0)
    // Put the breakpoints into an easier to digest array format.
    const bp: Array<Breakpoint> = []
    for (let i = 0; i < nlines; i++) {
      const bp1 = props.breakpoints.get(getAddress(disArray[i]))
      if (bp1) {
        bp[i] = bp1
      }
    }
    const pc1 = handleGetState6502().PC
    return <div ref={disassemblyRef}
      className="mono-text"
      style={{
        position: "relative",
        width: '200px',
        top: "0px",
        height: `${nlines * 10 - 2}pt`,
        paddingLeft: "15pt",
      }}
      tabIndex={0} // Makes the div focusable for keydown events
      onKeyDown={handleCodeKeyDown}
      onMouseMove={handleCodeMouseMove}
      onMouseLeave={handleCodeMouseLeave}
      onClick={handleCodeClick}
    >
      <FontAwesomeIcon icon={iconBreakpoint} ref={fakePointRef}
        className="breakpoint-style breakpoint-position fake-point"
        style={{ pointerEvents: 'none', display: 'none' }} />
      {disArray.map((line, index) => (
        <div key={index} className={getAddress(line) === pc1 ? "program-counter" : ""}>
          {(bp[index] &&
            <FontAwesomeIcon icon={getBreakpointIcon(bp[index])}
              className={'breakpoint-position ' + getBreakpointStyle(bp[index])}
              data-key={bp[index].address}
              onClick={handleBreakpointClick} />)}
          {getChromacodedLine(line)}
        </div>
      ))}
    </div>
  }

  return (
    <div className="flex-row thinBorder">
      {getDisassemblyDiv()}
      <div className="debug-panel"
        ref={scrollableRef}
        onScroll={handleCodeScroll}
        style={{
          width: '15px',
          height: `${nlines * 10 - 2}pt`,
          overflow: 'auto',
          paddingLeft: "0pt",
          marginTop: "0pt",
        }} >
        {getScrollableContents()}
      </div>
    </div>
  )
}

export default DisassemblyView