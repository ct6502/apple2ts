import { midiOutDevices, getMidiOutIndex, setMidiOutIndex, isSoftSynthEnabled, isSoftSynthAvailable, enableSoftSynth, disableSoftSynth } from "./midiinterface"

  //  if (!navigator.requestMIDIAccess) return <></>

export const getMidiDeviceNames = () => {
  const softSynthAvailable = isSoftSynthAvailable()
  
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
  return deviceNames
}

export const handleMidiDeviceSelect = (index: number) => {
  const softSynthAvailable = isSoftSynthAvailable()
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

export const getMidiCurrentIndex = () => {
  const softSynthAvailable = isSoftSynthAvailable()
  const softSynthActive = isSoftSynthEnabled()
  if (softSynthActive && softSynthAvailable) {
    return 0 // Software synth is first in list
  }
  const hwIndex = getMidiOutIndex()
  return softSynthAvailable ? hwIndex + 1 : hwIndex
}

