/* eslint-disable @typescript-eslint/ban-ts-comment */
// Commander X16 Emulator
// Copyright (c) 2019 Michael Steil
// Copyright (c) 2020 Frank van den Hoef
// Port to typescript and mods by Michael Morrison
// All rights reserved. License: 2-clause BSD

import { vera_spi_read, vera_spi_write } from "./sdcard"
  // @ts-ignore
import { psg_reset, psg_writereg } from "./psg"
  // @ts-ignore
import { pcm_reset, pcm_is_fifo_almost_empty, pcm_read_ctrl, pcm_read_rate, pcm_write_ctrl, pcm_write_rate, pcm_write_fifo, pcm_render } from "./pcm"
import { s6502 } from "../../instructions"
import { passVeraFramebuffer, passVeraPcmWrite, passVeraPsgWrite } from "../../worker2main"

const VERA_VERSION_MAJOR = 47
const VERA_VERSION_MINOR = 0
const VERA_VERSION_PATCH = 2
const ADDR_VRAM_START = 0x00000
const ADDR_VRAM_END = 0x20000
const ADDR_PSG_START = 0x1F9C0
const ADDR_PSG_END = 0x1FA00
const ADDR_PALETTE_START = 0x1FA00
const ADDR_PALETTE_END = 0x1FC00
const ADDR_SPRDATA_START = 0x1FC00
const ADDR_SPRDATA_END = 0x20000
const NUM_SPRITES = 128
// both VGA and NTSC
const SCAN_HEIGHT = 525
const PIXEL_FREQ = 25.0
// VGA
const VGA_SCAN_WIDTH = 800
const VGA_Y_OFFSET = 0
// NTSC: 262.5 lines per frame, lower field first
const NTSC_HALF_SCAN_WIDTH = 794
const NTSC_Y_OFFSET_LOW = 42
const NTSC_Y_OFFSET_HIGH = 568
const TITLE_SAFE_X = 0.067
const TITLE_SAFE_Y = 0.05
// visible area we're drawing
const SCREEN_WIDTH = 640
const SCREEN_HEIGHT = 480
const printf = console.log
const INT_MAX = Number.MAX_SAFE_INTEGER
const INT_MIN = Number.MIN_SAFE_INTEGER
const warp_mode: boolean = false
const log_video: boolean = false
const enable_midline: boolean = false
const opcode_addr: number = 0
// When rendering a layer line, we can amortize some of the cost by calculating multiple pixels at a time.
const MAX = (a: number, b: number) => ((a) > (b) ? a : b)

const MHZ: number = 1
const AUDIO_SAMPLERATE = 25000000 / 512
const PCM_RENDER_CHUNK = 1024
let audio_last_cycle = 0
let audio_sample_frac = 0
const audio_dummy_buf = new Int16Array(PCM_RENDER_CHUNK * 2)

const audio_render = () => {
	const cycle_delta = s6502.cycleCount - audio_last_cycle
	if (cycle_delta <= 0) {
		audio_last_cycle = s6502.cycleCount
		return
	}

	const samples_exact = audio_sample_frac + cycle_delta * AUDIO_SAMPLERATE / (MHZ * 1000000)
	let samples = Math.trunc(samples_exact)
	audio_sample_frac = samples_exact - samples
	audio_last_cycle = s6502.cycleCount

	while (samples > 0) {
		const len = Math.min(samples, PCM_RENDER_CHUNK)
		pcm_render(audio_dummy_buf, len)
		samples -= len
	}
}

const video_ram = new Uint8Array(0x20000)
const palette = new Uint8Array(256 * 2)
const sprite_data = new Array(NUM_SPRITES).fill(null).map(() => new Uint8Array(8))
// I/O registers
const io_addr = new Uint32Array(2)
const io_rddata = new Uint8Array(2)
const io_inc = new Uint8Array(2)
let io_addrsel: number = 0
let io_dcsel: number = 0
let ien: number = 0
let isr: number = 0
let irq_line: number = 0
const reg_layer = new Array(2).fill(null).map(() => new Uint8Array(7))
const COMPOSER_SLOTS = 4*64
const reg_composer = new Uint8Array(COMPOSER_SLOTS)
const prev_reg_composer = new Array(2).fill(null).map(() => new Uint8Array(COMPOSER_SLOTS))
const layer_line = new Array(2).fill(null).map(() => new Uint8Array(SCREEN_WIDTH))
const sprite_line_col = new Uint8Array(SCREEN_WIDTH)
const sprite_line_z = new Uint8Array(SCREEN_WIDTH)
const sprite_line_mask = new Uint8Array(SCREEN_WIDTH)
let sprite_line_collisions: number = 0
const layer_line_enable = new Uint8Array(2)
const old_layer_line_enable = new Uint8Array(2)
let old_sprite_line_enable: boolean = false
let sprite_line_enable: boolean = false
////////////////////////////////////////////////////////////
// FX registers
////////////////////////////////////////////////////////////
let fx_addr1_mode: number
// These are all 16.16 fixed point in the emulator
// even though the VERA uses smaller bit widths
// for the whole and fractional parts.
//
// Sign extension is done manually when assigning negative s: number
//
// Native VERA bit widths are shown below.
let fx_x_pixel_increment: number // 11.9 fixed point (6.9 without 32x multiplier, 11.4 with 32x multiplier on)
let fx_y_pixel_increment: number // 11.9 fixed point (6.9 without 32x multiplier, 11.4 with 32x multiplier on)
let fx_x_pixel_position: number // 11.9 fixed point
let fx_y_pixel_position: number // 11.9 fixed point

let fx_poly_fill_length: number // 10 bits

let fx_affine_tile_base: number
let fx_affine_map_base: number
let fx_affine_map_size: number
let fx_4bit_mode: boolean
let fx_16bit_hop: boolean
let fx_cache_byte_cycling: boolean
let fx_cache_fill: boolean
let fx_cache_write: boolean
let fx_trans_writes: boolean
let fx_2bit_poly: boolean
let fx_2bit_poking: boolean
let fx_cache_increment_mode: boolean
let fx_cache_nibble_index: boolean
let fx_cache_byte_index: number
let fx_multiplier: boolean
let fx_subtract: boolean
let fx_affine_clip: boolean
let fx_16bit_hop_align: number
const fx_nibble_bit = new Uint8Array(2)
const fx_nibble_incr = new Uint8Array(2)
const fx_cache = new Uint8Array(4)
let fx_mult_accumulator: number
const vera_version_string = new Uint8Array(["V".charCodeAt(0),
	VERA_VERSION_MAJOR,
	VERA_VERSION_MINOR,
	VERA_VERSION_PATCH
])
let vga_scan_pos_x: number = 0
let vga_scan_pos_y: number = 0
let ntsc_half_cnt: number = 0
let ntsc_scan_pos_y: number = 0
let frame_count: number = 0
const framebuffer = new Uint8ClampedArray(SCREEN_WIDTH * SCREEN_HEIGHT * 4)
const default_palette = new Uint16Array([
0x000,0xfff,0x800,0xafe,0xc4c,0x0c5,0x00a,0xee7,0xd85,0x640,0xf77,0x333,0x777,0xaf6,0x08f,0xbbb,0x000,0x111,0x222,0x333,0x444,0x555,0x666,0x777,0x888,0x999,0xaaa,0xbbb,0xccc,0xddd,0xeee,0xfff,0x211,0x433,0x644,0x866,0xa88,0xc99,0xfbb,0x211,0x422,0x633,0x844,0xa55,0xc66,0xf77,0x200,0x411,0x611,0x822,0xa22,0xc33,0xf33,0x200,0x400,0x600,0x800,0xa00,0xc00,0xf00,0x221,0x443,0x664,0x886,0xaa8,0xcc9,0xfeb,0x211,0x432,0x653,0x874,0xa95,0xcb6,0xfd7,0x210,0x431,0x651,0x862,0xa82,0xca3,0xfc3,0x210,0x430,0x640,0x860,0xa80,0xc90,0xfb0,0x121,0x343,0x564,0x786,0x9a8,0xbc9,0xdfb,0x121,0x342,0x463,0x684,0x8a5,0x9c6,0xbf7,0x120,0x241,0x461,0x582,0x6a2,0x8c3,0x9f3,0x120,0x240,0x360,0x480,0x5a0,0x6c0,0x7f0,0x121,0x343,0x465,0x686,0x8a8,0x9ca,0xbfc,0x121,0x242,0x364,0x485,0x5a6,0x6c8,0x7f9,0x020,0x141,0x162,0x283,0x2a4,0x3c5,0x3f6,0x020,0x041,0x061,0x082,0x0a2,0x0c3,0x0f3,0x122,0x344,0x466,0x688,0x8aa,0x9cc,0xbff,0x122,0x244,0x366,0x488,0x5aa,0x6cc,0x7ff,0x022,0x144,0x166,0x288,0x2aa,0x3cc,0x3ff,0x022,0x044,0x066,0x088,0x0aa,0x0cc,0x0ff,0x112,0x334,0x456,0x668,0x88a,0x9ac,0xbcf,0x112,0x224,0x346,0x458,0x56a,0x68c,0x79f,0x002,0x114,0x126,0x238,0x24a,0x35c,0x36f,0x002,0x014,0x016,0x028,0x02a,0x03c,0x03f,0x112,0x334,0x546,0x768,0x98a,0xb9c,0xdbf,0x112,0x324,0x436,0x648,0x85a,0x96c,0xb7f,0x102,0x214,0x416,0x528,0x62a,0x83c,0x93f,0x102,0x204,0x306,0x408,0x50a,0x60c,0x70f,0x212,0x434,0x646,0x868,0xa8a,0xc9c,0xfbe,0x211,0x423,0x635,0x847,0xa59,0xc6b,0xf7d,0x201,0x413,0x615,0x826,0xa28,0xc3a,0xf3c,0x201,0x403,0x604,0x806,0xa08,0xc09,0xf0b
])

