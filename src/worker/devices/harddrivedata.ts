import { setX, setY, setCarry, s6502, setAccumulator } from "../instructions"
import { setSlotDriver, memGet, memGet24, getDataBlock, setMemoryBlock, memSet, memSet24 } from "../memory"
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
         LDA   $100,X  ; stack scratch holds the inline sequence length (3 or 5)
         TAY
         INX
LOOP     INC   $100,X  ; advance the caller's saved return address
         DEY
         BNE   LOOP
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

const read16 = (addr: number) =>
  memGet(addr, false) + 256 * memGet(addr + 1, false)
const read24 = (addr: number) =>
  read16(addr) + 65536 * memGet(addr + 2, false)
const read32 = (addr: number) =>
  read24(addr) + 16777216 * memGet(addr + 3, false)

// DMA memory accesses carry a 24-bit bank/address. Read/write one byte at a
// time through memGet24/memSet24 so an extended command can address any bank;
// bank $00 addresses can use the existing page-aware block helpers.
const getDataBlock24 = (addr: number, length = 512) =>
  Uint8Array.from({ length }, (_, i) => memGet24((addr + i) & 0xFFFFFF))
const setMemoryBlock24 = (addr: number, data: Uint8Array) => {
  if (addr < 0x10000) {
    setMemoryBlock(addr, data)
    return
  }
  for (let i = 0; i < data.length; i++) memSet24((addr + i) & 0xFFFFFF, data[i])
}

const setSmartPortByte = (addr: number, value: number, extended = false) =>
  extended ? memSet24(addr & 0xFFFFFF, value) : memSet(addr, value)

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


const handleSmartPortDeviceStatus = (unitNumber: number, bufferAddr: number, extended = false) => {
  if (unitNumber === 0) {
    // SmartPort Driver Status: report how many units this card can ever hold,
    // not how many currently have media. Empty units report "offline" below.
    setSmartPortByte(bufferAddr, SP_MAX_UNIT, extended)
  } else if (unitNumber <= SP_MAX_UNIT) {
    // Units above SP_DRIVE_UNITS have no drive behind them; they report the
    // same "not on line" status as an empty bay.
    const dataLen = getSmartPortDataLength(unitNumber)
    // An empty drive must report "not on line" (bit 4 clear), otherwise the
    // OS assumes it can read blocks and faults when the media is missing.
    setSmartPortByte(bufferAddr, getSmartPortStatusByte(unitNumber, dataLen), extended)
    const nblocks = fixBlockCount32MB(dataLen / 512)
    setSmartPortByte(bufferAddr + 1, nblocks & 0xFF, extended)
    setSmartPortByte(bufferAddr + 2, (nblocks >>> 8) & 0xFF, extended)
    setSmartPortByte(bufferAddr + 3, (nblocks >>> 16) & 0xFF, extended)
    if (extended) setSmartPortByte(bufferAddr + 4, (nblocks >>> 24) & 0xFF, extended)
    // Standard SmartPort returns a 3-byte block count; the extended form the
    // Coke Utilities boot loader uses returns a 32-bit one.
    setX(extended ? 5 : 4)
    setY(0)
  } else {
    setAccumulator(SP_ERROR_NO_DEVICE)  // bad drive/unit number
    setX(0)
    setY(0)
    setCarry()
  }
}


const handleSmartPortDeviceInformationBlock = (unitNumber: number, bufferAddr: number, extended = false) => {
  const dataLen = getSmartPortDataLength(unitNumber)
  const nblocks = fixBlockCount32MB(dataLen / 512)
  // claim we are a 3.5" drive if 1600 or less blocks
  const deviceType = nblocks > 1600 ? 0x02 : 0x01  // 1 = 3.5 drive 2 = hard disk
  // GS/OS treats device type $05 as SCSI and demands a SCSI driver, so a hard
  // disk must report type $02.
  // Device subtype. Do NOT set the extended-SmartPort bits ($C0) that
  // gssquared's BAZFAST3 DIB uses: GS/OS then switches to the extended command
  // set. We decode both forms below, but GS/OS's current boot path keeps using
  // the standard form; advertising extended support stalls the boot on the
  // "Welcome to the IIgs" screen.
  const subType    = deviceType === 0x02 ? 0x20 : 0x40
  // The extended parameter list carries a 32-bit pointer, so its status block
  // has a 4-byte block count and all following fields shift up one byte.
  const shift = extended ? 1 : 0
  // status byte as above. An empty drive reports "not on line" (bit 4 clear).
  setSmartPortByte(bufferAddr, getSmartPortStatusByte(unitNumber, dataLen), extended)
  // then block count for 3 bytes (4 in the extended form)
  setSmartPortByte(bufferAddr + 1, nblocks & 0xFF, extended)
  setSmartPortByte(bufferAddr + 2, (nblocks >>> 8) & 0xFF, extended)
  setSmartPortByte(bufferAddr + 3, (nblocks >>> 16) & 0xFF, extended)
  if (extended) setSmartPortByte(bufferAddr + 4, (nblocks >>> 24) & 0xFF, extended)
  // id string
  const a2ts = "Apple2TS SP"
  setSmartPortByte(bufferAddr + 4 + shift, a2ts.length, extended)
  let i=0
  for (;i < a2ts.length; i++) {
    setSmartPortByte(bufferAddr + 5 + shift + i, a2ts.charCodeAt(i), extended)
  }
  for (;i < 16; i++) {
    setSmartPortByte(bufferAddr + 5 + shift + i, a2ts.charCodeAt(8), extended) // backfill with space
  }
  // device type
  setSmartPortByte(bufferAddr + 21 + shift, deviceType, extended)
  // device subtype
  setSmartPortByte(bufferAddr + 22 + shift, subType, extended)
  // fw version
  setSmartPortByte(bufferAddr + 23 + shift, 0x03, extended)
  setSmartPortByte(bufferAddr + 24 + shift, 0x00, extended)
  // We transferred 25 bytes standard / 26 extended
  setX(25 + shift)
  setY(0)
  if (dataLen === 0) {
    setAccumulator(SP_ERROR_DEVICE_OFFLINE)
    setCarry()
  }
}


