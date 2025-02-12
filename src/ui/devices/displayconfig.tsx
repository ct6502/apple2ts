import React from "react";
import { ReactNode } from "react";
import { COLOR_MODE, colorToName } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDisplay,
} from "@fortawesome/free-solid-svg-icons";
import { handleGetColorMode, handleGetShowScanlines } from "../main2worker";
import { setPreferenceColorMode, setPreferenceShowScanlines } from "../localstorage";
import { getColorModeSVG, getShowScanlinesSVG } from "../img/iconfunctions";

export const DisplayConfig = (props: { updateDisplay: UpdateDisplay }) => {

  const colorMode = handleGetColorMode()
  const showScanlines = handleGetShowScanlines()

  const [droplistOpen, setDroplistOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setDroplistOpen(true);
  }

  const handleShowScanlinesClose = (index = -1) => {
    setDroplistOpen(false);
    if (index == 0) {
      document.body.style.setProperty("--scanlines-display", showScanlines ? "none" : "block");
      setPreferenceShowScanlines(!showScanlines)
      props.updateDisplay()
    }
  }

  const handleColorModeClose = (index: number) => {
    setDroplistOpen(false);
    if (index >= 0) {
      setPreferenceColorMode(index)
      props.updateDisplay()
    }
  }

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Display Settings"
        onClick={handleClick}
      >
        <span className="fa-layers fa-fw">
          <svg width="20" height="19">
            {getColorModeSVG(colorMode) as ReactNode}
            {getShowScanlinesSVG(showScanlines) as ReactNode}
          </svg>
          <FontAwesomeIcon icon={faDisplay} />
        </span>
      </button>
      {droplistOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleColorModeClose(-1)}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {Object.values(COLOR_MODE).filter(value=>typeof value==="number").map((i) => (
              <div className="droplist-option" style={{ padding: '5px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleColorModeClose(i)}>
                {(colorMode === i) ? '\u2714\u2009' : '\u2003'}{colorToName(i)}
              </div>))}
            <div style={{ borderTop: '1px solid #aaa', margin: '5px 0' }}></div>
            {[0].map((i) => (
              <div className="droplist-option" style={{ padding: '5px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleShowScanlinesClose(i)}>
                {(showScanlines) ? '\u2714\u2009' : '\u2003'}{"CRT Scanlines"}
              </div>))}
          </div>

        </div>
      }
    </span>
  )
}