export const video_reset = (): void => {
	console.log("[VERA] video_reset")
	// init I/O registers
	io_addr.fill(0)
	io_inc.fill(0)
	io_addrsel = 0
	io_dcsel = 0
	io_rddata.fill(0)
	ien = 0
	isr = 0
	irq_line = 0
	// init Layer registers
	reg_layer.forEach(arr => arr.fill(0))
	// init composer registers
	reg_composer.fill(0)
	reg_composer[1] = 128 // hscale = 1.0
	reg_composer[2] = 128 // vscale = 1.0
	reg_composer[5] = 640 >> 2
	reg_composer[7] = 480 >> 1
	// Initialize FX registers
	fx_addr1_mode = 0
	fx_x_pixel_position = 0x8000
	fx_y_pixel_position = 0x8000
	fx_x_pixel_increment = 0
	fx_y_pixel_increment = 0
	fx_cache_write = false
	fx_cache_fill = false
	fx_4bit_mode = false
	fx_16bit_hop = false
	fx_subtract = false
	fx_cache_byte_cycling = false
	fx_trans_writes = false
	fx_multiplier = false
	fx_mult_accumulator = 0
	fx_2bit_poly = false
	fx_2bit_poking = false
  // @ts-ignore
	fx_cache_nibble_index = 0
	fx_cache_byte_index = 0
  // @ts-ignore
	fx_cache_increment_mode = 0
	fx_cache[0] = 0
	fx_cache[1] = 0
	fx_cache[2] = 0
	fx_cache[3] = 0
	fx_16bit_hop_align = 0
	fx_nibble_bit[0] = 0
	fx_nibble_bit[1] = 0
	fx_nibble_incr[0] = 0
	fx_nibble_incr[1] = 0
	fx_poly_fill_length = 0
	fx_affine_tile_base = 0
	fx_affine_map_base = 0
	fx_affine_map_size = 2
	fx_affine_clip = false
	// init sprite data
	sprite_data.forEach(arr => arr.fill(0))
	// copy palette
	for (let i: number = 0; i < 256; i++) {
		palette[i * 2 + 0] = default_palette[i] & 0xff
		palette[i * 2 + 1] = default_palette[i] >> 8
	}

	refresh_palette()
	// fill video RAM with random data
	for (let i: number = 0; i < 128 * 1024; i++) {
		video_ram[i] = Math.floor(Math.random() * 256)
	}

	sprite_line_collisions = 0
	vga_scan_pos_x = 0
	vga_scan_pos_y = 0
	ntsc_half_cnt = 0
	ntsc_scan_pos_y = 0
	psg_reset()
	pcm_reset()
	audio_last_cycle = s6502.cycleCount
	audio_sample_frac = 0
}

export const video_init = (): boolean => {
	video_reset()
	return true
}

interface video_layer_properties {
	color_depth: number
	map_base: number
	tile_base: number
	text_mode: boolean
	text_mode_256c: boolean
	tile_mode: boolean
	bitmap_mode: boolean
	hscroll: number
	vscroll: number
	mapw_log2: number
	maph_log2: number
	tilew: number
	tileh: number
	tilew_log2: number
	tileh_log2: number
	mapw_max: number
	maph_max: number
	tilew_max: number
	tileh_max: number
	layerw_max: number
	layerh_max: number
	tile_size_log2: number
	min_eff_x: number
	max_eff_x: number
	bits_per_pixel: number
	first_color_pos: number
	color_mask: number
	color_fields_max: number
}

const NUM_LAYERS = 2
const layer_properties: video_layer_properties[] = new Array(NUM_LAYERS).fill(null).map(() => ({} as video_layer_properties))
const prev_layer_properties: video_layer_properties[][] = new Array(2).fill(null).map(() => new Array(NUM_LAYERS).fill(null).map(() => ({} as video_layer_properties)))
const calc_layer_eff_x = (props: video_layer_properties, x: number): number => {
	return (x + props.hscroll) & (props.layerw_max)
}

const calc_layer_eff_y = (props: video_layer_properties, y: number): number => {
	return (y + props.vscroll) & (props.layerh_max)
}

const calc_layer_map_addr_base2 = (props: video_layer_properties, eff_x: number, eff_y: number): number => {
	// Slightly faster on some platforms because we know that tilew and tileh are powers of 2.
	return props.map_base + ((((eff_y >> props.tileh_log2) << props.mapw_log2) + (eff_x >> props.tilew_log2)) << 1)
}

//TODO: Unused in all current cases. Delete? Or leave commented as a reminder?
//let number
//calc_layer_map_addr(props: video_layer_properties, eff_x: number, eff_y: number)
//{
//	return props.map_base + ((eff_y / props.tileh) * props.mapw + (eff_x / props.tilew)) * 2
//}
const refresh_layer_properties = (layer: number): void => {
	const props: video_layer_properties = layer_properties[layer]
	const prev_layerw_max: number = props.layerw_max
	const prev_hscroll: number = props.hscroll
	props.color_depth    = reg_layer[layer][0] & 0x3
	props.map_base       = reg_layer[layer][1] << 9
	props.tile_base      = (reg_layer[layer][2] & 0xFC) << 9
	props.bitmap_mode    = (reg_layer[layer][0] & 0x4) != 0
	props.text_mode      = (props.color_depth == 0) && !props.bitmap_mode
	props.text_mode_256c = (reg_layer[layer][0] & 8) != 0
	props.tile_mode      = !props.bitmap_mode && !props.text_mode
	if (!props.bitmap_mode) {
		props.hscroll = reg_layer[layer][3] | (reg_layer[layer][4] & 0xf) << 8
		props.vscroll = reg_layer[layer][5] | (reg_layer[layer][6] & 0xf) << 8
	} else {
		props.hscroll = 0
		props.vscroll = 0
	}

	let mapw: number = 0
	let maph: number = 0
	props.tilew = 0
	props.tileh = 0
	if (props.tile_mode || props.text_mode) {
		props.mapw_log2 = 5 + ((reg_layer[layer][0] >> 4) & 3)
		props.maph_log2 = 5 + ((reg_layer[layer][0] >> 6) & 3)
		mapw      = 1 << props.mapw_log2
		maph      = 1 << props.maph_log2
		// Scale the tiles or text characters according to TILEW and TILEH.
		props.tilew_log2 = 3 + (reg_layer[layer][2] & 1)
		props.tileh_log2 = 3 + ((reg_layer[layer][2] >> 1) & 1)
		props.tilew      = 1 << props.tilew_log2
		props.tileh      = 1 << props.tileh_log2
	} else if (props.bitmap_mode) {
		// bitmap mode is basically tiled mode with a single huge tile
		props.tilew = (reg_layer[layer][2] & 1) ? 640 : 320
		props.tileh = SCREEN_HEIGHT
	}

	// We know mapw, maph, tilew, and tileh are powers of two in all cases except bitmap modes, and any products of that set will be powers of two,
	// so there's no need to modulo against them if we have bitmasks we can bitwise-and against.

	props.mapw_max = mapw - 1
	props.maph_max = maph - 1
	props.tilew_max = props.tilew - 1
	props.tileh_max = props.tileh - 1
	props.layerw_max = (mapw * props.tilew) - 1
	props.layerh_max = (maph * props.tileh) - 1
	// Find min/max eff_x for bulk reading in tile data during draw.
	if (prev_layerw_max != props.layerw_max || prev_hscroll != props.hscroll) {
		let min_eff_x: number = INT_MAX
		let max_eff_x: number = INT_MIN
		for (let x: number = 0; x < SCREEN_WIDTH; ++x) {
			const eff_x: number = calc_layer_eff_x(props, x)
			if (eff_x < min_eff_x) {
				min_eff_x = eff_x
			}
			if (eff_x > max_eff_x) {
				max_eff_x = eff_x
			}
		}
		props.min_eff_x = min_eff_x
		props.max_eff_x = max_eff_x
	}

	props.bits_per_pixel = 1 << props.color_depth
	props.tile_size_log2 = props.tilew_log2 + props.tileh_log2 + props.color_depth - 3
	props.first_color_pos  = 8 - props.bits_per_pixel
	props.color_mask       = (1 << props.bits_per_pixel) - 1
	props.color_fields_max = (8 >> props.color_depth) - 1
}

interface video_sprite_properties {
	sprite_zdepth: number
	sprite_collision_mask: number
	sprite_x: number
	sprite_y: number
	sprite_width_log2: number
	sprite_height_log2: number
	sprite_width: number
	sprite_height: number
	hflip: boolean
	vflip: boolean
	color_mode: number
	sprite_address: number
	palette_offset: number
}
const sprite_properties: video_sprite_properties[] = new Array(128).fill(null).map(() => ({} as video_sprite_properties))
const refresh_sprite_properties = (sprite: number): void => {
	const props: video_sprite_properties = sprite_properties[sprite]
	props.sprite_zdepth = (sprite_data[sprite][6] >> 2) & 3
	props.sprite_collision_mask = sprite_data[sprite][6] & 0xf0
	props.sprite_x = sprite_data[sprite][2] | (sprite_data[sprite][3] & 3) << 8
	props.sprite_y = sprite_data[sprite][4] | (sprite_data[sprite][5] & 3) << 8
	props.sprite_width_log2  = (((sprite_data[sprite][7] >> 4) & 3) + 3)
	props.sprite_height_log2 = ((sprite_data[sprite][7] >> 6) + 3)
	props.sprite_width       = 1 << props.sprite_width_log2
	props.sprite_height      = 1 << props.sprite_height_log2
	// fix up negative coordinates
	if (props.sprite_x >= 0x400 - props.sprite_width) {
		props.sprite_x -= 0x400
	}
	if (props.sprite_y >= 0x400 - props.sprite_height) {
		props.sprite_y -= 0x400
	}

  // @ts-ignore
	props.hflip = sprite_data[sprite][6] & 1
  // @ts-ignore
	props.vflip = (sprite_data[sprite][6] >> 1) & 1
	props.color_mode     = (sprite_data[sprite][1] >> 7) & 1
	props.sprite_address = sprite_data[sprite][0] << 5 | (sprite_data[sprite][1] & 0xf) << 13
	props.palette_offset = (sprite_data[sprite][7] & 0x0f) << 4
}

