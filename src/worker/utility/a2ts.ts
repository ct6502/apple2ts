import { parseAssembly } from "./assembler"
import * as fs from "fs"

const err = "Usage: a2ts [-v|--verbose] inputfile outputfile"
let reqargs = 4
let verbose = false

if (process.argv.length >= reqargs) {
  if (process.argv[2] === "-v" || process.argv[2] === "--verbose") {
    verbose = true
    reqargs++
  }
  if (process.argv.length >= reqargs) {
    const inputFile = process.argv[reqargs - 2]
    const outputFile = process.argv[reqargs - 1]
    const fileContent = fs.readFileSync(inputFile, "utf-8")
    const result = parseAssembly(0, fileContent.split("\n"), verbose)
    const uintArray = new Uint8Array(result)
    fs.writeFileSync(outputFile, uintArray)
    process.exit(0)
  }
}
console.error(err)
process.exit(1)
