import React from "react"
import DiskDrive from "./diskdrive"
import { DRIVE } from "./emulator/utility"
import { mp3List } from "./assets"
import { DiskImageChooser } from "./diskimagechooser"
import {isAudioEnabled, registerAudioContext} from "./speaker"
import { handleSetDiskData } from "./main2worker"

const hasAudioContext = typeof AudioContext !== 'undefined'
let playDriveNoise = hasAudioContext
let motorAudio: AudioDevice | undefined
let trackSeekAudio: AudioDevice | undefined
let trackOffEndAudio: AudioDevice | undefined
let trackTimeout = 0

const playAudio = (audioDevice: AudioDevice | undefined, timeout: number) => {
  if (!playDriveNoise || !audioDevice) {
    audioDevice?.context.suspend()
    return
  }
  if (audioDevice.context.state === 'suspended') {
    audioDevice.context.resume();
  }
  const playPromise = audioDevice.element.play();
  if (playPromise) {
    playPromise.then(() => {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => audioDevice?.context.suspend(), timeout)
    }).catch((error: DOMException) => {
//      console.log(error)
    })
  }
}

const constructAudio = (mp3track: any) => {
  if (!hasAudioContext) return
  const audioDevice: AudioDevice = {
    context: new AudioContext(),
    element: new Audio(mp3track)
  }
  registerAudioContext(audioDevice.context)
  audioDevice.element.volume = 0.5
  const node = audioDevice.context.createMediaElementSource(audioDevice.element);
  node.connect(audioDevice.context.destination);
  return audioDevice
}

const playRequestAudio = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(mp3List.mp3TrackSeek)
  }
//   playAudio(trackSeekAudio, 1)
}

const playTrackOffEnd = () => {
  if (isAudioEnabled) {
    if (!trackOffEndAudio) {
      trackOffEndAudio = constructAudio(mp3List.mp3TrackOffEnd)
    }
    playAudio(trackOffEndAudio, 309)
  }
}

const playTrackSeek = () => {
  if (isAudioEnabled) {
    if (!trackSeekAudio) {
      trackSeekAudio = constructAudio(mp3List.mp3TrackSeek)
    }
    playAudio(trackSeekAudio, 50)
  }
}

const playMotorOn = () => {
  if (!isAudioEnabled) return
  if (!motorAudio) {
    motorAudio = constructAudio(mp3List.mp3DriveMotor)
    if (motorAudio) motorAudio.element.loop = true
  }
  if (!playDriveNoise || !motorAudio) {
    motorAudio?.context.suspend()
    return
  }
  if (motorAudio.context.state === 'suspended' && isAudioEnabled) {
    motorAudio.context.resume();
  }
  const playPromise = motorAudio.element.play();
  if (playPromise) {
    playPromise.then(() => {
    }).catch((error: DOMException) => {
      console.log(error)
    })
  }
}

const playMotorOff = () => {
  motorAudio?.context.suspend()
}

export const doPlayDriveSound = (sound: DRIVE) => {
  switch (sound) {
    case DRIVE.REQUEST_AUDIO:
      playRequestAudio()
      break
    case DRIVE.MOTOR_OFF:
      playMotorOff()
      break
    case DRIVE.MOTOR_ON:
      playMotorOn()
      break
    case DRIVE.TRACK_END:
      playTrackOffEnd()
      break
    case DRIVE.TRACK_SEEK:
      playTrackSeek()
      break
  }
}

export const resetAllDiskDrives = () => {
  handleSetDiskData(0, new Uint8Array(), "")
  handleSetDiskData(1, new Uint8Array(), "")
  handleSetDiskData(2, new Uint8Array(), "")
}

class DiskInterface extends React.Component<{
  speedCheck: boolean
  }, {}> {
  render() {
    if (this.props.speedCheck !== playDriveNoise) {
      playDriveNoise = this.props.speedCheck && hasAudioContext
    }
    return (
      <span className="drives">
        <DiskImageChooser/>
          <DiskDrive drive={0}/>
          <DiskDrive drive={1}/>
          <DiskDrive drive={2}/>
      </span>
    );
  }
}

export default DiskInterface;
