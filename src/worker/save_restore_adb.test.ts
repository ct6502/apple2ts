import { doGetSaveState, doRestoreSaveState } from "./save_restore"
import { doSetMachineName } from "./motherboard"
import { setIsTesting } from "./worker2main"
import { iigsADB } from "./iigs_adb"
import { SAVE_STATE_VERSION } from "../common/utility"

test("ADB controller interrupt enables survive save/restore", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  iigsADB.reset()
  // $C027 bit 6: GS/OS enables the mouse interrupt here. The bit lives in the
  // micro-controller, not in RAM, so without an ADB block in the save state a
  // restore leaves the guest's mouse IRQ dead even though $C027 reads 0x40.
  iigsADB.writeStatus(0x40)
  iigsADB.queueMouse(12, -4)
  const sState = doGetSaveState(false)
  expect(sState.state6502.iigsADB).toBeDefined()
  expect(sState.state6502.iigsADB!.interruptEnables).toBe(0x40)
  expect(sState.state6502.iigsADB!.pendingX).toBe(0)
  expect(sState.state6502.iigsADB!.mouseRegs.slice(0, 2)).toEqual([0x8c, 0xfc])
  expect(sState.state6502.iigsADB!.mouseHasData).toBe(true)

  // Mangle the live controller before restoring: a reset clears the latched
  // interrupt enables and the queued motion.
  iigsADB.reset()
  expect(iigsADB.readStatus() & 0x40).toBe(0)

  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  expect(iigsADB.readStatus() & 0x40).toBe(0x40)
  expect(iigsADB.mouseReportPending()).toBe(true)
})

test("save states without an ADB block fall back to power-on defaults", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  iigsADB.reset()
  iigsADB.writeStatus(0x40)
  iigsADB.queueMouse(5, 5)
  const sState = doGetSaveState(false)
  delete sState.state6502.iigsADB
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  expect(iigsADB.readStatus() & 0x40).toBe(0)
  expect(iigsADB.mouseReportPending()).toBe(false)
})
