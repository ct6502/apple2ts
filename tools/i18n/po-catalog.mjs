import { po as poParser } from "gettext-parser"

const PLACEHOLDER_PATTERN = /\{\{([^{}]+)\}\}/g
const RESERVED_KEY_SEGMENTS = new Set(["__proto__", "constructor", "prototype"])

const countPlaceholders = message => {
  const counts = new Map()
  for (const match of message.matchAll(PLACEHOLDER_PATTERN)) {
    counts.set(match[1], (counts.get(match[1]) ?? 0) + 1)
  }
  return counts
}

const describePlaceholderDifference = (source, translation) => {
  const sourceCounts = countPlaceholders(source)
  const translationCounts = countPlaceholders(translation)
  const names = [...new Set([...sourceCounts.keys(), ...translationCounts.keys()])].sort()
  return names
    .filter(name => sourceCounts.get(name) !== translationCounts.get(name))
    .map(name => (
      `${name}: source=${sourceCounts.get(name) ?? 0}, translation=${translationCounts.get(name) ?? 0}`
    ))
}

const boundaryNewlineCounts = message => ({
  leading: message.match(/^\n*/)[0].length,
  trailing: message.match(/\n*$/)[0].length,
})

const describeBoundaryNewlineDifference = (source, translation) => {
  const sourceCounts = boundaryNewlineCounts(source)
  const translationCounts = boundaryNewlineCounts(translation)
  return [
    ["leading newlines", sourceCounts.leading, translationCounts.leading],
    ["trailing newlines", sourceCounts.trailing, translationCounts.trailing],
  ]
    .filter(([, sourceCount, translationCount]) => sourceCount !== translationCount)
    .map(([boundary, sourceCount, translationCount]) => (
      `${boundary}: source=${sourceCount}, translation=${translationCount}`
    ))
}

const compareKeys = (left, right) => (
  left < right ? -1 : left > right ? 1 : 0
)

const isFuzzy = item => (
  item.comments?.flag
    ?.split(/[,\s]+/)
    .some(flag => flag.trim() === "fuzzy") ?? false
)

const setNestedValue = (catalog, key, value) => {
  const parts = key.split(".")
  if (parts.some(part => part.length === 0)) {
    throw new Error(`Invalid empty semantic-key segment: ${key}`)
  }
  const reservedSegment = parts.find(part => RESERVED_KEY_SEGMENTS.has(part))
  if (reservedSegment !== undefined) {
    throw new Error(`Reserved semantic-key segment "${reservedSegment}": ${key}`)
  }

  let target = catalog
  for (const part of parts.slice(0, -1)) {
    const hasPart = Object.hasOwn(target, part)
    if (hasPart && typeof target[part] === "string") {
      throw new Error(`Semantic-key path collides with a message: ${key}`)
    }
    if (!hasPart) target[part] = {}
    target = target[part]
  }

  const leaf = parts.at(-1)
  if (Object.hasOwn(target, leaf)) {
    throw new Error(`Duplicate or colliding semantic key: ${key}`)
  }
  target[leaf] = value
}

const readActiveMessages = source => {
  const po = poParser.parse(source, {validation: true})
  const messages = new Map()

  for (const [context, entries] of Object.entries(po.translations)) {
    for (const item of Object.values(entries)) {
      if (item.msgid.length === 0) continue
      if (!context) {
        throw new Error(`Message is missing a semantic key in msgctxt: ${item.msgid}`)
      }
      if (item.msgid_plural !== undefined) {
        throw new Error(`Plural messages are not supported: ${context}`)
      }
      if (messages.has(context)) {
        throw new Error(`Multiple active messages use semantic key: ${context}`)
      }
      messages.set(context, item)
    }
  }
  return messages
}

const readObsoleteMessages = source => {
  const po = poParser.parse(source, {validation: true})
  const messages = []
  for (const [context, entries] of Object.entries(po.obsolete ?? {})) {
    for (const item of Object.values(entries)) {
      messages.push({
        key: context || null,
        source: item.msgid,
        translation: item.msgstr?.[0] ?? "",
      })
    }
  }
  return messages.sort((left, right) => (
    compareKeys(left.key ?? left.source, right.key ?? right.source)
  ))
}

const ANALYSIS_STATUSES = [
  "missing",
  "fuzzy",
  "stale-source",
  "boundary-newline-mismatch",
  "placeholder-mismatch",
  "english-identical",
  "translated",
  "orphaned",
]

