import { Buffer } from "buffer"
import { MAX_SNAPSHOTS, RamWorksMemoryStart, ROMmemoryStart, RUN_MODE } from "../common/utility"
import { getDriveSaveState, restoreDriveSaveState } from "./devices/drivestate"
import { handleGameSetup } from "./games/game_mappings"
import { s6502, getStackDump, setState6502, setStackDump } from "./instructions"
import { getAuxCardEnabled, memory, memoryReset, RamWorksMaxBank, setRamWorks, updateAddressTables } from "./memory"
import { configureMachine, doReset, doSetMachineName, doSetRunMode, getMachineName, getSlotConfig, getSoftSwitches, updateExternalMachineState } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { vidhd } from "./devices/vidhd"
import { passRequestThumbnail } from "./worker2main"
import { getSlotCardSaveState, restoreSlotCardSaveState } from "./devices/slot_card_state"
import { getMemoryView } from "./memory_view"

let iTempState = 0
const saveStates: Array<EmulatorSaveState> = []
let sessionSnapshot: {id: string, state: EmulatorSaveState, auxCardEnabled: boolean, auxCard: SLOT_CARD_ID} | null = null

export const getTempStateIndex = () => iTempState

export const getApple2State = (): Apple2SaveState => {
  // Make a copy
  const save6502 = JSON.parse(JSON.stringify(s6502))

  // Only save memory pages that have non-$FF data.
  // Check for both main memory and RamWorks memory.
  // Don't bother saving ROM memory or peripheral card memory since
  // that can be reconstructed from the machine type.
  let counterValid = 0
  const memvalid = new Array<number>(256 + 256 * (RamWorksMaxBank + 1)).fill(0)
  for (let page = 0; page < 256; page++) {
    const start = page * 256
    if (memory.subarray(start, start + 256).some(byte => byte !== 0xFF)) {
      memvalid[page] = 1
      counterValid++
    }
  }
  for (let page = 0; page < 256 * (RamWorksMaxBank + 1); page++) {
    const start = RamWorksMemoryStart + page * 256
    if (memory.subarray(start, start + 256).some(byte => byte !== 0xFF)) {
      memvalid[256 + page] = 1
      counterValid++
    }
  }
  const memgood = new Uint8Array(counterValid * 256)
  counterValid = 0
  let maxGood = 0
  memvalid.forEach((isValid, index) => {
    if (isValid) {
      const offset = (index < 256) ? 0 : (RamWorksMemoryStart - 0x10000)
      const start = offset + index * 256
      const memslicekeep = memory.subarray(start, start + 256)
      memgood.set(memslicekeep, 256 * counterValid)
      counterValid++
      maxGood = index
    }
  })

  const memC000 = memory.subarray(ROMmemoryStart, ROMmemoryStart + 256)

  return {
    s6502: save6502,
    extraRamSize: 64 * (RamWorksMaxBank + 1),
    machineName: getMachineName(),
    cardStates: getSlotCardSaveState(),
    softSwitches: getSoftSwitches(),
    stackDump: getStackDump(),
    memvalid: memvalid.slice(0, maxGood + 1).join(""),
    memC000: Buffer.from(memC000).toString("base64"),
    memory: Buffer.from(memgood).toString("base64"),
  }
}

