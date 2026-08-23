import { useEffect, useRef, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faCaretRight } from "@fortawesome/free-solid-svg-icons"

type PopupMenuProps = {
  location: [number, number] | undefined
  menuItems: Array<Array<PopupMenuItem>>
  menuIndex?: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  style?: any
  submenu?: boolean
  onClose: () => void
}

const PopupMenu = (props: PopupMenuProps) => {

  const menuRef = useRef<HTMLDivElement>(null)
  const [posStyle, setPosStyle] = useState<{ left: number, top: number } | undefined>(undefined)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [activeSubMenu, setActiveSubMenu] = useState<{ parentIndex: number, location: [number, number], items: PopupMenuItem[] } | null>(null)

  useEffect(() => {
    if (!props.location || !menuRef.current) {
      setPosStyle(undefined)
      setActiveSubMenu(null)
      setHoveredIndex(null)
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

  if (!props.location) {
    return null
  }

  const popupMenuDiv =
    <div ref={menuRef}
      className="floating-dialog flex-column droplist-option"
      onClick={(e) => e.stopPropagation()}
      style={{ ...posStyle,
        visibility: posStyle ? "visible" : "hidden",
        ...props.style,
        zIndex: props.submenu ? 9991 : 9990 }}>
      {props.menuItems[props.menuIndex || 0].map((menuItem, menuIndex) => (
        (menuItem.isVisible == undefined || menuItem.isVisible()) &&
        (menuItem.label == "-"
          ? <div
            key={`popup-${menuIndex}`}
            style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}>
          </div>
          : menuItem.isHeading
            ? <div
              key={`popup-${menuIndex}`}
              style={{
                cursor: "default",
                fontWeight: 800,
                padding: "5px 8px 2px",
              }}>
              {menuItem.label}
            </div>
          : <div
            key={`popup-${menuIndex}`}
            aria-disabled={isItemDisabled(menuItem) || undefined}
            className="droplist-option"
            style={{
              cursor: isItemDisabled(menuItem) ? "default" : "pointer",
              opacity: isItemDisabled(menuItem) ? 0.5 : 1,
              padding: "5px",
              pointerEvents: isItemDisabled(menuItem) ? "none" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: (hoveredIndex === menuIndex || (activeSubMenu && activeSubMenu.parentIndex === menuIndex)) ? "#ccc" : "inherit",
            }}
            onMouseOver={(e) => {
              if (!isItemDisabled(menuItem)) {
                setHoveredIndex(menuIndex)
                if (menuItem.subMenu && menuItem.subMenu.length > 0) {
                  const rect = e.currentTarget.getBoundingClientRect()
                  setActiveSubMenu({
                    parentIndex: menuIndex,
                    location: [rect.right - 4, rect.top],
                    items: menuItem.subMenu
                  })
                } else {
                  setActiveSubMenu(null)
                }
              }
            }}
            onMouseOut={() => {
              setHoveredIndex(null)
            }}
            onClick={async (e) => {
              e.stopPropagation()
              if (isItemDisabled(menuItem))
                return
              if (menuItem.subMenu && menuItem.subMenu.length > 0) {
                const rect = e.currentTarget.getBoundingClientRect()
                setActiveSubMenu({
                  parentIndex: menuIndex,
                  location: [rect.right - 4, rect.top],
                  items: menuItem.subMenu
                })
                return
              }
              if (menuItem.onClick) {
                await menuItem.onClick()
              }
              props.onClose()
            }}>
            <span className="popup-item-main">
              <span className="popup-selection-marker">
                {menuItem.isSelected?.() ? "\u2714" : ""}
              </span>
              <span className="popup-item-label">
                {menuItem.icon && <FontAwesomeIcon icon={menuItem.icon} style={{ width: "24px" }} />}
                {menuItem.svg && menuItem.svg}
                {`${menuItem.label}\u2004`}
              </span>
            </span>
            {menuItem.subMenu && menuItem.subMenu.length > 0 && (
              <FontAwesomeIcon icon={faCaretRight} style={{ marginLeft: "12px", opacity: 0.7 }} />
            )}
          </div>)
      ))}
    </div>

  // If we are a submenu we do not need our modal-overlay since we're already inside it
  if (props.submenu) {
    return <>{popupMenuDiv}</>
  }

  return (
    <div className="modal-overlay"
      style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      onClick={props.onClose}>
      {popupMenuDiv}
      {activeSubMenu && (
        <PopupMenu
          location={activeSubMenu.location}
          menuItems={[activeSubMenu.items]}
          onClose={() => {
            setActiveSubMenu(null)
            // props.onClose()
          }}
          submenu={true}
        />
      )}
    </div>
  )
}

export default PopupMenu
