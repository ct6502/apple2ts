const swipeThresholdPx = 24

export const getPanelSwipeKey = (deltaX: number, deltaY: number): string | undefined => {
  if (Math.max(Math.abs(deltaX), Math.abs(deltaY)) < swipeThresholdPx) return undefined
  return Math.abs(deltaX) > Math.abs(deltaY)
    ? deltaX < 0 ? "ArrowLeft" : "ArrowRight"
    : deltaY < 0 ? "ArrowUp" : "ArrowDown"
}