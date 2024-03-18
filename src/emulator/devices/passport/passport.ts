// Passport MIDI Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)
//
// Passport and clones (Yamaha) are a combination of a Motorola 6850 ACIA and a 6840 Timer chip.
// They contain no ROM and therefore *could* live in slot 3, but most midi software expects 
// to find them in slot 2 unfortunately.

import { passTxMidiData } from "../../worker2main"
import { MC6850, MC6850Ext } from "./mc6850"
import { MC6840 } from "./mc6840"
import { registerCycleCountCallback } from "../../cpu6502"
import { s6502 } from "../../instructions"
import { setSlotIOCallback } from "../../memory"
import { interruptRequest } from "../../cpu6502"

let slot = 2
let timer: MC6840
let acia: MC6850

let prevCycleCount = 0

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const cycleCountCallback = (slot: number) => {
  if (prevCycleCount)
  {
    const cycleDelta = s6502.cycleCount - prevCycleCount
    timer.update(cycleDelta)
  }
  prevCycleCount = s6502.cycleCount
}

const interrupt = (onoff: boolean): void => {
  interruptRequest(slot, onoff)
}

export const receiveMidiData = (data: Uint8Array): void => {
  // messages can come in before we are initialized
  if (acia)
    acia.buffer(data)
}

export const enablePassportCard = (enable = true, aslot = 2) => {
  if (!enable)
    return

  slot = aslot
  timer = new MC6840(interrupt)
  const ext: MC6850Ext = {
    sendData: passTxMidiData,
    interrupt: interrupt,
  }
  acia  = new MC6850(ext)

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
      SDMIDICTRL:   0x0C, // SD MIDI ][+ Card uses these registers in addition to 08,09
      SDMIDIDATA:   0x0D, //             to access ACIA.  Confirmed by Ian Kim.
      DRUMSET:      0x0E,
      DRUMCLEAR:    0x0F,
  }

  let result = -1
  switch (addr & 0x0f) {
    case REG.SDMIDIDATA:
    case REG.ACIADATA:
        if(val >= 0)
        {
          //console.log("Write ACIAData: " + val.toString(16))
          acia.data = val
        }
        else
        {
          result = acia.data
          //console.log("Read ACIAData: " + result.toString(16))
        }
        break

    case REG.SDMIDICTRL:
    case REG.ACIASTATCTRL:
        if(val >= 0)
        {
          //console.log("Write ACIAControl: " + val.toString(16))
          acia.control = val
        }
        else
        {
          result = acia.status
          //console.log("Read ACIAControl: " + result.toString(16))
        }
        break;

    case REG.TCONTROL1:
      // reading this register does nothing
      if (val >= 0)
      {
        //console.log("Write Timer Control1: " + val.toString(16))
        timer.timerControl(0, val)
      }
      else
      {
        //console.log("Read Timer Control1: error")
        result = 0x00
      }
      break;
    case REG.TCONTROL2:
      // reading this register gives status
      if (val >= 0)
      {
        //console.log("Write Timer Control2: " + val.toString(16))
        timer.timerControl(1, val)
      }
      else
      {
        result = timer.status()
        //console.log("Read Timer Control2: " + result.toString(16))
      }
      break;
    case REG.T1MSB:
      if (val >= 0)
      {
        //console.log("Write Timer1 MSB: " + val.toString(16))
        timer.timerMSBw(0, val)
      }
      else
        result = timer.timerMSBr(0)
      break;
    case REG.T1LSB:
      if (val >= 0)
      {
        //console.log("Write Timer1 LSB: " + val.toString(16))
        timer.timerLSBw(0, val)
      }
      else
        result = timer.timerLSBr(0)
      break;
    case REG.T2MSB:
      if (val >= 0)
      {
        //console.log("Write Timer2 MSB: " + val.toString(16))
        timer.timerMSBw(1, val)
      }
      else
        result = timer.timerMSBr(1)
      break;
    case REG.T2LSB:
      if (val >= 0)
      {
        //console.log("Write Timer2 LSB: " + val.toString(16))
        timer.timerLSBw(1, val)
      }
      else
        result = timer.timerLSBr(1)
      break;
    case REG.T3MSB:
      if (val >= 0)
      {
        //console.log("Write Timer3 MSB: " + val.toString(16))
        timer.timerMSBw(2, val)
      }
      else
        result = timer.timerMSBr(2)
      break;
    case REG.T3LSB:
      if (val >= 0)
      {
        //console.log("Write Timer3 LSB: " + val.toString(16))
        timer.timerLSBw(2, val)
      }
      else
        result = timer.timerLSBr(2)
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
