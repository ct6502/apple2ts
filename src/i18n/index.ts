import { en } from "./languages/en"
import { zhTW } from "./languages/zh-TW"
import { zhCN } from "./languages/zh-CN"
import { es } from "./languages/es"
import { de } from "./languages/de"
import { fr } from "./languages/fr"
import { it } from "./languages/it"
import { ptBR } from "./languages/pt-BR"
import { ja } from "./languages/ja"
import { ko } from "./languages/ko"
import { nl } from "./languages/nl"
import { sv } from "./languages/sv"
import { ru } from "./languages/ru"

export type Language = "en" | "zh-TW" | "zh-CN" | "es" | "de" | "fr" | "it" | "pt-BR" | "ja" | "ko" | "nl" | "sv" | "ru"
export type TranslationKey = keyof typeof en

type TranslationCatalog = Record<string, unknown>

type LanguageDefinition = {
  id: Language
  name: string
  flag: string
  catalog: TranslationCatalog
  browserPrimaryLanguage?: string
}

// Keep each shipped catalog's identity, menu metadata, and browser alias together.
const languageDefinitions: readonly LanguageDefinition[] = [
  { id: "en", name: "English", flag: "🇺🇸", catalog: en, browserPrimaryLanguage: "en" },
  { id: "zh-TW", name: "繁體中文", flag: "🇹🇼", catalog: zhTW },
  { id: "zh-CN", name: "简体中文", flag: "🇨🇳", catalog: zhCN },
  { id: "es", name: "Español", flag: "🇪🇸", catalog: es, browserPrimaryLanguage: "es" },
  { id: "de", name: "Deutsch", flag: "🇩🇪", catalog: de, browserPrimaryLanguage: "de" },
  { id: "fr", name: "Français", flag: "🇫🇷", catalog: fr, browserPrimaryLanguage: "fr" },
  { id: "it", name: "Italiano", flag: "🇮🇹", catalog: it, browserPrimaryLanguage: "it" },
  { id: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷", catalog: ptBR, browserPrimaryLanguage: "pt" },
  { id: "ja", name: "日本語", flag: "🇯🇵", catalog: ja, browserPrimaryLanguage: "ja" },
  { id: "ko", name: "한국어", flag: "🇰🇷", catalog: ko, browserPrimaryLanguage: "ko" },
  { id: "nl", name: "Nederlands", flag: "🇳🇱", catalog: nl, browserPrimaryLanguage: "nl" },
  { id: "sv", name: "Svenska", flag: "🇸🇪", catalog: sv, browserPrimaryLanguage: "sv" },
  { id: "ru", name: "Русский", flag: "🇷🇺", catalog: ru, browserPrimaryLanguage: "ru" },
]

export const AllLanguages = languageDefinitions.map(({ id }) => id)
export const LanguageNames = Object.fromEntries(
  languageDefinitions.map(({ id, name }) => [id, name]),
) as Record<Language, string>
export const LanguageFlags = Object.fromEntries(
  languageDefinitions.map(({ id, flag }) => [id, flag]),
) as Record<Language, string>

export const LanguageCatalogs = Object.fromEntries(
  languageDefinitions.map(({ id, catalog }) => [id, catalog]),
) as Record<Language, TranslationCatalog>

const legacySavedLanguageIds: Readonly<Record<string, Language>> = {
  pt: "pt-BR",
}

// Look up nested translation keys.
const lookupTranslation = (catalog: TranslationCatalog, key: string): string | undefined => {
  let value: unknown = catalog
  for (const part of key.split(".")) {
    value = (value as Record<string, unknown>)?.[part]
  }
  return typeof value === "string" ? value : undefined
}

export const translateFromCatalogs = (
  selectedLanguage: TranslationCatalog,
  english: TranslationCatalog,
  key: string,
  params?: Record<string, string>,
): string => {
  let result = lookupTranslation(selectedLanguage, key) ?? lookupTranslation(english, key) ?? key

  if (params) {
    result = result.replace(/{{([^{}]+)}}/g, (token, param: string) => {
      return Object.prototype.hasOwnProperty.call(params, param) ? params[param] : token
    })
  }

  return result
}

type LanguageStorage = Pick<Storage, "getItem" | "setItem">

export class I18n {
  private currentLanguage: Language = "en"
  
  constructor(
    private readonly storage: LanguageStorage = localStorage,
    browserLanguage = navigator.language,
  ) {
    // Read the saved language setting.
    const saved = this.storage.getItem("apple2ts-language")
    const migrated = saved && (legacySavedLanguageIds[saved] ?? saved)
    if (migrated && this.isValidLanguage(migrated)) {
      this.currentLanguage = migrated
      if (migrated !== saved) {
        this.storage.setItem("apple2ts-language", migrated)
      }
    } else {
      // Detect the browser language.
      this.currentLanguage = this.detectBrowserLanguage(browserLanguage)
    }
  }
  
  private isValidLanguage(lang: string): lang is Language {
    return languageDefinitions.some(({ id }) => id === lang)
  }
  
  private detectBrowserLanguage(browserLanguage: string): Language {
    const [primaryLanguage, ...subtags] = browserLanguage.toLowerCase().split("-")
    
    // Detect Chinese variants.
    if (primaryLanguage === "zh") {
      if (subtags.includes("tw") || subtags.includes("hant") || subtags.includes("mo")) {
        return "zh-TW"  // Traditional Chinese (Taiwan, Hong Kong, Macau)
      }
      if (subtags.includes("cn") || subtags.includes("hans") || subtags.includes("sg")) {
        return "zh-CN"  // Simplified Chinese (Mainland China, Singapore)
      }
      return "zh-TW"  // Default to Traditional Chinese.
    }
    
    // pt intentionally selects pt-BR until a pt-PT catalog exists.
    const matchingLanguage = languageDefinitions.find(
      ({ browserPrimaryLanguage }) => browserPrimaryLanguage === primaryLanguage,
    )
    if (matchingLanguage) return matchingLanguage.id
    
    return "en"  // Default to English.
  }
  
  private listeners: ((lang: Language) => void)[] = []

  setLanguage(lang: Language) {
    this.currentLanguage = lang
    this.storage.setItem("apple2ts-language", lang)
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
  
  t(key: string, params?: Record<string, string>): string {
    return translateFromCatalogs(LanguageCatalogs[this.currentLanguage], en, key, params)
  }
}

export const i18n = new I18n()
export const t = i18n.t.bind(i18n)
