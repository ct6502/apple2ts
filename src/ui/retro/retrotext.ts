const wideCharacter = /[\u1100-\u115F\u2329\u232A\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6]/u
const retroGlyph = /^[\x20-\x7E\u00A0-\u017F\u2006\u2014\u2026\u2190-\u2193\u21B5\uE000-\uE0FF]*$/u
const latinText = /^[\p{Script=Latin}\p{Number}\p{Punctuation}\p{Separator}\p{Symbol}]*$/u

export const mouseTextGlyphs = {
  left: String.fromCodePoint(0xE088),
  down: String.fromCodePoint(0xE08A),
  up: String.fromCodePoint(0xE08B),
  return: String.fromCodePoint(0xE08D),
  right: String.fromCodePoint(0xE095),
} as const

export const menuItemTextWidth = {
  root: 33,
  submenu: 34,
} as const

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

export const formatClockDate = (date: Date, locale: string, padding = " ") => {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: "numeric",
    day: "numeric",
    year: "2-digit",
  })
  return formatter.formatToParts(date).map(part =>
    part.type === "month" || part.type === "day" ? part.value.padStart(2, padding) : part.value,
  ).join("")
}

export const controlTextWidth = (text: string, locale: string) =>
  graphemes(text, locale).reduce((width, grapheme) => width + (wideCharacter.test(grapheme) ? 2 : 1), 0)

export const centerControlTextOffset = (text: string, availableWidth: number, locale: string) =>
  Math.max(0, Math.floor((availableWidth - controlTextWidth(text, locale)) / 2))

export const shouldUseCompactLatinFooter = (
  texts: readonly string[],
  requiredCells: number,
  availableCells = 36,
) => requiredCells > availableCells && texts.every(text => latinText.test(text))

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

export const truncateMiddleControlText = (text: string, maxWidth: number, locale: string) => {
  if (controlTextWidth(text, locale) <= maxWidth) return text
  if (maxWidth <= 0) return ""
  if (maxWidth <= 3) return ".".repeat(maxWidth)

  const useSpaced = maxWidth >= 14
  const ellipsis = useSpaced ? " ... " : "..."
  const ellipsisWidth = useSpaced ? 5 : 3
  const budget = maxWidth - ellipsisWidth
  if (budget <= 1) {
    return truncateControlText(text, maxWidth, locale)
  }

  const rightTargetWidth = Math.max(1, Math.floor(budget * 0.45))
  const leftTargetWidth = budget - rightTargetWidth

  const segs = graphemes(text, locale)

  let leftStr = ""
  let leftWidth = 0
  let leftIndex = 0
  for (let i = 0; i < segs.length; i++) {
    const g = segs[i]
    const gw = wideCharacter.test(g) ? 2 : 1
    if (leftWidth + gw > leftTargetWidth) break
    leftStr += g
    leftWidth += gw
    leftIndex = i + 1
  }

  let rightStr = ""
  let rightWidth = 0
  const remainingForRight = budget - leftWidth
  for (let i = segs.length - 1; i >= leftIndex; i--) {
    const g = segs[i]
    const gw = wideCharacter.test(g) ? 2 : 1
    if (rightWidth + gw > remainingForRight) break
    rightStr = g + rightStr
    rightWidth += gw
  }

  return `${leftStr.trimEnd()}${ellipsis}${rightStr.trimStart()}`
}

export const fitControlText = (
  label: string,
  option: string | undefined,
  availableWidth: number,
  locale: string,
  truncateMiddle = false,
) => {
  const fullLabelWidth = controlTextWidth(label, locale)
  const optionBudget = availableWidth - fullLabelWidth - 2
  const visibleOption = option && optionBudget > 0
    ? truncateControlText(option, optionBudget, locale)
    : undefined
  const optionWidth = visibleOption ? controlTextWidth(visibleOption, locale) + 2 : 0
  const truncateFn = truncateMiddle ? truncateMiddleControlText : truncateControlText
  return {
    label: truncateFn(label, Math.max(1, availableWidth - optionWidth), locale),
    option: visibleOption,
  }
}

export const formatMarqueeText = (
  text: string,
  availableWidth: number,
  offset: number,
  locale: string,
): string => {
  if (controlTextWidth(text, locale) <= availableWidth) {
    return text
  }
  const gap = "    "
  const segs = graphemes(text + gap, locale)
  const len = segs.length
  if (len === 0) return ""

  const startIdx = offset % len
  let result = ""
  let currentWidth = 0
  for (let i = 0; i < len; i++) {
    const g = segs[(startIdx + i) % len]
    const gw = wideCharacter.test(g) ? 2 : 1
    if (currentWidth + gw > availableWidth) break
    result += g
    currentWidth += gw
  }

  if (currentWidth < availableWidth) {
    result += " ".repeat(availableWidth - currentWidth)
  }

  return result
}

export const calculateMarqueeOffset = (
  text: string,
  tick: number,
  locale: string,
  pauseTicks = 4,
): number => {
  const gap = "    "
  const totalLength = graphemes(text + gap, locale).length
  if (totalLength === 0) return 0
  const cycleLength = pauseTicks + totalLength + 2
  const cycleTick = tick % cycleLength
  if (cycleTick < pauseTicks) return 0
  if (cycleTick < pauseTicks + totalLength) return cycleTick - pauseTicks
  return 0
}

export const retroFontSupports = (text: string) => retroGlyph.test(text)