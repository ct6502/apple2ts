import { pathToFileURL } from "node:url"

const minimums = new Map([[22, [23, 4]], [24, [22, 1]], [26, [12, 1]]])

export function isPatchedNodeVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) return false
  const [, major, minor, patch] = match.map(Number)
  const minimum = minimums.get(major)
  return !!minimum && (minor > minimum[0] || (minor === minimum[0] && patch >= minimum[1]))
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!isPatchedNodeVersion(process.versions.node) || Number(process.versions.node.split(".")[0]) < 24) {
    console.error(`Node.js ${process.versions.node} does not meet the supported security baseline. Use 22.23.4+, 24.22.1+, or 26.12.1+ within those release lines (CVE-2026-111497). This project requires Node.js 24 or 26.`)
    process.exitCode = 1
  } else {
    console.log(`Node.js ${process.versions.node}: security baseline satisfied.`)
  }
}
