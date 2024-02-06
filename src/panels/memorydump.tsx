import { useState } from "react"
import { toHex } from "../emulator/utility/utility"
import { handleGetAddressGetTable, handleGetMemoryDump } from "../main2worker"
import React from "react"
import { Droplist } from "./droplist"

enum MEMORY_RANGE {
  CURRENT = "Current memory",
  MAIN = "Main RAM",
  AUX = "Auxiliary RAM",
  HGR1 = "HGR page 1 (memory order)",
  HGR2 = "HGR page 2 (memory order)",
}

const MemoryDump = () => {
  const memoryDumpRef = React.createRef<HTMLDivElement>()
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
        lookup = Array.from({ length: 32 }, (_, i) => 0x2000 + 256 * i)
        addrOffset = 0x2000
        break
      case MEMORY_RANGE.HGR2:
        lookup = Array.from({ length: 32 }, (_, i) => 0x4000 + 256 * i)
        addrOffset = 0x4000
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
      const height = memoryDumpRef.current.scrollHeight
      const pos = height * (addr / (nlines * 16))
      memoryDumpRef.current.scrollTop = pos
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
  }

  return (
    <div className="flex-column">
      <span className="flex-row">
        <input className="hex-field"
          type="text"
          placeholder="FFFF"
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleAddressKeyDown}
        />
        <Droplist name=" "
          className="light-mode-edit"
          value={memoryRange}
          values={Object.values(MEMORY_RANGE)}
          setValue={handleSetMemoryRange}
          address={0}
          isDisabled={() => false} />
      </span>
      <div className="debug-panel"
        style={{
          fontWeight: "900",
          borderBottom: "1px solid #444",
          marginBottom: "0", paddingLeft: "3px", marginTop: "7px", paddingBottom: 0
        }}>
        {'      0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F'}
      </div>
      <div className="debug-panel"
        style={{
          width: '370px', // Set the width to your desired value
          height: `495px`, // Set the height to your desired value
          overflow: 'auto',
        }}
        ref={memoryDumpRef}
      >
        {getMemory()}
      </div>
    </div>
  )
}

export default MemoryDump
