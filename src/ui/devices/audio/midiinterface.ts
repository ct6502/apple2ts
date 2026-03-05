import { passRxMidiData } from "../../main2worker"
import { checkEnhancedMidi } from "./enhancedmidi"
import * as SoftSynth from "./softsynth"

let useSoftSynth = true
const DEBUG = false

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
    if (midiOutIndex != -1)
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

// probably not necessary
let doActiveSense = false
let itimer = -1
const activeSense = () => {
  const data = new Uint8Array(1).fill(0xFE)
  passRxMidiData(data)
}

const parseAndSendMsg = (msg: number[]) => {
  // Determine the output device (hardware MIDI or software synth)
  const device = (useSoftSynth || midiOutIndex === -1) 
    ? SoftSynth as unknown as MIDIOutput  // Software synth has compatible send() API
    : midiOutDevices[midiOutIndex]

  // start active sensing every ~250ms once we send an initial message
  if (doActiveSense && itimer === -1)
    itimer = setInterval(activeSense, 250)

  if (DEBUG)
  {
    const hexString = msg.map(x => ('00' + x.toString(16)).slice(-2)).join(' ');
    console.log("Msg: ", hexString)
  }

  // Check enhanced MIDI first with appropriate device
  if (checkEnhancedMidi(msg, device))
    return

  // If not enhanced MIDI, send directly
  device.send(msg)
}

enum State
{
  COMMAND,
  ARGS2,
  ARGS1,
  SYSEX
}

let once = false
const msg: number[] = []
const rtMsg: number[] = []
let state : State = State.COMMAND

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

  // Must parse the message, as WebMIDI only accepts complete messages.
  for(let i=0;i<data.length;i++)
  {
    const byte = data[i]
    msg.push(byte)

    switch(state)
    {
      case State.ARGS2:
        // check for realtime message
        if ((byte & 0xF8) == 0xF8)
        {
          rtMsg.push(byte)
          msg.pop()
        }
        else
          state = State.ARGS1
        break

      case State.ARGS1:
        // check for realtime message
        if ((byte & 0xF8) == 0xF8)
        {
          rtMsg.push(byte)
          msg.pop()
        }
        else
          state = State.COMMAND
        break

      case State.SYSEX:
        if (byte === 0xF7)
          state = State.COMMAND
        break
        
      case State.COMMAND:
        switch(byte & 0xF0)
        {
          case 0x80:
          case 0x90:
          case 0xA0:
          case 0xB0:
          case 0xE0:
            state = State.ARGS2
            break
          
          case 0xC0:
          case 0xD0:
            state = State.ARGS1
            break

          case 0xF0:
            switch(byte)
            {
              case 0xF0:
                state = State.SYSEX
                break;
              case 0xF2:
                state = State.ARGS2
                break
              case 0xF1:
              case 0xF3:
                state = State.ARGS1
                break
              default:
                // remain in State.COMMAND, 1 byte arg
                break
            }
            break

          default:
            // out of alignment / bad data?
            // stay in command state
            console.log("MIDI: byte unexpected: ", byte.toString(16))
            msg.length = 0
            break
        }
        break;
    }

    // always send interleaved realtime messages
    if (rtMsg.length > 0)
    {
      parseAndSendMsg(rtMsg)
      rtMsg.length = 0
    }

    if (state == State.COMMAND && msg.length > 0)
    {
      parseAndSendMsg(msg)
      msg.length = 0
    }
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

