// Apple IIgs Ensoniq ES5503 ("DOC") emulation tests.
//
// The DOC is reached through $C03C-$C03F (Sound Control / Data / Address Low /
// Address High). Control bit 6 selects RAM mode (wave RAM) vs register mode
// (oscillator registers); control bit 5 auto-increments the address after each
// data access. These tests drive the registers the way real IIgs software does
// and check both the register plumbing and that the synthesizer produces
// non-silent PCM.

import { doSetMachineName, ensoniqCatchUp, setIigsVideoClockForTesting } from "./motherboard"
import { memSet24, memGet24 } from "./memory"
import { iigsEnsoniq, ensoniqDocRam } from "./devices/iigs_ensoniq"

const set = (addr: number, value: number) => memSet24(0x000000 + addr, value & 0xff)
const get = (addr: number) => memGet24(0x000000 + addr)

// Write one DOC register. Control bit 6 clear = register mode (oscillator
// registers), bit 6 set = RAM mode (wave RAM). Bit 5 auto-increments. The
// volume nibble is 0 here (the DOC is muted), so PCM tests set the analog
// volume explicitly after configuring the last register.
const writeReg = (reg: number, value: number) => {
  set(0xC03C, 0x00)        // register mode, no auto-increment
  set(0xC03E, reg & 0xff)
  set(0xC03D, value)
}

// Set the $C03C analog system-volume nibble without moving the register address.
const setSystemVolume = (nibble: number) => set(0xC03C, nibble & 0x0f)

// Read one DOC register. $C03D is a one-access pipeline (it returns the
// previous latch and fetches the current address), so priming read then data
// read is the correct idiom.
const readReg = (reg: number) => {
  set(0xC03C, 0x00)
  set(0xC03E, reg & 0xff)
  get(0xC03D)      // priming read
  return get(0xC03D)
}

beforeEach(() => {
  doSetMachineName("APPLE2GS")
  iigsEnsoniq.reset()
})

test("DOC registers survive a write/read round trip", () => {
  // Oscillator 0 frequency low/high, volume, then read them back.
  writeReg(0x00, 0x34)
  writeReg(0x20, 0x12)
  expect(readReg(0x00)).toBe(0x34)
  expect(readReg(0x20)).toBe(0x12)
  writeReg(0x40, 0x40)
  expect(readReg(0x40)).toBe(0x40)
  // Wave table pointer high byte is a plain readback of what was written.
  writeReg(0x80, 0x20)
  expect(readReg(0x80)).toBe(0x20)
  // The $C0 register packs bank/size/resolution - check the fields survive.
  writeReg(0xc0, 0x40 | (3 << 3) | 5)
  expect(readReg(0xc0) & 0x40).toBe(0x40)
  expect((readReg(0xc0) >> 3) & 7).toBe(3)
  expect(readReg(0xc0) & 7).toBe(5)
})

test("DOC wave RAM mode with auto-increment writes a block", () => {
  set(0xC03C, 0x40 | 0x20)  // RAM mode + auto-increment
  set(0xC03E, 0x10)         // address low  = $10
  set(0xC03F, 0x02)         // address high = $02  => $0210
  for (let i = 0; i < 16; i++) {
    set(0xC03D, 0x40 + i)
  }
  for (let i = 0; i < 16; i++) {
    expect(ensoniqDocRam[0x0210 + i]).toBe(0x40 + i)
  }
  // Address auto-incremented to $0220.
  expect(get(0xC03E)).toBe(0x20)
  expect(get(0xC03F)).toBe(0x02)
})

test("enabling 32 oscillators is visible in the oscillator-enable register", () => {
  writeReg(0xe1, 0x3e)  // ((0x3e >> 1) & 0x1f) + 1 = 32
  expect(readReg(0xe1)).toBe(0x3e)
  expect(iigsEnsoniq.osce).toBe(32)
})

