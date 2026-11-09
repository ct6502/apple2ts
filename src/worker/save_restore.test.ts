
import { readFileSync } from "node:fs"
import path, { resolve } from "node:path"
import { doGetSaveState, doGoBackInTime, doRestoreSaveState, doSnapshot, getApple2State } from "./save_restore"
import { setIsTesting } from "./worker2main"
import { doSetEmuDriveNewData, getDriveSaveState } from "./devices/drivestate"
import { getTextPage, iigsRegisters, megaIIAux, megaIIMain, memory } from "./memory"
import { doBoot, doSetMachineName, doSetRunMode, getCPU } from "./motherboard"
import type { CPU65816 } from "./cpu65816"
import { RUN_MODE, SAVE_STATE_VERSION } from "../common/utility"
import { processInstruction } from "./cpu6502"
import { sendTextToEmulator } from "./devices/keyboard"
import * as fs from "fs"
import { s6502 } from "./instructions"

const readSaveState = (name: string): EmulatorSaveState =>
  JSON.parse(readFileSync(resolve(__dirname, "saves", name), "utf8"))

// prevPC was added after these save files were written.
const withoutPrevPC = (state: STATE6502) => {
  const copy: Partial<STATE6502> = { ...state }
  delete copy.prevPC
  return copy
}

const saveStates = ["saveState_v0.9.a2ts", "saveState_v1.0.a2ts", "saveState_v2.0.a2ts"]

test.each(saveStates)("restore %s", (filename) => {
  setIsTesting()
  const sState = readSaveState(filename)
  const saved = sState.state6502
  doRestoreSaveState(sState, false, false)
  const restored = getApple2State()
  expect(withoutPrevPC(restored.s6502)).toEqual(withoutPrevPC(saved.s6502))
  // Versionless saves predate these fields, so they fall back to the defaults.
  expect(restored.extraRamSize).toBe(saved.extraRamSize ?? 64)
  expect(restored.machineName).toBe(saved.machineName ?? "APPLE2EE")
})

test("v0.9 memory round-trips exactly", () => {
  setIsTesting()
  const sState = readSaveState("saveState_v0.9.a2ts")
  doRestoreSaveState(sState, false, false)
  const savedMem = new Uint8Array(Buffer.from(sState.state6502.memory, "base64"))
  // We always saved all of the memory for v0.9 save states.
  expect(memory.slice(0, 65536)).toEqual(savedMem.slice(0, 65536))
})

test("v1.0 memory round-trips exactly", () => {
  setIsTesting()
  const sState = readSaveState("saveState_v1.0.a2ts")
  doRestoreSaveState(sState, false, false)
  const savedMem = new Uint8Array(Buffer.from(sState.state6502.memory, "base64"))
  // We always saved all of the memory for v1.0 save states.
  expect(memory.slice(0, 65536)).toEqual(savedMem.slice(0, 65536))
})

test("v2.0 disk state", () => {
  setIsTesting()
  const sState = readSaveState("saveState_v2.0.a2ts")
  doRestoreSaveState(sState, false, false)
  const driveStateExpect = sState.driveState
  const driveStateIs = getDriveSaveState(true)
  expect(driveStateIs.currentDrive).toEqual(driveStateExpect.currentDrive)
})

test("v2.0 memory round-trips exactly", () => {
  setIsTesting()
  const sState = readSaveState("saveState_v2.0.a2ts")
  doRestoreSaveState(sState, false, false)
  const restored = getApple2State()
  expect(restored.memvalid).toBe(sState.state6502.memvalid)
  expect(restored.memC000).toBe(sState.state6502.memC000)
  expect(restored.memory).toBe(sState.state6502.memory)
  const savedMem = new Uint8Array(Buffer.from(sState.state6502.memory, "base64"))
  // Only compare memory up to 0xB600, as the rest may not be valid in this save state.
  expect(memory.slice(0, 0xB600)).toEqual(savedMem.slice(0, 0xB600))
})

// Try running the emulator after restoring Aztec and make sure it produces
// the expected text output.
test.each(saveStates)("run Aztec %s", (filename) => {
  setIsTesting()
  const sState = readSaveState(filename)
  doRestoreSaveState(sState, false, false)
  doSetRunMode(RUN_MODE.RUNNING)
  // Send a space character to the emulator to go to the next screen.
  sendTextToEmulator(32)
  for (let i = 0; i < 1500000; i++) {
    processInstruction()
  }
  doSetRunMode(RUN_MODE.PAUSED)
  const text = getTextPage()
  // Convert Uint8Array to ASCII chars
  let asciiText = Array.from(text).map(byte => String.fromCharCode(byte & 0x7F)).join("")
  asciiText = asciiText.replaceAll(/\s+/g, " ").slice(0, 89) // Example slice, adjust as needed
  const want = " AZTEC A FEW WEEKS AGO A RUMOR SURFACED THAT PROFESSOR G. VON FORSTER , NOTED TOMB ROBBER"
  expect(asciiText).toBe(want)
})

