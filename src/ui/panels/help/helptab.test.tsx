import { act } from "react"
import { createRoot, Root } from "react-dom/client"
import { UI_THEME } from "../../../common/utility"
import HelpTab from "./helptab"

jest.mock("./helppanel.css", () => ({}))

jest.mock("../../../i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock("../../ui_settings", () => ({
  isMinimalTheme: () => false,
}))

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, "innerWidth", { configurable: true, value: width })
  Object.defineProperty(window, "innerHeight", { configurable: true, value: height })
}

const reactEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean,
}

describe("HelpTab", () => {
  let container: HTMLDivElement
  let root: Root
  let touchStartOwner: object | null
  let touchStartDescriptor: PropertyDescriptor | undefined
  let innerWidthDescriptor: PropertyDescriptor | undefined
  let innerHeightDescriptor: PropertyDescriptor | undefined
  let rectSpy: jest.SpyInstance
  let previousActEnvironment: boolean | undefined

  beforeEach(() => {
    previousActEnvironment = reactEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    touchStartOwner = document.documentElement
    while (touchStartOwner && !Object.prototype.hasOwnProperty.call(touchStartOwner, "ontouchstart")) {
      touchStartOwner = Object.getPrototypeOf(touchStartOwner) as object | null
    }
    touchStartDescriptor = touchStartOwner
      ? Object.getOwnPropertyDescriptor(touchStartOwner, "ontouchstart")
      : undefined
    if (touchStartOwner && touchStartDescriptor?.configurable) {
      delete (touchStartOwner as { ontouchstart?: unknown }).ontouchstart
    }
    innerWidthDescriptor = Object.getOwnPropertyDescriptor(window, "innerWidth")
    innerHeightDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight")
    rectSpy = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockImplementation(function (this: HTMLElement) {
        const isHelp = this.classList.contains("help-parent")
        const top = isHelp ? (this.style.height ? 80 : 900) : 0
        const height = this.classList.contains("flyout-button") ? 30 : 0
        return {
          x: 0, y: top, top, left: 0, right: 0,
          bottom: top + height, width: 0, height,
          toJSON: () => ({}),
        }
      })
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    if (touchStartOwner && touchStartDescriptor) {
      Object.defineProperty(touchStartOwner, "ontouchstart", touchStartDescriptor)
    }
    if (innerWidthDescriptor) {
      Object.defineProperty(window, "innerWidth", innerWidthDescriptor)
    }
    if (innerHeightDescriptor) {
      Object.defineProperty(window, "innerHeight", innerHeightDescriptor)
    }
    rectSpy.mockRestore()
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
  })

  const renderHelp = (useOpenAppleKey: boolean, narrow = false, desktop = false) => {
    root.render(
      <div className="flyout">
        <HelpTab
          desktop={desktop}
          helptext="<Default>"
          narrow={narrow}
          theme={UI_THEME.CLASSIC}
          useOpenAppleKey={useOpenAppleKey}
        />
        <div className="flyout-button" />
      </div>
    )
  }

  it("lets the desktop shell own its width and vertical flow", () => {
    setViewport(1200, 800)
    act(() => {
      renderHelp(false, false, true)
    })

    const help = container.querySelector<HTMLElement>(".help-parent")
    expect(help?.style.width).toBe("100%")
    expect(help?.style.height).toBe("")
    expect(help?.style.overflow).toBe("visible")
  })

  it("updates its layout when the viewport changes", () => {
    setViewport(1200, 800)
    act(() => {
      renderHelp(false)
    })

    const help = container.querySelector<HTMLElement>(".help-parent")
    expect(help?.style.width).toBe("500px")
    expect(help?.style.height).toBe("686px")
    expect(help?.style.overflow).toBe("auto")

    setViewport(700, 900)
    act(() => {
      window.dispatchEvent(new Event("resize"))
      renderHelp(false, true)
    })

    expect(help?.style.width).toBe("500px")
    expect(help?.style.height).toBe("")
    expect(help?.style.overflow).toBe("visible")

    setViewport(1200, 800)
    act(() => {
      window.dispatchEvent(new Event("resize"))
      renderHelp(false)
    })

    expect(help?.style.width).toBe("500px")
    expect(help?.style.height).toBe("686px")
    expect(help?.style.overflow).toBe("auto")
  })

  it("replaces the complete shortcut mode when the Open Apple setting changes", () => {
    setViewport(1200, 800)
    act(() => {
      renderHelp(true)
    })

    const unavailable = container.querySelector(".help-shortcuts-unavailable")
    unavailable?.append(document.createTextNode("stale translated text"))

    act(() => {
      renderHelp(false)
    })

    expect(container.textContent).not.toContain("stale translated text")
    expect(container.querySelector(".help-shortcuts-unavailable")).toBeNull()
    expect(container.querySelector(".help-shortcuts-available")).not.toBeNull()
    expect(container.querySelector(".help-parent")?.getAttribute("translate")).toBe("no")
  })
})
