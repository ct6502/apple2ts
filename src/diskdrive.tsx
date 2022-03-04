import React from "react";
import { SWITCHES } from "./motherboard"
import disk2off from './img/disk2off.png'
import disk2on from './img/disk2on.png'
import disk2offEmpty from './img/disk2off-empty.png'
import disk2onEmpty from './img/disk2on-empty.png'
import driveMotor from './audio/driveMotor.mp3'
import driveTrack from './audio/driveTrack.mp3'
import { toHex } from "./motherboard";


export let track = 0
let readMode = false
let currentPhase = 0

export const doResetDrive = () => {
  track = 17
  currentPhase = 0
  SWITCHES.DRIVE.set = false
}

let motorContext: AudioContext | undefined
let motorElement: HTMLAudioElement | undefined
let motorTimeout = 0

let trackStart: Array<number> = new Array(40)
let trackNbits: Array<number> = new Array(40)
let diskData = new Uint8Array()
let trackLocation = 0
let isWriteProtected = false

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

const getNextBit = () => {
  trackLocation = trackLocation % trackNbits[track]
  const fileOffset = trackStart[track] + (trackLocation >> 3)
  let byte = diskData[fileOffset]
  let bit = (byte & 2**(7 - trackLocation % 8)) ? 1 : 0
  trackLocation++
  return bit
}

const getNextByte = () => {
  if (diskData.length === 0) {
    return 0
  }
  let result = 0
  let bit = 0
  while (bit === 0) {
    bit = getNextBit()
  }
  result = 0x80
  for (let i = 6; i >= 0; i--) {
    result |= getNextBit() << i
  }
  console.log(" trackLocation=" + trackLocation +
    "  byte=" + toHex(result))
  return result
}

export const handleDriveSoftSwitches = (addr: number): number => {
  let result = 0
  const phaseSwitches = [SWITCHES.DRVSM0, SWITCHES.DRVSM1,
    SWITCHES.DRVSM2, SWITCHES.DRVSM3]
  const a = addr - SWITCHES.DRVSM0.addrOff
  // One of the stepper motors has been turned on or off
  if (a >= 0 && a <= 7) {
    const ascend = phaseSwitches[(currentPhase + 1) % 4]
    const descend = phaseSwitches[(currentPhase + 3) % 4]
    if (!phaseSwitches[currentPhase].set) {
      if (ascend.set) {
        moveHead(0.5)
        currentPhase = (currentPhase + 1) % 4
        console.log("***** phase curr=" + currentPhase + " track=" + track)
      } else if (descend.set) {
        moveHead(-0.5)
        currentPhase = (currentPhase + 3) % 4
        console.log("***** phase curr=" + currentPhase + " track=" + track)
      }
    }
  } else if (addr === SWITCHES.DRVWRITE.addrOff) {
    readMode = true
    if (SWITCHES.DRVDATA.set) {
      result = isWriteProtected ? 0xFF : 0
    }
  } else if (addr === SWITCHES.DRVWRITE.addrOn) {
    readMode = false
  } else if (addr === SWITCHES.DRVDATA.addrOff && readMode) {
    result = getNextByte()
  }
  return result
}

const decodeDiskData = () => {
  const woz2 = [0x57, 0x4F, 0x5A, 0x32, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz2 = woz2.find((value, i) => value !== diskData[i]) === undefined
  if (isWoz2) {
    isWriteProtected = diskData[22] === 1
    for (let track=0; track < 40; track++) {
      const tmap_value = 256 + 8*diskData[88 + track*4]
      const trk = diskData.slice(tmap_value, tmap_value + 8)
      trackStart[track] = 512*(trk[0] + (trk[1] << 8))
      // const nBlocks = trk[2] + (trk[3] << 8)
      trackNbits[track] = trk[4] + (trk[5] << 8) + (trk[6] << 16) + (trk[7] << 24)
    }
    return
  }
  const woz1 = [0x57, 0x4F, 0x5A, 0x31, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz1 = woz1.find((value, i) => value !== diskData[i]) === undefined
  if (isWoz1) {
    isWriteProtected = diskData[22] === 1
    for (let track=0; track < 40; track++) {
      const tmap_value = diskData[88 + track*4]
      trackStart[track] = 256 + tmap_value * 6656
      const trk = diskData.slice(trackStart[track] + 6646, trackStart[track] + 6656)
      trackNbits[track] = trk[2] + (trk[3] << 8)
    }
    return
  }
  console.error("Unknown disk format.")
  diskData = new Uint8Array()
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
    decodeDiskData()
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
