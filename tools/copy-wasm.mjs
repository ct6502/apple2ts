import fs from "node:fs"
import path from "node:path"

const src = path.resolve("node_modules/sevenzip-wasm/sevenzip-wasm.wasm")
const destDir = path.resolve("public/js")
const dest = path.join(destDir, "sevenzip-wasm.wasm")

if (fs.existsSync(src)) {
  fs.mkdirSync(destDir, { recursive: true })
  fs.copyFileSync(src, dest)
}
