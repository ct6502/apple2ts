import React from "react"
import { Buffer } from "buffer"
import { toHex } from "./utility"
import { SWITCHES } from "./softswitches"
import { cycleCount } from './instructions'
import { uint32toBytes } from "./utility"
import { convertdsk2woz } from "./convertdsk2woz"
import DiskDrive from "./diskdrive"
import driveMotor from './audio/driveMotor.mp3'
import driveTrackOffEnd from './audio/driveTrackOffEnd.mp3'
import driveTrackSeek from './audio/driveTrackSeekLong.mp3'

const emptyDisk = "(empty)"
let doDebugDrive = false

const initDriveState = (): DriveState => {
  return {
    fileName: emptyDisk,
    halftrack: 0,
    prevHalfTrack: 0,
    writeMode: false,
    currentPhase: 0,
    diskImageHasChanges: false,
    motorIsRunning: false,
    trackStart: Array<number>(80),
    trackNbits: Array<number>(80),
    trackLocation: 0,
    isWriteProtected: false
  }
}
let driveState: DriveState[] = [initDriveState(), initDriveState()];
const diskData = [new Uint8Array(), new Uint8Array()]

let currentDrive = 0
let motorOffTimeout = 0

export const getFilename = (drive: number) => {
  if (driveState[drive].fileName !== emptyDisk) {
    let f = driveState[drive].fileName
    const i = f.lastIndexOf('.')
    if (i > 0) {
      f = f.substring(0, i)
    }
    return f
  }
  return null
}

export const getDriveState = () => {
  const driveData = [Buffer.from(diskData[0]).toString("base64"),
    Buffer.from(diskData[1]).toString("base64")]
  return { currentDrive: currentDrive, driveState: driveState, driveData: driveData }
}

const oldFormat = false

export const setDriveState = (newState: any) => {
  if (oldFormat) {
    driveState[0] = newState.dState
    diskData[0] = new Uint8Array(Buffer.from(newState.data, 'base64'))
  } else {
    currentDrive = newState.currentDrive
    driveState = newState.driveState
    diskData[0] = new Uint8Array(Buffer.from(newState.driveData[0], 'base64'))
    diskData[1] = new Uint8Array(Buffer.from(newState.driveData[1], 'base64'))
  }
}

let playDriveNoise = true
let motorContext: AudioContext | undefined
let motorElement: HTMLAudioElement | undefined
let trackSeekContext: AudioContext | undefined
let trackSeekElement: HTMLAudioElement | undefined
let trackOffEndContext: AudioContext | undefined
let trackOffEndElement: HTMLAudioElement | undefined
let trackTimeout = 0

export const doResetDrive = () => {
  SWITCHES.DRIVE.isSet = false
  doMotorTimeout()
  driveState[0].halftrack = 68
  driveState[0].prevHalfTrack = 68
  driveState[1].halftrack = 68
  driveState[1].prevHalfTrack = 68
}

export const doPauseDrive = (resume = false) => {
  if (resume) {
    if (driveState[currentDrive].motorIsRunning) {
      startMotor()
    }
  } else {
    motorElement?.pause()
  }
}

const playTrackOutOfRange = () => {
  if (!playDriveNoise) {
    trackOffEndElement?.pause()
    return
  }
  if (!trackOffEndContext) {
    trackOffEndContext = new AudioContext();
    trackOffEndElement = new Audio(driveTrackOffEnd);
    trackOffEndElement.volume = 0.5
    const node = trackOffEndContext.createMediaElementSource(trackOffEndElement);
    node.connect(trackOffEndContext.destination);
  }
  if (trackOffEndContext.state === 'suspended') {
    trackOffEndContext.resume();
  }
  if (!trackOffEndElement?.paused) {
    window.clearTimeout(trackTimeout)
    trackTimeout = window.setTimeout(() => trackOffEndElement?.pause(), 309);
    return
  }
  const playPromise = trackOffEndElement?.play();
  if (playPromise) {
    playPromise.then(function() {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => trackOffEndElement?.pause(), 309);

    }).catch(function(error) {
      console.log(error)
    });
  }
}

