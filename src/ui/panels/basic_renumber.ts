const replaceGoto = (line: string, statement: string, remap: Record<number, number>) => {
  const gotoMatch = line.match(new RegExp(`${statement}\\s*(\\d+)`, "i"))
  if (gotoMatch) {
    const targetLine = parseInt(gotoMatch[1])
    line = line.replace(new RegExp(`${statement}\\s*\\d+`, "i"),
      `${statement} ${remap[targetLine]}`)
  }
  return line
}

export const BasicRenumber = (program: string) => {
  const newProgram = program.split(/\r?\n/)
  const remap = []
  const oldLineToNewLine: Record<number, number> = {}
  let nextLineNumber = 10
  for (let i = 0; i < newProgram.length; i++) {
    const line = newProgram[i].trim()
    const lineNumberMatch = line.match(/^(\d+)(.*)?/)
    if (lineNumberMatch) {
      remap[i] = nextLineNumber
      oldLineToNewLine[parseInt(lineNumberMatch[1])] = nextLineNumber
      nextLineNumber += 10
    }
  }
  let nline = 0
  for (let i = 0; i < newProgram.length; i++) {
    const line = newProgram[i].trim()
    const lineNumberMatch = line.match(/^(\d+)(.*)?/)
    if (lineNumberMatch) {
      let restOfLine = (lineNumberMatch[2] || "").trim()
      restOfLine = replaceGoto(restOfLine, "GOTO", oldLineToNewLine)
      restOfLine = replaceGoto(restOfLine, "GOSUB", oldLineToNewLine)
      newProgram[nline] = `${remap[i]} ${restOfLine}`
      nline++
    }
  }
  return newProgram.slice(0, nline).join("\n")
}
