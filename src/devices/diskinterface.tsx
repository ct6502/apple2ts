import React from "react"
import "./diskinterface.css"
import DiskDrive from "./diskdrive"
import { DRIVE } from "../emulator/utility/utility"
import { mp3List } from "./assets"
import { DiskImageChooser } from "./diskimagechooser"
import {isAudioEnabled, registerAudioContext} from "./speaker"
import { handleSetDiskData } from "../main2worker"

let motorAudio: AudioDevice
let trackSeekAudio: AudioDevice
let trackOffEndAudio: AudioDevice
let motorIsRunning = false

const constructAudio = (mp3track: string) => {
  const audioDevice: AudioDevice = {
    context: new AudioContext(),
    element: new Audio(mp3track),
    timeout: 0
  }
  audioDevice.element.volume = 0.5
  const node = audioDevice.context.createMediaElementSource(audioDevice.element);
  node.connect(audioDevice.context.destination);
  return audioDevice
}

const playAudio = (audioDevice: AudioDevice, timeout: number) => {
  if (isAudioEnabled() && audioDevice.context.state === 'suspended') {
    audioDevice.context.resume();
  }
  const playPromise = audioDevice.element.play();
  if (playPromise) {
    playPromise.then(() => {
      window.clearTimeout(audioDevice.timeout)
      audioDevice.timeout = window.setTimeout(() => audioDevice.context.suspend(), timeout)
    }).catch(() => {
//      console.log(error)
    })
  }
}

const playTrackOffEnd = () => {
  if (!trackOffEndAudio) {
    trackOffEndAudio = constructAudio(mp3List.mp3TrackOffEnd)
    registerAudioContext((enable: boolean) => {
      // Just turn off audio if disabled, don't bother to turn it
      // back on because this sound is so short.
      if (!enable) trackOffEndAudio.context.suspend()
    })
  }
  playAudio(trackOffEndAudio, 309)
}

const playTrackSeek = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(mp3List.mp3TrackSeek)
    registerAudioContext((enable: boolean) => {
      // Just turn off audio if disabled, don't bother to turn it
      // back on because this sound is so short.
      if (!enable) trackSeekAudio.context.suspend()
    })
  }
  playAudio(trackSeekAudio, 50)
}

const playMotorOn = () => {
  motorIsRunning = true
  if (!motorAudio) {
    motorAudio = constructAudio(mp3List.mp3DriveMotor)
    motorAudio.element.loop = true
    registerAudioContext((enable: boolean) => {
      if (enable && motorIsRunning && isAudioEnabled()) {
        motorAudio.context.resume()
      } else {
        motorAudio.context.suspend()
      }
    })
  }
  // Motor should stay on forever, but 10 minutes is plenty long.
  playAudio(motorAudio, 600000)
}

const playMotorOff = () => {
  if (motorIsRunning) {
    motorIsRunning = false
    motorAudio.context.suspend()
  }
}

// eslint-disable-next-line react-refresh/only-export-components
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

// eslint-disable-next-line react-refresh/only-export-components
export const resetAllDiskDrives = () => {
  handleSetDiskData(0, new Uint8Array(), "")
  handleSetDiskData(1, new Uint8Array(), "")
  handleSetDiskData(2, new Uint8Array(), "")
}

class DiskInterface extends React.Component<object, object> {
  render() {
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
