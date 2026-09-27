import { act } from "react"
import { createRoot, Root } from "react-dom/client"
import VeraTab from "./veratab"
import { passMouseEvent } from "../../main2worker"

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

if (typeof ImageData === "undefined") {
  (globalThis as unknown as { ImageData: unknown }).ImageData = class ImageData {
    data: Uint8ClampedArray
    width: number
    height: number
    constructor(data: Uint8ClampedArray, width: number, height: number) {
      this.data = data
      this.width = width
      this.height = height
    }
  }
}

jest.mock("../../main2worker", () => ({
  handleGetVeraFrame: jest.fn(() => ({
    fb: new Uint8ClampedArray(640 * 480 * 4),
    dcVideo: 3,
  })),
  handleGetShowAppleMouse: jest.fn(() => true),
  passMouseEvent: jest.fn(),
}))

const createMouseEvent = (type: string, props: Partial<MouseEventInit> = {}) => {
  const event = new MouseEvent(type, { bubbles: true, cancelable: true, ...props })
  if (props.clientX !== undefined) {
    Object.defineProperty(event, "clientX", { value: props.clientX })
  }
  if (props.clientY !== undefined) {
    Object.defineProperty(event, "clientY", { value: props.clientY })
  }
  if (props.button !== undefined) {
    Object.defineProperty(event, "button", { value: props.button })
  }
  if (props.buttons !== undefined) {
    Object.defineProperty(event, "buttons", { value: props.buttons })
  }
  return event
}

describe("VeraTab mouse support", () => {
  let container: HTMLDivElement | null = null
  let root: Root | null = null
  let getContextSpy: jest.SpyInstance

  beforeAll(() => {
    getContextSpy = jest.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      fillRect: jest.fn(),
      fillText: jest.fn(),
      beginPath: jest.fn(),
      moveTo: jest.fn(),
      lineTo: jest.fn(),
      stroke: jest.fn(),
      putImageData: jest.fn(),
    } as unknown as CanvasRenderingContext2D)
  })

  afterAll(() => {
    getContextSpy.mockRestore()
  })

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    jest.clearAllMocks()
  })

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount()
      })
      container.remove()
    }
  })

  test("renders vera canvas and forwards mouse move events with normalized coordinates", () => {
    act(() => {
      root!.render(<VeraTab />)
    })

    const canvas = container!.querySelector("#veraCanvas") as HTMLCanvasElement
    expect(canvas).not.toBeNull()

    // Mock getBoundingClientRect
    jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 100,
      top: 50,
      width: 640,
      height: 480,
      right: 740,
      bottom: 530,
      x: 100,
      y: 50,
      toJSON: () => {},
    })

    // Move to center of canvas (x=420, y=290 -> relative x=320, y=240 -> normalized x=0.5, y=0.5)
    act(() => {
      canvas.dispatchEvent(createMouseEvent("mousemove", {
        clientX: 420,
        clientY: 290,
      }))
    })

    expect(passMouseEvent).toHaveBeenCalledWith({
      x: 0.5,
      y: 0.5,
      buttons: -1,
    })
  })

  test("forwards mouse click events and focuses apple2canvas", () => {
    const apple2canvas = document.createElement("canvas")
    apple2canvas.id = "apple2canvas"
    const focusSpy = jest.spyOn(apple2canvas, "focus")
    document.body.appendChild(apple2canvas)

    act(() => {
      root!.render(<VeraTab />)
    })

    const canvas = container!.querySelector("#veraCanvas") as HTMLCanvasElement
    jest.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      left: 0,
      top: 0,
      width: 640,
      height: 480,
      right: 640,
      bottom: 480,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    // Mouse down at x=160 (0.25), y=120 (0.25)
    act(() => {
      canvas.dispatchEvent(createMouseEvent("mousedown", {
        clientX: 160,
        clientY: 120,
        button: 0,
      }))
    })

    expect(focusSpy).toHaveBeenCalled()
    expect(passMouseEvent).toHaveBeenCalledWith({
      x: 0.25,
      y: 0.25,
      buttons: 0x10,
    })

    // Mouse up
    act(() => {
      canvas.dispatchEvent(createMouseEvent("mouseup", {
        clientX: 160,
        clientY: 120,
        button: 0,
      }))
    })

    expect(passMouseEvent).toHaveBeenCalledWith({
      x: 0.25,
      y: 0.25,
      buttons: 0x00,
    })

    apple2canvas.remove()
  })

  test("releases buttons on window mouseup when no buttons held", () => {
    act(() => {
      root!.render(<VeraTab />)
    })

    act(() => {
      window.dispatchEvent(createMouseEvent("mouseup", {
        buttons: 0,
      }))
    })

    expect(passMouseEvent).toHaveBeenCalledWith({ x: 0, y: 0, buttons: 0x00 })
    expect(passMouseEvent).toHaveBeenCalledWith({ x: 0, y: 0, buttons: 0x01 })
  })

  test("prevents context menu when apple mouse is enabled", () => {
    act(() => {
      root!.render(<VeraTab />)
    })

    const canvas = container!.querySelector("#veraCanvas") as HTMLCanvasElement
    const event = createMouseEvent("contextmenu")
    const preventDefaultSpy = jest.spyOn(event, "preventDefault")

    act(() => {
      canvas.dispatchEvent(event)
    })

    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
