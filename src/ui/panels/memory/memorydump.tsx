import { useRef, useState } from "react"
import { RamWorksMemoryStart, RUN_MODE, hiresAddressToLine, ROMmemoryStart } from "../../../common/utility"
import { handleGetAddressGetTable, handleGetBreakpoints, handleGetMemoryDump, handleGetRunMode, passSetMemory } from "../../main2worker"
import React from "react"
import { Droplist } from "../droplist"
import { overrideHires } from "../../graphics"
import MemoryTable from "./memorytable"
import {
  faCrosshairs, faSave,
  faA,
  faArrowUp, faArrowDown
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useGlobalContext } from "../../globalcontext"
import { BreakpointMap, BreakpointNew } from "../../../common/breakpoint"
import { setPreferenceBreakpoints } from "../../localstorage"

enum MEMORY_RANGE {
  CURRENT = "Current memory",
  MAIN = "Main RAM",
  AUX = "Auxiliary RAM",
  HGR1 = "HGR page 1 (screen order)",
  HGR2 = "HGR page 2 (screen order)",
}

const MemoryDump = () => {
  const { updateBreakpoint, setUpdateBreakpoint } = useGlobalContext()
  const memoryDumpRef = useRef(null)
  const [address, setAddress] = useState("")
  const [memoryRange, setMemoryRange] = useState(`${MEMORY_RANGE.CURRENT}`)
  const [scrollRow, setScrollRow] = useState(-1)
  const [pickWatchpoint, setPickWatchpoint] = useState(false)
  const [ascii, setAscii] = useState("")
  const [hexsearch, setHexsearch] = useState("")
  const [matches, setMatches] = useState(new Array(0))
  const [highlight, setHighlight] = useState(new Array(0))
  const [matchIndex, setMatchIndex] = useState(0)
  const [highAscii, setHighAscii] = useState(false)

  const doSetScrollRow = (row: number) => {
    setScrollRow(row)
    // Turn off our new scroll position after a brief moment. Otherwise the
    // memorytable will just keep returning to the same scroll position.
    setTimeout(() => { setScrollRow(-1) }, 100)
  }

  const getMemoryRange = () => {
    const memory = handleGetMemoryDump()
    if (memory.length < 1) return new Uint8Array()
    switch (memoryRange) {
      case MEMORY_RANGE.CURRENT:
        {
          const addressGetTable = handleGetAddressGetTable()
          const lookup = addressGetTable.slice(0, 256)
          const result = memory.slice(0, 0x10000)
          for (let i = 0; i < lookup.length; i++) {
            if (lookup[i] !== (i * 256)) {
              result.set(memory.slice(lookup[i], lookup[i] + 256), i * 256)
            }
          }
          // Retrieve $C0xx soft switch values
          result.set(memory.slice(ROMmemoryStart, ROMmemoryStart + 0x100), 0xC000)
          return result
        }
      case MEMORY_RANGE.AUX:
        return memory.slice(RamWorksMemoryStart, RamWorksMemoryStart + 0x10000)
      case MEMORY_RANGE.HGR1:
        return memory.slice(0x2000, 0x4000)
      case MEMORY_RANGE.HGR2:
        return memory.slice(0x4000, 0x6000)
      default:  // MAIN
        return memory.slice(0, 0x10000)
    }

  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const addrToRow = (addr: number) => {
    if (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2) {
      return hiresAddressToLine(addr)
    }
    return Math.floor(addr / 16)
  }

  // const rowToAddress = (row: number) => {
  //   if (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2) {
  //     return hiresLineToAddress(0, row)
  //   }
  //   return Math.floor(row * 16)
  // }

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const addr = parseInt(address || "0", 16)
      setAddress(addr.toString(16).toUpperCase())
      const scrollRow = addrToRow(addr)
      doSetScrollRow(scrollRow)
    }
  }

  const handleSearchAscii = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAscii(e.target.value)
    const len = e.target.value.length
    if (len < 1) {
      setMatches(new Array(0))
      setHighlight(new Array(0))
      setMatchIndex(0)
      return
    }
    // Erase our Hex search box
    setHexsearch("")
    let pos = 0
    const newmatches = new Array(0)
    const newhighlight = new Array(0)
    while (pos < memAscii.length) {
      const addr = memAscii.indexOf(e.target.value, pos)
      if (addr < 0) break
      newmatches.push(addr)
      for (let i = 0; i < len; i++) {
        newhighlight.push(addr + i)
      }
      pos = addr + len
    }
    setMatchIndex(0)
    setMatches(newmatches)
    setHighlight(newhighlight)
    if (newmatches.length > 0) {
      doSetScrollRow(addrToRow(newmatches[0]))
    }
  }

  const findMatchInArray = (array: Uint8Array, values: Uint8Array, start: number) => {
    while (start < array.length) {
      const match = array.indexOf(values[0], start)
      if (match < 0) break
      let pos = match + 1
      let foundMatch = true
      for (let i = 1; i < values.length; i++) {
        if (values[i] !== array[pos++]) {
          foundMatch = false
          break
        }
      }
      if (foundMatch) return match
      start = pos
    }
    return -1
  }

  const handleSearchHex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase()
    setHexsearch(newvalue)
    if (newvalue.length < 1) {
      setMatches(new Array(0))
      setHighlight(new Array(0))
      setMatchIndex(0)
      return
    }
    // Convert our string 'FF1234' to an array of bytes [0xFF, 0x12, 0x34]
    const len = Math.floor((newvalue.length + 1) / 2)
    const values = new Uint8Array(len)
    for (let i = 0; i < values.length; i++) {
      const offset = i * 2
      values[i] = parseInt(newvalue.slice(offset, offset + 2), 16)
    }
    // Erase our ASCII search box
    setAscii("")
    let pos = 0
    const newmatches = new Array(0)
    const newhighlight = new Array(0)
    while (pos < memory.length) {
      const addr = findMatchInArray(memory, values, pos)
      if (addr < 0) break
      newmatches.push(addr)
      for (let i = 0; i < len; i++) {
        newhighlight.push(addr + i)
      }
      pos = addr + len
    }
    setMatchIndex(0)
    setMatches(newmatches)
    setHighlight(newhighlight)
    if (newmatches.length > 0) {
      doSetScrollRow(addrToRow(newmatches[0]))
    }
  }

  const nextMatch = () => {
    if (matches.length < 1) return
    const newmatchIndex = (matchIndex + 1) % matches.length
    setMatchIndex(newmatchIndex)
    doSetScrollRow(addrToRow(matches[newmatchIndex]))
  }

  const previousMatch = () => {
    if (matches.length < 1) return
    const newmatchIndex = (matchIndex + matches.length - 1) % matches.length
    setMatchIndex(newmatchIndex)
    doSetScrollRow(addrToRow(matches[newmatchIndex]))
  }

  // let getVisibleRows = (): { top: number, bottom: number } => {
  //   return { top: 0, bottom: 0 }
  // }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const doGetVisibleRows = (gvr: () => { top: number, bottom: number }) => {
    //    getVisibleRows = gvr
  }

  const handleSetMemoryRange = (value: string) => {
    setAddress("")
    setMemoryRange(value)
    switch (value) {
      case MEMORY_RANGE.HGR1:
        overrideHires(true, false)
        break
      case MEMORY_RANGE.HGR2:
        overrideHires(true, true)
        break
      default:
        overrideHires(false, false)
        break
    }
  }

  const doPickWatchpoint = (addr: number) => {
    setPickWatchpoint(false)
    const bp = BreakpointNew()
    bp.address = addr
    bp.watchpoint = true
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    breakpoints.set(addr, bp)
    setPreferenceBreakpoints(breakpoints)
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const doSetMemory = (addr: number, value: number) => {
    switch (memoryRange) {
      case MEMORY_RANGE.CURRENT:
        {
          const page = addr >>> 8
          const addressGetTable = handleGetAddressGetTable()
          // Set $C0xx soft switch value
          if (page !== 0xC0) {
            const shifted = addressGetTable[page]
            addr = shifted + (addr & 255)
          }
        }
        break
      case MEMORY_RANGE.AUX:
        addr += RamWorksMemoryStart
        break
      default:
        // Address should work unchanged for MAIN and HGR1/HGR2
        break
    }
    passSetMemory(addr, value)
    // Trigger a UI refresh
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const saveMemory = () => {
    const blob = new Blob([getMemoryRange()])
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "memory.dat")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const runMode = handleGetRunMode()
  const ready = runMode === RUN_MODE.RUNNING || runMode === RUN_MODE.PAUSED
  const isHGR = (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2)
  const offset = isHGR ? (memoryRange === MEMORY_RANGE.HGR1 ? 0x2000 : 0x4000) : 0
  const memory = getMemoryRange()
  const decoder = new TextDecoder()
  const memAscii = decoder.decode(memory.map((value) => (value & 0x7F)))
  const addressGetTable = memoryRange === MEMORY_RANGE.CURRENT ? handleGetAddressGetTable() : null

  // The marginTop: auto makes the memory dump panel drift to the bottom of its parent.
  return (
    <div className="flex-column round-rect-border" id="tour-debug-memorydump"
      style={{marginTop: "auto"}}>
      <span className="flex-row"
        style={{
          alignItems: "center",
          pointerEvents: (ready ? "auto" : "none"), opacity: (ready ? 1 : 0.5)
        }}>
        <input className="hex-field"
          name="memoryAddr"
          type="text"
          placeholder="FFFF"
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleAddressKeyDown}
        />
        <Droplist name=" "
          value={memoryRange}
          values={Object.values(MEMORY_RANGE)}
          setValue={handleSetMemoryRange}
          userdata={0}
          isDisabled={() => false} />
        <button className={"push-button" + (pickWatchpoint ? " button-active" : "")}
          title="Pick Watchpoint"
          disabled={memory.length < 1}
          onClick={() => setPickWatchpoint(!pickWatchpoint)}>
          <FontAwesomeIcon icon={faCrosshairs} />
        </button>
        <button className="push-button"
          title="Save Memory"
          disabled={memory.length < 1}
          onClick={() => saveMemory()}>
          <FontAwesomeIcon icon={faSave} />
        </button>
        <button className={"push-button" + (highAscii ? " button-active" : "")}
          title="High Bit ASCII"
          disabled={memory.length < 1}
          onClick={() => setHighAscii(!highAscii)}>
          <FontAwesomeIcon style={{ width: "16px" }} icon={faA} />
        </button>
      </span>
      <span className="flex-row"
        style={{
          alignItems: "center",
          pointerEvents: (ready ? "auto" : "none"), opacity: (ready ? 1 : 0.5)
        }}>
        <input className="hex-field"
          name="searchHex"
          style={{ width: "8em" }}
          type="text"
          placeholder="Search Hex"
          value={hexsearch}
          onChange={handleSearchHex}
        />
        <input className="hex-field"
          name="searchAscii"
          style={{ width: "8em" }}
          type="text"
          placeholder="Search ASCII"
          value={ascii}
          onChange={handleSearchAscii}
        />
        <span className="bigger-font" style={{ marginLeft: "5pt", width: "7em" }}>
          {matches.length > 0 ? `${matchIndex + 1} of ${matches.length}` : "no match"}
        </span>
        <button className="push-button"
          title="Previous Match"
          disabled={matches.length < 1}
          onClick={previousMatch}>
          <FontAwesomeIcon icon={faArrowUp} />
        </button>
        <button className="push-button"
          title="Next Match"
          disabled={matches.length < 1}
          onClick={nextMatch}>
          <FontAwesomeIcon icon={faArrowDown} />
        </button>
      </span>
      <div className="debug-panel mono-text"
        style={{
          height: "220px",
          width: "380px"
        }}
        ref={memoryDumpRef}
      >
        <MemoryTable memory={memory} isHGR={isHGR}
          addressGetTable={addressGetTable}
          highAscii={highAscii}
          offset={offset} scrollRow={scrollRow}
          highlight={highlight}
          pickWatchpoint={pickWatchpoint}
          doPickWatchpoint={doPickWatchpoint}
          doSetMemory={doSetMemory}
          doGetVisibleRows={doGetVisibleRows} />
      </div>
    </div>
  )
}

export default MemoryDump
