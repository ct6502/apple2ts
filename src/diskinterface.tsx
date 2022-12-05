import React from "react"
import { handleSetDiskData } from "./diskdata"
import DiskDrive from "./diskdrive"
import mp3DriveMotor from './audio/driveMotor.mp3'
import mp3TrackOffEnd from './audio/driveTrackOffEnd.mp3'
import mp3TrackSeek from './audio/driveTrackSeekLong.mp3'

let playDriveNoise = true
let motorAudio: AudioDevice | undefined
let trackSeekAudio: AudioDevice | undefined
let trackOffEndAudio: AudioDevice | undefined
let trackTimeout = 0

const playAudio = (audioDevice: AudioDevice, timeout: number) => {
  if (!playDriveNoise) {
    audioDevice.element.pause()
    return
  }
  if (audioDevice.context.state === 'suspended') {
    audioDevice.context.resume();
  }
  if (!audioDevice.element.paused) {
    window.clearTimeout(trackTimeout)
    trackTimeout = window.setTimeout(() => audioDevice.element.pause(), timeout);
    return
  }
  const playPromise = audioDevice.element.play();
  if (playPromise) {
    playPromise.then(function() {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => audioDevice.element.pause(), timeout);

    }).catch(function(error) {
      console.log(error)
    });
  }
}

const constructAudio = (mp3track: any) => {
  const audioDevice: AudioDevice = {
    context: new AudioContext(),
    element: new Audio(mp3track)
  }
  audioDevice.element.volume = 0.5
  const node = audioDevice.context.createMediaElementSource(audioDevice.element);
  node.connect(audioDevice.context.destination);
  return audioDevice
}

export const handlePlayTrackOffEnd = () => {
  if (!trackOffEndAudio) {
    trackOffEndAudio = constructAudio(mp3TrackOffEnd)
  }
  playAudio(trackOffEndAudio, 309)
}

export const handlePlayTrackSeek = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(mp3TrackSeek)
  }
  playAudio(trackSeekAudio, 50)
}

export const handleMotorOn = () => {
  if (!motorAudio) {
    motorAudio = constructAudio(mp3DriveMotor)
    motorAudio.element.loop = true
  }
  if (!playDriveNoise) {
    motorAudio.element.pause()
    return
  }
  if (motorAudio.context.state === 'suspended') {
    motorAudio.context.resume();
  }
  if (motorAudio.element.paused) {
    motorAudio.element.play();
  }
}

export const handleMotorOff = () => {
  motorAudio?.element.pause()
}

const initDriveProps = (): DriveProps => {
  return {
    drive: 0,
    filename: "",
    halftrack: 0,
    diskHasChanges: false,
    motorRunning: false,
    diskData: new Uint8Array(),
    readDisk: (file: File, drive: number) => {},
    resetDrive: (drive: number) => {},
  }
}
let driveProps: DriveProps[] = [initDriveProps(), initDriveProps()];

export const handleSetFilename = (drive: number, filename: string) => {
  driveProps[drive].filename = filename
}

export const handleSetHalftrack = (drive: number, halftrack: number) => {
  driveProps[drive].halftrack = halftrack
}

export const handleSetDiskHasChanges = (drive: number, hasChanges: boolean) => {
  driveProps[drive].diskHasChanges = hasChanges
}

export const handleSetMotorRunning = (drive: number, motorRunning: boolean) => {
  driveProps[drive].motorRunning = motorRunning
}

export const handleSetData = (drive: number, diskData: Uint8Array) => {
  driveProps[drive].diskData = diskData
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
    handleSetDiskData(drive, new Uint8Array(buffer), file.name)
    this.forceUpdate()
  }

  resetDrive = (drive: number) => {
    handleSetDiskData(drive, new Uint8Array(), "")
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
          {driveProps.map((prop1, i) => (
            <DiskDrive key={i} drive={i}
              filename={prop1.filename}
              motorRunning={prop1.motorRunning}
              halftrack={prop1.halftrack}
              diskHasChanges={prop1.diskHasChanges}
              diskData={prop1.diskData}
              readDisk={this.readDisk}
              resetDrive={this.resetDrive}/>
          ))}
        {/* <DiskDrive drive={0}
          filename={driveProps[0].filename}
          motorRunning={driveProps[0].motorRunning}
          halftrack={driveProps[0].halftrack}
          diskHasChanges={driveProps[0].diskHasChanges}
          diskData={driveProps[0].diskData}
          readDisk={this.readDisk}
          resetDrive={this.resetDrive}/>
        <DiskDrive drive={1} driveState={driveState[1]}
          diskData={diskData[1]} readDisk={this.readDisk}
          resetDrive={this.resetDrive}/> */}
        </span>
        <br/>
      </span>
    );
  }
}

export default DiskInterface;
