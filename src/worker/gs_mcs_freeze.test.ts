import { doSetMachineName, doSetRunMode, resetCpuSpeedForTesting, getCPU } from "./motherboard"
import { megaIIAux } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import { iigsEnsoniq, docAccess, resetDocAccess } from "./devices/iigs_ensoniq"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Diagnostic for the Music Construction Set freeze (AGENTS.md section 32).
//
// MCS renders its title screen, then the machine freezes with the CPU parked in
// a polling loop on zero page $A3/$A4 that nothing ever sets. The question this
// answers is narrow and measurable: does the Apple IIgs ROM's own VBL / system
// task machinery ever run, and what is actually in the Bank $E1 area it uses?
//
//   $FE:9874  ROM VBL/system-task dispatcher: 16-bit counters at $E1:00DC/$E1:00DE,
//             task queue at $E1:00D8/$E1:00DA. `LDA $E1:00D8 / TAX / ORA $E1:00DA /
//             BEQ $98F2` skips the whole dispatch when the queue is empty.
//   $FE:96CB  the ROM routine that installs `$E1:0030 = $FE9874`.
//   $FE:9928  stride-2 table of fifteen $E1:xxxx handler offsets, read 16-bit at a
//             time by $FE:9919/$FE:991F.
//   $FF:C070  ROM BRK/IRQ firmware; reads the 16-bit word at $E1:00C0.
//   $FF:C700  dispatches through $E1:1000/1004/1008/1018/101C/1022/1026/1032 and
//             carries the "(C) Apple, 1986 ... Print Registered" fallback string at
//             $FF:C763 - i.e. it is the unclaimed-caller notice, not a dispatch path.
const MCS_PATH = process.env.GS_MCS_PATH || "C:\\dev\\emu\\ap2\\mcs.2mg"

interface Range { name: string, bank: number, lo: number, hi: number, n: number, firstAt: number }

const RANGES: Range[] = [
  { name: "FE:9874 VBL/system-task dispatcher", bank: 0xfe, lo: 0x9874, hi: 0x9960, n: 0, firstAt: -1 },
  { name: "FE:96CB VBL dispatcher installer", bank: 0xfe, lo: 0x96cb, hi: 0x9720, n: 0, firstAt: -1 },
  { name: "FF:C070 BRK/IRQ firmware", bank: 0xff, lo: 0xc070, hi: 0xc0b0, n: 0, firstAt: -1 },
  { name: "FF:C700 software-interrupt dispatch", bank: 0xff, lo: 0xc700, hi: 0xc7c6, n: 0, firstAt: -1 },
  { name: "FF:B7CC full ROM interrupt manager", bank: 0xff, lo: 0xb7cc, hi: 0xb860, n: 0, firstAt: -1 },
  { name: "FF:79C8 minimal interrupt manager", bank: 0xff, lo: 0x79c8, hi: 0x7a10, n: 0, firstAt: -1 },
]

const dump = (lo: number, hi: number) => {
  const out: string[] = []
  for (let a = lo; a < hi; a += 16) {
    out.push("E1:" + a.toString(16).toUpperCase().padStart(4, "0") + "  " +
      Array.from(megaIIAux.subarray(a, a + 16)).map((b) => b.toString(16).padStart(2, "0")).join(" "))
  }
  return out.join("\n")
}

const spinTop = (hist: Map<number, number>) =>
  Array.from(hist.entries()).sort((a, b) => b[1] - a[1]).slice(0, 12)
    .map(([pc, c]) => {
      const bank = (pc >>> 16) & 0xff, off = pc & 0xffff
      return bank.toString(16).padStart(2, "0") + ":" + off.toString(16).padStart(4, "0").toUpperCase() + " x" + c
    })

const memory = require("./memory").memory as Uint8Array

// 80-column text page. On the IIgs odd columns come from aux memory ($18000
// offset mirrors the same page), so read both halves like the renderer does.
const screenText = () => {
  const lines: string[] = []
  for (let row = 0; row < 24; row++) {
    let line = ""
    const base = 0x400 + (row % 8) * 0x80 + Math.floor(row / 8) * 0x28
    for (let col = 0; col < 80; col++) {
      const aux = (col % 2) === 0
      const cell = aux ? memory[0x18000 + base + Math.floor(col / 2)] : memory[base + Math.floor(col / 2)]
      const ch = cell & 0x7f
      line += (ch >= 32 && ch < 127) ? String.fromCharCode(ch) : "."
    }
    if (line.replace(/\./g, "").trim().length > 0) lines.push(line)
  }
  return lines.join("\n")
}

