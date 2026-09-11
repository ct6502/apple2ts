import { interruptRequest, nonMaskableInterrupt, processInstruction } from "./cpu6502"
import { doSetRom, getCurrentMachineName, memory, updateAddressTables } from "./memory"
import { reset6502, s6502, setCycleCount, setPC } from "./instructions"
import { createHash } from "crypto"
import fs from "fs"
import { IncomingMessage } from "http"
import https from "https"
import path from "path"
import { pipeline } from "stream/promises"
import { checkSoftSwitches, SWITCHES } from "./softswitches"

const fileChecksum = (filename: string) => createHash("sha256").update(fs.readFileSync(filename)).digest("hex")

const downloadFile = async (url: string, dest: string, expectedSize: number, expectedChecksum: string) => {
  const partial = `${dest}.${process.pid}.partial`
  try {
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      https.get(url, resolve).on("error", reject)
    })
    if (response.statusCode !== 200) {
      response.resume()
      throw new Error(`Failed to get '${url}' (${response.statusCode})`)
    }
    await pipeline(response, fs.createWriteStream(partial))
    if ((await fs.promises.stat(partial)).size !== expectedSize) {
      throw new Error(`Downloaded '${url}' has the wrong size`)
    }
    if (fileChecksum(partial) !== expectedChecksum) {
      throw new Error(`Downloaded '${url}' has the wrong checksum`)
    }
    await fs.promises.rm(dest, {force: true})
    await fs.promises.rename(partial, dest)
  } catch (error) {
    await fs.promises.rm(partial, {force: true})
    throw error
  }
}

const klausRevision = "6bae44e4062722b22fb1de26dd68bea55f80c8e0"
const klausChecksums = {
  "6502_functional_test.bin": "fa12bfc761e6f9057e4cc01a665a7b800ff01ae91f598af1e39a1201d01953fd",
  "65C02_extended_opcodes_test.bin": "10a2a07fa240666fa610c46accebe8d42b1000feef3aae619da15a8d152869b2",
  "6502_65c02_interrupt_test.bin": "f82cb23debf6ba411c77861dbc3d50afd010b198dd26a2f5fb6a610c6e2e0ebc",
  "6502_65c02_65816_decimal_test.bin": "de4c2819a201fa9aeae65fc13e76c093a816afe42aeee9030975a5607cb696b6",
} as const

type KlausTestName = keyof typeof klausChecksums

const getKlausBinary = async (testname: KlausTestName) => {
  const expectedChecksum = klausChecksums[testname]
  const url = `https://raw.githubusercontent.com/3amcinnamonroll/klaus-6502-test-binaries/${klausRevision}/bin/${testname}`
  const dest = path.join(__dirname, "roms", testname)
  const expectedSize = 0x10000

  if (!fs.existsSync(dest) || fs.statSync(dest).size !== expectedSize || fileChecksum(dest) !== expectedChecksum) {
    await downloadFile(url, dest, expectedSize, expectedChecksum)
  }

  return fs.readFileSync(dest)
}

// See https://github.com/ct6502/apple2ts/issues/43
// for the original version of this test.
const runKlaus6502Test = async (testname: KlausTestName) => {
  const start = 0x400
  reset6502()

  // The Klaus test binaries are GPL-licensed, so download rather than include them.
  const pcode = await getKlausBinary(testname)
  memory.set(pcode, 0x0)

  // Since our test image extends across all 64k of RAM,
  // set the softswitch for bank-switched RAM.
  checkSoftSwitches(0xC080, false, 0)

  // Make sure to do this in case we run the test just by itself.
  // Otherwise all of the address lookups will be zero.
  updateAddressTables()

  let memloc = 0x0
  let memexpect = 0x0
  let pcExpect = 0
  let iexpect = 0
  let cycleExpect = 0

  if (testname === "6502_functional_test.bin") {
    memloc = 0x200
    memexpect = 0xF0
    pcExpect = 0x3469
    iexpect = 30646177
    cycleExpect = 96561324
  } else if (testname === "65C02_extended_opcodes_test.bin") {
    memloc = 0x202
    memexpect = 0xF0
    pcExpect = 0x24f1
    iexpect = 21977668
    cycleExpect = 66871574

    // Skip tests for Rockwell custom instructions BBR, BBS
    memory[0x717] = 0x4c
    memory[0x718] = 0xff
    memory[0x719] = 0x0b

    // Skip tests for Rockwell custom instructions RMB, SMB
    memory[0x1e64] = 0x4c
    memory[0x1e65] = 0x31
    memory[0x1e66] = 0x22
  }

  setPC(start)
  setCycleCount(0)

  let i = 0
  while (true) {
    const pc_state = s6502.PC
    processInstruction()
    i++
    if (pc_state == s6502.PC) {
      // console.log(`${testname} PC: $${s6502.PC.toString(16)}  i: ${i}  cycles: ${s6502.cycleCount}`)
      expect(memory[memloc]).toEqual(memexpect)
      break
    }
  }

  // See https://github.com/ct6502/apple2ts/issues/134
  // for details on these values
  expect(s6502.PC).toEqual(pcExpect)
  expect(i).toEqual(iexpect)
  expect(s6502.cycleCount).toEqual(cycleExpect)
}