const playTrackSeek = () => {
  if (!playDriveNoise) {
    trackSeekElement?.pause()
    return
  }
  if (!trackSeekContext) {
    trackSeekContext = new AudioContext();
    trackSeekElement = new Audio(driveTrackSeek);
    trackSeekElement.volume = 0.75
    const node = trackSeekContext.createMediaElementSource(trackSeekElement);
    node.connect(trackSeekContext.destination);
  }
  if (trackSeekContext.state === 'suspended') {
    trackSeekContext.resume();
  }
  if (!trackSeekElement?.paused) {
    window.clearTimeout(trackTimeout)
    trackTimeout = window.setTimeout(() => trackSeekElement?.pause(), 50);
    return
  }
  const playPromise = trackSeekElement?.play();
  if (playPromise) {
    playPromise.then(function() {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => trackSeekElement?.pause(), 50);

    }).catch(function(error) {
      console.log(error)
    });
  }
}

const moveHead = (offset: number) => {
  const dd = driveState[currentDrive]
  if (dd.trackStart[dd.halftrack] > 0) {
    dd.prevHalfTrack = dd.halftrack
  }
  dd.halftrack += offset
  if (dd.halftrack < 0 || dd.halftrack > 68) {
    playTrackOutOfRange()
    dd.halftrack = (dd.halftrack < 0) ? 0 : (dd.halftrack > 68 ? 68 : dd.halftrack)
  } else {
    playTrackSeek()
  }
  // Adjust new track location based on arm position relative to old track loc.
  if (dd.trackStart[dd.halftrack] > 0 && dd.prevHalfTrack !== dd.halftrack) {
    // const oldloc = dState.trackLocation
    dd.trackLocation = Math.floor(dd.trackLocation * (dd.trackNbits[dd.halftrack] / dd.trackNbits[dd.prevHalfTrack]))
    if (dd.trackLocation > 3) {
      dd.trackLocation -= 4
    }
  }
}

const pickbit = [128, 64, 32, 16, 8, 4, 2, 1]
const clearbit = [0b01111111, 0b10111111, 0b11011111, 0b11101111,
  0b11110111, 0b11111011, 0b11111101, 0b11111110]

const getNextBit = () => {
  const dd = driveState[currentDrive]
  dd.trackLocation = dd.trackLocation % dd.trackNbits[dd.halftrack]
  let bit: number
  if (dd.trackStart[dd.halftrack] > 0) {
    const fileOffset = dd.trackStart[dd.halftrack] + (dd.trackLocation >> 3)
    const byte = diskData[currentDrive][fileOffset]
    const b = dd.trackLocation & 7
    bit = (byte & pickbit[b]) >> (7 - b)
  } else {
    // TODO: Freak out like a MC3470 and return random bits
    bit = 1
  }
  dd.trackLocation++
  return bit
}

let dataRegister = 0

const getNextByte = () => {
  if (diskData[currentDrive].length === 0) return 0
  let result = 0
  if (dataRegister === 0) {
    while (getNextBit() === 0) {}
    // This will become the high bit on the next read
    dataRegister = 0x40
    // Read the next 6 bits, all except the last one.
    for (let i = 5; i >= 0; i--) {
      dataRegister |= getNextBit() << i
    }
  } else {
    // Read the last bit.
    const bit = getNextBit()
    dataRegister = (dataRegister << 1) | bit
  }
  result = dataRegister
  if (dataRegister > 127) {
    dataRegister = 0
  }
  return result
}

let prevCycleCount = 0

const doWriteBit = (bit: 0 | 1) => {
  const dd = driveState[currentDrive]
  dd.trackLocation = dd.trackLocation % dd.trackNbits[dd.halftrack]
  // TODO: What about writing to empty tracks?
  if (dd.trackStart[dd.halftrack] > 0) {
    const fileOffset = dd.trackStart[dd.halftrack] + (dd.trackLocation >> 3)
    let byte = diskData[currentDrive][fileOffset]
    const b = dd.trackLocation & 7
    if (bit) {
      byte |= pickbit[b]
    } else {
      byte &= clearbit[b]
    }
    diskData[currentDrive][fileOffset] = byte
  }
  dd.trackLocation++
}

