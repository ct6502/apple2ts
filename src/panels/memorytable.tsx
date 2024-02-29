import { hiresLineToAddress, toHex } from "../emulator/utility/utility"

const getHiresMemory = (memory: Uint8Array, offset: number) => {
  const rows = []
  for (let l = 0; l < 192; l++) {
    const addr = hiresLineToAddress(offset, l)
    const mem = memory.slice(addr, addr + 40)
    const cells = [toHex(addr, 4) + ':']
    for (let b = 0; b < 40; b++) {
      cells.push(toHex(mem[b]))
    }
    rows.push(cells)
  }
  return rows
}

type MemoryTableProps = {
  memory: Uint8Array
  offset: number
}

const MemoryTable = (props: MemoryTableProps) => {
  if (props.memory.length < 1) return '\n\n\n      *** Pause emulator to view memory ***'
  const rows = getHiresMemory(props.memory, props.offset)
  return (
    <table>
      <thead>
        <tr>
          <th style={{ position: "sticky", top: "0", left: "0", zIndex: "2" }}></th>
          {Array.from({ length: 40 }, (_, i) => <th className="memtable-hex" key={i}>{toHex(i, 2)}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className={(j === 0) ? 'memtable-addr' : ''}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MemoryTable
