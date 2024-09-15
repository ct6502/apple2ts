import { passDriveSound } from "../worker2main"
import { s6502 } from '../instructions'
import { toHex, DRIVE } from "../utility/utility"
import { getCurrentDriveData, getCurrentDriveState, passData, setCurrentDrive } from "./drivestate"
import { setSlotDriver, setSlotIOCallback } from "../memory"
import { disk2driver } from "../roms/slot_disk2_cx00"

let motorOffTimeout: NodeJS.Timeout | number = 0
let dataRegister = 0
let cycleRemainder = 0

enum SWITCH {
  MOTOR_OFF = 8,        // $C088
  MOTOR_ON = 9,         // $C089
  DRIVE1 = 0xA,         // $C08A
  DRIVE2 = 0xB,         // $C08B
  LATCH_OFF = 0xC, // $C08C
  LATCH_ON = 0xD,  // $C08D
  WRITE_OFF = 0xE,      // $C08E
  WRITE_ON = 0xF        // $C08F
}

let MOTOR_RUNNING = false
let DATA_LATCH = false

export const doResetDiskDrive = (driveState: DriveState) => {
  MOTOR_RUNNING = false
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

const moveHead = (ds: DriveState, offset: number, cycles: number) => {
  ds.prevHalfTrack = ds.halftrack
  ds.halftrack += offset
  if (ds.halftrack < 0 || ds.halftrack > 68) {
    passDriveSound(DRIVE.TRACK_END)
    ds.halftrack = (ds.halftrack < 0) ? 0 : (ds.halftrack > 68 ? 68 : ds.halftrack)
  } else {
    passDriveSound(DRIVE.TRACK_SEEK)
  }
  ds.status = ` Trk ${ds.halftrack / 2}`
  passData()
  // Adjust new track location based on arm position relative to old track loc.
  // This is needed for disks that rely on cross-track synchronization.
  // const oldloc = dState.trackLocation
  // console.log(`moveHead: ${ds.prevHalfTrack}->${ds.halftrack} cycles=${cycles} PC=${toHex(s6502.PC)} loc=${ds.trackLocation} ${ds.trackNbits[ds.prevHalfTrack]} ${ds.trackNbits[ds.halftrack]}`)
  ds.trackLocation += Math.floor(cycles / 4) % ds.trackNbits[ds.prevHalfTrack]
  cycleRemainder = cycles % 4
  ds.trackLocation = Math.round(ds.trackLocation * (ds.trackNbits[ds.halftrack] / ds.trackNbits[ds.prevHalfTrack]))
}

let randPos = 0
// should be roughly 30% 1's according to article.
const randBits = [0,1,1,0,1,0,0,0,1,0,0,1,0,0,0,1,0,1,0,1,0,0,0,1,0,0,0,0,0,0,0,1]
const randBit = () => {
  randPos++
  return randBits[randPos&0x1f]
}

// Algorithm for "weak bits" comes from https://applesaucefdc.com/woz/reference2/
// with a modification to actually return the current bit rather than the
// previous bit. With the original algorithm, disks that expect the fake bits
// (like Print Shop Companion) would boot properly, but the MECC Computer Inspector
// would fail on its disk drive check, presumably because it was never getting
// that last bit. Now, we still check for weak bits and return a random bit,
// otherwise we just return the passed in bit.
let headWindow = 0
const weakBitWindow = (bit: number) => {
  headWindow <<= 1
  headWindow |= bit
  headWindow &= 0x0F
  if (headWindow === 0x00) {
    return randBit()
  }
  return bit;
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
    bit = weakBitWindow(bit);
  } else {
    // Freak out like a MC3470 and return random bits
    bit = randBit()
  }
  ds.trackLocation++
  return bit
}

const randByte = () => Math.floor(256 * Math.random())

