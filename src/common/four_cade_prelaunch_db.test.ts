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

  test("continues to reject unsupported indirect vectors", () => {
    expect(parsePrelaunchScript("+HIDE_ARTWORK\njmp ($20)")).toBeUndefined()
  })
})