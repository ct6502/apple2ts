import { DropdownButton } from "../../controls/dropdownbutton"
import { midiport } from "./midiport"
import { midiOutDevices, getMidiOutIndex, setMidiOutIndex, isSoftSynthEnabled, isSoftSynthAvailable, enableSoftSynth, disableSoftSynth } from "./midiinterface"

export const MidiDeviceSelect = () => {

  //  if (!navigator.requestMIDIAccess) return <></>
  
  const softSynthAvailable = isSoftSynthAvailable()
  const softSynthActive = isSoftSynthEnabled()
  
  // Create device list with software synth option if available
  let deviceNames: string[]
  if (softSynthAvailable) {
    deviceNames = ["Software Synthesizer"]
    if (midiOutDevices && midiOutDevices.length > 0) {
      deviceNames.push(...midiOutDevices.map(device => device.name || "Unknown Device"))
    }
  } else {
    deviceNames = midiOutDevices && midiOutDevices.length > 0 
      ? midiOutDevices.map(device => device.name || "Unknown Device")
      : ["No MIDI Devices"]
  }

  const handleDeviceSelect = (index: number) => {
    if (softSynthAvailable && index === 0) {
      // Software synth selected
      enableSoftSynth()
      setMidiOutIndex(-1) // Disable hardware MIDI
    } else {
      // Hardware device selected
      disableSoftSynth()
      const hardwareIndex = softSynthAvailable ? index - 1 : index
      setMidiOutIndex(hardwareIndex)
    }
  }

  const getCurrentIndex = () => {
    if (softSynthActive && softSynthAvailable) {
      return 0 // Software synth is first in list
    }
    const hwIndex = getMidiOutIndex()
    return softSynthAvailable ? hwIndex + 1 : hwIndex
  }

  return (
    <DropdownButton 
      currentIndex = {getCurrentIndex()}
      itemNames = {deviceNames}
      closeCallback = {handleDeviceSelect}
      icon = {<svg width="30" height="30" className="fill-color">{midiport}</svg>}
      tooltip = "MIDI Device Select"
    />
  )
}