interface video_palette {
	entries: Uint32Array
	dirty: boolean
}
const video_palette: video_palette = { entries: new Uint32Array(256), dirty: false }
const refresh_palette = (): void => {
	const out_mode: number = reg_composer[0] & 3
	const chroma_disable: boolean = ((reg_composer[0] & 0x07) == 6)
	for (let i: number = 0; i < 256; ++i) {
		let r: number = 0
		let g: number = 0
		let b: number = 0
		if (out_mode == 0) {
			// video generation off
			// . show blue screen
			r = 0
			g = 0
			b = 255
		} else {
			const entry: number = palette[i * 2] | palette[i * 2 + 1] << 8
			r = ((entry >> 8) & 0xf) << 4 | ((entry >> 8) & 0xf)
			g = ((entry >> 4) & 0xf) << 4 | ((entry >> 4) & 0xf)
			b = (entry & 0xf) << 4 | (entry & 0xf)
			if (chroma_disable) {
				r = g = b = (r + b + g) / 3
			}
		}

		video_palette.entries[i] = Number(r << 16) | (Number(g) << 8) | (Number(b))
	}
	video_palette.dirty = false
}

const expand_4bpp_data = (dst: Uint8Array, src_addr: number, dst_size: number): void => {
	let dst_idx = 0
	let src_idx = src_addr
	while (dst_size >= 2) {
		const val = video_ram[src_idx++]
		dst[dst_idx++] = val >> 4
		dst[dst_idx++] = val & 0xf
		dst_size -= 2
	}
}

const render_sprite_line = (y: number): void => {
	memset(sprite_line_col, 0, SCREEN_WIDTH)
	memset(sprite_line_z, 0, SCREEN_WIDTH)
	memset(sprite_line_mask, 0, SCREEN_WIDTH)
	let sprite_budget: number = 800 + 1
	for (let i: number = 0; i < NUM_SPRITES; i++) {
		// one clock per lookup
		sprite_budget--; if (sprite_budget == 0) break
		const props: video_sprite_properties = sprite_properties[i]
		if (props.sprite_zdepth == 0) {
			continue
		}

		// check whether this line falls within the sprite
		if (y < props.sprite_y || y >= props.sprite_y + props.sprite_height) {
			continue
		}

		const eff_sy: number = props.vflip ? ((props.sprite_height - 1) - (y - props.sprite_y)) : (y - props.sprite_y)
		let eff_sx: number = (props.hflip ? (props.sprite_width - 1) : 0)
		const eff_sx_incr: number = props.hflip ? -1 : 1
		const bitmap_data: number = props.sprite_address + (eff_sy << (props.sprite_width_log2 - (1 - props.color_mode)))
		const unpacked_sprite_line = new Uint8Array(64)
		const width: number = (props.sprite_width<64? props.sprite_width : 64)
		const vram_fetch_mask: number = ((2 - props.color_mode) << 2) - 1
		if (props.color_mode == 0) {
			// 4bpp
			expand_4bpp_data(unpacked_sprite_line, bitmap_data, width)
		} else {
			// 8bpp
			for (let i = 0; i < width; i++) unpacked_sprite_line[i] = video_ram[bitmap_data + i]
		}

		for (let sx: number = 0; sx < props.sprite_width; ++sx) {
			const line_x: number = props.sprite_x + sx
			if (line_x >= SCREEN_WIDTH) {
				eff_sx += eff_sx_incr
				continue
			}

			// one clock per fetched 32 bits
			if (!(sx & vram_fetch_mask)) {
				sprite_budget--; if (sprite_budget == 0) break
			}

			// one clock per rendered pixel
			sprite_budget--; if (sprite_budget == 0) break
			let col_index: number = unpacked_sprite_line[eff_sx]
			eff_sx += eff_sx_incr
			// palette offset
			if (col_index > 0) {
				sprite_line_collisions |= sprite_line_mask[line_x] & props.sprite_collision_mask
				sprite_line_mask[line_x] |= props.sprite_collision_mask
				if (props.sprite_zdepth > sprite_line_z[line_x]) {
					if (col_index < 16) {
						col_index += props.palette_offset
					}
					sprite_line_col[line_x] = col_index
					sprite_line_z[line_x] = props.sprite_zdepth
				}
			}
		}
	}
}

const render_layer_line_text = (layer: number, y: number): void => {
	const props: video_layer_properties = prev_layer_properties[1][layer]
	const props0: video_layer_properties = prev_layer_properties[0][layer]
	const max_pixels_per_byte: number = (8 >> props.color_depth) - 1
	const eff_y: number = calc_layer_eff_y(props0, y)
	const yy: number = eff_y & props.tileh_max
	// additional bytes to reach the correct line of the tile
	const y_add: number = (yy << props.tilew_log2) >> 3
	const map_addr_begin: number = calc_layer_map_addr_base2(props, props.min_eff_x, eff_y)
	const map_addr_end: number = calc_layer_map_addr_base2(props, props.max_eff_x, eff_y)
	const size: number = (map_addr_end - map_addr_begin) + 2
	const tile_bytes = new Uint8Array(512) // max 256 tiles, 2 bytes each.
  // @ts-ignore
	video_space_read_range(tile_bytes, map_addr_begin, size)
	let tile_start: number = 0
	let fg_color: number = 0
	let bg_color: number = 0
	let s: number = 0
	let color_shift: number = 0
	{
		const eff_x: number = calc_layer_eff_x(props, 0)
		const xx: number = eff_x & props.tilew_max
		// extract all information from the map
		const map_addr: number = calc_layer_map_addr_base2(props, eff_x, eff_y) - map_addr_begin
		const tile_index: number = tile_bytes[map_addr]
		const byte1: number = tile_bytes[map_addr + 1]
		if (!props.text_mode_256c) {
			fg_color = byte1 & 15
			bg_color = byte1 >> 4
		} else {
			fg_color = byte1
			bg_color = 0
		}

		// offset within tilemap of the current tile
		tile_start = tile_index << props.tile_size_log2
		// additional bytes to reach the correct column of the tile
		const x_add: number = xx >> 3
		const tile_offset: number = tile_start + y_add + x_add
		s           = video_space_read(props.tile_base + tile_offset)
		color_shift = max_pixels_per_byte - (xx & 0x7)
	}

	// Render tile line.
	for (let x: number = 0; x < SCREEN_WIDTH; x++) {
		// Scrolling
		const eff_x: number = calc_layer_eff_x(props, x)
		const xx: number = eff_x & props.tilew_max
		if ((eff_x & 0x7) == 0) {
			if ((eff_x & props.tilew_max) == 0) {
				// extract all information from the map
				const map_addr: number = calc_layer_map_addr_base2(props, eff_x, eff_y) - map_addr_begin
				const tile_index: number = tile_bytes[map_addr]
				const byte1: number = tile_bytes[map_addr + 1]
				if (!props.text_mode_256c) {
					fg_color = byte1 & 15
					bg_color = byte1 >> 4
				} else {
					fg_color = byte1
					bg_color = 0
				}

				// offset within tilemap of the current tile
				tile_start = tile_index << props.tile_size_log2
			}

			// additional bytes to reach the correct column of the tile
			const x_add: number = xx >> 3
			const tile_offset: number = tile_start + y_add + x_add
			s           = video_space_read(props.tile_base + tile_offset)
			color_shift = max_pixels_per_byte
		}

		// convert tile byte to indexed color
		const col_index: number = (s >> color_shift) & 1
		--color_shift
		layer_line[layer][x] = col_index ? fg_color : bg_color
	}
}

const render_layer_line_tile = (layer: number, y: number): void => {
	const props: video_layer_properties = prev_layer_properties[1][layer]
	const props0: video_layer_properties = prev_layer_properties[0][layer]
	const max_pixels_per_byte: number = (8 >> props.color_depth) - 1
	const eff_y: number = calc_layer_eff_y(props0, y)
	const yy: number = eff_y & props.tileh_max
	const yy_flip: number = yy ^ props.tileh_max
	const y_add: number = (yy << ((props.tilew_log2 + props.color_depth - 3) & 31))
	const y_add_flip: number = (yy_flip << ((props.tilew_log2 + props.color_depth - 3) & 31))
	const map_addr_begin: number = calc_layer_map_addr_base2(props, props.min_eff_x, eff_y)
	const map_addr_end: number = calc_layer_map_addr_base2(props, props.max_eff_x, eff_y)
	const size: number = (map_addr_end - map_addr_begin) + 2
	const tile_bytes = new Uint8Array(512) // max 256 tiles, 2 bytes each.
  // @ts-ignore
	video_space_read_range(tile_bytes, map_addr_begin, size)
	let palette_offset: number = 0
	let vflip: boolean = false
	let hflip: boolean = false
	let tile_start: number = 0
	let s: number = 0
	let color_shift: number = 0
	let color_shift_incr: number = 0
	{
		const eff_x: number = calc_layer_eff_x(props, 0)
		// extract all information from the map
		const map_addr: number = calc_layer_map_addr_base2(props, eff_x, eff_y) - map_addr_begin
		const byte0: number = tile_bytes[map_addr]
		const byte1: number = tile_bytes[map_addr + 1]
		// Tile Flipping
  // @ts-ignore
		vflip = (byte1 >> 3) & 1
  // @ts-ignore
		hflip = (byte1 >> 2) & 1
		palette_offset = byte1 & 0xf0
		// offset within tilemap of the current tile
		const tile_index: number = byte0 | ((byte1 & 3) << 8)
		tile_start                = tile_index << props.tile_size_log2
		color_shift_incr = hflip ? props.bits_per_pixel : -props.bits_per_pixel
		let xx: number = eff_x & props.tilew_max
		if (hflip) {
			xx          = xx ^ (props.tilew_max)
			color_shift = 0
		} else {
			color_shift = props.first_color_pos
		}

		// additional bytes to reach the correct column of the tile
		const x_add: number = (xx << props.color_depth) >> 3
		const tile_offset: number = tile_start + (vflip ? y_add_flip : y_add) + x_add
		s = video_space_read(props.tile_base + tile_offset)
	}


	// Render tile line.
	for (let x: number = 0; x < SCREEN_WIDTH; x++) {
		const eff_x: number = calc_layer_eff_x(props, x)
		if ((eff_x & max_pixels_per_byte) == 0) {
			if ((eff_x & props.tilew_max) == 0) {
				// extract all information from the map
				const map_addr: number = calc_layer_map_addr_base2(props, eff_x, eff_y) - map_addr_begin
				const byte0: number = tile_bytes[map_addr]
				const byte1: number = tile_bytes[map_addr + 1]
				// Tile Flipping
  // @ts-ignore
				vflip = (byte1 >> 3) & 1
  // @ts-ignore
				hflip = (byte1 >> 2) & 1
				palette_offset = byte1 & 0xf0
				// offset within tilemap of the current tile
				const tile_index: number = byte0 | ((byte1 & 3) << 8)
				tile_start                = tile_index << props.tile_size_log2
				color_shift_incr = hflip ? props.bits_per_pixel : -props.bits_per_pixel
			}

			let xx: number = eff_x & props.tilew_max
			if (hflip) {
				xx = xx ^ (props.tilew_max)
				color_shift = 0
			} else {
				color_shift = props.first_color_pos
			}

			// additional bytes to reach the correct column of the tile
			const x_add: number = (xx << props.color_depth) >> 3
			const tile_offset: number = tile_start + (vflip ? y_add_flip : y_add) + x_add
			s = video_space_read(props.tile_base + tile_offset)
		}

		// convert tile byte to indexed color
		let col_index: number = (s >> color_shift) & props.color_mask
		color_shift += color_shift_incr
		// Apply Palette Offset
		if (col_index > 0 && col_index < 16) {
			col_index += palette_offset
			if (props.text_mode_256c) {
				col_index |= 0x80
			}
		}
		layer_line[layer][x] = col_index
	}
}


