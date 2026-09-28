import { useEffect, useRef, useState } from "react"
import { RamWorksMemoryStart, RUN_MODE, hiresAddressToLine, MEMORY_DUMP_STATE } from "../../../common/utility"
import { handleGetAddressGetTable, handleGetBreakpoints, handleGetMemoryDump, handleGetRunMode, passMemoryDumpState, passSetMemory } from "../../main2worker"
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

const dumpNames = [
  "Current memory",
  "Main RAM",
  "Auxiliary RAM",
  "HGR page 1 (screen order)",
  "HGR page 2 (screen order)",
]

const memoryDumpOptionToName = (state: MEMORY_DUMP_STATE) => {
  return dumpNames[state]
}

const memoryDumpNameToOption = (name: string) => {
  return dumpNames.indexOf(name) as MEMORY_DUMP_STATE
}

let lastMemoryRange = MEMORY_DUMP_STATE.CURRENT

const MemoryDump = (props: { isActive?: boolean }) => {
  const { updateBreakpoint, setUpdateBreakpoint, memdumpAddress, setMemdumpAddress } = useGlobalContext()
  const memoryDumpRef = useRef(null)
  const [address, setAddress] = useState("")
  const [memoryDumpState, setMemoryDumpState] = useState(lastMemoryRange)
  const [scrollRow, setScrollRow] = useState(-1)
  const [pickWatchpoint, setPickWatchpoint] = useState(false)
  const [ascii, setAscii] = useState("")
  const [hexsearch, setHexsearch] = useState("")
  const [matches, setMatches] = useState(new Array(0))
  const [highlight, setHighlight] = useState(new Array(0))
  const [matchIndex, setMatchIndex] = useState(0)
  const [highAscii, setHighAscii] = useState(false)
  const previousMemLengthRef = useRef(0)

  // Only ask the worker to build/send the memory while this tab is the one
  // actually visible.
  useEffect(() => {
    passMemoryDumpState((props.isActive || handleGetRunMode() === RUN_MODE.PAUSED) ?
      memoryDumpState : MEMORY_DUMP_STATE.NONE)
  }, [props.isActive, memoryDumpState])

  useEffect(() => {
    switch (memoryDumpState) {
      case MEMORY_DUMP_STATE.HGR1:
        overrideHires(true, false)
        return () => overrideHires(false, false)
      case MEMORY_DUMP_STATE.HGR2:
        overrideHires(true, true)
        return () => overrideHires(false, false)
    }
  }, [memoryDumpState])

  const doSetScrollRow = (row: number) => {
    if (row < 0) return
    setScrollRow(row)
    // Turn off our new scroll position after a brief moment. Otherwise the
    // memorytable will just keep returning to the same scroll position.
    setTimeout(() => { setScrollRow(-1) }, 100)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const addrToRow = (addr: number) => {
    if (memoryDumpState === MEMORY_DUMP_STATE.HGR1 || memoryDumpState === MEMORY_DUMP_STATE.HGR2) {
      const memLow = (memoryDumpState === MEMORY_DUMP_STATE.HGR1) ? 0x2000 : 0x4000
      if (addr < memLow || addr >= memLow + 0x2000) return -1
      return hiresAddressToLine(addr)
    }
    return Math.floor(addr / 16)
  }

  // const rowToAddress = (row: number) => {
  //   if (memoryRange === MEMORY_DUMP_STATE.HGR1 || memoryRange === MEMORY_DUMP_STATE.HGR2) {
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

  useEffect(() => {
    if (memdumpAddress < 0) return
    const row = addrToRow(memdumpAddress)
    setMemdumpAddress(-1)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    doSetScrollRow(row)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memdumpAddress])

  const doSearchAscii = (value: string) => {
    const len = value.length
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
      const addr = memAscii.indexOf(value, pos)
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

  const handleSearchAscii = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAscii(e.target.value)
    doSearchAscii(e.target.value)
  }

  const handleAsciiKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && ascii.length > 0) {
      e.preventDefault()
      doSearchAscii(ascii)
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

  const doSearchHex = (value: string) => {
    if (value.length < 1) {
      setMatches(new Array(0))
      setHighlight(new Array(0))
      setMatchIndex(0)
      return
    }
    // Convert our string 'FF1234' to an array of bytes [0xFF, 0x12, 0x34]
    const len = Math.floor((value.length + 1) / 2)
    const values = new Uint8Array(len)
    for (let i = 0; i < values.length; i++) {
      const offset = i * 2
      values[i] = parseInt(value.slice(offset, offset + 2), 16)
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

  const handleSearchHex = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9a-f]/gi, "").toUpperCase()
    setHexsearch(value)
    doSearchHex(value)
  }

  const handleHexKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && hexsearch.length > 0) {
      e.preventDefault()
      doSearchHex(hexsearch)
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

  const handleSetMemoryRange = (value: string) => {
    setAddress("")
    // Map value to memoryDumpState
    const newState = memoryDumpNameToOption(value)
    // Save the new selection so a remount of this panel restores it.
    lastMemoryRange = newState
    setMemoryDumpState(newState)
    // setMemoryDumpState(value)
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
    switch (memoryDumpState) {
      case MEMORY_DUMP_STATE.CURRENT:
        {
          const page = addr >>> 8
          const addressGetTable = handleGetAddressGetTable()
          const shifted = addressGetTable[page]
          addr = shifted + (addr & 255)
        }
        break
      case MEMORY_DUMP_STATE.AUX:
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
    const memory = handleGetMemoryDump()
    const blob = new Blob([memory])
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
  const isHGR = (memoryDumpState === MEMORY_DUMP_STATE.HGR1 || memoryDumpState === MEMORY_DUMP_STATE.HGR2)
  const offset = isHGR ? (memoryDumpState === MEMORY_DUMP_STATE.HGR1 ? 0x2000 : 0x4000) : 0
  const memory = handleGetMemoryDump()
  const decoder = new TextDecoder()
  const memAscii = decoder.decode(memory.map((value) => (value & 0x7F)))
  const addressGetTable = memoryDumpState === MEMORY_DUMP_STATE.CURRENT ? handleGetAddressGetTable() : null

  useEffect(() => {
    const justPaused = memory.length > 0 && previousMemLengthRef.current === 0 && runMode === RUN_MODE.PAUSED
    previousMemLengthRef.current = memory.length
    if (!justPaused) {
      return
    }
    if (ascii.length > 0) {
      setTimeout(() => {
        doSearchAscii(ascii)
      }, 1)
    } else if (hexsearch.length > 0) {
      setTimeout(() => {
        doSearchHex(hexsearch)
      }, 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascii, hexsearch, memory.length, runMode])

  return (
    <div className="flex-column" id="tour-debug-memorydump"
      style={{height: "100%", boxSizing: "border-box"}}>
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
          value={memoryDumpOptionToName(memoryDumpState)}
          values={dumpNames}
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
          onKeyDown={handleHexKeyDown}
          onChange={handleSearchHex}
        />
        <input className="hex-field"
          name="searchAscii"
          style={{ width: "8em" }}
          type="text"
          placeholder="Search ASCII"
          value={ascii}
          autoComplete="off"
          onKeyDown={handleAsciiKeyDown}
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
          overflow: "hidden",
          width: "380px",
        }}
        ref={memoryDumpRef}
      >
        <MemoryTable isHGR={isHGR}
          addressGetTable={addressGetTable}
          highAscii={highAscii}
          offset={offset} scrollRow={scrollRow}
          highlight={highlight}
          pickWatchpoint={pickWatchpoint}
          doPickWatchpoint={doPickWatchpoint}
          doSetMemory={doSetMemory} />
      </div>
    </div>
  )
}

export default MemoryDump
