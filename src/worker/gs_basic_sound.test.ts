import {
  doSetMachineName, doSetRunMode, doBoot, doReset, resetCpuSpeedForTesting,
} from "./motherboard"
import { getTextPageAsString } from "./memory"
import { ensoniqDocRam, iigsEnsoniq } from "./devices/iigs_ensoniq"
import { isKeyboardInputBusy, sendKeySequence } from "./devices/keyboard"
import { RUN_MODE } from "../common/utility"
import { setIsTesting } from "./worker2main"

// End-to-end proof that guest software can make the Apple IIgs make a sound,
// with GS/OS, events and the SmartPort disk entirely out of the picture.
//
// MCS cannot get there (AGENTS.md section 36): it initialises the chip, enables
// 32 oscillators and uploads waveforms, but never starts one. So this types a
// short Applesoft BASIC program that programs the Ensoniq directly with POKEs
// and lets an oscillator run. If the DOC and the audio path work at all, this
// must produce a non-silent sample block.
//
// DOC register addressing, the same idiom gs_ensoniq.test.ts uses:
//   $C03C bit 6 = RAM mode, bit 5 = auto-increment, low nibble = analog volume
//   $C03E/$C03F = 16-bit address into DOC RAM or DOC register space
//   $C03D      = the data register
// Per-oscillator DOC registers are $00/$20 frequency, $40 volume, $80 wavetable
// pointer, $A0 control, $C0 wavetable size, and $E1 is the Oscillator Enable
// register whose value is oscillator_count * 2.
const C03C = 0xc03c
const C03D = 0xc03d
const C03E = 0xc03e
const C03F = 0xc03f

// Program the Ensoniq with no FOR/NEXT: $C03C in RAM mode with auto-increment,
// then consecutive $C03D writes fill consecutive DOC RAM addresses, so a
// waveform needs no loop. Applesoft has no ELSE, and typing one CDP key event
// at a time in the browser is lossy, so the shorter the program the more
// reliably it survives. The rest of DOC RAM is already $80 (the zero-crossing
// level), so a short pattern followed by $80s is a narrow pulse - and it means
// no byte ever has to be zero, since a zero byte in a waveform halts the
// oscillator.
//
// This exact program is verified in both environments: here in jest, and in
// headless Chrome, where it produced 134 Ensoniq blocks in six seconds.
const PROGRAM = [
  `10 POKE ${C03C},111:POKE ${C03E},0:POKE ${C03F},0`,
  `20 POKE ${C03D},240:POKE ${C03D},16:POKE ${C03D},240:POKE ${C03D},16`,
  `30 POKE ${C03D},96:POKE ${C03D},176:POKE ${C03D},96:POKE ${C03D},176`,
  `40 POKE ${C03C},15:POKE ${C03E},0:POKE ${C03D},100`,
  `50 POKE ${C03E},64:POKE ${C03D},255`,
  `60 POKE ${C03E},128:POKE ${C03D},0`,
  `70 POKE ${C03E},160:POKE ${C03D},0`,
  `80 POKE ${C03E},192:POKE ${C03D},0`,
  `90 POKE ${C03E},225:POKE ${C03D},2`,
].join("\r") + "\rRUN\r"

// sendKeySequence is asynchronous: the keys are delivered by the run loop as the
// emulated 6502 reads the keyboard strobe. So start the chunk, then pump the run
// loop until the emulator has taken it.
const typeText = async (text: string) => {
  for (let i = 0; i < text.length; i += 16) {
    const done = sendKeySequence({ keys: text.slice(i, i + 16), timeoutMs: 30000 })
    for (let k = 0; k < 400 && isKeyboardInputBusy(); k++) {
      jest.advanceTimersByTime(17)
      await Promise.resolve()
    }
    await done
  }
}

const pump = (frames: number) => {
  for (let f = 0; f < frames; f++) jest.advanceTimersByTime(17)
}

test("Applesoft POKE programs the DOC and it produces a non-silent block", async () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    doSetMachineName("APPLE2GS")
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING, false)
    pump(600)
    // No floppy media, so the reset takes the warm path straight to Applesoft.
    doReset()
    pump(500)
    const prompt = getTextPageAsString()
    console.log("[BASIC] prompt:\n" + prompt.slice(-200))
    expect(prompt).toContain("]")

    await typeText(PROGRAM)
    pump(1500)

    const screen = getTextPageAsString()
    console.log("[BASIC] screen after RUN:\n" + screen.slice(-260))

    const chip = iigsEnsoniq as unknown as {
      osce: number
      oscillators: Array<Record<string, number>>
      systemVolume: number
    }
    let started = 0
    for (const o of chip.oscillators) {
      if (!(o.control & 1) && o.vol > 0 && o.freq > 0) started++
    }
    const o0 = chip.oscillators[0]
    console.log(`[BASIC] osce=${chip.osce} systemVolume=${chip.systemVolume.toFixed(3)} startedOscillators=${started}`)
    console.log(`[BASIC] osc0 ctrl=$${o0.control.toString(16)} vol=$${o0.vol.toString(16)} ` +
      `freq=$${o0.freq.toString(16)} wtptr=$${o0.wavetblpointer.toString(16)} ` +
      `size=$${o0.wavetblsize.toString(16)}`)
    console.log(`[BASIC] DOC RAM $0000: ` +
      Array.from(ensoniqDocRam.subarray(0, 8)).map((b) => "$" + b.toString(16)).join(" "))

    // Render a block and check it is not silence. This is exactly what the worker
    // posts to the UI, so a non-silent block means the whole chain works.
    // The run-loop catch-up has already advanced the oscillator's phase; reset it
    // to the start of the waveform so this direct render tests the audio chain,
    // not which zero-crossing byte the phase happens to land on.
    o0.accumulator = 0
    const block = iigsEnsoniq.generateSamples(1024)
    let peak = 0
    for (const s of block) peak = Math.max(peak, Math.abs(s))
    console.log(`[BASIC] generated ${block.length} samples (${block.length / 2} stereo frames), peak ${peak}`)

    expect(started).toBeGreaterThan(0)
    expect(peak).toBeGreaterThan(0)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED, false)
    resetCpuSpeedForTesting()
    jest.useRealTimers()
  }
}, 300000)