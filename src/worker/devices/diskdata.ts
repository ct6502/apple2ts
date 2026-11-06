import { passDriveSound } from "../worker2main"
import { s6502 } from "../instructions"
import { toHex, DRIVE } from "../../common/utility"
import { getCurrentDriveData, getCurrentDriveState, getDriveBitstreamByIndex, getDriveDataByIndex, getDriveStateByIndex, passDriveData, setCurrentDrive } from "./drivestate"
import { setSlotDriver, setSlotIOCallback } from "../memory"
import { disk2driver } from "../roms/slot_disk2_cx00"
import { registerSlotCardState } from "./slot_card_state"
import { spliceFloppy35Track } from "./floppy35"

let motorOffTimeout: NodeJS.Timeout | number = 0
// CPU-cycle deadline for the motor-off delay, and the drive it applies to.
// Zero means "no pending timeout". See stopMotor() for why this is measured in
// cycles rather than wall-clock time.
let motorOffDeadline = 0
let motorOffDrive: DriveState | null = null
let dataRegister = 0
let dataRegHold = false
let cycleRemainder = 0
// 3.5" latch mode (MODE.L=1) assembles a byte privately and publishes it to
// dataRegister35 once bit 7 is set. The LSS then *stops* clocking until the CPU
// reads it (publish35Halts below), which is what the latch is for.
let internalDataRegister35 = 0
let dataRegister35 = 0
// CA0-CA2 and LSTRB are IWM-wide selector lines. A 3.5" drive decodes them
// together with $C031 bit 7 (SEL/HDSEL) into a 16-way status/control function.
let iwmCa35 = [0, 0, 0, 0]
// Last status-selector result for the selected 3.5" drive; surfaced in bit 7
// of the IWM status register.
let sense35 = 0
// 3.5" async write (MODE.H=1). The CPU hands the IWM one byte at a time; the
// LSS clocks it onto the media at the disk bit rate. The handshake register
// ($C0EC with Q7=1, Q6=0) tells the CPU when the buffer is free: bit 7 set =
// load the next byte, bit 6 set = the byte is still being clocked out (the
// ROM's final `BIT $C0EC / BVS` waits for the last byte to reach the disk).
let asyncShift35 = 0
let asyncBitsRemaining35 = 0
let asyncBuffer35 = 0
let asyncBufferValid35 = false
let handshake35 = 0x80
// 3.5" media clock. The spindle rotates continuously while the mechanism is
// enabled, so the position under the head is a function of machine time alone:
// `headRemainder35` holds the fraction of a bit cell and `headPending35` the
// whole cells the LSS has not simulated yet (gssquared's head_position minus
// read_position). Both live at module scope and are fed by every IWM access,
// not just data-register ones; a per-phase remainder let the read side fall
// behind the write side by tens of bit cells and the ROM's rewritten data
// field landed on top of the next address field.
let headRemainder35 = 0
let headPending35 = 0
// Cycles the last iwmAdvance35() accounted for, for the read-cadence sampler.
let iwmAdvanceCycles35 = 0
let writeBurst35 = false
// Which drive the in-flight burst is feeding. The IWM has one shift register
// shared by both 3.5" bays, so a queued byte always belongs to exactly one of
// them - that is what tells a media change whether it may discard it.
let writeBurstDrive35 = -1
// GCR tracks whose bytes were changed, per drive index, still waiting to be
// spliced into that drive's block image.
const dirtyTracks35 = new Map<number, Set<number>>()
let motorOnTime = 0
// let floppyAccessLogCount = 0
const doDebugDrive = false

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

const MAGNET_TO_POSITION = [
// 0000 0001 0010 0011 0100 0101 0110 0111 1000 1001 1010 1011 1100 1101 1110 1111
     -1,   0,   2,   1,   4,  -1,   3,  -1,   6,   7,  -1,  -1,   5,  -1,  -1,  -1
]

const POSITION_TO_DIRECTION = [
//   N  NE   E  SE   S  SW   W  NW
//   0   1   2   3   4   5   6   7
  [  0,  1,  2,  3,  0, -3, -2, -1 ], // 0 N
  [ -1,  0,  1,  2,  3,  0, -3, -2 ], // 1 NE
  [ -2, -1,  0,  1,  2,  3,  0, -3 ], // 2 E
  [ -3, -2, -1,  0,  1,  2,  3,  0 ], // 3 SE
  [  0, -3, -2, -1,  0,  1,  2,  3 ], // 4 S
  [  3,  0, -3, -2, -1,  0,  1,  2 ], // 5 SW
  [  2,  3,  0, -3, -2, -1,  0,  1 ], // 6 W
  [  1,  2,  3,  0, -3, -2, -1,  0 ], // 7 NW
]

