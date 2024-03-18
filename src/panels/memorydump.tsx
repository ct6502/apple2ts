import { useRef, useState } from "react"
import { RUN_MODE, hiresAddressToLine } from "../emulator/utility/utility"
import { handleGetAddressGetTable, handleGetBreakpoints, handleGetMemoryDump, handleGetRunMode, passBreakpoints, passSetMemory } from "../main2worker"
import React from "react"
import { Droplist } from "./droplist"
import { overrideHires } from "../graphics"
import MemoryTable from "./memorytable"
import { faCrosshairs } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Breakpoint, BreakpointMap } from "../emulator/utility/breakpoint"
import { useGlobalContext } from "../globalcontext"

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
  const [address, setAddress] = useState('')
  const [memoryRange, setMemoryRange] = useState(`${MEMORY_RANGE.CURRENT}`)
  const [scrollRow, setScrollRow] = useState(-1)
  const [pickWatchpoint, setPickWatchpoint] = useState(false)

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
          return result
        }
      case MEMORY_RANGE.AUX:
        return memory.slice(0x10000, 0x20000)
      default:
        return memory
    }

  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(address || '0', 16)
      setAddress(addr.toString(16).toUpperCase())
      let scrollRow = Math.floor(addr / 16)
      if (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2) {
        scrollRow = hiresAddressToLine(addr)
      }
      setScrollRow(scrollRow)
      // Turn off our new scroll position after a brief moment. Otherwise the
      // memorytable will just keep returning to the same scroll position.
      setTimeout(() => { setScrollRow(-1) }, 100)
    }
  }

  const handleSetMemoryRange = (value: string) => {
    setAddress('')
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
    const bp = new Breakpoint()
    bp.address = addr
    bp.watchpoint = true
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    breakpoints.set(addr, bp)
    passBreakpoints(breakpoints)
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const doSetMemory = (addr: number, value: number) => {
    switch (memoryRange) {
      case MEMORY_RANGE.CURRENT:
        {
          const page = addr >>> 8
          const addressGetTable = handleGetAddressGetTable()
          const shifted = addressGetTable[page]
          addr = shifted + (addr & 255)
        }
        break
      case MEMORY_RANGE.AUX:
        addr += 0x10000
        break
      default:
        // Address should work unchanged for MAIN and HGR1/HGR2
        break
    }
    passSetMemory(addr, value)
    // Trigger a UI refresh
    setUpdateBreakpoint(updateBreakpoint + 1)
  }

  const runMode = handleGetRunMode()
  const ready = runMode === RUN_MODE.RUNNING || runMode === RUN_MODE.PAUSED
  const isHGR = (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2)
  const offset = isHGR ? (memoryRange === MEMORY_RANGE.HGR1 ? 0x2000 : 0x4000) : 0
  const memory = getMemoryRange()
  const addressGetTable = memoryRange === MEMORY_RANGE.CURRENT ? handleGetAddressGetTable() : null

  return (
    <div className="flex-column">
      <span className="flex-row"
        style={{
          alignItems: "center",
          pointerEvents: (ready ? 'auto' : 'none'), opacity: (ready ? 1 : 0.5)
        }}>
        <input className="hex-field"
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
        <button className={"push-button" + (pickWatchpoint ? ' button-active' : '')}
          title="Set Watchpoint"
          disabled={memory.length < 1}
          onClick={() => setPickWatchpoint(!pickWatchpoint)}>
          <FontAwesomeIcon icon={faCrosshairs} />
        </button>
      </span>
      <div className="debug-panel"
        style={{
          width: '370px',
          height: `485px`
        }}
        ref={memoryDumpRef}
      >
        <MemoryTable memory={memory} isHGR={isHGR}
          addressGetTable={addressGetTable}
          offset={offset} scrollRow={scrollRow}
          pickWatchpoint={pickWatchpoint}
          doPickWatchpoint={doPickWatchpoint}
          doSetMemory={doSetMemory} />
      </div>
    </div>
  )
}

export default MemoryDump
