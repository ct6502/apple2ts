import { navigateToTourStep, tourTargetForStep } from "./tourutils"
import { getTourSettings } from "./toursettings"

describe("guided tour menu integration", () => {
  test("navigates to a tagged menu target before changing steps", () => {
    const setTourIndex = jest.fn()

    navigateToTourStep([{ target: "#tour-boot-button" }], 0, setTourIndex)

    expect(setTourIndex).toHaveBeenCalledWith(0)
  })

  test("targets the Tours submenu for the final Retro step", () => {
    expect(tourTargetForStep(
      [{ target: "#tour-boot-button" }, { target: "body" }],
      1,
      "#tour-help-menu",
    )).toBe("#tour-help-menu")
  })

  test("does not open the Info Panel during the Settings tour", () => {
    const steps = getTourSettings((key: string) => key)

    expect(steps.find(step => step.target === "#tour-debug-button")?.data).toBeUndefined()
  })
})