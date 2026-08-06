#!/usr/bin/env node

import { randomUUID } from "node:crypto"
import { readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import process from "node:process"
import { pathToFileURL } from "node:url"

import {
  analyzePoCatalog,
  compilePoCatalog,
  renderTypeScriptCatalog,
} from "./po-catalog.mjs"

const HELP = `Usage:
  node tools/i18n/po-catalog-cli.mjs compile --input FILE --export NAME --output FILE [--source FILE | --source-language] [--require-merged] [--check]
  node tools/i18n/po-catalog-cli.mjs report --source FILE --input FILE

Commands:
  compile  Generate a TypeScript catalog, or verify it with --check.
  report   Print a deterministic JSON translation report to stdout.
`

const VALUE_OPTIONS = new Set(["--source", "--input", "--export", "--output"])
const FLAG_OPTIONS = new Set(["--source-language", "--require-merged", "--check"])

const parseArguments = argv => {
  if (argv.length === 0 || argv[0] === "help" || argv.includes("--help")) {
    return {help: true}
  }

  const command = argv[0]
  if (command !== "compile" && command !== "report") {
    throw new Error(`Unknown command: ${command}`)
  }

  const options = {}
  for (let index = 1; index < argv.length; index += 1) {
    const option = argv[index]
    if (VALUE_OPTIONS.has(option)) {
      if (Object.hasOwn(options, option)) {
        throw new Error(`Duplicate option: ${option}`)
      }
      const value = argv[index + 1]
      if (value === undefined || value.startsWith("--")) {
        throw new Error(`Option requires a value: ${option}`)
      }
      options[option] = value
      index += 1
    } else if (FLAG_OPTIONS.has(option)) {
      if (Object.hasOwn(options, option)) {
        throw new Error(`Duplicate option: ${option}`)
      }
      options[option] = true
    } else {
      throw new Error(`Unknown option: ${option}`)
    }
  }
  return {command, options}
}

const requireOption = (options, option) => {
  const value = options[option]
  if (value === undefined) throw new Error(`Missing required option: ${option}`)
  return value
}

const rejectOptions = (options, rejected) => {
  for (const option of rejected) {
    if (Object.hasOwn(options, option)) {
      throw new Error(`Option is not valid for this command: ${option}`)
    }
  }
}

const readUtf8 = path => readFile(path, "utf8")

const sameExistingFile = async (leftPath, rightPath) => {
  try {
    const [left, right] = await Promise.all([stat(leftPath), stat(rightPath)])
    if ((left.dev !== 0 || left.ino !== 0)
      && left.dev === right.dev
      && left.ino === right.ino) {
      return true
    }
    const [canonicalLeft, canonicalRight] = await Promise.all([
      realpath(leftPath),
      realpath(rightPath),
    ])
    return canonicalLeft === canonicalRight
  } catch (error) {
    if (error.code === "ENOENT") return false
    throw error
  }
}

const writeAtomically = async (outputPath, content) => {
  const temporaryPath = `${outputPath}.${process.pid}.${randomUUID()}.tmp`
  try {
    await writeFile(temporaryPath, content, {encoding: "utf8", flag: "wx"})
    await rename(temporaryPath, outputPath)
  } finally {
    await rm(temporaryPath, {force: true})
  }
}

const compile = async options => {
  const inputPath = resolve(requireOption(options, "--input"))
  const outputPath = resolve(requireOption(options, "--output"))
  const exportName = requireOption(options, "--export")
  const sourceLanguage = options["--source-language"] === true
  const sourceOption = options["--source"]

  if (sourceLanguage === (sourceOption !== undefined)) {
    throw new Error("Use exactly one of --source FILE or --source-language")
  }

  const sourcePath = sourceOption === undefined ? undefined : resolve(sourceOption)
  if (outputPath === inputPath
    || outputPath === sourcePath
    || await sameExistingFile(outputPath, inputPath)
    || (sourcePath !== undefined && await sameExistingFile(outputPath, sourcePath))) {
    throw new Error("Output must not overwrite a PO input file")
  }

  const input = await readUtf8(inputPath)
  const sourceCatalog = sourcePath === undefined ? undefined : await readUtf8(sourcePath)
  const catalog = compilePoCatalog(input, {
    requireMerged: options["--require-merged"] === true,
    sourceLanguage,
    sourceCatalog,
  })
  const rendered = renderTypeScriptCatalog(exportName, catalog)

  let existing
  try {
    existing = await readUtf8(outputPath)
  } catch (error) {
    if (error.code !== "ENOENT") throw error
  }

  if (options["--check"]) {
    if (existing !== rendered) {
      process.stderr.write(`Generated catalog is stale: ${outputPath}\n`)
      return 1
    }
    process.stdout.write(`Catalog is current: ${outputPath}\n`)
    return 0
  }

  if (existing === rendered) {
    process.stdout.write(`Catalog unchanged: ${outputPath}\n`)
    return 0
  }

  await writeAtomically(outputPath, rendered)
  process.stdout.write(`Generated catalog: ${outputPath}\n`)
  return 0
}

const report = async options => {
  rejectOptions(options, [
    "--export",
    "--output",
    "--source-language",
    "--require-merged",
    "--check",
  ])
  const sourceArgument = requireOption(options, "--source")
  const inputArgument = requireOption(options, "--input")
  const sourcePath = resolve(sourceArgument)
  const inputPath = resolve(inputArgument)
  const analysis = analyzePoCatalog(
    await readUtf8(sourcePath),
    await readUtf8(inputPath),
  )
  process.stdout.write(`${JSON.stringify({
    schemaVersion: 2,
    source: sourceArgument,
    input: inputArgument,
    ...analysis,
  }, null, 2)}\n`)
  return 0
}

export const run = async argv => {
  const parsed = parseArguments(argv)
  if (parsed.help) {
    process.stdout.write(HELP)
    return 0
  }
  return parsed.command === "compile"
    ? compile(parsed.options)
    : report(parsed.options)
}

const invokedPath = process.argv[1] && pathToFileURL(resolve(process.argv[1])).href
if (import.meta.url === invokedPath) {
  run(process.argv.slice(2))
    .then(code => {
      process.exitCode = code
    })
    .catch(error => {
      process.stderr.write(`po-catalog: ${error.message}\n`)
      process.exitCode = 2
    })
}
