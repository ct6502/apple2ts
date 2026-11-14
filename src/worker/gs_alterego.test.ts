import { doSetMachineName, doSetRunMode, doSetSpeedMode, resetCpuSpeedForTesting } from "./motherboard"
import { getShr, getTextPage, setIigsRomVersion } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// AlterEgo.2mg is a self-booting GS/OS hard-disk image. Its boot loader walks
// 11-byte relocation records with a 16-bit `LDA ($52),Y`, so a record list that
// ends on a bank boundary is read wrapped: byte 10 comes from $xx:0000 instead
// of $xx+1:0000. With the SmartPort card advertising only 2 units, GS/OS sized
// its boot-time structures smaller, parked the list at $7E:FFF8 and the CDA
// load died with `Sorry, system error $0201 ... LoadDump.DA`. The card now
// advertises 32 units - gssquared's PDB3_MAX_UNITS - which moves both this list
// and MYCRATE's away from the bank end.
const DISK_PATH = process.env.GS_ALTEREGO_PATH || "C:\\dev\\emu\\ap2\\AlterEgo.2mg"
const FRAMES = Number(process.env.GS_ALTEREGO_FRAMES || 2500)

const ejectAll = () => {
  for (const idx of [0, 1, 2, 3, 4, 5]) {
    doSetEmuDriveNewData({
      index: idx, hardDrive: idx <= 1, drive: 1, filename: "", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(0), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)
  }
}

const mount = (index: number, path: string, hardDrive: boolean) => {
  doSetEmuDriveNewData({
    index, hardDrive, drive: 1, filename: path.split("\\").pop()!, status: "",
    motorRunning: false, diskHasChanges: false, isWriteProtected: false,
    diskData: new Uint8Array(fs.readFileSync(path)), lastAppleWriteTime: 0,
    cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
  } as DriveProps)
}

const textPage = () => {
  const tp = getTextPage() as unknown as number[]
  let s = ""
  for (let i = 0; i < tp.length; i++) s += String.fromCharCode(tp[i] & 0x7f)
  return s
}

test("gs: AlterEgo boots from S7D1 without the $0201 desk accessory error", () => {
  if (!fs.existsSync(DISK_PATH)) { console.warn("missing " + DISK_PATH); return }
  jest.useFakeTimers()
  setIsTesting()
  try {
    setIigsRomVersion("03")
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    ejectAll()
    mount(0, DISK_PATH, true)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    let sorry = ""
    for (let f = 1; f <= FRAMES; f++) {
      jest.advanceTimersByTime(17)
      if (!sorry) {
        const s = textPage()
        if (s.includes("Sorry")) sorry = s.slice(Math.max(0, s.indexOf("Sorry") - 20), s.indexOf("Sorry") + 160)
      }
    }
    const shr = getShr()
    let lit = 0
    for (let i = 0; i < shr.length; i++) if (shr[i] !== 0) lit++
    console.log(`sorry "${sorry.replace(/[\x00-\x1f]/g, " ")}" shrLit ${lit}`)

    expect(sorry).toBe("")
    // The game must be drawing its SHR title screen, not sitting on a blank field.
    expect(lit).toBeGreaterThan(1000)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    setIigsRomVersion("01")
    jest.useRealTimers()
  }
}, 1800000)
