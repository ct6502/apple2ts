type TourTargetStep = { target?: unknown }

export const tourTargetForStep = (
  tour: readonly TourTargetStep[],
  index: number,
  endTarget?: string,
) => endTarget && index === tour.length - 1 ? endTarget : tour[index]?.target

export const navigateToTourStep = (
  _tour: readonly TourTargetStep[],
  index: number,
  setTourIndex: (index: number) => void,
) => {
  setTourIndex(index)
}