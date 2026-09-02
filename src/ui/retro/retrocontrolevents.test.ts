import {
  OPEN_RETRO_CONTROL_PANEL_EVENT,
  openRetroControlPanel,
} from "./retrocontrolevents"

describe("openRetroControlPanel", () => {
  afterEach(() => {
    document.body.replaceChildren()
    jest.restoreAllMocks()
  })

  test("focuses the canvas before dispatching the control-panel toggle event", () => {
    const canvas = document.createElement("canvas")
    canvas.id = "apple2canvas"
    document.body.appendChild(canvas)
    const focus = jest.spyOn(canvas, "focus")
    const handleOpen = jest.fn(() => {
      expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    })
    window.addEventListener(OPEN_RETRO_CONTROL_PANEL_EVENT, handleOpen, { once: true })

    openRetroControlPanel()

    expect(handleOpen).toHaveBeenCalledTimes(1)
  })
})
