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

  const isTouchDevice = "ontouchstart" in document.documentElement

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
        w = Math.max(w, menuItem.label.length * 10)
        h += menuItem.isHeading ? 24 : 26
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
          onClick={(e) => e.stopPropagation()}
          style={getPopupLocationStyle()}>
          {props.menuItems[props.menuIndex || 0].map((menuItem, menuIndex) => (
            (menuItem.isVisible == undefined || menuItem.isVisible()) &&
            (menuItem.label == "-"
              ? <div
                key={`popup-${menuIndex}-${menuIndex}`}
                style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}>
              </div>
              : menuItem.isHeading
                ? <div
                  key={`popup-${menuIndex}-${menuIndex}`}
                  style={{
                    cursor: "default",
                    fontWeight: 800,
                    padding: "5px 8px 2px",
                  }}>
                  {menuItem.label}
                </div>
              : <div
                key={`popup-${menuIndex}-${menuIndex}`}
                aria-disabled={menuItem.isDisabled || undefined}
                className="droplist-option"
                style={{
                  cursor: menuItem.isDisabled ? "default" : "pointer",
                  opacity: menuItem.isDisabled ? 0.5 : 1,
                  padding: "5px",
                }}
                onMouseOver={(e) => {
                  if (!menuItem.isDisabled)
                    e.currentTarget.style.backgroundColor = "#ccc"
                }}
                onMouseOut={(e) => {
                  if (!menuItem.isDisabled)
                    e.currentTarget.style.backgroundColor = "inherit"
                }}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (menuItem.isDisabled)
                    return
                  if (menuItem.onClick) {
                    await menuItem.onClick()
                  }
                  props.onClose()
                }}>
                {menuItem.isSelected != undefined && menuItem.isSelected()
                  ? "\u2714\u2009"
                  : `${isTouchDevice ? "\u2003" : "\u2004"}\u2007`}
                {menuItem.icon && <FontAwesomeIcon icon={menuItem.icon} style={{ width: "24px" }} />}
                {menuItem.svg && menuItem.svg}
                {`${menuItem.label}\u2004`}
              </div>)
          ))}
        </div>
      </div>
      : <div></div>
  )
}

export default PopupMenu
