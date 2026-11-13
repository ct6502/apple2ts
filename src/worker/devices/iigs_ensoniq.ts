// Apple IIgs Ensoniq ES5503 "DOC" sound chip emulation.
// Based on the MAME ES5503 implementation as found in gssquared (src/devices/es5503).

// (unused removed)

export const ensoniqDocRam = new Uint8Array(0x10000)

// The ES5503 address-resolution shift table from gssquared (ensoniq.cpp).
// Module scope because both sample generation and the CPU-written halt in
// writeDoc() need the exact same values: halt_osc() receives
// resshifts[resolution], not a value already adjusted for the wave-table size.
const DOC_RESSHIFTS = [9, 10, 11, 12, 13, 14, 15, 16]
const DOC_WAVESIZES = [256, 512, 1024, 2048, 4096, 8192, 16384, 32768]

// gssquared ensoniq.cpp $C03C system-volume attenuator, Q8. Step 0 is mute;
// step 15 is 256 (no cut); every other step is a ~2 dB cut. The chip averages
// the oscillator slots (osce + 2) then applies this and a fixed +36 dB makeup
// of 64. The analog control voltage does not follow sub-ms $C03C blips: 20 ms
// one-pole glide.
const DOC_SYS_ATTEN_Q8 = [
  0,
  6434, 5108, 4058, 3222, 2560, 2034, 1615,
  1283, 1019, 809, 643, 511, 406, 322, 256,
]
const DOC_MAKEUP = 64
const DOC_VOL_SLEW_MS = 20

interface Oscillator {
  freq: number
  wtsize: number
  control: number
  vol: number
  data: number
  wavetblpointer: number
  wavetblsize: number
  resolution: number
  accumulator: number
  irqpend: number
  // Diagnostics: DOC sample counter value at the last key-on (halt-bit clear)
  // and the march length in DOC samples of the most recent halt. These measure
  // the timer-oscillator tick period directly (Apple TN #23): the game's tempo
  // is halt-rate implied by the march segment, so a segment longer than one
  // video refresh means the tick cannot re-key mid-refresh.
  keyOnSample: number
  lastHaltSegment: number
}

export class IigsEnsoniq {
  oscillators: Oscillator[] = []
  isReady = false
  constructor() {
    for (let i = 0; i < 32; i++) {
      this.oscillators[i] = { freq: 0, wtsize: 256, control: 0, vol: 0, data: 0x80, wavetblpointer: 0, wavetblsize: 0, resolution: 0, accumulator: 0, irqpend: 0, keyOnSample: 0, lastHaltSegment: 0 }
    }
    this.setIrqCallback((state) => {
      const host = globalThis as typeof globalThis & {
        cpu?: { irq?: () => void, clearIrq?: () => void }
      }
      if (state) host.cpu?.irq?.()
      else host.cpu?.clearIrq?.()
    })
  }
  setIrqCallback(cb: (state: boolean) => void) {
    this.irqCallback = cb
  }
  updateIrqStatus() {
    let any = false
    const cnt = this.osce < 1 ? 1 : this.osce
    for (let i = 0; i < cnt; i++) {
      if (this.oscillators[i].irqpend) { any = true; break }
    }
    if (this.irqCallback) this.irqCallback(any)
  }
  irqPending(): boolean {
    const cnt = this.osce < 1 ? 1 : this.osce
    for (let i = 0; i < cnt; i++) {
      if (this.oscillators[i].irqpend) return true
    }
    return false
  }
  soundctl = 0x00
  soundadrl = 0x00
  soundadrh = 0x00
  sounddata = 0x00
  rege1 = 2
  osce = 1
  rege0 = 0xff
  irqCallback: ((state: boolean) => void) | null = null
  // Registered by motherboard.ts. Every $C03C-$C03F access first catches the
  // DOC sample clock up to now, so samples before the write are generated with
  // the old register state - gssquared's ensoniq_write_C0xx calls catch-up
  // before applying the write, and ensoniq_read_C0xx does the same before reads.
  docAccessCatchUp?: () => void
  // Called after a register-mode $E1 write has changed the oscillator count
  // (and therefore the output sample rate). The catch-up state drops its
  // fractional remainder and re-anchors at the new rate, matching gssquared.
  docRateRebase?: () => void
  // $C03D is a pipeline: see readData(). Tracks whether $E0 was already
  // fetched in the current transaction so the two-read idiom cannot ack twice.
  e0FetchedThisTxn = false
  // Analog system volume nibble from $C03C, raw 0..15: 0 mute, 15 no cut.
  // gssquared's AudioSystem starts at 6; the chip applies the Q8 attenuator
  // and fixed makeup in generateSamples() by itself, not via SDL gain.
  systemVolume = 6
  // Current analog gain (0..~1) gliding toward the $C03C target. -1 = snap on
  // the first sample, matching gssquared ensoniq.hpp.
  private volGain = -1

