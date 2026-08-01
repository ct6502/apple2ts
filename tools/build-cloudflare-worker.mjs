/* global process */

import { execFileSync } from "node:child_process"
import { readFile, rm, writeFile } from "node:fs/promises"
import path from "node:path"

const distDir = path.resolve("dist")
const multipartFile = path.join(distDir, ".pages-functions-worker.multipart")
const npx = process.platform === "win32" ? "npx.cmd" : "npx"

execFileSync(
  npx,
  [
    "--yes",
    "wrangler@3.114.17",
    "pages",
    "functions",
    "build",
    "functions",
    "--outfile",
    multipartFile,
    "--output-config-path",
    path.join(distDir, "_routes.json"),
  ],
  { stdio: "inherit", shell: process.platform === "win32" },
)

const multipart = await readFile(multipartFile, "utf8")
const moduleMarker = "Content-Type: application/javascript+module"
const moduleStart = multipart.indexOf(moduleMarker)
if (moduleStart < 0) {
  throw new Error("Wrangler did not produce a Pages Functions JavaScript module")
}

const contentStart = multipart.indexOf("\n\n", moduleStart)
const contentEnd = multipart.indexOf("\n------formdata-", contentStart + 2)
if (contentStart < 0 || contentEnd < 0) {
  throw new Error("Unable to extract the Pages Functions JavaScript module")
}

const workerBody = multipart.slice(contentStart + 2, contentEnd).trimStart()
const worker = workerBody.includes("var __name")
  ? workerBody
  : `var __defProp = Object.defineProperty
var __name = (target, value) => __defProp(target, "name", { value, configurable: true })

${workerBody}`
await writeFile(path.join(distDir, "_worker.js"), worker, "utf8")
await writeFile(
  path.join(distDir, "_routes.json"),
  `${JSON.stringify({
    version: 1,
    include: ["/api/demozoo-direct/*", "/api/disk-direct"],
    exclude: [],
  }, null, 2)}\n`,
  "utf8",
)
await rm(multipartFile, { force: true })

console.log("Created dist/_worker.js from the Wrangler Pages Functions bundle.")
