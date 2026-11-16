/* global process */

import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const target = process.argv[2]
const validTargets = new Set(["apple2ts", "apple2gts"])

if (!target || !validTargets.has(target)) {
  console.error("Usage: node tools/build-target.mjs <apple2ts|apple2gts>")
  process.exit(1)
}

const env = { ...process.env, BUILD_TARGET: target }
const tscPath = resolve("node_modules/typescript/bin/tsc")
const vitePath = resolve("node_modules/vite/bin/vite.js")

if (!existsSync(tscPath) || !existsSync(vitePath)) {
  console.error("TypeScript and Vite must be installed before building. Run npm ci --ignore-scripts.")
  process.exit(1)
}

const run = (args) => {
  const result = spawnSync(process.execPath, args, { env, stdio: "inherit" })
  if (result.error) {
    console.error(result.error.message)
    process.exit(1)
  }
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log(`Building ${target} target...`)
run(["--max-old-space-size=8192", tscPath])
run([vitePath, "build"])
console.log(`Built ${target} target in dist/${target}.`)
