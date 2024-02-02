import { useState } from "react"
import { toHex } from "../emulator/utility/utility"
import { handleGetMemoryDump } from "../main2worker"
import React from "react"

const getFormattedMemory = (memory: Uint8Array) => {
  const status = ['']
  const offset = 0//16 * Math.floor(address / 16)
  const mem = memory.slice(offset, offset + 256 * 256)
  for (let j = 0; j < (mem.length / 16); j++) {
    let s = toHex(16 * j, 4) + ":"
    for (let i = 0; i < 16; i++) {
      s += " " + toHex(mem[j * 16 + i])
    }
    status[j] = s
  }
  return status.join('\n')
}

const getMemory = () => {
  const memory = handleGetMemoryDump()
  if (memory.length < 1) return '\n\n\n      *** Pause emulator to view memory ***'
  return getFormattedMemory(memory)
}

const MemoryDump = () => {
  const memoryDumpRef = React.createRef<HTMLDivElement>()
  const [address, setAddress] = useState('')
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newvalue = e.target.value.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 4)
    setAddress(newvalue)
  }
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      let addr = parseInt(address || '0', 16)
      setAddress(addr.toString(16).toUpperCase())
      if (memoryDumpRef.current) {
        addr = 16 * Math.floor(addr / 16)
        const height = memoryDumpRef.current.scrollHeight
        const pos = height * (addr / 65536)
        console.log(height / 4096, pos)
        memoryDumpRef.current.scrollTop = pos
      }
    }
  }
  return (
    <div className="flex-column">
      <span className="flex-row">
        <input className="hexField"
          type="text"
          placeholder=""
          value={address}
          onChange={handleAddressChange}
          onKeyDown={handleAddressKeyDown}
        />
      </span>
      <div className="debug-panel" style={{ marginBottom: "0", marginLeft: "3px" }}>
        {'      0  1  2  3  4  5  6  7  8  9  A  B  C  D  E  F'}
      </div>
      <div className="debug-panel"
        style={{
          width: '370px', // Set the width to your desired value
          height: `350pt`, // Set the height to your desired value
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
