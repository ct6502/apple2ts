import React from "react";
import { serialport } from "./img/db9"
import { changeSerialMode, getSerialMode, getSerialName } from "./serialhub";

export const SerialPortSelect = () => {
  const [serialOpen, setSerialOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleSerialClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setSerialOpen(true);
  }

  const handleSerialClose = (index = -1) => {
    setSerialOpen(false);
    if (index >= 0) changeSerialMode(index)
  }

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Serial Port Select"
        onClick={handleSerialClick}
      >
        <svg width="30" height="30" className="fill-color">{serialport}</svg>
      </button>
      {serialOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
          onClick={() => handleSerialClose()}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {[0, 1].map((i) => (
              <div className="droplist-option" style={{ padding: '5px' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ccc'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'inherit'}
                key={i} onClick={() => handleSerialClose(i)}>
                {i === getSerialMode() ? '\u2714\u2009' : '\u2003'}{getSerialName(i)}
              </div>))}
          </div>
        </div>
      }
    </span>
  )
}
