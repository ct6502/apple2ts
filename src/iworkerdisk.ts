const initDriveProps = (): DriveProps => {
  return {
    drive: 0,
    filename: "",
    halftrack: 0,
    diskHasChanges: false,
    motorRunning: false,
    diskData: new Uint8Array()
  }
}
let driveProps: DriveProps[] = [initDriveProps(), initDriveProps()];

export const handleGetDriveProps = (drive: number) => {
  return driveProps[drive]
}

export const passDriveProps = (props: DriveProps) => {
  driveProps[props.drive] = props
}