export const doResetDiskDrive = (driveState: DriveState) => {
  MOTOR_RUNNING = false
  doMotorTimeout(driveState)
  // Reset the shared read-phase state. These are module-level globals that
  // accumulate fractional bit phase between motor steps; if they are left
  // stale (e.g. after reading for a while before reset, or after mounting a
  // new image mid-session) the LSS nibble timing slips and the ROM syncs
  // briefly then gives up (measured: trackLocation stops at ~639 bits
  // instead of reaching 47,111). Real hardware starts from a clean phase on
  // reset.
  cycleRemainder = 0
  fullRevolutionCount = 0
  headWindow = 0
  randPos = 0
  // Recalibrate the head to track 0. This used to park the head at
  // maxQuarterTrack (the outermost track), which works for a cold boot because
  // the ROM's boot scan seeks inwards and re-calibrates - but a warm reset
  // (Ctrl-Reset) does not re-run the seek, so the head stayed at track 70 and
  // the ROM read the wrong track and never found a boot volume. Real drives
  // spring the head back to track 0 on reset, which is what track 0 here
  // models. Confirmed by gs_floppy_late.test.ts: with the head parked at the
  // outer stop, Ctrl-Reset leaves the Apple IIgs at the ROM banner, and track
  // 0 boots ProDOS.
  driveState.quarterTrack = 0
  driveState.prevQuarterTrack = 0
  // 3.5" mechanics are independent of the 5.25" motor/stepper: the spindle is
  // latched by a CONT35 command, not by /ENBL, and the head springs back to
  // track 0 side 0 on reset. gssquared's Floppy35_woz::reset() does the same.
  driveState.spindleOn = false
  driveState.stepDirection = 0
  driveState.diskSwitched = false
  driveState.stepEnd = 0
  driveState.readyEnd = 0
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

let fullRevolutionCount = 0

const moveHead = (ds: DriveState, offset: number, cycles: number) => {
  fullRevolutionCount = 0
  ds.prevQuarterTrack = ds.quarterTrack
  ds.quarterTrack += offset
  if (ds.quarterTrack < 0 || ds.quarterTrack > ds.maxQuarterTrack) {
    passDriveSound(DRIVE.TRACK_END)
    ds.quarterTrack = Math.max(0, Math.min(ds.quarterTrack, ds.maxQuarterTrack))
  } else {
    passDriveSound(DRIVE.TRACK_SEEK)
  }
  ds.status = ` Trk ${ds.quarterTrack / 4}`
  passDriveData()
  // First adjust the current track location using the cycle count difference.
  // We need to do this before using the Applesauce formula below.
  cycleRemainder += cycles
  ds.trackLocation += Math.floor(cycleRemainder / 4)
  cycleRemainder = cycleRemainder % 4
  // The Applesauce formula: Adjust new track location based on arm position
  // relative to old track loc. This is needed for disks that rely on
  // cross-track synchronization such as Balance of Power.
  // This used to have a bitOffset of +7, taken from a related AppleWin issue:
  // https://github.com/AppleWin/AppleWin/issues/1022
  // However, a better way was given in https://github.com/ct6502/apple2ts/issues/166
  // which was to change the default empty track size from 51200 to 51024 bits.
  // This still allows Balance of Power and Miner 2049er to load, with no offset.
  // const bitOffset = -1
  if (ds.quarterTrack != ds.prevQuarterTrack) {
      ds.trackLocation = Math.floor(ds.trackLocation *
        (ds.trackNbits[ds.quarterTrack] / ds.trackNbits[ds.prevQuarterTrack])) //+ bitOffset
  }
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
  return bit
}

const pickbit = [128, 64, 32, 16, 8, 4, 2, 1]
const clearbit = [0b01111111, 0b10111111, 0b11011111, 0b11101111,
  0b11110111, 0b11111011, 0b11111101, 0b11111110]

const getNextBit = (ds: DriveState, dd: Uint8Array) => {
  const oldLocation = ds.trackLocation
  ds.trackLocation = ds.trackLocation % ds.trackNbits[ds.quarterTrack]
  
  if (oldLocation !== ds.trackLocation) {
    if (fullRevolutionCount >= 9) {
      fullRevolutionCount = 0
      ds.trackLocation += 4
    } else {
      fullRevolutionCount++
    }
  }
  let bit: number
  if (ds.trackStart[ds.quarterTrack] > 0) {
    const fileOffset = ds.trackStart[ds.quarterTrack] + (ds.trackLocation >> 3)
    const byte = dd[fileOffset]
    const b = ds.trackLocation & 7
    bit = (byte & pickbit[b]) >> (7 - b)
    bit = weakBitWindow(bit)
  } else {
    // Freak out like a MC3470 and return random bits
    bit = randBit()
  }
  ds.trackLocation++
  return bit
}

// How many bits getNextByte advanced during its most recent call. Read back by
// iwmReadDataRegister so the read-cadence sampler can see the size of a single
// read's overshoot.
let bitsAdvancedLastCall = 0

// Diagnostic sampler for the Apple IIgs IWM read cadence. This is the
// instrumentation behind the open "5.25\" floppy does not boot in the browser"
// investigation: the Logic State Sequencer advances by however many CPU cycles
// elapsed since the previous data-register read, so a run loop that stalls for
// a long time (rendering, JS GC, input dispatch) makes a single read swallow
// many tracks and the ROM never syncs. These counters quantify that directly.
//
// The sampler is always on but is deliberately cheap (a handful of integer
// counters per read), and is only surfaced to the UI when explicitly requested
// with ?iwmgaps=1.
export interface IwmReadStats {
  reads: number
  // Sum of the CPU cycles observed between consecutive data-register reads.
  totalGapCycles: number
  maxGapCycles: number
  // Largest number of bits a single read advanced the LSS by.
  maxBitsPerRead: number
  // Reads that advanced far enough to cross at least one track boundary, i.e.
  // reads so long that the drive rotated past the position being synced to.
  readsCrossingTrack: number
  // Sum of track boundaries crossed by all reads.
  totalTrackCrossings: number
}

const iwmReadStats: IwmReadStats = {
  reads: 0,
  totalGapCycles: 0,
  maxGapCycles: 0,
  maxBitsPerRead: 0,
  readsCrossingTrack: 0,
  totalTrackCrossings: 0,
}

export const getIwmReadStats = (): IwmReadStats => ({ ...iwmReadStats })

export const resetIwmReadStats = () => {
  iwmReadStats.reads = 0
  iwmReadStats.totalGapCycles = 0
  iwmReadStats.maxGapCycles = 0
  iwmReadStats.maxBitsPerRead = 0
  iwmReadStats.readsCrossingTrack = 0
  iwmReadStats.totalTrackCrossings = 0
}

const sampleIwmRead = (ds: DriveState, gapCycles: number) => {
  const bits = bitsAdvancedLastCall
  iwmReadStats.reads++
  iwmReadStats.totalGapCycles += gapCycles
  if (gapCycles > iwmReadStats.maxGapCycles) iwmReadStats.maxGapCycles = gapCycles
  if (bits > iwmReadStats.maxBitsPerRead) iwmReadStats.maxBitsPerRead = bits
  const trackNbits = ds.trackNbits[ds.quarterTrack]
  if (trackNbits > 0 && bits > trackNbits) {
    iwmReadStats.readsCrossingTrack++
    iwmReadStats.totalTrackCrossings += Math.floor(bits / trackNbits)
  }
}

// When no disk is loaded, return 0x80 so DOS 3.3 and ProDOS RWTS read loops
// (which wait for bit 7 = 1 via BPL) can decrement their Y retry counter and
// time out immediately in ~1ms with an I/O ERROR.
const getNextByte = (ds: DriveState, dd: Uint8Array, cycles: number) => {
  // const tracklocSave = ds.trackLocation
  // If no disk then return 0x80 so DOS 3.3 and ProDOS RWTS time out immediately in ~1ms
  if (dd.length === 0) return 0x80
  let result = 0
  bitsAdvancedLastCall = 0

  // Read individual bits and combine them.
  cycleRemainder += cycles

  while (cycleRemainder >= ds.optimalTiming / 8) {
    const bit = getNextBit(ds, dd)
    bitsAdvancedLastCall++

    // When the data register high bit is set, the data register should
    // hold for at least 4 cycles. Needed for Algernon.woz and others.
    // https://github.com/ct6502/apple2ts/issues/230
    if (dataRegHold) {
      dataRegHold = !bit
    } else {
      if (dataRegister & 0x80) {
        dataRegister = 0x2 | bit
      } else {
        dataRegister = (dataRegister << 1) | bit
        if (dataRegister & 0x80) {
          dataRegHold = true
        }
      }
    }

    // optimalTiming / 8 might be a float if it's not equal to 32.
    // For example, for Paul Whitehead Teaches Chess.woz, optimalTiming = 31.
    // This is actually okay and seems to work fine.
    cycleRemainder -= (ds.optimalTiming / 8)

    // See https://github.com/ct6502/apple2ts/issues/473
    // Electronic Arts copy protection (used for Wasteland and Chuck Yeager)
    // does a checksum off of a 256-byte chunk on track 0. Repeated reads of
    // this track cause the cycleRemainder to accumulate slightly more than expected.
    // To avoid this, subtract a tiny amount. This is a hack, and we're limiting
    // it to track 0 only, to minimize the risk of messing up other disks.
    if (ds.quarterTrack === 0) {
      cycleRemainder = Math.max(cycleRemainder - 0.0001, 0)
    }
  }
  if (cycleRemainder < 0) {
    cycleRemainder = 0
  }
  dataRegister &= 0xFF
  result = dataRegister

  // if (ds.quarterTrack === 140 && dataRegister > 127) {
  //   console.log(toHex(dataRegister))
  // }
  // if (s6502.PC >= 0x9E45 && s6502.PC <= 0x9E5F) {
  //   console.log(`  getNextByte: ${cycles} cycles PC=${toHex(s6502.PC, 4)} loc=${tracklocSave} dataRegister=${toHex(dataRegister)}`)
  // }
  return result
}

let prevCycleCount = 0

const doWriteBit = (ds: DriveState, dd: Uint8Array, bit: 0 | 1) => {
  ds.trackLocation = ds.trackLocation % ds.trackNbits[ds.quarterTrack]
  // TODO: What about writing to empty tracks?
  if (ds.trackStart[ds.quarterTrack] > 0) {
    const fileOffset = ds.trackStart[ds.quarterTrack] + (ds.trackLocation >> 3)
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
  if (dd.length === 0 || ds.trackStart[ds.quarterTrack] === 0) {
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
    ds.lastAppleWriteTime = Date.now()
    dataRegister = 0
  }
}

const doMotorTimeout = (ds: DriveState) => {
  motorOffTimeout = 0
  motorOffDeadline = 0
  motorOffDrive = null
  if (!MOTOR_RUNNING) {
    ds.motorRunning = false
  }
  if (doDebugDrive) {
    const diff = Date.now() - motorOnTime
    if (diff > 10 && diff < 10000000) console.log(`Motor on time: ${diff}ms`)
    motorOnTime = Date.now()
  }
  passDriveData()
  passDriveSound(DRIVE.MOTOR_OFF)
}

const startMotor = (ds: DriveState) => {
  if (motorOffDeadline) {
    // A previous spin-up window was still pending (the motor was being turned
    // on again before it timed out). Drop it so the new window starts clean.
    motorOffDeadline = 0
    motorOffDrive = null
    clearTimeout(motorOffTimeout)
    motorOffTimeout = 0
  } else {
    if (doDebugDrive) motorOnTime = Date.now()
    cycleRemainder = 0
  }
  motorOffDeadline = 0
  motorOffDrive = ds
  ds.motorRunning = true
  passDriveData()
  passDriveSound(DRIVE.MOTOR_ON)
}

// The motor-off delay used to be a wall-clock setTimeout(1000). That ties the
// emulated machine's drive spin-up window to real time, while everything else in
// the machine - including the IWM's Logic State Sequencer and the ROM's own
// "wait for the drive" loop - is measured in CPU cycles. Whenever the two clocks
// drift (a browser that cannot hit 60 fps runs fewer CPU cycles per wall-clock
// second than the 1.02 MHz the machine is nominally at) the drive stops spinning
// before the ROM has finished waiting for it, the boot scan gives up, and the
// Apple IIgs never reaches the floppy. Expressing the delay in CPU cycles keeps
// the two clocks locked together no matter how the host renders.
const MOTOR_OFF_CYCLES = 1020000

const stopMotor = (ds: DriveState) => {
  if (motorOffDeadline === 0) {
    motorOffDeadline = s6502.cycleCount + MOTOR_OFF_CYCLES
    motorOffDrive = ds
  }
}

// Called once per frame from the run loop, in place of the wall-clock timer.
export const processFloppyMotorTimeout = () => {
  if (motorOffDeadline === 0 || s6502.cycleCount < motorOffDeadline) return
  motorOffDeadline = 0
  const ds = motorOffDrive
  if (ds) doMotorTimeout(ds)
}

let debugCache:number[] = []

const dumpData = (ds: DriveState) => {
  // if (dataRegister !== 0) {
  //   console.error(`addr=${toHex(addr)} writeByte= ${dataRegister}`)
  // }
  if (debugCache.length > 0 && ds.quarterTrack === 4 * 0x00) {
    if (doDebugDrive) {
      let output = `TRACK ${toHex(ds.quarterTrack/4)}: `
      let out = ""
      debugCache.forEach(element => {
        switch (element) {
          case 1: out = "Ff"; break
          case 2: out = "FF"; break
          default: out = element.toString(16); break
        }
        output += out + " "
      })
      console.log(output)
    }
    debugCache = []
  }
}

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
    case SWITCH.MOTOR_ON:  // $C089,X
      MOTOR_RUNNING = true
      // if (floppyAccessLogCount < 20) {
      //   floppyAccessLogCount++
      //   console.log(`[Floppy] Motor ON  at PC=$${s6502.PC.toString(16).toUpperCase().padStart(4, "0")} track=${ds.quarterTrack/4} cycle=${s6502.cycleCount}`)
      // }
      startMotor(ds)
      dumpData(ds)
      break
    case SWITCH.MOTOR_OFF:  // $C088,X
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
    case SWITCH.DRIVE1: // $C08A,X: fall thru
    case SWITCH.DRIVE2: // $C08B,X
      {
      const currentDrive = (addr === SWITCH.DRIVE1) ? 2 : 3
      const dsOld = getCurrentDriveState()
      setCurrentDrive(currentDrive)
      ds = getCurrentDriveState()
      if (ds !== dsOld && dsOld.motorRunning) {
        dsOld.motorRunning = false
        ds.motorRunning = true
        passDriveData()
      }
      break
    }
    case SWITCH.LATCH_OFF:  // $C08C,X: SHIFT/READ
      DATA_LATCH = false
      // See additional comment about read in the MOTOR_OFF case below.
      if (ds.motorRunning && !ds.writeMode) {
        result = getNextByte(ds, dd, cycles)
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = s6502.cycleCount
      }
      break
    case SWITCH.LATCH_ON:  // $C08D,X: LOAD/READ, Q6HIGH
      DATA_LATCH = true
      if (ds.motorRunning) {
        if (ds.writeMode) {
          doWriteByte(ds, dd, cycles)
          // Reset the Disk II Logic State Sequencer clock
          prevCycleCount = s6502.cycleCount
          // https://github.com/ct6502/apple2ts/issues/81
          // Needed to move this into the ds.writeMode check.
          // Stickybear Town Builder tries to load the write data latch when
          // writeMode is not enabled. If this is allowed then the game freezes.
          // To avoid this, only set dataRegister if we are in writeMode.
          if (value >= 0) {
            dataRegister = value
          }
        } else {
          // https://github.com/ct6502/apple2ts/issues/81
          // The E7 protection scheme reads $C08D,X in the middle of reading data.
          // This will reset the sequencer and clear the data latch.
          // This is used by Wings of Fury on track 0.
          dataRegister = 0
          cycleRemainder += cycles
          ds.trackLocation += Math.floor(cycleRemainder / 4)
          cycleRemainder = cycleRemainder % 4
          // Reset the Disk II Logic State Sequencer clock
          prevCycleCount = s6502.cycleCount
          // if (value >= 0) {
          //   console.log(`${ds.filename}: Illegal LOAD of write data latch during read: PC=${toHex(s6502.PC)} Value=${toHex(value)}`)
          // } else {
          //   console.log(`${ds.filename}: Illegal READ of write data latch during read: PC=${toHex(s6502.PC)}`)
          // }
        }
      }
      break
    case SWITCH.WRITE_OFF:  // $C08E,X: READ, Q7LOW
      if (ds.motorRunning && ds.writeMode) {
        doWriteByte(ds, dd, cycles)
        ds.lastAppleWriteTime = Date.now()
        // Reset the Disk II Logic State Sequencer clock
        prevCycleCount = s6502.cycleCount
      }
      ds.writeMode = false
      if (DATA_LATCH) {
        result = ds.isWriteProtected ? 0xFF : 0
      }
      dumpData(ds)
      break
    case SWITCH.WRITE_ON:  // $C08F,X: WRITE, Q7HIGH
      ds.writeMode = true
      // Reset the Disk II Logic State Sequencer clock
      prevCycleCount = s6502.cycleCount
      if (value >= 0) {
        dataRegister = value
      }
      break
    default: {  // $C080,X - $C087,X: Stepper motors
      if (addr < 0 || addr > 7) break
      const phase = addr / 2
      const phase_on = addr % 2
      if (phase_on) {
        ds.currentPhase |= 1 << phase
      } else {
        ds.currentPhase &= ~(1 << phase)
      }
      const position = MAGNET_TO_POSITION[ds.currentPhase]
      if (ds.motorRunning && position >= 0) {
        const last_position = ds.quarterTrack & 7
        const direction = POSITION_TO_DIRECTION[last_position][position]
        moveHead(ds, direction, cycles)
        prevCycleCount = s6502.cycleCount
      }

      // if (doDebugDrive) {
      //   const phases = `${ps[0].isSet ? 1 : 0}${ps[1].isSet ? 1 : 0}` +
      //     `${ps[2].isSet ? 1 : 0}${ps[3].isSet ? 1 : 0}`
      //   console.log(`***** PC=${toHex(s6502.PC,4)}  addr=${toHex(addr,4)} ` +
      //     `phase ${a >> 1} ${a % 2 === 0 ? "off" : "on "}  ${phases}  ` +
      //     `track=${dState.quarterTrack / 4}`)
      // }
      dumpData(ds)
      break
    }
  }

  return result
}

