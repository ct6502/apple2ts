import { doBoot, doSetMachineName, doSetSlotConfig, resetCpuSpeedForTesting } from "./motherboard"
import { memGet } from "./memory"
import { DEFAULT_SLOT_CONFIG, DEFAULT_SLOT_CONFIG_GS } from "../common/utility"
import { setIsTesting } from "./worker2main"

const slotRomBytes = (start: number, length: number) =>
  Array.from({ length }, (_, i) => memGet(start + i, false))

const isBlankPowerUpFill = (bytes: number[]) => bytes.every(b => b === 0xFF || b === -1)

describe("boot rebuilds peripheral-card slot layouts", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })

  afterEach(() => {
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  })

  test("classic boot keeps the VERA slot ROM that memoryReset wiped", () => {
    doSetMachineName("APPLE2EE")
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG, 2: "vera" })

    doBoot()

    // memoryReset() filled the card windows with 0xFF. configureMachine() had
    // already run for the mounted image before the boot, so without resetting
    // its didConfiguration guard the boot returned early and the VERA slot ROM
    // stayed blank. A blank slot ROM makes the card's boot/reset signature
    // unavailable to the ROM scanner and leaves the guest unable to re-init the
    // card after Ctrl-Reset.
    expect(isBlankPowerUpFill(slotRomBytes(0xC200, 16))).toBe(false)
  })

  test("GS boot keeps the slot-4 card window usable after the same reset", () => {
    doSetMachineName("APPLE2GS")
    doSetSlotConfig({ ...DEFAULT_SLOT_CONFIG_GS, 4: "mockingboard" })

    doBoot()

    expect(isBlankPowerUpFill(slotRomBytes(0xC400, 16))).toBe(false)
  })
})
