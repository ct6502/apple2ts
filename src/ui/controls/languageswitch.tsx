import React, { useState } from "react"
import { useTranslation } from "../../i18n/useTranslation"
import { Language, LanguageNames } from "../../i18n"
import PopupMenu from "./popupmenu"

// 語言標誌映射（使用 Unicode emoji 或簡寫）
const LanguageFlags: Record<Language, string> = {
  "en": "🇺🇸",
  "zh-TW": "🇹🇼",
  "zh-CN": "🇨🇳",
  "es": "🇪🇸",
  "de": "🇩🇪",
  "fr": "🇫🇷",
  "it": "🇮🇹",
  "pt": "🇵🇹",
  "ja": "🇯🇵",
  "ko": "🇰🇷",
  "nl": "🇳🇱",
  "sv": "🇸🇪",
  "ru": "🇷🇺"
}

// 所有支援的語言列表
const AllLanguages: Language[] = ["en", "zh-TW", "zh-CN", "es", "de", "fr", "it", "pt", "ja", "ko", "nl", "sv", "ru"]

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
