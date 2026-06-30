import { constructAudio, DRIVE, playAudio } from "../../../common/utility"
import { isAudioEnabled, registerAudioContext } from "../audio/speaker"
import "./diskinterface.css"

let motorAudio: AudioDevice
let trackSeekAudio: AudioDevice
let trackOffEndAudio: AudioDevice
let motorIsRunning = false

const playTrackOffEnd = () => {
  if (!trackOffEndAudio) {
    trackOffEndAudio = constructAudio(window.assetRegistry.driveTrackOffEnd)
    registerAudioContext((enable: boolean) => {
      // Just turn off audio if disabled, don't bother to turn it
      // back on because this sound is so short.
      if (!enable) trackOffEndAudio.context.suspend()
    })
  }
  if (isAudioEnabled()) playAudio(trackOffEndAudio, 309)
}

const playTrackSeek = () => {
  if (!trackSeekAudio) {
    trackSeekAudio = constructAudio(window.assetRegistry.driveTrackSeekLong)
    registerAudioContext((enable: boolean) => {
      // Just turn off audio if disabled, don't bother to turn it
      // back on because this sound is so short.
      if (!enable) trackSeekAudio.context.suspend()
    })
  }
  if (isAudioEnabled()) playAudio(trackSeekAudio, 50)
}

const playMotorOn = () => {
  motorIsRunning = true
  if (!motorAudio) {
    motorAudio = constructAudio(window.assetRegistry.driveMotor)
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
  if (isAudioEnabled()) playAudio(motorAudio, 600000)
}

const playMotorOff = () => {
  if (motorIsRunning) {
    motorIsRunning = false
    motorAudio.context.suspend()
  }
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

