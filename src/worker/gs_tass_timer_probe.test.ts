import { doSetMachineName, doSetRunMode, getCPU } from "./motherboard"
import { s6502 } from "./instructions"
import { doSetEmuDriveNewData } from "./devices/drivestate"
import { MouseCardEvent, resetMouse } from "./devices/mouse"
import { setKeyboardState } from "./devices/keyboard"
import { iigsADB } from "./iigs_adb"
import { iigsEnsoniq, docAccess, resetDocAccess, ensoniqDocRam } from "./devices/iigs_ensoniq"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"
import * as fs from "fs"

// Measures the Tass Times timer-oscillator tick period in MACHINE TIME, and
// dumps the timer wavetable content so the model-predicted tick period can be
// compared with what actually fired. The claim being tested: is the IIgs DOC
// tick rate the music tempo our emulator produces (irqTicks ~4.7/s was seen
// in the browser) and is that what the wave content itself implies?
//
// Machine-time conversions used in this test:
//   - s6502.cycleCount advances in the IIgs frame clock: cpuCyclesPerRefresh
//     cycles = 1/60 s of machine time (46727 at the 2.8 MHz mode).
//   - DOC output sample rate for osce=32: 28636360/32 / (32+2) = 26321 Hz.
const TASS_PATH = process.env.GS_TASS_PATH || "C:\\dev\\emu\\ap2\\Tass Times in Tonetown.2mg"

const CPU_CYCLES_PER_SEC = 2804720 // 46727 * 60 at the 2.8 MHz speed mode

