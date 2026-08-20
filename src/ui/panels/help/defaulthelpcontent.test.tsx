import { renderToStaticMarkup } from "react-dom/server"
import { DefaultHelpContent } from "./defaulthelpcontent"

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
})
