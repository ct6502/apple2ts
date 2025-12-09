/**
 * Software synthesizer using SoundFont samples
 * Provides realistic orchestral sounds when no hardware MIDI devices are available
 */

import { instrument, InstrumentName, Player } from "soundfont-player"

let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
const channelInstruments: (Player | null)[] = new Array(16).fill(null)
const channelPrograms: number[] = new Array(16).fill(6) // Default to harpsichord (program 6)
const activeNotes = new Map<string, { stop: () => void }>()
const channelVolumes = new Array(16).fill(100)
let isInitialized = false

// General MIDI instrument names (program 0-127)
export const GM_INSTRUMENTS = [
  "acoustic_grand_piano",      // 0
  "bright_acoustic_piano",     // 1
  "electric_grand_piano",      // 2
  "honkytonk_piano",           // 3
  "electric_piano_1",          // 4
  "electric_piano_2",          // 5
  "harpsichord",               // 6
  "clavinet",                  // 7
  "celesta",                   // 8
  "glockenspiel",              // 9
  "music_box",                 // 10
  "vibraphone",                // 11
  "marimba",                   // 12
  "xylophone",                 // 13
  "tubular_bells",             // 14
  "dulcimer",                  // 15
  "drawbar_organ",             // 16
  "percussive_organ",          // 17
  "rock_organ",                // 18
  "church_organ",              // 19
  "reed_organ",                // 20
  "accordion",                 // 21
  "harmonica",                 // 22
  "tango_accordion",           // 23
  "acoustic_guitar_nylon",     // 24
  "acoustic_guitar_steel",     // 25
  "electric_guitar_jazz",      // 26
  "electric_guitar_clean",     // 27
  "electric_guitar_muted",     // 28
  "overdriven_guitar",         // 29
  "distortion_guitar",         // 30
  "guitar_harmonics",          // 31
  "acoustic_bass",             // 32
  "electric_bass_finger",      // 33
  "electric_bass_pick",        // 34
  "fretless_bass",             // 35
  "slap_bass_1",               // 36
  "slap_bass_2",               // 37
  "synth_bass_1",              // 38
  "synth_bass_2",              // 39
  "violin",                    // 40
  "viola",                     // 41
  "cello",                     // 42
  "contrabass",                // 43
  "tremolo_strings",           // 44
  "pizzicato_strings",         // 45
  "orchestral_harp",           // 46
  "timpani",                   // 47
  "string_ensemble_1",         // 48
  "string_ensemble_2",         // 49
  "synth_strings_1",           // 50
  "synth_strings_2",           // 51
  "choir_aahs",                // 52
  "voice_oohs",                // 53
  "synth_choir",               // 54
  "orchestra_hit",             // 55
  "trumpet",                   // 56
  "trombone",                  // 57
  "tuba",                      // 58
  "muted_trumpet",             // 59
  "french_horn",               // 60
  "brass_section",             // 61
  "synth_brass_1",             // 62
  "synth_brass_2",             // 63
  "soprano_sax",               // 64
  "alto_sax",                  // 65
  "tenor_sax",                 // 66
  "baritone_sax",              // 67
  "oboe",                      // 68
  "english_horn",              // 69
  "bassoon",                   // 70
  "clarinet",                  // 71
  "piccolo",                   // 72
  "flute",                     // 73
  "recorder",                  // 74
  "pan_flute",                 // 75
  "blown_bottle",              // 76
  "shakuhachi",                // 77
  "whistle",                   // 78
  "ocarina",                   // 79
  "lead_1_square",             // 80
  "lead_2_sawtooth",           // 81
  "lead_3_calliope",           // 82
  "lead_4_chiff",              // 83
  "lead_5_charang",            // 84
  "lead_6_voice",              // 85
  "lead_7_fifths",             // 86
  "lead_8_bass__lead",         // 87
  "pad_1_new_age",             // 88
  "pad_2_warm",                // 89
  "pad_3_polysynth",           // 90
  "pad_4_choir",               // 91
  "pad_5_bowed",               // 92
  "pad_6_metallic",            // 93
  "pad_7_halo",                // 94
  "pad_8_sweep",               // 95
  "fx_1_rain",                 // 96
  "fx_2_soundtrack",           // 97
  "fx_3_crystal",              // 98
  "fx_4_atmosphere",           // 99
  "fx_5_brightness",           // 100
  "fx_6_goblins",              // 101
  "fx_7_echoes",               // 102
  "fx_8_scifi",                // 103
  "sitar",                     // 104
  "banjo",                     // 105
  "shamisen",                  // 106
  "koto",                      // 107
  "kalimba",                   // 108
  "bagpipe",                   // 109
  "fiddle",                    // 110
  "shanai",                    // 111
  "tinkle_bell",               // 112
  "agogo",                     // 113
  "steel_drums",               // 114
  "woodblock",                 // 115
  "taiko_drum",                // 116
  "melodic_tom",               // 117
  "synth_drum",                // 118
  "reverse_cymbal",            // 119
  "guitar_fret_noise",         // 120
  "breath_noise",              // 121
  "seashore",                  // 122
  "bird_tweet",                // 123
  "telephone_ring",            // 124
  "helicopter",                // 125
  "applause",                  // 126
  "gunshot"                    // 127
]