// The controller's own state, which the drive states leave out. Without it, a state
// saved while the disk turns loads into a machine that reads different bits.
type Disk2SaveState = {
  dataRegister: number,
  dataRegHold: boolean,
  cycleRemainder: number,
  prevCycleCount: number,
  MOTOR_RUNNING: boolean,
  DATA_LATCH: boolean,
  fullRevolutionCount: number,
  randPos: number,
  headWindow: number,
  motorOffPending: boolean,
}

const getDisk2SaveState = (): Disk2SaveState => ({
  dataRegister,
  dataRegHold,
  cycleRemainder,
  prevCycleCount,
  MOTOR_RUNNING,
  DATA_LATCH,
  fullRevolutionCount,
  randPos,
  headWindow,
  motorOffPending: motorOffTimeout !== 0,
})

const restoreDisk2SaveState = (state: Disk2SaveState) => {
  dataRegister = state.dataRegister
  dataRegHold = state.dataRegHold
  cycleRemainder = state.cycleRemainder
  prevCycleCount = state.prevCycleCount
  MOTOR_RUNNING = state.MOTOR_RUNNING
  DATA_LATCH = state.DATA_LATCH
  fullRevolutionCount = state.fullRevolutionCount
  randPos = state.randPos
  headWindow = state.headWindow
  if (motorOffTimeout) {
    clearTimeout(motorOffTimeout)
    motorOffTimeout = 0
  }
  if (state.motorOffPending) {
    // The motor was spinning down when the state was saved. The drive states are
    // restored after the cards, so look up the current drive when the timer fires.
    motorOffTimeout = setTimeout(() => doMotorTimeout(getCurrentDriveState()), 1000)
  }
}

