/* Copyright 2023 Michael Morrison <codebythepound@gmail.com>
 */

import { passHelptext } from "./worker2main"
import { setSlotDriver, setSlotIOCallback, memGet } from "./memory"
import { setCarry, s6502 } from "./instructions"

// temporary, move elsewhere
interface CommDevice {
  // may or may not be called
  init(): boolean;
  canRead(): boolean;
  readChar(): number;
  canWrite(): boolean;
  writeChar(char: number): void;
  printBuffer: string;
}

let buffer: string = ""

const CommDev : CommDevice = {
  printBuffer: buffer,
  init: () => { return true },
  canRead: () => { return true },
  canWrite: () => { return true },
  writeChar: (byte: number) => {
    let charOut = String.fromCharCode(byte & 0x7f)
    //console.log("serial: (" + byte + "): " + charOut)
    buffer += charOut;
    passHelptext(buffer)
  },
  readChar: () => { return 0x00 },
}

let code = new Uint8Array()
let slot = 1
const basicEntry  = 0x00
//const CSWL = 0x36 // Character output SWitch
const CSWH = 0x37
//const KSWL = 0x38 // Keyboard input SWitch
const KSWH = 0x39

const pascalInitOff     = 0x0d
const pascalReadOff     = 0x0e
const pascalWriteOff    = 0x0f
const pascalStatusOff   = 0x10
const pascalExtendedOff = 0x11

const pascalInit   = 0x20
const pascalRead   = 0x22
const pascalWrite  = 0x24
const pascalStatus = 0x26

const pascalDriver = () => {
  const driver = new Uint8Array(256).fill(0x60) // RTS
  driver[0x05] = 0x38  // Pascal values claiminig the type of card we are
  driver[0x07] = 0x18
  driver[0x0b] = 0x01
  driver[0x0c] = 0x31  // 0x31 is apple super serial, 0x3x would be off-brand

  driver[pascalInitOff]     = pascalInit
  driver[pascalReadOff]     = pascalRead
  driver[pascalWriteOff]    = pascalWrite
  driver[pascalStatusOff]   = pascalStatus
  driver[pascalExtendedOff] = 0xff  // no extended support
  return driver
}

export const enableSerialCard = (enable = true, aslot = 1) => {
  if (!enable)
    return

  slot = aslot
  code = pascalDriver()

  let baseAddr = 0xC000 + slot * 0x100
  setSlotDriver(slot, code, baseAddr+basicEntry,  handleBasicEntry)

  setSlotDriver(slot, code, baseAddr+pascalInit,   handlePascalInit)
  setSlotDriver(slot, code, baseAddr+pascalRead,   handlePascalRead)
  setSlotDriver(slot, code, baseAddr+pascalWrite,  handlePascalWrite)
  setSlotDriver(slot, code, baseAddr+pascalStatus, handlePascalStatus)

  setSlotIOCallback(slot, handleIO)
}

const handleIO = (addr:number, value: number): number => {

    // we don't manage CX00 space
    if (addr >= 0xC100) return -1

    const isWrite = value >= 0
 
    const REG = {
        DIPSW1:   0x01,
        DIPSW2:   0x02,
        IOREG:    0x08,
        STATUS:   0x09,
        COMMAND:  0x0A,
        CONTROL:  0x0B,
    };

    var command = 0x02;
    var control = 0x00;

    switch (addr & 0x0f) {
      case REG.DIPSW1:
          //       off = 1
          // SW:   1   2   3   4      5   6  7
          // Val:  off off off on     off on on
          //       1   1   1   0  0 0 1   0  0
          // Bit:  7   6   5   4  3 2 1   0
          return 0xE2;
      case REG.DIPSW2:
          // SW:   1    2     3   4  5  6   7
          // Val:  on   off   off on on off off cts
          //       0  0 1   0 1   0  0  1   1   0 = on
          // Bit:  7  6 5   4 3   2  1          0
          return 0x28;
      case REG.IOREG:
          if (isWrite)
            CommDev.writeChar(value);
          else
            return CommDev.readChar();
          break;
      case REG.STATUS:
          if(isWrite)
          {
            // a write resets the 6551
            console.log('SuperSerial RESET');
            command = 0x02;
            control = 0x00;
            break;
          }
          else
          {
            // ignore all status and errors except recv/send registers.
            // bit 4 = transmit reg empty
            // bit 3 = receive reg ful
            var stat = 0x10;
            stat |= CommDev.canRead() ? 0x08 : 0;  
            return stat;
          }
      case REG.COMMAND:
          if(isWrite)
          {
            console.log('SuperSerial COMMAND: 0x' + value.toString(16) ); 
            command = value;
            break;
          }
          else
            return command;
      case REG.CONTROL:
          if(isWrite)
          {
            console.log('SuperSerial CONTROL: 0x' + value.toString(16) ); 
            control = value;
            break;
          }
          else
            return control;
      default:
          console.log('SuperSerial unknown softswitch', addr.toString(16));
          break;
    }

    return 0;
}

// entry: X: (anything)  Y: (anything)  A: (char.out)
// exit : X: (unchanged) Y: (unchanged) A: (char.in)
const handleBasicEntry = () => {
  let SLH = 0xC0 + slot

  if (memGet(CSWH) === SLH) {
    // if CSW hook is set, it was from PR#1
    CommDev.writeChar(s6502.Accum)
  } else if (memGet(KSWH) === SLH) {
    // if KSW hook is set, it was from IN#1
    s6502.Accum = CommDev.readChar()
  }
}

// entry: X: $Cs        Y: $s0 A: (anything)
// exit : X: Error Code Y: $s0 A: (changed)
const handlePascalInit = () => {
  //console.log("pascal Init:")
  if (CommDev.init())
    s6502.XReg = 0x00
  else
    // not sure what the error codes are?
    s6502.XReg = 0x01
}

// entry: X: $Cs        Y: $s0 A: (anything)
// exit : X: Error Code Y: $s0 A: char.in
const handlePascalRead = () => {
  //console.log("pascal Read")
  s6502.Accum = CommDev.readChar()
  s6502.XReg = 0x00
}

// entry: X: $Cs        Y: $s0 A: char.out
// exit : X: Error Code Y: $s0 A: (changed)
const handlePascalWrite = () => {
  //console.log("pascal Write: " + s6502.Accum)
  CommDev.writeChar(s6502.Accum)
  s6502.XReg = 0x00
}

// entry: X: $Cs        Y: $s0 A: request [0 (ready to xmit) or 1 (ready to recv)]
// exit : X: Error Code Y: $s0 A: Error Code
//        Carry: Set - Yes, Clear - No
const handlePascalStatus = () => {
  //console.log("pascal Status: " + s6502.Accum)
  s6502.XReg = 0x00
  setCarry(s6502.Accum ? CommDev.canRead() : CommDev.canWrite())
}
