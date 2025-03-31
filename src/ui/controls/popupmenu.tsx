import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

type PopupMenuProps = {
  location: [number, number] | undefined
  menuItems: Array<Array<PopupMenuItem>>
  menuIndex?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
  onClose: () => void
}

const PopupMenu = (props: PopupMenuProps) => {

  const getPopupLocationStyle = () => {
    if (!props.location) {
      return {}
    }

    const [x, y] = props.location
    let w = 0
    let h = 0

    props.menuItems[props.menuIndex || 0].filter(value => value.isVisible == undefined || value.isVisible()).map((menuItem) => {
      if (menuItem.label == "-") {
        w = Math.max(w, 9)
        h += 12
      } else {
        w = Math.max(w, menuItem.label.length * 9)
        h += 26
      }
    })
    h += 22

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
        onClick={props.onClose}>
        <div className="floating-dialog flex-column droplist-option"
          style={getPopupLocationStyle()}>
          {props.menuItems[props.menuIndex || 0].map((menuItem, menuIndex) => (
            (menuItem.isVisible == undefined || menuItem.isVisible()) &&
            (menuItem.label == "-"
              ? <div
                key={`popup-${menuIndex}-${menuIndex}`}
                style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}>
              </div>
              : <div
                key={`popup-${menuIndex}-${menuIndex}`}
                className="droplist-option" style={{ padding: "5px" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                onClick={menuItem.onClick}>
                {menuItem.isSelected != undefined && menuItem.isSelected()
                  ? "\u2714\u2009"
                  : "\u2003\u2007"}
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