export const enableDiskDrive = () => {
  setSlotDriver(6, Uint8Array.from(disk2driver))
  setSlotIOCallback(6, handleDriveSoftSwitches)
  registerSlotCardState(
    6,
    "disk2",
    getDisk2SaveState,
    state => restoreDisk2SaveState(state as Disk2SaveState),
  )
}

// Apple IIgs slot 5: the built-in 3.5" drive. It has no card ROM and no $C0xx
// I/O of its own - the IWM at $C0E0-$C0EF reaches both drive families, choosing
// slot 5 or slot 6 from the Disk Control Port's EN35 bit. All slot 5 needs is
// the $C02D SLTROMSEL bit set (done by configureMachine) so the ROM's boot scan
// and the disk-control firmware see a drive there instead of internal ROM.
export const enableDiskDrive35 = () => {
  iwmResetTiming()
  iwmReset35Lines()
}

// --- Apple IIgs Integrated Woz Machine (IWM) data path ---------------------
//
// The IIgs has no Disk II card: both built-in drives are reached through the
// IWM at $C0E0-$C0EF. The IWM's Logic State Sequencer shifts one bit per bit
// cell *continuously*; the CPU samples whatever is latched in the data register
// when it reads. gssquared models this by advancing the LSS to "now" on every
// IWM register access (IWM2.hpp read()/write() both start with fast_forward()),
// so we do the same: advance on every access, then service the register.

