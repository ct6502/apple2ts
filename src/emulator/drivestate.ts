import { Buffer } from "buffer"
import { passDriveProps } from "./worker2main"
import { decodeDiskData } from "./decodedisk"
import { doPauseDiskDrive, doResetDiskDrive } from "./diskdata"
import { enableHardDrive } from "./harddrivedata"

const initDriveState = (): DriveState => {
  return {
    hardDrive: false,
    drive: 0,
    status: "",
    filename: "",
    diskData: new Uint8Array(),
    diskHasChanges: false,
    motorRunning: false,
    isWriteProtected: false,
    halftrack: 0,
    prevHalfTrack: 0,
    writeMode: false,
    currentPhase: 0,
    trackStart: Array<number>(80),
    trackNbits: Array<number>(80),
    trackLocation: 0,
  }
}

let driveState: DriveState[] = [initDriveState(), initDriveState(), initDriveState()];

let currentDrive = 0

export const getDriveState = (drive: number) => {
  return driveState[drive]
}

export const getDriveSaveState = () => {
  const driveData = [Buffer.from(driveState[0].diskData).toString("base64"),
    Buffer.from(driveState[1].diskData).toString("base64")]
  return { currentDrive: currentDrive, driveState: driveState.slice(0, 2), driveData: driveData }
}

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
      diskData: driveState[i].diskHasChanges ? driveState[i].diskData : new Uint8Array()
    }
    passDriveProps(dprops)
  }
}

export const restoreDriveSaveState = (newState: any) => {
  currentDrive = newState.currentDrive
  for (let i = 0; i < newState.length; i++) {
    driveState[i] = newState.driveState[i]
    driveState[i].diskData = new Uint8Array(Buffer.from(newState.driveData[i], 'base64'))
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
  passData()
}

export const doResetDrive = () => {
  doResetDiskDrive(driveState)
  passData()
}

export const doPauseDrive = (resume = false) => {
  doPauseDiskDrive(driveState)
  passData()
}

export const doSetDriveProps = (props: DriveProps) => {
  driveState[props.drive] = initDriveState()
  driveState[props.drive].hardDrive = props.hardDrive
  driveState[props.drive].diskData = props.diskData
  driveState[props.drive].filename = props.filename
  driveState[props.drive].motorRunning = props.motorRunning
  if (driveState[props.drive].diskData.length > 0) {
    if (!decodeDiskData(driveState[props.drive])) {
      driveState[props.drive].diskData = new Uint8Array()
      driveState[props.drive].filename = ''
    }
  } else {
    if (driveState[props.drive].hardDrive) {
      enableHardDrive(false)
    }
  }
  passData()
}
