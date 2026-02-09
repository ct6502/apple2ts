import { useState } from "react"
import { ReactNode } from "react"
import { COLOR_MODE, colorToName } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDisplay,
} from "@fortawesome/free-solid-svg-icons"
import { setPreferenceColorMode, setPreferenceCrtDistortion, setPreferenceGhosting, setPreferenceShowScanlines } from "../localstorage"
import { getColorModeSVG, getShowScanlinesSVG } from "../img/iconfunctions"
import PopupMenu from "../controls/popupmenu"
import { getColorMode, getCrtDistortion, getGhosting, getShowScanlines } from "../ui_settings"

export const DisplayConfig = (props: { updateDisplay: UpdateDisplay }) => {

  const colorMode = getColorMode()
  const showScanlines = getShowScanlines()
  const ghosting = getGhosting()
  const crtDistortion = getCrtDistortion()

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
          <svg width="23" height="19" style={{verticalAlign: "top", marginTop: "2px"}}>
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
          { label: "-" },
          {
            label: "CRT Scanlines",
            isSelected: () => { return showScanlines },
            onClick: () => {
              document.body.style.setProperty("--scanlines-display", showScanlines ? "none" : "block")
              setPreferenceShowScanlines(!showScanlines)
              props.updateDisplay()
            }
          },
          {
            label: "Phosphor Ghosting",
            isSelected: () => { return ghosting },
            onClick: () => {
              setPreferenceGhosting(!ghosting)
              props.updateDisplay()
            }
          },
          {
            label: "CRT Distortion",
            isSelected: () => { return crtDistortion },
            onClick: () => {
              setPreferenceCrtDistortion(!crtDistortion)
              props.updateDisplay()
            }
          },
        ]]}
      />
    </span>
  )
}