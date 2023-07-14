class Oscillator extends AudioWorkletProcessor {
  tick = new Array(16384 * 4);
  index = 0;
  newIndex = 1024;
  prevCycle = 0;
  sampling = 44100/1.020484e6;
  value = 0.1
//  doprint = 1000
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let delta = Math.round((event.data - this.prevCycle)*this.sampling*4)/4
      // if (this.doprint > 0) {
      //   this.doprint--
      //   console.log(`${event.data - this.prevCycle}  ${(event.data - this.prevCycle)*this.sampling}  ${delta}`)
      // }
      // If we got a large audio delta, assume this is the start of a new sound
      // and shift our starting index to just a few cycles downstream of the
      // current (44100Hz) index. That way the sound starts immediately instead
      // of looping around thru the entire tick array.
      if (delta > 1024) {
        this.newIndex = (this.index + 1024) % this.tick.length
      } else {
        this.newIndex = (this.newIndex + delta) % this.tick.length
      }
      this.tick[Math.round(this.newIndex)] = 1
      this.prevCycle = event.data
    }
  }

  process(inputs, outputs, parameters) {
    const channel = outputs[0][0];
//    let factor = 1
    for (let i = 0; i < channel.length; i++) {
      if (this.tick[this.index]) {
        this.value = -this.value
//        factor = this.tick[this.index]
        this.tick[this.index] = 0
      }
      channel[i] = this.value
//      channel[i] = factor * this.value
//      factor = 1
      this.index = (this.index + 1) % this.tick.length;
    }
    return true;
  }
}

registerProcessor('oscillator', Oscillator);
