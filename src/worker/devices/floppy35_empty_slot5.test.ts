import { getDriveStateByIndex } from "./drivestate"
import { iwmGetSense35, iwmStepHead } from "./diskdata"
import { doSetMachineName } from "../motherboard"
import { setIsTesting } from "../worker2main"

// The IIgs slot-5 pair is a 3.5" mechanism whether or not a disk is in it.
// ZZ Copy launched from a slot-7 hard drive polls selector 1 (disk in place)
// before it offers "Insert source"; if the empty bay falls back to the 5.25"
// status path, that selector has no disk-in-place meaning and the program goes
// straight to "Reading..." against an empty drive. The drive identity therefore
// cannot depend on media having been mounted at least once.
test("empty IIgs slot-5 drives use the 3.5-inch status path", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS")

  for (const index of [4, 5]) {
    const ds = getDriveStateByIndex(index)
    expect(ds.is35).toBe(true)
    expect(ds.diskInPlace).toBe(false)
  }

  // Selector 0x1 (CA0/CA1/CA2=0, SEL=1) is disk-in-place: 1 = no disk.
  // The CA lines are the four IWM head lines; LSTRB is low while selecting.
  iwmStepHead(4, 6, true)
  iwmStepHead(4, 0, true)
  iwmStepHead(4, 2, true)
  iwmStepHead(4, 4, true)
  expect(iwmGetSense35(4, 1)).toBe(1)
})
