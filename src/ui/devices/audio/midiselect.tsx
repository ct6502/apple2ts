import { DropdownButton } from "../../controls/dropdownbutton"
import { midiport } from "./midiport"
import { midiOutDevices, getMidiOutIndex, setMidiOutIndex } from "./midiinterface"

export const MidiDeviceSelect = () => {

  //  if (!navigator.requestMIDIAccess) return <></>
  // Create an array of the names of the midiOutDevices
  const midiOutDeviceNames = midiOutDevices ? midiOutDevices.map(device => (device.name || "")) : ["No MIDI Devices"]

  return (
    <DropdownButton 
      currentIndex = {getMidiOutIndex()}
      itemNames = {midiOutDeviceNames}
      closeCallback = {setMidiOutIndex}
      icon = {<svg width="30" height="30" className="fill-color">{midiport}</svg>}
      tooltip = "MIDI Device Select"
    />
  )
}
