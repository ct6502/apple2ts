import { renderToStaticMarkup } from "react-dom/server"
import PopupMenu from "./popupmenu"

describe("PopupMenu", () => {
  it("reserves the same selection-marker column for every option", () => {
    const menuItems: PopupMenuItem[] = [
      { label: "Selected", isSelected: () => true },
      { label: "Unselected", isSelected: () => false },
    ]

    const html = renderToStaticMarkup(
      <PopupMenu
        location={[0, 0]}
        menuItems={[menuItems]}
        onClose={jest.fn()}
      />
    )

    expect(html.match(/class="popup-selection-marker"/g)).toHaveLength(2)
    expect(html).toContain("class=\"popup-selection-marker\">✔</span>")
    expect(html).toContain("class=\"popup-selection-marker\"></span>")
  })
})