test("Klaus 6502", async () => {await runKlaus6502Test("6502_functional_test.bin")}, 20000)

test("Klaus 65C02 extended opcodes", async () => {await runKlaus6502Test("65C02_extended_opcodes_test.bin")}, 20000)

test.each([
  ["NMOS", "APPLE2EU", 0x0400, 0x073A],
  ["CMOS", "APPLE2EE", 0x0404, 0x0737],
] as const)("Klaus %s interrupts", async (_cpu, machine, entryPC, successPC) => {
  const pcode = await getKlausBinary("6502_65c02_interrupt_test.bin")
  const previousMachine = getCurrentMachineName()
  const previousMemory = memory.slice()
  const bankSwitches = ["BSR_PREWRITE", "BSR_WRITE", "BSRBANK2", "BSRREADRAM"] as const
  const previousBankSwitches = bankSwitches.map(name => SWITCHES[name].isSet)

  doSetRom(machine)
  try {
    reset6502()
    memory.set(pcode)
    checkSoftSwitches(0xC080, false, 0)
    updateAddressTables()

    const feedbackPort = 0xBFFC
    memory[feedbackPort] = 0
    setPC(entryPC)
    setCycleCount(0)

    let feedback = 0
    for (let i = 0; i < 10000; i++) {
      const previousPC = s6502.PC
      processInstruction()
      const nextFeedback = memory[feedbackPort]
      interruptRequest(0, (nextFeedback & 1) !== 0)
      if ((feedback & 2) === 0 && (nextFeedback & 2) !== 0) nonMaskableInterrupt()
      feedback = nextFeedback
      if (s6502.PC === previousPC) {
        expect(s6502.PC).toEqual(successPC)
        return
      }
    }
    throw new Error(`Klaus interrupt test did not terminate at $${s6502.PC.toString(16)}`)
  } finally {
    doSetRom(previousMachine)
    memory.set(previousMemory)
    bankSwitches.forEach((name, index) => {SWITCHES[name].isSet = previousBankSwitches[index]})
    reset6502()
    updateAddressTables()
  }
}, 20000)

test.each([
  ["NMOS all-byte", "APPLE2EU", 0x0200, 0x029E],
  ["NMOS valid BCD", "APPLE2EU", 0x0204, 0x02A1],
  ["CMOS all-byte", "APPLE2EE", 0x0208, 0x02A4],
  ["CMOS valid BCD", "APPLE2EE", 0x020C, 0x02A7],
] as const)("Klaus %s decimal mode", async (_mode, machine, entryPC, successPC) => {
  const pcode = await getKlausBinary("6502_65c02_65816_decimal_test.bin")
  const previousMachine = getCurrentMachineName()
  const previousMemory = memory.slice()
  const bankSwitches = ["BSR_PREWRITE", "BSR_WRITE", "BSRBANK2", "BSRREADRAM"] as const
  const previousBankSwitches = bankSwitches.map(name => SWITCHES[name].isSet)

  doSetRom(machine)
  try {
    reset6502()
    memory.set(pcode)
    checkSoftSwitches(0xC080, false, 0)
    updateAddressTables()
    setPC(entryPC)
    setCycleCount(0)

    for (let i = 0; i < 100_000_000; i++) {
      const previousPC = s6502.PC
      processInstruction()
      if (s6502.PC === previousPC) {
        expect(s6502.PC).toEqual(successPC)
        return
      }
    }
    throw new Error(`Klaus decimal test did not terminate at $${s6502.PC.toString(16)}`)
  } finally {
    doSetRom(previousMachine)
    memory.set(previousMemory)
    bankSwitches.forEach((name, index) => {SWITCHES[name].isSet = previousBankSwitches[index]})
    reset6502()
    updateAddressTables()
  }
}, 20000)
