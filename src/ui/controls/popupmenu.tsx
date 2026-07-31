import { useEffect, useRef, useState } from "react"
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
  const menuRef = useRef<HTMLDivElement>(null)
  const [posStyle, setPosStyle] = useState<{ left: number, top: number } | undefined>(undefined)

  useEffect(() => {
    if (!props.location || !menuRef.current) {
      setPosStyle(undefined)
      return
    }
    const rect = menuRef.current.getBoundingClientRect()
    const [x, y] = props.location
    // Account for the browser window's position on the physical screen.
    // window.screenY + chrome height gives the top of the viewport in screen coords.
    const chromeHeight = window.outerHeight - window.innerHeight
    const maxRight = Math.min(window.innerWidth, window.screen.availWidth - window.screenX)
    const maxBottom = Math.min(window.innerHeight, window.screen.availHeight - window.screenY - chromeHeight)
    setPosStyle({
      left: Math.max(0, Math.min(x, maxRight - rect.width)),
      top: Math.max(0, Math.min(y, maxBottom - rect.height)),
    })
  }, [props.location])

  const isItemDisabled = (menuItem: PopupMenuItem): boolean => {
    if (typeof menuItem.isDisabled === "function") {
      return menuItem.isDisabled()
    }
    return !!menuItem.isDisabled
  }

  return (
    props.location
      ? <div className="modal-overlay"
        style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        onClick={props.onClose}>
        <div ref={menuRef}
          className="floating-dialog flex-column droplist-option"
          onClick={(e) => e.stopPropagation()}
          style={{ ...posStyle, visibility: posStyle ? "visible" : "hidden", ...props.style }}>
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
                aria-disabled={isItemDisabled(menuItem) || undefined}
                className="droplist-option"
                style={{
                  cursor: isItemDisabled(menuItem) ? "default" : "pointer",
                  opacity: isItemDisabled(menuItem) ? 0.5 : 1,
                  padding: "5px",
                  pointerEvents: isItemDisabled(menuItem) ? "none" : "auto",
                }}
                onMouseOver={(e) => {
                  if (!isItemDisabled(menuItem))
                    e.currentTarget.style.backgroundColor = "#ccc"
                }}
                onMouseOut={(e) => {
                  if (!isItemDisabled(menuItem))
                    e.currentTarget.style.backgroundColor = "inherit"
                }}
                onClick={async (e) => {
                  e.stopPropagation()
                  if (isItemDisabled(menuItem))
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
