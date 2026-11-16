import { doSetMachineName, doSetRunMode, doBoot, doReset, resetCpuSpeedForTesting } from "./motherboard"
import { getTextPageAsString, memGet24 } from "./memory"
import { iigsADB } from "./iigs_adb"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

// Ctrl-Reset at the ROM's "Check startup device" screen must drop the machine
// into the Applesoft prompt instead of restarting the startup-device scan.
//
// The ROM asks the ADB micro-controller for uC RAM $51 and copies that byte to
// Mega II RAM $E1:0168 as its warm-boot marker. The boot sequence writes $A5
// there, and if the reset path reads anything else it clears $03F2-$03F4 and
// takes the cold path (FF:85A1 CMP #$A5 / BEQ warm; the cold branch does
// STZ $0003F3). A system reset therefore must not wipe the micro-controller's
// internal RAM: gssquared only zeroes uC RAM $51 on a cold start
// (keygloo.cpp zero_0x51), and iigsADB.reset(coldStart) mirrors that.
test("test Ctrl-Reset from Check startup device screen", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    // Run 600 frames to reach Check startup device
    for (let f = 0; f < 600; f++) {
      jest.advanceTimersByTime(17)
    }
    expect(getTextPageAsString()).toContain("Check startup device")
    // The boot leaves the warm-boot marker in the ADB micro's RAM.
    expect((iigsADB as unknown as { ucMemory: Uint8Array }).ucMemory[0x51]).toBe(0xa5)

    doReset()

    // Advance 600 frames: the warm path scans the slots, finds no startup
    // device and falls into IIe mode instead of re-entering the cold scan.
    for (let f = 0; f < 600; f++) {
      jest.advanceTimersByTime(17)
    }

    // Warm signature ($03F3=$E0, $03F4=$45) proves the ROM did not clear it.
    expect(memGet24(0x03f3)).toBe(0xe0)
    expect(memGet24(0x03f4)).toBe(0x45)
    expect(getTextPageAsString()).toContain("]")
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)