let iwmPrevCycleCount = 0

// Reset the IWM sequencer timing. Call after a reset so a long pause (menu,
// breakpoint) does not dump thousands of bits into the shift register.
export const iwmResetTiming = () => {
  iwmPrevCycleCount = s6502.cycleCount
  cycleRemainder = 0
  headRemainder35 = 0
  headPending35 = 0
  dataRegister = 0
  dataRegHold = false
  // Start a fresh read-cadence profile for the new boot attempt so each phase
  // can be compared on its own.
  resetIwmReadStats()
}

// ---------------------------------------------------------------------------
// Apple IIgs 3.5" (Sony) drive mechanics
//
// The mechanism shares CA0-CA2/LSTRB with the 5.25" stepper but decodes them
// as a 4-bit selector together with $C031 bit 7 (SEL/HDSEL): a status function
// driven by CA2|CA1|CA0|SEL is read from IWM status bit 7, and a control
// function with the same selector fires on the LSTRB rising edge. Selectors
// $8/$9 additionally latch the active head (side). Ported from gssquared
// Floppy35_woz.cpp / NeilA235Floppy.md.
// ---------------------------------------------------------------------------

const FLOPPY35_MAX_TRACK = 79

const update35Timers = (ds: DriveState) => {
  if (ds.stepEnd !== 0 && s6502.cycleCount >= ds.stepEnd) ds.stepEnd = 0
  if (ds.readyEnd !== 0 && s6502.cycleCount >= ds.readyEnd) ds.readyEnd = 0
}

// Angular-preserving track/side switch. A 3.5" track's bit count varies by
// zone, so the head position has to be scaled by the same ratio gssquared uses
// in Floppy_woz::update_track_ptr(), or a seek lands mid-nibble in the new zone.
const moveHead35 = (ds: DriveState, newQuarterTrack: number) => {
  if (newQuarterTrack === ds.quarterTrack) return
  const oldQuarterTrack = ds.quarterTrack
  const oldBits = ds.trackNbits[oldQuarterTrack] || 0
  const newBits = ds.trackNbits[newQuarterTrack] || 0
  ds.prevQuarterTrack = oldQuarterTrack
  ds.quarterTrack = newQuarterTrack
  // The head is over a different track now; bit phase carried from the old one
  // is meaningless (and the new track can hold a different number of cells).
  headRemainder35 = 0
  headPending35 = 0
  if (oldBits > 0 && newBits > 0) {
    ds.trackLocation = Math.floor(ds.trackLocation * (newBits / oldBits))
  }
  ds.trackLocation = newBits > 0 ? ds.trackLocation % newBits : 0
  fullRevolutionCount = 0
  // The drive panel shows the head position from `status`. For a 3.5" drive the
  // index counts track-sides (80 tracks x 2), not quarters of a 5.25" track.
  ds.status = ` Trk ${ds.quarterTrack >> 1}`
  passDriveData()
}

const setSide35 = (ds: DriveState, side: number) => {
  moveHead35(ds, (ds.quarterTrack & ~1) | side)
}

const select35 = (hdsel: number) =>
  (iwmCa35[2] << 3) | (iwmCa35[1] << 2) | (iwmCa35[0] << 1) | (hdsel & 1)

