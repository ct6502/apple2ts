//import { passRxMidiData } from "../main2worker"

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

let midiAccess: MIDIAccess;

const midiReady = (midi: MIDIAccess) => {
  // Also react to device changes.
  midiAccess = midi;
  midi.addEventListener('statechange', (event) => initDevices());
  initDevices();
}

let midiInIndex  = -1;
let midiOutIndex = -1;
export let midiInDevices: MIDIInput[];
export let midiOutDevices: MIDIOutput[];

export const getMidiOutIndex = (): number => {
  return midiOutIndex;
}

export const setMidiOutIndex = (index: number) => {
  if (midiOutIndex != index)
  {
    midiOutIndex = index;
    console.log("Selecting MidiOut Device: " + midiOutDevices[midiOutIndex].name);
  }
}

export const getMidiInIndex = (): number => {
  return midiInIndex;
}

export const setMidiInIndex = (index: number) => {
  if (midiInIndex != index)
  {
    midiInIndex = index;
    console.log("Selecting MidiIn Device: " + midiInDevices[midiInIndex].name);
    //device.addEventListener('midimessage', midiMessageReceived);
  }
}

const initDevices = () => {

  const midi: MIDIAccess = midiAccess;

  if (!midi)
    return;

  // Reset.
  midiInDevices = [];
  midiOutDevices = [];

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
  
  const inputs = midi.inputs.values();
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    //console.log("Midi In: " + input.value.name);
    midiInDevices.push(input.value);
  }

  // don't listen on midi-through if we are sending on midi-through
  if (midiInDevices.length > 1)
  {
    // pick last one
    if (midiInIndex != midiInDevices.length-1)
    {
      midiInIndex = midiInDevices.length-1;
      //const device = midiInDevices[midiInIndex];
      //device.addEventListener('midimessage', midiMessageReceived);
      //console.log("Selecting MidiInDevice: " + device.name);
    }
  }
  else
    midiInIndex = -1;
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

// execute on load
connect();

let once = true;
let buffer: number[] = [];

