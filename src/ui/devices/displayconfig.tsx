import { useState } from "react"
import { ReactNode } from "react"
import { COLOR_MODE, MONITOR_MODE } from "../../common/utility"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faDisplay,
} from "@fortawesome/free-solid-svg-icons"
import { setPreferenceBoolean, setPreferenceColorMode, setPreferenceMonitorMode } from "../localstorage"
import { getColorModeSVG, getShowScanlinesSVG } from "../img/iconfunctions"
import PopupMenu from "../controls/popupmenu"
import { getColorMode, getCrtDistortion, getGhosting, getMonitorMode, getShowScanlines, setMonitorMode } from "../ui_settings"
import { useTranslation } from "../../i18n/useTranslation"
import { choiceMetadata, toggleMetadata } from "../retro/retromenuhelpers"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { setColorMode, setUIStateBoolean } from "../ui_settings"
import { ControlRegistry } from "../controls/controlregistry"
import { controlOptionsToPopupItems, controlsToPopupItems } from "../controls/controlpopup"
import { createControlContext } from "../retro/retromenucontext"

const COLOR_MODES = Object.values(COLOR_MODE).filter(
  (value): value is COLOR_MODE => typeof value === "number",
)

const colorLabels = (t: (key: string) => string) => [
  t("retroControl.color"),
  t("retroControl.colorNoFringe"),
  t("retroControl.green"),
  t("retroControl.amber"),
  t("retroControl.white"),
  t("retroControl.inverse"),
]

const MONITOR_MODES = Object.values(MONITOR_MODE).filter(
  (value): value is MONITOR_MODE => typeof value === "number",
)

const monitorModeLabels = (t: (key: string) => string) => [
  t("retroControl.monitorModeChoice.ntsc"),
  t("retroControl.monitorModeChoice.rgb"),
]

export const retroDisplayControls: RetroControlMetadata[] = [
  {
    id: "display",
    parentId: null,
    order: 3,
    label: context => context.t("retroControl.display"),
    value: context => colorLabels(context.t)[getColorMode()],
  },
  choiceMetadata({
    id: "display.color",
    parentId: "display",
    order: 0,
    label: context => context.t("retroControl.color"),
    labels: context => colorLabels(context.t),
    currentIndex: getColorMode,
    select: (context, index) => {
      setPreferenceColorMode(COLOR_MODES[index], context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
    preview: (context, index) => {
      setColorMode(COLOR_MODES[index])
      context.displayProps.updateDisplay()
    },
    defaultIndex: COLOR_MODE.COLOR,
  }),
  choiceMetadata({
    id: "display.monitorMode",
    parentId: "display",
    order: 0,
    label: context => context.t("retroControl.monitorMode"),
    labels: context => monitorModeLabels(context.t),
    currentIndex: getMonitorMode,
    select: (context, index) => {
      setPreferenceMonitorMode(MONITOR_MODES[index])
      context.displayProps.updateDisplay()
    },
    preview: (context, index) => {
      setMonitorMode(MONITOR_MODES[index])
      context.displayProps.updateDisplay()
    },
    defaultIndex: MONITOR_MODE.NTSC,
  }),
  ...([
    ["display.scanlines", "config.scanlines", "showScanlines", getShowScanlines],
    ["display.ghosting", "config.ghosting", "ghosting", getGhosting],
    ["display.crtDistortion", "config.crtDistortion", "crtDistortion", getCrtDistortion],
  ] as const).map(([id, labelKey, preference, getter], index) => toggleMetadata({
    id,
    parentId: "display",
    order: index + 1,
    label: context => context.t(labelKey),
    enabled: getter,
    setEnabled: (context, enabled) => {
      setPreferenceBoolean(preference, enabled, context.settingsOrigin)
      if (preference === "showScanlines") {
        document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
      }
      context.displayProps.updateDisplay()
    },
    preview: (context, enabled) => {
      setUIStateBoolean(preference, enabled)
      if (preference === "showScanlines") {
        document.body.style.setProperty("--scanlines-display", enabled ? "block" : "none")
      }
      context.displayProps.updateDisplay()
    },
  })),
]

const displayControlRegistry = new ControlRegistry(retroDisplayControls)

export const DisplayConfig = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const colorMode = getColorMode()
  const showScanlines = getShowScanlines()
  const controls = displayControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "display",
  )
  const [colorControl, monitorModeControl, ...effectControls] = controls

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
          ...controlOptionsToPopupItems(colorControl),
          { label: "-" },
          ...controlsToPopupItems(effectControls),
          { label: "-" },
          ...controlOptionsToPopupItems(monitorModeControl),
        ]]}
      />
    </span>
  )
}
