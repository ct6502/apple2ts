import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { BreakpointMap, getBreakpointIcon, getBreakpointStyle } from "../../../common/breakpoint"
import { RUN_MODE, DISASSEMBLE_VISIBLE, toHex } from "../../../common/utility"
import { getPreferenceDebugTabLeftWidth, setPreferenceBreakpoints } from "../../localstorage"
import { handleGetRunMode, handleGetState6502, handleGetBreakpoints } from "../../main2worker"
import { getDisassemblyVisibleMode,
  getDisassembly, 
  setLinesVisible,
  ensureDisassemblyContainsAddress,
  setDisassemblyVisibleMode} from "./disassembly_utilities"
import { getChromacodedLine } from "./disassemblyview_singleline"
import React, { useEffect, useRef } from "react"
import { useGlobalContext } from "../../globalcontext"
import { useTranslation } from "../../../i18n/useTranslation"

type DisassemblyDivProps = {
  disassemblyRef: React.RefObject<HTMLDivElement | null>,
  hideFakePoint: () => void,
  setAllowScrollEvent: (value: boolean) => void,
  refresh: () => void,
  height: number
}

const DisassemblyDiv = (props: DisassemblyDivProps) => {
  const { t } = useTranslation()
  if (handleGetRunMode() !== RUN_MODE.PAUSED) {
    return <div className="noselect" style={{ marginTop: "30px", width: "24em" }}>{t("debug.pauseForDisassembly")}</div>
  }

  return <PausedDisassemblyDiv {...props} />
}

const PausedDisassemblyDiv = (props: DisassemblyDivProps) => {
  const { updateBreakpoint, setUpdateBreakpoint, setMemdumpAddress } = useGlobalContext()
  // const { refresh } = props
  const { t } = useTranslation()
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const scrollToRef = useRef<HTMLDivElement>(null)
  const lineHeightPx = 10 * (96 / 72)
  const nlines = Math.max(15, Math.floor(props.height / lineHeightPx + 0.5))
  setLinesVisible(nlines)

  const getAddress = (line: string) => {
    return parseInt(line, 16)//.slice(0, line.indexOf(":")), 16)
  }

  // This function gets used in disassemblyview_singleline but we
  // define it here so it can access our local variables.
  const onJumpClick = (addr: number) => {
    ensureDisassemblyContainsAddress(addr, true)
    props.refresh()
  }

  const onMemoryClick = (addr: number) => {
    setMemdumpAddress(addr)
    props.refresh()
  }

  const handleBreakpointClick = (event: React.MouseEvent<SVGSVGElement>) => {
    event.stopPropagation()
    const addr = parseInt(event.currentTarget.getAttribute("data-key") || "-1")
    const breakpoints = new BreakpointMap(handleGetBreakpoints())
    const bp = breakpoints.get(addr)
    if (bp) {
      if (bp.disabled) {
        bp.disabled = false
      } else {
        breakpoints.delete(addr)
      }
      setPreferenceBreakpoints(breakpoints)
      setUpdateBreakpoint(updateBreakpoint + 1)
    }
    props.hideFakePoint()
  }

  // Calculate approximate width in characters
  // For 7pt monospace at line-height 10pt: char width ≈ 0.6 * height = 0.6 * 9.33px ≈ 5.6px
  const containerWidth = Math.max(getPreferenceDebugTabLeftWidth(), 260) - 36
  const width = Math.floor(containerWidth / 5.6)
  
  const visibleMode = getDisassemblyVisibleMode()
  if (visibleMode === DISASSEMBLE_VISIBLE.CURRENT_PC) {
    ensureDisassemblyContainsAddress(handleGetState6502().PC, true)
  }
  const disArray = getDisassembly().split("\n").slice(0, nlines)
  const hasDisassembly = disArray.length > 1
  const lineTop = hasDisassembly ? getAddress(disArray[0]) : -1

  useEffect(() => {
    if (!hasDisassembly || getDisassemblyVisibleMode() === DISASSEMBLE_VISIBLE.RESET) {
      return
    }
    setDisassemblyVisibleMode(DISASSEMBLE_VISIBLE.RESET)
    if (scrollTimeoutRef.current !== null) {
      clearTimeout(scrollTimeoutRef.current)
    }
    scrollTimeoutRef.current = setTimeout(() => {
      if (props.disassemblyRef?.current && scrollToRef.current) {
        const container = props.disassemblyRef.current
        const line = scrollToRef.current
        props.setAllowScrollEvent(false)
        container.scrollTop += line.getBoundingClientRect().top - container.getBoundingClientRect().top
      }
    }, 40)
    return () => {
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasDisassembly, props.disassemblyRef, props.setAllowScrollEvent])

  if (!hasDisassembly) {
    return <div
    style={{
      position: "relative",
      width: "24em",
      top: "0px",
      height: `${nlines * 10 - 2}pt`,
    }}>
  </div>
  }

  // Put the breakpoints into an easier to digest array format.
  const bp: Array<Breakpoint> = []
  const breakpoints = handleGetBreakpoints()
  for (let i = 0; i < nlines; i++) {
    const bp1 = breakpoints.get(getAddress(disArray[i]))
    if (bp1 && !bp1.hidden) {
      bp[i] = bp1
    }
  }
  const pc1 = handleGetState6502().PC
  const lineBottom = (disArray[nlines - 1] !== "") ? getAddress(disArray[nlines - 1]) : 65535
  const topHalf = Array.from({ length: Math.floor(lineTop / 16) }, (_, i) => (i * 16))
  for (let i = topHalf[topHalf.length - 1] + 1; i < lineTop; i++) {
    topHalf.push(i)
  }
  const denseEnd = Math.min(lineBottom + 100, 65450)
  const bottomHalf: number[] = []
  for (let address = lineBottom + 1; address <= denseEnd; address++) {
    bottomHalf.push(address)
  }
  const strideStart = Math.max(lineBottom + 1, denseEnd + 1)
  for (let address = strideStart; address < 65450; address += 16) {
    bottomHalf.push(address)
  }
  for (let address = Math.max(65450, lineBottom + 1); address <= 65535; address++) {
    bottomHalf.push(address)
  }

  return <div style={{ width: "24em", lineHeight: "10pt" }}>
    {topHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
    {disArray.map((line, index) => (
      <div key={index}
        ref={index === 0 ? scrollToRef : null}
        style={{ position: "relative" }}
        className={getAddress(line) === pc1 ? "program-counter" : ""}>
        {(bp[index] && !bp[index].basic &&
          <FontAwesomeIcon icon={getBreakpointIcon(bp[index])}
            className={"breakpoint-position " + getBreakpointStyle(bp[index])}
            data-key={bp[index].address}
            onClick={handleBreakpointClick} />)}
        {getChromacodedLine(line, width, onJumpClick, onMemoryClick, t)}
      </div>
    ))}
    {bottomHalf.map((line) => (<div key={line}>{toHex(line, 4)}</div>))}
  </div>
}

export default DisassemblyDiv
