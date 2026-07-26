import { en } from "./languages/en"
import { zhTW } from "./languages/zh-TW"
import { zhCN } from "./languages/zh-CN"
import { es } from "./languages/es"
import { de } from "./languages/de"
import { fr } from "./languages/fr"
import { it } from "./languages/it"
import { pt } from "./languages/pt"
import { ja } from "./languages/ja"
import { ko } from "./languages/ko"
import { nl } from "./languages/nl"
import { sv } from "./languages/sv"
import { ru } from "./languages/ru"

export type Language = "en" | "zh-TW" | "zh-CN" | "es" | "de" | "fr" | "it" | "pt" | "ja" | "ko" | "nl" | "sv" | "ru"
export type TranslationKey = keyof typeof en

// 語言顯示名稱（用原生語言顯示）
export const LanguageNames: Record<Language, string> = {
  "en": "English",
  "zh-TW": "繁體中文",
  "zh-CN": "简体中文",
  "es": "Español",
  "de": "Deutsch",
  "fr": "Français",
  "it": "Italiano",
  "pt": "Português",
  "ja": "日本語",
  "ko": "한국어",
  "nl": "Nederlands",
  "sv": "Svenska",
  "ru": "Русский"
}

const translations = {
  "en": en,
  "zh-TW": zhTW,
  "zh-CN": zhCN,
  "es": es,
  "de": de,
  "fr": fr,
  "it": it,
  "pt": pt,
  "ja": ja,
  "ko": ko,
  "nl": nl,
  "sv": sv,
  "ru": ru
}

class I18n {
  private currentLanguage: Language = "en"
  
  constructor() {
    // 從 localStorage 讀取語言設定
    const saved = localStorage.getItem("apple2ts-language")
    if (saved && this.isValidLanguage(saved)) {
      this.currentLanguage = saved as Language
    } else {
      // 偵測瀏覽器語言
      this.currentLanguage = this.detectBrowserLanguage()
    }
  }
  
  private isValidLanguage(lang: string): boolean {
    return ["en", "zh-TW", "zh-CN", "es", "de", "fr", "it", "pt", "ja", "ko", "nl", "sv", "ru"].includes(lang)
  }
  
  private detectBrowserLanguage(): Language {
    const browserLang = navigator.language.toLowerCase()
    
    // 檢測中文變體
    if (browserLang.includes("zh")) {
      if (browserLang.includes("tw") || browserLang.includes("hant") || browserLang.includes("mo")) {
        return "zh-TW"  // 繁體中文（台灣、香港、澳門）
      }
      if (browserLang.includes("cn") || browserLang.includes("hans") || browserLang.includes("sg")) {
        return "zh-CN"  // 簡體中文（中國大陸、新加坡）
      }
      return "zh-TW"  // 預設繁體中文
    }
    
    // 檢測其他語言
    if (browserLang.startsWith("es")) return "es"  // 西班牙文
    if (browserLang.startsWith("de")) return "de"  // 德文
    if (browserLang.startsWith("fr")) return "fr"  // 法文
    if (browserLang.startsWith("it")) return "it"  // 義大利文
    if (browserLang.startsWith("pt")) return "pt"  // 葡萄牙文
    if (browserLang.startsWith("ja")) return "ja"  // 日文
    if (browserLang.startsWith("ko")) return "ko"  // 韓文
    if (browserLang.startsWith("nl")) return "nl"  // 荷蘭文
    if (browserLang.startsWith("sv")) return "sv"  // 瑞典文
    if (browserLang.startsWith("ru")) return "ru"  // 俄文
    
    return "en"  // 預設英文
  }
  
  private listeners: ((lang: Language) => void)[] = []

  setLanguage(lang: Language) {
    this.currentLanguage = lang
    localStorage.setItem("apple2ts-language", lang)
    this.emitChange()
  }

  subscribe(listener: (lang: Language) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private emitChange() {
    this.listeners.forEach(listener => listener(this.currentLanguage))
  }
  
  getLanguage(): Language {
    return this.currentLanguage
  }
  
  // 支援巢狀屬性的翻譯函數
  t(key: string, params?: Record<string, string>): string {
    const keys = key.split(".")
    let value: unknown = translations[this.currentLanguage]
    
    for (const k of keys) {
      value = (value as Record<string, unknown>)?.[k]
    }
    
    let result = (value as string) || key

    if (params) {
      Object.keys(params).forEach(param => {
        result = result.replace(`{{${param}}}`, params[param])
      })
    }
    
    return result
  }
}

export const i18n = new I18n()
export const t = i18n.t.bind(i18n)