test("a keyed-on oscillator with wave RAM produces audible PCM", () => {
  // Fill a small sawtooth-ish waveform into the first 256 bytes of wave RAM.
  set(0xC03C, 0x40 | 0x20)
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    // A zero byte in wave RAM halts the oscillator (real DOC behaviour), so the
    // waveform has to stay non-zero throughout.
    set(0xC03D, i + 1)
  }
  // Oscillator 0: wave size 256 (size 0), resolution 8-bit (0).
  writeReg(0xc0, 0x00)
  // Wave pointer at $0000, full volume, channel select L.
  writeReg(0x80, 0x00)
  writeReg(0x40, 0xff)
  writeReg(0x00, 0x40)   // freq lo
  writeReg(0x20, 0x00)   // freq hi -> $0040
  // control bit0 = 1 halts; clearing it starts the oscillator.
  writeReg(0xa0, 0x01)
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(false)
  writeReg(0xa0, 0x00)   // bit4 = 0 selects (per achan mapping) channel 1
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(true)

  setSystemVolume(0x06)
  const pcm = iigsEnsoniq.generateSamples(512)
  expect(pcm.length).toBe(1024)
  let peak = 0
  let nonzero = 0
  for (let i = 0; i < pcm.length; i++) {
    const v = Math.abs(pcm[i])
    if (v > 0) nonzero++
    if (v > peak) peak = v
  }
  expect(nonzero).toBeGreaterThan(0)
  expect(peak).toBeGreaterThan(0)
})

// gssquared soundglu.cpp ensoniq_mirror_mono_to_stereo: mono software usually
// parks every voice on one channel (often 0 / right), so only one output side
// gets energy. The built-in IIgs speaker plays a mix of both channels, so a
// same-CA0 chorus must be mirrored onto L and R.
test("mono voices are mirrored onto both L and R", () => {
  set(0xC03C, 0x40 | 0x20)
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    set(0xC03D, i + 1)
  }
  writeReg(0xc0, 0x00)
  writeReg(0x80, 0x00)
  writeReg(0x40, 0xff)
  writeReg(0x00, 0x40)
  writeReg(0x20, 0x00)
  // CA0=0 -> assigned 0 but flipped to right(1) by the odd/even mapping.
  writeReg(0xa0, 0x00)
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(true)

  setSystemVolume(0x06)
  const pcm = iigsEnsoniq.generateSamples(512)
  let leftNonzero = false
  let rightNonzero = false
  for (let s = 0; s < 512; s++) {
    expect(pcm[s * 2]).toBe(pcm[s * 2 + 1])
    if (pcm[s * 2] !== 0) leftNonzero = true
    if (pcm[s * 2 + 1] !== 0) rightNonzero = true
  }
  expect(leftNonzero).toBe(true)
  expect(rightNonzero).toBe(true)
})

// Once voices genuinely sit on different channels the DOC is delivering real
// stereo and L/R must be left alone.
test("true stereo is left untouched by the mono mirror", () => {
  set(0xC03C, 0x40 | 0x20)
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    set(0xC03D, i + 1)
  }
  // Two enabled oscillators (register $E1 value 2 -> osce 2), CA0 split across
  // them, different volumes so the channels are provably different.
  writeReg(0xe1, 0x02)
  writeReg(0xc0, 0x00)
  writeReg(0xc1, 0x00)
  writeReg(0x80, 0x00)
  writeReg(0x81, 0x00)
  // Keep both below the $C03C gain makeup so neither channel clips to int16.
  writeReg(0x40, 0x02)
  writeReg(0x41, 0x01)
  writeReg(0x00, 0x40)
  writeReg(0x20, 0x00)
  writeReg(0x01, 0x40)
  writeReg(0x21, 0x00)
  writeReg(0xa0, 0x10)   // CA0=1 -> left(0)
  writeReg(0xa1, 0x00)   // CA0=0 -> right(1)
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(true)

  setSystemVolume(0x06)
  const pcm = iigsEnsoniq.generateSamples(512)
  let leftNonzero = false
  let rightNonzero = false
  let differs = false
  for (let s = 0; s < 512; s++) {
    if (pcm[s * 2] !== 0) leftNonzero = true
    if (pcm[s * 2 + 1] !== 0) rightNonzero = true
    if (pcm[s * 2] !== pcm[s * 2 + 1]) differs = true
  }
  expect(leftNonzero).toBe(true)
  expect(rightNonzero).toBe(true)
  expect(differs).toBe(true)
})

