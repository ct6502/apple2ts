import ReactDOM from "react-dom/client"
import { act } from "react"
import LinkBuilder from "./linkbuilder"

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

    // Verify drive selection droplists exist for active disk controllers
    expect(container.textContent).toContain("Slot 6 Drive 1 (Floppy 1)")
    expect(container.textContent).toContain("Slot 6 Drive 2 (Floppy 2)")
    expect(container.textContent).toContain("Slot 7 Drive 1 (Hard Drive 1)")
    expect(container.textContent).toContain("Slot 7 Drive 2 (Hard Drive 2)")
    expect(container.textContent).toContain("Slot 2 Drive 1 (VERA SD)")
  })
})
