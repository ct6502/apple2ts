import { SWITCHES } from "./motherboard";

//let audioContext: AudioContext
//let speaker: OscillatorNode

// export const getAudioContext = () => {
//   if (!audioContext) {
//     audioContext = new AudioContext()
//   }
//   return audioContext
// }

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

export let track = 40
let previousMotor = -1

export const doResetDrive = () => {
  track = 40
  previousMotor = -1
  SWITCHES.DRIVE.set = false
}

export const handleDriveSwitch = (addr: number) => {
  const i = SWITCHES.DRVSM0.addrOn
  const motorAddresses = [i, i+2, i+4, i+6];
  const offsetMotor = [1, 2, 3, 0]
  let currentMotor = motorAddresses.findIndex((i) => i === addr)
  if (currentMotor >= 0) {
    if (previousMotor >= 0) {
      if (offsetMotor[previousMotor] === currentMotor) {
        track += 0.5
      } else if (offsetMotor[currentMotor] === previousMotor) {
        track -= 0.5
      }
    }
    if (track < 0) { track = 0 }
    if (track > 35) { track = 35 }
    previousMotor = currentMotor
  }
}
