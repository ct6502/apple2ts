import React, { useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import { AllLanguages, LanguageFlags, LanguageNames } from "../../i18n"
import PopupMenu from "./popupmenu"

const LanguageSwitch: React.FC = () => {
  const { language, changeLanguage } = useTranslation()
  const [popupLocation, setPopupLocation] = useState<[number, number]>()

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
    <span>
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
        menuItems={[AllLanguages.map((lang) => {
          return {
            label: `${LanguageFlags[lang]} ${LanguageNames[lang]}`,
            isSelected: () => { return lang === language },
            onClick: () => {
              changeLanguage(lang)
            }
          }
        })]}
      />
    </span>
  )
}

export default LanguageSwitch
