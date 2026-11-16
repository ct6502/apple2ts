import { getMemorySizeLabel, IIGS_MEMORY_KB } from "./utility"
import { gsRAM } from "../worker/memory"

// The footer used to derive RAM from the slot-3 auxiliary card alone, so the
// IIgs - which has no aux slot card - fell through to the 64 KB default even
// though the emulator maps the whole 8 MB FPI window (memory.ts gsRAM).
test("IIgs footer reports the 8 MB FPI fast RAM, not the aux-card default", () => {
  expect(getMemorySizeLabel("APPLE2GS", 64, false)).toBe("8 MB")
  // A slot-3 card cannot change it: a IIgs has no auxiliary slot card.
  expect(getMemorySizeLabel("APPLE2GS", 4096, true)).toBe("8 MB")
})

test("the footer label matches the emulated IIgs fast RAM", () => {
  expect(gsRAM.length).toBe(IIGS_MEMORY_KB * 1024)
})

test("classic machines keep their aux-card footer values", () => {
  expect(getMemorySizeLabel("APPLE2P", 4096, true)).toBe("64 KB")
  expect(getMemorySizeLabel("APPLE2EE", 64, false)).toBe("64 KB")
  expect(getMemorySizeLabel("APPLE2EE", 1024, true)).toBe("1088 KB")
  expect(getMemorySizeLabel("APPLE2EE", 4096, true)).toBe("4 MB")
})
