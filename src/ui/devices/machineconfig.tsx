import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize } from "../main2worker"
import { setPreferenceMachineName, setPreferenceRamWorks } from "../localstorage"

export const MachineConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const [droplistOpen, setDroplistOpen] = React.useState<boolean>(false)
  const [position, setPosition] = React.useState<{ x: number, y: number }>({ x: 0, y: 0 })

  const handleClick = (event: React.MouseEvent) => {
    const y = Math.min(event.clientY, window.innerHeight - 200)
    setPosition({ x: event.clientX, y: y })
    setDroplistOpen(true)
  }

  const handleRamWorksClose = (index: number) => {
    setDroplistOpen(false)
    if (index >= 0) {
      setPreferenceRamWorks(sizes[index])
      props.updateDisplay()
    }
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2EU", "APPLE2EE"]

  const handleRomClose = (index = -1) => {
    setDroplistOpen(false)
    if (index >= 0) {
      setPreferenceMachineName(machineNames[index])
      props.updateDisplay()
    }
  }

  const roms = ["Apple IIe (unenhanced)", "Apple IIe (enhanced)"]
  const names = ["64 KB (AUX)", "512 KB", "1024 KB", "4 MB", "8 MB"]
  const sizes = [64, 512, 1024, 4096, 8192]
  const extraMemSize = handleGetMemSize()
  const machineName = handleGetMachineName()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Machine Configuration"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>
      {droplistOpen &&
        <div className="modal-overlay"
          style={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
          onClick={() => handleRamWorksClose(-1)}>
          <div className="floating-dialog flex-column droplist-option"
            style={{ left: position.x, top: position.y }}>
            {[0, 1].map((i) => (
              <div className="droplist-option" style={{ padding: "5px" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                key={i} onClick={() => handleRomClose(i)}>
                {(machineName === machineNames[i]) ? "\u2714\u2009" : "\u2003"}{roms[i]}
              </div>))}
            <div style={{ borderTop: "1px solid #aaa", margin: "5px 0" }}></div>
            {[0, 1, 2, 3, 4].map((i) => (
              <div className="droplist-option" style={{ padding: "5px" }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#ccc"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "inherit"}
                key={i} onClick={() => handleRamWorksClose(i)}>
                {(extraMemSize === sizes[i]) ? "\u2714\u2009" : "\u2003"}{names[i]}
              </div>))}
          </div>

        </div>
      }

    </span>
  )
}
