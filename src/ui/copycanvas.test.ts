import { handleCopyToClipboard } from "./copycanvas"

jest.mock("./main2worker", () => ({
  handleGetAltCharSet: jest.fn(),
  handleGetMachineName: jest.fn(),
  handleGetTextPage: jest.fn(),
}))

import { handleGetAltCharSet, handleGetMachineName, handleGetTextPage } from "./main2worker"

const mockGetAltCharSet = handleGetAltCharSet as jest.Mock
const mockGetMachineName = handleGetMachineName as jest.Mock
const mockGetTextPage = handleGetTextPage as jest.Mock

test("copy text in APPLE2P mode ignores alt charset mapping", () => {
  const textPage = new Uint8Array(960).fill(0xA0)
  // Sequence in Apple II+ high-bit text style:
  // E2 -> ", E0 -> space, EC -> comma, EE -> period.
  const line = [0xC1, 0xE2, 0xC2, 0xE0, 0xC3, 0xEC, 0xC4, 0xEE]
  for (let i = 0; i < line.length; i++) {
    textPage[i] = line[i]
  }

  mockGetTextPage.mockReturnValue(textPage)
  mockGetMachineName.mockReturnValue("APPLE2P")
  // Intentionally true: APPLE2P should still decode with alt charset disabled.
  mockGetAltCharSet.mockReturnValue(true)

  const writeText = jest.fn()
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText },
    configurable: true,
  })

  handleCopyToClipboard()

  expect(writeText).toHaveBeenCalledTimes(1)
  const output = writeText.mock.calls[0][0] as string
  expect(output.split("\n")[0]).toEqual("A\"B C,D.")
})
