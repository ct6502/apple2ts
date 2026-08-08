import {
  midiOutDevices,
  getMidiOutIndex,
  setMidiOutIndex,
  isSoftSynthEnabled,
  isSoftSynthAvailable,
  enableSoftSynth,
  disableSoftSynth,
  hasWebMidiAccess,
  isWebMidiSupported,
  requestWebMidiAccess,
} from "./midiinterface"

export type MidiDeviceOption =
  | { type: "built-in-synth"; label: string }
  | { type: "enable-web-midi"; label: string }
  | { type: "web-midi-output"; label: string; deviceId: string }
  | { type: "unavailable"; label: string }

export const getMidiDeviceOptions = (): MidiDeviceOption[] => {
  const options: MidiDeviceOption[] = []

  if (isSoftSynthAvailable())
    options.push({ label: "Apple2TS Built-in Synthesizer", type: "built-in-synth" })

  if (hasWebMidiAccess()) {
    if (midiOutDevices.length > 0) {
      options.push(...midiOutDevices.map((device) => ({
        label: device.name || "Unknown MIDI Output",
        type: "web-midi-output" as const,
        deviceId: device.id,
      })))
    } else {
      options.push({ label: "No External MIDI Outputs", type: "unavailable" })
    }
  } else if (isWebMidiSupported()) {
    options.push({ label: "Enable External MIDI…", type: "enable-web-midi" })
  }

  if (options.length === 0)
    options.push({ label: "No MIDI Devices", type: "unavailable" })

  return options
}

export const handleMidiDeviceSelect = async (option: MidiDeviceOption) => {
  switch (option.type) {
    case "built-in-synth":
      enableSoftSynth()
      break

    case "enable-web-midi":
      if (await requestWebMidiAccess() && midiOutDevices.length > 0) {
        const currentIndex = getMidiOutIndex()
        if (currentIndex < 0 || currentIndex >= midiOutDevices.length)
          setMidiOutIndex(0)
        disableSoftSynth()
      }
      break

    case "web-midi-output":
    {
      const deviceIndex = midiOutDevices.findIndex((device) => device.id === option.deviceId)
      if (deviceIndex === -1) {
        console.warn(`MIDI output "${option.label}" is no longer available; selection unchanged.`)
        break
      }
      disableSoftSynth()
      setMidiOutIndex(deviceIndex)
      break
    }

    case "unavailable":
      break
  }
}

export const isMidiDeviceSelected = (option: MidiDeviceOption) => {
  if (option.type === "built-in-synth")
    return isSoftSynthEnabled() && isSoftSynthAvailable()

  if (option.type === "web-midi-output")
    return !isSoftSynthEnabled() &&
      midiOutDevices[getMidiOutIndex()]?.id === option.deviceId

  return false
}