  // ---- Diagnostics (?ensoniqdbg=1) ----
  // Counts, not guesses: mirrorMonoCount = mono-chorus mirror applications,
  // irqTicks = oscillator IRQ pend assertions (the game's tempo quantum),
  // blocks = a short ring of the last generated blocks (rate/frames/mirrored),
  // and lastSpeedMode/lastCyclesPerRefresh/lastCyc stamped by the run loop so a
  // page can see the block cadence against the active speed mode.
  monoMirrorCount = 0
  mirrorCountAtGenStart = 0
  irqTicks = 0
  lastSpeedMode = -1
  lastCyclesPerRefresh = 0
  lastCyc = 0
  blocks: Array<{ cyc: number, osce: number, rate: number, frames: number, mirrored: boolean }> = []
  // March-segment diagnostics: monotonic DOC sample counter since reset, a
  // ring of the last halt segments (samples from key-on to halt per oscillator
  // halt), and the halt count. The run loop generates the DOC output in
  // sub-refresh chunks so a halt IRQ can be serviced and the driver can re-key
  // the timer mid-refresh — with a segment that exceeds one refresh the tick
  // rate was pinned to the refresh cadence, halving sequencer tempo (Tass
  // Times title music played at half speed with correct pitches).
  samplesGenerated = 0
  haltCount = 0
  haltSegments: number[] = []
  // Reusable mix accumulator (Int32) so the sub-refresh catch-up path does not
  // allocate its mix buffer on every 1-3 sample call. Cleared per call.
  private mixBuf?: Int32Array

  // The DOC output sample rate: clock / 8 / (oscillators enabled + 2).
  // Single source of truth for both the run loop's post budget and the ring.
  outputRate(): number {
    return Math.max(1, Math.floor(7159090 / 8 / (Math.max(1, this.osce) + 2)))
  }

  reset() {
    this.soundctl = 0x00
    this.soundadrl = 0x00
    this.soundadrh = 0x00
    this.sounddata = 0x00
    this.rege0 = 0xff
    this.rege1 = 2
    this.osce = 1
    this.e0FetchedThisTxn = false
    this.systemVolume = 6
    this.volGain = -1
    this.monoMirrorCount = 0
    this.mirrorCountAtGenStart = 0
    this.irqTicks = 0
    this.blocks = []
    this.resetDocDiag()
    for (let i = 0; i < 32; i++) {
      const o = this.oscillators[i]
      o.freq = 0; o.wtsize = 256; o.control = 0; o.vol = 0; o.data = 0x80
      o.wavetblpointer = 0; o.wavetblsize = 0; o.resolution = 0
      o.accumulator = 0; o.irqpend = 0
      o.keyOnSample = 0; o.lastHaltSegment = 0
    }
    // clear doc ram
    ensoniqDocRam.fill(0)
  }

  // Zero the march-segment diagnostics without touching chip state; used at
  // the start of a measurement window.
  resetDocDiag() {
    this.samplesGenerated = 0
    this.haltCount = 0
    this.haltSegments = []
  }

