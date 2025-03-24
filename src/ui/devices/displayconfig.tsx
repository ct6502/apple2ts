import React from "react"
import { ReactNode } from "react"
import { COLOR_MODE, colorToName } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDisplay,
} from "@fortawesome/free-solid-svg-icons"
import { handleGetColorMode, handleGetShowScanlines } from "../main2worker"
import { setPreferenceColorMode, setPreferenceShowScanlines } from "../localstorage"
import { getColorModeSVG, getShowScanlinesSVG } from "../img/iconfunctions"
import PopupMenu from "../controls/popupmenu"

export const DisplayConfig = (props: { updateDisplay: UpdateDisplay }) => {

  const colorMode = handleGetColorMode()
  const showScanlines = handleGetShowScanlines()
  const [popupLocation, setPopupLocation] = React.useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const handleShowScanlinesClose = (index: number = -1) => () => {
    setPopupLocation(undefined)
    if (index == 0) {
      document.body.style.setProperty("--scanlines-display", showScanlines ? "none" : "block")
      setPreferenceShowScanlines(!showScanlines)
      props.updateDisplay()
    }
  }

  const handleColorModeClose = (index: number) => () => {
    setPopupLocation(undefined)
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

      <PopupMenu
        location={popupLocation}
        menuItems={[
          ...Object.values(COLOR_MODE).filter(value=>typeof value==="number").map((i) => (
            {
              label: colorToName(i),
              index: i,
              isSelected: (selectedIndex: number) => { return colorMode === selectedIndex },
              onClick: handleColorModeClose
            }
          )),
          ...[{ label: "-" }],
          ...[0].map((i) => (
            {
              label: "CRT Scanlines",
              index: i,
              isSelected: () => { return showScanlines },
              onClick: handleShowScanlinesClose
            }
          ))
        ]}
        onClick={handleColorModeClose}
      />
    </span>
  )
}