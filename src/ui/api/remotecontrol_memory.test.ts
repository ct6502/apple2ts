import { requestMemoryView } from "../main2worker"
import { readRemoteMemory } from "./remotecontrol_memory"

jest.mock("../main2worker", () => ({requestMemoryView: jest.fn()}))

const mockRequestMemoryView = jest.mocked(requestMemoryView)

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
