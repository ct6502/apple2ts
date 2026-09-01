import { isInteractiveKeyboardTarget } from "./retrokeyboard"

describe("Retro control-panel keyboard targets", () => {
  test.each(["input", "textarea", "select", "button"])(
    "leaves keyboard events from %s controls alone",
    tagName => {
      const control = document.createElement(tagName)
      expect(isInteractiveKeyboardTarget(control)).toBe(true)
    },
  )

  test("leaves keyboard events from contenteditable descendants alone", () => {
    const editor = document.createElement("div")
    const child = document.createElement("span")
    editor.setAttribute("contenteditable", "true")
    editor.appendChild(child)

    expect(isInteractiveKeyboardTarget(child)).toBe(true)
  })

  test("allows control-panel handling for noninteractive targets", () => {
    expect(isInteractiveKeyboardTarget(document.createElement("div"))).toBe(false)
    expect(isInteractiveKeyboardTarget(window)).toBe(false)
  })
})