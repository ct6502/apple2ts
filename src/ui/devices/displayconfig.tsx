import { useState } from "react"
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

  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
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
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...Object.values(COLOR_MODE).filter(value => typeof value === "number").map((i) => (
            {
              label: colorToName(i),
              isSelected: () => { return i == colorMode },
              onClick: () => {
                setPreferenceColorMode(i)
                props.updateDisplay()
              }
            }
          )),
          ...[{ label: "-" }],
          ...[0].map(() => (
            {
              label: "CRT Scanlines",
              isSelected: () => { return showScanlines },
              onClick: () => {
                document.body.style.setProperty("--scanlines-display", showScanlines ? "none" : "block")
                setPreferenceShowScanlines(!showScanlines)
                props.updateDisplay()
              }
            }
          ))
        ]]}
      />
    </span>
  )
}