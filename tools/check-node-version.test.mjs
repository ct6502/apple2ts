import { test } from "node:test"
import assert from "node:assert/strict"
import { isPatchedNodeVersion } from "./check-node-version.mjs"

test("rejects vulnerable, unsupported, and prerelease versions", () => {
  for (const version of ["22.23.3", "24.22.0", "26.12.0", "20.99.0", "23.99.0", "24.22.1-rc.1", "invalid"]) {
    assert.equal(isPatchedNodeVersion(version), false, version)
  }
})
test("accepts patched releases and later patches in supported lines", () => {
  for (const version of ["22.23.4", "24.22.1", "26.12.1", "v24.22.1", "22.24.0", "24.23.0", "26.12.2"]) {
    assert.equal(isPatchedNodeVersion(version), true, version)
  }
})
