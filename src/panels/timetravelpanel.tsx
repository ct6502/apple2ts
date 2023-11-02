import React from "react";
import "./debugpanel.css"
import { handleGetMaxState,
  handleGetTimeTravelThumbnails,
  handleGetTempStateIndex, 
  passTimeTravelIndex} from "../main2worker";

class TimeTravelPanel extends React.Component<object, object>
{
  stateThumbRef = React.createRef<HTMLDivElement>()

  getTimeTravelThumbnails = () => {
    const maxState = handleGetMaxState()
    if (maxState < 1) return ''
    const thumbnails = handleGetTimeTravelThumbnails()
    let result = ''
    for (let i = 0; i < thumbnails.length; i++) {
      result += `${thumbnails[i].s6502.cycleCount}\n`
    }
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
          {index === iTempState ? <div className="highlightLine"></div> : <></>}
        </div>
        ))}
      </>
    }
    return (
      <div className="roundRectBorder">
        <p className="defaultFont panelTitle bgColor">Time Travel</p>
        <div ref={this.stateThumbRef} className="debugPanel"
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
