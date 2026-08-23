import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react"

export const getControlRowScale = (
  availableWidth: number,
  contentWidth: number,
  maxScale = 1,
) => (
  contentWidth > 0 ? Math.max(0, Math.min(maxScale, availableWidth / contentWidth)) : maxScale
)

const FitControlRow = ({
  children,
  maxScale = 1,
  minHeight,
}: {
  children: ReactNode,
  maxScale?: number,
  minHeight: number,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const scaleRef = useRef(1)
  const [scale, setScale] = useState(1)

  useLayoutEffect(() => {
    const measure = () => {
      const container = containerRef.current
      const content = contentRef.current
      if (!container || !content) return
      const renderedWidth = content.getBoundingClientRect().width
      const naturalWidth = scaleRef.current > 0
        ? renderedWidth / scaleRef.current
        : renderedWidth
      const nextScale = getControlRowScale(container.clientWidth, naturalWidth, maxScale)
      scaleRef.current = nextScale
      setScale(nextScale)
    }

    measure()
    const resizeObserver = new ResizeObserver(measure)
    if (containerRef.current) resizeObserver.observe(containerRef.current)
    if (contentRef.current) resizeObserver.observe(contentRef.current)
    window.addEventListener("resize", measure)
    return () => {
      resizeObserver.disconnect()
      window.removeEventListener("resize", measure)
    }
  }, [maxScale])

  return <div ref={containerRef} className="desktop-control-strip" style={{
    minHeight,
  }}>
    <div ref={contentRef} className="desktop-control-fit-content" style={{
      "--desktop-control-scale": scale,
      "--desktop-control-inverse-scale": scale > 0 ? 1 / scale : 1,
    } as CSSProperties}>
      {children}
    </div>
  </div>
}

export default FitControlRow
