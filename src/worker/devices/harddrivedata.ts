import { setX, setY, setCarry, s6502, setAccumulator } from "../instructions"
import { setSlotDriver, memGet, getDataBlock, setMemoryBlock, memSet } from "../memory"
import { getHardDriveData, getHardDriveState, passDriveData } from "./drivestate"
import { toHex } from "../../common/utility"
import { parseAssembly } from ".././utility/assembler"

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


// Units the SmartPort driver status advertises. This is the card's capacity,
// not the number of drives with media: units 1 and 2 are backed by driveState,
// every other unit is an empty bay that answers "offline" (see SP_DRIVE_UNITS).
const SP_MAX_UNIT = 32

// Units that actually map onto hard drive 1 and 2.
const SP_DRIVE_UNITS = 2

const hasSmartPortDrive = (unit: number) => unit >= 1 && unit <= SP_DRIVE_UNITS

const getSmartPortDataLength = (unit: number) =>
  hasSmartPortDrive(unit) ? getHardDriveData(unit)[2] : 0

// Status byte for a block device:
// Bit   Function
//  7    1 = block device; 0 = character device
//  6    1 = write allowed
//  5    1 = read allowed
//  4    1 = device on line or disk in drive
//  3    1 = format allowed
//  2    1 = media write-protected (block devices only)
//  1    Reserved; must = 0
//  0    1 = disk switched since last status (block) / device open (character)
// Values match gssquared pdblock3.cpp get_drive_info() / status code $00.
const SP_STATUS_ONLINE = 0b1111_0000     // 0xF0
const SP_STATUS_WRITEPROT = 0b1011_0100   // 0xB4
const SP_STATUS_OFFLINE = 0b1110_0000     // 0xE0, no disk in drive: bit 4 clear
const SP_STATUS_DISK_SWITCHED = 0b0000_0001

// ProDOS-16 SmartPort error codes (gssquared pdb_structures.hpp)
const SP_ERROR_IO = 0x27
const SP_ERROR_NO_DEVICE = 0x28
const SP_ERROR_WRITE_PROTECTED = 0x2B
const SP_ERROR_DEVICE_OFFLINE = 0x2F

// 0x10000 blocks means 32MB, which the real driver cannot express in 16 bits.
const fixBlockCount32MB = (nblocks: number) => nblocks === 0x10000 ? 0xFFFF : nblocks

const getSmartPortStatusByte = (unitNumber: number, dataLen: number) => {
  if (dataLen === 0) return SP_STATUS_OFFLINE
  const ds = getHardDriveState(unitNumber)
  const base = ds?.isWriteProtected ? SP_STATUS_WRITEPROT : SP_STATUS_ONLINE
  // Reading the status acknowledges the change, exactly as pdblock3 does.
  if (ds?.diskSwitched) {
    ds.diskSwitched = false
    return base | SP_STATUS_DISK_SWITCHED
  }
  return base
}


const handleSmartPortDeviceStatus = (unitNumber: number, bufferAddr: number) => {
  if (unitNumber === 0) {
    // SmartPort Driver Status: report how many units this card can ever hold,
    // not how many currently have media. Empty units report "offline" below.
    memSet(bufferAddr, SP_MAX_UNIT)
  } else if (unitNumber <= SP_MAX_UNIT) {
    // Units above SP_DRIVE_UNITS have no drive behind them; they report the
    // same "not on line" status as an empty bay.
    const dataLen = getSmartPortDataLength(unitNumber)
    // An empty drive must report "not on line" (bit 4 clear), otherwise the
    // OS assumes it can read blocks and faults when the media is missing.
    memSet(bufferAddr, getSmartPortStatusByte(unitNumber, dataLen))
    const nblocks = fixBlockCount32MB(dataLen / 512)
    memSet(bufferAddr + 1, nblocks & 0xFF)
    memSet(bufferAddr + 2, (nblocks >>> 8) & 0xFF)
    memSet(bufferAddr + 3, (nblocks >>> 16) & 0xFF)
    // We transferred 4 bytes
    setX(4)
    setY(0)
  } else {
    setAccumulator(SP_ERROR_NO_DEVICE)  // bad drive/unit number
    setX(0)
    setY(0)
    setCarry()
  }
}


