import { convertdsk2woz } from "./convertdsk2woz"
import { convertwoz2dsk, decodeWozToSectorCandidates } from "./convertwoz2dsk"
import { readFileSync } from "node:fs"
import { loadWozAndExtractDosImage } from "./prodos_hdv"

const createTestDisk = () => {
  const disk = new Uint8Array(35 * 16 * 256)
  for (let track = 0; track < 35; track++) {
    for (let sector = 0; sector < 16; sector++) {
      const offset = (track * 16 + sector) * 256
      for (let i = 0; i < 256; i++) {
        disk[offset + i] = (track * 17 + sector * 11 + i) & 0xFF
      }
    }
  }
  return disk
}

describe("DSK/WOZ conversion", () => {
  test.each([
    ["DOS sector order", false],
    ["ProDOS sector order", true],
  ])("round-trips %s", (_label, isPO) => {
    const disk = createTestDisk()
    const woz = convertdsk2woz(disk, isPO)
    const roundTrip = convertwoz2dsk(woz, isPO)

    expect(roundTrip).toEqual(disk)
  })

  test("round-trips CT_SPEEDTEST.DSK", () => {
    const disk = new Uint8Array(readFileSync("public/disks/CT_SPEEDTEST.DSK"))
    const woz = convertdsk2woz(disk, false)

    expect(convertwoz2dsk(woz, false)).toEqual(disk)
    expect(loadWozAndExtractDosImage(woz) ?? convertwoz2dsk(woz, false)).toEqual(disk)
  })

  test("reports an incomplete sector decode", () => {
    const woz = convertdsk2woz(createTestDisk(), false)
    woz.fill(0, 1536, 1536 + (13 * 512))

    expect(decodeWozToSectorCandidates(woz)?.decodedSectorCount).toBe(34 * 16)
    expect(convertwoz2dsk(woz, false)).toHaveLength(35 * 16 * 256)
  })
})