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
    console.log("WebMidi not supported"); 
}

let midiAccess: MIDIAccess;

const midiReady = (midi: MIDIAccess) => {
  // Also react to device changes.
  midiAccess = midi;
  midi.addEventListener('statechange', () => initDevices());
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

//
// This Ultima 5 MIDI work is based on the article and presentation by "Cloudschatze": 
// https://forum.vcfed.org/index.php?threads/how-you-could-have-been-playing-ultima-v-in-1988.61980/
// His setup used a Roland U-110.  I took the instrument, range, volume and pan mappings from the MID file he
// provided and converted the instruments to General MIDI and the custom code and mappings below.  The instruments
// could perhaps use some tuning, but it already sounds pretty good, and better than the original single
// instrument sounds.
//
let u5midi = false;

// Currently, argument is only 0x0 or 0x1.  Could be used for other things later depending on the title.
export const setEnhancedMidi = (arg: number) => {
  u5midi = arg&0x1 ? true : false;
  console.log("enhanced: ", u5midi);
}

let once = true;
const buffer: number[] = [];

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
// I-24:A.GUITAR 1      26 - Acoustic Guitar (steel) 
// I-45:FINGERED 1      34 - Electric Bass (fingered)
// I-55:CHOIR 1         53 - Choir Aahs
// I-57:CHOIR 3         54 - Voice Oohs
// I-59:STRINGS 1       49 - String Ensemble 1
// I-61:STRINGS 3       50 - String Ensemble 2
// I-76:SOFT TP 1       57 - Trumpet
// I-95:FLUTE 1         74 - Flute
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

// NOTE: All numbers here are 1-based, but in MIDI file and Protocol they
//       are zero based.
const InstU110ToGM = [
  [0,24, 26],
  [0,45, 34],
  [0,55, 53],
  [0,57, 54],
  [0,59, 49],
  [0,61, 50],
  [0,76, 57],
  [0,95, 74],
  [1,1, 7],
  [1,6, 7],
  [1,9, 19],
  [1,15, 20],
  [1,20, 21],
  [3,22,16],
  [5,1, 41],
  [5,2, 42],
  [5,4, 43],
  [5,8, 43],
  [5,10, 47],
  [6,2, 69],
  [6,12, 72],
  [6,13, 72],
  [6,17, 72],
  [6,25, 61],
  [6,35, 115]
];

// The output assigns the instrument stereo positioning
//
// Left       Right
//        2
// 0  4   3   5  1
const OutputToBalance = [
  0,
  31,
  63,
  63,
  94,
  127
];

//
// Parts below are from U110 mapping taken from the .MID as described above.
//
const UG = {
  ReceiveChannel: 0,
  ToneMedia: 1,
  ToneNumber: 2,
  KeyRangeLow: 3,
  KeyRangeHigh: 4,
  Level: 5,
  ProgramOutput: 6
};
//
const u110ToGM = [
// Default patch 0
[
[0, 0, 0, 0, 0x7f, 35, 3],
[0, 0, 0, 0, 0x7f, 35, 3],
[0, 0, 0, 0, 0x7f, 35, 3],
[0, 0, 0, 0, 0x7f, 35, 3],
[0, 0, 0, 0, 0x7f, 35, 3],
[0, 0, 0, 0, 0x7f, 35, 3],
],
//Patch: UltimaThm - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 0, 75, 48, 91, 28, 1],
[0, 0, 58, 0, 127, 20, 0],
[0, 6, 24, 48, 60, 28, 2],
[0, 0, 75, 47, 71, 23, 3],
[0, 0, 75, 72, 84, 25, 4],
[5, 0, 1, 0, 127, 127, 6],
],
//Patch: BritncLnds - OMode: 0-1:S16  2:3  3:4  4:4  5:4
[
[0, 5, 9, 0, 74, 55, 4],
[0, 0, 58, 0, 127, 17, 1],
[0, 6, 34, 0, 43, 127, 1],
[0, 5, 9, 67, 127, 65, 5],
[0, 1, 8, 60, 127, 23, 0],
[5, 0, 11, 0, 127, 127, 6],
],
//Patch: CJsHrnpipe - OMode: 0-1:S16  2:3  3:4  4:4  5:4
[
[0, 5, 0, 0, 88, 55, 0],
[0, 0, 58, 0, 58, 23, 4],
[0, 6, 12, 65, 127, 60, 5],
[0, 6, 12, 1, 64, 50, 3],
[4, 0, 2, 0, 126, 127, 6],
[5, 0, 2, 0, 127, 127, 6],
],
//Patch: Eng.&Melee - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 0, 75, 48, 84, 7, 1],
[0, 0, 58, 0, 83, 20, 0],
[0, 6, 24, 48, 60, 28, 2],
[0, 5, 0, 86, 99, 100, 3],
[0, 0, 75, 72, 84, 16, 4],
[0, 6, 34, 0, 48, 44, 3],
],
//Patch: Stones - OMode: 0-1:S31
[
[0, 3, 21, 0, 77, 127, 0],
[0, 0, 54, 64, 127, 8, 1],
[2, 0, 19, 0, 127, 127, 6],
[3, 0, 19, 0, 127, 127, 6],
[4, 0, 19, 0, 127, 127, 6],
[5, 0, 19, 0, 127, 127, 6],
],
//Patch: GreysnTale - OMode: 0-1:S16  2:3  3:4  4:4  5:4
[
[0, 0, 23, 0, 127, 80, 1],
[0, 6, 16, 60, 127, 25, 5],
[0, 0, 44, 0, 47, 26, 4],
[0, 0, 94, 52, 72, 15, 3],
[0, 6, 34, 0, 51, 127, 6],
[5, 0, 19, 0, 127, 127, 6],
],
//Patch: Fanfare - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 0, 75, 40, 91, 28, 1],
[0, 0, 58, 0, 127, 20, 0],
[0, 6, 24, 48, 60, 28, 2],
[0, 0, 75, 47, 71, 23, 3],
[0, 0, 75, 72, 84, 25, 4],
[0, 6, 34, 0, 48, 54, 3],
],
//Patch: MsngMnarc - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 5, 3, 48, 91, 25, 0],
[0, 0, 58, 0, 127, 24, 1],
[0, 6, 24, 48, 60, 28, 2],
[0, 5, 0, 47, 71, 23, 4],
[0, 6, 34, 0, 46, 55, 3],
[5, 0, 1, 0, 127, 127, 6],
],
//Patch: Tarantella - OMode: 0-1:S16  2:3  3:4  4:4  5:4
[
[0, 5, 7, 0, 127, 32, 1],
[0, 6, 16, 60, 127, 32, 5],
[0, 0, 44, 0, 47, 8, 4],
[0, 6, 1, 52, 72, 20, 3],
[0, 1, 5, 0, 47, 43, 2],
[5, 0, 19, 0, 127, 127, 6],
],
//Patch: HallOfDoom - OMode: 0-1:S31
[
[0, 1, 0, 0, 127, 61, 0],
[0, 0, 58, 0, 127, 13, 1],
[0, 6, 34, 0, 43, 120, 1],
[3, 0, 9, 0, 127, 127, 6],
[4, 0, 9, 0, 127, 127, 6],
[5, 0, 11, 0, 127, 127, 6],
],
//Patch: WrldsBelow - OMode: 0-1:S16  2:3  3:4  4:4  5:4
[
[0, 5, 1, 0, 127, 90, 4],
[0, 0, 60, 0, 127, 55, 0],
[0, 6, 34, 0, 45, 100, 2],
[0, 6, 11, 68, 81, 32, 4],
[0, 1, 0, 0, 81, 17, 5],
[5, 0, 11, 0, 127, 127, 6],
],
//Patch: LordBlkthn - OMode: 0-1:S16  2:7  3:8
[
[0, 1, 14, 0, 127, 25, 0],
[0, 1, 19, 0, 78, 15, 3],
[0, 0, 54, 66, 82, 85, 2],
[0, 0, 11, 0, 127, 127, 6],
[0, 0, 11, 0, 127, 127, 6],
[0, 0, 17, 0, 127, 127, 6],
],
//Patch: DreamOfNan - OMode: 0-1:S31
[
[0, 5, 9, 0, 77, 56, 0],
[0, 0, 56, 63, 127, 4, 1],
[0, 0, 58, 0, 108, 6, 6],
[3, 0, 12, 0, 127, 127, 6],
[4, 0, 19, 0, 127, 127, 6],
[5, 0, 19, 0, 127, 127, 6],
],
//Patch: JoyousReu - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 0, 75, 48, 91, 28, 1],
[0, 0, 58, 0, 127, 20, 0],
[0, 6, 24, 48, 60, 28, 2],
[0, 0, 75, 47, 71, 23, 4],
[0, 6, 34, 0, 48, 55, 3],
[5, 0, 1, 0, 127, 127, 6],
],
//Patch: RuleBritn - OMode: 0:11  1:8  2:4  3:4  4:4
[
[0, 0, 94, 24, 91, 22, 1],
[0, 0, 58, 0, 127, 15, 0],
[0, 6, 24, 48, 60, 28, 2],
[0, 0, 75, 47, 71, 23, 3],
[0, 0, 75, 72, 84, 25, 4],
[5, 0, 1, 0, 127, 127, 6],
]
];

