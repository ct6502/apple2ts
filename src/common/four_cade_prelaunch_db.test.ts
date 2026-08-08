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
})