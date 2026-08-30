import { renderToStaticMarkup } from "react-dom/server"
import type { ReactNode } from "react"
import { renderRetroPanelLayout, type RetroPanelSlotName } from "./retropanellayout"

describe("retro panel layout", () => {
  it("renders the JSON hierarchy and dynamic slots in order", () => {
    const slotNames: RetroPanelSlotName[] = ["border", "title", "submenu", "clock", "menu", "footer"]
    const slots = Object.fromEntries(slotNames.map(slot => [
      slot,
      <span data-slot={slot} key={slot}>{slot}</span>,
    ])) as Record<RetroPanelSlotName, ReactNode>

    document.body.innerHTML = renderToStaticMarkup(renderRetroPanelLayout(slots, {
      "aria-label": "Control panel",
      className: "retro-color-green",
    }))

    const panel = document.querySelector(".retro-panel")
    expect(panel?.tagName).toBe("SECTION")
    expect([...panel!.classList]).toEqual([
      "retro-panel",
      "menu-open",
      "retro-color-green",
    ])
    expect(panel?.getAttribute("role")).toBe("dialog")
    expect(panel?.getAttribute("aria-label")).toBe("Control panel")

    const windowElement = panel?.querySelector(":scope > .retro-viewport > .retro-native-surface > .retro-window")
    expect(windowElement).not.toBeNull()
    expect([...windowElement!.children].map(child => child.getAttribute("data-slot"))).toEqual(slotNames)
  })
})