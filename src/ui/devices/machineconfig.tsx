import { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
  faGear,
} from "@fortawesome/free-solid-svg-icons"
import { handleGetMachineName, handleGetMemSize, handleGetVeraSlot } from "../main2worker"
import { setPreferenceMachineName, setPreferenceRamWorks, setPreferenceVeraSlot } from "../localstorage"
import PopupMenu from "../controls/popupmenu"
import { useTranslation } from "../../i18n/useTranslation"

export const MachineConfig = (props: { updateDisplay: UpdateDisplay }) => {
  const { t } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const machineNames: MACHINE_NAME[] = ["APPLE2P", "APPLE2EU", "APPLE2EE"]
  const roms = [t("machine.models.apple2p"), t("machine.models.apple2eu"), t("machine.models.apple2ee")]
  const names = [t("machine.ram.64kb_aux"), t("machine.ram.512kb"), t("machine.ram.1024kb"), t("machine.ram.4mb"), t("machine.ram.8mb")]
  const sizes = [64, 512, 1024, 4096, 8192]
  const extraMemSize = handleGetMemSize()
  const machineName = handleGetMachineName()
  const veraSlot = handleGetVeraSlot()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("machine.configuration")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faGear} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...Array.from(Array(3).keys()).map((i) => (
            {
              label: roms[i],
              isSelected: () => { return machineName === machineNames[i] },
              onClick: () => {
                setPreferenceMachineName(machineNames[i])
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
                setPreferenceRamWorks(sizes[i])
                props.updateDisplay()
              }
            }
          )),
          ...[{ label: "-" }],
          ...[{
            label: "No VERA",
            isSelected: () => { return veraSlot === 0 },
            onClick: () => {
              setPreferenceVeraSlot(0)
              props.updateDisplay()
            }
          }],
          ...([2, 4] as VERA_SLOT[]).map((slot) => (
            {
              label: `VERA in slot ${slot} ${slot === 2 ? "(replaces Passport)" : "(replaces Mockingboard)"}`,
              isSelected: () => { return veraSlot === slot },
              onClick: () => {
                setPreferenceVeraSlot(slot)
                props.updateDisplay()
              }
            }
          ))
        ]]}
      />

    </span>
  )
}
