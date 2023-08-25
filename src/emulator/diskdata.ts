import { passDriveSound } from "./worker2main"
import { cycleCount } from './instructions'
import { toHex, DRIVE } from "./utility"
import { getCurrentDriveData, getCurrentDriveState, passData, setCurrentDrive } from "./drivestate"
import { setSlotDriver, setSlotIOCallback } from "./memory"
import { disk2driver } from "./roms/slot_disk2_cx00"

let motorOffTimeout: any = 0

const SWITCH = {
  MOTOR_OFF: 8,
  MOTOR_ON: 9,
  DRIVE1: 0xA,
  DRIVE2: 0xB,
  DATA_LATCH_OFF: 0xC,
  DATA_LATCH_ON: 0xD,
  WRITE_OFF: 0xE,
  WRITE_ON: 0xF,
  MOTOR_RUNNING: false,
  DATA_LATCH: false,
}
export const doResetDiskDrive = (driveState: DriveState) => {
  SWITCH.MOTOR_RUNNING = false
  doMotorTimeout(driveState)
  driveState.halftrack = 68
  driveState.prevHalfTrack = 68
}

export const doPauseDiskDrive = (resume = false) => {
  if (resume) {
    const ds = getCurrentDriveState()
    if (ds.motorRunning) {
      startMotor(ds)
    }
  } else {
    passDriveSound(DRIVE.MOTOR_OFF)
  }
}

const moveHead = (ds: DriveState, offset: number) => {
  if (ds.trackStart[ds.halftrack] > 0) {
    ds.prevHalfTrack = ds.halftrack
  }
  ds.halftrack += offset
  if (ds.halftrack < 0 || ds.halftrack > 68) {
    passDriveSound(DRIVE.TRACK_END)
    ds.halftrack = (ds.halftrack < 0) ? 0 : (ds.halftrack > 68 ? 68 : ds.halftrack)
  } else {
    passDriveSound(DRIVE.TRACK_SEEK)
  }
  ds.status = ` Track ${ds.halftrack / 2}`
  passData()
  // Adjust new track location based on arm position relative to old track loc.
  if (ds.trackStart[ds.halftrack] > 0 && ds.prevHalfTrack !== ds.halftrack) {
    // const oldloc = dState.trackLocation
    ds.trackLocation = Math.floor(ds.trackLocation * (ds.trackNbits[ds.halftrack] / ds.trackNbits[ds.prevHalfTrack]))
    if (ds.trackLocation > 3) {
      ds.trackLocation -= 4
    }
  }
}

const pickbit = [128, 64, 32, 16, 8, 4, 2, 1]
const clearbit = [0b01111111, 0b10111111, 0b11011111, 0b11101111,
  0b11110111, 0b11111011, 0b11111101, 0b11111110]

const getNextBit = (ds: DriveState, dd: Uint8Array) => {
  ds.trackLocation = ds.trackLocation % ds.trackNbits[ds.halftrack]
  let bit: number
  if (ds.trackStart[ds.halftrack] > 0) {
    const fileOffset = ds.trackStart[ds.halftrack] + (ds.trackLocation >> 3)
    const byte = dd[fileOffset]
    const b = ds.trackLocation & 7
    bit = (byte & pickbit[b]) >> (7 - b)
  } else {
    // TODO: Freak out like a MC3470 and return random bits
    bit = 1
  }
  ds.trackLocation++
  return bit
}

let dataRegister = 0

const getNextByte = (ds: DriveState, dd: Uint8Array) => {
  if (dd.length === 0) return 0
  let result = 0
  if (dataRegister === 0) {
    while (getNextBit(ds, dd) === 0) {}
    // This will become the high bit on the next read
    dataRegister = 0x40
    // Read the next 6 bits, all except the last one.
    for (let i = 5; i >= 0; i--) {
      dataRegister |= getNextBit(ds, dd) << i
    }
  } else {
    // Read the last bit.
    const bit = getNextBit(ds, dd)
    dataRegister = (dataRegister << 1) | bit
  }
  result = dataRegister
  if (dataRegister > 127) {
    dataRegister = 0
  }
  return result
}

let prevCycleCount = 0

const doWriteBit = (ds: DriveState, dd: Uint8Array, bit: 0 | 1) => {
  ds.trackLocation = ds.trackLocation % ds.trackNbits[ds.halftrack]
  // TODO: What about writing to empty tracks?
  if (ds.trackStart[ds.halftrack] > 0) {
    const fileOffset = ds.trackStart[ds.halftrack] + (ds.trackLocation >> 3)
    let byte = dd[fileOffset]
    const b = ds.trackLocation & 7
    if (bit) {
      byte |= pickbit[b]
    } else {
      byte &= clearbit[b]
    }
    dd[fileOffset] = byte
  }
  ds.trackLocation++
}

const doWriteByte = (ds: DriveState, dd: Uint8Array, delta: number) => {
  // Sanity check to make sure we aren't on an empty track. Is this correct?
  if (dd.length === 0 || ds.trackStart[ds.halftrack] === 0) {
    return
  }
  if (dataRegister > 0) {
    if (delta >= 16) {
      for (let i = 7; i >= 0; i--) {
        doWriteBit(ds, dd, dataRegister & 2**i ? 1 : 0)      
      }
    }
    if (delta >= 36) {
      doWriteBit(ds, dd, 0)
    }
    if (delta >= 40) {
      doWriteBit(ds, dd, 0)
    }
    debugCache.push(delta >= 40 ? 2 : delta >= 36 ? 1 : dataRegister)
    ds.diskHasChanges = true
    dataRegister = 0
  }
}

