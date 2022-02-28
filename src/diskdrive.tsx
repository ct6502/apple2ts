import React from "react";
import { SWITCHES } from "./motherboard"
import disk2off from './img/disk2off.png'
import disk2on from './img/disk2on.png'
import disk2offEmpty from './img/disk2off-empty.png'
import disk2onEmpty from './img/disk2on-empty.png'
import driveMotor from './audio/driveMotor.mp3'
import driveTrack from './audio/driveTrack.mp3'


// export const SWITCHES = {
//   TEXT: NewSwitch(0xC050, 0xC051, true),
//   MIXED: NewSwitch(0xC052),
//   PAGE2: NewSwitch(0xC054),
//   HIRES: NewSwitch(0xC056),
//   DRVSM0: NewSwitch(0xC080 + SLOT6),
//   DRVSM1: NewSwitch(0xC082 + SLOT6),
//   DRVSM2: NewSwitch(0xC084 + SLOT6),
//   DRVSM3: NewSwitch(0xC086 + SLOT6),
//   DRIVE: NewSwitch(0xC088 + SLOT6),
//   DRVSEL: NewSwitch(0xC08A + SLOT6),
//   DRVDATA: NewSwitch(0xC08C + SLOT6),
//   DRVWRITE: NewSwitch(0xC08E + SLOT6),
// }

export let track = 0
let readMode = false
let previousMotor = -1

export const doResetDrive = () => {
  track = 17
  previousMotor = -1
  SWITCHES.DRIVE.set = false
}

let motorContext: AudioContext | undefined
let motorElement: HTMLAudioElement | undefined
let motorTimeout = 0

let trackStart: Array<number> = new Array(40)
let trackBits: Array<number> = new Array(40)
let diskData: Uint8Array = new Uint8Array()
let trackLocation = 0

let trackContext: AudioContext | undefined
let trackElement: HTMLAudioElement | undefined
let trackTimeout = 0
//let startTime = 0

const playTrackOutOfRange = () => {
  // const p = performance.now()
  // console.log(" time=" + (p - startTime))
  // startTime = p
  if (!trackContext) {
    trackContext = new AudioContext();
    trackElement = new Audio(driveTrack);
    trackElement.volume = 0.25
    const node = trackContext.createMediaElementSource(trackElement);
    node.connect(trackContext.destination);
  }
  if (trackContext.state === 'suspended') {
    trackContext.resume();
  }
  if (!trackElement?.paused) {
    window.clearTimeout(trackTimeout)
    trackTimeout = window.setTimeout(() => trackElement?.pause(), 309);
    return
  }
  const playPromise = trackElement?.play();
  if (playPromise) {
    playPromise.then(function() {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => trackElement?.pause(), 309);

    }).catch(function(error) {
      console.log(error)
    });
  }
}

const moveHead = (offset: number) => {
  track += offset
  if (track < 0 || track > 34) {
    playTrackOutOfRange()
    track = (track < 0) ? 0 : (track > 34 ? 34 : track)
  } else {

  }
}

export const handleDriveSwitch = (addr: number): number => {
  let result = 0
  const i = SWITCHES.DRVSM0.addrOn
  const motorAddresses = [i, i+2, i+4, i+6];
  const offsetMotor = [1, 2, 3, 0]
  let currentMotor = motorAddresses.findIndex((i) => i === addr)
  if (currentMotor >= 0) {
    if (previousMotor >= 0) {
      if (offsetMotor[previousMotor] === currentMotor) {
        moveHead(0.5)
      } else if (offsetMotor[currentMotor] === previousMotor) {
        moveHead(-0.5)
      }
    }
//    console.log("phase curr=" + currentMotor + " prev=" + previousMotor + " track=" + track)
    previousMotor = currentMotor
  } else if (addr === SWITCHES.DRVWRITE.addrOff) {
    readMode = true
  } else if (addr === SWITCHES.DRVWRITE.addrOn) {
    readMode = false
  } else if (addr === SWITCHES.DRVDATA.addrOff && readMode) {
    if (diskData.length > 0) {
      trackLocation = trackLocation % trackBits[track]
      const fileOffset = trackStart[track] + (trackLocation >> 3)
      if ((fileOffset) < diskData.length) {
        const data = (diskData[fileOffset] << 8) | diskData[fileOffset + 1]
        const startBit = trackLocation % 8
        // Strip off bits from front, and keep 10 bits
        result = (data & (2**(16 - startBit) - 1)) >> (6 - startBit)
        if (result === 0b1111111100) {
          trackLocation += 10
          result = 0xFF
        } else {
          trackLocation += 8
          result = result >> 2
        }
//        console.log("  byte=" + result.toString(16))
      } else {
        console.error("diskData: out of range subscript")
      }
    }
  }
  return result
}