//+-----------------+-----------------+-----------------+-----------------+-----------------+-----------------+----------------+ 
//| Patch           | Part 1          | Part 2          | Part 3          |Part 4           | Part 5          | Part 6         | 
//+-----------------+-----------------+-----------------+-----------------+-----------------+-----------------+----------------+ 
//| P-01:UltimaThm  | I-76:SOFT TP 1  | I-59:STRINGS 1  | 6-25:FR.HORN 3  | I-76:SOFT TP 1  | I-76:SOFT TP 1  |                | 
//| P-02:BritncLnds | 5-10:HARP 1     | I-59:STRINGS 1  | 6-35:TIMPANI 2  | 5-10:HARP 1     | 1-09:POSITIVE 3 |                | 
//| P-03:CJsHrnpipe | 5-01:VIOLIN 1   | I-59:STRINGS 1  | 6-13:CLARINET 2 | 6-13:CLARINET 2 |                 |                | 
//| P-04:Eng.&Melee | I-76:SOFT TP 1  | I-59:STRINGS 1  | 6-25:FR.HORN 3  | 5-01:VIOLIN 1   | I-76:SOFT TP 1  | 6-35:TIMPANI 2 | 
//| P-05:Stones     | 3-22:SANTUR 1   | I-55:CHOIR 1    |                 |                 |                 |                | 
//| P-06:GreysnTale | I-24:A.GUITAR 1 | 6-17:CLARINET 6 | I-45:FINGERED 1 | I-95:FLUTE 1    |                 |                | 
//| P-07:Fanfare4V  | I-76:SOFT TP 1  | I-59:STRINGS 1  | 6-25:FR.HORN 3  | I-76:SOFT TP 1  | I-76:SOFT TP 1  | 6-35:TIMPANI 2 | 
//| P-08:MsngMnarc  | 5-04:CELLO 1    | I-59:STRINGS 1  | 6-25:FR.HORN 3  | 5-01:VIOLIN 1   | 6-35:TIMPANI 2  |                | 
//| P-09:Tarantella | 5-08:CB/CELLO   | 6-17:CLARINET 6 | I-45:FINGERED 1 | 6-02:OBOE 2     | 1-06:HARPSI 6   |                | 
//| P-10:HallOfDoom | 1-01:HARPSI 1   | I-59:STRINGS 1  | 6-35:TIMPANI 2  |                 |                 |                | 
//| P-11:WrldsBelow | 5-02:VIOLIN 2   | I-61:STRINGS 3  | 6-35:TIMPANI 2  | 6-12:CLARINET 1 | 1-01:HARPSI 1   |                | 
//| P-12:LordBlkthn | 1-15:CHURCH 3   | 1-20:CHURCH RVB | I-55:CHOIR 1    |                 |                 |                | 
//| P-13:DreamOfNan | 5-10:HARP 1     | I-57:CHOIR 3    |                 |                 |                 |                | 
//| P-14:JoyousReu  | I-76:SOFT TP 1  | I-59:STRINGS 1  | 6-25:FR.HORN 3  | I-76:SOFT TP 1  | 6-35:TIMPANI 2  |                | 
//| P-15:RuleBritn  | I-95:FLUTE 1    | I-59:STRINGS 1  | 6-25:FR.HORN 3  | I-76:SOFT TP 1  | I-76:SOFT TP 1  |                | 
//+-----------------+-----------------+-----------------+-----------------+-----------------+-----------------+----------------+
//
//GM Mapping:
//
// U-110                GM
// ----------------     --------------------
// 1-01:HARPSI 1        07 - Harpsichord
// 1-06:HARPSI 6        07 - Harpsichord
// 1-09:POSITIVE 3      19 - Rock Organ
// 1-15:CHURCH 3        20 - Church Organ
// 1-20:CHURCH RVB      21 - Reed Organ
// 3-22:SANTUR 1        16 - Dulcimer
// 5-01:VIOLIN 1        41 - Violin
// 5-02:VIOLIN 2        42 - Viola
// 5-04:CELLO 1         43 - Cello
// 5-08:CB/CELLO        43 - Cello
// 5-10:HARP 1          47 - Orchestral Harp
// 6-02:OBOE 2          69 - Oboe
// 6-12:CLARINET 1      72 - Clarinet
// 6-13:CLARINET 2      72 - Clarinet
// 6-17:CLARINET 6      72 - Clarinet
// 6-25:FR.HORN 3       61 - French Horn
// 6-35:TIMPANI 2       117 - Taiko Drum
// I-24:A.GUITAR 1      26 - Acoustic Guitar (steel) 
// I-45:FINGERED 1      34 - Electric Bass (fingered)
// I-55:CHOIR 1         53 - Choir Aahs
// I-57:CHOIR 3         54 - Voice Oohs
// I-59:STRINGS 1       49 - String Ensemble 1
// I-61:STRINGS 3       50 - String Ensemble 2
// I-76:SOFT TP 1       57 - Trumpet
// I-95:FLUTE 1         74 - Flute