// LSTRB off->on edge: run the control function selected by CA2|CA1|CA0|SEL.
// gssquared only honours control strobes while ENABLE is asserted.
const triggerControl35 = (ds: DriveState, hdsel: number) => {
  switch (select35(hdsel)) {
    case 0x0: // step direction inward (toward higher tracks)
      ds.stepDirection = 0
      break
    case 0x8: // step direction outward
      ds.stepDirection = 1
      break
    case 0x9: // reset the disk-switched latch
      ds.diskSwitched = false
      break
    case 0x2: { // step one track in the current direction
      const track = (ds.quarterTrack >> 1) + (ds.stepDirection ? -1 : 1)
      if (track < 0 || track > FLOPPY35_MAX_TRACK) break
      const oldQuarterTrack = ds.quarterTrack
      moveHead35(ds, (track << 1) | (oldQuarterTrack & 1))
      if (ds.quarterTrack !== oldQuarterTrack) {
        // Crossing a zone boundary needs a longer settle than an in-zone step.
        ds.readyEnd = s6502.cycleCount +
          (((ds.quarterTrack >> 4) !== (oldQuarterTrack >> 4)) ? 5000 : 1000)
        ds.stepEnd = s6502.cycleCount + 5000
      }
      break
    }
    case 0x4: // spindle motor on
      ds.spindleOn = true
      // The disc was stationary; start the media clock clean.
      headRemainder35 = 0
      headPending35 = 0
      ds.readyEnd = s6502.cycleCount + 5000
      break
    case 0xC: // spindle motor off
      ds.spindleOn = false
      headRemainder35 = 0
      headPending35 = 0
      ds.readyEnd = 0
      break
    case 0xE: // eject - flag only, the media stays mounted
      ds.diskSwitched = true
      break
    default:
      break
  }
  passDriveData()
}

// Re-evaluate the status-selector output (IWM status register bit 7) for the
// current CA/SEL state. Reading selectors $8/$9 also configures the head.
const refreshSense35 = (ds: DriveState, hdsel: number) => {
  update35Timers(ds)
  switch (select35(hdsel)) {
    case 0x0: sense35 = ds.stepDirection ? 1 : 0; break
    case 0x1: sense35 = ds.filename !== "" ? 0 : 1; break
    case 0x2: sense35 = ds.stepEnd ? 0 : 1; break
    case 0x3: sense35 = ds.isWriteProtected ? 0 : 1; break
    case 0x4: sense35 = ds.spindleOn ? 0 : 1; break
    case 0x5: sense35 = (ds.quarterTrack >> 1) === 0 ? 0 : 1; break
    // Bit 6 of the status table is "disk switched?", with inverted sense:
    // 0 = ejected, 1 = not ejected. gssquared returns the raw latch inverted
    // because that is what the ROM's error path accepts.
    case 0x6: sense35 = ds.diskSwitched ? 1 : 0; break
    case 0x7: sense35 = 0; break // tachometer, stubbed
    case 0x8: setSide35(ds, 0); sense35 = 0; break
    case 0x9: setSide35(ds, 1); sense35 = 0; break
    case 0xC: sense35 = 1; break // double-sided
    case 0xD: sense35 = ds.readyEnd ? 1 : 0; break
    case 0xF: sense35 = 0; break // drive installed
    default: sense35 = 0; break
  }
}

export const iwmReset35Lines = () => {
  iwmCa35 = [0, 0, 0, 0]
  internalDataRegister35 = 0
  dataRegister35 = 0
  sense35 = 0
  asyncShift35 = 0
  asyncBitsRemaining35 = 0
  asyncBuffer35 = 0
  asyncBufferValid35 = false
  handshake35 = 0x80
  headRemainder35 = 0
  headPending35 = 0
  writeBurst35 = false
  writeBurstDrive35 = -1
  dirtyTracks35.clear()
}

// A 3.5" bay is about to hold different media - what the standby disk swapper
// does while the machine keeps running. Everything the IWM still holds describes
// the disk that is leaving: a byte still sitting in the shift register, and the
// dirty tracks queued behind it, would otherwise be clocked and spliced into the
// image that just arrived. So hand the outgoing image its last flush and forget
// the state. A write the guest never read back is dropped with the burst that
// carried it, which is the same durability boundary the firmware's own verify
// sets. A burst owned by the *other* bay is none of this disk change's business,
// so only its own pending tracks go.
export const iwmDiskChange35 = (driveIndex: number) => {
  iwmFlushWrites35(driveIndex)
  if (!writeBurst35 || writeBurstDrive35 === driveIndex) {
    iwmReset35Lines()
  } else {
    dirtyTracks35.delete(driveIndex)
  }
}

// Status register bit 7 for the currently selected 3.5" drive.
export const iwmGetSense35 = (driveIndex: number, hdsel: number) => {
  const ds = getDriveStateByIndex(driveIndex)
  if (!ds.is35) return 0
  refreshSense35(ds, hdsel)
  return sense35
}

// Does the Logic State Sequencer clock bits? On the 5.25" family /ENBL is the
// spindle, so it alone decides. A 3.5" Sony mechanism latches its own spindle
// (CONT35 $4/$C) and ENABLE only locks the media, so both have to be on.
export const iwmFloppySpinning = (driveIndex: number, enableLine: boolean) => {
  const ds = getDriveStateByIndex(driveIndex)
  if (ds.is35) return enableLine && ds.spindleOn
  return enableLine
}

// Advance the 3.5" media clock to "now". Call this on *every* IWM access while
// a 3.5" drive is selected: the LSS clocks bits whether or not the CPU is
// looking at the data or handshake register, so the position under the head
// has to keep up with machine time even across status/mode/head-step accesses.
// Returns the elapsed cycles so the read-cadence sampler keeps seeing real
// gap sizes.
export const iwmAdvance35 = (
  driveIndex: number, spinning: boolean, bitCycles: number,
) => {
  const now = s6502.cycleCount
  iwmAdvanceCycles35 = now - iwmPrevCycleCount
  iwmPrevCycleCount = now
  const ds = getDriveStateByIndex(driveIndex)
  if (!ds.is35 || !spinning || bitCycles <= 0) {
    // Spindle at rest: nothing rotates, and any leftover bit phase belongs to
    // the stopped disc, not the next burst.
    headRemainder35 = 0
    headPending35 = 0
    return iwmAdvanceCycles35
  }
  if (iwmAdvanceCycles35 <= 0) return 0
  headRemainder35 += iwmAdvanceCycles35
  const bits = Math.floor(headRemainder35 / bitCycles)
  if (bits > 0) {
    headRemainder35 -= bits * bitCycles
    headPending35 += bits
  }
  return iwmAdvanceCycles35
}

