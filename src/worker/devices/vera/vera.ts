
// Vera Card for Apple2TS copyright Michael Morrison (codebythepound@gmail.com)

import { interruptRequest, registerCycleCountCallback } from "../../cpu6502"
import { s6502 } from "../../instructions"
import { setSlotIOCallback } from "../../memory"
import { passVeraFmReset, passVeraFmWrite } from "../../worker2main"
import { getCpuCyclesPerRefresh } from "../../motherboard"
import { video_init, video_step, video_update, video_reset, video_read, video_write, video_get_irq_out } from "./video"
import { vera_spi_init, vera_spi_step, sdcard_select } from "./sdcard"

let slot: number = 5
let curInter: boolean = false
let prevCycleCount = 0
let pendingCycles = 0
let ymBusyUntil = 0
let fmEnabled = true
export const setVeraFmEnabled = (enabled: boolean) => {
  fmEnabled = enabled
  ymBusyUntil = 0
  passVeraFmReset()
}

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

export const syncVera = (): void => {
  if (pendingCycles > 0) {
    const cycleDelta = pendingCycles
    pendingCycles = 0
    const newFrame = video_step(1, cycleDelta, false)
    vera_spi_step(cycleDelta)
    if (newFrame)
      video_update()

    // maintain interrupt state
    interrupt(video_get_irq_out())
  }
}

export const initVera = () => {
  pendingCycles = 0
  prevCycleCount = 0
  video_reset()
  sdcard_select(false)
  ymBusyUntil = 0
  passVeraFmReset()
}

export const resetVera = () => {
  pendingCycles = 0
  prevCycleCount = 0
  video_reset()
  ymBusyUntil = 0
  passVeraFmReset()
}

export const enableVera = (enable = true, aslot = 3) => {
  if (!enable)
    return

  resetVera()

  if (!veraInit())
    return

  slot = aslot

  // this card has no ROM, but has registers in the ROM area
  setSlotIOCallback(slot, handleVeraIO)
  registerCycleCountCallback(cycleCountCallback, slot)
}

const cycleCountCallback = (_slot: number) => {
  void _slot
  if (prevCycleCount)
  {
    const cycleDelta = s6502.cycleCount - prevCycleCount
    pendingCycles += cycleDelta
    if (pendingCycles >= 16) {
      syncVera()
    }
  }
  prevCycleCount = s6502.cycleCount
}

const handleVeraIO = (addr: number, val = -1): number => {
  const ymBase = 0xC080 + slot * 0x10
  if (addr === ymBase || addr === ymBase + 1) {
    if (!fmEnabled) return 0xff
    const port = (addr - ymBase) as 0 | 1
    if (val >= 0) {
      passVeraFmWrite({ port, value: val & 0xff })
      if (port === 1) {
        // YM2151 writes hold BUSY for 32 chip clocks at the OPM prescale of 2.
        // Convert those 64 chip clocks to Apple II CPU cycles so software
        // probes (including VERA_FM_DETECT) can observe BUSY before it clears.
        const busyCycles = Math.ceil(64 * getCpuCyclesPerRefresh() * 60 / 3579545)
        ymBusyUntil = s6502.cycleCount + busyCycles
      }
      return 0
    }
    return addr === ymBase + 1 && s6502.cycleCount < ymBusyUntil ? 0x80 : 0
  }
  // We dont have any ROM, but we have vera regs starting at Cx00
  if (addr >= 0xc100) {
    if (prevCycleCount) {
      const cycleDelta = s6502.cycleCount - prevCycleCount
      pendingCycles += cycleDelta
    }
    prevCycleCount = s6502.cycleCount
    syncVera()
    if (val >= 0) {
      video_write(addr&0xff, val)
      return 0
    }
    else
      return video_read(addr&0xff, false)
  }
  return 0
}

export { sdcard_attach_image, sdcard_detach_image, sdcard_get_status, sdcard_get_image, set_sdcard_status_listener } from "./sdcard"