const doWriteByte = (delta: number) => {
  const dd = driveState[currentDrive]
  // Sanity check to make sure we aren't on an empty track. Is this correct?
  if (diskData[currentDrive].length === 0 || dd.trackStart[dd.halftrack] === 0) {
    return
  }
  if (dataRegister > 0) {
    if (delta >= 16) {
      for (let i = 7; i >= 0; i--) {
        doWriteBit(dataRegister & 2**i ? 1 : 0)      
      }
    }
    if (delta >= 36) {
      doWriteBit(0)
    }
    if (delta >= 40) {
      doWriteBit(0)
    }
    debugCache.push(delta >= 40 ? 2 : delta >= 36 ? 1 : dataRegister)
    dd.diskImageHasChanges = true
    dataRegister = 0
  }
}

let debugCache:number[] = []

const dumpData = (addr: number) => {
  // if (dataRegister !== 0) {
  //   console.error(`addr=${toHex(addr)} writeByte= ${dataRegister}`)
  // }
  if (debugCache.length > 0 && driveState[currentDrive].halftrack === 2 * 0x00) {
    if (doDebugDrive) {
      let output = `TRACK ${toHex(driveState[currentDrive].halftrack/2)}: `
      let out = ''
      debugCache.forEach(element => {
        switch (element) {
          case 1: out = 'Ff'; break;
          case 2: out = 'FF'; break;
          default: out = element.toString(16); break;
        }
        output += out + ' '
      });
      console.log(output)
    }
    debugCache = []
  }
}

export const handleDriveSoftSwitches =
  (addr: number, value: number): number => {
  const dd = driveState[currentDrive]
  let result = 0
  const delta = cycleCount - prevCycleCount
  // if (doDebugDrive && value !== 0x96) {
  //   const dc = (delta < 100) ? `  deltaCycles=${delta}` : ''
  //   const wb = (dataRegister > 0) ? `  writeByte=$${toHex(dataRegister)}` : ''
  //   const v = (value > 0) ? `  value=$${toHex(value)}` : ''
  //   console.log(`write ${dd.writeMode}  addr=$${toHex(addr)}${dc}${wb}${v}`)
  // }
  if (addr === SWITCHES.DRVDATA.offAddr) {  // $C08C SHIFT/READ
    if (dd.motorIsRunning && !dd.writeMode) {
      return getNextByte()
    }
  }
  if (addr === SWITCHES.DRIVE.onAddr) {  // $C089
    startMotor()
    dumpData(addr)
    return result
  }
  if (addr === SWITCHES.DRIVE.offAddr) {  // $C088
    stopMotor()
    dumpData(addr)
    return result
  }
  if (addr === SWITCHES.DRVSEL.offAddr || addr === SWITCHES.DRVSEL.onAddr) {
    currentDrive = (addr === SWITCHES.DRVSEL.offAddr) ? 0 : 1
    if (driveState[1 - currentDrive].motorIsRunning) {
      driveState[1 - currentDrive].motorIsRunning = false
      driveState[currentDrive].motorIsRunning = true
    }
    return result
  }
  const ps = [SWITCHES.DRVSM0, SWITCHES.DRVSM1,
    SWITCHES.DRVSM2, SWITCHES.DRVSM3]
  const a = addr - SWITCHES.DRVSM0.offAddr
  // One of the stepper motors has been turned on or off
  if (a >= 0 && a <= 7) {
    const ascend = ps[(dd.currentPhase + 1) % 4]
    const descend = ps[(dd.currentPhase + 3) % 4]
    // Make sure our current phase motor has been turned off.
    if (!ps[dd.currentPhase].isSet) {
      if (dd.motorIsRunning && ascend.isSet) {
        moveHead(1)
        dd.currentPhase = (dd.currentPhase + 1) % 4

      } else if (dd.motorIsRunning && descend.isSet) {
        moveHead(-1)
        dd.currentPhase = (dd.currentPhase + 3) % 4
      }
    }
    // if (doDebugDrive) {
    //   const phases = `${ps[0].isSet ? 1 : 0}${ps[1].isSet ? 1 : 0}` +
    //     `${ps[2].isSet ? 1 : 0}${ps[3].isSet ? 1 : 0}`
    //   console.log(`***** PC=${toHex(s6502.PC,4)}  addr=${toHex(addr,4)} ` +
    //     `phase ${a >> 1} ${a % 2 === 0 ? "off" : "on "}  ${phases}  ` +
    //     `track=${dState.halftrack / 2}`)
    // }
    dumpData(addr)
  } else if (addr === SWITCHES.DRVWRITE.offAddr) {  // $C08E READ
    if (dd.motorIsRunning && dd.writeMode) {
      doWriteByte(delta)
      // Reset the Disk II Logic State Sequencer clock
      prevCycleCount = cycleCount
    }
    dd.writeMode = false
    if (SWITCHES.DRVDATA.isSet) {
      result = dd.isWriteProtected ? 0xFF : 0
    }
    dumpData(addr)
  } else if (addr === SWITCHES.DRVWRITE.onAddr) {  // $C08F WRITE
    dd.writeMode = true
    // Reset the Disk II Logic State Sequencer clock
    prevCycleCount = cycleCount
    if (value >= 0) {
      dataRegister = value
    }
  } else if (addr === SWITCHES.DRVDATA.onAddr) {  // $C08D LOAD/READ
    if (dd.motorIsRunning) {
      if (dd.writeMode) {
        doWriteByte(delta)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = cycleCount
      }
      if (value >= 0) {
        dataRegister = value
      }
    }
  }

  return result
}

