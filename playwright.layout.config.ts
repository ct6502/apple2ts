import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { readFileSync } from "node:fs"
import { defineConfig } from "@playwright/test"

const git = (...args: string[]) => execFileSync("git", args, {
  encoding: "utf8",
}).trim()

const sourceCommit = git("rev-parse", "HEAD")
const sourceState = git("status", "--short")
if (sourceState) {
  throw new Error("UI layout acceptance requires a clean Git worktree")
}
const buildIndexSha256 = createHash("sha256")
  .update(readFileSync("dist/index.html"))
  .digest("hex")

export default defineConfig({
  testDir: "tests/ui-layout",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: true,
  reporter: "line",
  outputDir: "test-results/ui-layout",
  metadata: {
    sourceCommit,
    sourceState: "clean",
    buildIndexSha256,
  },
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    locale: "en-US",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    video: "off",
  },
  webServer: {
    command: "npm run preview -- --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: false,
    timeout: 30_000,
    stdout: "ignore",
    stderr: "pipe",
  },
})