const render_layer_line_bitmap = (layer: number, y: number): void => {
	const props: video_layer_properties = prev_layer_properties[1][layer]
//	let props0: video_layer_properties = prev_layer_properties[0][layer]
	const yy: number = y % props.tileh
	// additional bytes to reach the correct line of the tile
	const y_add: number = (yy * props.tilew * props.bits_per_pixel) >> 3
	// Render tile line.
	for (let x: number = 0; x < SCREEN_WIDTH; x++) {
		const xx: number = x % props.tilew
		// extract all information from the map
		const palette_offset: number = reg_layer[layer][4] & 0xf
		// additional bytes to reach the correct column of the tile
		const x_add: number = (xx * props.bits_per_pixel) >> 3
		const tile_offset: number = y_add + x_add
		const s: number = video_space_read(props.tile_base + tile_offset)
		// convert tile byte to indexed color
		let col_index: number = (s >> (props.first_color_pos - ((xx & props.color_fields_max) << props.color_depth))) & props.color_mask
		// Apply Palette Offset
		if (col_index > 0 && col_index < 16) {
			col_index += palette_offset << 4
			if (props.text_mode_256c) {
				col_index |= 0x80
			}
		}
		layer_line[layer][x] = col_index
	}
}

const calculate_line_col_index = (spr_zindex: number, spr_col_index: number, l1_col_index: number, l2_col_index: number): number => {
	let col_index: number = 0
	switch (spr_zindex) {
		case 3:
			col_index = spr_col_index ? spr_col_index : (l2_col_index ? l2_col_index : l1_col_index)
			break
		case 2:
			col_index = l2_col_index ? l2_col_index : (spr_col_index ? spr_col_index : l1_col_index)
			break
		case 1:
			col_index = l2_col_index ? l2_col_index : (l1_col_index ? l1_col_index : spr_col_index)
			break
		case 0:
			col_index = l2_col_index ? l2_col_index : l1_col_index
			break
	}
	return col_index
}

let y_prev: number = -1
let s_pos_x_p: number = 0
let eff_y_fp: number = 0
let eff_x_fp: number = 0

const render_line = (y: number, scan_pos_x: number): void => {

	const col_line = new Uint8Array(SCREEN_WIDTH)
	const dc_video: number = reg_composer[0]
	const vstart: number = reg_composer[6] << 1
	const vstop: number = reg_composer[7] << 1
  // @ts-ignore
	if (y != y_prev) {
		y_prev = y
		s_pos_x_p = 0
		// Copy the composer array to 2-line history buffer
		// so that the raster effects that happen on a delay take effect
		// at exactly the right time

		// This simulates different effects happening at render,
		// render but delayed until the next line, or applied mid-line
		// at scan-out

		memcpy(prev_reg_composer[1], prev_reg_composer[0], 1 * COMPOSER_SLOTS)
		memcpy(prev_reg_composer[0], reg_composer, 1 * COMPOSER_SLOTS)
		// Same with the layer properties

		memcpy(prev_layer_properties[1], prev_layer_properties[0], 1 * NUM_LAYERS)
		memcpy(prev_layer_properties[0], layer_properties, 1 * NUM_LAYERS)
		if ((dc_video & 3) > 1) { // 480i or 240p
			if ((y >> 1) == 0) {
				eff_y_fp = y*(prev_reg_composer[1][2] << 9)
			} else if ( ((y & 0xfffe) >= vstart) && ((y & 0xfffe) < vstop) ) {
  // @ts-ignore
				eff_y_fp += (prev_reg_composer[1][2] << 10)
			}
		} else {
			if (y == 0) {
				eff_y_fp = 0
			} else if ( (y >= vstart) && (y < vstop) ) {
  // @ts-ignore
				eff_y_fp += (prev_reg_composer[1][2] << 9)
			}
		}
	}

	if ((dc_video & 8) && (dc_video & 3) > 1) { // progressive NTSC/RGB mode
		y &= 0xfffe
	}

	// refresh palette for next entry
	if (video_palette.dirty) {
		refresh_palette()
	}

	if (y >= SCREEN_HEIGHT) {
		return
	}

	let s_pos_x: number = Math.round(scan_pos_x)
	if (s_pos_x > SCREEN_WIDTH) {
		s_pos_x = SCREEN_WIDTH
	}

  // @ts-ignore
	if (s_pos_x_p == 0) {
		eff_x_fp = 0
	}

	const out_mode: number = reg_composer[0] & 3
	const border_color: number = reg_composer[3]
	let hstart: number = reg_composer[4] << 2
	let hstop: number = reg_composer[5] << 2
  // @ts-ignore
	let eff_y: number = (eff_y_fp >> 16)
	if (eff_y >= 480) eff_y = 480 - (y & 1)
	layer_line_enable[0] = (dc_video & 0x10) ? 1 : 0
	layer_line_enable[1] = (dc_video & 0x20) ? 1 : 0
	sprite_line_enable = !!(dc_video & 0x40)
	// clear layer_line if layer gets disabled
	for (let layer: number = 0; layer < 2; layer++) {
		if (!layer_line_enable[layer] && old_layer_line_enable[layer]) {
  // @ts-ignore
			for (let i: number = s_pos_x_p; i < SCREEN_WIDTH; i++) {
				layer_line[layer][i] = 0
			}
		}
  // @ts-ignore
		if (s_pos_x_p == 0)
			old_layer_line_enable[layer] = layer_line_enable[layer]
	}

	// clear sprite_line if sprites get disabled
	if (!sprite_line_enable && old_sprite_line_enable) {
  // @ts-ignore
		for (let i: number = s_pos_x_p; i < SCREEN_WIDTH; i++) {
			sprite_line_col[i] = 0
			sprite_line_z[i] = 0
			sprite_line_mask[i] = 0
		}
	}

  // @ts-ignore
	if (s_pos_x_p == 0)
		old_sprite_line_enable = sprite_line_enable
	if (sprite_line_enable) {
		render_sprite_line(eff_y)
	}

	if (warp_mode && (frame_count & 63)) {
		// sprites were needed for the collision IRQ, but we can skip
		// everything else if we're in warp mode, most of the time
		return
	}

	if (layer_line_enable[0]) {
		if (prev_layer_properties[1][0].text_mode) {
			render_layer_line_text(0, eff_y)
		} else if (prev_layer_properties[1][0].bitmap_mode) {
			render_layer_line_bitmap(0, eff_y)
		} else {
			render_layer_line_tile(0, eff_y)
		}
	}
	if (layer_line_enable[1]) {
		if (prev_layer_properties[1][1].text_mode) {
			render_layer_line_text(1, eff_y)
		} else if (prev_layer_properties[1][1].bitmap_mode) {
			render_layer_line_bitmap(1, eff_y)
		} else {
			render_layer_line_tile(1, eff_y)
		}
	}

	// If video output is enabled, calculate color indices for line.
	if (out_mode != 0) {
		// Add border after if required.
		if (y < vstart || y >= vstop) {
			let border_fill: number = border_color
			border_fill = border_fill | (border_fill << 8)
			border_fill = border_fill | (border_fill << 16)
			memset(col_line, border_fill, SCREEN_WIDTH)
		} else {
			hstart = hstart < 640 ? hstart : 640
			hstop = hstop < 640 ? hstop : 640
  // @ts-ignore
			for (let x: number = s_pos_x_p; x < hstart && x < s_pos_x; ++x) {
				col_line[x] = border_color
			}

			const scale: number = reg_composer[1]
  // @ts-ignore
			for (let x: number = MAX(hstart, s_pos_x_p); x < hstop && x < s_pos_x; ++x) {
  // @ts-ignore
				const eff_x: number = eff_x_fp >> 16
				col_line[x] = (eff_x < SCREEN_WIDTH) ? calculate_line_col_index(sprite_line_z[eff_x], sprite_line_col[eff_x], layer_line[0][eff_x], layer_line[1][eff_x]) : 0
  // @ts-ignore
				eff_x_fp += (scale << 9)
			}
			for (let x: number = hstop; x < s_pos_x; ++x) {
				col_line[x] = border_color
			}
		}
	}

	// Look up all color indices.
	{
  // @ts-ignore
		let fb_idx: number = (y * SCREEN_WIDTH + s_pos_x_p) * 4
  // @ts-ignore
		for (let x: number = s_pos_x_p; x < s_pos_x; x++) {
			const entry = video_palette.entries[col_line[x]]
			
			// Note: The original C emulator rendered pixels in BGRA order with an empty Alpha channel 
			// because it was using SDL_PIXELFORMAT_ARGB8888. 
			// For HTML5 Canvas ImageData, we must use strict RGBA order and set Alpha to 255 (opaque).
			framebuffer[fb_idx++] = (entry >> 16) & 0xFF // Red
			framebuffer[fb_idx++] = (entry >> 8) & 0xFF  // Green
			framebuffer[fb_idx++] = entry & 0xFF         // Blue
			framebuffer[fb_idx++] = 0xFF                 // Alpha (255 = fully opaque)
		}
	}

	// NTSC overscan
	if (out_mode == 2) {
  // @ts-ignore
		let fb_idx: number = (y * SCREEN_WIDTH + s_pos_x_p) * 4
  // @ts-ignore
		for (let x: number = s_pos_x_p; x < s_pos_x; x++)
		{
			if (x < SCREEN_WIDTH * TITLE_SAFE_X ||
				x > SCREEN_WIDTH * (1 - TITLE_SAFE_X) ||
				y < SCREEN_HEIGHT * TITLE_SAFE_Y ||
				y > SCREEN_HEIGHT * (1 - TITLE_SAFE_Y)) {

				// Divide RGB elements by 4.
				framebuffer[fb_idx] >>= 2
				framebuffer[fb_idx + 1] >>= 2
				framebuffer[fb_idx + 2] >>= 2
			}
			fb_idx += 4
		}
	}

	s_pos_x_p = s_pos_x
}

