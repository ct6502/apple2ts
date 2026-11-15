import { Buffer } from "buffer"
import { passDriveProps, passDriveSound } from "../worker2main"
import { decodeDiskData } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { fluxBuildCheckpoints, fluxLand, isFluxTrack } from "./fluxtrack"
import { enableHardDrive } from "./harddrivedata"
import { DRIVE, FLUX_KIND, isHardDriveImage, updateWozCrc } from "../../common/utility"

const initDriveState = (index: number, drive: number, hardDrive: boolean): DriveState => {
  return {
    index: index,
    hardDrive: hardDrive,
    drive: drive,
    status: "",
    filename: "",
    diskHasChanges: false,
    motorRunning: false,
    isWriteProtected: false,
    isSynchronized: false,
    quarterTrack: 0,
    prevQuarterTrack: 0,
    writeMode: false,
    currentPhase: 0,
    trackStart: hardDrive ? Array<number>() : Array<number>(160).fill(0),
    trackNbits: hardDrive ? Array<number>() : Array<number>(160).fill(51024),
    trackLocation: 0,
    maxQuarterTrack: 0,
    lastLocalFileWriteTime: -1,
    cloudData: null,
    writableFileHandle: null,
    lastAppleWriteTime: -1,
    optimalTiming: 32,  // bits per 125 ns, so 32 = 4 µs
    fluxKind: FLUX_KIND.NONE,
    fluxPsPerTick: 0,
    // These stay empty until a flux disk is decoded, so that the save states
    // of other disks stay small.
    fluxLapStart: Array<number>(),
    fluxLapEnd: Array<number>(),
    fluxRevCycles: Array<number>(),
    fluxLoopCycles: Array<number>(),
    fluxByte: 0,
    fluxTicks: 0,
    fluxIntervalEnd: 0,
    fluxCycle: 0,
    fluxIntervalStart: 0,
    fluxIntervalLength: 0,
    fluxBitsInInterval: 0,
    fluxBitIndex: 0,
  }
}

const initializeDriveState = () => {
  driveState[0] = initDriveState(0, 1, true)
  driveState[1] = initDriveState(1, 2, true)
  driveState[2] = initDriveState(2, 1, false)
  driveState[3] = initDriveState(3, 2, false)
  for (let i = 0; i < driveState.length; i++) {
    driveData[i] = new Uint8Array()
  }
}

const driveState: DriveState[] = []
const driveData: Array<Uint8Array> = []
const largeDiskSnapshotThreshold = 32_000_000

initializeDriveState()

let currentDrive = 2

export const setCurrentDrive = (drive: number) => {currentDrive = drive}

export const getCurrentDriveState = () => driveState[currentDrive]

export const getCurrentDriveData = () => driveData[currentDrive]

export const getHardDriveState = (drive: number) => driveState[(drive == 2) ? 1 : 0]
export const getHardDriveData = (drive: number): [Uint8Array, number, number] => {
  const data = driveData[(drive == 2) ? 1 : 0]
  let magic = ""
  for (let i = 0; i < 4; i++) magic += String.fromCharCode(data[i])
  // 2MG files have a 64-byte header that we need to skip over
  const offset = magic === "2IMG" ? 64 : 0
  return [data, offset, data.length - offset]
}

export const getFilename = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (driveState[i].filename !== "") return driveState[i].filename
  }
  return ""
}

// Create an array of drive props, indexed by drive number
const previousProps: Array<{diskHasChanges: boolean,
  motorRunning: boolean, status: string}> = []

const getDriveProps = (index: number, forcePassData: boolean): DriveProps => {
  if (driveState[index].diskHasChanges && driveData[index]?.length > 0) {
    updateWozCrc(driveData[index])
  }
  return {
    index,
    hardDrive: driveState[index].hardDrive,
    drive: driveState[index].drive,
    filename: driveState[index].filename,
    status: driveState[index].status,
    motorRunning: driveState[index].motorRunning,
    diskHasChanges: driveState[index].diskHasChanges,
    isWriteProtected: driveState[index].isWriteProtected,
    diskData: ((driveState[index].diskHasChanges && !driveState[index].motorRunning) || forcePassData) ?
      driveData[index] : new Uint8Array(),
    lastAppleWriteTime: driveState[index].lastAppleWriteTime,
    lastLocalFileWriteTime: driveState[index].lastLocalFileWriteTime,
    cloudData: driveState[index].cloudData,
    writableFileHandle: driveState[index].writableFileHandle,
    isFlux: driveState[index].fluxKind !== FLUX_KIND.NONE
  }
}

const isA2R3Drive = (index: number) => driveState[index].fluxKind === FLUX_KIND.A2R3

