import { DropdownButton } from "../controls/dropdownbutton";
import { serialport } from "./img/db9"
import { changeSerialMode, getSerialMode, getSerialNames } from "./serialhub";

export const SerialPortSelect = () => {

  return (
    <DropdownButton 
      currentIndex = {getSerialMode()}
      itemNames = {getSerialNames()}
      closeCallback = {changeSerialMode}
      icon = {<svg width="30" height="30" className="fill-color">{serialport}</svg>}
      tooltip = "Serial Port Select"
    />
  )

}
