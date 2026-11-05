import { getMockingboardMode, MockingboardNames } from "./mockingboard_audio"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { getPreferenceVeraFmAudioEnabled, notifySettingsChanged, setPreferenceMockingboardMode, setPreferenceVeraFmAudioEnabled } from "../../localstorage"
import {
  faMusic,
} from "@fortawesome/free-solid-svg-icons"
import PopupMenu from "../../controls/popupmenu"
import { getMidiDeviceOptions, handleMidiDeviceSelect, isMidiDeviceSelected } from "./midiselect"

import { useTranslation } from "../../../i18n/useTranslation"
import type { RetroControlMetadata } from "../../retro/retromenucontext"
import { audioEnable, getAudioStatus } from "./speaker"
import { setVeraFmAudioEnabled } from "./vera_psg_audio"
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

export const audioControlRegistry = new ControlRegistry(retroAudioControls)

export type SlotAudioCard = "mockingboard" | "passport" | "vera"

export const SlotAudioConfig = (props: DisplayProps & { card: SlotAudioCard, slot: number }) => {
  const { t, language, changeLanguage } = useTranslation()
  const controls = audioControlRegistry.resolve(
    createControlContext(props, t, language, changeLanguage), "sound",
  )
  const cardName = props.card === "mockingboard" ? "Mockingboard"
    : props.card === "passport" ? "Passport MIDI" : "VERA"
  const controlId = props.card === "mockingboard" ? "sound.mockingboard" : "sound.midi"
  const control = controls.find(item => item.id === controlId)
  const items: PopupMenuItem[] = props.card === "vera" ? [
    { label: "VERA", isHeading: true },
    {
      label: "Enable FM Audio",
      isSelected: getPreferenceVeraFmAudioEnabled,
      onClick: () => {
        setPreferenceVeraFmAudioEnabled(true, "external")
        setVeraFmAudioEnabled(true)
      },
    },
    {
      label: "Disable FM Audio",
      isSelected: () => !getPreferenceVeraFmAudioEnabled(),
      onClick: () => {
        setPreferenceVeraFmAudioEnabled(false, "external")
        setVeraFmAudioEnabled(false)
      },
    },
  ] : control ? controlsToPopupItems([control]) : []

  return (
    <PopupMenu
      buttonTitle={`${t("linkBuilder.slots.slot", { slot: String(props.slot) })}: ${cardName} ? ${t("audio.configuration")}`}
      buttonIcon={<FontAwesomeIcon icon={faMusic} style={{ fontSize: "0.8em" }} />}
      menuItems={[items]}
    />
  )
}