  // Read a DOC register at offset (ES5503 protocol, offset 0..0xfe); register = offset&0x1f at top digit
  readDoc(offset: number): number {
    const osc = offset & 0x1f
    if (offset < 0xe0) {
      const group = offset & 0xe0
      switch (group) {
        case 0x00: return this.oscillators[osc].freq & 0xff
        case 0x20: return (this.oscillators[osc].freq >> 8) & 0xff
        case 0x40: return this.oscillators[osc].vol & 0xff
        case 0x60: return this.oscillators[osc].data & 0xff
        case 0x80: return (this.oscillators[osc].wavetblpointer >> 8) & 0xff
        case 0xa0: return this.oscillators[osc].control & 0xff
        case 0xc0: {
          let retval = 0
          if (this.oscillators[osc].wavetblpointer & 0x10000) retval |= 0x40
          retval |= (this.oscillators[osc].wavetblsize << 3)
          retval |= this.oscillators[osc].resolution & 0x07
          return retval & 0xff
        }
      }
      return 0
    } else {
      switch (offset) {
        case 0xe0: {
          let retval = this.rege0
          if (this.irqCallback) this.irqCallback(false)
          // Ack one pending oscillator. gssquared es5503.cpp: when a pend is
          // found, retval becomes (i << 1) — bit 7 clear ("interrupt present"),
          // voice number in bits 5-1 — and rege0 stages retval | 0x80 for the
          // next read. The ROM's IRQ dispatcher (FF:B91F) trusts that bit to
          // decide whether to JSL $E1:002C.
          for (let i = 0; i < (this.osce < 1 ? 1 : this.osce); i++) {
            if (this.oscillators[i].irqpend) {
              retval = i << 1
              this.rege0 = retval | 0x80
              this.oscillators[i].irqpend = 0
              break
            }
          }
          // Reassert if more pending
          let any = false
          for (let i = 0; i < (this.osce < 1 ? 1 : this.osce); i++) {
            if (this.oscillators[i].irqpend) { any = true; break }
          }
          if (any && this.irqCallback) this.irqCallback(true)
          return retval | 0x41
        }
        case 0xe1: return this.rege1 & 0xff
        case 0xe2: return 0
        default: return 0
      }
    }
  }

  writeDoc(offset: number, data: number) {
    const osc = offset & 0x1f
    if (offset < 0xe0) {
      const group = offset & 0xe0
      switch (group) {
        case 0x00: this.oscillators[osc].freq = (this.oscillators[osc].freq & 0xff00) | (data & 0xff); break
        case 0x20: this.oscillators[osc].freq = (this.oscillators[osc].freq & 0x00ff) | ((data & 0xff) << 8); break
        case 0x40: this.oscillators[osc].vol = data & 0xff; break
        case 0x60: break // ignore writes
        case 0x80: {
          // Wave table pointer high byte. gssquared assigns the whole pointer
          // (data << 8), clearing bit 16 and the low byte. Only $C0 owns bit 16.
          // Preserving bit 16 here let a stale bank bit survive a register-mode
          // pointer rewrite, so a voice could read from +$10000 after a reload.
          this.oscillators[osc].wavetblpointer = ((data & 0xff) << 8)
          break
        }
        case 0xa0: {
          const o = this.oscillators[osc]
          // key on
          if ((o.control & 1) && !(data & 1)) {
            o.accumulator = 0
            // Stamp the key-on position in DOC samples so haltOsc() can report
            // the march segment (key-on -> halt) in samples.
            o.keyOnSample = this.samplesGenerated
            o.lastHaltSegment = 0
          }
          // CPU-written halt: gssquared checks the pre-write control was playing
          // and the new data has halt bit 0 plus bit 1 set. halt_osc() runs with
          // the held accumulator before the new control takes effect, so swap
          // mode can start its partner and IRQ type 0 honours the new IRQ bit.
          if (!(o.control & 1) && (data & 1) && ((data >> 1) & 1)) {
            const holder = { v: o.accumulator }
            this.haltOsc(osc, 0, holder, DOC_RESSHIFTS[o.resolution], data & 0xff)
            o.accumulator = holder.v
          }
          o.control = data & 0xff
          break
        }
        case 0xc0: {
          const o = this.oscillators[osc]
          if (data & 0x40) o.wavetblpointer |= 0x10000
          else o.wavetblpointer &= ~0x10000 & 0xFFFFFF
          o.wavetblsize = (data >> 3) & 7
          o.wtsize = DOC_WAVESIZES[o.wavetblsize]
          o.resolution = (data & 0x07)
          break
        }
      }
    } else if (offset === 0xe1) {
      this.rege1 = data & 0xff
      this.osce = ((data >> 1) & 0x1f) + 1
    }
  }

  readControl(): number {
    // Fast-forward the sample clock before reading, like gssquared's
    // ensoniq_read_C0xx: the read must see IRQ state caught up to now.
    this.docAccessCatchUp?.()
    // sound control read returns soundctl | 0x0F
    return (this.soundctl & 0x70) | 0x0F
  }

