import { hiresLineToAddress, toHex } from "../emulator/utility/utility"
import { useGlobalContext } from "../globalcontext"

type MemoryTableProps = {
  memory: Uint8Array
  isHGR: boolean
  offset: number
  scrollRow: number
}

const MemoryTable = (props: MemoryTableProps) => {
  const { hgrview: hgrview, setHgrview: setHgrview, setUpdateHgr: setUpdateHgr } = useGlobalContext()
  if (props.memory.length <= 1) return '\n\n\n      *** Pause emulator to view memory ***'

  const convertMemoryToArray = (memory: Uint8Array, isHGR: boolean, offset: number) => {
    const rows = []
    const nrows = isHGR ? 192 : 4096
    const ncols = isHGR ? 40 : 16
    for (let l = 0; l < nrows; l++) {
      const addr = isHGR ? hiresLineToAddress(offset, l) : 16 * l
      const mem = memory.slice(addr, addr + ncols)
      const cells = [toHex(addr, 4) + ':']
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
    return [cellIndex, rowIndex];
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
  const scrollIntoView = (table: HTMLTableElement) => {
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

  // Make sure we keep our selection up to date, especially if it was changed
  // by clicking on the canvas.
  if (props.isHGR && hgrview[0] >= 0) {
    setTimeout(() => {
      const table = document.querySelector('table') as HTMLTableElement
      if (!table) return
      clearSelection(table)
      setSelection(hgrview, table)
      scrollIntoView(table)
    }, 10)
  }

  const width = props.isHGR ? 40 : 16
  const rows = convertMemoryToArray(props.memory, props.isHGR, props.offset)

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
    <table onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}>
      <thead>
        <tr>
          <th style={{ position: "sticky", top: "0", left: "0", zIndex: "2" }}></th>
          {Array.from({ length: width }, (_, i) => <th className="memtable-hex" key={i}>{toHex(i, 2)}</th>)}
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
