import React from "react"
import DiskDrive from "./diskdrive"
import { DRIVE } from "./emulator/utility"
import { mp3List } from "./assets"
import { DiskImageChooser } from "./diskimagechooser"
import {isAudioEnabled, registerAudioContext} from "./speaker"
import { handleSetDiskData } from "./main2worker"

let motorAudio: AudioDevice
let trackSeekAudio: AudioDevice
let trackOffEndAudio: AudioDevice
let trackTimeout = 0

const playAudio = (audioDevice: AudioDevice, timeout: number) => {
  if (audioDevice.context.state === 'suspended') {
    audioDevice.context.resume();
  }
  const playPromise = audioDevice.element.play();
  if (playPromise) {
    playPromise.then(() => {
      window.clearTimeout(trackTimeout)
      trackTimeout = window.setTimeout(() => audioDevice.context.suspend(), timeout)
    }).catch((error: DOMException) => {
//      console.log(error)
    })
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

const playRequestAudio = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(mp3List.mp3TrackSeek)
  }
//   playAudio(trackSeekAudio, 1)
}

const playTrackOffEnd = () => {
  if ((isAudioEnabled())) {
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
}

const playTrackSeek = () => {
  if (isAudioEnabled()) {
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
}

let motorIsRunning = false

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
  if (isAudioEnabled() && motorAudio.context.state === 'suspended') {
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
  if (motorIsRunning) {
    motorIsRunning = false
    motorAudio.context.suspend()
  }
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

class DiskInterface extends React.Component<{}, {}> {
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
