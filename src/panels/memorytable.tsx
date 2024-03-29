import { useRef } from "react"
import { hiresLineToAddress, toHex } from "../emulator/utility/utility"
import { useGlobalContext } from "../globalcontext"

type MemoryTableProps = {
  memory: Uint8Array
  addressGetTable: number[] | null
  isHGR: boolean
  offset: number
  scrollRow: number
  pickWatchpoint: boolean
  doPickWatchpoint: (addr: number) => void
  doSetMemory: (address: number, value: number) => void
}

const MemoryTable = (props: MemoryTableProps) => {
  const { hgrview: hgrview, setHgrview: setHgrview, setUpdateHgr: setUpdateHgr } = useGlobalContext()
  const hgrviewLocal = useRef([-1, -1])

  if (props.memory.length <= 1) return '\n\n\n      *** Pause emulator to view memory ***'

  const convertMemoryToArray = () => {
    const rows = []
    const nrows = props.isHGR ? 192 : 4096
    const ncols = props.isHGR ? 40 : 16
    for (let l = 0; l < nrows; l++) {
      const addr = props.isHGR ?
        (hiresLineToAddress(props.offset, l) - props.offset) : 16 * l
      const mem = props.memory.slice(addr, addr + ncols)
      const cells = [toHex(props.isHGR ? addr + props.offset : addr, 4) + ':']
      for (let b = 0; b < ncols; b++) {
        cells.push(toHex(mem[b]))
      }
      rows.push(cells)
    }
    return rows
  }

  const getMemoryOffset = (cell: HTMLTableCellElement): [number, number] => {
    const row = cell.parentNode
    if (!row || !row.parentNode) return [-1, -1]
    const table = cell.parentNode?.parentNode as HTMLTableElement
    if (!table || !table.rows) return [-1, -1]
    const nrows = table.rows.length
    const ncols = table.rows[0].cells.length
    // The header row doesn't count as a real row, so just find the row index.
    const rawRow = Array.from(row.parentNode.children).indexOf(row as Element)
    const rowIndex = Math.min(rawRow, nrows - 8)
    // However, for the column, subtract 1 to get rid of the address column.
    const rawCol = Array.from(row.children).indexOf(cell) - 1
    const cellIndex = Math.min(rawCol, ncols - 3)
    if (rowIndex < 0 || cellIndex < 0) return [-1, -1]
    return [cellIndex, rowIndex]
  }

  const clearSelection = (table: HTMLTableElement) => {
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        table.rows[i].cells[j].classList.remove('selected')
      }
    }
  }

  const setSelection = (offset: number[], table: HTMLTableElement) => {
    for (let j = offset[1] + 1; j <= offset[1] + 8; j++) {
      for (let i = offset[0] + 1; i < offset[0] + 3; i++) {
        const cell = table?.rows[j]?.cells[i]
        cell?.classList.add('selected')
      }
    }
  }

  const onMouseDown = (e: React.MouseEvent) => {
    const cell = e.target as HTMLTableCellElement
    const offset = getMemoryOffset(cell)
    if (offset[0] < 0) return
    if (props.pickWatchpoint) {
      const addr = props.isHGR ?
        (hiresLineToAddress(props.offset, offset[1]) + offset[0]) :
        (16 * offset[1] + offset[0] + props.offset)
      props.doPickWatchpoint(addr)
      cell.style.animation = 'highlight-fast 1s'
      setTimeout(() => {
        cell.style.animation = ''
      }, 2250)
      // If we were picking a watchpoint, do not go into edit mode.
      e.preventDefault()
      return
    }
    if (props.isHGR) {
      setHgrview(offset)
      setUpdateHgr(true)
    }
  }

  const onMouseOver = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      onMouseDown(e)
    }
  }

  // This scrolling code is used with the HGR mode, where we want to scroll
  // both vertically and horizontally to keep the 2 x 8 selection box in view.
  const scrollHgrIntoView = (table: HTMLTableElement) => {
    const cell1 = table.rows[hgrview[1] + 1].cells[hgrview[0] + 1]
    const cell2 = table.rows[hgrview[1] + 8].cells[hgrview[0] + 2]
    if (cell1 && cell2) {
      const r1 = cell1.getBoundingClientRect()
      const r2 = cell2.getBoundingClientRect()
      const tr = table.getBoundingClientRect()
      const f = 10
      const isInView = (r1.left - 4 * f) >= tr.left && (r1.top - f) >= tr.top &&
        (r2.right + f) <= tr.right && (r2.bottom + f) <= tr.bottom
      if (!isInView) {
        cell1.scrollIntoView({ block: "center", inline: "center" })
      }
    }
  }

  const setNewFocus = (table: HTMLTableElement, col: number, row: number) => {
    const nextCell = table.rows[row].cells[col]
    nextCell?.scrollIntoView({ behavior: 'auto', block: 'center', inline: 'center' })
    nextCell?.focus()
  }

  const handleKeyDown = (col: number, row: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    // Use arrow keys to move from cell to cell
    if (e.key.startsWith('Arrow')) {
      e.preventDefault()
      const cell = e.currentTarget
      const table = cell.parentNode?.parentNode as HTMLTableElement
      const nrows = table.rows.length
      const ncols = table.rows[0].cells.length
      if (e.key === 'ArrowUp') {
        if (row < 1) return
        row--
      } else if (e.key === 'ArrowDown') {
        if (row >= (nrows - 1)) return
        row++
      } else if (e.key === 'ArrowLeft') {
        if (col < 1) return
        col--
      } else if (e.key === 'ArrowRight') {
        if (col >= (ncols - 1)) return
        col++
      }
      setNewFocus(table, col, row)
    }
  }

  // When table cell comes into focus, select the text in it.
  const handleFocus = (cell: HTMLTableCellElement) => {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(cell);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  const handleInput = (col: number, row: number, cell: HTMLTableCellElement) => {
    const newText = cell.textContent
    if (!newText) return
    const newvalue = newText.replace(/[^0-9a-f]/gi, '').toUpperCase().substring(0, 2)
    cell.textContent = newvalue
    if (newvalue.length === 1) {
      // If we needed to replace the contents (e.g. to make uppercase),
      // the cursor will unfortunately be placed at the beginning of the cell.
      // To fix this, force the cursor to the end.
      const range = document.createRange()
      range.selectNodeContents(cell)
      range.collapse(false) // false means collapse to the end
      const selection = window.getSelection()
      if (selection) {
        selection.removeAllRanges()
        selection.addRange(range)
      }
    } else if (newvalue.length === 2) {
      // We're done editing. Set the new memory value and advance to next cell.
      const addr = width * row + col - 1 + props.offset
      const value = parseInt(newvalue, 16)
      props.doSetMemory(addr, value)
      props.memory[addr] = value
      cell.textContent = newvalue
      // Advance the selection to the next cell
      const table = cell.parentNode?.parentNode as HTMLTableElement
      const nrows = table.rows.length
      const ncols = table.rows[0].cells.length
      if (col < (ncols - 1)) {
        col++
      } else if (row < (nrows - 1)) {
        row++
        col = 1
      }
      setNewFocus(table, col, row)
    }
  }

  // Make sure we keep our selection up to date, especially if it was changed
  // by clicking on the canvas.
  if (props.isHGR && hgrview[0] >= 0 &&
    hgrviewLocal.current[0] !== hgrview[0] &&
    hgrviewLocal.current[1] !== hgrview[1]) {
    hgrviewLocal.current[0] = hgrview[0]
    hgrviewLocal.current[1] = hgrview[1]
    setTimeout(() => {
      const table = document.querySelector('table') as HTMLTableElement
      if (!table) return
      clearSelection(table)
      setSelection(hgrview, table)
      scrollHgrIntoView(table)
    }, 10)
  }

  const width = props.isHGR ? 40 : 16
  const rows = convertMemoryToArray()
  const isEditable = (col: number, row: number) => {
    if (col === 0) return false
    if (!props.addressGetTable) return true
    return props.addressGetTable[Math.floor(row / 16)] < 0x20000
  }

  // This scrolling code is used by the higher-level MemoryDump component to
  // scroll to a specific row when the address field is changed.
  if (props.scrollRow >= 0) {
    const table = document.querySelector('table') as HTMLTableElement
    const row = table.rows[props.scrollRow + 1]
    row.scrollIntoView({ block: "center", inline: "center" })
    row.style.animation = 'highlight-anim 2s 0.25s'
    // Tried to also highlight the address column, but it does strange things
    // in HGR mode where it draws some of the columns on top of each other...
    //    row.cells[0].style.animation = 'highlight-anim 2s 0.25s'
    setTimeout(() => {
      row.style.animation = ''
      // row.cells[0].style.animation = ''
    }, 2250)
  }

  return (
    <table style={{ cursor: props.pickWatchpoint ? 'crosshair' : 'default' }}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}>
      <thead>
        <tr>
          <th style={{ position: "sticky", top: "0", left: "0", zIndex: "2" }}></th>
          {Array.from({ length: width }, (_, i) => <th className="memtable-hex" key={i}>{toHex(i, 2)}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, j) => (
          <tr key={j}>
            {row.map((cell, i) => (
              <td key={i}
                contentEditable={isEditable(i, j)}
                suppressContentEditableWarning={true}
                onKeyDown={(e) => handleKeyDown(i, j, e)}
                onInput={(e) => handleInput(i, j, e.currentTarget)}
                onFocus={(e) => handleFocus(e.currentTarget)}
                className={(i === 0) ? 'memtable-addr' : (isEditable(i, j) ? '' : 'memtable-readonly')}>
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