const update_isr_and_coll = (y: number, compare: number): void => {
	if (y == SCREEN_HEIGHT) {
		if (sprite_line_collisions != 0) {
			isr |= 4
		}
		isr = (isr & 0xf) | sprite_line_collisions
		sprite_line_collisions = 0
		isr |= 1 // VSYNC IRQ
	}
	if (y == compare) { // LINE IRQ
		isr |= 2
	}
}

export const video_step = (mhz: number, steps: number, midline: boolean): boolean => {
	let y: number = 0
  // @ts-ignore
	const ntsc_mode: boolean = reg_composer[0] & 2
	let new_frame: boolean = false
	vga_scan_pos_x += PIXEL_FREQ * steps / mhz
	if (vga_scan_pos_x > VGA_SCAN_WIDTH) {
		vga_scan_pos_x -= VGA_SCAN_WIDTH
		if (!ntsc_mode) {
			render_line(vga_scan_pos_y - VGA_Y_OFFSET, VGA_SCAN_WIDTH)
		}
		vga_scan_pos_y++
		if (vga_scan_pos_y == SCAN_HEIGHT) {
			vga_scan_pos_y = 0
			if (!ntsc_mode) {
				new_frame = true
				frame_count++
			}
		}
		if (!ntsc_mode) {
			update_isr_and_coll(vga_scan_pos_y - VGA_Y_OFFSET, irq_line)
		}
	} else if (midline) {
		if (!ntsc_mode) {
			render_line(vga_scan_pos_y - VGA_Y_OFFSET, vga_scan_pos_x)
		}
	}
	ntsc_half_cnt += PIXEL_FREQ * steps / mhz
	if (ntsc_half_cnt > NTSC_HALF_SCAN_WIDTH) {
		ntsc_half_cnt -= NTSC_HALF_SCAN_WIDTH
		if (ntsc_mode) {
			if (ntsc_scan_pos_y < SCAN_HEIGHT) {
				y = ntsc_scan_pos_y - NTSC_Y_OFFSET_LOW
				if ((y & 1) == 0) {
					render_line(y, NTSC_HALF_SCAN_WIDTH)
				}
			} else {
				y = ntsc_scan_pos_y - NTSC_Y_OFFSET_HIGH
				if ((y & 1) == 0) {
					render_line(y | 1, NTSC_HALF_SCAN_WIDTH)
				}
			}
		}
		ntsc_scan_pos_y++
		if (ntsc_scan_pos_y == SCAN_HEIGHT) {
			reg_composer[0] |= 0x80
			if (ntsc_mode) {
				new_frame = true
				frame_count++
			}
		}
		if (ntsc_scan_pos_y == SCAN_HEIGHT*2) {
			reg_composer[0] &= ~0x80
			ntsc_scan_pos_y = 0
			if (ntsc_mode) {
				new_frame = true
				frame_count++
			}
		}
		if (ntsc_mode) {
			// this is correct enough for even screen heights
			if (ntsc_scan_pos_y < SCAN_HEIGHT) {
				update_isr_and_coll(ntsc_scan_pos_y - NTSC_Y_OFFSET_LOW, irq_line & ~1)
			} else {
				update_isr_and_coll(ntsc_scan_pos_y - NTSC_Y_OFFSET_HIGH, irq_line & ~1)
			}
		}
	} else if (midline) {
		if (ntsc_mode) {
			if (ntsc_scan_pos_y < SCAN_HEIGHT) {
				y = ntsc_scan_pos_y - NTSC_Y_OFFSET_LOW
				if ((y & 1) == 0) {
					render_line(y, ntsc_half_cnt)
				}
			} else {
				y = ntsc_scan_pos_y - NTSC_Y_OFFSET_HIGH
				if ((y & 1) == 0) {
					render_line(y | 1, ntsc_half_cnt)
				}
			}
		}
	}

	return new_frame
}

export const video_get_irq_out = (): boolean => {
	audio_render()
	const tmp_isr: number = isr | (pcm_is_fifo_almost_empty() ? 8 : 0)
	return (tmp_isr & ien) != 0
}


export const video_update = (): boolean => {

  // don't think this will be necessary
	// for activity LED, overlay red 8x4 square into top right of framebuffer
	// for progressive modes, draw LED only on even scanlines
  // @ts-ignore
//	for (let y: number = 0; y < 4; y+=1+!!((reg_composer[0] & 0x0b) > 0x09)) {
//		for (let x: number = SCREEN_WIDTH - 8; x < SCREEN_WIDTH; x++) {
//			let b: number = framebuffer[(y * SCREEN_WIDTH + x) * 4 + 0]
//			let g: number = framebuffer[(y * SCREEN_WIDTH + x) * 4 + 1]
//			let r: number = framebuffer[(y * SCREEN_WIDTH + x) * 4 + 2]
//			r = Number(r) * (255 - activity_led) / 255 + activity_led
//			g = Number(g) * (255 - activity_led) / 255
//			b = Number(b) * (255 - activity_led) / 255
//			framebuffer[(y * SCREEN_WIDTH + x) * 4 + 0] = b
//			framebuffer[(y * SCREEN_WIDTH + x) * 4 + 1] = g
//			framebuffer[(y * SCREEN_WIDTH + x) * 4 + 2] = r
//			framebuffer[(y * SCREEN_WIDTH + x) * 4 + 3] = 0xFF
//		}
//	}

  // inform the renderer here that framebuffer is updated
  passVeraFramebuffer(framebuffer, reg_composer[0])
	return true
}

export const video_end = (): void => {
}


const increments = new Int16Array([
	0,   0,
	1,   -1,
	2,   -2,
	4,   -4,
	8,   -8,
	16,  -16,
	32,  -32,
	64,  -64,
	128, -128,
	256, -256,
	512, -512,
	40,  -40,
	80,  -80,
	160, -160,
	320, -320,
	640, -640,
])
const get_and_inc_address = (sel: number, write: boolean): number => {
	const address: number = io_addr[sel]
	let incr: number = increments[io_inc[sel]]
	if (fx_4bit_mode && fx_nibble_incr[sel] && !incr) {
		if (fx_nibble_bit[sel]) {
			if ((io_inc[sel] & 1) == 0) io_addr[sel] += 1
			fx_nibble_bit[sel] = 0
		} else {
			if (io_inc[sel] & 1) io_addr[sel] -= 1
			fx_nibble_bit[sel] = 1
		}
	}

	if (sel == 1 && fx_16bit_hop) {
		if (incr == 4) {
			if (fx_16bit_hop_align == (address & 0x3))
				incr = 1
			else
				incr = 3
		} else if (incr == 320) {
			if (fx_16bit_hop_align == (address & 0x3))
				incr = 1
			else
				incr = 319
		}
	}

	io_addr[sel] += incr
	if (sel == 1 && fx_addr1_mode == 1) { // FX line draw mode
		fx_x_pixel_position += fx_x_pixel_increment
		if (fx_x_pixel_position & 0x10000) {
			fx_x_pixel_position &= ~0x10000
			if (fx_4bit_mode && fx_nibble_incr[0]) {
				if (fx_nibble_bit[1]) {
					if ((io_inc[0] & 1) == 0) io_addr[1] += 1
					fx_nibble_bit[1] = 0
				} else {
					if (io_inc[0] & 1) io_addr[1] -= 1
					fx_nibble_bit[1] = 1
				}
			}
			io_addr[1] += increments[io_inc[0]]
		}
	} else if (fx_addr1_mode == 2 && write == false) { // FX polygon fill mode
		fx_x_pixel_position += fx_x_pixel_increment
		fx_y_pixel_position += fx_y_pixel_increment
		fx_poly_fill_length = (Number(fx_y_pixel_position) >> 16) - (Number(fx_x_pixel_position) >> 16)
		if (sel == 0 && fx_cache_byte_cycling && !fx_cache_fill) {
			fx_cache_byte_index = (fx_cache_byte_index + 1) & 3
		}
		if (sel == 1) {
			if (fx_4bit_mode) {
				io_addr[1] = io_addr[0] + (fx_x_pixel_position >> 17)
				fx_nibble_bit[1] = (fx_x_pixel_position >> 16) & 1
			} else {
				io_addr[1] = io_addr[0] + (fx_x_pixel_position >> 16)
			}
		}
	} else if (sel == 1 && fx_addr1_mode == 3 && write == false) { // FX affine mode
		fx_x_pixel_position += fx_x_pixel_increment
		fx_y_pixel_position += fx_y_pixel_increment
	}
	return address
}

