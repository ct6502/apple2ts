import { useRef } from "react"
import { hiresLineToAddress, toHex, UI_THEME } from "../../common/utility"
import { useGlobalContext } from "../globalcontext"
import { nColsHgrMagnifier, nRowsHgrMagnifier } from "../graphics"
import { getTheme } from "../ui_settings"

type MemoryTableProps = {
  memory: Uint8Array
  addressGetTable: number[] | null
  isHGR: boolean
  offset: number
  highAscii: boolean
  highlight: number[]
  scrollRow: number
  pickWatchpoint: boolean
  doPickWatchpoint: (addr: number) => void
  doSetMemory: (address: number, value: number) => void
  doGetVisibleRows: (gvr: () => { top: number, bottom: number }) => void
}

const MemoryTable = (props: MemoryTableProps) => {
  const { hgrMagnifier: hgrMagnifier, setHgrMagnifier: setHgrMagnifier,
    setUpdateHgr: setUpdateHgr } = useGlobalContext()
  const hgrMagnifierLocal = useRef([-1, -1])
  const cellValue = useRef("")

  if (props.memory.length <= 1) return "\n\n\n      *** Pause emulator to view memory ***"

  const convertByteToAscii = (byte: number) => {
    if (props.highAscii) byte &= 0x7F
    if (byte < 32 || byte > 126) return "·" // Non-printable
    return String.fromCharCode(byte)
  }

  const convertMemoryToArray = () => {
    const rows = []
    const nrows = props.isHGR ? 192 : 4096
    const ncols = props.isHGR ? 40 : 16
    for (let l = 0; l < nrows; l++) {
      const addr = props.isHGR ?
        (hiresLineToAddress(props.offset, l) - props.offset) : 16 * l
      const mem = props.memory.slice(addr, addr + ncols)
      const cells = [toHex(props.isHGR ? addr + props.offset : addr, 4) + ":"]
      let ascii = ""
      for (let b = 0; b < ncols; b++) {
        cells.push(toHex(mem[b]))
        ascii += convertByteToAscii(mem[b])
      }
      if (!props.isHGR) {
        cells.push(ascii)
      }
      rows.push(cells)
    }
    return rows
  }

  const getMemoryOffset = (cell: HTMLTableCellElement): [number, number] => {
    const row = cell.parentNode
    const table = cell.parentNode?.parentNode as HTMLTableElement
    if (table && table.rows && row && row.parentNode) {
      const nrows = table.rows.length
      const ncols = table.rows[0].cells.length
      // The header row doesn't count as a real row, so just find the row index.
      const rawRow = Array.from(row.parentNode.children).indexOf(row as Element)
      let rowIndex = Math.min(rawRow, nrows - 8)
      // However, for the column, subtract 1 to get rid of the address column.
      const rawCol = Array.from(row.children).indexOf(cell) - 1
      let cellIndex = Math.min(rawCol, ncols - 3)
      if (props.isHGR) {
        cellIndex = Math.min(cellIndex, 40 - nColsHgrMagnifier)
        rowIndex = Math.min(rowIndex, nrows - nRowsHgrMagnifier)
      }
      if (rowIndex >= 0 && cellIndex >= 0) {
        return [cellIndex, rowIndex]
      }
    }
    return [-1, -1]
  }

  const clearSelection = (table: HTMLTableElement) => {
    if (!table || !table.rows) return
    for (let i = 0; i < table.rows.length; i++) {
      for (let j = 0; j < table.rows[i].cells.length; j++) {
        table.rows[i].cells[j].classList.remove("selected")
      }
    }
  }

  const setSelection = (offset: number[], table: HTMLTableElement) => {
    for (let j = offset[1] + 1; j <= offset[1] + nRowsHgrMagnifier; j++) {
      for (let i = offset[0] + 1; i <= offset[0] + nColsHgrMagnifier; i++) {
        const cell = table?.rows[j]?.cells[i]
        cell?.classList.add("selected")
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
      applyHighlightAnimation(cell)
      setTimeout(() => {
        cell.style.animation = ""
      }, 2250)
      // If we were picking a watchpoint, do not go into edit mode.
      e.preventDefault()
      return
    }
    if (props.isHGR) {
      setHgrMagnifier(offset)
      setUpdateHgr(true)
    }
  }

  const onMouseOver = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      onMouseDown(e)
    }
  }

  // This scrolling code is used with the HGR mode, where we want to scroll
  // both vertically and horizontally to keep the HGR selection box in view.
  const scrollHgrIntoView = (table: HTMLTableElement) => {
    const cell1 = table.rows[hgrMagnifier[1] + 1].cells[hgrMagnifier[0] + 1]
    const cell2 = table.rows[hgrMagnifier[1] + nRowsHgrMagnifier].cells[hgrMagnifier[0] + 2]
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

  const getVisibleRows = () => {
    const table = document.querySelector("#memory-table") as HTMLTableElement
    let topVisibleRowIndex = -1
    let bottomVisibleRowIndex = -1

    for (let i = 0; i < table.rows.length; i++) {
      const rect = table.rows[i].getBoundingClientRect()
      // Check if the row is within the viewport
      if (rect.top < window.innerHeight && rect.bottom >= 0) {
        // If it's the first visible row we've found, set it as the top
        if (topVisibleRowIndex === -1) {
          topVisibleRowIndex = i
        }
        // Keep updating the bottom visible row index as we go
        bottomVisibleRowIndex = i
      } else if (topVisibleRowIndex !== -1) {
        // We've found the last visible row
        break
      }
    }
    return { top: topVisibleRowIndex, bottom: bottomVisibleRowIndex }
  }

  props.doGetVisibleRows(getVisibleRows)

  const setNewFocus = (table: HTMLTableElement, col: number, row: number) => {
    const nextCell = table.rows[row].cells[col]
    nextCell?.scrollIntoView({ behavior: "auto", block: "center", inline: "center" })
    nextCell?.focus()
  }

  const handleKeyDown = (col: number, row: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    // Use arrow keys to move from cell to cell
    const cell = e.currentTarget
    const table = cell.parentNode?.parentNode as HTMLTableElement
    const nrows = table.rows.length
    const ncols = table.rows[0].cells.length
    if (e.key.startsWith("Arrow")) {
      e.preventDefault()
      cellValue.current = ""
      if (e.key === "ArrowUp") {
        if (row < 1) return
        row--
      } else if (e.key === "ArrowDown") {
        if (row >= (nrows - 1)) return
        row++
      } else if (e.key === "ArrowLeft") {
        if (col > 1) {
          col--
        } else if (row >= 1) {
          row--
          col = ncols - 2
        } else {
          return
        }
      } else if (e.key === "ArrowRight") {
        if (col < (ncols - 2)) {
          col++
        } else if (row < (nrows - 1)) {
          row++
          col = 1
        } else {
          return
        }
      }
      setNewFocus(table, col, row)
    } else if (e.key === "Escape") {
      e.preventDefault()
      const cell = e.currentTarget
      // On an Escape, restore the original value
      if (cell && cellValue.current) {
        cell.textContent = cellValue.current
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      const cell = e.currentTarget as HTMLTableCellElement
      if (cell && cell.textContent?.trim() === "") {
        // TODO: Check spreadsheet programs to see if advance to next cell on 'Enter'
        cellValue.current = "00"
        setNewValue(col, row, cell, "00")
      }
      if (col < (ncols - 2)) {
        col++
        setNewFocus(table, col, row)
      }
    }
  }

  // When table cell comes into focus, select the text in it.
  const handleFocus = (cell: HTMLTableCellElement) => {
    const range = document.createRange()
    const sel = window.getSelection()
    range.selectNodeContents(cell)
    // Remember current value in case user hits Escape
    if (cell && cell.textContent) {
      cellValue.current = cell.textContent
    }
    sel?.removeAllRanges()
    sel?.addRange(range)
  }

  const setNewValue = (col: number, row: number, cell: HTMLTableCellElement, newvalue: string) => {
    const addr = (props.isHGR ?
      hiresLineToAddress(props.offset, row) : (16 * row + props.offset)) + col - 1
    const value = parseInt(newvalue, 16)
    props.doSetMemory(addr, value)
    props.memory[addr] = value
    cell.textContent = newvalue
    cellValue.current = ""
  }

  const handleInput = (col: number, row: number, cell: HTMLTableCellElement) => {
    const newText = cell.textContent
    if (!newText) {
      return
    }
    const newvalue = newText.replace(/[^0-9a-f]/gi, "").toUpperCase().substring(0, 2)
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
      setNewValue(col, row, cell, newvalue)
      // Advance the selection to the next cell
      const table = cell.parentNode?.parentNode as HTMLTableElement
      const nrows = table.rows.length
      const ncols = table.rows[0].cells.length
      if (col < (ncols - 2)) {
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
  if (props.isHGR) {
    if ((hgrMagnifier[0] >= 0) &&
      (hgrMagnifierLocal.current[0] !== hgrMagnifier[0] ||
        hgrMagnifierLocal.current[1] !== hgrMagnifier[1])) {
      hgrMagnifierLocal.current[0] = hgrMagnifier[0]
      hgrMagnifierLocal.current[1] = hgrMagnifier[1]
      setTimeout(() => {
        const table = document.querySelector("#memory-table") as HTMLTableElement
        if (!table) return
        clearSelection(table)
        setSelection(hgrMagnifier, table)
        scrollHgrIntoView(table)
      }, 10)
    }
  } else {
    setTimeout(() => {
      const table = document.querySelector("#memory-table") as HTMLTableElement
      clearSelection(table)
    }, 10)
  }

  const width = props.isHGR ? 40 : 16
  const rows = convertMemoryToArray()
  const isEditable = (col: number, row: number) => {
    if (col === 0 || col === 17) return false
    if (!props.addressGetTable) return true
    const index = props.addressGetTable[Math.floor(row / 16)]
    return (index < 0x10000) || (index >= 0x17F00)
  }

  const applyHighlightAnimation = (element: HTMLElement) => {
    const isDarkMode = getTheme() == UI_THEME.DARK
    const animationName = isDarkMode ? "highlight-anim-dark" : "highlight-anim"
    element.style.animation = `${animationName} 1s 0.1s`
  }

  // This scrolling code is used by the higher-level MemoryDump component to
  // scroll to a specific row when the address field is changed.
  if (props.scrollRow >= 0) {
    const table = document.querySelector("#memory-table") as HTMLTableElement
    const row = table.rows[props.scrollRow + 1]
    if (row) {
      row.scrollIntoView({ block: "center", inline: "center" })
      applyHighlightAnimation(row)
      // Tried to also highlight the address column, but it does strange things
      // in HGR mode where it draws some of the columns on top of each other...
      //    applyHighlightAnimation(row.cells[0])
      setTimeout(() => {
        row.style.animation = ""
        // row.cells[0].style.animation = ''
      }, 2250)
    }
  }

  const cellClass = (col: number, row: number) => {
    if (col === 0) return "memtable-addr"
    if (col === 17) return ""
    const highlight = (props.highlight.includes(row * width + col - 1)) ? " memtable-highlight" : ""
    return (isEditable(col, row) ? "" : "memtable-readonly") + highlight
  }

  return (
    <table className="memtable" id="memory-table"
      style={{ cursor: props.pickWatchpoint ? "crosshair" : "default" }}
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
                className={cellClass(i, j)}>
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
