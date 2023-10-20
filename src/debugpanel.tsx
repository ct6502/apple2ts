import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowRightToBracket as iconStepInto,
  faArrowsRotate as iconStepOver,
  faArrowUpFromBracket as iconStepOut,
} from "@fortawesome/free-solid-svg-icons";
import { handleGetDebugDump, handleGetDisassembly } from "./main2worker";
import { useRef, useState } from "react";

// const handleDisassembleAddressChange = (addr: number) => {
//   passSetDisassembleAddress(addr)
// };

const DebugPanel = (props: DebugProps) => {
  const textRef = useRef<HTMLDivElement>(null)
//  const [address, setAddress] = useState(0);
  const [lineOffset, setLineOffset] = useState(0)
  let lineHeight = 13.3333 // 10 * (96 / 72) pixels

  const handleBreakpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = e.target.value.replace(/[^0-9a-f]/gi, '');
    props.handleBreakpoint(result)
  }

  const computeLineHeight = () => {
    if (textRef && textRef.current) {
      const nlines = handleGetDisassembly().split('\n').length
      lineHeight = (textRef.current.scrollHeight - 4) / nlines
    }
  }

  const handleScroll = () => {
    // Your scroll event handling code here
    if (textRef && textRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const newLineOffset = Math.floor(textRef.current.scrollTop / lineHeight)
      console.log(`${lineOffset}, ${newLineOffset}, ${textRef.current.scrollHeight}`)
//      textRef.current.scrollTop = 1000
      setLineOffset(newLineOffset)
    }
  }

  const handleDebugClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (textRef && textRef.current) {
      if (lineHeight === 0) computeLineHeight()
      const divRect = event.currentTarget.getBoundingClientRect()
//      const clickX = event.clientX - divRect.left
      const clickY = event.clientY - divRect.top + textRef.current.scrollTop - 2
      const line = Math.floor(clickY / lineHeight)
      const lines = handleGetDisassembly().split('\n')
      console.log(`cy=${event.clientY} drt=${divRect.top} tcs=${textRef.current.scrollTop} lineHeight=${lineHeight} clickY=${clickY} line=${line} ${lines[line]}`)
//      console.log(`Click position - X: ${clickX}, Y: ${clickY}`);
    }
  }

  return (
    <div className="controlBar">
      <span>
        <span>
          <input
            type="text"
            placeholder=""
            value={props.breakpoint}
            onChange={handleBreakpointChange}
          />
          <button className="pushButton"
            title={"Step Into"}
            onClick={props.handleStepInto}>
            <FontAwesomeIcon icon={iconStepInto} className="fa-rotate-90 icon"/>
          </button>
          <button className="pushButton"
            title={"Step Over"}
            onClick={props.handleStepOver}>
            <span className="fa-stack small icon">
            <FontAwesomeIcon icon={iconStepOut} className="cropTop fa-stack-2x icon"/>
            <FontAwesomeIcon icon={iconStepOver} className="cropBottom fa-stack-2x icon"/>
            </span>
          </button>
          <button className="pushButton"
            title={"Step Out"}
            onClick={props.handleStepOut}>
            <FontAwesomeIcon icon={iconStepOut} className="icon"/>
          </button>
        </span>
        <br/>
        <div className="scrollable-text debugPanel"
          ref={textRef}
          onScroll={handleScroll}
          onClick={handleDebugClick}
          style={{
            width: '250px', // Set the width to your desired value
            height: '350pt', // Set the height to your desired value
            overflow: 'auto'
          }} >
          {handleGetDisassembly()}
        </div>
      </span>
      <span>
        <div className="scrollable-text debugPanel">
          {handleGetDebugDump()}
        </div>
      </span>
    </div>
  )
}

export default DebugPanel;
