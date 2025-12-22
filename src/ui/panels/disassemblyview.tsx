import React, { KeyboardEvent, useRef } from "react"
import {
  handleGetBreakpoints,
  handleGetRunMode,
  handleGetState6502,
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DISASSEMBLE_VISIBLE, RUN_MODE, toHex } from "../../common/utility"
import {
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons"
import { useGlobalContext } from "../globalcontext"
import { BreakpointMap, BreakpointNew, getBreakpointIcon, getBreakpointStyle } from "../../common/breakpoint"
import { getDisassembly, getDisassemblyAddress, getDisassemblyVisibleMode, setDisassemblyAddress, setDisassemblyVisibleMode } from "./disassembly_utilities"
import { getChromacodedLine } from "./disassemblyview_singleline"
import { setPreferenceBreakpoints } from "../localstorage"

const nlines = 40
let currentScrollAddress = -1
let allowScrollEvent = false
let isMouseDown = false
//const lineNumbers: Array<number> = []

const DisassemblyView = (props: DisassemblyProps) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const scrollToRef = useRef<HTMLDivElement>(null)
  const disassemblyRef = useRef<HTMLDivElement>(null)
  // We cannot assign an actual type to this ref since it is both an
  // HTMLDivElement and an SVGSVGElement
  const fakePointRef = useRef(null)

  const handleCodeScroll = () => {
    // Delay setting the new disassembly address to compress scroll events,
    // since they can come in fast.
    // 50 ms seems to be the sweet spot - any longer and the update delay is annoying.
    // Any shorter and it doesn't always settle down on the "correct" scroll position.
    // Clear the previous timeout
    if (!allowScrollEvent && !isMouseDown) {
      return
    }
    allowScrollEvent = false
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current)
    }
    timeoutIdRef.current = setTimeout(() => {
      if (disassemblyRef.current) {
        const div = disassemblyRef.current
        const rect = div.getBoundingClientRect()
        // Find the line div at the top of our disassembly view
        let newAddress = -1
        const topElement = document.elementFromPoint(rect.left + 30, rect.top + 5) as HTMLDivElement
        if (topElement && topElement.textContent) {
          newAddress = parseInt(topElement.textContent.slice(0, 4), 16)
        }
        // Are we already there?
        if (newAddress === currentScrollAddress || Number.isNaN(newAddress)) {
          return
        }
        // console.log("handleCodeScroll ", newAddress.toString(16))
        currentScrollAddress = newAddress
        setDisassemblyAddress(newAddress)
        props.refresh()
      }
    }, 50)
  }

  const handleEnableScroll = () => {
    allowScrollEvent = true
  }

  const handleCodeKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault()  // suppress normal scroll events
      const currentAddr = getAddressAtTop()
      let newAddress = currentAddr + ((e.key === "ArrowDown") ? 1 : -1)
      if (e.metaKey) {
        newAddress = (e.key === "ArrowDown") ? 0xFFFF : 0
      } else if (e.ctrlKey) {
        // Down array: Jump down to start of next page
        // Up arrow: Jump back to start of page (or previous page if at $XX00)
        newAddress = (e.key === "ArrowDown") ? ((currentAddr >> 8) + 1) << 8 :
          ((currentAddr - 1) >> 8) << 8
      }
      newAddress = Math.max(Math.min(newAddress, 0xFFFF), 0)
      if (newAddress !== currentAddr) {
        setDisassemblyAddress(newAddress)
        props.refresh()
      }
    }
  }

  const getAddressAtTop = () => {
    const disassembly = getDisassembly()
    return parseInt(disassembly.slice(0, disassembly.indexOf(":")), 16)
  }

  const getAddressAtMouse = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disassemblyRef.current) return [-1, -1]
    const div = disassemblyRef.current as HTMLDivElement
    const divRect = div.getBoundingClientRect()
    const clickedDiv = document.elementFromPoint(event.clientX + 30, event.clientY + 2) as HTMLDivElement
    if (clickedDiv && clickedDiv.textContent) {
      const myRect = clickedDiv.getBoundingClientRect()
      const mouseX = event.clientX - divRect.left
      if (mouseX <= 18) {
        const addr = parseInt(clickedDiv.textContent.slice(0, 4), 16)
        return [addr, (myRect.top + myRect.bottom) / 2 - divRect.top]
      }
    }
    return [-1, -1]
  }

  const handleCodeClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const [addr] = getAddressAtMouse(event)
    if (addr < 0 || isNaN(addr)) return
    const bp = BreakpointNew()
    bp.address = addr
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    breakpoints.set(addr, bp)
    setPreferenceBreakpoints(breakpoints)
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation()
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      if (bp.disabled) {
        bp.disabled = false
      } else {
        breakpoints.delete(addr)
      }
      setPreferenceBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
    if (fakePointRef.current) {
      (fakePointRef.current as HTMLDivElement).style.display = "none"
    }
  }

  const handleCodeMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!disassemblyRef.current || !fakePointRef.current) return -1
    const [addr, mouseY] = getAddressAtMouse(event)
    const div = disassemblyRef.current
    const fakePoint = fakePointRef.current as HTMLDivElement
    if (addr >= 0) {
      div.style.cursor = "pointer"
      fakePoint.style.display = "initial"
      fakePoint.style.top = `${mouseY - 5}px`
    } else {
      div.style.cursor = "text"
      fakePoint.style.display = "none"
    }
  }

  const handleCodeMouseLeave = () => {
    isMouseDown = false
    if (fakePointRef.current) {
      const fakePoint = fakePointRef.current as HTMLDivElement
      fakePoint.style.display = "none"
    }
  }

  const getAddress = (line: string) => {
    return parseInt(line.slice(0, line.indexOf(":")), 16)
  }

  // const fWeight = (opcode: string) => {
  //   if ((["BPL", "BMI", "BVC", "BVS", "BCC", "BCS", "BNE", "BEQ", "JSR", "JMP", "RTS"]).includes(opcode)) return "bold"
  //   return ""
  // }

  // This function gets used in disassemblyview_singleline but we
  // define it here so it can access our local variables.
  const onJumpClick = (addr: number) => {
    setDisassemblyAddress(addr)
    props.refresh()
  }

  const getDisassemblyDiv = () => {
    if (handleGetRunMode() !== RUN_MODE.PAUSED) {
      return <div className="noselect" style={{ marginTop: "30px" }}>Pause to view disassembly</div>
    }
    let disArray = getDisassembly().split("\n").slice(0, nlines)
    if (disArray.length <= 1) {
      return <div
      style={{
        position: "relative",
        width: "200px",
        top: "0px",
        height: `${nlines * 10 - 2}pt`,
      }}>
    </div>
    }
    let foundLine = false
    if (getDisassemblyVisibleMode() !== DISASSEMBLE_VISIBLE.RESET) {
      const visibleLine = (getDisassemblyVisibleMode() === DISASSEMBLE_VISIBLE.CURRENT_PC) ?
        handleGetState6502().PC : getDisassemblyAddress()
      // console.log("visibleLine", visibleLine.toString(16))
      for (let i = 0; i < disArray.length; i++) {
        if (getAddress(disArray[i]) === visibleLine) {
          foundLine = true
          break
        }
      }
      if (!foundLine) {
        setDisassemblyAddress(visibleLine)
        disArray = getDisassembly().split("\n").slice(0, nlines)
      } else {
        setDisassemblyVisibleMode(DISASSEMBLE_VISIBLE.RESET)
      }
    }

    if (!foundLine) {
      if (scrollTimeout.current !== null) {
        clearTimeout(scrollTimeout.current)
      }
        scrollTimeout.current = setTimeout(() => {
        if (disassemblyRef.current) {
          if (scrollToRef.current) {
            const line = scrollToRef.current
            allowScrollEvent = false
            line.scrollIntoView()
          }
        }
      }, 20)
    }
    // Put the breakpoints into an easier to digest array format.
    const bp: Array<Breakpoint> = []
    const breakpoints = handleGetBreakpoints()
    for (let i = 0; i < nlines; i++) {
      const bp1 = breakpoints.get(getAddress(disArray[i]))
      if (bp1) {
        bp[i] = bp1
      }
    }
    const pc1 = handleGetState6502().PC
    const lineTop = getAddress(disArray[0])
    const lineBottom = (disArray[nlines - 1] !== "") ? getAddress(disArray[nlines - 1]) : 65535
    const topHalf = Array.from({ length: Math.floor(lineTop / 16) }, (_, i) => (i * 16))
    for (let i = topHalf[topHalf.length - 1] + 1; i < lineTop; i++) {
      topHalf.push(i)
    }
    // Construct an evenly-spaced array for the bottom but stop well before 65535.
    // Then fill in all the remaining values up to 65535. This provides a smooth
    // scrolling experience and allows you to drag the scrollbar all the way to the bottom.
    const length = Math.max(Math.floor((65535 - lineBottom) / 16) - 2, 0)
    const bottomHalf = Array.from({ length: length },
      (_, i) => Math.min((i * 16) + lineBottom + 1, 65535))
    const istart = (bottomHalf.length > 0) ? (bottomHalf[bottomHalf.length - 1] + 1) : (lineBottom + 1)
    for (let i = istart; i <= 65535; i++) {
      bottomHalf.push(i)
    }

    // console.log("getDisassemblyDiv ", props.update, disArray[0])

    return <div>
      {topHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
      {disArray.map((line, index) => (
        <div key={index}
          ref={index === 0 ? scrollToRef : null}
          style={{ position: "relative" }}
          className={getAddress(line) === pc1 ? "program-counter" : ""}>
          {(bp[index] &&
            <FontAwesomeIcon icon={getBreakpointIcon(bp[index])}
              className={"breakpoint-position " + getBreakpointStyle(bp[index])}
              data-key={bp[index].address}
              onClick={handleBreakpointClick} />)}
          {getChromacodedLine(line, onJumpClick)}
        </div>
      ))}
      {bottomHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
      <FontAwesomeIcon icon={iconBreakpoint} ref={fakePointRef}
        className="breakpoint-style fake-point"
        style={{ pointerEvents: "none", display: "none" }} />
    </div>
  }

  // console.log(`Render ${props.update} ${handleGetState6502().PC.toString(16)}`)

  return (
    <div className="flex-row thin-border" id="tour-debug-disassembly"
      style={{ position: "relative" }}>
      <div ref={disassemblyRef}
        className="mono-text"
        style={{
          overflow: "auto",
          width: "228px",
          top: "0px",
          height: `${nlines * 10 - 2}pt`,
          paddingLeft: "15pt",
          paddingRight: "10px",
          marginRight: "0px",
        }}
        tabIndex={0} // Makes the div focusable for keydown events
        onScroll={handleCodeScroll}
        onKeyDown={handleCodeKeyDown}
        onWheel={handleEnableScroll}
        onMouseDown={() => {isMouseDown = true}}
        onMouseUp={() => {isMouseDown = false}}
        onMouseMove={handleCodeMouseMove}
        onMouseLeave={handleCodeMouseLeave}
        onClick={handleCodeClick}>
        {getDisassemblyDiv()}
      </div>
    </div>
  )
}

export default DisassemblyView