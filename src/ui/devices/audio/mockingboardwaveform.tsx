import {
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DropdownButton } from "../../controls/dropdownbutton"
import { EMULATOR_PREFERENCE, setEmulatorPreference } from "../../localstorage"

export const MockingboardWaveform = () => {

  return (
    <DropdownButton 
      currentIndex = {getMockingboardMode()}
      itemNames = {MockingboardNames}
      closeCallback = {(index: number) => setEmulatorPreference(EMULATOR_PREFERENCE.MOCKINGBOARD_MODE, index)}
      icon = {<FontAwesomeIcon icon={faWaveSquare}/>}
      tooltip = "Mockingboard wave form"
    />
  )
}
