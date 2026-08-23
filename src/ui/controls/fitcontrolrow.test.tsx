import { act, useState } from "react"
import { createRoot, Root } from "react-dom/client"
import FitControlRow, { getControlRowScale } from "./fitcontrolrow"

let resizeObserverCallback: ResizeObserverCallback

class TestResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeObserverCallback = callback
  }
  observe() {}
  disconnect() {}
}

const DialogHarness = () => {
  const [open, setOpen] = useState(false)
  return <>
    <button onClick={() => setOpen(true)}>open</button>
    {open && <div className="modal-overlay">
      dialog
      <button onClick={() => setOpen(false)}>close</button>
    </div>}
  </>
}

const reactEnvironment = globalThis as typeof globalThis & {
  IS_REACT_ACT_ENVIRONMENT?: boolean,
}

describe("getControlRowScale", () => {
  it("preserves controls that already fit", () => {
    expect(getControlRowScale(600, 500)).toBe(1)
  })

  it("scales controls to the available width", () => {
    expect(getControlRowScale(600, 800)).toBe(0.75)
  })

  it("can cap controls below their natural size", () => {
    expect(getControlRowScale(600, 500, 0.8)).toBe(0.8)
  })
})

describe("FitControlRow", () => {
  let container: HTMLDivElement
  let originalResizeObserver: typeof ResizeObserver
  let previousActEnvironment: boolean | undefined
  let root: Root

  beforeEach(() => {
    previousActEnvironment = reactEnvironment.IS_REACT_ACT_ENVIRONMENT
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = true
    originalResizeObserver = global.ResizeObserver
    global.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => root.unmount())
    container.remove()
    global.ResizeObserver = originalResizeObserver
    reactEnvironment.IS_REACT_ACT_ENVIRONMENT = previousActEnvironment
  })

  it("keeps button scaling stable while a viewport dialog is open", async () => {
    act(() => root.render(<FitControlRow minHeight={38}><DialogHarness /></FitControlRow>))

    const fitContainer = container.querySelector<HTMLElement>(".desktop-control-strip")
    const fitted = container.querySelector<HTMLElement>(".desktop-control-fit-content")
    if (!fitContainer || !fitted) throw new Error("Control fit elements were not rendered")
    Object.defineProperty(fitContainer, "clientWidth", { configurable: true, value: 400 })
    fitted.getBoundingClientRect = () => ({ width: 800 } as DOMRect)
    act(() => resizeObserverCallback([], {} as ResizeObserver))
    expect(fitted.style.getPropertyValue("--desktop-control-scale")).toBe("0.5")
    await act(async () => {
      container.querySelector<HTMLButtonElement>("button")?.click()
      await Promise.resolve()
    })
    expect(fitted.style.getPropertyValue("--desktop-control-scale")).toBe("0.5")

    await act(async () => {
      container.querySelectorAll<HTMLButtonElement>("button")[1]?.click()
      await Promise.resolve()
    })
    expect(fitted.style.getPropertyValue("--desktop-control-scale")).toBe("0.5")
  })
})
