import { useState } from "react"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { setPreferenceMockingboardMode } from "../../localstorage"
import {
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { getMidiDeviceOptions, handleMidiDeviceSelect, isMidiDeviceSelected } from "./midiselect"

import { useTranslation } from "../../../i18n/useTranslation"

export const AudioConfig = () => {
  const { t } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const midiOptions = getMidiDeviceOptions()

  return (
    <span>
      <button
        id="basic-button"
        className="push-button"
        title={t("audio.configuration")}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faMusic} />
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[[
          { label: t("audio.mockingboard") || "Mockingboard", isHeading: true },
          ...Array.from(Array(MockingboardNames.length).keys()).map((i) => (
            {
              label: MockingboardNames[i],
              isSelected: () => { return i === getMockingboardMode() },
              onClick: () => {
                setPreferenceMockingboardMode(i)
              }
            }
          )),
          ...[{ label: "-" }],
          { label: t("audio.midi") || "MIDI", isHeading: true },
          ...midiOptions.map((option) => (
            {
              label: option.label,
              isDisabled: option.type === "unavailable",
              isSelected: () => { return isMidiDeviceSelected(option) },
              onClick: async () => {
                await handleMidiDeviceSelect(option)
              }
            }
          ))
        ]]}
      />
    </span>
  )
}
