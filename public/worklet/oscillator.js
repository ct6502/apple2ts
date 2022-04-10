class Oscillator extends AudioWorkletProcessor {
  tick = new Array(128000);
  index = 0;
  newIndex = 0;
  prevCycle = 0;
  sampling = 44100/1.020484e6;
  value = 0.1
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let delta = Math.round((event.data - this.prevCycle)*this.sampling*4)/4
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
    for (let i = 0; i < channel.length; i++) {
      if (this.tick[this.index]) {
        this.tick[this.index] = 0
        this.value = -this.value
      }
      channel[i] = this.value
      this.index = (this.index + 1) % this.tick.length;
    }
    return true;
  }
}

registerProcessor('oscillator', Oscillator);
