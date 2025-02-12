import { handleGetDisassembly } from "../main2worker"

const nlines = 40

export const getLineOfDisassembly = (line: number) => {
  const disArray = handleGetDisassembly().split('\n')
  if (disArray.length <= 1) {
    return -1
  }
  const firstLine = parseInt(disArray[0].slice(0, disArray[0].indexOf(':')), 16)
  if (line < firstLine) return -1
  const last = disArray[disArray.length - 2]
  const lastLine = parseInt(last.slice(0, last.indexOf(': ')), 16)
  if (line > lastLine) return -1
  const iend = Math.min(disArray.length - 1, nlines - 1)
  for (let i = 0; i <= iend; i++) {
    const addr = parseInt(disArray[i].slice(0, disArray[i].indexOf(':')), 16)
    if (addr === line) return i
  }
  return -1
}
