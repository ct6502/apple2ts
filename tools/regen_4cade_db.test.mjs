import assert from "node:assert/strict"
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import process from "node:process"
import { spawnSync } from "node:child_process"
import { fileURLToPath } from "node:url"
import { test } from "node:test"

const script = join(dirname(fileURLToPath(import.meta.url)), "regen_4cade_db.ts")

test("requires a 4cade source directory", () => {
  const result = spawnSync(process.execPath, [script], { encoding: "utf8" })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /--source \/path\/to\/4cade/)
})

test("reports every missing source path", () => {
  const source = mkdtempSync(join(tmpdir(), "apple2ts-4cade-"))
  try {
    const result = spawnSync(process.execPath, [script, "--source", source], { encoding: "utf8" })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /res\/GAMES\.CONF, res\/dsk, src\/prelaunch/)
  } finally {
    rmSync(source, { recursive: true, force: true })
  }
})

test("writes the generated catalog", () => {
  const root = mkdtempSync(join(tmpdir(), "apple2ts-4cade-test-"))
  try {
    const source = join(root, "4cade")
    const tools = join(root, "tools")
    const output = join(root, "src/common/four_cade_prelaunch_db.ts")
    mkdirSync(join(source, "res/dsk"), { recursive: true })
    mkdirSync(join(source, "src/prelaunch"), { recursive: true })
    mkdirSync(tools)
    mkdirSync(join(root, "src/common"), { recursive: true })
    writeFileSync(join(source, "res/GAMES.CONF"), "")
    copyFileSync(script, join(tools, "regen_4cade_db.ts"))

    const result = spawnSync(process.execPath, [join(tools, "regen_4cade_db.ts"), "--source", source], {
      encoding: "utf8",
    })
    assert.equal(result.status, 0, result.stderr)
    const generated = readFileSync(output, "utf8")
    assert.match(generated, /export const FOUR_CADE_PRELAUNCH_DB/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
