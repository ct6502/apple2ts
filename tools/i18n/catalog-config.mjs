import { resolve } from "node:path"

const root = resolve(import.meta.dirname, "../..")

export const catalogDirectory = resolve(root, "src/i18n/catalogs")
export const outputDirectory = resolve(root, "src/i18n/languages")
export const sourceCatalog = resolve(catalogDirectory, "messages.pot")

export const catalogs = [
  {locale: "en", exportName: "en", sourceLanguage: true},
  {locale: "de", exportName: "de"},
  {locale: "es", exportName: "es"},
  {locale: "fr", exportName: "fr"},
  {locale: "it", exportName: "it"},
  {locale: "ja", exportName: "ja"},
  {locale: "ko", exportName: "ko"},
  {locale: "nl", exportName: "nl"},
  {locale: "pt-BR", exportName: "ptBR"},
  {locale: "ru", exportName: "ru"},
  {locale: "sv", exportName: "sv"},
  {locale: "zh-CN", exportName: "zhCN"},
  {locale: "zh-TW", exportName: "zhTW"},
]
