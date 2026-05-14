import "./panels.css"
import DisassemblyPanel from "./disassembly/disassemblypanel"
import TimeTravelPanel from "./timetravelpanel"
import State6502Controls from "./state6502controls"
import MemoryDump from "./memory/memorydump"
import BreakpointsView from "./breakpoints/breakpointsview"
import MemoryMap from "./memory/memorymap"
import StackDump from "./stackdump"
import { isMinimalTheme } from "../ui_settings"
import { useRef, useState, useEffect } from "react"
import { getPreferenceDebugTabLeftWidth, setPreferenceDebugTabLeftWidth } from "../localstorage"

const DebugTab = (props: { updateDisplay: UpdateDisplay }) => {

  if (isMinimalTheme()) {
    import("./panels.minimal.css")
  }

  const [leftWidth, setLeftWidth] = useState<number>(getPreferenceDebugTabLeftWidth())
  const [isDragging, setIsDragging] = useState(false)
  const leftColumnRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      let newWidth = e.clientX - containerRect.left
      
      // Set min and max width constraints
      if (newWidth < (containerRect.width - 260)) {
        // Reset to default (auto width) if below minimum threshold
        if (newWidth < 265) {
          newWidth = -1
        }
        setLeftWidth(newWidth)
        setPreferenceDebugTabLeftWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging])

  const handleMouseDown = () => {
    setIsDragging(true)
  }

  return (
    <div className="flex-column-gap debug-section">
      <State6502Controls />
      <div className="flex-row" ref={containerRef}>
        <div 
          className="flex-column" 
          ref={leftColumnRef}
          style={{ width: leftWidth > 0 ? `${leftWidth}px` : undefined, flexShrink: 0 }}
        >
          <DisassemblyPanel />
          <BreakpointsView updateDisplay={props.updateDisplay} />
        </div>
        <div 
          className="dragbar" 
          onMouseDown={handleMouseDown}
        />
        <div className="flex-column">
          <div className="flex-row-gap round-rect-border" id="tour-debug-info">
            <StackDump />
            <MemoryMap updateDisplay={props.updateDisplay} />
          </div>
          <MemoryDump />
          <TimeTravelPanel />
        </div>
      </div>
    </div>
  )
}

export default DebugTab
