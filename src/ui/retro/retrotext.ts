const wideCharacter = /[\u1100-\u115F\u2329\u232A\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/u
const retroGlyph = /^[\x20-\x7E\u00A0-\u017F\u2006\u2014\u2026\u2190-\u2193\u21B5\u2713]*$/u

const graphemes = (text: string, locale: string) =>
  Array.from(new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text), segment => segment.segment)

export const selectArrowSpacing = (label: string, locale: string) =>
  graphemes(label, locale).length >= 9 ? "\u2006" : "\u2007"

export const selectHintWidth = (label: string, locale: string) => {
  const spacingWidth = selectArrowSpacing(label, locale) === "\u2006" ? 0.5 : 1
  return 1 + controlTextWidth(label, locale) + 1 + 4 + 3 * spacingWidth
}

export const actionHintWidth = (label: string, locale: string) =>
  controlTextWidth(label, locale) + 3

export const formatClockTime = (date: Date, locale: string) => {
  const formatter = new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    second: "2-digit",
  })
  const hour = formatter.formatToParts(date).find(part => part.type === "hour")?.value ?? ""
  return `${hour.length === 1 ? "\u2007" : ""}${formatter.format(date)}`
}

export const controlTextWidth = (text: string, locale: string) =>
  graphemes(text, locale).reduce((width, grapheme) => width + (wideCharacter.test(grapheme) ? 2 : 1), 0)

export const truncateControlText = (text: string, maxWidth: number, locale: string) => {
  if (controlTextWidth(text, locale) <= maxWidth) return text
  if (maxWidth <= 0) return ""
  if (maxWidth <= 3) return ".".repeat(maxWidth)

  let width = 3
  let result = ""
  for (const grapheme of graphemes(text, locale)) {
    const graphemeWidth = wideCharacter.test(grapheme) ? 2 : 1
    if (width + graphemeWidth > maxWidth) break
    result += grapheme
    width += graphemeWidth
  }
  return `${result}...`
}

export const fitControlText = (
  label: string,
  option: string | undefined,
  availableWidth: number,
  locale: string,
) => {
  const fullLabelWidth = controlTextWidth(label, locale)
  const optionBudget = availableWidth - fullLabelWidth - 2
  const visibleOption = option && optionBudget > 0
    ? truncateControlText(option, optionBudget, locale)
    : undefined
  const optionWidth = visibleOption ? controlTextWidth(visibleOption, locale) + 2 : 0
  return {
    label: truncateControlText(label, Math.max(1, availableWidth - optionWidth), locale),
    option: visibleOption,
  }
}

export const retroFontSupports = (text: string) => retroGlyph.test(text)