const fx_affine_prefetch = (): void => {
	if (fx_addr1_mode != 3) return // only if affine mode is selected

	let address: number = 0
	let affine_x_tile: number = (fx_x_pixel_position >> 19) & 0xff
	let affine_y_tile: number = (fx_y_pixel_position >> 19) & 0xff
	const affine_x_sub_tile: number = (fx_x_pixel_position >> 16) & 0x07
	const affine_y_sub_tile: number = (fx_y_pixel_position >> 16) & 0x07
	if (!fx_affine_clip) { // wrap
		affine_x_tile &= fx_affine_map_size - 1
		affine_y_tile &= fx_affine_map_size - 1
	}

	if (affine_x_tile >= fx_affine_map_size || affine_y_tile >= fx_affine_map_size) {
		// We clipped, return value for tile 0
  // @ts-ignore
		address = fx_affine_tile_base + (affine_y_sub_tile << (3 - fx_4bit_mode)) + (affine_x_sub_tile >> Number(fx_4bit_mode))
  // @ts-ignore
		fx_nibble_bit[1] = (affine_x_sub_tile & 1) >> (1 - fx_4bit_mode)
	} else {
		// Get the address within the tile map
		address = fx_affine_map_base + (affine_y_tile * fx_affine_map_size) + affine_x_tile
		// Now translate that to the tile base address
		const affine_tile_idx: number = video_space_read(address)
  // @ts-ignore
		address = fx_affine_tile_base + (affine_tile_idx << (6 - fx_4bit_mode))
		// Now add the sub-tile address
  // @ts-ignore
		address += (affine_y_sub_tile << (3 - fx_4bit_mode)) + (affine_x_sub_tile >> Number(fx_4bit_mode))
  // @ts-ignore
		fx_nibble_bit[1] = (affine_x_sub_tile & 1) >> (1 - fx_4bit_mode)
	}
	io_addr[1] = address
	io_rddata[1] = video_space_read(address)
}

//
// Vera: Internal Video Address Space
//

const video_space_read = (address: number): number => {
	return video_ram[address & 0x1FFFF]
}

const video_space_read_range = (dest: Uint8Array, address: number, size: number): void => {
	if (address >= ADDR_VRAM_START && (address+size) <= ADDR_VRAM_END) {
		for (let i = 0; i < size; i++) dest[i] = video_ram[address + i]
	} else {
		for (let i: number = 0; i < size; ++i) {
			dest[i] = video_space_read(address + i)
		}
	}
}

const write_psg = (address: number, value: number): void => {
	const reg = address & 0x3f
	audio_render()
	psg_writereg(reg, value)
	passVeraPsgWrite({
		cycle: s6502.cycleCount,
		reg,
		value,
	})
}

const write_pcm = (reg: VeraPcmWrite["reg"], value: number): void => {
	passVeraPcmWrite({
		cycle: s6502.cycleCount,
		reg,
		value,
	})
}

const fx_video_space_write = (address: number, nibble: boolean, value: number): void => {
	if (fx_4bit_mode) {
		if (nibble) {
			if (!fx_trans_writes || (value & 0x0f) > 0) {
				video_ram[address & 0x1FFFF] = (video_ram[address & 0x1FFFF] & 0xf0) | (value & 0x0f)
			}
		} else {
			if (!fx_trans_writes || (value & 0xf0) > 0) {
				video_ram[address & 0x1FFFF] = (video_ram[address & 0x1FFFF] & 0x0f) | (value & 0xf0)
			}
		}
	} else {
		if (!fx_trans_writes || value > 0) video_ram[address & 0x1FFFF] = value
	}
	if (address >= ADDR_PSG_START && address < ADDR_PSG_END) {
		write_psg(address, value)
	} else if (address >= ADDR_PALETTE_START && address < ADDR_PALETTE_END) {
		palette[address & 0x1ff] = value
		video_palette.dirty = true
	} else if (address >= ADDR_SPRDATA_START && address < ADDR_SPRDATA_END) {
		sprite_data[(address >> 3) & 0x7f][address & 0x7] = value
		refresh_sprite_properties((address >> 3) & 0x7f)
	}
}

const fx_vram_cache_write = (address: number, value: number, mask: number): void => {
	if (!fx_trans_writes || value > 0) {
		switch (mask) {
			case 0:
				video_ram[address & 0x1FFFF] = value
				break
			case 1:
				video_ram[address & 0x1FFFF] = (video_ram[address & 0x1FFFF] & 0x0f) | (value & 0xf0)
				break
			case 2:
				video_ram[address & 0x1FFFF] = (video_ram[address & 0x1FFFF] & 0xf0) | (value & 0x0f)
				break
			case 3:
				// Do nothing
				break
		}
	}
}

const video_get_dc_value = (reg: number): number => {
	switch (reg & 0x1F) {
		case 0x00:
		case 0x01:
		case 0x02:
		case 0x03:
		case 0x04:
		case 0x05:
		case 0x06:
		case 0x07:
		case 0x08:
		case 0x09:
		case 0x0a:
		case 0x0c:
		case 0x0d:
		case 0x0e:
		case 0x0f:
			return reg_composer[reg]
			break
		case 0x0b:
			return reg_composer[reg] & 0x3f
			break
		case 0x10: // DCSEL=4, $9F29
			return (fx_x_pixel_position >> 16) & 0xff
			break
		case 0x11: // DCSEL=4, $9F2A
			return ((fx_x_pixel_position >> 24) & 0x07) | (fx_x_pixel_position & 0x80)
			break
		case 0x12: // DCSEL=4, $9F2B
			return (fx_y_pixel_position >> 16) & 0xff
			break
		case 0x13: // DCSEL=4, $9F2C
			return ((fx_y_pixel_position >> 24) & 0x07) | (fx_y_pixel_position & 0x80)
			break
		case 0x14: // DCSEL=5, $9F29
			return (fx_x_pixel_position >> 8) & 0xff
			break
		case 0x15: // DCSEL=4, $9F2A
			return (fx_y_pixel_position >> 8) & 0xff
			break
		case 0x16: // DCSEL=5, 0x9F2B
			if (fx_poly_fill_length >= 768) {
				return ((fx_2bit_poly && fx_addr1_mode == 2) ? 0x00 : 0x80)
			}
			if (fx_4bit_mode) {
				if (fx_2bit_poly && fx_addr1_mode == 2) {
					return ((fx_y_pixel_position & 0x00008000) >> 8) |
						((fx_x_pixel_position >> 11) & 0x60) |
						((fx_x_pixel_position >> 14) & 0x10) |
						((fx_poly_fill_length & 0x0007) << 1) |
						((fx_x_pixel_position & 0x00008000) >> 15)
				} else {
  // @ts-ignore
					return ((!!(fx_poly_fill_length & 0xfff8)) << 7) |
						((fx_x_pixel_position >> 11) & 0x60) |
						((fx_x_pixel_position >> 14) & 0x10) |
						((fx_poly_fill_length & 0x0007) << 1)
				}
			} else {
  // @ts-ignore
				return ((!!(fx_poly_fill_length & 0xfff0)) << 7) |
					((fx_x_pixel_position >> 11) & 0x60) |
					((fx_poly_fill_length & 0x000f) << 1)
			}
			break
		case 0x17: // DCSEL=5, 0x9F2C
			return ((fx_poly_fill_length & 0x03f8) >> 2)
			break
		case 0x18: // DCSEL=6, 0x9F29
			return fx_cache[0]
			break
		case 0x19: // DCSEL=6, 0x9F2A
			return fx_cache[1]
			break
		case 0x1a: // DCSEL=6, 0x9F2B
			return fx_cache[2]
			break
		case 0x1b: // DCSEL=6, 0x9F2C
			return fx_cache[3]
			break
		default:
			break
	}

	return vera_version_string[reg % 4]
}

//
// Vera: 6502 I/O Interface
//
// if debugOn, read without any side effects (registers & memory unchanged)

const check_not_readonly = (reg: number): void => {
	let wrong: boolean = false
	switch(io_dcsel) {
		case 5: {
			switch(reg) {
				case 0x0b:		// DCSEL=5 FX_POLY_FILL_L
				case 0x0c:		// DCSEL=5 FX_POLY_FILL_H
					wrong=true
					break
			}
			break
		}
		case 63: {
			switch(reg) {
				case 0x09:		// DCSEL=63 DC_VER0
				case 0x0a:		// DCSEL=63 DC_VER1
				case 0x0b:		// DCSEL=63 DC_VER2
				case 0x0c:		// DCSEL=63 DC_VER3
					wrong=true
					break
			}
			break
		}
	}

	if(wrong)
		printf("Warning: %04X wrote to read-only VERA register at 9F%02X (DCSEL=%d)\n", opcode_addr, reg+0x20, io_dcsel)
}

const check_not_writeonly = (reg: number): void => {
	let wrong: boolean = false
	switch(io_dcsel) {
		case 2: {
			switch(reg) {
				case 0x0a:		// DCSEL=2 FX_TILEBASE
				case 0x0b:		// DCSEL=2 FX_MAPBASE
				case 0x0c:		// DCSEL=2 FX_MULT
					wrong=true
					break
			}
			break
		}
		case 3:
		case 4: {
			switch(reg) {
				case 0x09:		// DCSEL=3/4 FX_X_INCR_L/FX_X_POS_L
				case 0x0a:		// DCSEL=3/4 FX_X_INCR_H/FX_X_POS_H
				case 0x0b:		// DCSEL=3/4 FX_Y_INCR_L/FX_Y_POS_L
				case 0x0c:		// DCSEL=3/4 FX_Y_INCR_H/FX_Y_POS_H
					wrong=true
					break
			}
			break
		}
		case 5: {
			switch(reg) {
				case 0x09:		// DCSEL=5 FX_X_POS_S
				case 0x0a:		// DCSEL=5 FX_Y_POS_S
					wrong=true
					break
			}
			break
		}
		case 6: {
			switch(reg) {
				case 0x0b:		// DCSEL=6 FX_CACHE_H
				case 0x0c:		// DCSEL=6 FX_CACHE_U
					wrong=true
					break
			}
			break
		}
	}

	if(wrong)
		printf("Warning: %04X read from write-only VERA register at 9F%02X (DCSEL=%d)\n", opcode_addr, reg+0x20, io_dcsel)
}

