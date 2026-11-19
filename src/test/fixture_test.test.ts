import { testWithFixtures } from "./fixture_test"

describe("testWithFixtures", () => {
  test("runs when all fixtures exist", () => {
    expect(testWithFixtures(__filename)).toBe(test)
  })

  test("skips missing fixtures and reports them once", () => {
    const warn = jest.spyOn(process.stderr, "write").mockImplementation(() => true)
    const missing = `${__filename}.missing`
    try {
      expect(testWithFixtures(__filename, missing)).toBe(test.skip)
      expect(testWithFixtures(missing)).toBe(test.skip)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledWith(`Skipping tests: missing fixture ${missing}\n`)
    } finally {
      warn.mockRestore()
    }
  })

  test("does not hide other filesystem errors", () => {
    expect(() => testWithFixtures(`${__filename}/child`)).toThrow()
  })
})