test("a halted oscillator produces silence", () => {
  set(0xC03C, 0x40 | 0x20)
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    set(0xC03D, 0x80)
  }
  writeReg(0xc0, 0x00)
  writeReg(0x80, 0x00)
  writeReg(0x40, 0xff)
  writeReg(0x00, 0x40)
  writeReg(0x20, 0x00)
  writeReg(0xa0, 0x01)  // halted
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(false)
  // Keep the volume unmuted: the silence must come from the halt, not $C03C.
  setSystemVolume(0x06)
  const pcm = iigsEnsoniq.generateSamples(256)
  for (let i = 0; i < pcm.length; i++) {
    expect(pcm[i]).toBe(0)
  }
})

test("the sample clock keeps running while every oscillator is halted", () => {
  // reset() leaves all 32 oscillators halted, i.e. the chip is silent. The
  // output sample clock must still advance: the run loop posts exactly one
  // outRate/60 block per refresh, and sequencer tempo is measured in DOC
  // samples (the Apple TN #23 timer voice halts at a fixed sample count), so
  // freezing the clock whenever all voices momentarily halt makes music play
  // slow and lands every timer tick late.
  const rate = iigsEnsoniq.outputRate()
  const perRefresh = Math.round(rate / 60)
  const before = iigsEnsoniq.samplesGenerated
  for (let r = 0; r < 60; r++) {
    const block = iigsEnsoniq.generateSamples(perRefresh)
    expect(block.some((v) => v !== 0)).toBe(false)
  }
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(false)
  expect(iigsEnsoniq.samplesGenerated - before).toBe(60 * perRefresh)
})

test("TN #23 timer oscillator ticks at the chip's own sample rate", () => {
  // The canonical IIgs timer voice: zero volume, free-run, IRQ enabled, a
  // 249-step over a 256-byte wave. One wrap spans 255 * 2^9 / 249 = 524.3
  // samples, so with 32 oscillators enabled (26320 samples/s) it must tick
  // 50.2 times per DOC second. A driver re-keys it from the IRQ; emulate that
  // with zero latency so this measures the march, not the guest's latency.
  set(0xC03C, 0x40 | 0x20)   // RAM mode + auto-increment
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    set(0xC03D, 0x80)        // non-zero bytes: no zero-byte halt
  }
  writeReg(0xe1, 0x3e)       // 32 oscillators enabled
  writeReg(0x00 + 31, 249)   // frequency
  writeReg(0x20 + 31, 0)
  writeReg(0x40 + 31, 0)     // volume 0
  writeReg(0x80 + 31, 0)     // wave page 0
  writeReg(0xc0 + 31, 0)     // 256-byte wave, resolution 0
  writeReg(0xa0 + 31, 0x08)  // free-run + IRQ enable

  const rate = iigsEnsoniq.outputRate()
  expect(rate).toBe(26320)

  let ticks = 0
  const prevCallback = iigsEnsoniq.irqCallback
  iigsEnsoniq.setIrqCallback((state) => {
    if (!state) return
    ticks++
    writeReg(0xa0 + 31, 0x08)   // driver re-keys the timer
  })
  const before = iigsEnsoniq.samplesGenerated
  try {
    iigsEnsoniq.generateSamples(rate)   // exactly one DOC second
  } finally {
    iigsEnsoniq.setIrqCallback(prevCallback!)
  }

  expect(iigsEnsoniq.samplesGenerated - before).toBe(rate)
  expect(ticks).toBeGreaterThan(49)
  expect(ticks).toBeLessThan(52)
})

