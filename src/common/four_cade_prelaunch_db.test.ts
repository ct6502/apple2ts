import { parsePrelaunchScript } from "./four_cade_prelaunch_db"

describe("4cade prelaunch parsing", () => {
  test("uses the extracted BIN load address for standard.a", () => {
    const parsed = parsePrelaunchScript(`
      !cpu 6502
      *=$106
      +HIDE_ARTWORK
      jmp (ldrlo2)
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "rdRam2" },
        { op: "call", addr: 0xDFAE },
        { op: "readRom" },
      ],
      entry: "loadAddress",
    })
  })

  test("preserves Phaser Fire's numeric indirect entry vector", () => {
    const parsed = parsePrelaunchScript(`
      +HIDE_ARTWORK
      lda #$60
      sta $4074
      jsr $4000
      +GET_MACHINE_STATUS
      and #CHEATS_ENABLED
      beq +
      lda #$ad
      sta $96A
    +
      jmp ($20)
    `)

    expect(parsed?.entry).toEqual({ indirect: 0x20 })
    expect(parsed?.sequence).toContainEqual({ op: "decompress", addr: 0x4000 })
  })

  test("continues to reject symbolic indirect vectors other than ldrlo2", () => {
    expect(parsePrelaunchScript("+HIDE_ARTWORK\njmp (resetVector)")).toBeUndefined()
  })

  test("preserves Bubble Bobble's canonical reset vector", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL
      lda #$60
      sta $978
      jsr $800
      lda #<reset
      sta $3F2
      sta $FFFC
      lda #>reset
      sta $3F3
      sta $FFFD
      eor #$A5
      sta $3F4
      +DISABLE_ACCEL_AND_HIDE_ARTWORK_LC
      jmp $6000

      reset
      +READ_ROM_NO_WRITE
      inc $3F4
      jmp ($FFFC)
    `)

    expect(parsed?.sequence).toContainEqual({ op: "reset_vector" })
    expect(parsed?.entry).toBe(0x6000)
  })

  test("preserves Pitfall II's reset handler and dual callbacks without enabling cheats", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL_AND_HIDE_ARTWORK_LC
      lda #$60
      sta $3D34
      jsr $0800
      +RESET_VECTOR reset
      lda #$4C
      sta $2DF5
      sta $2E06
      lda #<callback1
      sta $2DF6
      lda #>callback1
      sta $2DF7
      lda #<callback2
      sta $2E07
      lda #>callback2
      sta $2E08
      lda MachineStatus
      and #CHEATS_ENABLED
      beq +
      lda #$60
      sta $243D
    +
      +DISABLE_ACCEL_LC
      jmp $6000
    reset
      +READ_RAM2_NO_WRITE
      jmp ($FFFC)
    callback1
      sec
      sbc #8
      cmp #2
      bcc +
    - jmp $AE0A
    + jmp $ADF9
    callback2
      sec
      sbc #8
      cmp #2
      bcs -
      jmp $AE21
    `)

    expect(parsed?.entry).toBe(0x6000)
    expect(parsed?.sequence).toContainEqual({ op: "reset_handler", mode: "rdRam2" })
    expect(parsed?.sequence).toContainEqual(expect.objectContaining({
      op: "install_routine", loAddr: 0x2DF6, hiAddr: 0x2DF7,
    }))
    expect(parsed?.sequence).toContainEqual(expect.objectContaining({
      op: "install_routine", loAddr: 0x2E07, hiAddr: 0x2E08,
    }))
    expect(parsed?.sequence).not.toContainEqual({ op: "patch", addr: 0x243D, val: 0x60 })
  })

  test("follows Chrono Warrior's forward jump past its cheat-only callback", () => {
    const parsed = parsePrelaunchScript(`
      jmp skip
    callback
      jsr $BC9D
      lda #0
      rts
    skip
      +ENABLE_ACCEL_LC
      lda #$60
      sta $2079
      jsr $2000
      +GET_MACHINE_STATUS_LC_RW
      and #CHEATS_ENABLED
      beq +
      lda #<callback
      sta $BC90
      lda #>callback
      sta $BC91
    +
      +DISABLE_ACCEL_LC
      jmp $1B40
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB7 },
        { op: "patch", addr: 0x2079, val: 0x60 },
        { op: "decompress", addr: 0x2000 },
        { op: "call", addr: 0xDFB4 },
        { op: "readRom" },
      ],
      entry: 0x1B40,
    })
  })

  test("rejects forward-main scripts that require their skipped callback", () => {
    expect(parsePrelaunchScript(`
      jmp main
    callback
      jsr $BD00
      rts
    main
      +ENABLE_ACCEL
      jsr $800
      lda #<callback
      sta $B7B8
      lda #>callback
      sta $B7B9
      jmp $B700
    `)).toBeUndefined()
  })

  test("parses Technocop's inline cheat label and reset checksum increment", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL_LC
      inc $3F4
      lda MachineStatus
      and #CHEATS_ENABLED
      pha
      lda #$60
      sta $A01
      +READ_ROM_NO_WRITE
      jsr $800
      pla
      beq +
      ldy #2
    - lda hook_cheat, y
      sta $FA85, y
      dey
      bpl -
    + +DISABLE_ACCEL_AND_HIDE_ARTWORK_LC
      jmp $F800
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB7 },
        { op: "inc_reset_checksum" },
        { op: "patch", addr: 0x0A01, val: 0x60 },
        { op: "readRom" },
        { op: "decompress", addr: 0x0800 },
        { op: "call", addr: 0xDFB4 },
        { op: "call", addr: 0xDFAE },
        { op: "readRom" },
      ],
      entry: 0xF800,
    })
  })

  test("preserves Talon's reset vector without enabling cheats", () => {
    const parsed = parsePrelaunchScript(`
      lda #$60
      sta $919B
      jsr $3FF8
      +RESET_VECTOR $100
      +GET_MACHINE_STATUS
      and #CHEATS_ENABLED
      beq +
      lda #$60
      sta $18E9
    + jmp $BE9B
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "patch", addr: 0x919B, val: 0x60 },
        { op: "decompress", addr: 0x3FF8 },
        { op: "reset_vector_100" },
      ],
      entry: 0xBE9B,
    })
  })

  test("preserves Hard Hat Mack's patcher and stack-built entry", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL_AND_HIDE_ARTWORK
      lda #<patcher
      sta $9431
      lda #>patcher
      sta $942E
      jsr $4856
    patcher rts
      lda #1
      sta $2218
      +DISABLE_ACCEL
      lda #$07
      pha
      lda #$FF
      pha
      rts
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB7 },
        { op: "call", addr: 0xDFAE },
        { op: "readRom" },
        { op: "inline_rts_vector", loAddr: 0x9431, hiAddr: 0x942E },
        { op: "decompress", addr: 0x4856 },
        { op: "patch", addr: 0x2218, val: 0x01 },
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB4 },
        { op: "readRom" },
        { op: "stack_entry", returnAddress: 0x07FF },
      ],
      entry: -1,
    })
  })

  test("preserves Spare Change's stack callback after decompression", () => {
    const parsed = parsePrelaunchScript(`
      +ENABLE_ACCEL
      lda #$60
      sta $2778
      jsr $2700
      lda #>(callback - 1)
      pha
      lda #<(callback - 1)
      pha
      sec
      php
      jmp $BD26
    callback
      +DISABLE_ACCEL_AND_HIDE_ARTWORK
      jmp $2000
    `)

    expect(parsed).toEqual({
      sequence: [
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB7 },
        { op: "readRom" },
        { op: "patch", addr: 0x2778, val: 0x60 },
        { op: "decompress", addr: 0x2700 },
        { op: "stack_callback_jmp", addr: 0xBD26 },
        { op: "rwRam2" },
        { op: "call", addr: 0xDFB4 },
        { op: "call", addr: 0xDFAE },
        { op: "readRom" },
      ],
      entry: 0x2000,
    })
  })

  test("rejects inline-label scripts with unsupported launch semantics", () => {
    expect(parsePrelaunchScript("jsr HideLaunchArtworkLC2\njmp $800")).toBeUndefined()
    expect(parsePrelaunchScript("+RESET_VECTOR $200\njsr $800\njmp $900")).toBeUndefined()
    expect(parsePrelaunchScript(`
      lda #<callback1
      sta $948F
      lda #>callback1
      sta $9490
      jmp $5200
    callback1
      rts
    `)).toBeUndefined()
  })
})