  // Sound GLU $C03D read: a one-access pipeline, as on real DOC hardware and in
  // MAME/gssquared (ensoniq_doc_data_read_pipeline). The read returns the value
  // latched by the *previous* access and simultaneously fetches the byte at the
  // current address into the latch.
  //
  // This matters: IIgs software (and the ROM's own IRQ dispatcher, which reads
  // $C03D twice) relies on priming read -> set address -> read to get data. If a
  // read returned the current address directly, every such sequence returned
  // stale or wrong data and the caller spun or acted on garbage - which is what
  // hung Music Construction Set right after its main screen appeared.
  readData(): number {
    this.docAccessCatchUp?.()
    const ret = this.sounddata
    const fullAddr = ((this.soundadrh << 8) | this.soundadrl) & 0xffff
    if (this.soundctl & 0x40) {
      this.sounddata = ensoniqDocRam[fullAddr]
    } else {
      // Reading $E0 acknowledges the lowest pending oscillator interrupt. The
      // two-read idiom above would ack two oscillators while servicing one, so
      // only fetch $E0 once per transaction. A $C03C/$C03E/$C03F write starts
      // a new transaction.
      if (this.soundadrl !== 0xe0 || !this.e0FetchedThisTxn) {
        this.e0FetchedThisTxn = (this.soundadrl === 0xe0)
        this.sounddata = this.readDoc(this.soundadrl)
      }
    }
    // Busy (bit 7) is read-only and must never be left stuck after a data read.
    this.soundctl &= ~0x80
    if (this.soundctl & 0x20) {
      const next = (fullAddr + 1) & 0xffff
      this.soundadrl = next & 0xff
      this.soundadrh = (next >> 8) & 0xff
    }
    return ret & 0xff
  }

  readAddrLow(): number {
    this.docAccessCatchUp?.()
    return this.soundadrl & 0xff
  }
  readAddrHigh(): number {
    this.docAccessCatchUp?.()
    return this.soundadrh & 0xff
  }

  writeControl(data: number) {
    this.docAccessCatchUp?.()
    // Bit 7 (busy) is read-only and always clears on write.
    this.soundctl = (data & 0x7F)
    this.e0FetchedThisTxn = false
    // The low nibble is the analog system volume, raw 0..15. gssquared's
    // AudioSystem stores this nibble (default 6) and the chip applies it in
    // generateSamples; volume 0 is true mute, not just quieter.
    this.systemVolume = data & 0x0f
    // In register mode (bit 6 clear) only the low address byte is meaningful;
    // a leftover RAM pointer must not leak into register accesses.
    if (!(this.soundctl & 0x40)) {
      this.soundadrh = 0
    }
  }

  writeData(data: number) {
    // Catch up BEFORE applying the write: samples due so far must be rendered
    // with the old register/RAM state (gssquared ensoniq_write_C0xx).
    this.docAccessCatchUp?.()
    // A data write also loads the latch, so a following $C03D read returns it
    // (the pipeline returns the previous latch, not the just-written byte).
    this.sounddata = data & 0xff
    const fullAddr = ((this.soundadrh << 8) | this.soundadrl) & 0xffff
    const registerMode = !(this.soundctl & 0x40)
    // Register-mode $E1 (oscillator enable) changes the chip's sample rate.
    // The gssquared Sound GLU drops the catch-up remainder and re-anchors time
    // after the chip write, so the new rate never applies to pre-write samples.
    const e1Write = registerMode && this.soundadrl === 0xe1
    if (!registerMode) {
      ensoniqDocRam[fullAddr] = data & 0xff
    } else {
      this.writeDoc(this.soundadrl, data & 0xff)
      if (e1Write) this.docRateRebase?.()
    }
    if (this.soundctl & 0x20) {
      const a = (fullAddr + 1) & 0xffff
      this.soundadrl = a & 0xff
      this.soundadrh = (a >> 8) & 0xff
    }
  }

  writeAddrLow(data: number) {
    this.docAccessCatchUp?.()
    this.e0FetchedThisTxn = false
    this.soundadrl = data & 0xff
  }

  writeAddrHigh(data: number) {
    this.docAccessCatchUp?.()
    this.e0FetchedThisTxn = false
    this.soundadrh = data & 0xff
  }