const getNextByte = (ds: DriveState, dd: Uint8Array, cycles: number) => {
  // const tracklocSave = ds.trackLocation
  // If no disk then return random noise from the drive.
  // Some programs (like anti-m) use this to check if no disk is inserted.
  if (dd.length === 0) return randByte()
  let result = 0
  // By default we read 7 bits all at once, followed later by the 8th bit.
  // This should work fine for "normal" disks. However, some disks
  // (like Print Shop Companion) have synchronized tracks that require
  // returning bits one at a time.
  if (!ds.isSynchronized && dataRegister === 0) {
    while (getNextBit(ds, dd) === 0) {null}
    // This will become the high bit on the next read
    dataRegister = 0x40
    // Read the next 6 bits, all except the last one.
    // If we try to read all 8 bits here, it's much slower than
    // reading the last bit separately. Not sure why.
    for (let i = 5; i >= 0; i--) {
      dataRegister |= getNextBit(ds, dd) << i
    }
  } else {
    // Read the last bit.
    const nread = Math.max(Math.floor((cycles + cycleRemainder) / 4), 1)
    cycleRemainder = cycles
    for (let i = 0; i < nread; i++) {
      const bit = getNextBit(ds, dd)
      dataRegister = (dataRegister << 1) | bit
      cycleRemainder -= 4
      if (dataRegister & 128 || cycleRemainder < 4) break
    }
    if (cycleRemainder < 0) {
      cycleRemainder = 0
    }
    dataRegister &= 0xFF
  }
  result = dataRegister
  // if (s6502.PC >= 0x9E45 && s6502.PC <= 0x9E5F) {
  //   console.log(`  getNextByte: ${cycles} cycles PC=${toHex(s6502.PC, 4)} loc=${tracklocSave} dataRegister=${toHex(dataRegister)}`)
  // }
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

const doWriteByte = (ds: DriveState, dd: Uint8Array, cycles: number) => {
  // Sanity check to make sure we aren't on an empty track. Is this correct?
  if (dd.length === 0 || ds.trackStart[ds.halftrack] === 0) {
    return
  }
  if (dataRegister > 0) {
    if (cycles >= 16) {
      for (let i = 7; i >= 0; i--) {
        doWriteBit(ds, dd, dataRegister & 2**i ? 1 : 0)      
      }
    }
    if (cycles >= 36) {
      doWriteBit(ds, dd, 0)
    }
    if (cycles >= 40) {
      doWriteBit(ds, dd, 0)
    }
    debugCache.push(cycles >= 40 ? 2 : cycles >= 36 ? 1 : dataRegister)
    ds.diskHasChanges = true
    dataRegister = 0
  }
}

const doMotorTimeout = (ds: DriveState) => {
  motorOffTimeout = 0
  if (!MOTOR_RUNNING) {
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

const dumpData = (ds: DriveState) => {
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

const STEPPER_MOTORS = [0, 0, 0, 0]

export const handleDriveSoftSwitches: AddressCallback =
  (addr: number, value: number): number => {
  // We don't care about memgets to our card firmware, only to our card I/O
  if (addr >= 0xC100) return -1
  let ds = getCurrentDriveState()
  const dd = getCurrentDriveData()
  if (ds.hardDrive) return 0
  let result = 0
  const cycles = s6502.cycleCount - prevCycleCount
  addr = addr & 0xF

  switch (addr) {
    case SWITCH.LATCH_OFF:  // SHIFT/READ
      DATA_LATCH = false
      // See additional comment about read in the MOTOR_OFF case below.
      if (ds.motorRunning && !ds.writeMode) {
        result = getNextByte(ds, dd, cycles)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = s6502.cycleCount
      }
      break
    case SWITCH.MOTOR_ON:
      MOTOR_RUNNING = true
      startMotor(ds)
      dumpData(ds)
      break
    case SWITCH.MOTOR_OFF:
      // According to Sather, Understanding the Apple IIe, p. 9-13,
      // any even address $C08*,X will load data from the data register.
      // Apparently Mr Do.woz relies on this behavior and reads from $C088,X,
      // which is technically the "motor off" switch.
      // I tried doing a read for every even address but that broke Hard Hat Mack.woz,
      // presumably because there was an unexpected read happening and the
      // data was getting thrown away. So instead, we will only do the "extra"
      // read for $C088,X address.
      // This way both Mr. Do and Hard Hat Mack work.
      if (ds.motorRunning && !ds.writeMode) {
        result = getNextByte(ds, dd, cycles)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = s6502.cycleCount
      }
      MOTOR_RUNNING = false
      stopMotor(ds)
      dumpData(ds)
      break
    case SWITCH.DRIVE1: // fall thru
    case SWITCH.DRIVE2: {
      const currentDrive = (addr === SWITCH.DRIVE1) ? 2 : 3
      const dsOld = getCurrentDriveState()
      setCurrentDrive(currentDrive)
      ds = getCurrentDriveState()
      if (ds !== dsOld && dsOld.motorRunning) {
        dsOld.motorRunning = false
        ds.motorRunning = true
        passData()
      }
      break
    }
    case SWITCH.WRITE_OFF:  // READ, Q7LOW
      if (ds.motorRunning && ds.writeMode) {
        doWriteByte(ds, dd, cycles)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = s6502.cycleCount
      }
      ds.writeMode = false
      if (DATA_LATCH) {
        result = ds.isWriteProtected ? 0xFF : 0
      }
      dumpData(ds)
      break
    case SWITCH.WRITE_ON:  // WRITE, Q7HIGH
      ds.writeMode = true
      // Reset the Disk II Logic State Sequencer clock
      prevCycleCount = s6502.cycleCount
      if (value >= 0) {
        dataRegister = value
      }
      break
    case SWITCH.LATCH_ON:  // LOAD/READ, Q6HIGH
      DATA_LATCH = true
      if (ds.motorRunning) {
        if (ds.writeMode) {
          doWriteByte(ds, dd, cycles)
          // Reset the Disk II Logic State Sequencer clock
          prevCycleCount = s6502.cycleCount
        }
        if (value >= 0) {
          dataRegister = value
        }
      }
      break
    default: {
      if (addr < 0 || addr > 7) break
      // One of the stepper motors has been turned on or off
      STEPPER_MOTORS[Math.floor(addr / 2)] = addr % 2
      const ascend = STEPPER_MOTORS[(ds.currentPhase + 1) % 4]
      const descend = STEPPER_MOTORS[(ds.currentPhase + 3) % 4]
      // Make sure our current phase motor has been turned off.
      if (!STEPPER_MOTORS[ds.currentPhase]) {
        if (ds.motorRunning && ascend) {
          moveHead(ds, 1, cycles)
          ds.currentPhase = (ds.currentPhase + 1) % 4

        } else if (ds.motorRunning && descend) {
          moveHead(ds, -1, cycles)
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
      dumpData(ds)
      break
    }
  }

  return result
}

export const enableDiskDrive = () => {
  setSlotDriver(6, Uint8Array.from(disk2driver))
  setSlotIOCallback(6, handleDriveSoftSwitches)
}