let gmNoteLookup = new Array(0);

const setupGMPatch = (which: number) => {
  const device = midiOutDevices[midiOutIndex];

  gmNoteLookup = new Array(128);
  gmNoteLookup.fill(0);

  if (which === 0)
    return;

  const patch = u110ToGM[which];
  console.log("Patch: ", which, patch);

  for(let i=0;i<6;i++)
  {
    // If program output is > 5, channel is unused
    if (patch[i][UG.ProgramOutput] > 5)
      continue;

    // find GM instrument
    let gmi = 128;
    const TM = patch[i][UG.ToneMedia];
    const TN = patch[i][UG.ToneNumber] + 1;
    for(let z=0;z<InstU110ToGM.length;z++)
    {
      if (TM === InstU110ToGM[z][0] && TN === InstU110ToGM[z][1] )
      {
        gmi = InstU110ToGM[z][2] - 1;
        break;
      }
    }

    // XXX hack
    //if (gmi === 116)
    //  continue;

    if (gmi === 128)
    {
      console.log("Instrument (" + TM + " " + TN + ") not found!");
      gmi = 1; //default to piano?
    }

    console.log("Channel " + i + " inst: " + gmi + " Range: " + patch[i][UG.KeyRangeLow].toString(16) + "-" + patch[i][UG.KeyRangeHigh].toString(16));

    // send change program
    let arr = [0xc0+i, gmi];
    //console.log(arr);
    device.send( arr );
    // send change volume
    let vol = patch[i][UG.Level] * 2;   // volumes seem way too quiet
    if (vol > 127)
      vol = 127;
    arr = [0xb0+i, 0x07, vol];
    //console.log(arr);
    //device.send( arr );

    const pan = OutputToBalance[patch[i][UG.ProgramOutput]];

    // send change balance
    //arr = [0xb0+i, 0x08, pan];
    //console.log(arr);
    //device.send( arr );
    // send change pan
    arr = [0xb0+i, 0x0a, pan];
    //console.log(arr);
    device.send( arr );

    // set notes used in this patch
    for(let j=patch[i][UG.KeyRangeLow];j<=patch[i][UG.KeyRangeHigh];j++)
      gmNoteLookup[j] |= (1<<i);
  }
}

const parseMsg = (msg: number[]) => {
  const device = midiOutDevices[midiOutIndex];

  let notes = 0;
  const no = msg[0];
  if (u5midi)
  {
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
  }

  let msgs: number[] = [];
  if (notes)
  {
    //let nn = "012345";
    //let nx = "";
    for(let i=0;i<6;i++)
    {
      if (notes & (1<<i))
      {
        //nx = nx + ( no==0x80?"X":"O" );
        msg[0] = no+i;
        msgs = msgs.concat(msg);
        //device.send(msg);
      }
      else
      {
        //nx = nx + " ";
      }
    }

    //console.log(nn);
    //console.log(nx);
  }
  else
  {
    msgs = msgs.concat(msg);
    //console.log( no==0x80?"X":"O" );
  }

  //console.log(msgs.map(function (x) {return x.toString(16);}).toString());
  device.send(msgs);
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

    const msg: number[] = [];
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