test("$C03D reads are pipelined: priming read then data read", () => {
  // Wave RAM at $0200/$0201 hold two distinct values.
  set(0xC03C, 0x40)          // RAM mode, no auto-increment
  set(0xC03E, 0x00)
  set(0xC03F, 0x02)
  set(0xC03D, 0x11)
  set(0xC03E, 0x01)
  set(0xC03D, 0x22)

  // Priming read returns the previous latch, and fetches $0200.
  set(0xC03E, 0x00)
  const priming = get(0xC03D)
  expect(priming).toBe(0x22)
  // Data read returns what the priming read latched.
  expect(get(0xC03D)).toBe(0x11)

  // Same for $0201.
  set(0xC03E, 0x01)
  expect(get(0xC03D)).toBe(0x11)
  expect(get(0xC03D)).toBe(0x22)
})

test("sound control low nibble is the raw analog system volume", () => {
  // A cold AudioSystem starts at 6 (gssquared AudioSystem.hpp volume_setting),
  // not at 15: the full-volume nibble must be asked for explicitly.
  expect(iigsEnsoniq.systemVolume).toBe(6)
  set(0xC03C, 0x0f)  // full volume
  expect(iigsEnsoniq.systemVolume).toBe(15)
  set(0xC03C, 0x06)  // gssquared's cold default
  expect(iigsEnsoniq.systemVolume).toBe(6)
  set(0xC03C, 0x00)  // mute
  expect(iigsEnsoniq.systemVolume).toBe(0)
  // A read never reports busy, and bit 7 is not echoed back.
  expect(get(0xC03C) & 0x80).toBe(0)
})

test("reading $E0 acknowledges a pending oscillator interrupt", () => {
  // Oscillator 3 with interrupt enable (control bit3) and its wave RAM empty,
  // so the next sample sees a zero byte and halts with an IRQ pending.
  writeReg(0xc0, 0x00)
  writeReg(0x80, 0x00)
  writeReg(0x40, 0xff)
  writeReg(0x00, 0x40)
  writeReg(0x20, 0x00)
  writeReg(0xa0, 0x09)  // halt bit set, IRQ enable (bit 3) set
  writeReg(0xa0, 0x08)  // start: halt bit clear, IRQ still enabled
  // Wave RAM is all zero at reset, so a zero byte halts and pends the IRQ.
  iigsEnsoniq.generateSamples(8)
  expect(iigsEnsoniq.irqPending()).toBe(true)
  // $E0 reports and clears it.
  const e0 = readReg(0xe0)
  expect(e0 & 0x41).toBe(0x41)
  expect(iigsEnsoniq.irqPending()).toBe(false)
})

// gssquared ensoniq.cpp CPU-written halt: when the write has halt bit 0 and
// bit 1 set, halt_osc() runs with the old (playing) control before the write is
// applied. A type 0 halt only pend an IRQ if the *new* control has bit 3 set.
test("a CPU-written halt runs halt_osc and pends only when the new IRQ bit is set", () => {
  writeReg(0x00, 0x40)   // oscillator 0 plays at a real frequency
  writeReg(0x20, 0x00)
  writeReg(0xa0, 0x08)   // free-run + IRQ enable (halt bit clear)
  expect(iigsEnsoniq.oscillators[0].control).toBe(0x08)

  writeReg(0xa0, 0x0b)   // halt bit + bit 1, IRQ still enabled
  expect(iigsEnsoniq.oscillators[0].control & 1).toBe(1)
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(false)
  expect(iigsEnsoniq.irqPending()).toBe(true)
  expect(iigsEnsoniq.haltCount).toBe(1)

  // Same CPU halt with the new IRQ bit clear must not leave an IRQ pending.
  iigsEnsoniq.reset()
  writeReg(0x00, 0x40)
  writeReg(0x20, 0x00)
  writeReg(0xa0, 0x08)
  writeReg(0xa0, 0x03)   // halt bit + bit 1, IRQ bit 3 clear
  expect(iigsEnsoniq.hasActiveOscillators()).toBe(false)
  expect(iigsEnsoniq.irqPending()).toBe(false)
})

