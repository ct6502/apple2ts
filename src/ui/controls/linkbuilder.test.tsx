import ReactDOM from "react-dom/client"
import { act } from "react"
import LinkBuilder, { getBaseAppUrl } from "./linkbuilder"

// @ts-expect-error set act environment flag for React 18+
globalThis.IS_REACT_ACT_ENVIRONMENT = true

jest.mock("../devices/audio/speaker", () => ({
  isAudioEnabled: jest.fn(() => true),
}))

jest.mock("../main2worker", () => ({
  handleGetIsDebugging: jest.fn(() => false),
  handleGetMachineName: jest.fn(() => "APPLE2EE"),
  handleGetMemSize: jest.fn(() => 64),
  handleGetSpeedMode: jest.fn(() => 0),
  handleGetSlotConfig: jest.fn(() => ({
    1: "none",
    2: "vera",
    3: "aux",
    4: "none",
    5: "none",
    6: "disk2",
    7: "smartport",
  })),
}))

describe("LinkBuilder", () => {
  let container: HTMLDivElement

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
  })

  afterEach(() => {
    document.body.removeChild(container)
  })

  test("renders link builder button and opens dialog with multi-drive controls", () => {
    const root = ReactDOM.createRoot(container)
    act(() => {
      root.render(<LinkBuilder />)
    })

    const button = container.querySelector("button")
    expect(button).not.toBeNull()

    // Click to open Link Builder modal
    act(() => {
      button!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    // Verify startup disk selector and custom url exist
    expect(container.textContent).toContain("Disk image to load on startup:")
    expect(container.textContent).toContain("Custom disk image URL:")
    expect(container.textContent).toContain("Additional Disk Drives")

    // Verify drive selection droplists exist for active disk controllers
    expect(container.textContent).toContain("Slot 6 Drive 1 (Floppy 1)")
    expect(container.textContent).toContain("Slot 6 Drive 2 (Floppy 2)")
    expect(container.textContent).toContain("Slot 7 Drive 1 (Hard Drive 1)")
    expect(container.textContent).toContain("Slot 7 Drive 2 (Hard Drive 2)")
    expect(container.textContent).toContain("Slot 2 Drive 1 (VERA SD)")
  })

  test("getBaseAppUrl preserves subdirectories on GitHub Pages or custom paths", () => {
    const originalHref = window.location.href
    try {
      window.history.pushState({}, "", "/a2ts/")
      expect(getBaseAppUrl()).toBe("http://localhost/a2ts/")

      window.history.pushState({}, "", "/a2ts/site/")
      expect(getBaseAppUrl()).toBe("http://localhost/a2ts/site/")

      window.history.pushState({}, "", "/a2ts/site/index.html")
      expect(getBaseAppUrl()).toBe("http://localhost/a2ts/site/")

      window.history.pushState({}, "", "/my-org/project/demo/")
      expect(getBaseAppUrl()).toBe("http://localhost/my-org/project/demo/")

      window.history.pushState({}, "", "/apple2ts/")
      expect(getBaseAppUrl()).toBe("http://localhost/apple2ts/")

      window.history.pushState({}, "", "/apple2ts/index.html")
      expect(getBaseAppUrl()).toBe("http://localhost/apple2ts/")

      window.history.pushState({}, "", "/apple2ts")
      expect(getBaseAppUrl()).toBe("http://localhost/apple2ts/")

      window.history.pushState({}, "", "/")
      expect(getBaseAppUrl()).toBe("http://localhost/")
    } finally {
      window.history.pushState({}, "", originalHref)
    }
  })
})

