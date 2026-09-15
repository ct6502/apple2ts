import { RamWorksMemoryStart, RUN_MODE } from "../common/utility"
import { compareExternalSessionMemory, createExternalSessionSnapshot, doSetMachineName, doSetRunMode, getExternalMachineState } from "./motherboard"
import { getApple2State, setApple2State } from "./save_restore"
import { getAuxCardEnabled, memory, memSet, setAuxCardEnabled, setRamWorks } from "./memory"
import { s6502 } from "./instructions"
import { SWITCHES } from "./softswitches"
import { setIsTesting } from "./worker2main"

const snapshotId = "session-snapshot:comparison"
const request: SessionMemoryComparisonRequest = {snapshotId, address: 0x7F, length: 0x282, space: "main"}
let previous: Apple2SaveState
let previousRunMode: RUN_MODE
let previousAux: boolean

beforeEach(() => {
  setIsTesting()
  previous = getApple2State()
  previousRunMode = getExternalMachineState().runMode
  previousAux = getAuxCardEnabled()
  doSetRunMode(RUN_MODE.PAUSED, false)
})

afterEach(() => {
  setApple2State(previous, 2, false)
  setAuxCardEnabled(previousAux)
  doSetRunMode(previousRunMode, false)
})

test("compares sparse pages in address order with exact truncation and no state changes", () => {
  memory.fill(0xFF, 0, 0x400)
  memory[0xFF] = 0x12
  memory[0x300] = 0x34
  createExternalSessionSnapshot(snapshotId)
  const baselineCycleCount = s6502.cycleCount
  memory[0x7F] = 1
  memory[0xFF] = 2
  memory[0x100] = 3
  memory[0x300] = 4
  memory[0x301] = 5 // outside requested range
  s6502.cycleCount += 10
  SWITCHES.RAMRD.isSet = true
  const machine = getExternalMachineState()
  const state = getApple2State()
  const result = compareExternalSessionMemory({...request, maxChanges: 2})
  expect(result).toMatchObject({
    snapshotId, baselineCycleCount, currentCycleCount: baselineCycleCount + 10,
    totalChangeCount: 4, truncated: true,
    changes: [{address: 0x7F, before: 255, after: 1}, {address: 0xFF, before: 0x12, after: 2}],
    requestedSpace: "main", effectiveAuxBank: null, currentMapping: {RAMRD: true},
  })
  expect(result).not.toHaveProperty("bytes")
  expect(result).not.toHaveProperty("mapping")
  expect(compareExternalSessionMemory({...request, maxChanges: 4})).toMatchObject({totalChangeCount: 4, truncated: false})
  expect(getApple2State()).toEqual(state)
  expect(getExternalMachineState().execution).toEqual(machine.execution)
  expect(getExternalMachineState().runMode).toBe(machine.runMode)
  memory[0x7F] = 255
  memory[0xFF] = 0x12
  memory[0x100] = 255
  memory[0x300] = 0x34
  expect(compareExternalSessionMemory(request)).toMatchObject({changes: [], totalChangeCount: 0, truncated: false})
})

test("uses the same selected physical aux bank at both ends regardless of RAMRD", () => {
  setAuxCardEnabled(true)
  setRamWorks(128)
  memory.fill(255, RamWorksMemoryStart, RamWorksMemoryStart + 0x20000)
  memory[RamWorksMemoryStart + 0x10101] = 0x22
  createExternalSessionSnapshot(snapshotId)
  memory[RamWorksMemoryStart + 0x10101] = 0x44
  memory[RamWorksMemoryStart + 0x101] = 0x66
  memSet(0xC073, 1)
  SWITCHES.RAMRD.isSet = false
  const auxRequest = {...request, address: 0x100, length: 2, space: "aux" as const}
  expect(compareExternalSessionMemory(auxRequest)).toMatchObject({
    requestedAuxBank: null, effectiveAuxBank: 1,
    changes: [{address: 0x101, before: 0x22, after: 0x44}],
    effectiveSegments: [{address: 0x100, length: 2, space: "aux", auxBank: 1}],
  })
  expect(compareExternalSessionMemory({...auxRequest, auxBank: 0}).changes)
    .toEqual([{address: 0x101, before: 255, after: 0x66}])
})

test("full physical range decoding and default response cap stay bounded", () => {
  for (let address = 0; address < 0xC000; address++) memory[address] = (address * 17 + (address >>> 8)) & 255
  const baseline = memory.slice(0, 0xC000)
  createExternalSessionSnapshot(snapshotId)
  memory.fill(0, 0, 0xC000)
  const result = compareExternalSessionMemory({...request, address: 0, length: 0xC000})
  expect(result.totalChangeCount).toBe(baseline.filter((byte) => byte !== 0).length)
  expect(result.changes).toHaveLength(32)
  expect(result.truncated).toBe(true)
  const expected = Array.from(baseline, (byte, address) => ({address, before: byte, after: 0}))
    .filter((change) => change.before !== 0)
  expect(result.changes).toEqual(expected.slice(0, 32))
  const tail = compareExternalSessionMemory({...request, address: 0xBFE0, length: 32})
  expect(tail.changes).toEqual(expected.filter((change) => change.address >= 0xBFE0))
})

test("rejects missing, replaced, running, incompatible and invalid comparisons", () => {
  expect(() => compareExternalSessionMemory({...request, snapshotId: "missing"})).toThrow("not found")
  createExternalSessionSnapshot(snapshotId)
  for (const invalid of [
    {address: -1}, {address: 0xBFFF, length: 2}, {length: 0}, {length: 1.5},
    {space: "active" as const}, {auxBank: 0}, {maxChanges: 0}, {maxChanges: 65},
  ]) expect(() => compareExternalSessionMemory({...request, ...invalid})).toThrow()
  expect(compareExternalSessionMemory({...request, address: 0xBFFF, length: 1}).length).toBe(1)
  doSetRunMode(RUN_MODE.RUNNING, false)
  expect(() => compareExternalSessionMemory(request)).toThrow("paused")
  doSetRunMode(RUN_MODE.PAUSED, false)
  createExternalSessionSnapshot("replacement")
  expect(() => compareExternalSessionMemory(request)).toThrow("not found")
  createExternalSessionSnapshot(snapshotId)
  doSetMachineName(previous.machineName === "APPLE2EE" ? "APPLE2EU" : "APPLE2EE", false, false)
  expect(() => compareExternalSessionMemory(request)).toThrow("configuration has changed")
})

test("rejects auxiliary banks absent from either current configuration or baseline", () => {
  setAuxCardEnabled(false)
  createExternalSessionSnapshot(snapshotId)
  setAuxCardEnabled(true)
  const auxRequest = {...request, space: "aux" as const, auxBank: 0}
  expect(() => compareExternalSessionMemory(auxRequest)).toThrow("unavailable")
  setRamWorks(64)
  createExternalSessionSnapshot(snapshotId)
  setRamWorks(128)
  expect(() => compareExternalSessionMemory({...auxRequest, auxBank: 1})).toThrow("unavailable")
  setAuxCardEnabled(false)
  expect(() => compareExternalSessionMemory(auxRequest)).toThrow("not configured")
})
