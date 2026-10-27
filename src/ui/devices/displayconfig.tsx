import { setPreferenceBoolean, setPreferenceColorMode, setPreferenceMonitorMode } from "../localstorage"
import { getColorMode, getCrtDistortion, getGhosting, getMonitorMode, getShowScanlines, setMonitorMode } from "../ui_settings"
import { setColorMode, setUIStateBoolean } from "../ui_settings"
import { choiceBinding, controlsFromJson, toggleBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"
import { COLOR_MODES, colorLabels, MONITOR_MODES, monitorModeLabels, toggleScanlines } from "../ui_utilities"

const displayBindings: RetroControlBindings = {
  display: {
    value: context => colorLabels(context.t)[getColorMode()],
  },
  "display.color": choiceBinding({
    options: context => colorLabels(context.t).map(label => ({ label })),
    currentIndex: getColorMode,
    select: (context, index) => {
      setPreferenceColorMode(COLOR_MODES[index], context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
    preview: (context, index) => {
      setColorMode(COLOR_MODES[index])
      context.displayProps.updateDisplay()
    },
  }),
  "display.monitorMode": choiceBinding({
    options: context => monitorModeLabels(context.t).map(label => ({ label })),
    currentIndex: getMonitorMode,
    select: (context, index) => {
      setPreferenceMonitorMode(MONITOR_MODES[index])
      context.displayProps.updateDisplay()
    },
    preview: (context, index) => {
      setMonitorMode(MONITOR_MODES[index])
      context.displayProps.updateDisplay()
    },
  }),
  ...Object.fromEntries(([
    ["display.scanlines", "showScanlines", getShowScanlines],
    ["display.ghosting", "ghosting", getGhosting],
    ["display.crtDistortion", "crtDistortion", getCrtDistortion],
  ] as const).map(([id, preference, getter]) => [id, toggleBinding({
    enabled: getter,
    setEnabled: (context, enabled) => {
      setPreferenceBoolean(preference, enabled, context.settingsOrigin)
      if (preference === "showScanlines") {
        toggleScanlines(enabled)
      }
      context.displayProps.updateDisplay()
    },
    preview: (context, enabled) => {
      setUIStateBoolean(preference, enabled)
      if (preference === "showScanlines") {
        toggleScanlines(enabled)
      }
      context.displayProps.updateDisplay()
    },
  })])),
}

export const retroDisplayControls = controlsFromJson("display", displayBindings)