const getInstrumentName = (program: number): string => {
  return GM_INSTRUMENTS[Math.min(program, GM_INSTRUMENTS.length - 1)]
}

const getNoteKey = (channel: number, note: number): string => {
  return `${channel}-${note}`
}

const midiNoteToName = (midiNote: number): string => {
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
  const octave = Math.floor(midiNote / 12) - 1
  const noteName = noteNames[midiNote % 12]
  return `${noteName}${octave}`
}

export const initSoftSynth = async () => {
  if (!audioContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    masterGain = audioContext.createGain()
    masterGain.gain.value = 3.5  // Boost overall volume
    masterGain.connect(audioContext.destination)
    
    // Load default instrument (harpsichord) for all channels
    console.log("Initializing SoundFont synthesizer...")
    for (let ch = 0; ch < 16; ch++) {
      if (ch === 9) continue // Skip drums channel for now
      try {
        const player = await instrument(audioContext,
          getInstrumentName(channelPrograms[ch]) as InstrumentName, {
          gain: 2.0,  // Boost instrument gain
          destination: masterGain
        })
        channelInstruments[ch] = player
      } catch (err) {
        console.warn(`Failed to load instrument for channel ${ch}:`, err)
      }
    }
    isInitialized = true
    console.log("SoundFont synthesizer initialized")
  }
}

export const setMasterVolume = (volume: number) => {
  if (masterGain) {
    masterGain.gain.value = Math.max(0, Math.min(1, volume))
  }
}

export const noteOn = async (channel: number, note: number, velocity: number) => {
  if (!isInitialized) {
    await initSoftSynth()
  }
  
  let player = channelInstruments[channel]
  
  // If no instrument loaded for this channel, load it based on current program
  if (!player && audioContext && masterGain) {
    const program = channelPrograms[channel]
    const instrumentName = getInstrumentName(program)
    console.log(`SoftSynth: Lazy loading instrument for channel ${channel}: ${instrumentName} (program ${program})`)
    try {
      player = await instrument(audioContext, instrumentName as InstrumentName, {
        gain: 2.0,  // Boost instrument gain
        destination: masterGain
      })
      channelInstruments[channel] = player
    } catch (err) {
      console.warn(`SoftSynth: Failed to load instrument ${instrumentName}:`, err)
      return
    }
  }
  
  if (!player) return

  const noteKey = getNoteKey(channel, note)
  
  // Stop existing note if playing
  if (activeNotes.has(noteKey)) {
    const playback = activeNotes.get(noteKey)
    if (playback) {
      playback.stop()
    }
  }
  
  // Play the note
  const gain = (velocity / 127) * (channelVolumes[channel] / 127)
  try {
    const playback = player.play(midiNoteToName(note), audioContext!.currentTime, {
      gain,
      duration: 100 // Long duration, we'll stop it manually
    })
    activeNotes.set(noteKey, playback)
  } catch (err) {
    console.warn(`SoftSynth: Failed to play note ${note} on channel ${channel}:`, err)
  }
}

