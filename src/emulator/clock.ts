// Clock Driver for Apple2TS by Michael Morrison (codebythepound@gmail.com)

import { setSlotDriver, memSet } from "./memory"

const zeroPad = (num : number, places : number) => String(num).padStart(places, '0')

// from prodos8 manual:
// ProDOS recognizes a clock card if the following bytes are present in the Cn00 ROM:
//
// $Cn00 = $08 $Cn02 = $28 $Cn04 = $58 $Cn06 = $70
//
// The ProDOS clock driver uses the following addresses for its I/O to the clock:
//
// Cn08 - READ entry point Cn0B - WRITE entry point

const prodos8driver = () => {
  const driver = new Uint8Array(256).fill(0x60) // RTS
  driver[0x00] = 0x08
  driver[0x02] = 0x28
  driver[0x04] = 0x58
  driver[0x06] = 0x70
  return driver
}

const code = prodos8driver();

export const enableClockCard = (enable = true, slot = 2) => {
  if (!enable)
    return

  const readAddr = 0x08
  const addr = 0xC000 + readAddr + slot * 0x100
  setSlotDriver(slot, code, addr, handleClockRead)
}

const handleClockRead = () => {
  // from prodos8 manual:
  // The ProDOS clock driver expects the clock card to send an ASCII string to the GETLN input buffer ($200).
  // This string must have the following format (including the commas):
  //
  // mo,da,dt,hr,mn
  //
  // where:
  // mo is the month (01 = January...12 = December)
  // da is the day of the week (00 = Sunday...06 = Saturday)
  // dt is the date (01 through 31)
  // hr is the hour (00 through 23)
  // mn is the minute (00 through 59)
  //
  // For example:
  //
  // 07,04,14,22,46
  //
  // would represent Thursday, July 14, 10:46 p.m. The year is looked up in a table in the clock driver.

  const date = new Date()
  const output = zeroPad(date.getMonth() + 1, 2)  + ','
               + zeroPad(date.getDay(), 2)    + ','
               + zeroPad(date.getDate(), 2)   + ','
               + zeroPad(date.getHours(), 2)  + ','
               + zeroPad(date.getMinutes(), 2)

  // write to 0x200 and convert to high ascii
  for(let i=0;i<output.length;i++)
    memSet(0x200+i, output.charCodeAt(i) | 0x80)
}
