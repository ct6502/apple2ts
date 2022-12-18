import { Buffer } from "buffer"
import { passDriveProps, passDriveSound } from "./emulator/worker2main"
import { SWITCHES } from "./softswitches"
import { cycleCount } from './instructions'
import { toHex, DRIVE } from "./utility"
import { decodeDiskData } from "./decodedisk"

const initDriveState = (): DriveState => {
  return {
    filename: "",
    halftrack: 0,
    prevHalfTrack: 0,
    writeMode: false,
    currentPhase: 0,
    diskHasChanges: false,
    motorRunning: false,
    trackStart: Array<number>(80),
    trackNbits: Array<number>(80),
    trackLocation: 0,
    isWriteProtected: false
  }
}
let driveState: DriveState[] = [initDriveState(), initDriveState()];
const diskData = [new Uint8Array(), new Uint8Array()]

let currentDrive = 0
let motorOffTimeout: any = 0

export const getDriveState = () => {
  const driveData = [Buffer.from(diskData[0]).toString("base64"),
    Buffer.from(diskData[1]).toString("base64")]
  return { currentDrive: currentDrive, driveState: driveState, driveData: driveData }
}

const passData = () => {
  for (let i = 0; i < driveState.length; i++) {
    const dprops: DriveProps = {
      drive: i,
      filename: driveState[i].filename,
      motorRunning: driveState[i].motorRunning,
      halftrack: driveState[i].halftrack,
      diskHasChanges: driveState[i].diskHasChanges,
      diskData: diskData[i]
    }
    passDriveProps(dprops)
  }
}

export const setDriveState = (newState: any) => {
  currentDrive = newState.currentDrive
  driveState = newState.driveState
  for (let i = 0; i < driveState.length; i++) {
    if ("fileName" in newState.driveState[i]) {
      driveState[i].filename = newState.driveState[i].fileName
      delete (driveState[i] as any).fileName
    }
    if ("diskImageHasChanges" in newState.driveState[i]) {
      driveState[i].diskHasChanges = newState.driveState[i].diskImageHasChanges
      delete (driveState[i] as any).diskImageHasChanges
    }
    if ("motorIsRunning" in newState.driveState[i]) {
      driveState[i].motorRunning = newState.driveState[i].motorIsRunning
      delete (driveState[i] as any).motorIsRunning
    }
  }
  diskData[0] = new Uint8Array(Buffer.from(newState.driveData[0], 'base64'))
  diskData[1] = new Uint8Array(Buffer.from(newState.driveData[1], 'base64'))
  passData()
}

export const doResetDrive = () => {
  SWITCHES.DRIVE.isSet = false
  doMotorTimeout()
  driveState[0].halftrack = 68
  driveState[0].prevHalfTrack = 68
  driveState[1].halftrack = 68
  driveState[1].prevHalfTrack = 68
  passData()
}

export const doPauseDrive = (resume = false) => {
  if (resume) {
    if (driveState[currentDrive].motorRunning) {
      startMotor()
    }
  } else {
    passDriveSound(DRIVE.MOTOR_OFF)
  }
}

const moveHead = (offset: number) => {
  const dd = driveState[currentDrive]
  if (dd.trackStart[dd.halftrack] > 0) {
    dd.prevHalfTrack = dd.halftrack
  }
  dd.halftrack += offset
  if (dd.halftrack < 0 || dd.halftrack > 68) {
    passDriveSound(DRIVE.TRACK_END)
    dd.halftrack = (dd.halftrack < 0) ? 0 : (dd.halftrack > 68 ? 68 : dd.halftrack)
  } else {
    passDriveSound(DRIVE.TRACK_SEEK)
  }
  passData()
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
    dd.diskHasChanges = true
    dataRegister = 0
  }
}

const doMotorTimeout = () => {
  motorOffTimeout = 0
  if (!SWITCHES.DRIVE.isSet) {
    driveState[currentDrive].motorRunning = false
  }
  passData()
  passDriveSound(DRIVE.MOTOR_OFF)
}

const startMotor = () => {
  if (motorOffTimeout) {
    clearTimeout(motorOffTimeout)
    motorOffTimeout = 0
  }
  driveState[currentDrive].motorRunning = true
  passData()
  passDriveSound(DRIVE.MOTOR_ON)
}

const stopMotor = () => {
  if (motorOffTimeout === 0) {
    motorOffTimeout = setTimeout(() => doMotorTimeout(), 1000);
  }
}

let debugCache:number[] = []
const doDebugDrive = false

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
    if (dd.motorRunning && !dd.writeMode) {
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
    if (driveState[1 - currentDrive].motorRunning) {
      driveState[1 - currentDrive].motorRunning = false
      driveState[currentDrive].motorRunning = true
      for (let i = 0; i < driveState.length; i++) {
        passData()
      }
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
      if (dd.motorRunning && ascend.isSet) {
        moveHead(1)
        dd.currentPhase = (dd.currentPhase + 1) % 4

      } else if (dd.motorRunning && descend.isSet) {
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
    if (dd.motorRunning && dd.writeMode) {
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
    if (dd.motorRunning) {
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

export const doSetDriveProps = (props: DriveProps) => {
  driveState[props.drive] = initDriveState()
  diskData[props.drive] = new Uint8Array()
  driveState[props.drive].filename = props.filename
  if (props.diskData.length > 0) {
    diskData[props.drive] = decodeDiskData(driveState[props.drive], props.diskData)
  }
  passData()
}
