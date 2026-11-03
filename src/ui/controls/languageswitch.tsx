import React from "react"
import { useTranslation } from "../../i18n/useTranslation"
import { AllLanguages, LanguageFlags, LanguageNames } from "../../i18n"
import PopupMenu from "./popupmenu"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"
import { controlOptionsToPopupItems } from "./controlpopup"
import { retroFontSupports } from "../retro/retrotext"
import { notifySettingsChanged } from "../settingschange"
import { controlFromJson, type RetroControlBindings } from "../retro/retrocontrolmetadata"

const createLanguageControl = (selectedLanguageIndex?: number): RetroControlMetadata => {
  const languageBindings: RetroControlBindings = {
    "options.language": {
      options: () => AllLanguages.map(language => ({
        label: LanguageNames[language],
        popupLabel: `${LanguageFlags[language]} ${LanguageNames[language]}`,
        action: runtime => {
          runtime.changeLanguage(language)
          notifySettingsChanged(["options.language"], runtime.settingsOrigin)
        },
        preview: runtime => runtime.changeLanguage(language),
        useBrowserFont: !retroFontSupports(LanguageNames[language]),
      })),
      optionIndex: context => selectedLanguageIndex ?? AllLanguages.indexOf(context.language),
      refreshTitle: context => context.t("retroControl.display"),
    },
  }
  return controlFromJson("language", "options.language", languageBindings)
}

export const createRetroLanguageControls = (selectedLanguageIndex?: number): RetroControlMetadata[] => [
  createLanguageControl(selectedLanguageIndex),
]

const LanguageSwitch: React.FC = () => {
  const { t, language, changeLanguage } = useTranslation()
  const control = new ControlRegistry(createRetroLanguageControls()).resolve(
    createControlContext(undefined, t, language, changeLanguage),
    "display",
  )[0]

  const getCurrentFlag = () => {
    return LanguageFlags[language] || "🌐"
  }

  const getCurrentLanguageName = () => {
    return LanguageNames[language] || language
  }

  return (
    <span translate="no">
      <PopupMenu
        buttonTitle={`${getCurrentLanguageName()} - Language 語言`}
        buttonIcon={getCurrentFlag()}
        menuItems={[controlOptionsToPopupItems(control)]}
      />
    </span>
  )
}

export default LanguageSwitch
