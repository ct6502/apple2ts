let fifo = new Uint8Array(4096)
let fifo_wridx = 0
let fifo_rdidx = 0
let fifo_cnt = 0

let ctrl = 0
let rate = 0
let loop = false

const volume_lut = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 8, 11, 14, 18, 23, 30, 38, 49, 64])

let cur_l = 0, cur_r = 0
let phase = 0

const fifo_reset = () => {
	fifo_wridx = 0
	fifo_rdidx = 0
	fifo_cnt   = 0
}

const fifo_restart = () => {
	fifo_rdidx = 0
	fifo_cnt = fifo_wridx
}

export const pcm_reset = () => {
	fifo_reset()
	ctrl  = 0
	rate  = 0
	cur_l = 0
	cur_r = 0
	phase = 0
}

export const pcm_write_ctrl = (val: number) => {
	if ((val & 0xc0) == 0xc0) {
		loop = true
	} else {
		loop = false
		if (val & 0x80) {
			fifo_reset()
		}
	}
	if (val & 0x40) {
		fifo_restart()
	}
	ctrl = val & 0x3F
}

export const pcm_read_ctrl = () => {
	let result = ctrl
	if (fifo_cnt == 4095) { // sizeof(fifo) - 1
		result |= 0x80
	}
	if (fifo_cnt == 0) {
		result |= 0x40
	}
	return result
}

export const pcm_write_rate = (val: number) => {
	rate = (val > 128) ? (256 - val) : val
}

export const pcm_read_rate = () => {
	return rate
}

export const pcm_write_fifo = (val: number) => {
	if (fifo_cnt < 4095) {
		fifo[fifo_wridx++] = val
		if (fifo_wridx == 4096) {
			fifo_wridx = 0
		}
		fifo_cnt++
	}
}

const read_fifo = () => {
	let result = 0
	if (fifo_cnt == 0) {
		return 0
	}
	result = fifo[fifo_rdidx++]
	if (fifo_rdidx == 4096) {
		fifo_rdidx = 0
	}
	fifo_cnt--
	return result
}

export const pcm_is_fifo_almost_empty = () => {
	return fifo_cnt < 1024
}

export const pcm_render = (buf: Int16Array, num_samples: number) => {
	let buf_idx = 0
	while (num_samples--) {
		let old_phase = phase
		phase += rate
		phase &= 0xFF
		if ((old_phase & 0x80) != (phase & 0x80)) {
			if (fifo_cnt == 0) {
				cur_l = 0
				cur_r = 0
			} else {
				switch ((ctrl >> 4) & 3) {
					case 0: { // mono 8-bit
						cur_l = (read_fifo() << 8) << 16 >> 16
						cur_r = cur_l
						break
					}
					case 1: { // stereo 8-bit
						if (fifo_cnt < 2) {
							fifo_cnt = 0
							fifo_rdidx = fifo_wridx
						} else {
							cur_l = (read_fifo() << 8) << 16 >> 16
							cur_r = (read_fifo() << 8) << 16 >> 16
						}
						break
					}
					case 2: { // mono 16-bit
						if (fifo_cnt < 2) {
							fifo_cnt = 0
							fifo_rdidx = fifo_wridx
						} else {
							let l = read_fifo() | (read_fifo() << 8)
							cur_l = (l << 16) >> 16
							cur_r = cur_l
						}
						break
					}
					case 3: { // stereo 16-bit
						if (fifo_cnt < 4) {
							fifo_cnt = 0
							fifo_rdidx = fifo_wridx
						} else {
							let l = read_fifo() | (read_fifo() << 8)
							cur_l = (l << 16) >> 16
							let r = read_fifo() | (read_fifo() << 8)
							cur_r = (r << 16) >> 16
						}
						break
					}
				}
				if (loop && fifo_cnt == 0) {
					fifo_restart()
				}
			}
		}
		buf[buf_idx++] = Math.trunc(cur_l * volume_lut[ctrl & 0xF] / 64)
		buf[buf_idx++] = Math.trunc(cur_r * volume_lut[ctrl & 0xF] / 64)
	}
}
