import { parseAssembly } from "./assembler"
import { setX, setY, setCarry, s6502 } from "./instructions"
import { setSlotDriver, memGet, getDataBlock, setMemoryBlock, memSet } from "./memory"
import { getHardDriveData, getHardDriveState, passData } from "./drivestate"
import { toHex } from "./utility"

let timerID: NodeJS.Timeout | number = 0

// $Cx00 + driverAddr = address for our hard drive driver
// SmartPort driver is this address + 3
const driverAddr = 0xC0

const code1 = `
         LDX   #$20    ; Apple IIe looks for magic bytes $20, $00, $03.
         LDA   #$00    ; These indicate a disk drive or SmartPort device.
         LDX   #$03
         LDA   #$00    ; $3C=disk drive, $00=SmartPort
         BIT   $CFFF   ; Trigger all peripheral cards to turn off expansion ROMs
         LDA   #$01    ; ProDOS command code = READ
         STA   $42     ; Store ProDOS command code
         LDA   #$4C    ; JMP
         STA   $07FD
         LDA   #$${toHex(driverAddr)}   ; jump address
         STA   $07FE
         LDA   #$60    ; Fake RTS to determine our slot
         STA   $07FF
         JSR   $07FF
         TSX
         LDA   $100,X  ; High byte of slot adddress
         STA   $07FF   ; Store this for the high byte of our JMP command
         ASL           ; Shift $Cs up to $s0 (e.g. $C7 -> $70)
         ASL           ; We need this for the ProDOS unit number (below).
         ASL           ; Format = bits DSSS0000
         ASL           ; D = drive number (0), SSS = slot number (1-7)
         STA   $43     ; Store ProDOS unit number here
         LDA   #$08    ; Store block (512 bytes) at address $0800
         STA   $45     ; Address high byte
         LDA   #$00
         STA   $44     ; Address low byte
         STA   $46     ; Block 0 low byte
         STA   $47     ; Block 0 high byte
         JSR   $07FD   ; Read the block (will JMP to our driver and trigger it)
         BCS   ERROR
         LDA   #$0A    ; Store block (512 bytes) at address $0A00
         STA   $45     ; Address high byte
         LDA   #$01
         STA   $46     ; Block 1 low byte
         JSR   $07FD   ; Read
         BCS   ERROR
         LDA   $0801   ; Should be nonzero
         BEQ   ERROR
         LDA   #$01    ; Should always be 1
         CMP   $0800
         BNE   ERROR
         LDX   $43     ; ProDOS block 0 code wants ProDOS unit number in X
         JMP   $801    ; Continue reading the disk
ERROR    JMP   $E000   ; Out to BASIC on error
`
const code2 = `
         NOP           ; Hard drive driver address
         BRA   DONE
         TSX           ; SmartPort driver address
         INX
         INC   $100,X
         INC   $100,X
         INC   $100,X
DONE     BCS   ERR
         LDA   #$00
         RTS
ERR      LDA   #$27
         RTS
`

// $CnFE status byte
//  bit 7 - Medium is removable.
//  bit 6 - Device is interruptable.
//  bit 5-4 - Number of volumes on the device (0-3).
//  bit 3 - The device supports formatting.
//  bit 2 - The device can be written to.
//  bit 1 - The device can be read from (must be on).
//  bit 0 - The device's status can be read (must be on).

const prodos8driver = () => {
  const driver = new Uint8Array(256).fill(0)
  const pcode1 = parseAssembly(0x0, code1.split("\n"))
  driver.set(pcode1, 0)
  const pcode2 = parseAssembly(0x0, code2.split("\n"))
  driver.set(pcode2, driverAddr)
  driver[0xFE] = 0b00010111  // see above
  driver[0xFF] = driverAddr
  return driver
}

let code = new Uint8Array()

