import { useRef } from "react"

const ScrollBar = (props:
  {
    height: number,
    lineAtTop: number,
    maxLines: number,
    nlines: number,
    setLineAtTop: (line: number) => void
  }) => {
  const scrollRef = useRef<HTMLDivElement>(null)
  const scrollPos = props.lineAtTop / props.maxLines * (props.height - 8)
  const handleHeight = 11

  const mouseDown = (event: React.MouseEvent) => {
    const div = scrollRef.current as HTMLDivElement
    const rect = div.getBoundingClientRect()
    const ypos = event.clientY - rect.top
    if (ypos < scrollPos) {
      const line = Math.max(0, props.lineAtTop - props.nlines)
      props.setLineAtTop(line)
    } else if (ypos > scrollPos + handleHeight) {
      const line = Math.min(props.maxLines, props.lineAtTop + props.nlines)
      props.setLineAtTop(line)
    } else {
      const handleDrag = (event: MouseEvent) => {
        const ypos = event.clientY - rect.top
        const line = Math.max(0, Math.round(props.maxLines * ypos / props.height))
        props.setLineAtTop(line)
      }
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleDrag)
        document.removeEventListener("mouseup", handleMouseUp)
      }
      document.addEventListener("mousemove", handleDrag)
      document.addEventListener("mouseup", handleMouseUp)
    }
    // prevent the default behavior of selecting text
    event.preventDefault()
  }

  return (
    <div
      style={{height: `${props.height}px`,
        paddingBottom: "0px",
        borderBottom: "0px",
        backgroundColor: "white",
        width: "11px"}}
      ref={scrollRef}
      onMouseDown={mouseDown}>
      <div
        style={{height: `${handleHeight}px`,
          width: "9px",
          marginLeft: "1px",
          borderRadius: "4px",
          backgroundColor: "green",
          position: "relative",
          top: `${scrollPos}px`}}>
      </div>
    </div>
  )
}

export default ScrollBar