export const video_read = (reg: number, debugOn: boolean): number => {
  // @ts-ignore
	const ntsc_mode: boolean = reg_composer[0] & 2
	let scanline: number = ntsc_mode ? ntsc_scan_pos_y % SCAN_HEIGHT : vga_scan_pos_y
	if (scanline >= 512) scanline=511
	check_not_writeonly(reg)
	switch (reg & 0x1F) {
		case 0x00: return io_addr[io_addrsel] & 0xff
		case 0x01: return (io_addr[io_addrsel] >> 8) & 0xff
		case 0x02: return (io_addr[io_addrsel] >> 16) | (fx_nibble_bit[io_addrsel] << 1) | (fx_nibble_incr[io_addrsel] << 2) | (io_inc[io_addrsel] << 3)
		case 0x03:
		case 0x04: {
			if (debugOn) {
				return io_rddata[reg - 3]
			}

			const addr_nibble: boolean = !!fx_nibble_bit[reg - 3]
			const address: number = get_and_inc_address(reg - 3, false)
			const value: number = io_rddata[reg - 3]
			if (reg == 4 && fx_addr1_mode == 3)
				fx_affine_prefetch()
			else
				io_rddata[reg - 3] = video_space_read(io_addr[reg - 3])
			if (fx_cache_fill) {
				if (fx_4bit_mode) {
					const nibble_read: number = (addr_nibble ? ((value & 0x0f) << 4) : (value & 0xf0))
					if (fx_cache_nibble_index) {
						fx_cache[fx_cache_byte_index] = (fx_cache[fx_cache_byte_index] & 0xf0) | (nibble_read >> 4)
  // @ts-ignore
						fx_cache_nibble_index = 0
						fx_cache_byte_index = ((fx_cache_byte_index + 1) & 0x3)
					} else {
						fx_cache[fx_cache_byte_index] = (fx_cache[fx_cache_byte_index] & 0x0f) | (nibble_read)
  // @ts-ignore
						fx_cache_nibble_index = 1
					}
				} else {
					fx_cache[fx_cache_byte_index] = value
					if (fx_cache_increment_mode)
						fx_cache_byte_index = (fx_cache_byte_index & 0x2) | ((fx_cache_byte_index + 1) & 0x1)
					else
						fx_cache_byte_index = ((fx_cache_byte_index + 1) & 0x3)
				}
			}

			if (log_video) {
				printf("READ  video_space[$%X] = $%02X\n", address, value)
			}
			return value
		}
		case 0x05: return (io_dcsel << 1) | io_addrsel
		case 0x06: return ((irq_line & 0x100) >> 1) | ((scanline & 0x100) >> 2) | (ien & 0xF)
		case 0x07: audio_render(); return isr | (pcm_is_fifo_almost_empty() ? 8 : 0)
		case 0x08: return scanline & 0xFF
		case 0x09:
		case 0x0A:
		case 0x0B:
		case 0x0C: {
			const i: number = reg - 0x09 + (io_dcsel << 2)
			if (debugOn) return video_get_dc_value(i)
			switch (i) {
				case 0x00:
				case 0x01:
				case 0x02:
				case 0x03:
				case 0x04:
				case 0x05:
				case 0x06:
				case 0x07:
				case 0x08:
				case 0x16: // DCSEL=5, 0x9F2B
				case 0x17: // DCSEL=5, 0x9F2C
					return video_get_dc_value(i)
					break
				case 0x18: // DCSEL=6, 0x9F29
					fx_mult_accumulator = 0
					// fall out of the switch
					break
				case 0x19: { // DCSEL=6, 0x9F2A
					 // <- as: void the error in some compilers about a declaration after a label
					const m_result: number = (((fx_cache[1] << 8) | fx_cache[0]) << 16 >> 16) * (((fx_cache[3] << 8) | fx_cache[2]) << 16 >> 16)
					if (fx_subtract)
						fx_mult_accumulator -= m_result
					else
						fx_mult_accumulator += m_result
					// fall out of the switch
					break
				}
				default:
					// The rest of the space is write-only,
					// so reading the values out instead returns the version string.
					// fall out of the switch
					break
			}
			return vera_version_string[i % 4]
			break
		}
		case 0x0D:
		case 0x0E:
		case 0x0F:
		case 0x10:
		case 0x11:
		case 0x12:
		case 0x13: return reg_layer[0][reg - 0x0D]
		case 0x14:
		case 0x15:
		case 0x16:
		case 0x17:
		case 0x18:
		case 0x19:
		case 0x1A: return reg_layer[1][reg - 0x14]
		case 0x1B: audio_render(); return pcm_read_ctrl()
		case 0x1C: return pcm_read_rate()
		case 0x1D: return 0
		case 0x1E:
		case 0x1F: return vera_spi_read(reg & 1)
	}
	return 0
}

