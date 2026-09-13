import { ProcessDisplay } from "../graphics"
import { captureRenderedScreen } from "./remotecontrol_screen"

jest.mock("../graphics", () => ({ ProcessDisplay: jest.fn() }))

afterEach(() => {
  document.body.replaceChildren()
  jest.restoreAllMocks()
  jest.resetAllMocks()
})

const createScreen = () => {
  const canvas = document.createElement("canvas")
  canvas.id = "apple2canvas"
  canvas.width = 560
  canvas.height = 384
  const hidden = document.createElement("canvas")
  hidden.id = "hiddenCanvas"
  const ctx = {} as CanvasRenderingContext2D
  const hiddenCtx = {} as CanvasRenderingContext2D
  jest.spyOn(canvas, "getContext").mockReturnValue(ctx)
  jest.spyOn(hidden, "getContext").mockReturnValue(hiddenCtx)
  const encode = jest.spyOn(canvas, "toDataURL").mockImplementation(() => {
    expect(ProcessDisplay).toHaveBeenCalledWith(ctx, hiddenCtx, 560, 384)
    return "data:image/png;base64,AQID"
  })
  document.body.append(canvas, hidden)
  return { canvas, hidden, encode }
}

test("draws before capture without waiting for animation callbacks", async () => {
  const frame = jest.spyOn(window, "requestAnimationFrame").mockReturnValue(17)
  const timer = jest.spyOn(window, "setTimeout")
  const { encode } = createScreen()
  await expect(captureRenderedScreen()).resolves.toEqual({
    mimeType: "image/png", dataBase64: "AQID", width: 560, height: 384,
  })
  expect(ProcessDisplay).toHaveBeenCalledTimes(1)
  expect(encode).toHaveBeenCalledWith("image/png")
  expect(frame).not.toHaveBeenCalled()
  expect(timer).not.toHaveBeenCalled()
})

test.each(["apple2canvas", "hiddenCanvas"])("rejects a missing %s", async (id) => {
  createScreen()
  document.getElementById(id)?.remove()
  await expect(captureRenderedScreen()).rejects.toThrow("screen is unavailable")
  expect(ProcessDisplay).not.toHaveBeenCalled()
})

test.each(["canvas", "hidden"] as const)("rejects an unavailable %s context", async (name) => {
  const screen = createScreen()
  jest.spyOn(screen[name], "getContext").mockReturnValue(null)
  await expect(captureRenderedScreen()).rejects.toThrow("screen is unavailable")
  expect(screen.encode).not.toHaveBeenCalled()
})

test("does not return stale pixels after a drawing failure", async () => {
  const { encode } = createScreen()
  jest.mocked(ProcessDisplay).mockImplementation(() => { throw new Error("draw failed") })
  await expect(captureRenderedScreen()).rejects.toThrow("draw failed")
  expect(encode).not.toHaveBeenCalled()
})