// Parts below are from U110 mapping
// Part  Instrument  Key Range  Level
const u110ToGM = [
// Default patch 0
[
[0, 0x00, 0x7f, 35],
[0, 0x00, 0x7f, 35],
[0, 0x00, 0x7f, 35],
[0, 0x00, 0x7f, 35],
[0, 0x00, 0x7f, 35],
[0, 0x00, 0x7f, 35],
],
/*
Patch1: UltimaThm 
0: 0:75 30->5b 28
1: 0:58 00->7f 20
2: 6:24 30->3c 28
3: 0:75 2f->47 23
4: 0:75 48->54 25
*/
[
[56, 0x30, 0x5b, 28],
[48, 0x00, 0x7f, 20],
[60, 0x30, 0x3c, 20],
[56, 0x2f, 0x47, 23],
[56, 0x48, 0x54, 25],
[ 0, 0x00, 0x00,  0],
],

/*
Patch2: BritncLnds
0: 5:9 00->4a 55
1: 0:58 00->7f 17
2: 6:34 00->2b 127
3: 5:9 43->7f 65
4: 1:8 3c->7f 23
*/
[
[46, 0x00, 0x4a, 55],
[48, 0x00, 0x7f, 17],
[116, 0x00, 0x2b, 127],
[46, 0x43, 0x7f, 65],
[18, 0x3c, 0x7f, 23],
[ 0, 0x00, 0x00,  0],
],

/*
Patch3: CJsHrnpipe
0: 5:0 00->58 55
1: 0:58 00->3a 23
2: 6:12 41->7f 60
3: 6:12 01->40 50
*/
[
[40, 0x00, 0x58, 55],
[48, 0x00, 0x3a, 23],
[71, 0x41, 0x7f, 60],
[71, 0x01, 0x40, 50],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
],

/*
Patch4: Eng.&Melee
0: 0:75 30->54 7
1: 0:58 00->53 20
2: 6:24 30->3c 28
3: 5:0 56->63 100
4: 0:75 48->54 16
5: 6:34 00->30 44
*/
[
[56, 0x30, 0x54, 7],
[48, 0x00, 0x53, 20],
[60, 0x30, 0x3c, 28],
[40, 0x56, 0x63, 100],
[56, 0x48, 0x54, 16],
[116, 0x00, 0x30, 44],
],

/*
Patch5: Stones
0: 3:21 00->4d 127
1: 0:54 40->7f 8
*/
[
[15, 0x00, 0x4d, 127],
[52, 0x40, 0x7f, 8],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
],

/*
Patch6: GreysnTale
0: 0:23 00->7f 80
1: 6:16 3c->7f 25
2: 0:44 00->2f 26
3: 0:94 34->48 15
4: 6:34 00->33 127
*/
[
[25, 0x00, 0x7f, 80],
[71, 0x3c, 0x7f, 25],
[33, 0x00, 0x2f, 26],
[73, 0x34, 0x48, 15],
[116, 0x00, 0x33, 127],
[ 0, 0x00, 0x00,  0],
],

/*
Patch7: Fanfare4V
0: 0:75 28->5b 28
1: 0:58 00->7f 20
2: 6:24 30->3c 28
3: 0:75 2f->47 23
4: 0:75 48->54 25
5: 6:34 00->30 54
*/
[
[56, 0x28, 0x5b, 28],
[48, 0x00, 0x7f, 20],
[60, 0x30, 0x3c, 28],
[56, 0x2f, 0x47, 23],
[56, 0x48, 0x54, 25],
[116, 0x00, 0x30, 54],
],

/*
Patch8: MsngMnarc
0: 5:3 30->5b 25
1: 0:58 00->7f 24
2: 6:24 30->3c 28
3: 5:0 2f->47 23
4: 6:34 00->2e 55
*/

[
[42, 0x30, 0x5b, 25],
[48, 0x00, 0x7f, 24],
[60, 0x30, 0x3c, 28],
[40, 0x2f, 0x47, 23],
[116, 0x00, 0x2e, 55],
[ 0, 0x00, 0x00,  0],
],

/*
Patch9: Tarantella
0: 5:7 00->7f 32
1: 6:16 3c->7f 32
2: 0:44 00->2f 8
3: 6:1 34->48 20
4: 1:5 00->2f 43
*/

[
[42, 0x00, 0x7f, 32],
[71, 0x3c, 0x7f, 32],
[33, 0x00, 0x2f,  8],
[68, 0x34, 0x48, 20],
[ 6, 0x00, 0x2f, 43],
[ 0, 0x00, 0x00,  0],
],

/*
Patch10: HallOfDoom
0: 1:0 00->7f 61
1: 0:58 00->7f 13
2: 6:34 00->2b 120
*/

[
[ 6, 0x00, 0x7f, 61],
[48, 0x00, 0x7f, 13],
[116, 0x00, 0x2b, 120],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
],

/*
Patch11: WrldsBelow
0: 5:1 00->7f 90
1: 0:60 00->7f 55
2: 6:34 00->2d 100
3: 6:11 44->51 32
4: 1:0 00->51 17
*/

[
[41, 0x00, 0x7f, 90],
[49, 0x00, 0x7f, 55],
[116, 0x00, 0x2d, 100],
[71, 0x44, 0x51, 32],
[ 6, 0x00, 0x51, 17],
[ 0, 0x00, 0x00,  0],
],

/*
Patch12: LordBlkthn
0: 1:14 00->7f 25
1: 1:19 00->4e 15
2: 0:54 42->52 85
*/
[
[19, 0x00, 0x7f, 25],
[20, 0x00, 0x4e, 15],
[52, 0x42, 0x52, 85],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
[ 0, 0x00, 0x00,  0],
],

/*
Patch13: DreamOfNan
0: 5:9 00->4d 56
1: 0:56 3f->7f 4
2: 0:58 00->6c 6
*/

[
[46, 0x00, 0x4d, 56],
[53, 0x3f, 0x7f, 4],
[48, 0x00, 0x6c, 6],
[ 0, 0x00, 0x00, 0],
[ 0, 0x00, 0x00, 0],
[ 0, 0x00, 0x00, 0],
],

/*
Patch14: JoyousReu
0: 0:75 30->5b 28
1: 0:58 00->7f 20
2: 6:24 30->3c 28
3: 0:75 2f->47 23
4: 6:34 00->30 55
*/

[
[56, 0x30, 0x5b, 28],
[48, 0x00, 0x7f, 20],
[60, 0x30, 0x3c, 28],
[56, 0x2f, 0x47, 23],
[116, 0x00, 0x30, 55],
[ 0, 0x00, 0x00, 0],
],

/*
Patch15: RuleBritn 
0: 0:94 18->5b 22
1: 0:58 00->7f 15
2: 6:24 30->3c 28
3: 0:75 2f->47 23
4: 0:75 48->54 25
*/

[
[73, 0x18, 0x5b, 22],
[48, 0x00, 0x7f, 15],
[60, 0x30, 0x3c, 28],
[56, 0x2f, 0x47, 23],
[56, 0x48, 0x54, 25],
[ 0, 0x00, 0x00,  0],
]
];