export const noteOff = (channel: number, note: number) => {
  const noteKey = getNoteKey(channel, note)
  const playback = activeNotes.get(noteKey)
  
  if (playback) {
    playback.stop()
    activeNotes.delete(noteKey)
  }
}

export const allNotesOff = (channel?: number) => {
  if (channel !== undefined) {
    // Stop all notes on specific channel
    for (const [key, playback] of activeNotes.entries()) {
      if (key.startsWith(`${channel}-`)) {
        playback.stop()
        activeNotes.delete(key)
      }
    }
  } else {
    // Stop all notes on all channels
    for (const playback of activeNotes.values()) {
      playback.stop()
    }
    activeNotes.clear()
  }
}

export const stopAllNotes = () => {
  allNotesOff()
}

export const setChannelVolume = (channel: number, volume: number) => {
  channelVolumes[channel] = Math.max(0, Math.min(127, volume))
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const setChannelPan = (_channel: number, _pan: number) => {
  // SoundFont-player doesn't support per-channel panning easily
  // Would need to create separate gain/pan nodes per channel
}

export const programChange = async (channel: number, program: number) => {
  if (!audioContext || !masterGain) return

  // Load the new instrument asynchronously
  const instrumentName = getInstrumentName(program)
  console.log(`SoftSynth: Loading instrument for channel ${channel}: ${instrumentName} (program ${program})`)
  
  try {
    const player = await instrument(audioContext, instrumentName as InstrumentName, {
      gain: 2.0,  // Boost instrument gain
      destination: masterGain
    })
    
    // Stop all notes on this channel before switching
    allNotesOff(channel)
    
    channelInstruments[channel] = player
    console.log(`SoftSynth: Finished loading instrument for channel ${channel}: ${instrumentName}`)
  } catch (err) {
    console.warn(`SoftSynth: Failed to load instrument ${instrumentName}:`, err)
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const pitchBend = (_channel: number, _value: number) => {
  // SoundFont-player doesn't have built-in pitch bend support
  // Would require detune parameter on individual notes
}

export const isSoftSynthAvailable = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return !!(window.AudioContext || (window as any).webkitAudioContext)
}

// MIDIOutput-compatible send method
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const send = async (data: Iterable<number>, timestamp?: DOMHighResTimeStamp) => {
  // Convert iterable to array
  const msg = Array.isArray(data) ? data : Array.from(data)
  if (msg.length === 0) return

  // TODO: Handle timestamp for scheduled playback
  // For now, we ignore the timestamp parameter and play immediately

  const status = msg[0] & 0xF0
  const channel = msg[0] & 0x0F

  switch (status) {
    case 0x80: // Note Off
      if (msg.length >= 3) {
        noteOff(channel, msg[1])
      }
      break
    case 0x90: // Note On
      if (msg.length >= 3) {
        if (msg[2] === 0) {
          // Velocity 0 is note off
          noteOff(channel, msg[1])
        } else {
          await noteOn(channel, msg[1], msg[2])
        }
      }
      break
    case 0xB0: // Control Change
      if (msg.length >= 3) {
        if (msg[1] === 7) {
          // Channel volume
          setChannelVolume(channel, msg[2])
        } else if (msg[1] === 10) {
          // Pan
          setChannelPan(channel, msg[2])
        } else if (msg[1] === 123) {
          // All notes off
          allNotesOff(channel)
        }
      }
      break
    case 0xC0: // Program Change
      if (msg.length >= 2) {
        console.log("SoftSynth: Program Change", channel, msg)
        // Update the program number FIRST, synchronously, before async loading
        // This ensures lazy loading in noteOn will use the correct instrument
        channelPrograms[channel] = msg[1]
        await programChange(channel, msg[1])
      }
      break
    case 0xE0: // Pitch Bend
      if (msg.length >= 3) {
        const value = msg[1] | (msg[2] << 7)
        pitchBend(channel, value)
      }
      break
  }
}
