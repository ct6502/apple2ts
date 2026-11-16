import { doSetMachineName, doSetRunMode, doSetSpeedMode, getCPU, resetCpuSpeedForTesting } from "./motherboard"
import { CPU65816 } from "./cpu65816"
import { memGet24, setIigsRomVersion } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

const DISK_PATH = process.env.GS_MYCRATE_PATH || "C:\\dev\\emu\\ap2\\MYCRATE.2MG"
const FRAMES = Number(process.env.GS_ROM03_RELOC_FRAMES || 1200)
const hex = (v: number, w = 4) => (v >>> 0).toString(16).padStart(w, "0")

// MYCRATE's bank-$01 loader applies its own relocation records with
//     $01:D6D7  LDY #$01 / LDA ($52),Y ...   read the 11-byte record at DB:$52
//     $01:DA46  dispatch on the record's kind/modifier bytes
//     $01:DAAx  STA [$5A]                    write the value at the 24-bit dest
// `LDA ($52),Y` is a 16-bit indirect, so it cannot read past $xx:FFFF: a record
// that straddles a bank boundary is read wrapped inside its first bank.
//
// Where GS/OS puts that list follows the SmartPort card's advertised unit
// count: its boot-time device structures grow by 84 bytes per unit. The card
// used to advertise 2 units, which parked the ExpressLoad buffer flush against
// the top of bank $7E, so the $08:$0000 module's second record started at
// $7E:FFFE. Read wrapped it decoded as a bogus `$08:$0000 <- $4F08` fix-up
// over the stub's PHK;PLB, and the re-launch then read its tables through
// Mega II aux (the Finder's `$0401` alert). Advertising 32 units - the
// reference slot-7 firmware's PDB3_MAX_UNITS - keeps both ROMs' lists inside
// one bank, and does the same for AlterEgo's boot (gs_alterego.test.ts).
const run = (rom: "01" | "03") => {
  jest.useFakeTimers()
  setIsTesting()
  let restored: (() => void) | null = null
  try {
    setIigsRomVersion(rom)
    doSetMachineName("APPLE2GS")
    doSetSpeedMode(1)
    doSetEmuDriveNewData({
      index: 0, hardDrive: true, drive: 1, filename: "MYCRATE.2MG", status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(fs.readFileSync(DISK_PATH)), lastAppleWriteTime: 0,
      cloudData: null, writableFileHandle: null, lastLocalFileWriteTime: 0,
    } as DriveProps)
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    const cpu = getCPU() as CPU65816
    const orig = cpu.processInstruction.bind(cpu)
    const peek = (a: number) => memGet24(a & 0xffffff) & 0xff
    const word = (a: number) => peek(a) | (peek(a + 1) << 8)
    const long = (a: number) => word(a) | (peek(a + 2) << 16)
    const bytes = (a: number, n: number) =>
      Array.from({ length: n }, (_, i) => hex(peek(a + i), 2)).join(" ")

    const recs: { p: string; raw: string }[] = []
    const fixups: { dest: string; val: string; kind: string; mod: string }[] = []
    cpu.processInstruction = (cb?: ((s: string) => void) | null) => {
      if (cpu.PB === 0x01) {
        if (cpu.PC === 0x0d6d7 && word(0x00994c) === 0x0008 && recs.length < 2) {
          const p = (peek(0x009954) << 16) | word(0x009952)
          recs.push({ p: hex(p, 6), raw: bytes(p, 11) })
        }
        if (peek(0x010000 + cpu.PC) === 0x87 && cpu.PC >= 0x0daa0 && cpu.PC <= 0x0dacc) {
          fixups.push({
            dest: hex(long(0x00995a), 6), val: hex(word(0x00995e), 4),
            kind: hex(peek(0x009956), 2), mod: hex(peek(0x009958), 2),
          })
        }
      }
      return orig(cb ?? null)
    }
    restored = () => { cpu.processInstruction = orig }
    for (let f = 1; f <= FRAMES; f++) jest.advanceTimersByTime(17)
    return { recs, fixups, stub: bytes(0x080000, 8) }
  } finally {
    if (restored) restored()
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    setIigsRomVersion("01")
    jest.useRealTimers()
  }
}

const straddles = (p: string) => (parseInt(p.slice(2), 16) & 0xffff) + 10 > 0xffff

test("gs: MYCRATE's $08:$0000 relocation list stays inside one bank on both ROMs", () => {
  if (!fs.existsSync(DISK_PATH)) { console.warn("missing " + DISK_PATH); return }
  const a = run("01")
  const b = run("03")
  console.log(`[01] list ${a.recs.map(r => "$" + r.p).join(" ")} fixups ${a.fixups.length} stub ${a.stub}`)
  console.log(`[03] list ${b.recs.map(r => "$" + r.p).join(" ")} fixups ${b.fixups.length} stub ${b.stub}`)
  for (const r of [...a.recs, ...b.recs]) console.log(`  $${r.p} ${r.raw}${straddles(r.p) ? "   <-- STRADDLES" : ""}`)

  // The same two records, byte for byte: the disk read and the RAM content match,
  // only the placement differs between ROMs.
  expect([a.recs.length, b.recs.length]).toEqual([2, 2])
  expect(a.recs.map(r => r.raw)).toEqual(b.recs.map(r => r.raw))
  // Neither ROM may park a record on a bank boundary: the loader's 16-bit
  // `LDA ($52),Y` would read it wrapped.
  expect([...a.recs, ...b.recs].filter(r => straddles(r.p))).toEqual([])
  // The bogus `$08:$0000 <- $4F08` fix-up is what overwrote the stub's PHK;PLB.
  expect(a.fixups.some(f => f.dest === "080000")).toBe(false)
  expect(b.fixups.some(f => f.dest === "080000")).toBe(false)
  expect(a.stub.slice(0, 5)).toBe("4b ab")
  expect(b.stub.slice(0, 5)).toBe("4b ab")
}, 600000)
