import ReactDOM from "react-dom/client"
import { act } from "react"
import LinkBuilder, { getBaseAppUrl } from "./linkbuilder"
import { DEFAULT_SLOT_CONFIG_GS } from "../../common/utility"
import { handleGetMachineName, handleGetMemSize, handleGetSlotConfig, handleGetSpeedMode } from "../main2worker"

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

  test("names the classic machine the user picked", () => {
    const root = ReactDOM.createRoot(container)
    act(() => {
      root.render(<LinkBuilder />)
    })
    openBuilder(container)
    expect(Array.from(container.querySelectorAll('select[name="Machine:"] option'))
      .map(option => (option as HTMLOptionElement).value))
      .toEqual([
        "Apple II+",
        "Apple IIe (unenhanced)",
        "Apple IIe (enhanced)",
        "Apple IIgs",
      ])
    // Classic rows 1 and 2 emit their machine= parameter; the IIe enhanced row
    // deliberately emits nothing so a link follows the visitor's own saved machine.
    pickOption(container, "Machine:", "Apple IIe (unenhanced)")
    expect(builtLink(container)).toContain("machine=apple2eu")
    pickOption(container, "Machine:", "Apple II+")
    expect(builtLink(container)).toContain("machine=apple2p")
    expect(builtLink(container)).not.toContain("apple2gs")
    pickOption(container, "Machine:", "Apple IIe (enhanced)")
    expect(builtLink(container)).not.toContain("machine=")
    act(() => {
      root.unmount()
    })
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

const CLASSIC_SLOT_CONFIG: SlotConfig = {
  1: "none",
  2: "vera",
  3: "aux",
  4: "mouse",
  5: "none",
  6: "disk2",
  7: "smartport",
}

// The link builder reads the running machine only through main2worker, so each
// case below has to say which machine the emulator is actually on.
const emulate = (machineName: MACHINE_NAME, memSize: number, speedMode: number, slotConfig: SlotConfig) => {
  ;(handleGetMachineName as jest.Mock).mockReturnValue(machineName)
  ;(handleGetMemSize as jest.Mock).mockReturnValue(memSize)
  ;(handleGetSpeedMode as jest.Mock).mockReturnValue(speedMode)
  ;(handleGetSlotConfig as jest.Mock).mockReturnValue(slotConfig)
}

const selectValue = (container: HTMLElement, name: string) =>
  (container.querySelector(`select[name="${name}"]`) as HTMLSelectElement).value

const openBuilder = (container: HTMLElement) => {
  const button = container.querySelector("button")
  act(() => {
    button!.dispatchEvent(new MouseEvent("click", { bubbles: true }))
  })
}

const builtLink = (container: HTMLElement) =>
  (container.querySelector("textarea[readonly]") as HTMLTextAreaElement).value

const pickOption = (container: HTMLElement, name: string, value: string) => {
  const select = container.querySelector(`select[name="${name}"]`) as HTMLSelectElement
  expect(select).not.toBeNull()
  act(() => {
    select.value = value
    select.dispatchEvent(new Event("change", { bubbles: true }))
  })
}

const typeUrl = (container: HTMLElement, placeholder: string, url: string) => {
  const input = container.querySelector(`input[placeholder="${placeholder}"]`) as HTMLInputElement
  expect(input).not.toBeNull()
  const setValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!
  act(() => {
    setValue.call(input, url)
    input.dispatchEvent(new Event("input", { bubbles: true }))
  })
}

describe("LinkBuilder Apple IIgs link", () => {
  let container: HTMLDivElement
  let root: ReactDOM.Root

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    emulate("APPLE2GS", 8192, 1, DEFAULT_SLOT_CONFIG_GS)
    root = ReactDOM.createRoot(container)
    act(() => {
      root.render(<LinkBuilder />)
    })
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
    emulate("APPLE2EE", 64, 0, CLASSIC_SLOT_CONFIG)
  })

  test("names the IIgs and keeps its own speed default out of the link", () => {
    openBuilder(container)
    const link = builtLink(container)
    // Without ?machine= the link opens whatever machine the visitor last used,
    // so a IIgs volume would be scanned by an IIe.
    expect(link).toContain("machine=apple2gs")
    expect(link).not.toContain("speed=")

    expect(selectValue(container, "Machine:")).toBe("Apple IIgs")
    expect(selectValue(container, "Speed of emulator:")).toBe("2.8 MHz")
  })

  test("carries a non-default IIgs speed through the IIgs labels", () => {
    // 1.02 MHz is the classic "Normal Speed (1 MHz)" row but index 2 of the GS
    // table; storing the classic label here makes the lookup miss and the speed
    // parameter silently disappears from the link.
    emulate("APPLE2GS", 8192, 0, DEFAULT_SLOT_CONFIG_GS)
    openBuilder(container)
    expect(selectValue(container, "Speed of emulator:")).toBe("1.02 MHz")
    expect(builtLink(container)).toContain("speed=normal")
  })

  test("offers the IIgs 3.5\" bays and mounts a URL in slot 5 drive 1", () => {
    openBuilder(container)
    expect(container.textContent).toContain("Slot 5 Drive 1 (3.5-inch Floppy 1)")
    expect(container.textContent).toContain("Slot 5 Drive 2 (3.5-inch Floppy 2)")
    expect(container.textContent).toContain("Slot 6 Drive 1 (Floppy 1)")
    expect(container.textContent).toContain("Slot 7 Drive 1 (Hard Drive 1)")

    pickOption(container, "Slot 5 Drive 1 (3.5-inch Floppy 1)", "Custom URL")
    typeUrl(container, "http://example.com/floppy35.dsk", "http://localhost:6503/SystemDisk.2mg")

    const link = builtLink(container)
    expect(link).toContain("s5d1=http%3A%2F%2Flocalhost%3A6503%2FSystemDisk.2mg")
    // The bay the user picked has to survive: a "#url" fragment can only ever be
    // the one startup disk, and it ignores which bay it belongs to.
    expect(link).not.toContain("#")
  })

  test("starts from IIgs slot defaults instead of the classic card list", () => {
    emulate("APPLE2EE", 4096, 0, CLASSIC_SLOT_CONFIG)
    openBuilder(container)
    const classicLink = builtLink(container)
    // Prove the panel really is holding this configuration before the switch.
    expect(classicLink).toContain("slot2=vera")
    expect(classicLink).toContain("slot4=mouse")
    expect(classicLink).toContain("ramdisk=4096")
    expect(classicLink).not.toContain("machine=")

    pickOption(container, "Machine:", "Apple IIgs")
    const link = builtLink(container)
    expect(link).toContain("machine=apple2gs")
    // None of these cards exist on a IIgs; carrying them over would put a
    // Mockingboard in the mouse port and a VERA SD drive in slot 2.
    for (const dead of ["slot1=", "slot2=", "slot3=", "slot4=", "slot5=", "slot6=", "ramdisk=", "tab=vera"]) {
      expect(link).not.toContain(dead)
    }
  })
})