export const setApple2State = (
  newState: Apple2SaveState,
  version: number,
  publishState = true,
) => {
  const new6502: STATE6502 = JSON.parse(JSON.stringify(newState.s6502))
  memoryReset()
  // Machine name might not be in older save states, so use a default in that case.
  const machineName = newState.machineName || "APPLE2EE"
  doSetMachineName(machineName, false, publishState)
  configureMachine()
  setState6502(new6502)
  const softSwitches: { [name: string]: boolean } = newState.softSwitches
  for (const key in softSwitches) {
    const keyTyped = key as keyof typeof SWITCHES
    // Our switches have changed slightly over time, so ignore errors.
    // We will fix up any changed softswitches below.
    try {
      SWITCHES[keyTyped].isSet = softSwitches[key]
    } catch {
      // do nothing
    }
  }
  if (vidhd.enabled && SWITCHES.NEWVIDEO) {
    vidhd.writeSoftSwitch(SWITCHES.NEWVIDEO.isSet ? 0x80 : 0)
  }
  // If we have an old save file, we need to set the BSR_WRITE switch
  // based upon the old bank-switched RAM switches.
  if ("WRITEBSR1" in softSwitches) {
    // We didn't have prewrite before, so just make sure it's off.
    SWITCHES.BSR_PREWRITE.isSet = false
    SWITCHES.BSR_WRITE.isSet = softSwitches.WRITEBSR1 || softSwitches.WRITEBSR2 ||
      softSwitches.RDWRBSR1 || softSwitches.RDWRBSR2
  }
  const newmemory = Buffer.from(newState.memory, "base64")
  if (version < 1) {
    // Main memory
    memory.set(newmemory.slice(0, 0x10000))
    // ROM and peripheral card memory moved from 0x20000 down to 0x10000
    memory.set(newmemory.slice(0x20000, 0x27F00), 0x10000)
    // AUX memory moved from 0x10000 up to RamWorksMemoryStart
    memory.set(newmemory.slice(0x10000, 0x20000), RamWorksMemoryStart)
    // See if we have additional RamWorks memory
    const ramWorks = (newmemory.length - 0x27F00) / 1024
    if (ramWorks > 0) {
      // If there's more data, it's the new RamWorks memory.
      setRamWorks(ramWorks + 64)  // the 64 is existing AUX memory
      memory.set(newmemory.slice(0x27F00), RamWorksMemoryStart + 0x10000)
    }
  } else if (version < 2) {
    // Adjust our current RamWorks memory to match the restored state.
    setRamWorks(newState.extraRamSize)
    // Note that our restored memory might be much smaller in size if
    // the RamWorks is mostly filled with 0xFF's.
    memory.set(newmemory)
  } else {
    let counterValid = 0
    const memvalidArray = typeof newState.memvalid === "string" 
      ? newState.memvalid.split("").map(c => c === "1" ? 1 : 0)
      : newState.memvalid
    memvalidArray.forEach((isValid, index) => {
      if (isValid) {
        const memslicekeep = newmemory.subarray(counterValid * 256, counterValid * 256 + 256)
        if (index < 256) {
          memory.set(memslicekeep, index * 256)
        } else {
          memory.set(memslicekeep, RamWorksMemoryStart + (index - 256) * 256)
        }
        counterValid++
      }
    })
    memory.set(Buffer.from(newState.memC000, "base64"), ROMmemoryStart)
  }
  // This was added to Apple2SaveState later
  if (newState.stackDump) {
    setStackDump(newState.stackDump)
  }
  restoreSlotCardSaveState(newState.cardStates)
  updateAddressTables()
  // Force the help text to be reset if necessary.
  handleGameSetup(true)
}

