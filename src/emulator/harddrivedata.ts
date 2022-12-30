import { parseAssembly } from "./assembler"
import { setSlotDriver, mainMem } from "./memory"
import { SWITCHES } from "./softswitches"
import { passDriveProps } from "./worker2main"

let currentDrive = 0
let timerID: any | number = 0
const driverAddress = 0xC7EA

const code1 = `
         LDX   #$20
         LDA   #$00
         LDX   #$03
         LDA   #$01
         STA   $42
         LDA   #$70
         STA   $43
         LDA   #$08
         STA   $45
         LDA   #$00
         STA   $44
         STA   $46
         STA   $47
         JSR   $C7EA
         BCS   ERROR
         LDA   #$0A
         STA   $45
         LDA   #$01
         STA   $46
         JSR   $C7EA
         BCS   ERROR
         LDA   $0801
         BEQ   ERROR
         LDA   #$01
         CMP   $0800
         BNE   ERROR
         LDX   $43
         JMP   $801
ERROR    JMP   $E000
`
const code2 = `
         CLC
         LDA   #$00
         RTS
         SEC         ; addr + 4
         LDA   #$27
         RTS
`
const prodos8driver = () => {
  const driver = new Uint8Array(256).fill(0)
  let pcode = parseAssembly(0x0, code1.split("\n"))
  driver.set(pcode, 0)
  pcode = parseAssembly(0x0, code2.split("\n"))
  driver.set(pcode, 0xEA)
  driver[0xFE] = 0b00010011
  driver[0xFF] = 0xEA
  return driver
}

export const enableHardDrive = () => {
  setSlotDriver(7, prodos8driver())
}

const initDriveProps = (): DriveProps => {
  return {
    hardDrive: false,
    drive: 0,
    filename: "",
    status: "",
    halftrack: 0,
    diskHasChanges: false,
    motorRunning: false,
    diskData: new Uint8Array()
  }
}
let driveState: DriveProps[] = [initDriveProps(), initDriveProps(), initDriveProps()];

const decodeDiskData = (driveState: DriveProps, diskData: Uint8Array): Uint8Array => {
  driveState.diskHasChanges = false
  return diskData
  // if (decodeDSK(driveState, diskData)) {
  //   return diskData
  // }
  // console.error("Unknown disk format.")
  // driveState.filename = ""
  // return new Uint8Array()
}

export const doSetHardDriveProps = (props: DriveProps) => {
  currentDrive = props.drive
  driveState[props.drive] = initDriveProps()
  driveState[props.drive].hardDrive = props.hardDrive
  driveState[props.drive].drive = props.drive
  driveState[props.drive].diskData = new Uint8Array()
  driveState[props.drive].status = props.filename
  driveState[props.drive].filename = props.filename
  driveState[props.drive].motorRunning = props.motorRunning
  if (props.diskData.length > 0) {
    driveState[props.drive].diskData = decodeDiskData(driveState[props.drive], props.diskData)
  }
  passData()
}

const passData = () => {
  for (let i = 0; i < driveState.length; i++) {
    if (driveState[i].hardDrive) {
      const dprops: DriveProps = {
        hardDrive: true,
        drive: i,
        filename: driveState[i].filename,
        status: driveState[i].status,
        motorRunning: driveState[i].motorRunning,
        halftrack: driveState[i].halftrack,
        diskHasChanges: driveState[i].diskHasChanges,
        diskData: new Uint8Array()
      }
      passDriveProps(dprops)
    }
  }
}

const motorTimeout = () => {
  timerID = 0
  driveState[currentDrive].motorRunning = false
  passData()
}

export const processHardDriveBlockAccess = () => {
  const result = driverAddress
  if (mainMem[0x43] !== 0x70) {
    console.log("illegal value in 0x42: " + mainMem[0x43])
    return result
  }
  if (driveState[currentDrive].filename.length === 0) {
    return result + 4
  }
  const block = mainMem[0x46] + 256 * mainMem[0x47]
  const blockStart = 512 * block
  let addr = mainMem[0x44] + 256 * mainMem[0x45]
  console.log(`cmd=${mainMem[0x42]} addr=${addr.toString(16)} block=${block.toString(16)}`)
  if (addr >= 0xD000 && addr <= 0xDFFF) {
    // Bank1 of $D000-$DFFF is stored in $C000, so adjust address if necessary
    if (!SWITCHES.BSRBANK2.isSet) {
      addr -= 0x1000
    }
  }

  switch (mainMem[0x42]) {
    case 0:
      console.log("status")
      break;
    case 1:
      if (blockStart + 512 > driveState[currentDrive].diskData.length) {
        console.error("block start > harddisk length")
      }
      const dataRead = driveState[currentDrive].diskData.slice(blockStart, blockStart + 512)
      mainMem.set(dataRead, addr)
      break;
    case 2:
      if (blockStart + 512 > driveState[currentDrive].diskData.length) {
        console.error("block start > harddisk length")
      }
      const dataWrite = mainMem.slice(addr, addr + 512)
      driveState[currentDrive].diskData.set(dataWrite, blockStart)
      break;
    case 3:
      console.log("format")
      break;
    default:
      console.log("unknown hard drive command")
      return result + 4
  }

  driveState[currentDrive].motorRunning = true
  if (!timerID) {
    timerID = setTimeout(motorTimeout, 500)
  }
  passData()
  return result
}