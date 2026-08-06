import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { updateCatalogs } from "./update-catalogs-lib.mjs"

const options = {
  catalogDirectory: "/catalogs",
  locales: ["de", "pt-BR"],
  source: "/catalogs/messages.pot",
}

describe("updateCatalogs", () => {
  it("updates every locale with previous msgids and no backup files", () => {
    const calls = []
    const code = updateCatalogs({
      ...options,
      run(command, arguments_, runOptions) {
        calls.push({command, arguments_, runOptions})
        return {status: 0}
      },
    })

    assert.equal(code, 0)
    assert.deepEqual(calls, [
      {
        command: "msgmerge",
        arguments_: ["--version"],
        runOptions: {encoding: "utf8"},
      },
      {
        command: "msgmerge",
        arguments_: [
          "--previous", "--update", "--backup=none",
          "/catalogs/de.po", "/catalogs/messages.pot",
        ],
        runOptions: {stdio: "inherit"},
      },
      {
        command: "msgmerge",
        arguments_: [
          "--previous", "--update", "--backup=none",
          "/catalogs/pt-BR.po", "/catalogs/messages.pot",
        ],
        runOptions: {stdio: "inherit"},
      },
    ])
  })

  it("fails clearly without modifying catalogs when msgmerge is unavailable", () => {
    let message = ""
    let calls = 0
    const code = updateCatalogs({
      ...options,
      run() {
        calls += 1
        return {error: {code: "ENOENT"}}
      },
      stderr: {write(value) { message += value }},
    })

    assert.equal(code, 2)
    assert.equal(calls, 1)
    assert.equal(message, "GNU gettext msgmerge is required to update PO catalogs.\n")
  })

  it("stops at the first catalog that msgmerge cannot update", () => {
    let message = ""
    let calls = 0
    const code = updateCatalogs({
      ...options,
      run() {
        calls += 1
        return {status: calls === 3 ? 1 : 0}
      },
      stderr: {write(value) { message += value }},
    })

    assert.equal(code, 1)
    assert.equal(calls, 3)
    assert.equal(message, "msgmerge failed while updating pt-BR.po.\n")
  })
})
