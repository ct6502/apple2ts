import { passRxMidiData } from "../main2worker"

const connect = () => {
  if (navigator.requestMIDIAccess)
  {
    console.log("Midi Connect");
    navigator.requestMIDIAccess()
    .then(
      (midi) => midiReady(midi),
      (err) => console.log('requestMIDIAccess fails', err));
  }
  else
    console.log("WebMidi Not supported"); 
}

const midiReady = (midi) => {
  // Also react to device changes.
  midi.addEventListener('statechange', (event) => initDevices(event.target));
  initDevices(midi);
}

let midiInIndex  = -1;
let midiOutIndex = -1;
export let midiInDevices = [];
export let midiOutDevices = [];

export const setMidiOutDevice = (dev) => {
  for(let i=0;i<midiOutDevices.length;i++) {
    if (midiOutDevices[i] === dev) {
      midiOutIndex = i;
      console.log("Selecting MidiOut Device: " + midiOutDevices[i].name);
      break;
    }
  }
}

export const getMidiOutDevice = (): any => {
    return midiOutDevices[midiOutIndex];
}

const initDevices = (midi) => {
  // Reset.
  midiInDevices = [];
  midiOutDevices = [];
  
  const inputs = midi.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    //console.log("Midi In: " + input.value.name);
    midiInDevices.push(input.value);
  }

  if (midiInDevices.length)
  {
    // pick last one
    if (midiInIndex != midiInDevices.length-1)
    {
      midiInIndex = midiInDevices.length-1;
      const device = midiInDevices[midiInIndex];
      console.log("Selecting MidiInDevice: " + device.name);
    }
  }
  else
    midiInIndex = -1;
  
  // MIDI devices that you send data to.
  const outputs = midi.outputs.values();
  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    //console.log("Midi Out: " + output.value.name);
    midiOutDevices.push(output.value);
  }

  if (midiOutDevices.length)
  {
    // pick last one
    if (midiOutIndex != midiOutDevices.length-1)
    {
      midiOutIndex = midiOutDevices.length-1;
      const device = midiOutDevices[midiOutIndex];
      console.log("Selecting MidiOutDevice: " + device.name);
    }
  }
  
  // Start listening to MIDI messages.
  for (const input of midiInDevices) {
    input.addEventListener('midimessage', midiMessageReceived);
  }
}

const midiMessageReceived = (event) => {
  const data = new Uint8Array(event.data);
  //console.log("MIDI Receive: " + event.data);
  passRxMidiData(data);
}

// execute on load
connect();

let once = true;
let buffer = [];

export const receiveMidiData = (data: Uint8Array) => {
  if (midiOutIndex === -1) {
    // connection failure?
    if (once) {
      console.log("No MIDI interface.");
      once = false;
    }
    return;
  }

  for(let i=0;i<data.length;i++)
    buffer.push(data[i]);

  const device = midiOutDevices[midiOutIndex];

  // have to send complete messages
  while (buffer.length >= 3)
  {
    let msg = [];
    msg.push( buffer.shift() );
    msg.push( buffer.shift() );
    // Program and Pressure commands only have 2 bytes, rest have 3
    if (msg[0] < 192 || msg[0] > 223)
      msg.push( buffer.shift() );
    let txt = "[" + msg[0].toString(16);
    for(let i=1;i<msg.length;i++)
      txt += (" " + msg[i].toString(16));
    txt += "]";
    console.log(txt);
    device.send(msg); 
  }
}