export const doGetSaveState = (full: boolean): EmulatorSaveState => {
  const state = {
    emulator: null,  // filled in by UI thread
    state6502: getApple2State(),
    driveState: getDriveSaveState(full),
    thumbnail: "",
    snapshots: null
  }
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doGetSaveStateWithSnapshots = (): EmulatorSaveState => {
  const state = doGetSaveState(true)
  state.snapshots = saveStates
  return state
//  return Buffer.from(compress(JSON.stringify(state)), 'ucs2').toString('base64')
}

export const doRestoreSaveState = (
  sState: EmulatorSaveState,
  eraseSnapshots = false,
  publishState = true,
  version = sState.emulator?.version || 0.9,
) => {
  doReset()
  // Versionless save files predate version 1 and use the legacy memory layout.
  setApple2State(sState.state6502, version, publishState)
  restoreDriveSaveState(sState.driveState)
  if (eraseSnapshots) {
    saveStates.length = 0
    iTempState = 0
  }
  if (sState.snapshots) {
    saveStates.length = 0
    saveStates.push(...sState.snapshots)
    iTempState = saveStates.length
  }
  if (publishState) updateExternalMachineState()
}

export const createSessionSnapshot = (snapshotId: string): SessionSnapshotReceipt => {
  if (!snapshotId) throw new Error("Invalid session snapshot id")
  const snapshot = doGetSaveState(false)
  sessionSnapshot = {id: snapshotId, state: snapshot, auxCardEnabled: getAuxCardEnabled(), auxCard: getSlotConfig()[3]}
  return {snapshotId, cycleCount: snapshot.state6502.s6502.cycleCount}
}

export const restoreSessionSnapshot = (snapshotId: string): SessionSnapshotReceipt => {
  if (!sessionSnapshot || sessionSnapshot.id !== snapshotId) {
    throw new Error("Session snapshot not found")
  }
  const snapshot = sessionSnapshot.state
  // Worker-local snapshots use v2 memory without the UI's version metadata.
  doRestoreSaveState(snapshot, false, false, 2)
  return {snapshotId, cycleCount: snapshot.state6502.s6502.cycleCount}
}

export const compareSessionMemory = (request: SessionMemoryComparisonRequest): SessionMemoryComparison => {
  if (!sessionSnapshot || sessionSnapshot.id !== request.snapshotId) {
    throw new Error("Session snapshot not found")
  }
  if (request.space !== "main" && request.space !== "aux") {
    throw new Error("Session memory comparison requires physical main or auxiliary RAM")
  }
  const maxChanges = request.maxChanges ?? 32
  if (!Number.isInteger(maxChanges) || maxChanges < 1 || maxChanges > 64) {
    throw new Error("Maximum changes must be between 1 and 64")
  }
  const baseline = sessionSnapshot.state.state6502
  if (baseline.machineName !== getMachineName()) {
    throw new Error("Session snapshot machine configuration has changed")
  }
  const {bytes, mapping, ...view} = getMemoryView(request)
  const bank = view.effectiveAuxBank
  if (request.space === "aux" && (!sessionSnapshot.auxCardEnabled
    || sessionSnapshot.auxCard !== getSlotConfig()[3]
    || bank === null || bank >= baseline.extraRamSize / 64)) {
    throw new Error("Auxiliary bank is unavailable in the session snapshot")
  }
  // Private snapshots use v2 sparse pages. Missing pages represent $FF.
  // Decode only requested pages; never restore or perform CPU reads.
  const valid = baseline.memvalid
  const firstPage = (bank === null ? 0 : 256 + bank * 256) + (request.address >>> 8)
  const lastPage = firstPage + (((request.address & 255) + request.length - 1) >>> 8)
  const before = new Uint8Array(request.length).fill(0xFF)
  let packedPage = 0
  for (let page = 0; page <= lastPage; page++) {
    if (valid[page] !== "1") continue
    if (page >= firstPage) {
      // Base64 boundaries must be multiples of three bytes.
      const packedStart = packedPage * 256
      const alignedStart = Math.floor(packedStart / 3) * 3
      const encoded = baseline.memory.slice(alignedStart / 3 * 4, Math.ceil((packedStart + 256) / 3) * 4)
      const decoded = Buffer.from(encoded, "base64").subarray(packedStart - alignedStart, packedStart - alignedStart + 256)
      const rangeOffset = (page - firstPage) * 256 - (request.address & 255)
      const start = Math.max(0, -rangeOffset)
      const end = Math.min(256, request.length - rangeOffset)
      before.set(decoded.subarray(start, end), rangeOffset + start)
    }
    packedPage++
  }
  const changes: SessionMemoryComparison["changes"] = []
  let totalChangeCount = 0
  for (let index = 0; index < bytes.length; index++) {
    if (before[index] === bytes[index]) continue
    totalChangeCount++
    if (changes.length < maxChanges) {
      changes.push({address: request.address + index, before: before[index], after: bytes[index]})
    }
  }
  return {
    ...view,
    snapshotId: request.snapshotId,
    baselineCycleCount: baseline.s6502.cycleCount,
    currentCycleCount: s6502.cycleCount,
    currentMapping: mapping,
    changes,
    totalChangeCount,
    truncated: totalChangeCount > changes.length,
  }
}

export const getGoBackwardIndex = () => {
  const newTmp = iTempState - 1
  if (newTmp < 0 || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

export const getGoForwardIndex = () => {
  const newTmp = iTempState + 1
  if (newTmp >= saveStates.length || !saveStates[newTmp]) {
    return -1
  }
  return newTmp
}

export const doSnapshot = () => {
  if (saveStates.length === MAX_SNAPSHOTS) {
    saveStates.shift()
  }
  saveStates.push(doGetSaveState(false))
  // This is at the current "time" and is just past our recently-saved state.
  iTempState = saveStates.length
  passRequestThumbnail(saveStates[saveStates.length - 1].state6502.s6502.PC)
}

export const doGoBackInTime = () => {
  let newTmp = getGoBackwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    // if this is the first time we're called, make sure our current
    // state is up to date
    if (iTempState === saveStates.length) {
      doSnapshot()
      newTmp = Math.max(iTempState - 2, 0)
    }
    iTempState = newTmp
    doRestoreSaveState(saveStates[iTempState])
  }, 50)
}

export const doGoForwardInTime = () => {
  const newTmp = getGoForwardIndex()
  if (newTmp < 0) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = newTmp
    doRestoreSaveState(saveStates[newTmp])
  }, 50)
}

export const doGotoTimeTravelIndex = (index: number) => {
  if (index < 0 || index >= saveStates.length) return
  doSetRunMode(RUN_MODE.PAUSED)
  setTimeout(() => {
    iTempState = index
    doRestoreSaveState(saveStates[index])
  }, 50)
}

// If we go back in time and then resume running, remove all future states.
export const fixSaveStates = () => {
  while (saveStates.length > 0 && iTempState < (saveStates.length - 1)) saveStates.pop()
  iTempState = saveStates.length
}

export const getTimeTravelThumbnails = () => {
  const result: Array<TimeTravelThumbnail> = []
  for (let i = 0; i < saveStates.length; i++) {
    result[i] = {s6502: saveStates[i].state6502.s6502, thumbnail: saveStates[i].thumbnail}
  }
  return result
}

export const doSetThumbnailImage = (thumbnail: string) => {
  if (saveStates.length > 0) {
    saveStates[saveStates.length - 1].thumbnail = thumbnail
  }
}
