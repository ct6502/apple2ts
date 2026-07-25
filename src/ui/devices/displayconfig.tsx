import { useState } from "react"
import { ReactNode } from "react"
import { COLOR_MODE } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDisplay,
} from "@fortawesome/free-solid-svg-icons"
import { setPreferenceBoolean, setPreferenceColorMode } from "../localstorage"
import { getColorModeSVG, getShowScanlinesSVG } from "../img/iconfunctions"
import PopupMenu from "../controls/popupmenu"
import { getColorMode, getCrtDistortion, getGhosting, getShowScanlines } from "../ui_settings"
import { useTranslation } from "../../i18n/useTranslation"

export const DisplayConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const { t } = useTranslation()
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
        title={t("config.display")}
        onClick={handleClick}
      >
        <span className="fa-layers fa-fw">
          <svg width="23" height="19" style={{ verticalAlign: "top", marginTop: "2px" }}>
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
              label: t(`colors.${(["color", "nofringe", "green", "amber", "white", "inverse"])[i]}`),
              isSelected: () => { return i == colorMode },
              onClick: () => {
                setPreferenceColorMode(i)
                props.updateDisplay()
              }
            }
          )),
          { label: "-" },
          {
            label: t("config.scanlines"),
            isSelected: () => { return showScanlines },
            onClick: () => {
              document.body.style.setProperty("--scanlines-display", showScanlines ? "none" : "block")
              setPreferenceBoolean("showScanlines", !showScanlines)
              props.updateDisplay()
            }
          },
          {
            label: t("config.ghosting"),
            isSelected: () => { return ghosting },
            onClick: () => {
              setPreferenceBoolean("ghosting", !ghosting)
              props.updateDisplay()
            }
          },
          {
            label: t("config.crtDistortion"),
            isSelected: () => { return crtDistortion },
            onClick: () => {
              setPreferenceBoolean("crtDistortion", !crtDistortion)
              props.updateDisplay()
            }
          },
        ]]}
      />
    </span>
  )
}