  // Whether any oscillator is currently running. Volume is deliberately NOT
  // required: a zero-volume oscillator with a frequency and the halt bit clear
  // is the standard IIgs timer-oscillator tick (Apple TN #23) — the chip must
  // keep advancing it so its end-of-wave IRQ fires and drivers wake from WAI.
  hasActiveOscillators(): boolean {
    for (let i = 0; i < Math.max(1, this.osce); i++) {
      const o = this.oscillators[i]
      if (!(o.control & 1) && o.freq > 0) {
        return true
      }
    }
    return false
  }

  // halt_osc() ported verbatim from gssquared ensoniq.cpp (MAME-derived).
  // type 0 = wave-table end reached (wrap), type 1 = zero byte in sample data.
  // Sync/AM groups loop rather than halt (retriggering the odd partner), swap
  // mode starts its partner, free-run preserves fractional phase, and the voice
  // IRQ fires in every case when control bit 3 is set — which is how zero-volume
  // timer oscillators tick IIgs sound drivers (Apple TN #23) and wake WAI.
  private haltOsc(onum: number, type: 0 | 1, accHolder: { v: number }, resshift: number, newCtrl: number) {
    const o = this.oscillators[onum]
    const partner = this.oscillators[onum ^ 1]
    let mode = (o.control >> 1) & 3
    const partnerMode = (partner.control >> 1) & 3

    // Check for sync mode
    if (mode === 2) {
      if ((onum & 1) === 0 && onum > 0) {
        // We're even, so if the odd oscillator 1 below us is playing, restart it
        if (!(this.oscillators[onum - 1].control & 1)) {
          this.oscillators[onum - 1].accumulator = 0
        }
      }
      // Loop this oscillator for both sync and AM
      mode = 0
    }

    // If 0 found in sample data or mode is not free-run, halt this oscillator
    if ((mode !== 0) || (type !== 0)) {
      o.control |= 1
    } else {
      // Preserve fractional phase when looping (MAME / Peter Ferrie): subtract
      // (wtsize - 1) << resshift, not the full table, not "zero the index".
      const wtsizeM1 = o.wtsize - 1
      accHolder.v -= (wtsizeM1 << resshift)
    }

    // If we're in swap mode, start the partner
    if (mode === 3) {
      partner.control &= ~1    // Clear the halt bit
      partner.accumulator = 0
    } else {
      // If we're the even oscillator and partner is swap, we retrigger
      if (partnerMode === 3 && (onum & 1) === 0) {
        o.control &= ~1
        const wtsize = o.wtsize - 1
        accHolder.v -= (wtsize << resshift)
      }
    }
    o.control &= 0xff

    // IRQ enabled for this voice?
    if (o.control & 0x08) {
      // MAME: when the halt comes from a CPU write (type 0), only fire if the
      // newly written control value also has IRQ enabled (NTPstop / Bard's Tale).
      if (type === 0 && !(newCtrl & 0x08)) {
        return
      }
      o.irqpend = 1
      // Diagnostic tick counter: every pend assertion is the game's tempo
      // quantum (timer oscillator wraps), measurable per wall second.
      this.irqTicks++
      // March segment: DOC samples advanced between key-on and this halt.
      o.lastHaltSegment = Math.max(0, this.samplesGenerated - o.keyOnSample)
      this.haltCount++
      this.haltSegments.push(o.lastHaltSegment)
      if (this.haltSegments.length > 64) this.haltSegments.shift()
      this.updateIrqStatus()
    }
  }

  // Advance the analog gain on a silent block too. gssquared walks the same
  // 20 ms one-pole glide over the zero mix; keeping it here avoids a gain step
  // when the next block starts sounding.
  private advanceVolumeGain(numFrames: number, sysVolume: number) {
    if (numFrames <= 0) return
    const atten = DOC_SYS_ATTEN_Q8[sysVolume & 0x0f]
    const target = atten === 0 ? 0 : 256 / atten
    if (this.volGain < 0) this.volGain = target
    const dt = 1 / this.outputRate()
    const alpha = 1 - Math.exp(-dt / (DOC_VOL_SLEW_MS * 0.001))
    let g = this.volGain
    for (let s = 0; s < numFrames; s++) {
      g += alpha * (target - g)
    }
    this.volGain = g
  }

