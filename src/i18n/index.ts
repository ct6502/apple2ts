import { en } from "./languages/en"
import {
  browserLanguageAliases,
  languageDefinitions,
  languageFallbacks,
  legacySavedLanguageIds,
} from "./languages/registry"
import type { RegisteredLanguage } from "./languages/registry"

export type Language = RegisteredLanguage
export type TranslationKey = keyof typeof en

type TranslationCatalog = Record<string, unknown>

export const AllLanguages = languageDefinitions.map(({ id }) => id)
export const LanguageNames = Object.fromEntries(
  languageDefinitions.map(({ id, name }) => [id, name]),
) as Record<Language, string>
export const LanguageFlags = Object.fromEntries(
  languageDefinitions.map(({ id, flag }) => [id, flag]),
) as Record<Language, string>

export const LanguageCatalogs = Object.fromEntries(
  languageDefinitions.map(({ id, catalog }) => [id, catalog]),
) as unknown as Record<Language, TranslationCatalog>

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
): string => translateFromCatalogChain([selectedLanguage, english], key, params)

const translateFromCatalogChain = (
  catalogs: readonly TranslationCatalog[],
  key: string,
  params?: Record<string, string>,
): string => {
  let result = catalogs
    .map(catalog => lookupTranslation(catalog, key))
    .find(value => value !== undefined) ?? key

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
    let canonicalLanguage
    try {
      [canonicalLanguage] = Intl.getCanonicalLocales(browserLanguage)
    } catch {
      return "en"
    }
    const normalizedLanguage = canonicalLanguage.toLowerCase()

    const exactLanguage = languageDefinitions.find(
      ({ id }) => id.toLowerCase() === normalizedLanguage,
    )
    if (exactLanguage) return exactLanguage.id

    const alias = browserLanguageAliases.find(({ range }) => {
      const normalizedRange = range.toLowerCase()
      return normalizedLanguage === normalizedRange
        || normalizedLanguage.startsWith(`${normalizedRange}-`)
    })
    if (alias) return alias.language

    const [primaryLanguage] = canonicalLanguage.split("-")
    const primaryCatalog = languageDefinitions.find(({ id }) => id === primaryLanguage)
    if (primaryCatalog) return primaryCatalog.id

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
    const fallbackLanguage = languageFallbacks[this.currentLanguage]
    return translateFromCatalogChain([
      LanguageCatalogs[this.currentLanguage],
      ...(fallbackLanguage ? [LanguageCatalogs[fallbackLanguage]] : []),
      en,
    ], key, params)
  }
}

export const synchronizeDocumentLanguage = (
  languageSource: Pick<I18n, "getLanguage" | "subscribe">,
  root: Pick<HTMLElement, "lang"> = document.documentElement,
) => {
  const updateLanguage = (language: Language) => {
    root.lang = language
  }

  updateLanguage(languageSource.getLanguage())
  return languageSource.subscribe(updateLanguage)
}

export const i18n = new I18n()
export const t = i18n.t.bind(i18n)
