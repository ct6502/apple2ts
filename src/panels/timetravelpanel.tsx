import React from "react";
import {
  handleGetTimeTravelThumbnails,
  handleGetTempStateIndex,
  passTimeTravelIndex,
  passSetRunMode
} from "../main2worker";
import { RUN_MODE, toHex } from "../emulator/utility/utility";
const clock = 1020488

class TimeTravelPanel extends React.Component<object, object>
{
  stateThumbRef = React.createRef<HTMLDivElement>()
  prevThumbnails = ''
  prevTempState = 0

  convertTime(cycleCount: number) {
    const t = cycleCount / clock
    const min = Math.floor(t / 60)
    const sec = ("0" + (t - 60 * min).toFixed(2)).slice(-5)
    return `${("00" + min.toFixed()).slice(-3)}:${sec}`
  }

  getTimeTravelThumbnails = () => {
    const iTempState = handleGetTempStateIndex()
    const thumbnails = handleGetTimeTravelThumbnails()
    let thumbnailText = ''
    const thumbImage = (iTempState >= 0 && iTempState < thumbnails.length) ?
      <img src={`${thumbnails[iTempState].thumbnail}`} /> : <></>
    for (let i = 0; i < thumbnails.length; i++) {
      const time = this.convertTime(thumbnails[i].s6502.cycleCount)
      thumbnailText += `t=${time} PC=${toHex(thumbnails[i].s6502.PC)}\n`
    }
    if (thumbnailText !== this.prevThumbnails || iTempState !== this.prevTempState) {
      this.prevTempState = iTempState
      setTimeout(() => {
        const lineToScrollTo = document.getElementById('tempStateIndex')
        if (lineToScrollTo && this.stateThumbRef && this.stateThumbRef.current) {
          // Calculate the scroll position to make the paragraph visible
          const containerRect = this.stateThumbRef.current.getBoundingClientRect()
          const targetRect = lineToScrollTo.getBoundingClientRect()
          const isTargetAboveViewport = targetRect.top < containerRect.top;
          const isTargetBelowViewport = targetRect.bottom > containerRect.bottom;
          if (isTargetAboveViewport || isTargetBelowViewport) {
            const scrollTop = targetRect.top - containerRect.top + this.stateThumbRef.current.scrollTop
            this.stateThumbRef.current.scrollTop = scrollTop
          }
        }
      }, 50)
    }
    this.prevThumbnails = thumbnailText
    return { iTempState, thumbnailStrings: thumbnailText.split('\n'), thumbImage }
  }

  selectStateLine = (index: number) => {
    passTimeTravelIndex(index)
  }

  handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()  // suppress normal scroll events
      const iTempState = handleGetTempStateIndex()
      const thumbnails = handleGetTimeTravelThumbnails()
      let index = iTempState
      const delta = e.metaKey ? 100 : (e.ctrlKey ? 10 : 1)
      index = (e.key === 'ArrowUp') ? index - delta : index + delta
      index = Math.max(0, Math.min(thumbnails.length - 1, index))
      if (index !== iTempState) {
        passTimeTravelIndex(index)
      }
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      passSetRunMode(RUN_MODE.RUNNING)
    }
  }

  render() {
    let timeTravelThumbnails = <></>
    const { iTempState, thumbnailStrings, thumbImage } = this.getTimeTravelThumbnails()
    if (thumbnailStrings.length > 1) {
      timeTravelThumbnails = <>{thumbnailStrings.map((line, index) => (
        <div key={index}
          id={index === iTempState ? "tempStateIndex" : ""}
          className="stateLine"
          onClick={() => this.selectStateLine(index)}>
          {line}
          {(index === iTempState) && <div className="highlight-line"></div>}
        </div>
      ))}
      </>
    }
    // Need to set tabIndex={-1} on the div to get onKeyDown to work.
    // Could change to tabIndex={0} to make the div part of the tab order.
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Time Travel Snapshots</p>
        <div className="flex-row">
          <div ref={this.stateThumbRef} className="thinBorder debug-panel"
            onKeyDown={(e) => this.handleKeyDown(e)}
            tabIndex={-1}
            style={{
              width: '15em',
              height: `138pt`,
              overflow: 'auto',
              cursor: 'pointer',
              userSelect: 'none',
            }}>
            {timeTravelThumbnails}
          </div>
          <div
            style={{
              marginTop: '30px',
              marginLeft: '5px',
            }}>
            {thumbImage}
          </div>
        </div>
      </div>
    )
  }
}

export default TimeTravelPanel;
