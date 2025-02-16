import {
  faWaveSquare,
} from "@fortawesome/free-solid-svg-icons"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { setPreferenceMockingboardMode } from "../localstorage"
import { DropdownButton } from "../controls/dropdownbutton"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

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
