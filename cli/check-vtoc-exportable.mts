#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import { determineVtocType } from "../src/common/prodos_hdv"

const fail = (message: string, exitCode = 1): never => {
  process.stderr.write(`${message}\n`)
  process.exit(exitCode)
}

const parseArgs = (argv: string[]) => {
  const options = new Map<string, string>()
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i]
    if (!token.startsWith("--")) continue

    const eq = token.indexOf("=")
    if (eq >= 0) {
      options.set(token.slice(2, eq), token.slice(eq + 1))
      continue
    }

    const key = token.slice(2)
    const next = argv[i + 1]
    if (next !== undefined && !next.startsWith("--")) {
      options.set(key, next)
      i += 1
      continue
    }

    options.set(key, "true")
  }
  return options
}

const requireOption = (options: Map<string, string>, key: string) => {
  if (!options.has(key)) {
    fail(`Missing required option --${key}`)
  }
  return String(options.get(key))
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))
  const inputPath = path.resolve(requireOption(options, "input"))
  const filename = path.basename(inputPath)
  const data = new Uint8Array(await fs.readFile(inputPath))
  const vtocType = determineVtocType(filename, data)
  const exportable = vtocType !== "other" && vtocType !== "dosup"

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      inputPath,
      filename,
      vtocType,
      exportable,
    })}\n`,
  )
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
