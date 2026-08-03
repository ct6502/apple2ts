import assert from "node:assert/strict"
import { link, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { afterEach, describe, it } from "node:test"
import { rmSync } from "node:fs"

const cliPath = resolve("tools/i18n/po-catalog-cli.mjs")
const temporaryDirectories = []

const po = body => `msgid ""
msgstr ""
"Content-Type: text/plain; charset=UTF-8\\n"

${body}`

const source = po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr ""

msgctxt "controls.reset"
msgid "Reset"
msgstr ""
`)

const translation = po(`
msgctxt "controls.boot"
msgid "Boot"
msgstr "Démarrer"

msgctxt "controls.reset"
msgid "Reset"
msgstr ""
`)

const run = args => spawnSync(process.execPath, [cliPath, ...args], {
  encoding: "utf8",
})

const makeFixture = async () => {
  const directory = await mkdtemp(join(tmpdir(), "apple2ts-po-cli-"))
  temporaryDirectories.push(directory)
  const sourcePath = join(directory, "en.po")
  const inputPath = join(directory, "fr.po")
  const outputPath = join(directory, "fr.ts")
  await writeFile(sourcePath, source)
  await writeFile(inputPath, translation)
  return {directory, sourcePath, inputPath, outputPath}
}

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, {recursive: true, force: true})
  }
})

describe("po catalog CLI", () => {
  it("documents its repository-local command contract", () => {
    const result = run(["--help"])

    assert.equal(result.status, 0)
    assert.match(result.stdout, /compile --input FILE/)
    assert.match(result.stdout, /report --source FILE/)
    assert.equal(result.stderr, "")

    const commandHelp = run(["compile", "--help"])
    assert.equal(commandHelp.status, 0)
    assert.equal(commandHelp.stdout, result.stdout)
  })

  it("writes a catalog atomically and leaves matching output unchanged", async () => {
    const {sourcePath, inputPath, outputPath} = await makeFixture()
    const args = [
      "compile",
      "--source", sourcePath,
      "--input", inputPath,
      "--export", "fr",
      "--output", outputPath,
    ]

    const generated = run(args)
    assert.equal(generated.status, 0)
    assert.match(generated.stdout, /Generated catalog:/)
    assert.equal(
      await readFile(outputPath, "utf8"),
      `export const fr = {
  "controls": {
    "boot": "Démarrer"
  }
}
`,
    )

    const unchanged = run(args)
    assert.equal(unchanged.status, 0)
    assert.match(unchanged.stdout, /Catalog unchanged:/)
  })

  it("reports generated-file drift without writing", async () => {
    const {sourcePath, inputPath, outputPath} = await makeFixture()
    await writeFile(outputPath, "stale\n")

    const result = run([
      "compile",
      "--source", sourcePath,
      "--input", inputPath,
      "--export", "fr",
      "--output", outputPath,
      "--check",
    ])

    assert.equal(result.status, 1)
    assert.match(result.stderr, /Generated catalog is stale:/)
    assert.equal(await readFile(outputPath, "utf8"), "stale\n")
  })

  it("rejects an output alias that identifies the input file", async () => {
    const {directory, sourcePath, inputPath} = await makeFixture()
    const outputPath = join(directory, "fr-alias.po")
    await link(inputPath, outputPath)

    const result = run([
      "compile",
      "--source", sourcePath,
      "--input", inputPath,
      "--export", "fr",
      "--output", outputPath,
    ])

    assert.equal(result.status, 2)
    assert.match(result.stderr, /Output must not overwrite a PO input file/)
    assert.equal(await readFile(inputPath, "utf8"), translation)
  })

  it("prints a versioned deterministic JSON report", async () => {
    const {sourcePath, inputPath} = await makeFixture()

    const result = run([
      "report",
      "--source", sourcePath,
      "--input", inputPath,
    ])

    assert.equal(result.status, 0)
    assert.equal(result.stderr, "")
    const report = JSON.parse(result.stdout)
    assert.equal(report.schemaVersion, 1)
    assert.equal(report.source, sourcePath)
    assert.equal(report.input, inputPath)
    assert.equal(report.counts.translated, 1)
    assert.equal(report.counts.missing, 1)
  })

  it("uses a distinct exit status for invalid invocation", () => {
    const result = run(["compile", "--input", "missing.po"])

    assert.equal(result.status, 2)
    assert.match(result.stderr, /Missing required option: --output/)
  })
})