  // Produce DOC PCM (Int16 samples) at the chip's output rate. When an output
  // buffer is supplied (the run loop's sub-refresh catch-up path) the samples
  // are written there and it is returned; otherwise a fresh buffer is
  // allocated (the old per-video-frame path, kept for tests and callers that
  // take ownership of the block).
  generateSamples(numFrames: number, out?: Int16Array, sysVolume = this.systemVolume): Int16Array {
    const wavemasks = [0x1ff00,0x1fe00,0x1fc00,0x1f800,0x1f000,0x1e000,0x1c000,0x18000]
    const accmasks = [0xff,0x1ff,0x3ff,0x7ff,0xfff,0x1fff,0x3fff,0x7fff]
    const ossecs = Math.max(1, this.osce)
    const chan = 2
    const buffer = out ?? new Int16Array(numFrames * chan)
    // Reusable mix accumulator. Cleared for the exact span below: the march
    // loop only accumulates into mix[i], so stale bytes from a previous
    // (larger) call must not leak into a shorter one.
    if (this.mixBuf === undefined || this.mixBuf.length < numFrames * chan) {
      this.mixBuf = new Int32Array(numFrames * chan)
    }
    const mix = this.mixBuf
    mix.fill(0, 0, numFrames * chan)
    this.samplesGenerated += numFrames
    // Silence fast path: the chip's sample clock must keep advancing (see the
    // caller — sequencer tempo is measured in DOC samples), but with every
    // enabled oscillator halted there is nothing to mix. Do NOT make this a
    // "don't generate at all" gate: skipping samples pauses the march, so a
    // tracker whose voices momentarily all halt plays slow and every timer
    // tick lands late.
    if (!this.hasActiveOscillators()) {
      buffer.fill(0, 0, numFrames * chan)
      // gssquared still walks the volume glide when the mix is silent; keep the
      // gain continuous so the next sounding block does not step.
      this.advanceVolumeGain(numFrames, sysVolume)
      if (buffer !== out) this.recordBlock(numFrames, false)
      return buffer
    }
    for (let ch = 0; ch < chan; ch++) {
      for (let osc = 0; osc < ossecs; osc++) {
        const o = this.oscillators[osc]
        if (o.control & 1) continue  // halted
        const assigned = (o.control >> 4) & (chan - 1)
        const achan = (chan === 2) ? (assigned ^ 1) : assigned
        if (achan !== ch) continue
        const wtptr = o.wavetblpointer & wavemasks[o.wavetblsize]
        const resshift = DOC_RESSHIFTS[o.resolution] - o.wavetblsize
        const sizemask = accmasks[o.wavetblsize]
        const vol = o.vol
        const freq = o.freq
        const wtsizeMinus = o.wtsize - 1
        const mode = (o.control >> 1) & 3
        let acc = o.accumulator
        let ctrl = o.control
        for (let s = 0; s < numFrames; s++) {
          const shift = resshift < 1 ? 1 : resshift
          const altram = acc >> shift
          const ramptr = altram & sizemask
          acc += freq
          const waveByte = ensoniqDocRam[(ramptr + wtptr) & 0xffff]
          let data = waveByte ^ 0x80
          if (data >= 128) data -= 256
          const accHolder = { v: acc }
          if (waveByte === 0) {
            this.haltOsc(osc, 1, accHolder, shift, o.control)
            ctrl = o.control
          } else {
            if (mode !== 2) {
              mix[(s*chan)+ch] += data * vol
              if (osc === ossecs - 1) {
                mix[(s*chan)+ch] += data * vol
                mix[(s*chan)+ch] += data * vol
              }
            } else {
              if (!(osc & 1)) {
                mix[(s*chan)+ch] += data * vol
                if (osc === ossecs - 1) {
                  mix[(s*chan)+ch] += data * vol
                  mix[(s*chan)+ch] += data * vol
                }
              } else {
                if (osc < 31) {
                  if (!(this.oscillators[osc+1].control & 1)) {
                    this.oscillators[osc+1].vol = waveByte
                  }
                }
              }
            }
            acc = accHolder.v
            // MAME: wrap/halt when pre-increment position reaches end
            // (wtsizeMinus here is already o.wtsize - 1).
            if (altram >= wtsizeMinus) {
              this.haltOsc(osc, 0, accHolder, shift, o.control)
              ctrl = o.control
            }
            acc = accHolder.v
          }
          if (ctrl & 1) break
          o.data = waveByte
        }
        o.accumulator = acc
        o.control = ctrl & 0xff
      }
    }
    // mix -> buffer, ported from gssquared ensoniq.cpp: the oscillator sum is
    // averaged over the DAC slots (osce + 2), then the $C03C Q8 attenuator and
    // the fixed +36 dB makeup (64) are applied. The gain glides toward the
    // target on a 20 ms one-pole, so volume steps do not click/zip; volume 0 is
    // mute. The exact int64 product is safe as a JS number at these ranges.
    const slots = ossecs + 2
    const atten = DOC_SYS_ATTEN_Q8[sysVolume & 0x0f]
    const target = atten === 0 ? 0 : 256 / atten
    if (this.volGain < 0) this.volGain = target
    const dt = 1 / this.outputRate()
    const alpha = 1 - Math.exp(-dt / (DOC_VOL_SLEW_MS * 0.001))
    const denom = slots * 65536
    let g = this.volGain
    for (let s = 0; s < numFrames; s++) {
      g += alpha * (target - g)
      const volQ16 = Math.trunc(g * 65536)
      for (let c = 0; c < chan; c++) {
        let sample = Math.trunc((mix[s * chan + c] * volQ16 * DOC_MAKEUP) / denom)
        if (sample > 32767) sample = 32767
        if (sample < -32768) sample = -32768
        buffer[s * chan + c] = sample
      }
    }
    this.volGain = g

    this.mirrorMonoToStereo(buffer, numFrames, chan)
    if (buffer === out) {
      // The caller assembles per-refresh blocks from short chunks; recording
      // every 1-3 sample chunk in the block ring would push out real blocks.
      return buffer
    }
    this.recordBlock(numFrames)
    return buffer
  }

