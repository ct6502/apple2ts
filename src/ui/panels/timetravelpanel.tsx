import React, { useRef } from "react"
import {
  handleGetTimeTravelThumbnails,
  handleGetTempStateIndex,
  passTimeTravelIndex,
  passSetRunMode
} from "../main2worker"
import { RUN_MODE, toHex } from "../../common/utility"
const clock = 1020488

const TimeTravelPanel = () => {
  const stateThumbRef = useRef(null)

  const convertTime = (cycleCount: number) => {
    const t = cycleCount / clock
    const min = Math.floor(t / 60)
    const sec = ("0" + (t - 60 * min).toFixed(2)).slice(-5)
    return `${("00" + min.toFixed()).slice(-3)}:${sec}`
  }

  const getTimeTravelThumbnails = () => {
    const iTempState = handleGetTempStateIndex()
    const thumbnails = handleGetTimeTravelThumbnails()
    let thumbnailText = ""
    const thumbImg = (iTempState >= 0 && thumbnails.length > 0) ?
      `${thumbnails[Math.min(iTempState, thumbnails.length - 1)].thumbnail}` : ""
    // The 170px is the width of the thumbnail images.
    const thumbImage = (thumbImg != "") ? <img src={thumbImg} /> : <div style={{width: "170px"}}></div>
    for (let i = 0; i < thumbnails.length; i++) {
      const time = convertTime(thumbnails[i].s6502.cycleCount)
      thumbnailText += `t=${time} PC=${toHex(thumbnails[i].s6502.PC)}\n`
    }
    // Make sure our new snapshot is visible in the scroll range
    setTimeout(() => {
      const lineToScrollTo = document.getElementById("tempStateIndex")
      if (lineToScrollTo && stateThumbRef && stateThumbRef.current) {
        const div: HTMLDivElement = stateThumbRef.current
        // Calculate the scroll position to make the paragraph visible
        const containerRect = div.getBoundingClientRect()
        const targetRect = lineToScrollTo.getBoundingClientRect()
        const isTargetAboveViewport = targetRect.top < containerRect.top
        const isTargetBelowViewport = targetRect.bottom > containerRect.bottom
        if (isTargetAboveViewport || isTargetBelowViewport) {
          const scrollTop = targetRect.top - containerRect.top + div.scrollTop
          div.scrollTop = scrollTop
        }
      }
    }, 50)
    return { iTempState, thumbnailStrings: thumbnailText.split("\n"), thumbImage }
  }

  const selectStateLine = (index: number) => {
    passTimeTravelIndex(index)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault()  // suppress normal scroll events
      const iTempState = handleGetTempStateIndex()
      const thumbnails = handleGetTimeTravelThumbnails()
      let index = iTempState
      const delta = e.metaKey ? 100 : (e.ctrlKey ? 10 : 1)
      index = (e.key === "ArrowUp") ? index - delta : index + delta
      index = Math.max(0, Math.min(thumbnails.length - 1, index))
      if (index !== iTempState) {
        passTimeTravelIndex(index)
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      passSetRunMode(RUN_MODE.RUNNING)
    }
  }

  let timeTravelThumbnails = <></>
  const { iTempState, thumbnailStrings, thumbImage } = getTimeTravelThumbnails()

  if (thumbnailStrings.length > 1) {
    timeTravelThumbnails = <>{thumbnailStrings.map((line, index) => (
      <div key={index}
        id={index === iTempState ? "tempStateIndex" : ""}
        className="stateLine"
        onClick={() => selectStateLine(index)}>
        {line}
        {(index === iTempState) && <div className="highlight-line"></div>}
      </div>
    ))}
    </>
  }

  // Need to set tabIndex={-1} on the div to get onKeyDown to work.
  // Could change to tabIndex={0} to make the div part of the tab order.
  return (
    <div className="round-rect-border short-panel">
      <div className="bigger-font column-gap">Time Travel Snapshots</div>
      <div className="flex-row">
        <div ref={stateThumbRef} className="thin-border debug-panel mono-text"
          onKeyDown={(e) => handleKeyDown(e)}
          tabIndex={-1}
          style={{
            width: "15em",
            height: "102pt",
            overflow: "auto",
            cursor: "pointer",
            userSelect: "none",
          }}>
          {timeTravelThumbnails}
        </div>
        <div
          style={{
            marginTop: "5px",
            marginLeft: "5px",
          }}>
          {thumbImage}
        </div>
      </div>
    </div>
  )
}

export default TimeTravelPanel
