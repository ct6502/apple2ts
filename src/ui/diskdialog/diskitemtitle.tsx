// Renders a disk title that automatically shrinks its font size so the text

import { useLayoutEffect, useRef } from "react"

// fits within the fixed-size title box instead of being clipped.
export const DiskItemTitle = (props: {
  text: string,
  className: string,
  title: string,
  onMouseDown?: (e: React.MouseEvent<HTMLDivElement>) => void,
  onMouseUp?: (e: React.MouseEvent<HTMLDivElement>) => void,
}) => {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const fit = () => {
      // Start from the CSS-defined size and only shrink if it overflows.
      el.style.fontSize = ""
      const maxSize = parseFloat(window.getComputedStyle(el).fontSize)
      const minSize = 6
      let size = maxSize
      while (size > minSize && (el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight)) {
        size -= 0.5
        el.style.fontSize = `${size}px`
      }
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [props.text])

  return (
    <div
      ref={ref}
      className={props.className}
      title={props.title}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}>
      {props.text}
    </div>
  )
}
