import { useState } from "react"
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
  const [isSelecting, setIsSelecting] = useState(false)
  const [startCell, setStartCell] = useState([-1, -1])
  if (props.memory.length < 1) return '\n\n\n      *** Pause emulator to view memory ***'
  const rows = getHiresMemory(props.memory, props.offset)

  const getCellIndices = (cell: HTMLTableCellElement) => {
    const row = cell.parentNode
    if (!row || !row.parentNode) return [-1, -1]
    const rowIndex = Array.from(row.parentNode.children).indexOf(row as Element)
    const cellIndex = Array.from(row.children).indexOf(cell)
    if (rowIndex <= 0 || cellIndex <= 0) return [-1, -1]
    return [rowIndex, cellIndex];
  }

  const clearSelection = (cell: HTMLTableCellElement) => {
    const row = cell.parentNode
    if (!row || !row.parentNode) return
    const table = row.parentNode as HTMLTableElement
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        table.rows[i].cells[j].classList.remove('selected')
      }
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    setIsSelecting(true)
    const cell = e.target as HTMLTableCellElement
    if (e.shiftKey && startCell[0] > 0) {
      drawToEndCell(cell)
      return
    }
    const indices = getCellIndices(cell)
    if (indices[0] < 0) return
    clearSelection(cell)
    setStartCell(indices)
  }

  const drawToEndCell = (cell: HTMLTableCellElement) => {
    const endCell = getCellIndices(cell)
    if (endCell[0] < 0) return
    const row = cell.parentNode
    if (!row || !row.parentNode) return
    const table = row.parentNode as HTMLTableElement
    clearSelection(cell)
    for (let i = Math.min(startCell[0], endCell[0]); i <= Math.max(startCell[0], endCell[0]); i++) {
      for (let j = Math.min(startCell[1], endCell[1]); j <= Math.max(startCell[1], endCell[1]); j++) {
        table.rows[i].cells[j].classList.add('selected')
      }
    }
  }

  const onMouseOver = (e: React.MouseEvent) => {
    if (!isSelecting) return
    const cell = e.target as HTMLTableCellElement
    drawToEndCell(cell)
  }

  const onMouseUp = () => {
    setIsSelecting(false)
  }

  return (
    <table onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}
      onMouseUp={onMouseUp}>
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