test("65816 native registers survive save/restore", () => {
  setIsTesting()
  doSetMachineName("APPLE2GS", false, false)
  const cpu = getCPU() as CPU65816
  cpu.PC = 0x1234
  cpu.PB = 0x12
  cpu.DB = 0x34
  cpu.A = 0x5678
  cpu.P = 0xa0
  cpu.emulationMode = false
  cpu.enteredNativeMode = true
  iigsRegisters[0x29] = 0x80
  iigsRegisters[0x35] = 0x08
  const sState = doGetSaveState(false)
  expect(sState.state6502.cpu65816?.PC).toBe(0x1234)
  expect(sState.state6502.iigsRegisters).toBeTruthy()
  cpu.PC = 0
  cpu.PB = 0
  cpu.DB = 0
  cpu.A = 0
  iigsRegisters[0x29] = 0
  iigsRegisters[0x35] = 0
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  const restored = getCPU() as CPU65816
  expect(restored.PC).toBe(0x1234)
  expect(restored.PB).toBe(0x12)
  expect(restored.DB).toBe(0x34)
  expect(restored.A).toBe(0x5678)
  expect(iigsRegisters[0x29]).toBe(0x80)
  expect(iigsRegisters[0x35]).toBe(0x08)
  expect(restored.emulationMode).toBe(false)
  expect(restored.enteredNativeMode).toBe(true)
  // Leave the machine as the classic IIe for the following Aztec round trip.
  doSetMachineName("APPLE2EE", false, false)
})

test("Mega II main and aux survive save/restore", () => {
  setIsTesting()
  megaIIAux.fill(0)
  megaIIMain.fill(0)
  megaIIAux[0x2000] = 0xaa
  megaIIAux[0x7d00] = 0x80
  megaIIMain[0x0400] = 0x55
  const sState = doGetSaveState(false)
  expect(sState.state6502.megaIIAux).toBe(Buffer.from(megaIIAux).toString("base64"))
  expect(sState.state6502.megaIIMain).toBe(Buffer.from(megaIIMain).toString("base64"))
  // Mangle before restoring: an SHR screen must come back from Mega II, not
  // from the fast-RAM `memory` pages.
  megaIIAux[0x2000] = 0
  megaIIAux[0x7d00] = 0
  megaIIMain[0x0400] = 0
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  expect(megaIIAux[0x2000]).toBe(0xaa)
  expect(megaIIAux[0x7d00]).toBe(0x80)
  expect(megaIIMain[0x0400]).toBe(0x55)
})

test("Current save/restore round trip", () => {
  setIsTesting()
  const disk = "Aztec.woz"
  const filePath = path.resolve(__dirname, "../../public/disks/", disk)
  if (!fs.existsSync(filePath)) {
    expect("COULD NOT FIND FILE").toBe("")
    return
  }
  const data = fs.readFileSync(filePath)
  const props: DriveProps = {
    index: 2,
    hardDrive: false,
    drive: 1,
    filename: disk,
    status: "",
    motorRunning: false,
    diskHasChanges: false,
    isWriteProtected: false,
    diskData: new Uint8Array(data),
    lastAppleWriteTime: 0,
    cloudData: null,
    writableFileHandle: null,
    lastLocalFileWriteTime: 0,
  }
  doSetEmuDriveNewData(props)
  doBoot()
  doSetRunMode(RUN_MODE.RUNNING)
  while (s6502.cycleCount < 45000000) {
    processInstruction()
  }
  const sState = doGetSaveState(true)
  // Completely mangle the state by rebooting before restoring
  doBoot()
  doSetRunMode(RUN_MODE.PAUSED)
  doRestoreSaveState(sState, false, false, SAVE_STATE_VERSION)
  doSetRunMode(RUN_MODE.RUNNING)
  // Send a space character to the emulator to start the game.
  sendTextToEmulator(32)
  while (s6502.cycleCount < 48000000) {
    processInstruction()
  }
  doSetRunMode(RUN_MODE.PAUSED)
  const text = getTextPage()
  // Convert Uint8Array to ASCII chars
  let asciiText = Array.from(text).map(byte => String.fromCharCode(byte & 0x7F)).join("")
  asciiText = asciiText.replaceAll(/\s+/g, " ").slice(0, 89) // Example slice, adjust as needed
  const want = " AZTEC A FEW WEEKS AGO A RUMOR SURFACED THAT PROFESSOR G. VON FORSTER , NOTED TOMB ROBBER"
  expect(asciiText).toBe(want)
})

// Time travel snapshots have no version, so going back in time must still
// read their memory in the version 2 layout.
test("going back in time restores the memory", () => {
  jest.useFakeTimers()
  setIsTesting()
  try {
    const disk = "Olympic Decathlon.woz"
    const data = fs.readFileSync(path.resolve(__dirname, "../../public/disks/", disk))
    doSetEmuDriveNewData({
      index: 2, hardDrive: false, drive: 1, filename: disk, status: "",
      motorRunning: false, diskHasChanges: false, isWriteProtected: false,
      diskData: new Uint8Array(data), lastAppleWriteTime: 0, cloudData: null,
      writableFileHandle: null, lastLocalFileWriteTime: 0,
    })
    doBoot()
    doSetRunMode(RUN_MODE.RUNNING)
    while (s6502.cycleCount < 9500000) {
      processInstruction()
    }
    doSnapshot()
    const saved = Uint8Array.from(memory.subarray(0, 0xC000))
    while (s6502.cycleCount < 10000000) {
      processInstruction()
    }
    doGoBackInTime()
    // doGoBackInTime() restores the snapshot on a 50 ms timer.
    jest.advanceTimersByTime(100)
    expect(memory.subarray(0, 0xC000).findIndex((byte, i) => byte !== saved[i])).toBe(-1)
  } finally {
    doSetRunMode(RUN_MODE.PAUSED)
    jest.clearAllTimers()
    jest.useRealTimers()
  }
})
