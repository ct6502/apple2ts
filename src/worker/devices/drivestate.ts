import { Buffer } from "buffer"
import { passDriveProps, passDriveSound } from "../worker2main"
import { decodeDiskData } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { DRIVE, isHardDriveImage } from "../../common/utility"

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

export const passDriveData = () => {
  for (let i = 0; i < driveState.length; i++) {
    // For empty drives, only update if one of our special properties changed.
    if (driveState[i].filename === "" &&
      !driveState[i].cloudData &&
      previousProps[i] &&
      previousProps[i].diskHasChanges === driveState[i].diskHasChanges &&
      previousProps[i].motorRunning === driveState[i].motorRunning &&
      previousProps[i].status === driveState[i].status) {
      continue
    }
    const dprops: DriveProps = {
      index: i,
      hardDrive: driveState[i].hardDrive,
      drive: driveState[i].drive,
      filename: driveState[i].filename,
      status: driveState[i].status,
      motorRunning: driveState[i].motorRunning,
      diskHasChanges: driveState[i].diskHasChanges,
      isWriteProtected: driveState[i].isWriteProtected,
      diskData: (driveState[i].diskHasChanges && !driveState[i].motorRunning) ?
        driveData[i] : new Uint8Array(),
      lastAppleWriteTime: driveState[i].lastAppleWriteTime,
      lastLocalFileWriteTime: driveState[i].lastLocalFileWriteTime,
      cloudData: driveState[i].cloudData,
      writableFileHandle: driveState[i].writableFileHandle
    }
    passDriveProps(dprops)
    previousProps[i] = {diskHasChanges: dprops.diskHasChanges,
      motorRunning: dprops.motorRunning,
      status: dprops.status}
  }
}

export const getDriveSaveState = (full: boolean): DriveSaveState => {
  const data = ["", "", ""]
  for (let i=0; i < driveState.length; i++) {
    // Always save small disk images (< 32Mb), or if a full save was requested
    if (full || driveData[i].length < 32000000) {
      data[i] = Buffer.from(driveData[i]).toString("base64")
    }
  }
  const result = { currentDrive: currentDrive,
    driveState: [initDriveState(0, 1, true), initDriveState(1, 2, true),
      initDriveState(2, 1, false), initDriveState(3, 2, false)],
    driveData: data }
  for (let i=0; i < driveState.length; i++) {
    result.driveState[i] = { ...driveState[i] }
  }
  return result
}

export const restoreDriveSaveState = (newState: DriveSaveState) => {
  passDriveSound(DRIVE.MOTOR_OFF)
  currentDrive = newState.currentDrive
  // If this is an old save state, we may need to adjust the current drive.
  if (newState.driveState.length === 3 && currentDrive > 0) {
    currentDrive++
  }
  initializeDriveState()
  let dindex = 0
  for (let i=0; i < newState.driveState.length; i++) {
    driveState[dindex] = { ...newState.driveState[i] }
    if (newState.driveData[i] !== "") {
      driveData[dindex] = new Uint8Array(Buffer.from(newState.driveData[i], "base64"))
    }
    // See if we had a second hard drive in our save state or not.
    if (newState.driveState.length === 3 && i === 0) dindex = 1
    dindex++
  }
  passDriveData()
}

export const resetFloppyDrives = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (!driveState[i].hardDrive) {
        doResetDiskDrive(driveState[i])
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
  let index = props.index
  let drive = props.drive
  
  // See if the "wrong" disk image was put into a drive. If so, swap the drive.
  let isHardDrive = props.hardDrive
  if (!forceIndex) {
    if (props.filename !== "") {
      if (isHardDriveImage(props.filename)) {
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
  driveState[index] = initDriveState(index, drive, isHardDrive)
  driveState[index].filename = props.filename
  driveData[index] = decodeDiskData(driveState[index], props.diskData)
  if (driveData[index].length === 0) {
    driveState[index].filename = ""
    passDriveData()
    return
  }
  driveState[index].motorRunning = props.motorRunning
  driveState[index].cloudData = props.cloudData
  driveState[index].writableFileHandle = props.writableFileHandle
  driveState[index].lastLocalFileWriteTime = props.lastLocalFileWriteTime
  passDriveData()
}

// Set properties on the current disk, without changing the data.
// This could be things like the filename, motor running, or write protect.
export const doSetEmuDriveProps = (props: DriveProps) => {
  const index = props.index
  driveState[index].filename = props.filename
  driveState[index].motorRunning = props.motorRunning
  driveState[index].isWriteProtected = props.isWriteProtected
  driveState[index].diskHasChanges = props.diskHasChanges
  driveState[index].lastAppleWriteTime = props.lastAppleWriteTime
  driveState[index].lastLocalFileWriteTime = props.lastLocalFileWriteTime
  driveState[index].cloudData = props.cloudData
  driveState[index].writableFileHandle = props.writableFileHandle
  passDriveData()
}

