import {
  buildLinkBuilderUrl,
  createDefaultLinkBuilderState,
  encodeLinkBuilderContentBytes,
  machineNameToLinkBuilderMachine,
  parseLinkBuilderStateFromUrl,
  sanitizeLinkBuilderContent,
} from "./linkbuilder"

test("builds a disk link with common options", () => {
  const state = createDefaultLinkBuilderState("https://example.com/emulator/")
  state.fragmentUrl = "https://archive.org/download/demo/Demo Disk.woz"
  state.speed = "fast"
  state.theme = "dark"
  state.sound = "off"

  expect(buildLinkBuilderUrl(state)).toEqual(
    "https://example.com/emulator/?machine=apple2ee&sound=off&speed=fast&theme=dark#https://archive.org/download/demo/Demo%20Disk.woz",
  )
})

test("builds a hex loader link with address and run=false", () => {
  const state = createDefaultLinkBuilderState("https://example.com")
  state.contentType = "hex"
  state.contentValue = "A9008D00C0"
  state.address = "7fd"
  state.run = false

  expect(buildLinkBuilderUrl(state)).toEqual(
    "https://example.com?machine=apple2ee&hex=A9008D00C0&address=7fd&run=false",
  )
})

test("omits empty optional values while preserving text case", () => {
  const state = createDefaultLinkBuilderState("https://example.com/app?old=1#bad")
  state.contentType = "text"
  state.contentValue = "PRINT \"Hello Apple II\""

  expect(buildLinkBuilderUrl(state)).toEqual(
    "https://example.com/app?machine=apple2ee&text=PRINT+%22Hello+Apple+II%22",
  )
})

test("builds a Total Replay alias link with typed text", () => {
  const state = createDefaultLinkBuilderState("https://example.com/app")
  state.fragmentUrl = "replay"
  state.contentType = "text"
  state.contentValue = "chop"

  expect(buildLinkBuilderUrl(state)).toEqual(
    "https://example.com/app?machine=apple2ee&text=chop#replay",
  )
})

test("maps current machine names into builder machine values", () => {
  expect(machineNameToLinkBuilderMachine("APPLE2P")).toEqual("apple2p")
  expect(machineNameToLinkBuilderMachine("APPLE2EU")).toEqual("apple2eu")
  expect(machineNameToLinkBuilderMachine("APPLE2EE")).toEqual("apple2ee")
})

test("encodes captured bytes for hex and binary content", () => {
  const bytes = new Uint8Array([0xA9, 0x00, 0x8D, 0x00, 0xC0])

  expect(encodeLinkBuilderContentBytes("hex", bytes)).toEqual("A9008D00C0")
  expect(encodeLinkBuilderContentBytes("binary", bytes)).toEqual("qQCNAMA=")
})

test("sanitizes pasted hex and base64 content", () => {
  expect(sanitizeLinkBuilderContent("hex", "A9 00\n8D 00 C0 junk")).toEqual("A9008D00C0")
  expect(sanitizeLinkBuilderContent("binary", "GZIP qQCN\nAMA=***")).toEqual("GZIPqQCNAMA=")
  expect(sanitizeLinkBuilderContent("text", "10 PRINT\n20 GOTO 10")).toEqual("10 PRINT\n20 GOTO 10")
})

test("parses current url into builder state", () => {
  const state = parseLinkBuilderStateFromUrl(
    "https://example.com/?machine=apple2eu&speed=fast&hex=A9%2000%0A8D00C0&address=07FD&run=false#https://archive.org/demo.woz",
    "apple2ee",
  )

  expect(state.baseUrl).toEqual("https://example.com/")
  expect(state.machine).toEqual("apple2eu")
  expect(state.speed).toEqual("fast")
  expect(state.contentType).toEqual("hex")
  expect(state.contentValue).toEqual("A9008D00C0")
  expect(state.address).toEqual("07FD")
  expect(state.run).toBe(false)
  expect(state.fragmentUrl).toEqual("https://archive.org/demo.woz")
})

test("parses fragment aliases alongside text input", () => {
  const state = parseLinkBuilderStateFromUrl(
    "https://example.com/?machine=apple2p&text=chop#replay",
    "apple2ee",
  )

  expect(state.machine).toEqual("apple2p")
  expect(state.contentType).toEqual("text")
  expect(state.contentValue).toEqual("chop")
  expect(state.fragmentUrl).toEqual("replay")
})
