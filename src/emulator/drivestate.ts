import { Buffer } from "buffer"
import { passDriveProps } from "./worker2main"
import { decodeDiskData, isHardDriveImage } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { enableHardDrive } from "./harddrivedata"

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
  return driveState[currentDrive].filename
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

export const getDriveSaveState = () => {
  const data = [Buffer.from(driveData[1]).toString("base64"),
    Buffer.from(driveData[2]).toString("base64")]
  return { currentDrive: currentDrive,
    driveState: [driveState[1], driveState[2]], driveData: data }
}

export const restoreDriveSaveState = (newState: any) => {
  currentDrive = newState.currentDrive
  driveState[1] = newState.driveState[0]
  driveData[1] = new Uint8Array(Buffer.from(newState.driveData[0], 'base64'))
  driveState[2] = newState.driveState[1]
  driveData[2] = new Uint8Array(Buffer.from(newState.driveData[1], 'base64'))
  passData()
}

export const doResetDrive = () => {
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
