export const subscribeViewportResize = (listener: () => void) => {
  window.addEventListener("resize", listener)
  window.visualViewport?.addEventListener("resize", listener)

  return () => {
    window.removeEventListener("resize", listener)
    window.visualViewport?.removeEventListener("resize", listener)
  }
}
