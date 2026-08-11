import { renderToStaticMarkup } from "react-dom/server"
import { ControlAvailabilityIcon } from "./controlavailabilityicon"

describe("ControlAvailabilityIcon", () => {
  it("renders its normal icon without an unavailable overlay", () => {
    const html = renderToStaticMarkup(
      <ControlAvailabilityIcon><span>control</span></ControlAvailabilityIcon>,
    )

    expect(html).toContain("control-availability-icon")
    expect(html).not.toContain("control-unavailable-badge")
  })

  it("adds a decorative unavailable overlay", () => {
    const html = renderToStaticMarkup(
      <ControlAvailabilityIcon unavailable>
        <span>control</span>
      </ControlAvailabilityIcon>,
    )

    expect(html).toContain("control-unavailable-badge")
    expect(html).toContain("aria-hidden=\"true\"")
  })
})
