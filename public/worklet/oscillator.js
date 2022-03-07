class Oscillator extends AudioWorkletProcessor {
  tick = new Array(12811);
  index = 0;
  newIndex = 0;
  prevCycle = 0;
  sampling = 44100/1.020484e6*1.02;
  value = 0.25
  constructor() {
    super();
    this.port.onmessage = (event) => {
      let delta = Math.trunc((event.data - this.prevCycle)*this.sampling)
      if (delta >= 12800) {
        delta = 0
      }
      this.newIndex = (this.newIndex + delta) % 12800
      this.tick[this.newIndex] = 1
      this.prevCycle = event.data
    };
  }

  process(inputs, outputs, parameters) {
    const channel = outputs[0][0];
    for (let i = 0; i < channel.length; i++) {
      channel[i] = this.value
      if (this.tick[this.index + i]) {
        this.tick[this.index + i] = 0
        this.value = -this.value
      }
    }
    this.index = (this.index + 128) % 12800;
    return true;
  }
}

registerProcessor('oscillator', Oscillator);
