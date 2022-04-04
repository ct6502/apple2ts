class Oscillator extends AudioWorkletProcessor {
  tick = new Array(20000);
  index = 0;
  newIndex = 0;
  prevCycle = 0;
  sampling = 44100/1.020484e6;
  value = 0.1
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let delta = Math.round((event.data - this.prevCycle)*this.sampling*4)/4
      if (delta < 1) {
        delta = 3
      }
//      console.log("6502 delay = " + (event.data - this.prevCycle) + " JS delay = " + delta)
      this.newIndex = (this.newIndex + delta) % this.tick.length
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