// keepUIData marks the drives whose data the UI already has, which a forced
// pass then leaves out. We play an A2R3 from the very file the UI holds, and
// it never changes, since writes to it are dropped.
export const passDriveData = (
  replaceDiskDataIndex = -1,
  forcePassData = false,
  keepUIData: boolean[] = [],
) => {
  for (let i = 0; i < driveState.length; i++) {
    if (driveState[i].diskHasChanges && driveData[i]?.length > 0) {
      updateWozCrc(driveData[i])
    }
    // For empty drives, only update if one of our special properties changed.
    if (driveState[i].filename === "" &&
      !driveState[i].cloudData &&
      previousProps[i] &&
      previousProps[i].diskHasChanges === driveState[i].diskHasChanges &&
      previousProps[i].motorRunning === driveState[i].motorRunning &&
      previousProps[i].status === driveState[i].status &&
      i !== replaceDiskDataIndex) {
      continue
    }
    const force = forcePassData && !keepUIData[i]
    const dprops = getDriveProps(i, force)
    passDriveProps(dprops, i === replaceDiskDataIndex || force)
    previousProps[i] = {diskHasChanges: dprops.diskHasChanges,
      motorRunning: dprops.motorRunning,
      status: dprops.status}
  }
}

export const getDriveSaveState = (full: boolean): DriveSaveState => {
  const data: string[] = new Array(driveState.length).fill("")
  for (let i=0; i < driveState.length; i++) {
    // Time-travel snapshots include media below the threshold;
    // portable save states include all media.
    // We leave A2R3 data, which runs to several MB, out of time-travel
    // snapshots. The snapshot still keeps the drive state and its flux cursor.
    if (full || (driveData[i].length < largeDiskSnapshotThreshold && !isA2R3Drive(i))) {
      data[i] = Buffer.from(driveData[i]).toString("base64")
    }
  }
  const result = { 
    currentDrive: currentDrive,
    driveState: [] as (DriveState | object)[],
    driveData: data 
  }
  for (let i=0; i < driveState.length; i++) {
    // For empty drives just stash an empty object.
    result.driveState[i] = driveState[i].filename !== "" ? { ...driveState[i] } : {}
  }
  return result
}

export const getDriveSaveStateForLocalStorage = (): DriveSaveState | null => {
  for (let i=0; i < driveState.length; i++) {
    if (driveData[i].length >= largeDiskSnapshotThreshold || isA2R3Drive(i)) {
      return null
    }
  }
  return getDriveSaveState(false)
}

export const restoreDriveSaveState = (newState: DriveSaveState) => {
  const previousDriveState = driveState.map((state) => ({...state}))
  const previousDriveData = [...driveData]
  passDriveSound(DRIVE.MOTOR_OFF)
  currentDrive = newState.currentDrive
  // If this is an old save state, we may need to adjust the current drive.
  if (newState.driveState.length === 3 && currentDrive > 0) {
    currentDrive++
  }
  initializeDriveState()
  const keepUIData: boolean[] = []
  let dindex = 0
  for (let i=0; i < newState.driveState.length; i++) {
    // Make sure our drive had data.
    if (Object.keys(newState.driveState[i]).length > 0) {
      const saved = newState.driveState[i] as DriveState
      // Save states from before flux support have no flux fields, so we take
      // those from the defaults.
      const fluxDefaults = Object.fromEntries(Object.entries(initDriveState(dindex, saved.drive, saved.hardDrive))
        .filter(([key]) => key.startsWith("flux")))
      const restored = { ...fluxDefaults, ...saved } as DriveState
      if (newState.driveData[i] !== "") {
        driveState[dindex] = restored
        driveData[dindex] = new Uint8Array(Buffer.from(newState.driveData[i], "base64"))
      } else if (previousDriveState[dindex]?.fluxKind === FLUX_KIND.A2R3 &&
        restored.fluxKind === FLUX_KIND.A2R3 &&
        previousDriveState[dindex].filename === restored.filename) {
        // This is a time-travel snapshot of the A2R3 that is still mounted, so
        // its table and cursor go with the data we already have.
        driveState[dindex] = restored
        driveData[dindex] = previousDriveData[dindex]
        keepUIData[dindex] = true
      } else if (previousDriveState[dindex]?.fluxKind === FLUX_KIND.A2R3) {
        // The snapshot is of a different disk than the A2R3 now mounted. We
        // keep the current disk, as we do for a large disk below.
        driveState[dindex] = previousDriveState[dindex]
        driveData[dindex] = previousDriveData[dindex]
        keepUIData[dindex] = true
      } else if (restored.fluxKind === FLUX_KIND.A2R3 && previousDriveState[dindex]?.filename !== "" &&
        previousDriveData[dindex]?.length > 0) {
        // The snapshot is of an A2R3, without its data, and another disk is
        // now mounted. We have nothing to play the A2R3 from, so we keep that
        // disk.
        driveState[dindex] = previousDriveState[dindex]
        driveData[dindex] = previousDriveData[dindex]
      } else if (previousDriveData[dindex].length >= largeDiskSnapshotThreshold) {
        // Time-travel snapshots intentionally exclude large-disk data. Retain
        // both the current data and its metadata; the historical metadata
        // describes disk data that was not restored.
        driveState[dindex] = previousDriveState[dindex]
        driveData[dindex] = previousDriveData[dindex]
      }
    }
    // See if we had a second hard drive in our save state or not.
    if (newState.driveState.length === 3 && i === 0) dindex = 1
    dindex++
  }
  // The flux seek checkpoints are not saved, so we build them for the
  // restored disks.
  for (let i = 0; i < driveState.length; i++) {
    fluxBuildCheckpoints(driveState[i], driveData[i])
  }
  // Force-pass restored disk data to the UI the same way doSetEmuDriveNewData()
  // does on a normal mount: a freshly-restored, unwritten disk has
  // diskHasChanges === false, so without forcing it, getDriveProps()'s
  // "(diskHasChanges && !motorRunning) || forcePassData" gate would report an
  // empty buffer even though driveData[] above was correctly restored.
  passDriveData(-1, true, keepUIData)
}