const decodeWoz2 = () => {
  const woz2 = [0x57, 0x4F, 0x5A, 0x32, 0xFF, 0x0A, 0x0D, 0x0A]
  for (let i = 0; i < woz2.length; i++) {
    if (diskData[i] !== woz2[i]) {
      console.log("Illegal WOZ2 file")
      diskData = new Uint8Array()
      return
    }
  }
  for (let track=0; track < 40; track++) {
    const index = 256 + 8*diskData[88 + track*4]
    const trk = diskData.slice(index, index + 8)
    trackStart[track] = 512*(trk[0] + (trk[1] << 8))
    // const nBlocks = trk[2] + (trk[3] << 8)
    trackBits[track] = trk[4] + (trk[5] << 8) + (trk[6] << 16) + (trk[7] << 24)
  }
}

const doMotorTimeout = () => {
  motorElement?.pause()
  motorTimeout = 0
}

const handleMotorAudio = () => {
  if (!SWITCHES.DRIVE.set) {
    return
  }
  if (!motorContext) {
    motorContext = new AudioContext();
    motorElement = new Audio(driveMotor);
    motorElement.loop = true
    motorElement.volume = 0.25
    document.body.appendChild(motorElement);
    const node = motorContext.createMediaElementSource(motorElement);
    node.connect(motorContext.destination);
  }
  if (!motorElement) {
    return
  }
  if (motorContext.state === 'suspended') {
    motorContext.resume();
  }
  if (!motorElement.paused) {
    window.clearTimeout(motorTimeout)
    motorTimeout = window.setTimeout(() => doMotorTimeout(), 1000);
    return
  }
  const playPromise = motorElement.play();
  if (playPromise) {
    playPromise.then(function() {
    window.clearTimeout(motorTimeout)
    motorTimeout = window.setTimeout(() => doMotorTimeout(), 1000);
    }).catch(function(error) {
      console.log(error)
    });
  }
}

let fileName = ''

class DiskDrive extends React.Component<{}, {fileName: string}> {

  // Hidden file input element
  hiddenFileInput: HTMLInputElement | null = null;

  constructor(props: any) {
    super(props);
    this.state = { fileName: '' };
  }

  readDisk = async (file: File) => {
    const buffer = await file.arrayBuffer();
    diskData = new Uint8Array(buffer);
    decodeWoz2()
    this.setState({
      fileName: (diskData.length > 0) ? file.name : '',
    });
  }

  handleDiskClick = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.files?.length) {
      this.readDisk(e.target.files[0])
    }
  };

  render() {
    handleMotorAudio()
    const img = (diskData.length > 0) ?
      (motorTimeout ? disk2on : disk2off) :
      (motorTimeout ? disk2onEmpty : disk2offEmpty)
    return (
      <span>
        <span className="fixed">{track}</span>
        <button className="disk2">
          <img src={img} alt={fileName}
            onClick={() => this.hiddenFileInput!.click()} />
        </button>
        <input
          type="file"
          ref={input => this.hiddenFileInput = input}
          onChange={this.handleDiskClick}
          style={{display: 'none'}}
        />
      </span>
    );
  }
}

export default DiskDrive;
