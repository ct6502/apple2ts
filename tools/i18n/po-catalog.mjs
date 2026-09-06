import { Buffer } from "node:buffer"

import { po as poParser } from "gettext-parser"

const PLACEHOLDER_PATTERN = /\{\{([^{}]+)\}\}|(?<!\{)\{([^{}]+)\}(?!\})/g
const RESERVED_KEY_SEGMENTS = new Set(["__proto__", "constructor", "prototype"])
const UPDATE_CATALOG_HINT = "Update the supplied translation catalog from its source catalog."

const inspectPlaceholders = message => {
  const counts = new Map()
  for (const match of message.matchAll(PLACEHOLDER_PATTERN)) {
    const placeholder = match[0]
    counts.set(placeholder, (counts.get(placeholder) ?? 0) + 1)
  }
  const remainder = message.replaceAll(PLACEHOLDER_PATTERN, "")
  return {counts, malformed: /[{}]/.test(remainder)}
}

const describePlaceholderDifference = (source, translation) => {
  const sourceInspection = inspectPlaceholders(source)
  const translationInspection = inspectPlaceholders(translation)
  const sourceCounts = sourceInspection.counts
  const translationCounts = translationInspection.counts
  const names = [...new Set([...sourceCounts.keys(), ...translationCounts.keys()])].sort()
  return [
    ...(sourceInspection.malformed ? ["source contains malformed placeholder syntax"] : []),
    ...(translationInspection.malformed
      ? ["translation contains malformed placeholder syntax"]
      : []),
    ...names
      .filter(name => sourceCounts.get(name) !== translationCounts.get(name))
      .map(name => (
        `${name}: source=${sourceCounts.get(name) ?? 0}, translation=${translationCounts.get(name) ?? 0}`
      )),
  ]
}

const boundaryWhitespace = message => ({
  leading: message.match(/^\s+/)?.[0] ?? "",
  trailing: message.match(/\s+$/)?.[0] ?? "",
})

