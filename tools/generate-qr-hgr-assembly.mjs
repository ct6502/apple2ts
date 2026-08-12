import { readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { argv } from "node:process"
import { fileURLToPath } from "node:url"
import { assemble } from "jsasm6502"
import { load } from "js-yaml"

const rootDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const assemblyPath = resolve(rootDirectory, "src/common/qr_hgr.asm")
const outputPath = resolve(rootDirectory, "src/common/qr_hgr_assembly.generated.ts")

const readFile = (filename, fromDirectory = "", asBinary = false) => {
  try {
    const path = resolve(rootDirectory, fromDirectory, filename)
    const content = readFileSync(path)
    return {
      path,
      dir: dirname(path),
      content: asBinary ? content : content.toString(),
      error: "",
    }
  } catch (error) {
    return { path: "", dir: "", content: "", error: error.message }
  }
}

const result = assemble(assemblyPath, { readFile, YAMLparse: load })
if (result.error) throw new Error(result.error)

const formatBytes = bytes => {
  const lines = []
  for (let offset = 0; offset < bytes.length; offset += 16) {
    lines.push(`  ${bytes.slice(offset, offset + 16).map(byte => `0x${byte.toString(16).padStart(2, "0")}`).join(", ")},`)
  }
  return lines.join("\n")
}

const formatSegment = name => {
  const exportName = `QR_HGR_${name}`
  return `export const ${exportName}_ADDRESS = 0x${result.segments[name].start.toString(16)}\nexport const ${exportName}_BYTES = Uint8Array.from([\n${formatBytes(result.obj[name])}\n])`
}

const generated = `// Generated from qr_hgr.asm by tools/generate-qr-hgr-assembly.mjs.\n// Do not edit directly.\n\n${["PATCHES", "SHIMS", "TRAMPOLINE", "RENDERER"].map(formatSegment).join("\n\n")}\n`

if (argv.includes("--check")) {
  const current = readFileSync(outputPath, "utf8")
  if (current !== generated) {
    throw new Error("Generated QR HGR assembly is stale; run npm run generate-qr-hgr-assembly")
  }
} else {
  writeFileSync(outputPath, generated)
}
