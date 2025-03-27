import { useState } from "react"

type DropdownProps = {
  currentIndex: number,
  itemNames: string[],
  icons: React.ReactNode[],
  closeCallback: (index: number) => void,
  icon: React.ReactNode,
  tooltip: string
}

export const DropdownButton = (props: DropdownProps) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false)
  const [position, setPosition] = useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleMenuClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setMenuOpen(true)
  }

  const handleMenuClose = (index = -1) => {
    setMenuOpen(false)
    if (index >= 0) props.closeCallback(index)
  }

  const hasIcons = props.icons && props.icons.length > 0

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={props.tooltip}
        onClick={handleMenuClick}
      >
        {props.icon}
      </button>
      {menuOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
          onClick={() => handleMenuClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {props.itemNames.map((item, index) => (
              <div className="droplist-option"
                style={{ padding: "5px", paddingRight: "10px" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                key={index} onClick={() => handleMenuClose(index)}>
                <span className="dropdown-checkmark">{index === props.currentIndex ? "\u2714" : ""}</span>
                {hasIcons && <span className="dropdown-icon">{props.icons[index]}</span>}
                <span style={hasIcons ? {marginLeft: "30px"} : {}}>{item}</span>
              </div>))}
          </div>
        </div>
      }

    </span>
  )
}
