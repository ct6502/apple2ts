import { doSetMachineName } from "./motherboard"
import { doGetSaveState, doRestoreSaveState } from "./save_restore"
import { iigsClearInterrupts, iigsInterruptPending, memSet24 } from "./memory"
import { iigsSignalScanline } from "./memory"
import { setIsTesting } from "./worker2main"
import { SAVE_STATE_VERSION } from "../common/utility"

test("VGC scanline enable and asserted interrupt survive save/restore", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  iigsClearInterrupts()
  // $C023 bit 1 is the scanline interrupt enable. GS/OS's Event Manager sets it
  // so it can erase and redraw the cursor on the cursor's own scan line.
  memSet24(0x0000C023, 0x02)
  iigsSignalScanline()
  expect(iigsInterruptPending()).toBe(true)

  const sState = doGetSaveState(false)
  expect(sState.state6502.iigsVgc).toBeDefined()
  expect(sState.state6502.iigsVgc!.vgcIntReg & 0x02).toBe(0x02)
  expect(sState.state6502.iigsVgc!.vgcIntReg & 0x80).toBe(0x80)

  // Reset clears both the module register and the RAM byte. Restoring only the
  // RAM byte leaves the enable dead, so the Event Manager stops repainting and
  // the factory cursor stays in the top-left corner.
  iigsClearInterrupts()
  expect(iigsInterruptPending()).toBe(false)
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  expect(iigsInterruptPending()).toBe(true)
})

test("save states without the VGC block recover enables from the C023 byte", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  iigsClearInterrupts()
  memSet24(0x0000C023, 0x02)
  const sState = doGetSaveState(false)
  delete sState.state6502.iigsVgc

  iigsClearInterrupts()
  expect(iigsInterruptPending()).toBe(false)
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  // Asserted bits are stale across the save boundary, but the enable survives in
  // the saved $C023 byte and the next scan line can raise the interrupt again.
  iigsSignalScanline()
  expect(iigsInterruptPending()).toBe(true)
})
