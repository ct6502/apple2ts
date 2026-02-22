import { EditorView, gutter, GutterMarker } from "@codemirror/view"
import { BreakpointMap, BreakpointNew } from "../../common/breakpoint"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCircle as iconBreakpointEnabled } from "@fortawesome/free-solid-svg-icons"
import { faCircle as iconBreakpointDisabled } from "@fortawesome/free-regular-svg-icons"
import { renderToString } from "react-dom/server"
import { handleGetBreakpoints } from "../main2worker"

/**
 * Extract the BASIC line number from a line of code
 * Returns -1 if no line number is found
 */
const extractBasicLineNumber = (lineText: string): number => {
  const match = lineText.trim().match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : -1
}

/**
 * Get BASIC line number for a given editor line (1-based)
 */
export const getBasicLineNumber = (view: EditorView, editorLine: number): number => {
  try {
    const line = view.state.doc.line(editorLine)
    return extractBasicLineNumber(line.text)
  } catch {
    return -1
  }
}

/**
 * Find the editor line (1-based) for a given BASIC line number
 * Returns -1 if not found
 */
export const findEditorLineForBasicLine = (view: EditorView, line: number): number => {
  const doc = view.state.doc
  for (let i = 1; i <= doc.lines; i++) {
    const lineText = doc.line(i).text
    const lineNum = extractBasicLineNumber(lineText)
    if (lineNum === line) {
      return i
    }
  }
  return -1
}

// Breakpoint gutter marker class
class BreakpointMarker extends GutterMarker {
  constructor(public disabled: boolean, public debugInfo?: string) {
    super()
  }

  toDOM() {
    const icon = this.disabled ? iconBreakpointDisabled : iconBreakpointEnabled
    const className = this.disabled ? "cm-breakpoint-marker-disabled" : "cm-breakpoint-marker-enabled"
    
    const iconHtml = renderToString(
      <FontAwesomeIcon 
        icon={icon} 
        className={className}
        style={{ 
          cursor: "pointer", 
          fontSize: "0.9em",
          color: this.disabled ? "#888" : "#ff4444"
        }} 
      />
    )
    
    const span = document.createElement("span")
    span.innerHTML = iconHtml
    span.className = "cm-breakpoint-gutter"
    span.setAttribute("data-basic-line", this.debugInfo || "unknown")
    return span
  }

  eq(other: BreakpointMarker) {
    return this.disabled === other.disabled && this.debugInfo === other.debugInfo
  }
}

// Dummy marker to force CodeMirror to measure all lines
// Without this, markers on early lines render at incorrect positions
class DummyMarker extends GutterMarker {
  toDOM() {
    const span = document.createElement("span")
    span.style.display = "none"
    return span
  }

  eq() {
    return true
  }
}

const dummyMarkerInstance = new DummyMarker()

/**
 * Create the breakpoint gutter extension
 * @param onToggle Callback when a breakpoint is toggled, receives the BASIC line number
 */
export const createBreakpointGutter = (
  onToggle: (line: number) => void
) => {
  return gutter({
    class: "cm-breakpoint-gutter",
    lineMarker: (view, lineBlock) => {
      const lineObj = view.state.doc.lineAt(lineBlock.from)
      const lineNumber = lineObj.number
      const lastLine = view.state.doc.lines
      const basicLineNum = extractBasicLineNumber(lineObj.text)
      
      // Check for real breakpoints first
      if (basicLineNum >= 0) {
        const breakpoints = handleGetBreakpoints()
        const breakpoint = breakpoints.get(basicLineNum)
        
        if (breakpoint && !breakpoint.hidden && breakpoint.basic) {
          const debugInfo = `editor-line-${lineNumber}-basic-${basicLineNum}-pos-${lineBlock.from}`
          return new BreakpointMarker(breakpoint.disabled, debugInfo)
        }
      }
      
      // Always add a dummy marker to the last line to force CodeMirror to measure all lines
      // Without this, markers on earlier lines appear at incorrect positions
      if (lineNumber === lastLine) {
        return dummyMarkerInstance
      }
      
      return null
    },
    domEventHandlers: {
      click: (view, line) => {
        const lineObj = view.state.doc.lineAt(line.from)
        const basicLineNum = extractBasicLineNumber(lineObj.text)
        
        if (basicLineNum >= 0) {
          onToggle(basicLineNum)
          return true
        }
        return false
      }
    }
  })
}

/**
 * Toggle a breakpoint for a BASIC line number
 * @param breakpoints Current breakpoint map
 * @param line BASIC line number (e.g., 10, 20, 30)
 * @returns Updated breakpoint map
 */
export const toggleBreakpoint = (breakpoints: BreakpointMap, line: number): BreakpointMap => {
  const newBreakpoints = new BreakpointMap(breakpoints)
  const existing = newBreakpoints.get(line)
  
  if (existing) {
    // If breakpoint exists, toggle disabled state or remove it
    if (existing.disabled) {
      // Re-enable it
      existing.disabled = false
      existing.basic = true
      newBreakpoints.set(line, existing)
    } else {
      // Alternative: remove entirely
      newBreakpoints.delete(line)
    }
  } else {
    // Create new breakpoint
    const bp = BreakpointNew()
    bp.address = line
    bp.basic = true
    newBreakpoints.set(line, bp)
  }
  
  return newBreakpoints
}

/**
 * Remove a breakpoint for a BASIC line number
 */
export const removeBreakpoint = (breakpoints: BreakpointMap, line: number): BreakpointMap => {
  const newBreakpoints = new BreakpointMap(breakpoints)
  newBreakpoints.delete(line)
  return newBreakpoints
}

/**
 * Theme extension for breakpoint styling
 */
export const breakpointTheme = EditorView.theme({
  ".cm-breakpoint-gutter": {
    width: "1.5em",
    minimumWidth: "1.5em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer"
  },
  ".cm-breakpoint-marker-enabled": {
    color: "#ff4444"
  },
  ".cm-breakpoint-marker-disabled": {
    color: "#888"
  },
  ".cm-gutter.cm-breakpoint-gutter": {
    minimumWidth: "1.5em",
    backgroundColor: "transparent",
    borderRight: "1px solid #444"
  }
})
