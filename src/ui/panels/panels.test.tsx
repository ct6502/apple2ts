import { act } from "react"
import { createRoot, Root } from "react-dom/client"
import DebugSection from "./panels"
import { setTabView } from "../ui_settings"
import { VERA_VIDEO_STARTED_EVENT } from "../vera_events"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const slotConfig: SlotConfig = {
  1: "none",
  2: "none",
  3: "aux",
  4: "none",
  5: "mouse",
  6: "disk2",
  7: "smartport",
}
let machineName: MACHINE_NAME = "APPLE2EE"

jest.mock("../../i18n/useTranslation", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

jest.mock("../flyout", () => ({
  __esModule: true,
  default: (props: { children: React.ReactNode }) => <div>{props.children}</div>,
}))

jest.mock("./debugtab", () => ({ __esModule: true, default: () => <div id="debug-content" /> }))
jest.mock("./basic/basic_tab", () => ({ __esModule: true, default: () => <div id="basic-content" /> }))
jest.mock("./expectin/expectintab", () => ({ __esModule: true, default: () => <div id="expectin-content" /> }))
jest.mock("./help/helptab", () => ({ __esModule: true, default: () => <div id="help-content" /> }))
jest.mock("./agent/agent_tab", () => ({ __esModule: true, default: () => <div id="agent-content" /> }))
jest.mock("./vera/veratab", () => ({ __esModule: true, default: () => <div id="vera-content" /> }))

jest.mock("../main2worker", () => ({
  handleGetShowDebugTab: jest.fn(() => false),
  handleGetMachineName: jest.fn(() => machineName),
  handleGetSlotConfig: jest.fn(() => slotConfig),
  passSetIsDebugging: jest.fn(),
  passSetShowDebugTab: jest.fn(),
}))

const updateDisplay = jest.fn() as unknown as UpdateDisplay

describe("DebugSection tab visibility", () => {
  let container: HTMLDivElement | null = null
  let root: Root | null = null

  const render = () => {
    act(() => {
      root!.render(<DebugSection updateDisplay={updateDisplay} narrow={false} />)
    })
  }

  const tabTitles = () => Array.from(container!.querySelectorAll(".dbg-tab"))
    .map(tab => tab.getAttribute("title"))

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    machineName = "APPLE2EE"
    slotConfig[2] = "none"
    slotConfig[4] = "none"
    setTabView(0)
  })

  afterEach(() => {
    act(() => {
      root!.unmount()
    })
    container!.remove()
    setTabView(0)
  })

  test("shows the VERA monitor tab when the card is installed", () => {
    slotConfig[2] = "vera"
    render()
    expect(tabTitles()).toContain("debug.veraMonitor")
    expect(tabTitles()).toContain("debug.debugTab")
  })

  test("hides the VERA monitor tab when no slot holds the card", () => {
    render()
    expect(tabTitles()).not.toContain("debug.veraMonitor")
  })

  test("moves off the VERA tab when the card is removed", () => {
    setTabView(4)
    render()
    expect(container!.querySelector(".dbg-tab-active")?.getAttribute("title")).toBe("debug.helpTab")
    expect(container!.querySelector("#help-content")).not.toBeNull()
  })

  test("opens the VERA monitor when a VERA title starts drawing", () => {
    slotConfig[2] = "vera"
    render()
    expect(container!.querySelector("#help-content")).not.toBeNull()

    act(() => {
      window.dispatchEvent(new Event(VERA_VIDEO_STARTED_EVENT))
    })

    expect(container!.querySelector(".dbg-tab-active")?.getAttribute("title")).toBe("debug.veraMonitor")
    expect(container!.querySelector("#vera-content")).not.toBeNull()
  })

  test("ignores the VERA start when no card is installed", () => {
    render()

    act(() => {
      window.dispatchEvent(new Event(VERA_VIDEO_STARTED_EVENT))
    })

    expect(container!.querySelector("#help-content")).not.toBeNull()
  })

  test("hides the debugger and exPectin tabs on the IIgs", () => {
    machineName = "APPLE2GS"
    render()
    expect(tabTitles()).not.toContain("debug.debugTab")
    expect(tabTitles()).not.toContain("debug.expectinTab")
    expect(container!.querySelector("#tour-debug-button")).toBeNull()
  })

  test("moves off the debugger tab on the IIgs", () => {
    machineName = "APPLE2GS"
    setTabView(1)
    render()
    expect(container!.querySelector("#debug-content")).toBeNull()
    expect(container!.querySelector("#help-content")).not.toBeNull()
  })

  test("moves off the exPectin tab on the IIgs", () => {
    machineName = "APPLE2GS"
    setTabView(3)
    render()
    expect(container!.querySelector("#expectin-content")).toBeNull()
    expect(container!.querySelector("#help-content")).not.toBeNull()
  })
})
