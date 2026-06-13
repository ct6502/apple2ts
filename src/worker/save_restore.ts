import { Buffer } from "buffer"
import { MAX_SNAPSHOTS, RamWorksMemoryStart, ROMmemoryStart, RUN_MODE } from "../common/utility"
import { getDriveSaveState, restoreDriveSaveState } from "./devices/drivestate"
import { handleGameSetup } from "./games/game_mappings"
import { s6502, getStackDump, setState6502, setStackDump } from "./instructions"
import { memory, memoryReset, RamWorksMaxBank, setRamWorks, updateAddressTables } from "./memory"
import { configureMachine, doReset, doSetMachineName, doSetRunMode, getMachineName, getSoftSwitches, updateExternalMachineState } from "./motherboard"
import { SWITCHES } from "./softswitches"
import { passRequestThumbnail } from "./worker2main"

let iTempState = 0
const saveStates: Array<EmulatorSaveState> = []

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
    softSwitches: getSoftSwitches(),
    stackDump: getStackDump(),
    memvalid: memvalid.slice(0, maxGood + 1).join(""),
    memC000: Buffer.from(memC000).toString("base64"),
    memory: Buffer.from(memgood).toString("base64"),
  }
}

export const setApple2State = (newState: Apple2SaveState, version: number) => {
  const new6502: STATE6502 = JSON.parse(JSON.stringify(newState.s6502))
  memoryReset()
  // Machine name might not be in older save states, so use a default in that case.
  const machineName = newState.machineName || "APPLE2EE"
  doSetMachineName(machineName, false)
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

export const doRestoreSaveState = (sState: EmulatorSaveState, eraseSnapshots = false) => {
  doReset()
  // There was never a version 0.9 (it was before the version was saved),
  // but this gives us a number to key off of.
  const version = sState.emulator?.version ? sState.emulator.version : 0.9
  setApple2State(sState.state6502, version)
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
  updateExternalMachineState()
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
