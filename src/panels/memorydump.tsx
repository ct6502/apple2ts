import { useRef, useState } from "react"
import { RUN_MODE, hiresLineToAddress, toHex } from "../emulator/utility/utility"
import { handleGetAddressGetTable, handleGetMemoryDump, handleGetRunMode } from "../main2worker"
import React from "react"
import { Droplist } from "./droplist"
import { overrideHires } from "../graphics"
import MemoryTable from "./memorytable"

enum MEMORY_RANGE {
  CURRENT = "Current memory",
  MAIN = "Main RAM",
  AUX = "Auxiliary RAM",
  HGR1 = "HGR page 1 (screen order)",
  HGR2 = "HGR page 2 (screen order)",
}

const MemoryDump = () => {
  const memoryDumpRef = useRef(null)
  let addrOffset = 0
  let nlines = 256 * 16
  const [address, setAddress] = useState('')
  const [memoryRange, setMemoryRange] = useState(`${MEMORY_RANGE.CURRENT}`)

  const getFormattedMemory = (memory: Uint8Array, lookup: number[], offset: number) => {
    const status = ['']
    let i = 0
    let addr = offset
    for (let l = 0; l < lookup.length; l++) {
      const mem = memory.slice(lookup[l], lookup[l] + 256)
      for (let j = 0; j < 16; j++) {
        let s = toHex(addr, 4) + ":"
        for (let b = 0; b < 16; b++) {
          s += " " + toHex(mem[j * 16 + b])
        }
        status[i] = s
        i++
        addr += 16
      }
    }
    nlines = i
    return status.join('\n')
  }

  const getHiresMemory = (memory: Uint8Array, offset: number) => {
    const status = ['']
    let i = 0
    for (let l = 0; l < 192; l++) {
      const addr = hiresLineToAddress(offset, l)
      const mem = memory.slice(addr, addr + 40)
      let s = toHex(addr, 4) + ":"
      for (let b = 0; b < 16; b++) {
        s += " " + toHex(mem[b])
      }
      s += "\n     "
      for (let b = 16; b < 32; b++) {
        s += " " + toHex(mem[b])
      }
      s += "\n     "
      for (let b = 32; b < 40; b++) {
        s += " " + toHex(mem[b])
      }
      status[i] = s
      i++
    }
    nlines = i
    return status.join('\n')
  }

  const getMemory = () => {
    const memory = handleGetMemoryDump()
    if (memory.length < 1) return '\n\n\n      *** Pause emulator to view memory ***'
    const addressGetTable = handleGetAddressGetTable()
    let lookup: number[] = []
    addrOffset = 0
    switch (memoryRange) {
      case MEMORY_RANGE.CURRENT:
        lookup = addressGetTable.slice(0, 256)
        break
      case MEMORY_RANGE.MAIN:
        lookup = Array.from({ length: 256 }, (_, i) => 256 * i)
        break
      case MEMORY_RANGE.AUX:
        lookup = Array.from({ length: 256 }, (_, i) => 0x10000 + 256 * i)
        break
      case MEMORY_RANGE.HGR1:
        return getHiresMemory(memory, 0x2000)
        break
      case MEMORY_RANGE.HGR2:
        return getHiresMemory(memory, 0x4000)
        break
    }
    return getFormattedMemory(memory, lookup, addrOffset)
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }

  const scrollToAddress = (addr: number) => {
    if (memoryDumpRef.current) {
      addr = 16 * Math.floor(addr / 16) - addrOffset
      const div: HTMLDivElement = memoryDumpRef.current
      const height = div.scrollHeight
      const pos = height * (addr / (nlines * 16))
      div.scrollTop = pos
    }
  }

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const addr = parseInt(address || '0', 16)
      setAddress(addr.toString(16).toUpperCase())
      scrollToAddress(addr)
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
    const height = memoryDumpRef.current ?
      (memoryDumpRef.current as HTMLDivElement).scrollHeight : 0
    // If we switch from one memory layout to another with a different
    // number of lines, then reset the scroll bar.
    setTimeout(() => {
      if (memoryDumpRef.current) {
        const div: HTMLDivElement = memoryDumpRef.current
        const newHeight = div.scrollHeight
        if (height !== newHeight) div.scrollTop = 0
      }
    }, 100)
  }

  const runMode = handleGetRunMode()
  const ready = runMode === RUN_MODE.RUNNING || runMode === RUN_MODE.PAUSED
  const isHGR = (memoryRange === MEMORY_RANGE.HGR1 || memoryRange === MEMORY_RANGE.HGR2)
  const offset = (memoryRange === MEMORY_RANGE.HGR1) ? 0x2000 : 0x4000

  return (
    <div className="flex-column">
      <span className="flex-row"
        style={{ pointerEvents: (ready ? 'auto' : 'none'), opacity: (ready ? 1 : 0.5) }}>
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
      </span>
      {!isHGR &&
        <div className="debug-panel"
          style={{
            fontWeight: "900",
            borderBottom: "1px solid #444",
            marginBottom: "0", marginTop: "7px", paddingBottom: 0
          }}>
          {'      00 01 02 03 04 05 06 07 08 09 0A 0B 0C 0D 0E 0F'}
        </div>
      }
      <div className="debug-panel"
        style={{
          width: '370px',
          height: `485px`
        }}
        ref={memoryDumpRef}
      >
        {isHGR ? <MemoryTable memory={handleGetMemoryDump()} offset={offset} /> :
          <div style={{ width: '100%', height: '100%', overflow: 'auto' }}>{getMemory()}</div>}
      </div>
    </div>
  )
}

export default MemoryDump
