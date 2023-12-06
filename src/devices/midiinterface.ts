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
    console.log("WEBMidi Not supported"); 
}

const midiReady = (midi) => {
  // Also react to device changes.
  midi.addEventListener('statechange', (event) => initDevices(event.target));
  initDevices(midi);
}

let inIdx  = -1;
let outIdx = -1;
let midiIn = [];
let midiOut = [];

const initDevices = (midi) => {
  // Reset.
  midiIn = [];
  midiOut = [];
  
  // MIDI devices that send you data.
  const inputs = midi.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    console.log("Midi In: " + input.value.name);
    midiIn.push(input.value);
  }
  console.log("---------");

  if (midiIn.length)
  {
    // pick last one
    inIdx = midiIn.length-1;
    const device = midiIn[inIdx];
    console.log("Using MidiIn Device: " + device.name);
  }
  else
    inIdx = -1;
  
  // MIDI devices that you send data to.
  const outputs = midi.outputs.values();
  for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
    console.log("Midi Out: " + output.value.name);
    midiOut.push(output.value);
  }
  console.log("---------");

  if (midiOut.length)
  {
    // pick last one
    outIdx = midiOut.length-1;
    const device = midiOut[outIdx];
    console.log("Using MidiOut Device: " + device.name);
  }
  
  // Start listening to MIDI messages.
  for (const input of midiIn) {
    input.addEventListener('midimessage', midiMessageReceived);
  }
}

const midiMessageReceived = (event) => {
  const data = new Uint8Array(event.data);
  //console.log("MIDI Receive: " + event.data);
  passRxMidiData(data);
}

connect();

let once = true;
let buffer = [];

export const receiveMidiData = (data: Uint8Array) => {
  if (outIdx === -1) {
    // connection failure?
    if (once) {
      console.log("No MIDI interface.");
      once = false;
    }
    return;
  }

  for(let i=0;i<data.length;i++)
    buffer.push(data[i]);

  const device = midiOut[outIdx];

  // have to send complete messages
  while (buffer.length >= 3)
  {
    let msg = [];
    msg.push( buffer.shift() );
    msg.push( buffer.shift() );
    // Program and Pressure commands only have 2 bytes, rest have 3
    if (msg[0] < 192 || msg[0] > 223)
      msg.push( buffer.shift() );
    //console.log("MIDI Send: " + msg);
    device.send(msg); 
  }
}
