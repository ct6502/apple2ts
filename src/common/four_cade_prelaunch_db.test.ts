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
})