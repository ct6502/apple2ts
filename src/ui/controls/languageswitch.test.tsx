import { renderToStaticMarkup } from "react-dom/server"
import LanguageSwitch from "./languageswitch"

describe("LanguageSwitch", () => {
  test("protects native language names from browser translation", () => {
    const html = renderToStaticMarkup(<LanguageSwitch />)

    expect(html).toMatch(/^<span translate="no">/)
  })
})