const handleSmartPortDeviceInformationBlock = (unitNumber: number, bufferAddr: number) => {
  const dataLen = getSmartPortDataLength(unitNumber)
  const nblocks = fixBlockCount32MB(dataLen / 512)
  // claim we are a 3.5" drive if 1600 or less blocks
  const deviceType = nblocks > 1600 ? 0x02 : 0x01  // 1 = 3.5 drive 2 = hard disk
  // GS/OS treats device type $05 as SCSI and demands a SCSI driver, so a hard
  // disk must report type $02.
  // Device subtype. Do NOT set the extended-SmartPort bits ($C0) that
  // gssquared's BAZFAST3 DIB uses: GS/OS then switches to the extended command
  // set, whose parameter lists carry a 3-byte pointer. We only decode the
  // standard 2-byte form in processSmartPortAccess(), so advertising extended
  // support stalls the boot on the "Welcome to the IIgs" screen.
  const subType    = deviceType === 0x02 ? 0x20 : 0x40
  // status byte as above. An empty drive reports "not on line" (bit 4 clear).
  memSet(bufferAddr, getSmartPortStatusByte(unitNumber, dataLen))
  // then block count for 3 bytes
  memSet(bufferAddr + 1, nblocks & 0xFF)
  memSet(bufferAddr + 2, (nblocks >>> 8) & 0xFF)
  memSet(bufferAddr + 3, (nblocks >>> 16) & 0xFF)
  // id string
  const a2ts = "Apple2TS SP"
  memSet(bufferAddr + 4, a2ts.length)
  let i=0
  for (;i < a2ts.length; i++) {
    memSet(bufferAddr + 5 + i, a2ts.charCodeAt(i))
  }
  for (;i < 16; i++) {
    memSet(bufferAddr + 5 + i, a2ts.charCodeAt(8)) // backfill with space
  }
  // device type
  memSet(bufferAddr + 21, deviceType)
  // device subtype
  memSet(bufferAddr + 22, subType)
  // fw version
  memSet(bufferAddr + 23, 0x03)
  memSet(bufferAddr + 24, 0x00)
  // We transferred 25 bytes
  setX(25)
  setY(0)
  if (dataLen === 0) {
    setAccumulator(SP_ERROR_DEVICE_OFFLINE)
    setCarry()
  }
}


const handleSmartPortStatus = (spParamList: number, unitNumber: number, bufferAddr: number) => {
  if (memGet(spParamList, false) !== 3) {
    console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
    setAccumulator(4)  // bad parameter count
    setCarry()
    return
  }
  const statusCode = memGet(spParamList + 4)
  switch (statusCode) {
    case 0:  // return device status
      handleSmartPortDeviceStatus(unitNumber, bufferAddr)
      break
    case 1: // illegal
    case 2: // illegal
      setAccumulator(0x21)
      setCarry()
      break
    case 3:  // return Device Information Block (DIB)
    case 4:  // same as case 3
      handleSmartPortDeviceInformationBlock(unitNumber, bufferAddr)
      break
    default:
      console.error(`SmartPort statusCode ${statusCode} not implemented`)
      break
  }
}