export const resetFloppyDrives = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (!driveState[i].hardDrive) {
        doResetDiskDrive(driveState[i], driveData[i])
    }
  }
  passDriveData()
}

export const doPauseDrive = (resume = false) => {
  doPauseDiskDrive(resume)
  passDriveData()
}

// Send in a new disk image to be loaded into the emulator.
export const doSetEmuDriveNewData = (props: DriveProps, forceIndex: boolean = false) => {
  const hasRequestedMedia = props.filename !== "" || props.diskData.length !== 0
  let index = props.index
  let drive = props.drive
  
  // See if the "wrong" disk image was put into a drive. If so, swap the drive.
  let isHardDrive = props.hardDrive
  if (!forceIndex) {
    if (props.filename !== "") {
      if (isHardDriveImage(props.filename, props.diskData?.length)) {
        isHardDrive = true
        index = (props.drive <= 1) ? 0 : 1
        drive = index + 1
      } else {
        isHardDrive = false
        index = (props.drive <= 1) ? 2 : 3
        drive = index - 1
      }
    }
  }
  // A newly loaded floppy is the disk the user expects to boot next. Keep
  // the worker's selected drive in sync; otherwise a second DemoZoo load can
  // boot the previously selected floppy after the first program changed it.
  if (!isHardDrive) {
    currentDrive = index
  }
  const prevDrive = driveState[index]
  const preserveHead = !isHardDrive && Boolean(prevDrive && !prevDrive.hardDrive)
  const savedQuarterTrack = preserveHead ? prevDrive.quarterTrack : 0
  const savedPrevQuarterTrack = preserveHead ? prevDrive.prevQuarterTrack : 0
  const savedCurrentPhase = preserveHead ? prevDrive.currentPhase : 0

  driveState[index] = initDriveState(index, drive, isHardDrive)
  if (preserveHead) {
    driveState[index].quarterTrack = savedQuarterTrack
    driveState[index].prevQuarterTrack = savedPrevQuarterTrack
    driveState[index].currentPhase = savedCurrentPhase
  }
  driveState[index].filename = props.filename
  driveData[index] = decodeDiskData(driveState[index], props.diskData, forceIndex)
  if (driveData[index].length === 0) {
    driveState[index].filename = ""
    passDriveData(index)
    return !hasRequestedMedia
  }
  if (isHardDrive) {
    enableHardDrive(true)
  }
  fluxBuildCheckpoints(driveState[index], driveData[index])
  // The head stays where it was, so on a flux track we put it at the start of
  // the track's first lap.
  if (isFluxTrack(driveState[index], driveState[index].quarterTrack)) {
    fluxLand(driveState[index], driveData[index], driveState[index].quarterTrack, 0)
  }
  driveState[index].motorRunning = props.motorRunning
  driveState[index].cloudData = props.cloudData
  driveState[index].writableFileHandle = props.writableFileHandle
  driveState[index].lastLocalFileWriteTime = props.lastLocalFileWriteTime
  // Be sure to pass the data back the first time we load a disk. That way
  // if we've converted to a woz, we get back the woz bits. We play an A2R3
  // from the very data the UI sent, so we do not send it back.
  const keepUIData: boolean[] = []
  keepUIData[index] = isA2R3Drive(index) && driveData[index] === props.diskData
  passDriveData(-1, true, keepUIData)
  return true
}

// Set properties on the current disk, without changing the data.
// This could be things like the filename, motor running, or write protect.
export const doSetEmuDriveProps = (props: DriveProps) => {
  const index = props.index
  driveState[index].filename = props.filename
  driveState[index].motorRunning = props.motorRunning
  // A disk with flux tracks is read only, so the UI cannot clear its write
  // protection.
  driveState[index].isWriteProtected = props.isWriteProtected || driveState[index].fluxKind !== FLUX_KIND.NONE
  driveState[index].diskHasChanges = props.diskHasChanges
  driveState[index].lastAppleWriteTime = props.lastAppleWriteTime
  driveState[index].lastLocalFileWriteTime = props.lastLocalFileWriteTime
  driveState[index].cloudData = props.cloudData
  driveState[index].writableFileHandle = props.writableFileHandle
  passDriveData()
}

export const hasHardDriveMounted = () => {
  return driveData[0].length > 0 || driveData[1].length > 0
}
