import {
  actionHintWidth,
  controlTextWidth,
  fitControlText,
  retroFontSupports,
  selectArrowSpacing,
  selectHintWidth,
  truncateControlText,
} from "./retrotext"

describe("Retro control-panel text", () => {
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
    expect(retroFontSupports("日本語")).toBe(false)
  })

  test("preserves a menu item name when its selected value is long", () => {
    expect(fitControlText("MIDI", "Enable external MIDI with a very long device name", 34, "en"))
      .toEqual({ label: "MIDI", option: "Enable external MIDI with..." })
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
})