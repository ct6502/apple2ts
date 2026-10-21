import { convertdsk2woz } from "./convertdsk2woz"
import { convertwoz2dsk, decodeWozToSectorCandidates } from "./convertwoz2dsk"
import { readFileSync } from "node:fs"
import { loadWozAndExtractDosImage } from "./prodos_hdv"
import { getDiskBlobForSync } from "./utility"

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

  test("getDiskBlobForSync converts in-memory WOZ back to DSK or PO format", async () => {
    const readBlob = (blob: Blob) => new Promise<Uint8Array>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
      reader.onerror = () => reject(reader.error)
      reader.readAsArrayBuffer(blob)
    })

    const disk = createTestDisk()
    const woz = convertdsk2woz(disk, false)

    // For .dsk: blob must be 143360 bytes (DSK sector format), NOT woz bitstream!
    const dskBlob = getDiskBlobForSync(woz, "MyDisk.dsk")
    expect(dskBlob.size).toBe(143360)
    const dskBuffer = await readBlob(dskBlob)
    expect(dskBuffer).toEqual(disk)

    // For .po: blob must be 143360 bytes
    const poDisk = createTestDisk()
    const poWoz = convertdsk2woz(poDisk, true)
    const poBlob = getDiskBlobForSync(poWoz, "MyDisk.po")
    expect(poBlob.size).toBe(143360)
    const poBuffer = await readBlob(poBlob)
    expect(poBuffer).toEqual(poDisk)

    // For .woz: blob remains WOZ with updated CRC
    const wozBlob = getDiskBlobForSync(woz, "MyDisk.woz")
    expect(wozBlob.size).toBe(woz.length)
  })
})