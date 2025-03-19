import { processInstruction } from "./cpu6502"
import { memory, updateAddressTables } from "./memory"
import { reset6502, s6502, setCycleCount, setPC } from "./instructions"
import fs from "fs"
import https from "https"
import path from "path"

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
const runKlaus6502Test = async () => {
  const start = 0x400
  reset6502()

  // We automatically download the Klaus test image.
  // The 6502_65C02_functional_tests repo has a GPL license which is
  // incompatible with our license. So we do not want to include it in our repo.
  const url = "https://raw.githubusercontent.com/Klaus2m5/6502_65C02_functional_tests/refs/heads/master/bin_files/6502_functional_test.bin"
  const dest = path.join(__dirname, "roms", "6502_functional_test.bin")

  // Download the file if it doesn't exist
  if (!fs.existsSync(dest)) {
    await downloadFile(url, dest)
  }

  const pcode = fs.readFileSync(dest)
  memory.set(pcode, 0x0)
  // Make sure to do this in case we run the test just by itself.
  // Otherwise all of the address lookups will be zero.
  updateAddressTables()

  // Skip brk interrupt test
  memory[0x9c5] = 0x4c
  memory[0x9c6] = 0x11
  memory[0x9c7] = 0x0a

  setPC(start)
  setCycleCount(0)

  let i = 0
  while (true) {
    const pc_state = s6502.PC
    processInstruction()
    i++
    if (pc_state == s6502.PC) {
      expect(memory[0x200]).toEqual(0xF0)
      break
    }
  }

  // See https://github.com/ct6502/apple2ts/issues/134
  // for details on these values
  expect(s6502.PC).toEqual(0x3469)
  expect(i).toEqual(30646057)
  expect(s6502.cycleCount).toEqual(96561022)
}

test("Klaus 6502 testsuite", runKlaus6502Test, 20000)