// Swap mode is 11: halt_osc() starts the odd partner (clears its halt bit and
// zeroes its accumulator) before the CPU's new control value lands.
test("a swap-mode CPU halt starts the partner oscillator", () => {
  writeReg(0x00, 0x40)   // oscillator 0 frequency
  writeReg(0x20, 0x00)
  writeReg(0x01, 0x40)   // oscillator 1 frequency
  writeReg(0x21, 0x00)
  writeReg(0xa1, 0x01)   // park the partner halted
  writeReg(0xa0, 0x06)   // swap mode, halt bit clear
  expect(iigsEnsoniq.oscillators[0].control & 1).toBe(0)
  expect(iigsEnsoniq.oscillators[1].control & 1).toBe(1)

  writeReg(0xa0, 0x03)   // CPU halt: bit 0 and bit 1, old control in swap mode
  expect(iigsEnsoniq.oscillators[0].control & 1).toBe(1)
  expect(iigsEnsoniq.oscillators[1].control & 1).toBe(0)
  expect(iigsEnsoniq.oscillators[1].accumulator).toBe(0)
})

// gssquared assigns the entire wave-table pointer from $80+n (data << 8), so
// the bank bit 16 that $C0+n owns cannot survive a register-mode pointer write.
test("writing $80 clears the wave-table pointer bank bit", () => {
  writeReg(0x80, 0x20)          // pointer $2000
  writeReg(0xc0, 0x40)          // $C0 bit 6 sets pointer bit 16
  expect(readReg(0xc0) & 0x40).toBe(0x40)
  expect(iigsEnsoniq.oscillators[0].wavetblpointer).toBe(0x12000)

  writeReg(0x80, 0x20)          // same page byte: pointer becomes $2000 again
  expect(iigsEnsoniq.oscillators[0].wavetblpointer).toBe(0x2000)
  expect(readReg(0x80)).toBe(0x20)
  expect(readReg(0xc0) & 0x40).toBe(0)
})

// The sample clock is catch-up-based, not per refresh. A register-mode $E1 write
// changes the output rate mid-refresh; samples generated before it must keep
// their old rate, and the remainder must be labelled with the new rate. The
// real bug was relabelling the whole block with whichever rate was current at
// the refresh boundary, which sped/slowed the already-rendered segment.
test("an $E1 rate change splits the refresh block into old-rate and new-rate segments", () => {
  const blocks: Array<{ rate: number, frames: number }> = []
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const w2m = require("./worker2main")
  const original = w2m.passEnsoniqSound
  w2m.passEnsoniqSound = (samples: Int16Array, rate: number) => {
    blocks.push({ rate, frames: samples.length / 2 })
  }

  try {
    setIigsVideoClockForTesting(0)
    ensoniqCatchUp()               // start refresh 0 (osce 1)
    writeReg(0xe1, 0x3e)           // 32 oscillators -> rate 26320
    setIigsVideoClockForTesting(23363)  // 46727-cycle refresh, halfway
    ensoniqCatchUp()
    writeReg(0xe1, 0x02)           // 2 oscillators -> rate 223721
    setIigsVideoClockForTesting(46727)  // refresh boundary
    ensoniqCatchUp()               // finishes refresh 0 and posts its segments
  } finally {
    w2m.passEnsoniqSound = original
  }

  expect(blocks.length).toBe(2)
  expect(blocks[0].rate).toBe(26320)
  expect(blocks[0].frames).toBe(219)
  expect(blocks[1].rate).toBe(223721)
  expect(blocks[1].frames).toBe(1864)
  expect(blocks[0].frames + blocks[1].frames).toBe(2083)
})

