import React, { useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import { AllLanguages, LanguageFlags, LanguageNames } from "../../i18n"
import PopupMenu from "./popupmenu"
import type { RetroControlMetadata } from "../retro/retromenucontext"
import { choiceMetadata } from "../retro/retromenuhelpers"
import { createControlContext } from "../retro/retromenucontext"
import { ControlRegistry } from "./controlregistry"
import { controlOptionsToPopupItems } from "./controlpopup"
import { retroFontSupports } from "../retro/retrotext"

const createLanguageControl = (selectedLanguageIndex?: number): RetroControlMetadata => {
  const control = choiceMetadata({
    id: "options.language",
    order: 6,
    label: context => context.t("retroControl.language"),
    labels: () => AllLanguages.map(language => LanguageNames[language]),
    currentIndex: context => selectedLanguageIndex ?? AllLanguages.indexOf(context.language),
    select: (context, index) => context.changeLanguage(AllLanguages[index]),
    preview: (context, index) => context.changeLanguage(AllLanguages[index]),
  })
  control.options = () => AllLanguages.map(language => ({
    label: LanguageNames[language],
    popupLabel: `${LanguageFlags[language]} ${LanguageNames[language]}`,
    action: runtime => runtime.changeLanguage(language),
    preview: runtime => runtime.changeLanguage(language),
    useBrowserFont: !retroFontSupports(LanguageNames[language]),
  }))
  control.refreshParentOnOption = true
  control.refreshTitle = context => context.t("retroControl.options")
  return control
}

export const createRetroLanguageControls = (selectedLanguageIndex?: number): RetroControlMetadata[] => [
  createLanguageControl(selectedLanguageIndex),
]

const LanguageSwitch: React.FC = () => {
  const { t, language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()
  const control = new ControlRegistry(createRetroLanguageControls()).resolve(
    createControlContext(undefined, t, language, changeLanguage),
    "options",
  )[0]

  const handleClick = (event: React.MouseEvent) => {
    setPopupLocation([event.clientX, event.clientY])
  }

  const getCurrentFlag = () => {
    return LanguageFlags[language] || "🌐"
  }

  const getCurrentLanguageName = () => {
    return LanguageNames[language] || language
  }

  return (
    <span translate="no">
      <button
        className="push-button"
        title={`${getCurrentLanguageName()} - Language 語言`}
        onClick={handleClick}
      >
        <span style={{ fontSize: "1em" }}>
          {getCurrentFlag()}
        </span>
      </button>

      <PopupMenu
        location={popupLocation}
        onClose={() => { setPopupLocation(undefined) }}
        menuItems={[controlOptionsToPopupItems(control)]}
      />
    </span>
  )
}

export default LanguageSwitch