  // Block ring entry (?ensoniqdbg=1). Shared by the mixed and silence paths.
  private recordBlock(numFrames: number, mirrored?: boolean) {
    const mirrorBefore = this.mirrorCountAtGenStart
    this.mirrorCountAtGenStart = this.monoMirrorCount
    this.blocks.unshift({
      cyc: this.lastCyc, osce: this.osce, rate: this.outputRate(),
      frames: numFrames,
      mirrored: mirrored ?? (this.monoMirrorCount > mirrorBefore),
    })
    if (this.blocks.length > 12) this.blocks.pop()
  }

  // Ported from gssquared soundglu.cpp ensoniq_mirror_mono_to_stereo, logic
  // intact: Mono software usually parks every voice on one channel (often
  // 0 / right), so only one SDL side gets energy. If all non-halted enabled
  // oscillators share the same CA0, mirror that side onto both L and R.
  private mirrorMonoToStereo(buffer: Int16Array, numFrames: number, chan: number) {
    if (chan !== 2 || numFrames === 0) {
      return
    }
    const ossecs = Math.max(1, this.osce)
    let seen = 0
    let ca0 = 0
    for (let o = 0; o < ossecs; o++) {
      const osc = this.oscillators[o]
      if (osc.control & 1) {
        continue // halted
      }
      const oscCa0 = (osc.control >> 4) & 1
      if (seen === 0) {
        ca0 = oscCa0
        seen = 1
      } else if (oscCa0 !== ca0) {
        return // true stereo — leave L/R alone
      }
    }
    if (seen === 0) {
      return // silence
    }
    // Same flip as generateSamples: odd→L(0), even→R(1).
    const live = ca0 ^ 1
    for (let i = 0; i < numFrames; i++) {
      const s = buffer[i * 2 + live]
      buffer[i * 2 + 0] = s
      buffer[i * 2 + 1] = s
    }
    this.monoMirrorCount++
  }
}

export const iigsEnsoniq = new IigsEnsoniq()

export function ensoniqReset() {
  iigsEnsoniq.reset()
}

// How much a program actually talks to the chip. Cheap counters, always on (four
// integer increments), so a test or the worker can answer "did this program ever
// program the DOC?" instead of guessing from the silence.
export const docAccess = { control: 0, data: 0, addrLow: 0, addrHigh: 0, reads: 0, framesWithOsc: 0 }

export const resetDocAccess = () => {
  docAccess.control = 0
  docAccess.data = 0
  docAccess.addrLow = 0
  docAccess.addrHigh = 0
  docAccess.reads = 0
  docAccess.framesWithOsc = 0
}