const reportScreen = (label: string) => {
  const sw = require("./softswitches").SWITCHES
  console.log(`[MCS] ${label}: TEXT=${sw.TEXT.isSet} HIRES=${sw.HIRES.isSet} ` +
    `COLUMN80=${sw.COLUMN80.isSet} shrActive=${(megaIIAux[0x35] & 0x80) !== 0}`)
  const txt = screenText()
  console.log(`[MCS] ${label} text screen:\n${txt || "(blank)"}`)
}

const reportSpin = (cpu: any, hist: Map<number, number>) => {
  const top = Array.from(hist.entries()).sort((a, b) => b[1] - a[1])[0]
  if (!top) return
  const bank = (top[0] >>> 16) & 0xff, off = top[0] & 0xffff
  const bytes = (require("./memory").memGet24 as (a: number) => number)
  const dumpPc = Array.from({ length: 16 }, (_, k) => bytes(((bank << 16) | ((off + k) & 0xffff))).toString(16).padStart(2, "0"))
  console.log(`[MCS] hottest PC ${bank.toString(16)}:${off.toString(16).padStart(4, "0").toUpperCase()} x${top[1]} ` +
    `PB=${cpu.PB.toString(16)} DB=${cpu.DB.toString(16)} E=${cpu.emulationMode} P=${cpu.P.toString(16)}`)
  console.log(`[MCS] code at hottest PC: ${dumpPc.join(" ")}`)
}