export const enableHardDrive = (enable = true) => {
  const slot = 7
  if (code.length === 0) {
    code = prodos8driver()
  }
  code[1] = enable ? 0x20 : 0x00
  const addr = 0xC000 + driverAddr + slot * 0x100
  setSlotDriver(slot, code, addr, processHardDriveBlockAccess)
  setSlotDriver(slot, code, addr + 3, processSmartPortAccess)
}

const processSmartPortAccess = () => {
  const ds = getHardDriveState()
  if (!ds.hardDrive) return
  const dd = getHardDriveData()
  const S = 0x100 + s6502.StackPtr
  const callAddr = memGet(S + 1) + 256 * memGet(S + 2)
  const spCommand = memGet(callAddr + 1)
  const spParamList = memGet(callAddr + 2) + 256 * memGet(callAddr + 3)
  // These parameters are needed for status (0), read (1), and write (2)
  const unitNumber = memGet(spParamList + 1)
  const bufferAddr = memGet(spParamList + 2) + 256 * memGet(spParamList + 3)

  switch (spCommand) {
    case 0: {
      if (memGet(spParamList) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const statusCode = memGet(spParamList + 4)
      switch (statusCode) {
        case 0:
          if (unitNumber === 0) {
            // Store number of SmartPort devices in the status buffer.
            memSet(bufferAddr, 1)
            setCarry(false)
          } else {
            console.error(`SmartPort status for unitNumber ${unitNumber} not implemented`)
            setCarry()
          }
          break
        default:
          console.error(`SmartPort statusCode ${statusCode} not implemented`)
          setCarry()
          break
      }
      return
    }
    case 1: {
      if (memGet(spParamList) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const block = memGet(spParamList + 4) + 256 * memGet(spParamList + 5) +
        65536 * memGet(spParamList + 6)
      const blockStart = 512 * block
      const dataRead = dd.slice(blockStart, blockStart + 512)
      setMemoryBlock(bufferAddr, dataRead)
      break
    }
    case 2:
    default:
      console.error(`SmartPort command ${spCommand} not implemented`)
      setCarry()
      return
  }
  setCarry(false)
  ds.motorRunning = true
  if (!timerID) {
    timerID = setTimeout(() => {
      timerID = 0
      if (ds) ds.motorRunning = false
      passData()
    }, 500)
  }
  passData()
}

const processHardDriveBlockAccess = () => {
  const ds = getHardDriveState()
  if (!ds.hardDrive) return
  const dd = getHardDriveData()
  const block = memGet(0x46) + 256 * memGet(0x47)
  const blockStart = 512 * block
  const bufferAddr = memGet(0x44) + 256 * memGet(0x45)
  const dataLen = dd.length
  ds.status = ` ${toHex(block, 4)} ${toHex(bufferAddr, 4)}`
//  console.log(`cmd=${memGet(0x42)} ${ds.status}`)

  switch (memGet(0x42)) {
    case 0: {
      // Status test: 300: A2 AB A0 CD 8D 06 C0 A9 00 85 42 A9 70 85 43 20 EA C7 00
      if (ds.filename.length === 0 || dataLen === 0) {
        setX(0)
        setY(0)
        setCarry()
        return
      }
      const nblocks = dataLen / 512
      setX(nblocks & 0xFF)
      setY(nblocks >>> 8)
      break
    }
    case 1: {
      if (blockStart + 512 > dataLen) {
        setCarry()
        return
      }
      const dataRead = dd.slice(blockStart, blockStart + 512)
      setMemoryBlock(bufferAddr, dataRead)
      break;
    }
    case 2: {
      if (blockStart + 512 > dataLen) {
        setCarry()
        return
      }
      const dataWrite = getDataBlock(bufferAddr)
      dd.set(dataWrite, blockStart)
      ds.diskHasChanges = true
      break
    }
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
  ds.motorRunning = true
  if (!timerID) {
    timerID = setTimeout(() => {
      timerID = 0
      if (ds) ds.motorRunning = false
      passData()
    }, 500)
  }
  passData()
}