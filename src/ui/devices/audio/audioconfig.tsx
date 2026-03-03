import { useState } from "react"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { setPreferenceMockingboardMode } from "../../localstorage"
import {
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { getMidiCurrentIndex, getMidiDeviceNames, handleMidiDeviceSelect } from "./midiselect"

export const AudioConfig = () => {
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const midiNames = getMidiDeviceNames()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title="Audio Configuration"
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faMusic} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          ...Array.from(Array(MockingboardNames.length).keys()).map((i) => (
            {
              label: `Mockingboard ${MockingboardNames[i]}`,
              isSelected: () => { return i === getMockingboardMode() },
              onClick: () => {
                setPreferenceMockingboardMode(i)
              }
            }
          )),
          ...[{ label: "-" }],
          ...Array.from(Array(midiNames.length).keys()).map((i) => (
            {
              label: `MIDI ${midiNames[i]}`,
              isSelected: () => { return i === getMidiCurrentIndex() },
              onClick: () => {
                handleMidiDeviceSelect(i)
              }
            }
          ))
        ]]}
      />
    </span>
  )
}
