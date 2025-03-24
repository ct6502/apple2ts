import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize } from "../main2worker"
import { setPreferenceMachineName, setPreferenceRamWorks } from "../localstorage"
import PopupMenu from "../controls/popupmenu"

export const MachineConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const [popupLocation, setPopupLocation] = React.useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const handleRamWorksClose = (index: number) => () => {
    setPopupLocation(undefined)
    if (index >= 0) {
      setPreferenceRamWorks(sizes[index])
      props.updateDisplay()
    }
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2EU", "APPLE2EE"]

  const handleRomClose = (index = -1) => () => {
    setPopupLocation(undefined)
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

      <PopupMenu
        location={popupLocation}
        onClick={handleRamWorksClose}
        menuItems={[
          ...[0, 1].map((i) => (
            {
              label: roms[i],
              index: i,
              isSelected: (selectedIndex: number) => { return machineName === machineNames[selectedIndex] },
              onClick: handleRomClose
            }
          )),
          ...[{ label: "-" }],
          ...[0, 1, 2, 3, 4].map((i) => (
            {
              label: names[i],
              index: i,
              isSelected: (selectedIndex: number) => { return extraMemSize === sizes[selectedIndex] },
              onClick: handleRamWorksClose
            }
          ))
        ]}
      />

    </span>
  )
}
