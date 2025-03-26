import {
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { DropdownButton } from "../../controls/dropdownbutton"
import { setPreferenceMockingboardMode } from "../../localstorage"

export const MockingboardWaveform = () => {

  return (
    <DropdownButton 
      currentIndex = {getMockingboardMode()}
      itemNames = {MockingboardNames}
      closeCallback = {setPreferenceMockingboardMode}
      icon = {<FontAwesomeIcon icon={faWaveSquare}/>}
      tooltip = "Mockingboard wave form"
    />
  )
}
