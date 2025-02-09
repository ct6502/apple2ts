import { Buffer } from "buffer"
import { passDriveProps, passDriveSound } from "../worker2main"
import { decodeDiskData, isHardDriveImage } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { DRIVE } from "../utility/utility"

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
    halftrack: 0,
    prevHalfTrack: 0,
    writeMode: false,
    currentPhase: 0,
    trackStart: !hardDrive ? Array<number>(80) : Array<number>(),
    trackNbits: !hardDrive ? Array<number>(80) : Array<number>(),
    trackLocation: 0,
    maxHalftrack: 0,
    lastWriteTime: -1,
    cloudData: null
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
export const getHardDriveData = (drive: number) => driveData[(drive == 2) ? 1 : 0]

export const getFilename = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (driveState[i].filename !== "") return driveState[i].filename
  }
  return ""
}

export const getDriveLastWriteTimeByIndex = (index: number) => {
  return driveState[index].lastWriteTime
}

export const getDriveFileNameByIndex = (index: number) => {
  return driveState[index].filename
}

export const passData = () => {
  for (let i = 0; i < driveState.length; i++) {
    const dprops: DriveProps = {
      index: i,
      hardDrive: driveState[i].hardDrive,
      drive: driveState[i].drive,
      filename: driveState[i].filename,
      status: driveState[i].status,
      motorRunning: driveState[i].motorRunning,
      diskHasChanges: driveState[i].diskHasChanges,
      isWriteProtected: driveState[i].isWriteProtected,
      diskData: driveState[i].diskHasChanges ? driveData[i] : new Uint8Array(),
      lastWriteTime: driveState[i].lastWriteTime,
      cloudData: driveState[i].cloudData
    }
    passDriveProps(dprops)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDriveSaveState = (full: boolean): DriveSaveState => {
  const data = ['', '', '']
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
  let dindex = 0;
  for (let i=0; i < newState.driveState.length; i++) {
    driveState[dindex] = { ...newState.driveState[i] }
    if (newState.driveData[i] !== '') {
      driveData[dindex] = new Uint8Array(Buffer.from(newState.driveData[i], 'base64'))
    }
    // See if we had a second hard drive in our save state or not.
    if (newState.driveState.length === 3 && i === 0) dindex = 1
    dindex++
  }
  passData()
}

export const resetDrive = () => {
  doResetDiskDrive(driveState[1])
  doResetDiskDrive(driveState[2])
  passData()
}

export const doPauseDrive = (resume = false) => {
  doPauseDiskDrive(resume)
  passData()
}

// Send in a new disk image to be loaded into the emulator.
export const doSetEmuDriveNewData = (props: DriveProps, forceIndex: boolean = false) => {
  let index = props.index
  let drive = props.drive
  
  // See if the "wrong" disk image was put into a drive. If so, swap the drive.
  let isHardDrive = props.hardDrive
  if (!forceIndex) {
    if (props.filename !== '') {
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
  driveState[index].motorRunning = props.motorRunning
  driveData[index] = decodeDiskData(driveState[index], props.diskData)
  if (driveData[index].length === 0) {
    driveState[index].filename = ''
  }
  driveState[index].cloudData = props.cloudData
  passData()
}

// Set properties on the current disk, without changing the data.
// This could be things like the filename, motor running, or write protect.
export const doSetEmuDriveProps = (props: DriveProps) => {
  const index = props.index
  driveState[index].filename = props.filename
  driveState[index].motorRunning = props.motorRunning
  driveState[index].isWriteProtected = props.isWriteProtected
  driveState[index].diskHasChanges = props.diskHasChanges
  passData()
}

