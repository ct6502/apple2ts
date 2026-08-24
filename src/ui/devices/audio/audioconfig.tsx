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
import { choiceMetadata } from "../../retro/retromenuhelpers"
import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { audioEnable, getAudioStatus } from "./speaker"
import { ControlRegistry } from "../../controls/controlregistry"
import { controlsToPopupItems } from "../../controls/controlpopup"
import { createControlContext } from "../../retro/retromenucontext"

export const retroAudioControls: RetroControlMetadata[] = [
  {
    id: "sound",
    parentId: null,
    order: 4,
    label: context => context.t("retroControl.sound"),
    value: context => context.t(getAudioStatus() === "enabled" ? "messages.on" : "messages.off"),
  },
  choiceMetadata({
    id: "sound.enabled",
    parentId: "sound",
    order: 0,
    label: context => context.t("retroControl.sound"),
    labels: context => [context.t("messages.off"), context.t("messages.on")],
    currentIndex: () => getAudioStatus() === "enabled" ? 1 : 0,
    defaultIndex: 1,
    select: (context, index) => {
      audioEnable(index === 1)
      context.displayProps.updateDisplay()
    },
  }),
  choiceMetadata({
    id: "sound.mockingboard",
    parentId: "sound",
    order: 1,
    label: context => context.t("audio.mockingboard"),
    labels: () => MockingboardNames,
    currentIndex: getMockingboardMode,
    select: (_context, index) => setPreferenceMockingboardMode(index),
    defaultIndex: 0,
  }),
  choiceMetadata({
    id: "sound.midi",
    parentId: "sound",
    order: 2,
    label: context => context.t("audio.midi"),
    labels: () => getMidiDeviceOptions().map(option => option.label),
    currentIndex: () => Math.max(0, getMidiDeviceOptions().findIndex(isMidiDeviceSelected)),
    select: (_context, index) => { void handleMidiDeviceSelect(getMidiDeviceOptions()[index]) },
  }),
]

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