const processSmartPortAccess = () => {
  // Assume success. We will set failure if needed.
  setAccumulator(0)
  setCarry(false)
  // A SmartPort call is coded as a JSR to the SmartPort entry point,
  // followed by the 1-byte command number, followed by the
  // 2-byte command parameter-list pointer.
  // Retrieve these values by looking at the JSR address on the stack.
  const S = 0x100 + s6502.StackPtr
  const callAddr = memGet(S + 1) + 256 * memGet(S + 2)
  const spCommand = memGet(callAddr + 1)
  const spParamList = memGet(callAddr + 2) + 256 * memGet(callAddr + 3)
  // These parameters are needed for status (0), read (1), and write (2)
  const unitNumber = memGet(spParamList + 1)
  const bufferAddr = memGet(spParamList + 2) + 256 * memGet(spParamList + 3)
  // console.log(`processSmartPortAccess cmd=${spCommand} unit=${unitNumber}`)

  // Remember the block a read/write touched so the drive panel shows it. The
  // ProDOS-8 entry point ($C7C0) already publishes this; GS/OS reads through
  // the SmartPort entry ($C7C3), which used to leave the label frozen at
  // whatever the ROM's boot scan last accessed.
  let accessedBlock = -1

  switch (spCommand) {
    case 0: {
      handleSmartPortStatus(spParamList, unitNumber, bufferAddr)
      return
    }
    case 1: {
      if (memGet(spParamList, false) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const block = memGet(spParamList + 4) + 256 * memGet(spParamList + 5) +
        65536 * memGet(spParamList + 6)
      const blockStart = 512 * block
      accessedBlock = block
      const [dd, offset, dataLen] = hasSmartPortDrive(unitNumber)
        ? getHardDriveData(unitNumber) : [new Uint8Array(0), 0, 0]
      if (dataLen === 0) {
        // No media in the drive. Report "device offline" so the OS knows the
        // difference between "drive is empty" and "read failed".
        setAccumulator(SP_ERROR_DEVICE_OFFLINE)
        setCarry(true)
        return
      }
      if (blockStart + 512 > dataLen) {
        setAccumulator(SP_ERROR_IO)
        setCarry(true)
        return
      }
      const dataRead = dd.slice(blockStart + offset, blockStart + 512 + offset)
      setMemoryBlock(bufferAddr, dataRead)
      break
    }
    case 2: {  // WriteBlock
      if (memGet(spParamList, false) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const block = memGet(spParamList + 4) + 256 * memGet(spParamList + 5) +
        65536 * memGet(spParamList + 6)
      const blockStart = 512 * block
      accessedBlock = block
      if (!hasSmartPortDrive(unitNumber)) {
        setAccumulator(SP_ERROR_DEVICE_OFFLINE)
        setCarry(true)
        return
      }
      const ds = getHardDriveState(unitNumber)
      const [dd, offset, dataLen] = getHardDriveData(unitNumber)
      if (dataLen === 0) {
        setAccumulator(SP_ERROR_DEVICE_OFFLINE)
        setCarry(true)
        return
      }
      if (blockStart + 512 > dataLen) {
        setAccumulator(SP_ERROR_IO)
        setCarry(true)
        return
      }
      if (ds.isWriteProtected) {
        setAccumulator(SP_ERROR_WRITE_PROTECTED)
        setCarry(true)
        return
      }
      const dataWrite = getDataBlock(bufferAddr, 512)
      dd.set(dataWrite, blockStart + offset)
      ds.diskHasChanges = true
      ds.lastAppleWriteTime = Date.now()
      break
    }
    case 3:  // Format
      console.error("SmartPort format not implemented")
      setAccumulator(SP_ERROR_IO)
      setCarry()
      return
    case 4:  // Control/Eject. SmartPort TN #2: fixed disks return success.
      return
    default:
      console.error(`SmartPort command ${spCommand} not implemented`)
      setAccumulator(SP_ERROR_NO_DEVICE)
      setCarry()
      return
  }
  const ds = hasSmartPortDrive(unitNumber) ? getHardDriveState(unitNumber) : undefined
  if (ds) {
    ds.motorRunning = true
    if (accessedBlock >= 0) ds.status = ` ${toHex(accessedBlock, 4)}`
  }
  if (!timerID) {
    timerID = setTimeout(() => {
      timerID = 0
      if (ds) ds.motorRunning = false
      passDriveData()
    }, 500)
  }
  passDriveData()
}


const processHardDriveBlockAccess = () => {
  // Assume success. We will set failure if needed.
  setAccumulator(0)
  setCarry(false)
  const firmwareCommandNumber = memGet(0x42)
  const driveNumber = Math.max(Math.min(memGet(0x43) >> 6, 2), 0)
  const ds = getHardDriveState(driveNumber)
  if (!ds.hardDrive) return
  const [dd, offset, dataLen] = getHardDriveData(driveNumber)
  const block = memGet(0x46) + 256 * memGet(0x47)
  const blockStart = 512 * block
  const bufferAddr = memGet(0x44) + 256 * memGet(0x45)
  ds.status = ` ${toHex(block, 4)}`

  switch (firmwareCommandNumber) {
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
      const dataRead = dd.slice(blockStart + offset, blockStart + 512 + offset)
      setMemoryBlock(bufferAddr, dataRead)
      break
    }
    case 2: {
      if (blockStart + 512 > dataLen) {
        setCarry()
        return
      }
      if (ds.isWriteProtected) {
        setCarry()
        return  
      }
      const dataWrite = getDataBlock(bufferAddr)
      dd.set(dataWrite, blockStart + offset)
      ds.diskHasChanges = true
      ds.lastAppleWriteTime = Date.now()
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
      passDriveData()
    }, 500)
  }
  passDriveData()
}
