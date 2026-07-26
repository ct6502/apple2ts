
// Vera Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)

import { interruptRequest, registerCycleCountCallback } from "../../cpu6502"
import { s6502 } from "../../instructions"
import { setSlotIOCallback } from "../../memory"
import { video_init, video_step, video_update, video_reset, video_read, video_write, video_get_irq_out } from "./video"
import { vera_spi_init, vera_spi_step, sdcard_select } from "./sdcard"

let slot: number = 5
let curInter: boolean = false

const interrupt = (onoff: boolean): void => {
  if (onoff != curInter) {
    curInter = onoff
    interruptRequest(slot, onoff)
  }
}

const veraInit = (): boolean => {
  const result = video_init()
  if (!result)
    console.log("video_init fails")

  vera_spi_init()
  return result
}

export const initVera = () => {
  video_reset()
  sdcard_select(false)
}

export const resetVera = () => {
  video_reset()
}

export const enableVera = (enable = true, aslot = 3) => {
  if (!enable)
    return

  if (!veraInit())
    return

  slot = aslot

  // this card has no ROM, but has registers in the ROM area
  setSlotIOCallback(slot, handleVeraIO)
  registerCycleCountCallback(cycleCountCallback, slot)
}

let prevCycleCount = 0

const cycleCountCallback = (slot: number) => {
  if (prevCycleCount)
  {
    const cycleDelta = s6502.cycleCount - prevCycleCount
    // 1mhz, nm 
    const newFrame = video_step(1, cycleDelta, false)
    vera_spi_step(cycleDelta)
    if (newFrame)
      video_update()

    // maintain interrupt state
    interrupt(video_get_irq_out())
  }
  prevCycleCount = s6502.cycleCount
}

const handleVeraIO = (addr: number, val = -1): number => {
  // We dont have any ROM, but we have vera regs starting at Cx00
  if (addr >= 0xc100) {
    if (val >= 0) {
      video_write(addr&0xff, val)
      return 0
    }
    else
      return video_read(addr&0xff, false)
  }
  return 0
}

