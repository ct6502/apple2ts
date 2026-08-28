import { renderToStaticMarkup } from "react-dom/server"
import { act } from "react"
import { createRoot } from "react-dom/client"
import { DefaultHelpContent } from "./defaulthelpcontent"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true

describe("DefaultHelpContent", () => {
  it("renders translated messages as text and keeps link destinations in code", () => {
    const maliciousTranslation = "<a href=\"javascript:alert(1)\">owned</a>"
    const t = jest.fn((key: string) => (
      key === "help.exampleLinks.totalReplayDebugging" ? maliciousTranslation : key
    ))

    const html = renderToStaticMarkup(<DefaultHelpContent t={t} />)

    expect(html).toContain("&lt;a href=&quot;javascript:alert(1)&quot;&gt;owned&lt;/a&gt;")
    expect(html).not.toContain("href=\"javascript:")
    expect(html).toContain("href=\"https://apple2ts.com/?debug=on#Replay\"")
    expect(html).toContain("rel=\"noopener noreferrer\"")
  })

  it("explains unavailable shortcuts while the modifier controls Open Apple", () => {
    const t = jest.fn((key: string) => key)

    renderToStaticMarkup(<DefaultHelpContent t={t} useOpenAppleKey isTouchDevice={false} />)

    expect(t).toHaveBeenCalledWith("help.shortcutsUnavailable", { keyMod: "Alt" })
    expect(t).not.toHaveBeenCalledWith("help.shortcutsTable", expect.anything())
  })

  it("replaces shortcut guidance when the Open Apple modifier changes", () => {
    const t = jest.fn((key: string) => key)
    const container = document.createElement("div")
    const root = createRoot(container)

    act(() => {
      root.render(<DefaultHelpContent t={t} useOpenAppleKey isTouchDevice={false} />)
    })
    const unavailableGuidance = container.querySelector(".help-shortcuts-unavailable")
    expect(unavailableGuidance).not.toBeNull()
    expect(container.querySelector(".help-shortcuts-available")).toBeNull()

    act(() => {
      root.render(<DefaultHelpContent t={t} useOpenAppleKey={false} isTouchDevice={false} />)
    })
    const availableGuidance = container.querySelector(".help-shortcuts-available")
    expect(container.querySelector(".help-shortcuts-unavailable")).toBeNull()
    expect(availableGuidance).not.toBeNull()
    expect(availableGuidance).not.toBe(unavailableGuidance)
    expect(container.contains(unavailableGuidance)).toBe(false)

    act(() => root.unmount())
  })

  it("renders shortcut keys and translated labels in aligned table cells", () => {
    const t = jest.fn((key: string) => `[${key}]`)

    const html = renderToStaticMarkup(
      <DefaultHelpContent t={t} useOpenAppleKey={false} isTouchDevice={false} />
    )

    const shortcuts = [
      ["Alt+B", "controls.boot"],
      ["Ctrl+0", "speed.snail"],
      ["Alt+C", "controls.copyScreen"],
      ["Ctrl+1", "speed.normal"],
      ["Alt+O", "controls.restoreState"],
      ["Ctrl+2", "speed.two"],
      ["Alt+R", "controls.reset"],
      ["Ctrl+3", "speed.three"],
      ["Alt+S", "controls.saveState"],
      ["Ctrl+4", "speed.fast"],
      ["Alt+V", "controls.pasteText"],
      ["Ctrl+5", "speed.warp"],
      ["Alt+←", "debugControls.goBackInTime"],
      ["Alt+→", "debugControls.goForwardInTime"],
    ]

    expect(html).toContain("class=\"help-shortcuts\"")
    expect(html).toContain(
      "[help.controlPanelShortcut]\n\n[help.openAppleKey]"
    )
    expect(html).toContain(
      "<kbd class=\"help-shortcut-key\">Alt+B</kbd>"
      + "<span class=\"help-shortcut-separator\">: </span>"
      + "<span class=\"help-shortcut-label\">[controls.boot]</span>"
      + "<span class=\"help-shortcut-separator\">; </span>"
      + "<kbd class=\"help-shortcut-key\">Ctrl+0</kbd>"
      + "<span class=\"help-shortcut-separator\">: </span>"
      + "<span class=\"help-shortcut-label\">[speed.snail]</span>"
      + "<span class=\"help-shortcut-separator\">. </span>"
    )
    for (const [shortcut, translationKey] of shortcuts) {
      const label = translationKey === "speed.normal"
        ? `<strong>[${translationKey}]</strong>`
        : `[${translationKey}]`
      expect(html).toContain(
        `<kbd class="help-shortcut-key">${shortcut}</kbd>`
        + "<span class=\"help-shortcut-separator\">: </span>"
        + `<span class="help-shortcut-label">${label}</span>`
      )
    }
    expect(t).not.toHaveBeenCalledWith("help.shortcutsTable", expect.anything())
  })
})
