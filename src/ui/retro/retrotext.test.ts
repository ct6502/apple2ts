import {
  actionHintWidth,
  controlTextWidth,
  fitControlText,
  formatClockTime,
  mouseTextGlyphs,
  retroFontSupports,
  selectArrowSpacing,
  selectHintWidth,
  shouldUseCompactLatinFooter,
  truncateControlText,
} from "./retrotext"

describe("Retro control-panel text", () => {
  test("reserves the leading hour cell only for single-digit hours", () => {
    expect(formatClockTime(new Date(2020, 0, 1, 6, 7, 8), "en-US")).toMatch(/^\u20076:/)
    expect(formatClockTime(new Date(2020, 0, 1, 12, 7, 8), "en-US")).toMatch(/^12:/)
    expect(formatClockTime(new Date(2020, 0, 1, 18, 7, 8), "en-US")).toMatch(/ PM$/)
  })

  test("truncates at grapheme boundaries with three dots", () => {
    expect(truncateControlText("Pinball Construction Set", 12, "en")).toBe("Pinball C...")
    expect(truncateControlText("électricité", 6, "fr")).toBe("éle...")
  })

  test("counts East Asian graphemes as two control-panel cells", () => {
    expect(controlTextWidth("設定A", "ja")).toBe(5)
    expect(truncateControlText("設定項目", 5, "ja")).toBe("設...")
  })

  test("uses the control-panel font for supported accented Latin text", () => {
    expect(retroFontSupports("Français, Español, Čeština, Ångström")).toBe(true)
    expect(retroFontSupports(Object.values(mouseTextGlyphs).join(""))).toBe(true)
    expect(retroFontSupports("日本語")).toBe(false)
  })

  test("uses PrintChar21's mirrored MouseText glyphs for footer controls", () => {
    expect(mouseTextGlyphs).toEqual({
      left: String.fromCodePoint(0xE088),
      down: String.fromCodePoint(0xE08A),
      up: String.fromCodePoint(0xE08B),
      return: String.fromCodePoint(0xE08D),
      right: String.fromCodePoint(0xE095),
    })
  })

  test("preserves a menu item name when its selected value is long", () => {
    expect(fitControlText("MIDI", "Enable external MIDI with a very long device name", 34, "en"))
      .toEqual({ label: "MIDI", option: "Enable external MIDI with..." })
  })

  test("fills a submenu row while reserving one cell before the right border", () => {
    expect(fitControlText("Slot 3", "Apple 699-0221 (64KB / 80-Col / dHGR)", 40, "en"))
      .toEqual({ label: "Slot 3", option: "Apple 699-0221 (64KB / 80-Col..." })
  })

  test("uses narrower arrow spacing for Select labels of nine characters or more", () => {
    expect(selectArrowSpacing("Välj", "sv")).toBe("\u2007")
    expect(selectArrowSpacing("Selecteren", "nl")).toBe("\u2006")
    expect(selectArrowSpacing("Sélectionner", "fr")).toBe("\u2006")
    expect(selectHintWidth("Select", "en")).toBe(15)
    expect(selectHintWidth("Selecteren", "nl")).toBe(17.5)
    expect(selectHintWidth("Sélectionner", "fr")).toBe(19.5)
    expect(actionHintWidth("Save", "en")).toBe(7)
  })

  test("uses compact footer typography only for overflowing Latin text", () => {
    expect(shouldUseCompactLatinFooter(["Seleccionar", "Cancelar:Esc", "Guardar"], 39)).toBe(true)
    expect(shouldUseCompactLatinFooter(["Select", "Cancel:Esc", "Save"], 30)).toBe(false)
    expect(shouldUseCompactLatinFooter(["選取", "取消:Esc", "儲存"], 39)).toBe(false)
  })
})