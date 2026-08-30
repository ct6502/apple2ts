import { captureRenderedScreen } from "./remotecontrol_screen"

afterEach(() => {
  document.body.replaceChildren()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

test("captures the rendered screen after its next display refresh", async () => {
  const callbacks: FrameRequestCallback[] = []
  jest.spyOn(window, "requestAnimationFrame").mockImplementation((callback) => {
    callbacks.push(callback)
    return callbacks.length
  })
  jest.spyOn(performance, "now").mockReturnValue(100)

  const canvas = document.createElement("canvas")
  canvas.id = "apple2canvas"
  canvas.width = 560
  canvas.height = 384
  jest.spyOn(canvas, "toDataURL").mockReturnValue("data:image/png;base64,AQID")
  document.body.append(canvas)

  const capture = captureRenderedScreen()
  expect(canvas.toDataURL).not.toHaveBeenCalled()

  callbacks.shift()?.(110)
  callbacks.shift()?.(125)

  await expect(capture).resolves.toEqual({
    mimeType: "image/png",
    dataBase64: "AQID",
    width: 560,
    height: 384,
  })
  expect(canvas.toDataURL).toHaveBeenCalledWith("image/png")
})

test("rejects when the rendered screen is unavailable", async () => {
  await expect(captureRenderedScreen()).rejects.toThrow("screen is unavailable")
})

test("rejects when the rendered screen does not refresh", async () => {
  jest.useFakeTimers()
  const frameId = 17
  jest.spyOn(window, "requestAnimationFrame").mockReturnValue(frameId)
  const cancelFrame = jest.spyOn(window, "cancelAnimationFrame").mockImplementation()

  const canvas = document.createElement("canvas")
  canvas.id = "apple2canvas"
  document.body.append(canvas)

  const capture = captureRenderedScreen()
  jest.advanceTimersByTime(1000)

  await expect(capture).rejects.toThrow("screen did not refresh")
  expect(cancelFrame).toHaveBeenCalledWith(frameId)
})
