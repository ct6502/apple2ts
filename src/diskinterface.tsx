import React from "react"
import DiskDrive from "./diskdrive"
import { DRIVE } from "./emulator/utility"
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

const playTrackOffEnd = () => {
  if (!trackOffEndAudio) {
    trackOffEndAudio = constructAudio(mp3TrackOffEnd)
  }
  playAudio(trackOffEndAudio, 309)
}

const playTrackSeek = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(mp3TrackSeek)
  }
  playAudio(trackSeekAudio, 50)
}

const playMotorOn = () => {
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

const playMotorOff = () => {
  motorAudio?.element.pause()
}

export const doPlayDriveSound = (sound: DRIVE) => {
  switch (sound) {
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

class DiskInterface extends React.Component<{speedCheck: boolean}, {}> {
  render() {
    if (this.props.speedCheck !== playDriveNoise) {
      playDriveNoise = this.props.speedCheck
    }
    return (
      <span>
        <span className="drives">
          <DiskDrive drive={2}/>
          <DiskDrive drive={0}/>
          <DiskDrive drive={1}/>
        </span>
      </span>
    );
  }
}

export default DiskInterface;
