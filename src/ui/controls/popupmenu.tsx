import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type PopupMenuProps = {
  location: [number, number] | undefined
  menuItems: Array<Array<MenuItem>>
  menuIndex?: number
  style?: any
  isSelected?: (selectedIndex: number) => boolean
  onClick: (selectedIndex: number) => () => void
}

const PopupMenu = (props: PopupMenuProps) => {

  const getPopupLocationStyle = () => {
    if (!props.location) {
      return {}
    }

    const [x, y] = props.location
    let w = 0
    let h = 0

    props.menuItems[props.menuIndex || 0].forEach((menuItem) => {
      if (menuItem.label == "-") {
        w = Math.max(w, 9)
        h += 16
      } else {
        w = Math.max(w, menuItem.label.length * 9)
        h += 28
      }
    })

    return {
      left: Math.min(x, window.innerWidth - w),
      top: Math.min(y, window.innerHeight - h),
      ...props.style
    }
  }

  return (
    props.location
      ? <div className="modal-overlay"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        onClick={props.onClick(-1)}>
        <div className="floating-dialog flex-column droplist-option"
          style={getPopupLocationStyle()}>
          {props.menuItems[props.menuIndex || 0].map((menuItem, menuIndex) => (
            (menuItem.isVisible == undefined || menuItem.isVisible()) &&
            (menuItem.label == "-"
              ? <div
                  key={`popup-${menuIndex}-${menuItem.index}`}
                  style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}>
                </div>
              : <div
                  key={`popup-${menuIndex}-${menuItem.index}`}
                  className="droplist-option" style={{ padding: "5px" }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                  onClick={menuItem.onClick ? menuItem.onClick(menuItem.index || 0) : props.onClick(menuItem.index || 0)}>
                  {(menuItem.isSelected && menuItem.isSelected(menuItem.index || 0))
                    || (props.isSelected && props.isSelected(menuItem.index || 0))
                    ? "\u2714\u2009"
                    : "\u2003"}
                    {menuItem.icon && <FontAwesomeIcon icon={menuItem.icon} style={{ width: "24px" }} />}
                    {menuItem.svg && menuItem.svg}
                    {menuItem.label}
                </div>)
            ))}
        </div>
      </div>
      : <div></div>
  )
}

export default PopupMenu