const describeBoundaryWhitespace = (message, role) => {
  const whitespace = boundaryWhitespace(message)
  return [
    ["leading whitespace", whitespace.leading],
    ["trailing whitespace", whitespace.trailing],
  ]
    .filter(([, value]) => value.length > 0)
    .map(([boundary, value]) => (
      `${role} ${boundary}=${JSON.stringify(value)}`
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

const previousSource = item => {
  const previous = item?.comments?.previous
  if (!previous) return undefined

  const parsed = poParser.parse(Buffer.from(
    `msgid ""\nmsgstr ""\n\n${previous}\nmsgstr ""\n`,
  ), {validation: true})
  for (const entries of Object.values(parsed.translations)) {
    for (const previousItem of Object.values(entries)) {
      if (previousItem.msgid.length > 0) return previousItem.msgid
    }
  }
  return undefined
}

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
  return readParsedActiveMessages(po)
}

const readParsedActiveMessages = po => {
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

const splitPoBlocks = catalog => {
  const blocks = []
  const separatorPattern = /\r?\n(?:\r?\n)+/g
  let start = 0
  let prefix = ""
  for (const match of catalog.matchAll(separatorPattern)) {
    blocks.push({prefix, body: catalog.slice(start, match.index)})
    prefix = match[0]
    start = match.index + match[0].length
  }
  blocks.push({prefix, body: catalog.slice(start)})
  return blocks
}

const readPoBlock = (header, block) => {
  const parsed = poParser.parse(
    Buffer.from(`${header.body}${block.prefix}${block.body}`),
    {validation: true},
  )
  const active = []
  const obsolete = []
  for (const [context, entries] of Object.entries(parsed.translations)) {
    for (const item of Object.values(entries)) {
      if (item.msgid.length > 0) active.push({context, item})
    }
  }
  for (const [context, entries] of Object.entries(parsed.obsolete ?? {})) {
    for (const item of Object.values(entries)) obsolete.push({context, item})
  }
  if (active.length + obsolete.length > 1) {
    throw new Error("PO block contains multiple messages")
  }
  if (active[0]) return {...active[0], obsolete: false, parsed}
  if (obsolete[0]) return {...obsolete[0], obsolete: true, parsed}
  return undefined
}

const countParsedMessages = parsed => (
  Object.values(parsed.translations).reduce((count, entries) => (
    count + Object.values(entries).filter(item => item.msgid.length > 0).length
  ), 0)
  + Object.values(parsed.obsolete ?? {}).reduce((count, entries) => (
    count + Object.keys(entries).length
  ), 0)
)

const updateMessage = (message, msgid, eol) => {
  const translated = (message.item.msgstr?.[0] ?? "").length > 0
  const comments = {...message.item.comments}
  const flags = [...new Set(
    (comments.flag ?? "").split(/[,\s]+/).filter(Boolean),
  )].filter(flag => flag !== "fuzzy")
  if (translated) flags.push("fuzzy")
  if (flags.length > 0) comments.flag = flags.join(", ")
  else delete comments.flag
  if (translated) comments.previous = `msgid ${JSON.stringify(message.item.msgid)}`
  else delete comments.previous

  const entries = message.parsed.translations[message.context]
  delete entries[message.item.msgid]
  message.item.msgid = msgid
  message.item.comments = comments
  entries[msgid] = message.item

  const compiled = poParser.compile(message.parsed, {eol, foldLength: 77}).toString("utf8")
  const blocks = splitPoBlocks(compiled)
  const messageBlocks = blocks.slice(1).filter(block => block.body.length > 0)
  if (messageBlocks.length !== 1) {
    throw new Error(`Unable to compile one PO message block: ${message.context}`)
  }
  const body = messageBlocks[0].body
  return body.endsWith(eol) ? body.slice(0, -eol.length) : body
}

export const preparePoCatalogForMerge = (sourceCatalog, translationCatalog) => {
  const source = poParser.parse(sourceCatalog, {validation: true})
  const translation = poParser.parse(translationCatalog, {validation: true})
  const sourceMessages = readParsedActiveMessages(source)
  readParsedActiveMessages(translation)
  const translationBlocks = splitPoBlocks(translationCatalog)
  const blocks = translationBlocks.slice(1).map(block => ({
    block,
    message: readPoBlock(translationBlocks[0], block),
  }))
  if (blocks.filter(({message}) => message).length !== countParsedMessages(translation)) {
    throw new Error("Translation catalog must separate PO entries with blank lines")
  }
  let changed = false
  const retainedBlocks = [translationBlocks[0]]
  for (const {block, message} of blocks) {
    if (!message) {
      retainedBlocks.push(block)
      continue
    }
    const sourceItem = sourceMessages.get(message.context)
    if (!sourceItem || message.obsolete) {
      changed = true
      continue
    }
    if (message.item.msgid === sourceItem.msgid) {
      retainedBlocks.push(block)
      continue
    }
    retainedBlocks.push({
      ...block,
      body: updateMessage(
        message,
        sourceItem.msgid,
        block.body.includes("\r\n") ? "\r\n" : "\n",
      ),
    })
    changed = true
  }

  if (!changed) return translationCatalog
  const updated = retainedBlocks.map(block => `${block.prefix}${block.body}`).join("")
  const finalEol = translationCatalog.endsWith("\r\n")
    ? "\r\n"
    : translationCatalog.endsWith("\n") ? "\n" : ""
  return finalEol && !updated.endsWith(finalEol) ? `${updated}${finalEol}` : updated
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
  "unmerged",
  "missing",
  "stale-source",
  "boundary-whitespace",
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
    const retainedSource = translationItem && previousSource(translationItem)
    const review = {
      fuzzy: translationItem ? isFuzzy(translationItem) : false,
      ...(retainedSource !== undefined ? {previousSource: retainedSource} : {}),
    }

    if (!sourceItem) {
      return {key, status: "orphaned", source: null, translation, ...review}
    }
    if (!translationItem) {
      return {
        key,
        status: "unmerged",
        source: sourceItem.msgid,
        translation: null,
        ...review,
      }
    }
    if (translationItem.msgid !== sourceItem.msgid) {
      return {
        key,
        status: "stale-source",
        source: sourceItem.msgid,
        translationSource: translationItem.msgid,
        translation,
        ...review,
      }
    }
    const boundaryWhitespaceDetails = [
      ...describeBoundaryWhitespace(sourceItem.msgid, "source"),
      ...describeBoundaryWhitespace(translation, "translation"),
    ]
    if (boundaryWhitespaceDetails.length > 0) {
      return {
        key,
        status: "boundary-whitespace",
        source: sourceItem.msgid,
        translation: translation.length > 0 ? translation : null,
        boundaryWhitespace: boundaryWhitespaceDetails,
        ...review,
      }
    }
    if (translation.length === 0) {
      return {
        key,
        status: "missing",
        source: sourceItem.msgid,
        translation: null,
        ...review,
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
        ...review,
      }
    }
    return {
      key,
      status: translation === sourceItem.msgid ? "english-identical" : "translated",
      source: sourceItem.msgid,
      translation,
      ...review,
    }
  })

  return {
    counts: {
      ...Object.fromEntries(ANALYSIS_STATUSES.map(status => [
        status,
        entries.filter(entry => entry.status === status).length,
      ])),
      fuzzy: entries.filter(entry => entry.fuzzy).length,
    },
    entries,
  }
}

export const analyzePoCatalog = (sourceCatalog, translationCatalog) => ({
  ...analyzeActivePoCatalog(sourceCatalog, translationCatalog),
  obsolete: readObsoleteMessages(translationCatalog),
})

export const compilePoCatalog = (
  source,
  {requireMerged = false, sourceLanguage = false, sourceCatalog} = {},
) => {
  if (!sourceLanguage && sourceCatalog === undefined) {
    throw new Error("A current source catalog is required for translated catalogs")
  }
  const sourceMessages = sourceLanguage
    ? readActiveMessages(source)
    : readActiveMessages(sourceCatalog)
  const obsolete = (sourceLanguage || requireMerged) && readObsoleteMessages(source)[0]
  if (obsolete) {
    const hint = sourceLanguage
      ? "Remove obsolete messages from the source catalog."
      : UPDATE_CATALOG_HINT
    throw new Error(
      "Catalog contains an obsolete message: "
      + `${obsolete.key ?? obsolete.source}. ${hint}`,
    )
  }
  const sourceTopology = {}
  for (const key of sourceMessages.keys()) {
    setNestedValue(sourceTopology, key, "")
  }
  const messages = []

  if (sourceLanguage) {
    for (const [key, item] of sourceMessages) {
      const boundaryWhitespaceDetails = describeBoundaryWhitespace(item.msgid, "source")
      if (boundaryWhitespaceDetails.length > 0) {
        throw new Error(
          `Boundary whitespace is not allowed for ${key}: `
          + boundaryWhitespaceDetails.join("; "),
        )
      }
      messages.push({key, value: item.msgid})
    }
  } else {
    const analysis = analyzeActivePoCatalog(sourceCatalog, source)
    const unmerged = analysis.entries.find(entry => entry.status === "unmerged")
    if (requireMerged && unmerged) {
      throw new Error(
        `Translation catalog has not been merged for: ${unmerged.key}. ${UPDATE_CATALOG_HINT}`,
      )
    }
    const orphaned = analysis.entries.find(entry => entry.status === "orphaned")
    if (orphaned) {
      throw new Error(
        `Translation has no current source message: ${orphaned.key}. ${UPDATE_CATALOG_HINT}`,
      )
    }
    const entriesByKey = new Map(analysis.entries.map(entry => [entry.key, entry]))
    for (const key of sourceMessages.keys()) {
      const entry = entriesByKey.get(key)
      if (entry.status === "stale-source") {
        throw new Error(
          `Translation source is stale for ${entry.key}: `
          + `expected ${JSON.stringify(entry.source)}, `
          + `received ${JSON.stringify(entry.translationSource)}. `
          + UPDATE_CATALOG_HINT,
        )
      }
      if (entry.status === "placeholder-mismatch") {
        throw new Error(
          `Placeholder mismatch for ${entry.key}: `
          + entry.placeholderDifferences.join("; "),
        )
      }
      if (entry.status === "boundary-whitespace") {
        throw new Error(
          `Boundary whitespace is not allowed for ${entry.key}: `
          + entry.boundaryWhitespace.join("; "),
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
