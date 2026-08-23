import { subscribeViewportResize } from "./viewport"

describe("subscribeViewportResize", () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport")

  afterEach(() => {
    if (originalVisualViewport) {
      Object.defineProperty(window, "visualViewport", originalVisualViewport)
    } else {
      delete (window as { visualViewport?: VisualViewport }).visualViewport
    }
  })

  it("observes and cleans up window and visual viewport resizes", () => {
    const visualViewport = new EventTarget()
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport,
    })
    const listener = jest.fn()
    const unsubscribe = subscribeViewportResize(listener)

    window.dispatchEvent(new Event("resize"))
    visualViewport.dispatchEvent(new Event("resize"))
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    window.dispatchEvent(new Event("resize"))
    visualViewport.dispatchEvent(new Event("resize"))
    expect(listener).toHaveBeenCalledTimes(2)
  })
})