let gmNoteLookup = new Array(0);

const setupGMPatch = (which: number) => {
  const device = midiOutDevices[midiOutIndex];

  gmNoteLookup = new Array(128);
  gmNoteLookup.fill(0);

  const patch = u110ToGM[which];
  console.log("Patch: ", which, patch);

  //[inst: 00, start: 0x00, end: 0x7f, volume: 35],
  for(let i=0;i<6;i++)
  {
    if (patch[i][3] === 0)  // check volume
      break;

    // send change program
    device.send( [0xc0+i, patch[i][0]] );
    // send change volume
    device.send( [0xb0+i, 0x07, patch[i][3]] );

    // set notes used in this patch
    for(let j=patch[i][1];j<patch[i][2];j++)
      gmNoteLookup[j] |= (1<<i);
  }
}

const parseMsg = (msg: number[]) => {
  const device = midiOutDevices[midiOutIndex];

  let notes = 0;
  const no = msg[0];
  // only check for channel change and note on/off here
  switch(no)
  {
    case 0xC0:
      setupGMPatch(msg[1]);
      return;
    case 0x80:
    case 0x90:
      notes = gmNoteLookup[msg[1]];
      break;
  }

  if (notes)
  {
    for(let i=0;i<6;i++)
    {
      if (notes & (1<<i))
      {
        msg[0] = no+i;
        device.send(msg);
      }
    }
  }
  else
  {
    device.send(msg);
  }
}

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

  //const device = midiOutDevices[midiOutIndex];

  // Must parse the message as WebMIDI only accepts complete messages.
  while (buffer.length)
  {
    let needBytes = 0;
    switch(buffer[0] & 0xF0)
    {
      case 0x80:
      case 0x90:
      case 0xA0:
      case 0xB0:
      case 0xE0:
        needBytes = 3;
        break;
      
      case 0xC0:
      case 0xD0:
        needBytes = 2;
        break;

      case 0xF0:
        switch(buffer[0])
        {
          case 0xF0:  // SYSEX messages aren't parsed correctly ATM
          case 0xF7:
            buffer.shift();
            needBytes = 0;
            break;
          case 0xF1:
          case 0xF3:
            needBytes = 2;
            break;
          case 0xF2:
            needBytes = 3;
            break;
          default:
            needBytes = 1;
            break;
        }
        break;

      default:
        // we are out of alignment
        buffer.shift();
        needBytes = 0
        break;
    }

    if (needBytes === 0)
      continue;

    if (buffer.length < needBytes)
      break;

    let msg: number[] = [];
    while( needBytes-- )
      msg.push( buffer.shift()! );

    //let txt = "Send: [" + msg[0].toString(16);
    //for(let i=1;i<msg.length;i++)
    //  txt += (" " + msg[i].toString(16));
    //txt += "]";
    //console.log(txt);
    //device.send(msg); 
    
    parseMsg(msg);
  }
}
