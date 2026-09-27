import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { hiresLineToAddress, toHex, UI_THEME } from "../../../common/utility"
import { useGlobalContext } from "../../globalcontext"
import { nColsHgrMagnifier, nRowsHgrMagnifier } from "../../graphics"
import { getTheme } from "../../ui_settings"

// Rows rendered beyond the visible area, so scrolling doesn't reveal blank gaps.
const OVERSCAN_ROWS = 12

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
  const { hgrMagnifierLoc: hgrMagnifierLoc, setHgrMagnifierLoc: setHgrMagnifierLoc,
    setUpdateHgrMagnifier: setUpdateHgrMagnifier } = useGlobalContext()
  const hgrMagnifierLocal = useRef([-1, -1])
  const cellValue = useRef("")
  const isLandscape = (window.innerWidth > window.innerHeight)
  const height = isLandscape ? Math.max((window.innerHeight - 647), 100) : 250

  const nrows = props.isHGR ? 192 : 4096
  const ncols = props.isHGR ? 40 : 16
  // Address column + hex columns + the ASCII column (which HGR mode omits).
  const tableColumns = ncols + 1 + (props.isHGR ? 0 : 1)

  const tableRef = useRef<HTMLTableElement>(null)
  const [rowHeight, setRowHeight] = useState(14)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(height)

  // The table is its own scroll container (.memtable is display:block; overflow:auto),
  // so measure it directly. Both setState calls are guarded, so this can't loop.
  useLayoutEffect(() => {
    const table = tableRef.current
    if (!table) return
    if (table.clientHeight !== viewportHeight) setViewportHeight(table.clientHeight)
    const probe = table.querySelector<HTMLTableRowElement>("tr[data-row]")
    if (probe) {
      const measured = probe.getBoundingClientRect().height
      if (measured > 0 && Math.abs(measured - rowHeight) > 0.5) setRowHeight(measured)
    }
  }, [scrollTop, viewportHeight, rowHeight, props.isHGR])

  // Only these rows get built and mounted.
  let firstRow = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN_ROWS)
  const lastRow = Math.min(nrows, Math.ceil((scrollTop + viewportHeight) / rowHeight) + OVERSCAN_ROWS)
  firstRow = Math.min(firstRow, Math.max(0, lastRow - 1))

  const handleScroll = (e: React.UIEvent<HTMLTableElement>) => {
    const el = e.currentTarget
    const nextFirst = Math.max(0, Math.floor(el.scrollTop / rowHeight) - OVERSCAN_ROWS)
    // Skip re-rendering while the window hasn't actually shifted.
    if (nextFirst !== firstRow || el.clientHeight !== viewportHeight) {
      setScrollTop(el.scrollTop)
      setViewportHeight(el.clientHeight)
    }
  }

  const findRenderedRow = (table: HTMLTableElement, row: number) =>
    table.querySelector<HTMLTableRowElement>(`tr[data-row="${row}"]`)

  // A row outside the window isn't mounted, so move the scroll position to bring it
  // into range and then run the action once the re-render has landed. Callers pass a
  // <tbody>, which isn't the scroll container - always use the table ref for that.
  const withRenderedRow = (row: number, fn: (tr: HTMLTableRowElement) => void) => {
    const table = tableRef.current
    if (!table) return
    const rendered = findRenderedRow(table, row)
    if (rendered) {
      fn(rendered)
      return
    }
    const maxScroll = Math.max(0, rowHeight * nrows - table.clientHeight)
    table.scrollTop = Math.max(0, Math.min(row * rowHeight - table.clientHeight / 2, maxScroll))
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const current = tableRef.current
      const late = current ? findRenderedRow(current, row) : null
      if (late) fn(late)
    }))
  }

  const applyHighlightAnimation = (element: HTMLElement) => {
    const isDarkMode = getTheme() == UI_THEME.DARK
    const animationName = isDarkMode ? "highlight-anim-dark" : "highlight-anim"
    element.style.animation = `${animationName} 3s 0.5s`
  }

  const clearSelection = (table: HTMLTableElement) => {
    table?.querySelectorAll("td.selected").forEach((cell) => cell.classList.remove("selected"))
  }

  const setSelection = (offset: number[], table: HTMLTableElement) => {
    for (let row = offset[1]; row < offset[1] + nRowsHgrMagnifier; row++) {
      const tr = findRenderedRow(table, row)
      if (!tr) continue
      for (let i = offset[0] + 1; i <= offset[0] + nColsHgrMagnifier; i++) {
        tr.cells[i]?.classList.add("selected")
      }
    }
  }

  // Make sure we keep our selection up to date, especially if it was changed
  // by clicking on the canvas.
  useEffect(() => {

    // // This scrolling code is used with the HGR mode, where we want to scroll
    // // both vertically and horizontally to keep the HGR selection box in view.
    // const scrollHgrIntoView = (table: HTMLTableElement) => {
    //   const cell1 = table.rows[hgrMagnifierLoc[1] + 1].cells[hgrMagnifierLoc[0] + 1]
    //   const cell2 = table.rows[hgrMagnifierLoc[1] + nRowsHgrMagnifier].cells[hgrMagnifierLoc[0] + 2]
    //   if (cell1 && cell2) {
    //     const r1 = cell1.getBoundingClientRect()
    //     const r2 = cell2.getBoundingClientRect()
    //     const tr = table.getBoundingClientRect()
    //     const f = 10
    //     const isInView = (r1.left - 4 * f) >= tr.left && (r1.top - f) >= tr.top &&
    //       (r2.right + f) <= tr.right && (r2.bottom + f) <= tr.bottom
    //     if (!isInView) {
    //       cell1.scrollIntoView({ block: "center", inline: "center" })
    //     }
    //   }
    // }

    if (props.isHGR) {
      if (hgrMagnifierLoc[0] < 0) return
      const locChanged = hgrMagnifierLocal.current[0] !== hgrMagnifierLoc[0] ||
        hgrMagnifierLocal.current[1] !== hgrMagnifierLoc[1]
      // The selection is applied to mounted cells, so re-apply it when the window shifts.
      const windowChanged = hgrMagnifierLocal.current[2] !== firstRow
      if (!locChanged && !windowChanged) return
      hgrMagnifierLocal.current = [hgrMagnifierLoc[0], hgrMagnifierLoc[1], firstRow]
      setTimeout(() => {
        const table = document.querySelector("#memory-table") as HTMLTableElement
        if (!table) return
        clearSelection(table)
        setSelection(hgrMagnifierLoc, table)
        // scrollHgrIntoView(table)
      }, 10)
    } else {
      setTimeout(() => {
        const table = document.querySelector("#memory-table") as HTMLTableElement
        clearSelection(table)
      }, 10)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hgrMagnifierLoc, props.isHGR, firstRow])

  // MemoryDump sets scrollRow to scroll to (and flash) a specific row. This has to be
  // an effect rather than render-time code because it touches the table ref.
  useEffect(() => {
    if (props.scrollRow < 0) return
    withRenderedRow(props.scrollRow, (row) => {
      row.scrollIntoView({ block: "center", inline: "nearest" })
      applyHighlightAnimation(row)
      // Tried to also highlight the address column, but it does strange things
      // in HGR mode where it draws some of the columns on top of each other...
      //    applyHighlightAnimation(row.cells[0])
      setTimeout(() => {
        row.style.animation = ""
        // row.cells[0].style.animation = ''
      }, 3500)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.scrollRow])

  if (props.memory.length <= 1) return <div
      style={{ height: `${height}px` }}>
    </div>

  const convertByteToAscii = (byte: number) => {
    if (props.highAscii) byte &= 0x7F
    if (byte < 32 || byte > 126) return "·" // Non-printable
    return String.fromCharCode(byte)
  }

  // Only builds the rows currently in (or near) the viewport.
  const convertMemoryToArray = (from: number, to: number) => {
    const rows: string[][] = []
    for (let l = from; l < to; l++) {
      const addr = props.isHGR ?
        (hiresLineToAddress(props.offset, l) - props.offset) : 16 * l
      const mem = props.memory.slice(addr, addr + ncols)
      const cells = new Array<string>(ncols + 1)
      cells[0] = toHex(props.isHGR ? addr + props.offset : addr, 4) + ":"
      let ascii = ""
      for (let b = 0; b < ncols; b++) {
        cells[b + 1] = toHex(mem[b])
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
    const row = cell.parentNode as HTMLTableRowElement | null
    const table = row?.parentNode?.parentNode as HTMLTableElement | undefined
    if (table && row) {
      // Spacer rows have no data-row, so clicks on them are ignored.
      const rawRow = Number(row.dataset.row)
      if (Number.isNaN(rawRow)) return [-1, -1]
      const headerCols = table.rows[0]?.cells.length ?? (ncols + 1)
      // Subtract 1 to get rid of the address column.
      const rawCol = Array.from(row.children).indexOf(cell) - 1
      let cellIndex = -1
      let rowIndex = -1
      if (props.isHGR) {
        cellIndex = Math.min(rawCol, ncols - nColsHgrMagnifier)
        rowIndex = Math.min(rawRow, nrows - nRowsHgrMagnifier)
      } else {
        cellIndex = Math.min(rawCol, headerCols - 3)
        rowIndex = Math.min(rawRow, nrows - 8)
      }
      if (rowIndex >= 0 && cellIndex >= 0) {
        return [cellIndex, rowIndex]
      }
    }
    return [-1, -1]
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
      setHgrMagnifierLoc(offset)
      setUpdateHgrMagnifier(true)
    }
  }

  const onMouseOver = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      onMouseDown(e)
    }
  }

  const getVisibleRows = () => {
    const top = Math.max(0, Math.floor(scrollTop / rowHeight))
    const bottom = Math.min(nrows - 1, Math.ceil((scrollTop + viewportHeight) / rowHeight) - 1)
    return { top, bottom }
  }

  props.doGetVisibleRows(getVisibleRows)

  const setNewFocus = (col: number, row: number) => {
    withRenderedRow(row, (tr) => {
      (tr.cells[col] as HTMLElement | undefined)?.focus()
    })
  }

  const handleKeyDown = (col: number, row: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    // Use arrow keys to move from cell to cell
    const lastCol = ncols
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
          col = lastCol
        } else {
          return
        }
      } else if (e.key === "ArrowRight") {
        if (col <= (lastCol - 1)) {
          col++
        } else if (row < (nrows - 1)) {
          row++
          col = 1
        } else {
          return
        }
      }
      setNewFocus(col, row)
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
      if (col < (lastCol - 1)) {
        col++
        setNewFocus(col, row)
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
      const lastCol = ncols
      if (col <= (lastCol - 1)) {
        col++
      } else if (row < (nrows - 1)) {
        row++
        col = 1
      }
      setNewFocus(col, row)
    }
  }

  // Make sure we keep our selection up to date, especially if it was changed
  // by clicking on the canvas.
  // (useEffect moved above early return to satisfy rules-of-hooks)

  const width = ncols
  const rows = convertMemoryToArray(firstRow, lastRow)
  // Blank filler rows keep the scrollbar proportional to the full table.
  const topSpacerHeight = firstRow * rowHeight
  const bottomSpacerHeight = Math.max(0, (nrows - lastRow) * rowHeight)
  const isEditable = (col: number, row: number) => {
    if (col === 0 || col === (width + 1)) return false
    if (!props.addressGetTable) return true
    const index = props.addressGetTable[Math.floor(row / width)]
    return (index < 0x10000) || (index >= 0x17F00)
  }

  const cellClass = (col: number, row: number) => {
    if (col === 0) return "memtable-addr"
    if (col === 17) return ""
    const highlight = (props.highlight.includes(row * width + col - 1)) ? " memtable-highlight" : ""
    return (isEditable(col, row) ? "" : "memtable-readonly") + highlight
  }

  return (
    <table className="memtable" id="memory-table"
      ref={tableRef}
      style={{ cursor: props.pickWatchpoint ? "crosshair" : "default",
        lineHeight: "10pt", height: `${height}px` }}
      onScroll={handleScroll}
      onMouseDown={onMouseDown}
      onMouseOver={onMouseOver}>
      <thead>
        <tr>
          <th style={{ position: "sticky", top: "0", left: "0", zIndex: "2" }}></th>
          {Array.from({ length: width }, (_, i) => <th className="memtable-hex" key={i}>{toHex(i, 2)}</th>)}
        </tr>
      </thead>
      <tbody>
        {topSpacerHeight > 0 && <tr key="top-spacer" style={{ height: `${topSpacerHeight}px` }}>
          <td colSpan={tableColumns} />
        </tr>}
        {rows.map((row, i) => {
          const j = firstRow + i
          return (
            <tr key={j} data-row={j}>
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
          )
        })}
        {bottomSpacerHeight > 0 && <tr key="bottom-spacer" style={{ height: `${bottomSpacerHeight}px` }}>
          <td colSpan={tableColumns} />
        </tr>}
      </tbody>
    </table>
  )
}

export default MemoryTable
