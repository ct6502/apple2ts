import { Buffer } from "buffer"
import { passDriveProps, passDriveSound } from "../worker2main"
import { decodeDiskData, isHardDriveImage } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { enableHardDrive } from "./harddrivedata"
import { DRIVE } from "../utility/utility"

const initDriveState = (drive: number): DriveState => {
  return {
    hardDrive: drive === 0,
    status: "",
    filename: "",
    diskHasChanges: false,
    motorRunning: false,
    isWriteProtected: false,
    halftrack: 0,
    prevHalfTrack: 0,
    writeMode: false,
    currentPhase: 0,
    trackStart: drive > 0 ? Array<number>(80) : Array<number>(),
    trackNbits: drive > 0 ? Array<number>(80) : Array<number>(),
    trackLocation: 0,
  }
}

const driveState: DriveState[] = [initDriveState(0), initDriveState(1), initDriveState(2)]
const driveData: Array<Uint8Array> = [new Uint8Array(), new Uint8Array(), new Uint8Array()]

let currentDrive = 1

export const setCurrentDrive = (drive: number) => {currentDrive = drive}

export const getCurrentDriveState = () => driveState[currentDrive]

export const getCurrentDriveData = () => driveData[currentDrive]

export const getHardDriveState = () => driveState[0]
export const getHardDriveData = () => driveData[0]

export const getFilename = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (driveState[i].filename !== "") return driveState[i].filename
  }
  return ""
}

export const passData = () => {
  for (let i = 0; i < driveState.length; i++) {
    const dprops: DriveProps = {
      hardDrive: driveState[i].hardDrive,
      drive: i,
      filename: driveState[i].filename,
      status: driveState[i].status,
      motorRunning: driveState[i].motorRunning,
      diskHasChanges: driveState[i].diskHasChanges,
      diskData: driveState[i].diskHasChanges ? driveData[i] : new Uint8Array()
    }
    passDriveProps(dprops)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getDriveSaveState = (full: boolean): DriveSaveState => {
  const data = ['', '', '']
  for (let i=0; i < 3; i++) {
    // Always save small disk images (< 32Mb), or if a full save was requested
    if (full || driveData[i].length < 32000000) {
      data[i] = Buffer.from(driveData[i]).toString("base64")
    }
  }
  const result = { currentDrive: currentDrive,
    driveState: [initDriveState(0), initDriveState(1), initDriveState(2)],
    driveData: data }
  for (let i=0; i < 3; i++) {
    result.driveState[i] = { ...driveState[i] }
  }
  return result
}

export const restoreDriveSaveState = (newState: DriveSaveState) => {
  passDriveSound(DRIVE.MOTOR_OFF)
  currentDrive = newState.currentDrive
  for (let i=0; i < 3; i++) {
    driveState[i] = initDriveState(i)
    driveData[i] = new Uint8Array()
  }
  for (let i=0; i < newState.driveState.length; i++) {
    driveState[i] = { ...newState.driveState[i] }
    if (newState.driveData[i] !== '') {
      driveData[i] = new Uint8Array(Buffer.from(newState.driveData[i], 'base64'))
    }
  }
  if (driveState[0].hardDrive) {
    enableHardDrive(driveState[0].filename !== '')
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

export const doSetDriveProps = (props: DriveProps) => {
  let drive = props.drive
  // See if the "wrong" disk image was put into a drive. If so, swap the drive.
  if (props.filename !== '') {
    if (isHardDriveImage(props.filename)) {
      drive = 0
      driveState[0].hardDrive = true
    } else {
      if (drive === 0) drive = 1
    }
  }
  driveState[drive] = initDriveState(drive)
  driveState[drive].filename = props.filename
  driveState[drive].motorRunning = props.motorRunning
  driveData[drive] = decodeDiskData(driveState[drive], props.diskData)
  if (driveData[drive].length === 0) {
    driveState[drive].filename = ''
  }
  if (driveState[drive].hardDrive) {
    enableHardDrive(driveState[drive].filename !== '')
  }
  passData()
}
