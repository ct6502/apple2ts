import React, { KeyboardEvent, useRef } from "react"
import {
  handleGetBreakpoints,
} from "../../main2worker"
import { useGlobalContext } from "../../globalcontext"
import { BreakpointMap, BreakpointNew } from "../../../common/breakpoint"
import { getDisassembly, setDisassemblyAddress } from "./disassembly_utilities"
import { setPreferenceBreakpoints } from "../../localstorage"
import DisassemblyDiv from "./disassemblydiv"
import { faCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const nlines = 40
let currentScrollAddress = -1
let allowScrollEvent = false
let isMouseDown = false
//const lineNumbers: Array<number> = []

const DisassemblyView = (props: DisassemblyProps) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
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
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current)
    }
    timeoutIdRef.current = setTimeout(() => {
      allowScrollEvent = false
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

  // console.log(`Render ${props.update} ${handleGetState6502().PC.toString(16)}`)

  return (
    <div className="flex-row thin-border" id="tour-debug-disassembly"
      style={{ position: "relative" }}>
      <div ref={disassemblyRef}
        className="mono-text"
        style={{
          overflowY: "scroll",
          overflowX: "hidden",
          width: "100%",
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
        onTouchStart={() => {isMouseDown = true}}
        onTouchEnd={() => {isMouseDown = false; allowScrollEvent = true}}
        onMouseMove={handleCodeMouseMove}
        onMouseLeave={handleCodeMouseLeave}
        onClick={handleCodeClick}>
        <DisassemblyDiv
          hideFakePoint={() => {
            if (fakePointRef.current) {
              const fakePoint = fakePointRef.current as HTMLDivElement
              fakePoint.style.display = "none"
            }
          }}
          disassemblyRef={disassemblyRef}
          setAllowScrollEvent={(value: boolean) => {allowScrollEvent = value}}
          refresh={props.refresh} />
        <FontAwesomeIcon icon={faCircle} ref={fakePointRef}
          className="breakpoint-style fake-point"
          style={{ pointerEvents: "none", display: "none" }} />
      </div>
    </div>
  )
}

export default DisassemblyView