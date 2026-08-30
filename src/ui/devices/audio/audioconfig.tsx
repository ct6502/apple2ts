import { useState } from "react"
import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { notifySettingsChanged, setPreferenceMockingboardMode } from "../../localstorage"
import {
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { getMidiDeviceOptions, handleMidiDeviceSelect, isMidiDeviceSelected } from "./midiselect"

import { useTranslation } from "../../../i18n/useTranslation"
import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { audioEnable, getAudioStatus } from "./speaker"
import { ControlRegistry } from "../../controls/controlregistry"
import { controlsToPopupItems } from "../../controls/controlpopup"
import { createControlContext } from "../../retro/retromenucontext"
import { choiceBinding, controlsFromJson, type RetroControlBindings } from "../../retro/retrocontrolmetadata"

const audioBindings: RetroControlBindings = {
  sound: {
    value: context => context.t(getAudioStatus() === "enabled" ? "messages.on" : "messages.off"),
  },
  "sound.enabled": choiceBinding({
    options: context => [
      { label: context.t("messages.off") },
      { label: context.t("messages.on") },
    ],
    currentIndex: () => getAudioStatus() === "enabled" ? 1 : 0,
    select: (context, index) => {
      audioEnable(index === 1)
      notifySettingsChanged(["sound.enabled"], context.settingsOrigin)
      context.displayProps.updateDisplay()
    },
  }),
  "sound.mockingboard": {
    ...choiceBinding({
      options: () => MockingboardNames.map(label => ({ label })),
      currentIndex: getMockingboardMode,
      select: (context, index) => setPreferenceMockingboardMode(index, context.settingsOrigin),
    }),
    defaultIndex: 0,
  },
  "sound.midi": choiceBinding({
    options: () => getMidiDeviceOptions().map(option => ({ label: option.label })),
    currentIndex: () => Math.max(0, getMidiDeviceOptions().findIndex(isMidiDeviceSelected)),
    select: (context, index) => {
      void handleMidiDeviceSelect(getMidiDeviceOptions()[index]).then(() => {
        notifySettingsChanged(["sound.midi"], context.settingsOrigin)
      })
    },
  }),
}

export const retroAudioControls: RetroControlMetadata[] = controlsFromJson("audio", audioBindings)

const audioControlRegistry = new ControlRegistry(retroAudioControls)

export const AudioConfig = (props: DisplayProps) => {
  const { t, language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const [, mockingboardControl, midiControl] = audioControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage),
    "sound",
  )

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
          ...controlsToPopupItems([mockingboardControl]),
          { label: "-" },
          ...controlsToPopupItems([midiControl]),
        ]]}
      />
    </span>
  )
}
