import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BreakpointMap, getBreakpointIcon, getBreakpointStyle } from "../../../common/breakpoint"
import { RUN_MODE, DISASSEMBLE_VISIBLE, toHex } from "../../../common/utility"
import { getPreferenceDebugTabLeftWidth, setPreferenceBreakpoints } from "../../localstorage"
import { handleGetRunMode, handleGetState6502, handleGetBreakpoints } from "../../main2worker"
import { getDisassembly, getDisassemblyVisibleMode, getDisassemblyAddress, setDisassemblyAddress, setDisassemblyVisibleMode } from "./disassembly_utilities"
import { getChromacodedLine } from "./disassemblyview_singleline"
import React, { useEffect, useRef } from "react"
import { useGlobalContext } from "../../globalcontext"

const nlines = 40
let lastRepositionedAddress = -1

 
const DisassemblyDiv = (props: { 
  disassemblyRef: React.RefObject<HTMLDivElement | null>,
  hideFakePoint: () => void,
  setAllowScrollEvent: (value: boolean) => void,
  refresh: () => void}) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollToRef = useRef<HTMLDivElement>(null)

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
    props.hideFakePoint()
  }

  const isPaused = handleGetRunMode() === RUN_MODE.PAUSED

  // Calculate approximate width in characters
  // For 7pt monospace at line-height 10pt: char width ≈ 0.6 * height = 0.6 * 9.33px ≈ 5.6px
  const containerWidth = Math.max(getPreferenceDebugTabLeftWidth(), 260) - 36
  const width = Math.floor(containerWidth / 5.6)
  
  let disArray = getDisassembly().split("\n").slice(0, nlines)
  const hasDisassembly = disArray.length > 1
  const visibleMode = getDisassemblyVisibleMode()
  const currentAddress = getDisassemblyAddress()
  let foundLine = visibleMode === DISASSEMBLE_VISIBLE.RESET &&
                  lastRepositionedAddress === currentAddress
  if (isPaused && hasDisassembly && visibleMode !== DISASSEMBLE_VISIBLE.RESET) {
    const visibleLine = (visibleMode === DISASSEMBLE_VISIBLE.CURRENT_PC) ?
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
      if (getDisassemblyAddress() === -1) {
        setDisassemblyAddress(visibleLine)
      }
      setDisassemblyVisibleMode(DISASSEMBLE_VISIBLE.RESET)
    }
  }

  useEffect(() => {
    if (!isPaused) {
      lastRepositionedAddress = -1
    }

    if (!isPaused || !hasDisassembly || foundLine) {
      return
    }

    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (props.disassemblyRef?.current && scrollToRef.current) {
        const container = props.disassemblyRef.current
        const line = scrollToRef.current
        props.setAllowScrollEvent(false)
        container.scrollTop += line.getBoundingClientRect().top - container.getBoundingClientRect().top
        lastRepositionedAddress = getDisassemblyAddress()
      }
    }, 20)

    return () => {
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundLine, hasDisassembly, isPaused, props.disassemblyRef, props.setAllowScrollEvent])

  if (!isPaused) {
    return <div className="noselect" style={{ marginTop: "30px", width: "24em" }}>Pause to view disassembly</div>
  }

  if (!hasDisassembly) {
    return <div
    style={{
      position: "relative",
      width: "24em",
      top: "0px",
      height: `${nlines * 10 - 2}pt`,
    }}>
  </div>
  }

  // Put the breakpoints into an easier to digest array format.
  const bp: Array<Breakpoint> = []
  const breakpoints = handleGetBreakpoints()
  for (let i = 0; i < nlines; i++) {
    const bp1 = breakpoints.get(getAddress(disArray[i]))
    if (bp1 && !bp1.hidden) {
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

  return <div style={{ width: "24em" }}>
    {topHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
    {disArray.map((line, index) => (
      <div key={index}
        ref={index === 0 ? scrollToRef : null}
        style={{ position: "relative" }}
        className={getAddress(line) === pc1 ? "program-counter" : ""}>
        {(bp[index] && !bp[index].basic &&
          <FontAwesomeIcon icon={getBreakpointIcon(bp[index])}
            className={"breakpoint-position " + getBreakpointStyle(bp[index])}
            data-key={bp[index].address}
            onClick={handleBreakpointClick} />)}
        {getChromacodedLine(line, onJumpClick, width)}
      </div>
    ))}
    {bottomHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
  </div>
}

export default DisassemblyDiv

