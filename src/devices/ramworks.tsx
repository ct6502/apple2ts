import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
} from "@fortawesome/free-solid-svg-icons";
import { handleGetMemSize, passSetRAMWorks } from "../main2worker";

export const RamworksSelect = (props: { updateDisplay: UpdateDisplay }) => {
  const [droplistOpen, setDroplistOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setDroplistOpen(true);
  }

  const handleClose = (index = -1) => {
    setDroplistOpen(false);
    if (index >= 0) {
      passSetRAMWorks(memory[index])
      props.updateDisplay()
    }
  }

  const names = ["64 KB (AUX)", "512 KB", "1024 KB", "4 MB", "8 MB", "16 MB"]
  const memory = [64, 512, 1024, 4096, 8192, 16384]
  const extraMemSize = handleGetMemSize()


  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Ramworks memory size"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faMicrochip} />
      </button>
      {droplistOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div className="droplist-option" style={{ padding: '5px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleClose(i)}>
                {(extraMemSize === memory[i]) ? '\u2714\u2009' : '\u2003'}{names[i]}
              </div>))}
          </div>

        </div>
      }

    </span>
  )
}
