//import { passRxMidiData } from "../main2worker"
import { checkEnhancedMidi } from "./enhancedmidi"
import * as SoftSynth from "./softsynth"

let useSoftSynth = true

const connect = () => {
  if (navigator.requestMIDIAccess)
  {
    console.log("Midi Connect")
    navigator.requestMIDIAccess()
    .then(
      (midi) => midiReady(midi),
      (err) => console.log("requestMIDIAccess fails", err))
  }
  else
    console.log("WebMidi not supported") 
}

// execute on load
connect()

let midiAccess: MIDIAccess

const midiReady = (midi: MIDIAccess) => {
  // Also react to device changes.
  midiAccess = midi
  midi.addEventListener("statechange", () => initDevices())
  initDevices()
}

let midiInIndex  = -1
let midiOutIndex = -1
export let midiInDevices: MIDIInput[]
export let midiOutDevices: MIDIOutput[]

export const getMidiOutIndex = (): number => {
  return midiOutIndex
}

export const setMidiOutIndex = (index: number) => {
  if (midiOutIndex != index)
  {
    midiOutIndex = index
    console.log("Selecting MidiOut Device: " + midiOutDevices[midiOutIndex].name)
  }
}

export const getMidiInIndex = (): number => {
  return midiInIndex
}

export const setMidiInIndex = (index: number) => {
  if (midiInIndex != index)
  {
    midiInIndex = index
    console.log("Selecting MidiIn Device: " + midiInDevices[midiInIndex].name)
    //device.addEventListener('midimessage', midiMessageReceived);
  }
}

const initDevices = () => {

  const midi: MIDIAccess = midiAccess

  if (!midi)
    return

  // Reset.
  midiInDevices = []
  midiOutDevices = []

  const outputs = midi.outputs.values()
  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    //console.log("Midi Out: " + output.value.name);
    midiOutDevices.push(output.value)
  }

  if (midiOutDevices.length)
  {
    // pick last one
    if (midiOutIndex != midiOutDevices.length-1)
    {
      midiOutIndex = midiOutDevices.length-1
      const device = midiOutDevices[midiOutIndex]
      console.log("Selecting MidiOutDevice: " + device.name)
    }
  }
  
  const inputs = midi.inputs.values()
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    //console.log("Midi In: " + input.value.name);
    midiInDevices.push(input.value)
  }

  // don't listen on midi-through if we are sending on midi-through
  if (midiInDevices.length > 1)
  {
    // pick last one
    if (midiInIndex != midiInDevices.length-1)
    {
      midiInIndex = midiInDevices.length-1
      //const device = midiInDevices[midiInIndex];
      //device.addEventListener('midimessage', midiMessageReceived);
      //console.log("Selecting MidiInDevice: " + device.name);
    }
  }
  else
    midiInIndex = -1
}

//const midiMessageReceived = (event: MIDIMessageEvent) => {
//  const data = new Uint8Array(event.data);
//  let txt = "Recv: [" + data[0].toString(16);
//  for(let i=1;i<data.length;i++)
//    txt += (" " + data[i].toString(16));
//  txt += "]";
//  console.log(txt);
//  passRxMidiData(data);
//}

const parseAndSendMsg = (msg: number[]) => {
  // Determine the output device (hardware MIDI or software synth)
  const device = (useSoftSynth || midiOutIndex === -1) 
    ? SoftSynth as unknown as MIDIOutput  // Software synth has compatible send() API
    : midiOutDevices[midiOutIndex]

  // Check enhanced MIDI first with appropriate device
  if (checkEnhancedMidi(msg, device))
    return

  // If not enhanced MIDI, send directly
  device.send(msg)
}

let once = false
const buffer: number[] = []

export const receiveMidiData = (data: Uint8Array) => {
  // Initialize software synth if needed and no hardware MIDI available
  if (midiOutIndex === -1 && !useSoftSynth && SoftSynth.isSoftSynthAvailable()) {
    console.log("No MIDI interface detected. Using built-in software synthesizer.")
    SoftSynth.initSoftSynth()
    useSoftSynth = true
  }

  if (midiOutIndex === -1 && !useSoftSynth) {
    // connection failure and no soft synth
    if (once) {
      console.log("No MIDI interface and software synth unavailable.")
      once = false
    }
    return
  }

  for(let i=0;i<data.length;i++)
    buffer.push(data[i])

  // Must parse the message as WebMIDI only accepts complete messages.
  while (buffer.length)
  {
    let needBytes = 0
    switch(buffer[0] & 0xF0)
    {
      case 0x80:
      case 0x90:
      case 0xA0:
      case 0xB0:
      case 0xE0:
        needBytes = 3
        break
      
      case 0xC0:
      case 0xD0:
        needBytes = 2
        break

      case 0xF0:
        switch(buffer[0])
        {
          case 0xF0:  // SYSEX messages aren't parsed correctly ATM
          case 0xF7:
            buffer.shift()
            needBytes = 0
            break
          case 0xF1:
          case 0xF3:
            needBytes = 2
            break
          case 0xF2:
            needBytes = 3
            break
          default:
            needBytes = 1
            break
        }
        break

      default:
        // we are out of alignment
        buffer.shift()
        needBytes = 0
        break
    }

    if (needBytes === 0)
      continue

    if (buffer.length < needBytes)
      break

    const msg: number[] = []
    while( needBytes-- )
      msg.push( buffer.shift()! )

    parseAndSendMsg(msg)
  }
}

// Public API for controlling software synthesizer
export const enableSoftSynth = () => {
  if (SoftSynth.isSoftSynthAvailable()) {
    SoftSynth.initSoftSynth()
    useSoftSynth = true
    console.log("Software synthesizer enabled")
    return true
  }
  console.warn("Software synthesizer not available in this browser")
  return false
}

export const disableSoftSynth = () => {
  if (useSoftSynth) {
    SoftSynth.stopAllNotes()
    useSoftSynth = false
    console.log("Software synthesizer disabled")
  }
}

export const isSoftSynthEnabled = () => {
  return useSoftSynth
}

export const isSoftSynthAvailable = () => {
  return SoftSynth.isSoftSynthAvailable()
}

export const setSoftSynthMasterVolume = (volume: number) => {
  SoftSynth.setMasterVolume(volume)
}