export const video_write = (reg: number, value: number): void => {
	// if (reg > 4) {
	// 	printf("ioregisters[0x%02X] = 0x%02X\n", reg, value)
	// }
	//	printf("ioregisters[%d] = $%02X\n", reg, value)
	check_not_readonly(reg)
	switch (reg & 0x1F) {
		case 0x00:
			if (fx_2bit_poly && fx_4bit_mode && fx_addr1_mode == 2 && io_addrsel == 1) {
				fx_2bit_poking = true
				io_addr[1] = (io_addr[1] & 0x1fffc) | (value & 0x3)
			} else {
				io_addr[io_addrsel] = (io_addr[io_addrsel] & 0x1ff00) | value
				if (fx_16bit_hop && io_addrsel == 1)
					fx_16bit_hop_align = value & 3
			}
			io_rddata[io_addrsel] = video_space_read(io_addr[io_addrsel])
			break
		case 0x01:
			io_addr[io_addrsel] = (io_addr[io_addrsel] & 0x100ff) | (value << 8)
			io_rddata[io_addrsel] = video_space_read(io_addr[io_addrsel])
			break
		case 0x02:
			io_addr[io_addrsel] = (io_addr[io_addrsel] & 0x0ffff) | ((value & 0x1) << 16)
			fx_nibble_bit[io_addrsel] = (value >> 1) & 0x1
			fx_nibble_incr[io_addrsel] = (value >> 2) & 0x1
			io_inc[io_addrsel]  = value >> 3
			io_rddata[io_addrsel] = video_space_read(io_addr[io_addrsel])
			break
		case 0x03:
		case 0x04: {
			if (fx_2bit_poking && fx_addr1_mode) {
				fx_2bit_poking = false
				const mask: number = value >> 6
				switch (mask) {
					case 0x00:
						video_ram[io_addr[1] & 0x1FFFF] = (fx_cache[fx_cache_byte_index] & 0xc0) | (io_rddata[1] & 0x3f)
						break
					case 0x01:
						video_ram[io_addr[1] & 0x1FFFF] = (fx_cache[fx_cache_byte_index] & 0x30) | (io_rddata[1] & 0xcf)
						break
					case 0x02:
						video_ram[io_addr[1] & 0x1FFFF] = (fx_cache[fx_cache_byte_index] & 0x0c) | (io_rddata[1] & 0xf3)
						break
					case 0x03:
						video_ram[io_addr[1] & 0x1FFFF] = (fx_cache[fx_cache_byte_index] & 0x03) | (io_rddata[1] & 0xfc)
						break
				}
				break // break out of the enclosing switch statement early, too
			}

			if (enable_midline)
				video_step(MHZ, 0, true) // potential midline raster effect
			const nibble: boolean = !!fx_nibble_bit[reg - 3]
			let address: number = get_and_inc_address(reg - 3, true)
			if (log_video) {
				printf("WRITE video_space[$%X] = $%02X\n", address, value)
			}

			let wrdata_to_use: number = 0
			const ram_wrdata = new Uint8Array(4)
			const nibble_mask = new Uint8Array(4)
			const cache_to_use = new Uint8Array(4)
			if (fx_multiplier) {
				let m_result: number = (((fx_cache[1] << 8) | fx_cache[0]) << 16 >> 16) * (((fx_cache[3] << 8) | fx_cache[2]) << 16 >> 16)
				if (fx_subtract)
					m_result = fx_mult_accumulator - m_result
				else
					m_result = fx_mult_accumulator + m_result
				cache_to_use[0] = (m_result) & 0xff
				cache_to_use[1] = (m_result >> 8) & 0xff
				cache_to_use[2] = (m_result >> 16) & 0xff
				cache_to_use[3] = (m_result >> 24) & 0xff
			} else {
				memcpy(cache_to_use, fx_cache, fx_cache.length)
			}

			if (fx_cache_byte_cycling) {
				wrdata_to_use = fx_cache[fx_cache_byte_index]
			} else {
				wrdata_to_use = value
			}

			if (fx_cache_write && !fx_cache_byte_cycling) {
				ram_wrdata[0] = cache_to_use[0]
				ram_wrdata[1] = cache_to_use[1]
				ram_wrdata[2] = cache_to_use[2]
				ram_wrdata[3] = cache_to_use[3]
			} else {
				ram_wrdata[0] = wrdata_to_use
				ram_wrdata[1] = wrdata_to_use
				ram_wrdata[2] = wrdata_to_use
				ram_wrdata[3] = wrdata_to_use
			}

			if (fx_cache_write) {
				address &= 0x1fffc
				if (fx_trans_writes) {
					if (fx_4bit_mode) {
  // @ts-ignore
						nibble_mask[0] = (((ram_wrdata[0] & 0xf0) == 0) << 1) | ((ram_wrdata[0] & 0x0f) == 0)
  // @ts-ignore
						nibble_mask[1] = (((ram_wrdata[1] & 0xf0) == 0) << 1) | ((ram_wrdata[1] & 0x0f) == 0)
  // @ts-ignore
						nibble_mask[2] = (((ram_wrdata[2] & 0xf0) == 0) << 1) | ((ram_wrdata[2] & 0x0f) == 0)
  // @ts-ignore
						nibble_mask[3] = (((ram_wrdata[3] & 0xf0) == 0) << 1) | ((ram_wrdata[3] & 0x0f) == 0)
					} else {
						nibble_mask[0] = (ram_wrdata[0] != 0) ? 0 : 3
						nibble_mask[1] = (ram_wrdata[1] != 0) ? 0 : 3
						nibble_mask[2] = (ram_wrdata[2] != 0) ? 0 : 3
						nibble_mask[3] = (ram_wrdata[3] != 0) ? 0 : 3
					}
				} else {
					nibble_mask[0] = value & 0x3
					nibble_mask[1] = (value >> 2) & 0x3
					nibble_mask[2] = (value >> 4) & 0x3
					nibble_mask[3] = (value >> 6) & 0x3
				}

				fx_vram_cache_write(address+0, ram_wrdata[0], nibble_mask[0])
				fx_vram_cache_write(address+1, ram_wrdata[1], nibble_mask[1])
				fx_vram_cache_write(address+2, ram_wrdata[2], nibble_mask[2])
				fx_vram_cache_write(address+3, ram_wrdata[3], nibble_mask[3])
			} else {
				fx_video_space_write(address, nibble, wrdata_to_use) // Normal write
			}

			io_rddata[reg - 3] = video_space_read(io_addr[reg - 3])
			break
		}
		case 0x05:
			if (value & 0x80) {
				video_reset()
			}
			io_dcsel = (value >> 1) & 0x3f
			io_addrsel = value & 1
			break
		case 0x06:
			irq_line = (irq_line & 0xFF) | ((value >> 7) << 8)
			ien = value & 0xF
			break
		case 0x07:
			isr &= value ^ 0xff
			break
		case 0x08:
			irq_line = (irq_line & 0x100) | value
			break
		case 0x09:
		case 0x0A:
		case 0x0B:
		case 0x0C: {
			video_step(MHZ, 0, true) // potential midline raster effect
			const i: number = reg - 0x09 + (io_dcsel << 2)
			if (i == 0) {
				// if progressive mode field goes from 0 to 1
				// or if mode goes from vga to something else with
				// progressive mode on, clear the framebuffer
				if (((reg_composer[0] & 0x8) == 0 && (value & 0x8)) ||
					((reg_composer[0] & 0x3) == 1 && (value & 0x3) > 1 && (value & 0x8))) {
					memset(framebuffer, 0x00, SCREEN_WIDTH * SCREEN_HEIGHT * 4)
				}

				// interlace field bit is read-only
				reg_composer[0] = (reg_composer[0] & ~0x7f) | (value & 0x7f)
				video_palette.dirty = true
			} else {
				reg_composer[i] = value
			}

			switch (i) {
				case 0x08: // DCSEL=2, $9F29
					fx_addr1_mode = value & 0x03
  // @ts-ignore
					fx_4bit_mode = (value & 0x04) >> 2
  // @ts-ignore
					fx_16bit_hop = (value & 0x08) >> 3
  // @ts-ignore
					fx_cache_byte_cycling = (value & 0x10) >> 4
  // @ts-ignore
					fx_cache_fill = (value & 0x20) >> 5
  // @ts-ignore
					fx_cache_write = (value & 0x40) >> 6
  // @ts-ignore
					fx_trans_writes = (value & 0x80) >> 7
					break
				case 0x09: // DCSEL=2, $9F2A
					fx_affine_tile_base = (value & 0xfc) << 9
  // @ts-ignore
					fx_affine_clip = (value & 0x02) >> 1
  // @ts-ignore
					fx_2bit_poly = (value & 0x01)
					break
				case 0x0a: // DCSEL=2, $9F2B
					fx_affine_map_base = (value & 0xfc) << 9
					fx_affine_map_size = 2 << ((value & 0x03) << 1)
					break
				case 0x0b: // DCSEL=2, $9F2C
  // @ts-ignore
					fx_cache_increment_mode = value & 0x01
  // @ts-ignore
					fx_cache_nibble_index = (value & 0x02) >> 1
					fx_cache_byte_index = (value & 0x0c) >> 2
  // @ts-ignore
					fx_multiplier = (value & 0x10) >> 4
  // @ts-ignore
					fx_subtract = (value & 0x20) >> 5
					if (value & 0x40) { // accumulate
						const m_result: number = (((fx_cache[1] << 8) | fx_cache[0]) << 16 >> 16) * (((fx_cache[3] << 8) | fx_cache[2]) << 16 >> 16)
						if (fx_subtract)
							fx_mult_accumulator -= m_result
						else
							fx_mult_accumulator += m_result
					}
					if (value & 0x80) { // reset accumulator
						fx_mult_accumulator = 0
					}
					break
				case 0x0c: // DCSEL=3, $9F29
					fx_x_pixel_increment = ((((reg_composer[0x0d] & 0x7f) << 15) + (reg_composer[0x0c] << 7)) // base value
						| ((reg_composer[0x0d] & 0x40) ? 0xffc00000 : 0)) // sign extend if negative
  // @ts-ignore
						<< 5*(!!(reg_composer[0x0d] & 0x80)) // multiply by 32 if flag set
					break
				case 0x0d: // DCSEL=3, $9F2A
					fx_x_pixel_increment = ((((reg_composer[0x0d] & 0x7f) << 15) + (reg_composer[0x0c] << 7)) // base value
						| ((reg_composer[0x0d] & 0x40) ? 0xffc00000 : 0)) // sign extend if negative
  // @ts-ignore
						<< 5*(!!(reg_composer[0x0d] & 0x80)) // multiply by 32 if flag set
					if (fx_addr1_mode == 1 || fx_addr1_mode == 2) {
						// Reset subpixel to 0.5
						fx_x_pixel_position = (fx_x_pixel_position & 0x07ff0000) | 0x00008000
					}
					break
				case 0x0e: // DCSEL=3, $9F2B
					fx_y_pixel_increment = ((((reg_composer[0x0f] & 0x7f) << 15) + (reg_composer[0x0e] << 7)) // base value
						| ((reg_composer[0x0f] & 0x40) ? 0xffc00000 : 0)) // sign extend if negative
  // @ts-ignore
						<< 5*(!!(reg_composer[0x0f] & 0x80)) // multiply by 32 if flag set
					break
				case 0x0f: // DCSEL=3, $9F2C
					fx_y_pixel_increment = ((((reg_composer[0x0f] & 0x7f) << 15) + (reg_composer[0x0e] << 7)) // base value
						| ((reg_composer[0x0f] & 0x40) ? 0xffc00000 : 0)) // sign extend if negative
  // @ts-ignore
						<< 5*(!!(reg_composer[0x0f] & 0x80)) // multiply by 32 if flag set
					if (fx_addr1_mode == 1 || fx_addr1_mode == 2) {
						// Reset subpixel to 0.5
						fx_y_pixel_position = (fx_y_pixel_position & 0x07ff0000) | 0x00008000
					}
					break
				case 0x10: // DCSEL=4, $9F29
					fx_x_pixel_position = (fx_x_pixel_position & 0x0700ff80) | (value << 16)
					fx_affine_prefetch()
					break
				case 0x11: // DCSEL=4, $9F2A
					fx_x_pixel_position = (fx_x_pixel_position & 0x00ffff00) | ((value & 0x7) << 24) | (value & 0x80)
					fx_affine_prefetch()
					break
				case 0x12: // DCSEL=4, $9F2B
					fx_y_pixel_position = (fx_y_pixel_position & 0x0700ff80) | (value << 16)
					fx_affine_prefetch()
					break
				case 0x13: // DCSEL=4, $9F2C
					fx_y_pixel_position = (fx_y_pixel_position & 0x00ffff00) | ((value & 0x7) << 24) | (value & 0x80)
					fx_affine_prefetch()
					break
				case 0x14: // DCSEL=5, $9F29
					fx_x_pixel_position = (fx_x_pixel_position & 0x07ff0080) | (value << 8)
					break
				case 0x15: // DCSEL=5, $9F2A
					fx_y_pixel_position = (fx_y_pixel_position & 0x07ff0080) | (value << 8)
					break
				case 0x18: // DCSEL=6, $9F29
					fx_cache[0] = value
					break
				case 0x19: // DCSEL=6, $9F2A
					fx_cache[1] = value
					break
				case 0x1a: // DCSEL=6, $9F2B
					fx_cache[2] = value
					break
				case 0x1b: // DCSEL=6, $9F2C
					fx_cache[3] = value
					break
			}
			break
		}

		case 0x0D:
		case 0x0E:
		case 0x0F:
		case 0x10:
		case 0x11:
		case 0x12:
		case 0x13:
			video_step(MHZ, 0, true) // potential midline raster effect
			reg_layer[0][reg - 0x0D] = value
			refresh_layer_properties(0)
			break
		case 0x14:
		case 0x15:
		case 0x16:
		case 0x17:
		case 0x18:
		case 0x19:
		case 0x1A:
			video_step(MHZ, 0, true) // potential midline raster effect
			reg_layer[1][reg - 0x14] = value
			refresh_layer_properties(1)
			break
		case 0x1B: audio_render(); pcm_write_ctrl(value); write_pcm("ctrl", value); break
		case 0x1C: audio_render(); pcm_write_rate(value); write_pcm("rate", value); break
		case 0x1D: audio_render(); pcm_write_fifo(value); write_pcm("fifo", value); break
		case 0x1E:
		case 0x1F:
			vera_spi_write(reg & 1, value)
			break
	}
}

// These helpers use element counts, not byte counts. The port calls them only
// with same-width typed arrays or object arrays that model C structs.
type NumericTypedArray = Uint8Array | Uint8ClampedArray | Uint16Array | Uint32Array | Int16Array | Int32Array
type MutableArrayLike<T> = {
	length: number,
	[index: number]: T,
}

const memset = (dest: NumericTypedArray, val: number, size: number) => {
	dest.fill(val, 0, size)
}

const memcpy = <T>(dest: MutableArrayLike<T>, src: MutableArrayLike<T>, size: number) => {
	if (ArrayBuffer.isView(dest) && ArrayBuffer.isView(src)) {
		const typedDest = dest as unknown as Uint8Array
		const typedSrc = src as unknown as Uint8Array
		typedDest.set(typedSrc.subarray(0, size), 0)
		return
	}
	const mutableDest = dest as MutableArrayLike<unknown>
	for (let i = 0; i < size; i++) {
		const srcValue = src[i]
		const destValue = mutableDest[i]
		if (ArrayBuffer.isView(destValue) && ArrayBuffer.isView(srcValue)) {
			(destValue as unknown as Uint8Array).set(srcValue as unknown as Uint8Array)
		} else if (typeof srcValue === "object" && srcValue !== null) {
			if (!destValue) mutableDest[i] = Array.isArray(srcValue) ? [] : {}
			Object.assign(mutableDest[i] as object, srcValue)
		} else {
			mutableDest[i] = srcValue
		}
	}
}
