import { act } from "react"
import { createRoot } from "react-dom/client"
import DebugTab from "./debugtab"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const resetEvent = "apple2ts-preferences-reset"

jest.mock("./disassembly/disassemblypanel", () => ({ __esModule: true, default: () => null }))
jest.mock("./timetravelpanel", () => ({ __esModule: true, default: () => null }))
jest.mock("./state6502controls", () => ({ __esModule: true, default: () => null }))
jest.mock("./breakpoints/breakpointsview", () => ({ __esModule: true, default: () => null }))
jest.mock("./memory/memorymap", () => ({ __esModule: true, default: () => null }))
jest.mock("./stackdump", () => ({ __esModule: true, default: () => null }))
jest.mock("./memory/memorydump", () => ({ __esModule: true, default: () => null }))
jest.mock("./memory/heatmap_panel", () => ({ __esModule: true, default: () => null }))
jest.mock("../tabbase", () => ({ __esModule: true, default: () => null }))
jest.mock("../tab", () => ({ __esModule: true, default: () => null }))
jest.mock("../ui_settings", () => ({ isMinimalTheme: () => false }))
jest.mock("../localstorage", () => ({
  PREFERENCES_RESET_EVENT: "apple2ts-preferences-reset",
  getPreferenceDebugTabLeftWidth: () => {
    const saved = localStorage.getItem("debugTabLeftWidth")
    return saved ? Number(saved) : -1
  },
  setPreferenceDebugTabLeftWidth: jest.fn(),
}))

test("Debug tab drops a custom split width after Reset Settings", () => {
  localStorage.setItem("debugTabLeftWidth", "300")
  const container = document.createElement("div")
  document.body.appendChild(container)
  const root = createRoot(container)

  try {
    act(() => root.render(<DebugTab updateDisplay={jest.fn()} />))
    const leftColumn = container.querySelector(".debug-tab .flex-row > .flex-column-gap") as HTMLElement
    expect(leftColumn.style.width).toBe("300px")

    act(() => {
      localStorage.removeItem("debugTabLeftWidth")
      window.dispatchEvent(new CustomEvent(resetEvent))
    })
    expect(leftColumn.style.width).toBe("")
  } finally {
    act(() => root.unmount())
    container.remove()
    localStorage.removeItem("debugTabLeftWidth")
  }
})