const doMotorTimeout = (ds: DriveState) => {
  motorOffTimeout = 0
  if (!SWITCH.MOTOR_RUNNING) {
    ds.motorRunning = false
  }
  passData()
  passDriveSound(DRIVE.MOTOR_OFF)
}

const startMotor = (ds: DriveState) => {
  if (motorOffTimeout) {
    clearTimeout(motorOffTimeout)
    motorOffTimeout = 0
  }
  ds.motorRunning = true
  passData()
  passDriveSound(DRIVE.MOTOR_ON)
}

const stopMotor = (ds: DriveState) => {
  if (motorOffTimeout === 0) {
    motorOffTimeout = setTimeout(() => doMotorTimeout(ds), 1000);
  }
}

let debugCache:number[] = []
const doDebugDrive = false

const dumpData = (ds: DriveState, addr: number) => {
  // if (dataRegister !== 0) {
  //   console.error(`addr=${toHex(addr)} writeByte= ${dataRegister}`)
  // }
  if (debugCache.length > 0 && ds.halftrack === 2 * 0x00) {
    if (doDebugDrive) {
      let output = `TRACK ${toHex(ds.halftrack/2)}: `
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

let STEPPER_MOTORS = [0, 0, 0, 0]

export const handleDriveSoftSwitches: AddressCallback =
  (addr: number, value: number): number => {
  // We don't care about memgets to our card firmware, only to our card I/O
  if (addr >= 0xC100) return -1
  let ds = getCurrentDriveState()
  let dd = getCurrentDriveData()
  if (ds.hardDrive) return 0
  let result = 0
  const delta = cycleCount - prevCycleCount
  // if (doDebugDrive && value !== 0x96) {
  //   const dc = (delta < 100) ? `  deltaCycles=${delta}` : ''
  //   const wb = (dataRegister > 0) ? `  writeByte=$${toHex(dataRegister)}` : ''
  //   const v = (value > 0) ? `  value=$${toHex(value)}` : ''
  //   console.log(`write ${ds.writeMode}  addr=$${toHex(addr)}${dc}${wb}${v}`)
  // }
  addr = addr & 0xF
  switch (addr) {
    case SWITCH.DATA_LATCH_OFF:  // SHIFT/READ
      SWITCH.DATA_LATCH = false
      if (ds.motorRunning && !ds.writeMode) {
        result = getNextByte(ds, dd)
      }
      break
    case SWITCH.MOTOR_ON:
      SWITCH.MOTOR_RUNNING = true
      startMotor(ds)
      dumpData(ds, addr)
      break
    case SWITCH.MOTOR_OFF:
      SWITCH.MOTOR_RUNNING = false
      stopMotor(ds)
      dumpData(ds, addr)
      break
    case SWITCH.DRIVE1: // fall thru
    case SWITCH.DRIVE2:
      const currentDrive = (addr === SWITCH.DRIVE1) ? 1 : 2
      const dsOld = getCurrentDriveState()
      setCurrentDrive(currentDrive)
      ds = getCurrentDriveState()
      if (ds !== dsOld && dsOld.motorRunning) {
        dsOld.motorRunning = false
        ds.motorRunning = true
        passData()
      }
      break
    case SWITCH.WRITE_OFF:  // READ, Q7LOW
      if (ds.motorRunning && ds.writeMode) {
        doWriteByte(ds, dd, delta)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = cycleCount
      }
      ds.writeMode = false
      if (SWITCH.DATA_LATCH) {
        result = ds.isWriteProtected ? 0xFF : 0
      }
      dumpData(ds, addr)
      break
    case SWITCH.WRITE_ON:  // WRITE, Q7HIGH
      ds.writeMode = true
      // Reset the Disk II Logic State Sequencer clock
      prevCycleCount = cycleCount
      if (value >= 0) {
        dataRegister = value
      }
      break
    case SWITCH.DATA_LATCH_ON:  // LOAD/READ, Q6HIGH
      SWITCH.DATA_LATCH = true
      if (ds.motorRunning) {
        if (ds.writeMode) {
          doWriteByte(ds, dd, delta)
          // Reset the Disk II Logic State Sequencer clock
          prevCycleCount = cycleCount
        }
        if (value >= 0) {
          dataRegister = value
        }
      }
      break
    default:
      if (addr < 0 || addr > 7) break
      // One of the stepper motors has been turned on or off
      STEPPER_MOTORS[Math.floor(addr / 2)] = addr % 2
      const ascend = STEPPER_MOTORS[(ds.currentPhase + 1) % 4]
      const descend = STEPPER_MOTORS[(ds.currentPhase + 3) % 4]
      // Make sure our current phase motor has been turned off.
      if (!STEPPER_MOTORS[ds.currentPhase]) {
        if (ds.motorRunning && ascend) {
          moveHead(ds, 1)
          ds.currentPhase = (ds.currentPhase + 1) % 4

        } else if (ds.motorRunning && descend) {
          moveHead(ds, -1)
          ds.currentPhase = (ds.currentPhase + 3) % 4
        }
      }
      // if (doDebugDrive) {
      //   const phases = `${ps[0].isSet ? 1 : 0}${ps[1].isSet ? 1 : 0}` +
      //     `${ps[2].isSet ? 1 : 0}${ps[3].isSet ? 1 : 0}`
      //   console.log(`***** PC=${toHex(s6502.PC,4)}  addr=${toHex(addr,4)} ` +
      //     `phase ${a >> 1} ${a % 2 === 0 ? "off" : "on "}  ${phases}  ` +
      //     `track=${dState.halftrack / 2}`)
      // }
      dumpData(ds, addr)
      break
  }

  return result
}

export const enableDiskDrive = () => {
  setSlotDriver(6, Uint8Array.from(disk2driver))
  setSlotIOCallback(6, handleDriveSoftSwitches)
}