test("MCS freeze: does the ROM VBL / system-task path ever run, and what is in $E1:00C0+", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()

    const data = fs.readFileSync(MCS_PATH)
    console.log(`[MCS] loaded ${MCS_PATH}, size=${data.length}`)
    const mounted = doSetEmuDriveNewData({
      index: 0,
      hardDrive: true,
      drive: 1,
      filename: "mcs.2mg",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: false,
      diskData: new Uint8Array(data),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    } as DriveProps)
    expect(mounted).toBe(true)
    resetDocAccess()

    // Is the chip actually producing sound? Count the transition from no active
    // oscillators to some, which is what a real driver starting a note looks like.

    const cpu = getCPU() as any
    const origPI = cpu.processInstruction.bind(cpu)
    let count = 0
    const hist = new Map<number, number>()
    // Snapshot of $E1:00D0-$E1:00DF so we can see who (if anyone) ever writes it.
    let prevTask = megaIIAux.slice(0x00c0, 0x0120)
    let taskWrites = 0
    cpu.processInstruction = (cb?: any) => {
      const pc = (cpu.PB << 16) | cpu.PC
      count++
      hist.set(pc, (hist.get(pc) ?? 0) + 1)
      for (const r of RANGES) {
        if (cpu.PB === r.bank && cpu.PC >= r.lo && cpu.PC <= r.hi) {
          r.n++
          if (r.firstAt < 0) r.firstAt = count
        }
      }
      const now = megaIIAux.slice(0x00c0, 0x0120)
      for (let i = 0; i < now.length; i++) {
        if (now[i] !== prevTask[i]) {
          taskWrites++
          if (taskWrites <= 20) {
            console.log(`[E1:${(0x00c0 + i).toString(16).toUpperCase()} -> ${now[i].toString(16)}] at ` +
              `${cpu.PB.toString(16)}:${cpu.PC.toString(16)} instr#${count} A=${cpu.A.toString(16)} X=${cpu.X.toString(16)} Y=${cpu.Y.toString(16)}`)
          }
          prevTask = megaIIAux.slice(0x00c0, 0x0120)
          break
        }
      }
      return origPI(cb)
    }

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    // Phase 1: boot to the MCS title screen.
    for (let f = 0; f < 1200; f++) jest.advanceTimersByTime(17)
    console.log(`[MCS] after boot: instr=${count} PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)}`)
    console.log("[MCS] top PCs at title screen:\n  " + spinTop(hist).join("\n  "))
    console.log("[MCS] ROM ranges at title screen:")
    for (const r of RANGES) console.log(`  ${r.name}: ${r.n}${r.firstAt >= 0 ? " (first at instr#" + r.firstAt + ")" : ""}`)
    reportScreen("title")
    reportSpin(cpu, hist)

    // Phase 2: dismiss the title screen the way the browser click does, then let
    // it run into whatever it freezes on.
    hist.clear()
    MouseCardEvent({ x: 0.3, y: 0.5, buttons: -1 })   // establish / move
    for (let f = 0; f < 30; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x10 }) // press
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x00 }) // release
    for (const r of RANGES) r.n = 0

    for (let f = 0; f < 900; f++) jest.advanceTimersByTime(17)

    console.log(`[MCS] after click: instr=${count} PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)}`)
    console.log("[MCS] top PCs after click:\n  " + spinTop(hist).join("\n  "))
    console.log("[MCS] ROM ranges after click:")
    for (const r of RANGES) console.log(`  ${r.name}: ${r.n}`)
    reportScreen("after click")
    reportSpin(cpu, hist)
    const adb = iigsADB as unknown as { hasMouseData: () => boolean }
    console.log(`[MCS] ADB hasMouseData after click: ${adb.hasMouseData()}`)
    // Did the program ever program the Ensoniq? MCS's sound driver sets the
    // chip up - enables oscillators and uploads waveforms into DOC RAM - so a
    // healthy boot shows non-zero control/data/addr writes. Whether any
    // oscillator was ever started is the separate question, and it is the one
    // that answers "does this program make a sound".
    const chip = iigsEnsoniq as unknown as {
      osce: number
      oscillators: Array<Record<string, number>>
      soundadrl: number
      systemVolume: number
    }
    let started = 0
    for (const o of chip.oscillators) {
      if (!(o.control & 1) && o.vol > 0 && o.freq > 0) started++
    }
    console.log(`[MCS] DOC: osce=${chip.osce} soundadrl=$${chip.soundadrl.toString(16)} ` +
      `systemVolume=${chip.systemVolume.toFixed(3)} startedOscillators=${started}`)
    console.log("[MCS] DOC access (control/data/addrLow/addrHigh writes, reads): " +
      `${docAccess.control} ${docAccess.data} ${docAccess.addrLow} ${docAccess.addrHigh} ${docAccess.reads}`)
    // Phase 3: the screen still shows the ProDOS 8 startup banner, which waits for
    // a keypress. Send one and see whether MCS actually loads in this harness.
    hist.clear()
    for (const r of RANGES) r.n = 0
    setKeyboardState({ isDown: true, key: 0x41, repeat: false })
    for (let f = 0; f < 5; f++) jest.advanceTimersByTime(17)
    setKeyboardState({ isDown: false, key: 0, repeat: false })
    for (let f = 0; f < 1500; f++) jest.advanceTimersByTime(17)
    console.log(`[MCS] after keypress: instr=${count} PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)}`)
    console.log("[MCS] top PCs after keypress:\n  " + spinTop(hist).join("\n  "))
    console.log("[MCS] ROM ranges after keypress:")
    for (const r of RANGES) console.log(`  ${r.name}: ${r.n}`)
    reportScreen("after keypress")
    reportSpin(cpu, hist)
    console.log(`[MCS] $E1:00C0-$E1:011F (writes seen: ${taskWrites}):\n${dump(0x00c0, 0x0120)}`)
    console.log(`[MCS] queue words: $E1:00D8=${megaIIAux[0x00d8].toString(16)} $E1:00D9=${megaIIAux[0x00d9].toString(16)} ` +
      `$E1:00DA=${megaIIAux[0x00da].toString(16)} $E1:00DC=${megaIIAux[0x00dc].toString(16)} $E1:00DD=${megaIIAux[0x00dd].toString(16)} ` +
      `$E1:00DE=${megaIIAux[0x00de].toString(16)} $E1:00DF=${megaIIAux[0x00df].toString(16)}`)
    // Who owns the VBL dispatcher vector? We install JML $FE9874 at cold boot; if
    // GS/OS claims it the bytes change, if not the ROM path is unreachable.
    console.log(`[MCS] $E1:0010 (interrupt manager vector): ${Array.from(megaIIAux.subarray(0x10, 0x14)).map((b) => b.toString(16).padStart(2, "0")).join(" ")}`)
    console.log(`[MCS] $E1:0030 (VBL dispatcher vector):    ${Array.from(megaIIAux.subarray(0x30, 0x34)).map((b) => b.toString(16).padStart(2, "0")).join(" ")}`)
    console.log(`[MCS] $E1:0070 (system task vector):       ${Array.from(megaIIAux.subarray(0x70, 0x74)).map((b) => b.toString(16).padStart(2, "0")).join(" ")}`)
    console.log(`[MCS] $E1:1000-$E1:103F (SW vectors):\n${dump(0x1000, 0x1040)}`)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 900000)