// Hand the LSS at most the last 32 bit cells of the elapsed rotation. The LSS
// only holds a few bits of state, so simulating more is wasted work; the rest
// of the rotation still moves the head so the position stays a function of
// machine time (gssquared's MAX_BITS_TO_SIM snap in Floppy_woz::fast_forward).
const takePending35 = (ds: DriveState) => {
  let bits = headPending35
  headPending35 = 0
  if (bits <= 0) return 0
  const cap = 32
  if (bits > cap) {
    const nbits = ds.trackNbits[ds.quarterTrack] || 0
    if (nbits > 0) ds.trackLocation = (ds.trackLocation + (bits - cap)) % nbits
    bits = cap
  }
  return bits
}

// 3.5" latch mode (MODE.L=1): the LSS assembles a byte privately and publishes
// it to dataRegister35 once bit 7 is set. A read takes that byte and clears it,
// so the caller's BPL poll waits for the *next* full byte instead of seeing the
// same value twice (the ROM reads the address epilogue as DE then AA with only
// ~12 cycles between the two reads, i.e. well inside one bit-cell byte, and a
// holding latch made the second read return DE again).
//
// Every bit cell the head has rotated through since the previous access is
// clocked through the shift register; the fraction is kept in headRemainder35,
// never discarded, so the read position tracks machine time exactly like the
// write clock. The 5.25 peek-hold hack in getNextByte() is a Disk II artefact
// and must not run here.
const getNextByte35 = (ds: DriveState, dd: Uint8Array) => {
  const bits = takePending35(ds)
  bitsAdvancedLastCall = bits
  let published = -1
  for (let i = 0; i < bits; i++) {
    const bit = getNextBit(ds, dd)
    internalDataRegister35 = ((internalDataRegister35 << 1) | bit) & 0xFF
    if (internalDataRegister35 & 0x80) {
      dataRegister35 = internalDataRegister35
      internalDataRegister35 = 0
      published = dataRegister35
    }
  }
  if (published >= 0) {
    dataRegister35 = 0
    return published
  }
  // Not a full byte yet: the high bit is clear, so a BPL poll keeps waiting.
  return 0
}

// Non-latch 3.5" read. Firmware drives 3.5" media with MODE.L=1, but keep a
// plain continuous shift register for completeness (gssquared READSHIFT).
const getNextByte35Shift = (ds: DriveState, dd: Uint8Array) => {
  const bits = takePending35(ds)
  bitsAdvancedLastCall = bits
  for (let i = 0; i < bits; i++) {
    const bit = getNextBit(ds, dd)
    dataRegister35 = ((dataRegister35 << 1) | bit) & 0xFF
  }
  return dataRegister35
}

// Advance the LSS for the given floppy drive index to "now" and return the
// contents of the data register. `enabled` mirrors the spindle state (see
// iwmFloppySpinning above). In 3.5" latch mode reading the register clears it,
// so a poll for the next byte waits for a fresh high bit instead of re-reading
// the same value forever.
//
// The 5.25" bit model counts raw CPU cycles (4 per bit cell), exactly as
// gssquared's Floppy525_woz does in every speed mode: the Disk II firmware's
// read loop is cycle-timed too, so the two keep their relationship at 2.8 MHz.
export const iwmReadDataRegister = (
  driveIndex: number, enabled: boolean, latchMode = false,
) => {
  const cycles = s6502.cycleCount - iwmPrevCycleCount
  const ds = getDriveStateByIndex(driveIndex)
  const dd = getDriveBitstreamByIndex(driveIndex)
  if (ds.is35) {
    // A data-register read ends a write burst; make sure the block image is
    // current before the guest reads the sector back.
    iwmFlushWrites35(driveIndex)
    if (ds.hardDrive || dd.length === 0) return 0
    if (enabled) {
      const byte = latchMode ? getNextByte35(ds, dd) : getNextByte35Shift(ds, dd)
      sampleIwmRead(ds, iwmAdvanceCycles35)
      return byte
    }
    // Spindle off: no bits clock through, but a byte latched before it stopped
    // is still readable once.
    const value = dataRegister35
    if (latchMode) dataRegister35 = 0
    return value
  }
  iwmPrevCycleCount = s6502.cycleCount
  if (!enabled) {
    // Keep the register reading back as "no data" so RWTS loops time out
    // quickly instead of spinning on a stale byte.
    return 0x80
  }
  if (ds.hardDrive || dd.length === 0) return 0x80
  const byte = getNextByte(ds, dd, cycles)
  sampleIwmRead(ds, cycles)
  return byte
}

// ---------------------------------------------------------------------------
// 3.5" write path (IWM asynchronous mode, MODE.H=1)
//
// Ported from gssquared IWM2::fast_forward_impl()/write() and KEGS
// iwm_write_data35(). The CPU hands over one byte at $C0ED; the LSS clocks the
// eight bits onto the media at the disk bit rate and the handshake register
// reports when it can take the next byte. Real firmware paces itself entirely
// off those two handshake bits, so modelling them (rather than writing the byte
// instantly) is what keeps the field aligned with the rotating media.
// ---------------------------------------------------------------------------

const markDirty35 = (driveIndex: number, trackIndex: number) => {
  let tracks = dirtyTracks35.get(driveIndex)
  if (!tracks) {
    tracks = new Set<number>()
    dirtyTracks35.set(driveIndex, tracks)
  }
  tracks.add(trackIndex)
}

// One LSS bit cell while writing. `bit < 0` advances the head without touching
// the media (gssquared's tick_no_write): idle cells and underrun gaps.
const writeBit35 = (ds: DriveState, dd: Uint8Array, bit: number) => {
  const nbits = ds.trackNbits[ds.quarterTrack] || 0
  if (nbits <= 0) return
  ds.trackLocation %= nbits
  if (bit >= 0 && ds.trackStart[ds.quarterTrack] > 0) {
    const fileOffset = ds.trackStart[ds.quarterTrack] + (ds.trackLocation >> 3)
    if (fileOffset < dd.length) {
      const b = ds.trackLocation & 7
      dd[fileOffset] = bit ?
        (dd[fileOffset] | pickbit[b]) : (dd[fileOffset] & clearbit[b])
      markDirty35(ds.index, ds.quarterTrack)
    }
  }
  ds.trackLocation = (ds.trackLocation + 1) % nbits
}

