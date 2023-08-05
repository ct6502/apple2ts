// Algorithm from Kent Dickey (KFest discord, 7/27/2023):
// Keep track of the speaker clicks, let's say you do it in cycles.
// Let's assume you need to create 44.1KHz samples. You remember the cycle
// time of the last sample you've sent to be played (start at 0). Now time
// has passed and you need to generate N more samples. Convert the time of
// the speaker clicks in samples, using 1.020484M cycles per 44100 samples
// (so if the speaker clicked at cycle offset 201, that would be sample
// 8.68. You need to remember if the speaker was high or low, so let's
// assume it was high. Let's assume you have 5 speaker clicks:
// sample 8.1, 8.68, 8.8, and 30.5. Then the audio samples will be:
// [0..7]=HIGH; [8]=(.1+(8.8-8.68))HIGH, [9...29]=LOW, [30]=0.5HIGH, [31...N]=HIGH.
// You calculate the contribution of the time the speaker is high to be the
// multiplier of the high time. Any samples where the speaker didn't toggle
// just repeats the speaker low/high position. 

class Oscillator extends AudioWorkletProcessor {
  tick = new Array(16384 * 4).fill(0);
  len = this.tick.length
  playbackIndex = 0;
  // This minimum offset was picked so a BASIC program that just prints BELL
  // characters won't trigger the "new sound" delta down below.
  offset = 1524
  currIndex = this.offset;
  currSample = 0;
  sampling = 44100/1.020484e6;
  value = 1
  // doprint = 0
  constructor() {
    super();
    this.port.onmessage = (event) => {
      // if (this.doprint < 1000) {
      //   console.log(`onmessage ${this.currIndex}`)
      //   this.doprint++
      // }
      let newSample = event.data * this.sampling
      let delta = newSample - this.currSample
      this.currSample = newSample
      // If we got a large audio delta, assume this is the start of a new sound
      // and shift our starting index to just a few cycles downstream of the
      // current (44100Hz) index. That way the sound starts immediately instead
      // of looping around thru the entire tick array.
      if (delta > this.offset) {
        this.currIndex = (this.playbackIndex + this.offset) % this.len
      } else {
        let newIndex = this.currIndex + delta
        let i0 = Math.floor(this.currIndex) % this.len
        let i1 = Math.floor(newIndex) % this.len
        // Current and new cycle counts fall within the same 1/44100 sample.
        if (i1 === i0) {
          // Add the fractional contribution of just the delta.
          this.tick[i0] = this.tick[i0] + delta * this.value
        } else {
          // Add the fractional contribution of the first index.
          this.tick[i0] = this.tick[i0] + (1.0 - this.currIndex % 1) * this.value
          i0 = (i0 + 1) % this.len
          // All subsequent indices have a contribution of +/-1
          while (i0 !== i1) {
            this.tick[i0] = this.value
            i0 = (i0 + 1) % this.len
            if (i0 === this.playbackIndex) {
              // Hack: If we wrapped around and caught up to our current
              // playback position, just back up the playback. Produces a
              // slight playback hiccup but avoids catastrophic noise.
              this.playbackIndex = (this.playbackIndex + this.len - this.offset) % this.len
            }
          }
          // Last index includes the fractional contribution of the last index.
          this.tick[i1] = (newIndex % 1) * this.value
        }
        this.currIndex = newIndex % this.len
        // Flip the speaker in/out and vice versa
        this.value = -this.value
      }
    }
  }

  // Thru measurement, the time between calls is 2.902 ms = 128/44100
  process(inputs, outputs, parameters) {
    const channel = outputs[0][0];
    for (let i = 0; i < channel.length; i++) {
      channel[i] = 0.2 * this.tick[this.playbackIndex]
      this.tick[this.playbackIndex] = 0
      this.playbackIndex = (this.playbackIndex + 1) % this.len;
    }
    return true;
  }
}

registerProcessor('oscillator', Oscillator);
