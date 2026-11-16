import {
  faWalking,
  faPersonRunning,
  faPersonBiking,
  faTruckFast,
  faRocket,
} from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import PopupMenu from "./popupmenu"
import { handleGetMachineName, handleGetSpeedMode } from "../main2worker"

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
import { getMachineProfile, getProfileSpeedLabel, getProfileSpeedOptions } from "../../common/machine_profile"

export const SPEED_MODES = [-2, -1, 0, 1, 2, 3, 4] as const

const speedBindings: RetroControlBindings = {
  "options.speed": {
    ...choiceBinding({
      options: context => {
        const profile = getMachineProfile(handleGetMachineName())
        return getProfileSpeedOptions(profile).map(option => ({
          label: getProfileSpeedLabel(profile, option.mode, context.t),
        }))
      },
      currentIndex: () => {
        const profile = getMachineProfile(handleGetMachineName())
        return getProfileSpeedOptions(profile).findIndex(option =>
          option.mode === handleGetSpeedMode())
      },
      select: (context, index) => {
        const profile = getMachineProfile(handleGetMachineName())
        const option = getProfileSpeedOptions(profile)[index]
        if (option) {
          setPreferenceSpeedMode(option.mode as -2 | -1 | 0 | 1 | 2 | 3 | 4, context.settingsOrigin)
        }
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
    <svg key="-2" width="25" height="25" className="fill-color">{snailIcon}</svg>,
    <svg key="-1" width="25" height="25" className="fill-color">{turtleIcon}</svg>,
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

  const currentIndex = control.optionIndex ?? speedIndex
  const menuItems: PopupMenuItem[] = control.options?.map((option, index) => ({
    label: option.label,
    svg: icons[index],
    isSelected: () => currentIndex === index,
    onClick: () => { control.options?.[index]?.action?.() },
  })) ?? []

  return (
    <PopupMenu
      buttonTitle={t("config.speed")}
      buttonIcon={icon}
      menuItems={[menuItems]}
    />
  )
}
