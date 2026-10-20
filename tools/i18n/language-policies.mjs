export const defaultLanguageFlag = "🌐"

// Normalize known translation-platform identifiers to canonical runtime IDs.
export const catalogIdentityAliases = {
  "en@pirate": "en-x-pirate",
}

// PO files register languages automatically. Keep only user-facing overrides
// and locale-specific behavior that cannot be inferred safely from a locale ID.
export const languagePolicies = {
  en: {name: "English", flag: "🇺🇸", order: 0},
  ar: {name: "العربية", flag: "", order: 1},
  "zh-TW": {name: "繁體中文", flag: "🇹🇼", order: 2},
  "zh-CN": {name: "简体中文", flag: "🇨🇳", order: 3},
  es: {name: "Español", flag: "🇪🇸", order: 4},
  de: {name: "Deutsch", flag: "🇩🇪", order: 5},
  fr: {name: "Français", flag: "🇫🇷", order: 6},
  it: {name: "Italiano", flag: "🇮🇹", order: 7},
  "pt-BR": {name: "Português (Brasil)", flag: "🇧🇷", order: 8},
  ja: {name: "日本語", flag: "🇯🇵", order: 9},
  ko: {name: "한국어", flag: "🇰🇷", order: 10},
  nl: {name: "Nederlands", flag: "🇳🇱", order: 11},
  sv: {name: "Svenska", flag: "🇸🇪", order: 12},
  ru: {name: "Русский", flag: "🇷🇺", order: 13},
  "en-x-pirate": {name: "Pirate", flag: "🏴‍☠️", order: 14},
}

export const legacyLanguageAliases = {
  pt: "pt-BR",
}

// Match the most specific ranges before their broader language range.
export const browserLanguageAliases = [
  {range: "zh-Hant", language: "zh-TW"},
  {range: "zh-TW", language: "zh-TW"},
  {range: "zh-HK", language: "zh-TW"},
  {range: "zh-MO", language: "zh-TW"},
  {range: "zh-Hans", language: "zh-CN"},
  {range: "zh-CN", language: "zh-CN"},
  {range: "zh-SG", language: "zh-CN"},
  {range: "zh", language: "zh-TW"},
  {range: "pt", language: "pt-BR"},
]

// Add regional-to-regional fallbacks here. English remains the final fallback.
export const languageFallbacks = {}
