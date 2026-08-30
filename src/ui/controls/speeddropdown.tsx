import {
  faWalking,
  faPersonRunning,
  faPersonBiking,
  faTruckFast,
  faRocket,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DropdownButton } from "./dropdownbutton"
import { handleGetSpeedMode } from "../main2worker"
import { setPreferenceSpeedMode } from "../localstorage"
import { snailIcon } from "../img/icon_snail"
import { turtleIcon } from "../img/icon_turtle"

const MinimumSpeedMode = -2

export const MaximumSpeedMode = 4

import { useTranslation } from "../../i18n/useTranslation"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"
import { controlsFromJson, choiceBinding, type RetroControlBindings } from "../retro/retrocontrolmetadata"

export const SPEED_MODES = [-2, -1, 0, 1, 2, 3, 4] as const
const SPEED_LABEL_KEYS = [
  "retroControl.snail",
  "retroControl.slow",
  "retroControl.normal",
  "retroControl.twoMhz",
  "retroControl.threeMhz",
  "retroControl.fast",
  "retroControl.warp",
] as const

const speedBindings: RetroControlBindings = {
  "options.speed": {
    ...choiceBinding({
      options: context => SPEED_LABEL_KEYS.map(key => ({ label: context.t(key) })),
      currentIndex: () => SPEED_MODES.indexOf(handleGetSpeedMode() as typeof SPEED_MODES[number]),
      select: (context, index) => {
        setPreferenceSpeedMode(SPEED_MODES[index], context.settingsOrigin)
        context.displayProps.updateDisplay()
      },
    }),
    defaultIndex: SPEED_MODES.indexOf(0),
  },
}

export const retroSpeedControl: RetroControlMetadata = controlsFromJson("speed", speedBindings)[0]

const speedControlRegistry = new ControlRegistry([retroSpeedControl])

export const SpeedDropdown = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const speedMode = handleGetSpeedMode()
  const iconSize = 22
  const icons = [
    <svg key="-2" width="27" height="27" className="fill-color">{snailIcon}</svg>,
    <svg key="-1" width="27" height="27" className="fill-color">{turtleIcon}</svg>,
    <FontAwesomeIcon key="0" icon={faWalking} style={{ fontSize: `${iconSize}px` }} />,
    <FontAwesomeIcon key="1" icon={faPersonRunning} style={{ fontSize: `${iconSize}px` }} />,
    <FontAwesomeIcon key="2" icon={faPersonBiking} style={{ fontSize: `${iconSize}px` }} />,
    <FontAwesomeIcon key="3" icon={faTruckFast} style={{ fontSize: `${iconSize}px` }} />,
    <FontAwesomeIcon key="4" icon={faRocket} style={{ fontSize: `${iconSize}px` }} />
  ]
  const speedIndex = speedMode - MinimumSpeedMode
  const icon = icons[speedIndex]
  const control = speedControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "options",
  )[0]

  return (
    <DropdownButton
      currentIndex={control.optionIndex ?? speedIndex}
      itemNames={control.options?.map(option => option.label) ?? []}
      closeCallback={(index: number) => { control.options?.[index]?.action?.() }}
      icon={icon}
      icons={icons}
      tooltip={t("config.speed")}
    />
  )
}
