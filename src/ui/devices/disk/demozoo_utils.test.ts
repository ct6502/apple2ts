import {
  demoZooDiskExtensions,
  demoZooNonDiskExtensions,
  extractDisksFromHtml,
  isDemoZooDiskUrl,
  isDemoZooNonDiskUrl,
  parseDemoZooProductionPageHtml,
  sortDemoZooDisks
} from "./demozoo_utils"

describe("demozoo_utils", () => {
  describe("disk extension detection", () => {
    it("should accept valid Apple II disk formats and archive extensions", () => {
      expect(isDemoZooDiskUrl("https://example.com/demo.dsk")).toBe(true)
      expect(isDemoZooDiskUrl("https://example.com/demo.woz")).toBe(true)
      expect(isDemoZooDiskUrl("https://example.com/demo.po")).toBe(true)
      expect(isDemoZooDiskUrl("https://example.com/demo.2mg")).toBe(true)
      expect(isDemoZooDiskUrl("https://example.com/demo.zip")).toBe(true)
      expect(isDemoZooDiskUrl("https://example.com/demo.7z")).toBe(true)
    })

    it("should strictly reject .nib images", () => {
      expect(isDemoZooDiskUrl("https://example.com/demo.nib")).toBe(false)
      expect(isDemoZooNonDiskUrl("https://example.com/demo.nib")).toBe(true)
      expect(demoZooDiskExtensions).not.toContain(".nib")
      expect(demoZooNonDiskExtensions).toContain(".nib")
    })

    it("should reject non-disk media extensions", () => {
      expect(isDemoZooDiskUrl("https://example.com/video.mp4")).toBe(false)
      expect(isDemoZooDiskUrl("https://example.com/cover.png")).toBe(false)
      expect(isDemoZooDiskUrl("https://example.com/readme.txt")).toBe(false)
      expect(isDemoZooNonDiskUrl("https://example.com/video.mp4")).toBe(true)
      expect(isDemoZooNonDiskUrl("https://example.com/audio.mp3")).toBe(true)
    })

    it("should handle invalid URLs safely", () => {
      expect(isDemoZooDiskUrl("")).toBe(false)
      expect(isDemoZooDiskUrl("not-a-url")).toBe(false)
      expect(isDemoZooNonDiskUrl("")).toBe(false)
    })
  })

  describe("sortDemoZooDisks", () => {
    it("should naturally sort disk numbers", () => {
      const urls = [
        "https://example.com/demo_disk10.dsk",
        "https://example.com/demo_disk2.dsk",
        "https://example.com/demo_disk1.dsk"
      ]
      const sorted = sortDemoZooDisks(urls)
      expect(sorted).toEqual([
        "https://example.com/demo_disk1.dsk",
        "https://example.com/demo_disk2.dsk",
        "https://example.com/demo_disk10.dsk"
      ])
    })

    it("should prioritize Side A / Boot / Face 1 as the first boot disk", () => {
      const urls = [
        "https://www.brutaldeluxe.fr/products/apple2/Court_Circuit_f2.dsk",
        "https://www.brutaldeluxe.fr/products/apple2/Court_Circuit_f1.dsk"
      ]
      expect(sortDemoZooDisks(urls)).toEqual([
        "https://www.brutaldeluxe.fr/products/apple2/Court_Circuit_f1.dsk",
        "https://www.brutaldeluxe.fr/products/apple2/Court_Circuit_f2.dsk"
      ])

      const sides = [
        "http://fr3nch.t0uch.free.fr/AS/AS-S2.dsk",
        "http://fr3nch.t0uch.free.fr/AS/AS-S1.dsk"
      ]
      expect(sortDemoZooDisks(sides)).toEqual([
        "http://fr3nch.t0uch.free.fr/AS/AS-S1.dsk",
        "http://fr3nch.t0uch.free.fr/AS/AS-S2.dsk"
      ])
    })
  })

  describe("extractDisksFromHtml", () => {
    it("should extract and resolve multiple disk links from Brutal Deluxe HTML", () => {
      const html = `
        <div>
          <a href="kontra2_fr.dsk">French Version</a>
          <a href="kontra2_en.dsk">English Version</a>
          <a href="manual.pdf">User Manual</a>
        </div>
      `
      const extracted = extractDisksFromHtml(html, "https://www.brutaldeluxe.fr/products/apple2/kontrabant2/")
      expect(extracted).toEqual([
        "https://www.brutaldeluxe.fr/products/apple2/kontrabant2/kontra2_en.dsk",
        "https://www.brutaldeluxe.fr/products/apple2/kontrabant2/kontra2_fr.dsk"
      ])
    })

    it("should extract download link from Pouet production page", () => {
      const html = `
        <div id="links">
          <a href="https://ftp.untergrund.net/users/TomoAlien/prods/b2_0004_diztrt_atparty2015.zip">download</a>
          <a href="https://www.youtube.com/watch?v=12345">video</a>
        </div>
      `
      const extracted = extractDisksFromHtml(html, "https://www.pouet.net/prod.php?which=65860")
      expect(extracted).toEqual([
        "https://ftp.untergrund.net/users/TomoAlien/prods/b2_0004_diztrt_atparty2015.zip"
      ])
    })

    it("should ignore .nib files found on web pages", () => {
      const html = `
        <a href="old_dump.nib">NIB image</a>
        <a href="clean_copy.woz">WOZ image</a>
      `
      const extracted = extractDisksFromHtml(html, "https://example.com/demo/")
      expect(extracted).toEqual([
        "https://example.com/demo/clean_copy.woz"
      ])
    })
  })

  describe("parseDemoZooProductionPageHtml", () => {
    it("should extract downloads from DemoZoo production page HTML", () => {
      const pageHtml = `
        <div class="panel editable_chunk downloads_panel">
          <h3 class="panel__title">Downloads</h3>
          <ul class="download_links">
            <li class="download_link sceneorg">
              <div>
                <a href="https://files.scene.org/get/parties/2026/outline26/hectic.zip" class="primary">Download</a>
              </div>
            </li>
            <li class="download_link website">
              <div>
                <a href="http://deater.net/weave/vmwprod/outline_2026/hectic_small.zip" class="primary">Download</a>
              </div>
            </li>
          </ul>
        </div>
      `
      const extracted = parseDemoZooProductionPageHtml(pageHtml, "https://demozoo.org/productions/391658/")
      expect(extracted).toEqual([
        "https://archive.scene.org/pub/parties/2026/outline26/hectic.zip",
        "http://deater.net/weave/vmwprod/outline_2026/hectic_small.zip"
      ])
    })

    it("should sort boot disk before data disk", () => {
      const urls = [
        "https://example.com/BAD_APPLE_DATA.DSK",
        "https://example.com/BAD_APPLE.DSK",
      ]
      expect(sortDemoZooDisks(urls)).toEqual([
        "https://example.com/BAD_APPLE.DSK",
        "https://example.com/BAD_APPLE_DATA.DSK",
      ])
    })

    it("should naturally sort multiple disks from DemoZoo page", () => {
      const pageHtml = `
        <div class="downloads_panel">
          <a href="https://example.com/demo_side_b.dsk">Side B</a>
          <a href="https://example.com/demo_side_a.dsk">Side A</a>
        </div>
      `
      const extracted = parseDemoZooProductionPageHtml(pageHtml, "https://demozoo.org/productions/123/")
      expect(extracted).toEqual([
        "https://example.com/demo_side_a.dsk",
        "https://example.com/demo_side_b.dsk"
      ])
    })
  })
})
