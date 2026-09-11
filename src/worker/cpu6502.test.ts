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
// for the original version of the functional test.
const withKlausMachine = async (
  testname: KlausTestName, machine: Parameters<typeof doSetRom>[0],
  entryPC: number, run: () => void,
) => {
  const pcode = await getKlausBinary(testname)
  const previousMachine = getCurrentMachineName()
  const previousMemory = memory.slice()
  const bankSwitches = ["BSR_PREWRITE", "BSR_WRITE", "BSRBANK2", "BSRREADRAM"] as const
  const previousBankSwitches = bankSwitches.map(name => SWITCHES[name].isSet)
  try {
    doSetRom(machine)
    reset6502()
    memory.set(pcode)
    // The test images use RAM across the full 64 KiB address range.
    checkSoftSwitches(0xC080, false, 0)
    updateAddressTables()
    setPC(entryPC)
    setCycleCount(0)
    run()
  } finally {
    doSetRom(previousMachine)
    memory.set(previousMemory)
    bankSwitches.forEach((name, index) => {SWITCHES[name].isSet = previousBankSwitches[index]})
    reset6502()
    updateAddressTables()
  }
}

test.each([
  ["6502_functional_test.bin", "APPLE2EU", 0x200, 0x3469, 30646177, 96561324],
  ["65C02_extended_opcodes_test.bin", "APPLE2EE", 0x202, 0x24F1, 21977668, 66871574],
] as const)("Klaus %s", async (testname, machine, resultAddress, successPC, instructions, cycles) => {
  await withKlausMachine(testname, machine, 0x0400, () => {
    if (testname === "65C02_extended_opcodes_test.bin") {
      // Skip Rockwell BBR/BBS and RMB/SMB instructions.
      memory.set([0x4C, 0xFF, 0x0B], 0x0717)
      memory.set([0x4C, 0x31, 0x22], 0x1E64)
    }
    let count = 0
    do {
      const previousPC = s6502.PC
      processInstruction()
      count++
      if (s6502.PC === previousPC) break
    } while (count <= instructions)

    // See issue #134 for the expected instruction and cycle counts.
    expect(memory[resultAddress]).toEqual(0xF0)
    expect(s6502.PC).toEqual(successPC)
    expect(count).toEqual(instructions)
    expect(s6502.cycleCount).toEqual(cycles)
  })
}, 20000)

test.each([
  ["NMOS", "APPLE2EU", 0x0400, 0x073A],
  ["CMOS", "APPLE2EE", 0x0404, 0x0737],
] as const)("Klaus %s interrupts", async (_cpu, machine, entryPC, successPC) => {
  await withKlausMachine("6502_65c02_interrupt_test.bin", machine, entryPC, () => {
    const feedbackPort = 0xBFFC
    memory[feedbackPort] = 0
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
  })
}, 20000)

test.each([
  ["NMOS all-byte", "APPLE2EU", 0x0200, 0x029E],
  ["NMOS valid BCD", "APPLE2EU", 0x0204, 0x02A1],
  ["CMOS all-byte", "APPLE2EE", 0x0208, 0x02A4],
  ["CMOS valid BCD", "APPLE2EE", 0x020C, 0x02A7],
] as const)("Klaus %s decimal mode", async (_mode, machine, entryPC, successPC) => {
  await withKlausMachine("6502_65c02_65816_decimal_test.bin", machine, entryPC, () => {
    for (let i = 0; i < 100_000_000; i++) {
      const previousPC = s6502.PC
      processInstruction()
      if (s6502.PC === previousPC) {
        expect(s6502.PC).toEqual(successPC)
        return
      }
    }
    throw new Error(`Klaus decimal test did not terminate at $${s6502.PC.toString(16)}`)
  })
}, 20000)