test("Tass Times: timer oscillator tick period in machine time + wavetable content", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    resetMouse()
    iigsADB.reset()

    const data = fs.readFileSync(TASS_PATH)
    doSetEmuDriveNewData({
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
    resetDocAccess()

    // --- Instrument haltOsc at the prototype level (called via this.haltOsc). ---
    type HaltEvent = { onum: number, type: 0 | 1, cycles: number }
    const haltEvents: HaltEvent[] = []
    const haltKey = "haltOsc"
    const origHalt = (Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)[haltKey]
      .bind(iigsEnsoniq)
    ;(Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)[haltKey] =
      (onum: number, type: 0 | 1, ...rest: unknown[]) => {
        // accHolder.v is rest[0]; it is the accumulator value at the halt.
        const accHolder = rest[0] as { v: number } | undefined
        haltEvents.push({ onum, type, cycles: s6502.cycleCount })
        if (onum === 31) {
          const o = (iigsEnsoniq as unknown as { oscillators: Array<{ wavetblpointer: number, wavetblsize: number, freq: number, control: number, vol: number, resolution: number }> }).oscillators[31]
          const wavemasksL = [0x1ff00, 0x1fe00, 0x1fc00, 0x1f800, 0x1f000, 0x1e000, 0x1c000, 0x18000]
          const wtptrL = (o.wavetblpointer & wavemasksL[o.wavetblsize]) & 0xffff
          const shiftL = (resshiftLocal[o.resolution] - o.wavetblsize) < 1 ? 1 : resshiftLocal[o.resolution] - o.wavetblsize
          const posL = (accHolder ? accHolder.v : 0) >> shiftL
          haltDump.push(`halt type=${type} acc=${accHolder ? accHolder.v : "?"} pos=${posL & 0xfff} ` +
            `wtptr=$${wtptrL.toString(16)} byteAtHalt=$${ensoniqDocRam[(posL & 0xfff) + wtptrL & 0xffff].toString(16)} ` +
            `freq=${o.freq} ctrl=$${o.control.toString(16)} vol=$${o.vol.toString(16)} res=${o.resolution}`)
        }
        return origHalt(onum as 0 | 1, type, ...rest) as void
      }
    const haltDump: string[] = []
    const resshiftLocal = [9, 10, 11, 12, 13, 14, 15, 16]

    const cpu = getCPU() as unknown as { PB: number, PC: number }
    doSetRunMode(RUN_MODE.NEED_BOOT)
    doSetRunMode(RUN_MODE.RUNNING, false)

    const key = (code: number) => {
      setKeyboardState({ isDown: true, key: code, repeat: false })
      for (let f = 0; f < 4; f++) jest.advanceTimersByTime(17)
      setKeyboardState({ isDown: false, key: 0, repeat: false })
      for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    }
    // Progress the screens the way gs_tass.test.ts does.
    for (let f = 0; f < 1000; f++) jest.advanceTimersByTime(17)
    console.log("[TICK] boot: oscs not-halted: " +
      iigsEnsoniq.oscillators.filter(o => !(o.control & 1)).map((o, i) => `f${o.freq}/c${o.control}`).join(" "))
    {
      const wavesizes2 = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768]
      const wavemasks2 = [0x1ff00, 0x1fe00, 0x1fc00, 0x1f800, 0x1f000, 0x1e000, 0x1c000, 0x18000]
      const resshifts2 = [9, 10, 11, 12, 13, 14, 15, 16]
      const rows: string[] = []
      for (let i = 0; i < Math.max(1, iigsEnsoniq.osce); i++) {
        const o = iigsEnsoniq.oscillators[i]
        if (o.freq > 1) {
          const wtptr = o.wavetblpointer & wavemasks2[o.wavetblsize]
          let len = 0
          for (let p = 0; p < wavesizes2[o.wavetblsize] && len < wavesizes2[o.wavetblsize]; p++) {
            if (ensoniqDocRam[(wtptr + p) & 0xffff] === 0) break
            len++
          }
          const shift = resshifts2[o.resolution] - o.wavetblsize
          const traverse = len * Math.pow(2, shift) / o.freq // DOC samples per wave
          const pitch = 26320.2 / traverse
          const midi = 69 + 12 * Math.log2(pitch / 440)
          rows.push(`osc${i}: f=${o.freq} vol=${o.vol} wtptr=$${wtptr.toString(16)} field=${o.wavetblsize} ` +
            `resF=${o.resolution} shift=${shift} len(firstZero)=${len} ` +
            `traverse=${traverse.toFixed(0)} samp pitch=${pitch.toFixed(1)}Hz midi=${midi.toFixed(2)} ctrl=$${o.control.toString(16)}`)
        }
      }
      console.log("[TICK] melody voices after BOOT (docRate=26320):\n  " + rows.join("\n  "))
      rows.length = 0
    }
    // Zero-run structure of DOC RAM: long zero RUNS beside the 8-byte end
    // markers would mean the $C03D upload path corrupted the sample waves
    // (fake end markers change every note's halt position => tempo changes).
    {
      const runs: string[] = []
      for (let base = 0; base < 0x10000; base += 0x1800) {
        let zr = 0
        for (let p = base; p < Math.min(0x10000, base + 0x1800); p++) {
          if (ensoniqDocRam[p] === 0) {
            zr++
          } else {
            if (zr >= 6) runs.push(`zeroRun len=${zr} @docRam $${(p - zr).toString(16).padStart(4, "0")}`)
            zr = 0
          }
        }
        if (zr >= 6) runs.push(`zeroRun len=${zr} @docRam $${(0x10000 - zr).toString(16).padStart(4, "0")} (tail)`)
      }
      let zeroTotal = 0
      for (let p = 0; p < 0x10000; p++) if (ensoniqDocRam[p] === 0) zeroTotal++
      console.log(`[TICK] docRam zero bytes total=${zeroTotal}/65536 (${(zeroTotal / 655.36).toFixed(1)}%)`)
      console.log(`[TICK] docRam zero-runs >= 6 (${runs.length}):\n  ` + runs.join("\n  "))
    }
    key(0x0d)
    for (let f = 0; f < 120; f++) jest.advanceTimersByTime(17)
    key(0x20)
    for (let f = 0; f < 120; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x10 })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    MouseCardEvent({ x: 0.5, y: 0.5, buttons: 0x00 })
    for (let f = 0; f < 60; f++) jest.advanceTimersByTime(17)
    key(0x0d)
    key(0x0d)
    for (let f = 0; f < 400; f++) jest.advanceTimersByTime(17)
    key(0x1b)
    for (let f = 0; f < 400; f++) jest.advanceTimersByTime(17)
    console.log(`[TICK] after-input: docAccess=${JSON.stringify(docAccess)} PC=${cpu.PB.toString(16)}:${cpu.PC.toString(16)}`)
    // At the title screen (first 300 frames), capture the melody voices'
    // registers once in detail, then compute their concert pitch.
    for (let f = 0; f < 1000; f++) jest.advanceTimersByTime(17)
    {
      const wavesizes2 = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768]
      const wavemasks2 = [0x1ff00, 0x1fe00, 0x1fc00, 0x1f800, 0x1f000, 0x1e000, 0x1c000, 0x18000]
      const resshifts2 = [9, 10, 11, 12, 13, 14, 15, 16]
      const rows: string[] = []
      for (let i = 0; i < Math.max(1, iigsEnsoniq.osce); i++) {
        const o = iigsEnsoniq.oscillators[i]
        if (!(o.control & 1) && o.freq > 1) {
          const wtptr = o.wavetblpointer & wavemasks2[o.wavetblsize]
          let len = 0
          for (let p = 0; p < wavesizes2[o.wavetblsize] && len < wavesizes2[o.wavetblsize]; p++) {
            if (ensoniqDocRam[(wtptr + p) & 0xffff] === 0) break
            len++
          }
          const shift = resshifts2[o.resolution] - o.wavetblsize
          const traverse = len * Math.pow(2, shift) / o.freq // DOC samples per wave
          const pitch = 26320.2 / traverse
          const midi = 69 + 12 * Math.log2(pitch / 440)
          rows.push(`osc${i}: f=${o.freq} vol=${o.vol} wtptr=$${wtptr.toString(16)} field=${o.wavetblsize} ` +
            `resF=${o.resolution} shift=${shift} mLength(firstZero)=${len} ` +
            `traverse=${traverse.toFixed(0)} samp pitch=${pitch.toFixed(1)}Hz midi=${midi.toFixed(2)} ctrl=$${o.control.toString(16)}`)
        }
      }
      console.log("[TICK] melody voices after BOOT 1000 frames (docRate=26320):\n  " + rows.join("\n  "))
    }

    // --- Clear the event log, then measure an interval of pure music time. ---
    haltEvents.length = 0
    haltDump.length = 0
    // March probe: each generateSamples block, osc31 acc before/after.
    // Also snapshot every oscillator's registers once per block during the
    // measure window, so melody-voice pitch can be reconstructed afterwards.
    const marchProbe: string[] = []
    const oscSnapshots: string[] = []
    // Note-onset log: every osc control register write that KEY-ONs a voice
    // (halt bit clear on a previously halted osc), with machine-time stamps.
    const keyOns: string[] = []
    const genKey = "generateSamples"
    const origGen = (Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)[genKey]
      .bind(iigsEnsoniq)
    ;(Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)[genKey] =
      (nf: number) => {
        const o31 = iigsEnsoniq.oscillators[31]
        const pre = { acc: o31.accumulator, ctrl: o31.control, cyc: s6502.cycleCount }
        const buf = origGen(nf)
        const post = iigsEnsoniq.oscillators[31]
        marchProbe.push(`blk nf=${nf} cyc=${pre.cyc} pre(acc=${pre.acc},c$${pre.ctrl.toString(16)}) ` +
          `post(acc=${post.accumulator},c$${post.control.toString(16)}) dAcc=${post.accumulator - pre.acc} ` +
          `dAcc/nf=${((post.accumulator - pre.acc) / nf).toFixed(2)}`)
        oscSnapshots.push(iigsEnsoniq.oscillators.map((o, i) =>
          `o${i}:${o.control >> 3 & 1 ? "I" : "-"}${o.control & 1 ? "H" : "R"}/f${o.freq}/v${o.vol}/w$${o.wavetblpointer.toString(16)}/z${o.wavetblsize}/r${o.resolution}`).join(" "))
        return buf
      }
    const startCycles = s6502.cycleCount
    // Note-onset logging for the measure window: control register writes
    // ($A0+$n .. $BF) that key-on a voice, stamped with machine time.
    const anyEnW = iigsEnsoniq as unknown as Record<string, number>
    const origWriteDataW = (Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)["writeData"]
    ;(Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)["writeData"] =
      (data: number) => {
        const addr = (anyEnW.soundadrh << 8) | anyEnW.soundadrl
        const oscN = addr & 0x1f
        if ((addr & 0xe0) === 0xa0) {
          const o = iigsEnsoniq.oscillators[oscN]
          const wasHalted = (o.control & 1) !== 0
          const keyOn = wasHalted && !(data & 1)
          if (keyOn && oscN !== 31) {
            keyOns.push(`t=${s6502.cycleCount} tSec=${(s6502.cycleCount / CPU_CYCLES_PER_SEC).toFixed(3)} osc${oscN} data=$${(data & 0xff).toString(16).padStart(2, "0")} freq=${o.freq}`)
          } else if (oscN === 31 && keyOn) {
            keyOns.push(`t=${s6502.cycleCount} TICK osc31 data=$${(data & 0xff).toString(16).padStart(2, "0")}`)
          }
        }
        return origWriteDataW.call(iigsEnsoniq, data)
      }
    for (let f = 0; f < 600; f++) jest.advanceTimersByTime(17)   // ~10 s of machine time
    const endCycles = s6502.cycleCount
    const machineSecs = (endCycles - startCycles) / CPU_CYCLES_PER_SEC
    console.log(`[TICK] measure window: cycles=${endCycles - startCycles} machineSecs=${machineSecs.toFixed(3)}` +
      ` PC=${cpu.PB.toString(16)}:${cpu.PC.toString(16)}`)

    // Group by timer oscillator: the one that fires most often.
    const byOsc = new Map<number, number[]>() // onum -> event cycles
    for (const e of haltEvents) {
      const arr = byOsc.get(e.onum) ?? (byOsc.set(e.onum, []), byOsc.get(e.onum)!)
      arr.push(e.cycles)
    }
    console.log("[TICK] halt events by oscillator: " +
      Array.from(byOsc.entries()).sort((a, b) => b[1].length - a[1].length).slice(0, 10)
        .map(([o, arr]) => `osc${o}: ${arr.length} events (${arr.every(c => true) ? "type-mixed" : ""})`).join("  "))

    // For the hottest oscillator: interval statistics in machine seconds AND
    // in DOC samples (26321 Hz when osce=32).
    const osce = iigsEnsoniq.osce
    const docSampleRate = (28636360 / 32) / (Math.max(1, osce) + 2)
    const report = (onum: number, arr: number[]) => {
      if (arr.length < 3) return
      const deltas: number[] = []
      for (let i = 1; i < arr.length; i++) deltas.push(arr[i] - arr[i - 1])
      deltas.sort((a, b) => a - b)
      const med = deltas[Math.floor(deltas.length / 2)]
      const min = deltas[0], max = deltas[deltas.length - 1]
      const medSamples = med * docSampleRate / CPU_CYCLES_PER_SEC
      const rate = (arr.length - 1) / ((arr[arr.length - 1] - arr[0]) / CPU_CYCLES_PER_SEC)
      console.log(`[TICK] osc${onum}: n=${arr.length} rate=${rate.toFixed(2)}/s ` +
        `medianInterval=${med} cyc = ${(med / CPU_CYCLES_PER_SEC * 1000).toFixed(1)} ms = ${medSamples.toFixed(1)} DOC samples`)
      console.log(`[TICK] osc${onum} interval percentiles: min=${min} p25=${deltas[Math.floor(deltas.length * 0.25)]} ` +
        `p50=${med} p75=${deltas[Math.floor(deltas.length * 0.75)]} max=${max}`)
    }
    const ranked = Array.from(byOsc.entries()).sort((a, b) => b[1].length - a[1].length)
    console.log(`[TICK] osce=${osce} docSampleRate=${docSampleRate.toFixed(1)}`)
    for (const [onum, arr] of ranked.slice(0, 4)) report(onum, arr)

    const hotOsc = ranked.length ? ranked[0][0] : -1
    const hotArr = ranked.length ? ranked[0][1] : []

    // --- Oscillator register state now, for the hottest osc. ---
    const oscDump = (i: number) => {
      const o = iigsEnsoniq.oscillators[i]
      return `osc${i}: ctrl=$${o.control.toString(16).padStart(2, "0")} vol=$${o.vol.toString(16).padStart(2, "0")} ` +
        `freq=${o.freq} wtptr=$${o.wavetblpointer.toString(16)} wtsize=${o.wtsize} wavetblsizeField=${o.wavetblsize} ` +
        `resolution=${o.resolution} acc=${o.accumulator} irq=${o.irqpend}`
    }
    if (hotOsc >= 0) console.log(`[TICK] hot osc state: ${oscDump(hotOsc)}`)
    console.log("[TICK] all oscs: " + iigsEnsoniq.oscillators.map((o, i) =>
      o.control & 1 ? "" : `o${i}:c${o.control}/f${o.freq}/v${o.vol}/w$${o.wavetblpointer.toString(16)}`).filter(Boolean).join(" "))

    // --- Wavetable content of the hot oscillator: the stride between
    // zero bytes IS the model's tick period source. ---
    if (hotOsc >= 0) {
      const o = iigsEnsoniq.oscillators[hotOsc]
      const wavemasks = [0x1ff00, 0x1fe00, 0x1fc00, 0x1f800, 0x1f000, 0x1e000, 0x1c000, 0x18000]
      const wtptr = o.wavetblpointer & wavemasks[o.wavetblsize]
      const waveStart = wtptr & 0xffff
      const wave = ensoniqDocRam.subarray(waveStart, Math.min(0x10000, waveStart + o.wtsize))
      const zeros: number[] = []
      let nonzero = 0, minB = 255, maxB = 0
      for (let i = 0; i < wave.length; i++) {
        if (wave[i] === 0) zeros.push(i)
        else { nonzero++; if (wave[i] < minB) minB = wave[i]; if (wave[i] > maxB) maxB = wave[i] }
      }
      const hex = (from: number, n: number) =>
        Array.from(wave.subarray(from, from + n)).map(b => b.toString(16).padStart(2, "0")).join(" ")
      console.log(`[TICK] osc${hotOsc} wave: base=$${waveStart.toString(16)} len=${wave.length} ` +
        `nonzero=${nonzero} zeros=${zeros.length} min=${minB} max=${maxB}`)
      console.log(`[TICK] osc${hotOsc} wave first 32 bytes: ${hex(0, 32)}`)
      console.log(`[TICK] osc${hotOsc} wave bytes 32-64: ${hex(32, 32)}`)
      console.log(`[TICK] osc${hotOsc} wave last 32 bytes: ${hex(Math.max(0, wave.length - 32), 32)}`)
      if (zeros.length && zeros.length <= 40) {
        console.log(`[TICK] osc${hotOsc} zero positions: ${zeros.join(",")}`)
      } else if (zeros.length > 40) {
        console.log(`[TICK] osc${hotOsc} first 40 zero positions: ${zeros.slice(0, 40).join(",")} (+${zeros.length - 40} more)`)
      }
      // Model prediction: with freq=f and shift=s, each DOC sample advances the
      // wave position by f/2^s. Tick iff a zero byte is read or the table ends.
      const rows: string[] = []
      for (let i = 1; i < Math.min(zeros.length, 12); i++) {
        rows.push(`zero@${zeros[i]} -> ${(zeros[i] - zeros[i - 1]) * Math.pow(2, o.resolution ? 10 - o.wavetblsize : 1) / o.freq} samples?`)
      }
      // Use the actual resshift formula: resshifts[res]-wtsizeField
      const resshifts = [9, 10, 11, 12, 13, 14, 15, 16]
      const shift = resshifts[o.resolution] - o.wavetblsize
      const rows2: string[] = []
      for (let i = 1; i < Math.min(zeros.length, 12); i++) {
        rows2.push(`@${zeros[i]}: ${(zeros[i] - zeros[i - 1]) / (o.freq / Math.pow(2, shift))} samples`)
      }
      console.log(`[TICK] osc${hotOsc} predicted DOC samples between zeros (shift=${shift}, freq=${o.freq}): ${rows2.join(", ")}`)
      const medCyc = hotArr.length > 2 ? hotArr[Math.floor(hotArr.length / 2)] - hotArr[0] : 0
      console.log(`[TICK] osc${hotOsc} MEASURED median interval in DOC samples = ` +
        `${(medCyc * docSampleRate / CPU_CYCLES_PER_SEC).toFixed(1)}`)
    }

    // Also show where the OTHER active voices' waves start (are music voices
    // sharing one wave table?) and their intervals if they halt at all.
    for (const [onum, arr] of ranked.slice(1, 4)) {
      console.log(`[TICK] side osc${onum}: ${oscDump(onum)} events=${arr.length}`)
    }

    // irqTicks over the window as a cross-check with the browser metric.
    const ticksStart = iigsEnsoniq.irqTicks
    haltEvents.length = 0
    const t0 = s6502.cycleCount
    for (let f = 0; f < 300; f++) jest.advanceTimersByTime(17)
    const t1 = s6502.cycleCount
    console.log(`[TICK] cross-check: irqTicks ${ticksStart} -> ${iigsEnsoniq.irqTicks} ` +
      `((+${iigsEnsoniq.irqTicks - ticksStart}) over ${(t1 - t0) / CPU_CYCLES_PER_SEC} s), haltEvents=${haltEvents.length}`)
    // What the game writes back into osc31 registers right after each halt:
    // log freq/ctrl changes in the window so the re-key cadence is visible.
    console.log("[TICK] osc31 halt events in measure window (first 24):\n  " + haltDump.slice(0, 24).join("\n  "))
    console.log("[TICK] march probe (first 40 blocks):\n  " + marchProbe.slice(0, 40).join("\n  "))
    console.log(`[TICK] note-onset / tick writes in measure window (${keyOns.length}):\n  ` + keyOns.slice(0, 70).join("\n  "))
    // Melody-voice pitch reconstruction: for each oscillator ever seen RUNNING
    // during the measure window, collect its (freq, wave length, resolution,
    // vol) and compute the implied pitch under the MAME model:
    //   pitch = docRate * freq / (2^(9+res - wtField... ) -- i.e.
    //   samples-per-traversal = wtsize * 2^resshift / freq, resshift =
    //   resshifts[res] - wavetblsizeField. Wave length read from docRam: find
    //   the first zero byte in the wavetable window (length until zero).
    {
      const docRate = 894886 / (Math.max(1, iigsEnsoniq.osce) + 2)
      const resshifts2 = [9, 10, 11, 12, 13, 14, 15, 16]
      const wavedirs: Array<{ f: number, len: number, res: number, vol: number, osc: number, wtptr: number }> = []
      for (let i = 0; i < Math.max(1, iigsEnsoniq.osce); i++) {
        for (const snap of oscSnapshots) {
          const m = snap.match(new RegExp(`o${i}:.H/f(\\d+)/v(\\d+)/w\\$([0-9a-f]+)/z(\\d)/r(\\d)`))
          if (m) {
            const f = +m[1], vol = +m[2], wt = +m[4], res = +m[5], wp = parseInt(m[3], 16)
            const wavemasks2 = [0x1ff00, 0x1fe00, 0x1fc00, 0x1f800, 0x1f000, 0x1e000, 0x1c000, 0x18000]
            const wtptr = wp & wavemasks2[wt]
            let len = 0
            for (let p = 0; p < (1 << wt) * 256 && len < 4096; p++) {
              if (ensoniqDocRam[(wtptr + p) & 0xffff] === 0) break
              len++
            }
            wavedirs.push({ f, len, res, vol, osc: i, wtptr })
          }
        }
      }
      const agg = new Map<string, { n: number, osc: number, wtptr: number, vol: number, len: number, res: number, f: number }>()
      const rows: string[] = []
      for (const d of wavedirs) {
        const key = `o${d.osc}/f${d.f}/w$${d.wtptr.toString(16)}`
        const e = agg.get(key) ?? { n: 0, osc: d.osc, wtptr: d.wtptr, vol: d.vol, len: d.len, res: d.res, f: d.f }
        e.n++; agg.set(key, e)
      }
      for (const [key, e] of agg) {
        // recompute via wave len -> field: len=256<<field
        const field = Math.round(Math.log2(e.len / 256))
        const res = resshifts2[e.res] - field
        const pitch = docRate * e.f / (e.len * Math.pow(2, res)) 
        const midi = 69 + 12 * Math.log2(pitch / 440)
        rows.push(`${key} n=${e.n} vol=${e.vol} len=${e.len} resF=${e.res} shift=${res} ` +
          `pitch=${pitch.toFixed(1)}Hz midi=${midi.toFixed(2)}`)
      }
      console.log(`[TICK] melody voices (pitch under wave-zero length, docRate=${docRate.toFixed(0)}):\n  ` + rows.join("\n  "))
      console.log(`[TICK] snapshot count=${oscSnapshots.length}`)
      console.log(`[TICK] first snapshot:  ${oscSnapshots[0] ?? "(none)"}`)
      console.log(`[TICK] mid snapshot:    ${oscSnapshots[Math.floor(oscSnapshots.length / 2)] ?? "(none)"}`)
      console.log(`[TICK] last snapshot:   ${oscSnapshots[oscSnapshots.length - 1] ?? "(none)"}`)
    }
    // Wire $C026-style register writes to osc31: watch freq/wtptr/control writes.
    const regWrites: string[] = []
    const anyEn = iigsEnsoniq as unknown as Record<string, number>
    // Patch the register write path: track writes for osc31 by observing
    // soundadrl/soundadrh changes. writeData is the $C03D entry.
    const origWriteData = (Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)["writeData"]
    ;(Object.getPrototypeOf(iigsEnsoniq) as Record<string, (...a: any[]) => any>)["writeData"] =
      (data: number) => {
        const addr = (anyEn.soundadrh << 8) | anyEn.soundadrl
        if (addr === 0x00bf) {
          const oscRec = iigsEnsoniq.oscillators[31]
          regWrites.push(`write $BF=$${(data & 0xff).toString(16).padStart(2, "0")} pre: acc=${oscRec.accumulator} ctrl=$${oscRec.control.toString(16).padStart(2, "0")} freq=${oscRec.freq}`)
          const ret = origWriteData.call(iigsEnsoniq, data)
          regWrites.push(`    after: acc=${oscRec.accumulator} ctrl=$${oscRec.control.toString(16).padStart(2, "0")}`)
          return ret
        }
        if (addr < 0xe0) {
          const oscAny = iigsEnsoniq.oscillators[addr & 0x1f]
          const oscAcc = oscAny ? `acc=${oscAny.accumulator} ctrl=$${(oscAny.control as number).toString(16)}` : ""
          regWrites.push(`addr=$${addr.toString(16).padStart(4, "0")} data=$${(data & 0xff).toString(16).padStart(2, "0")} ${oscAcc}`)
        }
        return origWriteData.call(iigsEnsoniq, data)
      }
    regWrites.push("(start)" )
    for (let f = 0; f < 120; f++) jest.advanceTimersByTime(17) // one tick interval
    console.log(`[TICK] osc31 DOC register writes during one tick interval (${regWrites.length}):\n  ` +
      regWrites.slice(0, 40).join("\n  "))
  } finally {
    jest.useRealTimers()
  }
})