const handleSmartPortStatus = (spParamList: number, unitNumber: number, bufferAddr: number,
  extended = false) => {
  if (memGet(spParamList, false) !== 3) {
    console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
    setAccumulator(4)  // bad parameter count
    setCarry()
    return
  }
  const statusCode = memGet(spParamList + (extended ? 6 : 4), false)
  switch (statusCode) {
    case 0:  // return device status
      handleSmartPortDeviceStatus(unitNumber, bufferAddr, extended)
      break
    case 1: // illegal
    case 2: // illegal
      setAccumulator(0x21)
      setCarry()
      break
    case 3:  // return Device Information Block (DIB)
    case 4:  // same as case 3
      handleSmartPortDeviceInformationBlock(unitNumber, bufferAddr, extended)
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
  // A SmartPort call is coded as a JSR to the SmartPort entry point followed by
  // the command byte and a command-list pointer. The stack holds the return
  // address minus one (RTS increments it), so callAddr is one byte before the
  // inline command byte. Standard commands carry a 2-byte pointer and a 16-bit
  // buffer address; extended commands (the $40 flag, used by ProDOS-8 volume
  // boot loaders such as Coke Utilities' 3.5" loader) carry a 4-byte pointer
  // and 32-bit buffer/block fields.
  const S = 0x100 + s6502.StackPtr
  const callAddr = memGet(S + 1) + 256 * memGet(S + 2)
  const commandByte = memGet(callAddr + 1, false)
  const extended = (commandByte & 0x40) !== 0
  const spCommand = extended ? (commandByte & 0x3F) : commandByte
  // The generated slot firmware advances the saved return address by the
  // number of inline bytes: 3 for a standard command+pointer and 5 for an
  // extended command+pointer. Put that count in scratch stack space below the
  // saved return address; the firmware's loop consumes it.
  memSet(S, extended ? 5 : 3)
  const spParamList = extended
    ? read32(callAddr + 2)
    : read16(callAddr + 2)
  const unitNumber = memGet(spParamList + 1, false)

  // Remember the block a read/write touched so the drive panel shows it. The
  // ProDOS-8 entry point ($C7C0) already publishes this; GS/OS reads through
  // the SmartPort entry ($C7C3), which used to leave the label frozen at
  // whatever the ROM's boot scan last accessed.
  let accessedBlock = -1

  switch (spCommand) {
    case 0: {
      const bufferAddr = extended
        ? read32(spParamList + 2)
        : read16(spParamList + 2)
      handleSmartPortStatus(spParamList, unitNumber, bufferAddr, extended)
      return
    }
    case 1: {
      if (memGet(spParamList, false) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const bufferAddr = extended
        ? read32(spParamList + 2)
        : read16(spParamList + 2)
      const block = extended
        ? read32(spParamList + 6)
        : read24(spParamList + 4)
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
      if (extended) {
        setMemoryBlock24(bufferAddr, dataRead)
      } else {
        setMemoryBlock(bufferAddr, dataRead)
      }
      break
    }
    case 2: {  // WriteBlock
      if (memGet(spParamList, false) !== 0x03) {
        console.error(`Incorrect SmartPort parameter count at address ${spParamList}`)
        setCarry()
        return
      }
      const bufferAddr = extended
        ? read32(spParamList + 2)
        : read16(spParamList + 2)
      const block = extended
        ? read32(spParamList + 6)
        : read24(spParamList + 4)
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
      const dataWrite = extended
        ? getDataBlock24(bufferAddr, 512)
        : getDataBlock(bufferAddr, 512)
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
        if (dd.length > 0) {
          console.warn(`[HD READ] block=${block} OUT OF RANGE (blockStart=${blockStart}, dataLen=${dataLen})`)
        }

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
