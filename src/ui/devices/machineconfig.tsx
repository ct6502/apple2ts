import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize } from "../main2worker"
import { EMULATOR_PREFERENCE, setEmulatorPreference } from "../localstorage"
import PopupMenu from "../controls/popupmenu"

export const MachineConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2EU", "APPLE2EE"]
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
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...Array.from(Array(2).keys()).map((i) => (
            {
              label: roms[i],
              isSelected: () => { return machineName === machineNames[i] },
              onClick: () => {
                setEmulatorPreference(EMULATOR_PREFERENCE.MACHINE_NAME, machineNames[i])
                props.updateDisplay()
              }
            }
          )),
          ...[{ label: "-" }],
          ...Array.from(Array(5).keys()).map((i) => (
            {
              label: names[i],
              isSelected: () => { return extraMemSize === sizes[i] },
              onClick: () => {
                setEmulatorPreference(EMULATOR_PREFERENCE.RAMWORKS, sizes[i])
                props.updateDisplay()
              }
            }
          ))
        ]]}
      />

    </span>
  )
}
