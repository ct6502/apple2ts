import React from "react";
import "./debugpanel.css"
import { handleGetMaxState,
  handleGetTimeTravelThumbnails,
  handleGetTempStateIndex, 
  passTimeTravelIndex} from "../main2worker";
import { toHex } from "../emulator/utility/utility";
const clock = 1020488

class TimeTravelPanel extends React.Component<object, object>
{
  stateThumbRef = React.createRef<HTMLDivElement>()
  prevThumbnails = ''

  convertTime(cycleCount: number) {
    const t = cycleCount / clock
    const min = Math.floor(t / 60)
    const sec = ("0" + (t - 60 * min).toFixed(2)).slice(-5)
    return `${("00" + min.toFixed()).slice(-3)}:${sec}`
  }

  getTimeTravelThumbnails = () => {
    const maxState = handleGetMaxState()
    if (maxState < 1) return ''
    const thumbnails = handleGetTimeTravelThumbnails()
    let result = ''
    for (let i = 0; i < thumbnails.length; i++) {
      const time = this.convertTime(thumbnails[i].s6502.cycleCount)
      result += `t=${time} c=${thumbnails[i].s6502.cycleCount} PC=${toHex(thumbnails[i].s6502.PC)}\n`
    }
    if (result !== this.prevThumbnails) {
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
    this.prevThumbnails = result
    return result
  }

  selectStateLine = (index: number) => {
    passTimeTravelIndex(index)
  }

  render() {
    const iTempState = handleGetTempStateIndex()
    let timeTravelThumbnails = <></>
    const thumb = this.getTimeTravelThumbnails().split('\n')
    if (thumb.length > 1) {
      timeTravelThumbnails = <>{thumb.map((line, index) => (
        <div key={index}
          id={index === iTempState ? "tempStateIndex" : ""}
          className="stateLine"
          onClick={() => this.selectStateLine(index)}>
          {line}
          {(index === iTempState) && <div className="highlightLine"></div>}
        </div>
        ))}
      </>
    }
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Time Travel</p>
        <div ref={this.stateThumbRef} className="debug-panel small-mono-text"
          style={{
            width: '330px', // Set the width to your desired value
            height: `150pt`, // Set the height to your desired value
            overflow: 'auto',
            cursor: 'pointer',
          }}>
          {timeTravelThumbnails}
        </div>
      </div>
    )
  }
}

export default TimeTravelPanel;
