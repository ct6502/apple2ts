import React, { KeyboardEvent, useRef } from "react"
import {
  handleGetAddressGetTable,
  handleGetBreakpoints,
  handleGetMachineName,
  handleGetMemoryDump,
  handleGetRunMode,
  handleGetState6502,
  passBreakpoints,
  passSetDisassembleAddress
} from "../main2worker"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getSymbolTables, RUN_MODE, toHex } from "../../common/utility"
import {
  faCircle as iconBreakpoint,
} from "@fortawesome/free-solid-svg-icons"
import { useGlobalContext } from "../globalcontext"
import { Breakpoint, BreakpointMap, getBreakpointIcon, getBreakpointStyle } from "../../common/breakpoint"
import { getDisassembly } from "./debugpanelutilities"

const nlines = 40
let currentScrollAddress = -1
let skipCodeScroll = false

const DisassemblyView = (props: {refresh: () => void}) => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null)
  const scrollToRef = useRef<HTMLDivElement>(null)
  const disassemblyRef = useRef<HTMLDivElement>(null)
  // We cannot assign an actual type to this ref since it is both an
  // HTMLDivElement and an SVGSVGElement
  const fakePointRef = useRef(null)

  const symbolTable = getSymbolTables(handleGetMachineName())

  const handleCodeScroll = () => {
    // Delay setting the new disassembly address to compress scroll events,
    // since they can come in fast.
    // 50 ms seems to be the sweet spot - any longer and the update delay is annoying.
    // Any shorter and it doesn't always settle down on the "correct" scroll position.
    // Clear the previous timeout
    if (skipCodeScroll) {
      skipCodeScroll = false
      return
    }
    if (timeoutIdRef.current !== null) {
      clearTimeout(timeoutIdRef.current)
    }
    timeoutIdRef.current = setTimeout(() => {
      if (disassemblyRef.current) {
        const div = disassemblyRef.current
        const rect = div.getBoundingClientRect()
        // Find the line div at the top of our disassembly view
        let newAddress = -1
        const bottomElement = document.elementFromPoint(rect.left + 30, rect.bottom - 5) as HTMLDivElement
        if (bottomElement && bottomElement.textContent) {
          const tmp = parseInt(bottomElement.textContent.slice(0, 4), 16)
          if (tmp === 65535) newAddress = 65535
        }
        if (newAddress < 0) {
          const topElement = document.elementFromPoint(rect.left + 30, rect.top + 5) as HTMLDivElement
          if (topElement && topElement.textContent) {
            newAddress = parseInt(topElement.textContent.slice(0, 4), 16)
          }
        }
        // Are we already there?
        if (newAddress === currentScrollAddress) {
          return
        }
        currentScrollAddress = newAddress
        passSetDisassembleAddress(newAddress)
        props.refresh()
      }
    }, 50)
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
        skipCodeScroll = true
        passSetDisassembleAddress(newAddress)
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
    const bp = new Breakpoint()
    bp.address = addr
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    breakpoints.set(addr, bp)
    passBreakpoints(breakpoints)
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
      passBreakpoints(breakpoints)
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

  const borderStyle = (opcode: string) => {
    if ((["JMP", "RTS"]).includes(opcode)) return "disassembly-separator"
    return ""
  }

  const getShiftedMemoryValue = (addr: number) => {
    if (addr >= 0) {
      const memory = handleGetMemoryDump()
      if (memory.length > 1) {
        const addressGetTable = handleGetAddressGetTable()
        const page = addr >>> 8
        const shifted = addressGetTable[page]
        addr = shifted + (addr & 255)
        if (addr < memory.length) {
          return memory[addr]
        }
      }
    }
    return -1
  }

  const getOperandTooltip = (operand: string, addr: number) => {
    let title = ""
    if (operand.includes(",X)")) {
      const xreg = handleGetState6502().XReg
      // pre-indexing: add X to the address before finding the actual address
      const preIndex = addr + xreg
      const addrInd = getShiftedMemoryValue(preIndex) + 256 * getShiftedMemoryValue(preIndex + 1)
      const value = getShiftedMemoryValue(addrInd)
      title = `($${toHex(addr)} + $${toHex(xreg)} = $${toHex(preIndex)}) => address = $${toHex(addrInd)}  value = $${toHex(value)}`
    } else if (operand.includes("),Y")) {
      const yreg = handleGetState6502().YReg
      // post-indexing: find the address from memory and then add Y
      const addrInd = getShiftedMemoryValue(addr) + 256 * getShiftedMemoryValue(addr + 1)
      const addrNew = addrInd + yreg
      const value = getShiftedMemoryValue(addrNew)
      title = `address $${toHex(addrInd)} + $${toHex(yreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
    } else if (operand.includes(",X")) {
      const xreg = handleGetState6502().XReg
      const addrNew = addr + xreg
      const value = getShiftedMemoryValue(addrNew)
      title = `address $${toHex(addr)} + $${toHex(xreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
    } else if (operand.includes(",Y")) {
      const yreg = handleGetState6502().YReg
      const addrNew = addr + yreg
      const value = getShiftedMemoryValue(addrNew)
      title = `address $${toHex(addr)} + $${toHex(yreg)} = $${toHex(addrNew)}  value = $${toHex(value)}`
    } else if (operand.includes(")")) {
      const addrInd = getShiftedMemoryValue(addr) + 256 * getShiftedMemoryValue(addr + 1)
      const value = getShiftedMemoryValue(addrInd)
      title = `address = $${toHex(addrInd)}  value = $${toHex(value)}`
    } else if (operand.includes("$")) {
      const value = getShiftedMemoryValue(addr)
      title = `value = $${toHex(value)}`
    }
    return title
  }

  const getJumpLink = (operand: string) => {
    const ops = operand.split(/(\$[0-9A-Fa-f]{4})/)
    let addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
    if (ops.length === 3 && addr >= 0) {
      if (ops[2].includes(")")) {
        const memory = handleGetMemoryDump()
        if (memory.length > 1) {
          // pre-indexing: add X to the address before finding the JMP address
          if (ops[2].includes(",X")) addr += handleGetState6502().XReg
          addr = memory[addr] + 256 * memory[addr + 1]
        }
      }
      if (symbolTable.has(addr)) {
        ops[1] = symbolTable.get(addr) || ops[1]
      }
      return <span>{ops[0]}
        <span className="disassembly-link"
          title={`$${toHex(addr)}`}
          onClick={() => {
            skipCodeScroll = true
            passSetDisassembleAddress(addr)
            props.refresh()
          }}>{ops[1]}</span>
        <span>{ops[2]}</span></span>
    }
    return null
  }

  const getOperand = (opcode: string, operand: string) => {
    if (["BPL", "BMI", "BVC", "BVS", "BCC",
      "BCS", "BNE", "BEQ", "JSR", "JMP"].includes(opcode)) {
      const result = getJumpLink(operand)
      if (result) return result
    }
    let className = ""
    let title = ""
    if (operand.startsWith("#$")) {
      const value = parseInt(operand.slice(2), 16)
      title += value.toString() + " = " + (value | 256).toString(2).slice(1)
      className = "disassembly-immediate"
    } else {
      const ops = operand.split(/(\$[0-9A-Fa-f]{2,4})/)
      const addr = (ops.length > 1) ? parseInt(ops[1].slice(1), 16) : -1
      if (addr >= 0) {
        className = "disassembly-address"
        title += getOperandTooltip(operand, addr)
        if (symbolTable.has(addr)) {
          operand = ops[0] + (symbolTable.get(addr) || operand) + (ops[2] || "")
        }
      }
    }
    return <span title={title} className={className}>{(operand + "         ").slice(0, 9)}</span>
  }

  const getChromacodedLine = (line: string) => {
    const opcode = line.slice(16, 19)
    const addr = parseInt(line.slice(0, 4), 16)
    const symbol = symbolTable.get(addr) || ""
    let hexcodes = line.slice(0, 16) + "       "
    hexcodes = hexcodes.substring(0, 23 - symbol.length) + symbol + " "
    return <span className={borderStyle(opcode)}>{hexcodes}
      <span className="disassembly-opcode">{opcode} </span>
      {getOperand(opcode, line.slice(20))}</span>
  }

  const getDisassemblyDiv = () => {
    if (handleGetRunMode() !== RUN_MODE.PAUSED) {
      return <div className="noselect" style={{ marginTop: "30px" }}>Pause to view disassembly</div>
    }
    const disArray = getDisassembly().split("\n").slice(0, nlines)
    if (disArray.length <= 1) return <div
      style={{
        position: "relative",
        width: "200px",
        top: "0px",
        height: `${nlines * 10 - 2}pt`,
      }}>
    </div>
    if (scrollTimeout.current !== null) {
      clearTimeout(scrollTimeout.current)
    }
    scrollTimeout.current = setTimeout(() => {
      if (disassemblyRef.current) {
        if (scrollToRef.current) {
          const line = scrollToRef.current
          line.scrollIntoView()
        }
      }
    }, 10)
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
    const lineBottom = getAddress(disArray[nlines - 1])
    const topHalf = Array.from({ length: Math.floor(lineTop / 10) }, (_, i) => (i * 10))
    for (let i = topHalf[topHalf.length - 1] + 1; i < lineTop; i++) {
      topHalf.push(i)
    }
    const bottomHalf = Array.from({ length: Math.floor((65535 - lineBottom) / 10) + 1 },
      (_, i) => Math.min((i * 10) + lineBottom + 1, 65535))
    for (let i = bottomHalf[bottomHalf.length - 1] + 1; i <= 65535; i++) {
      bottomHalf.push(i)
    }
    // Create an array of 10 blank lines
    // const blankLines = Array.from({ length: 10 }, (_, i) => (
    //   <div key={`blank-${i}`}>&nbsp;</div>))

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
          {getChromacodedLine(line)}
        </div>
      ))}
      {bottomHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
      {/* {blankLines} */}
      <FontAwesomeIcon icon={iconBreakpoint} ref={fakePointRef}
        className="breakpoint-style fake-point"
        style={{ pointerEvents: "none", display: "none" }} />
    </div>
  }

  return (
    <div className="flex-row thin-border" id="tour-debug-disassembly"
      style={{ position: "relative" }}>
      <div ref={disassemblyRef}
        className="mono-text"
        style={{
          overflow: "auto",
          width: "220px",
          top: "0px",
          height: `${nlines * 10 - 2}pt`,
          paddingLeft: "15pt",
          paddingRight: "11pt",
        }}
        tabIndex={0} // Makes the div focusable for keydown events
        onScroll={handleCodeScroll}
        onKeyDown={handleCodeKeyDown}
        onMouseMove={handleCodeMouseMove}
        onMouseLeave={handleCodeMouseLeave}
        onClick={handleCodeClick}>
        {getDisassemblyDiv()}
      </div>
    </div>
  )
}

export default DisassemblyView