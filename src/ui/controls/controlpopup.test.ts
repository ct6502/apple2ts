import { controlOptionsToPopupItems, controlsToPopupItems } from "./controlpopup"
import { formatControlLabel, type ResolvedControl } from "./controlregistry"

describe("shared control rendering", () => {
  test("adds separator em dashes only at runtime without spaces", () => {
    expect(formatControlLabel("Sort Order", true)).toBe("—Sort Order—")
    expect(formatControlLabel("Other", false)).toBe("Other")
  })

  test("converts separators and toggles for graphical menus", () => {
    const enable = jest.fn()
    const controls: ResolvedControl[] = [
      { id: "separator", kind: "action", label: "Other", separator: true },
      {
        id: "toggle",
        kind: "toggle",
        label: "Scanlines",
        optionIndex: 0,
        options: [{ label: "Off" }, { label: "On", action: enable }],
      },
    ]

    const items = controlsToPopupItems(controls)
    expect(items[0]).toEqual({ label: "-" })
    expect(items[1].label).toBe("Scanlines")
    expect(items[1].isSelected?.()).toBe(false)
    items[1].onClick?.()
    expect(enable).toHaveBeenCalledTimes(1)
  })

  test("uses popup labels while sharing option selection and actions", () => {
    const select = jest.fn()
    const control: ResolvedControl = {
      id: "language",
      kind: "choice",
      label: "Language",
      optionIndex: 1,
      options: [
        { label: "English", popupLabel: "🇺🇸 English" },
        { label: "Deutsch", popupLabel: "🇩🇪 Deutsch", action: select },
      ],
    }

    const items = controlOptionsToPopupItems(control)
    expect(items.map(item => item.label)).toEqual(["🇺🇸 English", "🇩🇪 Deutsch"])
    expect(items[1].isSelected?.()).toBe(true)
    items[1].onClick?.()
    expect(select).toHaveBeenCalledTimes(1)
  })
})