// Persist written tracks: decode their GCR and splice the sectors back into the
// block image. Native WOZ media was written in place, so it only needs the
// change flag. Refuses while a field is still being clocked out.
export const iwmFlushWrites35 = (driveIndex: number) => {
  const tracks = dirtyTracks35.get(driveIndex)
  if (!tracks || tracks.size === 0) return
  if (asyncBitsRemaining35 > 0 || asyncBufferValid35) return
  const ds = getDriveStateByIndex(driveIndex)
  if (!ds || !ds.is35) return
  let changed = false
  if (ds.blockMedia35) {
    const stream = getDriveBitstreamByIndex(driveIndex)
    const image = getDriveDataByIndex(driveIndex)
    if (image.length > 0) {
      for (const trackIndex of tracks) {
        const nbits = ds.trackNbits[trackIndex] || 0
        const start = ds.trackStart[trackIndex] || 0
        if (nbits === 0 || start === 0) continue
        if (spliceFloppy35Track(stream, start, nbits, image,
          trackIndex >> 1, trackIndex & 1)) {
          changed = true
        }
      }
    }
  } else {
    changed = true
  }
  tracks.clear()
  if (changed) {
    ds.diskHasChanges = true
    ds.lastAppleWriteTime = Date.now()
    passDriveData()
  }
}

const advanceWrite35 = (ds: DriveState, bitCycles: number, record: boolean) => {
  if (bitCycles <= 0 || (ds.trackNbits[ds.quarterTrack] || 0) <= 0) return
  // The media clock already turned; clock the cells the LSS has not seen yet
  // through the async shift register (takePending35 caps the work at a byte's
  // worth of state and jumps the head over anything older).
  const bits = takePending35(ds)
  if (bits === 0) return
  const dd = getDriveBitstreamByIndex(ds.index)
  let burstEnded = false
  for (let i = 0; i < bits; i++) {
    if (asyncBitsRemaining35 === 0) {
      if (handshake35 === 0x40 && asyncBufferValid35) {
        // The CPU queued a byte while the previous one was still shifting:
        // move it into the shift register and free the buffer.
        asyncShift35 = asyncBuffer35
        asyncBufferValid35 = false
        asyncBitsRemaining35 = 8
        handshake35 = 0xC0
      } else if (handshake35 === 0x40) {
        handshake35 = 0xC0
      } else {
        // Nothing queued: an underrun. The field is finished once the guest
        // stops feeding bytes, which is the moment its final BVS poll clears.
        if (writeBurst35) {
          writeBurst35 = false
          writeBurstDrive35 = -1
          burstEnded = true
        }
        handshake35 = 0x80
      }
    }
    if (asyncBitsRemaining35 > 0) {
      const bit = (asyncShift35 >> 7) & 1
      asyncShift35 = (asyncShift35 << 1) & 0xFF
      asyncBitsRemaining35--
      writeBit35(ds, dd, record ? bit : -1)
    } else {
      writeBit35(ds, dd, -1)
    }
  }
  if (burstEnded) iwmFlushWrites35(ds.index)
}

// $C0ED data-register write while a 3.5" drive is selected in async mode.
export const iwmWriteDataRegister35 = (
  driveIndex: number, value: number, enabled: boolean, bitCycles: number,
) => {
  const ds = getDriveStateByIndex(driveIndex)
  if (!ds || !ds.is35) return
  // Clock up to "now" first (gssquared write() runs fast_forward before it
  // queues), so the byte starts on the bit cell the head is over now.
  if (enabled) advanceWrite35(ds, bitCycles, !ds.isWriteProtected)
  asyncBuffer35 = value & 0xFF
  asyncBufferValid35 = true
  handshake35 = 0x40
  writeBurst35 = true
  writeBurstDrive35 = driveIndex
}

// $C0EC read with Q7=1/Q6=0: the async write handshake register.
export const iwmReadHandshake35 = (
  driveIndex: number, enabled: boolean, bitCycles: number,
) => {
  const ds = getDriveStateByIndex(driveIndex)
  if (!ds || !ds.is35) return 0xC0
  if (enabled) advanceWrite35(ds, bitCycles, !ds.isWriteProtected)
  return handshake35
}

// $C0E0-$C0E7 drive the head: CA0-CA2 plus LSTRB. On a 5.25" drive that is the
// same Shugart stepper the Disk II uses, so reuse the identical magnet/position
// bookkeeping. On a 3.5" drive the same four lines are the status/control
// selector, decoded with $C031 bit 7 (SEL/HDSEL) and strobed by LSTRB.
export const iwmStepHead = (
  driveIndex: number, reg: number, enabled: boolean, hdsel = 0,
) => {
  if (reg > 7) return
  const ds = getDriveStateByIndex(driveIndex)
  if (ds.hardDrive) return
  const phase = reg >> 1
  const phaseOn = reg & 1
  if (ds.is35) {
    const wasLstrb = iwmCa35[3] !== 0
    iwmCa35[phase] = phaseOn
    if (phase === 3 && phaseOn && !wasLstrb && enabled) {
      triggerControl35(ds, hdsel)
    }
    refreshSense35(ds, hdsel)
    return
  }
  if (phaseOn) {
    ds.currentPhase |= 1 << phase
  } else {
    ds.currentPhase &= ~(1 << phase)
  }
  const position = MAGNET_TO_POSITION[ds.currentPhase]
  if (enabled && position >= 0) {
    const direction = POSITION_TO_DIRECTION[ds.quarterTrack & 7][position]
    moveHead(ds, direction, 0)
  }
}

// Bit 7 of the IWM status register ($C0EE) while the 5.25" family is selected:
// the write-protect sensor. Ported from gssquared Floppy525_woz::read_sense.
// With no media the LED's beam is unblocked, so the sensor reads exactly like a
// write-protected disk (1). The WP switch also returns through PHASE1, so
// driving that phase high forces 1 regardless of the notch. ROM 03's power-on
// drive probe waits for this bit to go high and would spin forever on the
// empty-bay answer of 0.
export const iwmReadSense525 = (driveIndex: number) => {
  const ds = getDriveStateByIndex(driveIndex)
  if (ds.hardDrive || getDriveDataByIndex(driveIndex).length === 0) return 1
  if (ds.currentPhase & 0x02) return 1
  return ds.isWriteProtected ? 1 : 0
}