const analyzeActivePoCatalog = (sourceCatalog, translationCatalog) => {
  const sourceMessages = readActiveMessages(sourceCatalog)
  const translationMessages = readActiveMessages(translationCatalog)
  const keys = [...new Set([
    ...sourceMessages.keys(),
    ...translationMessages.keys(),
  ])].sort(compareKeys)

  const entries = keys.map(key => {
    const sourceItem = sourceMessages.get(key)
    const translationItem = translationMessages.get(key)
    const translation = translationItem?.msgstr[0] ?? ""

    if (!sourceItem) {
      return {key, status: "orphaned", source: null, translation}
    }
    if (!translationItem) {
      return {key, status: "missing", source: sourceItem.msgid, translation: null}
    }
    if (translationItem.msgid !== sourceItem.msgid) {
      return {
        key,
        status: "stale-source",
        source: sourceItem.msgid,
        translationSource: translationItem.msgid,
        translation,
      }
    }
    if (isFuzzy(translationItem)) {
      return {key, status: "fuzzy", source: sourceItem.msgid, translation}
    }
    if (translation.length === 0) {
      return {key, status: "missing", source: sourceItem.msgid, translation: null}
    }

    const boundaryNewlineDifferences = describeBoundaryNewlineDifference(
      sourceItem.msgid,
      translation,
    )
    if (boundaryNewlineDifferences.length > 0) {
      return {
        key,
        status: "boundary-newline-mismatch",
        source: sourceItem.msgid,
        translation,
        boundaryNewlineDifferences,
      }
    }

    const placeholderDifferences = describePlaceholderDifference(
      sourceItem.msgid,
      translation,
    )
    if (placeholderDifferences.length > 0) {
      return {
        key,
        status: "placeholder-mismatch",
        source: sourceItem.msgid,
        translation,
        placeholderDifferences,
      }
    }
    return {
      key,
      status: translation === sourceItem.msgid ? "english-identical" : "translated",
      source: sourceItem.msgid,
      translation,
    }
  })

  return {
    counts: Object.fromEntries(ANALYSIS_STATUSES.map(status => [
      status,
      entries.filter(entry => entry.status === status).length,
    ])),
    entries,
  }
}

export const analyzePoCatalog = (sourceCatalog, translationCatalog) => ({
  ...analyzeActivePoCatalog(sourceCatalog, translationCatalog),
  obsolete: readObsoleteMessages(translationCatalog),
})

export const compilePoCatalog = (
  source,
  {sourceLanguage = false, sourceCatalog} = {},
) => {
  if (!sourceLanguage && sourceCatalog === undefined) {
    throw new Error("A current source catalog is required for translated catalogs")
  }
  const sourceMessages = sourceLanguage
    ? readActiveMessages(source)
    : readActiveMessages(sourceCatalog)
  const sourceTopology = {}
  for (const key of sourceMessages.keys()) {
    setNestedValue(sourceTopology, key, "")
  }
  const messages = []

  if (sourceLanguage) {
    for (const [key, item] of sourceMessages) {
      messages.push({key, value: item.msgid})
    }
  } else {
    const analysis = analyzeActivePoCatalog(sourceCatalog, source)
    const orphaned = analysis.entries.find(entry => entry.status === "orphaned")
    if (orphaned) {
      throw new Error(`Translation has no current source message: ${orphaned.key}`)
    }
    const entriesByKey = new Map(analysis.entries.map(entry => [entry.key, entry]))
    for (const key of sourceMessages.keys()) {
      const entry = entriesByKey.get(key)
      if (entry.status === "stale-source") {
        throw new Error(
          `Translation source is stale for ${entry.key}: `
          + `expected ${JSON.stringify(entry.source)}, `
          + `received ${JSON.stringify(entry.translationSource)}`,
        )
      }
      if (entry.status === "placeholder-mismatch") {
        throw new Error(
          `Placeholder mismatch for ${entry.key}: `
          + entry.placeholderDifferences.join("; "),
        )
      }
      if (entry.status === "boundary-newline-mismatch") {
        throw new Error(
          `Boundary newline mismatch for ${entry.key}: `
          + entry.boundaryNewlineDifferences.join("; "),
        )
      }
      if (entry.status === "translated" || entry.status === "english-identical") {
        messages.push({key: entry.key, value: entry.translation})
      }
    }
  }

  const catalog = {}
  for (const {key, value} of messages) setNestedValue(catalog, key, value)
  return catalog
}

export const renderTypeScriptCatalog = (exportName, catalog) => {
  if (!/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(exportName)) {
    throw new Error(`Invalid TypeScript export name: ${exportName}`)
  }
  return "// Generated by npm run generate-i18n-catalogs. Do not edit directly.\n\n"
    + `export const ${exportName} = ${JSON.stringify(catalog, null, 2)}\n`
}
