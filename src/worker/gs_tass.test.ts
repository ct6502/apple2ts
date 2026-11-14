import { doSetMachineName, doSetRunMode, getCPU } from "./motherboard"
import { megaIIAux, memGet24 } from "./memory"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import { iigsEnsoniq, docAccess, resetDocAccess, ensoniqDocRam } from "./devices/iigs_ensoniq"
import { getDriveStateByIndex } from "./devices/drivestate"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Diagnostic for "Tass Times in Tonetown has no sound" (this AGENTS.md
// round). The browser measurement (?ensoniqdbg=1) showed the game's own sound
// driver initializing the chip and then going completely idle:
//   control 19 / data 102154 / addrLow 16 / addrHigh 8 / reads 36,
//   osce=32, every oscillator ctrl=$03 (halted, one-shot), vol=0, freq=1,
//   wavetable pointer $FF00, irq=0.
// That is the same "initialised but silent" shape the Music Construction Set
// boot showed (section 36). What we could NOT see in the browser was whether
// the driver starts a note once the game is actually playing (the headless
// CDP input could not get past the title screen).
//
// This harness:
//  1. boots the game the way the browser does (slot 7 SmartPort block image),
//  2. walks the title/menu screens with keyboard + mouse events,
//  3. after each phase reports the DOC access picture, the first 6 oscillator
//     register sets, whether any oscillator was ever active (i.e. the code
//     path that would call generateSamples), the DOC IRQ line, and the
//     hottest program counters with their code bytes - so the "what is the
//     driver waiting on" question has instrumented evidence.
const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"

const spinTop = (hist: Map<number, number>, n = 10) =>
  Array.from(hist.entries()).sort((a, b) => b[1] - a[1]).slice(0, n)
    .map(([pc, c]) => {
      const bank = (pc >>> 16) & 0xff, off = pc & 0xffff
      const bytes = Array.from({ length: 14 }, (_, k) =>
        (require("./memory").memGet24(((bank << 16) | ((off + k) & 0xffff))) & 0xff).toString(16).padStart(2, "0"))
      return bank.toString(16).padStart(2, "0") + ":" + off.toString(16).padStart(4, "0").toUpperCase() + " x" + c + "  [" + bytes.join(" ") + "]"
    })

const oscSnapshot = () => "osc0..5: " + iigsEnsoniq.oscillators.slice(0, 6).map((o, i) =>
  `${i}:c${o.control}/v${o.vol}/f${o.freq}/wt$${o.wavetblpointer.toString(16)}/a${o.accumulator}/i${o.irqpend}`).join(" ")

const docPicture = (label: string) => {
  const a = docAccess
  console.log(`[TASS] ${label}: docAccess c${a.control} d${a.data} al${a.addrLow} ah${a.addrHigh} r${a.reads} ` +
    `osce=${iigsEnsoniq.osce} active=${iigsEnsoniq.hasActiveOscillators()} ` +
    `soundsel=$${(iigsEnsoniq.soundadrh << 8 | iigsEnsoniq.soundadrl).toString(16)} vol=${iigsEnsoniq.systemVolume.toFixed(2)}`)
  console.log(`[TASS] ${label} ${oscSnapshot()}`)
  // The wavetable pointer the driver left in every oscillator was $FF00; a wave
  // upload goes to DOC RAM pages, so also show what DOC RAM holds around there
  // and around the sound pointer ($00E2) - locals for a manual check later.
  const hex = (from: number, n: number) =>
    Array.from(ensoniqDocRam.subarray(from, from + n)).map(b => b.toString(16).padStart(2, "0")).join(" ")
  console.log(`[TASS] ${label} docram $00E0: ${hex(0xe0, 16)}   $FF00: ${hex(0xff00, 16)}`)
}

const irqLine = () => {
  // Mirror what motherboard.ts asks every instruction.
  const anyIrq = iigsEnsoniq.oscillators.some(o => o.irqpend !== 0)
  return anyIrq
}

// Dump raw code bytes so a PC can be disassembled by hand afterwards
// (dis5.cjs) instead of trusting in-test guesses at alignment.
const codeDump = (label: string, bank: number, lo: number, hi: number) => {
  const g = (a: number) => (require("./memory").memGet24(((bank << 16) | (a & 0xffff))) & 0xff)
  const rows: string[] = []
  for (let a = lo; a <= hi; a += 8) {
    rows.push(bank.toString(16).padStart(2, "0") + ":" + a.toString(16).padStart(4, "0").toUpperCase() + "  " +
      Array.from({ length: 8 }, (_, k) => g(a + k).toString(16).padStart(2, "0")).join(" "))
  }
  console.log(`[TASS] ${label}\n` + rows.join("\n"))
}

const zpDump = (label: string) => {
  const g = (a: number) => (require("./memory").memGet24(a) & 0xff)
  const rows: string[] = []
  for (let a = 0; a < 0x100; a += 16) {
    rows.push("$" + a.toString(16).padStart(2, "0") + ": " +
      Array.from({ length: 16 }, (_, k) => g(a + k).toString(16).padStart(2, "0")).join(" "))
  }
  console.log(`[TASS] ${label} zero page:\n` + rows.join("\n"))
}

test("Tass Times: does the sound driver ever start an oscillator?", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()

    const data = fs.readFileSync(TASS_PATH)
    console.log(`[TASS] loaded ${TASS_PATH}, size=${data.length}`)
    const mounted = doSetEmuDriveNewData({
      index: 0,
      hardDrive: true,
      drive: 1,
      filename: "tass.2mg",
      status: "",
      motorRunning: false,
      diskHasChanges: false,
      isWriteProtected: true,
      diskData: new Uint8Array(data),
      lastAppleWriteTime: 0,
      cloudData: null,
      writableFileHandle: null,
      lastLocalFileWriteTime: 0,
    } as unknown as DriveProps)
    expect(mounted).toBe(true)
    resetDocAccess()
    console.log(`[TASS] mounted: idx0 drive1 name=${getDriveStateByIndex(0).filename}`)

    const cpu = getCPU() as unknown as { PB: number, PC: number, processInstruction: (cb?: unknown) => number }
    const origPI = cpu.processInstruction.bind(cpu)
    const hist = new Map<number, number>()
    const RANGES: Array<{ name: string, lo: number, hi: number, bank?: number, n: number }> = [
      { name: "game IRQ handler $1338", lo: 0x1338, hi: 0x13ff, n: 0 },
      { name: "game DOC driver $1390-$1500", lo: 0x1390, hi: 0x1500, n: 0 },
      { name: "game driver body $1200-$1330", lo: 0x1200, hi: 0x1330, n: 0 },
      { name: "ROM IRQ manager entry FF:B7CC", lo: 0xb7cc, hi: 0xb860, bank: 0xff, n: 0 },
      { name: "ROM manager DOC section FF:B8F6-B935", lo: 0xb8f6, hi: 0xb935, bank: 0xff, n: 0 },
      { name: "ROM manager JSL e1002c FF:B921", lo: 0xb921, hi: 0xb924, bank: 0xff, n: 0 },
      { name: "ROM IRQ firmware FF:C070", lo: 0xc070, hi: 0xc76f, bank: 0xff, n: 0 },
      { name: "ROM ADB task FF:C4D2", lo: 0xc4d2, hi: 0xc4f5, bank: 0xff, n: 0 },
      { name: "ROM VBL task FE:9874", lo: 0x9874, hi: 0x9960, bank: 0xfe, n: 0 },
      { name: "E1:002C game vector slot", lo: 0x002c, hi: 0x002f, bank: 0xe1, n: 0 },
    ]
    let irqSeen = false
    let irqFirstAt = 0
    let activeSeen = false
    let activeFirstAt = 0
    let instr = 0
    // Oscillator-IRQ timeline: instruction windows where any irqpend is held,
    // and every $C03D read with its instruction number for the first 300k
    // instructions (enough to cover the boot phase's whole sound story).
    let pendPrev = false
    let pendWinStart = -1
    let pendWinDepth = 0
    cpu.processInstruction = (cb?: unknown) => {
      instr++
      const pc = ((cpu.PB << 16) | cpu.PC) >>> 0
      hist.set(pc, (hist.get(pc) ?? 0) + 1)
      if (cpu.PB === 0) {
        for (const r of RANGES) {
          if (r.bank !== undefined) continue
          if (cpu.PC >= r.lo && cpu.PC <= r.hi) {
            r.n++
            break
          }
        }
      } else {
        for (const r of RANGES) {
          if (r.bank === undefined || cpu.PB !== r.bank) continue
          if (cpu.PC >= r.lo && cpu.PC <= r.hi) {
            r.n++
            break
          }
        }
      }
      const pend = irqLine()
      if (pend && !pendPrev) { pendWinStart = instr; pendWinDepth++ }
      if (!pend && pendPrev && pendWinStart >= 0) { pendWins.push(pendWinStart, instr); pendWinStart = -1 }
      pendPrev = pend
      if (!irqSeen && irqLine()) { irqSeen = true; irqFirstAt = instr }
      if (!activeSeen && iigsEnsoniq.hasActiveOscillators()) { activeSeen = true; activeFirstAt = instr }
      return origPI(cb)
    }

    // What does the ROM IRQ manager actually get from the DOC when it services
    // an IRQ? readData() is $C03D; log the EMULATION value per caller PC when
    // the caller is in bank FF (the manager / its firmware), so we can see
    // whether the E0 bit-7 "interrupt present" test the dispatch at FF:B91F
    // relies on ever comes back clear.
    const docLog = new Map<string, number>()
    const pendWins: number[] = []
    const docTimeline: string[] = []
    const origReadData = iigsEnsoniq.readData.bind(iigsEnsoniq)
    ;(iigsEnsoniq as unknown as { readData: () => number }).readData = () => {
      const st = iigsEnsoniq as unknown as { soundadrl: number, soundadrh: number, soundctl: number, e0FetchedThisTxn: boolean, sounddata: number }
      const before = `adrl=$${st.soundadrl.toString(16).padStart(2, "0")} txn=${st.e0FetchedThisTxn ? 1 : 0} latch=$${st.sounddata.toString(16).padStart(2, "0")}`
      const ret = origReadData()
      const key = ((cpu.PB << 16) | cpu.PC).toString(16).padStart(6, "0") +
        "= $" + ret.toString(16).padStart(2, "0") + " (" + before + ")"
      docLog.set(key, (docLog.get(key) ?? 0) + 1)
      if (instr <= 300000) {
        docTimeline.push(instr + ": " + ((cpu.PB << 16) | cpu.PC).toString(16) + " ret=$" + ret.toString(16) + " " + before)
      }
      return ret
    }

    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    // ?adbtrace-style caller tracking, harness flavour: who reads the ADB
    // mouse/status registers during each phase, keyed by CALLER PB:PC. In the
    // browser this is how the "who polls $C024" question was answered.
    const adbAny = iigsADB as unknown as Record<string, (...a: unknown[]) => unknown>
    const adbCallers = { mouse: new Map<number, number>(), status: new Map<number, number>() }
    const wrapAdb = (name: string, into: Map<number, number>) => {
      const orig = adbAny[name].bind(iigsADB)
      adbAny[name] = (...a: unknown[]) => {
        const pc = ((cpu.PB << 16) | cpu.PC) >>> 0
        into.set(pc, (into.get(pc) ?? 0) + 1)
        return orig(...a)
      }
    }
    wrapAdb("readMouseData", adbCallers.mouse)
    wrapAdb("readStatus", adbCallers.status)
    // Does the CPU ever take an IRQ at all?
    let irqEntries = 0
    const cpuAny = cpu as unknown as { irq?: (v?: unknown) => unknown }
    if (cpuAny.irq !== undefined) {
      const origIrq = cpuAny.irq.bind(cpu)
      cpuAny.irq = (...a: unknown[]) => {
        irqEntries++
        return origIrq(...a)
      }
    }

    let hotPcLastPhase = 0
    let hotCountLastPhase = 0
    const run = (frames: number, label: string) => {      hist.clear()
      adbCallers.mouse.clear()
      adbCallers.status.clear()
      for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
      console.log(`[TASS] ${label}: instr=${instr} PB=${cpu.PB.toString(16)} PC=${cpu.PC.toString(16)} ` +
        `irqSeen=${irqSeen}@${irqFirstAt} activeSeen=${activeSeen}@${activeFirstAt}`)
      docPicture(label)
      console.log(`[TASS] ${label} top PCs:\n  ` + spinTop(hist).join("\n  "))
      const top = (m: Map<number, number>, n = 4) =>
        Array.from(m.entries()).sort((x, y) => y[1] - x[1]).slice(0, n)
          .map(([pc, c]) => ((pc >>> 16) & 0xff).toString(16) + ":" + (pc & 0xffff).toString(16).toUpperCase() + " x" + c).join("  ") || "(none)"
      console.log(`[TASS] ${label} ADB $C024 callers: ${top(adbCallers.mouse)}   $C027 callers: ${top(adbCallers.status)}`)
      console.log(`[TASS] ${label} ranges: ` + RANGES.map(r => `${r.name}=${r.n}`).join("  "))
      if (docLog.size) {
        console.log(`[TASS] ${label} manager $C03D reads (top 8): ` +
          Array.from(docLog.entries()).sort((x, y) => y[1] - x[1]).slice(0, 8).map(([k, c]) => `${k}x${c}`).join("  "))
      }
      console.log(`[TASS] ${label} osc-IRQ windows: total=${Math.floor(pendWins.length / 2)}` +
        (pendWins.length >= 2 ? ` (last ${pendWins[pendWins.length - 2]}..${pendWins[pendWins.length - 1]})` : ""))
      if (label === "boot" && docTimeline.length) {
        console.log(`[TASS] ${label} doc read timeline (first 40):\n  ` + docTimeline.slice(0, 40).join("\n  "))
      }
      console.log(`[TASS] ${label} INTEN $C041=${(require("./memory") as typeof import("./memory")).iigsRegisters[0x41].toString(2).padStart(8, "0")} irqEntries=${irqEntries} clockReg64=${(require("./memory") as typeof import("./memory")).iigsRegisters[0x64].toString(16)}`)
      // Raw bytes around the hottest PC (for dis5.cjs) + a zero page picture.
      const hot = Array.from(hist.entries()).sort((x, y) => y[1] - x[1])[0]
      hotPcLastPhase = hot ? hot[0] : 0
      hotCountLastPhase = hot ? hot[1] : 0
      if (hot) {
        const pc = hot[0], bank = (pc >>> 16) & 0xff, off = pc & 0xffff
        codeDump(`${label} code around hottest PC (bank ${bank.toString(16)}):`, bank, Math.max(0, off - 16), off + 24)
      }
      zpDump(label)
    }

    run(1000, "boot")
    run(200, "title-idle")
    // The game wrote its own handler target ($001338) into the $E1:002D
    // JML slot during init. Show what the whole vector area holds then.
    const dumpE1 = (label: string, lo: number, hi: number) => {
      const rows: string[] = []
      for (let a = lo; a <= hi; a += 4) {
        rows.push("$E1:" + a.toString(16).padStart(4, "0").toUpperCase() + "  " +
          Array.from(megaIIAux.subarray(a - 1, a + 3)).map(b => b.toString(16).padStart(2, "0")).join(" ") +
          "   (JML $" + Array.from(megaIIAux.subarray(a, a + 3)).map(b => b.toString(16).padStart(2, "0")).join("") + ")")
      }
      console.log(`[TASS] ${label} E1 vectors:\n` + rows.join("\n"))
    }
    dumpE1("boot", 0x14, 0x44)
    // All 32 oscillators: is there a timer oscillator (not halted, IRQ en) or
    // any OSC with the halt bit cleared? Plus the ROM IRQ manager's sound-IRQ
    // cache ($E1:00C0-$00D0): $E1:00CA = sound IRQ registration, $E1:00CC =
    // cached $C03D read, $E1:00C6 = the manager's jump-select latch.
    const oscDump = (label: string) => {
      const rows = []
      for (let i = 0; i < 32; i++) {
        const o = iigsEnsoniq.oscillators[i]
        if (!(o.control & 1) || (o.control & 8)) {
          rows.push(i + ":c$" + o.control.toString(16).padStart(2, "0") + "/v$" + o.vol.toString(16) +
            "/f$" + o.freq.toString(16) + "/irq" + o.irqpend)
        }
      }
      console.log(`[TASS] ${label} oscs not-halted or irq-enabled: ` + (rows.join(" ") || "(NONE)"))
      const e1 = []
      for (let a = 0xc0; a <= 0xd0; a++) e1.push(a.toString(16) + ":" + megaIIAux[a].toString(16).padStart(2, "0"))
      console.log(`[TASS] ${label} E1 00C0-00D0: ` + e1.join(" "))
    }
    oscDump("boot")

    // Walk the title screen the way a player does. Tass Times' title asks for a
    // key; if that does not advance it, try a click, then more keys.
    const key = (code: number) => {
      setKeyboardState({ isDown: true, key: code, repeat: false })
      for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
      setKeyboardState({ isDown: false, key: 0, repeat: false })
      for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    }
    key(0x0d) // RETURN
    run(120, "after-return")
    key(0x20) // SPACE
    run(120, "after-space")
    MouseCardEvent({ x: 0.3, y: 0.5, buttons: -1 })
    for (let f = 0; f < 30; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x10 })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x00 })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    run(60, "after-click")
    key(0x0d)
    key(0x0d)
    run(400, "after-more-keys")
    key(0x1b) // ESC
    run(200, "after-esc")
    run(400, "much-later")
    // Code at the job target of the hot loop's JSR, for hand disassembly.
    codeDump("code at 00:11E0-00:12A0 (hot loop JSR target):", 0, 0x11e0, 0x12a0)
    codeDump("code at 00:1400-00:1500:", 0, 0x1400, 0x1500)

    // ------------------------------------------------------------------
    // Regression assertions: the DOC IRQ chain that used to leave the game
    // asleep forever in its WAI loop. Four links, in order:
    //   1. the timer oscillator is running (halt bit clear + IRQ enable + a
    //      frequency) — Apple TN #23's zero-volume tick;
    //   2. its end-of-wave IRQ was seen (irqSeen);
    //   3. the ROM IRQ manager dispatched it through $E1:002C to the game's
    //      handler at $001338 (the E0-read bit-7 semantics the dispatcher
    //      branches on — retval MUST be (osc<<1) when a pend is acked);
    //   4. the machine actually left the $0E0A WAI pattern after the input.
    // ------------------------------------------------------------------
    const rTimer = iigsEnsoniq.oscillators.find(o => !(o.control & 1) && (o.control & 8) && o.freq > 0)
    expect(rTimer).toBeDefined()
    expect(irqSeen).toBe(true)
    const rVec = RANGES.find(r => r.name === "E1:002C game vector slot")!
    const rGame = RANGES.find(r => r.name === "game IRQ handler $1338")!
    const rMgrDoc = RANGES.find(r => r.name === "ROM manager DOC section FF:B8F6-B935")!
    expect(rVec.n).toBeGreaterThan(150)   // dispatches into the game's vector
    expect(rGame.n).toBeGreaterThan(1000) // the game's own handler executed
    expect(rMgrDoc.n).toBeGreaterThan(2000)
    // The loop at $0E09/$0E0A (SEP/WAI) used to consume entire phases. The
    // hottest PC of the last phase must not be that stall pattern.
    expect(hotPcLastPhase).not.toBe(0x000E0A)
    expect(hotCountLastPhase).toBeLessThan(200000)

    // Dump a bank-0 window covering the main loop and the sound driver for
    // offline disassembly with diagdis.cjs (file base $0D00).
    const dumpLo = 0x0d00
    const dumpHi = 0x1800
    const dump = Buffer.alloc(dumpHi - dumpLo)
    for (let a = dumpLo; a < dumpHi; a++) dump[a - dumpLo] = memGet24(a) & 0xff
    fs.writeFileSync("C:/Users/USER/AppData/Local/Temp/opencode/tass_bank0.bin", dump)
  } finally {
    jest.useRealTimers()
  }
})
