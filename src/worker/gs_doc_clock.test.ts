import { doSetMachineName, doSetRunMode, doBoot, resetCpuSpeedForTesting,
  getIigsVblCount, resetIigsVblCount } from "./motherboard"
import { memSet24 } from "./memory"
import { iigsEnsoniq } from "./devices/iigs_ensoniq"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

const set = (addr: number, value: number) => memSet24(0x000000 + addr, value & 0xff)
const writeReg = (reg: number, value: number) => {
  set(0xC03C, 0x00)
  set(0xC03E, reg & 0xff)
  set(0xC03D, value)
}

test("IIgs: DOC sample clock advances one outRate/60 block per refresh", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    // Let the ROM reach its "no startup disk" screen before we touch the chip.
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)

    // Program the Apple TN #23 timer voice on oscillator 31.
    set(0xC03C, 0x40 | 0x20)
    set(0xC03E, 0x00)
    set(0xC03F, 0x00)
    for (let i = 0; i < 256; i++) set(0xC03D, 0x80)
    writeReg(0xe1, 0x3e)
    writeReg(0x00 + 31, 249)
    writeReg(0x20 + 31, 0)
    writeReg(0x40 + 31, 0)
    writeReg(0x80 + 31, 0)
    writeReg(0xc0 + 31, 0)
    writeReg(0xa0 + 31, 0x08)

    const rate = iigsEnsoniq.outputRate()
    const perRefresh = Math.round(rate / 60)
    expect(rate).toBe(26320)
    expect(perRefresh).toBe(439)

    // Align to a refresh boundary, then measure.
    jest.advanceTimersByTime(17)
    resetIigsVblCount()
    const v0 = getIigsVblCount()
    const s0 = iigsEnsoniq.samplesGenerated

    const FRAMES = 200
    for (let f = 0; f < FRAMES; f++) jest.advanceTimersByTime(17)

    const refreshes = getIigsVblCount() - v0
    const samples = iigsEnsoniq.samplesGenerated - s0
    const perRefreshActual = samples / refreshes
    console.log(`[DOCLOCK] ${refreshes} refreshes, ${samples} samples, ` +
      `${perRefreshActual.toFixed(2)}/refresh (want ${perRefresh})`)

    expect(refreshes).toBeGreaterThan(FRAMES - 4)
    expect(perRefreshActual).toBeGreaterThan(perRefresh * 0.95)
    expect(perRefreshActual).toBeLessThan(perRefresh * 1.05)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 300000)
