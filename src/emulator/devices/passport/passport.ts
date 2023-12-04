// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)

//import { passTxMidiData } from "../worker2main"
import { MC6850 } from "./mc6850"
import { MC6840 } from "./mc6840"
import { registerCycleCountCallback } from "../../cpu6502"
import { s6502 } from "../../instructions"
import { setSlotIOCallback } from "../../memory"

let slot = 2
let timer: MC6840
let acia: MC6850

let prevCycleCount = 0

const cycleCountCallback = (slot: number) => {
  if (prevCycleCount)
  {
    const cycleDelta = s6502.cycleCount - prevCycleCount
    timer.update(cycleDelta)
  }
  prevCycleCount = s6502.cycleCount
}

export const receiveMidiData = (data: Uint8Array): void => {
  acia.buffer(data)
}

const sendMidiData = (data: Uint8Array): void => {
  // dummy until we can expose passTxMidiData
}

export const enablePassportCard = (enable = true, aslot = 2) => {
  if (!enable)
    return

  slot = aslot
  timer = new MC6840(slot)
  acia  = new MC6850(slot, sendMidiData)

  // passport midi cards have no ROM
  setSlotIOCallback(slot, handleMIDIIO)
  registerCycleCountCallback(cycleCountCallback, slot)
}

export const resetPassport = () => {
  if (timer)
  {
    timer.reset()
    acia.reset()
  }
}

const handleMIDIIO = (addr: number, val = -1): number => {

  // There is no ROM
  if (addr >= 0xC100)
    return -1

  const REG = {
      TCONTROL1:    0x00, 
      TCONTROL2:    0x01, 
      T1MSB:        0x02, 
      T1LSB:        0x03, 
      T2MSB:        0x04, 
      T2LSB:        0x05, 
      T3MSB:        0x06, 
      T3LSB:        0x07, 
      ACIASTATCTRL: 0x08,
      ACIADATA:     0x09,
      DRUMSET:      0x0e,
      DRUMCLEAR:    0x0f,
  }

  let result = -1
  switch (addr & 0x0f) {
    case REG.ACIADATA:
        if(val >= 0)
        {
          acia.data = val
        }
        else
        {
          result = acia.data
        }
        break

    case REG.ACIASTATCTRL:
        if(val >= 0)
        {
          acia.control = val
        }
        else
        {
          result = acia.status
        }
        break;

    case REG.TCONTROL1:
      break;
    case REG.TCONTROL2:
      break;
    case REG.T1MSB:
      break;
    case REG.T1LSB:
      break;
    case REG.T2MSB:
      break;
    case REG.T2LSB:
      break;
    case REG.T3MSB:
      break;
    case REG.T3LSB:
      break;

    case REG.DRUMSET:
    case REG.DRUMCLEAR:
      // not implemented
      break;

    default:
        console.log('PASSPORT unknown IO', (addr&0xf).toString(16))
        break
    }

    return result
}