let crcTable = new Uint32Array(256).fill(0)

const makeCRCTable = () => {
  let c;
  for (let n =0; n < 256; n++) {
    c = n;
    for (let k =0; k < 8; k++) {
      c = ((c&1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    }
    crcTable[n] = c;
  }
}

export const crc32 = (data: Uint8Array, offset = 0) => {
  if (crcTable[255] === 0) {
    makeCRCTable()
  }
  let crc = 0 ^ (-1);
  for (let i = offset; i < data.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ data[i]) & 0xFF];
  }

  return (crc ^ (-1)) >>> 0;
};

const decodeWoz2 = (drive: number): boolean => {
  const dd = driveState[drive]
  const woz2 = [0x57, 0x4F, 0x5A, 0x32, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz2 = woz2.find((value, i) => value !== diskData[drive][i]) === undefined
  if (!isWoz2) return false
  dd.isWriteProtected = diskData[drive][22] === 1
  const crc = diskData[drive].slice(8, 12)
  const storedCRC = crc[0] + (crc[1] << 8) + (crc[2] << 16) + crc[3] * (2 ** 24)
  const actualCRC = crc32(diskData[drive], 12)
  if (storedCRC !== 0 && storedCRC !== actualCRC) {
    alert("CRC checksum error: " + dd.fileName)
    return false
  }
  for (let htrack=0; htrack < 80; htrack++) {
    const tmap_index = diskData[drive][88 + htrack * 2]
    if (tmap_index < 255) {
      const tmap_offset = 256 + 8 * tmap_index
      const trk = diskData[drive].slice(tmap_offset, tmap_offset + 8)
      dd.trackStart[htrack] = 512*(trk[0] + (trk[1] << 8))
      // const nBlocks = trk[2] + (trk[3] << 8)
      dd.trackNbits[htrack] = trk[4] + (trk[5] << 8) + (trk[6] << 16) + trk[7] * (2 ** 24)
    } else {
      dd.trackStart[htrack] = 0
      dd.trackNbits[htrack] = 51200
//        console.log(`empty woz2 track ${htrack / 2}`)
    }
  }
  return true
}

const decodeWoz1 = (drive: number): boolean => {
  const dd = driveState[drive]
  const woz1 = [0x57, 0x4F, 0x5A, 0x31, 0xFF, 0x0A, 0x0D, 0x0A]
  const isWoz1 = woz1.find((value, i) => value !== diskData[drive][i]) === undefined
  if (!isWoz1) {
    return false
  }
  dd.isWriteProtected = diskData[drive][22] === 1
  for (let htrack=0; htrack < 80; htrack++) {
    const tmap_index = diskData[drive][88 + htrack * 2]
    if (tmap_index < 255) {
      dd.trackStart[htrack] = 256 + tmap_index * 6656
      const trk = diskData[drive].slice(dd.trackStart[htrack] + 6646, dd.trackStart[htrack] + 6656)
      dd.trackNbits[htrack] = trk[2] + (trk[3] << 8)
    } else {
      dd.trackStart[htrack] = 0
      dd.trackNbits[htrack] = 51200
//        console.log(`empty woz1 track ${htrack / 2}`)
    }
  }
  return true
}

const decodeDSK = (drive: number) => {
  const dd = driveState[drive]
  const f = dd.fileName.toUpperCase()
  const isDSK = f.endsWith(".DSK") || f.endsWith(".DO")
  const isPO = f.endsWith(".PO")
  if (!isDSK && !isPO) return false
  diskData[drive] = convertdsk2woz(diskData[drive], isPO)
  if (diskData[drive].length === 0) return false
  dd.fileName = getFilename(drive) + '.woz'
  dd.diskImageHasChanges = true
  return decodeWoz2(drive)
}

const decodeDiskData = (drive: number): boolean => {
  driveState[drive].diskImageHasChanges = false
  if (decodeWoz2(drive)) {
    return true
  }
  if (decodeWoz1(drive)) {
    return true
  }
  if (decodeDSK(drive)) {
    return true
  }
  console.error("Unknown disk format.")
  diskData[drive] = new Uint8Array()
  return false
}

const doMotorTimeout = () => {
  motorOffTimeout = 0
  if (!SWITCHES.DRIVE.isSet) {
    driveState[currentDrive].motorIsRunning = false
    motorElement?.pause()
  }
}

const startMotor = () => {
  if (motorOffTimeout) {
    clearTimeout(motorOffTimeout)
    motorOffTimeout = 0
  }
  driveState[currentDrive].motorIsRunning = true
  if (!playDriveNoise) {
    motorElement?.pause()
    return
  }
  if (!motorContext) {
    motorContext = new AudioContext();
    motorElement = new Audio(driveMotor);
    motorElement.loop = true
    motorElement.volume = 0.5
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
    return
  }
  motorElement.play();
}

const stopMotor = () => {
  if (motorOffTimeout === 0) {
    motorOffTimeout = window.setTimeout(() => doMotorTimeout(), 1000);
  }
}

class DiskInterface extends React.Component<{speedCheck: boolean}, {}> {

  // Hidden file input element
  hiddenFileInput1: HTMLInputElement | null = null;
  hiddenFileInput2: HTMLInputElement | null = null;
  // https://medium.com/@650egor/simple-drag-and-drop-file-upload-in-react-2cb409d88929
  handleDrop = (e: any) => {this.dropHandler(e as DragEvent)}
  handleDrag = (e: DragEvent) => 
    {e.preventDefault(); e.stopPropagation()}

  componentDidMount() {
    window.addEventListener('drop', this.handleDrop)
    window.addEventListener('dragover', this.handleDrag)
  }

  componentWillUnmount() {
    window.removeEventListener('drop', this.handleDrop)
    window.removeEventListener('dragover', this.handleDrag)
  }

  readDisk = async (file: File, drive: number) => {
    const buffer = await file.arrayBuffer();
    diskData[drive] = new Uint8Array(buffer);
    driveState[drive].fileName = file.name
    if (!decodeDiskData(drive)) {
      driveState[drive].fileName = emptyDisk
    }
    this.forceUpdate()
  }

  resetDrive = (drive: number) => {
    diskData[drive] = new Uint8Array()
    driveState[drive].fileName = emptyDisk
  }

  downloadDisk = (drive: number) => {
    const crc = crc32(diskData[drive], 12)
    diskData[drive].set(uint32toBytes(crc), 8)
    const blob = new Blob([diskData[drive]]);
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', driveState[drive].fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  dropHandler = (e: DragEvent) => {    
    e.preventDefault()
    e.stopPropagation()
    const f = e.dataTransfer?.files
    if (f && f.length > 0) {
      this.readDisk(f[0], 0)
    }
  }

  render() {
    if (this.props.speedCheck !== playDriveNoise) {
      playDriveNoise = this.props.speedCheck
    }
    return (
      <span>
        <span>
        <DiskDrive drive={0} driveState={driveState[0]}
          diskData={diskData[0]} readDisk={this.readDisk}
          resetDrive={this.resetDrive}/>
        <DiskDrive drive={1} driveState={driveState[1]}
          diskData={diskData[1]} readDisk={this.readDisk}
          resetDrive={this.resetDrive}/>
        </span>
        <br/>
      </span>
    );
  }
}

export default DiskInterface;
