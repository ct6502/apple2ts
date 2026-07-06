#!/usr/bin/env node

import { promises as fs } from "node:fs"
import path from "node:path"
import {
  buildProDosHdv,
  classifyImageKind,
  stripTwoImgHeader,
  PRODOS_FILE_TYPE_DOS_MASTER,
  ensureDosVolumeHasHelloGreeting,
  loadWozAndExtractDosImage,
  loadWozAndExtractProDosFiles,
} from "../src/common/prodos_hdv"

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

const ensureParentDir = async (filePath: string) => {
  await fs.mkdir(path.dirname(filePath), { recursive: true })
}

const trimExt = (filename: string) => {
  const ext = path.extname(filename)
  const base = ext ? filename.slice(0, -ext.length) : filename
  return base || "DISK"
}

const main = async () => {
  const options = parseArgs(process.argv.slice(2))

  const inputPath = path.resolve(requireOption(options, "input"))
  const outputPath = path.resolve(requireOption(options, "output"))
  const diskName = options.has("name") ? String(options.get("name")) : trimExt(path.basename(inputPath))
  const volumeName = options.has("volume") ? String(options.get("volume")) : "APPLE2TS"

  const inputData = new Uint8Array(await fs.readFile(inputPath))

  let fileKind = classifyImageKind(path.basename(inputPath), inputData)
  let diskBytes = stripTwoImgHeader(inputData)

  if (path.extname(inputPath).toLowerCase() === ".woz") {
    const extractedProDos = loadWozAndExtractProDosFiles(inputData)
    if (extractedProDos.length > 0) {
      // Keep behavior simple and deterministic: embed the raw WOZ when extraction is multi-file.
      fileKind = "prodos"
    } else {
      const dosImage = loadWozAndExtractDosImage(inputData)
      if (dosImage) {
        diskBytes = dosImage
        fileKind = "dos"
      }
    }
  }

  if (fileKind === "dos") {
    const greeting = ensureDosVolumeHasHelloGreeting(diskBytes)
    diskBytes = greeting.image
  }

  const fileEntry = {
    name: diskName.slice(0, 15),
    type: fileKind === "dos" ? PRODOS_FILE_TYPE_DOS_MASTER : 0xe0,
    data: diskBytes,
    auxType: 0x0000,
  }

  const menuEntries = [
    {
      filename: diskName.slice(0, 15),
      sourceFilename: path.basename(inputPath),
      displayName: diskName,
      imageKind: fileKind,
    },
  ]

  const basePath = path.resolve(process.cwd(), "public", "disks", "dosmaster18.po")
  const baseData = new Uint8Array(await fs.readFile(basePath))
  const hdvData = await buildProDosHdv([fileEntry], volumeName, baseData, menuEntries)

  await ensureParentDir(outputPath)
  await fs.writeFile(outputPath, Buffer.from(hdvData))

  process.stdout.write(
    `${JSON.stringify({
      ok: true,
      inputPath,
      outputPath,
      sourceBytes: inputData.length,
      hdvBytes: hdvData.length,
      imageKind: fileKind,
    })}\n`,
  )
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error))
})
