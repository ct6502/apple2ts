import { statSync } from "node:fs"

const reportedMissing = new Set<string>()

export const testWithFixtures = (...paths: string[]): typeof test => {
  const missing = paths.filter(path => {
    try {
      statSync(path)
      return false
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return true
      throw error
    }
  })

  for (const path of missing) {
    if (!reportedMissing.has(path)) {
      process.stderr.write(`Skipping tests: missing fixture ${path}\n`)
      reportedMissing.add(path)
    }
  }
  return missing.length ? test.skip : test
}
