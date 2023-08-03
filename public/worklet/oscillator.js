class Oscillator extends AudioWorkletProcessor {
  tick = new Array(16384 * 10).fill(0);
  playbackIndex = 0;
  currIndex = 1024;
  currSample = 0;
  sampling = 44100/1.020484e6;
  value = 1
  // doprint = 0
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let newSample = event.data * this.sampling
      let delta = newSample - this.currSample
      this.currSample = newSample
      // If we got a large audio delta, assume this is the start of a new sound
      // and shift our starting index to just a few cycles downstream of the
      // current (44100Hz) index. That way the sound starts immediately instead
      // of looping around thru the entire tick array.
      if (delta > 1024) {
        this.currIndex = (this.playbackIndex + 1024) % this.tick.length
      } else {
        let newIndex = this.currIndex + delta
        let i0 = Math.floor(this.currIndex) % this.tick.length
        let i1 = Math.floor(newIndex) % this.tick.length
        if (i1 === i0) {
          this.tick[i0] = this.tick[i0] + delta * this.value
        } else {
          this.tick[i0] = this.tick[i0] + (1.0 - this.currIndex % 1) * this.value
//          if (this.doprint < 100) console.log(`${this.currIndex} ${i0} ${this.tick[i0]}`)
          i0 = (i0 + 1) % this.tick.length
          while (i0 !== i1) {
            this.tick[i0] = this.value
            i0 = (i0 + 1) % this.tick.length
          }
          this.tick[i1] = (newIndex % 1) * this.value
        }
        this.currIndex = newIndex % this.tick.length
        // if (this.doprint < 100) {
        //   console.log(`${this.currIndex} ${i0} ${this.tick[i0]}`)
        //   console.log(`------------------------------`)
        // }
        // this.doprint++
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
      this.playbackIndex = (this.playbackIndex + 1) % this.tick.length;
    }
    return true;
  }
}

registerProcessor('oscillator', Oscillator);