// gssquared calls ensoniq_catch_up() before applying any $C03C-$C03F access, so
// samples due before the access are rendered with the old register state. The
// run-loop integration is only one caller; the device methods have to catch up
// themselves or a write performed inside an instruction becomes audible early.
test("a DOC write catches up before applying the new register value", () => {
  iigsEnsoniq.writeDoc(0x00, 0x07)  // current oscillator 0 frequency = 7
  const original = iigsEnsoniq.docAccessCatchUp
  let observedFrequency = -1
  iigsEnsoniq.docAccessCatchUp = () => {
    // Runs before writeData applies $C03D; this must still be the old value.
    observedFrequency = iigsEnsoniq.oscillators[0].freq
    original?.()
  }
  try {
    writeReg(0x00, 0x40)  // register-mode data write to frequency low byte
  } finally {
    iigsEnsoniq.docAccessCatchUp = original
  }
  expect(observedFrequency).toBe(7)
  expect(iigsEnsoniq.oscillators[0].freq).toBe(0x40)
})

// gssquared ensoniq.cpp: slot average (osce + 2) then the $C03C Q8 attenuator
// and the fixed 64x makeup. Step 0 is mute, step 15 is no cut, and the analog
// gain glides over 20 ms instead of stepping. The waveform below is deliberately
// tiny (volume 1, signed byte 1) so full volume stays far below int16 clipping.
const configureTinyWaveVoice = () => {
  set(0xC03C, 0x40 | 0x20)  // RAM mode + auto-increment
  set(0xC03E, 0x00)
  set(0xC03F, 0x00)
  for (let i = 0; i < 256; i++) {
    set(0xC03D, 0x81)       // ^0x80 -> signed +1, never zero-byte halt
  }
  writeReg(0xc0, 0x00)       // 256-byte wave, 8-bit resolution
  writeReg(0x80, 0x00)       // wave pointer $0000
  writeReg(0x40, 0x01)       // tiny oscillator volume
  writeReg(0x00, 0x40)       // frequency $0040
  writeReg(0x20, 0x00)
  writeReg(0xa0, 0x00)       // free-run, halt bit clear
}

const docPeak = (frames: number) => {
  const pcm = iigsEnsoniq.generateSamples(frames)
  let peak = 0
  for (const sample of pcm) peak = Math.max(peak, Math.abs(sample))
  return peak
}

test("$C03C volume attenuates the DOC: mute is silent and full volume is louder", () => {
  iigsEnsoniq.reset()
  configureTinyWaveVoice()
  setSystemVolume(0x0f)
  const full = docPeak(512)

  iigsEnsoniq.reset()
  configureTinyWaveVoice()
  setSystemVolume(0x06)
  const mid = docPeak(512)

  iigsEnsoniq.reset()
  configureTinyWaveVoice()  // last register write leaves the volume nibble at 0
  const mute = docPeak(512)

  expect(mute).toBe(0)
  expect(mid).toBeGreaterThan(0)
  expect(full).toBeGreaterThan(mid)
})

test("a $C03C volume change glides on the 20 ms analog gain, not a step", () => {
  iigsEnsoniq.reset()
  configureTinyWaveVoice()
  setSystemVolume(0x00)     // prime gain at mute
  docPeak(512)              // gain is now exactly 0
  setSystemVolume(0x0f)     // ask for full volume
  docPeak(1)                // one DOC sample after the change
  const gain = (iigsEnsoniq as unknown as { volGain: number }).volGain
  expect(gain).toBeGreaterThan(0)
  // It must be nowhere near the new target yet: 20 ms is thousands of samples
  // at the DOC's ~298 kHz default rate (osce 1 -> 894886 / 8 / 3).
  expect(gain).toBeLessThan(0.01)
})