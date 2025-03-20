import { processInstruction } from "./cpu6502"
import { memory, updateAddressTables } from "./memory"
import { reset6502, s6502, setCycleCount, setPC } from "./instructions"
import fs from "fs"
import https from "https"
import path from "path"
import { checkSoftSwitches } from "./softswitches"

const downloadFile = (url: string, dest: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to get '${url}' (${response.statusCode})`))
      }
      response.pipe(file)
      file.on("finish", () => {
        file.close()
        resolve()
      })
    }).on("error", (err) => {
      fs.unlink(dest, () => reject(err))
    })
  })
}

// See https://github.com/ct6502/apple2ts/issues/43
// for the original version of this test.
const runKlaus6502Test = async (testname: string) => {
  const start = 0x400
  reset6502()

  // We automatically download the Klaus test image.
  // The 6502_65C02_functional_tests repo has a GPL license which is
  // incompatible with our license. So we do not want to include it in our repo.
  const url = "https://raw.githubusercontent.com/Klaus2m5/6502_65C02_functional_tests/refs/heads/master/bin_files/" + testname
  const dest = path.join(__dirname, "roms", testname)

  // Download the file if it doesn't exist
  if (!fs.existsSync(dest)) {
    await downloadFile(url, dest)
  }

  const pcode = fs.readFileSync(dest)
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

test("Klaus 6502", () => {runKlaus6502Test("6502_functional_test.bin")}, 20000)

test("Klaus 65C02 extended opcodes", () => {runKlaus6502Test("65C02_extended_opcodes_test.bin")}, 20000)

