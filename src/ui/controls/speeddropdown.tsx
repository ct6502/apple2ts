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

export const SpeedDropdown = (props: { updateDisplay: UpdateDisplay }) => {
  const { t } = useTranslation()
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
  const speedLabels = [
    t("speed.snail"),
    t("speed.slow"),
    t("speed.normal"),
    t("speed.two"),
    t("speed.three"),
    t("speed.fast"),
    t("speed.warp"),
  ]

  return (
    <DropdownButton
      currentIndex={speedIndex}
      itemNames={speedLabels}
      closeCallback={(index: number) => { setPreferenceSpeedMode(index + MinimumSpeedMode); props.updateDisplay() }}
      icon={icon}
      icons={icons}
      tooltip={t("config.speed")}
    />
  )
}
