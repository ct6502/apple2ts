import React, { useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faGlobe } from "@fortawesome/free-solid-svg-icons"
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
        title={`${getCurrentLanguageName()} - 選擇語言 / Select Language`}
        onClick={handleClick}
        style={{ position: "relative", minWidth: "45px" }}
      >
        <FontAwesomeIcon
          icon={faGlobe}
          style={{ fontSize: "0.8em", marginRight: "4px" }}
        />
        <span style={{ fontSize: "0.8em" }}>
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
