import { parseAssembly } from "./assembler"
import { setX, setY, setCarry } from "./instructions"
import { setSlotDriver, memGet, getDataBlock, setDataBlock } from "./memory"
import { decodeDiskData } from "./decodedisk"
import { getDriveState, passData } from "./drivestate"

let currentDrive = 2
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
         LDA   #$60   ; Fake RTS to determine our slot
         STA   $07FF
         JSR   $07FF
         TSX
         LDA   $100,X  ; High byte of slot adddress
         STA   $07FF
         ASL           ; Shift $Cs up to $s0
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
const code2 = `
         BCS   ERR
         LDA   #$00
         RTS
ERR      LDA   #$27
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

export const doSetHardDriveProps = (props: DriveProps) => {
  currentDrive = props.drive
  let dd = getDriveState(currentDrive)
  dd.hardDrive = props.hardDrive
  dd.drive = props.drive
  dd.diskData = new Uint8Array()
  dd.status = props.filename
  dd.filename = props.filename
  dd.motorRunning = props.motorRunning
  if (props.diskData.length > 0) {
    dd.diskData = decodeDiskData(dd, props.diskData)
  }
  passData()
}

export const processHardDriveBlockAccess = () => {
  let dd = getDriveState(currentDrive)
  const block = memGet(0x46) + 256 * memGet(0x47)
  const blockStart = 512 * block
  let addr = memGet(0x44) + 256 * memGet(0x45)
  const dataLen = dd.diskData.length
//  console.log(`cmd=${memGet(0x42)} addr=${addr.toString(16)} block=${block.toString(16)}`)

  switch (memGet(0x42)) {
    case 0:
      // Status test: 300: A2 AB A0 CD 8D 06 C0 A9 00 85 42 A9 70 85 43 20 EA C7 00
      if (dd.filename.length === 0 || dataLen === 0) {
        setX(0)
        setY(0)
        setCarry()
        return
      }
      const nblocks = dataLen / 512
      setX(nblocks & 0xFF)
      setY(nblocks >>> 8)
      break;
    case 1:
      if (blockStart + 512 > dataLen) {
        setCarry()
        return
      }
      const dataRead = dd.diskData.slice(blockStart, blockStart + 512)
      setDataBlock(addr, dataRead)
      break;
    case 2:
      if (blockStart + 512 > dataLen) {
        setCarry()
        return
      }
      const dataWrite = getDataBlock(addr)
      dd.diskData.set(dataWrite, blockStart)
      dd.diskHasChanges = true
      break;
    case 3:
      console.error("Hard drive format not implemented yet")
      setCarry()
      return
    default:
      console.error("unknown hard drive command")
      setCarry()
      return
  }

  setCarry(false)
  dd.motorRunning = true
  if (!timerID) {
    timerID = setTimeout(() => {
      timerID = 0
      dd.motorRunning = false
      passData()
    }, 500)
  }
  passData()
}