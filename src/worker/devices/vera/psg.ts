// Commander X16 Emulator
// Copyright (c) 2019 Michael Steil
// Copyright (c) 2020 Frank van den Hoef
// Port to typescript and mods by Michael Morrison
// All rights reserved. License: 2-clause BSD

const WF_PULSE = 0
const WF_SAWTOOTH = 1
const WF_TRIANGLE = 2
const WF_NOISE = 3

class Channel {
	freq = 0
	volume = 0
	left = false
	right = false
	pw = 0
	waveform = 0
	noiseval = 0
	phase = 0
}

const channels: Channel[] = Array.from({ length: 16 }, () => new Channel())

const volume_lut = new Uint16Array([
	  0,                                           4,   8,  12,
	 16,  17,  18,  20,  21,  22,  23,  25,  26,  28,  30,  31,
	 33,  35,  37,  40,  42,  45,  47,  50,  53,  56,  60,  63,
	 67,  71,  75,  80,  85,  90,  95, 101, 107, 113, 120, 127,
	135, 143, 151, 160, 170, 180, 191, 202, 214, 227, 241, 255,
	270, 286, 303, 321, 341, 361, 382, 405, 429, 455, 482, 511
])

let noise_state = 1

export const psg_reset = () => {
    for (let i = 0; i < 16; i++) {
        channels[i] = new Channel()
    }
	noise_state = 1
}

export const psg_writereg = (reg: number, val: number) => {
	reg &= 0x3f

	const ch  = Math.floor(reg / 4)
	const idx = reg & 3

	switch (idx) {
		case 0: channels[ch].freq = (channels[ch].freq & 0xFF00) | val; break
		case 1: channels[ch].freq = (channels[ch].freq & 0x00FF) | (val << 8); break
		case 2: {
			channels[ch].right  = (val & 0x80) !== 0
			channels[ch].left   = (val & 0x40) !== 0
			channels[ch].volume = volume_lut[val & 0x3F]
			break
		}
		case 3: {
			channels[ch].pw       = val & 0x3F
			channels[ch].waveform = val >> 6
			break
		}
	}
}

const render = (out: {left: number, right: number}) => {
	let l = 0
	let r = 0

	for (let i = 0; i < 16; i++) {
		noise_state = (noise_state << 1) | (((noise_state >> 1) ^ (noise_state >> 2) ^ (noise_state >> 4) ^ (noise_state >> 15)) & 1)
        noise_state &= 0xFFFF // keep 16 bit

		const ch = channels[i]

		const new_phase = (ch.left || ch.right) ? ((ch.phase + ch.freq) & 0x1FFFF) : 0
		if ((ch.phase & 0x10000) && !(new_phase & 0x10000)) {
			ch.noiseval = (noise_state >> 1) & 0x3F
		}
		ch.phase = new_phase

		let v = 0
		switch (ch.waveform) {
			case WF_PULSE: v = ((ch.phase >> 10) > ch.pw) ? 0 : 0x3F; break
    		case WF_SAWTOOTH: v = (ch.phase >> 11) ^ ((ch.pw ^ 0x3f) & 0x3f); break
			case WF_TRIANGLE: v = ((ch.phase & 0x10000) ? (~(ch.phase >> 10) & 0x3F) : ((ch.phase >> 10) & 0x3F)) ^ ((ch.pw ^ 0x3f) & 0x3f); break		
			case WF_NOISE: v = ch.noiseval; break
		}
		let sv = (v ^ 0x20)
		if (sv & 0x20) {
			sv |= 0xFFC0
		}
        // sv is int16_t, so sign extend
        sv = (sv << 16) >> 16

		const val = sv * ch.volume // val is int32

		if (ch.left) {
			l += val >> 3
		}
		if (ch.right) {
			r += val >> 3
		}
	}

	out.left = (l << 16) >> 16
	out.right = (r << 16) >> 16
}

export const psg_render = (buf: Int16Array, num_samples: number) => {
    const out = {left: 0, right: 0}
    let buf_idx = 0
	while (num_samples--) {
		render(out)
		buf[buf_idx++] = out.left
        buf[buf_idx++] = out.right
	}
}
