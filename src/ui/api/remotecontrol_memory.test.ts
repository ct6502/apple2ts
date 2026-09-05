import { requestClearMemoryWriteWatchpoint, requestMemorySearch, requestMemoryView, requestSetMemoryWriteWatchpoint } from "../main2worker"
import { clearRemoteMemoryWriteWatchpoint, findRemoteMemory, readRemoteMemory, setRemoteMemoryWriteWatchpoint } from "./remotecontrol_memory"

jest.mock("../main2worker", () => ({
  requestClearMemoryWriteWatchpoint: jest.fn(),
  requestMemorySearch: jest.fn(),
  requestMemoryView: jest.fn(),
  requestSetMemoryWriteWatchpoint: jest.fn(),
}))

const mockRequestMemorySearch = jest.mocked(requestMemorySearch)
const mockRequestMemoryView = jest.mocked(requestMemoryView)
const mockRequestSetMemoryWriteWatchpoint = jest.mocked(requestSetMemoryWriteWatchpoint)
const mockRequestClearMemoryWriteWatchpoint = jest.mocked(requestClearMemoryWriteWatchpoint)

test("returns the complete worker-owned memory view", async () => {
  mockRequestMemoryView.mockResolvedValue({
    address: 0x03A4,
    length: 2,
    requestedSpace: "aux",
    requestedAuxBank: null,
    effectiveAuxBank: 1,
    effectiveSegments: [{address: 0x03A4, length: 2, space: "aux", auxBank: 1}],
    mapping: {
      RAMRD: true,
      RAMWRT: false,
      ALTZP: false,
      "80STORE": false,
      PAGE2: false,
      HIRES: false,
    },
    bytes: Uint8Array.from([0x11, 0x22]),
  })

  await expect(readRemoteMemory({address: 0x03A4, length: 2, space: "aux"})).resolves.toEqual({
    address: 0x03A4,
    length: 2,
    requestedSpace: "aux",
    requestedAuxBank: null,
    effectiveAuxBank: 1,
    effectiveSegments: [{address: 0x03A4, length: 2, space: "aux", auxBank: 1}],
    mapping: {
      RAMRD: true,
      RAMWRT: false,
      ALTZP: false,
      "80STORE": false,
      PAGE2: false,
      HIRES: false,
    },
    bytes: [0x11, 0x22],
  })
  expect(mockRequestMemoryView).toHaveBeenCalledWith({
    address: 0x03A4,
    length: 2,
    space: "aux",
    auxBank: undefined,
  })
})

test("returns the worker-owned memory search result", async () => {
  const result = {
    address: 0x2000,
    length: 16,
    requestedSpace: "main" as const,
    requestedAuxBank: null,
    effectiveAuxBank: null,
    effectiveSegments: [{address: 0x2000, length: 16, space: "main" as const}],
    mapping: {RAMRD: false, RAMWRT: false, ALTZP: false, "80STORE": false, PAGE2: false, HIRES: false},
    matches: [0x2004],
    totalMatchCount: 1,
    truncated: false,
  }
  mockRequestMemorySearch.mockResolvedValue(result)

  await expect(findRemoteMemory({
    address: 0x2000,
    length: 16,
    space: "main",
    bytes: [0xAA],
    maxMatches: 8,
  })).resolves.toEqual(result)
  expect(mockRequestMemorySearch).toHaveBeenCalledWith({
    address: 0x2000,
    length: 16,
    space: "main",
    auxBank: undefined,
    bytes: [0xAA],
    maxMatches: 8,
  })
})

test("preserves the worker default when maximum matches is omitted", async () => {
  mockRequestMemorySearch.mockResolvedValue({} as MemorySearchResult)

  await findRemoteMemory({address: 0, length: 1, space: "active", bytes: [0]})
  expect(mockRequestMemorySearch).toHaveBeenCalledWith({
    address: 0,
    length: 1,
    space: "active",
    auxBank: undefined,
    bytes: [0],
    maxMatches: undefined,
  })
})

test("sets and clears the worker-owned write watchpoint", async () => {
  mockRequestSetMemoryWriteWatchpoint.mockResolvedValue({
    watchpointId: "mwp:main:-:932:4",
    address: 0x03A4,
    length: 4,
    space: "main",
    auxBank: null,
    executionSequence: 7,
  })
  mockRequestClearMemoryWriteWatchpoint.mockResolvedValue({cleared: true})

  await setRemoteMemoryWriteWatchpoint({address: 0x03A4, length: 4, space: "main"})
  expect(mockRequestSetMemoryWriteWatchpoint).toHaveBeenCalledWith({
    address: 0x03A4,
    length: 4,
    space: "main",
    auxBank: undefined,
  })
  await expect(clearRemoteMemoryWriteWatchpoint()).resolves.toEqual({cleared: true})
})
