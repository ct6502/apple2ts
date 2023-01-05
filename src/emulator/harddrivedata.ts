import { parseAssembly } from "./assembler"
import { setX, setY } from "./instructions"
import { setSlotDriver, memGet, getDataBlock, setDataBlock } from "./memory"
import { passDriveProps } from "./worker2main"

let currentDrive = 0
let timerID: any | number = 0

const code1 = `
         LDX   #$20
         LDA   #$00
         LDX   #$03
         LDA   #$01
         STA   $42
         BIT   $CFFF
         LDA   #$4C   ; JMP $CsDC
         STA   $07FD
         LDA   #$DC
         STA   $07FE
         LDA   $07F8  ; holds $Cs, where s is current slot number
         STA   $07FF
         ASL
         ASL
         ASL
         ASL
         STA   $43
         LDA   #$08
         STA   $45
         LDA   #$00
         STA   $44
         STA   $46
         STA   $47
         JSR   $07FD
         BCS   ERROR
         LDA   #$0A
         STA   $45
         LDA   #$01
         STA   $46
         JSR   $07FD
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
const statusOffset = 4
const errOffset = 8
const code2 = `
         CLC
         LDA   #$00
         RTS
         LDX   #$00  ; addr + 4
         LDY   #$00
         SEC         ; addr + 8
         LDA   #$27
         RTS
`
const prodos8driver = () => {
  const driver = new Uint8Array(256).fill(0)
  let pcode = parseAssembly(0x0, code1.split("\n"))
  driver.set(pcode, 0)
  pcode = parseAssembly(0x0, code2.split("\n"))
  driver.set(pcode, 0xDC)
  driver[0xFE] = 0b00010011
  driver[0xFF] = 0xDC
  return driver
}

export const enableHardDrive = () => {
  setSlotDriver(7, prodos8driver(), 0xC7DC, processHardDriveBlockAccess)
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

const int32 = (data: Uint8Array) => {
  return data[0] + 256 * (data[1] + 256 * (data[2] + 256 * data[3]))
}

const decode2MG = (driveState: DriveProps, diskData: Uint8Array) => {
//    const nblocks = int32(diskData.slice(0x14, 0x18))
  const offset = int32(diskData.slice(0x18, 0x1c))
  const nbytes = int32(diskData.slice(0x1c, 0x20))
  let magic = ''
  for (let i = 0; i < 4; i++) magic += String.fromCharCode(diskData[i]) 
  if (magic !== '2IMG') {
    console.error("Corrupt 2MG file.")
    driveState.filename = ""
    return new Uint8Array()
  }
  if (diskData[12] !== 1) {
    console.error("Only ProDOS 2MG files are supported.")
    driveState.filename = ""
    return new Uint8Array()
  }
  return diskData.slice(offset, offset + nbytes)
}

const decodeDiskData = (driveState: DriveProps, diskData: Uint8Array): Uint8Array => {
  driveState.diskHasChanges = false
  const fname = driveState.filename.toLowerCase()
  if (fname.endsWith('.hdv')) {
    return diskData
  } else if (fname.endsWith('.2mg')) {
    return decode2MG(driveState, diskData)
  } else if (fname.endsWith('.po')) {
    return diskData
  }
  console.error("Unknown disk format.")
  driveState.filename = ""
  return new Uint8Array()
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
        diskData: driveState[i].diskHasChanges ? driveState[i].diskData : new Uint8Array()
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

export const processHardDriveBlockAccess = (driverAddress: number) => {
  const result = driverAddress
  if (memGet(0x43) !== 16 * (memGet(0x7F8) & 0xF)) {
    console.log("illegal value in 0x43: " + memGet(0x43))
    return result + errOffset
  }
  const block = memGet(0x46) + 256 * memGet(0x47)
  const blockStart = 512 * block
  let addr = memGet(0x44) + 256 * memGet(0x45)
//  console.log(`cmd=${memGet(0x42)} addr=${addr.toString(16)} block=${block.toString(16)}`)

  switch (memGet(0x42)) {
    case 0:
      // Status test: 300: A2 AB A0 CD 8D 06 C0 A9 00 85 42 A9 70 85 43 20 EA C7 00
      const len = driveState[currentDrive].diskData.length
      if (driveState[currentDrive].filename.length === 0 || len === 0) {
        return result + statusOffset
      }
      const nblocks = len / 512
      setX(nblocks & 0xFF)
      setY(nblocks >>> 8)
      break;
    case 1:
      if (blockStart + 512 > driveState[currentDrive].diskData.length) {
        console.error("block start > harddisk length")
        return result + errOffset
      }
      const dataRead = driveState[currentDrive].diskData.slice(blockStart, blockStart + 512)
      setDataBlock(addr, dataRead)
      break;
    case 2:
      if (blockStart + 512 > driveState[currentDrive].diskData.length) {
        console.error("block start > harddisk length")
        return result + errOffset
      }
      const dataWrite = getDataBlock(addr)
      driveState[currentDrive].diskData.set(dataWrite, blockStart)
      driveState[currentDrive].diskHasChanges = true
      break;
    case 3:
      console.log("format")
      break;
    default:
      console.error("unknown hard drive command")
      return result + errOffset
  }

  driveState[currentDrive].motorRunning = true
  if (!timerID) {
    timerID = setTimeout(motorTimeout, 500)
  }
  passData()
  return result
}