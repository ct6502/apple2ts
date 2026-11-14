import { SWITCHES } from "./softswitches"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { doBoot, doSetMachineName, doSetRunMode } from "./motherboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import { getTextPage } from "./memory"
import * as fs from "fs"

// Regression test for the Apple IIgs text-page source.
//
// The IIgs video scanner reads the text screen from Mega II main/aux RAM when
// the $C035 shadow bits say so - not from the fast RAM the CPU sees in banks
// 00/01. 16-bit software (ProDOS 16 systems such as the SenseiPlayer disk,
// whose system file is native 65816 code) writes its screen to $E0/$E1:$0400
// and expects the scanner to show it.
//
// Before this fix getTextPage() always read the fast RAM copy, so the
// ProDOS 16 screen was invisible and the machine looked like it had hung
// (see AGENTS.md "senseiplay800.2mg" investigation).
describe("Apple IIgs text page source", () => {
  const poPath = "c:\\dev\\emu\\ap2\\senseiplay800.2mg"
  const hasFile = fs.existsSync(poPath)

  beforeEach(() => {
    jest.useFakeTimers()
    setIsTesting()
  })

  afterEach(() => {
    doSetRunMode(RUN_MODE.PAUSED, false)
    jest.useRealTimers()
  })

  test("ProDOS 16 screen written to $E0/$E1:$0400 is what the scanner shows", () => {
    if (!hasFile) {
      console.warn("Skipping: " + poPath + " not found")
      return
    }

    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 500; f++) jest.advanceTimersByTime(17)

    const data = fs.readFileSync(poPath)
    const accepted = doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "senseiplay800.2mg", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as any)
    expect(accepted).toBe(true)

    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    for (let f = 0; f < 1500; f++) jest.advanceTimersByTime(17)

    // The ProDOS 16 system is running and has drawn its screen.
    expect(SWITCHES.TEXT.isSet).toBe(true)

    // The scanner must see a non-blank text page.
    const tp = getTextPage()
    expect(tp.length).toBeGreaterThan(0)
    let nonBlank = 0
    for (const b of tp) if (b !== 0xA0 && b !== 0x00) nonBlank++
    expect(nonBlank).toBeGreaterThan(50)
  }, 300000)
})
